<template>
    <div class="article-nav" v-if="prev || next">
        <div class="nav-item prev" v-if="prev" @click="$emit('navigate', prev.id)">
            <span class="nav-label">
                <el-icon>
                    <ArrowLeft />
                </el-icon> 上一篇
            </span>
            <span class="nav-title">{{ prev.title }}</span>
        </div>
        <div class="nav-item next" v-if="next" @click="$emit('navigate', next.id)">
            <span class="nav-label">
                下一篇 <el-icon>
                    <ArrowRight />
                </el-icon>
            </span>
            <span class="nav-title">{{ next.title }}</span>
        </div>
    </div>
</template>

<script setup>
defineProps({
    prev: {
        type: Object,
        default: null
    },
    next: {
        type: Object,
        default: null
    }
});

defineEmits(['navigate']);
</script>

<style scoped>
.article-nav {
    display: flex;
    gap: 16px;
    margin-top: 20px;
}

.nav-item {
    flex: 1;
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    cursor: pointer;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.nav-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.nav-item.next {
    text-align: right;
}

.nav-label {
    font-size: 12px;
    color: #999;
    display: flex;
    align-items: center;
    gap: 4px;
}

.nav-item.next .nav-label {
    justify-content: flex-end;
}

.nav-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 768px) {
    .article-nav {
        flex-direction: column;
        gap: 10px;
    }

    .nav-item.next {
        text-align: left;
    }

    .nav-item.next .nav-label {
        justify-content: flex-start;
    }
}
</style>