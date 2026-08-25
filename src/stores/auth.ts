import type { User } from '@/api/user'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(getUserFromStorage())
  const isLoggedIn = computed(() => !!user.value)

  function getUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  }

  function login(userData: User) {
    user.value = userData
    localStorage.setItem('auth', JSON.stringify(userData))
  }
  function logout() {
    user.value = null
    localStorage.removeItem('auth')
  }
  return { user, isLoggedIn, login, logout }
})
