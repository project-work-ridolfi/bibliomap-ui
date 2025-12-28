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
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/DashboardPage.vue')
  },
  {
    path: '/add-book',
    name: 'add-book',
    component: () => import('@/pages/AddBookPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: "/library",
    name: "library",
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
    name: 'location',
    component: () => import('@/pages/SetLocationPage.vue')
  },
  {
    path: '/books/:id',
    name: 'BookDetail',
    component: () => import('@/pages/BookPage.vue')
  },
  {
    path: '/libraries/:id',
    name: 'LibraryDetail',
    component: () => import('@/pages/LibraryDetailsPage.vue')
  },
  {
    path: '/books/:id/edit',
    name: 'BookEdit',
    component: () => import('@/pages/BookEdit.vue')
  },
   {
    path: '/libraries/:id/edit',
    name: 'LibraryEdit',
    component: () => import('@/pages/LibraryEdit.vue')
  }
  ,
   {
    path: '/libraries',
    name: 'MyLibraries',
    component: () => import('@/pages/MyLibrariesPage.vue'),
    meta: { requiresAuth: true }
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