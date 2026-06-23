<template>
    <section class="quick-nav">
        <div class="nav-inner">
            <div class="nav-scroll">
                <div class="nav-item" :class="{ active: !activeId }" @click="$emit('change', null)">
                    全部
                </div>
                <div v-for="cat in categories" :key="cat.id" class="nav-item" :class="{ active: activeId === cat.id }"
                    @click="$emit('change', cat.id)">
                    {{ cat.name }}
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
defineProps({
    categories: {
        type: Array,
        default: () => []
    },
    activeId: {
        type: [Number, null],
        default: null
    }
});

defineEmits(['change']);
</script>

<style scoped>
.quick-nav {
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 64px;
    z-index: 100;
}

.nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.nav-scroll {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
    padding: 12px 0;
    scrollbar-width: none;
}

.nav-scroll::-webkit-scrollbar {
    display: none;
}

.nav-item {
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    border-radius: 20px;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s ease;
}

.nav-item:hover {
    color: #1a1a2e;
    background: #f5f5f5;
}

.nav-item.active {
    color: #fff;
    background: #1a1a2e;
    font-weight: 600;
}
</style>