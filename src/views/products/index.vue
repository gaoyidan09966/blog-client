<template>
    <div class="products-page">
        <!-- Hero -->
        <div class="products-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">SHOP</div>
                <h1 class="hero-title">🛍️ 周边好物</h1>
                <p class="hero-desc">精选周边商品，找到你喜欢的那一款</p>
                <!-- 搜索框 -->
                <div class="hero-search">
                    <input type="text" v-model="keyword" placeholder="搜索商品名称..." class="search-input"
                        @keyup.enter="handleSearch" />
                    <button class="search-btn" @click="handleSearch">🔍</button>
                </div>
            </div>
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
            <div class="filter-inner">
                <div class="filter-left">
                    <div class="filter-categories">
                        <span v-for="cat in categories" :key="cat" class="cat-tag"
                            :class="{ active: activeCategory === cat }" @click="handleCategoryChange(cat)">
                            {{ cat }}
                        </span>
                    </div>
                    <span class="result-count" v-if="keyword">搜索「{{ keyword }}」找到 {{ totalCount }} 件商品</span>
                </div>
                <div class="filter-sort">
                    <el-select v-model="activeSort" size="default" style="width: 140px;" @change="handleSortChange">
                        <el-option label="综合推荐" value="default" />
                        <el-option label="最新上架" value="newest" />
                        <el-option label="销量优先" value="sales" />
                        <el-option label="价格低→高" value="price_asc" />
                        <el-option label="价格高→低" value="price_desc" />
                    </el-select>
                </div>
            </div>
        </div>

        <!-- 商品网格 -->
        <div class="products-section">
            <div class="products-grid">
                <div v-for="(product, index) in productList" :key="product.id" class="product-card"
                    :class="{ 'sold-out': product.stock <= 0 }" :style="{ animationDelay: index * 0.06 + 's' }"
                    @click="openDetail(product)">
                    <!-- 标签 -->
                    <div class="card-tags">
                        <span class="tag-new" v-if="product.is_new">新品</span>
                        <span class="tag-hot" v-if="product.is_hot">热销</span>
                        <span class="tag-sold-out" v-if="product.stock <= 0">售罄</span>
                    </div>
                    <!-- 封面 -->
                    <div class="card-cover">
                        <img v-if="product.cover" :src="product.cover" class="cover-img"
                            @error="(e) => e.target.style.display = 'none'" />
                        <div class="cover-placeholder" v-else>🛍️</div>
                        <!-- 售罄遮罩 -->
                        <div class="sold-out-overlay" v-if="product.stock <= 0">
                            <span class="sold-out-text">已售罄</span>
                        </div>
                        <div class="card-overlay" v-else>
                            <span class="view-btn">查看详情</span>
                        </div>
                    </div>
                    <!-- 信息 -->
                    <div class="card-info">
                        <div class="card-category" v-if="product.category">{{ product.category }}</div>
                        <h3 class="card-name">{{ product.name }}</h3>
                        <p class="card-desc">{{ product.description }}</p>
                        <div class="card-bottom">
                            <div class="card-price">
                                <span class="price-current">¥{{ formatPrice(product.price) }}</span>
                                <span class="price-original" v-if="product.original_price">¥{{
                                    formatPrice(product.original_price) }}</span>
                            </div>
                            <div class="card-sales" v-if="product.sales > 0">
                                已售 {{ product.sales }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <el-empty v-if="!loading && productList.length === 0" description="暂无商品" />

            <div class="pagination-wrapper" v-if="totalCount > 0">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[12, 24, 48]" layout="total, sizes, prev, pager, next" :total="totalCount"
                    @size-change="handleSizeChange" @current-change="handlePageChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProductList, getProductCategories } from '../../api/product';

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

const formatPrice = (price) => {
    const num = Number(price);
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

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
        if (activeCategory.value !== '全部') {
            params.category = activeCategory.value;
        }
        if (keyword.value.trim()) {
            params.keyword = keyword.value.trim();
        }
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
    window.scrollTo({ top: 500, behavior: 'smooth' });
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

/* Hero */
.products-hero {
    position: relative;
    padding: 60px 20px;
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
    width: 200px;
    height: 200px;
    background: #F472B6;
    top: -50px;
    left: 10%;
}

.orb-2 {
    width: 160px;
    height: 160px;
    background: #FCD34D;
    bottom: -40px;
    right: 10%;
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
    font-size: 34px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 8px;
}

.hero-desc {
    font-size: 15px;
    color: #999;
    margin: 0 0 24px;
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
    padding: 14px 24px;
    font-size: 14px;
    outline: none;
    color: #333;
    background: transparent;
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
}

.search-btn:hover {
    background: #f5f5f5;
}

/* 筛选栏 */
.filter-bar {
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 64px;
    z-index: 100;
}

.filter-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.filter-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.filter-categories {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.result-count {
    font-size: 12px;
    color: #999;
    white-space: nowrap;
}

.cat-tag {
    padding: 7px 18px;
    font-size: 13px;
    font-weight: 500;
    color: #666;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
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

/* 商品网格 */
.products-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.product-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0;
    animation: fadeInUp 0.5s ease forwards;
    position: relative;
}

.product-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
}

/* 售罄状态 */
.product-card.sold-out {
    opacity: 0.75;
}

.product-card.sold-out:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-tags {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 3;
    display: flex;
    gap: 6px;
}

.tag-new {
    padding: 3px 10px;
    background: linear-gradient(135deg, #F472B6, #FCD34D);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 12px;
}

.tag-hot {
    padding: 3px 10px;
    background: linear-gradient(135deg, #FF6B6B, #ee5a24);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 12px;
}

.tag-sold-out {
    padding: 3px 10px;
    background: #999;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 12px;
}

.card-cover {
    position: relative;
    height: 240px;
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
    font-size: 48px;
    background: linear-gradient(135deg, #fafafa, #f0f0f0);
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
    font-size: 15px;
    font-weight: 800;
    color: #666;
}

.card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
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
    padding: 10px 24px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 30px;
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
}

.card-info {
    padding: 16px;
}

.card-category {
    font-size: 11px;
    color: #F472B6;
    font-weight: 600;
    margin-bottom: 6px;
}

.card-name {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-desc {
    font-size: 12px;
    color: #999;
    margin: 0 0 12px;
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
    gap: 6px;
}

.price-current {
    font-size: 20px;
    font-weight: 900;
    color: #FF6B6B;
}

.price-original {
    font-size: 12px;
    color: #ccc;
    text-decoration: line-through;
}

.card-sales {
    font-size: 11px;
    color: #bbb;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding-bottom: 20px;
}

@media (max-width: 1024px) {
    .products-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .products-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .card-cover {
        height: 180px;
    }
}

@media (max-width: 480px) {
    .products-grid {
        grid-template-columns: 1fr;
    }

    .hero-title {
        font-size: 26px;
    }
}
</style>