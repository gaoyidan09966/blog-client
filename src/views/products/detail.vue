<template>
    <div class="product-detail-page" v-if="product">
        <!-- 面包屑 -->
        <div class="breadcrumb-bar">
            <div class="breadcrumb-inner">
                <span class="crumb" @click="router.push('/')">首页</span>
                <span class="crumb-sep">/</span>
                <span class="crumb" @click="router.push('/products')">周边好物</span>
                <span class="crumb-sep">/</span>
                <span class="crumb current">{{ product.name }}</span>
            </div>
        </div>

        <!-- 商品主区域 -->
        <div class="detail-main">
            <div class="detail-inner">
                <!-- 左侧：图片轮播 -->
                <div class="gallery-section">
                    <div class="gallery-main">
                        <div class="main-img-wrapper">
                            <img v-if="currentImage" :src="currentImage" class="main-img"
                                @error="(e) => e.target.style.display = 'none'" />
                            <div class="main-placeholder" v-else>
                                <el-icon :size="64">
                                    <Picture />
                                </el-icon>
                            </div>

                            <button class="gallery-arrow arrow-left" v-if="allImages.length > 1" @click.stop="prevImage"
                                :class="{ 'arrow-disabled': currentImageIndex === 0 }">
                                <el-icon>
                                    <ArrowLeft />
                                </el-icon>
                            </button>
                            <button class="gallery-arrow arrow-right" v-if="allImages.length > 1"
                                @click.stop="nextImage"
                                :class="{ 'arrow-disabled': currentImageIndex === allImages.length - 1 }">
                                <el-icon>
                                    <ArrowRight />
                                </el-icon>
                            </button>

                            <div class="gallery-dots" v-if="allImages.length > 1">
                                <span v-for="(img, i) in allImages" :key="i" class="gallery-dot"
                                    :class="{ active: i === currentImageIndex }" @click.stop="switchImage(i)"></span>
                            </div>

                            <div class="img-tags">
                                <span class="tag-new" v-if="product.is_new">新品</span>
                                <span class="tag-hot" v-if="product.is_hot">热销</span>
                            </div>

                            <div class="img-counter" v-if="allImages.length > 1">
                                {{ currentImageIndex + 1 }} / {{ allImages.length }}
                            </div>
                        </div>
                    </div>

                    <div class="gallery-thumbs" v-if="allImages.length > 1">
                        <div v-for="(img, index) in allImages" :key="index" class="thumb-item"
                            :class="{ active: index === currentImageIndex }" @click="switchImage(index)">
                            <img :src="img" class="thumb-img"
                                @error="(e) => e.target.parentElement.style.display = 'none'" />
                        </div>
                    </div>
                </div>

                <!-- 右侧：商品信息 -->
                <div class="info-section">
                    <div class="info-tags">
                        <span class="cat-badge" v-if="product.category">{{ product.category }}</span>
                        <span class="stock-badge" :class="product.stock > 0 ? 'in-stock' : 'out-stock'">
                            <el-icon :size="12">
                                <CircleCheckFilled v-if="product.stock > 0" />
                                <CircleCloseFilled v-else />
                            </el-icon>
                            {{ product.stock > 0 ? '有货' : '缺货' }}
                        </span>
                    </div>

                    <h1 class="product-name">{{ product.name }}</h1>
                    <p class="product-desc">{{ product.description || '暂无商品简介' }}</p>

                    <!-- 价格区域 -->
                    <div class="price-box">
                        <div class="price-main">
                            <span class="price-symbol">¥</span>
                            <span class="price-value">{{ formatPrice(product.price) }}</span>
                        </div>
                        <div class="price-original" v-if="product.original_price">
                            <span class="original-text">¥{{ formatPrice(product.original_price) }}</span>
                            <span class="discount-tag">{{ discountPercent }}% OFF</span>
                        </div>
                    </div>

                    <div class="stats-row">
                        <div class="stat-item">
                            <el-icon :size="14" color="#FF6B6B">
                                <TrendCharts />
                            </el-icon>
                            <span class="stat-text">累计销量 <strong>{{ product.sales }}</strong></span>
                        </div>
                        <div class="stat-item">
                            <el-icon :size="14" color="#999">
                                <Box />
                            </el-icon>
                            <span class="stat-text">库存余量 <strong>{{ product.stock }}</strong></span>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <!-- 数量选择 -->
                    <div class="quantity-row">
                        <span class="qty-label">购买数量</span>
                        <div class="qty-control">
                            <button class="qty-btn" @click="quantity > 1 && quantity--" :disabled="quantity <= 1">
                                <el-icon>
                                    <Minus />
                                </el-icon>
                            </button>
                            <input type="number" v-model.number="quantity" class="qty-input" min="1"
                                :max="product.stock" @blur="clampQuantity" />
                            <button class="qty-btn" @click="quantity < product.stock && quantity++"
                                :disabled="quantity >= product.stock">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                            </button>
                        </div>
                        <span class="qty-stock">库存 {{ product.stock }} 件</span>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-row">
                        <button class="btn-cart" @click="handleAddCart" :disabled="product.stock <= 0">
                            <el-icon :size="18">
                                <ShoppingCart />
                            </el-icon>
                            加入购物车
                        </button>
                        <button class="btn-buy" @click="handleBuyNow" :disabled="product.stock <= 0">
                            <el-icon :size="18">
                                <Lightning />
                            </el-icon>
                            立即购买
                        </button>
                        <button class="btn-fav" @click="handleFav">
                            <svg class="fav-svg" viewBox="0 0 24 24" :fill="isFav ? '#FF6B6B' : 'none'"
                                :stroke="isFav ? '#FF6B6B' : '#ccc'" stroke-width="2">
                                <path
                                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </button>
                    </div>

                    <div class="guarantee-row">
                        <div class="guarantee-item" v-for="(g, i) in guarantees" :key="i">
                            <el-icon :size="16" :color="g.color">
                                <component :is="g.icon" />
                            </el-icon>
                            <span class="g-text">{{ g.text }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 详情选项卡 -->
        <div class="detail-tabs">
            <div class="tabs-inner">
                <div class="tab-nav">
                    <span v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
                        @click="activeTab = tab.key">
                        <el-icon :size="14">
                            <component :is="tab.icon" />
                        </el-icon>
                        {{ tab.label }}
                    </span>
                </div>

                <div class="tab-content">
                    <div v-show="activeTab === 'detail'" class="tab-panel">
                        <div class="detail-images" v-if="detailImages.length > 0">
                            <img v-for="(img, i) in detailImages" :key="i" :src="img" class="detail-img-item"
                                @error="(e) => e.target.style.display = 'none'" />
                        </div>
                        <div class="rich-content" v-if="product.description">
                            <p>{{ product.description }}</p>
                        </div>
                        <div class="rich-content" v-else-if="!product.description && detailImages.length === 0">
                            <p>暂无详细描述</p>
                        </div>
                        <div class="spec-table">
                            <div class="spec-row" v-for="(spec, i) in specList" :key="i">
                                <span class="spec-label">{{ spec.label }}</span>
                                <span class="spec-value">{{ spec.value }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-show="activeTab === 'notice'" class="tab-panel">
                        <div class="notice-list">
                            <div class="notice-item" v-for="(n, i) in notices" :key="i">
                                <el-icon :size="28" :color="n.color" v-if="resolveIcon(n.icon)">
                                    <component :is="resolveIcon(n.icon)" />
                                </el-icon>
                                <div class="notice-body">
                                    <h4>{{ n.title }}</h4>
                                    <p>{{ n.description }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 猜你喜欢 -->
        <div class="related-section" v-if="relatedProducts.length > 0">
            <div class="related-inner">
                <h2 class="section-heading">
                    <span class="heading-line"></span>
                    <span class="heading-text">猜你喜欢</span>
                    <span class="heading-line"></span>
                </h2>
                <div class="related-grid">
                    <div v-for="item in relatedProducts" :key="item.id" class="related-card" @click="goDetail(item.id)">
                        <div class="related-cover">
                            <img v-if="item.cover" :src="item.cover" class="related-img"
                                @error="(e) => e.target.style.display = 'none'" />
                            <div class="related-placeholder" v-else>
                                <el-icon :size="40">
                                    <ShoppingBag />
                                </el-icon>
                            </div>
                        </div>
                        <div class="related-info">
                            <p class="related-name">{{ item.name }}</p>
                            <span class="related-price">¥{{ formatPrice(item.price) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 骨架屏 -->
    <div class="product-detail-page" v-else-if="loading">
        <div class="breadcrumb-bar">
            <div class="breadcrumb-inner">
                <div class="skel-breadcrumb"></div>
            </div>
        </div>
        <div class="detail-main">
            <div class="detail-inner">
                <div class="gallery-section">
                    <div class="skel-gallery"></div>
                    <div class="skel-thumbs">
                        <div class="skel-thumb" v-for="i in 4" :key="i"></div>
                    </div>
                </div>
                <div class="info-section">
                    <div class="skel-tags"></div>
                    <div class="skel-title"></div>
                    <div class="skel-desc"></div>
                    <div class="skel-price-box"></div>
                    <div class="skel-stats"></div>
                    <div class="skel-qty"></div>
                    <div class="skel-actions"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getProductById, getProductList, getActiveNotices } from '../../api/product';
import { formatPrice } from '../../utils/format';
import {
    Picture, ArrowLeft, ArrowRight, ShoppingCart, Lightning,
    ShoppingBag, Minus, Plus, TrendCharts, Box,
    CircleCheckFilled, CircleCloseFilled,
    Document, Bell, Select, Lock, Timer
} from '@element-plus/icons-vue';

// ─── 图标映射：将 API 返回的字符串转为真实组件 ─────────
const iconMap = {
    Select,
    Lock,
    Timer,
    Bell,
    Document,
    CircleCheckFilled,
    CircleCloseFilled,
    ShoppingCart,
    Lightning,
    ShoppingBag,
    Picture,
    Minus,
    Plus,
    TrendCharts,
    Box
};

/**
 * 安全解析图标名称
 * @param {string|object} name - 图标字符串名称或已导入的组件对象
 * @returns {object|null} 组件对象，未找到时返回 null
 */
const resolveIcon = (name) => {
    if (!name) return null;
    // 如果已经是组件对象（硬编码场景），直接返回
    if (typeof name !== 'string') return name;
    return iconMap[name] || null;
};

// ─── 路由 ──────────────────────────────────────────────
const route = useRoute();
const router = useRouter();

// ─── 状态 ──────────────────────────────────────────────
const loading = ref(true);
const product = ref(null);
const currentImageIndex = ref(0);
const quantity = ref(1);
const activeTab = ref('detail');
const isFav = ref(false);
const relatedProducts = ref([]);

// ─── 计算属性 ──────────────────────────────────────────
const currentImage = computed(() => allImages.value[currentImageIndex.value] || '');

const discountPercent = computed(() => {
    if (!product.value?.original_price || !product.value?.price) return 0;
    return Math.round((1 - product.value.price / product.value.original_price) * 100);
});

const allImages = computed(() => {
    const imgs = [];
    if (product.value?.cover) imgs.push(product.value.cover);
    if (product.value?.images) {
        try {
            const parsed = JSON.parse(product.value.images);
            if (Array.isArray(parsed)) imgs.push(...parsed);
        } catch (e) { /* ignore */ }
    }
    return imgs;
});

const detailImages = computed(() => {
    if (product.value?.images) {
        try {
            const parsed = JSON.parse(product.value.images);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) { /* ignore */ }
    }
    return [];
});

const specList = computed(() => [
    { label: '商品名称', value: product.value?.name || '-' },
    { label: '商品分类', value: product.value?.category || '-' },
    { label: '商品价格', value: '¥' + formatPrice(product.value?.price || 0) },
    { label: '库存数量', value: product.value?.stock || 0 },
    { label: '累计销量', value: product.value?.sales || 0 },
    { label: '上架状态', value: product.value?.status === 1 ? '在售' : '下架' },
]);

// ─── 图片轮播 ──────────────────────────────────────────
const switchImage = (index) => { currentImageIndex.value = index; };
const prevImage = () => { if (currentImageIndex.value > 0) currentImageIndex.value--; };
const nextImage = () => { if (currentImageIndex.value < allImages.value.length - 1) currentImageIndex.value++; };

const handleKeydown = (e) => {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
};

// ─── 标签页 ────────────────────────────────────────────
const tabs = [
    { key: 'detail', label: '商品详情', icon: Document },
    { key: 'notice', label: '购买须知', icon: Bell }
];

// ─── 保障项（硬编码，icon 为组件对象，安全） ──────────
const guarantees = [
    { icon: Select, text: '正品保证', color: '#38a169' },
    { icon: Lock, text: '安全支付', color: '#667eea' },
    { icon: Timer, text: '极速发货', color: '#F59E0B' },
    { icon: Bell, text: '售后无忧', color: '#F472B6' }
];

// ─── 购买须知（来自 API，icon 为字符串，需 resolveIcon 转换）──
const notices = ref([]);

const fetchNotices = async () => {
    try {
        const res = await getActiveNotices();
        notices.value = res.data;
    } catch (error) {
        console.error('获取购买须知失败:', error);
    }
};

// ─── 数量控制 ──────────────────────────────────────────
const clampQuantity = () => {
    if (!quantity.value || quantity.value < 1) quantity.value = 1;
    else if (quantity.value > product.value.stock) quantity.value = product.value.stock;
};

// ─── 数据获取 ──────────────────────────────────────────
const fetchDetail = async (id) => {
    loading.value = true;
    try {
        const res = await getProductById(id);
        product.value = res.data;
        currentImageIndex.value = 0;
        quantity.value = 1;
        activeTab.value = 'detail';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        checkFavStatus();
        fetchRelated();
        fetchNotices();
    } catch (error) {
        console.error('获取商品详情失败:', error);
        ElMessage.error('商品加载失败');
        router.push('/products');
    } finally {
        loading.value = false;
    }
};

const fetchRelated = async () => {
    try {
        const params = { pageSize: 5 };
        if (product.value?.category) params.category = product.value.category;
        const res = await getProductList(params);
        relatedProducts.value = (res.data.list || [])
            .filter(item => item.id !== product.value.id)
            .slice(0, 4);
    } catch (error) {
        console.error('获取相关商品失败:', error);
    }
};

// ─── 收藏 ─────────────────────────────────────────────
const checkFavStatus = () => {
    const favs = JSON.parse(localStorage.getItem('product_favs') || '[]');
    isFav.value = favs.includes(product.value?.id);
};

// ─── 跳转 ─────────────────────────────────────────────
const goDetail = (id) => { router.push(`/products/${id}`); };

// ─── 操作 ─────────────────────────────────────────────
const handleAddCart = () => {
    if (product.value.stock <= 0) { ElMessage.warning('该商品已售罄'); return; }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.value.id);
    if (existing) { existing.quantity += quantity.value; }
    else {
        cart.push({
            id: product.value.id,
            name: product.value.name,
            price: product.value.price,
            cover: product.value.cover,
            quantity: quantity.value
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    ElMessage.success(`已将 ${quantity.value} 件「${product.value.name}」加入购物车`);
};

const handleBuyNow = () => {
    if (product.value.stock <= 0) { ElMessage.warning('该商品已售罄'); return; }
    ElMessage.info('购买功能暂未开放，敬请期待');
};

const handleFav = () => {
    isFav.value = !isFav.value;
    const favs = JSON.parse(localStorage.getItem('product_favs') || '[]');
    if (isFav.value) favs.push(product.value.id);
    else { const idx = favs.indexOf(product.value.id); if (idx > -1) favs.splice(idx, 1); }
    localStorage.setItem('product_favs', JSON.stringify([...new Set(favs)]));
    ElMessage.success(isFav.value ? '已收藏' : '已取消收藏');
};

// ─── 监听路由变化 ─────────────────────────────────────
watch(() => route.params.id, (newId) => { if (newId) fetchDetail(newId); });

// ─── 生命周期 ─────────────────────────────────────────
onMounted(() => {
    if (route.params.id) fetchDetail(route.params.id);
    document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => { document.removeEventListener('keydown', handleKeydown); });
</script>

<style scoped>
.product-detail-page {
    background: #f5f6f8;
    min-height: 100vh;
}

/* ==================== 面包屑 ==================== */
.breadcrumb-bar {
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.breadcrumb-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 12px 16px;
    font-size: 13px;
}

@media (min-width: 768px) {
    .breadcrumb-inner {
        padding: 12px 24px;
    }
}

.crumb {
    color: #999;
    cursor: pointer;
    transition: color 0.2s;
}

.crumb:hover {
    color: #667eea;
}

.crumb.current {
    color: #333;
    font-weight: 600;
    cursor: default;
}

.crumb-sep {
    margin: 0 8px;
    color: #ddd;
}

/* ==================== 主区域 ==================== */
.detail-main {
    background: #fff;
    padding-bottom: 32px;
}

.detail-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 16px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    align-items: start;
}

@media (min-width: 768px) {
    .detail-inner {
        padding: 32px 24px;
        gap: 40px;
    }
}

@media (min-width: 1024px) {
    .detail-inner {
        grid-template-columns: 480px 1fr;
        gap: 48px;
    }
}

/* ==================== 图片轮播 ==================== */
.gallery-section {
    position: static;
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
}

@media (min-width: 1024px) {
    .gallery-section {
        position: sticky;
        top: 88px;
        max-width: none;
        margin: 0;
    }
}

.gallery-main {
    border-radius: 16px;
    overflow: hidden;
    background: #f8f8f8;
    margin-bottom: 12px;
}

.main-img-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
}

.main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.main-img-wrapper:hover .main-img {
    transform: scale(1.08);
}

.main-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fafafa, #f0f0f0);
    color: #ddd;
}

/* 轮播箭头 */
.gallery-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.85);
    border: none;
    border-radius: 50%;
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    z-index: 5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(4px);
    opacity: 0;
}

.main-img-wrapper:hover .gallery-arrow {
    opacity: 1;
}

.gallery-arrow:hover {
    background: #fff;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-50%) scale(1.05);
}

.arrow-disabled {
    opacity: 0.3 !important;
    cursor: not-allowed;
}

.arrow-left {
    left: 12px;
}

.arrow-right {
    right: 12px;
}

/* 手机端箭头常显 */
@media (max-width: 768px) {
    .gallery-arrow {
        opacity: 1;
        width: 32px;
        height: 32px;
    }
}

/* 指示点 */
.gallery-dots {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 5;
    opacity: 0;
    transition: opacity 0.3s;
}

.main-img-wrapper:hover .gallery-dots {
    opacity: 1;
}

@media (max-width: 768px) {
    .gallery-dots {
        opacity: 1;
    }
}

.gallery-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.3s;
}

.gallery-dot:hover {
    background: rgba(255, 255, 255, 0.8);
}

.gallery-dot.active {
    background: #fff;
    width: 20px;
    border-radius: 4px;
}

.img-counter {
    position: absolute;
    bottom: 14px;
    right: 14px;
    padding: 3px 10px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    border-radius: 10px;
    z-index: 5;
}

.img-tags {
    position: absolute;
    top: 14px;
    left: 14px;
    display: flex;
    gap: 8px;
    z-index: 5;
}

.tag-new,
.tag-hot {
    padding: 4px 12px;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 12px;
}

.tag-new {
    background: linear-gradient(135deg, #F472B6, #FCD34D);
}

.tag-hot {
    background: linear-gradient(135deg, #FF6B6B, #ee5a24);
}

/* 缩略图 */
.gallery-thumbs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
}

.gallery-thumbs::-webkit-scrollbar {
    display: none;
}

.thumb-item {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s;
    flex-shrink: 0;
}

.thumb-item:hover {
    border-color: #ccc;
}

.thumb-item.active {
    border-color: #667eea;
}

.thumb-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* ==================== 商品信息 ==================== */
.info-section {
    padding-top: 4px;
}

@media (min-width: 768px) {
    .info-section {
        padding-top: 8px;
    }
}

.info-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
}

.cat-badge {
    padding: 4px 14px;
    background: #f0f0ff;
    color: #667eea;
    font-size: 12px;
    font-weight: 600;
    border-radius: 14px;
}

.stock-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 14px;
}

