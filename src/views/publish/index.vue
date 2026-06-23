<template>
    <div class="publish-container">
        <!-- 顶部操作栏 -->
        <div class="top-bar">
            <div class="top-bar-left">
                <button class="back-btn" @click="router.back()">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    返回
                </button>
                <span class="top-bar-title">{{ isEdit ? '编辑文章' : '写文章' }}</span>
            </div>
            <div class="top-bar-right">
                <span class="auto-save-hint" v-if="autoSaved">
                    ✓ 已自动保存
                </span>
                <el-button class="draft-top-btn" @click="saveDraft" :loading="submitLoading">
                    存草稿
                </el-button>
                <el-button class="publish-top-btn" :loading="submitLoading" @click="handleSubmit">
                    {{ isEdit ? '更新文章' : '发布文章' }}
                </el-button>
            </div>
        </div>

        <div class="publish-body">
            <!-- 左侧：编辑区 -->
            <div class="editor-left">
                <el-form :model="articleForm" :rules="rules" ref="formRef" label-position="top">
                    <!-- 标题 -->
                    <el-form-item prop="title">
                        <el-input v-model="articleForm.title" placeholder="请输入文章标题..." maxlength="100" show-word-limit
                            class="title-input" />
                    </el-form-item>

                    <!-- 摘要 -->
                    <el-form-item>
                        <el-input v-model="articleForm.description" type="textarea" :rows="2"
                            placeholder="文章摘要（选填，不填则自动截取正文前100字）" maxlength="200" show-word-limit class="desc-input" />
                    </el-form-item>

                    <!-- 封面图 -->
                    <el-form-item>
                        <template #label>
                            <span class="form-label">封面图</span>
                            <span class="form-label-hint">（选填，推荐 16:9 比例）</span>
                        </template>
                        <el-upload class="cover-uploader" action="http://localhost:3001/api/article/upload"
                            :headers="uploadHeaders" name="image" :show-file-list="false"
                            :before-upload="beforeCoverUpload" :on-success="handleCoverSuccess">
                            <div class="cover-upload-area" v-if="!articleForm.cover">
                                <el-icon size="28">
                                    <Plus />
                                </el-icon>
                                <span>点击上传封面图</span>
                            </div>
                            <div class="cover-preview-area" v-else>
                                <img :src="articleForm.cover" class="cover-preview" />
                                <div class="cover-actions">
                                    <span class="cover-action-text">点击更换</span>
                                </div>
                            </div>
                        </el-upload>
                        <el-button v-if="articleForm.cover" type="danger" size="small" link
                            @click="articleForm.cover = ''" class="remove-cover-btn">
                            移除封面
                        </el-button>
                    </el-form-item>

                    <!-- 富文本编辑器 -->
                    <el-form-item prop="content">
                        <div class="editor-wrapper">
                            <Toolbar class="editor-toolbar" :editor="editorRef" :defaultConfig="toolbarConfig"
                                mode="default" />
                            <Editor class="editor-content" v-model="articleForm.content" :defaultConfig="editorConfig"
                                mode="default" @onCreated="handleEditorCreated" @onChange="handleEditorChange" />
                        </div>
                        <div class="editor-footer">
                            <span class="word-count">字数：{{ wordCount }}</span>
                        </div>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 右侧：设置面板 -->
            <div class="editor-right">
                <!-- 发布设置 -->
                <div class="setting-card">
                    <div class="setting-header">
                        <span class="setting-icon">⚙️</span>
                        发布设置
                    </div>
                    <div class="setting-body">
                        <div class="setting-row">
                            <span class="setting-label">文章状态</span>
                            <el-radio-group v-model="articleForm.status" size="small">
                                <el-radio-button :value="1">发布</el-radio-button>
                                <el-radio-button :value="0">草稿</el-radio-button>
                            </el-radio-group>
                        </div>
                    </div>
                </div>

                <!-- 分类选择 -->
                <div class="setting-card">
                    <div class="setting-header">
                        <span class="setting-icon">📂</span>
                        文章分类
                    </div>
                    <div class="setting-body">
                        <el-select v-model="articleForm.category_id" placeholder="选择分类" style="width: 100%;" clearable>
                            <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.name" :value="cat.id" />
                        </el-select>
                    </div>
                </div>

                <!-- 标签选择 -->
                <div class="setting-card">
                    <div class="setting-header">
                        <span class="setting-icon">🏷️</span>
                        文章标签
                    </div>
                    <div class="setting-body">
                        <el-select v-model="articleForm.tag_ids" multiple placeholder="选择标签（可多选）" style="width: 100%;"
                            collapse-tags collapse-tags-tooltip>
                            <el-option v-for="tag in tagList" :key="tag.id" :label="tag.name" :value="tag.id" />
                        </el-select>
                    </div>
                </div>

                <!-- 文章信息 -->
                <div class="setting-card" v-if="isEdit">
                    <div class="setting-header">
                        <span class="setting-icon">📊</span>
                        文章信息
                    </div>
                    <div class="setting-body">
                        <div class="info-row">
                            <span class="info-label">文章ID</span>
                            <span class="info-value">#{{ route.params.id }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, shallowRef, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import { ElMessage } from 'element-plus';
