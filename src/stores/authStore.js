import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/apiClient'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('token') || null)
  const userId = ref(localStorage.getItem('userId') || null)
  const user = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isLoaded = computed(() => !!user.value)

  // Actions
  function setAuth(jwtToken, id) {
    token.value = jwtToken
    userId.value = id
    localStorage.setItem('token', jwtToken)
    localStorage.setItem('userId', id)
  }

async function register(userData) {
    const response = await apiClient.post('/auth/register', userData) 
    
    if (response && response.token && response.userId) {
        setAuth(response.token, response.userId) // salva token e ID
        await fetchCurrentUser()
    } else {
        throw new Error("Dati di autenticazione non ricevuti.")
    }
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
    localStorage.removeItem('userId')
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
    setAuth,
    register,
    login,
    logout,
    fetchCurrentUser
  }
})