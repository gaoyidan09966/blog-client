<template>
    <div class="page-container">
        <!-- Hero -->
        <div class="page-header">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-orb orb-3"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">
                    <el-icon>
                        <CreditCard />
                    </el-icon>
                    CHECKOUT
                </div>
                <h1 class="hero-title">确认订单</h1>
                <p class="hero-subtitle">请填写收货信息并确认订单</p>
            </div>
        </div>

        <!-- 订单内容 -->
        <div class="checkout-main" v-if="checkoutItems.length > 0">
            <!-- 收货信息 -->
            <div class="section-card">
                <div class="section-header">
                    <el-icon :size="18" color="#667eea">
                        <Location />
                    </el-icon>
                    <span class="section-title">收货信息</span>
                </div>
                <div class="form-area">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">收货人 <span class="required">*</span></label>
                            <el-input v-model="form.receiver_name" placeholder="请输入收货人姓名" maxlength="20" clearable />
                        </div>
                        <div class="form-group">
                            <label class="form-label">联系电话 <span class="required">*</span></label>
                            <el-input v-model="form.receiver_phone" placeholder="请输入手机号" maxlength="11" clearable />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">收货地址 <span class="required">*</span></label>
                        <el-input v-model="form.receiver_address" placeholder="请输入详细地址" maxlength="200" clearable />
                    </div>
                    <div class="form-group">
                        <label class="form-label">备注</label>
                        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填，有什么要备注的？"
                            maxlength="200" show-word-limit />
                    </div>
                </div>
            </div>

            <!-- 商品清单 -->
            <div class="section-card">
                <div class="section-header">
                    <el-icon :size="18" color="#667eea">
                        <ShoppingBag />
                    </el-icon>
                    <span class="section-title">商品清单</span>
                    <span class="section-count">共 {{ totalQuantity }} 件</span>
                </div>
                <div class="goods-list">
                    <div v-for="item in checkoutItems" :key="item.id" class="goods-item">
                        <div class="goods-cover">
                            <img v-if="item.cover" :src="item.cover" class="goods-img"
                                @error="(e) => e.target.style.display = 'none'" />
                            <div class="goods-placeholder" v-else>
                                <el-icon :size="20">
                                    <ShoppingBag />
                                </el-icon>
                            </div>
                        </div>
                        <div class="goods-info">
                            <span class="goods-name">{{ item.name }}</span>
                            <span class="goods-spec">¥{{ formatPrice(item.price) }} x {{ item.quantity }}</span>
                        </div>
                        <div class="goods-price">¥{{ formatPrice(item.price * item.quantity) }}</div>
                    </div>
                </div>
            </div>

            <!-- 支付方式 -->
            <div class="section-card">
                <div class="section-header">
                    <el-icon :size="18" color="#667eea">
                        <Wallet />
                    </el-icon>
                    <span class="section-title">支付方式</span>
                </div>
                <div class="pay-methods">
                    <div class="pay-method active">
                        <el-icon :size="20" color="#667eea">
                            <Coin />
                        </el-icon>
                        <span class="pay-name">模拟支付（测试）</span>
                        <el-icon :size="16" color="#667eea" class="pay-check">
                            <CircleCheckFilled />
                        </el-icon>
                    </div>
                </div>
            </div>

            <!-- 价格明细 -->
            <div class="section-card">
                <div class="section-header">
                    <el-icon :size="18" color="#667eea">
                        <Document />
                    </el-icon>
                    <span class="section-title">价格明细</span>
                </div>
                <div class="price-detail">
                    <div class="price-row">
                        <span class="price-label">商品总额</span>
                        <span class="price-value">¥{{ formatPrice(totalAmount) }}</span>
                    </div>
                    <div class="price-row">
                        <span class="price-label">运费</span>
                        <span class="price-value free">免运费</span>
                    </div>
                    <div class="price-divider"></div>
                    <div class="price-row total">
                        <span class="price-label">应付金额</span>
                        <span class="price-amount">
                            <span class="amount-symbol">¥</span>
                            <span class="amount-value">{{ formatPrice(totalAmount) }}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div class="checkout-empty" v-else>
            <el-icon :size="80" color="#ddd">
                <ShoppingCart />
            </el-icon>
            <p class="empty-text">没有待结算的商品</p>
            <button class="btn-go-shop" @click="router.push('/products')">
                <el-icon>
                    <ShoppingBag />
                </el-icon> 去选购
            </button>
        </div>

        <!-- 提交栏 -->
        <div class="checkout-footer" v-if="checkoutItems.length > 0">
            <div class="footer-info">
                <span class="footer-count">共 {{ totalQuantity }} 件</span>
                <div class="footer-price">
                    <span class="footer-label">应付：</span>
                    <span class="footer-amount">¥{{ formatPrice(totalAmount) }}</span>
                </div>
            </div>
            <button class="btn-submit" :disabled="submitting" @click="handleSubmit">
                <el-icon v-if="!submitting">
                    <Check />
                </el-icon>
                <el-icon v-else class="is-loading">
                    <Loading />
                </el-icon>
                {{ submitting ? '提交中...' : '提交订单' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { formatPrice } from '../../utils/format';
import { createOrder } from '../../api/order';
import {
    CreditCard, Location, ShoppingBag, Document,
    Wallet, Coin, CircleCheckFilled, Check, Loading, ShoppingCart
} from '@element-plus/icons-vue';

const router = useRouter();
const checkoutItems = ref([]);
const submitting = ref(false);

const form = ref({
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    remark: ''
});

const totalQuantity = computed(() =>
    checkoutItems.value.reduce((sum, item) => sum + item.quantity, 0)
);

const totalAmount = computed(() =>
    checkoutItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

const handleSubmit = async () => {
    if (!form.value.receiver_name.trim()) { ElMessage.warning('请填写收货人'); return; }
    if (!form.value.receiver_phone.trim()) { ElMessage.warning('请填写联系电话'); return; }
    if (!/^1[3-9]\d{9}$/.test(form.value.receiver_phone)) { ElMessage.warning('请输入正确的手机号'); return; }
    if (!form.value.receiver_address.trim()) { ElMessage.warning('请填写收货地址'); return; }

    submitting.value = true;
    try {
        const items = checkoutItems.value.map(item => ({
            product_id: item.id,
            quantity: item.quantity
        }));

        await createOrder({
            items,
            receiver_name: form.value.receiver_name,
            receiver_phone: form.value.receiver_phone,
            receiver_address: form.value.receiver_address,
            remark: form.value.remark
        });

        ElMessage.success('订单创建成功！');

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const checkoutIds = checkoutItems.value.map(i => i.id);
        const newCart = cart.filter(i => !checkoutIds.includes(i.id));
        localStorage.setItem('cart', JSON.stringify(newCart));

        sessionStorage.removeItem('checkout_items');
        router.push('/orders');
    } catch (error) {
        console.error('提交订单失败:', error);
    } finally {
        submitting.value = false;
    }
};

onMounted(() => {
    const saved = sessionStorage.getItem('checkout_items');
    if (saved) {
        try {
            checkoutItems.value = JSON.parse(saved);
        } catch (e) {
            checkoutItems.value = [];
        }
    }
    if (checkoutItems.value.length === 0) {
        ElMessage.warning('没有待结算的商品');
        router.push('/cart');
    }
});
</script>

<style scoped>
.page-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px 16px 160px;
}

@media (min-width: 768px) {
    .page-container {
        padding: 30px 20px 120px;
    }
}

/* ==================== HERO ==================== */
.page-header {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 40%, #fdf2f8 100%);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
    .page-header {
        border-radius: 28px;
        margin-bottom: 32px;
    }
}

.hero-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
}

.hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.4;
}

