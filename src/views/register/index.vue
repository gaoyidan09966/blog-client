<template>
    <div class="register-container">
        <div class="register-card">
            <div class="register-header">
                <h2>创建账号</h2>
                <p>加入拾光笔记，开启你的写作之旅</p>
            </div>

            <el-form :model="registerForm" :rules="rules" ref="formRef" label-width="0" size="large">
                <el-form-item prop="username">
                    <el-input v-model="registerForm.username" placeholder="用户名" prefix-icon="User" />
                </el-form-item>
                <el-form-item prop="nickname">
                    <el-input v-model="registerForm.nickname" placeholder="昵称（选填）" prefix-icon="UserFilled" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="registerForm.password" type="password" placeholder="密码" prefix-icon="Lock"
                        show-password />
                </el-form-item>
                <el-form-item prop="confirmPassword">
                    <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码"
                        prefix-icon="Lock" show-password @keyup.enter="handleRegister" />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="register-btn" :loading="loading" @click="handleRegister">
                        注册
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="register-footer">
                <span>已有账号？</span>
                <el-button type="primary" link @click="goToLogin">去登录</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { register } from '../../api/user';

const router = useRouter();
const loading = ref(false);
const formRef = ref(null);

const registerForm = reactive({
    username: '',
    nickname: '',
    password: '',
    confirmPassword: ''
});

// 自定义确认密码校验
const validateConfirm = (rule, value, callback) => {
    if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};

const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不少于 6 位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { validator: validateConfirm, trigger: 'blur' }
    ]
};

const handleRegister = () => {
    formRef.value.validate(async (valid) => {
        if (!valid) return;
        loading.value = true;
        try {
            await register({
                username: registerForm.username,
                password: registerForm.password,
                nickname: registerForm.nickname || undefined
            });
            ElMessage.success('注册成功！请登录');
            router.push('/login');
        } catch (error) {
            console.error('注册失败:', error);
        } finally {
            loading.value = false;
        }
    });
};

const goToLogin = () => {
    router.push('/login');
};
</script>

<style scoped>
.register-container {
    min-height: calc(100vh - 64px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: linear-gradient(135deg, #fafbff 0%, #f0f4ff 40%, #fff5f5 100%);
}

.register-card {
    width: 400px;
    background: #fff;
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.04);
}

.register-header {
    text-align: center;
    margin-bottom: 32px;
}

.register-header h2 {
    font-size: 26px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 8px;
}

.register-header p {
    font-size: 14px;
    color: #999;
    margin: 0;
}

.register-btn {
    width: 100%;
    height: 44px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 700;
    background: #1a1a1a;
    border: none;
}

.register-btn:hover {
    background: #333;
}

.register-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 14px;
    color: #999;
}
</style>