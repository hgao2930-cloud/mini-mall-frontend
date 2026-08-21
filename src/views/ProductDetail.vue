<template>
  <div v-if="isLoading">加载中</div>
  <div v-else-if="errMsg">{{ errMsg }}</div>
  <div v-else>
    <div>
      {{ product?.id }}-{{ product?.name }}-{{ product?.price }}-{{ product?.category }}-{{
        product?.description
      }}
      <img :src="product?.image" :alt="product?.name" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProduct } from '@/api/products'
import type { Product } from '@/api/products'
import axios from 'axios'

const product = ref<Product | null>(null)
const isLoading = ref(true)
const errMsg = ref('')
const route = useRoute()

onMounted(async () => {
  try {
    const res = await getProduct(route.params.id as string)
    product.value = res.data
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
