<template>
  <div class="product-list-page">
    <div class="search-box">
      <input
        v-model="searchInput"
        placeholder="搜索商品..."
        @input="onSearchInput"
        @keyup.enter="onSearchEnter"
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
        :class="{ active: (cat === '全部' ? '' : cat) === category }"
        @click="selectCategory(cat)"
      >
        {{ cat }}
      </button>
    </div>
    <div v-if="isLoading && !list.length" class="loading">加载中</div>
    <div v-else-if="errMsg" class="error">{{ errMsg }}</div>
    <div v-else-if="list.length === 0" class="empty">没有找到匹配的商品</div>
    <template v-else>
      <div v-if="isRefreshing" class="refreshing">加载中…</div>
      <div class="product-grid">
        <div
          v-for="product in showProducts"
          :key="product.id"
          class="product-card"
          :class="{ 'is-sold-out': product.stock <= 0 }"
        >
          <span v-if="product.stock <= 0" class="sold-out-badge">已售罄</span>
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
    </template>
    <div v-if="isLoadingMore" class="load-more">加载更多…</div>
    <div ref="loadMoreTrigger"></div>
  </div>
</template>

<script setup lang="ts">
import { getProducts, getCategory, type Product } from '@/api/products'
import { useAsyncData } from '@/composables/useAsyncData'
import { debounce } from '@/composables/debounce'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { handleError } from '@/utils/error'

const route = useRoute()
const pageSize = 16

// ===== 页面状态（可写，只由明确动作改变） =====
const list = ref<Product[]>([])
const page = ref(1)
const hasMore = ref(true)
const activeKeyword = ref('') // 已生效的查询条件，只有确认搜索才会变
const category = ref('')
const searchInput = ref('') // 输入框内容，只用于触发下拉建议
const suggestions = ref<Product[]>([])
const isFocused = ref(false)
const isRefreshing = ref(false) // 重新筛选在途
const isLoadingMore = ref(false)
let requestSeq = 0 // 筛选代次：重新筛选时 +1，用于作废旧响应
let listSeq = 0 // 当前列表数据对应的代次，用于判断"列表是否已是当前条件的结果"
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// ===== 后端原始响应（只读，不直接渲染） =====
const {
  data: pageData,
  isLoading,
  errMsg,
  load: loadPage,
} = useAsyncData(() =>
  getProducts({
    pageSize,
    page: page.value,
    keyword: activeKeyword.value,
    category: category.value,
  }),
)
const { data: categoryData, load: loadCategories } = useAsyncData(() => getCategory())

// ===== 派生（computed，只读） =====
const showProducts = computed(() => list.value)
const categories = computed(() => ['全部', ...(categoryData.value?.categories ?? [])])

// ===== 重新筛选的唯一入口：所有条件变化都走这里 =====
async function applyFilters(next: { keyword?: string; category?: string } = {}) {
  if (next.keyword !== undefined) activeKeyword.value = next.keyword
  if (next.category !== undefined) category.value = next.category
  const seq = ++requestSeq
  page.value = 1
  isRefreshing.value = true
  try {
    await loadPage()
  } finally {
    if (seq === requestSeq) isRefreshing.value = false
  }
  if (seq !== requestSeq) return // 期间又改了筛选 → 丢弃
  if (errMsg.value) return // 失败时保留旧列表
  if (pageData.value) {
    list.value = pageData.value.products
    hasMore.value = pageData.value.hasMore
    listSeq = seq // 标记列表数据属于当前代次
    await nextTick()
    window.scrollTo({ top: 0 })
  }
}

// ===== 搜索：输入只触发建议，确认后才改查询条件 =====
const fetchSuggestions = async function (value: string) {
  try {
    const res = await getProducts({ keyword: value, pageSize: 5, page: 1 })
    suggestions.value = res.data.products
  } catch (err) {
    handleError(err)
  }
}
const debouncedSuggest = debounce(fetchSuggestions, 200)

function onSearchInput() {
  const value = searchInput.value
  if (!value) {
    suggestions.value = []
    debouncedSuggest.cancel()
    if (activeKeyword.value !== '') applyFilters({ keyword: '' })
    return
  }
  debouncedSuggest(value)
}

function onSearchEnter() {
  isFocused.value = false
  debouncedSuggest.cancel()
  suggestions.value = []
  applyFilters({ keyword: searchInput.value })
}

async function selectSuggestion(name: string) {
  searchInput.value = name
  isFocused.value = false
  debouncedSuggest.cancel()
  suggestions.value = []
  await applyFilters({ keyword: name })
}

function selectCategory(cat: string) {
  applyFilters({ category: cat === '全部' ? '' : cat })
}

// ===== 加载更多（只读快照，不改变筛选代次） =====
const loadMore = async function () {
  if (
    !list.value.length ||
    listSeq !== requestSeq || // 列表还不是当前条件的结果（比如上一次筛选失败）→ 不加载更多
    isRefreshing.value ||
    isLoadingMore.value ||
    !hasMore.value
  ) {
    return
  }
  isLoadingMore.value = true
  const seq = requestSeq
  try {
    const res = await getProducts({
      pageSize,
      page: page.value + 1,
      keyword: activeKeyword.value,
      category: category.value,
    })
    if (seq !== requestSeq) return // 筛选已变化 → 丢弃，不污染列表
    list.value = [...list.value, ...res.data.products]
    page.value++
    hasMore.value = res.data.hasMore
  } catch (err) {
    handleError(err)
  } finally {
    isLoadingMore.value = false
  }
}

onMounted(() => {
  applyFilters({ category: (route.query.category as string) || '' })
  loadCategories()
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        loadMore()
      }
    },
    {
      rootMargin: '300px',
    },
  )
  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  debouncedSuggest.cancel()
  observer?.disconnect()
})

// 同组件内路由 query 变化（比如从别处跳到 /products?category=xxx）
watch(
  () => route.query.category,
  (newCat) => {
    const next = (newCat as string) || ''
    if (next === category.value) return
    applyFilters({ category: next })
  },
)
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

/* 重新筛选 / 加载更多 的轻提示 */
.refreshing,
.load-more {
  padding: 12px 0;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ===== 商品网格 ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.product-card {
  position: relative;
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

.product-card.is-sold-out .card-image {
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
