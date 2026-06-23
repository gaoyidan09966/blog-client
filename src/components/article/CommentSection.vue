<template>
    <div class="comment-section">
        <div class="comment-header">
            <span class="comment-title">
                <el-icon>
                    <ChatDotSquare />
                </el-icon>
                评论互动
            </span>
            <span class="comment-count">{{ comments.length }} 条</span>
        </div>

        <!-- 已登录：评论输入框 -->
        <div class="comment-input-box" v-if="isLoggedIn">
            <el-avatar :size="36" :src="userAvatar" class="input-avatar">
                {{ userName?.charAt(0) || 'U' }}
            </el-avatar>
            <div class="input-area">
                <el-input v-model="newContent" type="textarea" :rows="3" placeholder="标新立异，留下你的神评..." maxlength="200"
                    show-word-limit />
                <div class="submit-btn-wrapper">
                    <el-button type="primary" size="small" round :loading="submitting"
                        @click="submitComment(null, null)">
                        发表评论
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 未登录 -->
        <div class="login-tip" v-else>
            <p>请先 <el-button type="primary" link @click="$emit('needLogin')">登录</el-button> 后发表评论</p>
        </div>

        <!-- 评论列表 -->
        <div class="comment-list" v-loading="loading">
            <el-empty v-if="comments.length === 0" description="沙发还在，快来抢沙发！" />

            <div v-for="item in comments" :key="item.id" class="comment-item">
                <el-avatar :size="40" :src="item.user_avatar" class="comment-avatar">
                    {{ item.user_name?.charAt(0) }}
                </el-avatar>
                <div class="comment-body">
                    <div class="user-meta">
                        <span class="username">{{ item.user_name }}</span>
                        <span class="time">{{ formatTime(item.create_time) }}</span>
                    </div>
                    <p class="content">{{ item.content }}</p>
                    <div class="actions">
                        <el-button type="primary" link size="small"
                            @click="showReplyBox(item.id, item.user_id, item.user_name)">回复</el-button>
                    </div>

                    <!-- 回复列表 -->
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
                                    <span class="time">{{ formatTime(reply.create_time) }}</span>
                                </div>
                                <p class="content">{{ reply.content }}</p>
                                <div class="actions">
                                    <el-button type="primary" link size="small"
                                        @click="showReplyBox(item.id, reply.user_id, reply.user_name)">回复</el-button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 回复输入框 -->
                    <div class="reply-input-box" v-if="activeReplyId === item.id">
                        <el-input v-model="replyContent" type="textarea" :rows="2"
                            :placeholder="`回复 @${replyTargetName}...`" />
                        <div class="reply-btns">
                            <el-button size="small" @click="cancelReply">取消</el-button>
                            <el-button type="primary" size="small" round :loading="submitting"
                                @click="submitComment(item.id, replyTargetUserId)">提交回复</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import request from '../../api/request';
import { formatTime } from '../../utils/format';

const props = defineProps({
    articleId: {
        type: [String, Number],
        required: true
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    userAvatar: {
        type: String,
        default: ''
    },
    userName: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['needLogin', 'commentAdded']);

const loading = ref(false);
const submitting = ref(false);
const comments = ref([]);
const newContent = ref('');
const replyContent = ref('');
const activeReplyId = ref(null);
const replyTargetUserId = ref(null);
const replyTargetName = ref('');

const loadComments = async () => {
    loading.value = true;
    try {
        const res = await request.get(`/comment/${props.articleId}`);
        comments.value = res.data;
    } catch (error) {
        console.error('加载评论失败:', error);
    } finally {
        loading.value = false;
    }
};

const showReplyBox = (parentId, toUserId, toUserName) => {
    if (!props.isLoggedIn) {
        emit('needLogin');
        return;
    }
    activeReplyId.value = parentId;
    replyTargetUserId.value = toUserId;
    replyTargetName.value = toUserName || '该用户';
    replyContent.value = '';
};

const cancelReply = () => {
    activeReplyId.value = null;
    replyTargetUserId.value = null;
    replyContent.value = '';
};

const submitComment = async (parentId, toUserId) => {
    if (!props.isLoggedIn) {
        emit('needLogin');
        return;
    }

    const isReply = parentId !== null;
    const content = isReply ? replyContent.value : newContent.value;

    if (!content.trim()) {
        ElMessage.warning('内容不能为空哦！');
        return;
    }

    submitting.value = true;
    try {
        await request.post('/comment', {
            article_id: props.articleId,
            content: content,
            parent_id: parentId,
            reply_to_user_id: toUserId
        });

        ElMessage.success(isReply ? '回复成功！' : '评论发表成功！');

        if (isReply) {
            cancelReply();
        } else {
            newContent.value = '';
        }

        await loadComments();
        emit('commentAdded', comments.value.length);
    } catch (error) {
        console.error('提交失败:', error);
    } finally {
        submitting.value = false;
    }
};

defineExpose({ loadComments, commentCount: () => comments.value.length });
</script>

<style scoped>
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
    display: flex;
    align-items: center;
    gap: 8px;
}

.comment-count {
    font-size: 13px;
    color: #999;
    padding: 3px 12px;
    background: #f5f5f5;
    border-radius: 20px;
}

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
    flex-wrap: wrap;
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

@media (max-width: 768px) {
    .comment-section {
        padding: 20px 16px;
    }

    .comment-item {
        gap: 10px;
    }

    .comment-avatar {
        width: 32px !important;
        height: 32px !important;
    }

    .replies-wrapper {
        padding: 12px;
    }

    .reply-item {
        gap: 8px;
    }
}
</style>