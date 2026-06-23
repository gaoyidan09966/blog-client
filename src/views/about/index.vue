<template>
    <div class="about-page" @mousemove="onMouseMove">
        <!-- 鼠标光晕 -->
        <div class="cursor-glow" :style="{ left: cursorX + 'px', top: cursorY + 'px' }"></div>

        <!-- 1. Hero -->
        <section class="hero-section">
            <div class="hero-bg">
                <div class="hero-gradient"></div>
                <div class="hero-grid"></div>
                <div class="hero-noise"></div>
                <div class="hero-orbs">
                    <div class="h-orb h-orb-1"></div>
                    <div class="h-orb h-orb-2"></div>
                    <div class="h-orb h-orb-3"></div>
                    <div class="h-orb h-orb-4"></div>
                </div>
                <div class="hero-particles">
                    <div v-for="i in 40" :key="i" class="particle" :style="particleStyle(i)"></div>
                </div>
                <!-- 浮动几何 -->
                <div class="floating-shapes">
                    <div class="shape shape-1"></div>
                    <div class="shape shape-2"></div>
                    <div class="shape shape-3"></div>
                    <div class="shape shape-4"></div>
                    <div class="shape shape-5"></div>
                </div>
            </div>
            <div class="hero-content" :style="parallaxStyle">
                <div class="hero-badge float-badge">
                    <el-icon>
                        <User />
                    </el-icon>
                    ABOUT ME
                </div>
                <h1 class="hero-title">
                    你好，我是
                    <span class="title-highlight shimmer-text">{{ admin.nickname || '拾光笔记' }}</span>
                </h1>
                <p class="hero-subtitle">
                    <span class="typing-text">{{ displayText }}</span>
                    <span class="typing-cursor">|</span>
                </p>
                <div class="hero-stats">
                    <div class="stat-item" v-for="(stat, i) in heroStats" :key="i">
                        <div class="stat-ring">
                            <svg class="stat-ring-svg" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)"
                                    stroke-width="2" />
                                <circle cx="18" cy="18" r="15.5" fill="none" :stroke="stat.color" stroke-width="2"
                                    stroke-linecap="round" :stroke-dasharray="`${stat.percent} ${100 - stat.percent}`"
                                    stroke-dashoffset="25" class="stat-ring-progress" />
                            </svg>
                            <el-icon class="stat-ring-icon" :size="14">
                                <component :is="stat.icon" />
                            </el-icon>
                        </div>
                        <span class="stat-num">{{ stat.value }}</span>
                        <span class="stat-label">{{ stat.label }}</span>
                    </div>
                </div>
                <div class="scroll-hint">
                    <div class="scroll-mouse">
                        <div class="scroll-dot"></div>
                    </div>
                    <span>SCROLL</span>
                </div>
            </div>
        </section>

        <!-- 2. 关于博主 -->
        <section class="section section-about" ref="aboutRef">
            <div class="section-inner">
                <div class="section-header reveal-up">
                    <span class="section-tag glow-tag">INTRODUCE</span>
                    <h2 class="section-title">关于博主</h2>
                    <p class="section-desc">了解我的故事和技术历程</p>
                </div>
                <div class="about-grid">
                    <div class="about-card-left tilt-card" :class="{ 'show': aboutVisible }" @mousemove="onTiltMove"
                        @mouseleave="onTiltLeave">
                        <div class="card-shine"></div>
                        <div class="avatar-wrapper">
                            <div class="avatar-ring">
                                <div class="ring-spin"></div>
                                <el-avatar :size="100" :src="admin.avatar" class="about-avatar">
                                    {{ admin.nickname?.charAt(0) || 'A' }}
                                </el-avatar>
                            </div>
                            <div class="avatar-glow"></div>
                        </div>
                        <h3 class="about-name">{{ admin.nickname || '拾光笔记' }}</h3>
                        <p class="about-role">全栈开发者 · 博客作者</p>
                        <div class="about-social">
                            <a class="social-link magnetic" v-for="(s, i) in socials" :key="i" :title="s.label">
                                <el-icon :size="18">
                                    <component :is="s.icon" />
                                </el-icon>
                            </a>
                        </div>
                    </div>
                    <div class="about-card-right" :class="{ 'show': aboutVisible }">
                        <div class="about-text tilt-card" @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                            <div class="card-shine"></div>
                            <p>欢迎来到「拾光笔记」，这是我个人的技术博客。</p>
                            <p>我是一名全栈开发者，热衷于探索前后端技术，喜欢用代码解决问题，也喜欢用文字记录学习过程中的点滴。</p>
                            <p>这个博客使用 <strong>Vue3 + Express + MySQL</strong> 全栈开发，从前端到后端、从数据库到部署，都是我亲手搭建的。</p>
                            <p>在这里，你可以找到技术分享、项目实战、学习笔记等内容。希望这些文章能对你有所帮助。</p>
                        </div>
                        <div class="highlight-grid">
                            <div class="highlight-card tilt-card" v-for="(h, i) in highlights" :key="i"
                                :style="{ transitionDelay: (i * 0.1) + 's' }" @mousemove="onTiltMove"
                                @mouseleave="onTiltLeave">
                                <div class="card-shine"></div>
                                <div class="hl-icon-glow" :style="{ background: h.color }"></div>
                                <el-icon :size="22" :color="h.color">
                                    <component :is="h.icon" />
                                </el-icon>
                                <div class="hl-info">
                                    <span class="hl-title">{{ h.title }}</span>
                                    <span class="hl-desc">{{ h.desc }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 3. 技术栈 -->
        <section class="section section-tech" ref="techRef">
            <div class="section-inner">
                <div class="section-header reveal-up">
                    <span class="section-tag glow-tag">TECH STACK</span>
                    <h2 class="section-title">技术栈</h2>
                    <p class="section-desc">这个博客使用到的技术</p>
                </div>
                <div class="tech-grid">
                    <div v-for="(tech, index) in techStack" :key="index" class="tech-card tilt-card"
                        :class="{ 'show': techVisible }" :style="{ transitionDelay: index * 0.08 + 's' }"
                        @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                        <div class="card-shine"></div>
                        <div class="tech-icon-box" :style="{ background: tech.bg, color: tech.color }">
                            <el-icon :size="24">
                                <component :is="tech.icon" />
                            </el-icon>
                        </div>
                        <h4 class="tech-name">{{ tech.name }}</h4>
                        <p class="tech-desc">{{ tech.desc }}</p>
                        <div class="tech-bar">
                            <div class="tech-bar-fill" :style="{ width: tech.level + '%', background: tech.color }">
                            </div>
                        </div>
                        <span class="tech-level">{{ tech.level }}%</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- 4. 发展历程 -->
        <section class="section section-timeline" ref="timelineRef">
            <div class="section-inner">
                <div class="section-header reveal-up">
                    <span class="section-tag glow-tag">JOURNEY</span>
                    <h2 class="section-title">发展历程</h2>
                    <p class="section-desc">博客从零到一的成长故事</p>
                </div>
                <div class="timeline">
                    <div class="timeline-track">
                        <div class="timeline-track-glow"></div>
                    </div>
                    <div v-for="(item, index) in timeline" :key="index" class="timeline-item"
                        :class="[index % 2 === 0 ? 'tl-left' : 'tl-right', { 'show': timelineVisible }]"
                        :style="{ transitionDelay: index * 0.15 + 's' }">
                        <div class="tl-dot pulse-dot" :style="{ background: item.color, '--dot-color': item.color }">
                            <el-icon :size="14" color="#fff">
                                <component :is="item.icon" />
                            </el-icon>
                        </div>
                        <div class="tl-card tilt-card" @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                            <div class="card-shine"></div>
                            <span class="tl-date" :style="{ color: item.color }">{{ item.date }}</span>
                            <h4 class="tl-title">{{ item.title }}</h4>
                            <p class="tl-desc">{{ item.desc }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 5. 博客数据 -->
        <section class="section section-data" ref="dataRef">
            <div class="section-inner">
                <div class="section-header reveal-up">
                    <span class="section-tag glow-tag">BLOG DATA</span>
                    <h2 class="section-title">博客数据</h2>
                    <p class="section-desc">截至目前的博客运营数据</p>
                </div>
                <div class="data-grid">
                    <div class="data-card" v-for="(item, index) in dataCards" :key="index"
                        :class="{ 'show': dataVisible }" :style="{ transitionDelay: index * 0.1 + 's' }">
                        <div class="data-icon-box" :style="{ background: item.bg }">
                            <el-icon :size="24" :color="item.color">
                                <component :is="item.icon" />
                            </el-icon>
                        </div>
                        <div class="data-num">{{ item.value }}</div>
                        <div class="data-label">{{ item.label }}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 6. 联系方式 -->
        <section class="section section-contact" ref="contactRef">
            <div class="section-inner">
                <div class="section-header reveal-up">
                    <span class="section-tag glow-tag">CONTACT</span>
                    <h2 class="section-title">联系方式</h2>
                    <p class="section-desc">欢迎与我交流</p>
                </div>
                <div class="contact-grid">
                    <div class="contact-card tilt-card" v-for="(item, index) in contacts" :key="index"
                        :class="{ 'show': contactVisible }" :style="{ transitionDelay: index * 0.1 + 's' }"
                        @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                        <div class="card-shine"></div>
                        <div class="contact-icon-box" :style="{ background: item.bg }">
                            <el-icon :size="22" :color="item.color">
                                <component :is="item.icon" />
                            </el-icon>
                        </div>
                        <h4 class="contact-label">{{ item.label }}</h4>
                        <p class="contact-value">{{ item.value }}</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { getAdminInfo } from '../../api/user';
import request from '../../api/request';
import {
    User, Document, PriceTag, FolderOpened, ChatDotRound,
    Monitor, Connection, Coin, Cpu, DataLine,
    Promotion, EditPen, Brush, Sunrise, Aim,
    Message, Link, ChatLineRound, Flag, Trophy, Medal
} from '@element-plus/icons-vue';

const admin = ref({});
const cursorX = ref(-100);
const cursorY = ref(-100);
const mouseX = ref(0);
const mouseY = ref(0);

// 各区块可见性
const aboutVisible = ref(false);
const techVisible = ref(false);
const timelineVisible = ref(false);
const dataVisible = ref(false);
const contactVisible = ref(false);

const aboutRef = ref(null);
const techRef = ref(null);
const timelineRef = ref(null);
const dataRef = ref(null);
const contactRef = ref(null);

// 数据
const articleCount = ref(0);
const tagCount = ref(0);
const categoryCount = ref(0);
const commentCount = ref(0);

// 打字机效果
const fullText = '一个热爱技术与生活的开发者，用代码记录时光，用文字书写人生';
const displayText = ref('');
let typeTimer = null;

const startTyping = () => {
    let i = 0;
    const type = () => {
        if (i < fullText.length) {
            displayText.value += fullText[i];
            i++;
            typeTimer = setTimeout(type, 60 + Math.random() * 40);
        } else {
            // 打完后等一下再删除重打
            typeTimer = setTimeout(() => {
                displayText.value = '';
                i = 0;
                type();
            }, 4000);
        }
    };
    type();
};

// Hero 视差
const parallaxStyle = computed(() => {
    const x = (mouseX.value - window.innerWidth / 2) * 0.02;
    const y = (mouseY.value - window.innerHeight / 2) * 0.02;
    return { transform: `translate(${x}px, ${y}px)` };
});

// 鼠标事件
const onMouseMove = (e) => {
    cursorX.value = e.clientX;
    cursorY.value = e.clientY;
    mouseX.value = e.clientX;
    mouseY.value = e.clientY;
};

// 3D 倾斜
const onTiltMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    // 高光跟随
    const shine = card.querySelector('.card-shine');
    if (shine) {
        shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 60%)`;
    }
};

const onTiltLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    const shine = card.querySelector('.card-shine');
    if (shine) shine.style.background = 'transparent';
};

const heroStats = computed(() => [
    { icon: Document, label: '篇文章', value: articleCount.value, color: '#667eea', percent: 80 },
    { icon: PriceTag, label: '个标签', value: tagCount.value, color: '#4ECDC4', percent: 65 },
    { icon: FolderOpened, label: '个分类', value: categoryCount.value, color: '#FF6B6B', percent: 50 },
    { icon: ChatDotRound, label: '条评论', value: commentCount.value, color: '#FCD34D', percent: 70 },
]);

const particleStyle = (i) => ({
    width: (Math.random() * 4 + 2) + 'px',
    height: (Math.random() * 4 + 2) + 'px',
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    animationDelay: Math.random() * 8 + 's',
    animationDuration: Math.random() * 15 + 10 + 's',
    opacity: Math.random() * 0.4 + 0.1
});

const socials = [
    { icon: Message, label: '邮件' },
    { icon: Link, label: 'GitHub' },
    { icon: ChatLineRound, label: '微信' },
];

const highlights = [
    { icon: Promotion, title: '全栈开发', desc: 'Vue3 + Express + MySQL', color: '#667eea' },
    { icon: EditPen, title: '技术写作', desc: '记录学习，分享经验', color: '#4ECDC4' },
    { icon: Brush, title: 'UI 设计', desc: '注重用户体验与视觉美感', color: '#FF6B6B' },
    { icon: Sunrise, title: '持续学习', desc: '保持好奇心，拥抱新技术', color: '#F59E0B' },
];

const techStack = [
    { icon: Monitor, name: 'Vue3', desc: '前端框架', level: 90, color: '#4FC08D', bg: '#f0fdf4' },
    { icon: Connection, name: 'Express', desc: '后端框架', level: 85, color: '#333', bg: '#f5f5f5' },
    { icon: DataLine, name: 'MySQL', desc: '关系型数据库', level: 80, color: '#4479A1', bg: '#eff6ff' },
    { icon: Cpu, name: 'Vite', desc: '构建工具', level: 88, color: '#646CFF', bg: '#f5f3ff' },
    { icon: Aim, name: 'Element Plus', desc: 'UI 组件库', level: 92, color: '#409EFF', bg: '#ecf5ff' },
    { icon: Coin, name: 'JWT', desc: '身份认证', level: 78, color: '#F59E0B', bg: '#fffbeb' },
    { icon: Link, name: 'RESTful API', desc: '接口设计', level: 85, color: '#8B5CF6', bg: '#f5f3ff' },
    { icon: Brush, name: 'CSS3', desc: '样式与动画', level: 88, color: '#E44D26', bg: '#fff7ed' },
];

const timeline = [
    { date: '2026年6月', title: '博客项目启动', desc: '确定技术方案，搭建项目架构，开始前后端开发', color: '#667eea', icon: Flag },
    { date: '2026年6月', title: '核心功能完成', desc: '文章管理、分类标签、评论系统、用户管理等功能上线', color: '#4ECDC4', icon: Trophy },
    { date: '2026年6月', title: '前台页面优化', desc: '首页改版、轮播图、搜索功能、留言墙等功能上线', color: '#FF6B6B', icon: Medal },
    { date: '2026年6月', title: '仪表盘上线', desc: '后台管理加入数据统计、ECharts 图表等功能', color: '#F59E0B', icon: DataLine },
];

const dataCards = reactive([
    { icon: Document, label: '文章总数', value: 0, color: '#667eea', bg: '#eef2ff' },
    { icon: FolderOpened, label: '分类数量', value: 0, color: '#4ECDC4', bg: '#e8faf8' },
    { icon: PriceTag, label: '标签数量', value: 0, color: '#FF6B6B', bg: '#fff0f0' },
    { icon: ChatDotRound, label: '评论总数', value: 0, color: '#F59E0B', bg: '#fffbeb' },
]);

const contacts = [
    { icon: Message, label: '电子邮箱', value: 'admin@example.com', color: '#667eea', bg: '#eef2ff' },
    { icon: Link, label: 'GitHub', value: 'github.com', color: '#333', bg: '#f5f5f5' },
    { icon: ChatLineRound, label: '微信', value: '暂未公开', color: '#4ECDC4', bg: '#e8faf8' },
];

const animateNumber = (targetRef, targetValue, duration = 1500) => {
    const startTime = Date.now();
    const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        targetRef.value = Math.floor(eased * targetValue);
        if (progress < 1) requestAnimationFrame(step);
        else targetRef.value = targetValue;
    };
    requestAnimationFrame(step);
};

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
        animateNumber(articleCount, articleCount.value);
        animateNumber(tagCount, tagCount.value);
        animateNumber(categoryCount, categoryCount.value);
        animateNumber(commentCount, commentCount.value);
    } catch (error) { console.error('获取数据失败:', error); }
};

let observer = null;
const setupObserver = () => {
    const targets = [
        { ref: aboutRef, visible: aboutVisible },
        { ref: techRef, visible: techVisible },
        { ref: timelineRef, visible: timelineVisible },
        { ref: dataRef, visible: dataVisible },
        { ref: contactRef, visible: contactVisible },
    ];
    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const target = targets.find(t => t.ref.value === entry.target);
            if (target && entry.isIntersecting) target.visible.value = true;
        });
    }, { threshold: 0.12 });
    targets.forEach(t => { if (t.ref.value) observer.observe(t.ref.value); });
};

onMounted(() => {
    fetchData();
    setupObserver();
    startTyping();
});

onUnmounted(() => {
    if (observer) observer.disconnect();
    if (typeTimer) clearTimeout(typeTimer);
});
</script>

<style scoped>
.about-page {
    background: #f5f6f8;
    cursor: none;
    overflow-x: hidden;
}

@media (max-width: 768px) {
    .about-page {
        cursor: auto;
    }
}

/* 自定义光标 */
.cursor-glow {
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: left 0.1s ease-out, top 0.1s ease-out;
    display: none;
}

@media (min-width: 768px) {
    .cursor-glow {
        display: block;
    }
}

/* ==================== HERO ==================== */
.hero-section {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #08081a;
}

.hero-bg {
    position: absolute;
    inset: 0;
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
}

/* 噪点纹理 */
.hero-noise {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 128px 128px;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse at 25% 40%, rgba(102, 126, 234, 0.2) 0%, transparent 55%),
        radial-gradient(ellipse at 75% 30%, rgba(167, 139, 250, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(244, 114, 182, 0.12) 0%, transparent 50%);
}

.hero-orbs {
    position: absolute;
    inset: 0;
}

.h-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
}

.h-orb-1 {
    width: 300px;
    height: 300px;
    background: #667eea;
    opacity: 0.2;
    top: -100px;
    left: -80px;
    animation: orbFloat 12s ease-in-out infinite;
}

.h-orb-2 {
    width: 250px;
    height: 250px;
    background: #A78BFA;
    opacity: 0.15;
    bottom: -80px;
    right: -60px;
    animation: orbFloat 15s ease-in-out infinite reverse;
}

.h-orb-3 {
    width: 180px;
    height: 180px;
    background: #F472B6;
    opacity: 0.12;
    top: 30%;
    right: 10%;
    animation: orbFloat 10s ease-in-out infinite 3s;
}

.h-orb-4 {
    width: 200px;
    height: 200px;
    background: #4ECDC4;
    opacity: 0.1;
    bottom: 20%;
    left: 5%;
    animation: orbFloat 14s ease-in-out infinite 5s;
}

@keyframes orbFloat {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    25% {
        transform: translate(30px, -20px) scale(1.05);
    }

    50% {
        transform: translate(-20px, 15px) scale(0.95);
    }

    75% {
        transform: translate(15px, 25px) scale(1.02);
    }
}

/* 浮动几何体 */
.floating-shapes {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.shape {
    position: absolute;
    border: 1px solid rgba(255, 255, 255, 0.06);
    animation: shapeFloat linear infinite;
}

.shape-1 {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    top: 15%;
    left: 10%;
    animation-duration: 20s;
    transform-origin: center;
}

.shape-2 {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    top: 70%;
    left: 80%;
    animation-duration: 25s;
}

.shape-3 {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    top: 60%;
    left: 20%;
    animation-duration: 18s;
    border-color: rgba(102, 126, 234, 0.08);
}

.shape-4 {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    top: 25%;
    right: 15%;
    animation-duration: 22s;
    border-color: rgba(244, 114, 182, 0.06);
}

.shape-5 {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    bottom: 25%;
    right: 25%;
    animation-duration: 28s;
}

@keyframes shapeFloat {
    0% {
        transform: translateY(0) rotate(0deg);
    }

    25% {
        transform: translateY(-30px) rotate(90deg);
    }

    50% {
        transform: translateY(10px) rotate(180deg);
    }

    75% {
        transform: translateY(-20px) rotate(270deg);
    }

    100% {
        transform: translateY(0) rotate(360deg);
    }
}

.hero-particles .particle {
    position: absolute;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    animation: particleDrift linear infinite;
}

@keyframes particleDrift {

    0%,
    100% {
        transform: translateY(0) translateX(0);
        opacity: 0;
    }

    10% {
        opacity: 1;
    }

    90% {
        opacity: 1;
    }

    25% {
        transform: translateY(-40px) translateX(25px);
    }

    50% {
        transform: translateY(-20px) translateX(-15px);
    }

    75% {
        transform: translateY(-60px) translateX(20px);
    }
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 20px;
    transition: transform 0.1s ease-out;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 20px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    font-weight: 800;
    border-radius: 30px;
    letter-spacing: 4px;
    margin-bottom: 28px;
    animation: fadeInDown 0.8s ease both;
}

.float-badge {
    animation: fadeInDown 0.8s ease both, badgeFloat 4s ease-in-out infinite 1s;
}

@keyframes badgeFloat {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-6px);
    }
}

.hero-title {
    font-size: 36px;
    font-weight: 900;
    color: #fff;
    margin: 0 0 16px;
    line-height: 1.3;
    animation: fadeInUp 0.8s ease 0.15s both;
}

@media (min-width: 768px) {
    .hero-title {
        font-size: 56px;
    }
}

.title-highlight {
    background: linear-gradient(135deg, #667eea, #A78BFA, #F472B6, #667eea);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmerGradient 4s ease infinite;
}

@keyframes shimmerGradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.hero-subtitle {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.45);
    margin: 0 auto 36px;
    max-width: 520px;
    line-height: 1.7;
    min-height: 2.8em;
    animation: fadeInUp 0.8s ease 0.3s both;
}

@media (min-width: 768px) {
    .hero-subtitle {
        font-size: 17px;
        margin-bottom: 44px;
    }
}

.typing-cursor {
    color: rgba(255, 255, 255, 0.6);
    animation: blink 0.8s ease infinite;
    font-weight: 300;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

.hero-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 420px;
    margin: 0 auto 50px;
    animation: fadeInUp 0.8s ease 0.45s both;
}

@media (min-width: 640px) {
    .hero-stats {
        grid-template-columns: repeat(4, 1fr);
        max-width: 560px;
        gap: 16px;
    }
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 8px;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    transition: all 0.3s;
}

.stat-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

.stat-ring {
    position: relative;
    width: 36px;
    height: 36px;
}

.stat-ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.stat-ring-progress {
    transition: stroke-dasharray 1s ease;
}

.stat-ring-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255, 255, 255, 0.7);
}

.stat-num {
    font-size: 22px;
    font-weight: 900;
    color: #fff;
    line-height: 1;
}

.stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
}

.scroll-hint {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.25);
    font-size: 10px;
    letter-spacing: 3px;
    animation: scrollBounce 2.5s ease-in-out infinite;
}

.scroll-mouse {
    width: 20px;
    height: 30px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    display: flex;
    justify-content: center;
    padding-top: 6px;
}

.scroll-dot {
    width: 3px;
    height: 7px;
    background: rgba(255, 255, 255, 0.35);
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
        opacity: 0.2;
        transform: translateY(7px);
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

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-25px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(25px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ==================== 通用区块 ==================== */
.section {
    padding: 60px 0;
}

@media (min-width: 768px) {
    .section {
        padding: 80px 0;
    }
}

.section-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 16px;
}

@media (min-width: 768px) {
    .section-inner {
        padding: 0 24px;
    }
}

.section-header {
    text-align: center;
    margin-bottom: 36px;
}

@media (min-width: 768px) {
    .section-header {
        margin-bottom: 50px;
    }
}

/* 滚动揭示动画 */
.reveal-up {
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.section:nth-child(n) .reveal-up {
    opacity: 1;
    transform: none;
}

.section-tag {
    display: inline-block;
    padding: 4px 16px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 3px;
    border-radius: 20px;
    margin-bottom: 14px;
}

@media (min-width: 768px) {
    .section-tag {
        font-size: 11px;
    }
}

/* 发光标签 */
.glow-tag {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    animation: tagGlow 3s ease-in-out infinite;
}

@keyframes tagGlow {

    0%,
    100% {
        box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    }

    50% {
        box-shadow: 0 0 30px rgba(102, 126, 234, 0.5), 0 0 60px rgba(102, 126, 234, 0.2);
    }
}

.section-title {
    font-size: 28px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 8px;
}

@media (min-width: 768px) {
    .section-title {
        font-size: 34px;
    }
}

.section-desc {
    font-size: 14px;
    color: #999;
    margin: 0;
}

/* ==================== 3D 倾斜卡片 + 高光 ==================== */
.tilt-card {
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.3s ease;
    will-change: transform;
    overflow: hidden;
}

.card-shine {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 5;
    transition: background 0.15s;
}

/* ==================== 关于博主 ==================== */
.section-about {
    background: #fff;
}

.about-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
}

@media (min-width: 768px) {
    .about-grid {
        grid-template-columns: 260px 1fr;
        gap: 30px;
        align-items: start;
    }
}

.about-card-left {
    text-align: center;
    padding: 32px 20px;
    background: #fafbff;
    border-radius: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease, transform 0.8s ease;
}

.about-card-left.show {
    opacity: 1;
    transform: translateY(0);
}

@media (min-width: 768px) {
    .about-card-left {
        padding: 36px 24px;
    }
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;
}

.avatar-ring {
    display: inline-block;
    padding: 5px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    position: relative;
    overflow: hidden;
}

.ring-spin {
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #667eea, #F472B6, #4ECDC4, #667eea);
    animation: ringRotate 3s linear infinite;
    opacity: 0.6;
}

@keyframes ringRotate {
    to {
        transform: rotate(360deg);
    }
}

.avatar-glow {
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    opacity: 0.15;
    filter: blur(16px);
    animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {

    0%,
    100% {
        opacity: 0.15;
        transform: scale(1);
    }

    50% {
        opacity: 0.25;
        transform: scale(1.1);
    }
}

.about-avatar {
    background: #fff;
    color: #667eea;
    font-size: 42px;
    font-weight: 900;
    position: relative;
    z-index: 2;
}

.about-name {
    font-size: 20px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 4px;
}

.about-role {
    font-size: 13px;
    color: #999;
    margin: 0 0 18px;
}

.about-social {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.social-link {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid #f0f0f0;
    text-decoration: none;
}

.social-link:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    color: #667eea;
    border-color: #667eea;
}

.about-card-right {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
}

.about-card-right.show {
    opacity: 1;
    transform: translateY(0);
}

.about-text {
    padding: 24px;
    background: #fafbff;
    border-radius: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    margin-bottom: 18px;
}

@media (min-width: 768px) {
    .about-text {
        padding: 32px;
    }
}

.about-text p {
    font-size: 14px;
    color: #555;
    line-height: 1.8;
    margin: 0 0 10px;
}

.about-text p:last-child {
    margin: 0;
}

.about-text strong {
    color: #1a1a2e;
}

.highlight-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
}

@media (min-width: 640px) {
    .highlight-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
    }
}

.highlight-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: #fafbff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease, box-shadow 0.3s ease;
    opacity: 0;
    animation: fadeInUp 0.6s ease forwards;
}

.highlight-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.hl-icon-glow {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    opacity: 0.08;
    filter: blur(12px);
    left: 14px;
}

.hl-info {
    display: flex;
    flex-direction: column;
}

.hl-title {
    font-size: 13px;
    font-weight: 700;
    color: #1a1a2e;
}

.hl-desc {
    font-size: 11px;
    color: #999;
}

/* ==================== 技术栈 ==================== */
.tech-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

@media (min-width: 640px) {
    .tech-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
}

@media (min-width: 1024px) {
    .tech-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
    }
}

.tech-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px 16px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
    opacity: 0;
}

.tech-card.show {
    opacity: 1;
    transform: translateY(0) !important;
}

@media (min-width: 768px) {
    .tech-card {
        padding: 24px 20px;
    }
}

.tech-card:hover {
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.tech-icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    transition: transform 0.3s;
}

@media (min-width: 768px) {
    .tech-icon-box {
        width: 56px;
        height: 56px;
        border-radius: 16px;
    }
}

.tech-card:hover .tech-icon-box {
    transform: scale(1.1) rotate(-5deg);
}

.tech-name {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 4px;
}

.tech-desc {
    font-size: 11px;
    color: #999;
    margin: 0 0 12px;
}

.tech-bar {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 6px;
}

.tech-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 1.5s ease;
}

.tech-level {
    font-size: 11px;
    font-weight: 700;
    color: #bbb;
}

/* ==================== 发展历程 ==================== */
.section-timeline {
    background: #fff;
}

.timeline {
    position: relative;
    padding: 20px 0;
}

.timeline-track {
    position: absolute;
    left: 24px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

@media (min-width: 768px) {
    .timeline-track {
        left: 50%;
        transform: translateX(-50%);
    }
}

.timeline-track-glow {
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, transparent, #667eea, #4ECDC4, #FF6B6B, transparent);
    animation: trackGlow 4s ease-in-out infinite;
}

@keyframes trackGlow {
    0% {
        top: -100%;
    }

    100% {
        top: 100%;
    }
}

.timeline-item {
    position: relative;
    padding-left: 56px;
    padding-bottom: 32px;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.timeline-item.show {
    opacity: 1;
    transform: translateY(0);
}

@media (min-width: 768px) {
    .timeline-item {
        width: 50%;
        padding-bottom: 40px;
    }

    .timeline-item.tl-left {
        left: 0;
        text-align: right;
        padding-left: 0;
        padding-right: 56px;
    }

    .timeline-item.tl-right {
        left: 50%;
        text-align: left;
        padding-left: 56px;
        padding-right: 0;
    }
}

.tl-dot {
    position: absolute;
    top: 4px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
    z-index: 2;
}

.timeline-item .tl-dot {
    left: 8px;
}

@media (min-width: 768px) {
    .timeline-item.tl-left .tl-dot {
        left: auto;
        right: -16px;
    }

    .timeline-item.tl-right .tl-dot {
        left: -16px;
    }
}

.pulse-dot::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid var(--dot-color);
    animation: dotPulse 2s ease-out infinite;
}

@keyframes dotPulse {
    0% {
        transform: scale(1);
        opacity: 0.6;
    }

    100% {
        transform: scale(1.8);
        opacity: 0;
    }
}

.tl-card {
    padding: 18px 20px;
    background: #fafbff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.tl-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.tl-date {
    font-size: 12px;
    font-weight: 700;
}

.tl-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 6px 0;
}

.tl-desc {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.6;
}

/* ==================== 博客数据 ==================== */
.data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
}

@media (min-width: 640px) {
    .data-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
    }
}

.data-card {
    text-align: center;
    padding: 28px 16px;
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.4s;
}

.data-card.show {
    opacity: 1;
    transform: translateY(0);
}

@media (min-width: 768px) {
    .data-card {
        padding: 32px 20px;
    }
}

.data-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--accent-light));
}

.data-card:nth-child(1) {
    --accent: #667eea;
    --accent-light: #8ba0f5;
}

.data-card:nth-child(2) {
    --accent: #4ECDC4;
    --accent-light: #7EDDD6;
}

.data-card:nth-child(3) {
    --accent: #FF6B6B;
    --accent-light: #FF9F9F;
}

.data-card:nth-child(4) {
    --accent: #F59E0B;
    --accent-light: #FCD34D;
}

/* 流光边框 */
.data-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, transparent 40%, var(--accent) 50%, transparent 60%);
    background-size: 300% 300%;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: borderFlow 4s ease infinite;
    opacity: 0;
    transition: opacity 0.3s;
}

.data-card:hover::after {
    opacity: 1;
}

@keyframes borderFlow {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

.data-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.data-icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
}

@media (min-width: 768px) {
    .data-icon-box {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        margin-bottom: 16px;
    }
}

.data-num {
    font-size: 36px;
    font-weight: 900;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
}

@media (min-width: 768px) {
    .data-num {
        font-size: 42px;
    }
}

.data-label {
    font-size: 13px;
    color: #999;
    margin-top: 4px;
}

/* ==================== 联系方式 ==================== */
.section-contact {
    background: #fff;
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
}

@media (min-width: 640px) {
    .contact-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }
}

.contact-card {
    text-align: center;
    padding: 28px 16px;
    background: #fafbff;
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s;
}

.contact-card.show {
    opacity: 1;
    transform: translateY(0);
}

@media (min-width: 768px) {
    .contact-card {
        padding: 32px 20px;
    }
}

.contact-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.contact-icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
}

.contact-label {
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 6px;
}

.contact-value {
    font-size: 13px;
    color: #666;
    margin: 0;
}

/* ==================== 全局滚动条美化 ==================== */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.5);
}
</style>