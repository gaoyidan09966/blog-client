<template>
    <div class="banner-wrapper" v-if="banners.length > 0">
        <div class="banner-track" ref="trackRef" @mouseenter="pauseAuto" @mouseleave="resumeAuto"
            @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">

            <!-- 轮播项 -->
            <div v-for="(item, index) in banners" :key="item.id" class="banner-slide"
                :class="{ active: currentIndex === index }">

                <!-- 图片类型 -->
                <div class="slide-media" v-if="item.media_type === 'image'">
                    <img :src="item.media_url" :alt="item.title" class="slide-img" draggable="false" />
                </div>

                <!-- 视频类型 -->
                <div class="slide-media" v-else-if="item.media_type === 'video'">
                    <video :src="item.media_url" class="slide-video" muted loop playsinline
                        :ref="el => videoRefs[index] = el" />
                </div>

                <!-- 渐变遮罩 -->
                <div class="slide-overlay"></div>

                <!-- 文字内容 -->
                <div class="slide-content" v-if="item.title || item.subtitle">
                    <div class="slide-badge" v-if="item.subtitle">FEATURED</div>
                    <h2 class="slide-title">{{ item.title }}</h2>
                    <p class="slide-subtitle" v-if="item.subtitle">{{ item.subtitle }}</p>
                    <button class="slide-btn" v-if="item.link" @click="handleClick(item.link)">
                        探索更多 →
                    </button>
                </div>

                <!-- 底部装饰线 -->
                <div class="slide-deco-line"></div>
            </div>

            <!-- 左右箭头（桌面端） -->
            <button class="arrow arrow-left" @click="prev" v-show="banners.length > 1">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
            </button>
            <button class="arrow arrow-right" @click="next" v-show="banners.length > 1">
                <el-icon>
                    <ArrowRight />
                </el-icon>
            </button>

            <!-- 指示器 -->
            <div class="indicators" v-if="banners.length > 1">
                <div v-for="(item, index) in banners" :key="item.id" class="indicator"
                    :class="{ active: currentIndex === index }" @click="goTo(index)">
                    <div class="indicator-progress" v-if="currentIndex === index"></div>
                </div>
            </div>

            <!-- 滚动提示（桌面端） -->
            <div class="scroll-hint">
                <div class="scroll-mouse">
                    <div class="scroll-dot"></div>
                </div>
                <span>向下滚动</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { getActiveBanners } from '../api/banner';

const router = useRouter();
const banners = ref([]);
const currentIndex = ref(0);
const trackRef = ref(null);
const videoRefs = ref({});

let autoTimer = null;
const INTERVAL = 5000;

// 触摸状态
const touchState = {
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0,
    startTime: 0,
    swiping: false,
};

const fetchBanners = async () => {
    try {
        const res = await getActiveBanners();
        banners.value = res.data;
        await nextTick();
        startAuto();
        playCurrentVideo();
    } catch (error) {
        console.error('获取轮播图失败:', error);
    }
};

const goTo = (index) => {
    currentIndex.value = index;
    playCurrentVideo();
};

const next = () => {
    currentIndex.value = (currentIndex.value + 1) % banners.value.length;
    playCurrentVideo();
};

const prev = () => {
    currentIndex.value = (currentIndex.value - 1 + banners.value.length) % banners.value.length;
    playCurrentVideo();
};

const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(next, INTERVAL);
};

const stopAuto = () => {
    if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
    }
};

const pauseAuto = () => stopAuto();
const resumeAuto = () => startAuto();

const playCurrentVideo = () => {
    nextTick(() => {
        Object.keys(videoRefs.value).forEach((key) => {
            const video = videoRefs.value[key];
            if (!video) return;
            if (parseInt(key) === currentIndex.value) {
                video.currentTime = 0;
                video.play().catch(() => { });
            } else {
                video.pause();
            }
        });
    });
};

// ==================== 触摸滑动 ====================
const onTouchStart = (e) => {
    const t = e.touches[0];
    touchState.startX = t.clientX;
    touchState.startY = t.clientY;
    touchState.moveX = 0;
    touchState.moveY = 0;
    touchState.startTime = Date.now();
    touchState.swiping = false;
    stopAuto();
};

const onTouchMove = (e) => {
    const t = e.touches[0];
    touchState.moveX = t.clientX - touchState.startX;
    touchState.moveY = t.clientY - touchState.startY;

    // 判断是否为水平滑动（水平位移 > 垂直位移）
    if (!touchState.swiping && Math.abs(touchState.moveX) > 10) {
        if (Math.abs(touchState.moveX) > Math.abs(touchState.moveY)) {
            touchState.swiping = true;
        }
    }

    // 水平滑动时阻止默认滚动
    if (touchState.swiping) {
        e.preventDefault();
    }
};

