<template>
    <div class="chat-widget">
        <!-- 客服离线提示 -->
        <transition name="fade">
            <div class="offline-tip" v-if="!serviceOnline && !isOpen" :style="btnStyle" @click="openChat"
                @mousedown.stop="onBtnMouseDown" @touchstart="onBtnTouchStart">
                <span class="offline-tip-icon">🌙</span>
                <span class="offline-tip-text">客服暂时离线 · 可留言</span>
            </div>
        </transition>

        <!-- 拖拽悬浮球 -->
        <transition name="fade">
            <div class="chat-btn" v-show="!isOpen && serviceOnline" :style="btnStyle"
                :class="{ 'is-dragging': isDragging }" @click="onBtnClick" @mousedown.stop="onBtnMouseDown"
                @touchstart="onBtnTouchStart">
                <span class="chat-btn-icon">💬</span>
                <span class="chat-btn-pulse"></span>
                <span class="chat-btn-dot" v-if="unreadCount > 0">
                    {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
            </div>
        </transition>

        <!-- 手机端遮罩 -->
        <transition name="fade">
            <div class="chat-mask" v-if="isOpen && isMobile" @click="closeChat"></div>
        </transition>

        <!-- 聊天窗口 -->
        <transition name="slide-up">
            <div class="chat-window" v-show="isOpen">
                <!-- 头部 -->
                <div class="chat-header">
                    <div class="header-info">
                        <div class="header-avatar-wrap">
                            <span class="header-avatar-icon">📝</span>
                            <span class="header-status-dot" :class="{ offline: !serviceOnline }"></span>
                        </div>
                        <div class="header-text">
                            <h4>拾光笔记 ai客服</h4>
                            <span class="header-status">
                                {{ serviceOnline ? '在线 · 通常1小时内回复' : '客服暂时离线 · 可留言' }}
                            </span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="header-btn" @click="clearMessages" title="清空对话">
                            <el-icon :size="14">
                                <Delete />
                            </el-icon>
                        </button>
                        <button class="header-btn" @click="closeChat" title="关闭">
                            <el-icon :size="14">
                                <Close />
                            </el-icon>
                        </button>
                    </div>
                </div>

                <!-- 昵称设置 -->
                <div class="nickname-bar" v-if="!nickname">
                    <div class="nickname-inner">
                        <div class="nickname-avatar">👋</div>
                        <p class="nickname-tip">你好！先告诉我怎么称呼你吧</p>
                        <div class="nickname-input-row">
                            <input type="text" v-model="tempNickname" class="nickname-input" placeholder="输入你的昵称"
                                maxlength="20" @keyup.enter="setNickname" />
                            <button class="nickname-btn" @click="setNickname" :disabled="!tempNickname.trim()">
                                确定
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 消息列表 -->
                <div class="chat-body" ref="chatBody" v-show="nickname">
                    <div class="msg-time-divider">{{ todayStr }}</div>

                    <!-- 欢迎消息 -->
                    <div class="msg-row msg-left">
                        <div class="msg-avatar bot-avatar">🤖</div>
                        <div class="msg-col">
                            <div class="msg-bubble bot-bubble">
                                <p>Hi {{ nickname }}！欢迎来到拾光笔记 👋</p>
                                <p>我是博客助手，有什么问题可以问我~</p>
                            </div>
                            <span class="msg-time">{{ welcomeTime }}</span>
                        </div>
                    </div>

                    <!-- 快捷问题 -->
                    <div class="quick-questions" v-if="showQuickBtns && hotQuestions.length > 0">
                        <p class="quick-label">💡 你可以问我</p>
                        <div class="quick-grid">
                            <button v-for="(q, i) in hotQuestions" :key="i" class="quick-btn"
                                @click="sendQuickQuestion(q.text)">
                                {{ q.icon }} {{ q.text }}
                            </button>
                        </div>
                    </div>

                    <!-- 消息 -->
                    <template v-for="(msg, i) in messages" :key="i">
                        <div class="msg-time-divider" v-if="msg.showTime">{{ msg.timeStr }}</div>

                        <!-- 用户消息 -->
                        <div class="msg-row msg-right">
                            <div class="msg-col">
                                <div class="msg-bubble user-bubble">{{ msg.content }}</div>
                                <span class="msg-time text-right">{{ msg.sendTime }}</span>
                            </div>
                        </div>

                        <!-- AI 回复 -->
                        <div class="msg-row msg-left" v-if="msg.reply">
                            <div class="msg-avatar bot-avatar">🤖</div>
                            <div class="msg-col">
                                <div class="msg-bubble bot-bubble">{{ msg.reply }}</div>
                                <span class="msg-time">{{ msg.replyTime }}</span>
                            </div>
                        </div>

                        <!-- 追问按钮 -->
                        <div class="follow-up-btns" v-if="msg.followUps?.length > 0">
                            <button v-for="(fu, fi) in msg.followUps" :key="fi" class="follow-up-btn"
                                @click="sendQuickQuestion(fu)">
                                {{ fu }}
                            </button>
                        </div>

                        <!-- 博主回复 -->
                        <div class="msg-row msg-left" v-if="msg.adminReply">
                            <div class="msg-avatar admin-avatar">📝</div>
                            <div class="msg-col">
                                <div class="msg-bubble admin-bubble">
                                    <span class="admin-badge">博主回复</span>
                                    <p>{{ msg.adminReply }}</p>
                                </div>
                                <span class="msg-time">{{ msg.adminReplyTime }}</span>
                            </div>
                        </div>

                        <!-- 加载中 -->
                        <div class="msg-row msg-left" v-if="msg.loading">
                            <div class="msg-avatar bot-avatar">🤖</div>
                            <div class="msg-col">
                                <div class="msg-bubble bot-bubble msg-loading">
                                    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <!-- 输入区域 -->
                <div class="chat-footer" v-show="nickname">
                    <div class="input-wrapper">
                        <input type="text" v-model="inputText" class="chat-input" placeholder="输入你的问题..."
                            maxlength="200" @keyup.enter="sendMessage" :disabled="sending" />
                        <span class="char-count" v-if="inputText.length > 150">{{ inputText.length }}/200</span>
                    </div>
                    <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || sending">
                        <el-icon :size="16">
                            <Promotion />
                        </el-icon>
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import request from '../api/request';
import { Delete, Close, Promotion } from '@element-plus/icons-vue';

// ==================== 状态 ====================
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
const isMobile = ref(false);

let pollTimer = null;
let statusTimer = null;

// ==================== 拖拽 ====================
const isDragging = ref(false);
const dragState = reactive({
    startX: 0,
    startY: 0,
    moved: false,
    btnStartLeft: 0,
    btnStartTop: 0,
    isTouch: false,   // 记录输入来源：触摸 or 鼠标
});

const GAP = 16;
const BTN_SIZE_DESKTOP = 56;
const BTN_SIZE_MOBILE = 50;
const currentBtnSize = computed(() => isMobile.value ? BTN_SIZE_MOBILE : BTN_SIZE_DESKTOP);
const btnPos = reactive({ x: GAP, y: GAP });

const btnStyle = computed(() => ({
    position: 'fixed',
    right: btnPos.x + 'px',
    bottom: btnPos.y + 'px',
    zIndex: 10000,
}));

// ==================== 拖拽核心逻辑 ====================
const getPointerPos = (e) => {
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX, y: touch.clientY };
};

