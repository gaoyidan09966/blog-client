<template>
    <section class="section section-featured">
        <div class="section-inner">
            <div class="section-header">
                <h2 class="section-title">
                    <el-icon>
                        <Star />
                    </el-icon> 热门推荐
                </h2>
                <span class="section-more" @click="$emit('viewMore')">查看更多 →</span>
            </div>
            <div class="featured-grid">
                <div v-for="(article, index) in articles.slice(0, 4)" :key="article.id" class="featured-card"
                    :class="['fc-' + index]" :style="{ animationDelay: index * 0.1 + 's' }"
                    @click="$emit('goArticle', article.id)">
                    <div class="fc-cover">
                        <img v-if="article.cover" :src="article.cover" class="fc-img" />
                        <div class="fc-placeholder" v-else>{{ article.title?.charAt(0) }}</div>
                        <div class="fc-overlay"></div>
                    </div>
                    <div class="fc-content">
                        <div class="fc-meta">
                            <span class="fc-category" v-if="article.category_name">{{ article.category_name }}</span>
                        </div>
                        <h3 class="fc-title">{{ article.title }}</h3>
                        <div class="fc-footer">
                            <span class="fc-author">{{ article.author_name }}</span>
                            <span class="fc-views">
                                <el-icon>
                                    <View />
                                </el-icon>
                                {{ article.view_count }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
defineProps({
    articles: {
        type: Array,
        default: () => []
    }
});

defineEmits(['goArticle', 'viewMore']);
</script>

<style scoped>
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

.section-title {
    font-size: 20px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
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

.fc-views {
    display: flex;
    align-items: center;
    gap: 3px;
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

@media (max-width: 1024px) {
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
}
</style>