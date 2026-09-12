<template>
  <div class="product-list-page">
    <div class="search-box">
      <input v-model="searchText" placeholder="搜索商品..." @focus="isFocused = true" @blur="isFocused = false" />
      <ul v-show="suggestions.length && isFocused" class="suggestions">
        <li v-for="item in suggestions" :key="item.id" @mousedown.prevent="selectSuggestion(item.name)">
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div class="category-bar">
      <button v-for="cat in categories" :key="cat" :class="{ active: (cat === '全部' ? '' : cat) === currentCategory }"
        @click="currentCategory = cat === '全部' ? '' : cat">
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
    <div ref="loadMoreTrigger"></div>
  </div>
</template>

<script setup lang="ts">
import { getProducts, getCategory, type Product } from '@/api/products'
import { useAsyncData } from '@/composables/useAsyncData'
import { debounce } from '@/composables/debounce'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { handleError } from '@/utils/error'

const searchText = ref('')
const isFocused = ref(false)
const currentCategory = ref('')
const hasMore = ref(true)
const isLoadMore = ref(false)
const route = useRoute()
const page = ref(1)
const pageSize = 16
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
const resetPage = function () {
  page.value = 1
  hasMore.value = true
}
const { data: categoriesData, isLoading: categoriesIsLoading, errMsg: categoriesErrMsg, load: loadCategories } = useAsyncData(() => getCategory())
const { data, isLoading, errMsg, load } = useAsyncData(() => getProducts({ pageSize, page: page.value, keyword: searchText.value, category: currentCategory.value }))
const showProducts = computed(() => {
  return data.value?.products ?? []
})
const categories = computed(() => ['全部', ...categoriesData.value?.categories ?? []])
const suggestions = ref<Product[]>([])
const changeSearchText = async function (value: string) {
  const res = await getProducts({ keyword: value, pageSize: 5, page: 1 })
  suggestions.value = res.data.products
}
const debounced = debounce(changeSearchText, 200)

watch(searchText, (newVal) => {
  if (!newVal) {
    suggestions.value = []
    resetPage()
    load()
    debounced.cancel()
    return
  }
  debounced(newVal)
})

async function selectSuggestion(name: string) {
  resetPage()
  searchText.value = name
  isFocused.value = false
  await load()
}

watch(currentCategory, async (newVal) => {
  resetPage()
  await load()
})
const loadMore = async function () {
  if (isLoading.value || isLoadMore.value || !hasMore.value) return
  isLoadMore.value = true
  try {
    const res = await getProducts({ pageSize, page: page.value + 1, keyword: searchText.value, category: currentCategory.value })
    if (data.value) {
      data.value.products.push(...res.data.products)
      page.value++
    }
    hasMore.value = res.data.hasMore
  }
  catch (err) {
    handleError(err)
  }
  finally {
    isLoadMore.value = false
  }
}

onMounted(() => {
  if (route.query.category) {
    currentCategory.value = route.query.category as string
  }
  else {
    load()
  }
  loadCategories()
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    if (entry?.isIntersecting) {
      loadMore()
    }
  }, {
    rootMargin: '300px'
  })
  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  debounced.cancel()
  observer?.disconnect()
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
