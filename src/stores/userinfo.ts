import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

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

  async function updateInfo(data: UserInfo) {
    const res = await api.put<UserInfo>('/profile', data)
    userInfo.value = { ...DEFAULT_INFO, ...res.data }
    localStorage.setItem(USERINFO_KEY, JSON.stringify(userInfo.value))
  }

  async function loadInfo() {
    try {
      const res = await api.get<UserInfo>('/profile')
      userInfo.value = { ...DEFAULT_INFO, ...res.data }
      localStorage.setItem(USERINFO_KEY, JSON.stringify(userInfo.value))
    } catch {
      // 未登录或请求失败时保留本地缓存
    }
  }

  return { userInfo, isFilled, updateInfo, loadInfo }
})
