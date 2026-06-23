<template>
    <header class="navbar-wrapper">
        <div class="navbar-container">

            <!-- 汉堡菜单按钮 -->
            <div class="hamburger-btn" @click="menuOpen = !menuOpen">
                <el-icon :size="22">
                    <Close v-if="menuOpen" />
                    <MenuIcon v-else />
                </el-icon>
            </div>

            <!-- 左侧品牌区 -->
            <div class="nav-left" @click="goHome">
                <el-icon class="logo-icon">
                    <EditPen />
                </el-icon>
                <span class="brand-name">拾光笔记</span>
            </div>

            <!-- 中间导航区 -->
            <div class="nav-center">
                <el-menu :default-active="route.path" class="nav-menu-clean" mode="horizontal" :router="true"
                    :ellipsis="false">
                    <el-menu-item index="/">首页</el-menu-item>
                    <el-menu-item index="/articles">文章</el-menu-item>
                    <el-sub-menu index="discover" popper-class="nav-dropdown">
                        <template #title><span>发现</span></template>
                        <el-menu-item index="/categories">
                            <el-icon>
                                <Grid />
                            </el-icon>
                            <span>分类</span>
                        </el-menu-item>
                        <el-menu-item index="/tags">
                            <el-icon>
                                <PriceTag />
                            </el-icon>
                            <span>标签</span>
                        </el-menu-item>
                        <el-menu-item index="/archives">
                            <el-icon>
                                <Clock />
                            </el-icon>
                            <span>归档</span>
                        </el-menu-item>
                    </el-sub-menu>
                    <el-menu-item index="/messages">留言墙</el-menu-item>
                    <el-menu-item index="/products">周边</el-menu-item>
                    <el-menu-item index="/cart">购物车</el-menu-item>
                    <el-menu-item index="/about">关于我</el-menu-item>
                </el-menu>
            </div>

            <!-- 右侧功能区 -->
            <div class="nav-right">
                <el-input v-model="searchKeyword" placeholder="搜索文章..." class="search-input" clearable
                    @keyup.enter="handleSearch">
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                </el-input>

                <template v-if="!userStore.isLoggedIn">
                    <el-button class="login-btn" @click="router.push('/login')">登录</el-button>
                    <el-button class="register-btn" @click="router.push('/register')">注册</el-button>
                </template>

                <template v-else>
                    <el-button class="write-btn" @click="router.push('/publish')">写文章</el-button>
                    <el-dropdown trigger="click" @command="handleCommand">
                        <div class="user-avatar-wrapper">
                            <el-avatar :size="34" :src="userStore.userInfo?.avatar" class="user-avatar">
                                {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
                            </el-avatar>
                            <span class="user-name">{{ userStore.userInfo?.nickname || '用户' }}</span>
                        </div>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="profile">
                                    <el-icon>
                                        <User />
                                    </el-icon>个人主页
                                </el-dropdown-item>
                                <el-dropdown-item command="orders">
                                    <el-icon>
                                        <List />
                                    </el-icon>我的订单
                                </el-dropdown-item>
                                <el-dropdown-item command="logout" divided>
                                    <el-icon>
                                        <SwitchButton />
                                    </el-icon>退出登录
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </div>

        </div>
    </header>
    <div class="navbar-placeholder"></div>

    <!-- 抽屉放在 header 外面，避免被 overflow:hidden 裁剪 -->
    <teleport to="body">
        <transition name="slide-drawer">
            <div class="mobile-drawer" v-if="menuOpen" @click.self="menuOpen = false">
                <div class="drawer-content">
                    <div class="drawer-nav">
                        <div v-for="item in mobileMenus" :key="item.path" class="drawer-item"
                            :class="{ active: isActive(item.path) }" @click="goToPage(item.path)">
                            <el-icon>
                                <component :is="item.icon" />
                            </el-icon>
                            <span>{{ item.label }}</span>
                        </div>
                    </div>
                    <div class="drawer-footer" v-if="!userStore.isLoggedIn">
                        <button class="drawer-btn login" @click="goToPage('/login')">登录</button>
                        <button class="drawer-btn register" @click="goToPage('/register')">注册</button>
                    </div>
                    <div class="drawer-footer" v-else>
                        <div class="drawer-user" @click="goToPage('/profile')">
                            <el-avatar :size="40" :src="userStore.userInfo?.avatar" class="drawer-avatar">
                                {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
                            </el-avatar>
                            <div class="drawer-user-info">
                                <span class="drawer-user-name">{{ userStore.userInfo?.nickname || '用户' }}</span>
                                <span class="drawer-user-tag">查看个人主页 →</span>
                            </div>
                        </div>
                        <button class="drawer-btn publish" @click="goToPage('/publish')">写文章</button>
                        <button class="drawer-btn logout" @click="handleLogout">退出登录</button>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../stores/user';
import {
    Menu as MenuIcon,
    Close,
    Grid,
    PriceTag,
    Clock,
    List,
    HomeFilled,
    Document,
    Compass,
    ChatLineSquare,
    ShoppingBag,
    ShoppingCart,
    User as UserIcon
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const searchKeyword = ref('');
const menuOpen = ref(false);

const mobileMenus = [
    { path: '/', label: '首页', icon: HomeFilled },
    { path: '/articles', label: '文章', icon: Document },
    { path: '/categories', label: '分类', icon: Grid },
    { path: '/tags', label: '标签', icon: PriceTag },
    { path: '/archives', label: '归档', icon: Clock },
    { path: '/messages', label: '留言墙', icon: ChatLineSquare },
    { path: '/products', label: '周边', icon: ShoppingBag },
    { path: '/cart', label: '购物车', icon: ShoppingCart },
    { path: '/about', label: '关于我', icon: UserIcon }
];

const isActive = (path) => {
    if (path === '/') return route.path === '/';
    return route.path.startsWith(path);
};

const goHome = () => {
    menuOpen.value = false;
    router.push('/');
};

const goToPage = (path) => {
    menuOpen.value = false;
    router.push(path);
};

const handleCommand = (command) => {
    if (command === 'profile') {
        router.push('/profile');
    } else if (command === 'orders') {
        router.push('/orders');
    } else if (command === 'logout') {
        userStore.logout();
        ElMessage.success('已退出登录');
        router.push('/');
    }
};

const handleLogout = () => {
    menuOpen.value = false;
    userStore.logout();
    ElMessage.success('已退出登录');
    router.push('/');
};

const handleSearch = () => {
    if (!searchKeyword.value.trim()) {
        ElMessage.warning('请输入搜索关键词');
        return;
    }
    router.push({ path: '/search', query: { keyword: searchKeyword.value.trim() } });
};
</script>

<style scoped>
/* ================= 固定导航栏 ================= */
.navbar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 64px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.03);
}

.navbar-placeholder {
    height: 64px;
    width: 100%;
}

.navbar-container {
    max-width: 1200px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    overflow: hidden;
}

/* ================= 汉堡菜单按钮 ================= */
.hamburger-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
    -webkit-tap-highlight-color: transparent;
    flex-shrink: 0;
}

