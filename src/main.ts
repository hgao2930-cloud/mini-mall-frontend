import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/reset.css'
import './styles/variables.css'
import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useUserInfoStore } from '@/stores/userinfo'

const app = createApp(App)

app.use(createPinia())
const userStore = useAuthStore()
const cartStore = useCartStore()
const userInfoStore = useUserInfoStore()

// 会话过期（401）时清掉所有本地登录态，避免"假登录"卡在路由守卫里
setUnauthorizedHandler(() => {
  userStore.clearUser()
  cartStore.reset()
  userInfoStore.reset()
})

async function initApp() {
  await userStore.init()
  await cartStore.init()
}
initApp()
app.use(router)
app.use(ElementPlus)
app.mount('#app')
