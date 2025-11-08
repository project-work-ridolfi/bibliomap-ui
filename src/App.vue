<template>
  <div id="app" class="min-h-screen flex flex-col bg-gray-50">
    <!-- Skip link per accessibilità -->
    <a href="#main-content" class="skip-link">
      Salta al contenuto principale
    </a>

    <!-- Header -->
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <!-- Sidebar -->
    <AppSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <main id="main-content" role="main" class="flex-1 max-w-7xl w-full mx-auto px-4 py-8 bg-theme-primary">
      <router-view />
    </main>

    <!-- Footer -->
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
  if (authStore.token) {
    await authStore.fetchCurrentUser()
  }
})
</script>