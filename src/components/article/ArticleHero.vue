<template>
    <div class="article-card">
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
                        </el-icon> {{ commentCount }}
                    </span>
                    <span class="stat-item" v-if="readTime">
                        <el-icon>
                            <Clock />
                        </el-icon> {{ readTime }}
                    </span>
                </div>
            </div>
            <div class="tag-list" v-if="article.tag_names && article.tag_names.length">
                <el-tag v-for="(name, index) in article.tag_names" :key="index" size="small" effect="plain" round
                    class="tag-item">
                    {{ name }}
                </el-tag>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatTime } from '../../utils/format';

const props = defineProps({
    article: {
        type: Object,
        required: true
    },
    commentCount: {
        type: Number,
        default: 0
    }
});

const readTime = computed(() => {
    if (!props.article?.content) return '';
    const text = props.article.content.replace(/<[^>]+>/g, '');
    const words = text.length;
    const minutes = Math.ceil(words / 400);
    return `${minutes} 分钟阅读`;
});
</script>

<style scoped>
.article-card {
    background: #fff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

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

@media (max-width: 768px) {
    .cover-wrapper {
        max-height: 220px;
    }

    .article-header {
        padding: 20px;
    }

    .article-title {
        font-size: 22px;
    }

    .article-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
}
</style>