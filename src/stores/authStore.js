import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/apiClient'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  async function register(userData) {
    const response = await apiClient.post('/auth/register', userData)
    token.value = response.data.token
    localStorage.setItem('token', token.value)
    await fetchCurrentUser()
  }

  async function login(credentials) {
    const response = await apiClient.post('/auth/login', credentials)
    token.value = response.data.token
    localStorage.setItem('token', token.value)
    await fetchCurrentUser()
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    const response = await apiClient.get('/users/me')
    user.value = response.data
  }

  return {
    token,
    user,
    isAuthenticated,
    register,
    login,
    logout,
    fetchCurrentUser
  }
})