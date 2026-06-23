<template>
    <div class="detail-container" v-loading="loading">
        <el-backtop />

        <!-- 文章卡片 -->
        <div class="article-card" v-if="article">
            <!-- 封面图 -->
            <div class="cover-wrapper" v-if="article.cover">
                <el-image :src="article.cover" fit="cover" class="detail-cover" />
                <div class="cover-overlay"></div>
            </div>

            <!-- 文章头部信息 -->
            <div class="article-header">
                <div class="category-badge" v-if="article.category_name">
                    {{ article.category_name }}
                </div>
                <h1 class="article-title">{{ article.title }}</h1>
                <p class="article-summary" v-if="article.description">{{ article.description }}</p>
                <div class="article-meta">
                    <div class="meta-author">
                        <el-avatar :size="36" :src="article.author_avatar" class="author-avatar">
                            {{ article.author_name?.charAt(0) }}
                        </el-avatar>
                        <div class="author-info">
                            <span class="author-name">{{ article.author_name }}</span>
                            <span class="publish-time">发布于 {{ formatTime(article.create_time) }}</span>
                        </div>
                    </div>
                    <div class="meta-stats">
                        <span class="stat-item">
                            <el-icon>
                                <View />
                            </el-icon> {{ article.view_count }}
                        </span>
                        <span class="stat-item">
                            <el-icon>
                                <ChatDotRound />
                            </el-icon> {{ commentList.length }}
                        </span>
                    </div>
                </div>
                <!-- 标签 -->
                <div class="tag-list" v-if="article.tag_names && article.tag_names.length">
                    <el-tag v-for="(name, index) in article.tag_names" :key="index" size="small" effect="plain" round
                        class="tag-item">
                        {{ name }}
                    </el-tag>
                </div>
            </div>

            <!-- 文章正文 -->
            <div class="article-content">
                <div class="inner-html" v-html="article.content"></div>
            </div>

            <!-- 文章底部：点赞区域 -->
            <div class="article-footer">
                <div class="like-section">
                    <button class="like-btn" :class="{ liked: isLiked }" @click="handleLike">
                        <span class="like-icon-wrapper">
                            <span class="like-icon">{{ isLiked ? '❤️' : '🤍' }}</span>
                            <span class="like-ripple" v-if="justLiked"></span>
                        </span>
                        <span class="like-text">{{ isLiked ? '已点赞' : '点赞' }}</span>
                        <span class="like-count">{{ likeCount }}</span>
                    </button>
                </div>
            </div>
        </div>

        <el-empty v-else-if="!loading" description="文章去外太空了..." />

        <!-- 评论区 -->
        <div class="comment-section">
            <div class="comment-header">
                <span class="comment-title">💬 评论互动</span>
                <span class="comment-count">{{ commentList.length }} 条</span>
            </div>

            <!-- 已登录：显示评论输入框 -->
            <div class="comment-input-box" v-if="userStore.isLoggedIn">
                <el-avatar :size="36" :src="userStore.userInfo?.avatar" class="input-avatar">
                    {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
                </el-avatar>
                <div class="input-area">
                    <el-input v-model="submitForm.content" type="textarea" :rows="3" placeholder="标新立异，留下你的神评..."
                        maxlength="200" show-word-limit />
                    <div class="submit-btn-wrapper">
                        <el-button type="primary" size="small" round @click="addComment(null, null)">发表评论</el-button>
                    </div>
                </div>
            </div>

            <!-- 未登录：显示登录提示 -->
            <div class="login-tip" v-else>
                <p>
                    请先
                    <el-button type="primary" link @click="router.push('/login')">登录</el-button>
                    后发表评论
                </p>
            </div>

            <!-- 评论列表 -->
            <div class="comment-list" v-loading="commentLoading">
                <el-empty v-if="commentList.length === 0" description="沙发还在，快来抢沙发！" />

                <div v-for="item in commentList" :key="item.id" class="comment-item">
                    <el-avatar :size="40" :src="item.user_avatar" class="comment-avatar">
                        {{ item.user_name?.charAt(0) }}
                    </el-avatar>
                    <div class="comment-body">
                        <div class="user-meta">
                            <span class="username">{{ item.user_name }}</span>
                            <span class="time">{{ formatCommentTime(item.create_time) }}</span>
                        </div>
                        <p class="content">{{ item.content }}</p>
                        <div class="actions">
                            <el-button type="primary" link size="small"
                                @click="showReplyBox(item.id, item.user_id)">回复</el-button>
                        </div>

                        <div class="replies-wrapper" v-if="item.replies && item.replies.length > 0">
                            <div v-for="reply in item.replies" :key="reply.id" class="reply-item">
                                <el-avatar :size="28" :src="reply.user_avatar" class="reply-avatar">
                                    {{ reply.user_name?.charAt(0) }}
                                </el-avatar>
                                <div class="reply-body">
                                    <div class="user-meta">
                                        <span class="username">{{ reply.user_name }}</span>
                                        <span class="reply-text">回复</span>
                                        <span class="target-username">@{{ reply.reply_to_user_name }}</span>
                                        <span class="time">{{ formatCommentTime(reply.create_time) }}</span>
                                    </div>
                                    <p class="content">{{ reply.content }}</p>
                                    <div class="actions">
                                        <el-button type="primary" link size="small"
                                            @click="showReplyBox(item.id, reply.user_id)">回复</el-button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="reply-input-box" v-if="activeReplyId === item.id">
                            <el-input v-model="submitForm.replyContent" type="textarea" :rows="2"
                                :placeholder="`回复 @${replyTargetName}...`" />
                            <div class="reply-btns">
                                <el-button size="small" @click="cancelReply">取消</el-button>
                                <el-button type="primary" size="small" round
                                    @click="addComment(item.id, replyTargetUserId)">提交回复</el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../../api/request';
import { getLikeStatus, toggleLike } from '../../api/article';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const article = ref(null);

// 点赞相关
const isLiked = ref(false);
const likeCount = ref(0);
const justLiked = ref(false);

const fetchArticleDetail = async () => {
    loading.value = true;
    try {
        const articleId = route.params.id;
        const res = await request.get(`/article/${articleId}`);
        article.value = res.data;
        likeCount.value = res.data.like_count || 0;
    } catch (error) {
        console.error('获取文章详情失败:', error);
    } finally {
        loading.value = false;
    }
};

const fetchLikeStatus = async () => {
    if (!userStore.isLoggedIn) return;
    try {
        const res = await getLikeStatus(route.params.id);
        isLiked.value = res.data.liked;
        likeCount.value = res.data.like_count;
    } catch (error) {
        console.error('获取点赞状态失败:', error);
    }
};

const handleLike = async () => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录后再点赞');
        router.push('/login');
        return;
    }
    try {
        const res = await toggleLike(route.params.id);
        isLiked.value = res.data.liked;
        likeCount.value = res.data.like_count;

        if (res.data.liked) {
            justLiked.value = true;
            setTimeout(() => { justLiked.value = false; }, 600);
        }

        ElMessage.success(res.data.liked ? '点赞成功！' : '已取消点赞');
    } catch (error) {
        console.error('点赞失败:', error);
    }
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleString();
};

