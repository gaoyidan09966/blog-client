<template>
    <SidebarCard title="热门标签">
        <template #icon>
            <el-icon>
                <PriceTag />
            </el-icon>
        </template>
        <div class="sidebar-tags">
            <span v-for="(tag, index) in tags" :key="tag.id" class="sidebar-tag" :class="'stag-' + (index % 4)"
                @click="$emit('goTag', tag.id)">
                {{ tag.name }}
            </span>
        </div>
    </SidebarCard>
</template>

<script setup>
import SidebarCard from './SidebarCard.vue';

defineProps({
    tags: {
        type: Array,
        default: () => []
    }
});

defineEmits(['goTag']);
</script>

<style scoped>
.sidebar-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.sidebar-tag {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.sidebar-tag:hover {
    transform: translateY(-2px);
}

.stag-0 {
    background: #f0f0ff;
    color: #667eea;
}

.stag-0:hover {
    background: #e0e0ff;
}

.stag-1 {
    background: #e8faf8;
    color: #38B2AC;
}

.stag-1:hover {
    background: #d0f5f0;
}

.stag-2 {
    background: #fff0f0;
    color: #FF6B6B;
}

.stag-2:hover {
    background: #ffe0e0;
}

.stag-3 {
    background: #fffbf0;
    color: #D97706;
}

.stag-3:hover {
    background: #fff3d0;
}
</style>