.orb-1 {
    width: 140px;
    height: 140px;
    background: #667eea;
    top: -40px;
    left: -20px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 120px;
    height: 120px;
    background: #F472B6;
    bottom: -30px;
    right: -20px;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

.orb-3 {
    width: 80px;
    height: 80px;
    background: #764ba2;
    top: 20%;
    right: 15%;
    animation: orbDrift 9s ease-in-out infinite 2s;
}

@media (min-width: 768px) {
    .orb-1 {
        width: 220px;
        height: 220px;
        top: -60px;
        left: -40px;
        filter: blur(70px);
        opacity: 0.5;
    }

    .orb-2 {
        width: 180px;
        height: 180px;
        bottom: -50px;
        right: -30px;
    }

    .orb-3 {
        width: 140px;
        height: 140px;
    }
}

@keyframes orbDrift {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    33% {
        transform: translate(20px, -15px) scale(1.05);
    }

    66% {
        transform: translate(-15px, 10px) scale(0.95);
    }
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 36px 20px;
}

@media (min-width: 768px) {
    .hero-content {
        padding: 50px 20px;
    }
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    border-radius: 20px;
    letter-spacing: 3px;
    margin-bottom: 14px;
}

.hero-title {
    font-size: 30px;
    font-weight: 900;
    margin: 0 0 10px;
    background: linear-gradient(135deg, #1a1a2e 0%, #667eea 50%, #F472B6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (min-width: 768px) {
    .hero-title {
        font-size: 44px;
    }
}

.hero-subtitle {
    color: #8888aa;
    font-size: 13px;
    margin: 0;
    line-height: 1.5;
}

@media (min-width: 768px) {
    .hero-subtitle {
        font-size: 15px;
    }
}

/* ==================== 区块卡片 ==================== */
.section-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

@media (min-width: 768px) {
    .section-card {
        padding: 24px;
        border-radius: 20px;
    }
}

.section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f5f5f5;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
}

.section-count {
    margin-left: auto;
    font-size: 13px;
    color: #999;
}

/* ==================== 表单 ==================== */
.form-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

@media (max-width: 640px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: #555;
}

.required {
    color: #FF6B6B;
}

.form-area :deep(.el-input__wrapper),
.form-area :deep(.el-textarea__inner) {
    border-radius: 10px;
    background: #fafafa;
    box-shadow: none;
    border: 1px solid #f0f0f0;
    transition: all 0.3s;
}

.form-area :deep(.el-input__wrapper:hover),
.form-area :deep(.el-textarea__inner:hover) {
    border-color: #ddd;
}

.form-area :deep(.el-input__wrapper:focus-within),
.form-area :deep(.el-textarea__inner:focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: #fff;
}

/* ==================== 商品清单 ==================== */
.goods-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.goods-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #fafafa;
    border-radius: 12px;
    transition: background 0.2s;
}

