<template>
    <div class="profile-container">
        <!-- 用户信息头部 -->
        <div class="profile-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <el-avatar :size="90" :src="userInfo.avatar" class="profile-avatar">
                    {{ userInfo.nickname?.charAt(0) || 'U' }}
                </el-avatar>
                <h1 class="profile-name">{{ userInfo.nickname || userInfo.username }}</h1>
                <p class="profile-bio">{{ userInfo.bio || '这个人很懒，什么都没写...' }}</p>
                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-num">{{ userInfo.article_count || 0 }}</span>
                        <span class="stat-label">文章</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-num">{{ userInfo.comment_count || 0 }}</span>
                        <span class="stat-label">评论</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-num">{{ formatJoinDate(userInfo.create_time) }}</span>
                        <span class="stat-label">加入</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 内容区 -->
        <div class="content-section">
            <el-tabs v-model="activeTab" class="profile-tabs">
                <!-- 我的文章 -->
                <el-tab-pane label="我的文章" name="articles">
                    <div class="tab-content">
                        <div v-for="article in myArticles" :key="article.id" class="article-item"
                            @click="goToArticle(article.id)">
                            <div class="article-info">
                                <div class="article-top">
                                    <el-tag :type="article.status === 1 ? 'success' : 'warning'" size="small">
                                        {{ article.status === 1 ? '已发布' : '草稿' }}
                                    </el-tag>
                                    <span class="article-category" v-if="article.category_name">{{ article.category_name
                                        }}</span>
                                </div>
                                <h3 class="article-title">{{ article.title }}</h3>
                                <p class="article-desc">{{ article.description || '暂无摘要' }}</p>
                                <div class="article-meta">
                                    <span>{{ formatTime(article.create_time) }}</span>
                                    <span>👁 {{ article.view_count }}</span>
                                    <span>👍 {{ article.like_count || 0 }}</span>
                                </div>
                            </div>
                            <div class="article-cover" v-if="article.cover">
                                <el-image :src="article.cover" fit="cover" class="cover-img">
                                    <template #error>
                                        <div class="cover-placeholder">暂无</div>
                                    </template>
                                </el-image>
                            </div>
                        </div>
                        <el-empty v-if="myArticles.length === 0" description="还没有发布过文章" />
                    </div>
                </el-tab-pane>

                <!-- 我的评论 -->
                <el-tab-pane label="我的评论" name="comments">
                    <div class="tab-content">
                        <div v-for="comment in myComments" :key="comment.id" class="comment-item"
                            @click="goToArticle(comment.article_id)">
                            <div class="comment-content">
                                <p class="comment-text">{{ comment.content }}</p>
                                <div class="comment-meta">
                                    <span>评论于「{{ comment.article_title || '已删除的文章' }}」</span>
                                    <span>{{ formatTime(comment.create_time) }}</span>
                                </div>
                            </div>
                        </div>
                        <el-empty v-if="myComments.length === 0" description="还没有发表过评论" />
                    </div>
                </el-tab-pane>

                <!-- 个人设置 -->
                <el-tab-pane label="个人设置" name="settings">
                    <div class="tab-content settings-form">

                        <!-- 头像上传 -->
                        <div class="avatar-section">
                            <div class="avatar-preview" @click="triggerAvatarInput">
                                <el-avatar :size="80" :src="userInfo.avatar" class="preview-avatar">
                                    {{ userInfo.nickname?.charAt(0) || 'U' }}
                                </el-avatar>
                                <div class="avatar-overlay">
                                    <span>📷</span>
                                </div>
                            </div>
                            <input ref="avatarInput" type="file" accept="image/*" style="display: none;"
                                @change="handleAvatarChange" />
                            <p class="avatar-hint">点击头像更换</p>
                        </div>

                        <el-divider />

                        <!-- 基本信息 -->
                        <h3 class="section-title">基本信息</h3>
                        <el-form :model="profileForm" label-width="80px" style="max-width: 500px;">
                            <el-form-item label="用户名">
                                <el-input :value="userInfo.username" disabled />
                            </el-form-item>
                            <el-form-item label="昵称">
                                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
                            </el-form-item>
                            <el-form-item label="个人简介">
                                <el-input v-model="profileForm.bio" type="textarea" :rows="4" placeholder="介绍一下自己吧..."
                                    maxlength="200" show-word-limit />
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" :loading="saving" @click="handleSave">保存修改</el-button>
                            </el-form-item>
                        </el-form>

                        <el-divider />

                        <!-- 修改密码 -->
                        <h3 class="section-title">修改密码</h3>
                        <el-form :model="passwordForm" label-width="80px" style="max-width: 500px;">
                            <el-form-item label="原密码">
                                <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码"
                                    show-password />
                            </el-form-item>
                            <el-form-item label="新密码">
                                <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码"
                                    show-password />
                            </el-form-item>
                            <el-form-item label="确认密码">
                                <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"
                                    show-password />
                            </el-form-item>
                            <el-form-item>
                                <el-button type="warning" :loading="changingPwd"
                                    @click="handleChangePassword">修改密码</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getUserProfile, getUserArticles, getUserComments, updateProfile, uploadAvatar, changePassword } from '../../api/user';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();
