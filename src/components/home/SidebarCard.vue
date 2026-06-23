<template>
    <div class="sidebar-card">
        <div class="sidebar-header">
            <span class="sidebar-title">
                <slot name="icon" />
                {{ title }}
            </span>
            <slot name="extra" />
        </div>
        <slot />
    </div>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true
    }
});
</script>

<style scoped>
.sidebar-card {
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 18px;
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f5f5f5;
}

.sidebar-title {
    font-size: 15px;
    font-weight: 700;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    gap: 6px;
}
</style>