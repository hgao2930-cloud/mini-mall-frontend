<template>
  <div class="product-detail-page">
    <!-- 骨架屏 -->
    <div v-if="isLoading" class="skeleton-detail">
      <div class="skeleton-block skeleton-stage"></div>
      <div class="skeleton-meta">
        <div class="skeleton-block skeleton-pill"></div>
        <div class="skeleton-block skeleton-h1"></div>
        <div class="skeleton-block skeleton-sub"></div>
        <div class="skeleton-block skeleton-panel"></div>
        <div class="skeleton-block skeleton-btn"></div>
      </div>
    </div>

    <div v-else-if="errMsg" class="state-card state-error">
      <p>{{ errMsg }}</p>
      <button type="button" class="retry-btn" @click="load()">重新加载</button>
    </div>

    <div v-else-if="product">
      <!-- 面包屑 -->
      <div class="breadcrumb">
        <RouterLink to="/">首页</RouterLink>
        <span class="separator">/</span>
        <RouterLink :to="`/products?category=${encodeURIComponent(product.category)}`">
          {{ product.category }}
        </RouterLink>
        <span class="separator">/</span>
        <span class="current">{{ product.name }}</span>
      </div>

      <!-- 主体展示卡 -->
      <div class="product-main">
        <div class="product-stage" :class="{ 'is-sold-out': product.stock <= 0 }">
          <span v-if="product.stock <= 0" class="stage-badge">已售罄</span>
          <img :src="product.image" :alt="product.name" />
        </div>

        <div class="product-info">
          <span class="product-category">{{ product.category }}</span>
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-summary">{{ product.description }}</p>

          <div class="price-panel">
            <div>
              <div class="price-label">官方售价</div>
              <div class="product-price">¥{{ formatPrice(product.price) }}</div>
            </div>
            <div
              class="stock-pill"
              :class="{
                'stock-ok': product.stock > 5,
                'stock-low': product.stock > 0 && product.stock <= 5,
                'stock-empty': product.stock <= 0,
              }"
            >
              <span class="stock-dot"></span>
              <span v-if="product.stock > 5">现货充足 · 库存 {{ product.stock }} 件</span>
              <span v-else-if="product.stock > 0">库存紧张 · 仅剩 {{ product.stock }} 件</span>
              <span v-else>暂时缺货</span>
            </div>
          </div>

          <div class="quantity-row">
            <span class="quantity-label">购买数量</span>
            <div class="quantity-control">
              <button
                type="button"
                :disabled="product.stock <= 0 || quantity <= 1"
                @click="quantity--"
              >
                -
              </button>
              <span class="quantity-num">{{ quantity }}</span>
              <button
                type="button"
                :disabled="product.stock <= 0 || quantity >= Math.min(product.stock, 99)"
                @click="quantity++"
              >
                +
              </button>
            </div>
            <span v-if="product.stock > 0" class="quantity-hint">单次最多加购 99 件</span>
          </div>

          <div class="action-row">
            <el-button
              type="primary"
              size="large"
              class="add-btn"
              :disabled="product.stock <= 0"
              @click="handleAddToCart"
            >
              {{ product.stock > 0 ? '加入购物车' : '已售罄' }}
            </el-button>
            <RouterLink to="/cart" class="to-cart-btn">前往购物车</RouterLink>
          </div>

          <div class="assurance-row">
            <span>✓ 原厂正品保障</span>
            <span>✓ 下单实时锁库</span>
            <span>✓ 全场顺丰包邮</span>
          </div>
        </div>
      </div>

      <!-- 商品介绍 -->
      <div class="product-desc-section">
        <h2 class="section-title">商品规格与介绍</h2>
        <p class="product-desc">{{ product.description }}</p>
      </div>

      <!-- 猜你喜欢 -->
      <div v-if="recommendations?.length" class="related-section">
        <div class="related-header">
          <h2 class="section-title-plain">同类推荐</h2>
          <RouterLink
            :to="`/products?category=${encodeURIComponent(product.category)}`"
            class="related-more"
          >
            更多{{ product.category }} →
          </RouterLink>
        </div>
        <div class="related-grid">
          <RouterLink
            v-for="item in recommendations"
            :key="item.id"
            :to="`/products/${item.id}`"
            class="related-card"
            :class="{ 'is-sold-out': item.stock <= 0 }"
          >
            <div class="related-stage">
              <span v-if="item.stock <= 0" class="sold-out-badge">已售罄</span>
              <img :src="item.image" :alt="item.name" class="related-image" />
            </div>
            <div class="related-body">
              <div class="related-name">{{ item.name }}</div>
              <div class="related-price">¥{{ formatPrice(item.price) }}</div>
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
import { formatPrice } from '@/utils/format'

