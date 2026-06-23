<template>
    <div class="tab-bar">
        <div v-for="tab in tabs" :key="tab.path" class="tab-item" :class="{ active: isActive(tab.path) }"
            @click="goTo(tab.path)">
            <el-icon class="tab-icon">
                <component :is="tab.icon" />
            </el-icon>
            <span class="tab-label">{{ tab.label }}</span>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { HomeFilled, ChatLineSquare, ShoppingBag, User } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const tabs = [
    { path: '/', label: '首页', icon: HomeFilled },
    { path: '/messages', label: '留言墙', icon: ChatLineSquare },
    { path: '/products', label: '周边', icon: ShoppingBag },
    { path: '/profile', label: '我的', icon: User }
];

const isActive = (path) => {
    if (path === '/') return route.path === '/';
    return route.path.startsWith(path);
};

const goTo = (path) => {
    router.push(path);
};
</script>

<style scoped>
.tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
    display: none;
    height: 56px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
    padding-bottom: env(safe-area-inset-bottom);
}

@media (max-width: 640px) {
    .tab-bar {
        display: flex;
        align-items: center;
        justify-content: space-around;
    }
}

.tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
    padding: 6px 0;
    min-width: 56px;
    transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
}

.tab-icon {
    font-size: 22px;
    color: #999;
    transition: all 0.2s;
}

.tab-label {
    font-size: 10px;
    font-weight: 500;
    color: #999;
    transition: all 0.2s;
}

.tab-item.active .tab-icon {
    color: #1a1a2e;
    transform: scale(1.1);
}

.tab-item.active .tab-label {
    color: #1a1a2e;
    font-weight: 700;
}
</style>