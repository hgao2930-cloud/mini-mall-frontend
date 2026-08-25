<template>
  <nav class="nav">
    <RouterLink to="/">首页</RouterLink>
    <div v-if="isLoggedIn">
      {{ user?.username }}
      <button @click="handleLogout">退出登录</button>
    </div>
    <div v-else>
      <RouterLink to="/login">登录</RouterLink>

      <RouterLink to="/register">注册</RouterLink>
    </div>
    <RouterLink to="/products">商品</RouterLink>
    <RouterLink to="/cart">购物车</RouterLink>
    <RouterLink to="/orders">订单</RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
const userStore = useAuthStore()
const { isLoggedIn, user } = storeToRefs(userStore)
function handleLogout() {
  userStore.logout()
}
</script>

<style scoped>
.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  text-decoration: none;
  color: #333;
}

.nav a:hover {
  color: #409eff;
}
</style>
