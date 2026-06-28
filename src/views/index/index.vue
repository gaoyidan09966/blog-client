<template>
    <div class="home-page">
        <!-- 1. 轮播图 -->
        <HomeBanner />

        <!-- 2. 分类导航 -->
        <QuickNav :categories="categoryList" :active-id="activeCategoryId" @change="handleCategoryChange" />

        <!-- 3. 热门推荐 -->
        <FeaturedGrid :articles="hotArticles" @go-article="goToArticle" @view-more="router.push('/articles')" />

        <!-- 4. 主内容区 -->
        <section class="section section-main">
            <div class="section-inner">
                <div class="main-layout">
                    <!-- 左侧文章列表 -->
                    <LatestArticles :articles="latestArticles" @go-article="goToArticle"
                        @view-more="router.push('/articles')" />

                    <!-- 右侧边栏 -->
                    <div class="main-right">
                        <SidebarStats :stats="siteStats" />
                        <SidebarRank :articles="rankArticles" @go-article="goToArticle" />
                        <SidebarTags :tags="tagList" @go-tag="goToTag" />
                        <SidebarComments :comments="latestComments" @go-article="goToArticle" />
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../../api/request';
import { getRecommendArticles, getLatestArticles, getHotArticles } from '../../api/article';
import { getLatestComments } from '../../api/comment';

import HomeBanner from '../../components/HomeBanner.vue';
import QuickNav from '../../components/home/QuickNav.vue';
import FeaturedGrid from '../../components/home/FeaturedGrid.vue';
import LatestArticles from '../../components/home/LatestArticles.vue';
import SidebarStats from '../../components/home/SidebarStats.vue';
import SidebarRank from '../../components/home/SidebarRank.vue';
import SidebarTags from '../../components/home/SidebarTags.vue';
import SidebarComments from '../../components/home/SidebarComments.vue';

const router = useRouter();

// 数据
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

// 获取数据
const fetchCategories = async () => {
    try {
        const res = await request.get('/category');
        categoryList.value = res.data;
        siteStats.categories = res.data.length;
    } catch (error) { console.error('获取分类失败:', error); }
};

const fetchTags = async () => {
    try {
        const res = await request.get('/tag');
        tagList.value = res.data;
        siteStats.tags = res.data.length;
    } catch (error) { console.error('获取标签失败:', error); }
};

const fetchHotArticles = async () => {
    try {
        const res = await getRecommendArticles(5);
        hotArticles.value = res.data;
    } catch (error) { console.error('获取推荐文章失败:', error); }
};

const fetchLatest = async () => {
    try {
        const res = await getLatestArticles(10);
        latestArticles.value = res.data;
    } catch (error) { console.error('获取最新文章失败:', error); }
};

const fetchLatestByCategory = async () => {
    try {
        const params = { pageSize: 10 };
        if (activeCategoryId.value) params.category_id = activeCategoryId.value;
        const res = await request.get('/article', { params });
        latestArticles.value = res.data.list;
        siteStats.articles = res.data.total;
    } catch (error) { console.error('获取文章失败:', error); }
};

const fetchRank = async () => {
    try {
        const res = await getHotArticles(8);
        rankArticles.value = res.data;
    } catch (error) { console.error('获取排行失败:', error); }
};

const fetchComments = async () => {
    try {
        const res = await getLatestComments(5);
        latestComments.value = res.data;
    } catch (error) { console.error('获取评论失败:', error); }
};

const fetchStats = async () => {
    try {
        const res = await request.get('/article', { params: { pageSize: 1 } });
        siteStats.articles = res.data.total;
    } catch (error) { console.error('获取统计失败:', error); }
};

// 事件处理
const handleCategoryChange = (id) => {
    activeCategoryId.value = id;
    fetchLatestByCategory();
};

const goToArticle = (id) => router.push(`/article/${id}`);
const goToTag = (id) => router.push({ path: '/articles', query: { tag_id: id } });

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
    min-height: 100vh;
    background-color: #f5f7fa;
}

.section {
    padding: 24px 0;
}

.section-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

/* 主布局 - 桌面端 */
.main-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
}

/* 左侧文章列表区域 */
.main-layout> :first-child {
    flex: 1;
    min-width: 0;
    /* 防止flex子项溢出 */
}

/* 右侧边栏 */
.main-right {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 移动端适配 */
@media screen and (max-width: 992px) {
    .main-layout {
        flex-direction: column;
    }

    .main-right {
        width: 100%;
        margin-top: 24px;
    }
}

@media screen and (max-width: 768px) {
    .section {
        padding: 16px 0;
    }

    .section-inner {
        padding: 0 12px;
    }

    .main-layout {
        gap: 16px;
    }

    .main-right {
        gap: 16px;
        margin-top: 16px;
    }
}

/* 小屏幕手机优化 */
@media screen and (max-width: 480px) {
    .section-inner {
        padding: 0 8px;
    }

    .main-right {
        gap: 12px;
    }
}
</style>