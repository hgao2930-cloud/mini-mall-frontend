<template>
  <div class="cart-page">
    <h1 class="page-title">购物车</h1>

    <div v-if="items.length === 0" class="empty-cart">
      <p>购物车是空的</p>
      <RouterLink to="/products" class="empty-link">去逛逛</RouterLink>
    </div>

    <div v-else>
      <div v-for="item in items" :key="item.product.id" class="cart-item">
        <img :src="item.product.image" :alt="item.product.name" class="cart-item-image" />
        <div class="cart-item-info">
          <div class="cart-item-name">{{ item.product.name }}</div>
          <div class="cart-item-price">¥{{ item.product.price }}</div>
        </div>
        <div class="quantity-control">
          <button class="qty-btn" :disabled="item.quantity <= 1 || loading === item.product.id"
            @click="decreaseQuantity(item.product.id)">
            -
          </button>
          <span class="qty-num">{{ item.quantity }}</span>
          <button class="qty-btn" :disabled="loading === item.product.id"
            @click="increaseQuantity(item.product.id)">+</button>
        </div>
        <div class="cart-item-subtotal">¥{{ item.product.price * item.quantity }}</div>
        <button class="cart-item-delete" :disabled="loading===item.product.id" @click="removeItem(item.product.id)">
          删除
        </button>
      </div>

      <div class="cart-footer">
        <div class="cart-total">
          共 {{ total.totalCount }} 件，合计
          <span class="cart-total-price">¥{{ total.totalPrice }}</span>
        </div>
        <RouterLink to="/checkout" class="cart-checkout-btn">去结算</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useAsyncAction } from '@/composables/useAsyncAction'

const cartStore = useCartStore()
const { items, total } = storeToRefs(cartStore)
const { loading, handleAction } = useAsyncAction()
const decreaseQuantity = (id: string) => handleAction(() => cartStore.decreaseQuantity(id), id)
const increaseQuantity = (id:string) => handleAction(()=>cartStore.increaseQuantity(id),id)
const removeItem = (id:string) => handleAction(()=>cartStore.removeItem(id),id)
</script>

<style scoped>
.cart-page {
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
.empty-cart {
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

/* ===== 商品条目 ===== */
.cart-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  margin-bottom: 12px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-item-price {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* ===== 数量控制 ===== */
.quantity-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.qty-btn {
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: var(--color-text);
  background: var(--color-bg);
  transition: all var(--transition);
}

.qty-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.qty-btn:disabled {
  color: var(--color-text-placeholder);
  cursor: not-allowed;
}

.qty-num {
  width: 40px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

/* ===== 小计 + 删除 ===== */
.cart-item-subtotal {
  min-width: 80px;
  text-align: right;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-danger);
}

.cart-item-delete {
  padding: 4px 12px;
  font-size: 13px;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition);
}

.cart-item-delete:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

/* ===== 底部结算栏 ===== */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 20px 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.cart-total {
  font-size: 15px;
  color: var(--color-text-secondary);
}

.cart-total-price {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-danger);
}

.cart-checkout-btn {
  display: inline-block;
  padding: 10px 32px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background: var(--color-primary);
  border-radius: var(--border-radius);
  transition: all var(--transition);
}

.cart-checkout-btn:hover {
  background: var(--color-primary-dark);
}
</style>
