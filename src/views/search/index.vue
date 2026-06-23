<template>
    <div class="search-page">
        <!-- Hero（全宽） -->
        <div class="search-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-orb orb-3"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">
                    <el-icon>
                        <Search />
                    </el-icon>
                    SEARCH
                </div>
                <h1 class="hero-title">搜索</h1>
                <div class="search-bar">
                    <el-input v-model="keyword" size="large" placeholder="输入关键词搜索文章..." clearable
                        @keyup.enter="doSearch" @clear="keyword = ''">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                        <template #append>
                            <el-button @click="doSearch" :loading="loading">搜索</el-button>
                        </template>
                    </el-input>
                </div>
                <p class="search-summary" v-if="searched">
                    共找到 <strong>{{ articleList.length }}</strong> 篇关于「{{ searchedKeyword }}」的文章
                </p>
            </div>
        </div>

        <!-- 搜索结果 -->
        <div class="results-section" v-loading="loading">
            <div v-for="(article, index) in articleList" :key="article.id" class="article-card"
                :class="'theme-' + (index % 4)" :style="{ animationDelay: index * 0.06 + 's' }"
                @click="goToDetail(article.id)">
                <div class="card-top-accent"></div>
                <div class="card-cover" v-if="article.cover">
                    <el-image :src="article.cover" fit="cover" class="cover-img">
                        <template #error>
                            <div class="cover-fallback">
                                <el-icon :size="28">
                                    <Picture />
                                </el-icon>
                            </div>
                        </template>
                    </el-image>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <div class="card-index">{{ String(index + 1).padStart(2, '0') }}</div>
                        <span class="card-category" v-if="article.category_name">{{ article.category_name }}</span>
                        <span class="card-time">{{ formatTime(article.create_time) }}</span>
                    </div>
                    <h3 class="card-title">
                        <span v-html="highlightKeyword(article.title)"></span>
                    </h3>
                    <p class="card-desc" v-if="article.description">
                        <span v-html="highlightKeyword(article.description)"></span>
                    </p>
                    <div class="card-footer">
                        <div class="card-author">
                            <div class="author-avatar">{{ article.author_name?.charAt(0) }}</div>
                            <span>{{ article.author_name }}</span>
                        </div>
                        <div class="card-tags" v-if="article.tag_names && article.tag_names.length">
                            <el-tag v-for="(name, i) in article.tag_names.slice(0, 3)" :key="i" size="small"
                                effect="plain" round>{{ name }}</el-tag>
                        </div>
                        <span class="meta-item">
                            <el-icon :size="13">
                                <View />
                            </el-icon>
                            {{ article.view_count }}
                        </span>
                    </div>
                </div>
            </div>

            <el-empty v-if="!loading && searched && articleList.length === 0" description="没有找到相关文章，换个关键词试试？" />

            <div class="search-placeholder" v-if="!searched && !loading">
                <el-icon :size="64" color="#ddd">
                    <Search />
                </el-icon>
                <p>输入关键词，搜索你感兴趣的内容</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchArticles } from '../../api/article';
import { formatTime } from '../../utils/format';
import { Search, View, Picture } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const keyword = ref('');
const searchedKeyword = ref('');
const searched = ref(false);
const articleList = ref([]);

const doSearch = async () => {
    if (!keyword.value.trim()) return;
    router.replace({ path: '/search', query: { keyword: keyword.value.trim() } });
    loading.value = true;
    searched.value = true;
    searchedKeyword.value = keyword.value.trim();
    try {
        const res = await searchArticles(keyword.value.trim());
        articleList.value = res.data.list;
    } catch (error) {
        console.error('搜索失败:', error);
        articleList.value = [];
    } finally {
        loading.value = false;
    }
};

const highlightKeyword = (text) => {
    if (!text || !searchedKeyword.value) return text;
    const escaped = searchedKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
};

const goToDetail = (id) => { router.push(`/article/${id}`); };

onMounted(() => {
    const q = route.query.keyword;
    if (q) { keyword.value = q; doSearch(); }
});

watch(() => route.query.keyword, (newVal) => {
    if (newVal && newVal !== keyword.value) { keyword.value = newVal; doSearch(); }
});
</script>

<style scoped>
.search-page {
    background: #f5f6f8;
    min-height: 100vh;
}

/* ==================== Hero（全宽） ==================== */
.search-hero {
    position: relative;
    padding: 50px 20px;
    text-align: center;
    overflow: hidden;
    background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #fdf2f8 100%);
}

@media (min-width: 768px) {
    .search-hero {
        padding: 60px 20px;
    }
}

.hero-bg {
    position: absolute;
    inset: 0;
}

.hero-grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
}

.hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.5;
}

