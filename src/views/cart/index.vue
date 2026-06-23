<template>
    <div class="cart-page">
        <!-- Hero（全宽） -->
        <div class="cart-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">
                    <el-icon>
                        <ShoppingCart />
                    </el-icon>
                    CART
                </div>
                <h1 class="hero-title">购物车</h1>
                <p class="hero-desc" v-if="cartItems.length > 0">
                    已选 <strong>{{ selectedCount }}</strong> 件商品
                </p>
                <p class="hero-desc" v-else>购物车是空的，去逛逛吧</p>
            </div>
        </div>

        <!-- 购物车内容 -->
        <div class="cart-main" v-if="cartItems.length > 0">
            <!-- 操作栏 -->
            <div class="cart-toolbar">
                <label class="check-all">
                    <input type="checkbox" v-model="isAllChecked" @change="toggleAll" />
                    <span>全选 ({{ cartItems.length }})</span>
                </label>
                <div class="toolbar-actions">
                    <button class="toolbar-btn" @click="clearChecked">
                        <el-icon>
                            <Delete />
                        </el-icon> 删除选中
                    </button>
                    <button class="toolbar-btn" @click="clearAll">
                        <el-icon>
                            <Delete />
                        </el-icon> 清空
                    </button>
                </div>
            </div>

            <!-- 桌面端表头 -->
            <div class="cart-table-header">
                <span class="th-check"></span>
                <span class="th-info">商品信息</span>
                <span class="th-price">单价</span>
                <span class="th-qty">数量</span>
                <span class="th-subtotal">小计</span>
                <span class="th-action">操作</span>
            </div>

            <!-- 商品列表 -->
            <div class="cart-items">
                <div v-for="(item, index) in cartItems" :key="item.id" class="cart-item"
                    :class="{ 'item-checked': item.checked }">
                    <!-- 复选框 -->
                    <label class="item-check">
                        <input type="checkbox" v-model="item.checked" @change="saveCart" />
                    </label>

                    <!-- 商品信息 -->
                    <div class="item-info" @click="router.push(`/products/${item.id}`)">
                        <div class="item-cover">
                            <img v-if="item.cover" :src="item.cover" class="item-img"
                                @error="(e) => e.target.style.display = 'none'" />
                            <div class="item-placeholder" v-else>
                                <el-icon :size="24">
                                    <ShoppingBag />
                                </el-icon>
                            </div>
                        </div>
                        <div class="item-detail">
                            <span class="item-name">{{ item.name }}</span>
                            <span class="item-price-mobile">¥{{ formatPrice(item.price) }}</span>
                        </div>
                    </div>

                    <!-- 桌面端单价 -->
                    <div class="item-price">¥{{ formatPrice(item.price) }}</div>

                    <!-- 数量 -->
                    <div class="item-qty">
                        <div class="qty-control">
                            <button class="qty-btn" @click="changeQty(index, -1)" :disabled="item.quantity <= 1">
                                <el-icon>
                                    <Minus />
                                </el-icon>
                            </button>
                            <span class="qty-num">{{ item.quantity }}</span>
                            <button class="qty-btn" @click="changeQty(index, 1)">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                            </button>
                        </div>
                    </div>

                    <!-- 小计 -->
                    <div class="item-subtotal">¥{{ formatPrice(item.price * item.quantity) }}</div>

                    <!-- 删除 -->
                    <button class="item-delete" @click="removeItem(index)">
                        <el-icon>
                            <Delete />
                        </el-icon>
                    </button>
                </div>
            </div>

            <!-- 结算栏 -->
            <div class="cart-footer">
                <div class="footer-left">
                    <label class="check-all">
                        <input type="checkbox" v-model="isAllChecked" @change="toggleAll" />
                        <span>全选</span>
                    </label>
                </div>
                <div class="footer-right">
                    <div class="total-info">
                        <span class="total-count">已选 <strong>{{ selectedCount }}</strong> 件</span>
                        <span class="total-label">合计：</span>
                        <span class="total-price">¥{{ formatPrice(selectedTotal) }}</span>
                    </div>
                    <button class="btn-checkout" :disabled="selectedCount === 0" @click="handleCheckout">
                        去结算
                    </button>
                </div>
            </div>
        </div>

        <!-- 空购物车 -->
        <div class="cart-empty" v-else>
            <el-icon :size="80" color="#ddd">
                <ShoppingCart />
            </el-icon>
            <p class="empty-text">购物车是空的</p>
            <button class="btn-go-shop" @click="router.push('/products')">
                <el-icon>
                    <ShoppingBag />
                </el-icon> 去逛逛
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatPrice } from '../../utils/format';
import { ShoppingCart, ShoppingBag, Minus, Plus, Delete } from '@element-plus/icons-vue';

