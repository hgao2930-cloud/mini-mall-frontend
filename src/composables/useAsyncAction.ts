import { ref } from "vue"
import { handleError } from "@/utils/error"

export function useAsyncAction() {
    const loading = ref<string | null>(null)
    const handleAction = async function (action: () => Promise<void>, productId: string) {
        try {
            loading.value = productId
            await action()
        }
        catch (err) {
            handleError(err)
        }
        finally {
            loading.value = null
        }
    }
    return { loading, handleAction }
}