const onBtnMouseDown = (e) => {
    if (e.button !== 0) return;
    startDrag(getPointerPos(e), false);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
};

const onBtnTouchStart = (e) => {
    // 不用 .prevent，CSS touch-action: none 已阻止滚动
    startDrag(getPointerPos(e), true);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
};

const startDrag = (pos, isTouch) => {
    isDragging.value = true;
    dragState.startX = pos.x;
    dragState.startY = pos.y;
    dragState.moved = false;
    dragState.isTouch = isTouch;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    dragState.btnStartLeft = winW - btnPos.x - currentBtnSize.value;
    dragState.btnStartTop = winH - btnPos.y - currentBtnSize.value;
};

const onDragMove = (e) => {
    if (!isDragging.value) return;
    e.preventDefault();

    const pos = getPointerPos(e);
    const dx = pos.x - dragState.startX;
    const dy = pos.y - dragState.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragState.moved = true;
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const size = currentBtnSize.value;

    let newLeft = dragState.btnStartLeft + dx;
    let newTop = dragState.btnStartTop + dy;

    newLeft = Math.max(GAP, Math.min(newLeft, winW - size - GAP));
    newTop = Math.max(GAP, Math.min(newTop, winH - size - GAP));

    btnPos.x = winW - newLeft - size;
    btnPos.y = winH - newTop - size;
};

