<template>
  <header class="bg-theme-primary sticky top-0 z-40 border-b border-thistle">
    <div class="max-w-7xl mx-auto px-4 py-3">
      <div class="relative flex items-center justify-between h-10">
        <div class="flex items-center w-1/3 justify-start">
          <!-- Bottone per aprire/chiudere la sidebar -->
          <button
            @click="emit('toggle-sidebar')"
            class="header-icon"
            title="Menu"
            aria-label="Apri menu">
            <VueFeather type="menu" size="24"></VueFeather>
          </button>
        </div>

        <router-link
          to="/"
          class="header-center-title absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          aria-label="Home">
          <h1
            class="header-title-main text-paynes-gray dark:!text-zomp uppercase tracking-tighter">
            BIBLIOMAP
          </h1>
        </router-link>

        <div class="flex items-center w-1/3 justify-end space-x-3">
          <!-- Bottone per cambiare tema -->
          <button 
            @click="toggleTheme" 
            class="header-icon" 
            title="Cambia Tema"
            :aria-label="isDarkTheme ? 'Modalità chiara' : 'Modalità scura'">
            <VueFeather
              :type="isDarkTheme ? 'sun' : 'moon'"
              size="24"></VueFeather>
          </button>

          <template v-if="authStore.isAuthenticated">
            <div class="relative" v-click-outside="closeUserMenu">
              <!-- Bottone per aprire il menu utente -->
              <button
                @click="toggleUserMenu"
                class="header-icon"
                title="Profilo"
                aria-label="Menu utente">
                <VueFeather type="user" size="24"></VueFeather>
              </button>

              <transition name="fade-slide">
                <div v-if="isUserMenuOpen" class="user-dropdown">
                  <div class="user-info-header">
                    <!-- Mostra il nome utente -->
                    <span class="username-display uppercase">
                      CIAO
                      {{
                        authStore.user?.username ||
                        authStore.username ||
                        "utente"
                      }}
                    </span>
                  </div>

                  <!-- Linea di demarcazione extra per separare dal resto -->
                  <div class="dropdown-divider my-3"></div>

                  <router-link
                    :to="`/profile/${authStore.userId}`"
                    @click="closeUserMenu"
                    class="dropdown-item"
                    aria-label="Visualizza profilo">
                    <VueFeather
                      type="settings"
                      size="16"
                      class="icon-margin mr-2"></VueFeather>
                    visualizza profilo
                  </router-link>

                  <button
                    @click="handleLogout"
                    class="dropdown-item text-red-500"
                    aria-label="Logout">
                    <VueFeather
                      type="log-out"
                      size="16"
                      class="icon-margin mr-2"></VueFeather>
                    logout
                  </button>
                </div>
              </transition>
            </div>
          </template>

          <template v-else>
            <!-- Bottone login -->
            <router-link to="/login" class="login-btn-header" aria-label="Accedi">
              Accedi
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

// Store per autenticazione
const authStore = useAuthStore();
const router = useRouter();
const emit = defineEmits(["toggle-sidebar"]);

const isDarkTheme = ref(false); // Stato tema
const isUserMenuOpen = ref(false); // Stato menu utente

// Toggle menu utente
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};
// Chiude menu utente
const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

// Logout utente
async function handleLogout() {
  closeUserMenu();
  await authStore.logout();
  router.push("/");
}

// Applica tema
const applyTheme = (isDark) => {
  isDarkTheme.value = isDark;
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

// Toggle tema
const toggleTheme = () => applyTheme(!isDarkTheme.value);

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchCurrentUser(); // Recupera dati utente se mancanti
  }

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(savedTheme === "dark" || (!savedTheme && prefersDark));
});

// Direttiva click fuori
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
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

.username-display {
  color: var(--zomp);
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
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
  background: transparent;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(152, 182, 177, 0.1);
}

.login-btn-header {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--paynes-gray);
  padding: 0.4rem 1.2rem;
  border-radius: 0.8rem;
  border: 2px solid var(--ash-gray);
  text-decoration: none;
}

.header-title-main {
  font-family: "Shadows Into Light Two", cursive;
  font-size: min(1.75em, 5vw);
  margin: 0;
  line-height: 1;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .header-title-main {
    font-size: min(1.3em, 8vw);
  }
  .login-btn-header {
    display: none;
  }
}
</style>
