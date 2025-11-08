<template>
  <!-- Overlay scuro (cliccabile per chiudere) -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      aria-hidden="true"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <Transition name="slide">
    <aside
      v-if="isOpen"
      class="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 overflow-y-auto"
      role="navigation"
      aria-label="Menu principale"
    >
      <!-- Header Sidebar -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-bold text-gray-800">Menu</h2>
        <button
          @click="emit('close')"
          class="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Chiudi menu"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Menu Items -->
      <nav class="p-4 space-y-2">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          @click="emit('close')"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition"
          active-class="bg-primary-100 text-primary-700 font-semibold"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Footer Sidebar (Logout) -->
      <div v-if="authStore.isAuthenticated" class="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <span class="text-xl">🚪</span>
          <span>Logout</span>
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

const menuItems = computed(() => {
  const baseItems = [
    { path: '/', label: 'Home', icon: '🏠' },
  ]

  if (authStore.isAuthenticated) {
    return [
      ...baseItems,
      { path: '/map', label: 'Mappa', icon: '🗺️' },
      { path: '/add-book', label: 'Aggiungi Libro', icon: '📚' },
      { path: '/profile', label: 'Profilo', icon: '👤' },
    ]
  } else {
    return [
      ...baseItems,
      { path: '/signup', label: 'Registrati', icon: '✨' },
      { path: '/login', label: 'Accedi', icon: '🔑' },
    ]
  }
})

function handleLogout() {
  authStore.logout()
  emit('close')
  router.push('/')
}
</script>

<style scoped>
/* Animazione Fade per overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animazione Slide per sidebar */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>