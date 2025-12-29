<template>
  <header class="bg-theme-primary sticky top-0 z-40 transition-colors duration-300 border-b border-thistle">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between h-auto">
        <div class="flex items-center space-x-3">
          <button @click="emit('toggle-sidebar')" class="header-icon" aria-label="apri menu laterale" title="Menu">
            <VueFeather type="menu" size="24"></VueFeather>
          </button>
        </div>

        <router-link to="/" class="header-center-title">
          <h1 class="header-title-main text-paynes-gray">BIBLIOMAP</h1>
          <p class="header-subtitle-main text-paynes-gray lowercase">trova libri vicini a te!</p>
        </router-link>

        <div class="flex items-center space-x-3">
          <button @click="toggleTheme" class="header-icon" :aria-label="isDarkTheme ? 'modalità giorno' : 'modalità notte'" title="Cambia Tema">
            <VueFeather :type="isDarkTheme ? 'sun' : 'moon'" size="24"></VueFeather>
          </button>

          <template v-if="authStore.isAuthenticated">
            <div class="relative" v-click-outside="closeUserMenu">
              <button @click="toggleUserMenu" class="header-icon" aria-label="menu utente" title="Profilo">
                <VueFeather type="user" size="24"></VueFeather>
              </button>

              <transition name="fade-slide">
                <div v-if="isUserMenuOpen" class="user-dropdown">
                  <router-link to="/profile" @click="closeUserMenu" class="dropdown-item">
                    <VueFeather type="settings" size="16" class="mr-2"></VueFeather>
                    visualizza profilo
                  </router-link>
                  <button @click="handleLogout" class="dropdown-item text-red-500">
                    <VueFeather type="log-out" size="16" class="mr-2"></VueFeather>
                    logout
                  </button>
                </div>
              </transition>
            </div>
          </template>

          <template v-else>
            <router-link to="/login" class="login-btn-header" aria-label="accedi" title="Accedi">
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
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/authStore"

const authStore = useAuthStore()
const router = useRouter()
const emit = defineEmits(["toggle-sidebar"])

const isDarkTheme = ref(false)
const isUserMenuOpen = ref(false)

// gestione menu utente
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

// gestione logout
async function handleLogout() {
  closeUserMenu()
  await authStore.logout()
  router.push("/")
}

// tema
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
  applyTheme(savedTheme === "dark" || (!savedTheme && prefersDark))
})

// direttiva custom per cliccare fuori (v-click-outside)
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener("click", el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent)
  }
}
</script>

<style scoped>
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

.user-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  width: 200px;
  background-color: var(--bg-primary);
  border: 2px solid var(--thistle);
  border-radius: 1rem;
  padding: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--paynes-gray);
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(152, 182, 177, 0.1); /* ash-gray trasparente */
}

.login-btn-header {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--paynes-gray);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 2px solid var(--ash-gray);
  text-decoration: none;
}

.header-center-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  flex-grow: 1;
}

.header-title-main {
  font-family: "Mochiy Pop P One", cursive;
  font-size: min(3.5em, 5vw);
  line-height: 1;
}

.header-subtitle-main {
  font-family: "Quicksand", sans-serif;
  font-size: min(0.9em, 3vw);
  margin-top: 5px;
}

/* animazione menu */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .header-title-main { font-size: min(2em, 8vw); }
  .login-btn-header { display: none; }
}
</style>