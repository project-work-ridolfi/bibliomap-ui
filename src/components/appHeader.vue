<template>
  <header class="bg-theme-primary sticky top-0 z-40 border-b border-thistle">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="flex items-center justify-between h-auto">
        <div class="flex items-center space-x-3">
          <button @click="emit('toggle-sidebar')" class="header-icon" title="Menu">
            <VueFeather type="menu" size="24"></VueFeather>
          </button>
        </div>

        <router-link to="/" class="header-center-title">
          <h1 class="header-title-main text-paynes-gray uppercase">BIBLIOMAP</h1>
        </router-link>

        <div class="flex items-center space-x-3">
          <button @click="toggleTheme" class="header-icon" title="Cambia Tema">
            <VueFeather :type="isDarkTheme ? 'sun' : 'moon'" size="24"></VueFeather>
          </button>

          <template v-if="authStore.isAuthenticated">
            <div class="relative" v-click-outside="closeUserMenu">
              <button @click="toggleUserMenu" class="header-icon" title="Profilo">
                <VueFeather type="user" size="24"></VueFeather>
              </button>

              <transition name="fade-slide">
                <div v-if="isUserMenuOpen" class="user-dropdown">
                  <div class="user-info-header">
                    <span class="username-display">
                      CIAO, {{ authStore.user?.username || authStore.username || 'utente' }}
                    </span>
                  </div>
                  
                  <div class="dropdown-divider"></div>

                  <router-link :to="`/profile/${authStore.userId}`" @click="closeUserMenu" class="dropdown-item">
                    <VueFeather type="settings" size="16" class="icon-margin"></VueFeather>
                    visualizza profilo
                  </router-link>
                  
                  <button @click="handleLogout" class="dropdown-item text-red-500">
                    <VueFeather type="log-out" size="16" class="icon-margin"></VueFeather>
                    logout
                  </button>
                </div>
              </transition>
            </div>
          </template>

          <template v-else>
            <router-link to="/login" class="login-btn-header">
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

const toggleUserMenu = () => { isUserMenuOpen.value = !isUserMenuOpen.value }
const closeUserMenu = () => { isUserMenuOpen.value = false }

async function handleLogout() {
  closeUserMenu()
  await authStore.logout()
  router.push("/")
}

const applyTheme = (isDark) => {
  isDarkTheme.value = isDark
  document.documentElement.classList.toggle("dark", isDark)
  localStorage.setItem("theme", isDark ? "dark" : "light")
}

const toggleTheme = () => applyTheme(!isDarkTheme.value)

onMounted(() => {
  const savedTheme = localStorage.getItem("theme")
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  applyTheme(savedTheme === "dark" || (!savedTheme && prefersDark))
})

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
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background-color: var(--bg-primary);
  border: 2px solid var(--thistle);
  border-radius: 1rem;
  padding: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.user-info-header {
  padding: 0.8rem 1rem 0.6rem 1rem;
}

.username-display {
  color: var(--zomp);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dropdown-divider {
  height: 2px;
  background-color: var(--thistle);
  margin: 0.25rem 0.75rem 0.75rem 0.75rem;
  opacity: 0.5;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--paynes-gray);
  border-radius: 0.6rem;
  transition: background-color 0.2s;
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(152, 182, 177, 0.1);
}

.icon-margin {
  margin-right: 0.85rem;
}

.login-btn-header {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--paynes-gray);
  padding: 0.4rem 1rem;
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
  /* dimezzato */
  font-size: min(1.75em, 5vw);
  margin: 0;
  line-height: 1;
}

.header-subtitle-main {
  font-family: "Quicksand", sans-serif;
  /* ridotto */
  font-size: min(0.65em, 3vw);
  margin-top: 2px;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .header-title-main { font-size: min(1.3em, 8vw); }
  .login-btn-header { display: none; }
}
</style>