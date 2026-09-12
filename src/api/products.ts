import api from './index'

export const getProducts = function (params?: Params) {
  return api.get<ProductsResponse>('/products', { params: params })
}
export interface ProductResponse {
  product: Product
  message: string
}
interface Categories {
  categories:string[]
}
export interface ProductsResponse {
  products: Product[]
  hasMore: boolean
  message: string
}
interface Params {
  keyword?: string,
  category?: string,
  pageSize?: number,
  page?: number
}
export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
}
export const getProduct = function (id: string) {
  return api.get<ProductResponse>(`/products/${id}`)
}
export const getHotProducts = function () {
  return api.get<ProductsResponse>(`/products/hot`)
}
export const getRecommendations = function (id: string) {
  return api.get<ProductsResponse>(`/products/${id}/recommendations`)
}
export const getCategory = function () {
  return api.get<Categories>('/products/category')
}