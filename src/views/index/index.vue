<template>
    <div class="home-page">

        <!-- 1. 全屏轮播图 -->
        <HomeBanner />

        <!-- 2. 分类快捷导航条 -->
        <section class="quick-nav">
            <div class="nav-inner">
                <div class="nav-scroll">
                    <div class="nav-item" :class="{ active: !activeCategoryId }"
                        @click="activeCategoryId = null; fetchLatestByCategory()">
                        全部
                    </div>
                    <div v-for="cat in categoryList" :key="cat.id" class="nav-item"
                        :class="{ active: activeCategoryId === cat.id }"
                        @click="activeCategoryId = cat.id; fetchLatestByCategory()">
                        {{ cat.name }}
                    </div>
                </div>
            </div>
        </section>

        <!-- 3. 热门文章（大图轮播卡片区） -->
        <section class="section section-featured">
            <div class="section-inner">
                <div class="section-header">
                    <h2 class="section-title">
                        <span class="title-icon">🔥</span> 热门推荐
                    </h2>
                    <span class="section-more" @click="router.push('/articles')">查看更多 →</span>
                </div>
                <div class="featured-grid">
                    <div v-for="(article, index) in hotArticles.slice(0, 4)" :key="article.id" class="featured-card"
                        :class="['fc-' + index]" :style="{ animationDelay: index * 0.1 + 's' }"
                        @click="goToArticle(article.id)">
                        <div class="fc-cover">
                            <img v-if="article.cover" :src="article.cover" class="fc-img" />
                            <div class="fc-placeholder" v-else>
                                {{ article.title?.charAt(0) }}
                            </div>
                            <div class="fc-overlay"></div>
                        </div>
                        <div class="fc-content">
                            <div class="fc-meta">
                                <span class="fc-category" v-if="article.category_name">{{ article.category_name
                                }}</span>
                            </div>
                            <h3 class="fc-title">{{ article.title }}</h3>
                            <div class="fc-footer">
                                <span class="fc-author">{{ article.author_name }}</span>
                                <span class="fc-views">👁 {{ article.view_count }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. 主内容区（双栏布局） -->
        <section class="section section-main">
            <div class="section-inner">
                <div class="main-layout">

                    <!-- 左侧：文章列表 -->
                    <div class="main-left">
                        <div class="section-header left-align">
                            <h2 class="section-title">
                                <span class="title-icon">📰</span> 最新发布
                            </h2>
                        </div>

                        <div v-for="(article, index) in latestArticles" :key="article.id" class="article-card"
                            :style="{ animationDelay: index * 0.06 + 's' }" @click="goToArticle(article.id)">
                            <div class="ac-cover" v-if="article.cover">
                                <img :src="article.cover" class="ac-img" />
                            </div>
                            <div class="ac-content">
                                <div class="ac-top">
                                    <span class="ac-category" v-if="article.category_name">{{ article.category_name
                                    }}</span>
                                    <span class="ac-time">{{ formatTime(article.create_time) }}</span>
                                </div>
                                <h3 class="ac-title">{{ article.title }}</h3>
                                <p class="ac-desc">{{ article.description }}</p>
                                <div class="ac-footer">
                                    <div class="ac-author">
                                        <div class="ac-author-avatar">{{ article.author_name?.charAt(0) }}</div>
                                        <span>{{ article.author_name }}</span>
                                    </div>
                                    <div class="ac-stats">
                                        <span>👁 {{ article.view_count }}</span>
                                        <span>👍 {{ article.like_count || 0 }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="load-more" v-if="latestArticles.length > 0">
                            <button class="load-more-btn" @click="router.push('/articles')">
                                查看全部文章
                            </button>
                        </div>

                        <el-empty v-if="latestArticles.length === 0" description="暂无文章" />
                    </div>

                    <!-- 右侧：侧边栏 -->
                    <div class="main-right">
                        <!-- 站点统计 -->
                        <div class="sidebar-card">
                            <div class="sidebar-header">
                                <span class="sidebar-title">📊 站点概览</span>
                            </div>
                            <div class="stat-grid">
                                <div class="stat-box">
                                    <span class="stat-num">{{ siteStats.articles }}</span>
                                    <span class="stat-label">文章</span>
                                </div>
                                <div class="stat-box">
                                    <span class="stat-num">{{ siteStats.categories }}</span>
                                    <span class="stat-label">分类</span>
                                </div>
                                <div class="stat-box">
                                    <span class="stat-num">{{ siteStats.tags }}</span>
                                    <span class="stat-label">标签</span>
                                </div>
                                <div class="stat-box">
                                    <span class="stat-num">{{ siteStats.comments }}</span>
                                    <span class="stat-label">评论</span>
                                </div>
                            </div>
                        </div>

                        <!-- 阅读排行 -->
                        <div class="sidebar-card">
                            <div class="sidebar-header">
                                <span class="sidebar-title">🏆 阅读排行</span>
                            </div>
                            <div class="rank-list">
                                <div v-for="(article, index) in rankArticles" :key="article.id" class="rank-item"
                                    @click="goToArticle(article.id)">
                                    <div class="rank-index" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                                    <div class="rank-info">
                                        <h4 class="rank-title">{{ article.title }}</h4>
                                        <span class="rank-views">👁 {{ article.view_count }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 标签云 -->
                        <div class="sidebar-card">
                            <div class="sidebar-header">
                                <span class="sidebar-title">🏷️ 热门标签</span>
                            </div>
                            <div class="sidebar-tags">
                                <span v-for="(tag, index) in tagList" :key="tag.id" class="sidebar-tag"
                                    :class="'stag-' + (index % 4)" @click="goToTag(tag.id)">
                                    {{ tag.name }}
                                </span>
                            </div>
                        </div>

                        <!-- 最新评论 -->
                        <div class="sidebar-card">
                            <div class="sidebar-header">
                                <span class="sidebar-title">💬 最新评论</span>
                            </div>
                            <div class="sidebar-comments">
                                <div v-for="comment in latestComments" :key="comment.id" class="sb-comment"
                                    @click="goToArticle(comment.article_id)">
                                    <div class="sb-comment-avatar">
                                        {{ comment.user_name?.charAt(0) || 'U' }}
                                    </div>
                                    <div class="sb-comment-body">
                                        <div class="sb-comment-user">{{ comment.user_name }}</div>
                                        <p class="sb-comment-text">{{ comment.content }}</p>
                                    </div>
                                </div>
                                <el-empty v-if="latestComments.length === 0" description="暂无评论" :image-size="60" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>

    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import HomeBanner from '../../components/HomeBanner.vue';
import request from '../../api/request';
import { getHotArticles, getLatestArticles, getRecommendArticles } from '../../api/article';
import { getLatestComments } from '../../api/comment';

const router = useRouter();

const categoryList = ref([]);
const tagList = ref([]);
const hotArticles = ref([]);
const latestArticles = ref([]);
const rankArticles = ref([]);
const latestComments = ref([]);
const activeCategoryId = ref(null);

const siteStats = reactive({
    articles: 0,
    categories: 0,
    tags: 0,
    comments: 0
});

// 获取分类列表
const fetchCategories = async () => {
    try {
        const res = await request.get('/category');
        categoryList.value = res.data;
        siteStats.categories = res.data.length;
    } catch (error) {
        console.error('获取分类失败:', error);
    }
};

// 获取标签列表
const fetchTags = async () => {
    try {
        const res = await request.get('/tag');
        tagList.value = res.data;
        siteStats.tags = res.data.length;
    } catch (error) {
        console.error('获取标签失败:', error);
    }
};

// 获取推荐文章（热门推荐区）
const fetchHotArticles = async () => {
    try {
        const res = await getRecommendArticles(5);
        hotArticles.value = res.data;
    } catch (error) {
        console.error('获取推荐文章失败:', error);
    }
};

// 获取最新文章
const fetchLatest = async () => {
    try {
        const res = await getLatestArticles(10);
        latestArticles.value = res.data;
    } catch (error) {
        console.error('获取最新文章失败:', error);
    }
};

// 按分类筛选文章
const fetchLatestByCategory = async () => {
    try {
        const params = { pageSize: 10 };
        if (activeCategoryId.value) {
            params.category_id = activeCategoryId.value;
        }
        const res = await request.get('/article', { params });
        latestArticles.value = res.data.list;
        siteStats.articles = res.data.total;
    } catch (error) {
        console.error('获取文章失败:', error);
    }
};

// 获取排行文章（侧边栏阅读排行）
const fetchRank = async () => {
    try {
        const res = await getHotArticles(8);
        rankArticles.value = res.data;
    } catch (error) {
        console.error('获取排行失败:', error);
    }
};

// 获取最新评论
const fetchComments = async () => {
    try {
        const res = await getLatestComments(5);
        latestComments.value = res.data;
    } catch (error) {
        console.error('获取最新评论失败:', error);
    }
};

// 获取站点统计
const fetchStats = async () => {
    try {
        const res = await request.get('/article', { params: { pageSize: 1 } });
        siteStats.articles = res.data.total;
    } catch (error) {
        console.error('获取统计失败:', error);
    }
};

const goToArticle = (id) => {
    router.push(`/article/${id}`);
};

const goToTag = (id) => {
    router.push({ path: '/articles', query: { tag_id: id } });
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString();
};

onMounted(() => {
    fetchCategories();
    fetchTags();
    fetchLatest();
    fetchRank();
    fetchComments();
    fetchStats();
    fetchHotArticles();
});
</script>

<style scoped>
.home-page {
    background: #f5f6f8;
}

/* ==================== 分类快捷导航条 ==================== */
.quick-nav {
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 64px;
    z-index: 100;
}

.nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.nav-scroll {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
    padding: 12px 0;
    scrollbar-width: none;
}

.nav-scroll::-webkit-scrollbar {
    display: none;
}

.nav-item {
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    border-radius: 20px;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-item:hover {
    color: #1a1a2e;
    background: #f5f5f5;
}

.nav-item.active {
    color: #fff;
    background: #1a1a2e;
    font-weight: 600;
}

/* ==================== 通用区块 ==================== */
.section {
    padding: 40px 0;
}

.section-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
}

.section-header.left-align {
    justify-content: flex-start;
}

.section-title {
    font-size: 20px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-icon {
    font-size: 20px;
}

.section-more {
    font-size: 13px;
    color: #999;
    cursor: pointer;
    transition: color 0.3s;
}

.section-more:hover {
    color: #1a1a2e;
}

/* ==================== 热门推荐（4宫格） ==================== */
.section-featured {
    background: #fff;
    padding-top: 30px;
}

.featured-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 16px;
    height: 440px;
}

.featured-card {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s ease;
    opacity: 0;
    animation: fadeInUp 0.5s ease forwards;
}

.featured-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
}

.fc-0 {
    grid-row: 1 / 3;
}

.fc-cover {
    position: absolute;
    inset: 0;
}

.fc-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
}

.featured-card:hover .fc-img {
    transform: scale(1.05);
}

.fc-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.5);
}

