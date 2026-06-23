<template>
    <div class="about-page">

        <!-- 1. Hero 大图区域 -->
        <section class="hero-section">
            <div class="hero-bg">
                <div class="hero-particles">
                    <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
                </div>
                <div class="hero-gradient"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">ABOUT ME</div>
                <h1 class="hero-title">你好，我是{{ admin.nickname || '拾光笔记' }}</h1>
                <p class="hero-subtitle">{{ admin.bio || '一个热爱技术与生活的开发者，用代码记录时光，用文字书写人生' }}</p>
                <div class="hero-stats">
                    <div class="stat-pill">
                        <span class="stat-num">{{ animatedArticles }}</span>
                        <span class="stat-label">篇文章</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-num">{{ animatedTags }}</span>
                        <span class="stat-label">个标签</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-num">{{ animatedCategories }}</span>
                        <span class="stat-label">个分类</span>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-num">{{ animatedComments }}</span>
                        <span class="stat-label">条评论</span>
                    </div>
                </div>
                <div class="scroll-indicator">
                    <div class="scroll-mouse">
                        <div class="scroll-dot"></div>
                    </div>
                    <span>向下滚动</span>
                </div>
            </div>
        </section>

        <!-- 2. 关于博主 -->
        <section class="section section-about" ref="aboutRef">
            <div class="section-inner">
                <div class="section-header">
                    <div class="section-tag">INTRODUCE</div>
                    <h2 class="section-title">关于博主</h2>
                    <p class="section-desc">了解我的故事和技术历程</p>
                </div>
                <div class="about-grid">
                    <div class="about-avatar-card" :class="{ 'animate-in': aboutVisible }">
                        <div class="avatar-ring">
                            <el-avatar :size="120" :src="admin.avatar" class="about-avatar">
                                {{ admin.nickname?.charAt(0) || 'A' }}
                            </el-avatar>
                        </div>
                        <h3 class="about-name">{{ admin.nickname || '拾光笔记' }}</h3>
                        <p class="about-role">全栈开发者 · 博客作者</p>
                        <div class="about-social">
                            <div class="social-icon">📧</div>
                            <div class="social-icon">🐙</div>
                            <div class="social-icon">💬</div>
                        </div>
                    </div>
                    <div class="about-text-card" :class="{ 'animate-in': aboutVisible }">
                        <div class="about-text">
                            <p>欢迎来到「拾光笔记」，这是我个人的技术博客。</p>
                            <p>我是一名全栈开发者，热衷于探索前后端技术，喜欢用代码解决问题，也喜欢用文字记录学习过程中的点滴。</p>
                            <p>这个博客使用 <strong>Vue3 + Express + MySQL</strong> 全栈开发，从前端到后端、从数据库到部署，都是我亲手搭建的。</p>
                            <p>在这里，你可以找到技术分享、项目实战、学习笔记等内容。希望这些文章能对你有所帮助。</p>
                        </div>
                        <div class="about-highlights">
                            <div class="highlight-item" v-for="(item, index) in highlights" :key="index">
                                <span class="highlight-icon">{{ item.icon }}</span>
                                <div class="highlight-info">
                                    <span class="highlight-title">{{ item.title }}</span>
                                    <span class="highlight-desc">{{ item.desc }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 3. 技术栈 -->
        <section class="section section-tech">
            <div class="section-inner">
                <div class="section-header">
                    <div class="section-tag">TECH STACK</div>
                    <h2 class="section-title">技术栈</h2>
                    <p class="section-desc">这个博客使用到的技术</p>
                </div>
                <div class="tech-grid">
                    <div v-for="(tech, index) in techStack" :key="index" class="tech-card"
                        :class="'tech-theme-' + (index % 4)" :style="{ animationDelay: index * 0.08 + 's' }">
                        <div class="tech-icon">{{ tech.icon }}</div>
                        <h4 class="tech-name">{{ tech.name }}</h4>
                        <p class="tech-desc">{{ tech.desc }}</p>
                        <div class="tech-bar">
                            <div class="tech-bar-fill" :style="{ width: tech.level + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. 发展历程 -->
        <section class="section section-timeline">
            <div class="section-inner">
                <div class="section-header">
                    <div class="section-tag">JOURNEY</div>
                    <h2 class="section-title">发展历程</h2>
                    <p class="section-desc">博客从零到一的成长故事</p>
                </div>
                <div class="timeline">
                    <div class="timeline-line"></div>
                    <div v-for="(item, index) in timeline" :key="index" class="timeline-item"
                        :class="index % 2 === 0 ? 'left' : 'right'">
                        <div class="timeline-dot" :style="{ background: item.color }"></div>
                        <div class="timeline-card">
                            <span class="timeline-date">{{ item.date }}</span>
                            <h4 class="timeline-title">{{ item.title }}</h4>
                            <p class="timeline-desc">{{ item.desc }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 5. 博客数据 -->
        <section class="section section-data">
            <div class="section-inner">
                <div class="section-header">
                    <div class="section-tag">BLOG DATA</div>
                    <h2 class="section-title">博客数据</h2>
                    <p class="section-desc">截至目前的博客运营数据</p>
                </div>
                <div class="data-grid">
                    <div class="data-card" v-for="(item, index) in dataCards" :key="index"
                        :class="'data-theme-' + index">
                        <div class="data-icon">{{ item.icon }}</div>
                        <div class="data-num">{{ item.value }}</div>
                        <div class="data-label">{{ item.label }}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 6. 联系方式 -->
        <section class="section section-contact">
            <div class="section-inner">
                <div class="section-header">
                    <div class="section-tag">CONTACT</div>
                    <h2 class="section-title">联系方式</h2>
                    <p class="section-desc">欢迎与我交流</p>
                </div>
                <div class="contact-grid">
                    <div class="contact-card" v-for="(item, index) in contacts" :key="index">
                        <div class="contact-icon">{{ item.icon }}</div>
                        <h4 class="contact-label">{{ item.label }}</h4>
                        <p class="contact-value">{{ item.value }}</p>
                    </div>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { getAdminInfo } from '../../api/user';
import request from '../../api/request';

const admin = ref({});
const aboutVisible = ref(false);
const aboutRef = ref(null);

// 动画数字
const animatedArticles = ref(0);
const animatedTags = ref(0);
const animatedCategories = ref(0);
const animatedComments = ref(0);

// 数据
const articleCount = ref(0);
const tagCount = ref(0);
const categoryCount = ref(0);
const commentCount = ref(0);

// 粒子样式
const particleStyle = (i) => {
    const size = Math.random() * 6 + 2;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 10 + 10;
    const opacity = Math.random() * 0.3 + 0.1;
    return {
        width: size + 'px',
        height: size + 'px',
        left: left + '%',
        top: top + '%',
        animationDelay: delay + 's',
        animationDuration: duration + 's',
        opacity: opacity
    };
};

// 高亮卡片
const highlights = [
    { icon: '🚀', title: '全栈开发', desc: 'Vue3 + Express + MySQL' },
    { icon: '📝', title: '技术写作', desc: '记录学习，分享经验' },
    { icon: '🎨', title: 'UI 设计', desc: '注重用户体验与视觉美感' },
    { icon: '💡', title: '持续学习', desc: '保持好奇心，拥抱新技术' }
];

// 技术栈
const techStack = [
    { icon: '⚡', name: 'Vue3', desc: '前端框架', level: 90 },
    { icon: '🟢', name: 'Express', desc: '后端框架', level: 85 },
    { icon: '🐬', name: 'MySQL', desc: '关系型数据库', level: 80 },
    { icon: '📦', name: 'Vite', desc: '构建工具', level: 88 },
    { icon: '🧩', name: 'Element Plus', desc: 'UI 组件库', level: 92 },
    { icon: '🔑', name: 'JWT', desc: '身份认证', level: 78 },
    { icon: '🌐', name: 'RESTful API', desc: '接口设计', level: 85 },
    { icon: '🎨', name: 'CSS3', desc: '样式与动画', level: 88 }
];

// 发展历程
const timeline = [
    { date: '2026年6月', title: '博客项目启动', desc: '确定技术方案，搭建项目架构，开始前后端开发', color: '#667eea' },
    { date: '2026年6月', title: '核心功能完成', desc: '文章管理、分类标签、评论系统、用户管理等功能上线', color: '#4ECDC4' },
    { date: '2026年6月', title: '前台页面优化', desc: '首页改版、轮播图、搜索功能、留言墙等功能上线', color: '#FF6B6B' },
    { date: '2026年6月', title: '仪表盘上线', desc: '后台管理加入数据统计、ECharts 图表等功能', color: '#FCD34D' },
];

// 博客数据
const dataCards = reactive([
    { icon: '📄', label: '文章总数', value: 0 },
    { icon: '📁', label: '分类数量', value: 0 },
    { icon: '🏷️', label: '标签数量', value: 0 },
    { icon: '💬', label: '评论总数', value: 0 },
]);

// 联系方式
const contacts = [
    { icon: '📧', label: '电子邮箱', value: 'admin@example.com' },
    { icon: '🐙', label: 'GitHub', value: 'github.com' },
    { icon: '💬', label: '微信', value: '暂未公开' },
];

// 数字滚动动画
const animateNumber = (targetRef, targetValue, duration = 1500) => {
    const startTime = Date.now();
    const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        targetRef.value = Math.floor(eased * targetValue);
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            targetRef.value = targetValue;
        }
    };
    requestAnimationFrame(step);
};

