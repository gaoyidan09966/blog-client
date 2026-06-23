<template>
    <div class="page-container">
        <!-- Hero 区域 -->
        <div class="msg-hero">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">MESSAGE WALL</div>
                <h1 class="hero-title">📝 留言墙</h1>
                <p class="hero-desc">在这里留下你想说的话，分享此刻的心情</p>
            </div>
        </div>

        <!-- 操作栏 -->
        <div class="action-bar">
            <div class="action-left">
                <span class="msg-count">共 {{ messages.length }} 条留言</span>
            </div>
            <button class="write-msg-btn" @click="openDialog" v-if="userStore.isLoggedIn">✏️ 写留言</button>
            <button class="write-msg-btn" @click="router.push('/login')" v-else>🔒 登录后留言</button>
        </div>

        <!-- 瀑布流留言卡片 -->
        <div class="masonry-grid">
            <div v-for="(msg, index) in messages" :key="msg.id" class="msg-card glass-card"
                :style="{ animationDelay: index * 0.05 + 's' }">
                <div class="card-accent" :style="{ background: msg.color }"></div>
                <div class="top-badge" v-if="msg.is_top">📌 置顶</div>
                <div class="card-emoji">{{ msg.emoji }}</div>
                <p class="card-content">{{ msg.content }}</p>

                <!-- 图片 -->
                <div class="card-image" v-if="msg.image_url">
                    <img :src="getImageUrl(msg.image_url)" @click="previewImage(msg.image_url)" />
                </div>

                <!-- 底部信息 -->
                <div class="card-footer">
                    <div class="card-user">
                        <div class="user-dot" :style="{ background: msg.color }"></div>
                        <span class="card-nickname">{{ msg.nickname }}</span>
                    </div>
                    <div class="card-meta">
                        <span class="card-time">{{ formatTime(msg.create_time) }}</span>
                        <span class="card-reply-btn" @click.stop="openReply(msg)">💬 {{ msg.replies?.length || 0
                        }}</span>
                        <span class="card-like" :class="{ liked: likedIds.has(msg.id) }" @click.stop="handleLike(msg)">
                            <span class="like-icon" :ref="el => { if (el) likeRefs[msg.id] = el }">❤️</span>
                            <span class="like-count">{{ msg.like_count }}</span>
                        </span>
                    </div>
                </div>

                <!-- 回复区域 -->
                <div class="reply-section" v-if="msg.replies && msg.replies.length > 0">
                    <div class="reply-divider"></div>
                    <div class="reply-item" v-for="reply in msg.replies" :key="reply.id">
                        <span class="reply-nickname" :style="{ color: msg.color }">{{ reply.nickname }}</span>
                        <span class="reply-to" v-if="reply.reply_to"> 回复 <b>{{ reply.reply_to }}</b></span>
                        <span class="reply-content">：{{ reply.content }}</span>
                        <span class="reply-time">{{ formatTime(reply.create_time) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <el-empty v-if="messages.length === 0 && !loading" description="还没有留言，快来抢沙发吧！" />

        <!-- 留言弹窗 -->
        <el-dialog v-model="dialogVisible" title="✏️ 写一条留言" width="480px" :close-on-click-modal="false">
            <el-form :model="msgForm" label-width="60px">
                <el-form-item label="昵称">
                    <el-input v-model="msgForm.nickname" placeholder="留个名字吧" maxlength="20" />
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="msgForm.content" type="textarea" :rows="4" placeholder="写下你想说的话..."
                        maxlength="200" show-word-limit />
                </el-form-item>
                <!-- 图片上传 -->
                <el-form-item label="图片">
                    <div class="upload-area">
                        <div class="upload-preview" v-if="msgForm.image_url">
                            <img :src="getImageUrl(msgForm.image_url)" />
                            <button class="upload-remove" @click="msgForm.image_url = ''">✕</button>
                        </div>
                        <label class="upload-btn" v-else>
                            <input type="file" accept="image/*" @change="handleImageUpload" hidden />
                            <span class="upload-icon">📷</span>
                            <span class="upload-text">添加图片</span>
                        </label>
                    </div>
                </el-form-item>
                <!-- Emoji 选择器 -->
                <el-form-item label="表情">
                    <div class="emoji-tabs">
                        <span v-for="cat in emojiCategories" :key="cat.name" class="emoji-tab"
                            :class="{ active: activeEmojiTab === cat.name }" @click="activeEmojiTab = cat.name">
                            {{ cat.icon }}
                        </span>
                    </div>
                    <div class="emoji-grid">
                        <span v-for="e in currentEmojis" :key="e" class="emoji-item"
                            :class="{ active: msgForm.emoji === e }" @click="msgForm.emoji = e">{{ e }}</span>
                    </div>
                </el-form-item>
                <!-- 颜色选择器 -->
                <el-form-item label="颜色">
                    <div class="color-picker">
                        <span v-for="c in colorList" :key="c" class="color-item"
                            :class="{ active: msgForm.color === c }" :style="{ background: c }"
                            @click="msgForm.color = c"></span>
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitLoading" :disabled="submitCooldown > 0" @click="handleSubmit">
                    {{ submitCooldown > 0 ? `${submitCooldown}s 后可提交` : '发表留言' }}
                </el-button>
            </template>
        </el-dialog>

        <!-- 回复弹窗 -->
        <el-dialog v-model="replyDialogVisible" title="💬 回复留言" width="420px" :close-on-click-modal="false">
            <div class="reply-context">
                <span class="reply-context-emoji">{{ replyTarget.emoji }}</span>
                <span class="reply-context-text">{{ replyTarget.content }}</span>
            </div>
            <el-form :model="replyForm" label-width="60px">
                <el-form-item label="昵称">
                    <el-input v-model="replyForm.nickname" placeholder="留个名字吧" maxlength="20" />
                </el-form-item>
                <el-form-item label="回复">
                    <el-input v-model="replyForm.content" type="textarea" :rows="3" placeholder="写下你的回复..."
                        maxlength="200" show-word-limit />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="replyDialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="replyLoading" @click="handleSubmitReply">发送回复</el-button>
            </template>
        </el-dialog>

        <!-- 图片预览 -->
        <teleport to="body">
            <transition name="fade">
                <div class="image-preview-overlay" v-if="previewVisible" @click="previewVisible = false">
                    <img :src="getImageUrl(previewUrl)" class="preview-img" />
                </div>
            </transition>
        </teleport>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getActiveMessages, createMessage, likeMessage, replyMessage, uploadMessageImage, getLikedStatus } from '../../api/message';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const messages = ref([]);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const submitCooldown = ref(0);
const likedIds = ref(new Set());
const likeRefs = ref({});

// 回复相关
const replyDialogVisible = ref(false);
const replyLoading = ref(false);
const replyTarget = ref({});
const replyForm = reactive({ nickname: '', content: '' });

// 图片预览
const previewVisible = ref(false);
const previewUrl = ref('');

// Emoji 分类
const emojiCategories = [
    { name: '常用', icon: '⭐', emojis: ['💬', '🌟', '☀️', '❤️', '🌙', '📖', '🎨', '🎵', '🔥', '💡', '🍀', '🌈', '🐱', '🌊', '🎂', '🚀'] },
    { name: '心情', icon: '😊', emojis: ['😊', '😂', '🥰', '😎', '🤩', '😢', '😤', '🤔', '😴', '🥺', '🤯', '😇', '🤗', '😏', '🙄', '😬'] },
    { name: '手势', icon: '👋', emojis: ['👋', '👍', '👏', '🤝', '✌️', '🤞', '💪', '🙏', '👀', '🫶', '✋', '🤙', '☝️', '👆', '👇'] },
    { name: '自然', icon: '🌸', emojis: ['🌸', '🌺', '🌻', '🌹', '🍀', '🌿', '🍁', '☀️', '🌙', '⭐', '🌈', '⚡', '🌊', '❄️', '🔥', '💨'] },
    { name: '食物', icon: '🍕', emojis: ['🍕', '🍔', '🍟', '🍦', '🎂', '🍰', '☕', '🍵', '🥤', '🍺', '🍷', '🧋', '🍩', '🍪', '🍫', '🍿'] },
    { name: '动物', icon: '🐶', emojis: ['🐶', '🐱', '🐰', '🐻', '🐼', '🐨', '🦊', '🐷', '🐸', '🐵', '🦄', '🐝', '🦋', '🐙', '🐬', '🐳'] },
];

const activeEmojiTab = ref('常用');
const currentEmojis = computed(() => {
    const cat = emojiCategories.find(c => c.name === activeEmojiTab.value);
    return cat ? cat.emojis : [];
});

const colorList = ['#667eea', '#4ECDC4', '#FF6B6B', '#FCD34D', '#A78BFA', '#F472B6', '#34D399', '#FB923C', '#60A5FA', '#E879F9', '#F97316', '#14B8A6'];

const msgForm = reactive({ nickname: '', content: '', emoji: '💬', color: '#667eea', image_url: '' });

// 图片地址
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};

