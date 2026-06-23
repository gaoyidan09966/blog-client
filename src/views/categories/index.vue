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
                        <Grid />
                    </el-icon>
                    CATEGORIES
                </div>
                <h1 class="hero-title">文章分类</h1>
                <p class="hero-subtitle">分门别类，构建最清晰的独立全栈知识图谱。</p>
                <div class="hero-stats" v-if="!loading && categories.length > 0">
                    <div class="stat-pill">
                        <span class="stat-num">{{ categories.length }}</span>
                        <span class="stat-text">个分类</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-num">{{ totalArticles }}</span>
                        <span class="stat-text">篇文章</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 加载骨架 -->
        <div v-if="loading" class="category-grid">
            <div v-for="i in 6" :key="i" class="category-card skeleton">
                <div class="skeleton-circle"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
            </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else-if="categories.length === 0" description="暂无分类数据..." />

        <!-- 分类网格 -->
        <div v-else class="category-grid">
            <div v-for="(item, index) in categories" :key="item.id" class="category-card"
                :class="'theme-' + (index % 5)" :style="{ animationDelay: index * 0.08 + 's' }"
                @click="handleCategoryClick(item.id)">
                <div class="card-stripe"></div>
                <div class="card-icon">
                    <el-icon :size="28">
                        <component :is="getIcon(index)" />
                    </el-icon>
                </div>
                <h3 class="card-name">{{ item.name }}</h3>
                <span class="card-count">{{ item.article_count || 0 }} 篇文章</span>
                <div class="card-bar">
                    <div class="bar-fill" :style="{ width: getPercent(item.article_count) + '%' }"></div>
                </div>
                <span class="card-action">查看文章 <el-icon>
                        <ArrowRight />
                    </el-icon></span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../../api/request';
import {
    FolderOpened,
    Collection,
    Notebook,
    Reading,
    Files,
    ArrowRight
} from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const categories = ref([]);

const icons = [FolderOpened, Collection, Notebook, Reading, Files];
const getIcon = (index) => icons[index % icons.length];

const totalArticles = computed(() => {
    return categories.value.reduce((sum, c) => sum + (c.article_count || 0), 0);
});

const maxCount = computed(() => {
    return Math.max(...categories.value.map(c => c.article_count || 0), 1);
});

const getPercent = (count) => {
    return Math.round(((count || 0) / maxCount.value) * 100);
};

const fetchCategories = async () => {
    loading.value = true;
    try {
        const res = await request.get('/category');
        categories.value = res.data;
    } catch (error) {
        console.error('获取分类失败:', error);
    } finally {
        loading.value = false;
    }
};

const handleCategoryClick = (id) => {
    router.push({ path: '/articles', query: { category_id: id } });
};

onMounted(() => {
    fetchCategories();
});
</script>

<style scoped>
.page-container {
    max-width: 900px;
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
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #fff7ed 100%);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
    .page-header {
        border-radius: 28px;
        margin-bottom: 36px;
    }
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
    background: #F59E0B;
    top: -40px;
    left: -20px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 120px;
    height: 120px;
    background: #FBBF24;
    bottom: -30px;
    right: -20px;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

.orb-3 {
    width: 80px;
    height: 80px;
    background: #FF6B6B;
    top: 20%;
    right: 15%;
    animation: orbDrift 9s ease-in-out infinite 2s;
}

@media (min-width: 768px) {
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
    background: linear-gradient(135deg, #F59E0B, #D97706);
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
    background: linear-gradient(135deg, #1a1a2e 0%, #F59E0B 50%, #FBBF24 100%);
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
    background: linear-gradient(135deg, #F59E0B, #FBBF24);
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

/* ==================== 分类网格 ==================== */
.category-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
}

@media (min-width: 640px) {
    .category-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 18px;
    }
}

/* ==================== 分类卡片 ==================== */
.category-card {
    background: #fff;
    border-radius: 14px;
    padding: 24px 16px 20px;
    text-align: center;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.35s ease;
    position: relative;
    overflow: hidden;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.category-card:hover {
    transform: translateY(-4px);
    border-color: transparent;
}

.card-stripe {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
}

.card-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
    transition: transform 0.3s ease;
}

.category-card:hover .card-icon {
    transform: scale(1.1) rotate(-5deg);
}

.card-name {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
}

.card-count {
    font-size: 12px;
    color: #999;
}

.card-bar {
    width: 80%;
    height: 4px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card-action {
    font-size: 12px;
    font-weight: 600;
    color: #999;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.3s;
    margin-top: 4px;
}

/* ==================== 5 种主题 ==================== */

.theme-0 .card-stripe {
    background: linear-gradient(90deg, #FF6B6B, #FF8E8E);
}

.theme-0 .card-icon {
    background: #fff0f0;
    color: #FF6B6B;
}

.theme-0 .bar-fill {
    background: linear-gradient(90deg, #FF6B6B, #FF8E8E);
}

.theme-0:hover {
    box-shadow: 0 12px 30px rgba(255, 107, 107, 0.12);
}

.theme-0:hover .card-action {
    color: #FF6B6B;
}

.theme-1 .card-stripe {
    background: linear-gradient(90deg, #4ECDC4, #7EDDD6);
}

.theme-1 .card-icon {
    background: #e8faf8;
    color: #4ECDC4;
}

.theme-1 .bar-fill {
    background: linear-gradient(90deg, #4ECDC4, #7EDDD6);
}

.theme-1:hover {
    box-shadow: 0 12px 30px rgba(78, 205, 196, 0.12);
}

.theme-1:hover .card-action {
    color: #4ECDC4;
}

.theme-2 .card-stripe {
    background: linear-gradient(90deg, #A78BFA, #C4B5FD);
}

.theme-2 .card-icon {
    background: #f3f0ff;
    color: #A78BFA;
}

.theme-2 .bar-fill {
    background: linear-gradient(90deg, #A78BFA, #C4B5FD);
}

.theme-2:hover {
    box-shadow: 0 12px 30px rgba(167, 139, 250, 0.12);
}

.theme-2:hover .card-action {
    color: #A78BFA;
}

.theme-3 .card-stripe {
    background: linear-gradient(90deg, #F59E0B, #FBBF24);
}

.theme-3 .card-icon {
    background: #fffbf0;
    color: #F59E0B;
}

.theme-3 .bar-fill {
    background: linear-gradient(90deg, #F59E0B, #FBBF24);
}

.theme-3:hover {
    box-shadow: 0 12px 30px rgba(245, 158, 11, 0.12);
}

.theme-3:hover .card-action {
    color: #F59E0B;
}

.theme-4 .card-stripe {
    background: linear-gradient(90deg, #667eea, #764ba2);
}

.theme-4 .card-icon {
    background: #f0f0ff;
    color: #667eea;
}

.theme-4 .bar-fill {
    background: linear-gradient(90deg, #667eea, #764ba2);
}

.theme-4:hover {
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.12);
}

.theme-4:hover .card-action {
    color: #667eea;
}

/* ==================== 骨架屏 ==================== */
.skeleton {
    animation: none !important;
    opacity: 1 !important;
    pointer-events: none;
}

.skeleton-circle {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
    width: 40%;
}

.skeleton-line.medium {
    width: 60%;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

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