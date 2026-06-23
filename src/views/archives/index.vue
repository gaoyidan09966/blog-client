<template>
    <div class="page-container">
        <!-- Hero 区域 -->
        <div class="page-header">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-orb orb-3"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">
                    <el-icon>
                        <Clock />
                    </el-icon>
                    ARCHIVE
                </div>
                <h1 class="hero-title">时光归档</h1>
                <p class="hero-subtitle">好记性不如烂笔头。回望来时路，方知岁月长。</p>
                <div class="hero-stats">
                    <div class="stat-pill">
                        <span class="stat-num">{{ total }}</span>
                        <span class="stat-text">篇文章</span>
                    </div>
                    <div class="stat-pill" v-if="archives.length > 0">
                        <span class="stat-num">{{ archives.length }}</span>
                        <span class="stat-text">个月</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 加载骨架 -->
        <div v-if="loading" class="skeleton-timeline">
            <div v-for="i in 3" :key="i" class="skeleton-group">
                <div class="skeleton-header">
                    <div class="skeleton-circle-sm"></div>
                    <div class="skeleton-line" style="width: 120px;"></div>
                </div>
                <div class="skeleton-items">
                    <div v-for="j in 3" :key="j" class="skeleton-item">
                        <div class="skeleton-dot"></div>
                        <div class="skeleton-card"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else-if="archives.length === 0" description="暂无文章归档..." />

        <!-- 归档时间线 -->
        <div v-else class="archives-list">
            <div v-for="(group, index) in archives" :key="group.year_month" class="year-group"
                :style="{ animationDelay: index * 0.1 + 's' }">
                <div class="year-header">
                    <div class="year-icon">
                        <el-icon>
                            <Calendar />
                        </el-icon>
                    </div>
                    <h3 class="year-title">{{ formatYearMonth(group.year_month) }}</h3>
                    <span class="year-count">{{ group.count }} 篇</span>
                </div>

                <div class="article-list">
                    <div v-for="(article, i) in group.articles" :key="article.id" class="archive-item"
                        :class="'theme-' + (i % 5)" :style="{ animationDelay: (index * 0.1 + i * 0.05) + 's' }"
                        @click="goToDetail(article.id)">
                        <div class="item-dot"></div>
                        <div class="item-line" v-if="i < group.articles.length - 1"></div>
                        <div class="item-body">
                            <span class="item-date">{{ formatDay(article.create_time) }}</span>
                            <span class="item-title">{{ article.title }}</span>
                        </div>
                        <el-icon class="item-arrow">
                            <ArrowRight />
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getArchives } from '../../api/archive';
import { ArrowRight, Calendar, Clock } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const total = ref(0);
const archives = ref([]);

const fetchArchives = async () => {
    loading.value = true;
    try {
        const res = await getArchives();
        total.value = res.data.total;
        archives.value = res.data.archives;
    } catch (error) {
        console.error('获取归档失败:', error);
    } finally {
        loading.value = false;
    }
};

const goToDetail = (id) => router.push(`/article/${id}`);

const formatYearMonth = (ym) => {
    if (!ym) return '';
    const [year, month] = ym.split('-');
    return `${year} 年 ${parseInt(month)} 月`;
};

const formatDay = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

onMounted(() => {
    fetchArchives();
});
</script>

<style scoped>
.page-container {
    max-width: 750px;
    margin: 0 auto;
    padding: 16px 16px 60px;
}

@media (min-width: 768px) {
    .page-container {
        padding: 30px 20px 80px;
    }
}

/* ==================== HERO ==================== */
.page-header {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 28px;
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.hero-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
}

.hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.4;
}