.in-stock {
    background: #f0fff4;
    color: #38a169;
}

.out-stock {
    background: #fff5f5;
    color: #e53e3e;
}

.product-name {
    font-size: 22px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 10px;
    line-height: 1.3;
}

@media (min-width: 768px) {
    .product-name {
        font-size: 28px;
    }
}

.product-desc {
    font-size: 14px;
    color: #888;
    margin: 0 0 20px;
    line-height: 1.6;
}

@media (min-width: 768px) {
    .product-desc {
        font-size: 15px;
        margin-bottom: 24px;
    }
}

/* 价格 */
.price-box {
    padding: 16px 20px;
    background: linear-gradient(135deg, #fff5f5, #fef2f2);
    border-radius: 14px;
    margin-bottom: 20px;
    display: flex;
    align-items: flex-end;
    gap: 12px;
    flex-wrap: wrap;
}

@media (min-width: 768px) {
    .price-box {
        padding: 20px 24px;
        gap: 16px;
    }
}

.price-main {
    display: flex;
    align-items: flex-start;
}

.price-symbol {
    font-size: 16px;
    font-weight: 800;
    color: #FF6B6B;
    margin-top: 6px;
}

.price-value {
    font-size: 32px;
    font-weight: 900;
    color: #FF6B6B;
    line-height: 1;
}

@media (min-width: 768px) {
    .price-value {
        font-size: 40px;
    }
}

.price-original {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 4px;
}

@media (min-width: 768px) {
    .price-original {
        padding-bottom: 6px;
    }
}

.original-text {
    font-size: 14px;
    color: #ccc;
    text-decoration: line-through;
}

.discount-tag {
    padding: 2px 8px;
    background: #FF6B6B;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
}

/* 统计 */
.stats-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

@media (min-width: 768px) {
    .stats-row {
        gap: 24px;
    }
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #999;
}

.stat-text strong {
    color: #333;
    font-weight: 700;
}

.divider {
    height: 1px;
    background: #f0f0f0;
    margin-bottom: 20px;
}

/* 数量 */
.quantity-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

@media (min-width: 768px) {
    .quantity-row {
        gap: 16px;
        margin-bottom: 28px;
    }
}

.qty-label {
    font-size: 14px;
    color: #666;
    font-weight: 600;
    flex-shrink: 0;
}

.qty-control {
    display: flex;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
}

.qty-btn {
    width: 36px;
    height: 36px;
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

.qty-input {
    width: 52px;
    height: 36px;
    border: none;
    border-left: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
    text-align: center;
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
    outline: none;
    -moz-appearance: textfield;
}

.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
}

.qty-stock {
    font-size: 12px;
    color: #bbb;
}

/* 操作按钮 */
.action-row {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
}

@media (min-width: 768px) {
    .action-row {
        gap: 12px;
    }
}

.btn-cart,
.btn-buy {
    flex: 1;
    height: 48px;
    border: none;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s;
}

@media (min-width: 768px) {

    .btn-cart,
    .btn-buy {
        height: 50px;
        font-size: 16px;
    }
}

.btn-cart {
    background: #1a1a2e;
    color: #fff;
}

.btn-cart:hover {
    background: #2d2d4a;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26, 26, 46, 0.2);
}

.btn-cart:disabled,
.btn-buy:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}

