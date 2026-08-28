<template>
  <div class="checkout-page">
    <h1 class="page-title">确认订单</h1>

    <div v-if="!hasItem" class="empty">
      <p>暂无商品需要结算</p>
      <RouterLink to="/products" class="empty-link">去逛逛</RouterLink>
    </div>

    <template v-else>
      <!-- 收货信息 -->
      <div class="checkout-card">
        <h2 class="card-title">收货信息</h2>
        <div v-if="isFilled()" class="shipping-info">
          <div class="info-row">
            <span class="info-label">收货人</span>
            <span class="info-value">{{ userInfo.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">电话</span>
            <span class="info-value">{{ userInfo.phone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">地址</span>
            <span class="info-value">{{ userInfo.address }}</span>
          </div>
          <RouterLink to="/profile" class="change-link">修改信息</RouterLink>
        </div>
        <div v-else class="shipping-empty">
          <p>请先填写收货信息</p>
          <RouterLink to="/profile" class="empty-link">去填写</RouterLink>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="checkout-card">
        <h2 class="card-title">商品清单</h2>
        <div v-for="item in items" :key="item.product.id" class="checkout-item">
          <img :src="item.product.image" :alt="item.product.name" class="checkout-item-image" />
          <div class="checkout-item-info">
            <div class="checkout-item-name">{{ item.product.name }}</div>
            <div class="checkout-item-meta">¥{{ item.product.price }} × {{ item.quantity }}</div>
          </div>
          <div class="checkout-item-subtotal">¥{{ item.product.price * item.quantity }}</div>
        </div>
      </div>

      <!-- 结算栏 -->
      <div class="checkout-footer">
        <div class="checkout-total">
          共 {{ total.totalCount }} 件，合计
          <span class="checkout-total-price">¥{{ total.totalPrice }}</span>
        </div>
        <el-button
          type="primary"
          size="large"
          :disabled="isSubmitting || !isFilled()"
          @click="handleCheck"
        >
          提交订单
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { useUserInfoStore } from '@/stores/userinfo'
import { storeToRefs } from 'pinia'
import { createOrder, type Order } from '@/api/order'
import { computed, ref } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { RouterLink } from 'vue-router'

const cartStore = useCartStore()
const { items, total } = storeToRefs(cartStore)
const { userInfo, isFilled } = useUserInfoStore()
const isSubmitting = ref(false)
const hasItem = computed(() => items.value.length > 0)

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
    cartStore.clearCart()
    ElMessage.success('下单成功')
    router.push('/orders')
  } catch {
    ElMessage.error('下单失败，请稍后重试')
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

.page-title {
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text);
}

/* ===== 空状态 ===== */
.empty {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.empty-link {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 24px;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius);
  transition: all var(--transition);
}

.empty-link:hover {
  background: var(--color-primary);
  color: #fff;
}

/* ===== 卡片 ===== */
.checkout-card {
  margin-bottom: 20px;
  padding: 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.card-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

/* ===== 收货信息 ===== */
.shipping-info {
  position: relative;
}

.info-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-row:last-of-type {
  border-bottom: none;
}

.info-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--color-text);
}

.change-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-primary);
}

.change-link:hover {
  color: var(--color-primary-dark);
}

.shipping-empty {
  text-align: center;
  padding: 20px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* ===== 商品清单 ===== */
.checkout-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.checkout-item:last-child {
  border-bottom: none;
}

.checkout-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.checkout-item-info {
  flex: 1;
  min-width: 0;
}

.checkout-item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
}

.checkout-item-meta {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.checkout-item-subtotal {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-danger);
  min-width: 70px;
  text-align: right;
}

/* ===== 结算栏 ===== */
.checkout-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 20px 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.checkout-total {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.checkout-total-price {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-danger);
}
</style>
