import axios from 'axios'
import { ref } from 'vue'

export function useAsyncData<T>(fetcher: () => Promise<{ data: T }>) {
  const data = ref<T>()
  const isLoading = ref(true)
  const errMsg = ref('')
  let reqId = 0
  const load = async function () {
    const curId = ++reqId
    try {
      const res = await fetcher()
      if (curId !== reqId) return
      data.value = res.data
      errMsg.value = ''
    } catch (err) {
      if (curId !== reqId) return
      if (axios.isAxiosError(err)) {
        errMsg.value = err.response
          ? `加载失败(HTTP${err.response.status})`
          : '网络错误,请检查网络连接'
      } else {
        console.error(err)
        errMsg.value = '加载失败，请稍后重试'
      }
    } finally {
      if (curId === reqId) {
        isLoading.value = false
      }
    }
  }
  return { data, isLoading, errMsg, load }
}
