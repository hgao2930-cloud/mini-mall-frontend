import api from '.'
import type { Product } from '@/api/products'

export interface CartItem {
  product: Product
  quantity: number
}

export const getCartItem = function () {
  return api.get<CartItem[]>('/cart')
}
export const addToCartItem = function (productId: string, quantity: number) {
  return api.post<{ quantity: number; message: string }>('/cart', { productId, quantity })
}
export const updateCartQuantity = function (productId: string, quantity: number) {
  return api.patch<{ quantity: number; message: string }>(`/cart/${productId}`, { quantity })
}
export const removeCartItem = function (productId: string) {
  return api.delete(`/cart/${productId}`)
}
export const clearCart = function () {
  return api.delete('/cart')
}
