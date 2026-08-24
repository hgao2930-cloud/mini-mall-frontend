import api from './index'
import type { CartItem } from '@/stores/cart'

export interface Order {
  id: string
  items: CartItem[]
  totalPrice: number
  status: '待付款' | '待收货' | '已完成'
  createdAt: string
}
export const createOrder = function (data: Omit<Order, 'id'>) {
  return api.post<Order>('/orders', data)
}
export const getOrders = function () {
  return api.get<Order[]>('/orders')
}
export const payOrder = function (id: string) {
  return api.patch<Order>(`/orders/${id}`, { status: '待收货' })
}
export const confirmOrder = function (id: string) {
  return api.patch<Order>(`/orders/${id}`, { status: '已完成' })
}
