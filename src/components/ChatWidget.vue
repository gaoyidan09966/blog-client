<template>
    <div class="chat-widget">
        <!-- 客服离线时显示小提示 -->
        <transition name="fade">
            <div class="offline-tip" v-if="!serviceOnline && !isOpen" @click="openChat">
                <span class="offline-tip-icon">🌙</span>
                <span class="offline-tip-text">客服暂时离线 · 可留言</span>
            </div>
        </transition>

        <!-- 悬浮按钮（客服在线时显示） -->
        <transition name="fade">
            <div class="chat-btn" v-show="!isOpen && serviceOnline" @click="openChat">
                <span class="chat-btn-icon">💬</span>
                <span class="chat-btn-dot" v-if="unreadCount > 0">
                    {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
            </div>
        </transition>

        <!-- 聊天窗口 -->
        <transition name="slide-up">
            <div class="chat-window" v-show="isOpen">
                <!-- 头部 -->
                <div class="chat-header">
                    <div class="header-info">
                        <span class="header-avatar">📝</span>
                        <div class="header-text">
                            <h4>拾光笔记 客服</h4>
                            <span class="header-status">
                                <span class="status-dot" :class="{ 'status-offline': !serviceOnline }"></span>
                                {{ serviceOnline ? '在线 · 通常1小时内回复' : '客服暂时离线 · 可留言' }}
                            </span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="header-btn" @click="clearMessages" title="清空对话">🗑️</button>
                        <button class="header-btn" @click="closeChat" title="关闭">✕</button>
                    </div>
                </div>

                <!-- 昵称设置 -->
                <div class="nickname-bar" v-if="!nickname">
                    <div class="nickname-inner">
                        <p class="nickname-tip">👋 你好！先告诉我怎么称呼你吧~</p>
                        <div class="nickname-input-row">
                            <input type="text" v-model="tempNickname" class="nickname-input" placeholder="输入你的昵称"
                                maxlength="20" @keyup.enter="setNickname" />
                            <button class="nickname-btn" @click="setNickname"
                                :disabled="!tempNickname.trim()">确定</button>
                        </div>
                    </div>
                </div>

                <!-- 消息列表 -->
                <div class="chat-body" ref="chatBody" v-show="nickname">
                    <!-- 日期分隔 -->
                    <div class="msg-time-divider">{{ todayStr }}</div>

                    <!-- 欢迎消息 -->
                    <div class="msg-row msg-left">
                        <div class="msg-avatar">🤖</div>
                        <div class="msg-col">
                            <div class="msg-bubble">
                                <p>Hi {{ nickname }}！欢迎来到拾光笔记 👋</p>
                                <p>我是博客助手，有什么问题可以问我~</p>
                            </div>
                            <span class="msg-time">{{ welcomeTime }}</span>
                        </div>
                    </div>

                    <!-- 快捷问题 -->
                    <div class="quick-questions" v-if="showQuickBtns">
                        <p class="quick-label">💡 你可以问我</p>
                        <div class="quick-grid">
                            <button v-for="(q, i) in hotQuestions" :key="i" class="quick-btn"
                                @click="sendQuickQuestion(q.text)">
                                {{ q.icon }} {{ q.text }}
                            </button>
                        </div>
                    </div>

                    <!-- 聊天消息 -->
                    <template v-for="(msg, i) in messages" :key="i">
                        <!-- 时间分隔 -->
                        <div class="msg-time-divider" v-if="msg.showTime">
                            {{ msg.timeStr }}
                        </div>

                        <!-- 用户消息 -->
                        <div class="msg-row msg-right">
                            <div class="msg-col">
                                <div class="msg-bubble msg-user">{{ msg.content }}</div>
                                <span class="msg-time msg-time-right">{{ msg.sendTime }}</span>
                            </div>
                        </div>

                        <!-- AI 自动回复 -->
                        <div class="msg-row msg-left" v-if="msg.reply">
                            <div class="msg-avatar">🤖</div>
                            <div class="msg-col">
                                <div class="msg-bubble">{{ msg.reply }}</div>
                                <span class="msg-time">{{ msg.replyTime }}</span>
                            </div>
                        </div>

                        <!-- 追问按钮 -->
                        <div class="follow-up-btns" v-if="msg.followUps && msg.followUps.length > 0">
                            <button v-for="(fu, fi) in msg.followUps" :key="fi" class="follow-up-btn"
                                @click="sendQuickQuestion(fu)">
                                {{ fu }}
                            </button>
                        </div>

                        <!-- 博主手动回复 -->
                        <div class="msg-row msg-left" v-if="msg.adminReply">
                            <div class="msg-avatar msg-avatar-admin">📝</div>
                            <div class="msg-col">
                                <div class="msg-bubble msg-admin-reply">
                                    <span class="admin-badge">博主回复</span>
                                    <p>{{ msg.adminReply }}</p>
                                </div>
                                <span class="msg-time">{{ msg.adminReplyTime }}</span>
                            </div>
                        </div>

                        <!-- 加载中 -->
                        <div class="msg-row msg-left" v-if="msg.loading">
                            <div class="msg-avatar">🤖</div>
                            <div class="msg-col">
                                <div class="msg-bubble msg-loading">
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- 输入区域 -->
                <div class="chat-footer" v-show="nickname">
                    <div class="input-wrapper">
                        <input type="text" v-model="inputText" class="chat-input" placeholder="输入你的问题..."
                            @keyup.enter="sendMessage" :disabled="sending" />
                        <span class="char-count" v-if="inputText.length > 0">
                            {{ inputText.length }}/200
                        </span>
                    </div>
                    <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || sending">
                        发送
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import request from '../api/request';

const isOpen = ref(false);
const inputText = ref('');
const sending = ref(false);
const messages = ref([]);
const hotQuestions = ref([]);
const showQuickBtns = ref(true);
const chatBody = ref(null);
const nickname = ref('');
const tempNickname = ref('');
const unreadCount = ref(0);
const serviceOnline = ref(true);
let pollTimer = null;
let statusTimer = null;

// ==================== 提示音 ====================
const notificationSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10AAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');

const playNotification = () => {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10AAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
        audio.volume = 0.3;
        audio.play().catch(() => { });
    } catch (e) { }
};

