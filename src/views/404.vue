<template>
    <div class="page-404">
        <div class="error-bg">
            <div class="error-orb orb-1"></div>
            <div class="error-orb orb-2"></div>
            <div class="error-grid"></div>
        </div>
        <div class="error-content">
            <div class="error-code">
                <span class="code-digit">4</span>
                <span class="code-emoji">😮</span>
                <span class="code-digit">4</span>
            </div>
            <h1 class="error-title">页面走丢了</h1>
            <p class="error-desc">你访问的页面不存在或已被移除，请检查地址是否正确</p>
            <div class="error-actions">
                <button class="btn-home" @click="router.push('/')">
                    🏠 返回首页
                </button>
                <button class="btn-back" @click="router.back()">
                    ← 返回上页
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<style scoped>
.page-404 {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f6f8;
    position: relative;
    overflow: hidden;
}

.error-bg {
    position: absolute;
    inset: 0;
}

.error-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
    background-size: 50px 50px;
}

.error-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
}

.orb-1 {
    width: 300px;
    height: 300px;
    background: #667eea;
    top: -80px;
    left: 10%;
    animation: orbFloat 8s ease-in-out infinite;
}

.orb-2 {
    width: 250px;
    height: 250px;
    background: #F472B6;
    bottom: -60px;
    right: 10%;
    animation: orbFloat 8s ease-in-out infinite reverse;
}

@keyframes orbFloat {

    0%,
    100% {
        transform: translate(0, 0);
    }

    50% {
        transform: translate(30px, -30px);
    }
}

.error-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 20px;
    animation: fadeInUp 0.8s ease both;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(40px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.error-code {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
}

.code-digit {
    font-size: 120px;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    animation: codePulse 3s ease-in-out infinite;
}

@keyframes codePulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.03);
    }
}

.code-emoji {
    font-size: 80px;
    animation: emojiBounce 2s ease-in-out infinite;
}

@keyframes emojiBounce {

    0%,
    100% {
        transform: translateY(0) rotate(0deg);
    }

    25% {
        transform: translateY(-12px) rotate(-5deg);
    }

    75% {
        transform: translateY(-6px) rotate(5deg);
    }
}

.error-title {
    font-size: 32px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 12px;
}

.error-desc {
    font-size: 16px;
    color: #999;
    margin: 0 0 40px;
    line-height: 1.6;
}

.error-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
}

.btn-home,
.btn-back {
    padding: 14px 32px;
    border: none;
    border-radius: 30px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-home {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
}

.btn-home:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-back {
    background: #fff;
    color: #333;
    border: 2px solid #e0e0e0;
}

.btn-back:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-3px);
}
</style>