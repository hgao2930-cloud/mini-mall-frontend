<template>
  <div v-if="items.length === 0">购物车是空的</div>
  <div v-else>
    <div v-for="item in items" :key="item.product.id">
      商品：{{ item.product.name }},数量：{{ item.quantity }},单价{{ item.product.price }}
      <button @click="cartStore.increaseQuantity(item.product.id)">加一</button>
      <button @click="cartStore.decreaseQuantity(item.product.id)">减一</button>
      <button @click="cartStore.removeItem(item.product.id)">删除商品</button>
    </div>
    <p>总数：{{ total.totalCount }}</p>
    <p>总价：{{ total.totalPrice }}</p>
    <router-link to="/checkout">去结算</router-link>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

const cartStore = useCartStore()

const { items, total } = storeToRefs(cartStore)
</script>

<style scoped></style>
