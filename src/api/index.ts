import router from '@/router'
import axios, { isAxiosError } from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
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