.goods-item:hover {
    background: #f5f5f5;
}

.goods-cover {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f0f0f0;
}

@media (min-width: 768px) {
    .goods-cover {
        width: 64px;
        height: 64px;
    }
}

.goods-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.goods-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ddd;
}

.goods-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.goods-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.goods-spec {
    font-size: 12px;
    color: #999;
}

.goods-price {
    font-size: 15px;
    font-weight: 800;
    color: #FF6B6B;
    flex-shrink: 0;
}

@media (min-width: 768px) {
    .goods-price {
        font-size: 16px;
    }
}

/* ==================== 支付方式 ==================== */
.pay-methods {
    display: flex;
    gap: 12px;
}

.pay-method {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border: 2px solid #667eea;
    border-radius: 12px;
    background: #f8f9ff;
    flex: 1;
}

.pay-name {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
}

.pay-check {
    margin-left: auto;
}

/* ==================== 价格明细 ==================== */
.price-detail {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
}

.price-label {
    color: #888;
}

.price-value {
    font-weight: 600;
    color: #333;
}

.price-value.free {
    color: #38a169;
    font-weight: 600;
}

.price-divider {
    height: 1px;
    background: #f0f0f0;
    margin: 4px 0;
}

.price-row.total {
    padding-top: 4px;
}

.price-row.total .price-label {
    font-weight: 700;
    color: #333;
}

.price-amount {
    display: flex;
    align-items: flex-start;
}

.amount-symbol {
    font-size: 16px;
    font-weight: 800;
    color: #FF6B6B;
    margin-top: 4px;
}

.amount-value {
    font-size: 28px;
    font-weight: 900;
    color: #FF6B6B;
    line-height: 1;
}

@media (min-width: 768px) {
    .amount-value {
        font-size: 32px;
    }
}

/* ==================== 提交栏 ==================== */
.checkout-footer {
    position: fixed;
    bottom: 56px;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid #f0f0f0;
    padding: 12px 16px;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
    .checkout-footer {
        position: sticky;
        bottom: 0;
        max-width: 800px;
        margin: 20px auto 0;
        border-radius: 16px;
        padding: 16px 24px;
        border: 1px solid rgba(0, 0, 0, 0.04);
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
    }
}

.footer-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.footer-count {
    font-size: 12px;
    color: #999;
}

.footer-price {
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.footer-label {
    font-size: 14px;
    color: #666;
}

.footer-amount {
    font-size: 22px;
    font-weight: 900;
    color: #FF6B6B;
    line-height: 1;
}

@media (min-width: 768px) {
    .footer-amount {
        font-size: 26px;
    }
}

.btn-submit {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .btn-submit {
        padding: 14px 40px;
        font-size: 16px;
    }
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ==================== 空状态 ==================== */
.checkout-empty {
    text-align: center;
    padding: 80px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.empty-text {
    font-size: 18px;
    color: #999;
    margin: 0;
}

.btn-go-shop {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 36px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-go-shop:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}
</style>