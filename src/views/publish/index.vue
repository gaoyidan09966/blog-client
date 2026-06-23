<template>
    <div class="publish-page">
        <!-- 顶部操作栏 -->
        <div class="top-bar">
            <div class="top-bar-inner">
                <div class="top-bar-left">
                    <button class="back-btn" @click="router.back()">
                        <el-icon>
                            <ArrowLeft />
                        </el-icon>
                        <span class="back-text">返回</span>
                    </button>
                    <div class="top-bar-divider"></div>
                    <span class="top-bar-title">{{ isEdit ? '编辑文章' : '写文章' }}</span>
                </div>
                <div class="top-bar-right">
                    <transition name="fade-hint">
                        <span class="auto-save-hint" v-if="autoSaved">
                            <el-icon :size="14">
                                <CircleCheck />
                            </el-icon> 已自动保存
                        </span>
                    </transition>
                    <button class="btn-draft" @click="saveDraft" :disabled="submitLoading">
                        <el-icon>
                            <DocumentCopy />
                        </el-icon>
                        存草稿
                    </button>
                    <button class="btn-publish" :disabled="submitLoading" @click="handleSubmit">
                        <el-icon v-if="!submitLoading">
                            <Promotion />
                        </el-icon>
                        <el-icon v-else class="is-loading">
                            <Loading />
                        </el-icon>
                        {{ isEdit ? '更新文章' : '发布文章' }}
                    </button>
                </div>
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
                        <el-upload class="cover-uploader" :action="uploadUrl" :headers="uploadHeaders" name="image"
                            :show-file-list="false" :before-upload="beforeCoverUpload" :on-success="handleCoverSuccess">
                            <div class="cover-upload-area" v-if="!articleForm.cover">
                                <el-icon :size="28">
                                    <Picture />
                                </el-icon>
                                <span>点击上传封面图</span>
                                <span class="upload-hint">JPG / PNG / WEBP，不超过 5MB</span>
                            </div>
                            <div class="cover-preview-area" v-else>
                                <img :src="articleForm.cover" class="cover-preview" />
                                <div class="cover-actions">
                                    <span class="cover-action-text">
                                        <el-icon>
                                            <RefreshRight />
                                        </el-icon> 点击更换
                                    </span>
                                </div>
                            </div>
                        </el-upload>
                        <button v-if="articleForm.cover" class="remove-cover-btn" @click="articleForm.cover = ''">
                            <el-icon>
                                <Delete />
                            </el-icon> 移除封面
                        </button>
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
                            <span class="word-count">
                                <el-icon :size="12">
                                    <EditPen />
                                </el-icon>
                                {{ wordCount }} 字
                            </span>
                        </div>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 右侧：设置面板 -->
            <div class="editor-right">
                <!-- 发布设置 -->
                <div class="setting-card">
                    <div class="setting-header">
                        <el-icon :size="16" color="#667eea">
                            <Setting />
                        </el-icon>
                        <span>发布设置</span>
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
                        <el-icon :size="16" color="#F59E0B">
                            <FolderOpened />
                        </el-icon>
                        <span>文章分类</span>
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
                        <el-icon :size="16" color="#A78BFA">
                            <PriceTag />
                        </el-icon>
                        <span>文章标签</span>
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
                        <el-icon :size="16" color="#4ECDC4">
                            <DataLine />
                        </el-icon>
                        <span>文章信息</span>
                    </div>
                    <div class="setting-body">
                        <div class="info-row">
                            <span class="info-label">文章 ID</span>
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
import {
    ArrowLeft, CircleCheck, DocumentCopy, Promotion, Loading,
    Picture, RefreshRight, Delete, EditPen, Setting,
    FolderOpened, PriceTag, DataLine
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const formRef = ref(null);
const submitLoading = ref(false);
const autoSaved = ref(false);
const wordCount = ref(0);

const isEdit = computed(() => !!route.params.id);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const uploadUrl = `${API_BASE}/api/article/upload`;

const editorRef = shallowRef(null);

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

const toolbarConfig = {
    excludeKeys: ['fullScreen', 'group-video', 'insertTable', 'codeBlock']
};

const editorConfig = {
    placeholder: '请输入文章内容...',
    autoFocus: false,
    scroll: false,
    MENU_CONF: {
        uploadImage: {
            server: uploadUrl,
            fieldName: 'image',
            headers: uploadHeaders,
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

const handleEditorCreated = (editor) => { editorRef.value = editor; };

const handleEditorChange = (editor) => {
    const text = editor.getText().trim();
    wordCount.value = text.length;
};

// 自动保存
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
        } catch (e) { }
    }
};

const saveDraft = () => {
    articleForm.status = 0;
    handleSubmit();
};

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
.publish-page {
    background: #f5f6f8;
    min-height: 100vh;
}

/* ==================== 顶部操作栏 ==================== */
.top-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
}

.top-bar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

@media (min-width: 768px) {
    .top-bar-inner {
        padding: 12px 24px;
    }
}