// 图片预览
const previewImage = (url) => { previewUrl.value = url; previewVisible.value = true; };

// 图片上传
const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { ElMessage.warning('图片不能超过 5MB'); return; }
    try {
        const res = await uploadMessageImage(file);
        msgForm.image_url = res.data.url;
        ElMessage.success('图片上传成功');
    } catch (error) { ElMessage.error('图片上传失败'); }
    e.target.value = '';
};

// 获取留言
const fetchMessages = async () => {
    loading.value = true;
    try {
        const res = await getActiveMessages();
        messages.value = res.data;
    } catch (error) { console.error('获取留言失败:', error); }
    finally { loading.value = false; }
};

// 获取点赞状态
const fetchLikedStatus = async () => {
    if (!userStore.isLoggedIn) return;
    try {
        const res = await getLikedStatus();
        likedIds.value = new Set(res.data);
    } catch (e) { }
};

// 打开弹窗
const openDialog = () => {
    msgForm.nickname = userStore.userInfo?.nickname || '';
    msgForm.content = '';
    msgForm.image_url = '';
    msgForm.emoji = emojiCategories[0].emojis[Math.floor(Math.random() * emojiCategories[0].emojis.length)];
    msgForm.color = colorList[Math.floor(Math.random() * colorList.length)];
    activeEmojiTab.value = '常用';
    dialogVisible.value = true;
};

