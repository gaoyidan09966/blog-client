<template>
    <div class="page-container">
        <!-- Hero 区域 -->
        <div class="page-header">
            <div class="hero-bg">
                <div class="hero-orb orb-1"></div>
                <div class="hero-orb orb-2"></div>
                <div class="hero-orb orb-3"></div>
                <div class="hero-grid"></div>
            </div>
            <div class="hero-content">
                <div class="hero-badge">
                    <el-icon>
                        <ChatLineSquare />
                    </el-icon>
                    MESSAGE WALL
                </div>
                <h1 class="hero-title">留言墙</h1>
                <p class="hero-subtitle">在这里留下你想说的话，分享此刻的心情。</p>
                <div class="hero-stats" v-if="messages.length > 0">
                    <div class="stat-pill">
                        <span class="stat-num">{{ messages.length }}</span>
                        <span class="stat-text">条留言</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 操作栏 -->
        <div class="action-bar">
            <button class="write-btn" @click="openDialog" v-if="userStore.isLoggedIn">
                <el-icon>
                    <EditPen />
                </el-icon> 写留言
            </button>
            <button class="write-btn" @click="router.push('/login')" v-else>
                <el-icon>
                    <Lock />
                </el-icon> 登录后留言
            </button>
        </div>

        <!-- 加载骨架 -->
        <div v-if="loading" class="masonry-grid">
            <div v-for="i in 6" :key="i" class="msg-card skeleton-card" :class="'skel-' + (i % 3)">
                <div class="skeleton-line long"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else-if="messages.length === 0" description="还没有留言，快来抢沙发吧！" />

        <!-- 瀑布流留言卡片 -->
        <div v-else class="masonry-grid">
            <div v-for="(msg, index) in messages" :key="msg.id" class="msg-card glass-card"
                :style="{ animationDelay: index * 0.05 + 's' }">
                <div class="card-accent" :style="{ background: msg.color }"></div>
                <div class="top-badge" v-if="msg.is_top">
                    <el-icon>
                        <Top />
                    </el-icon> 置顶
                </div>
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
                        <span class="card-reply-btn" @click.stop="openReply(msg)">
                            <el-icon>
                                <ChatDotRound />
                            </el-icon> {{ msg.replies?.length || 0 }}
                        </span>
                        <span class="card-like" :class="{ liked: likedIds.has(msg.id) }" @click.stop="handleLike(msg)">
                            <svg class="heart-svg" viewBox="0 0 24 24" :fill="likedIds.has(msg.id) ? '#FF6B6B' : 'none'"
                                :stroke="likedIds.has(msg.id) ? '#FF6B6B' : '#ccc'" stroke-width="2">
                                <path
                                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
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

        <!-- 留言弹窗 -->
        <el-dialog v-model="dialogVisible" title="写一条留言" width="480px" :close-on-click-modal="false" class="msg-dialog">
            <el-form :model="msgForm" label-width="60px">
                <el-form-item label="昵称">
                    <el-input v-model="msgForm.nickname" placeholder="留个名字吧" maxlength="20" />
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="msgForm.content" type="textarea" :rows="4" placeholder="写下你想说的话..."
                        maxlength="200" show-word-limit />
                </el-form-item>
                <el-form-item label="图片">
                    <div class="upload-area">
                        <div class="upload-preview" v-if="msgForm.image_url">
                            <img :src="getImageUrl(msgForm.image_url)" />
                            <button class="upload-remove" @click="msgForm.image_url = ''">
                                <el-icon>
                                    <Close />
                                </el-icon>
                            </button>
                        </div>
                        <label class="upload-btn" v-else>
                            <input type="file" accept="image/*" @change="handleImageUpload" hidden />
                            <el-icon :size="24">
                                <Picture />
                            </el-icon>
                            <span class="upload-text">添加图片</span>
                        </label>
                    </div>
                </el-form-item>
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
        <el-dialog v-model="replyDialogVisible" title="回复留言" width="420px" :close-on-click-modal="false"
            class="msg-dialog">
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
import { formatTime } from '../../utils/format';
import { ChatLineSquare, EditPen, Lock, ChatDotRound, Top, Close, Picture } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const messages = ref([]);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const submitCooldown = ref(0);
const likedIds = ref(new Set());

