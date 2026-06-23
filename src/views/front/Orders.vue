<template>
    <div class="orders-page">
        <!-- Hero（全宽） -->
        <div class="orders-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-orb orb-3"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">
                    <el-icon>
                        <List />
                    </el-icon>
                    ORDERS
                </div>
                <h1 class="hero-title">我的订单</h1>
                <p class="hero-desc">查看所有订单状态</p>
            </div>
        </div>

        <div class="orders-main">
            <!-- 状态筛选 -->
            <div class="status-tabs">
                <div v-for="tab in statusTabs" :key="tab.value" class="status-tab"
                    :class="{ active: activeStatus === tab.value }" @click="activeStatus = tab.value">
                    {{ tab.label }}
                    <span class="tab-count" v-if="getTabCount(tab.value) > 0">{{ getTabCount(tab.value) }}</span>
                </div>
            </div>

            <!-- 加载骨架 -->
            <div v-if="loading" class="orders-list">
                <div v-for="i in 3" :key="i" class="order-card skeleton-card">
                    <div class="skel-header">
                        <div class="skel-line short"></div>
                        <div class="skel-badge"></div>
                    </div>
                    <div class="skel-body">
                        <div class="skel-item">
                            <div class="skel-cover"></div>
                            <div class="skel-lines">
                                <div class="skel-line medium"></div>
                                <div class="skel-line tiny"></div>
                            </div>
                        </div>
                    </div>
                    <div class="skel-footer">
                        <div class="skel-line long"></div>
                        <div class="skel-line short"></div>
                    </div>
                </div>
            </div>

            <!-- 订单列表 -->
            <div v-else-if="filteredOrders.length > 0" class="orders-list">
                <div v-for="order in filteredOrders" :key="order.id" class="order-card">
                    <!-- 头部 -->
                    <div class="order-header">
                        <div class="order-info">
                            <span class="order-no">订单号：{{ order.order_no }}</span>
                            <span class="order-time">{{ formatTime(order.create_time) }}</span>
                        </div>
                        <span class="order-status" :class="'status-' + order.status">
                            <el-icon :size="12">
                                <component :is="statusIcon(order.status)" />
                            </el-icon>
                            {{ statusText(order.status) }}
                        </span>
                    </div>

                    <!-- 商品列表 -->
                    <div class="order-items">
                        <div v-for="item in order.items" :key="item.id" class="order-item">
                            <div class="oi-cover">
                                <img v-if="item.product_cover" :src="item.product_cover" class="oi-img"
                                    @error="(e) => e.target.style.display = 'none'" />
                                <div class="oi-placeholder" v-else>
                                    <el-icon :size="20">
                                        <ShoppingBag />
                                    </el-icon>
                                </div>
                            </div>
                            <div class="oi-info">
                                <span class="oi-name">{{ item.product_name }}</span>
                                <span class="oi-price">¥{{ formatPrice(item.price) }} x {{ item.quantity }}</span>
                            </div>
                            <div class="oi-subtotal">¥{{ formatPrice(item.price * item.quantity) }}</div>
                        </div>
                    </div>

                    <!-- 底部 -->
                    <div class="order-footer">
                        <div class="order-address" v-if="order.receiver_name">
                            <el-icon :size="14" color="#999">
                                <Location />
                            </el-icon>
                            <span>{{ order.receiver_name }} {{ order.receiver_phone }} · {{ order.receiver_address
                                }}</span>
                        </div>
                        <div class="order-bottom-row">
                            <div class="order-total">
                                <span class="total-count">共 {{order.items.reduce((s, i) => s + i.quantity, 0)}}
                                    件</span>
                                <span class="total-label">合计：</span>
                                <span class="total-price">¥{{ formatPrice(order.total_amount) }}</span>
                            </div>
                            <div class="order-actions">
                                <button v-if="order.status === 0" class="btn-action btn-pay" @click="handlePay(order)">
                                    <el-icon :size="14">
                                        <CreditCard />
                                    </el-icon> 立即支付
                                </button>
                                <button v-if="order.status === 0" class="btn-action btn-cancel"
                                    @click="handleCancel(order)">
                                    <el-icon :size="14">
                                        <CircleClose />
                                    </el-icon> 取消订单
                                </button>
                                <button v-if="order.status !== 1" class="btn-action btn-delete"
                                    @click="handleDelete(order)">
                                    <el-icon :size="14">
                                        <Delete />
                                    </el-icon> 删除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="orders-empty">
                <el-icon :size="80" color="#ddd">
                    <List />
                </el-icon>
                <p class="empty-text">{{ activeStatus === -1 ? '暂无订单' : '该状态下暂无订单' }}</p>
                <button class="btn-go-shop" @click="router.push('/products')">
                    <el-icon>
                        <ShoppingBag />
                    </el-icon> 去逛逛
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatPrice, formatTime } from '../../utils/format';
import { getMyOrders, payOrder, cancelOrder, deleteOrder } from '../../api/order';
import {
    List, ShoppingBag, Location, CreditCard, CircleClose, Delete,
    Clock, Check, Van, Select, WarningFilled
} from '@element-plus/icons-vue';

const router = useRouter();
const orders = ref([]);
const loading = ref(false);
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

const statusIcon = (status) => {
    const map = { 0: Clock, 1: Check, 2: Van, 3: Select, 4: WarningFilled };
    return map[status] || Clock;
};

const getTabCount = (value) => {
    if (value === -1) return orders.value.length;
    return orders.value.filter(o => o.status === value).length;
};