.fc-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.05) 60%, transparent 100%);
}

.fc-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 24px;
    z-index: 2;
}

.fc-meta {
    margin-bottom: 8px;
}

.fc-category {
    display: inline-block;
    padding: 3px 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    color: #fff;
}

.fc-title {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    margin: 0 0 8px;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.fc-0 .fc-title {
    font-size: 24px;
}

.fc-footer {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
}

.fc-author {
    font-weight: 600;
}

/* ==================== 主内容双栏布局 ==================== */
.section-main {
    padding-top: 20px;
    padding-bottom: 60px;
}

.main-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    align-items: start;
}

/* ==================== 左侧文章列表 ==================== */
.main-left {
    min-width: 0;
}

.article-card {
    display: flex;
    gap: 18px;
    background: #fff;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.03);
    opacity: 0;
    animation: fadeInUp 0.5s ease forwards;
}

.article-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
}

.ac-cover {
    width: 200px;
    height: 135px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
}

.ac-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.article-card:hover .ac-img {
    transform: scale(1.06);
}

.ac-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.ac-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
}

.ac-category {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
    background: #f0f0ff;
    color: #667eea;
}

.ac-time {
    font-size: 12px;
    color: #ccc;
}

.ac-title {
    font-size: 17px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 6px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ac-desc {
    font-size: 13px;
    color: #999;
    margin: 0;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.ac-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
}

.ac-author {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #666;
    font-weight: 500;
}

.ac-author-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
}

