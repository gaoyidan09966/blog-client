<template>
    <div class="page">
        <!-- 粒子纹理 -->
        <div class="grain" aria-hidden="true"></div>

        <!-- ==================== HERO ==================== -->
        <header class="hero">
            <div class="hero__bg" aria-hidden="true">
                <div class="hero__orb hero__orb--a"></div>
                <div class="hero__orb hero__orb--b"></div>
                <div class="hero__mesh"></div>
            </div>
            <div class="hero__content">
                <span class="hero__badge">
                    <el-icon>
                        <Document />
                    </el-icon>
                    ARTICLES
                </span>
                <h1 class="hero__title">全部文章</h1>
                <p class="hero__desc">在文字的世界里，探索无限可能，分享经验与见解。</p>
                <div class="hero__meta" v-if="!loading && totalCount > 0">
                    <span class="hero__count">
                        <em>{{ totalCount }}</em> 篇文章
                    </span>
                </div>
            </div>
        </header>

        <!-- ==================== 筛选栏 ==================== -->
        <Transition name="filter-slide">
            <div v-if="currentCategory || currentTag" class="filter">
                <div class="filter__info">
                    <span class="filter__dot"></span>
                    <span v-if="currentCategory">分类：<strong>{{ currentCategory }}</strong></span>
                    <span v-if="currentCategory && currentTag" class="filter__sep">&middot;</span>
                    <span v-if="currentTag">标签：<strong>{{ currentTag }}</strong></span>
                </div>
                <button class="filter__clear" @click="clearFilter" aria-label="清除筛选条件">
                    <el-icon>
                        <Close />
                    </el-icon>
                    <span>清除</span>
                </button>
            </div>
        </Transition>

        <!-- ==================== 骨架屏 ==================== -->
        <div v-if="loading" class="list" role="status" aria-live="polite">
            <div v-for="n in 3" :key="n" class="card card--sk">
                <div class="card__thumb">
                    <div class="shimmer"></div>
                </div>
                <div class="card__body">
                    <div class="shimmer shimmer--sm" style="width: 28%"></div>
                    <div class="shimmer shimmer--lg" style="width: 82%; margin-top: 12px"></div>
                    <div class="shimmer shimmer--md" style="width: 55%; margin-top: 10px"></div>
                    <div class="card__foot" style="margin-top: auto">
                        <div class="shimmer shimmer--sm" style="width: 24%"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==================== 空状态 ==================== -->
        <div v-else-if="articles.length === 0" class="empty">
            <el-empty description="空空如也，快去后台写第一篇文章吧！" />
        </div>

        <!-- ==================== 文章列表 ==================== -->
        <div v-else class="list">
            <article v-for="(item, idx) in articles" :key="item.id" class="card" :style="{ '--i': idx }"
                @click="goToDetail(item.id)" @keydown.enter="goToDetail(item.id)" tabindex="0" role="link"
                :aria-label="`阅读文章：${item.title}`">
                <!-- 封面 -->
                <div class="card__thumb">
                    <img v-if="item.cover && !broken.has(item.id)" :src="item.cover" :alt="item.title" class="card__img"
                        loading="lazy" @error="broken.add(item.id)" />
                    <div class="card__ph" :class="{ show: !item.cover || broken.has(item.id) }">
                        <span>{{ (item.category_name || item.title || 'B').charAt(0) }}</span>
                    </div>
                </div>

                <!-- 内容 -->
                <div class="card__body">
                    <div class="card__meta">
                        <span class="card__cat" v-if="item.category_name">{{ item.category_name }}</span>
                        <time class="card__date">{{ formatDate(item.create_time) }}</time>
                    </div>
                    <h3 class="card__title">{{ item.title }}</h3>
                    <p class="card__desc">{{ item.description || '暂无摘要...' }}</p>
                    <div class="card__foot">
                        <div class="card__author">
                            <span class="card__avatar">{{ (item.author_name || 'U').charAt(0) }}</span>
                            <span class="card__name">{{ item.author_name || '孤勇者' }}</span>
                        </div>
                        <div class="card__stats">
                            <span class="card__stat">
                                <el-icon>
                                    <View />
                                </el-icon>{{ formatCount(item.view_count) }}
                            </span>
                            <span class="card__stat">
                                <el-icon>
                                    <Pointer />
                                </el-icon>{{ formatCount(item.like_count) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 箭头 -->
                <div class="card__arrow" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>
            </article>
        </div>

        <!-- ==================== 分页 ==================== -->
        <nav class="pager" v-if="totalCount > pageSize" aria-label="文章分页">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[6, 10, 20, 50]"
                :pager-count="5" layout="total, sizes, prev, pager, next" :total="totalCount"
                @size-change="handleSizeChange" @current-change="handlePageChange" />
        </nav>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../../api/request';
import { formatDate } from '../../utils/format';
import { Close } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

/* ---------- 响应式状态 ---------- */
const loading = ref(false);
const articles = ref([]);
const currentCategory = ref('');
const currentTag = ref('');
const currentPage = ref(1);
const pageSize = ref(6);
const totalCount = ref(0);
const broken = reactive(new Set());   // 记录加载失败的图片 ID

/* ---------- 工具函数 ---------- */
const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
};

/* ---------- 接口请求 ---------- */
const fetchCategoryName = async (id) => {
    if (!id) { currentCategory.value = ''; return; }
    try {
        const { data } = await request.get(`/category/${id}`);
        currentCategory.value = data.name;
    } catch { currentCategory.value = '未知分类'; }
};

const fetchTagName = async (id) => {
    if (!id) { currentTag.value = ''; return; }
    try {
        const { data } = await request.get(`/tag/${id}`);
        currentTag.value = data.name;
    } catch { currentTag.value = '未知标签'; }
};

const fetchArticles = async () => {
    loading.value = true;
    try {
        const params = { page: currentPage.value, pageSize: pageSize.value };
        if (route.query.category_id) params.category_id = route.query.category_id;
        if (route.query.tag_id) params.tag_id = route.query.tag_id;
        const { data } = await request.get('/article', { params });
        articles.value = data.list ?? data;
        totalCount.value = data.total ?? 0;
    } catch (e) {
        console.error('拉取文章失败:', e);
        articles.value = [];
    } finally {
        loading.value = false;
    }
};

/* ---------- 交互行为 ---------- */
const clearFilter = () => router.push('/articles');
const goToDetail = (id) => router.push(`/article/${id}`);

const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchArticles();
};

