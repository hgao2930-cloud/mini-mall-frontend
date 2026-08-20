<template>
  <nav class="nav">
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/login">登录</RouterLink>
    <RouterLink to="/products">商品</RouterLink>
    <RouterLink to="/checkout">结算</RouterLink>
    <RouterLink to="/register">注册</RouterLink>
    <RouterLink to="/cart">购物车</RouterLink>
    <RouterLink to="/orders">订单</RouterLink>
  </nav>
</template>

<script setup lang="ts"></script>

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
