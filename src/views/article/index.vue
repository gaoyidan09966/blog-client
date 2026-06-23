<template>
    <div class="detail-container" v-loading="loading">
        <el-backtop />

        <!-- 阅读进度条 -->
        <ReadingProgress />

        <!-- 文章目录（PC 端右侧固定） -->
        <ArticleToc :headings="tocHeadings" />

        <!-- 文章主体 -->
        <template v-if="article">
            <ArticleHero :article="article" :comment-count="commentCount" />

            <div class="article-card">
                <ArticleContent :content="article.content" @headings-ready="onHeadingsReady" />

                <div class="article-footer">
                    <LikeButton :article-id="articleId" :initial-liked="isLiked" :initial-count="likeCount"
                        :is-logged-in="userStore.isLoggedIn" @need-login="goToLogin" ref="likeRef" />
                </div>
            </div>

            <!-- 上下篇导航 -->
            <ArticleNav :prev="prevArticle" :next="nextArticle" @navigate="goToArticle" />

            <!-- 评论区 -->
            <CommentSection :article-id="articleId" :is-logged-in="userStore.isLoggedIn"
                :user-avatar="userStore.userInfo?.avatar" :user-name="userStore.userInfo?.nickname"
                @need-login="goToLogin" @comment-added="onCommentAdded" ref="commentRef" />
        </template>

        <el-empty v-else-if="!loading" description="文章去外太空了..." />
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../../api/request';
import { getLikeStatus } from '../../api/article';
import { useUserStore } from '../../stores/user';

import ReadingProgress from '../../components/article/ReadingProgress.vue';
import ArticleHero from '../../components/article/ArticleHero.vue';
import ArticleContent from '../../components/article/ArticleContent.vue';
import LikeButton from '../../components/article/LikeButton.vue';
import CommentSection from '../../components/article/CommentSection.vue';
import ArticleToc from '../../components/article/ArticleToc.vue';
import ArticleNav from '../../components/article/ArticleNav.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const article = ref(null);
const isLiked = ref(false);
const likeCount = ref(0);
const commentCount = ref(0);
const tocHeadings = ref([]);
const prevArticle = ref(null);
const nextArticle = ref(null);
const likeRef = ref(null);
const commentRef = ref(null);

const articleId = ref(route.params.id);

const fetchArticleDetail = async () => {
    loading.value = true;
    try {
        const res = await request.get(`/article/${articleId.value}`);
        article.value = res.data;
        likeCount.value = res.data.like_count || 0;
        commentCount.value = res.data.comment_count || 0;

        // 获取上下篇
        fetchNavArticles();
    } catch (error) {
        console.error('获取文章详情失败:', error);
    } finally {
        loading.value = false;
    }
};

const fetchLikeStatus = async () => {
    if (!userStore.isLoggedIn) return;
    try {
        const res = await getLikeStatus(articleId.value);
        isLiked.value = res.data.liked;
        likeCount.value = res.data.like_count;
        if (likeRef.value) {
            likeRef.value.updateLike(res.data.liked, res.data.like_count);
        }
    } catch (error) {
        console.error('获取点赞状态失败:', error);
    }
};

const fetchNavArticles = async () => {
    try {
        const res = await request.get(`/article/${articleId.value}/nav`);
        prevArticle.value = res.data.prev;
        nextArticle.value = res.data.next;
    } catch (error) {
        // 接口可能不存在，静默失败
    }
};

const onHeadingsReady = (headings) => {
    tocHeadings.value = headings;
};

const onCommentAdded = (count) => {
    commentCount.value = count;
};

const goToLogin = () => {
    router.push('/login');
};

const goToArticle = (id) => {
    router.push(`/article/${id}`);
    nextTick(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

onMounted(() => {
    fetchArticleDetail();
    fetchLikeStatus();
    if (commentRef.value) {
        commentRef.value.loadComments();
    }
});
</script>

<style scoped>
.detail-container {
    max-width: 860px;
    margin: 40px auto;
    padding: 0 16px;
}

.article-card {
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.article-footer {
    padding: 0 40px 36px;
}

@media (max-width: 768px) {
    .detail-container {
        margin: 16px auto;
    }

    .article-footer {
        padding: 0 20px 24px;
    }
}
</style>