const onTouchEnd = () => {
    const elapsed = Date.now() - touchState.startTime;
    const distance = touchState.moveX;

    if (touchState.swiping) {
        // 快速轻扫或滑动超过 50px
        const isQuickSwipe = elapsed < 300 && Math.abs(distance) > 30;
        const isLongSwipe = Math.abs(distance) > 50;

        if (isQuickSwipe || isLongSwipe) {
            if (distance < 0) {
                next();
            } else {
                prev();
            }
        }
    }

    resumeAuto();
};

const handleClick = (link) => {
    // 如果刚发生过滑动，不触发点击
    if (touchState.swiping) return;
    if (link.startsWith('http')) {
        window.open(link, '_blank');
    } else {
        router.push(link);
    }
};

// ==================== 键盘 ====================
const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
};

onMounted(() => {
    fetchBanners();
    document.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
    stopAuto();
    document.removeEventListener('keydown', onKeyDown);
});
</script>

<style scoped>
.banner-wrapper {
    position: relative;
    width: 100%;
}

.banner-track {
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 600px;
    overflow: hidden;
    background: #0a0a0f;
    touch-action: pan-y;
}

/* ==================== 轮播项 ==================== */
.banner-slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transform: scale(1.05);
    transition: opacity 1s ease, transform 6s ease;
    z-index: 1;
}

.banner-slide.active {
    opacity: 1;
    transform: scale(1);
    z-index: 2;
}

.slide-media {
    position: absolute;
    inset: 0;
}

.slide-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.slide-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 渐变遮罩 */
.slide-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
        linear-gradient(180deg,
            rgba(0, 0, 0, 0.3) 0%,
            rgba(0, 0, 0, 0.05) 40%,
            rgba(0, 0, 0, 0.1) 70%,
            rgba(0, 0, 0, 0.6) 100%),
        linear-gradient(90deg,
            rgba(0, 0, 0, 0.45) 0%,
            rgba(0, 0, 0, 0.08) 50%,
            transparent 100%);
}

/* ==================== 文字内容 ==================== */
.slide-content {
    position: absolute;
    left: 80px;
    bottom: 120px;
    z-index: 2;
    max-width: 620px;
}

.slide-badge {
    display: inline-block;
    padding: 6px 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.85);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 4px;
    border-radius: 30px;
    margin-bottom: 20px;
    animation: fadeSlideUp 0.8s ease 0.1s both;
}

.slide-title {
    font-size: 56px;
    font-weight: 900;
    color: #fff;
    margin: 0 0 16px;
    line-height: 1.1;
    letter-spacing: -1px;
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    animation: fadeSlideUp 0.8s ease 0.3s both;
}

.slide-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 32px;
    line-height: 1.7;
    font-weight: 300;
    animation: fadeSlideUp 0.8s ease 0.5s both;
}

.slide-btn {
    display: inline-block;
    padding: 14px 40px;
    background: #fff;
    border: none;
    border-radius: 50px;
    color: #0a0a0f;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 1px;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    animation: fadeSlideUp 0.8s ease 0.7s both;
}

.slide-btn:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    letter-spacing: 3px;
}

/* 底部装饰线 */
.slide-deco-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 3;
    background: linear-gradient(90deg,
            transparent 0%, rgba(255, 255, 255, 0.3) 20%,
            rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.3) 80%, transparent 100%);
}

@keyframes fadeSlideUp {
    from {
        opacity: 0;
        transform: translateY(40px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ==================== 箭头 ==================== */
.arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s ease;
    opacity: 0;
}

.banner-track:hover .arrow {
    opacity: 1;
}

.arrow:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-50%) scale(1.08);
}

.arrow-left {
    left: 40px;
}

.arrow-right {
    right: 40px;
}

/* ==================== 指示器 ==================== */
.indicators {
    position: absolute;
    bottom: 60px;
    right: 80px;
    z-index: 10;
    display: flex;
    gap: 10px;
    align-items: center;
}

.indicator {
    width: 40px;
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s ease;
}

.indicator.active {
    width: 60px;
    background: rgba(255, 255, 255, 0.15);
}

.indicator-progress {
    height: 100%;
    background: #fff;
    border-radius: 2px;
    animation: progressAnim 5s linear;
}

@keyframes progressAnim {
    from {
        width: 0;
    }

    to {
        width: 100%;
    }
}