const activeTab = ref('articles');
const saving = ref(false);

const userInfo = ref({});
const myArticles = ref([]);
const myComments = ref([]);

const profileForm = reactive({
    nickname: '',
    bio: ''
});

// 头像上传相关
const avatarInput = ref(null);

// 修改密码相关
const changingPwd = ref(false);
const passwordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// 获取用户信息
const fetchProfile = async () => {
    try {
        const res = await getUserProfile();
        userInfo.value = res.data;
        profileForm.nickname = res.data.nickname || '';
        profileForm.bio = res.data.bio || '';
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
};

// 获取我的文章
const fetchMyArticles = async () => {
    try {
        const res = await getUserArticles();
        myArticles.value = res.data.list;
    } catch (error) {
        console.error('获取文章失败:', error);
    }
};

// 获取我的评论
const fetchMyComments = async () => {
    try {
        const res = await getUserComments();
        myComments.value = res.data;
    } catch (error) {
        console.error('获取评论失败:', error);
    }
};

// 保存个人资料
const handleSave = async () => {
    if (!profileForm.nickname.trim()) {
        ElMessage.warning('昵称不能为空');
        return;
    }
    saving.value = true;
    try {
        await updateProfile({
            nickname: profileForm.nickname,
            bio: profileForm.bio
        });
        ElMessage.success('资料更新成功！');
        userStore.userInfo.nickname = profileForm.nickname;
        localStorage.setItem('client_user', JSON.stringify(userStore.userInfo));
        fetchProfile();
    } catch (error) {
        console.error('更新失败:', error);
    } finally {
        saving.value = false;
    }
};

// 触发头像选择
const triggerAvatarInput = () => {
    avatarInput.value.click();
};

// 处理头像上传
const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        ElMessage.warning('图片大小不能超过 5MB');
        return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await uploadAvatar(formData);
        userInfo.value.avatar = res.data.avatar;
        userStore.userInfo.avatar = res.data.avatar;
        localStorage.setItem('client_user', JSON.stringify(userStore.userInfo));
        ElMessage.success('头像更新成功！');
    } catch (error) {
        ElMessage.error('头像上传失败');
    }

    e.target.value = '';
};

// 修改密码
const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
        ElMessage.warning('请填写完整');
        return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        ElMessage.warning('两次输入的密码不一致');
        return;
    }
    if (passwordForm.newPassword.length < 6) {
        ElMessage.warning('新密码不能少于6位');
        return;
    }

    changingPwd.value = true;
    try {
        await changePassword({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
        });
        ElMessage.success('密码修改成功，请重新登录');
        passwordForm.oldPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmPassword = '';
    } catch (error) {
        console.error('修改密码失败:', error);
    } finally {
        changingPwd.value = false;
    }
};