// 评论相关
const commentLoading = ref(false);
const commentList = ref([]);

const activeReplyId = ref(null);
const replyTargetUserId = ref(null);
const replyTargetName = ref('');

const submitForm = reactive({
    content: '',
    replyContent: ''
});

const loadComments = async () => {
    commentLoading.value = true;
    try {
        const articleId = route.params.id;
        const res = await request.get(`/comment/${articleId}`);
        commentList.value = res.data;
    } catch (error) {
        console.error('加载评论失败:', error);
    } finally {
        commentLoading.value = false;
    }
};

onMounted(() => {
    fetchArticleDetail();
    loadComments();
    fetchLikeStatus();
});

const showReplyBox = (parentId, toUserId) => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录后再发表真知灼见！');
        router.push('/login');
        return;
    }
    activeReplyId.value = parentId;
    replyTargetUserId.value = toUserId;
    submitForm.replyContent = '';
    replyTargetName.value = '该用户';
};

const cancelReply = () => {
    activeReplyId.value = null;
    replyTargetUserId.value = null;
    submitForm.replyContent = '';
};

const addComment = async (parentId = null, toUserId = null) => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录后再发表评论！');
        router.push('/login');
        return;
    }

    const isReply = parentId !== null;
    const contentText = isReply ? submitForm.replyContent : submitForm.content;

    if (!contentText.trim()) {
        ElMessage.warning('内容不能为空哦！');
        return;
    }

    try {
        const payload = {
            article_id: route.params.id,
            content: contentText,
            parent_id: parentId,
            reply_to_user_id: toUserId
        };

        await request.post('/comment', payload);
        ElMessage.success(isReply ? '回复成功！' : '评论发表成功！');

        if (isReply) {
            cancelReply();
        } else {
            submitForm.content = '';
        }
        await loadComments();
    } catch (error) {
        console.error('提交失败:', error);
    }
};

const formatCommentTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleString();
};
</script>

<style scoped>
.detail-container {
    max-width: 860px;
    margin: 40px auto;
    padding: 0 16px;
}

/* ==================== 文章卡片 ==================== */
.article-card {
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

/* 封面 */
.cover-wrapper {
    position: relative;
    max-height: 380px;
    overflow: hidden;
}

.detail-cover {
    width: 100%;
    display: block;
}

.cover-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(transparent, rgba(255, 255, 255, 0.9));
}

/* 文章头部 */
.article-header {
    padding: 32px 40px 24px;
}

.category-badge {
    display: inline-block;
    padding: 4px 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    border-radius: 20px;
    margin-bottom: 16px;
    letter-spacing: 1px;
}

