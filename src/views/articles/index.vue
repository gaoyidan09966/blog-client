<template>
    <div class="page-container">
        <!-- Hero 区域 -->
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
                        <Document />
                    </el-icon>
                    ARTICLES
                </div>
                <h1 class="hero-title">全部文章</h1>
                <p class="hero-subtitle">在文字的世界里，探索无限可能，分享经验与见解。</p>
                <div class="hero-stats" v-if="!loading && totalCount > 0">
                    <div class="stat-pill">
                        <span class="stat-num">{{ totalCount }}</span>
                        <span class="stat-text">篇文章</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 筛选提示 -->
        <div class="filter-tip" v-if="currentCategory || currentTag">
            <div class="filter-text">
                <span v-if="currentCategory">分类：<strong>{{ currentCategory }}</strong></span>
                <span v-if="currentCategory && currentTag" class="filter-dot">·</span>
                <span v-if="currentTag">标签：<strong>{{ currentTag }}</strong></span>
            </div>
            <el-button type="primary" link size="small" @click="clearFilter">
                <el-icon>
                    <Close />
                </el-icon> 清除
            </el-button>
        </div>

        <!-- 加载骨架屏 -->
        <div v-if="loading" class="article-list">
            <div v-for="i in 3" :key="i" class="article-card skeleton-card">
                <div class="card-cover">
                    <div class="skeleton-cover"></div>
                </div>
                <div class="card-body">
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line long"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="card-bottom">
                        <div class="skeleton-line short"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else-if="articles.length === 0" description="空空如也，快去后台写第一篇文章吧！" />

        <!-- 文章列表 -->
        <div v-else class="article-list">
            <div v-for="(item, index) in articles" :key="item.id" class="article-card"
                :style="{ animationDelay: index * 0.06 + 's' }" @click="goToDetail(item.id)">
                <div class="card-cover">
                    <el-image v-if="item.cover" :src="item.cover" fit="cover" class="cover-img" lazy />
                    <div v-else class="cover-placeholder">
                        {{ item.category_name?.charAt(0) || item.title?.charAt(0) || 'B' }}
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-top">
                        <span class="card-category" v-if="item.category_name">{{ item.category_name }}</span>
                        <span class="card-time">{{ formatDate(item.create_time) }}</span>
                    </div>
                    <h3 class="card-title">{{ item.title }}</h3>
                    <p class="card-desc">{{ item.description || '暂无摘要...' }}</p>
                    <div class="card-bottom">
                        <div class="card-author">
                            <div class="author-dot">{{ item.author_name?.charAt(0) || 'U' }}</div>
                            <span class="author-name">{{ item.author_name || '孤勇者' }}</span>
                        </div>
                        <div class="card-stats">
                            <span class="stat"><el-icon>
                                    <View />
                                </el-icon>{{ item.view_count || 0 }}</span>
                            <span class="stat"><el-icon>
                                    <Pointer />
                                </el-icon>{{ item.like_count || 0 }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-box" v-if="totalCount > pageSize">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[6, 10, 20, 50]"
                :pager-count="5" layout="total, sizes, prev, pager, next" :total="totalCount"
                @size-change="handleSizeChange" @current-change="handlePageChange" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../../api/request';
import { formatDate } from '../../utils/format';
import { Close } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const articles = ref([]);
const currentCategory = ref('');
const currentTag = ref('');
const currentPage = ref(1);
const pageSize = ref(6);
const totalCount = ref(0);

const fetchCategoryName = async (id) => {
    if (!id) { currentCategory.value = ''; return; }
    try {
        const res = await request.get(`/category/${id}`);
        currentCategory.value = res.data.name;
    } catch { currentCategory.value = '未知分类'; }
};

const fetchTagName = async (id) => {
    if (!id) { currentTag.value = ''; return; }
    try {
        const res = await request.get(`/tag/${id}`);
        currentTag.value = res.data.name;
    } catch { currentTag.value = '未知标签'; }
};

const fetchAllArticles = async () => {
    loading.value = true;
    try {
        const params = { page: currentPage.value, pageSize: pageSize.value };
        if (route.query.category_id) params.category_id = route.query.category_id;
        if (route.query.tag_id) params.tag_id = route.query.tag_id;
        const res = await request.get('/article', { params });
        articles.value = res.data.list || res.data;
        totalCount.value = res.data.total || 0;
    } catch (e) {
        console.error('拉取文章失败:', e);
    } finally {
        loading.value = false;
    }
};

const clearFilter = () => router.push('/articles');
const goToDetail = (id) => router.push(`/article/${id}`);

const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchAllArticles();
};