const handlePageChange = (page) => {
    currentPage.value = page;
    fetchArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/* ---------- 生命周期 ---------- */
onMounted(() => {
    if (route.query.category_id) fetchCategoryName(route.query.category_id);
    if (route.query.tag_id) fetchTagName(route.query.tag_id);
    fetchArticles();
});

// route.query 变化时产生新对象，无需 deep
watch(() => route.query, (q) => {
    currentPage.value = 1;
    q.category_id ? fetchCategoryName(q.category_id) : (currentCategory.value = '');
    q.tag_id ? fetchTagName(q.tag_id) : (currentTag.value = '');
    fetchArticles();
});
</script>

<style scoped>
/* ================================================================
   字体（建议在 index.html <head> 中用 <link> 预加载以提升性能）
   ================================================================ */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

/* ================================================================
   设计令牌
   ================================================================ */
.page {
    /* ---- 表面 ---- */
    --bg: #faf8f5;
    --bg-warm: #f5f0ea;
    --s0: #ffffff;
    --s1: #f7f4ef;
    --s2: #ede8df;
    --s3: #e2dbd0;

    /* ---- 强调色 ---- */
    --accent: #d4740e;
    --accent-l: #e8922a;
    --accent-bg: rgba(212, 116, 14, .07);
    --rose: #c44536;

    /* ---- 文字 ---- */
    --t1: #1a1611;
    --t2: #6b6255;
    --t3: #a39a8c;
    --t4: #cdc5b7;

    /* ---- 边框 ---- */
    --bd: rgba(120, 100, 70, .09);
    --bd-h: rgba(120, 100, 70, .18);

    /* ---- 阴影 ---- */
    --sh-sm: 0 1px 3px rgba(40, 30, 15, .05);
    --sh-md: 0 4px 16px rgba(40, 30, 15, .07);
    --sh-lg: 0 8px 32px rgba(40, 30, 15, .10);

    /* ---- 字体 ---- */
    --ff-d: 'Playfair Display', 'Songti SC', 'STSong', Georgia, serif;
    --ff-b: 'DM Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;

    /* ---- 动效 ---- */
    --ease: cubic-bezier(.22, 1, .36, 1);

    /* ---- 形状 ---- */
    --r: 16px;

    color-scheme: light;
    max-width: 880px;
    margin: 0 auto;
    padding: 16px 14px 60px;
    font-family: var(--ff-b);
    color: var(--t1);
    background: var(--bg);
}

@media (min-width: 768px) {
    .page {
        padding: 32px 24px 80px;
    }
}

/* ================================================================
   噪点纹理
   ================================================================ */
.grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    opacity: .025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 180px;
}

