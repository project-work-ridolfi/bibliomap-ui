<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold mb-6">Accedi</h1>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium mb-1">
          Username
        </label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-primary-700 text-white py-2 rounded-lg hover:bg-primary-800"
      >
        Accedi
      </button>
    </form>

    <p class="mt-4 text-center text-sm">
      Non hai un account?
      <router-link to="/signup" class="text-primary-700 hover:underline">
        Registrati
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

async function handleSubmit() {
  try {
    await authStore.login(form.value)
    router.push('/map')
  } catch (error) {
    alert('Errore durante il login: ' + error.message)
  }
}
</script>