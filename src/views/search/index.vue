<template>
    <div class="search-container">
        <!-- 搜索头部 -->
        <div class="search-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">SEARCH</div>
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
                                effect="plain" round>
                                {{ name }}
                            </el-tag>
                        </div>
                        <span class="meta-item">👁 {{ article.view_count }}</span>
                    </div>
                </div>
                <div class="card-cover" v-if="article.cover">
                    <el-image :src="article.cover" fit="cover" class="cover-img">
                        <template #error>
                            <div class="cover-fallback">📷</div>
                        </template>
                    </el-image>
                </div>
            </div>

            <el-empty v-if="!loading && searched && articleList.length === 0" description="没有找到相关文章，换个关键词试试？" />

            <!-- 未搜索时的推荐 -->
            <div class="search-placeholder" v-if="!searched && !loading">
                <div class="placeholder-icon">🔍</div>
                <p>输入关键词，搜索你感兴趣的内容</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchArticles } from '../../api/article';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const keyword = ref('');
const searchedKeyword = ref('');
const searched = ref(false);
const articleList = ref([]);

const doSearch = async () => {
    if (!keyword.value.trim()) return;

    // 更新 URL 参数，方便分享
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

// 高亮关键词
const highlightKeyword = (text) => {
    if (!text || !searchedKeyword.value) return text;
    const escaped = searchedKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
};

const goToDetail = (id) => {
    router.push(`/article/${id}`);
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleString();
};

// 页面加载时，如果 URL 有 keyword 参数就自动搜索
onMounted(() => {
    const q = route.query.keyword;
    if (q) {
        keyword.value = q;
        doSearch();
    }
});

// 监听 URL 参数变化
watch(() => route.query.keyword, (newVal) => {
    if (newVal && newVal !== keyword.value) {
        keyword.value = newVal;
        doSearch();
    }
});
</script>

<style scoped>
.search-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px 80px;
}

/* ==================== Hero ==================== */
.search-hero {
    position: relative;
    border-radius: 28px;
    overflow: hidden;
    margin-top: 30px;
    padding: 40px 20px;
    text-align: center;
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.hero-bg {
    position: absolute;
    inset: 0;
    overflow: hidden;
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
    width: 200px;
    height: 200px;
    background: #A78BFA;
    top: -50px;
    left: -30px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 160px;
    height: 160px;
    background: #4ECDC4;
    bottom: -40px;
    right: -30px;
    animation: orbDrift 10s ease-in-out infinite reverse;
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
    display: inline-block;
    padding: 4px 18px;
    background: linear-gradient(135deg, #A78BFA, #7C3AED);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    border-radius: 20px;
    letter-spacing: 3px;
    margin-bottom: 20px;
}

.search-bar {
    max-width: 600px;
    margin: 0 auto 16px;
}

.search-bar :deep(.el-input__wrapper) {
    border-radius: 14px;
    padding: 4px 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.search-bar :deep(.el-input-group__append) {
    border-radius: 0 14px 14px 0;
    background: #1a1a2e;
    color: #fff;
    border: none;
}

.search-bar :deep(.el-input-group__append .el-button) {
    color: #fff;
    font-weight: 600;
}

.search-summary {
    font-size: 14px;
    color: #8888aa;
    margin: 0;
}

.search-summary strong {
    color: #1a1a2e;
    font-weight: 800;
}

/* ==================== 搜索结果 ==================== */
.results-section {
    margin-top: 30px;
    min-height: 200px;
}

.article-card {
    position: relative;
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 16px;
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
    opacity: 0;
    transform: translateY(15px);
    animation: fadeInUp 0.5s ease forwards;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
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
    height: 4px;
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

.card-content {
    flex: 1;
    padding: 20px 22px;
    min-width: 0;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.card-index {
    font-size: 13px;
    font-weight: 900;
    color: #ddd;
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
    font-size: 17px;
    color: #1a1a2e;
    margin: 0 0 6px;
    font-weight: 700;
    line-height: 1.4;
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

/* 搜索关键词高亮 */
:deep(.highlight) {
    color: #FF6B6B;
    font-weight: 700;
    background: rgba(255, 107, 107, 0.08);
    padding: 0 2px;
    border-radius: 3px;
}

.card-footer {
    display: flex;
    align-items: center;
    gap: 12px;
}

.card-author {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
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
    font-size: 12px;
    color: #bbb;
    margin-left: auto;
}

.card-cover {
    width: 170px;
    min-height: 130px;
    flex-shrink: 0;
    position: relative;
}

.card-cover::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(0, 0, 0, 0.04);
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
    font-size: 28px;
}

/* ==================== 占位提示 ==================== */
.search-placeholder {
    text-align: center;
    padding: 60px 20px;
    color: #ccc;
}

.placeholder-icon {
    font-size: 48px;
    margin-bottom: 12px;
}

.search-placeholder p {
    font-size: 15px;
    margin: 0;
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
    .article-card {
        flex-direction: column;
    }

    .card-cover {
        width: 100%;
        min-height: 140px;
        max-height: 180px;
    }

    .card-cover::before {
        width: 100%;
        height: 1px;
        top: 0;
        left: 0;
        bottom: auto;
    }
}
</style>