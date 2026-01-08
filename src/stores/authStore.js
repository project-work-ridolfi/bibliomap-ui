import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiClient from "@/services/apiClient";

export const useAuthStore = defineStore("auth", () => {
  // recupera userId da localStorage per mantenere lo stato
  const userId = ref(localStorage.getItem("userId") || null);
  const user = ref(null);

  // l'utente è autenticato se abbiamo userId
  const isAuthenticated = computed(() => !!userId.value);

  // helper per ottenere username
  const username = computed(() => user.value?.username || null);

  // Imposta ID utente nello store e nel localStorage.
  function setAuth(id) {
    userId.value = id;
    localStorage.setItem("userId", id);
  }

  // Registrazione nuovo utente
  async function register(userData) {
    const response = await apiClient.post("/auth/register", userData);

    if (response && response.userId) {
      setAuth(response.userId);
      await fetchCurrentUser(); // carica dati completi (username, ecc)
    } else {
      throw new Error("Dati di autenticazione (userId) non ricevuti.");
    }
  }

  // Login utente
  async function login(credentials) {
    const response = await apiClient.post("/auth/login", credentials)

    if (response && response.userId) {
      setAuth(response.userId)
    
      await new Promise(resolve => setTimeout(resolve, 200))
      await fetchCurrentUser()
    }
  }

  //Logout
  async function logout() {
    try {
      // Chiamata al BE per invalidare la sessione
      await apiClient.post("/auth/logout");
    } catch (e) {
      console.warn("Logout lato server fallito, procedo con pulizia locale.");
    }

    // Pulisce lo stato locale e il localStorage
    userId.value = null;
    user.value = null;
    localStorage.removeItem("userId");
  }

  // Recupera i dati dell'utente loggato tramite il cookie di sessione
  async function fetchCurrentUser() {
    if (!userId.value) return
    try {
      const response = await apiClient.get("/users/me")
      user.value = response
      if (response.id) setAuth(response.id)
    } catch (error) {
    // se il server dà 401 durante il caricamento iniziale, puliamo senza chiamare l'API di logout
      console.warn("Sessione non valida.")
      userId.value = null
      user.value = null
      localStorage.removeItem("userId")
    }
  }

  // Se al caricamento dell'app Pinia trova un userId ma non i dati dell'utente,
  // prova a caricarli immediatamente.
  if (userId.value && !user.value) {
    fetchCurrentUser();
  }

  return {
    userId,
    user,
    username,
    isAuthenticated,
    setAuth,
    register,
    login,
    logout,
    fetchCurrentUser,
  };
});