const onDragEnd = () => {
    if (!isDragging.value) return;
    const wasTap = !dragState.moved;
    const wasTouch = dragState.isTouch;
    isDragging.value = false;

    // 吸附到最近的左右边缘
    const winW = window.innerWidth;
    const size = currentBtnSize.value;
    const btnLeft = winW - btnPos.x - size;

    if (btnLeft < winW / 2) {
        // 吸附到左边
        btnPos.x = winW - GAP - size;
    } else {
        // 吸附到右边
        btnPos.x = GAP;
    }

    localStorage.setItem('chat_btn_pos', JSON.stringify({ x: btnPos.x, y: btnPos.y }));

    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);

    // 移动端：tap 直接打开，设 moved=true 拦住后续 click
    if (wasTap && wasTouch) {
        openChat();
        dragState.moved = true;
    }
    // PC 端：什么都不做，让 click 事件自然触发
};

const onBtnClick = () => {
    // 移动端 touchend 已经打开了（moved=true），跳过
    if (dragState.moved) {
        dragState.moved = false;  // 重置，下次拖拽不影响
        return;
    }
    // PC 端正常 click → 打开
    openChat();
};

// ==================== 初始化位置 ====================
const initPosition = () => {
    const size = currentBtnSize.value;
    const saved = localStorage.getItem('chat_btn_pos');
    if (saved) {
        try {
            const pos = JSON.parse(saved);
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            if (pos.x >= 0 && pos.x <= winW - size && pos.y >= 0 && pos.y <= winH - size) {
                btnPos.x = pos.x;
                btnPos.y = pos.y;
                return;
            }
        } catch (e) { /* ignore */ }
    }
    btnPos.x = GAP;
    btnPos.y = GAP;
};

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 600;
};

// ==================== 时间格式 ====================
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
    if (isMobile.value) {
        document.body.style.overflow = 'hidden';
    }
    scrollToBottom();
};

const closeChat = () => {
    isOpen.value = false;
    document.body.style.overflow = '';
};

const clearMessages = () => {
    messages.value = [];
    showQuickBtns.value = true;
    localStorage.removeItem('chat_messages');
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

// ==================== 数据获取 ====================
const fetchServiceStatus = async () => {
    try {
        const res = await request.get('/chat/status');
        serviceOnline.value = res.data.online;
    } catch (e) { serviceOnline.value = true; }
};

const fetchHotQuestions = async () => {
    try {
        const res = await request.get('/chat/hot-questions');
        hotQuestions.value = res.data;
    } catch (e) { /* ignore */ }
};

// ==================== 滚动 ====================
const scrollToBottom = async () => {
    await nextTick();
    if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
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

// ==================== 持久化 ====================
const saveMessages = () => {
    const data = messages.value.map(m => ({
        dbId: m.dbId, content: m.content, reply: m.reply,
        adminReply: m.adminReply, adminReplyTime: m.adminReplyTime,
        rawTime: m.rawTime, sendTime: m.sendTime, replyTime: m.replyTime,
        showTime: m.showTime, timeStr: m.timeStr, followUps: m.followUps,
    }));
    localStorage.setItem('chat_messages', JSON.stringify(data));
};

const loadMessages = () => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
        try {
            messages.value = JSON.parse(saved).map(m => ({ ...m, loading: false }));
            if (messages.value.length > 0) showQuickBtns.value = false;
        } catch (e) { /* ignore */ }
    }
};

// ==================== 轮询 ====================
let polling = false;

