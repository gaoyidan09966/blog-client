<template>
    <div class="like-section">
        <button class="like-btn" :class="{ liked: isLiked, animate: justLiked }" @click="handleLike">
            <svg class="heart-icon" viewBox="0 0 24 24" :fill="isLiked ? '#FF6B6B' : 'none'"
                :stroke="isLiked ? '#FF6B6B' : '#999'" stroke-width="2">
                <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span class="like-text">{{ isLiked ? '已点赞' : '点赞' }}</span>
            <span class="like-count">{{ likeCount }}</span>
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { toggleLike } from '../../api/article';

const props = defineProps({
    articleId: {
        type: [String, Number],
        required: true
    },
    initialLiked: {
        type: Boolean,
        default: false
    },
    initialCount: {
        type: Number,
        default: 0
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['needLogin']);

const isLiked = ref(props.initialLiked);
const likeCount = ref(props.initialCount);
const justLiked = ref(false);

const handleLike = async () => {
    if (!props.isLoggedIn) {
        emit('needLogin');
        return;
    }
    try {
        const res = await toggleLike(props.articleId);
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

const updateLike = (liked, count) => {
    isLiked.value = liked;
    likeCount.value = count;
};

defineExpose({ updateLike });
</script>

<style scoped>
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

.heart-icon {
    width: 24px;
    height: 24px;
    transition: transform 0.3s ease;
}

.like-btn.animate .heart-icon {
    animation: heartPop 0.4s ease;
}

@keyframes heartPop {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.4);
    }

    100% {
        transform: scale(1);
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
</style>