.article-title {
    font-size: 32px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 12px;
    line-height: 1.3;
}

.article-summary {
    font-size: 15px;
    color: #888;
    margin: 0 0 24px;
    line-height: 1.6;
    padding-left: 16px;
    border-left: 3px solid #667eea;
}

.article-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.meta-author {
    display: flex;
    align-items: center;
    gap: 12px;
}

.author-avatar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-weight: 700;
}

.author-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.author-name {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
}

.publish-time {
    font-size: 12px;
    color: #bbb;
}

.meta-stats {
    display: flex;
    gap: 18px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #999;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.tag-item {
    border-radius: 20px;
}

/* 文章正文 */
.article-content {
    padding: 0 40px 30px;
    font-size: 16px;
    color: #333;
    line-height: 1.9;
    letter-spacing: 0.3px;
}

.inner-html {
    white-space: pre-wrap;
}

/* ==================== 文章底部点赞 ==================== */
.article-footer {
    padding: 0 40px 36px;
}

.like-section {
    display: flex;
    justify-content: center;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
}

.like-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 36px;
    background: #fafafa;
    border: 2px solid #eee;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 15px;
}

.like-btn:hover {
    border-color: #FF6B6B;
    background: #fff5f5;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.15);
}

.like-btn.liked {
    background: linear-gradient(135deg, #fff0f0, #ffe8e8);
    border-color: #FF6B6B;
}

.like-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.like-icon {
    font-size: 22px;
    transition: transform 0.3s ease;
}

.like-btn:active .like-icon {
    transform: scale(1.4);
}

/* 点赞涟漪动画 */
.like-ripple {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 107, 107, 0.2);
    animation: rippleAnim 0.6s ease-out forwards;
    pointer-events: none;
}

@keyframes rippleAnim {
    0% {
        transform: scale(0.5);
        opacity: 1;
    }

    100% {
        transform: scale(2);
        opacity: 0;
    }
}

.like-text {
    font-weight: 600;
    color: #555;
}

.like-btn.liked .like-text {
    color: #FF6B6B;
}

.like-count {
    font-weight: 800;
    color: #333;
    min-width: 20px;
    text-align: center;
}

.like-btn.liked .like-count {
    color: #FF6B6B;
}

/* ==================== 评论区 ==================== */
.comment-section {
    background: #fff;
    border-radius: 18px;
    padding: 32px 40px;
    margin-top: 20px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
}

.comment-title {
    font-size: 20px;
    font-weight: 800;
    color: #1a1a2e;
}

.comment-count {
    font-size: 13px;
    color: #999;
    padding: 3px 12px;
    background: #f5f5f5;
    border-radius: 20px;
}

/* 评论输入框 */
.comment-input-box {
    display: flex;
    gap: 14px;
    margin-bottom: 24px;
}

.input-avatar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-weight: 700;
    flex-shrink: 0;
}

.input-area {
    flex: 1;
}

.submit-btn-wrapper {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
}

.login-tip {
    text-align: center;
    padding: 24px;
    background: #fafafa;
    border-radius: 12px;
    margin-bottom: 24px;
    color: #999;
    font-size: 14px;
}

.login-tip p {
    margin: 0;
}

/* 评论列表 */
.comment-list {
    min-height: 100px;
}

.comment-item {
    display: flex;
    gap: 14px;
    margin-bottom: 28px;
}

.comment-avatar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-weight: 700;
    flex-shrink: 0;
}

.comment-body {
    flex: 1;
    min-width: 0;
}

.user-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
}

.username {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
}

.reply-text {
    font-size: 12px;
    color: #ccc;
}

.target-username {
    font-size: 14px;
    color: #667eea;
    font-weight: 600;
}

.time {
    font-size: 12px;
    color: #ccc;
}

.content {
    font-size: 14px;
    color: #444;
    line-height: 1.7;
    margin: 6px 0;
}

.actions {
    margin-top: 4px;
}

/* 回复区域 */
.replies-wrapper {
    background: #f9f9fb;
    padding: 16px;
    border-radius: 12px;
    margin-top: 14px;
}

.reply-item {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
}

.reply-item:last-child {
    margin-bottom: 0;
}

.reply-avatar {
    background: linear-gradient(135deg, #4ECDC4, #44B09E);
    color: #fff;
    font-weight: 700;
    flex-shrink: 0;
}

.reply-body {
    flex: 1;
    min-width: 0;
}

/* 回复输入框 */
.reply-input-box {
    margin-top: 16px;
    background: #fafafa;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid #f0f0f0;
}

.reply-btns {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {

    .article-header,
    .article-content,
    .article-footer {
        padding-left: 20px;
        padding-right: 20px;
    }

    .comment-section {
        padding: 24px 20px;
    }

    .article-title {
        font-size: 24px;
    }

    .article-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .meta-stats {
        width: 100%;
    }
}
</style>