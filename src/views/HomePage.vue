<template>
  <div class="home-page">
    <div class="banner">
      <div v-if="isLoggedIn" class="banner-text">欢迎回来，{{ user?.username }}</div>
      <router-link v-else to="/products" class="banner-btn">去逛逛</router-link>
    </div>
    <div class="section">
      <div v-if="isLoading" class="loading">加载中</div>
      <div v-else-if="errMsg" class="error">{{ errMsg }}</div>
      <div v-else-if="!products?.length" class="empty">暂无推荐</div>
      <div v-else>
        <h2 class="section-title">热门推荐</h2>
        <div class="top-grid">
          <div v-for="product in products" :key="product.id" class="top-card"
            :class="{ 'is-sold-out': product.stock <= 0 }">
            <span v-if="product.stock <= 0" class="sold-out-badge">已售罄</span>
            <router-link :to="`/products/${product.id}`">
              <img :src="product.image" :alt="product.name" />
              <p>{{ product.name }}</p>
              <p>{{ product.price }}</p>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">© 2026 MiniMall</div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { getHotProducts } from '@/api/products'
import { computed ,onMounted } from 'vue'
import { useAsyncData } from '@/composables/useAsyncData'

const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)
const { data, isLoading, errMsg, load } = useAsyncData(() => getHotProducts())
const products = computed(()=>data.value?.products)

onMounted(() => {
  load()
})
</script>

<style scoped>
.home-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

/* ===== Banner ===== */
.banner {
  margin-bottom: 40px;
  padding: 50px 40px;
  border-radius: var(--border-radius);
  background: linear-gradient(135deg, var(--color-primary-light), #d9ecff);
  text-align: center;
  color: var(--color-text);
}

.banner-text {
  font-size: 18px;
  font-weight: 400;
  color: var(--color-primary-dark);
}

.banner-btn {
  display: inline-block;
  padding: 12px 36px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: var(--color-primary);
  border-radius: 24px;
  transition: all var(--transition);
}

.banner-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* ===== 热推区 ===== */
.section {
  min-height: 120px;
  text-align: center;
}

.section-title {
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text);
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
}

/* ===== 加载/空状态 ===== */
.loading,
.empty,
.error {
  padding: 60px 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.error {
  color: var(--color-danger);
}

/* ===== 商品网格 ===== */
.top-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.top-card {
  position: relative;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
}

.top-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.top-card a {
  display: block;
  color: inherit;
}

.top-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.top-card.is-sold-out img {
  filter: grayscale(0.5);
  opacity: 0.55;
}

.sold-out-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 18px;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 10px;
}

.top-card p {
  padding: 10px 14px;
}

.top-card p:first-of-type {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.top-card p:last-of-type {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-danger);
}

.top-card p:last-of-type::before {
  content: '¥';
  font-size: 13px;
  font-weight: 400;
  margin-right: 2px;
}

/* ===== Footer ===== */
.footer {
  margin-top: 60px;
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-placeholder);
  border-top: 1px solid var(--color-border-light);
}
</style>
