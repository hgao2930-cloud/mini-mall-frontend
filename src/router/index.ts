import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/orders',
      component: () => import('@/views/Orders.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      component: () => import('@/views/Profile.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/register',
      component: () => import('@/views/Register.vue'),
      meta: {
        guestOnly: true,
      },
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
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return '/'
  }
})

export default router