// ==================== 标题闪烁 ====================
let titleTimer = null;
const originalTitle = document.title;

const flashTitle = () => {
    if (titleTimer) return;
    let visible = true;
    titleTimer = setInterval(() => {
        document.title = visible ? '💬 你有新回复' : originalTitle;
        visible = !visible;
    }, 1000);
    setTimeout(stopFlash, 10000);
};

const stopFlash = () => {
    if (titleTimer) {
        clearInterval(titleTimer);
        titleTimer = null;
        document.title = originalTitle;
    }
};

const handleFocus = () => {
    stopFlash();
    if (isOpen.value) unreadCount.value = 0;
};

// ==================== 时间 ====================
const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};

const todayStr = computed(() => {
    const d = new Date();
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
});

const welcomeTime = computed(() => formatTime(new Date()));

// ==================== 昵称 ====================
const setNickname = () => {
    const name = tempNickname.value.trim();
    if (!name) return;
    nickname.value = name;
    localStorage.setItem('chat_nickname', name);
};

// ==================== 打开 / 关闭 ====================
const openChat = () => {
    isOpen.value = true;
    unreadCount.value = 0;
    stopFlash();
    scrollToBottom();
};

const closeChat = () => { isOpen.value = false; };

const clearMessages = () => {
    messages.value = [];
    showQuickBtns.value = true;
    localStorage.removeItem('chat_messages');
};

// ==================== 获取客服状态 ====================
const fetchServiceStatus = async () => {
    try {
        const res = await request.get('/chat/status');
        serviceOnline.value = res.data.online;
    } catch (e) { serviceOnline.value = true; }
};

// ==================== 热门问题 ====================
const fetchHotQuestions = async () => {
    try {
        const res = await request.get('/chat/hot-questions');
        hotQuestions.value = res.data;
    } catch (e) { }
};

// ==================== 滚动 ====================
const scrollToBottom = async () => {
    await nextTick();
    if (chatBody.value) {
        chatBody.value.scrollTop = chatBody.value.scrollHeight;
    }
};

