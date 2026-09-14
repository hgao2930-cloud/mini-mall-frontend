import { getMe, loginUser, logOut, registerUser, type User } from '@/api/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { handleError } from '@/utils/error'

export const useAuthStore = defineStore('auth', () => {
  const USER_KEY = 'user'
  const user = ref<User | null>(getUserFromStorage())
  const isLoggedIn = computed(() => !!user.value)

  function clearUser() {
    user.value = null
    localStorage.removeItem(USER_KEY)
  }

  async function init() {
    try {
      const res = await getMe()
      if (!res.data.user) {
        clearUser()
        return
      }
      user.value = res.data.user
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user))
    } catch (err) {
      // 校验失败时不能保留旧的登录态，否则路由守卫会误判成已登录
      clearUser()
      handleError(err)
    }
  }
  function getUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem(USER_KEY)
      return null
    }
  }

  async function login(username: string, password: string) {
    const res = await loginUser({ username, password })
    user.value = res.data.user
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user))
  }

  async function register(username: string, password: string) {
    const res = await registerUser({ username, password })
    user.value = res.data.user
    localStorage.setItem(USER_KEY, JSON.stringify(res.data.user))
  }

  async function logout() {
    try {
      await logOut()
    } catch (err) {
      console.error(err)
    } finally {
      clearUser()
    }
  }
  return { user, isLoggedIn, login, register, logout, init, clearUser }
})
