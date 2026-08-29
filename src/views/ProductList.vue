<template>
  <div class="product-list-page">
    <div class="search-box">
      <input
        v-model="searchText"
        placeholder="搜索商品..."
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
      <ul v-show="suggestions.length && isFocused" class="suggestions">
        <li
          v-for="item in suggestions"
          :key="item.id"
          @mousedown.prevent="selectSuggestion(item.name)"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div class="category-bar">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="{ active: currentCategory === cat }"
        @click="currentCategory = cat"
      >
        {{ cat }}
      </button>
    </div>
    <div v-if="isLoading" class="loading">加载中</div>
    <div v-else-if="errMsg" class="error">{{ errMsg }}</div>
    <div v-else-if="showProducts.length === 0" class="empty">没有找到匹配的商品</div>
    <div v-else class="product-grid">
      <div v-for="product in showProducts" :key="product.id" class="product-card">
        <RouterLink :to="`/products/${product.id}`" class="card-link">
          <img :src="product.image" :alt="product.name" class="card-image" />
          <div class="card-body">
            <div class="card-name">{{ product.name }}</div>
            <div class="card-price">{{ product.price }}</div>
            <div class="card-footer">
              <span class="card-category">{{ product.category }}</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getProducts } from '@/api/products'
import { useAsyncData } from '@/composables/useAsyncData'
import { computed, onMounted } from 'vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const { data, isLoading, errMsg, load } = useAsyncData(() => getProducts())
const products = computed(() => {
  return data.value ?? []
})
const searchText = ref('')
const isFocused = ref(false)
const suggestions = computed(() => {
  if (!searchText.value) return []
  return products.value.filter((p) => p.name.includes(searchText.value)).slice(0, 5)
})
function selectSuggestion(name: string) {
  searchText.value = name
  isFocused.value = false
}
const categories = computed(() => {
  const cat = [...new Set(products.value.map((p) => p.category))]
  return ['全部', ...cat]
})
const currentCategory = ref('全部')
const showProducts = computed(() => {
  if (currentCategory.value === '全部') return products.value
  return products.value.filter((p) => p.category === currentCategory.value)
})

onMounted(() => {
  if (route.query.category) {
    currentCategory.value = route.query.category as string
  }
  load()
})
</script>

<style scoped>
.product-list-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

/* ===== 搜索框 ===== */
.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  font-size: 14px;
  color: var(--color-text);
  transition: border-color var(--transition);
}

.search-box input::placeholder {
  color: var(--color-text-placeholder);
}

.search-box input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

/* ===== 下拉建议 ===== */
.suggestions {
  position: absolute;
  top: 48px;
  left: 0;
  right: 0;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  z-index: 100;
  overflow: hidden;
}

.suggestions li {
  padding: 10px 16px;
  cursor: pointer;
  transition: background var(--transition);
}

.suggestions li:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

/* ===== 分类栏 ===== */
.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
}

.category-bar button {
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 13px;
  background: var(--color-bg-white);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition);
}

.category-bar button:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.category-bar button.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

/* ===== 状态提示 ===== */
.loading,
.empty,
.error {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.error {
  color: var(--color-danger);
}

/* ===== 商品网格 ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.product-card {
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition:
    transform var(--transition),
    box-shadow var(--transition);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.product-card .card-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.product-card .card-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.product-card .card-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card .card-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-danger);
}

.product-card .card-price::before {
  content: '¥';
  font-size: 13px;
  font-weight: 400;
  margin-right: 2px;
}

.product-card .card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-card .card-category {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.product-card .card-link {
  font-size: 13px;
  color: var(--color-primary);
  transition: color var(--transition);
}

.product-card .card-link:hover {
  color: var(--color-primary-dark);
}
</style>
