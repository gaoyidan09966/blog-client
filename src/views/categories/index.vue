<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">🗂️ 文章分类</h2>
            <p class="page-subtitle">分门别类，构建最清晰的独立全栈知识图谱。</p>
        </div>

        <div class="categories-grid" v-loading="loading">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" v-for="(item, index) in categories" :key="item.id">
                    <el-card class="category-box-card" shadow="hover" :class="'theme-' + (index % 4)"
                        @click="handleCategoryClick(item.id)">
                        <div class="category-card-content">
                            <div class="category-icon-circle">
                                <el-icon class="folder-icon">
                                    <FolderOpened />
                                </el-icon>
                            </div>
                            <h3 class="category-name">{{ item.name }}</h3>
                            <span class="category-count">{{ item.article_count || 0 }} 篇文章</span>
                            <span class="category-badge">探索专栏 →</span>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-empty v-if="!loading && categories.length === 0" description="暂无分类数据..." />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import request from '../../api/request';

const router = useRouter();
const loading = ref(false);
const categories = ref([]);

const fetchCategories = async () => {
    loading.value = true;
    try {
        const res = await request.get('/category');
        categories.value = res.data;
    } catch (error) {
        console.error('获取分类失败:', error);
    } finally {
        loading.value = false;
    }
};

const handleCategoryClick = (id) => {
    router.push({ path: '/articles', query: { category_id: id } });
};
onMounted(() => {
    fetchCategories();
});
</script>

<style scoped>
.page-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px 80px;
}

.page-header {
    margin-bottom: 40px;
    text-align: center;
    padding-top: 30px;
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

.categories-grid {
    margin-top: 20px;
}

.category-box-card {
    margin-bottom: 20px;
    cursor: pointer;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    text-align: center;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
    position: relative;
}

.category-box-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
}

.theme-0::before {
    background: linear-gradient(90deg, #FF6B6B, #FF8E8E);
}

.theme-1::before {
    background: linear-gradient(90deg, #4ECDC4, #7EDDD6);
}

.theme-2::before {
    background: linear-gradient(90deg, #A78BFA, #C4B5FD);
}

.theme-3::before {
    background: linear-gradient(90deg, #FCD34D, #FDE68A);
}

.category-box-card:hover {
    transform: translateY(-5px);
    border-color: transparent;
}

.theme-0:hover {
    box-shadow: 0 12px 30px rgba(255, 107, 107, 0.15);
}

.theme-1:hover {
    box-shadow: 0 12px 30px rgba(78, 205, 196, 0.15);
}

.theme-2:hover {
    box-shadow: 0 12px 30px rgba(167, 139, 250, 0.15);
}

.theme-3:hover {
    box-shadow: 0 12px 30px rgba(252, 211, 77, 0.15);
}

.category-card-content {
    padding: 24px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.category-icon-circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.theme-0 .category-icon-circle {
    background: #FFF0F0;
}

.theme-1 .category-icon-circle {
    background: #E8FAF8;
}

.theme-2 .category-icon-circle {
    background: #F3F0FF;
}

.theme-3 .category-icon-circle {
    background: #FFFBEB;
}

.folder-icon {
    font-size: 26px;
}

.theme-0 .folder-icon {
    color: #FF6B6B;
}

.theme-1 .folder-icon {
    color: #4ECDC4;
}

.theme-2 .folder-icon {
    color: #A78BFA;
}

.theme-3 .folder-icon {
    color: #D97706;
}

.category-name {
    font-size: 18px;
    color: #1a1a1a;
    margin: 0;
    font-weight: 700;
}

.category-count {
    font-size: 12px;
    color: #aaa;
}

.category-badge {
    font-size: 13px;
    color: #8c8c8c;
    font-weight: 500;
    transition: color 0.3s;
}

.theme-0:hover .category-badge {
    color: #FF6B6B;
}

.theme-1:hover .category-badge {
    color: #4ECDC4;
}

.theme-2:hover .category-badge {
    color: #A78BFA;
}

.theme-3:hover .category-badge {
    color: #D97706;
}
</style>