// 获取数据
const fetchData = async () => {
    try {
        const [adminRes, articleRes, tagRes, categoryRes, commentRes] = await Promise.all([
            getAdminInfo(),
            request.get('/article', { params: { pageSize: 1 } }),
            request.get('/tag'),
            request.get('/category'),
            request.get('/comment/latest', { params: { limit: 100 } })
        ]);

        admin.value = adminRes.data;
        articleCount.value = articleRes.data.total || 0;
        tagCount.value = tagRes.data.length || 0;
        categoryCount.value = categoryRes.data.length || 0;
        commentCount.value = commentRes.data.length || 0;

        dataCards[0].value = articleCount.value;
        dataCards[1].value = categoryCount.value;
        dataCards[2].value = tagCount.value;
        dataCards[3].value = commentCount.value;

        // 启动数字动画
        animateNumber(animatedArticles, articleCount.value);
        animateNumber(animatedTags, tagCount.value);
        animateNumber(animatedCategories, categoryCount.value);
        animateNumber(animatedComments, commentCount.value);
    } catch (error) {
        console.error('获取数据失败:', error);
    }
};

// Intersection Observer 控制动画
let observer = null;
const setupObserver = () => {
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (entry.target === aboutRef.value) {
                    aboutVisible.value = true;
                }
            }
        });
    }, { threshold: 0.2 });
};

