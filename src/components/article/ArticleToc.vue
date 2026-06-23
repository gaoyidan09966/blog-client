<template>
    <div class="toc-wrapper" :class="{ visible: headings.length > 0 }">
        <div class="toc-title">
            <el-icon>
                <List />
            </el-icon>
            目录
        </div>
        <div class="toc-list">
            <div v-for="item in headings" :key="item.id" class="toc-item"
                :class="['level-' + item.level, { active: activeId === item.id }]" @click="scrollTo(item.id)">
                {{ item.text }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    headings: {
        type: Array,
        default: () => []
    }
});

const activeId = ref('');

const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
        window.scrollTo({
            top: el.offsetTop - 80,
            behavior: 'smooth'
        });
    }
};

const updateActive = () => {
    const scrollTop = window.scrollY + 100;
    let current = '';
    for (let i = props.headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(props.headings[i].id);
        if (el && el.offsetTop <= scrollTop) {
            current = props.headings[i].id;
            break;
        }
    }
    activeId.value = current || (props.headings.length > 0 ? props.headings[0].id : '');
};

onMounted(() => {
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
});

onUnmounted(() => {
    window.removeEventListener('scroll', updateActive);
});
</script>

<style scoped>
.toc-wrapper {
    position: fixed;
    top: 100px;
    right: calc((100vw - 1200px) / 2 - 260px);
    width: 220px;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.04);
    opacity: 0;
    transform: translateX(20px);
    transition: all 0.4s ease;
    pointer-events: none;
}

.toc-wrapper.visible {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
}

.toc-title {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    gap: 6px;
}

.toc-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.toc-item {
    padding: 6px 10px;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.toc-item:hover {
    color: #1a1a2e;
    background: #f5f5f5;
}

.toc-item.active {
    color: #667eea;
    background: #f0f0ff;
    font-weight: 600;
}

.level-2 {
    padding-left: 10px;
}

.level-3 {
    padding-left: 24px;
    font-size: 12px;
}

.level-4 {
    padding-left: 38px;
    font-size: 12px;
}

.toc-wrapper::-webkit-scrollbar {
    width: 4px;
}

.toc-wrapper::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 4px;
}

@media (max-width: 1400px) {
    .toc-wrapper {
        display: none;
    }
}
</style>