.btn-buy {
    background: linear-gradient(135deg, #F472B6, #FCD34D);
    color: #fff;
}

.btn-buy:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(244, 114, 182, 0.3);
}

.btn-fav {
    width: 48px;
    height: 48px;
    border: 2px solid #f0f0f0;
    border-radius: 14px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    flex-shrink: 0;
    padding: 0;
}

@media (min-width: 768px) {
    .btn-fav {
        width: 50px;
        height: 50px;
    }
}

.btn-fav:hover {
    border-color: #FF6B6B;
    transform: translateY(-2px);
}

.fav-svg {
    width: 22px;
    height: 22px;
    transition: all 0.3s;
}

.btn-fav:active .fav-svg {
    transform: scale(1.2);
}

/* 保障 */
.guarantee-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 14px 16px;
    background: #fafafa;
    border-radius: 12px;
}

@media (min-width: 768px) {
    .guarantee-row {
        display: flex;
        gap: 24px;
        padding: 16px 20px;
    }
}

.guarantee-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #666;
}

/* ==================== 详情选项卡 ==================== */
.detail-tabs {
    background: #fff;
    margin-top: 16px;
}

.tabs-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

@media (min-width: 768px) {
    .tabs-inner {
        padding: 0 24px;
    }
}

.tab-nav {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
    overflow-x: auto;
    scrollbar-width: none;
}

