import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/apiClient'

export const useAuthStore = defineStore('auth', () => {
  // State
  const userId = ref(localStorage.getItem('userId') || null)
  const user = ref(null)

  // Getters
  // l'utente è autenticato se abbiamo un userId nello store o se l'oggetto user è caricato.
  const isAuthenticated = computed(() => !!userId.value || !!user.value)
  const isLoaded = computed(() => !!user.value) /

  // Actions
  /**
   * Imposta l'ID utente nello store e nel localStorage.
   * @param {string} id - L'ID univoco dell'utente.
   */
  function setAuth(id) {
    userId.value = id
    localStorage.setItem('userId', id)
  }

  async function register(userData) {
      // La chiamata POST imposta il cookie nel browser
      const response = await apiClient.post('/auth/register', userData) 
      
      // Ci aspettiamo solo userId nel corpo, e il cookie nell'header
      if (response && response.userId) {
          setAuth(response.userId) 
          await fetchCurrentUser() // Carica i dati dell'utente
      } else {
          throw new Error("Dati di autenticazione (userId) non ricevuti.")
      }
  }

  /**
   * Effettua il login e salva l'ID utente.
   * @param {Object} credentials - Email e password.
   */
  async function login(credentials) {
    // Invia le credenziali.
    // il be impostera il cookie 'access_token' 
    const response = await apiClient.post('/auth/login', credentials)
    
    if (response && response.userId) {
        setAuth(response.userId) 
        // carica i dati completi dell'utente.
        await fetchCurrentUser() 
    } else {
        // se il BE restituisce 204, successo
        // e carichiamo l'utente (fallisce in assenza di cookie).
        await fetchCurrentUser() 
    }
  }

  /**
   * Esegue il logout.
   * TODO: Il backend deve fornire un endpoint per cancellare il cookie 'access_token'.
   */
  function logout() {
    try {
        apiClient.post('/auth/logout') 
    } catch (e) {
        console.warn("Logout parziale: Impossibile raggiungere l'endpoint di logout del BE. Cookie non cancellato.")
    }
    
    // cancella lo stato locale
    userId.value = null
    user.value = null
    localStorage.removeItem('userId')
  }

  /**
   * Recupera i dati dell'utente loggato.
   */
  async function fetchCurrentUser() {
    try {
        const response = await apiClient.get('/users/me')
        // be risponde con i dati dell'utente
        user.value = response 
        userId.value = response.id
    } catch (error) {
        console.warn("Impossibile caricare l'utente corrente. Sessione non valida o scaduta.")
    }
  }

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