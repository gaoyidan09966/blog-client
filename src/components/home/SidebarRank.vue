<template>
    <SidebarCard title="阅读排行">
        <template #icon>
            <el-icon>
                <Trophy />
            </el-icon>
        </template>
        <div class="rank-list">
            <div v-for="(article, index) in articles" :key="article.id" class="rank-item"
                @click="$emit('goArticle', article.id)">
                <div class="rank-index" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
                <div class="rank-info">
                    <h4 class="rank-title">{{ article.title }}</h4>
                    <span class="rank-views">
                        <el-icon>
                            <View />
                        </el-icon>
                        {{ article.view_count }}
                    </span>
                </div>
            </div>
        </div>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from './SidebarCard.vue';

defineProps({
    articles: {
        type: Array,
        default: () => []
    }
});

defineEmits(['goArticle']);
</script>

<style scoped>
.rank-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.rank-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    padding: 8px 0;
    border-bottom: 1px solid #f8f8f8;
    transition: all 0.2s;
}

.rank-item:last-child {
    border-bottom: none;
}

.rank-item:hover {
    padding-left: 4px;
}

.rank-index {
    min-width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 800;
    color: #fff;
    background: #ccc;
    flex-shrink: 0;
}

.rank-1 {
    background: #FF6B6B;
}

.rank-2 {
    background: #FF9F43;
}

.rank-3 {
    background: #FECA57;
}

.rank-info {
    flex: 1;
    min-width: 0;
}

.rank-title {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    margin: 0 0 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.rank-views {
    font-size: 11px;
    color: #ccc;
    display: flex;
    align-items: center;
    gap: 3px;
}
</style>