// 提交留言（防重复）
const handleSubmit = async () => {
    if (!msgForm.content.trim()) { ElMessage.warning('请输入留言内容'); return; }
    if (submitCooldown.value > 0) return;

    submitLoading.value = true;
    try {
        await createMessage(msgForm);
        ElMessage.success('留言成功！');
        dialogVisible.value = false;
        fetchMessages();
        submitCooldown.value = 5;
        const timer = setInterval(() => {
            submitCooldown.value--;
            if (submitCooldown.value <= 0) clearInterval(timer);
        }, 1000);
    } catch (error) {
        if (error.response?.status === 429) ElMessage.warning('请勿重复提交');
    } finally { submitLoading.value = false; }
};

// 点赞（带动效）
const handleLike = async (msg) => {
    if (!userStore.isLoggedIn) { ElMessage.warning('请先登录后再点赞'); return; }

    const el = likeRefs.value[msg.id];
    if (el) {
        el.classList.remove('like-animate');
        void el.offsetWidth;
        el.classList.add('like-animate');
        createParticles(el);
    }

    try {
        const res = await likeMessage(msg.id);
        msg.like_count = res.data.like_count;
        if (res.data.liked) likedIds.value.add(msg.id);
        else likedIds.value.delete(msg.id);
    } catch (error) { console.error('点赞失败:', error); }
};

