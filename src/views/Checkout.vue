<template>
  <div class="checkout-page">
    <div class="page-header">
      <h1 class="page-title">确认订单</h1>
      <RouterLink to="/cart" class="back-cart-link">← 返回购物车</RouterLink>
    </div>

    <!-- 骨架屏 -->
    <div v-if="cartLoading && !hasItem" class="checkout-layout">
      <div class="checkout-main">
        <div class="checkout-card">
          <div class="skeleton-block skeleton-title"></div>
          <div class="skeleton-block skeleton-row"></div>
          <div class="skeleton-block skeleton-row"></div>
        </div>
      </div>
      <div class="summary-card">
        <div class="skeleton-block skeleton-title"></div>
        <div class="skeleton-block skeleton-btn"></div>
      </div>
    </div>

    <div v-else-if="!hasItem" class="state-card">
      <p class="empty-title">暂无商品需要结算</p>
      <p class="empty-desc">先去挑选喜欢的商品加入购物车吧</p>
      <RouterLink to="/products" class="empty-link">去逛逛 →</RouterLink>
    </div>

    <div v-else class="checkout-layout">
      <div class="checkout-main">
        <!-- 收货信息 -->
        <div class="checkout-card">
          <div class="card-header">
            <h2 class="card-title">
              <span class="title-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10Z" />
                  <circle cx="12" cy="11" r="2.2" />
                </svg>
              </span>
              收货信息
            </h2>
            <RouterLink v-if="isFilled()" to="/profile" class="change-link">修改信息</RouterLink>
          </div>

          <div v-if="isFilled()" class="shipping-info">
            <div class="info-row">
              <span class="info-label">收货人</span>
              <span class="info-value">{{ userInfo.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">联系电话</span>
              <span class="info-value tabular">{{ userInfo.phone }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">收货地址</span>
              <span class="info-value">{{ userInfo.address }}</span>
            </div>
          </div>

          <div v-else class="shipping-empty">
            <p class="shipping-warn">尚未完善收货信息，请先填写收货人、电话与地址后再提交订单</p>
            <RouterLink to="/profile" class="fill-link">前往填写收货信息 →</RouterLink>
          </div>
        </div>

        <!-- 商品清单 -->
        <div class="checkout-card">
          <div class="card-header">
            <h2 class="card-title">商品清单（{{ total.totalCount }} 件）</h2>
          </div>

          <div v-for="item in items" :key="item.product.id" class="checkout-item">
            <div class="checkout-thumb-wrap">
              <img :src="item.product.image" :alt="item.product.name" class="checkout-item-image" />
            </div>
            <div class="checkout-item-info">
              <div class="checkout-item-name">{{ item.product.name }}</div>
              <div class="checkout-item-meta">
                ¥{{ formatPrice(item.product.price) }} × {{ item.quantity }}
              </div>
            </div>
            <div class="checkout-item-subtotal">
              ¥{{ formatPrice(item.product.price * item.quantity) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧结算汇总 -->
      <aside class="summary-card">
        <h2 class="summary-title">结算汇总</h2>
        <div class="summary-row">
          <span>商品总数</span>
          <span class="tabular">{{ total.totalCount }} 件</span>
        </div>
        <div class="summary-row">
          <span>商品总额</span>
          <span class="tabular">¥{{ formatPrice(total.totalPrice) }}</span>
        </div>
        <div class="summary-row">
          <span>运费</span>
          <span class="free-shipping">免运费</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-total">
          <span>应付总额</span>
          <span class="summary-total-price">¥{{ formatPrice(total.totalPrice) }}</span>
        </div>
        <el-button
          type="primary"
          size="large"
          class="submit-btn"
          :loading="isSubmitting"
          :disabled="isSubmitting || !isFilled()"
          @click="handleCheck"
        >
          提交订单
        </el-button>
        <p v-if="!isFilled()" class="submit-hint">请先填写收货信息后提交</p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { useUserInfoStore } from '@/stores/userinfo'
import { storeToRefs } from 'pinia'
import { createOrder, type Order } from '@/api/order'
import { computed, onMounted, ref } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { RouterLink } from 'vue-router'
import { getApiErrorMessage } from '@/api/index'
import { formatPrice } from '@/utils/format'

const cartStore = useCartStore()
const { items, total, isLoading: cartLoading } = storeToRefs(cartStore)
const userInfoStore = useUserInfoStore()
const { userInfo } = storeToRefs(userInfoStore)
const { isFilled, loadInfo } = userInfoStore
const isSubmitting = ref(false)
const hasItem = computed(() => items.value.length > 0)

onMounted(() => {
  loadInfo()
  cartStore.init()
})

async function handleCheck() {
  if (isSubmitting.value) return
  if (!isFilled()) {
    ElMessage.warning('请先填写收货信息')
    return
  }
  isSubmitting.value = true
  try {
    const order: Omit<Order, 'id'> = {
      items: [...items.value],
      totalPrice: total.value.totalPrice,
      status: '待付款',
      createdAt: new Date().toISOString(),
    }
    await createOrder(order)
    cartStore.reset()
    cartStore.init(true).catch(() => {})
    ElMessage.success('下单成功')
    router.push('/orders')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.back-cart-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color var(--transition);
}

.back-cart-link:hover {
  color: var(--color-ink);
}

/* ===== 骨架 & 空态 ===== */
.skeleton-title {
  width: 40%;
  height: 22px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.skeleton-row {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.skeleton-btn {
  width: 100%;
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

.empty-link {
  display: inline-flex;
  align-items: center;
  margin-top: 20px;
  padding: 10px 26px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: var(--color-ink);
  border-radius: 999px;
}

/* ===== 双栏布局 ===== */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.checkout-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.checkout-card {
  padding: 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-hairline);
}

.card-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-ink);
}

.title-icon {
  color: var(--color-ink);
  display: inline-flex;
}

.change-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
}

.change-link:hover {
  color: var(--color-primary-dark);
}

/* ===== 收货信息 ===== */
.info-row {
  display: flex;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  width: 72px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
}

.shipping-empty {
  padding: 18px;
  border-radius: 12px;
  background: var(--color-warning-light);
  border: 1px solid rgba(217, 119, 6, 0.22);
}

.shipping-warn {
  font-size: 13px;
  color: var(--color-warning);
  margin-bottom: 10px;
}

.fill-link {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
}

/* ===== 商品清单 ===== */
.checkout-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-hairline);
}

.checkout-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.checkout-thumb-wrap {
  width: 64px;
  height: 64px;
  padding: 6px;
  border-radius: 10px;
  background: var(--color-stage);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkout-item-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.checkout-item-info {
  flex: 1;
  min-width: 0;
}

.checkout-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 4px;
}

.checkout-item-meta {
  font-size: 13px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.checkout-item-subtotal {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  min-width: 80px;
  text-align: right;
}

/* ===== 右侧结算汇总 ===== */
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

.submit-btn {
  width: 100%;
  height: 46px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
}

.submit-hint {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: var(--color-warning);
}

@media (max-width: 960px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 640px) {
  .checkout-page {
    padding: 18px 16px 36px;
  }

  .checkout-card {
    padding: 18px;
  }
}
</style>
