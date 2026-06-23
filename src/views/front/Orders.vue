<template>
    <div class="orders-page">
        <div class="orders-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">ORDERS</div>
                <h1 class="hero-title">📋 我的订单</h1>
                <p class="hero-desc">查看所有订单状态</p>
            </div>
        </div>

        <div class="orders-main">
            <!-- 状态筛选 -->
            <div class="status-tabs">
                <div v-for="tab in statusTabs" :key="tab.value" class="status-tab"
                    :class="{ active: activeStatus === tab.value }" @click="activeStatus = tab.value">
                    {{ tab.label }}
                </div>
            </div>

            <!-- 订单列表 -->
            <div v-if="filteredOrders.length > 0">
                <div v-for="order in filteredOrders" :key="order.id" class="order-card">
                    <div class="order-header">
                        <div class="order-info">
                            <span class="order-no">订单号：{{ order.order_no }}</span>
                            <span class="order-time">{{ formatTime(order.create_time) }}</span>
                        </div>
                        <span class="order-status" :class="'status-' + order.status">
                            {{ statusText(order.status) }}
                        </span>
                    </div>

                    <div class="order-items">
                        <div v-for="item in order.items" :key="item.id" class="order-item">
                            <div class="oi-cover">
                                <img v-if="item.product_cover" :src="item.product_cover" class="oi-img" />
                                <div class="oi-placeholder" v-else>🛍️</div>
                            </div>
                            <div class="oi-info">
                                <span class="oi-name">{{ item.product_name }}</span>
                                <span class="oi-price">¥{{ item.price }} x {{ item.quantity }}</span>
                            </div>
                            <div class="oi-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
                        </div>
                    </div>

                    <div class="order-footer">
                        <div class="order-address">
                            <span v-if="order.receiver_name">📍 {{ order.receiver_name }} {{ order.receiver_phone }} ·
                                {{ order.receiver_address }}</span>
                        </div>
                        <div class="order-total">
                            <span>共 {{order.items.reduce((s, i) => s + i.quantity, 0)}} 件</span>
                            <span class="total-label">合计：</span>
                            <span class="total-price">¥{{ Number(order.total_amount).toFixed(2) }}</span>
                        </div>
                        <div class="order-actions">
                            <button v-if="order.status === 0" class="btn-action btn-pay" @click="handlePay(order)">
                                立即支付（模拟）
                            </button>
                            <button v-if="order.status === 0" class="btn-action btn-cancel"
                                @click="handleCancel(order)">
                                取消订单
                            </button>
                            <button v-if="order.status !== 1" class="btn-action btn-delete"
                                @click="handleDelete(order)">
                                删除订单
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="orders-empty">
                <div class="empty-icon">📋</div>
                <p class="empty-text">{{ activeStatus === -1 ? '暂无订单' : '该状态下暂无订单' }}</p>
                <button class="btn-go-shop" @click="router.push('/products')">去逛逛</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getMyOrders, payOrder, cancelOrder, deleteOrder } from '../../api/order';

const router = useRouter();
const orders = ref([]);
const activeStatus = ref(-1);

const statusTabs = [
    { label: '全部', value: -1 },
    { label: '待付款', value: 0 },
    { label: '已付款', value: 1 },
    { label: '已发货', value: 2 },
    { label: '已完成', value: 3 },
    { label: '已取消', value: 4 }
];

const statusText = (status) => {
    const map = { 0: '待付款', 1: '已付款', 2: '已发货', 3: '已完成', 4: '已取消' };
    return map[status] || '未知';
};

const filteredOrders = computed(() => {
    if (activeStatus.value === -1) return orders.value;
    return orders.value.filter((o) => o.status === activeStatus.value);
});

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleString();
};

const fetchOrders = async () => {
    try {
        const res = await getMyOrders();
        orders.value = res.data;
    } catch (error) {
        console.error('获取订单失败:', error);
    }
};

const handlePay = (order) => {
    ElMessageBox.confirm(`确认支付订单 ¥${Number(order.total_amount).toFixed(2)} 吗？`, '模拟支付', {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'info'
    }).then(async () => {
        try {
            await payOrder(order.id);
            ElMessage.success('支付成功！');
            fetchOrders();
        } catch (error) {
            console.error('支付失败:', error);
        }
    }).catch(() => { });
};