const filteredOrders = computed(() => {
    if (activeStatus.value === -1) return orders.value;
    return orders.value.filter(o => o.status === activeStatus.value);
});

const fetchOrders = async () => {
    loading.value = true;
    try {
        const res = await getMyOrders();
        orders.value = res.data;
    } catch (error) {
        console.error('获取订单失败:', error);
    } finally {
        loading.value = false;
    }
};

const handlePay = (order) => {
    ElMessageBox.confirm(`确认支付订单 ¥${formatPrice(order.total_amount)} 吗？`, '模拟支付', {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'info'
    }).then(async () => {
        try {
            await payOrder(order.id);
            ElMessage.success('支付成功！');
            fetchOrders();
        } catch (error) { console.error('支付失败:', error); }
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
        } catch (error) { console.error('取消失败:', error); }
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
        } catch (error) { console.error('删除失败:', error); }
    }).catch(() => { });
};

onMounted(() => { fetchOrders(); });
</script>

<style scoped>
.orders-page {
    background: #f5f6f8;
    min-height: 100vh;
}

/* ==================== Hero（全宽） ==================== */
.orders-hero {
    position: relative;
    padding: 50px 20px;
    text-align: center;
    overflow: hidden;
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
}

@media (min-width: 768px) {
    .orders-hero {
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

.orb-3 {
    width: 90px;
    height: 90px;
    background: #764ba2;
    top: 20%;
    right: 20%;
    animation: orbDrift 9s ease-in-out infinite 2s;
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

    .orb-3 {
        width: 120px;
        height: 120px;
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

/* ==================== 主内容 ==================== */
.orders-main {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px 16px 60px;
}

@media (min-width: 768px) {
    .orders-main {
        padding: 24px 24px 80px;
    }
}

/* ==================== 状态筛选 ==================== */
.status-tabs {
    display: flex;
    gap: 4px;
    background: #fff;
    border-radius: 14px;
    padding: 6px;
    margin-bottom: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
}

.status-tabs::-webkit-scrollbar {
    display: none;
}

.status-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #999;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    flex-shrink: 0;
}

.status-tab:hover {
    color: #666;
    background: #f5f5f5;
}

.status-tab.active {
    color: #fff;
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.tab-count {
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.06);
    color: #999;
    line-height: 1.4;
}

.status-tab.active .tab-count {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
}

/* ==================== 订单卡片 ==================== */
.orders-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.order-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    overflow: hidden;
    transition: box-shadow 0.3s;
}

.order-card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

/* 头部 */
.order-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
    gap: 12px;
}

@media (min-width: 768px) {
    .order-header {
        padding: 16px 20px;
    }
}

.order-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.order-no {
    font-size: 12px;
    font-weight: 700;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .order-no {
        font-size: 13px;
    }
}

.order-time {
    font-size: 11px;
    color: #bbb;
}

.order-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    white-space: nowrap;
    flex-shrink: 0;
}

@media (min-width: 768px) {
    .order-status {
        font-size: 12px;
        padding: 4px 14px;
    }
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
    background: #f5f3ff;
    color: #7c3aed;
}

.status-4 {
    background: #f5f5f5;
    color: #666;
}

/* 商品列表 */
.order-items {
    padding: 14px 18px;
}

@media (min-width: 768px) {
    .order-items {
        padding: 16px 20px;
    }
}

.order-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f8f8f8;
}

.order-item:last-child {
    border-bottom: none;
}

.oi-cover {
    width: 52px;
    height: 52px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
    background: #f5f5f5;
}

@media (min-width: 768px) {
    .oi-cover {
        width: 56px;
        height: 56px;
    }
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
    color: #ddd;
}

.oi-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.oi-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.oi-price {
    font-size: 12px;
    color: #999;
}

.oi-subtotal {
    font-size: 15px;
    font-weight: 800;
    color: #FF6B6B;
    flex-shrink: 0;
}

/* 底部 */
.order-footer {
    padding: 14px 18px;
    border-top: 1px solid #f0f0f0;
}

@media (min-width: 768px) {
    .order-footer {
        padding: 16px 20px;
    }
}

.order-address {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 12px;
    color: #999;
    margin-bottom: 12px;
    line-height: 1.5;
}

.order-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
}

.order-total {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 13px;
    color: #666;
}

.total-count {
    color: #999;
}

.total-label {
    color: #666;
}

.total-price {
    font-size: 20px;
    font-weight: 900;
    color: #FF6B6B;
    line-height: 1;
}

@media (min-width: 768px) {
    .total-price {
        font-size: 22px;
    }
}

.order-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn-action {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .btn-action {
        padding: 8px 20px;
        font-size: 13px;
    }
}

.btn-pay {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
}

.btn-pay:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
    border-color: #FF6B6B;
    color: #FF6B6B;
}

/* ==================== 骨架屏 ==================== */
.skeleton-card {
    animation: none;
}

.skeleton-card:hover {
    box-shadow: none;
}

.skel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
}

.skel-badge {
    width: 60px;
    height: 22px;
    border-radius: 20px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-body {
    padding: 16px 20px;
}

.skel-item {
    display: flex;
    align-items: center;
    gap: 14px;
}

.skel-cover {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skel-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
}

.skel-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-line.tiny {
    width: 30%;
}

.skel-line.short {
    width: 40%;
}

.skel-line.medium {
    width: 60%;
}

.skel-line.long {
    width: 70%;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* ==================== 空状态 ==================== */
.orders-empty {
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