// 粒子爆炸
const createParticles = (el) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'heart-particle';
        particle.textContent = ['❤️', '💕', '✨', '💗', '💖'][Math.floor(Math.random() * 5)];
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--angle', (i * 45) + 'deg');
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
};

// 打开回复
const openReply = (msg) => {
    if (!userStore.isLoggedIn) { ElMessage.warning('请先登录后再回复'); return; }
    replyTarget.value = msg;
    replyForm.nickname = userStore.userInfo?.nickname || '';
    replyForm.content = '';
    replyDialogVisible.value = true;
};

// 提交回复
const handleSubmitReply = async () => {
    if (!replyForm.content.trim()) { ElMessage.warning('请输入回复内容'); return; }
    replyLoading.value = true;
    try {
        const res = await replyMessage(replyTarget.value.id, {
            nickname: replyForm.nickname || '匿名',
            content: replyForm.content.trim()
        });
        if (!replyTarget.value.replies) replyTarget.value.replies = [];
        replyTarget.value.replies.push(res.data);
        ElMessage.success('回复成功！');
        replyDialogVisible.value = false;
    } catch (error) { console.error('回复失败:', error); }
    finally { replyLoading.value = false; }
};

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString();
};

onMounted(() => { fetchMessages(); fetchLikedStatus(); });
</script>

<style scoped>
.page-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px 80px;
}

/* ==================== Hero ==================== */
.msg-hero {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    margin-top: 24px;
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
    background-image: linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
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
}

.orb-2 {
    width: 160px;
    height: 160px;
    background: #F472B6;
    bottom: -40px;
    right: -30px;
}

.hero-content {
    position: relative;
    z-index: 2;
}

.hero-badge {
    display: inline-block;
    padding: 4px 18px;
    background: linear-gradient(135deg, #A78BFA, #F472B6);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    border-radius: 20px;
    letter-spacing: 3px;
    margin-bottom: 16px;
}

.hero-title {
    font-size: 34px;
    font-weight: 900;
    color: #1a1a2e;
    margin: 0 0 8px;
}

.hero-desc {
    font-size: 15px;
    color: #999;
    margin: 0;
}

/* ==================== 操作栏 ==================== */
.action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 24px 0;
}

.msg-count {
    font-size: 14px;
    color: #999;
}

.write-msg-btn {
    padding: 10px 24px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
}

.write-msg-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

/* ==================== 毛玻璃卡片 ==================== */
.masonry-grid {
    columns: 4;
    column-gap: 16px;
}

.msg-card {
    break-inside: avoid;
    margin-bottom: 16px;
    border-radius: 20px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: fadeInUp 0.5s ease forwards;
    opacity: 0;
}

.glass-card {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.msg-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.85);
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card-accent {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
}

.top-badge {
    font-size: 11px;
    color: #e74c3c;
    font-weight: 700;
    margin-bottom: 8px;
}

.card-emoji {
    font-size: 32px;
    margin-bottom: 10px;
}

.card-content {
    font-size: 15px;
    color: #333;
    line-height: 1.6;
    margin: 0 0 14px;
    word-break: break-word;
}

/* 图片 */
.card-image {
    margin-bottom: 14px;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
}

.card-image img {
    width: 100%;
    display: block;
    transition: transform 0.3s;
}

.card-image:hover img {
    transform: scale(1.03);
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;
}

.card-user {
    display: flex;
    align-items: center;
    gap: 6px;
}

.user-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.card-nickname {
    font-size: 13px;
    font-weight: 600;
    color: #555;
}

.card-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #bbb;
}

.card-reply-btn {
    cursor: pointer;
    transition: all 0.2s;
}

.card-reply-btn:hover {
    color: #667eea;
}

.card-like {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
    transition: all 0.2s;
}

.card-like.liked {
    color: #FF6B6B;
}

.like-icon {
    display: inline-block;
    transition: transform 0.2s;
}