const handleCancel = (order) => {
    ElMessageBox.confirm('确定要取消该订单吗？取消后库存将恢复。', '取消订单', {
        confirmButtonText: '确定取消',
        cancelButtonText: '返回',
        type: 'warning'
    }).then(async () => {
        try {
            await cancelOrder(order.id);
            ElMessage.success('订单已取消');
            fetchOrders();
        } catch (error) {
            console.error('取消失败:', error);
        }
    }).catch(() => { });
};

const handleDelete = (order) => {
    ElMessageBox.confirm('确定要删除该订单吗？此操作不可恢复。', '删除订单', {
        confirmButtonText: '确定删除',
        cancelButtonText: '返回',
        type: 'warning'
    }).then(async () => {
        try {
            await deleteOrder(order.id);
            ElMessage.success('订单已删除');
            fetchOrders();
        } catch (error) {
            console.error('删除失败:', error);
        }
    }).catch(() => { });
};

onMounted(() => {
    fetchOrders();
});
</script>

<style scoped>
.orders-page {
    background: #f5f6f8;
    min-height: 100vh;
}

/* Hero */
.orders-hero {
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
.orders-main {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
}

/* 状态筛选 */
.status-tabs {
    display: flex;
    gap: 4px;
    background: #fff;
    border-radius: 14px;
    padding: 6px;
    margin-bottom: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.status-tab {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 13px;
    font-weight: 600;
    color: #999;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
}

.status-tab:hover {
    color: #666;
    background: #f5f5f5;
}

.status-tab.active {
    color: #fff;
    background: linear-gradient(135deg, #667eea, #764ba2);
}

/* 订单卡片 */
.order-card {
    background: #fff;
    border-radius: 16px;
    margin-bottom: 16px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    overflow: hidden;
}

.order-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
}

.order-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.order-no {
    font-size: 13px;
    font-weight: 700;
    color: #333;
}

.order-time {
    font-size: 12px;
    color: #bbb;
}

.order-status {
    font-size: 12px;
    font-weight: 700;
    padding: 4px 14px;
    border-radius: 20px;
}

.status-0 {
    background: #fff7ed;
    color: #ea580c;
}

.status-1 {
    background: #f0fdf4;
    color: #16a34a;
}

.status-2 {
    background: #eff6ff;
    color: #2563eb;
}

.status-3 {
    background: #f5f5f5;
    color: #666;
}

.status-4 {
    background: #fef2f2;
    color: #dc2626;
}

/* 订单商品 */
.order-items {
    padding: 16px 20px;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 0;
    border-bottom: 1px solid #f8f8f8;
}

.order-item:last-child {
    border-bottom: none;
}

.oi-cover {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f5f5f5;
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
    font-size: 22px;
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
    font-size: 15px;
    font-weight: 800;
    color: #ff6b6b;
}

/* 订单底部 */
.order-footer {
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
}

.order-address {
    font-size: 13px;
    color: #999;
    margin-bottom: 12px;
}

.order-total {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    font-size: 13px;
    color: #666;
    margin-bottom: 14px;
}

.total-label {
    margin-left: 8px;
}

.total-price {
    font-size: 22px;
    font-weight: 900;
    color: #ff6b6b;
}

.order-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn-action {
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
}

.btn-pay {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    color: #fff;
}

.btn-pay:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn-cancel {
    background: #f5f5f5;
    color: #666;
}

.btn-cancel:hover {
    background: #e8e8e8;
}

.btn-delete {
    background: none;
    border: 1px solid #e0e0e0;
    color: #999;
}

.btn-delete:hover {
    border-color: #ff6b6b;
    color: #ff6b6b;
}

/* 空状态 */
.orders-empty {
    text-align: center;
    padding: 80px 20px;
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
    .status-tabs {
        overflow-x: auto;
    }

    .status-tab {
        white-space: nowrap;
        flex: none;
        padding: 10px 16px;
    }

    .order-actions {
        flex-wrap: wrap;
    }
}
</style>