<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow-xl rounded-2xl border-2 border-thistle">
    <h1 class="text-3xl font-display text-center text-paynes-gray mb-6">
      ACCEDI
    </h1>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium mb-1 text-paynes-gray">
          Email *
        </label>
        <input
          id="email"
          v-model="form.email"
          type="text"
          required
          placeholder="nome@dominio.it"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp transition duration-150"
        />
        <p
          v-if="!isEmailValid && form.email.length > 0"
          class="text-xs text-red-500 mt-1">
          Inserisci un formato email valido.
        </p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium mb-1 text-paynes-gray">
          Password *
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp transition duration-150"
        />
      </div>
      
      <div class="text-right">
        <button
          type="button"
          @click="forgotPassword"
          class="text-sm text-zomp hover:text-paynes-gray transition duration-150 underline"
        >
          Password Dimenticata?
        </button>
      </div>

      <button
        type="submit"
        class="w-full bg-zomp text-white py-2 rounded-lg hover:bg-paynes-gray transition duration-150 font-bold text-lg"
      >
        Accedi
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-paynes-gray">
      Non hai un account?
      <router-link to="/signup" class="text-zomp hover:text-paynes-gray font-semibold transition duration-150">
        Registrati
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/services/apiClient'
import { validateEmailFormat } from '@/utils/helpers' 
const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '', 
  password: ''
})

const isEmailValid = computed(() => {
    if (form.value.email.length === 0) return true;
    return validateEmailFormat(form.value.email);
})

async function handleSubmit() {
  const payload = {
      email: form.value.email, 
      password: form.value.password
  }

  try {
    await authStore.login(payload) 
    
    router.push('/') 
  } catch (error) {
    // gestione errori lanciati da apiClient.js (es. 401 Unauthorized)
    const errorMessage = error.message || 'Verifica le credenziali e riprova.';
    alert('Errore durante il login: ' + errorMessage)
  }
}

function forgotPassword() {
  alert('Funzione di recupero password non ancora implementata. Contatta l\'assistenza.')
}
</script>