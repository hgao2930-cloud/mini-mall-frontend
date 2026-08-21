import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/cart',
      component: () => import('@/views/Cart.vue'),
    },
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/orders',
      component: () => import('@/views/Orders.vue'),
    },
    {
      path: '/register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/products/:id',
      component: () => import('@/views/ProductDetail.vue'),
    },
    {
      path: '/products',
      component: () => import('@/views/ProductList.vue'),
    },
    {
      path: '/checkout',
      component: () => import('@/views/Checkout.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

export default router