.orb-1 {
    width: 160px;
    height: 160px;
    background: #A78BFA;
    top: -40px;
    left: 10%;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 130px;
    height: 130px;
    background: #7C3AED;
    bottom: -30px;
    right: 10%;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

.orb-3 {
    width: 90px;
    height: 90px;
    background: #F472B6;
    top: 20%;
    right: 20%;
    animation: orbDrift 9s ease-in-out infinite 2s;
}

@media (min-width: 768px) {
    .orb-1 {
        width: 200px;
        height: 200px;
        top: -50px;
    }

    .orb-2 {
        width: 160px;
        height: 160px;
        bottom: -40px;
    }

    .orb-3 {
        width: 120px;
        height: 120px;
    }
}

@keyframes orbDrift {

    0%,
    100% {
        transform: translate(0, 0) scale(1);
    }

    33% {
        transform: translate(20px, -15px) scale(1.05);
    }

    66% {
        transform: translate(-15px, 10px) scale(0.95);
    }
}

.hero-content {
    position: relative;
    z-index: 2;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 18px;
    background: linear-gradient(135deg, #A78BFA, #7C3AED);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    border-radius: 20px;
    letter-spacing: 3px;
    margin-bottom: 16px;
}

.hero-title {
    font-size: 28px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 20px;
}

@media (min-width: 768px) {
    .hero-title {
        font-size: 34px;
    }
}

/* 搜索框 */
.search-bar {
    max-width: 560px;
    margin: 0 auto 16px;
}

.search-bar :deep(.el-input__wrapper) {
    border-radius: 14px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.9);
    transition: all 0.3s;
}

.search-bar :deep(.el-input__wrapper:focus-within) {
    box-shadow: 0 4px 24px rgba(167, 139, 250, 0.15);
    border-color: rgba(167, 139, 250, 0.3);
}

.search-bar :deep(.el-input-group__append) {
    border-radius: 0 14px 14px 0;
    background: linear-gradient(135deg, #A78BFA, #7C3AED);
    color: #fff;
    border: none;
    box-shadow: none;
}

.search-bar :deep(.el-input-group__append .el-button) {
    color: #fff;
    font-weight: 600;
    border: none;
    background: transparent;
}

.search-summary {
    font-size: 14px;
    color: #8888aa;
    margin: 0;
}

.search-summary strong {
    color: #A78BFA;
    font-weight: 800;
}

/* ==================== 搜索结果 ==================== */
.results-section {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px 60px;
}

@media (min-width: 768px) {
    .results-section {
        padding: 30px 20px 80px;
    }
}

.article-card {
    position: relative;
    display: flex;
    gap: 16px;
    margin-bottom: 14px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
    opacity: 0;
    transform: translateY(15px);
    animation: fadeInUp 0.5s ease forwards;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

@media (min-width: 768px) {
    .article-card {
        gap: 0;
        align-items: center;
        border-radius: 18px;
        margin-bottom: 16px;
    }
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-top-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    z-index: 2;
}

.theme-0 .card-top-accent {
    background: linear-gradient(90deg, #FF6B6B, #FF8E8E);
}

.theme-1 .card-top-accent {
    background: linear-gradient(90deg, #4ECDC4, #7EDDD6);
}

.theme-2 .card-top-accent {
    background: linear-gradient(90deg, #A78BFA, #C4B5FD);
}

.theme-3 .card-top-accent {
    background: linear-gradient(90deg, #FCD34D, #FDE68A);
}

.article-card:hover {
    transform: translateY(-4px);
    border-color: transparent;
}

.theme-0:hover {
    box-shadow: 0 14px 35px rgba(255, 107, 107, 0.15);
}

.theme-1:hover {
    box-shadow: 0 14px 35px rgba(78, 205, 196, 0.15);
}

.theme-2:hover {
    box-shadow: 0 14px 35px rgba(167, 139, 250, 0.15);
}

.theme-3:hover {
    box-shadow: 0 14px 35px rgba(252, 211, 77, 0.15);
}

/* 封面图（手机端也显示） */
.card-cover {
    width: 100%;
    height: 140px;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
}

@media (min-width: 768px) {
    .card-cover {
        width: 170px;
        height: 100%;
        min-height: 130px;
    }

    .card-cover::before {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(0, 0, 0, 0.04);
        z-index: 2;
    }
}

.cover-img {
    width: 100%;
    height: 100%;
    display: block;
}

.cover-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fb;
    color: #ddd;
}

/* 内容区 */
.card-content {
    flex: 1;
    padding: 16px;
    min-width: 0;
}

@media (min-width: 768px) {
    .card-content {
        padding: 20px 22px;
    }
}

.card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.card-index {
    font-size: 13px;
    font-weight: 900;
}

.theme-0 .card-index {
    color: #FF6B6B;
}

.theme-1 .card-index {
    color: #4ECDC4;
}

.theme-2 .card-index {
    color: #A78BFA;
}

.theme-3 .card-index {
    color: #FCD34D;
}

.card-category {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 20px;
}

.theme-0 .card-category {
    background: #FFF0F0;
    color: #FF6B6B;
}

.theme-1 .card-category {
    background: #E8FAF8;
    color: #38B2AC;
}

.theme-2 .card-category {
    background: #F3F0FF;
    color: #A78BFA;
}

.theme-3 .card-category {
    background: #FFFBEB;
    color: #D97706;
}

.card-time {
    font-size: 12px;
    color: #bbb;
}

.card-title {
    font-size: 15px;
    color: #1a1a2e;
    margin: 0 0 6px;
    font-weight: 700;
    line-height: 1.4;
}

@media (min-width: 768px) {
    .card-title {
        font-size: 17px;
    }
}

.card-desc {
    font-size: 13px;
    color: #999;
    margin: 0 0 12px;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

:deep(.highlight) {
    color: #A78BFA;
    font-weight: 700;
    background: rgba(167, 139, 250, 0.1);
    padding: 0 2px;
    border-radius: 3px;
}

.card-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.card-author {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #555;
}

.author-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
}

.theme-0 .author-avatar {
    background: #FF6B6B;
}

.theme-1 .author-avatar {
    background: #4ECDC4;
}

.theme-2 .author-avatar {
    background: #A78BFA;
}

.theme-3 .author-avatar {
    background: #FCD34D;
}

.card-tags {
    display: flex;
    gap: 4px;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #bbb;
    margin-left: auto;
}

/* ==================== 占位提示 ==================== */
.search-placeholder {
    text-align: center;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.search-placeholder p {
    font-size: 15px;
    color: #ccc;
    margin: 0;
}
</style>