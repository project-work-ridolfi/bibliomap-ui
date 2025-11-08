<template>
  <div class="scanner-container">
    <div v-if="!scanning">
      <button 
        @click="startScan"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        📷 Scansiona Codice ISBN
      </button>
    </div>

    <div v-else class="space-y-4">
      <div id="scanner" class="border-2 border-blue-500 rounded-lg overflow-hidden"></div>
      
      <div class="flex gap-2">
        <button 
          @click="stopScan"
          class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          ❌ Ferma Scanner
        </button>
      </div>

      <p class="text-sm text-gray-600 text-center">
        Inquadra il codice a barre ISBN sul retro del libro
      </p>
    </div>

    <!-- Risultato -->
    <div v-if="detectedIsbn" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <p class="text-green-800 font-semibold">✅ ISBN Rilevato:</p>
      <p class="text-2xl font-mono">{{ detectedIsbn }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { startScanner, stopScanner } from '@/services/scannerService'

const emit = defineEmits(['isbn-detected'])

const scanning = ref(false)
const detectedIsbn = ref(null)

async function startScan() {
  scanning.value = true
  detectedIsbn.value = null
  
  await startScanner(
    'scanner',
    (isbn) => {
      detectedIsbn.value = isbn
      scanning.value = false
      emit('isbn-detected', isbn)
    },
    (error) => {
      alert('Errore nell\'attivare la fotocamera: ' + error.message)
      scanning.value = false
    }
  )
}

async function stopScan() {
  await stopScanner()
  scanning.value = false
}
</script>

<style scoped>
#scanner {
  max-width: 500px;
  margin: 0 auto;
}

#scanner :deep(video) {
  width: 100%;
  border-radius: 0.5rem;
}
</style>mkdir -p src/{components,pages,services,stores,router,utils,assets/icons}