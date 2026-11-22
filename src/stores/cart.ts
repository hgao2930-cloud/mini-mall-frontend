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
import { getApiErrorMessage } from '@/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const isLoading = ref(false)
  const errMsg = ref('')
  const loaded = ref(false)
  let initPromise: Promise<void> | null = null
  const userStore = useAuthStore()

  const init = async function (force = false) {
    if (!userStore.isLoggedIn) {
      reset()
      return
    }
    if (initPromise) return initPromise
    if (loaded.value && !force) return
    initPromise = (async () => {
      if (!loaded.value) isLoading.value = true
      errMsg.value = ''
      try {
        const stored = await getCartItem()
        items.value = stored.data
        loaded.value = true
      } catch (err) {
        errMsg.value = getApiErrorMessage(err)
      } finally {
        isLoading.value = false
        initPromise = null
      }
    })()
    return initPromise
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
    const res = await addToCartItem(product.id, quantity)
    const nextQty = res.data.quantity
    const item = items.value.find((item) => item.product.id === product.id)
    if (item) {
      item.quantity = nextQty
      item.product = product
    } else {
      items.value.push({ product, quantity: nextQty })
    }
  }
  async function removeItem(productId: string) {
    await removeCartItem(productId)
    items.value = items.value.filter((item) => item.product.id !== productId)
  }
  async function increaseQuantity(productID: string) {
    const increaseItem = items.value.find((item) => item.product.id === productID)
    if (increaseItem) {
      if (increaseItem.quantity >= 99) return
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
    loaded.value = false
    errMsg.value = ''
    isLoading.value = false
  }
  return {
    items,
    isLoading,
    errMsg,
    loaded,
    total,
    init,
    addToCart,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    reset,
  }
})
