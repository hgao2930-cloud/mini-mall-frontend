<template>
  <nav class="nav">
    <RouterLink to="/" class="nav-brand">MiniMall</RouterLink>

    <div class="nav-links">
      <RouterLink to="/" class="nav-link" active-class="exact-active">首页</RouterLink>
      <RouterLink to="/products" class="nav-link">商品</RouterLink>
      <RouterLink to="/cart" class="nav-link nav-cart">
        购物车
        <span v-if="total.totalCount > 0" class="badge">{{ total.totalCount }}</span>
      </RouterLink>
      <RouterLink to="/orders" class="nav-link">订单</RouterLink>
    </div>

    <div class="nav-auth">
      <template v-if="isLoggedIn">
        <RouterLink to="/profile" class="nav-user">{{ user?.username }}</RouterLink>
        <button @click="handleLogout" class="nav-logout">退出</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="nav-link">登录</RouterLink>
        <RouterLink to="/register" class="nav-link">注册</RouterLink>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'

const userStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(userStore)

const cartStore = useCartStore()
const { total } = storeToRefs(cartStore)

function handleLogout() {
  if (!confirm('确定退出登录吗？')) return
  userStore.logout()
}
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  background: var(--color-bg-white);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* ===== Logo ===== */
.nav-brand {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  margin-right: 40px;
  white-space: nowrap;
}

/* ===== 中间导航 ===== */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
  border-radius: var(--border-radius-sm);
  transition: color var(--transition);
}

.nav-link:hover {
  color: var(--color-primary);
}

/* 路由激活：非首页（模糊匹配） */
a.nav-link.router-link-active:not(.exact-active) {
  color: var(--color-primary);
}

a.nav-link.router-link-active:not(.exact-active)::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}

/* 路由激活：首页（严格匹配） */
a.nav-link.exact-active.router-link-exact-active {
  color: var(--color-primary);
}

a.nav-link.exact-active.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 16px;
  right: 16px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}

/* ===== 购物车角标 ===== */
.nav-cart {
  position: relative;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
  color: #fff;
  background: var(--color-danger);
  border-radius: 9px;
  pointer-events: none;
}

/* ===== 右侧认证区 ===== */
.nav-auth {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.nav-user {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
  transition: color var(--transition);
}

.nav-user:hover {
  color: var(--color-primary);
}

.nav-logout {
  padding: 4px 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition);
}

.nav-logout:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
</style>