/* ================================================================
   HERO 区域
   ================================================================ */
.hero {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
    background: var(--s0);
    border: 1px solid var(--bd);
    box-shadow: var(--sh-sm), var(--sh-md);
}

@media (min-width: 768px) {
    .hero {
        border-radius: 28px;
        margin-bottom: 32px;
    }
}

/* ---- 背景层 ---- */
.hero__bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.hero__mesh {
    position: absolute;
    inset: 0;
    background-image:
        radial-gradient(circle at 1px 1px, rgba(120, 100, 70, .035) 1px, transparent 0);
    background-size: 26px 26px;
}

.hero__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    will-change: transform;
}

.hero__orb--a {
    width: 180px;
    height: 180px;
    background: var(--accent);
    opacity: .25;
    top: -50px;
    left: -30px;
    animation: drift 12s ease-in-out infinite;
}

.hero__orb--b {
    width: 140px;
    height: 140px;
    background: var(--rose);
    opacity: .15;
    bottom: -40px;
    right: -20px;
    animation: drift 14s ease-in-out infinite reverse;
}

@media (min-width: 768px) {
    .hero__orb--a {
        width: 280px;
        height: 280px;
        filter: blur(80px);
        opacity: .22;
        top: -70px;
        left: -50px;
    }

    .hero__orb--b {
        width: 220px;
        height: 220px;
        filter: blur(70px);
        bottom: -60px;
        right: -40px;
    }
}

/* ---- 内容层 ---- */
.hero__content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 36px 20px;
}

@media (min-width: 768px) {
    .hero__content {
        padding: 52px 28px;
    }
}

.hero__badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 18px;
    background: var(--accent-bg);
    border: 1px solid rgba(212, 116, 14, .10);
    border-radius: 20px;
    color: var(--accent);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3.5px;
    margin-bottom: 16px;
    opacity: 0;
    animation: fadeUp .6s var(--ease) .05s forwards;
}

.hero__title {
    font-family: var(--ff-d);
    font-size: clamp(28px, 6vw, 52px);
    font-weight: 700;
    line-height: 1.15;
    margin: 0 0 10px;
    letter-spacing: -.01em;
    background: linear-gradient(135deg, var(--accent), var(--rose));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    opacity: 0;
    animation: fadeUp .7s var(--ease) .12s forwards;
}

.hero__desc {
    color: var(--t2);
    font-size: clamp(13px, 2.2vw, 15px);
    line-height: 1.65;
    margin: 0 0 22px;
    opacity: 0;
    animation: fadeUp .6s var(--ease) .24s forwards;
}

@media (min-width: 768px) {
    .hero__desc {
        margin-bottom: 28px;
    }
}

.hero__meta {
    opacity: 0;
    animation: fadeUp .6s var(--ease) .36s forwards;
}

.hero__count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 22px;
    background: var(--s1);
    border-radius: 28px;
    border: 1px solid var(--bd);
    box-shadow: var(--sh-sm);
    font-size: 13px;
    color: var(--t2);
}

.hero__count em {
    font-family: var(--ff-d);
    font-style: normal;
    font-size: 24px;
    font-weight: 700;
    color: var(--accent);
}

@media (min-width: 768px) {
    .hero__count {
        padding: 10px 28px;
    }

    .hero__count em {
        font-size: 30px;
    }
}

/* ================================================================
   筛选栏
   ================================================================ */
.filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 18px;
    margin-bottom: 20px;
    background: var(--s0);
    border: 1px solid var(--bd);
    border-radius: 12px;
    font-size: 13px;
    color: var(--t2);
    box-shadow: var(--sh-sm);
}

.filter__info {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    overflow: hidden;
}

