import { ElMessage } from "element-plus";
import { isAxiosError } from "axios";

export function handleError(err:unknown){
    if(isAxiosError(err)){
        const message = err.response?.data?.message
        ElMessage.error(message||'请求失败，请稍后重试')
        return
    }
    ElMessage.error('发生未知错误')
}