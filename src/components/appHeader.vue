<template>
  <header
    class="bg-theme-primary sticky top-0 z-40 transition-colors duration-300 border-b border-thistle">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between h-auto">
        <div class="flex items-center space-x-3">
          <button
            @click="emit('toggle-sidebar')"
            class="header-icon"
            aria-label="apri menu laterale"
            title="Menu">
            <VueFeather type="menu" size="24"></VueFeather>
          </button>
        </div>

        <router-link to="/" class="header-center-title">
          <h1 class="header-title-main text-paynes-gray">BIBLIOMAP</h1>
          <p class="header-subtitle-main text-paynes-gray">Trova libri vicini a te!</p>
        </router-link>

        <div class="flex items-center space-x-3">
          <button
            @click="toggleTheme"
            class="header-icon"
            :aria-label="isDarkTheme ? 'modalità giorno' : 'modalità notte'"
            title="Cambia Tema">
            <VueFeather
              :type="isDarkTheme ? 'sun' : 'moon'"
              size="24"></VueFeather>
          </button>

          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/profile"
              class="header-icon"
              aria-label="vai al profilo"
              title="Profilo">
              <VueFeather type="user" size="24"></VueFeather>
            </router-link>
          </template>

          <template v-else>
            <router-link
              to="/login"
              class="login-btn-header"
              aria-label="accedi"
              title="Accedi">
              Accedi
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useAuthStore } from "@/stores/authStore"

const authStore = useAuthStore()
const emit = defineEmits(["toggle-sidebar"])
const isDarkTheme = ref(false)

// applicazione tema e persistenza
const applyTheme = (isDark) => {
  isDarkTheme.value = isDark
  document.documentElement.classList.toggle("dark", isDark)
  localStorage.setItem("theme", isDark ? "dark" : "light")
}

const toggleTheme = () => {
  applyTheme(!isDarkTheme.value)
}

onMounted(() => {
  const savedTheme = localStorage.getItem("theme")
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    applyTheme(true)
  } else {
    applyTheme(false)
  }
})
</script>

<style scoped>
/* icone circolari header */
.header-icon {
  border: 2px solid var(--ash-gray);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--paynes-gray);
  background-color: var(--bg-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

/* pulsante accedi testuale */
.login-btn-header {
  display: none; /* nascosto su mobile */
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--paynes-gray);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 2px solid var(--ash-gray);
  transition: all 0.15s ease;
  text-decoration: none;
}

.login-btn-header:hover {
  background-color: var(--ash-gray);
  color: white;
}

@media (min-width: 1024px) {
  .login-btn-header {
    display: block;
  }
}

/* titoli e testi */
.header-center-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  flex-grow: 1;
  padding: 0 10px;
}

.header-title-main {
  font-family: "Mochiy Pop P One", cursive;
  font-size: min(3.5em, 5vw);
  margin: 0;
  line-height: 1;
  transition: color 0.3s ease;
}

.header-subtitle-main {
  font-family: "Quicksand", sans-serif;
  font-size: min(0.9em, 3vw);
  margin: 5px 0 0 0;
  transition: color 0.3s ease;
}

/* responsività */
@media (max-width: 768px) {
  .header-title-main {
    font-size: min(2em, 8vw);
  }
}
</style>