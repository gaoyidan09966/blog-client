<template>
    <div class="page-container">
        <div class="page-header">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">ARCHIVE</div>
                <h1 class="hero-title">时光归档</h1>
                <p class="hero-subtitle">好记性不如烂笔头。回望来时路，方知岁月长。</p>
                <div class="hero-stats">
                    <div class="stat-pill">
                        <span class="stat-num">{{ total }}</span>
                        <span class="stat-text">篇文章</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="archives-section" v-loading="loading">
            <div v-for="(group, index) in archives" :key="group.year_month" class="year-group"
                :style="{ animationDelay: index * 0.1 + 's' }">
                <div class="year-header">
                    <div class="year-icon">📅</div>
                    <div class="year-info">
                        <h2 class="year-title">{{ formatYearMonth(group.year_month) }}</h2>
                        <span class="year-count">{{ group.count }} 篇文章</span>
                    </div>
                </div>

                <div class="timeline">
                    <div v-for="(article, i) in group.articles" :key="article.id" class="timeline-item"
                        :class="'theme-' + (i % 4)" @click="goToDetail(article.id)">
                        <div class="timeline-dot"></div>
                        <div class="timeline-line" v-if="i < group.articles.length - 1"></div>
                        <div class="timeline-card">
                            <span class="timeline-date">{{ formatDay(article.create_time) }}</span>
                            <h3 class="timeline-title">{{ article.title }}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <el-empty v-if="!loading && archives.length === 0" description="暂无文章归档..." />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getArchives } from '../../api/archive';

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

const goToDetail = (id) => {
    router.push(`/article/${id}`);
};

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
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px 80px;
}

/* ==================== HERO ==================== */
.page-header {
    position: relative;
    border-radius: 28px;
    overflow: hidden;
    margin-top: 30px;
    min-height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
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
    filter: blur(70px);
    opacity: 0.5;
}

.orb-1 {
    width: 200px;
    height: 200px;
    background: #FF6B6B;
    top: -50px;
    left: -30px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 160px;
    height: 160px;
    background: #4ECDC4;
    bottom: -40px;
    right: -30px;
    animation: orbDrift 10s ease-in-out infinite reverse;
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
    padding: 40px 20px;
}

.hero-badge {
    display: inline-block;
    padding: 4px 18px;
    background: linear-gradient(135deg, #FF6B6B, #ee5a24);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    border-radius: 20px;
    letter-spacing: 3px;
    margin-bottom: 14px;
}

.hero-title {
    font-size: 36px;
    font-weight: 900;
    margin: 0 0 10px;
    background: linear-gradient(135deg, #1a1a2e 0%, #FF6B6B 50%, #4ECDC4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    color: #8888aa;
    font-size: 15px;
    margin: 0 0 20px;
}

.stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 24px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.stat-num {
    font-size: 24px;
    font-weight: 900;
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-text {
    font-size: 13px;
    color: #999;
}

/* ==================== 年月分组 ==================== */
.archives-section {
    margin-top: 40px;
}

.year-group {
    margin-bottom: 40px;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.year-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 2px solid #f0f0f0;
}

.year-icon {
    font-size: 28px;
}

.year-title {
    font-size: 22px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0;
}

.year-count {
    font-size: 13px;
    color: #aaa;
}

/* ==================== 时间线 ==================== */
.timeline {
    position: relative;
    padding-left: 30px;
}

.timeline-item {
    position: relative;
    padding-bottom: 20px;
    cursor: pointer;
}

.timeline-dot {
    position: absolute;
    left: -30px;
    top: 6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px #ddd;
    z-index: 2;
}

.theme-0 .timeline-dot {
    background: #FF6B6B;
    box-shadow: 0 0 0 2px #FF6B6B;
}

.theme-1 .timeline-dot {
    background: #4ECDC4;
    box-shadow: 0 0 0 2px #4ECDC4;
}

.theme-2 .timeline-dot {
    background: #A78BFA;
    box-shadow: 0 0 0 2px #A78BFA;
}

.theme-3 .timeline-dot {
    background: #FCD34D;
    box-shadow: 0 0 0 2px #FCD34D;
}

.timeline-line {
    position: absolute;
    left: -24px;
    top: 22px;
    bottom: 0;
    width: 2px;
    background: #eee;
}

.timeline-card {
    background: #fff;
    padding: 16px 20px;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.timeline-card:hover {
    transform: translateX(6px);
    border-color: transparent;
}

.theme-0:hover .timeline-card {
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.12);
}

.theme-1:hover .timeline-card {
    box-shadow: 0 6px 20px rgba(78, 205, 196, 0.12);
}

.theme-2:hover .timeline-card {
    box-shadow: 0 6px 20px rgba(167, 139, 250, 0.12);
}

.theme-3:hover .timeline-card {
    box-shadow: 0 6px 20px rgba(252, 211, 77, 0.12);
}

.timeline-date {
    font-size: 12px;
    color: #bbb;
    font-weight: 600;
}

.timeline-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 6px 0 0;
    line-height: 1.4;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
    .hero-title {
        font-size: 26px;
    }

    .timeline {
        padding-left: 24px;
    }
}
</style>