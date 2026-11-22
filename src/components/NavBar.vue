<template>
  <header class="nav-header">
    <nav class="nav-inner">
      <RouterLink to="/" class="nav-brand">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 7h12l1 13H5L6 7Z" />
            <path d="M9 7V6a3 3 0 0 1 6 0v1" />
          </svg>
        </span>
        <span class="brand-text">MiniMall</span>
      </RouterLink>

      <div class="nav-links">
        <RouterLink to="/" class="nav-link" active-class="exact-active">首页</RouterLink>
        <RouterLink to="/products" class="nav-link">商品</RouterLink>
        <RouterLink to="/cart" class="nav-link nav-cart">
          <span>购物车</span>
          <span v-if="total.totalCount > 0" class="badge">{{ total.totalCount }}</span>
        </RouterLink>
        <RouterLink to="/orders" class="nav-link">订单</RouterLink>
      </div>

      <div class="nav-auth">
        <template v-if="isLoggedIn">
          <RouterLink to="/profile" class="nav-user">
            <span class="user-avatar">{{ user?.username?.charAt(0).toUpperCase() }}</span>
            <span class="user-name">{{ user?.username }}</span>
          </RouterLink>
          <button class="nav-logout" @click="handleLogout">退出</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="nav-login">登录</RouterLink>
          <RouterLink to="/register" class="nav-register">注册</RouterLink>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useUserInfoStore } from '@/stores/userinfo'
import { ElMessageBox } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const userStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(userStore)

const cartStore = useCartStore()
const { total } = storeToRefs(cartStore)

const userInfoStore = useUserInfoStore()

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }
  await userStore.logout()
  cartStore.reset()
  userInfoStore.reset()
  if (route.meta.requiresAuth) {
    router.push('/login')
  }
}
</script>

<style scoped>
.nav-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid var(--color-hairline);
}

.nav-inner {
  max-width: var(--page-max-width);
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 28px;
}

/* ===== Logo ===== */
.nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--color-ink);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(17, 24, 39, 0.18);
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

/* ===== 中间导航 ===== */
.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: 999px;
  transition: all var(--transition);
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--color-ink);
  background: rgba(17, 24, 39, 0.045);
}

/* 路由激活：非首页（模糊匹配） */
a.nav-link.router-link-active:not(.exact-active),
a.nav-link.exact-active.router-link-exact-active {
  color: var(--color-ink);
  font-weight: 600;
}

a.nav-link.router-link-active:not(.exact-active)::after,
a.nav-link.exact-active.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 14px;
  right: 14px;
  height: 2px;
  background: var(--color-ink);
  border-radius: 999px;
}

/* ===== 购物车角标 ===== */
.badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
  text-align: center;
  color: #fff;
  background: var(--color-danger);
  border-radius: 999px;
}

/* ===== 右侧认证区 ===== */
.nav-auth {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  flex-shrink: 0;
}

.nav-user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border-radius: 999px;
  border: 1px solid var(--color-hairline);
  background: rgba(255, 255, 255, 0.7);
  transition: all var(--transition);
}

.nav-user:hover {
  border-color: var(--color-border);
  background: #fff;
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-ink);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-logout {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #fff;
  transition: all var(--transition);
}

.nav-logout:hover {
  color: var(--color-danger);
  border-color: rgba(220, 38, 38, 0.35);
  background: var(--color-danger-light);
}

.nav-login {
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: 999px;
  transition: all var(--transition);
}

.nav-login:hover {
  color: var(--color-ink);
  background: rgba(17, 24, 39, 0.045);
}

.nav-register {
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--color-ink);
  border-radius: 999px;
  transition: all var(--transition);
}

.nav-register:hover {
  background: var(--color-ink-hover);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .nav-inner {
    padding: 0 14px;
    gap: 12px;
  }

  .brand-text {
    display: none;
  }

  .nav-links {
    gap: 2px;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 13px;
  }

  .user-name {
    max-width: 72px;
  }
}
</style>
