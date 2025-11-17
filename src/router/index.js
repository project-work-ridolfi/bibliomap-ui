import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/pages/SignupPage.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue')
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/pages/MapPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/add-book',
    name: 'add-book',
    component: () => import('@/pages/AddBookPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: "/library", 
    name: "LibraryPage",
    component: LibraryPage,
    component: () => import('@/pages/LibraryPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/set-location',
    name: 'SetLocation',
    component: () => import('@/pages/SetLocationPage.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard per route protette
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router