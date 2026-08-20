import Cart from '@/views/Cart.vue'
import Checkout from '@/views/Checkout.vue'
import HomePage from '@/views/HomePage.vue'
import Login from '@/views/Login.vue'
import Orders from '@/views/Orders.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import ProductList from '@/views/ProductList.vue'
import Register from '@/views/Register.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/cart',
      component: Cart,
    },
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/orders',
      component: Orders,
    },
    {
      path: '/register',
      component: Register,
    },
    {
      path: '/products/:id',
      component: ProductDetail,
    },
    {
      path: '/products',
      component: ProductList,
    },
    {
      path: '/checkout',
      component: Checkout,
    },
  ],
})

export default router