import request from '../../api/request';
import { createArticle, updateArticle, getArticleById } from '../../api/article';
import { useUserStore } from '../../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const submitLoading = ref(false);
const autoSaved = ref(false);
const wordCount = ref(0);

const isEdit = computed(() => !!route.params.id);

// 编辑器实例
const editorRef = shallowRef(null);

// 表单数据
const articleForm = reactive({
    title: '',
    description: '',
    content: '',
    cover: '',
    category_id: null,
    tag_ids: [],
    status: 1
});

const rules = {
    title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
    content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }]
};

const categoryList = ref([]);
const tagList = ref([]);

const uploadHeaders = {
    Authorization: localStorage.getItem('client_token') || ''
};

// 工具栏配置
const toolbarConfig = {
    excludeKeys: ['fullScreen', 'group-video', 'insertTable', 'codeBlock']
};

// 编辑器配置
const editorConfig = {
    placeholder: '请输入文章内容...',
    autoFocus: false,
    scroll: false,
    MENU_CONF: {
        uploadImage: {
            server: 'http://localhost:3001/api/article/upload',
            fieldName: 'image',
            headers: {
                Authorization: localStorage.getItem('client_token') || ''
            },
            maxFileSize: 5 * 1024 * 1024,
            allowedFileTypes: ['image/*'],
            customInsert(res, insertFn) {
                if (res.code === 200) {
                    insertFn(res.data.url, '', '');
                }
            }
        }
    }
};

const handleEditorCreated = (editor) => {
    editorRef.value = editor;
};

// 编辑器内容变化时更新字数
const handleEditorChange = (editor) => {
    const text = editor.getText().trim();
    wordCount.value = text.length;
};

// 自动保存草稿
let autoSaveTimer = null;
const startAutoSave = () => {
    autoSaveTimer = setInterval(() => {
        if (articleForm.title || articleForm.content) {
            localStorage.setItem('draft_article', JSON.stringify({
                title: articleForm.title,
                description: articleForm.description,
                content: articleForm.content,
                cover: articleForm.cover,
                category_id: articleForm.category_id,
                tag_ids: articleForm.tag_ids
            }));
            autoSaved.value = true;
            setTimeout(() => { autoSaved.value = false; }, 2000);
        }
    }, 30000);
};

// 恢复草稿
const restoreDraft = () => {
    const draft = localStorage.getItem('draft_article');
    if (draft && !isEdit.value) {
        try {
            const data = JSON.parse(draft);
            articleForm.title = data.title || '';
            articleForm.description = data.description || '';
            articleForm.content = data.content || '';
            articleForm.cover = data.cover || '';
            articleForm.category_id = data.category_id || null;
            articleForm.tag_ids = data.tag_ids || [];
        } catch (e) {
            // ignore
        }
    }
};

// 手动存草稿
const saveDraft = () => {
    articleForm.status = 0;
    handleSubmit();
};

// 封面上传
const beforeCoverUpload = (file) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
        ElMessage.error('只能上传 JPG/PNG/GIF/WEBP 格式!');
        return false;
    }
    if (file.size / 1024 / 1024 > 5) {
        ElMessage.error('图片大小不能超过 5MB!');
        return false;
    }
    return true;
};

const handleCoverSuccess = (response) => {
    if (response.code === 200) {
        articleForm.cover = response.data.url;
        ElMessage.success('封面上传成功！');
    } else {
        ElMessage.error(response.message || '上传失败');
    }
};

// 获取分类和标签
const fetchOptions = async () => {
    try {
        const [catRes, tagRes] = await Promise.all([
            request.get('/category'),
            request.get('/tag')
        ]);
        categoryList.value = catRes.data;
        tagList.value = tagRes.data;
    } catch (error) {
        console.error('获取选项失败:', error);
    }
};

// 编辑模式加载文章
const fetchArticle = async () => {
    if (!route.params.id) return;
    try {
        const res = await getArticleById(route.params.id);
        const data = res.data;
        articleForm.title = data.title;
        articleForm.description = data.description;
        articleForm.content = data.content;
        articleForm.cover = data.cover;
        articleForm.category_id = data.category_id;
        articleForm.tag_ids = data.tag_ids || [];
        articleForm.status = data.status;
    } catch (error) {
        console.error('获取文章失败:', error);
        ElMessage.error('文章加载失败');
        router.push('/');
    }
};