const handlePageChange = (page) => {
    currentPage.value = page;
    fetchAllArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
    if (route.query.category_id) fetchCategoryName(route.query.category_id);
    if (route.query.tag_id) fetchTagName(route.query.tag_id);
    fetchAllArticles();
});

watch(() => route.query, (q) => {
    currentPage.value = 1;
    q.category_id ? fetchCategoryName(q.category_id) : (currentCategory.value = '');
    q.tag_id ? fetchTagName(q.tag_id) : (currentTag.value = '');
    fetchAllArticles();
}, { deep: true });
</script>

<style scoped>
.page-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 16px 16px 40px;
}

@media (min-width: 768px) {
    .page-container {
        padding: 30px 20px 60px;
    }
}

/* ==================== HERO ==================== */
.page-header {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%);
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
    background: #4ECDC4;
    top: -40px;
    left: -20px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 120px;
    height: 120px;
    background: #34D399;
    bottom: -30px;
    right: -20px;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

.orb-3 {
    width: 80px;
    height: 80px;
    background: #667eea;
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
    background: linear-gradient(135deg, #4ECDC4, #34D399);
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
    background: linear-gradient(135deg, #1a1a2e 0%, #4ECDC4 50%, #34D399 100%);
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
    margin: 0 0 20px;
    line-height: 1.5;
}

@media (min-width: 768px) {
    .hero-subtitle {
        font-size: 15px;
        margin-bottom: 24px;
    }
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
    .stat-pill {
        padding: 10px 24px;
    }
}

.stat-num {
    font-size: 20px;
    font-weight: 900;
    background: linear-gradient(135deg, #4ECDC4, #34D399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (min-width: 768px) {
    .stat-num {
        font-size: 24px;
    }
}

.stat-text {
    font-size: 12px;
    color: #999;
}

/* ==================== 筛选提示 ==================== */
.filter-tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #f0fdf4;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 13px;
    color: #4a4a4a;
    border: 1px solid rgba(78, 205, 196, 0.15);
}

.filter-text {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    overflow: hidden;
}

.filter-dot {
    color: #ccc;
}

.filter-tip strong {
    color: #1a1a2e;
}

/* ==================== 文章列表 ==================== */
.article-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* ==================== 文章卡片 ==================== */
.article-card {
    display: flex;
    flex-direction: row;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards;
}

.article-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.card-cover {
    width: 120px;
    height: 110px;
    flex-shrink: 0;
    overflow: hidden;
}

.cover-img {
    width: 100%;
    height: 100%;
    display: block;
    transition: transform 0.5s ease;
}

.article-card:hover .cover-img {
    transform: scale(1.06);
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #4ECDC4, #34D399);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.5);
}

.card-body {
    flex: 1;
    min-width: 0;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.card-category {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
    background: #ecfdf5;
    color: #4ECDC4;
    white-space: nowrap;
    flex-shrink: 0;
}

.card-time {
    font-size: 11px;
    color: #bbb;
    white-space: nowrap;
    flex-shrink: 0;
}

.card-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-desc {
    font-size: 12px;
    color: #999;
    margin: 0;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
}

.card-author {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
}

.author-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4ECDC4, #34D399);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
}

.author-name {
    font-size: 12px;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-stats {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
}

.stat {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 11px;
    color: #ccc;
}

/* ==================== 平板及以上 ==================== */
@media (min-width: 768px) {
    .article-card {
        border-radius: 14px;
    }

    .card-cover {
        width: 200px;
        height: 140px;
    }

    .cover-placeholder {
        font-size: 36px;
    }

    .card-body {
        padding: 18px 20px;
    }

    .card-title {
        font-size: 17px;
        white-space: nowrap;
    }

    .card-desc {
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .card-category {
        font-size: 11px;
        padding: 3px 10px;
    }

    .card-time {
        font-size: 12px;
    }

    .author-dot {
        width: 24px;
        height: 24px;
        font-size: 11px;
    }

    .author-name {
        font-size: 13px;
    }

    .stat {
        font-size: 12px;
    }

    .card-bottom {
        margin-top: 8px;
    }
}

/* ==================== 骨架屏 ==================== */
.skeleton-card {
    animation: none !important;
    opacity: 1 !important;
}

.skeleton-cover {
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
    width: 35%;
}

.skeleton-line.medium {
    width: 55%;
}

.skeleton-line.long {
    width: 85%;
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