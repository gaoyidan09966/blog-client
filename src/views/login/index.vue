<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>欢迎回来</h2>
                <p>登录你的拾光笔记账号</p>
            </div>

            <el-form :model="loginForm" :rules="rules" ref="formRef" label-width="0" size="large">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock"
                        show-password @keyup.enter="handleLogin" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="login-footer">
                <span>还没有账号？</span>
                <el-button type="primary" link @click="goToRegister">立即注册</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login } from '../../api/user';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const formRef = ref(null);

const loginForm = reactive({
    username: '',
    password: ''
});

const rules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return;
        loading.value = true;
        try {
            const res = await login(loginForm);
            userStore.setLoginData(res.data.token, res.data.user);
            ElMessage.success('登录成功！');
            router.push('/');
        } catch (error) {
            console.error('登录失败:', error);
        } finally {
            loading.value = false;
        }
    });
};

const goToRegister = () => {
    router.push('/register');
};
</script>

<style scoped>
.login-container {
    min-height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
}

.login-card {
    width: 400px;
    background: #fff;
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.login-header {
    text-align: center;
    margin-bottom: 32px;
}

.login-header h2 {
    font-size: 26px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 8px;
}

.login-header p {
    font-size: 14px;
    color: #999;
    margin: 0;
}

.login-btn {
    width: 100%;
    height: 44px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    background: #1a1a1a;
    border: none;
}

.login-btn:hover {
    background: #333;
}

.login-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #999;
}
</style>