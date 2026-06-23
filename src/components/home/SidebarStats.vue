<template>
    <SidebarCard title="站点概览">
        <template #icon>
            <el-icon>
                <DataAnalysis />
            </el-icon>
        </template>
        <div class="stat-grid">
            <div class="stat-box">
                <span class="stat-num">{{ stats.articles }}</span>
                <span class="stat-label">文章</span>
            </div>
            <div class="stat-box">
                <span class="stat-num">{{ stats.categories }}</span>
                <span class="stat-label">分类</span>
            </div>
            <div class="stat-box">
                <span class="stat-num">{{ stats.tags }}</span>
                <span class="stat-label">标签</span>
            </div>
            <div class="stat-box">
                <span class="stat-num">{{ stats.comments }}</span>
                <span class="stat-label">评论</span>
            </div>
        </div>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from './SidebarCard.vue';

defineProps({
    stats: {
        type: Object,
        default: () => ({ articles: 0, categories: 0, tags: 0, comments: 0 })
    }
});
</script>

<style scoped>
.stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.stat-box {
    text-align: center;
    padding: 14px 8px;
    background: #fafbff;
    border-radius: 10px;
}

.stat-num {
    display: block;
    font-size: 24px;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-label {
    font-size: 12px;
    color: #999;
}
</style>