onMounted(() => {
    fetchData();
    setupObserver();
    if (aboutRef.value && observer) {
        observer.observe(aboutRef.value);
    }
});

onUnmounted(() => {
    if (observer) observer.disconnect();
});
</script>

<style scoped>
.about-page {
    background: #f5f6f8;
}

/* ==================== Hero ==================== */
.hero-section {
    position: relative;
    height: 100vh;
    min-height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0d0d2b 100%);
}

.hero-bg {
    position: absolute;
    inset: 0;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(78, 205, 196, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(255, 107, 107, 0.1) 0%, transparent 50%);
}

.hero-particles .particle {
    position: absolute;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: particleFloat linear infinite;
}

@keyframes particleFloat {

    0%,
    100% {
        transform: translateY(0) translateX(0);
    }

    25% {
        transform: translateY(-30px) translateX(20px);
    }

    50% {
        transform: translateY(-15px) translateX(-10px);
    }

    75% {
        transform: translateY(-40px) translateX(15px);
    }
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 20px;
}

.hero-badge {
    display: inline-block;
    padding: 6px 24px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    font-weight: 800;
    border-radius: 30px;
    letter-spacing: 4px;
    margin-bottom: 28px;
    animation: fadeInDown 0.8s ease both;
}

.hero-title {
    font-size: 52px;
    font-weight: 900;
    color: #fff;
    margin: 0 0 16px;
    line-height: 1.2;
    animation: fadeInUp 0.8s ease 0.2s both;
}

