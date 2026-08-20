import api from './index'

export const getProducts = function () {
  return api.get<Product[]>('/products')
}
export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
}
