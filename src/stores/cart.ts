import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Product } from '@/api/products'
import {
  getCartItem,
  addToCartItem,
  removeCartItem,
  updateCartQuantity,
  clearCart as clearCartApi,
  type CartItem,
} from '@/api/cart'
import { useAuthStore } from './auth'
import { handleError } from '@/utils/error'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const userStore = useAuthStore()
  const init = async function () {
    try {
      if (userStore.isLoggedIn) {
        const stored = await getCartItem()
        items.value = stored.data
      }
    }
    catch (err) {
      handleError(err)
    }
  }

  const total = computed(() => {
    const totalPrice = items.value.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    )
    const totalCount = items.value.reduce((sum, item) => sum + item.quantity, 0)
    return { totalCount, totalPrice }
  })
  async function addToCart(product: Product, quantity: number = 1) {
    await addToCartItem(product.id, quantity)
    const item = items.value.find(item => item.product.id === product.id)
    if (item) {
      item.quantity += quantity
    }
    else {
      items.value.push({ product: product, quantity: quantity })
    }
  }
  async function removeItem(productId: string) {
    await removeCartItem(productId)
    items.value = items.value.filter(item => item.product.id !== productId)
  }
  async function increaseQuantity(productID: string) {
    const increaseItem = items.value.find((item) => item.product.id === productID)
    if (increaseItem) {
      const res = await updateCartQuantity(productID, increaseItem.quantity + 1)
      increaseItem.quantity = res.data.quantity
    }
  }
  async function decreaseQuantity(productID: string) {
    const decreaseItem = items.value.find((item) => item.product.id === productID)
    if (decreaseItem) {
      if (decreaseItem.quantity === 1) {
        return
      }
      const res = await updateCartQuantity(productID, decreaseItem.quantity - 1)
      decreaseItem.quantity = res.data.quantity
    }
  }
  async function clearCart() {
    await clearCartApi()
    items.value = []
  }
  function reset() {
    items.value = []
  }
  return {
    items,
    total,
    init,
    addToCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    reset
  }
})
