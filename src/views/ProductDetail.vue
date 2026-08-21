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
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getProduct } from '@/api/products'
import { useAsyncData } from '@/composables/useAsyncData'

const route = useRoute()
const {
  data: product,
  isLoading,
  errMsg,
  load,
} = useAsyncData(() => getProduct(route.params.id as string))

onMounted(() => {
  load()
})
</script>

<style scoped></style>