.orb-1 {
    width: 140px;
    height: 140px;
    background: #FF6B6B;
    top: -40px;
    left: -20px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 120px;
    height: 120px;
    background: #4ECDC4;
    bottom: -30px;
    right: -20px;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

.orb-3 {
    width: 80px;
    height: 80px;
    background: #A78BFA;
    top: 20%;
    right: 15%;
    animation: orbDrift 9s ease-in-out infinite 2s;
}

@media (min-width: 768px) {
    .page-header {
        border-radius: 28px;
        margin-bottom: 36px;
    }

    .orb-1 {
        width: 220px;
        height: 220px;
        top: -60px;
        left: -40px;
        filter: blur(70px);
        opacity: 0.5;
    }

    .orb-2 {
        width: 180px;
        height: 180px;
        bottom: -50px;
        right: -30px;
    }

    .orb-3 {
        width: 140px;
        height: 140px;
    }
}

@keyframes orbDrift {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    33% {
        transform: translate(20px, -15px) scale(1.05);
    }

    66% {
        transform: translate(-15px, 10px) scale(0.95);
    }
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 36px 20px;
}

@media (min-width: 768px) {
    .hero-content {
        padding: 50px 20px;
    }
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 16px;
    background: linear-gradient(135deg, #FF6B6B, #ee5a24);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    border-radius: 20px;
    letter-spacing: 3px;
    margin-bottom: 14px;
}

.hero-title {
    font-size: 30px;
    font-weight: 900;
    margin: 0 0 10px;
    background: linear-gradient(135deg, #1a1a2e 0%, #FF6B6B 50%, #4ECDC4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (min-width: 768px) {
    .hero-title {
        font-size: 44px;
    }
}

.hero-subtitle {
    color: #8888aa;
    font-size: 13px;
    margin: 0 0 20px;
    line-height: 1.5;
}

@media (min-width: 768px) {
    .hero-subtitle {
        font-size: 15px;
        margin-bottom: 24px;
    }
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

.stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
    .stat-pill {
        padding: 10px 24px;
    }
}

.stat-num {
    font-size: 20px;
    font-weight: 900;
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (min-width: 768px) {
    .stat-num {
        font-size: 24px;
    }
}

.stat-text {
    font-size: 12px;
    color: #999;
}

/* ==================== 归档列表 ==================== */
.archives-list {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.year-group {
    opacity: 0;
    animation: fadeUp 0.5s ease forwards;
}

.year-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 14px;
    border-bottom: 2px solid #f0f0f0;
    margin-bottom: 16px;
}

.year-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #f0f0ff;
    color: #667eea;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
}

.year-title {
    font-size: 18px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0;
    flex: 1;
}

@media (min-width: 768px) {
    .year-title {
        font-size: 20px;
    }
}

.year-count {
    font-size: 12px;
    color: #999;
    padding: 3px 10px;
    background: #f5f5f5;
    border-radius: 10px;
    flex-shrink: 0;
}

.article-list {
    display: flex;
    flex-direction: column;
    padding-left: 18px;
    position: relative;
}

@media (min-width: 768px) {
    .article-list {
        padding-left: 24px;
    }
}

.archive-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
    cursor: pointer;
    position: relative;
    opacity: 0;
    animation: fadeUp 0.4s ease forwards;
}

@media (min-width: 768px) {
    .archive-item {
        gap: 16px;
        padding: 14px 0;
    }
}

.item-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
    z-index: 2;
    transition: transform 0.2s;
}

.archive-item:hover .item-dot {
    transform: scale(1.3);
}

.item-line {
    position: absolute;
    left: -13px;
    top: 28px;
    bottom: -4px;
    width: 2px;
    background: #eee;
}

@media (min-width: 768px) {
    .item-line {
        left: -19px;
        top: 32px;
    }
}

.item-body {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

@media (max-width: 640px) {
    .item-body {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
    }
}

.item-date {
    font-size: 12px;
    color: #bbb;
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
}

.item-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .item-title {
        font-size: 16px;
    }
}

.item-arrow {
    font-size: 14px;
    color: #ddd;
    flex-shrink: 0;
    transition: all 0.2s;
}

.archive-item:hover .item-arrow {
    transform: translateX(3px);
}

/* ==================== 5 种主题 ==================== */

.theme-0 .item-dot {
    background: #FF6B6B;
}

.theme-0:hover .item-arrow {
    color: #FF6B6B;
}

.theme-0:hover .item-title {
    color: #FF6B6B;
}

.theme-1 .item-dot {
    background: #4ECDC4;
}

.theme-1:hover .item-arrow {
    color: #4ECDC4;
}

.theme-1:hover .item-title {
    color: #4ECDC4;
}

.theme-2 .item-dot {
    background: #A78BFA;
}

.theme-2:hover .item-arrow {
    color: #A78BFA;
}

.theme-2:hover .item-title {
    color: #A78BFA;
}

.theme-3 .item-dot {
    background: #F59E0B;
}

.theme-3:hover .item-arrow {
    color: #F59E0B;
}

.theme-3:hover .item-title {
    color: #F59E0B;
}

.theme-4 .item-dot {
    background: #667eea;
}

.theme-4:hover .item-arrow {
    color: #667eea;
}

.theme-4:hover .item-title {
    color: #667eea;
}

/* ==================== 骨架屏 ==================== */
.skeleton-timeline {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.skeleton-group {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.skeleton-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 14px;
    border-bottom: 2px solid #f0f0f0;
}

.skeleton-circle-sm {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-items {
    display: flex;
    flex-direction: column;
    padding-left: 18px;
}

.skeleton-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 0;
}

.skeleton-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    flex-shrink: 0;
}

.skeleton-card {
    flex: 1;
    height: 18px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* ==================== 入场动画 ==================== */
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>