const route = useRoute()
const { data, isLoading, errMsg, load } = useAsyncData(() =>
  getProduct(route.params.id as string),
)
const product = computed(() => data.value?.product)

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

const { data: allProducts, load: loadAll } = useAsyncData(() =>
  getRecommendations(route.params.id as string),
)
const recommendations = computed(() => allProducts.value?.products)

onMounted(() => {
  load()
  loadAll()
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      load()
      loadAll()
      quantity.value = 1
    }
  },
)
</script>

<style scoped>
.product-detail-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

/* ===== 骨架屏 & 错误态 ===== */
.skeleton-detail {
  display: grid;
  grid-template-columns: 440px 1fr;
  gap: 40px;
  padding: 32px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
}

.skeleton-stage {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--border-radius);
}

.skeleton-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.skeleton-pill {
  width: 72px;
  height: 24px;
  border-radius: 999px;
}

.skeleton-h1 {
  width: 75%;
  height: 36px;
  border-radius: 8px;
}

.skeleton-sub {
  width: 90%;
  height: 20px;
  border-radius: 6px;
}

.skeleton-panel {
  width: 100%;
  height: 86px;
  border-radius: 12px;
}

.skeleton-btn {
  width: 180px;
  height: 46px;
  border-radius: 10px;
}

.state-card {
  text-align: center;
  padding: 72px 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.state-error {
  color: var(--color-danger);
}

.retry-btn {
  margin-top: 14px;
  padding: 8px 22px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--color-ink);
  border-radius: 999px;
}

/* ===== 面包屑 ===== */
.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.breadcrumb a {
  color: var(--color-text-secondary);
  transition: color var(--transition);
}

.breadcrumb a:hover {
  color: var(--color-ink);
}

.breadcrumb .separator {
  color: var(--color-border);
}

.breadcrumb .current {
  color: var(--color-ink);
  font-weight: 500;
}

/* ===== 主体 ===== */
.product-main {
  display: grid;
  grid-template-columns: 440px 1fr;
  gap: 44px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 32px;
  margin-bottom: 24px;
  align-items: start;
}

.product-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  padding: 32px;
  background: var(--color-stage);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-stage img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.product-stage.is-sold-out img {
  filter: grayscale(0.6);
  opacity: 0.55;
}

.stage-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: rgba(17, 24, 39, 0.72);
  border-radius: 999px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.product-category {
  align-self: flex-start;
  padding: 4px 12px;
  background: var(--color-stage);
  color: var(--color-text-secondary);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.product-name {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  line-height: 1.3;
}

.product-summary {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* 价格卡片 */
.price-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 18px 20px;
  background: #fafafa;
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
}

.price-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

.product-price {
  font-size: 32px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  line-height: 1.2;
}

.stock-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.stock-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.stock-ok {
  color: var(--color-success);
  background: var(--color-success-light);
}

.stock-low {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.stock-empty {
  color: var(--color-text-muted);
  background: var(--color-stage);
}

/* 数量步进器 */
.quantity-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.quantity-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.quantity-control button {
  width: 38px;
  height: 38px;
  background: #fafafa;
  font-size: 16px;
  color: var(--color-ink);
  transition: background var(--transition);
}

.quantity-control button:hover:not(:disabled) {
  background: var(--color-border-light);
}

.quantity-control button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.quantity-num {
  width: 52px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  line-height: 38px;
}

.quantity-hint {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

/* 操作按钮 */
.action-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.add-btn {
  min-width: 180px;
  height: 46px;
  font-weight: 600;
  border-radius: 10px;
}

.to-cart-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  padding: 0 22px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  transition: all var(--transition);
}

.to-cart-btn:hover {
  border-color: var(--color-ink);
  background: var(--color-stage);
}

.assurance-row {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--color-hairline);
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ===== 商品介绍 ===== */
.product-desc-section {
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 28px 32px;
  margin-bottom: 36px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-hairline);
}

.product-desc {
  font-size: 14px;
  line-height: 1.85;
  color: var(--color-text-secondary);
}

/* ===== 同类推荐 ===== */
.related-section {
  margin-bottom: 24px;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-title-plain {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-ink);
}

.related-more {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.related-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all var(--transition);
}

.related-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.related-stage {
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

.related-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.related-card:hover .related-image {
  transform: scale(1.05);
}

.related-card.is-sold-out .related-image {
  filter: grayscale(0.6);
  opacity: 0.55;
}

.sold-out-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(17, 24, 39, 0.72);
  border-radius: 999px;
}

.related-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.related-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-price {
  margin-top: auto;
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

@media (max-width: 1024px) {
  .product-main,
  .skeleton-detail {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .product-detail-page {
    padding: 18px 16px 36px;
  }

  .product-main {
    padding: 20px;
  }

  .product-name {
    font-size: 22px;
  }

  .related-grid {
    gap: 12px;
  }
}
</style>