const goToArticle = (id) => {
    router.push(`/article/${id}`);
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleString();
};

const formatJoinDate = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
};

watch(activeTab, (tab) => {
    if (tab === 'articles' && myArticles.value.length === 0) {
        fetchMyArticles();
    } else if (tab === 'comments' && myComments.value.length === 0) {
        fetchMyComments();
    }
});

onMounted(() => {
    if (!userStore.isLoggedIn) {
        router.push('/login');
        return;
    }
    fetchProfile();
    fetchMyArticles();
});
</script>

<style scoped>
.profile-container {
    max-width: 860px;
    margin: 0 auto;
    padding: 0 20px 80px;
}

/* ==================== Hero ==================== */
.profile-hero {
    position: relative;
    border-radius: 28px;
    overflow: hidden;
    margin-top: 30px;
    padding: 50px 20px;
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
    background: #FF6B6B;
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

.profile-avatar {
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
    color: #fff;
    font-size: 36px;
    font-weight: 800;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    margin-bottom: 16px;
}

.profile-name {
    font-size: 30px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 8px;
}

.profile-bio {
    font-size: 14px;
    color: #8888aa;
    margin: 0 0 24px;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.profile-stats {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 24px;
    padding: 16px 32px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.stat-item {
    text-align: center;
}

.stat-num {
    display: block;
    font-size: 22px;
    font-weight: 900;
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-label {
    font-size: 12px;
    color: #999;
}

.stat-divider {
    width: 1px;
    height: 32px;
    background: #e8e8e8;
}

/* ==================== Tabs ==================== */
.content-section {
    margin-top: 30px;
}

.profile-tabs :deep(.el-tabs__nav-wrap::after) {
    display: none;
}

.profile-tabs :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 600;
    color: #999;
}

.profile-tabs :deep(.el-tabs__item.is-active) {
    color: #1a1a2e;
}

.profile-tabs :deep(.el-tabs__active-bar) {
    background: #1a1a2e;
    height: 3px;
    border-radius: 2px;
}

.tab-content {
    min-height: 300px;
    padding-top: 10px;
}

/* ==================== 我的文章 ==================== */
.article-item {
    display: flex;
    gap: 20px;
    padding: 20px;
    margin-bottom: 14px;
    background: #fff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
}

.article-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.article-info {
    flex: 1;
    min-width: 0;
}

.article-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.article-category {
    font-size: 12px;
    color: #999;
}

.article-title {
    font-size: 17px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 6px;
}

.article-desc {
    font-size: 13px;
    color: #999;
    margin: 0 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.article-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #bbb;
}

.article-cover {
    width: 130px;
    height: 90px;
    border-radius: 10px;
    overflow: hidden;
    flex-shrink: 0;
}

.cover-img {
    width: 100%;
    height: 100%;
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #ccc;
    font-size: 12px;
}

/* ==================== 我的评论 ==================== */
.comment-item {
    padding: 18px 20px;
    margin-bottom: 12px;
    background: #fff;
    border-radius: 14px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
}

.comment-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.comment-text {
    font-size: 15px;
    color: #333;
    margin: 0 0 10px;
    line-height: 1.6;
}

.comment-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #bbb;
}

/* ==================== 个人设置 ==================== */
.settings-form {
    padding: 20px 0;
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
}

.avatar-preview {
    position: relative;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
}

.preview-avatar {
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
    color: #fff;
    font-size: 32px;
    font-weight: 800;
}

.avatar-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: 50%;
}

.avatar-preview:hover .avatar-overlay {
    opacity: 1;
}

.avatar-overlay span {
    font-size: 28px;
}

.avatar-hint {
    font-size: 12px;
    color: #bbb;
    margin: 10px 0 0;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 20px;
}
</style>