.top-bar-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 7px 14px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    font-size: 13px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover {
    border-color: #667eea;
    color: #667eea;
}

.back-text {
    display: none;
}

@media (min-width: 640px) {
    .back-text {
        display: inline;
    }
}

.top-bar-divider {
    width: 1px;
    height: 20px;
    background: #e8e8e8;
    display: none;
}

@media (min-width: 640px) {
    .top-bar-divider {
        display: block;
    }
}

.top-bar-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
}

@media (min-width: 768px) {
    .top-bar-title {
        font-size: 16px;
    }
}

.top-bar-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

@media (min-width: 768px) {
    .top-bar-right {
        gap: 10px;
    }
}

.auto-save-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #67C23A;
    white-space: nowrap;
}

.fade-hint-enter-active {
    transition: opacity 0.3s;
}

.fade-hint-leave-active {
    transition: opacity 0.3s;
}

.fade-hint-enter-from,
.fade-hint-leave-to {
    opacity: 0;
}

.btn-draft,
.btn-publish {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    white-space: nowrap;
}

@media (min-width: 768px) {

    .btn-draft,
    .btn-publish {
        padding: 9px 20px;
    }
}

.btn-draft {
    background: #fff;
    color: #666;
    border: 1px solid #e0e0e0;
}

.btn-draft:hover:not(:disabled) {
    border-color: #999;
    color: #333;
}

.btn-publish {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
}

.btn-publish:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-draft:disabled,
.btn-publish:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* ==================== 双栏布局 ==================== */
.publish-body {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px 16px 80px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    align-items: start;
}

@media (min-width: 1024px) {
    .publish-body {
        grid-template-columns: 1fr 280px;
        padding: 24px 24px 80px;
    }
}

@media (min-width: 1200px) {
    .publish-body {
        grid-template-columns: 1fr 300px;
    }
}

/* ==================== 左侧编辑区 ==================== */
.editor-left {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
    min-width: 0;
}

@media (min-width: 768px) {
    .editor-left {
        padding: 28px;
        border-radius: 20px;
    }
}

.title-input :deep(.el-input__wrapper) {
    font-size: 20px;
    font-weight: 700;
    padding: 8px 0;
    box-shadow: none !important;
    border-bottom: 2px solid #f0f0f0;
    border-radius: 0;
}

@media (min-width: 768px) {
    .title-input :deep(.el-input__wrapper) {
        font-size: 22px;
    }
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
    border-radius: 10px;
    padding: 10px 12px;
    transition: all 0.3s;
}

.desc-input :deep(.el-textarea__inner:focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
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
    height: 140px;
    border: 2px dashed #e0e0e0;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #bbb;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
    background: #fafafa;
}

@media (min-width: 768px) {
    .cover-upload-area {
        height: 160px;
    }
}

.cover-upload-area:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f8f9ff;
}

.upload-hint {
    font-size: 11px;
    color: #ddd;
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
    display: flex;
    align-items: center;
    gap: 6px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.4);
    padding: 8px 20px;
    border-radius: 20px;
    backdrop-filter: blur(4px);
}

.remove-cover-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 10px;
    background: none;
    border: none;
    color: #ccc;
    font-size: 12px;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0;
}

.remove-cover-btn:hover {
    color: #FF6B6B;
}

/* 编辑器 */
.editor-wrapper {
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
}

.editor-wrapper:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
}

.editor-toolbar {
    border-bottom: 1px solid #e8e8e8;
    background: #fafafa;
}

.editor-content {
    min-height: 400px;
    height: 500px;
}

@media (min-width: 768px) {
    .editor-content {
        min-height: 500px;
        height: 600px;
    }
}

.editor-footer {
    display: flex;
    justify-content: flex-end;
    padding: 8px 0 0;
}

.word-count {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #ccc;
}

/* ==================== 右侧设置面板 ==================== */
.editor-right {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

@media (min-width: 1024px) {
    .editor-right {
        position: sticky;
        top: 70px;
    }
}

.setting-card {
    background: #fff;
    border-radius: 14px;
    padding: 16px;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

@media (min-width: 768px) {
    .setting-card {
        padding: 18px;
    }
}

.setting-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f5f5f5;
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

/* 设置面板 Select 样式增强 */
.setting-body :deep(.el-select .el-input__wrapper) {
    border-radius: 10px;
    background: #fafafa;
    box-shadow: none;
    border: 1px solid #f0f0f0;
    transition: all 0.3s;
}

.setting-body :deep(.el-select .el-input__wrapper:hover) {
    border-color: #ddd;
}

.setting-body :deep(.el-select .el-input__wrapper:focus-within) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.08);
    background: #fff;
}

/* ==================== 响应式 ==================== */
@media (max-width: 640px) {
    .top-bar-inner {
        flex-wrap: wrap;
    }

    .top-bar-right {
        width: 100%;
        justify-content: flex-end;
        flex-wrap: wrap;
    }

    .auto-save-hint {
        width: 100%;
        justify-content: flex-end;
    }
}
</style>