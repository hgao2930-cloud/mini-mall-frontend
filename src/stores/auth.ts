import type { User } from '@/api/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const USER_KEY = 'user'
  const TOKEN_KEY = 'token'
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

  function login(userData: User) {
    user.value = userData
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    localStorage.setItem(TOKEN_KEY, crypto.randomUUID())
  }
  function logout() {
    user.value = null
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }
  return { user, isLoggedIn, login, logout }
})
