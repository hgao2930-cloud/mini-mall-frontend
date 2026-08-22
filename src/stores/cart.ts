import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Product } from '@/api/products'

export interface CartItem {
  product: Product
  quantity: number
}
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const total = computed(() => {
    const totalPrice = items.value.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    )
    const totalCount = items.value.reduce((sum, item) => sum + item.quantity, 0)
    return { totalCount, totalPrice }
  })
  function addToCart(product: Product, quantity: number = 1) {
    const existingItem = items.value.find((item) => item.product.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({
        product: product,
        quantity: quantity,
      })
    }
  }
  function removeItem(productId: string) {
    items.value = items.value.filter((item) => item.product.id !== productId)
  }
  function increaseQuantity(productID: string) {
    const increaseItem = items.value.find((item) => item.product.id === productID)
    if (increaseItem) increaseItem.quantity++
  }
  function decreaseQuantity(productID: string) {
    const decreaseItem = items.value.find((item) => item.product.id === productID)
    if (decreaseItem) {
      if (decreaseItem.quantity === 1) {
        removeItem(productID)
        return
      }
      decreaseItem.quantity--
    }
  }
  return { items, total, addToCart, removeItem, increaseQuantity, decreaseQuantity }
})
