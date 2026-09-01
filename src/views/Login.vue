<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">登录</h2>
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
          <el-button type="primary" class="login-btn" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">还没有账号？<RouterLink to="/register">去注册</RouterLink></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import router from '@/router/index'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getApiErrorMessage } from '@/api'

const user = ref({
  username: '',
  password: '',
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const route = useRoute()
const redirect = route.query.redirect as string | undefined

const authStore = useAuthStore()

async function handleLogin() {
  try {
    if (!user.value.username || !user.value.password) {
      ElMessage.warning('请输入用户名和密码')
      return
    }
    await authStore.login(user.value.username, user.value.password)
    ElMessage.success('登录成功')
    router.push(redirect ?? '/')
  } catch (err) {
    ElMessage.error(getApiErrorMessage(err))
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  padding: var(--page-padding);
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 36px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.login-title {
  margin-bottom: 28px;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  color: var(--color-text);
}

.login-btn {
  width: 100%;
  height: 42px;
  font-size: 15px;
}

.login-footer {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.login-footer a {
  color: var(--color-primary);
  font-weight: 500;
}

.login-footer a:hover {
  color: var(--color-primary-dark);
}
</style>
