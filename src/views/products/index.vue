<template>
    <div class="products-page">
        <!-- Hero（保持原来风格） -->
        <div class="products-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">SHOP</div>
                <h1 class="hero-title">周边好物</h1>
                <p class="hero-desc">精选周边商品，找到你喜欢的那一款</p>
                <div class="hero-search">
                    <input type="text" v-model="keyword" placeholder="搜索商品名称..." class="search-input"
                        @keyup.enter="handleSearch" />
                    <button class="search-btn" @click="handleSearch">
                        <el-icon>
                            <Search />
                        </el-icon>
                    </button>
                </div>
            </div>
        </div>

        <!-- 筛选栏 -->
        <div class="products-section">
            <div class="filter-bar">
                <div class="filter-categories">
                    <span v-for="cat in categories" :key="cat" class="cat-tag"
                        :class="{ active: activeCategory === cat }" @click="handleCategoryChange(cat)">
                        {{ cat }}
                    </span>
                </div>
                <div class="filter-right">
                    <span class="result-count" v-if="keyword">
                        搜索「{{ keyword }}」找到 {{ totalCount }} 件
                    </span>
                    <el-select v-model="activeSort" size="small" style="width: 120px;" @change="handleSortChange">
                        <el-option label="综合推荐" value="default" />
                        <el-option label="最新上架" value="newest" />
                        <el-option label="销量优先" value="sales" />
                        <el-option label="价格↑" value="price_asc" />
                        <el-option label="价格↓" value="price_desc" />
                    </el-select>
                </div>
            </div>

            <!-- 加载骨架 -->
            <div v-if="loading" class="products-grid">
                <div v-for="i in 8" :key="i" class="product-card skeleton-card">
                    <div class="skeleton-cover"></div>
                    <div class="skeleton-body">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line long"></div>
                        <div class="skeleton-line medium"></div>
                        <div class="skeleton-price"></div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <el-empty v-else-if="productList.length === 0" description="暂无商品" />

            <!-- 商品网格 -->
            <div v-else class="products-grid">
                <div v-for="(product, index) in productList" :key="product.id" class="product-card"
                    :class="{ 'sold-out': product.stock <= 0 }" :style="{ animationDelay: index * 0.06 + 's' }"
                    @click="openDetail(product)">
                    <div class="card-tags">
                        <span class="tag-new" v-if="product.is_new">新品</span>
                        <span class="tag-hot" v-if="product.is_hot">热销</span>
                        <span class="tag-sold-out" v-if="product.stock <= 0">售罄</span>
                    </div>
                    <div class="card-cover">
                        <img v-if="product.cover" :src="product.cover" class="cover-img"
                            @error="(e) => e.target.style.display = 'none'" />
                        <div class="cover-placeholder" v-else>
                            <el-icon :size="40">
                                <ShoppingBag />
                            </el-icon>
                        </div>
                        <div class="sold-out-overlay" v-if="product.stock <= 0">
                            <span class="sold-out-text">已售罄</span>
                        </div>
                        <div class="card-overlay" v-else>
                            <span class="view-btn">
                                <el-icon>
                                    <View />
                                </el-icon> 查看详情
                            </span>
                        </div>
                    </div>
                    <div class="card-info">
                        <div class="card-category" v-if="product.category">{{ product.category }}</div>
                        <h3 class="card-name">{{ product.name }}</h3>
                        <p class="card-desc">{{ product.description }}</p>
                        <div class="card-bottom">
                            <div class="card-price">
                                <span class="price-symbol">¥</span>
                                <span class="price-current">{{ formatPrice(product.price) }}</span>
                                <span class="price-original" v-if="product.original_price">
                                    ¥{{ formatPrice(product.original_price) }}
                                </span>
                            </div>
                            <div class="card-sales" v-if="product.sales > 0">
                                已售 {{ product.sales }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-box" v-if="totalCount > pageSize">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[12, 24, 48]" :pager-count="5" layout="total, sizes, prev, pager, next"
                    :total="totalCount" @size-change="handleSizeChange" @current-change="handlePageChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProductList, getProductCategories } from '../../api/product';
import { formatPrice } from '../../utils/format';
import { ShoppingBag, Search, View } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const productList = ref([]);
const categories = ref([]);
const activeCategory = ref('全部');
const activeSort = ref('default');
const currentPage = ref(1);
const pageSize = ref(12);
const totalCount = ref(0);
const keyword = ref('');

const fetchCategories = async () => {
    try {
        const res = await getProductCategories();
        categories.value = res.data;
    } catch (error) {
        console.error('获取分类失败:', error);
    }
};

const fetchProducts = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            pageSize: pageSize.value,
            sort: activeSort.value
        };
        if (activeCategory.value !== '全部') params.category = activeCategory.value;
        if (keyword.value.trim()) params.keyword = keyword.value.trim();
        const res = await getProductList(params);
        productList.value = res.data.list;
        totalCount.value = res.data.total;
    } catch (error) {
        console.error('获取商品失败:', error);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    currentPage.value = 1;
    fetchProducts();
};

const handleCategoryChange = (cat) => {
    activeCategory.value = cat;
    currentPage.value = 1;
    fetchProducts();
};

const handleSortChange = () => {
    currentPage.value = 1;
    fetchProducts();
};

const handleSizeChange = (s) => {
    pageSize.value = s;
    currentPage.value = 1;
    fetchProducts();
};

const handlePageChange = (p) => {
    currentPage.value = p;
    fetchProducts();
    window.scrollTo({ top: 400, behavior: 'smooth' });
};

const openDetail = (product) => {
    router.push(`/products/${product.id}`);
};

