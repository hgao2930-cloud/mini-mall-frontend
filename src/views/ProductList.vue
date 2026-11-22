<template>
  <div class="product-list-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">全部商品</h1>
        <p class="page-subtitle">支持关键词联想、分类筛选与触底加载</p>
      </div>
      <div v-if="list.length > 0" class="result-count">已加载 {{ list.length }} 件商品</div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-box">
      <div class="search-input-wrap" :class="{ 'is-focused': isFocused }">
        <svg
          class="search-icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          v-model="searchInput"
          placeholder="搜索商品名称，如 iPhone、MacBook、耳机..."
          @input="onSearchInput"
          @keyup.enter="onSearchEnter"
          @focus="isFocused = true"
          @blur="isFocused = false"
        />
        <button
          v-if="searchInput"
          type="button"
          class="search-clear"
          aria-label="清空搜索"
          @mousedown.prevent="clearSearch"
        >
          ×
        </button>
        <button type="button" class="search-submit" @mousedown.prevent="onSearchEnter">搜索</button>
      </div>

      <ul v-show="suggestions.length && isFocused" class="suggestions">
        <li
          v-for="item in suggestions"
          :key="item.id"
          @mousedown.prevent="selectSuggestion(item.name)"
        >
          <div class="suggestion-left">
            <img :src="item.image" :alt="item.name" class="suggestion-thumb" />
            <div class="suggestion-info">
              <div class="suggestion-name">{{ item.name }}</div>
              <div class="suggestion-cat">{{ item.category }}</div>
            </div>
          </div>
          <span class="suggestion-price">¥{{ formatPrice(item.price) }}</span>
        </li>
      </ul>
    </div>

    <!-- 分类栏 & 当前关键词标签 -->
    <div class="filter-bar">
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

      <button v-if="activeKeyword" type="button" class="active-chip" @click="clearActiveKeyword">
        <span>关键词：“{{ activeKeyword }}”</span>
        <span class="chip-close">×</span>
      </button>
    </div>

    <!-- 四态内容区 -->
    <div v-if="isLoading && !list.length" class="product-grid">
      <div v-for="n in 8" :key="n" class="skeleton-card">
        <div class="skeleton-block skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-block skeleton-tag"></div>
          <div class="skeleton-block skeleton-title"></div>
          <div class="skeleton-block skeleton-price"></div>
        </div>
      </div>
    </div>

    <div v-else-if="errMsg" class="state-card state-error">
      <p>{{ errMsg }}</p>
      <button type="button" class="retry-btn" @click="applyFilters()">重新加载</button>
    </div>

    <div v-else-if="list.length === 0" class="state-card">
      <p class="empty-title">没有找到匹配的商品</p>
      <p class="empty-desc">试试更换关键词或切换商品分类</p>
      <button
        v-if="activeKeyword || category"
        type="button"
        class="retry-btn"
        @click="resetAllFilters"
      >
        查看全部商品
      </button>
    </div>

    <template v-else>
      <div v-if="isRefreshing" class="refreshing">正在更新商品列表…</div>
      <div class="product-grid" :class="{ 'is-refreshing': isRefreshing }">
        <RouterLink
          v-for="product in showProducts"
          :key="product.id"
          :to="`/products/${product.id}`"
          class="product-card"
          :class="{ 'is-sold-out': product.stock <= 0 }"
        >
          <div class="product-stage">
            <span v-if="product.stock <= 0" class="status-badge sold-out-badge">已售罄</span>
            <span v-else-if="product.stock <= 5" class="status-badge low-stock-badge">
              仅剩 {{ product.stock }} 件
            </span>
            <img :src="product.image" :alt="product.name" class="card-image" />
          </div>
          <div class="card-body">
            <span class="card-category">{{ product.category }}</span>
            <div class="card-name">{{ product.name }}</div>
            <div class="card-footer">
              <div class="card-price">¥{{ formatPrice(product.price) }}</div>
              <span class="card-more">查看详情</span>
            </div>
          </div>
        </RouterLink>
      </div>
    </template>

    <div v-if="isLoadingMore" class="load-more">正在加载更多商品…</div>
    <div v-else-if="!hasMore && list.length > 0 && !isRefreshing" class="list-end">
      <span>已展示全部商品</span>
    </div>
    <div ref="loadMoreTrigger" class="sentinel"></div>
  </div>
</template>

<script setup lang="ts">
import { getProducts, getCategory, type Product } from '@/api/products'
import { useAsyncData } from '@/composables/useAsyncData'
import { debounce } from '@/composables/debounce'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { handleError } from '@/utils/error'
import { formatPrice } from '@/utils/format'

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
let suggestSeq = 0
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
    if (hasMore.value && observer && loadMoreTrigger.value) {
      observer.unobserve(loadMoreTrigger.value)
      observer.observe(loadMoreTrigger.value)
    }
  }
}

// ===== 搜索：输入只触发建议，确认后才改查询条件 =====
const fetchSuggestions = async function (value: string) {
  const seq = ++suggestSeq
  try {
    const res = await getProducts({ keyword: value, pageSize: 5, page: 1 })
    if (seq !== suggestSeq || !searchInput.value.trim()) return
    suggestions.value = res.data.products
  } catch (err) {
    if (seq !== suggestSeq) return
    handleError(err)
  }
}
const debouncedSuggest = debounce(fetchSuggestions, 200)