/* ==================== 滚动提示 ==================== */
.scroll-hint {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    letter-spacing: 2px;
    animation: scrollBounce 2s ease-in-out infinite;
}

.scroll-mouse {
    width: 22px;
    height: 34px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    display: flex;
    justify-content: center;
    padding-top: 6px;
}

.scroll-dot {
    width: 3px;
    height: 8px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
    animation: scrollDot 1.5s ease-in-out infinite;
}

@keyframes scrollDot {

    0%,
    100% {
        opacity: 1;
        transform: translateY(0);
    }

    50% {
        opacity: 0.3;
        transform: translateY(8px);
    }
}

@keyframes scrollBounce {

    0%,
    100% {
        transform: translateX(-50%) translateY(0);
    }

    50% {
        transform: translateX(-50%) translateY(-6px);
    }
}

/* ==================== 响应式 — 平板 ==================== */
@media (max-width: 1024px) {
    .slide-content {
        left: 50px;
        bottom: 100px;
        max-width: 480px;
    }

    .slide-title {
        font-size: 42px;
    }

    .slide-subtitle {
        font-size: 16px;
    }

    .indicators {
        right: 50px;
    }
}

/* ==================== 响应式 — 手机 ==================== */
@media (max-width: 768px) {
    .banner-track {
        height: 56vh;
        min-height: 340px;
    }

    /* 遮罩加强：手机屏幕小，文字需要更强对比 */
    .slide-overlay {
        background:
            linear-gradient(180deg,
                rgba(0, 0, 0, 0.15) 0%,
                rgba(0, 0, 0, 0.25) 40%,
                rgba(0, 0, 0, 0.5) 70%,
                rgba(0, 0, 0, 0.75) 100%);
    }

    /* 文字区域调整 */
    .slide-content {
        left: 20px;
        right: 20px;
        bottom: 70px;
        max-width: none;
    }

    .slide-badge {
        padding: 4px 14px;
        font-size: 9px;
        letter-spacing: 3px;
        margin-bottom: 12px;
    }

    .slide-title {
        font-size: 24px;
        margin-bottom: 10px;
        letter-spacing: 0;
        text-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
    }

    .slide-subtitle {
        font-size: 13px;
        margin-bottom: 18px;
        line-height: 1.5;
        /* 手机端最多两行 */
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }

    .slide-btn {
        padding: 10px 28px;
        font-size: 13px;
        border-radius: 40px;
    }

    /* 箭头：手机端常显，更小 */
    .arrow {
        opacity: 0.7;
        width: 36px;
        height: 36px;
        font-size: 14px;
        background: rgba(0, 0, 0, 0.25);
        border-color: rgba(255, 255, 255, 0.12);
    }

    .banner-track:hover .arrow {
        opacity: 0.7;
    }

    .arrow:hover {
        opacity: 1;
    }

    .arrow-left {
        left: 12px;
    }

    .arrow-right {
        right: 12px;
    }

    /* 指示器：居中底部 */
    .indicators {
        left: 50%;
        right: auto;
        bottom: 20px;
        transform: translateX(-50%);
        gap: 8px;
    }

    .indicator {
        width: 20px;
        height: 3px;
    }

    .indicator.active {
        width: 32px;
    }

    /* 隐藏滚动提示 */
    .scroll-hint {
        display: none;
    }
}

/* ==================== 响应式 — 小屏手机 ==================== */
@media (max-width: 400px) {
    .banner-track {
        height: 50vh;
        min-height: 300px;
    }

    .slide-content {
        bottom: 60px;
    }

    .slide-title {
        font-size: 20px;
    }

    .slide-subtitle {
        font-size: 12px;
    }

    .slide-btn {
        padding: 8px 22px;
        font-size: 12px;
    }

    .indicators {
        bottom: 16px;
    }
}

/* ==================== 横屏手机 ==================== */
@media (max-height: 500px) and (orientation: landscape) {
    .banner-track {
        height: 100vh;
        min-height: auto;
    }

    .slide-content {
        left: 80px;
        right: auto;
        bottom: 60px;
        max-width: 50%;
    }

    .slide-title {
        font-size: 28px;
    }

    .slide-subtitle {
        font-size: 14px;
        margin-bottom: 16px;
    }

    .slide-btn {
        padding: 8px 24px;
        font-size: 13px;
    }

    .arrow {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }

    .arrow-left {
        left: 16px;
    }

    .arrow-right {
        right: 16px;
    }

    .indicators {
        bottom: 16px;
        right: 40px;
    }
}
</style>