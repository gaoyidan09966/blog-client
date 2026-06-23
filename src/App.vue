<template>
  <div class="client-app">
    <NavBar v-if="showLayout" />

    <main :class="showLayout ? 'main-content' : 'main-full'">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <keep-alive :include="cachedViews">
            <component :is="Component" :key="route.path" />
          </keep-alive>
        </transition>
      </router-view>
    </main>

    <ChatWidget v-if="showLayout" />
    <AppFooter v-if="showLayout" />
    <BottomTabBar v-if="showLayout" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from './components/NavBar.vue';
import AppFooter from './components/AppFooter.vue';
import ChatWidget from './components/ChatWidget.vue';
import BottomTabBar from './components/BottomTabBar.vue';

const route = useRoute();
const router = useRouter();
const transitionName = ref('fade');

const noLayoutPages = ['/login', '/404'];

const showLayout = computed(() => {
  return !noLayoutPages.includes(route.path);
});

const cachedViews = computed(() => {
  const names = [];
  return names;
});

router.beforeEach((to, from) => {
  if (noLayoutPages.includes(to.path) || noLayoutPages.includes(from.path)) {
    transitionName.value = 'fade';
    return;
  }

  const toDepth = to.path.split('/').filter(Boolean).length;
  const fromDepth = from.path.split('/').filter(Boolean).length;

  if (toDepth > fromDepth) {
    transitionName.value = 'slide-left';
  } else if (toDepth < fromDepth) {
    transitionName.value = 'slide-right';
  } else {
    transitionName.value = 'fade';
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  overflow-x: hidden;
}

body {
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f7 100%);
  color: #1d1d1f;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.main-content {
  min-height: calc(100vh - 130px);
  box-sizing: border-box;
}

.main-full {
  min-height: 100vh;
  box-sizing: border-box;
}

/* 手机端底部留出标签栏空间 */
@media (max-width: 640px) {
  .main-content {
    padding-bottom: 56px;
  }
}

/* ==================== fade ==================== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ==================== slide-left ==================== */
.slide-left-enter-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-left-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ==================== slide-right ==================== */
.slide-right-enter-active {
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-right-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>