.hero-subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.55);
    margin: 0 0 40px;
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.7;
    animation: fadeInUp 0.8s ease 0.4s both;
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    animation: fadeInUp 0.8s ease 0.6s both;
}

.stat-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 30px;
}

.stat-num {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
}

.stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.45);
}

.scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.3);
    font-size: 11px;
    letter-spacing: 2px;
    animation: scrollBounce 2s ease-in-out infinite;
}

.scroll-mouse {
    width: 22px;
    height: 34px;
    border: 2px solid rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    display: flex;
    justify-content: center;
    padding-top: 6px;
}

.scroll-dot {
    width: 3px;
    height: 8px;
    background: rgba(255, 255, 255, 0.4);
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
        transform: translateX(-50%) translateY(-8px);
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ==================== 通用区块 ==================== */
.section {
    padding: 80px 0;
}

.section-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
}

.section-header {
    text-align: center;
    margin-bottom: 50px;
}

.section-tag {
    display: inline-block;
    padding: 4px 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 3px;
    border-radius: 20px;
    margin-bottom: 16px;
}

.section-title {
    font-size: 34px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 10px;
}

.section-desc {
    font-size: 15px;
    color: #999;
    margin: 0;
}

/* ==================== 关于博主 ==================== */
.section-about {
    background: #fff;
}

.about-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 30px;
    align-items: start;
}

.about-avatar-card {
    text-align: center;
    padding: 36px 24px;
    background: #fafbff;
    border-radius: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    opacity: 0;
    transform: translateX(-30px);
    transition: all 0.8s ease;
}

.about-avatar-card.animate-in {
    opacity: 1;
    transform: translateX(0);
}

.avatar-ring {
    display: inline-block;
    padding: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    margin-bottom: 16px;
}

.about-avatar {
    background: #fff;
    color: #667eea;
    font-size: 48px;
    font-weight: 900;
}

.about-name {
    font-size: 22px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 4px;
}

.about-role {
    font-size: 13px;
    color: #999;
    margin: 0 0 20px;
}

.about-social {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.social-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #f0f0f0;
}

.social-icon:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.about-text-card {
    opacity: 0;
    transform: translateX(30px);
    transition: all 0.8s ease 0.2s;
}

.about-text-card.animate-in {
    opacity: 1;
    transform: translateX(0);
}

.about-text {
    padding: 32px;
    background: #fafbff;
    border-radius: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    margin-bottom: 20px;
}

.about-text p {
    font-size: 15px;
    color: #555;
    line-height: 1.8;
    margin: 0 0 12px;
}

.about-text p:last-child {
    margin: 0;
}

.about-text strong {
    color: #1a1a2e;
}

.about-highlights {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
}

.highlight-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: #fafbff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s;
}

.highlight-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.highlight-icon {
    font-size: 28px;
    flex-shrink: 0;
}

.highlight-info {
    display: flex;
    flex-direction: column;
}

.highlight-title {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
}

.highlight-desc {
    font-size: 12px;
    color: #999;
}

/* ==================== 技术栈 ==================== */
.tech-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
}

.tech-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px 20px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.4s ease;
    animation: fadeInUp 0.5s ease forwards;
    opacity: 0;
}

.tech-card:hover {
    transform: translateY(-5px);
}

.tech-theme-0:hover {
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
}

