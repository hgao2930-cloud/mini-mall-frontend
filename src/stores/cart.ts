import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Product } from '@/api/products'

export interface CartItem {
  product: Product
  quantity: number
}
export const useCartStore = defineStore('cart', () => {
  const getItemsFromStorage = function (): CartItem[] {
    try {
      const stored = localStorage.getItem('items')
      return stored ? JSON.parse(stored) : []
    } catch {
      localStorage.removeItem('items')
      return []
    }
  }
  const items = ref<CartItem[]>(getItemsFromStorage())

  watch(items, (newItems) => localStorage.setItem('items', JSON.stringify(newItems)), {
    deep: true,
  })

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
  function clearCart() {
    items.value = []
  }
  return { items, total, addToCart, removeItem, increaseQuantity, decreaseQuantity, clearCart }
})
