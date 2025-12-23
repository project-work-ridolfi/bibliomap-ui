<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black/50 z-40 transition-opacity"
      aria-hidden="true"></div>
  </Transition>

  <Transition name="slide">
    <aside
      v-if="isOpen"
      class="fixed top-0 left-0 h-full w-72 bg-theme-primary shadow-2xl z-50 overflow-y-auto border-r border-thistle transition-colors duration-300"
      role="navigation">
      
      <div class="flex items-center justify-between p-6 border-b border-thistle">
        <h2 class="sidebar-title">
          Menu
        </h2>
        <button
          @click="emit('close')"
          class="sidebar-close-btn"
          aria-label="chiudi menu">
          <VueFeather type="x" size="20"></VueFeather>
        </button>
      </div>

      <nav class="p-4 flex flex-col gap-2">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          @click="emit('close')"
          class="nav-link"
          active-class="nav-link-active">
          <VueFeather :type="item.icon" size="20" class="nav-icon"></VueFeather>
          <span class="font-medium">{{ item.label }}</span>
        </router-link>
      </nav>

      <div v-if="authStore.isAuthenticated" class="absolute bottom-0 left-0 right-0 p-6 border-t border-thistle bg-theme-primary">
        <button
          @click="handleLogout"
          class="logout-btn">
          <VueFeather type="log-out" size="20"></VueFeather>
          <span class="font-bold uppercase tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])
const router = useRouter()
const authStore = useAuthStore()

// mappatura rotte per menu
const menuItems = computed(() => {
  const items = [{ path: '/', label: 'Home', icon: 'home' }]

  if (authStore.isAuthenticated) {
    items.push(
      { path: '/dashboard', label: 'Dashboard', icon: 'grid' },
      { path: '/map', label: 'Mappa', icon: 'map-pin' },
      { path: '/library', label: 'Le mie Librerie', icon: 'book-open' },
      { path: '/add-book', label: 'Aggiungi Libro', icon: 'plus-circle' },
      { path: '/profile', label: 'Profilo', icon: 'user' }
    )
  } else {
    items.push(
      { path: '/signup', label: 'Registrati', icon: 'user-plus' },
      { path: '/login', label: 'Accedi', icon: 'log-in' }
    )
  }
  return items
})

// gestione logout
async function handleLogout() {
  await authStore.logout()
  emit('close')
  router.push('/')
}
</script>

<style scoped>
/* titolo dinamico basato su paynes-gray */
.sidebar-title {
  font-family: "Mochiy Pop P One", cursive;
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--paynes-gray);
  transition: color 0.3s ease;
}

/* bottone chiusura con bordi dinamici */
.sidebar-close-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ash-gray);
  color: var(--paynes-gray);
  background: transparent;
  transition: all 0.3s ease;
}

.sidebar-close-btn:hover {
  background-color: rgba(152, 182, 177, 0.2);
}

/* link navigazione base */
.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  border-radius: 0.75rem;
  color: var(--paynes-gray);
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-icon {
  color: var(--zomp);
}

/* stati dark mode per icone e hover */
html.dark .nav-icon {
  color: var(--tea-rose);
}

.nav-link:hover {
  background-color: rgba(152, 182, 177, 0.2);
}

/* link attivo */
.nav-link-active {
  background-color: var(--zomp) !important;
  color: white !important;
}

.nav-link-active .nav-icon {
  color: white !important;
}

/* bottone logout */
.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  border: 2px solid #ef4444;
  color: #ef4444;
  background: transparent;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #ef4444;
  color: white;
}

/* animazioni transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}
</style>