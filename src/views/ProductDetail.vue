<template>
  <div class="product-detail-page">
    <div v-if="isLoading" class="loading">加载中</div>
    <div v-else-if="errMsg" class="error">{{ errMsg }}</div>
    <div v-else-if="product">
      <!-- 面包屑 -->
      <div class="breadcrumb">
        <RouterLink to="/">首页</RouterLink>
        <span class="separator">/</span>
        <RouterLink :to="`/products?category=${product.category}`">{{ product.category }}</RouterLink>
        <span class="separator">/</span>
        <span class="current">{{ product.name }}</span>
      </div>

      <!-- 主体 -->
      <div class="product-main">
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
        </div>
        <div class="product-info">
          <span class="product-category">{{ product.category }}</span>
          <h1 class="product-name">{{ product.name }}</h1>
          <div class="product-price">{{ product.price }}</div>
          <div class="quantity-row">
            <span class="quantity-label">数量</span>
            <div class="quantity-control">
              <button :disabled="quantity <= 1" @click="quantity--">-</button>
              <span class="quantity-num">{{ quantity }}</span>
              <button @click="quantity++">+</button>
            </div>
          </div>
          <el-button type="primary" size="large" class="add-btn" @click="handleAddToCart">
            加入购物车
          </el-button>
        </div>
      </div>

      <!-- 商品介绍 -->
      <div class="product-desc-section">
        <h2 class="section-title">商品介绍</h2>
        <p class="product-desc">{{ product.description }}</p>
      </div>

      <!-- 猜你喜欢 -->
      <div v-if="recommendations?.length" class="related-section">
        <h2 class="section-title">猜你喜欢</h2>
        <div class="related-grid">
          <RouterLink v-for="item in recommendations" :key="item.id" :to="`/products/${item.id}`" class="related-card">
            <img :src="item.image" :alt="item.name" class="related-image" />
            <div class="related-body">
              <div class="related-name">{{ item.name }}</div>
              <div class="related-price">{{ item.price }}</div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getProduct, getRecommendations } from '@/api/products'
import { useAsyncData } from '@/composables/useAsyncData'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import { handleError } from '@/utils/error'

const route = useRoute()
const { data, isLoading, errMsg, load, } = useAsyncData(() => getProduct(route.params.id as string))
const product = computed(()=>data.value?.product)

const quantity = ref(1)

const cartStore = useCartStore()
async function handleAddToCart() {
  if (!product.value) return
  try {
    await cartStore.addToCart(product.value, quantity.value)
    ElMessage.success(`已加入购物车 ×${quantity.value}`)
  } catch (err) {
    handleError(err)
  }
}

const { data: allProducts, load: loadAll } = useAsyncData(() => getRecommendations(route.params.id as string))
const recommendations = computed(()=>allProducts.value?.products)


onMounted(() => {
  load()
  loadAll()
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    load()
    loadAll()
    quantity.value = 1
  }
})
</script>

<style scoped>
.product-detail-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

.loading,
.error {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.error {
  color: var(--color-danger);
}

/* ===== 面包屑 ===== */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 13px;
  color: var(--color-text-placeholder);
}

.breadcrumb a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition);
}

.breadcrumb a:hover {
  color: var(--color-primary);
}

.breadcrumb .separator {
  color: var(--color-border-light);
}

.breadcrumb .current {
  color: var(--color-text);
}

/* ===== 主体 ===== */
.product-main {
  display: flex;
  gap: 40px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 32px;
  margin-bottom: 24px;
}

.product-image {
  flex: 0 0 400px;
}

.product-image img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-category {
  display: inline-block;
  padding: 4px 12px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 20px;
  font-size: 13px;
  width: fit-content;
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

.product-price {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-danger);
}

.product-price::before {
  content: '¥';
  font-size: 18px;
  font-weight: 400;
  margin-right: 2px;
}

/* ===== 数量选择 ===== */
.quantity-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.quantity-control button {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-bg);
  font-size: 16px;
  cursor: pointer;
  transition: background var(--transition);
}

.quantity-control button:hover:not(:disabled) {
  background: var(--color-border-light);
}

.quantity-control button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity-num {
  width: 48px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  line-height: 36px;
}

.add-btn {
  width: fit-content;
  margin-top: 8px;
}

/* ===== 商品介绍 ===== */
.product-desc-section {
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 32px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-light);
}

.product-desc {
  font-size: 14px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

/* ===== 猜你喜欢 ===== */
.related-section {
  margin-bottom: 40px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.related-card {
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  text-decoration: none;
  transition: transform var(--transition), box-shadow var(--transition);
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.related-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.related-body {
  padding: 12px;
}

.related-name {
  font-size: 13px;
  color: var(--color-text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.related-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-danger);
}

.related-price::before {
  content: '¥';
  font-size: 12px;
  font-weight: 400;
  margin-right: 2px;
}
</style>
