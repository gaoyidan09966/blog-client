<template>
    <div class="page-container">
        <!-- Hero 区域 -->
        <div class="tags-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-orb orb-3"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">TAGS</div>
                <h1 class="hero-title">标签云海</h1>
                <p class="hero-subtitle">寻找多维度的技术交织点，在碎片化的标签中拼凑知识版图</p>
                <div class="hero-stats">
                    <div class="stat-pill">
                        <span class="stat-num">{{ tags.length }}</span>
                        <span class="stat-text">个标签</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 标签云 -->
        <div class="tags-section" v-loading="loading">
            <div class="tags-cloud-grid">
                <div v-for="(tag, index) in tags" :key="tag.id" class="tag-card" :class="'theme-' + (index % 4)"
                    :style="{ animationDelay: index * 0.06 + 's' }" @click="handleTagClick(tag)">
                    <div class="tag-card-glow"></div>
                    <div class="tag-card-content">
                        <div class="tag-hash">#</div>
                        <div class="tag-name">{{ tag.name }}</div>
                        <div class="tag-count">{{ tag.article_count || 0 }} 篇文章</div>
                    </div>
                    <div class="tag-card-arrow">→</div>
                </div>
            </div>

            <el-empty v-if="!loading && tags.length === 0" description="暂无标签数据，去后台给文章加个标签吧！" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../../api/request';

const router = useRouter();
const loading = ref(false);
const tags = ref([]);

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
    router.push(`/tag/${tag.id}`);
};

onMounted(() => {
    fetchTags();
});
</script>

<style scoped>
.page-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px 80px;
}

/* ==================== HERO ==================== */
.tags-hero {
    position: relative;
    border-radius: 28px;
    overflow: hidden;
    margin-top: 30px;
    min-height: 280px;
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
    width: 220px;
    height: 220px;
    background: #FF6B6B;
    top: -60px;
    left: -40px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 180px;
    height: 180px;
    background: #4ECDC4;
    bottom: -50px;
    right: -30px;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

.orb-3 {
    width: 140px;
    height: 140px;
    background: #A78BFA;
    top: 30%;
    right: 20%;
    animation: orbDrift 9s ease-in-out infinite 2s;
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
    padding: 50px 20px;
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
    margin-bottom: 16px;
}

.hero-title {
    font-size: 44px;
    font-weight: 900;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #1a1a2e 0%, #FF6B6B 50%, #4ECDC4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    color: #8888aa;
    font-size: 15px;
    margin: 0 0 24px;
}

.hero-stats {
    display: flex;
    justify-content: center;
}

.stat-pill {
    display: flex;
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

/* ==================== 标签网格 ==================== */
.tags-section {
    margin-top: 40px;
}

.tags-cloud-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
}

/* 标签卡片 */
.tag-card {
    position: relative;
    background: #fff;
    border-radius: 18px;
    padding: 24px;
    cursor: pointer;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0;
    transform: translateY(20px);
    animation: cardAppear 0.5s ease forwards;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

@keyframes cardAppear {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tag-card-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 18px 18px 0 0;
}

.theme-0 .tag-card-glow {
    background: linear-gradient(90deg, #FF6B6B, #FF8E8E);
}

.theme-1 .tag-card-glow {
    background: linear-gradient(90deg, #4ECDC4, #7EDDD6);
}

.theme-2 .tag-card-glow {
    background: linear-gradient(90deg, #A78BFA, #C4B5FD);
}

.theme-3 .tag-card-glow {
    background: linear-gradient(90deg, #FCD34D, #FDE68A);
}

.tag-card:hover {
    transform: translateY(-5px);
    border-color: transparent;
}

.theme-0:hover {
    box-shadow: 0 16px 40px rgba(255, 107, 107, 0.15);
}

.theme-1:hover {
    box-shadow: 0 16px 40px rgba(78, 205, 196, 0.15);
}

.theme-2:hover {
    box-shadow: 0 16px 40px rgba(167, 139, 250, 0.15);
}

.theme-3:hover {
    box-shadow: 0 16px 40px rgba(252, 211, 77, 0.15);
}

.tag-card-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
}

.tag-hash {
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
    opacity: 0.15;
}

.theme-0 .tag-hash {
    color: #FF6B6B;
    opacity: 0.4;
}

.theme-1 .tag-hash {
    color: #4ECDC4;
    opacity: 0.4;
}

.theme-2 .tag-hash {
    color: #A78BFA;
    opacity: 0.4;
}

.theme-3 .tag-hash {
    color: #FCD34D;
    opacity: 0.5;
}

.tag-name {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a2e;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tag-count {
    font-size: 12px;
    color: #aaa;
}

.tag-card-arrow {
    font-size: 20px;
    color: #ddd;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.theme-0:hover .tag-card-arrow {
    color: #FF6B6B;
    transform: translateX(4px);
}

.theme-1:hover .tag-card-arrow {
    color: #4ECDC4;
    transform: translateX(4px);
}

.theme-2:hover .tag-card-arrow {
    color: #A78BFA;
    transform: translateX(4px);
}

.theme-3:hover .tag-card-arrow {
    color: #FCD34D;
    transform: translateX(4px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
    .hero-title {
        font-size: 30px;
    }

    .tags-cloud-grid {
        grid-template-columns: 1fr;
    }

    .tag-card {
        padding: 20px;
    }
}
</style>