.filter__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
    box-shadow: 0 0 0 3px var(--accent-bg);
}

.filter strong {
    color: var(--t1);
    font-weight: 600;
}

.filter__sep {
    opacity: .25;
}

.filter__clear {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--accent);
    font-size: 12px;
    font-weight: 600;
    font-family: var(--ff-b);
    padding: 4px 10px;
    border-radius: 8px;
    transition: background .2s;
    flex-shrink: 0;
}

.filter__clear:hover {
    background: var(--accent-bg);
}

/* 筛选栏过渡 */
.filter-slide-enter-active {
    animation: fadeUp .35s var(--ease);
}

.filter-slide-leave-active {
    animation: fadeUp .25s var(--ease) reverse;
}

/* ================================================================
   空状态
   ================================================================ */
.empty {
    padding: 60px 0;
}

.empty :deep(.el-empty__description p) {
    color: var(--t2);
}

/* ================================================================
   列表容器
   ================================================================ */
.list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* ================================================================
   文章卡片
   ================================================================ */
.card {
    --_d: calc(var(--i, 0) * 55ms);

    display: flex;
    align-items: stretch;
    position: relative;
    background: var(--s0);
    border-radius: var(--r);
    border: 1px solid var(--bd);
    overflow: hidden;
    cursor: pointer;
    outline: none;
    box-shadow: var(--sh-sm);
    transition:
        transform .35s var(--ease),
        box-shadow .35s var(--ease),
        border-color .3s ease;
    /* 交错入场 */
    opacity: 0;
    animation: cardIn .5s var(--ease) forwards;
    animation-delay: var(--_d);
}

/* 左侧强调线 */
.card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 18%;
    bottom: 18%;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, var(--accent), var(--rose));
    opacity: 0;
    transform: scaleY(.4);
    transition: opacity .3s ease, transform .3s var(--ease);
    z-index: 2;
    pointer-events: none;
}

/* ---- hover / focus ---- */
.card:hover,
.card:focus-visible {
    transform: translateY(-3px);
    box-shadow: var(--sh-md), var(--sh-lg);
    border-color: var(--bd-h);
}

.card:hover::before,
.card:focus-visible::before {
    opacity: 1;
    transform: scaleY(1);
}

.card:focus-visible {
    box-shadow:
        var(--sh-md), var(--sh-lg),
        0 0 0 2px var(--accent-bg),
        0 0 0 4px rgba(212, 116, 14, .15);
}

/* ================================================================
   卡片 > 封面
   ================================================================ */
.card__thumb {
    width: 110px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    background: var(--s2);
}

@media (min-width: 640px) {
    .card__thumb {
        width: 170px;
    }
}

@media (min-width: 768px) {
    .card__thumb {
        width: 210px;
    }
}

.card__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .45s var(--ease);
}

.card:hover .card__img,
.card:focus-visible .card__img {
    transform: scale(1.06);
}

/* 无图占位 */
.card__ph {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--s1), var(--s2));
    font-family: var(--ff-d);
    font-size: 36px;
    font-weight: 700;
    color: var(--t4);
}

.card__ph.show {
    display: flex;
}

@media (min-width: 768px) {
    .card__ph {
        font-size: 52px;
    }
}

/* ================================================================
   卡片 > 内容区
   ================================================================ */
.card__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px 14px;
    gap: 4px;
}

@media (min-width: 768px) {
    .card__body {
        padding: 16px 22px;
    }
}

/* 元信息行 */
.card__meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2px;
}

.card__cat {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .3px;
    padding: 2px 9px;
    border-radius: 5px;
    background: var(--accent-bg);
    color: var(--accent);
    white-space: nowrap;
    flex-shrink: 0;
    transition: background .25s;
}

.card:hover .card__cat {
    background: rgba(212, 116, 14, .12);
}

.card__date {
    font-size: 11px;
    color: var(--t3);
    white-space: nowrap;
}

/* 标题 */
.card__title {
    font-family: var(--ff-d);
    font-size: 15px;
    font-weight: 600;
    color: var(--t1);
    line-height: 1.45;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    position: relative;
    transition: color .25s;
}

@media (min-width: 768px) {
    .card__title {
        font-size: 17px;
    }
}

.card:hover .card__title,
.card:focus-visible .card__title {
    color: var(--accent);
}

