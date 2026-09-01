import router from '@/router'
import axios, { isAxiosError } from 'axios'

const api = axios.create({
  // 部署后由 Nginx 把 /api 转发到后端；本地开发由 vite 代理转发
  baseURL: '/api',
  timeout: 5000,
  withCredentials:true
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (isAxiosError(err) && err.response?.status === 401) {
      router.push('/login')
    }
    return Promise.reject(err)
  },
)

export default api

/** 从 axios 错误里提取后端返回的 message，方便页面直接展示 */
export function getApiErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message
    if (typeof message === 'string' && message) return message
    if (err.response) return `请求失败(HTTP${err.response.status})`
    return '网络错误，请检查网络连接'
  }
  return '网络错误，请检查网络连接'
}