const scrollToElement = async (el) => {
    await nextTick();
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// ==================== 时间判断 ====================
const shouldShowTime = (prevMsg, newTime) => {
    if (!prevMsg) return true;
    const prevTime = new Date(prevMsg.rawTime).getTime();
    return newTime - prevTime > 5 * 60 * 1000;
};

const sendQuickQuestion = (text) => {
    inputText.value = text;
    sendMessage();
};

// ==================== 持久化 ====================
const saveMessages = () => {
    const data = messages.value.map(m => ({
        dbId: m.dbId,
        content: m.content,
        reply: m.reply,
        adminReply: m.adminReply || null,
        adminReplyTime: m.adminReplyTime || '',
        rawTime: m.rawTime,
        sendTime: m.sendTime,
        replyTime: m.replyTime,
        showTime: m.showTime,
        followUps: m.followUps
    }));
    localStorage.setItem('chat_messages', JSON.stringify(data));
};

const loadMessages = () => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
        try {
            messages.value = JSON.parse(saved).map(m => ({ ...m, loading: false }));
            if (messages.value.length > 0) showQuickBtns.value = false;
        } catch (e) { }
    }
};

// ★ 获取已回复消息的最大ID
const getMaxRepliedId = () => {
    let maxId = 0;
    messages.value.forEach(m => {
        if (m.dbId && m.adminReply && m.dbId > maxId) {
            maxId = m.dbId;
        }
    });
    return maxId;
};

// ==================== 轮询管理员回复（核心修复） ====================
let polling = false;

const pollReplies = async () => {
    if (!nickname.value || polling) return;
    polling = true;

    try {
        // 收集所有没有 adminReply 且有 dbId 的消息
        const pendingMessages = messages.value.filter(m => m.dbId && !m.adminReply);

        if (pendingMessages.length === 0) {
            polling = false;
            return;
        }

        // 用最小的 dbId 作为 afterId，确保不遗漏
        const minDbId = Math.min(...pendingMessages.map(m => m.dbId)) - 1;

        const res = await request.get('/chat/my-replies', {
            params: { nickname: nickname.value, afterId: minDbId }
        });

        const replies = res.data;
        if (!replies || replies.length === 0) {
            polling = false;
            return;
        }

        let hasNewReply = false;

        for (const reply of replies) {
            // ★ 用 dbId 精确匹配，不用内容匹配
            const matchedMsg = messages.value.find(
                m => m.dbId === reply.id && !m.adminReply
            );

            if (matchedMsg && reply.reply) {
                matchedMsg.adminReply = reply.reply;
                matchedMsg.adminReplyTime = formatTime(new Date(reply.create_time));
                hasNewReply = true;

                if (!isOpen.value) {
                    unreadCount.value++;
                }
            }
        }

        if (hasNewReply) {
            saveMessages();
            playNotification();

            if (!isOpen.value || document.hidden) {
                flashTitle();
            }

            // 自动滚动到最新博主回复
            await nextTick();
            if (isOpen.value && chatBody.value) {
                const adminBubbles = chatBody.value.querySelectorAll('.msg-admin-reply');
                if (adminBubbles.length > 0) {
                    scrollToElement(adminBubbles[adminBubbles.length - 1]);
                }
            }
        }
    } catch (error) {
        console.error('轮询回复失败:', error);
    } finally {
        polling = false;
    }
};