.ac-stats {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: #ccc;
}

.load-more {
    text-align: center;
    margin-top: 30px;
}

.load-more-btn {
    padding: 12px 40px;
    background: #fff;
    color: #1a1a2e;
    border: 1px solid #e0e0e0;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.load-more-btn:hover {
    background: #1a1a2e;
    color: #fff;
    border-color: #1a1a2e;
}

/* ==================== 右侧边栏 ==================== */
.main-right {
    position: sticky;
    top: 130px;
}

.sidebar-card {
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 18px;
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.sidebar-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;
}

.sidebar-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
}

.stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.stat-box {
    text-align: center;
    padding: 14px 8px;
    background: #fafbff;
    border-radius: 10px;
}

.stat-num {
    display: block;
    font-size: 24px;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-label {
    font-size: 12px;
    color: #999;
}

.rank-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.rank-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    padding: 8px 0;
    border-bottom: 1px solid #f8f8f8;
    transition: all 0.2s;
}

.rank-item:last-child {
    border-bottom: none;
}

.rank-item:hover {
    padding-left: 4px;
}

.rank-index {
    min-width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    color: #fff;
    background: #ccc;
    flex-shrink: 0;
}

.rank-1 {
    background: #FF6B6B;
}

.rank-2 {
    background: #FF9F43;
}

