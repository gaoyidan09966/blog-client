<template>
    <div class="article-body">
        <div class="inner-html" ref="contentRef" v-html="content"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const props = defineProps({
    content: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['headingsReady']);
const contentRef = ref(null);

onMounted(() => {
    nextTick(() => {
        if (!contentRef.value) return;
        const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4');
        const list = [];
        headings.forEach((el, index) => {
            const id = `heading-${index}`;
            el.id = id;
            list.push({
                id,
                text: el.textContent,
                level: parseInt(el.tagName.charAt(1)),
                offsetTop: el.offsetTop
            });
        });
        emit('headingsReady', list);
    });
});
</script>

<style scoped>
.article-body {
    padding: 0 40px 30px;
    font-size: 16px;
    color: #333;
    line-height: 1.9;
    letter-spacing: 0.3px;
}

.inner-html {
    white-space: pre-wrap;
}

.inner-html :deep(h1),
.inner-html :deep(h2),
.inner-html :deep(h3),
.inner-html :deep(h4) {
    margin-top: 32px;
    margin-bottom: 16px;
    font-weight: 800;
    color: #1a1a2e;
    scroll-margin-top: 80px;
}

.inner-html :deep(h1) {
    font-size: 28px;
}

.inner-html :deep(h2) {
    font-size: 24px;
}

.inner-html :deep(h3) {
    font-size: 20px;
}

.inner-html :deep(h4) {
    font-size: 18px;
}

.inner-html :deep(p) {
    margin: 0 0 16px;
}

.inner-html :deep(img) {
    max-width: 100%;
    border-radius: 10px;
    margin: 16px 0;
}

.inner-html :deep(pre) {
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 20px;
    border-radius: 12px;
    overflow-x: auto;
    font-size: 14px;
    line-height: 1.6;
    margin: 16px 0;
}

.inner-html :deep(code) {
    background: #f0f0f5;
    color: #667eea;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 14px;
}

.inner-html :deep(pre code) {
    background: none;
    color: inherit;
    padding: 0;
}

.inner-html :deep(blockquote) {
    border-left: 4px solid #667eea;
    padding: 12px 20px;
    margin: 16px 0;
    background: #f8f9ff;
    border-radius: 0 10px 10px 0;
    color: #555;
}

.inner-html :deep(ul),
.inner-html :deep(ol) {
    padding-left: 24px;
    margin: 12px 0;
}

.inner-html :deep(li) {
    margin-bottom: 6px;
}

.inner-html :deep(a) {
    color: #667eea;
    text-decoration: underline;
}

@media (max-width: 768px) {
    .article-body {
        padding: 0 20px 20px;
        font-size: 15px;
    }

    .inner-html :deep(h1) {
        font-size: 22px;
    }

    .inner-html :deep(h2) {
        font-size: 20px;
    }

    .inner-html :deep(h3) {
        font-size: 18px;
    }

    .inner-html :deep(pre) {
        font-size: 13px;
        padding: 14px;
    }
}
</style>