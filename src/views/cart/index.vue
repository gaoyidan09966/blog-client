<template>
    <div class="cart-page">
        <div class="cart-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">CART</div>
                <h1 class="hero-title">🛒 购物车</h1>
                <p class="hero-desc">已选 {{ selectedCount }} 件商品</p>
            </div>
        </div>

        <div class="cart-main" v-if="cartItems.length > 0">
            <div class="cart-inner">
                <div class="cart-content">
                    <!-- 全选 -->
                    <div class="cart-header-bar">
                        <label class="check-all">
                            <input type="checkbox" v-model="isAllChecked" @change="toggleAll" />
                            <span>全选</span>
                        </label>
                        <span class="header-info">商品信息</span>
                        <span class="header-price">单价</span>
                        <span class="header-qty">数量</span>
                        <span class="header-total">小计</span>
                        <span class="header-action">操作</span>
                    </div>

                    <!-- 商品列表 -->
                    <div v-for="(item, index) in cartItems" :key="item.id" class="cart-item"
                        :class="{ 'item-checked': item.checked }">
                        <label class="item-check">
                            <input type="checkbox" v-model="item.checked" @change="saveCart" />
                        </label>
                        <div class="item-info" @click="router.push(`/products/${item.id}`)">
                            <div class="item-cover">
                                <img v-if="item.cover" :src="item.cover" class="item-img"
                                    @error="(e) => e.target.style.display = 'none'" />
                                <div class="item-placeholder" v-else>🛍️</div>
                            </div>
                            <span class="item-name">{{ item.name }}</span>
                        </div>
                        <div class="item-price">¥{{ formatPrice(item.price) }}</div>
                        <div class="item-qty">
                            <div class="qty-control">
                                <button class="qty-btn" @click="changeQty(index, -1)"
                                    :disabled="item.quantity <= 1">−</button>
                                <span class="qty-num">{{ item.quantity }}</span>
                                <button class="qty-btn" @click="changeQty(index, 1)">+</button>
                            </div>
                        </div>
                        <div class="item-subtotal">¥{{ formatPrice(item.price * item.quantity) }}</div>
                        <button class="item-delete" @click="removeItem(index)">删除</button>
                    </div>
                </div>

                <!-- 结算栏 -->
                <div class="cart-footer">
                    <div class="footer-left">
                        <label class="check-all">
                            <input type="checkbox" v-model="isAllChecked" @change="toggleAll" />
                            <span>全选</span>
                        </label>
                        <button class="btn-clear" @click="clearChecked">删除选中</button>
                        <button class="btn-clear" @click="clearAll">清空购物车</button>
                    </div>
                    <div class="footer-right">
                        <div class="total-info">
                            <span>已选 <strong>{{ selectedCount }}</strong> 件商品</span>
                            <span class="total-price-label">合计：</span>
                            <span class="total-price">¥{{ formatPrice(selectedTotal) }}</span>
                        </div>
                        <button class="btn-checkout" :disabled="selectedCount === 0" @click="handleCheckout">
                            去结算
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空购物车 -->
        <div class="cart-empty" v-else>
            <div class="empty-icon">🛒</div>
            <p class="empty-text">购物车是空的</p>
            <button class="btn-go-shop" @click="router.push('/products')">去逛逛</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const cartItems = ref([]);

const formatPrice = (price) => {
    const num = Number(price);
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

// 已选数量
const selectedCount = computed(() => cartItems.value.filter(i => i.checked).reduce((sum, i) => sum + i.quantity, 0));

// 已选总价
const selectedTotal = computed(() => cartItems.value.filter(i => i.checked).reduce((sum, i) => sum + i.price * i.quantity, 0));

// 全选状态
const isAllChecked = computed({
    get: () => cartItems.value.length > 0 && cartItems.value.every(i => i.checked),
    set: () => { }
});

const toggleAll = () => {
    const checked = isAllChecked.value ? false : true;
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
    if (checked.length === 0) {
        ElMessage.warning('请先选择要删除的商品');
        return;
    }
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
    if (selected.length === 0) {
        ElMessage.warning('请先选择商品');
        return;
    }
    // 把选中的商品存到 sessionStorage，结算页读取
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

/* Hero */
.cart-hero {
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
    background-image: linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
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
    background: #F472B6;
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
.cart-main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 24px;
}

.cart-content {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.04);
}

/* 表头 */
.cart-header-bar {
    display: grid;
    grid-template-columns: 50px 1fr 120px 130px 120px 80px;
    align-items: center;
    padding: 14px 20px;
    background: #fafafa;
    font-size: 13px;
    font-weight: 700;
    color: #999;
    border-bottom: 1px solid #f0f0f0;
}

/* 商品行 */
.cart-item {
    display: grid;
    grid-template-columns: 50px 1fr 120px 130px 120px 80px;
    align-items: center;
    padding: 18px 20px;
    border-bottom: 1px solid #f8f8f8;
    transition: background 0.2s;
}

.cart-item:last-child {
    border-bottom: none;
}

.cart-item:hover {
    background: #fafbff;
}

.check-all {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: #666;
}

.check-all input[type="checkbox"],
.item-check input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #667eea;
    cursor: pointer;
}

.item-check {
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-info {
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
}

.item-cover {
    width: 72px;
    height: 72px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f5f5f5;
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
    font-size: 28px;
}

.item-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 300px;
}

.item-price {
    font-size: 15px;
    font-weight: 700;
    color: #FF6B6B;
}

.qty-control {
    display: flex;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    width: fit-content;
}

.qty-btn {
    width: 30px;
    height: 30px;
    border: none;
    background: #fafafa;
    cursor: pointer;
    font-size: 16px;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
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

.item-subtotal {
    font-size: 16px;
    font-weight: 900;
    color: #FF6B6B;
}

.item-delete {
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    font-size: 13px;
    transition: color 0.2s;
}

.item-delete:hover {
    color: #FF6B6B;
}

/* 结算栏 */
.cart-footer {
    position: sticky;
    bottom: 0;
    background: #fff;
    border-top: 1px solid #f0f0f0;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 0 0 16px 16px;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.03);
    margin-top: 16px;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.btn-clear {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 13px;
    transition: color 0.2s;
}

.btn-clear:hover {
    color: #FF6B6B;
}

.footer-right {
    display: flex;
    align-items: center;
    gap: 24px;
}

.total-info {
    text-align: right;
    font-size: 14px;
    color: #666;
}

.total-info strong {
    color: #1a1a2e;
}

.total-price-label {
    margin-left: 16px;
}

.total-price {
    font-size: 26px;
    font-weight: 900;
    color: #FF6B6B;
}

.btn-checkout {
    padding: 12px 40px;
    background: linear-gradient(135deg, #FF6B6B, #ee5a24);
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-checkout:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

.btn-checkout:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 空购物车 */
.cart-empty {
    text-align: center;
    padding: 100px 20px;
}

.empty-icon {
    font-size: 80px;
    margin-bottom: 20px;
    opacity: 0.4;
}

.empty-text {
    font-size: 18px;
    color: #999;
    margin: 0 0 24px;
}

.btn-go-shop {
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

/* 响应式 */
@media (max-width: 768px) {
    .cart-header-bar {
        display: none;
    }

    .cart-item {
        grid-template-columns: 40px 1fr;
        gap: 8px;
        padding: 16px;
    }

    .item-price,
    .item-qty,
    .item-subtotal,
    .item-delete {
        grid-column: 2;
    }
}
</style>