const pollReplies = async () => {
    if (!nickname.value || polling) return;
    polling = true;

    try {
        const pending = messages.value.filter(m => m.dbId && !m.adminReply);
        if (pending.length === 0) { polling = false; return; }

        const minDbId = Math.min(...pending.map(m => m.dbId)) - 1;
        const res = await request.get('/chat/my-replies', {
            params: { nickname: nickname.value, afterId: minDbId }
        });

        const replies = res.data;
        if (!replies?.length) { polling = false; return; }

        let hasNew = false;
        for (const reply of replies) {
            const matched = messages.value.find(m => m.dbId === reply.id && !m.adminReply);
            if (matched && reply.reply) {
                matched.adminReply = reply.reply;
                matched.adminReplyTime = formatTime(new Date(reply.create_time));
                hasNew = true;
                if (!isOpen.value) unreadCount.value++;
            }
        }

        if (hasNew) {
            saveMessages();
            if (!isOpen.value || document.hidden) flashTitle();
            await nextTick();
            if (isOpen.value && chatBody.value) {
                const els = chatBody.value.querySelectorAll('.admin-bubble');
                if (els.length > 0) scrollToElement(els[els.length - 1]);
            }
        }
    } catch (e) {
        console.error('轮询回复失败:', e);
    } finally {
        polling = false;
    }
};

// ==================== 发送消息 ====================
const sendQuickQuestion = (text) => {
    inputText.value = text;
    sendMessage();
};

const sendMessage = async () => {
    const text = inputText.value.trim();
    if (!text || sending.value) return;

    showQuickBtns.value = false;
    const now = new Date();
    const prevMsg = messages.value[messages.value.length - 1] || null;

    const msgData = {
        dbId: null, content: text, reply: null,
        adminReply: null, adminReplyTime: '',
        rawTime: now.toISOString(), sendTime: formatTime(now),
        replyTime: '', showTime: shouldShowTime(prevMsg, now.getTime()),
        timeStr: formatTime(now), followUps: null, loading: true,
    };

    messages.value.push(msgData);
    inputText.value = '';
    sending.value = true;
    await scrollToBottom();

    const idx = messages.value.length - 1;

    try {
        const res = await request.post('/chat/send', { content: text, nickname: nickname.value });
        const data = res.data;
        messages.value[idx].dbId = data.dbId;
        messages.value[idx].reply = data.reply || '感谢你的留言！博主看到后会尽快回复你。';
        messages.value[idx].replyTime = formatTime(new Date());
        messages.value[idx].followUps = data.followUps || null;
    } catch (e) {
        messages.value[idx].reply = '消息发送失败，请稍后再试。';
        messages.value[idx].replyTime = formatTime(new Date());
    } finally {
        messages.value[idx].loading = false;
        sending.value = false;
        saveMessages();
        await scrollToBottom();

        let fastCount = 0;
        const fastPoll = setInterval(() => {
            pollReplies();
            fastCount++;
            if (fastCount >= 20) clearInterval(fastPoll);
        }, 3000);
    }
};

// ==================== 窗口大小变化 ====================
const onResize = () => {
    checkMobile();
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const size = currentBtnSize.value;
    btnPos.x = Math.max(GAP, Math.min(btnPos.x, winW - size - GAP));
    btnPos.y = Math.max(GAP, Math.min(btnPos.y, winH - size - GAP));
};

// ==================== 生命周期 ====================
onMounted(() => {
    checkMobile();
    initPosition();
    const savedNickname = localStorage.getItem('chat_nickname');
    if (savedNickname) nickname.value = savedNickname;

    loadMessages();
    fetchHotQuestions();
    fetchServiceStatus();

    pollTimer = setInterval(pollReplies, 5000);
    statusTimer = setInterval(fetchServiceStatus, 60000);
    setTimeout(pollReplies, 1000);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', onResize);
});

onUnmounted(() => {
    if (pollTimer) clearInterval(pollTimer);
    if (statusTimer) clearInterval(statusTimer);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('resize', onResize);
    stopFlash();
    document.body.style.overflow = '';
});
</script>

<style scoped>
/* ==================== 悬浮球 ==================== */
.chat-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
    transition: box-shadow 0.3s, transform 0.15s;
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
}

