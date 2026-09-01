import { loginUser, registerUser, type User } from '@/api/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const USER_KEY = 'user'
  const user = ref<User | null>(getUserFromStorage())
  const isLoggedIn = computed(() => !!user.value)

  function getUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem(USER_KEY)
      return null
    }
  }

  // TODO(练习)：调 loginUser()，成功后保存 user（token 按方案 A 存 localStorage 或方案 B 交给 cookie）
  async function login(username: string, password: string) {
    const res = await loginUser({username,password})
    user.value = res.data.user
    localStorage.setItem(USER_KEY,JSON.stringify(res.data.user))
    localStorage.setItem('token',res.data.token)
  }

  // TODO(练习)：调 registerUser()，成功后保存 user
  async function register(username: string, password: string) {
    const res = await registerUser({ username, password })
    user.value = res.data.user
    localStorage.setItem(USER_KEY,JSON.stringify(res.data.user))
    localStorage.setItem('token',res.data.token)
  }

  function logout() {
    user.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('token')
  }
  return { user, isLoggedIn, login, register, logout }
})
