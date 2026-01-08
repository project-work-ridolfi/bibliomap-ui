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
    // Il backend imposta il cookie di sessione HTTP-only
    const response = await apiClient.post("/auth/login", credentials);

    if (response && response.userId) {
      setAuth(response.userId);
      setTimeout(async () => {
        await fetchCurrentUser()
      }, 100)
    } else {
      // Fallback: se il BE non manda il corpo ma il cookie è settato
      await fetchCurrentUser();
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
    if (!userId.value) return;

    try {
      // Chiamata all'endpoint protetto
      const response = await apiClient.get("/users/me");
      user.value = response;

      // Sincronizza userId
      if (response.id) {
        setAuth(response.id);
      }
    } catch (error) {
      console.warn("Sessione non valida o scaduta. Eseguo logout.");
      // se il server risponde 401/403, resettiamo lo store locale
      userId.value = null;
      user.value = null;
      localStorage.removeItem("userId");
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
