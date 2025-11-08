<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Profilo Utente</h1>
    
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center text-3xl">
          👤
        </div>
        <div>
          <h2 class="text-xl font-semibold">{{ authStore.user?.username || 'Utente' }}</h2>
          <p class="text-gray-600">{{ authStore.user?.email || 'email@example.com' }}</p>
        </div>
      </div>

      <!-- Tabs placeholder -->
      <div class="border-t pt-6">
        <div class="flex gap-4 mb-4">
          <button class="px-4 py-2 border-b-2 border-primary-700 text-primary-700 font-medium">
            I miei libri
          </button>
          <button class="px-4 py-2 text-gray-600 hover:text-gray-800">
            Privacy
          </button>
          <button class="px-4 py-2 text-gray-600 hover:text-gray-800">
            Statistiche
          </button>
        </div>

        <div class="bg-gray-50 rounded p-8 text-center text-gray-600">
          <p>📚 I tuoi libri appariranno qui</p>
          <router-link 
            to="/add-book"
            class="inline-block mt-4 bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800"
          >
            Aggiungi primo libro
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>