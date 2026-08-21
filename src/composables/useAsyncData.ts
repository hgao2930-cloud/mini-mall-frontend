import axios from 'axios'
import { ref } from 'vue'

export function useAsyncData<T>(fetcher: () => Promise<{ data: T }>) {
  const data = ref<T>()
  const isLoading = ref(true)
  const errMsg = ref('')
  const load = async function () {
    try {
      const res = await fetcher()
      data.value = res.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        errMsg.value = err.response
          ? `加载失败(HTTP${err.response.status})`
          : '网络错误,请检查网络连接'
      }
    } finally {
      isLoading.value = false
    }
  }
  return { data, isLoading, errMsg, load }
}
