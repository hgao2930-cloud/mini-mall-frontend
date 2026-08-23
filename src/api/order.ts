import api from './index'
import type { CartItem } from '@/stores/cart'

export interface Order {
  id: string
  items: CartItem[]
  totalPrice: number
  status: '待付款' | '待发货' | '已完成'
  createdAt: string
}
export const createOrder = function (data: Omit<Order, 'id'>) {
  return api.post('/orders', data)
}
export const getOrders = function () {
  return api.get<Order[]>('/orders')
}