const replyDialogVisible = ref(false);
const replyLoading = ref(false);
const replyTarget = ref({});
const replyForm = reactive({ nickname: '', content: '' });

const previewVisible = ref(false);
const previewUrl = ref('');

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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};

const previewImage = (url) => { previewUrl.value = url; previewVisible.value = true; };

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

const fetchMessages = async () => {
    loading.value = true;
    try {
        const res = await getActiveMessages();
        messages.value = res.data;
    } catch (error) { console.error('获取留言失败:', error); }
    finally { loading.value = false; }
};

const fetchLikedStatus = async () => {
    if (!userStore.isLoggedIn) return;
    try {
        const res = await getLikedStatus();
        likedIds.value = new Set(res.data);
    } catch (e) { }
};

const openDialog = () => {
    msgForm.nickname = userStore.userInfo?.nickname || '';
    msgForm.content = '';
    msgForm.image_url = '';
    msgForm.emoji = emojiCategories[0].emojis[Math.floor(Math.random() * emojiCategories[0].emojis.length)];
    msgForm.color = colorList[Math.floor(Math.random() * colorList.length)];
    activeEmojiTab.value = '常用';
    dialogVisible.value = true;
};

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

const handleLike = async (msg) => {
    if (!userStore.isLoggedIn) { ElMessage.warning('请先登录后再点赞'); return; }
    try {
        const res = await likeMessage(msg.id);
        msg.like_count = res.data.like_count;
        if (res.data.liked) likedIds.value.add(msg.id);
        else likedIds.value.delete(msg.id);
    } catch (error) { console.error('点赞失败:', error); }
};

const openReply = (msg) => {
    if (!userStore.isLoggedIn) { ElMessage.warning('请先登录后再回复'); return; }
    replyTarget.value = msg;
    replyForm.nickname = userStore.userInfo?.nickname || '';
    replyForm.content = '';
    replyDialogVisible.value = true;
};

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

onMounted(() => { fetchMessages(); fetchLikedStatus(); });
</script>

<style scoped>
.page-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px 16px 60px;
}

@media (min-width: 768px) {
    .page-container {
        padding: 30px 20px 80px;
    }
}

/* ==================== HERO ==================== */
.page-header {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 40%, #fdf2f8 100%);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
    .page-header {
        border-radius: 28px;
        margin-bottom: 32px;
    }
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
    filter: blur(60px);
    opacity: 0.4;
}

.orb-1 {
    width: 140px;
    height: 140px;
    background: #A78BFA;
    top: -40px;
    left: -20px;
    animation: orbDrift 8s ease-in-out infinite;
}

.orb-2 {
    width: 120px;
    height: 120px;
    background: #F472B6;
    bottom: -30px;
    right: -20px;
    animation: orbDrift 10s ease-in-out infinite reverse;
}

.orb-3 {
    width: 80px;
    height: 80px;
    background: #667eea;
    top: 20%;
    right: 15%;
    animation: orbDrift 9s ease-in-out infinite 2s;
}

