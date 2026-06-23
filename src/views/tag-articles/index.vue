<template>
    <div class="tag-articles-container">
        <!-- 标签头部区域 -->
        <div class="tag-hero">
            <div class="hero-content">
                <el-tag effect="dark" size="large" round class="hero-tag"># {{ tagName }}</el-tag>
                <h1 class="hero-title">{{ tagName }} 相关文章</h1>
                <p class="hero-desc">探索「{{ tagName }}」领域的所有精选内容，共 {{ articleList.length }} 篇文章</p>
            </div>
        </div>

        <!-- 文章列表 -->
        <div class="section-block">
            <div class="section-title">
                <span class="title-bar"></span>
                <span>文章列表</span>
            </div>

            <div class="article-list" v-loading="loading">
                <div v-for="(article, index) in articleList" :key="article.id" class="article-card"
                    :style="{ animationDelay: index * 0.08 + 's' }" @click="goToDetail(article.id)">
                    <div class="article-cover-wrapper" v-if="article.cover">
                        <el-image :src="article.cover" fit="cover" class="article-cover">
                            <template #error>
                                <div class="cover-placeholder">暂无封面</div>
                            </template>
                        </el-image>
                    </div>
                    <div class="article-body">
                        <div class="article-top">
                            <span class="article-category" v-if="article.category_name">{{ article.category_name
                                }}</span>
                            <span class="article-time">{{ formatTime(article.create_time) }}</span>
                        </div>
                        <h3 class="article-title">{{ article.title }}</h3>
                        <p class="article-desc" v-if="article.description">{{ article.description }}</p>
                        <div class="article-footer">
                            <div class="author-info">
                                <span>{{ article.author_name }}</span>
                            </div>
                            <div class="article-stats">
                                <span>{{ article.view_count }} 次阅读</span>
                            </div>
                        </div>
                    </div>
                </div>

                <el-empty v-if="!loading && articleList.length === 0" description="该标签下暂无文章" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTagDetail, getArticlesByTag } from '../../api/tag';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const tagName = ref('');
const articleList = ref([]);

const fetchData = async () => {
    const tagId = route.params.id;
    loading.value = true;
    try {
        const [tagRes, articleRes] = await Promise.all([
            getTagDetail(tagId),
            getArticlesByTag(tagId)
        ]);
        tagName.value = tagRes.data.name;
        articleList.value = articleRes.data;
    } catch (error) {
        console.error('获取数据失败:', error);
    } finally {
        loading.value = false;
    }
};

const goToDetail = (id) => {
    router.push(`/article/${id}`);
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleString();
};

onMounted(() => {
    fetchData();
});

watch(() => route.params.id, () => {
    fetchData();
});
</script>

<style scoped>
.tag-articles-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px 60px;
}

/* ========== 头部区域 ========== */
.tag-hero {
    padding: 50px 0 40px;
    text-align: center;
    position: relative;
}

.tag-hero::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: #1a1a1a;
    border-radius: 2px;
}

.hero-tag {
    margin-bottom: 16px;
    font-size: 14px;
}

.hero-title {
    font-size: 32px;
    color: #1a1a1a;
    margin: 12px 0 10px;
    font-weight: 700;
}

.hero-desc {
    color: #8c8c8c;
    font-size: 15px;
}

/* ========== 通用区块 ========== */
.section-block {
    margin-top: 40px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 24px;
}

.title-bar {
    width: 4px;
    height: 22px;
    background: #1a1a1a;
    border-radius: 2px;
}

/* ========== 文章卡片 ========== */
.article-card {
    display: flex;
    background: #fff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    margin-bottom: 18px;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
    opacity: 0;
    transform: translateY(15px);
    animation: fadeInUp 0.5s ease forwards;
}

.article-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.1);
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.article-cover-wrapper {
    width: 220px;
    min-height: 160px;
    flex-shrink: 0;
}

.article-cover {
    width: 100%;
    height: 100%;
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f5f7fa;
    color: #909399;
    font-size: 13px;
}

.article-body {
    flex: 1;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.article-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
}

.article-category {
    font-size: 12px;
    color: #fff;
    background: #1a1a1a;
    padding: 2px 10px;
    border-radius: 20px;
}

.article-time {
    font-size: 12px;
    color: #b0b0b0;
}

.article-title {
    font-size: 18px;
    color: #1a1a1a;
    margin: 0 0 8px;
    font-weight: 600;
    line-height: 1.4;
}

.article-desc {
    font-size: 14px;
    color: #666;
    margin: 0 0 12px;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.article-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    color: #999;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
    .article-card {
        flex-direction: column;
    }

    .article-cover-wrapper {
        width: 100%;
        min-height: 140px;
        max-height: 180px;
    }
}
</style>