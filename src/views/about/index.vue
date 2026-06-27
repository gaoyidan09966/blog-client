<template>
    <div class="about-page" @mousemove="onMouseMove">
        <div class="cursor-glow" :style="glowPos"></div>

        <!-- ==================== Hero ==================== -->
        <section class="hero">
            <div class="hero-bg">
                <div class="hero-gradient"></div>
                <div class="hero-grid"></div>
                <div class="hero-noise"></div>
                <div class="hero-orbs">
                    <div v-for="n in 4" :key="n" :class="['h-orb', `h-orb-${n}`]"></div>
                </div>
                <div class="hero-particles">
                    <div v-for="(p, i) in particles" :key="i" class="particle" :style="p"></div>
                </div>
                <div class="floating-shapes">
                    <div v-for="n in 5" :key="n" :class="['shape', `shape-${n}`]"></div>
                </div>
            </div>

            <div class="hero-content" :style="parallaxStyle">
                <div class="hero-badge">
                    <el-icon>
                        <User />
                    </el-icon> ABOUT ME
                </div>
                <h1 class="hero-title">
                    你好，我是
                    <span class="gradient-text">{{ admin.nickname || '拾光笔记' }}</span>
                </h1>
                <p class="hero-subtitle">
                    <span>{{ displayText }}</span><span class="typing-cursor">|</span>
                </p>
                <div class="hero-stats">
                    <div class="stat-item" v-for="(s, i) in heroStats" :key="i">
                        <div class="stat-ring">
                            <svg viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,.1)"
                                    stroke-width="2" />
                                <circle cx="18" cy="18" r="15.5" fill="none" :stroke="s.color" stroke-width="2"
                                    stroke-linecap="round" :stroke-dasharray="`${s.percent} ${100 - s.percent}`"
                                    stroke-dashoffset="25" class="ring-anim" />
                            </svg>
                            <el-icon class="ring-icon" :size="14">
                                <component :is="s.icon" />
                            </el-icon>
                        </div>
                        <span class="stat-num">{{ s.value }}</span>
                        <span class="stat-label">{{ s.label }}</span>
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

        <!-- ==================== 关于博主 ==================== -->
        <section class="section sec-about" ref="aboutRef">
            <div class="container">
                <div class="section-head reveal">
                    <span class="section-tag">INTRODUCE</span>
                    <h2 class="section-title">关于博主</h2>
                    <p class="section-desc">了解我的故事和技术历程</p>
                </div>
                <div class="about-grid">
                    <div class="about-sidebar reveal tilt-card" @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                        <div class="card-shine"></div>
                        <div class="avatar-wrap">
                            <div class="avatar-ring">
                                <div class="ring-spin"></div>
                            </div>
                            <el-avatar :size="100" :src="admin.avatar" class="about-avatar">
                                {{ admin.nickname?.charAt(0) || 'A' }}
                            </el-avatar>
                        </div>
                        <h3>{{ admin.nickname || '拾光笔记' }}</h3>
                        <p class="muted">全栈开发者 · 优秀作者</p>
                        <div class="socials">
                            <a v-for="(s, i) in socials" :key="i" class="social-btn" :title="s.label">
                                <el-icon :size="18">
                                    <component :is="s.icon" />
                                </el-icon>
                            </a>
                        </div>
                    </div>
                    <div class="about-main">
                        <div class="about-text reveal tilt-card" @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                            <div class="card-shine"></div>
                            <p>欢迎来到「拾光笔记」，这是我个人的技术网站。</p>
                            <p>我是一名全栈开发者，热衷于探索前后端技术，喜欢用代码解决问题，也喜欢用文字记录学习过程中的点滴。</p>
                            <p>这个网站使用 <strong>Vue3 + Express + MySQL</strong> 全栈开发，从前端到后端、从数据库到部署，都是独立开发完成。</p>
                            <p>在这里，你可以找到技术分享、项目实战、学习笔记等内容。希望这些文章能对你有所帮助。</p>
                        </div>
                        <div class="highlight-grid">
                            <div v-for="(h, i) in highlights" :key="i" class="highlight-card reveal tilt-card"
                                @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                                <div class="card-shine"></div>
                                <div class="hl-glow" :style="{ background: h.color }"></div>
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

        <!-- ==================== 技术栈 ==================== -->
        <section class="section sec-tech" ref="techRef">
            <div class="container">
                <div class="section-head reveal">
                    <span class="section-tag">TECH STACK</span>
                    <h2 class="section-title">技术栈</h2>
                    <p class="section-desc">这个网站使用到的技术</p>
                </div>
                <div class="tech-grid">
                    <div v-for="(t, i) in techStack" :key="i" class="tech-card reveal tilt-card" @mousemove="onTiltMove"
                        @mouseleave="onTiltLeave">
                        <div class="card-shine"></div>
                        <div class="icon-box" :style="{ background: t.bg, color: t.color }">
                            <el-icon :size="24">
                                <component :is="t.icon" />
                            </el-icon>
                        </div>
                        <h4>{{ t.name }}</h4>
                        <p class="muted">{{ t.desc }}</p>
                        <div class="bar">
                            <div class="bar-fill" :style="{ width: t.level + '%', background: t.color }"></div>
                        </div>
                        <span class="tech-level">{{ t.level }}%</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- ==================== 发展历程 ==================== -->
        <section class="section sec-timeline" ref="timelineRef">
            <div class="container">
                <div class="section-head reveal">
                    <span class="section-tag">JOURNEY</span>
                    <h2 class="section-title">发展历程</h2>
                    <p class="section-desc">网站从零到一的成长故事</p>
                </div>
                <div class="timeline">
                    <div class="tl-track">
                        <div class="tl-track-glow"></div>
                    </div>
                    <div v-for="(item, i) in timeline" :key="i"
                        :class="['tl-item', 'reveal', i % 2 === 0 ? 'tl-left' : 'tl-right']">
                        <div class="tl-dot" :style="{ '--dot-color': item.color, background: item.color }">
                            <el-icon :size="14" color="#fff">
                                <component :is="item.icon" />
                            </el-icon>
                        </div>
                        <div class="tl-card tilt-card" @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                            <div class="card-shine"></div>
                            <span class="tl-date" :style="{ color: item.color }">{{ item.date }}</span>
                            <h4>{{ item.title }}</h4>
                            <p>{{ item.desc }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ==================== 网站数据 ==================== -->
        <section class="section sec-data" ref="dataRef">
            <div class="container">
                <div class="section-head reveal">
                    <span class="section-tag">BLOG DATA</span>
                    <h2 class="section-title">网站数据</h2>
                    <p class="section-desc">截至目前的网站运营数据</p>
                </div>
                <div class="data-grid">
                    <div v-for="(d, i) in dataCards" :key="i" class="data-card reveal" :style="{ '--accent': d.color }">
                        <div class="icon-box" :style="{ background: d.bg }">
                            <el-icon :size="24" :color="d.color">
                                <component :is="d.icon" />
                            </el-icon>
                        </div>
                        <div class="data-num">{{ d.value }}</div>
                        <div class="data-label">{{ d.label }}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- ==================== 联系方式 ==================== -->
        <section class="section sec-contact" ref="contactRef">
            <div class="container">
                <div class="section-head reveal">
                    <span class="section-tag">CONTACT</span>
                    <h2 class="section-title">联系方式</h2>
                    <p class="section-desc">欢迎与我交流</p>
                </div>
                <div class="contact-grid">
                    <div v-for="(c, i) in contacts" :key="i" class="contact-card reveal tilt-card"
                        @mousemove="onTiltMove" @mouseleave="onTiltLeave">
                        <div class="card-shine"></div>
                        <div class="icon-box" :style="{ background: c.bg }">
                            <el-icon :size="22" :color="c.color">
                                <component :is="c.icon" />
                            </el-icon>
                        </div>
                        <h4>{{ c.label }}</h4>
                        <p>{{ c.value }}</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, markRaw } from 'vue';