const router = useRouter();
const cartItems = ref([]);

const selectedCount = computed(() =>
    cartItems.value.filter(i => i.checked).reduce((sum, i) => sum + i.quantity, 0)
);

const selectedTotal = computed(() =>
    cartItems.value.filter(i => i.checked).reduce((sum, i) => sum + i.price * i.quantity, 0)
);

const isAllChecked = computed({
    get: () => cartItems.value.length > 0 && cartItems.value.every(i => i.checked),
    set: () => { }
});

const toggleAll = () => {
    const checked = !isAllChecked.value;
    cartItems.value.forEach(i => i.checked = checked);
    saveCart();
};

const changeQty = (index, delta) => {
    const item = cartItems.value[index];
    const newQty = item.quantity + delta;
    if (newQty >= 1 && newQty <= 99) {
        item.quantity = newQty;
        saveCart();
    }
};

const removeItem = (index) => {
    ElMessageBox.confirm('确定要删除这件商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        cartItems.value.splice(index, 1);
        saveCart();
        ElMessage.success('已删除');
    }).catch(() => { });
};

const clearChecked = () => {
    const checked = cartItems.value.filter(i => i.checked);
    if (checked.length === 0) { ElMessage.warning('请先选择要删除的商品'); return; }
    ElMessageBox.confirm(`确定要删除选中的 ${checked.length} 件商品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        cartItems.value = cartItems.value.filter(i => !i.checked);
        saveCart();
        ElMessage.success('已删除选中商品');
    }).catch(() => { });
};

const clearAll = () => {
    ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        cartItems.value = [];
        saveCart();
        ElMessage.success('购物车已清空');
    }).catch(() => { });
};

const saveCart = () => {
    localStorage.setItem('cart', JSON.stringify(cartItems.value));
};

const handleCheckout = () => {
    const selected = cartItems.value.filter(i => i.checked);
    if (selected.length === 0) { ElMessage.warning('请先选择商品'); return; }
    sessionStorage.setItem('checkout_items', JSON.stringify(selected));
    router.push('/checkout');
};

onMounted(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
        try {
            cartItems.value = JSON.parse(saved).map(item => ({
                ...item,
                checked: item.checked !== undefined ? item.checked : true
            }));
        } catch (e) {
            cartItems.value = [];
        }
    }
});
</script>

<style scoped>
.cart-page {
    background: #f5f6f8;
    min-height: 100vh;
}

/* ==================== Hero（全宽） ==================== */
.cart-hero {
    position: relative;
    padding: 50px 20px;
    text-align: center;
    overflow: hidden;
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
}

@media (min-width: 768px) {
    .cart-hero {
        padding: 60px 20px;
    }
}

.hero-bg {
    position: absolute;
    inset: 0;
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
    filter: blur(70px);
    opacity: 0.5;
}

.orb-1 {
    width: 160px;
    height: 160px;
    background: #667eea;
    top: -40px;
    left: 15%;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 130px;
    height: 130px;
    background: #F472B6;
    bottom: -30px;
    right: 15%;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

@media (min-width: 768px) {
    .orb-1 {
        width: 200px;
        height: 200px;
        top: -50px;
    }

    .orb-2 {
        width: 160px;
        height: 160px;
        bottom: -40px;
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
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    font-size: 28px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 8px;
}

@media (min-width: 768px) {
    .hero-title {
        font-size: 34px;
    }
}

.hero-desc {
    font-size: 14px;
    color: #999;
    margin: 0;
}

@media (min-width: 768px) {
    .hero-desc {
        font-size: 15px;
    }
}

.hero-desc strong {
    color: #667eea;
    font-weight: 800;
}

/* ==================== 主内容 ==================== */
.cart-main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px 16px 180px;
    /* 底部 padding 加大到 180px */
}

@media (min-width: 768px) {
    .cart-main {
        padding: 24px 24px 40px;
    }
}

/* ==================== 工具栏 ==================== */
.cart-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    margin-bottom: 12px;
}

.check-all {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: #666;
}

.check-all input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #667eea;
    cursor: pointer;
}

.toolbar-actions {
    display: flex;
    gap: 16px;
}

.toolbar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 13px;
    transition: color 0.2s;
    padding: 0;
}

.toolbar-btn:hover {
    color: #FF6B6B;
}

/* ==================== 桌面端表头 ==================== */
.cart-table-header {
    display: none;
}

@media (min-width: 768px) {
    .cart-table-header {
        display: grid;
        grid-template-columns: 40px 1fr 100px 130px 100px 60px;
        align-items: center;
        padding: 12px 20px;
        background: #fafafa;
        border-radius: 14px 14px 0 0;
        font-size: 12px;
        font-weight: 700;
        color: #999;
        border: 1px solid rgba(0, 0, 0, 0.04);
        border-bottom: 1px solid #f0f0f0;
    }
}

/* ==================== 商品列表 ==================== */
.cart-items {
    display: flex;
    flex-direction: column;
}

/* 手机端：卡片式 */
.cart-item {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.04);
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 10px;
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 10px;
    transition: all 0.2s;
    position: relative;
}

@media (min-width: 768px) {
    .cart-item {
        border-radius: 0;
        margin-bottom: 0;
        padding: 18px 20px;
        grid-template-columns: 40px 1fr 100px 130px 100px 60px;
        align-items: center;
        border-top: none;
    }

    .cart-item:last-child {
        border-radius: 0 0 14px 14px;
    }
}

.cart-item.item-checked {
    background: #fafbff;
}

.cart-item:hover {
    background: #fafbff;
}

/* 复选框 */
.item-check {
    display: flex;
    align-items: flex-start;
    padding-top: 22px;
}

@media (min-width: 768px) {
    .item-check {
        align-items: center;
        padding-top: 0;
    }
}

.item-check input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #667eea;
    cursor: pointer;
}

/* 商品信息 */
.item-info {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

@media (min-width: 768px) {
    .item-info {
        gap: 14px;
    }
}

.item-cover {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f5f5f5;
}

@media (min-width: 768px) {
    .item-cover {
        width: 72px;
        height: 72px;
    }
}

.item-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ddd;
}

.item-detail {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

@media (min-width: 768px) {
    .item-detail {
        gap: 0;
    }
}

.item-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 手机端单价 */
.item-price-mobile {
    font-size: 15px;
    font-weight: 800;
    color: #FF6B6B;
}

@media (min-width: 768px) {
    .item-price-mobile {
        display: none;
    }
}

/* 桌面端单价 */
.item-price {
    display: none;
}

@media (min-width: 768px) {
    .item-price {
        display: block;
        font-size: 15px;
        font-weight: 700;
        color: #FF6B6B;
    }
}

/* 数量 */
.item-qty {
    grid-column: 1 / -1;
    display: flex;
    padding-left: 38px;
}

@media (min-width: 768px) {
    .item-qty {
        grid-column: auto;
        padding-left: 0;
    }
}

.qty-control {
    display: flex;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.qty-btn {
    width: 30px;
    height: 30px;
    border: none;
    background: #fafafa;
    cursor: pointer;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
    background: #f0f0f0;
}

.qty-btn:disabled {
    color: #ddd;
    cursor: not-allowed;
}

.qty-num {
    width: 44px;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
    line-height: 30px;
}

/* 小计 */
.item-subtotal {
    display: none;
}

@media (min-width: 768px) {
    .item-subtotal {
        display: block;
        font-size: 16px;
        font-weight: 900;
        color: #FF6B6B;
    }
}

/* 删除 */
.item-delete {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    transition: color 0.2s;
    padding: 4px;
}

@media (min-width: 768px) {
    .item-delete {
        position: static;
    }
}

.item-delete:hover {
    color: #FF6B6B;
}

/* ==================== 结算栏 ==================== */
.cart-footer {
    position: fixed;
    bottom: 56px;
    /* 底部导航的高度 */
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
    .cart-footer {
        position: sticky;
        bottom: 0;
        max-width: 1100px;
        margin: 16px auto 0;
        border-radius: 14px;
        padding: 16px 24px;
        border: 1px solid rgba(0, 0, 0, 0.04);
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
    }
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.footer-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

@media (min-width: 768px) {
    .footer-right {
        gap: 24px;
    }
}

.total-info {
    text-align: right;
    font-size: 13px;
    color: #666;
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

@media (min-width: 768px) {
    .total-info {
        font-size: 14px;
        gap: 12px;
    }
}

.total-count strong {
    color: #667eea;
    font-weight: 800;
}

.total-label {
    color: #999;
}

.total-price {
    font-size: 20px;
    font-weight: 900;
    color: #FF6B6B;
    line-height: 1;
}

@media (min-width: 768px) {
    .total-price {
        font-size: 26px;
    }
}

.btn-checkout {
    padding: 10px 28px;
    background: linear-gradient(135deg, #FF6B6B, #ee5a24);
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .btn-checkout {
        padding: 12px 40px;
        font-size: 16px;
    }
}

.btn-checkout:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.btn-checkout:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ==================== 空购物车 ==================== */
.cart-empty {
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