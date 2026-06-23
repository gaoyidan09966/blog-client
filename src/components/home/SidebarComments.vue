<template>
    <SidebarCard title="最新评论">
        <template #icon>
            <el-icon>
                <ChatDotSquare />
            </el-icon>
        </template>
        <div class="sidebar-comments">
            <div v-for="comment in comments" :key="comment.id" class="sb-comment"
                @click="$emit('goArticle', comment.article_id)">
                <div class="sb-comment-avatar">
                    {{ comment.user_name?.charAt(0) || 'U' }}
                </div>
                <div class="sb-comment-body">
                    <div class="sb-comment-user">{{ comment.user_name }}</div>
                    <p class="sb-comment-text">{{ comment.content }}</p>
                </div>
            </div>
            <el-empty v-if="comments.length === 0" description="暂无评论" :image-size="60" />
        </div>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from './SidebarCard.vue';

defineProps({
    comments: {
        type: Array,
        default: () => []
    }
});

defineEmits(['goArticle']);
</script>

<style scoped>
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
</style>