import { getAdminInfo } from '../../api/user';
import request from '../../api/request';
import {
    User, Document, PriceTag, FolderOpened, ChatDotRound,
    Monitor, Connection, Coin, Cpu, DataLine,
    Promotion, EditPen, Brush, Sunrise, Aim,
    Message, Link, ChatLineRound, Flag, Trophy, Medal
} from '@element-plus/icons-vue';

/* ========== 图标缓存（避免响应式开销） ========== */
const I = {
    User: markRaw(User), Document: markRaw(Document), PriceTag: markRaw(PriceTag),
    FolderOpened: markRaw(FolderOpened), ChatDotRound: markRaw(ChatDotRound),
    Monitor: markRaw(Monitor), Connection: markRaw(Connection), Coin: markRaw(Coin),
    Cpu: markRaw(Cpu), DataLine: markRaw(DataLine), Promotion: markRaw(Promotion),
    EditPen: markRaw(EditPen), Brush: markRaw(Brush), Sunrise: markRaw(Sunrise),
    Aim: markRaw(Aim), Message: markRaw(Message), Link: markRaw(Link),
    ChatLineRound: markRaw(ChatLineRound), Flag: markRaw(Flag),
    Trophy: markRaw(Trophy), Medal: markRaw(Medal),
};

/* ========== 响应式状态 ========== */
const admin = ref({});
const cursorX = ref(-100), cursorY = ref(-100);
const mouseX = ref(0), mouseY = ref(0);
const articleCount = ref(0), tagCount = ref(0), categoryCount = ref(0), commentCount = ref(0);