@media (min-width: 768px) {
    .orb-1 {
        width: 220px;
        height: 220px;
        top: -60px;
        left: -40px;
        filter: blur(70px);
        opacity: 0.5;
    }

    .orb-2 {
        width: 180px;
        height: 180px;
        bottom: -50px;
        right: -30px;
    }

    .orb-3 {
        width: 140px;
        height: 140px;
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
    text-align: center;
    padding: 36px 20px;
}

@media (min-width: 768px) {
    .hero-content {
        padding: 50px 20px;
    }
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 16px;
    background: linear-gradient(135deg, #A78BFA, #F472B6);
    color: #fff;
    font-size: 11px;
    font-weight: 800;
    border-radius: 20px;
    letter-spacing: 3px;
    margin-bottom: 14px;
}

.hero-title {
    font-size: 30px;
    font-weight: 900;
    margin: 0 0 10px;
    background: linear-gradient(135deg, #1a1a2e 0%, #A78BFA 50%, #F472B6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (min-width: 768px) {
    .hero-title {
        font-size: 44px;
    }
}

.hero-subtitle {
    color: #8888aa;
    font-size: 13px;
    margin: 0 0 20px;
    line-height: 1.5;
}

@media (min-width: 768px) {
    .hero-subtitle {
        font-size: 15px;
        margin-bottom: 24px;
    }
}

.hero-stats {
    display: flex;
    justify-content: center;
}

.stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

@media (min-width: 768px) {
    .stat-pill {
        padding: 10px 24px;
    }
}

.stat-num {
    font-size: 20px;
    font-weight: 900;
    background: linear-gradient(135deg, #A78BFA, #F472B6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

@media (min-width: 768px) {
    .stat-num {
        font-size: 24px;
    }
}

.stat-text {
    font-size: 12px;
    color: #999;
}

/* ==================== 操作栏 ==================== */
.action-bar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
}

.write-btn {
    display: flex;
    align-items: center;
    gap: 6px;
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

.write-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

/* ==================== 瀑布流 ==================== */
.masonry-grid {
    columns: 2;
    column-gap: 14px;
}

@media (min-width: 640px) {
    .masonry-grid {
        columns: 3;
        column-gap: 16px;
    }
}

@media (min-width: 1024px) {
    .masonry-grid {
        columns: 4;
    }
}

/* ==================== 留言卡片 ==================== */
.msg-card {
    break-inside: avoid;
    margin-bottom: 14px;
    border-radius: 16px;
    padding: 18px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    animation: fadeUp 0.5s ease forwards;
    opacity: 0;
}

@media (min-width: 768px) {
    .msg-card {
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 16px;
    }
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
    display: flex;
    align-items: center;
    gap: 4px;
}

.card-emoji {
    font-size: 28px;
    margin-bottom: 8px;
}

@media (min-width: 768px) {
    .card-emoji {
        font-size: 32px;
        margin-bottom: 10px;
    }
}

.card-content {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin: 0 0 12px;
    word-break: break-word;
}

@media (min-width: 768px) {
    .card-content {
        font-size: 15px;
    }
}

.card-image {
    margin-bottom: 12px;
    border-radius: 10px;
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
    font-size: 12px;
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

.card-time {
    white-space: nowrap;
}

.card-reply-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
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

.heart-svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s;
}

.card-like:active .heart-svg {
    transform: scale(1.3);
}

.like-count {
    font-size: 12px;
    font-weight: 600;
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
    overflow-x: auto;
}

.emoji-tab {
    font-size: 20px;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
    opacity: 0.5;
    flex-shrink: 0;
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
    color: #999;
}

.upload-btn:hover {
    border-color: #667eea;
    background: #f8f7ff;
    color: #667eea;
}

.upload-text {
    font-size: 11px;
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

/* ==================== 弹窗手机端适配 ==================== */
:deep(.msg-dialog) {
    width: 90vw !important;
    max-width: 480px;
    border-radius: 16px !important;
}

/* ==================== 骨架屏 ==================== */
.skeleton-card {
    animation: none !important;
    opacity: 1 !important;
    background: #fff;
    border-radius: 16px;
    padding: 18px;
}

.skel-0 {
    min-height: 180px;
}

.skel-1 {
    min-height: 240px;
}

.skel-2 {
    min-height: 160px;
}

.skeleton-line {
    height: 14px;
    border-radius: 6px;
    margin-bottom: 10px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
    width: 30%;
}

.skeleton-line.medium {
    width: 60%;
}

.skeleton-line.long {
    width: 90%;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* ==================== 动画 ==================== */
@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>