.rank-3 {
    background: #FECA57;
}

.rank-info {
    flex: 1;
    min-width: 0;
}

.rank-title {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    margin: 0 0 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.rank-views {
    font-size: 11px;
    color: #ccc;
}

.sidebar-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.sidebar-tag {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.sidebar-tag:hover {
    transform: translateY(-2px);
}

.stag-0 {
    background: #f0f0ff;
    color: #667eea;
}

.stag-0:hover {
    background: #e0e0ff;
}

.stag-1 {
    background: #e8faf8;
    color: #38B2AC;
}

.stag-1:hover {
    background: #d0f5f0;
}

.stag-2 {
    background: #fff0f0;
    color: #FF6B6B;
}

.stag-2:hover {
    background: #ffe0e0;
}

.stag-3 {
    background: #fffbf0;
    color: #D97706;
}

.stag-3:hover {
    background: #fff3d0;
}

.sidebar-comments {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.sb-comment {
    display: flex;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f8f8f8;
    cursor: pointer;
    transition: all 0.2s;
}

.sb-comment:last-child {
    border-bottom: none;
}

.sb-comment:hover {
    padding-left: 4px;
}

.sb-comment-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
}

.sb-comment-body {
    flex: 1;
    min-width: 0;
}

.sb-comment-user {
    font-size: 12px;
    font-weight: 700;
    color: #333;
    margin-bottom: 2px;
}

.sb-comment-text {
    font-size: 13px;
    color: #666;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ==================== 动画 ==================== */
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

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
    .main-layout {
        grid-template-columns: 1fr;
    }

    .main-right {
        position: static;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .featured-grid {
        grid-template-columns: 1fr 1fr;
        height: auto;
    }

    .fc-0 {
        grid-row: auto;
    }

    .featured-card {
        min-height: 200px;
    }
}

@media (max-width: 768px) {
    .featured-grid {
        grid-template-columns: 1fr;
        height: auto;
    }

    .featured-card {
        min-height: 220px;
    }

    .fc-0 .fc-title {
        font-size: 18px;
    }

    .main-right {
        grid-template-columns: 1fr;
    }

    .article-card {
        flex-direction: column;
    }

    .ac-cover {
        width: 100%;
        height: 180px;
    }
}
</style>