.chat-btn.is-dragging {
    cursor: grabbing;
    transform: scale(1.1);
    box-shadow: 0 12px 36px rgba(102, 126, 234, 0.55);
    transition: box-shadow 0.3s, transform 0.1s;
}

.chat-btn:not(.is-dragging):hover {
    transform: scale(1.06);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
}

.chat-btn-icon {
    font-size: 26px;
    z-index: 2;
    pointer-events: none;
}

.chat-btn-pulse {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid rgba(102, 126, 234, 0.4);
    animation: btnPulse 2.5s ease-in-out infinite;
    pointer-events: none;
}

.chat-btn.is-dragging .chat-btn-pulse {
    animation: none;
    opacity: 0;
}

@keyframes btnPulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.6;
    }

    50% {
        transform: scale(1.3);
        opacity: 0;
    }
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
    pointer-events: none;
    z-index: 3;
}

/* ==================== 离线提示 ==================== */
.offline-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff;
    border-radius: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: box-shadow 0.3s, transform 0.15s;
    border: 1px solid rgba(0, 0, 0, 0.06);
    user-select: none;
    -webkit-user-select: none;
    touch-action: none;
}

.offline-tip:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14);
}

.offline-tip-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.offline-tip-text {
    font-size: 13px;
    color: #888;
    font-weight: 600;
    white-space: nowrap;
}

/* ==================== 手机端遮罩 ==================== */
.chat-mask {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 10000;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
}

/* ==================== 聊天窗口 ==================== */
.chat-window {
    position: fixed;
    z-index: 10001;
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.06);
    width: 400px;
    height: 580px;
    border-radius: 20px;
    box-shadow: 0 16px 56px rgba(0, 0, 0, 0.18);
    bottom: 80px;
    right: 20px;
}

/* ==================== 头部 ==================== */
.chat-header {
    padding: 14px 16px;
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
    min-width: 0;
}

.header-avatar-wrap {
    position: relative;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
}

.header-avatar-icon {
    font-size: 24px;
    width: 38px;
    height: 38px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-status-dot {
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 10px;
    height: 10px;
    background: #4ADE80;
    border-radius: 50%;
    border: 2px solid #667eea;
    animation: statusPulse 2s ease-in-out infinite;
}

.header-status-dot.offline {
    background: #FBBF24;
    animation: none;
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

.header-text {
    min-width: 0;
}

.header-text h4 {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    white-space: nowrap;
}

.header-status {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
}

.header-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
}

.header-btn {
    width: 30px;
    height: 30px;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    cursor: pointer;
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
    padding: 24px 20px;
    background: #f8f9fb;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.nickname-inner {
    text-align: center;
    max-width: 280px;
    width: 100%;
}

.nickname-avatar {
    font-size: 40px;
    margin-bottom: 12px;
}

.nickname-tip {
    font-size: 15px;
    color: #555;
    margin: 0 0 18px;
}

.nickname-input-row {
    display: flex;
    gap: 8px;
}

.nickname-input {
    flex: 1;
    padding: 10px 14px;
    min-width: 0;
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
    transition: transform 0.2s;
    flex-shrink: 0;
}

.nickname-btn:hover:not(:disabled) {
    transform: scale(1.03);
}

.nickname-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ==================== 消息区域 ==================== */
.chat-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px;
    background: #f8f9fb;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
}

.chat-body::-webkit-scrollbar {
    width: 4px;
}

.chat-body::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
}

.msg-time-divider {
    text-align: center;
    font-size: 11px;
    color: #bbb;
    margin: 12px 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.msg-time-divider::before,
.msg-time-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e8e8e8;
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
    min-width: 0;
}

.msg-right .msg-col {
    align-items: flex-end;
}

