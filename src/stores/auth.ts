import { getMe, loginUser, logOut, registerUser, type User } from '@/api/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { handleError } from '@/utils/error'

export const useAuthStore = defineStore('auth', () => {
  const USER_KEY = 'user'
  const user = ref<User | null>(getUserFromStorage())
  const isLoggedIn = computed(() => !!user.value)

  async function init() {
    try {
      localStorage.removeItem(USER_KEY)
      const res = await getMe()
      if (!res.data.user) {
        user.value = null
        return
      }
      user.value = res.data.user
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user))
    }
    catch (err) {
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
    }
    catch (err) {
      console.error(err)
    }
    finally {
      user.value = null
      localStorage.removeItem(USER_KEY)
    }
  }
  return { user, isLoggedIn, login, register, logout, init }
})