.like-animate {
    animation: likePopup 0.5s ease;
}

@keyframes likePopup {
    0% {
        transform: scale(1);
    }

    30% {
        transform: scale(1.5);
    }

    60% {
        transform: scale(0.9);
    }

    100% {
        transform: scale(1);
    }
}

/* ==================== 回复区域 ==================== */
.reply-section {
    margin-top: 12px;
}

.reply-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.06), transparent);
    margin-bottom: 10px;
}

.reply-item {
    font-size: 12px;
    line-height: 1.7;
    color: #888;
    padding: 4px 0;
}

.reply-nickname {
    font-weight: 700;
    font-size: 12px;
}

.reply-to {
    color: #aaa;
}

.reply-to b {
    color: #888;
    font-weight: 600;
}

.reply-content {
    color: #666;
}

.reply-time {
    color: #ccc;
    font-size: 11px;
    margin-left: 6px;
}

/* ==================== Emoji 选择器 ==================== */
.emoji-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
}

.emoji-tab {
    font-size: 20px;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
    opacity: 0.5;
}

.emoji-tab:hover {
    opacity: 0.8;
    background: #f5f5f5;
}

.emoji-tab.active {
    opacity: 1;
    background: #f0f0ff;
}

.emoji-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;
}

.emoji-grid::-webkit-scrollbar {
    width: 4px;
}

.emoji-grid::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
}

.emoji-item {
    font-size: 22px;
    cursor: pointer;
    padding: 5px;
    border-radius: 8px;
    transition: all 0.2s;
    border: 2px solid transparent;
}

.emoji-item:hover {
    background: #f5f5f5;
}

.emoji-item.active {
    border-color: #667eea;
    background: #f0f0ff;
}

/* ==================== 图片上传 ==================== */
.upload-area {
    display: flex;
    gap: 10px;
}

.upload-btn {
    width: 90px;
    height: 90px;
    border: 2px dashed #ddd;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.upload-btn:hover {
    border-color: #667eea;
    background: #f8f7ff;
}

.upload-icon {
    font-size: 24px;
}

.upload-text {
    font-size: 11px;
    color: #999;
}

.upload-preview {
    position: relative;
    width: 90px;
    height: 90px;
    border-radius: 12px;
    overflow: hidden;
}

.upload-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.upload-remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border: none;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ==================== 颜色选择器 ==================== */
.color-picker {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.color-item {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid transparent;
    transition: all 0.2s;
}

.color-item:hover {
    transform: scale(1.15);
}

.color-item.active {
    border-color: #1a1a2e;
    box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1a1a2e;
}

/* ==================== 回复弹窗 ==================== */
.reply-context {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px;
    background: #f8f9fb;
    border-radius: 12px;
    margin-bottom: 16px;
}

.reply-context-emoji {
    font-size: 24px;
}

.reply-context-text {
    font-size: 14px;
    color: #555;
    line-height: 1.5;
}

/* ==================== 图片预览 ==================== */
.image-preview-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.preview-img {
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 8px;
    object-fit: contain;
}

/* ==================== 动画 ==================== */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 点赞粒子 */
.heart-particle {
    position: fixed;
    font-size: 14px;
    pointer-events: none;
    z-index: 99999;
    animation: particleFly 0.8s ease-out forwards;
}

@keyframes particleFly {
    0% {
        opacity: 1;
        transform: translate(0, 0) scale(1);
    }

    100% {
        opacity: 0;
        transform: translate(calc(cos(var(--angle)) * 40px), calc(sin(var(--angle)) * 40px - 20px)) scale(0.3);
    }
}

/* ==================== 响应式 ==================== */
@media (max-width: 1024px) {
    .masonry-grid {
        columns: 3;
    }
}

@media (max-width: 768px) {
    .masonry-grid {
        columns: 2;
    }

    .hero-title {
        font-size: 26px;
    }
}

@media (max-width: 480px) {
    .masonry-grid {
        columns: 1;
    }
}
</style>