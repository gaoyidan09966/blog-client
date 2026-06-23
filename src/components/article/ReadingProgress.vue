<template>
    <div class="reading-progress">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
    <div class="progress-text" v-if="progress > 5">
        {{ Math.round(progress) }}%
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const progress = ref(0);

const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
};

onMounted(() => {
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
});

onUnmounted(() => {
    window.removeEventListener('scroll', updateProgress);
});
</script>

<style scoped>
.reading-progress {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.04);
    z-index: 998;
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 0 3px 3px 0;
    transition: width 0.1s linear;
}

.progress-text {
    position: fixed;
    top: 72px;
    right: 20px;
    font-size: 12px;
    font-weight: 700;
    color: #667eea;
    z-index: 998;
    opacity: 0.7;
}

@media (max-width: 640px) {
    .progress-text {
        display: none;
    }
}
</style>