onMounted(() => {
    fetchCategories();
    fetchProducts();
});
</script>

<style scoped>
.products-page {
    background: #f5f6f8;
    min-height: 100vh;
}

/* ==================== Hero（保持原来风格） ==================== */
.products-hero {
    position: relative;
    padding: 50px 20px;
    text-align: center;
    overflow: hidden;
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
}

@media (min-width: 768px) {
    .products-hero {
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
    background: #F472B6;
    top: -40px;
    left: 10%;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 130px;
    height: 130px;
    background: #FCD34D;
    bottom: -30px;
    right: 10%;
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
    display: inline-block;
    padding: 4px 18px;
    background: linear-gradient(135deg, #F472B6, #FCD34D);
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
    margin: 0 0 20px;
}

@media (min-width: 768px) {
    .hero-desc {
        font-size: 15px;
        margin-bottom: 24px;
    }
}

/* 搜索框 */
.hero-search {
    display: flex;
    max-width: 440px;
    margin: 0 auto;
    background: #fff;
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.06);
}

.search-input {
    flex: 1;
    border: none;
    padding: 12px 24px;
    font-size: 14px;
    outline: none;
    color: #333;
    background: transparent;
}

@media (min-width: 768px) {
    .search-input {
        padding: 14px 24px;
    }
}

.search-input::placeholder {
    color: #ccc;
}

.search-btn {
    padding: 0 20px;
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    color: #999;
}

.search-btn:hover {
    background: #f5f5f5;
}

/* ==================== 内容区 ==================== */
.products-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 16px 60px;
}

@media (min-width: 768px) {
    .products-section {
        padding: 24px 24px 80px;
    }
}

/* ==================== 筛选栏 ==================== */
.filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #f0f0f0;
    flex-wrap: wrap;
}

.filter-categories {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
}

.filter-categories::-webkit-scrollbar {
    display: none;
}

.cat-tag {
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    flex-shrink: 0;
}

.cat-tag:hover {
    color: #1a1a2e;
    background: #f5f5f5;
}

.cat-tag.active {
    color: #fff;
    background: linear-gradient(135deg, #F472B6, #FCD34D);
    font-weight: 700;
}

.filter-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

.result-count {
    font-size: 12px;
    color: #999;
    white-space: nowrap;
}

@media (max-width: 640px) {
    .filter-bar {
        flex-direction: column;
        align-items: flex-start;
    }

    .filter-right {
        width: 100%;
        justify-content: space-between;
    }
}

/* ==================== 商品网格 ==================== */
.products-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
}

@media (min-width: 640px) {
    .products-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
}

@media (min-width: 1024px) {
    .products-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }
}

/* ==================== 商品卡片 ==================== */
.product-card {
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0;
    animation: fadeUp 0.5s ease forwards;
    position: relative;
}

.product-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
    border-color: transparent;
}

.product-card.sold-out {
    opacity: 0.7;
}

.product-card.sold-out:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

/* 标签 */
.card-tags {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 3;
    display: flex;
    gap: 6px;
}

.tag-new,
.tag-hot,
.tag-sold-out {
    padding: 3px 10px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 10px;
    color: #fff;
}

.tag-new {
    background: linear-gradient(135deg, #F472B6, #FCD34D);
}

.tag-hot {
    background: linear-gradient(135deg, #FF6B6B, #ee5a24);
}

.tag-sold-out {
    background: #999;
}

/* 封面 */
.card-cover {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    background: #f8f8f8;
}

.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.product-card:hover .cover-img {
    transform: scale(1.06);
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fafafa, #f0f0f0);
    color: #ddd;
}

/* 售罄遮罩 */
.sold-out-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
}

.sold-out-text {
    padding: 8px 24px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 24px;
    font-size: 14px;
    font-weight: 800;
    color: #666;
}

/* hover 遮罩 */
.card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.product-card:hover .card-overlay {
    opacity: 1;
}

.view-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 24px;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 30px;
    font-size: 13px;
    font-weight: 700;
    color: #1a1a2e;
    backdrop-filter: blur(8px);
}

/* 信息区 */
.card-info {
    padding: 14px;
}

@media (min-width: 768px) {
    .card-info {
        padding: 16px;
    }
}

.card-category {
    font-size: 10px;
    color: #F472B6;
    font-weight: 600;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.card-name {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .card-name {
        font-size: 15px;
    }
}

.card-desc {
    font-size: 12px;
    color: #999;
    margin: 0 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
}

.card-price {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.price-symbol {
    font-size: 13px;
    font-weight: 800;
    color: #FF6B6B;
}

.price-current {
    font-size: 20px;
    font-weight: 900;
    color: #FF6B6B;
    line-height: 1;
}

@media (min-width: 768px) {
    .price-current {
        font-size: 22px;
    }
}

.price-original {
    font-size: 11px;
    color: #ccc;
    text-decoration: line-through;
    margin-left: 4px;
}

.card-sales {
    font-size: 11px;
    color: #bbb;
    flex-shrink: 0;
}

/* ==================== 骨架屏 ==================== */
.skeleton-card {
    animation: none !important;
    opacity: 1 !important;
}

.skeleton-cover {
    aspect-ratio: 1;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-body {
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.skeleton-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
    width: 30%;
}

.skeleton-line.medium {
    width: 60%;
}

.skeleton-line.long {
    width: 90%;
}

.skeleton-price {
    width: 50%;
    height: 22px;
    border-radius: 6px;
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

/* ==================== 分页 ==================== */
.pagination-box {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    padding-bottom: 20px;
}

.pagination-box :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
}

/* ==================== 动画 ==================== */
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>