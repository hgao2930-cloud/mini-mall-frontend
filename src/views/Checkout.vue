<template>
  <div v-for="item in items" :key="item.product.id">
    商品：{{ item.product.name }},数量：{{ item.quantity }}，单价：{{ item.product.price }}
    <img :src="item.product.image" :alt="item.product.name" />
  </div>
  <div v-if="hasItem">
    <div>总价：{{ total.totalPrice }}</div>
    <button :disabled="isSubmitting" @click="handleCheck">提交订单</button>
  </div>
  <div v-else>暂无商品需要结算</div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import { createOrder, type Order } from '@/api/order'
import { computed, ref } from 'vue'
import router from '@/router'

const cartStore = useCartStore()
const { items, total } = storeToRefs(cartStore)
const isSubmitting = ref(false)
const hasItem = computed(() => items.value.length > 0)

async function handleCheck() {
  if (isSubmitting.value) return
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
    router.push('/orders')
  } catch (err) {
    console.log('下单失败', err)
    isSubmitting.value = false
  }
}
</script>

<style scoped></style>