.hamburger-btn:hover {
    background: #f5f5f5;
}

/* ================= 左侧品牌 ================= */
.nav-left {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;
    flex-shrink: 0;
}

.logo-icon {
    font-size: 22px;
    color: #1a1a1a;
}

.brand-name {
    font-size: 20px;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: 1px;
    white-space: nowrap;
}

/* ================= 中间导航 ================= */
.nav-center {
    flex: 1;
    display: flex;
    justify-content: center;
    min-width: 0;
    overflow: hidden;
}

.nav-menu-clean {
    border-bottom: none !important;
    background: transparent !important;
}

.nav-menu-clean :deep(.el-menu-item) {
    font-size: 15px;
    color: #4a4a4a !important;
    font-weight: 500;
    padding: 0 16px;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.nav-menu-clean :deep(.el-menu-item:hover) {
    color: #1a1a1a !important;
    background-color: transparent !important;
}

.nav-menu-clean :deep(.el-menu-item.is-active) {
    color: #1a1a1a !important;
    font-weight: bold;
    border-bottom: 2px solid #1a1a1a !important;
}

.nav-menu-clean :deep(.el-sub-menu) {
    padding: 0 16px;
}

.nav-menu-clean :deep(.el-sub-menu__title) {
    font-size: 15px;
    color: #4a4a4a !important;
    font-weight: 500;
    border-bottom: none !important;
    background: transparent !important;
}

.nav-menu-clean :deep(.el-sub-menu__title:hover) {
    color: #1a1a1a !important;
    background-color: transparent !important;
}

.nav-menu-clean :deep(.el-sub-menu__icon-arrow) {
    color: #4a4a4a;
}

:global(.nav-dropdown) {
    border-radius: 12px !important;
    border: 1px solid rgba(0, 0, 0, 0.06) !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08) !important;
    padding: 6px 0 !important;
}

