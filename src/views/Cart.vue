<template>
  <div class="cart-page">
    <div class="page-header">
      <h1 class="page-title">购物车</h1>
      <span v-if="items.length > 0" class="count-pill">共 {{ total.totalCount }} 件商品</span>
    </div>

    <!-- 骨架加载 -->
    <div v-if="isLoading && items.length === 0" class="cart-layout">
      <div class="cart-list-card">
        <div v-for="n in 3" :key="n" class="skeleton-row">
          <div class="skeleton-block skeleton-thumb"></div>
          <div class="skeleton-info">
            <div class="skeleton-block skeleton-line-lg"></div>
            <div class="skeleton-block skeleton-line-sm"></div>
          </div>
          <div class="skeleton-block skeleton-ctrl"></div>
        </div>
      </div>
      <div class="summary-card">
        <div class="skeleton-block skeleton-line-lg"></div>
        <div class="skeleton-block skeleton-line-sm"></div>
        <div class="skeleton-block skeleton-btn"></div>
      </div>
    </div>

    <!-- 错误态 -->
    <div v-else-if="errMsg && items.length === 0" class="state-card state-error">
      <p>{{ errMsg }}</p>
      <button type="button" class="retry-btn" @click="cartStore.init(true)">重试</button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="items.length === 0" class="state-card">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M6 7h12l1 13H5L6 7Z" />
          <path d="M9 7V6a3 3 0 0 1 6 0v1" />
        </svg>
      </div>
      <p class="empty-title">购物车还是空的</p>
      <p class="empty-desc">去挑选心仪的数码好物加入购物车吧</p>
      <RouterLink to="/products" class="empty-link">去逛逛 →</RouterLink>
    </div>

    <!-- 双栏主体 -->
    <div v-else class="cart-layout">
      <div class="cart-list-card">
        <div v-for="item in items" :key="item.product.id" class="cart-item">
          <RouterLink :to="`/products/${item.product.id}`" class="cart-thumb-wrap">
            <img :src="item.product.image" :alt="item.product.name" class="cart-item-image" />
          </RouterLink>

          <div class="cart-item-info">
            <RouterLink :to="`/products/${item.product.id}`" class="cart-item-name">
              {{ item.product.name }}
            </RouterLink>
            <div class="cart-item-price">单价 ¥{{ formatPrice(item.product.price) }}</div>
            <div v-if="item.product.stock <= 0" class="cart-item-stock">已售罄</div>
            <div v-else-if="item.quantity > item.product.stock" class="cart-item-stock">
              库存不足（仅剩 {{ item.product.stock }} 件）
            </div>
          </div>

          <div class="quantity-control">
            <button
              type="button"
              class="qty-btn"
              :disabled="item.quantity <= 1 || loading === item.product.id"
              @click="decreaseQuantity(item.product.id)"
            >
              -
            </button>
            <span class="qty-num">{{ item.quantity }}</span>
            <button
              type="button"
              class="qty-btn"
              :disabled="item.quantity >= 99 || loading === item.product.id"
              @click="increaseQuantity(item.product.id)"
            >
              +
            </button>
          </div>

          <div class="cart-item-subtotal">
            ¥{{ formatPrice(item.product.price * item.quantity) }}
          </div>

          <button
            type="button"
            class="cart-item-delete"
            :disabled="loading === item.product.id"
            @click="removeItem(item.product.id)"
          >
            删除
          </button>
        </div>
      </div>

      <aside class="summary-card">
        <h2 class="summary-title">订单摘要</h2>
        <div class="summary-row">
          <span>商品件数</span>
          <span class="tabular">{{ total.totalCount }} 件</span>
        </div>
        <div class="summary-row">
          <span>商品小计</span>
          <span class="tabular">¥{{ formatPrice(total.totalPrice) }}</span>
        </div>
        <div class="summary-row">
          <span>配送运费</span>
          <span class="free-shipping">免运费</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-total">
          <span>合计</span>
          <span class="summary-total-price">¥{{ formatPrice(total.totalPrice) }}</span>
        </div>
        <RouterLink to="/checkout" class="cart-checkout-btn">去结算 →</RouterLink>
        <RouterLink to="/products" class="continue-link">继续选购</RouterLink>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useAsyncAction } from '@/composables/useAsyncAction'