const aboutRef = ref(null), techRef = ref(null), timelineRef = ref(null), dataRef = ref(null), contactRef = ref(null);

/* ========== 打字机效果 ========== */
const fullText = '一个热爱技术与生活的开发者，用代码记录时光，用文字书写人生';
const displayText = ref('');
let typeTimer = null;

const startTyping = () => {
    let i = 0;
    const type = () => {
        if (i < fullText.length) {
            displayText.value += fullText[i++];
            typeTimer = setTimeout(type, 60 + Math.random() * 40);
        } else {
            typeTimer = setTimeout(() => { displayText.value = ''; i = 0; type(); }, 4000);
        }
    };
    type();
};

/* ========== 计算属性 ========== */
const glowPos = computed(() => ({ left: cursorX.value + 'px', top: cursorY.value + 'px' }));

const parallaxStyle = computed(() => {
    const x = (mouseX.value - window.innerWidth / 2) * 0.02;
    const y = (mouseY.value - window.innerHeight / 2) * 0.02;
    return { transform: `translate(${x}px, ${y}px)` };
});

const heroStats = computed(() => [
    { icon: I.Document, label: '篇文章', value: articleCount.value, color: '#667eea', percent: 80 },
    { icon: I.PriceTag, label: '个标签', value: tagCount.value, color: '#4ECDC4', percent: 65 },
    { icon: I.FolderOpened, label: '个分类', value: categoryCount.value, color: '#FF6B6B', percent: 50 },
    { icon: I.ChatDotRound, label: '条评论', value: commentCount.value, color: '#FCD34D', percent: 70 },
]);

const particles = computed(() =>
    Array.from({ length: 40 }, () => ({
        width: Math.random() * 4 + 2 + 'px',
        height: Math.random() * 4 + 2 + 'px',
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 8 + 's',
        animationDuration: Math.random() * 15 + 10 + 's',
        opacity: Math.random() * 0.4 + 0.1,
    }))
);

/* ========== 静态数据 ========== */
const socials = [
    { icon: I.Message, label: '邮件' },
    { icon: I.Link, label: 'GitHub' },
    { icon: I.ChatLineRound, label: '微信' },
];

const highlights = [
    { icon: I.Promotion, title: '全栈开发', desc: 'Vue3 + Express + MySQL', color: '#667eea' },
    { icon: I.EditPen, title: '技术写作', desc: '记录学习，分享经验', color: '#4ECDC4' },
    { icon: I.Brush, title: 'UI 设计', desc: '注重用户体验与视觉美感', color: '#FF6B6B' },
    { icon: I.Sunrise, title: '持续学习', desc: '保持好奇心，拥抱新技术', color: '#F59E0B' },
];

