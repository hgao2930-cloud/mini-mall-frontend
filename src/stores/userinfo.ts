import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  name: string
  phone: string
  address: string
}

const DEFAULT_INFO: UserInfo = { name: '', phone: '', address: '' }

export const useUserInfoStore = defineStore('userinfo', () => {
  const USERINFO_KEY = 'userinfo'

  function loadFromStorage(): UserInfo {
    try {
      const stored = localStorage.getItem(USERINFO_KEY)
      return stored ? JSON.parse(stored) : { ...DEFAULT_INFO }
    } catch {
      localStorage.removeItem(USERINFO_KEY)
      return { ...DEFAULT_INFO }
    }
  }

  const userInfo = ref<UserInfo>(loadFromStorage())
  const isFilled = () => !!(userInfo.value.name && userInfo.value.phone && userInfo.value.address)

  function updateInfo(data: UserInfo) {
    userInfo.value = { ...data }
    localStorage.setItem(USERINFO_KEY, JSON.stringify(userInfo.value))
  }

  return { userInfo, isFilled, updateInfo }
})