// 提交
const handleSubmit = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return;

        if (!articleForm.content || articleForm.content === '<p><br></p>') {
            ElMessage.warning('请输入文章内容');
            return;
        }

        submitLoading.value = true;
        try {
            if (isEdit.value) {
                await updateArticle(route.params.id, articleForm);
                ElMessage.success('文章更新成功！');
            } else {
                await createArticle(articleForm);
                ElMessage.success(articleForm.status === 1 ? '文章发布成功！' : '草稿保存成功！');
                // 发布成功后清除本地草稿
                localStorage.removeItem('draft_article');
            }
            router.push('/articles');
        } catch (error) {
            console.error('提交失败:', error);
        } finally {
            submitLoading.value = false;
        }
    });
};

onMounted(() => {
    if (!userStore.isLoggedIn) {
        ElMessage.warning('请先登录后再发布文章');
        router.push('/login');
        return;
    }
    fetchOptions();
    fetchArticle();
    restoreDraft();
    startAutoSave();
});

onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor) editor.destroy();
    if (autoSaveTimer) clearInterval(autoSaveTimer);
});
</script>

<style scoped>
.publish-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 80px;
    background: #f5f6f8;
    min-height: calc(100vh - 64px);
}

/* ==================== 顶部操作栏 ==================== */
.top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    margin-bottom: 20px;
}

.top-bar-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover {
    border-color: #1a1a2e;
    color: #1a1a2e;
}

.top-bar-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
}

.top-bar-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.auto-save-hint {
    font-size: 12px;
    color: #67C23A;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.draft-top-btn {
    background: #fff;
    color: #666;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-weight: 600;
}

.draft-top-btn:hover {
    border-color: #999;
    color: #333;
}

.publish-top-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    padding: 10px 24px;
}

.publish-top-btn:hover {
    background: linear-gradient(135deg, #5a6fd6, #6a3f96);
    color: #fff;
}

/* ==================== 双栏布局 ==================== */
.publish-body {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
    align-items: start;
}

/* ==================== 左侧编辑区 ==================== */
.editor-left {
    background: #fff;
    border-radius: 16px;
    padding: 28px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.title-input :deep(.el-input__wrapper) {
    font-size: 22px;
    font-weight: 700;
    padding: 8px 0;
    box-shadow: none !important;
    border-bottom: 2px solid #f0f0f0;
    border-radius: 0;
}

.title-input :deep(.el-input__wrapper:focus-within) {
    border-bottom-color: #667eea;
}

.title-input :deep(.el-input__inner) {
    color: #1a1a2e;
}

.desc-input :deep(.el-textarea__inner) {
    font-size: 14px;
    color: #666;
    box-shadow: none !important;
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 10px 12px;
}

.desc-input :deep(.el-textarea__inner:focus) {
    border-color: #667eea;
}

.form-label {
    font-weight: 600;
    color: #333;
}

.form-label-hint {
    font-size: 12px;
    color: #ccc;
    font-weight: 400;
}

/* 封面上传 */
.cover-uploader {
    width: 100%;
}

.cover-upload-area {
    width: 100%;
    height: 160px;
    border: 2px dashed #e0e0e0;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #bbb;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
    background: #fafafa;
}

.cover-upload-area:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f8f9ff;
}

.cover-preview-area {
    position: relative;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
}

.cover-preview {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    display: block;
}

.cover-actions {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.cover-preview-area:hover .cover-actions {
    opacity: 1;
}

.cover-action-text {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.4);
    padding: 8px 20px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
}

.remove-cover-btn {
    margin-top: 10px;
}

/* 编辑器 */
.editor-wrapper {
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.3s;
}

.editor-wrapper:focus-within {
    border-color: #667eea;
}

.editor-toolbar {
    border-bottom: 1px solid #e8e8e8;
    background: #fafafa;
}

.editor-content {
    min-height: 500px;
    height: 600px;
}

.editor-footer {
    display: flex;
    justify-content: flex-end;
    padding: 8px 0 0;
}

.word-count {
    font-size: 12px;
    color: #ccc;
}

/* ==================== 右侧设置面板 ==================== */
.editor-right {
    position: sticky;
    top: 90px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.setting-card {
    background: #fff;
    border-radius: 14px;
    padding: 18px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.setting-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f5f5f5;
}

.setting-icon {
    font-size: 16px;
}

.setting-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.setting-label {
    font-size: 13px;
    color: #666;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
}

.info-label {
    font-size: 13px;
    color: #999;
}

.info-value {
    font-size: 13px;
    font-weight: 600;
    color: #333;
}

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
    .publish-body {
        grid-template-columns: 1fr;
    }

    .editor-right {
        position: static;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .top-bar {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .top-bar-right {
        width: 100%;
    }

    .publish-top-btn {
        flex: 1;
    }

    .editor-right {
        grid-template-columns: 1fr;
    }

    .editor-left {
        padding: 18px;
    }

    .editor-content {
        min-height: 350px;
        height: 400px;
    }
}
</style>