.tab-nav::-webkit-scrollbar {
    display: none;
}

.tab-item {
    padding: 16px 24px;
    font-size: 14px;
    font-weight: 600;
    color: #999;
    cursor: pointer;
    position: relative;
    transition: color 0.3s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
}

@media (min-width: 768px) {
    .tab-item {
        padding: 18px 32px;
        font-size: 15px;
    }
}

.tab-item:hover {
    color: #333;
}

.tab-item.active {
    color: #1a1a2e;
    font-weight: 800;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 24px;
    right: 24px;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
}

@media (min-width: 768px) {
    .tab-item.active::after {
        left: 32px;
        right: 32px;
    }
}

.tab-content {
    padding: 24px 0 48px;
}

@media (min-width: 768px) {
    .tab-content {
        padding: 32px 0 48px;
    }
}

.tab-panel {
    max-width: 800px;
}

.detail-images {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.detail-img-item {
    width: 100%;
    border-radius: 12px;
}

.rich-content {
    font-size: 14px;
    color: #555;
    line-height: 1.8;
    margin-bottom: 32px;
}

@media (min-width: 768px) {
    .rich-content {
        font-size: 15px;
    }
}

.spec-table {
    border: 1px solid #f0f0f0;
    border-radius: 12px;
    overflow: hidden;
}

.spec-row {
    display: flex;
    padding: 12px 16px;
    border-bottom: 1px solid #f8f8f8;
}

@media (min-width: 768px) {
    .spec-row {
        padding: 14px 20px;
    }
}

.spec-row:last-child {
    border-bottom: none;
}

.spec-row:nth-child(odd) {
    background: #fafafa;
}

.spec-label {
    width: 90px;
    font-size: 13px;
    color: #999;
    flex-shrink: 0;
}

@media (min-width: 768px) {
    .spec-label {
        width: 120px;
        font-size: 14px;
    }
}

.spec-value {
    flex: 1;
    font-size: 13px;
    color: #333;
    font-weight: 600;
}

@media (min-width: 768px) {
    .spec-value {
        font-size: 14px;
    }
}

/* 购买须知 */
.notice-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

@media (min-width: 768px) {
    .notice-list {
        gap: 20px;
    }
}

.notice-item {
    display: flex;
    gap: 14px;
    padding: 16px;
    background: #fafbff;
    border-radius: 14px;
}

@media (min-width: 768px) {
    .notice-item {
        gap: 16px;
        padding: 20px;
    }
}

.notice-body h4 {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
}

@media (min-width: 768px) {
    .notice-body h4 {
        font-size: 15px;
    }
}

.notice-body p {
    font-size: 13px;
    color: #888;
    margin: 0;
    line-height: 1.6;
}

/* ==================== 猜你喜欢 ==================== */
.related-section {
    padding: 40px 0 80px;
    background: #fff;
    margin-top: 16px;
}

@media (min-width: 768px) {
    .related-section {
        padding: 48px 0 80px;
    }
}

.related-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

@media (min-width: 768px) {
    .related-inner {
        padding: 0 24px;
    }
}

.section-heading {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
}

@media (min-width: 768px) {
    .section-heading {
        gap: 20px;
        margin-bottom: 32px;
    }
}

.heading-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
}

