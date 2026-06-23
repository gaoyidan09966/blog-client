<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">📖 全部文章</h2>
            <p class="page-subtitle">在文字的世界里，探索无限可能，分享经验与见解。</p>
        </div>

        <div class="filter-tip" v-if="currentCategory || currentTag">
            <span v-if="currentCategory">正在查看分类：<strong>{{ currentCategory }}</strong></span>
            <span v-if="currentTag">正在查看标签：<strong>{{ currentTag }}</strong></span>
            <el-button type="primary" link @click="clearFilter">清除筛选</el-button>
        </div>

        <div class="article-list-wrapper">
            <el-skeleton :loading="loading" animated :count="3">
                <template #template>
                    <el-card class="article-card" style="margin-bottom: 20px;">
                        <div class="card-inner" style="display: flex; gap: 20px;">
                            <el-skeleton-item variant="image"
                                style="width: 200px; height: 130px; border-radius: 6px;" />
                            <div
                                style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                                <el-skeleton-item variant="h3" style="width: 50%;" />
                                <el-skeleton-item variant="text" style="margin-top: 10px;" />
                                <el-skeleton-item variant="text" style="width: 80%;" />
                            </div>
                        </div>
                    </el-card>
                </template>

                <template #default>
                    <el-empty v-if="!loading && articles.length === 0" description="空空如也，快去后台写第一篇文章吧！" />

                    <el-card v-for="item in articles" :key="item.id" class="article-card" shadow="hover"
                        @click="goToDetail(item.id)">
                        <div class="card-inner">
                            <div class="article-cover-box">
                                <el-image v-if="item.cover" :src="item.cover" fit="cover" class="article-img" lazy />
                                <div v-else class="no-cover-placeholder">
                                    <span>{{ item.category_name || 'BLOG' }}</span>
                                </div>
                            </div>

                            <div class="article-info">
                                <h2 class="article-title">{{ item.title }}</h2>
                                <p class="article-desc">{{ item.description || '暂无文章摘要...' }}</p>
                                <div class="article-meta">
                                    <span class="meta-item"><el-icon>
                                            <User />
                                        </el-icon> {{ item.author_name || '孤勇者' }}</span>
                                    <span class="meta-item"><el-icon>
                                            <Calendar />
                                        </el-icon> {{ formatDate(item.create_time) }}</span>
                                    <span class="meta-item"><el-tag size="small" type="info" effect="plain">{{
                                        item.category_name || '未分类' }}</el-tag></span>
                                </div>
                            </div>
                        </div>
                    </el-card>

                    <!-- 分页 -->
                    <div class="pagination-wrapper" v-if="totalCount > 0">
                        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                            :page-sizes="[6, 10, 20, 50]" layout="total, sizes, prev, pager, next" :total="totalCount"
                            @size-change="handleSizeChange" @current-change="handlePageChange" />
                    </div>
                </template>
            </el-skeleton>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../../api/request';

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const articles = ref([]);
const currentCategory = ref('');
const currentTag = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(6);
const totalCount = ref(0);

// 获取分类名
const fetchCategoryName = async (categoryId) => {
    if (!categoryId) {
        currentCategory.value = '';
        return;
    }
    try {
        const res = await request.get(`/category/${categoryId}`);
        currentCategory.value = res.data.name;
    } catch (error) {
        console.error('获取分类名失败:', error);
        currentCategory.value = '未知分类';
    }
};

// 获取标签名
const fetchTagName = async (tagId) => {
    if (!tagId) {
        currentTag.value = '';
        return;
    }
    try {
        const res = await request.get(`/tag/${tagId}`);
        currentTag.value = res.data.name;
    } catch (error) {
        console.error('获取标签名失败:', error);
        currentTag.value = '未知标签';
    }
};

// 获取文章列表
const fetchAllArticles = async () => {
    loading.value = true;
    try {
        const categoryId = route.query.category_id;
        const tagId = route.query.tag_id;

        const params = {
            page: currentPage.value,
            pageSize: pageSize.value
        };

        if (categoryId) {
            params.category_id = categoryId;
        }
        if (tagId) {
            params.tag_id = tagId;
        }

        const res = await request.get('/article', { params });
        articles.value = res.data.list || res.data;
        totalCount.value = res.data.total || 0;
    } catch (error) {
        console.error('拉取文章列表失败:', error);
    } finally {
        loading.value = false;
    }
};

// 清除筛选
const clearFilter = () => {
    router.push('/articles');
};

// 跳转详情
const goToDetail = (id) => {
    router.push(`/article/${id}`);
};

// 分页事件
const handleSizeChange = (newSize) => {
    pageSize.value = newSize;
    currentPage.value = 1;
    fetchAllArticles();
};

const handlePageChange = (newPage) => {
    currentPage.value = newPage;
    fetchAllArticles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const formatDate = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 初始化
onMounted(() => {
    const categoryId = route.query.category_id;
    const tagId = route.query.tag_id;

    if (categoryId) {
        fetchCategoryName(categoryId);
    }
    if (tagId) {
        fetchTagName(tagId);
    }
    fetchAllArticles();
});

// 监听路由参数变化
watch(() => route.query, (newQuery) => {
    // 重置分页
    currentPage.value = 1;

    if (newQuery.category_id) {
        fetchCategoryName(newQuery.category_id);
    } else {
        currentCategory.value = '';
    }

    if (newQuery.tag_id) {
        fetchTagName(newQuery.tag_id);
    } else {
        currentTag.value = '';
    }

    fetchAllArticles();
}, { deep: true });
</script>

<style scoped>
.page-container {
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
}

.page-header {
    margin-bottom: 20px;
    text-align: center;
}

.page-title {
    font-size: 28px;
    color: #1a1a1a;
    margin-bottom: 10px;
    font-weight: 700;
}

.page-subtitle {
    font-size: 14px;
    color: #8c8c8c;
}

.filter-tip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #f0f4ff;
    border-radius: 10px;
    margin-bottom: 24px;
    font-size: 14px;
    color: #4a4a4a;
}

.filter-tip strong {
    color: #1a1a1a;
}

.article-list-wrapper {
    margin-top: 20px;
}

.article-card {
    margin-bottom: 20px;
    cursor: pointer;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: transform 0.3s;
}

.article-card:hover {
    transform: translateY(-4px);
}

.card-inner {
    display: flex;
    gap: 20px;
}

.article-cover-box {
    width: 200px;
    height: 130px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
}

.article-img {
    width: 100%;
    height: 100%;
}

.no-cover-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #f5f5f5, #e6e6e6);
    color: #666;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 14px;
}

.article-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.article-title {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #1a1a1a;
}

.article-desc {
    font-size: 14px;
    color: #595959;
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-meta {
    display: flex;
    gap: 15px;
    font-size: 13px;
    color: #8c8c8c;
    align-items: center;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* ==================== 分页 ==================== */
.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding-bottom: 20px;
}
</style>