:global(.nav-dropdown .el-menu-item) {
    font-size: 14px !important;
    color: #4a4a4a !important;
    padding: 10px 24px !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    transition: all 0.2s ease !important;
}

:global(.nav-dropdown .el-menu-item:hover) {
    color: #1a1a1a !important;
    background-color: #f5f7fa !important;
}

:global(.nav-dropdown .el-menu-item.is-active) {
    color: #1a1a1a !important;
    font-weight: bold !important;
    border-bottom: none !important;
}

/* ================= 右侧功能区 ================= */
.nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}

.search-input {
    width: 180px;
    transition: width 0.3s ease;
}

.search-input:focus-within {
    width: 240px;
}

.search-input :deep(.el-input__wrapper) {
    border-radius: 20px;
    background-color: #f5f5f5;
    box-shadow: none !important;
    transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper:focus-within) {
    background-color: #fff;
    box-shadow: 0 0 0 1px #dcdfe6 !important;
}

.login-btn {
    background: transparent;
    color: #1a1a1a;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 600;
    font-size: 14px;
}

.login-btn:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
}

.register-btn {
    background: #1a1a1a;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 600;
    font-size: 14px;
}

.register-btn:hover {
    background: #333;
    color: #fff;
}

.write-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.write-btn:hover {
    background: linear-gradient(135deg, #5a6fd6, #6a3f96);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-avatar-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 20px;
    transition: background 0.2s;
}

.user-avatar-wrapper:hover {
    background: #f5f5f5;
}

.user-avatar {
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
    color: #fff;
    font-weight: 700;
    font-size: 14px;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ================= 手机端侧边抽屉 ================= */
.mobile-drawer {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 998;
    background: rgba(0, 0, 0, 0.3);
}

.drawer-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 280px;
    height: 100%;
    background: #fff;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.drawer-nav {
    padding: 12px 0;
    flex: 1;
}

.drawer-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 24px;
    font-size: 15px;
    font-weight: 500;
    color: #4a4a4a;
    cursor: pointer;
    transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;
}

.drawer-item:hover,
.drawer-item:active {
    background: #f5f7fa;
    color: #1a1a1a;
}

.drawer-item.active {
    color: #1a1a1a;
    font-weight: 700;
    background: #f0f4ff;
    border-right: 3px solid #1a1a1a;
}

.drawer-footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.drawer-user {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 8px 0;
    margin-bottom: 4px;
}

.drawer-avatar {
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
}

.drawer-user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.drawer-user-name {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
}

.drawer-user-tag {
    font-size: 12px;
    color: #999;
}

.drawer-btn {
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.drawer-btn.login {
    background: #f5f5f5;
    color: #1a1a1a;
}

.drawer-btn.register {
    background: #1a1a1a;
    color: #fff;
}

.drawer-btn.publish {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
}

.drawer-btn.logout {
    background: none;
    color: #999;
    border: 1px solid #eee;
}

/* 抽屉动画 */
.slide-drawer-enter-active {
    transition: opacity 0.25s ease;
}

.slide-drawer-enter-active .drawer-content {
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-drawer-leave-active {
    transition: opacity 0.2s ease;
}

.slide-drawer-leave-active .drawer-content {
    transition: transform 0.2s ease;
}

.slide-drawer-enter-from {
    opacity: 0;
}

.slide-drawer-enter-from .drawer-content {
    transform: translateX(-100%);
}

.slide-drawer-leave-to {
    opacity: 0;
}

.slide-drawer-leave-to .drawer-content {
    transform: translateX(-100%);
}

/* ================= 响应式 ================= */
@media (max-width: 900px) {
    .search-input {
        width: 140px;
    }

    .search-input:focus-within {
        width: 180px;
    }

    .write-btn {
        padding: 8px 14px;
        font-size: 13px;
    }

    .nav-menu-clean :deep(.el-menu-item),
    .nav-menu-clean :deep(.el-sub-menu) {
        padding: 0 10px;
    }

    .nav-menu-clean :deep(.el-menu-item),
    .nav-menu-clean :deep(.el-sub-menu__title) {
        font-size: 14px;
    }
}

@media (max-width: 640px) {
    .hamburger-btn {
        display: flex;
    }

    .nav-center {
        display: none;
    }

    .search-input {
        width: 100px;
    }

    .search-input:focus-within {
        width: 140px;
    }

    .search-input :deep(.el-input__inner) {
        font-size: 13px;
    }

    .login-btn,
    .register-btn,
    .write-btn {
        display: none;
    }

    .user-name {
        display: none;
    }

    .navbar-container {
        padding: 0 16px;
    }
}
</style>