function onSearchInput() {
  const value = searchInput.value
  if (!value) {
    suggestions.value = []
    debouncedSuggest.cancel()
    suggestSeq++
    if (activeKeyword.value !== '') applyFilters({ keyword: '' })
    return
  }
  debouncedSuggest(value)
}

function clearSearch() {
  searchInput.value = ''
  onSearchInput()
}

function clearActiveKeyword() {
  searchInput.value = ''
  suggestions.value = []
  debouncedSuggest.cancel()
  suggestSeq++
  applyFilters({ keyword: '' })
}

function resetAllFilters() {
  searchInput.value = ''
  suggestions.value = []
  debouncedSuggest.cancel()
  suggestSeq++
  applyFilters({ keyword: '', category: '' })
}

function onSearchEnter() {
  isFocused.value = false
  debouncedSuggest.cancel()
  suggestSeq++
  suggestions.value = []
  applyFilters({ keyword: searchInput.value })
}

async function selectSuggestion(name: string) {
  searchInput.value = name
  isFocused.value = false
  debouncedSuggest.cancel()
  suggestSeq++
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
  suggestSeq++
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

/* ===== 页头 ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.page-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.result-count {
  font-size: 13px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

/* ===== 搜索框 ===== */
.search-box {
  position: relative;
  margin-bottom: 18px;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 6px 6px 6px 16px;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  box-shadow: var(--shadow-xs);
  transition: all var(--transition);
}

.search-input-wrap.is-focused {
  border-color: var(--color-ink);
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
}

.search-icon {
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.search-input-wrap input {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: transparent;
  font-size: 14px;
  color: var(--color-ink);
}

.search-input-wrap input::placeholder {
  color: var(--color-text-placeholder);
}

.search-clear {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-stage);
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition);
}

.search-clear:hover {
  background: var(--color-border);
}

.search-submit {
  height: 36px;
  padding: 0 20px;
  border-radius: 999px;
  background: var(--color-ink);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
  transition: background var(--transition);
}

.search-submit:hover {
  background: var(--color-ink-hover);
}

/* ===== 下拉建议 ===== */
.suggestions {
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-hairline);
  z-index: 100;
  overflow: hidden;
}

.suggestions li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-light);
  transition: background var(--transition);
}

.suggestions li:last-child {
  border-bottom: none;
}

.suggestions li:hover {
  background: var(--color-stage);
}

.suggestion-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.suggestion-thumb {
  width: 38px;
  height: 38px;
  padding: 4px;
  border-radius: 8px;
  background: var(--color-stage);
  object-fit: contain;
  flex-shrink: 0;
}

.suggestion-info {
  min-width: 0;
}

.suggestion-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-cat {
  font-size: 12px;
  color: var(--color-text-muted);
}

.suggestion-price {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  flex-shrink: 0;
}

/* ===== 分类栏 & 关键词标签 ===== */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-bar button {
  padding: 7px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  background: var(--color-bg-white);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  transition: all var(--transition);
}

.category-bar button:hover {
  color: var(--color-ink);
  border-color: var(--color-ink);
}

.category-bar button.active {
  background: var(--color-ink);
  color: #fff;
  border-color: var(--color-ink);
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.16);
}

.active-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  background: var(--color-primary-light);
  border: 1px solid rgba(0, 102, 204, 0.2);
}

.chip-close {
  font-size: 15px;
  line-height: 1;
}

/* ===== 状态卡片 ===== */
.state-card {
  text-align: center;
  padding: 72px 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  color: var(--color-text-muted);
}

.state-error {
  color: var(--color-danger);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
}

.empty-desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 22px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--color-ink);
  border-radius: 999px;
}

.refreshing {
  padding: 0 0 14px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* ===== 商品网格 & 骨架屏 ===== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  transition: opacity var(--transition);
}

.product-grid.is-refreshing {
  opacity: 0.65;
}

.skeleton-card {
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.skeleton-img {
  width: 100%;
  aspect-ratio: 1;
}

.skeleton-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-tag {
  width: 44px;
  height: 18px;
  border-radius: 6px;
}

.skeleton-title {
  width: 85%;
  height: 18px;
  border-radius: 6px;
}

.skeleton-price {
  width: 60px;
  height: 22px;
  border-radius: 6px;
}

.product-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all var(--transition);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.product-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  padding: 20px;
  background: var(--color-stage);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.product-card:hover .card-image {
  transform: scale(1.05);
}

.product-card.is-sold-out .card-image {
  filter: grayscale(0.6);
  opacity: 0.55;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
}

.sold-out-badge {
  color: #fff;
  background: rgba(17, 24, 39, 0.72);
  backdrop-filter: blur(6px);
}

.low-stock-badge {
  color: var(--color-warning);
  background: var(--color-warning-light);
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-category {
  align-self: flex-start;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-stage);
  border-radius: 6px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
  padding-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-price {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.card-more {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition);
}

.product-card:hover .card-more {
  opacity: 1;
  transform: translateX(0);
}

/* ===== 底部提示 ===== */
.load-more {
  padding: 24px 0 8px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

.list-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px 0 8px;
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.list-end::before,
.list-end::after {
  content: '';
  width: 48px;
  height: 1px;
  background: var(--color-border);
}

.sentinel {
  height: 1px;
}

@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .product-list-page {
    padding: 18px 16px 36px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .product-grid {
    gap: 12px;
  }

  .card-more {
    display: none;
  }
}
</style>
