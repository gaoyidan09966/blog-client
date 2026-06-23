<template>
    <div class="main-left">
        <div class="section-header">
            <h2 class="section-title">
                <el-icon>
                    <Document />
                </el-icon> 最新发布
            </h2>
        </div>

        <div v-for="(article, index) in articles" :key="article.id" class="article-card"
            :style="{ animationDelay: index * 0.06 + 's' }" @click="$emit('goArticle', article.id)">
            <div class="ac-cover" v-if="article.cover">
                <img :src="article.cover" class="ac-img" />
            </div>
            <div class="ac-content">
                <div class="ac-top">
                    <span class="ac-category" v-if="article.category_name">{{ article.category_name }}</span>
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
                        <span>
                            <el-icon>
                                <View />
                            </el-icon>
                            {{ article.view_count }}
                        </span>
                        <span>
                            <el-icon>
                                <Pointer />
                            </el-icon>
                            {{ article.like_count || 0 }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div class="load-more" v-if="articles.length > 0">
            <button class="load-more-btn" @click="$emit('viewMore')">查看全部文章</button>
        </div>

        <el-empty v-if="articles.length === 0" description="暂无文章" />
    </div>
</template>

<script setup>
import { formatTime } from '../../utils/format';

defineProps({
    articles: {
        type: Array,
        default: () => []
    }
});

defineEmits(['goArticle', 'viewMore']);
</script>

<style scoped>
.section-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 24px;
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

.ac-stats span {
    display: flex;
    align-items: center;
    gap: 3px;
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

@media (max-width: 768px) {
    .article-card {
        flex-direction: column;
    }

    .ac-cover {
        width: 100%;
        height: 180px;
    }
}
</style>