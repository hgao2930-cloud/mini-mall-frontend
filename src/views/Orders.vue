<template>
  <div v-if="isLoading">加载中</div>
  <div v-else-if="errMsg">{{ errMsg }}</div>
  <div v-else>
    <div v-for="order in orders" :key="order.id">
      <li v-for="product in order.items" :key="product.product.id">
        商品：{{ product.product.name }}，数量：{{ product.quantity }}
      </li>
      <div>状态：{{ order.status }}</div>
      <div>总价：{{ order.totalPrice }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getOrders } from '@/api/order'
import { onMounted } from 'vue'
import { useAsyncData } from '@/composables/useAsyncData'

const { data: orders, isLoading, errMsg, load } = useAsyncData(getOrders)

onMounted(() => load())
</script>

<style scoped></style>
