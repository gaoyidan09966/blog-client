<template>
    <div class="main-left">
        <!-- 头部标题 -->
        <div class="section-header">
            <h2 class="section-title">
                <el-icon>
                    <Document />
                </el-icon>
                最新发布
            </h2>
        </div>

        <!-- 文章列表 -->
        <div v-for="(article, index) in articles" :key="article.id" class="article-card"
            :style="{ animationDelay: index * 0.08 + 's' }" @click="$emit('goArticle', article.id)">

            <!-- 封面图 -->
            <div class="ac-cover" v-if="article.cover">
                <img :src="article.cover" class="ac-img" loading="lazy" />
            </div>

            <!-- 内容区 -->
            <div class="ac-content">
                <!-- 分类与时间 -->
                <div class="ac-top">
                    <span class="ac-category" v-if="article.category_name">{{ article.category_name }}</span>
                    <span class="ac-time">{{ formatTime(article.create_time) }}</span>
                </div>

                <!-- 标题 -->
                <h3 class="ac-title">{{ article.title }}</h3>

                <!-- 描述 -->
                <p class="ac-desc">{{ article.description }}</p>

                <!-- 底部信息 -->
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

        <!-- 加载更多 / 空状态 -->
        <div class="load-more" v-if="articles.length > 0">
            <button class="load-more-btn" @click="$emit('viewMore')">查看全部文章</button>
        </div>

        <el-empty v-if="articles.length === 0" description="暂无文章" />
    </div>
</template>

<script setup>
// 保留原有逻辑不变
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
/* ==================== 全局与布局 ==================== */
.main-left {
    width: 100%;
    max-width: 100%;
    padding: 0 16px;
    box-sizing: border-box;
}

/* 头部样式 */
.section-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 28px;
    padding-top: 16px;
}

.section-title {
    font-size: 22px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

/* ==================== 核心卡片样式 (科技风重构) ==================== */
.article-card {
    display: flex;
    gap: 20px;

    /* 毛玻璃效果 */
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.6);

    /* 柔和阴影 */
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.12);

    padding: 20px;
    margin-bottom: 20px;
    cursor: pointer;

    /* 动画 */
    opacity: 0;
    animation: fadeInUp 0.6s ease forwards;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.article-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
    border-color: rgba(255, 255, 255, 0.9);
}

/* 封面图 */
.ac-cover {
    width: 220px;
    height: 150px;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.ac-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.article-card:hover .ac-img {
    transform: scale(1.05);
}

/* 内容区 */
.ac-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

/* 顶部元数据 */
.ac-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

/* 分类标签 (紫色渐变) */
.ac-category {
    font-size: 12px;
    font-weight: 600;
    padding: 5px 14px;
    border-radius: 20px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.ac-time {
    font-size: 13px;
    color: #94a3b8;
}

/* 标题 */
.ac-title {
    font-size: 19px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* 描述 */
.ac-desc {
    font-size: 14px;
    color: #64748b;
    margin: 0;
    line-height: 1.7;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

/* 底部 */
.ac-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.ac-author {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: #475569;
    font-weight: 500;
}

.ac-author-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #764ba2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ac-stats {
    display: flex;
    gap: 18px;
    font-size: 13px;
    color: #94a3b8;
}

.ac-stats span {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* 加载更多按钮 */
.load-more {
    text-align: center;
    margin-top: 40px;
    padding-bottom: 30px;
}

.load-more-btn {
    padding: 14px 48px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
}

.load-more-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

/* 动画定义 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ==================== 响应式设计 ==================== */

/* 平板设备 */
@media screen and (max-width: 1024px) {
    .ac-cover {
        width: 200px;
        height: 140px;
    }
}

/* 手机设备 (小于768px) */
@media screen and (max-width: 768px) {
    .main-left {
        padding: 0 12px;
    }

    .article-card {
        flex-direction: column;
        /* 垂直堆叠 */
        padding: 16px;
        gap: 14px;
        border-radius: 14px;
    }

    .ac-cover {
        width: 100%;
        height: 190px;
        /* 移动端图片更高 */
        border-radius: 10px;
    }

    .ac-title {
        font-size: 17px;
        -webkit-line-clamp: 2;
    }

    .ac-desc {
        font-size: 13px;
        -webkit-line-clamp: 2;
    }

    .ac-footer {
        margin-top: 12px;
    }
}

/* 超小屏幕手机 */
@media screen and (max-width: 480px) {
    .article-card {
        padding: 14px;
    }

    .ac-cover {
        height: 170px;
    }

    .ac-title {
        font-size: 16px;
    }

    .ac-stats {
        gap: 12px;
        font-size: 12px;
    }
}

/* 触摸设备优化 (去除Hover效果，改为Active点击反馈) */
@media (hover: none) and (pointer: coarse) {
    .article-card:hover {
        transform: none;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.12);
    }

    .article-card:active {
        transform: scale(0.98);
        transition: transform 0.1s;
    }

    .load-more-btn:hover {
        transform: none;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
    }

    .load-more-btn:active {
        transform: scale(0.98);
        background: linear-gradient(90deg, #5a6fd8 0%, #6a3f9e 100%);
    }
}
</style>