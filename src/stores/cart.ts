import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Product } from '@/api/products'
import { getCartItem,addToCartItem, removeCartItem, updateCartQuantity,clearCart as clearCartApi } from '@/api/cart'
import { useAuthStore } from './auth'

export interface CartItem {
  product: Product
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const userStore = useAuthStore()
  const init = async function () {
    if (userStore.isLoggedIn) {
      const stored = await getCartItem()
      items.value = stored.data
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
    await addToCartItem(product.id,quantity)
  }
  async function removeItem(productId: string) {
    await removeCartItem(productId)
    items.value = items.value.filter(item=>item.product.id!==productId)
  }
  async function increaseQuantity(productID: string) {
    const increaseItem = items.value.find((item) => item.product.id === productID)
    if (increaseItem) {
      const res =  await updateCartQuantity(productID,increaseItem.quantity+1)
      increaseItem.quantity = res.data.quantity
    }
  }
  async function decreaseQuantity(productID: string) {
    const decreaseItem = items.value.find((item) => item.product.id === productID)
    if (decreaseItem) {
      if (decreaseItem.quantity === 1) {
        return
      }
      const res = await updateCartQuantity(productID,decreaseItem.quantity-1)
      decreaseItem.quantity = res.data.quantity
    }
  }
  async function clearCart() {
    await clearCartApi()
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
  }
})