import { formatPrice } from '@/utils/format'

const cartStore = useCartStore()
const { items, total, isLoading, errMsg } = storeToRefs(cartStore)
const { loading, handleAction } = useAsyncAction()
const decreaseQuantity = (id: string) => handleAction(() => cartStore.decreaseQuantity(id), id)
const increaseQuantity = (id: string) => handleAction(() => cartStore.increaseQuantity(id), id)
const removeItem = (id: string) => handleAction(() => cartStore.removeItem(id), id)

onMounted(() => {
  cartStore.init(true)
})
</script>

<style scoped>
.cart-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.count-pill {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-white);
  border-radius: 999px;
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--color-hairline);
}

/* ===== 骨架屏 & 空/错误态 ===== */
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-hairline);
}

.skeleton-row:last-child {
  border-bottom: none;
}

.skeleton-thumb {
  width: 84px;
  height: 84px;
  border-radius: 10px;
  flex-shrink: 0;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line-lg {
  width: 55%;
  height: 18px;
  border-radius: 6px;
}

.skeleton-line-sm {
  width: 30%;
  height: 14px;
  border-radius: 6px;
}

.skeleton-ctrl {
  width: 100px;
  height: 34px;
  border-radius: 8px;
}

.skeleton-btn {
  width: 100%;
  height: 44px;
  margin-top: 18px;
  border-radius: 10px;
}

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

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: var(--color-stage);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
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

.retry-btn,
.empty-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 26px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: var(--color-ink);
  border-radius: 999px;
  transition: all var(--transition);
}

.retry-btn:hover,
.empty-link:hover {
  background: var(--color-ink-hover);
  transform: translateY(-1px);
}

/* ===== 双栏布局 ===== */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.cart-list-card {
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-hairline);
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-thumb-wrap {
  width: 84px;
  height: 84px;
  padding: 8px;
  border-radius: 12px;
  background: var(--color-stage);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cart-item-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 6px;
  transition: color var(--transition);
}

.cart-item-name:hover {
  color: var(--color-primary);
}

.cart-item-price {
  font-size: 13px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.cart-item-stock {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-danger);
  background: var(--color-danger-light);
}

/* ===== 数量控制 ===== */
.quantity-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;
}

.qty-btn {
  width: 32px;
  height: 32px;
  font-size: 15px;
  color: var(--color-ink);
  background: #fafafa;
  transition: background var(--transition);
}

.qty-btn:hover:not(:disabled) {
  background: var(--color-border-light);
}

.qty-btn:disabled {
  color: var(--color-text-placeholder);
  cursor: not-allowed;
}

.qty-num {
  width: 38px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  line-height: 32px;
}

/* ===== 小计 + 删除 ===== */
.cart-item-subtotal {
  min-width: 96px;
  text-align: right;
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.cart-item-delete {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all var(--transition);
  flex-shrink: 0;
}

.cart-item-delete:hover:not(:disabled) {
  color: var(--color-danger);
  border-color: rgba(220, 38, 38, 0.35);
  background: var(--color-danger-light);
}

/* ===== 侧边摘要卡片 ===== */
.summary-card {
  position: sticky;
  top: 88px;
  padding: 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.summary-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 18px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.tabular {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.free-shipping {
  font-weight: 500;
  color: var(--color-success);
}

.summary-divider {
  height: 1px;
  margin: 14px 0;
  background: var(--color-hairline);
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-ink);
}

.summary-total-price {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.cart-checkout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: var(--color-ink);
  border-radius: 10px;
  transition: all var(--transition);
}

.cart-checkout-btn:hover {
  background: var(--color-ink-hover);
  transform: translateY(-1px);
}

.continue-link {
  display: block;
  margin-top: 12px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
  transition: color var(--transition);
}

.continue-link:hover {
  color: var(--color-ink);
}

@media (max-width: 960px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .cart-page {
    padding: 18px 16px 36px;
  }

  .cart-item {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
  }

  .cart-item-info {
    min-width: calc(100% - 100px);
  }

  .cart-item-subtotal {
    min-width: auto;
    margin-left: auto;
  }
}
</style>
