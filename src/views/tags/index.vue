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
                        <PriceTag />
                    </el-icon>
                    TAGS
                </div>
                <h1 class="hero-title">标签云海</h1>
                <p class="hero-subtitle">寻找多维度的技术交织点，在碎片化的标签中拼凑知识版图。</p>
                <div class="hero-stats" v-if="!loading && tags.length > 0">
                    <div class="stat-pill">
                        <span class="stat-num">{{ tags.length }}</span>
                        <span class="stat-text">个标签</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-num">{{ totalArticles }}</span>
                        <span class="stat-text">篇文章</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 加载骨架 -->
        <div v-if="loading" class="tag-grid">
            <div v-for="i in 8" :key="i" class="tag-card skeleton">
                <div class="tag-color-bar"></div>
                <div class="tag-body">
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else-if="tags.length === 0" description="暂无标签数据，去后台给文章加个标签吧！" />

        <!-- 标签网格 -->
        <div v-else class="tag-grid">
            <div v-for="(tag, index) in tags" :key="tag.id" class="tag-card"
                :class="['theme-' + (index % 5), { 'no-articles': !tag.article_count }]"
                :style="{ animationDelay: index * 0.06 + 's' }" @click="handleTagClick(tag)">
                <div class="tag-color-bar"></div>
                <div class="tag-body">
                    <div class="tag-top">
                        <span class="tag-hash">#</span>
                        <span class="tag-name">{{ tag.name }}</span>
                    </div>
                    <div class="tag-bottom">
                        <span class="tag-count">
                            <el-icon>
                                <Document />
                            </el-icon>
                            {{ tag.article_count || 0 }} 篇
                        </span>
                        <span class="tag-arrow">→</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../../api/request';
import { Document, PriceTag } from '@element-plus/icons-vue';

const router = useRouter();
const loading = ref(false);
const tags = ref([]);

const totalArticles = computed(() => {
    return tags.value.reduce((sum, t) => sum + (t.article_count || 0), 0);
});

const fetchTags = async () => {
    loading.value = true;
    try {
        const res = await request.get('/tag');
        tags.value = res.data;
    } catch (error) {
        console.error('获取标签失败:', error);
    } finally {
        loading.value = false;
    }
};

const handleTagClick = (tag) => {
    router.push({ path: '/articles', query: { tag_id: tag.id } });
};

onMounted(() => {
    fetchTags();
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
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
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
    background: #667eea;
    top: -40px;
    left: -20px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 120px;
    height: 120px;
    background: #A78BFA;
    bottom: -30px;
    right: -20px;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

.orb-3 {
    width: 80px;
    height: 80px;
    background: #4ECDC4;
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
    background: linear-gradient(135deg, #667eea, #764ba2);
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
    background: linear-gradient(135deg, #1a1a2e 0%, #667eea 50%, #A78BFA 100%);
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
    background: linear-gradient(135deg, #667eea, #A78BFA);
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

/* ==================== 标签网格 ==================== */
.tag-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
}

@media (min-width: 640px) {
    .tag-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
}

@media (min-width: 900px) {
    .tag-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* ==================== 标签卡片 ==================== */
.tag-card {
    display: flex;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards;
}

.tag-card:hover {
    transform: translateY(-3px);
    border-color: transparent;
}

.tag-color-bar {
    width: 5px;
    flex-shrink: 0;
}

.tag-body {
    flex: 1;
    min-width: 0;
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.tag-top {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
}

.tag-hash {
    font-size: 18px;
    font-weight: 900;
    opacity: 0.3;
    flex-shrink: 0;
    line-height: 1;
}

.tag-name {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tag-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.tag-count {
    font-size: 12px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 4px;
}

.tag-arrow {
    font-size: 16px;
    color: #ddd;
    transition: all 0.3s;
    flex-shrink: 0;
}

.tag-card.no-articles {
    opacity: 0.6;
}

/* ==================== 5 种主题 ==================== */
.theme-0 .tag-color-bar {
    background: #FF6B6B;
}

.theme-0 .tag-hash {
    color: #FF6B6B;
}

.theme-0:hover {
    box-shadow: 0 10px 28px rgba(255, 107, 107, 0.1);
}

.theme-0:hover .tag-arrow {
    color: #FF6B6B;
    transform: translateX(3px);
}

.theme-1 .tag-color-bar {
    background: #4ECDC4;
}

.theme-1 .tag-hash {
    color: #4ECDC4;
}

.theme-1:hover {
    box-shadow: 0 10px 28px rgba(78, 205, 196, 0.1);
}

.theme-1:hover .tag-arrow {
    color: #4ECDC4;
    transform: translateX(3px);
}

.theme-2 .tag-color-bar {
    background: #A78BFA;
}

.theme-2 .tag-hash {
    color: #A78BFA;
}

.theme-2:hover {
    box-shadow: 0 10px 28px rgba(167, 139, 250, 0.1);
}

.theme-2:hover .tag-arrow {
    color: #A78BFA;
    transform: translateX(3px);
}

.theme-3 .tag-color-bar {
    background: #F59E0B;
}

.theme-3 .tag-hash {
    color: #F59E0B;
}

.theme-3:hover {
    box-shadow: 0 10px 28px rgba(245, 158, 11, 0.1);
}

.theme-3:hover .tag-arrow {
    color: #F59E0B;
    transform: translateX(3px);
}

.theme-4 .tag-color-bar {
    background: #667eea;
}

.theme-4 .tag-hash {
    color: #667eea;
}

.theme-4:hover {
    box-shadow: 0 10px 28px rgba(102, 126, 234, 0.1);
}

.theme-4:hover .tag-arrow {
    color: #667eea;
    transform: translateX(3px);
}

/* ==================== 骨架屏 ==================== */
.skeleton {
    animation: none !important;
    opacity: 1 !important;
    pointer-events: none;
}

.skeleton-line {
    height: 14px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
    width: 30%;
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