.tech-theme-1:hover {
    box-shadow: 0 12px 30px rgba(78, 205, 196, 0.15);
}

.tech-theme-2:hover {
    box-shadow: 0 12px 30px rgba(255, 107, 107, 0.15);
}

.tech-theme-3:hover {
    box-shadow: 0 12px 30px rgba(252, 211, 77, 0.15);
}

.tech-icon {
    font-size: 36px;
    margin-bottom: 10px;
}

.tech-name {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
}

.tech-desc {
    font-size: 12px;
    color: #999;
    margin: 0 0 14px;
}

.tech-bar {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
}

.tech-bar-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 1.5s ease;
}

/* ==================== 发展历程 ==================== */
.section-timeline {
    background: #fff;
}

.timeline {
    position: relative;
    padding: 20px 0;
}

.timeline-line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #667eea, #764ba2, #FF6B6B, #FCD34D);
    transform: translateX(-50%);
}

.timeline-item {
    position: relative;
    width: 50%;
    padding: 20px 40px;
}

.timeline-item.left {
    left: 0;
    text-align: right;
}

.timeline-item.right {
    left: 50%;
    text-align: left;
}

.timeline-dot {
    position: absolute;
    top: 28px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
    z-index: 2;
}

.timeline-item.left .timeline-dot {
    right: -7px;
}

.timeline-item.right .timeline-dot {
    left: -7px;
}

.timeline-card {
    padding: 20px;
    background: #fafbff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s;
}

.timeline-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.timeline-date {
    font-size: 12px;
    color: #999;
    font-weight: 600;
}

.timeline-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 6px 0;
}

.timeline-desc {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.6;
}

/* ==================== 博客数据 ==================== */
.data-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.data-card {
    text-align: center;
    padding: 32px 20px;
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.4s;
    position: relative;
    overflow: hidden;
}

.data-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
}

.data-theme-0::before {
    background: linear-gradient(90deg, #667eea, #8ba0f5);
}

.data-theme-1::before {
    background: linear-gradient(90deg, #4ECDC4, #7EDDD6);
}

.data-theme-2::before {
    background: linear-gradient(90deg, #FF6B6B, #FF9F9F);
}

.data-theme-3::before {
    background: linear-gradient(90deg, #FCD34D, #FDE68A);
}

.data-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.data-icon {
    font-size: 40px;
    margin-bottom: 12px;
}

.data-num {
    font-size: 42px;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
}

.data-label {
    font-size: 14px;
    color: #999;
    margin-top: 4px;
}

/* ==================== 联系方式 ==================== */
.section-contact {
    background: #fff;
}

.contact-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.contact-card {
    text-align: center;
    padding: 32px 20px;
    background: #fafbff;
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.3s;
}

.contact-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.contact-icon {
    font-size: 36px;
    margin-bottom: 12px;
}

.contact-label {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 6px;
}

.contact-value {
    font-size: 14px;
    color: #666;
    margin: 0;
}

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
    .about-grid {
        grid-template-columns: 1fr;
    }

    .about-avatar-card {
        max-width: 360px;
        margin: 0 auto;
    }

    .tech-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .data-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 32px;
    }

    .hero-stats {
        flex-direction: column;
        align-items: center;
    }

    .about-highlights {
        grid-template-columns: 1fr;
    }

    .timeline-line {
        left: 20px;
    }

    .timeline-item {
        width: 100%;
        left: 0 !important;
        text-align: left !important;
        padding-left: 50px;
        padding-right: 0;
    }

    .timeline-item .timeline-dot {
        left: 13px !important;
        right: auto !important;
    }

    .contact-grid {
        grid-template-columns: 1fr;
    }

    .data-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .tech-grid {
        grid-template-columns: 1fr;
    }

    .data-grid {
        grid-template-columns: 1fr;
    }

    .hero-title {
        font-size: 26px;
    }

    .section-title {
        font-size: 26px;
    }
}
</style>