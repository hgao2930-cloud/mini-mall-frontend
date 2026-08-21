<template>
  <div v-if="isLoading">加载中</div>
  <div v-else-if="errMsg">{{ errMsg }}</div>
  <div v-else-if="products.length === 0">暂无商品</div>
  <div v-else>
    <div v-for="product in products" :key="product.id">
      {{ product.id }}-{{ product.name }}-{{ product.price }}
      <RouterLink :to="`/products/${product.id}`">详情</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getProducts } from '@/api/products'
import type { Product } from '@/api/products'
import axios from 'axios'
import { onMounted, ref } from 'vue'

const products = ref<Product[]>([])
const isLoading = ref(true)
const errMsg = ref('')

onMounted(async () => {
  try {
    const res = await getProducts()
    products.value = res.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      errMsg.value = err.response
        ? `加载失败(HTTP${err.response.status})`
        : '网络错误,请检查网络连接'
    } else {
      errMsg.value = '未知错误'
    }
    console.error(err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped></style>
