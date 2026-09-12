import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/reset.css'
import './styles/variables.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth.ts'
import { useCartStore } from "@/stores/cart.ts";

const app = createApp(App)

app.use(createPinia())
const userStore = useAuthStore()
const cartStore = useCartStore()
async function initApp() {
    await userStore.init()
    await cartStore.init()
}
initApp()
app.use(router)
app.use(ElementPlus)
app.mount('#app')