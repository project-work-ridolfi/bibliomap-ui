<template>
  <div id="app" class="min-h-screen flex flex-col">
    <a href="#main-content" class="skip-link">
      salta al contenuto principale
    </a>

    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <main id="main-content" role="main" class="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
      <router-view />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppFooter from '@/components/AppFooter.vue'

const authStore = useAuthStore()
const sidebarOpen = ref(false)

onMounted(async () => {
  // inizializzazione sessione utente
  if (authStore.token) {
    await authStore.fetchCurrentUser()
  }
})
</script>