.msg-avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.bot-avatar {
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.admin-avatar {
    background: linear-gradient(135deg, #F472B6, #FCD34D);
}

.msg-bubble {
    max-width: 75%;
    padding: 10px 14px;
    border-radius: 16px;
    font-size: 13px;
    line-height: 1.6;
    color: #333;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    word-break: break-word;
    overflow-wrap: break-word;
}

.msg-bubble p {
    margin: 0 0 4px;
}

.msg-bubble p:last-child {
    margin: 0;
}

.bot-bubble {
    background: #fff;
    border-radius: 16px 16px 16px 4px;
}

.user-bubble {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border-radius: 16px 16px 4px 16px;
}

.admin-bubble {
    background: #fff5f5;
    border: 1px solid #fee2e2;
    border-radius: 16px 16px 16px 4px;
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

.msg-time {
    font-size: 11px;
    color: #bbb;
    margin-top: 3px;
    padding: 0 4px;
}

.text-right {
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
    min-width: 0;
}

.chat-input {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid #e8e8e8;
    border-radius: 12px;
    font-size: 14px;
    outline: none;
    color: #333;
    transition: border-color 0.2s;
    -webkit-appearance: none;
    appearance: none;
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
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ==================== 过渡动画 ==================== */
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

/* ==================== 平板 ==================== */
@media (max-width: 768px) and (min-width: 601px) {
    .chat-window {
        width: 360px;
        height: 520px;
    }
}

/* ==================== 手机端 ==================== */
@media (max-width: 600px) {
    .chat-btn {
        width: 50px;
        height: 50px;
    }

    .chat-btn-icon {
        font-size: 22px;
    }

    .chat-btn-dot {
        min-width: 18px;
        height: 18px;
        font-size: 10px;
        top: -3px;
        right: -3px;
    }

    .offline-tip {
        padding: 8px 14px;
    }

    .offline-tip-icon {
        font-size: 16px;
    }

    .offline-tip-text {
        font-size: 12px;
    }

    .chat-window {
        left: 0;
        right: 0;
        bottom: 0;
        top: auto;
        width: 100%;
        height: 85vh;
        height: 85dvh;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.2);
    }

    .chat-header {
        padding: 12px 14px;
    }

    .header-avatar-wrap {
        width: 34px;
        height: 34px;
    }

    .header-avatar-icon {
        font-size: 20px;
        width: 34px;
        height: 34px;
        border-radius: 10px;
    }

    .header-text h4 {
        font-size: 14px;
    }

    .header-status {
        font-size: 10px;
    }

    .header-btn {
        width: 28px;
        height: 28px;
        border-radius: 7px;
    }

    .chat-body {
        padding: 12px;
    }

    .msg-avatar {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        font-size: 14px;
    }

    .msg-bubble {
        max-width: 80%;
        padding: 9px 12px;
        font-size: 13px;
    }

    .bot-bubble {
        border-radius: 14px 14px 14px 4px;
    }

    .user-bubble {
        border-radius: 14px 14px 4px 14px;
    }

    .admin-bubble {
        border-radius: 14px 14px 14px 4px;
    }

    .follow-up-btns {
        margin-left: 36px;
    }

    .quick-btn {
        padding: 6px 12px;
        font-size: 11px;
    }

    .chat-footer {
        padding: 10px 12px;
    }

    .chat-input {
        padding: 9px 12px;
        font-size: 14px;
        border-radius: 10px;
    }

    .send-btn {
        width: 38px;
        height: 38px;
        border-radius: 10px;
    }

    .nickname-bar {
        padding: 20px 16px;
    }

    .nickname-avatar {
        font-size: 36px;
    }

    .nickname-tip {
        font-size: 14px;
    }

    .nickname-input {
        padding: 9px 12px;
        font-size: 14px;
        border-radius: 8px;
    }

    .nickname-btn {
        padding: 9px 16px;
        font-size: 13px;
        border-radius: 8px;
    }
}

/* ==================== 小屏手机 ==================== */
@media (max-width: 380px) {
    .chat-window {
        height: 90vh;
        height: 90dvh;
    }

    .msg-bubble {
        max-width: 85%;
        font-size: 12px;
    }

    .follow-up-btns {
        margin-left: 32px;
    }

    .follow-up-btn {
        padding: 5px 10px;
        font-size: 11px;
    }
}

/* ==================== 安全区适配（刘海屏/底部横条） ==================== */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
    .chat-footer {
        padding-bottom: calc(12px + env(safe-area-inset-bottom));
    }
}
</style>