const techStack = [
    { icon: I.Monitor, name: 'Vue3', desc: '前端框架', level: 90, color: '#4FC08D', bg: '#f0fdf4' },
    { icon: I.Connection, name: 'Express', desc: '后端框架', level: 85, color: '#333', bg: '#f5f5f5' },
    { icon: I.Coin, name: 'MySQL', desc: '关系型数据库', level: 80, color: '#4479A1', bg: '#eff6ff' },
    { icon: I.Cpu, name: 'Vite', desc: '构建工具', level: 88, color: '#646CFF', bg: '#f5f3ff' },
    { icon: I.Aim, name: 'Element Plus', desc: 'UI 组件库', level: 92, color: '#409EFF', bg: '#ecf5ff' },
    { icon: I.DataLine, name: 'JWT', desc: '身份认证', level: 78, color: '#F59E0B', bg: '#fffbeb' },
    { icon: I.Link, name: 'RESTful API', desc: '接口设计', level: 85, color: '#8B5CF6', bg: '#f5f3ff' },
    { icon: I.Brush, name: 'CSS3', desc: '样式与动画', level: 88, color: '#E44D26', bg: '#fff7ed' },
];

const timeline = [
    { date: '2026年5月', title: '需求分析与立项', desc: '明确博客系统定位，确定支持文章发布、分类管理、评论互动、商品展示等核心功能，完成需求文档编写', color: '#667eea', icon: I.Flag },
    { date: '2026年5月', title: '技术选型', desc: '前端 Vue3 + uni-app，后端 Express + MySQL，管理端 React + Vite，确定项目整体技术栈', color: '#764ba2', icon: I.DataLine },
    { date: '2026年5月', title: '数据库设计', desc: '设计用户表、文章表、分类表、标签表、评论表、商品表、订单表等核心数据模型，建立表关联', color: '#4ECDC4', icon: I.Trophy },
    { date: '2026年6月初', title: '后端基础架构搭建', desc: '初始化 Express 项目，配置中间件（CORS、JWT、文件上传），搭建路由与控制器分层架构', color: '#667eea', icon: I.Flag },
    { date: '2026年6月初', title: '用户认证系统', desc: '实现注册登录、JWT 鉴权、角色权限（管理员/普通用户）、bcrypt 密码加密', color: '#F59E0B', icon: I.Medal },
    { date: '2026年6月中', title: '文章管理 API', desc: '完成文章 CRUD、分页查询、分类筛选、标签关联、上下篇导航、富文本内容存储', color: '#4ECDC4', icon: I.Trophy },
    { date: '2026年6月中', title: '分类与标签系统', desc: '实现分类树形结构、标签多对多关联、按分类/标签筛选文章等接口', color: '#764ba2', icon: I.DataLine },
    { date: '2026年6月中', title: '评论系统', desc: '支持文章评论、回复、评论分页、最新评论查询、评论数量统计', color: '#FF6B6B', icon: I.Medal },
    { date: '2026年6月下', title: '商品与订单模块', desc: '实现商品管理、商品分类、购物车逻辑、订单创建与查询接口', color: '#F59E0B', icon: I.Trophy },
    { date: '2026年6月下', title: '图片上传与管理', desc: '基于 multer 实现图片上传、本地存储、缩略图生成、文件管理', color: '#667eea', icon: I.Flag },
    { date: '2026年7月初', title: 'PC 管理端启动', desc: '基于 React + Vite 搭建后台管理面板，实现登录页、侧边栏导航、顶部导航布局', color: '#764ba2', icon: I.DataLine },
    { date: '2026年7月初', title: '仪表盘与数据统计', desc: '集成 ECharts 图表，实现文章数量、访问量、评论量、用户增长等数据可视化面板', color: '#4ECDC4', icon: I.Trophy },
    { date: '2026年7月中', title: '文章管理后台', desc: '实现文章列表（搜索、筛选、排序）、富文本编辑器、Markdown 编辑器、封面图上传、草稿箱', color: '#FF6B6B', icon: I.Medal },
    { date: '2026年7月中', title: '分类标签管理后台', desc: '分类的增删改查、拖拽排序；标签的颜色配置、批量操作、使用频次统计', color: '#F59E0B', icon: I.Flag },
    { date: '2026年7月中', title: '用户与评论管理', desc: '用户列表、角色分配、禁用启用；评论审核、批量删除、敏感词过滤', color: '#667eea', icon: I.DataLine },
    { date: '2026年7月下', title: '商品管理后台', desc: '商品上下架、库存管理、价格设置、商品分类、轮播图管理', color: '#764ba2', icon: I.Trophy },
    { date: '2026年7月下', title: '站点设置模块', desc: '网站名称、Logo、SEO 信息、公告管理、关于页信息配置', color: '#4ECDC4', icon: I.Medal },
    { date: '2026年8月初', title: '小程序项目启动', desc: '基于 uni-app + Vue3 搭建微信小程序项目，配置 TabBar、路由、请求封装', color: '#FF6B6B', icon: I.Flag },
    { date: '2026年8月初', title: '首页与文章模块', desc: '实现轮播图、推荐文章、文章列表（分页加载）、文章详情（目录解析、阅读进度、点赞收藏）', color: '#F59E0B', icon: I.DataLine },
    { date: '2026年8月中', title: '分类与搜索功能', desc: '分类页面（文章/商品分类切换）、标签筛选、全文搜索、搜索历史、热门文章推荐', color: '#667eea', icon: I.Trophy },
    { date: '2026年8月中', title: '商城模块开发', desc: '商品列表（分类筛选、价格/销量排序）、商品详情、购物车（增删改查、全选、数量调整）', color: '#764ba2', icon: I.Medal },
    { date: '2026年8月中', title: '订单系统', desc: '订单确认页（地址选择、备注）、订单创建、订单列表（按状态筛选）、删除订单', color: '#4ECDC4', icon: I.Flag },
    { date: '2026年8月下', title: '个人中心', desc: '微信登录授权、浏览历史、我的收藏、消息中心（评论通知、系统通知）、缓存管理', color: '#FF6B6B', icon: I.DataLine },
    { date: '2026年8月下', title: '自定义组件开发', desc: '封装 NavBar 导航栏、ArticleCard 文章卡片、LoadMore 加载状态等通用组件', color: '#F59E0B', icon: I.Trophy },
    { date: '2026年9月初', title: '全端联调测试', desc: 'PC 管理端、小程序端、后端 API 全链路联调，修复接口兼容性、数据格式不一致等问题', color: '#667eea', icon: I.Medal },
    { date: '2026年9月初', title: '性能优化', desc: '图片懒加载、列表虚拟滚动、API 请求防抖、本地缓存策略、分包加载优化', color: '#764ba2', icon: I.Flag },
    { date: '2026年9月中', title: 'UI 细节打磨', desc: '统一配色方案（紫蓝渐变主题）、动画过渡效果、空状态设计、错误提示优化、深色模式适配', color: '#4ECDC4', icon: I.DataLine },
    { date: '2026年9月中', title: '安全性加固', desc: 'XSS 防护、SQL 注入防护、接口限流、JWT 过期处理、文件上传类型校验、敏感数据脱敏', color: '#FF6B6B', icon: I.Trophy },
    { date: '2026年9月下', title: '部署与上线', desc: '后端部署至云服务器（Nginx 反向代理 + PM2 进程管理），数据库迁移，小程序提审上线', color: '#F59E0B', icon: I.Medal },
    { date: '2026年9月下', title: '项目完成', desc: '全部功能上线运行，PC 端 + 小程序端 + 后端 API 三端完整交付，持续迭代优化中', color: '#667eea', icon: I.Flag },
];

