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
import { useAsyncData } from '@/composables/useAsyncData'
import { computed, onMounted } from 'vue'

const { data, isLoading, errMsg, load } = useAsyncData(() => getProducts())
const products = computed(() => {
  return data.value ?? []
})

onMounted(() => {
  load()
})
</script>

<style scoped></style>