// ==================== 发送消息 ====================
const sendMessage = async () => {
    const text = inputText.value.trim();
    if (!text || sending.value) return;

    showQuickBtns.value = false;

    const now = new Date();
    const prevMsg = messages.value.length > 0 ? messages.value[messages.value.length - 1] : null;

    const msgData = {
        dbId: null,  // 发送后填入
        content: text,
        reply: null,
        adminReply: null,
        adminReplyTime: '',
        rawTime: now.toISOString(),
        sendTime: formatTime(now),
        replyTime: '',
        showTime: shouldShowTime(prevMsg, now.getTime()),
        timeStr: formatTime(now),
        followUps: null,
        loading: true
    };

    messages.value.push(msgData);
    inputText.value = '';
    sending.value = true;
    await scrollToBottom();

    const msgIndex = messages.value.length - 1;

    try {
        const res = await request.post('/chat/send', {
            content: text,
            nickname: nickname.value
        });
        const replyData = res.data;

        // ★ 保存数据库ID，用于后续精确匹配
        messages.value[msgIndex].dbId = replyData.dbId;

        const replyTime = new Date();
        messages.value[msgIndex].reply = replyData.reply || '感谢你的留言！博主看到后会尽快回复你。';
        messages.value[msgIndex].replyTime = formatTime(replyTime);
        messages.value[msgIndex].followUps = replyData.followUps || null;
    } catch (error) {
        messages.value[msgIndex].reply = '消息发送失败，请稍后再试。';
        messages.value[msgIndex].replyTime = formatTime(new Date());
    } finally {
        messages.value[msgIndex].loading = false;
        sending.value = false;
        saveMessages();
        await scrollToBottom();

        // ★ 发送后 3 秒开始密集轮询（每 3 秒一次，持续 1 分钟）
        let fastPollCount = 0;
        const fastPoll = setInterval(() => {
            pollReplies();
            fastPollCount++;
            if (fastPollCount >= 20) clearInterval(fastPoll); // 最多轮询 20 次
        }, 3000);
    }
};

// ==================== 生命周期 ====================
onMounted(() => {
    const savedNickname = localStorage.getItem('chat_nickname');
    if (savedNickname) nickname.value = savedNickname;

    loadMessages();
    fetchHotQuestions();
    fetchServiceStatus();

    // ★ 常规轮询：每 5 秒（从 15 秒改为 5 秒）
    pollTimer = setInterval(pollReplies, 5000);

    // 状态轮询：每 60 秒
    statusTimer = setInterval(fetchServiceStatus, 60000);

    // 首次检查
    setTimeout(pollReplies, 1000);

    window.addEventListener('focus', handleFocus);
});

onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer);
    if (statusTimer) clearInterval(statusTimer);
    window.removeEventListener('focus', handleFocus);
    stopFlash();
});
</script>

<style scoped>
.chat-widget {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
}

/* ==================== 悬浮按钮 ==================== */
.chat-btn {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.35);
    transition: all 0.3s;
    position: relative;
}

.chat-btn:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.45);
}

.chat-btn-icon {
    font-size: 28px;
}

.chat-btn-dot {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    background: #FF6B6B;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 10px;
    border: 2px solid #fff;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ==================== 聊天窗口 ==================== */
.chat-window {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 400px;
    height: 560px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.06);
}

/* 头部 */
.chat-header {
    padding: 16px 18px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.header-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.header-avatar {
    font-size: 30px;
    width: 42px;
    height: 42px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-text h4 {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.header-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
}

.status-dot {
    width: 7px;
    height: 7px;
    background: #4ADE80;
    border-radius: 50%;
    animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.header-actions {
    display: flex;
    gap: 6px;
}

.header-btn {
    width: 30px;
    height: 30px;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: background 0.2s;
}

.header-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* ==================== 昵称设置 ==================== */
.nickname-bar {
    padding: 20px;
    background: #f8f9fb;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nickname-inner {
    text-align: center;
}

.nickname-tip {
    font-size: 15px;
    color: #555;
    margin: 0 0 16px;
}

.nickname-input-row {
    display: flex;
    gap: 8px;
}

.nickname-input {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.nickname-input:focus {
    border-color: #667eea;
}

.nickname-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
}

.nickname-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ==================== 消息区域 ==================== */
.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #f8f9fb;
}

.chat-body::-webkit-scrollbar {
    width: 4px;
}

.chat-body::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
}

/* 时间分隔 */
.msg-time-divider {
    text-align: center;
    font-size: 11px;
    color: #bbb;
    margin: 12px 0;
    position: relative;
}

.msg-time-divider::before,
.msg-time-divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 30%;
    height: 1px;
    background: #e8e8e8;
}

.msg-time-divider::before {
    left: 0;
}

.msg-time-divider::after {
    right: 0;
}

/* 消息行 */
.msg-row {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
}

.msg-right {
    justify-content: flex-end;
}

