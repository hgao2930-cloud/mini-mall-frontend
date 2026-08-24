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
      <button v-if="order.status === '待付款'" @click="handlePay(order.id)">模拟支付</button>
      <button v-if="order.status === '待收货'" @click="handleConfirm(order.id)">确认收货</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getOrders, payOrder, confirmOrder } from '@/api/order'
import { onMounted } from 'vue'
import { useAsyncData } from '@/composables/useAsyncData'

const { data: orders, isLoading, errMsg, load } = useAsyncData(getOrders)
const handlePay = async function (id: string) {
  try {
    await payOrder(id)
    await load()
  } catch (err) {
    console.error(err)
  }
}
const handleConfirm = async function (id: string) {
  try {
    await confirmOrder(id)
    await load()
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => load())
</script>

<style scoped></style>