.heading-text {
    font-size: 20px;
    font-weight: 900;
    color: #1a1a2e;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .heading-text {
        font-size: 22px;
    }
}

.related-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
}

@media (min-width: 768px) {
    .related-grid {
        gap: 16px;
    }
}

@media (min-width: 1024px) {
    .related-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }
}

.related-card {
    background: #fafafa;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.related-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
}

.related-cover {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    background: #f5f5f5;
}

.related-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
}

.related-card:hover .related-img {
    transform: scale(1.06);
}

.related-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ddd;
}

.related-info {
    padding: 12px;
}

@media (min-width: 768px) {
    .related-info {
        padding: 14px;
    }
}

.related-name {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    margin: 0 0 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .related-name {
        font-size: 14px;
    }
}

.related-price {
    font-size: 16px;
    font-weight: 900;
    color: #FF6B6B;
}

@media (min-width: 768px) {
    .related-price {
        font-size: 18px;
    }
}

/* ==================== 骨架屏 ==================== */
.skel-breadcrumb {
    width: 200px;
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-gallery {
    aspect-ratio: 1;
    border-radius: 16px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-thumbs {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.skel-thumb {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-tags {
    width: 120px;
    height: 24px;
    border-radius: 12px;
    margin-bottom: 14px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-title {
    width: 70%;
    height: 28px;
    border-radius: 6px;
    margin-bottom: 10px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-desc {
    width: 90%;
    height: 16px;
    border-radius: 6px;
    margin-bottom: 24px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-price-box {
    width: 100%;
    height: 80px;
    border-radius: 14px;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-stats {
    width: 60%;
    height: 16px;
    border-radius: 6px;
    margin-bottom: 28px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-qty {
    width: 80%;
    height: 36px;
    border-radius: 10px;
    margin-bottom: 24px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skel-actions {
    width: 100%;
    height: 50px;
    border-radius: 14px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}
</style>