const dataCards = reactive([
    { icon: I.Document, label: '文章总数', value: 0, color: '#667eea', bg: '#eef2ff' },
    { icon: I.FolderOpened, label: '分类数量', value: 0, color: '#4ECDC4', bg: '#e8faf8' },
    { icon: I.PriceTag, label: '标签数量', value: 0, color: '#FF6B6B', bg: '#fff0f0' },
    { icon: I.ChatDotRound, label: '评论总数', value: 0, color: '#F59E0B', bg: '#fffbeb' },
]);

const contacts = [
    { icon: I.Message, label: '电子邮箱', value: 'svip888ws@foxmail.com', color: '#667eea', bg: '#eef2ff' },
    { icon: I.Link, label: 'QQ', value: '2517441744', color: '#333', bg: '#f5f5f5' },
    { icon: I.ChatLineRound, label: '微信', value: '13080983262', color: '#4ECDC4', bg: '#e8faf8' },
];

/* ========== 事件处理 ========== */
const onMouseMove = (e) => {
    cursorX.value = mouseX.value = e.clientX;
    cursorY.value = mouseY.value = e.clientY;
};

const onTiltMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    const shine = card.querySelector('.card-shine');
    if (shine) shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.15) 0%, transparent 60%)`;
};

const onTiltLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = '';
    const shine = card.querySelector('.card-shine');
    if (shine) shine.style.background = '';
};

/* ========== 数字动画 ========== */
const animateNumber = (refVal, target, duration = 1500) => {
    const t0 = Date.now();
    const step = () => {
        const p = Math.min((Date.now() - t0) / duration, 1);
        refVal.value = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        p < 1 ? requestAnimationFrame(step) : (refVal.value = target);
    };
    requestAnimationFrame(step);
};

/* ========== 数据请求 ========== */
const fetchData = async () => {
    try {
        const [a, ar, t, c, cm] = await Promise.all([
            getAdminInfo(),
            request.get('/article', { params: { pageSize: 1 } }),
            request.get('/tag'),
            request.get('/category'),
            request.get('/comment/latest', { params: { limit: 100 } }),
        ]);
        admin.value = a.data;
        const ac = ar.data.total || 0, tc = t.data.length || 0, cc = c.data.length || 0, cmc = cm.data.length || 0;
        Object.assign(dataCards[0], { value: ac });
        Object.assign(dataCards[1], { value: cc });
        Object.assign(dataCards[2], { value: tc });
        Object.assign(dataCards[3], { value: cmc });
        animateNumber(articleCount, ac);
        animateNumber(tagCount, tc);
        animateNumber(categoryCount, cc);
        animateNumber(commentCount, cmc);
    } catch (e) { console.error('获取数据失败:', e); }
};

/* ========== 滚动揭示 ========== */
let observer = null;

const revealSection = (el) => {
    el.querySelectorAll('.reveal').forEach((child, i) => {
        setTimeout(() => child.classList.add('revealed'), i * 100);
    });
};

const setupObserver = () => {
    observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) { revealSection(e.target); observer.unobserve(e.target); }
        });
    }, { threshold: 0.12 });
    [aboutRef, techRef, timelineRef, dataRef, contactRef].forEach((r) => r.value && observer.observe(r.value));
};

onMounted(() => { fetchData(); setupObserver(); startTyping(); });
onUnmounted(() => { observer?.disconnect(); clearTimeout(typeTimer); });
</script>

<style scoped>
/* ============================================================
   Variables
   ============================================================ */
.about-page {
    --primary: #667eea;
    --purple: #764ba2;
    --teal: #4ECDC4;
    --red: #FF6B6B;
    --amber: #F59E0B;
    --pink: #F472B6;
    --violet: #A78BFA;
    --heading: #1a1a2e;
    --text: #555;
    --muted: #999;
    --card: #fff;
    --border: rgba(0, 0, 0, 0.04);
    --max-w: 1100px;
    --r: 16px;
    --r-sm: 14px;
    --r-lg: 20px;

    background: #f5f6f8;
    cursor: auto;
    overflow-x: hidden;
}

@media (min-width: 768px) {
    .about-page {
        cursor: none;
    }
}

.muted {
    font-size: 13px;
    color: var(--muted);
    margin: 5px 0;
}

/* ============================================================
   Cursor Glow
   ============================================================ */
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

/* ============================================================
   Hero Section
   ============================================================ */
.hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #cac2d6;
}

.hero-bg {
    position: absolute;
    inset: 0;
}

.hero-gradient {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse at 25% 40%, rgba(102, 126, 234, 0.2) 0%, transparent 55%),
        radial-gradient(ellipse at 75% 30%, rgba(167, 139, 250, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(244, 114, 182, 0.12) 0%, transparent 50%);
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
}

.hero-noise {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 128px 128px;
}

/* Orbs */
.hero-orbs {
    position: absolute;
    inset: 0;
}

.h-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: orbFloat 20s ease-in-out infinite;
}

.h-orb-1 {
    width: 300px;
    height: 300px;
    background: var(--primary);
    opacity: 0.2;
    top: -150px;
    left: -130px;
}

.h-orb-2 {
    width: 450px;
    height: 450px;
    background: var(--violet);
    opacity: 0.15;
    bottom: -80px;
    right: -60px;
    animation-duration: 15s;
    animation-direction: reverse;
}

.h-orb-3 {
    width: 180px;
    height: 180px;
    background: var(--pink);
    opacity: 0.12;
    top: 20%;
    right: 10%;
    animation-duration: 10s;
    animation-delay: 3s;
}

.h-orb-4 {
    width: 200px;
    height: 200px;
    background: var(--teal);
    opacity: 0.1;
    bottom: 20%;
    left: 5%;
    animation-duration: 14s;
    animation-delay: 5s;
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

/* Particles */
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

    25% {
        transform: translateY(-40px) translateX(25px);
    }

    50% {
        transform: translateY(-20px) translateX(-15px);
    }

    75% {
        transform: translateY(-60px) translateX(20px);
    }

    90% {
        opacity: 1;
    }
}

/* Floating Shapes */
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

/* Hero Content */
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
    animation: fadeInDown 0.8s ease both, badgeFloat 4s ease-in-out 1s infinite;
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
    font-size: clamp(32px, 6vw, 56px);
    font-weight: 900;
    color: #fff;
    margin: 0 0 16px;
    line-height: 1.3;
    animation: fadeInUp 0.8s ease 0.15s both;
}

.gradient-text {
    background: linear-gradient(135deg, var(--primary), var(--violet), var(--pink), var(--primary));
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s ease infinite;
}

@keyframes shimmer {

    0%,
    100% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }
}

.hero-subtitle {
    font-size: clamp(14px, 2vw, 17px);
    color: rgba(255, 255, 255, 0.45);
    margin: 0 auto 36px;
    max-width: 520px;
    line-height: 1.7;
    min-height: 2.8em;
    animation: fadeInUp 0.8s ease 0.3s both;
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

/* Hero Stats */
.hero-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    max-width: 420px;
    margin: 0 auto 20px;
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
    border-radius: var(--r);
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

.stat-ring svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.ring-anim {
    transition: stroke-dasharray 1s ease;
}

.ring-icon {
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

/* Scroll Hint */
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

/* ============================================================
   Section Common
   ============================================================ */
.section {
    padding: 60px 0;
}

@media (min-width: 768px) {
    .section {
        padding: 80px 0;
    }
}

.container {
    max-width: var(--max-w);
    margin: 0 auto;
    padding: 0 16px;
}

@media (min-width: 768px) {
    .container {
        padding: 0 24px;
    }
}

.section-head {
    text-align: center;
    margin-bottom: 36px;
}

@media (min-width: 768px) {
    .section-head {
        margin-bottom: 50px;
    }
}

.section-tag {
    display: inline-block;
    padding: 4px 16px;
    background: linear-gradient(135deg, #8d9ff1, var(--purple));
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 3px;
    border-radius: 20px;
    margin-bottom: 14px;
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
    font-size: clamp(26px, 4vw, 34px);
    font-weight: 900;
    color: var(--heading);
    margin: 0 0 8px;
}

.section-desc {
    font-size: 14px;
    color: var(--muted);
    margin: 0;
}

/* ============================================================
   Reveal & Tilt
   ============================================================ */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
}

.section-head.reveal {
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.reveal.revealed {
    opacity: 1;
    transform: translateY(0);
}

.tilt-card {
    position: relative;
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

/* ============================================================
   Icon Box (shared)
   ============================================================ */
.icon-box {
    width: 48px;
    height: 48px;
    border-radius: var(--r-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 14px;
}

@media (min-width: 768px) {
    .icon-box {
        width: 56px;
        height: 56px;
        border-radius: var(--r);
        margin-bottom: 16px;
    }
}

/* ============================================================
   About Section
   ============================================================ */
.sec-about {
    background: #f0f6ef;
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

.about-sidebar {
    text-align: center;
    padding: 32px 20px;
    background: #e2e7f7;
    border-radius: var(--r-lg);
    border: 1px solid var(--border);
}

@media (min-width: 768px) {
    .about-sidebar {
        padding: 36px 24px;
    }
}

.avatar-wrap {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;
}

.avatar-ring {
    display: inline-block;
    padding: 5px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--purple));
    position: relative;
    overflow: hidden;
}

.ring-spin {
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, var(--primary), var(--pink), var(--teal), var(--primary));
    animation: spin 3s linear infinite;
    opacity: 0.6;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.about-avatar {
    background: #ff8484;
    color: var(--primary);
    font-size: 42px;
    font-weight: 900;
    position: relative;
    z-index: 2;
}

.about-sidebar h3 {
    font-size: 20px;
    font-weight: 800;
    color: var(--heading);
    margin: 0 0 4px;
}

.socials {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 18px;
}

.social-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: rgba(165, 156, 209, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    cursor: pointer;
    border: 1px solid #f0f0f0;
    text-decoration: none;
    transition: all 0.3s;
}

.social-btn:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    color: var(--primary);
    border-color: var(--primary);
}

.about-text {
    padding: 24px;
    background: #fafbff;
    border-radius: var(--r-lg);
    border: 1px solid var(--border);
    margin-bottom: 18px;
}

@media (min-width: 768px) {
    .about-text {
        padding: 32px;
    }
}

.about-text p {
    font-size: 14px;
    color: var(--text);
    line-height: 1.8;
    margin: 0 0 10px;
}

.about-text p:last-child {
    margin: 0;
}

.about-text strong {
    color: var(--heading);
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
    border-radius: var(--r-sm);
    border: 1px solid var(--border);
}

.highlight-card:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.hl-glow {
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
    color: var(--heading);
}

.hl-desc {
    font-size: 11px;
    color: var(--muted);
}

/* ============================================================
   Tech Section
   ============================================================ */
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
    background: var(--card);
    border-radius: var(--r);
    padding: 20px 16px;
    text-align: center;
    border: 1px solid var(--border);
}

@media (min-width: 768px) {
    .tech-card {
        padding: 24px 20px;
    }
}

.tech-card:hover {
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.tech-card .icon-box {
    transition: transform 0.3s;
}

.tech-card:hover .icon-box {
    transform: scale(1.1) rotate(-5deg);
}

.tech-card h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--heading);
    margin: 0 0 4px;
}

.bar {
    height: 4px;
    background: #f0f0f0;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 6px;
}

.bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 1.5s ease;
}

.tech-level {
    font-size: 11px;
    font-weight: 700;
    color: #bbb;
}

/* ============================================================
   Timeline Section
   ============================================================ */
.sec-timeline {
    background: #fff;
}

.timeline {
    position: relative;
    padding: 20px 0;
}

.tl-track {
    position: absolute;
    left: 24px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

@media (min-width: 768px) {
    .tl-track {
        left: 50%;
        transform: translateX(-50%);
    }
}

.tl-track-glow {
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, transparent, var(--primary), var(--teal), var(--red), transparent);
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

.tl-item {
    position: relative;
    padding-left: 56px;
    padding-bottom: 32px;
}

@media (min-width: 768px) {
    .tl-item {
        width: 50%;
        padding-bottom: 40px;
    }

    .tl-left {
        left: 0;
        text-align: right;
        padding-left: 0;
        padding-right: 56px;
    }

    .tl-right {
        left: 50%;
        text-align: left;
        padding-left: 56px;
        padding-right: 0;
    }
}

.tl-dot {
    position: absolute;
    top: 4px;
    left: 8px;
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

@media (min-width: 768px) {
    .tl-left .tl-dot {
        left: auto;
        right: -16px;
    }

    .tl-right .tl-dot {
        left: -16px;
    }
}

.tl-dot::after {
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
    border-radius: var(--r-sm);
    border: 1px solid var(--border);
}

.tl-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.tl-date {
    font-size: 12px;
    font-weight: 700;
}

.tl-card h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--heading);
    margin: 6px 0;
}

.tl-card p {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.6;
}

/* ============================================================
   Data Section
   ============================================================ */
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
    background: var(--card);
    border-radius: 18px;
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
}

@media (min-width: 768px) {
    .data-card {
        padding: 32px 20px;
    }
}

/* Accent top bar */
.data-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent), white 30%));
}

/* Hover glow border */
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

    0%,
    100% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }
}

.data-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.data-num {
    font-size: clamp(32px, 5vw, 42px);
    font-weight: 900;
    background: linear-gradient(135deg, var(--primary), var(--purple));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
}

.data-label {
    font-size: 13px;
    color: var(--muted);
    margin-top: 4px;
}

/* ============================================================
   Contact Section
   ============================================================ */
.sec-contact {
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
    border: 1px solid var(--border);
}

@media (min-width: 768px) {
    .contact-card {
        padding: 32px 20px;
    }
}

.contact-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.contact-card h4 {
    font-size: 14px;
    font-weight: 700;
    color: var(--heading);
    margin: 0 0 6px;
}

.contact-card p {
    font-size: 13px;
    color: #666;
    margin: 0;
}

/* ============================================================
   Scrollbar
   ============================================================ */
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