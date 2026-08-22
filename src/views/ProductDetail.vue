<template>
  <div v-if="isLoading">加载中</div>
  <div v-else-if="errMsg">{{ errMsg }}</div>
  <div v-else>
    <div>
      {{ product?.id }}-{{ product?.name }}-{{ product?.price }}-{{ product?.category }}-{{
        product?.description
      }}
      <img :src="product?.image" :alt="product?.name" />
      <button @click="handleAddToCart">加入购物车</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProduct } from '@/api/products'
import { useAsyncData } from '@/composables/useAsyncData'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const {
  data: product,
  isLoading,
  errMsg,
  load,
} = useAsyncData(() => getProduct(route.params.id as string))

const cartStore = useCartStore()
function handleAddToCart() {
  if (product.value) {
    cartStore.addToCart(product.value)
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped></style>
