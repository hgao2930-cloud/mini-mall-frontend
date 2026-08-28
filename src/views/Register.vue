<template>
  <div class="register-page">
    <div class="register-card">
      <h2 class="register-title">注册</h2>
      <el-form :model="user" :rules="rules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="user.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="register-btn" @click="handleRegister">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="register-footer">已有账号？<RouterLink to="/login">去登录</RouterLink></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { registerUser } from '@/api/user'
import { ref } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'

const user = ref({
  username: '',
  password: '',
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleRegister() {
  try {
    if (!user.value.username || !user.value.password) {
      ElMessage.warning('请输入用户名和密码')
      return
    }
    await registerUser(user.value)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch {
    ElMessage.error('注册失败，请稍后重试')
  }
}
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: var(--page-padding);
}

.register-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 36px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.register-title {
  margin-bottom: 28px;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  color: var(--color-text);
}

.register-btn {
  width: 100%;
  height: 42px;
  font-size: 15px;
}

.register-footer {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.register-footer a {
  color: var(--color-primary);
  font-weight: 500;
}

.register-footer a:hover {
  color: var(--color-primary-dark);
}
</style>
