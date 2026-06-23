<template>
    <div class="checkout-page">
        <div class="checkout-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">CHECKOUT</div>
                <h1 class="hero-title">📦 确认订单</h1>
                <p class="hero-desc">请填写收货信息并确认订单</p>
            </div>
        </div>

        <div class="checkout-main">
            <!-- 收货信息 -->
            <div class="section-card">
                <h3 class="section-title">📍 收货信息</h3>
                <div class="form-grid">
                    <div class="form-item">
                        <label>收货人</label>
                        <input v-model="form.receiver_name" placeholder="请输入收货人姓名" />
                    </div>
                    <div class="form-item">
                        <label>联系电话</label>
                        <input v-model="form.receiver_phone" placeholder="请输入手机号" />
                    </div>
                    <div class="form-item full">
                        <label>收货地址</label>
                        <input v-model="form.receiver_address" placeholder="请输入详细地址" />
                    </div>
                    <div class="form-item full">
                        <label>备注</label>
                        <input v-model="form.remark" placeholder="选填，有什么要备注的？" />
                    </div>
                </div>
            </div>

            <!-- 商品清单 -->
            <div class="section-card">
                <h3 class="section-title">🛍️ 商品清单</h3>
                <div class="order-items">
                    <div v-for="item in checkoutItems" :key="item.id" class="order-item">
                        <div class="oi-cover">
                            <img v-if="item.cover" :src="item.cover" class="oi-img" />
                            <div class="oi-placeholder" v-else>🛍️</div>
                        </div>
                        <div class="oi-info">
                            <span class="oi-name">{{ item.name }}</span>
                            <span class="oi-price">¥{{ item.price }} x {{ item.quantity }}</span>
                        </div>
                        <div class="oi-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
                    </div>
                </div>
            </div>

            <!-- 支付方式 -->
            <div class="section-card">
                <h3 class="section-title">💳 支付方式</h3>
                <div class="pay-methods">
                    <div class="pay-method active">
                        <span class="pay-icon">💰</span>
                        <span class="pay-name">模拟支付（测试）</span>
                    </div>
                </div>
            </div>

            <!-- 结算栏 -->
            <div class="checkout-footer">
                <div class="footer-left">
                    <span>共 <strong>{{ totalQuantity }}</strong> 件商品</span>
                </div>
                <div class="footer-right">
                    <span class="total-label">应付金额：</span>
                    <span class="total-price">¥{{ totalAmount }}</span>
                    <button class="btn-submit" @click="handleSubmit" :disabled="submitting">
                        {{ submitting ? '提交中...' : '提交订单' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { createOrder } from '../../api/order';

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
    checkoutItems.value
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2)
);

const handleSubmit = async () => {
    if (!form.value.receiver_name.trim()) {
        ElMessage.warning('请填写收货人');
        return;
    }
    if (!form.value.receiver_phone.trim()) {
        ElMessage.warning('请填写联系电话');
        return;
    }
    if (!form.value.receiver_address.trim()) {
        ElMessage.warning('请填写收货地址');
        return;
    }

    submitting.value = true;
    try {
        const items = checkoutItems.value.map((item) => ({
            product_id: item.id,
            quantity: item.quantity
        }));

        const res = await createOrder({
            items,
            receiver_name: form.value.receiver_name,
            receiver_phone: form.value.receiver_phone,
            receiver_address: form.value.receiver_address,
            remark: form.value.remark
        });

        ElMessage.success('订单创建成功！');

        // 从购物车移除已结算的商品
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const checkoutIds = checkoutItems.value.map((i) => i.id);
        const newCart = cart.filter((i) => !checkoutIds.includes(i.id));
        localStorage.setItem('cart', JSON.stringify(newCart));

        // 清除结算暂存
        sessionStorage.removeItem('checkout_items');

        // 跳转到订单列表或支付页
        router.push(`/orders`);
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
.checkout-page {
    background: #f5f6f8;
    min-height: 100vh;
}

/* Hero */
.checkout-hero {
    position: relative;
    padding: 50px 20px;
    text-align: center;
    overflow: hidden;
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
}

.hero-bg {
    position: absolute;
    inset: 0;
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
}

.hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.5;
}

.orb-1 {
    width: 180px;
    height: 180px;
    background: #667eea;
    top: -40px;
    left: 15%;
}

.orb-2 {
    width: 140px;
    height: 140px;
    background: #f472b6;
    bottom: -30px;
    right: 15%;
}

.hero-content {
    position: relative;
    z-index: 2;
}

.hero-badge {
    display: inline-block;
    padding: 4px 18px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    border-radius: 20px;
    letter-spacing: 3px;
    margin-bottom: 16px;
}

.hero-title {
    font-size: 34px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 8px;
}

.hero-desc {
    font-size: 15px;
    color: #999;
    margin: 0;
}

/* 主内容 */
.checkout-main {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
    padding-bottom: 120px;
}

.section-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.section-title {
    font-size: 16px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 20px;
}

/* 表单 */
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-item.full {
    grid-column: 1 / -1;
}

.form-item label {
    font-size: 13px;
    font-weight: 600;
    color: #666;
}

.form-item input {
    padding: 12px 16px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s;
}

.form-item input:focus {
    border-color: #667eea;
}

/* 商品清单 */
.order-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px;
    background: #fafafa;
    border-radius: 10px;
}

.oi-cover {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f0f0f0;
}

.oi-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.oi-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.oi-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.oi-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.oi-price {
    font-size: 13px;
    color: #999;
}

.oi-subtotal {
    font-size: 16px;
    font-weight: 800;
    color: #ff6b6b;
}

/* 支付方式 */
.pay-methods {
    display: flex;
    gap: 12px;
}

.pay-method {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 24px;
    border: 2px solid #667eea;
    border-radius: 12px;
    background: #f8f9ff;
    cursor: pointer;
}

.pay-icon {
    font-size: 24px;
}

.pay-name {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
}

/* 结算栏 */
.checkout-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.footer-left {
    font-size: 14px;
    color: #666;
}

.footer-left strong {
    color: #1a1a2e;
}

.footer-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.total-label {
    font-size: 14px;
    color: #666;
}

.total-price {
    font-size: 28px;
    font-weight: 900;
    color: #ff6b6b;
}

.btn-submit {
    padding: 14px 48px;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .checkout-footer {
        flex-direction: column;
        gap: 12px;
    }
}
</style>