.msg-col {
    display: flex;
    flex-direction: column;
}

.msg-right .msg-col {
    align-items: flex-end;
}

.msg-avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.msg-bubble {
    max-width: 280px;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 13px;
    line-height: 1.6;
    color: #333;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.msg-bubble p {
    margin: 0 0 4px;
}

.msg-bubble p:last-child {
    margin: 0;
}

.msg-user {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border-radius: 16px 16px 4px 16px;
}

.msg-left .msg-bubble {
    border-radius: 16px 16px 16px 4px;
}

/* 时间标签 */
.msg-time {
    font-size: 11px;
    color: #bbb;
    margin-top: 3px;
    padding: 0 4px;
}

.msg-time-right {
    text-align: right;
}


/* 加载动画 */
.msg-loading {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 14px 18px;
}

.msg-loading .dot {
    width: 7px;
    height: 7px;
    background: #ccc;
    border-radius: 50%;
    animation: dotBounce 1.4s ease-in-out infinite;
}

.msg-loading .dot:nth-child(2) {
    animation-delay: 0.2s;
}

.msg-loading .dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes dotBounce {

    0%,
    60%,
    100% {
        transform: translateY(0);
    }

    30% {
        transform: translateY(-6px);
    }
}


/* 博主手动回复样式 */
.msg-avatar-admin {
    background: linear-gradient(135deg, #F472B6, #FCD34D);
}

.msg-admin-reply {
    background: #fff5f5;
    border: 1px solid #fee2e2;
}

.admin-badge {
    display: inline-block;
    padding: 2px 8px;
    background: linear-gradient(135deg, #F472B6, #FCD34D);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    border-radius: 8px;
    margin-bottom: 6px;
}

.msg-admin-reply p {
    margin: 0;
    color: #333;
}

/* ==================== 快捷问题 ==================== */
.quick-questions {
    margin: 8px 0 14px;
}

.quick-label {
    font-size: 12px;
    color: #999;
    margin: 0 0 8px;
}

.quick-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.quick-btn {
    padding: 7px 14px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 20px;
    font-size: 12px;
    color: #555;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.quick-btn:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f5f3ff;
}

/* 追问按钮 */
.follow-up-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 4px 0 10px 40px;
}

.follow-up-btn {
    padding: 6px 12px;
    background: #f0f0ff;
    border: 1px solid #e0e0ff;
    border-radius: 16px;
    font-size: 12px;
    color: #667eea;
    cursor: pointer;
    transition: all 0.2s;
}

.follow-up-btn:hover {
    background: #667eea;
    color: #fff;
}

/* ==================== 输入区域 ==================== */
.chat-footer {
    padding: 12px 14px;
    display: flex;
    gap: 8px;
    border-top: 1px solid #f0f0f0;
    background: #fff;
    flex-shrink: 0;
}

.input-wrapper {
    flex: 1;
    position: relative;
}

.chat-input {
    width: 100%;
    padding: 10px 14px;
    padding-right: 50px;
    border: 2px solid #e8e8e8;
    border-radius: 12px;
    font-size: 13px;
    outline: none;
    color: #333;
    transition: border-color 0.2s;
}

.chat-input:focus {
    border-color: #667eea;
}

.chat-input::placeholder {
    color: #ccc;
}

.char-count {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    color: #ccc;
}

.send-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 离线提示按钮 */
.offline-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid rgba(0, 0, 0, 0.06);
    position: fixed;
    bottom: 24px;
    right: 24px;
}

.offline-tip:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.offline-tip-icon {
    font-size: 18px;
}

.offline-tip-text {
    font-size: 13px;
    color: #888;
    font-weight: 600;
    white-space: nowrap;
}

/* 离线状态点 */
.status-offline {
    background: #FFA500 !important;
    animation: none !important;
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

.slide-up-enter-active {
    transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-leave-active {
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
}

/* ==================== 响应式 ==================== */
@media (max-width: 480px) {
    .chat-window {
        width: calc(100vw - 24px);
        height: 75vh;
        right: -12px;
        bottom: 0;
        border-radius: 20px 20px 0 0;
    }
}
</style>