/* 下划线生长动效 */
.card__title::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 0;
    height: 2px;
    border-radius: 1px;
    background: linear-gradient(90deg, var(--accent), var(--rose));
    transition: width .35s var(--ease);
}

.card:hover .card__title::after,
.card:focus-visible .card__title::after {
    width: 100%;
}

/* 摘要 */
.card__desc {
    font-size: 12.5px;
    color: var(--t2);
    line-height: 1.6;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (min-width: 768px) {
    .card__desc {
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
}

/* ================================================================
   卡片 > 底栏
   ================================================================ */
.card__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
}

.card__author {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

.card__avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), var(--rose));
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 700;
    flex-shrink: 0;
}

@media (min-width: 768px) {
    .card__avatar {
        width: 24px;
        height: 24px;
        font-size: 10px;
    }
}

.card__name {
    font-size: 12px;
    color: var(--t3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card__stats {
    display: flex;
    gap: 10px;
    flex-shrink: 0;
}

.card__stat {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--t3);
}

.card__stat .el-icon {
    font-size: 12px;
}

/* ================================================================
   卡片 > 箭头
   ================================================================ */
.card__arrow {
    display: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    flex-shrink: 0;
    color: var(--t4);
    transition: color .25s, transform .25s var(--ease);
}

@media (min-width: 768px) {
    .card__arrow {
        display: flex;
    }
}

.card:hover .card__arrow,
.card:focus-visible .card__arrow {
    color: var(--accent);
    transform: translateX(3px);
}

/* ================================================================
   骨架屏
   ================================================================ */
.card--sk {
    animation: none !important;
    opacity: 1 !important;
    pointer-events: none;
}

.shimmer {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--s1) 25%, var(--s2) 50%, var(--s1) 75%);
    background-size: 250% 100%;
    animation: shimmer 1.5s ease infinite;
}

.shimmer--sm {
    height: 11px;
}

.shimmer--md {
    height: 12px;
}

.shimmer--lg {
    height: 14px;
}

.card__thumb .shimmer {
    width: 100%;
    height: 100%;
    border-radius: 0;
}

/* ================================================================
   分页
   ================================================================ */
.pager {
    display: flex;
    justify-content: center;
    margin-top: 36px;
    padding-bottom: 20px;
}

.pager :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
    --el-pagination-bg-color: transparent;
    --el-pagination-button-bg-color: var(--s1);
    --el-pagination-button-color: var(--t2);
    --el-pagination-hover-color: var(--accent);
    --el-pagination-text-color: var(--t2);
    --el-pagination-button-disabled-bg-color: transparent;
}

.pager :deep(.el-pagination .is-active) {
    background: var(--accent-bg) !important;
    color: var(--accent) !important;
}

.pager :deep(.el-pagination button),
.pager :deep(.el-pagination .el-pager li) {
    background: var(--s1);
    border-radius: 8px;
    border: 1px solid transparent;
    transition: color .2s, border-color .2s, background .2s;
}

.pager :deep(.el-pagination .el-pager li:hover) {
    color: var(--accent);
    border-color: rgba(212, 116, 14, .12);
}

/* ================================================================
   移动端卡片竖排
   ================================================================ */
@media (max-width: 639px) {
    .card {
        flex-direction: column;
    }

    .card__thumb {
        width: 100%;
        height: 150px;
    }

    .card::before {
        left: 10%;
        right: 10%;
        top: auto;
        bottom: 0;
        width: auto;
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: linear-gradient(90deg, var(--accent), var(--rose));
        transform: scaleX(.4);
        transform-origin: center;
    }

    .card:hover::before,
    .card:focus-visible::before {
        transform: scaleX(1);
    }
}

/* ================================================================
   关键帧
   ================================================================ */
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(14px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes drift {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    33% {
        transform: translate(20px, -15px) scale(1.04);
    }

    66% {
        transform: translate(-14px, 12px) scale(.96);
    }
}

@keyframes cardIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shimmer {
    0% {
        background-position: 250% 0;
    }

    100% {
        background-position: -250% 0;
    }
}

/* ================================================================
   减弱动效（无障碍）
   ================================================================ */
@media (prefers-reduced-motion: reduce) {

    *,
    *::before,
    *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
    }
}
</style>