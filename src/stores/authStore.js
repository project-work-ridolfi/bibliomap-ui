import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/apiClient'

export const useAuthStore = defineStore('auth', () => {
  // state
  const userId = ref(localStorage.getItem('userId') || null)
  const user = ref(null)

  // utente autenticato se abbiamo un userId nello store o se carica user
  const isAuthenticated = computed(() => !!userId.value || !!user.value)
  const isLoaded = computed(() => !!user.value) 

  /**
   * imposta ID utente nello store e nel localStorage.
   */
  function setAuth(id) {
    userId.value = id
    localStorage.setItem('userId', id)
  }

  async function register(userData) {
      //  imposta il cookie 
      const response = await apiClient.post('/auth/register', userData) 
      
      // solo userId nel corpo
      if (response && response.userId) {
          setAuth(response.userId) 
          await fetchCurrentUser() 
      } else {
          throw new Error("Dati di autenticazione (userId) non ricevuti.")
      }
  }

  /**
   * Effettua il login e salva l'ID utente.
   */
  async function login(credentials) {
    // invia le credenziali, il be imposta il cookie di sessione
    const response = await apiClient.post('/auth/login', credentials)
    
    if (response && response.userId) {
        setAuth(response.userId) 
        await fetchCurrentUser() 
    } else {
        // se il BE restituisce 204 o una risposta senza userId ma di successo, 
        // tentiamo comunque di caricare l'utente (fetchCurrentUser fallirà con 401 se il cookie non è valido)
        await fetchCurrentUser() 
    }
  }
  
  function logout() {
    try {
        // req per cancellare il cookie SESSION_ID su redis e dal browser
        apiClient.post('/auth/logout') 
    } catch (e) {
        console.warn("logout parziale: impossibile raggiungere l'endpoint di logout del be.")
    }
    
    // cancella lo stato locale
    userId.value = null
    user.value = null
    localStorage.removeItem('userId')
  }


  async function fetchCurrentUser() {
    // prima di chiamare /users/me, l'FE deve assicurare che il BE
    // possa identificare l'utente tramite il cookie
    if (!userId.value) return 
    
    try {
        // /users/me nel BE cerca l'utente tramite SESSION_ID e restituisce i dati.
        const response = await apiClient.get('/users/me')
        user.value = response 
        userId.value = response.id 
    } catch (error) {
        // Se /users/me risponde 401 (cookie scaduto), il apiClient.js chiama logout()
        console.warn("impossibile caricare l'utente corrente.")
    }
  }
  
  // return finale delle azioni e dello stato
  return {
    userId, 
    user,
    isAuthenticated,
    isLoaded,
    setAuth,
    register,
    login, 
    logout,
    fetchCurrentUser
  }
})