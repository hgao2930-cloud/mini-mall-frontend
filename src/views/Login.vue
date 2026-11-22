<template>
  <div class="login-page">
    <div class="login-card">
      <div class="auth-header">
        <span class="auth-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 7h12l1 13H5L6 7Z" />
            <path d="M9 7V6a3 3 0 0 1 6 0v1" />
          </svg>
        </span>
        <h1 class="login-title">欢迎回来</h1>
        <p class="login-subtitle">登录 MiniMall 账户以同步购物车与订单</p>
      </div>

      <el-form ref="formRef" :model="user" :rules="rules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" size="large" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="user.password"
            size="large"
            type="password"
            show-password
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="isSubmitting"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        还没有账号？<RouterLink to="/register">立即注册 →</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import router from '@/router/index'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getApiErrorMessage } from '@/api'

const formRef = ref<FormInstance>()
const isSubmitting = ref(false)
const user = ref({
  username: '',
  password: '',
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

function getSafeRedirect(target: unknown): string {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : '/'
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await authStore.login(user.value.username, user.value.password)
    await cartStore.init(true)
    ElMessage.success('登录成功')
    router.push(getSafeRedirect(route.query.redirect))
  } catch (err) {
    ElMessage.error(getApiErrorMessage(err))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
  padding: 24px;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 102, 204, 0.06), transparent 45%),
    radial-gradient(circle at 80% 80%, rgba(17, 24, 39, 0.05), transparent 45%),
    var(--color-bg);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 36px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-mark {
  width: 44px;
  height: 44px;
  margin: 0 auto 14px;
  border-radius: 12px;
  background: var(--color-ink);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-ink);
  letter-spacing: -0.02em;
}

.login-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.login-btn {
  width: 100%;
  height: 44px;
  margin-top: 6px;
  font-size: 15px;
  font-weight: 600;
}

.login-footer {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--color-hairline);
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

.login-footer a {
  color: var(--color-primary);
  font-weight: 600;
}

.login-footer a:hover {
  color: var(--color-primary-dark);
}
</style>
