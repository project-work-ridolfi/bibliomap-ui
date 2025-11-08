<template>
  <div class="text-center py-12">
    <h1 class="text-4xl font-bold mb-4">
      Benvenuto su BiblioMap
    </h1>
    <p class="text-xl text-gray-600 mb-8">
      Scopri e condividi biblioteche private nella tua zona
    </p>
    
    <div v-if="!authStore.isAuthenticated" class="flex gap-4 justify-center">
      <router-link 
        to="/signup"
        class="bg-primary-700 text-white px-6 py-3 rounded-lg hover:bg-primary-800"
      >
        Registrati
      </router-link>
      <router-link 
        to="/login"
        class="border border-primary-700 text-primary-700 px-6 py-3 rounded-lg hover:bg-primary-50"
      >
        Accedi
      </router-link>
    </div>
    
    <router-link 
      v-else
      to="/map"
      class="inline-block bg-primary-700 text-white px-6 py-3 rounded-lg hover:bg-primary-800"
    >
      Esplora la Mappa
    </router-link>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>