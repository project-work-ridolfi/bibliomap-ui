<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">

    <button 
      @click="goBack" 
      class="flex items-center text-paynes-gray hover:text-zomp transition-colors font-medium mb-4">
      <i class="fa-solid fa-arrow-left mr-2"></i> Torna indietro
    </button>

    <div v-if="isLoading" class="text-center py-10 text-paynes-gray/70">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl mb-2"></i>
      <p>recupero dettagli libro...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
      <p class="text-red-700 font-medium">errore: {{ error }}</p>
      <button @click="fetchBookDetails" class="mt-2 underline text-sm text-paynes-gray">riprova</button>
    </div>

    <div v-else-if="book" class="bg-white shadow-xl rounded-2xl border-2 border-thistle overflow-hidden">
      
      <div class="md:grid md:grid-cols-3">
        
        <div class="bg-ash-gray/10 p-6 md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-thistle">
          <div class="relative w-48 h-72 shadow-lg rounded-lg overflow-hidden bg-white">
            <img 
              v-if="book.coverUrl" 
              :src="book.coverUrl" 
              alt="Copertina Libro" 
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-paynes-gray/10 text-paynes-gray">
              <i class="fa-solid fa-book text-4xl opacity-50"></i>
            </div>
          </div>

          <div class="mt-6">
            <span 
              :class="statusBadgeClass"
              class="px-4 py-2 rounded-full text-sm font-bold shadow-sm border">
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <div class="p-6 md:col-span-2 flex flex-col justify-between space-y-6">
          
          <div>
            <h1 class="text-3xl font-display text-paynes-gray mb-1">{{ book.title }}</h1>
            <h2 class="text-xl text-paynes-gray/80 font-medium">{{ book.author }}</h2>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-bold uppercase tracking-wider text-paynes-gray/60 border-b border-thistle pb-1">Dettagli</h3>
            <ul class="text-paynes-gray space-y-2 text-sm">
              <li class="flex items-center">
                <i class="fa-solid fa-calendar-days w-6 text-center mr-2 text-zomp"></i>
                <span>Anno: <strong>{{ book.publicationYear || 'N/D' }}</strong></span>
              </li>
              <li class="flex items-center">
                <i class="fa-solid fa-language w-6 text-center mr-2 text-zomp"></i>
                <span>Lingua: <strong>{{ book.language || 'Italiano' }}</strong></span>
              </li>
              <li class="flex items-center">
                <i class="fa-solid fa-location-dot w-6 text-center mr-2 text-zomp"></i>
                <span>Libreria: <strong>{{ book.libraryName }}</strong></span>
              </li>
               <li class="flex items-center">
                <i class="fa-solid fa-heart-pulse w-6 text-center mr-2 text-zomp"></i>
                <span>Condizioni: <strong>{{ book.condition }}</strong></span>
              </li>
            </ul>
          </div>

          <div v-if="book.tags && book.tags.length > 0">
             <h3 class="text-sm font-bold uppercase tracking-wider text-paynes-gray/60 border-b border-thistle pb-1 mb-2">Tag</h3>
             <div class="flex flex-wrap gap-2">
                <span v-for="tag in book.tags" :key="tag" 
                  class="px-3 py-1 bg-ash-gray/30 text-paynes-gray text-xs rounded-full border border-thistle/50">
                  #{{ tag }}
                </span>
             </div>
          </div>

          <div v-if="book.ownerNotes" class="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-gray-600 italic">
            <i class="fa-solid fa-quote-left text-yellow-400 mr-2"></i>
            {{ book.ownerNotes }}
          </div>

          <div class="pt-4 border-t border-thistle flex justify-end">
            
            <div v-if="isOwner" class="flex space-x-3">
               <button title="Modifica" class="p-3 text-paynes-gray hover:bg-ash-gray/20 rounded-lg transition">
                  <i class="fa-solid fa-pen-to-square text-lg"></i>
               </button>
               <button title="Sposta in altra libreria" class="p-3 text-paynes-gray hover:bg-ash-gray/20 rounded-lg transition">
                  <i class="fa-solid fa-arrow-right-from-bracket text-lg"></i>
               </button>
               <button @click="deleteBook" title="Elimina" class="p-3 text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200">
                  <i class="fa-solid fa-trash text-lg"></i>
               </button>
            </div>

            <div v-else>
              <button 
                v-if="book.status === 'available'"
                @click="requestLoan"
                class="bg-zomp text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-opacity-90 transition transform hover:-translate-y-0.5 flex items-center">
                <i class="fa-solid fa-hand-holding-heart mr-2"></i>
                Chiedi in Prestito
              </button>
              <button 
                v-else 
                disabled 
                class="bg-ash-gray text-white px-6 py-3 rounded-xl font-bold cursor-not-allowed opacity-70">
                Non Disponibile
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore' 
import { apiClient } from '@/services/apiClient' 

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// --- stati ---
const book = ref(null)
const isLoading = ref(true)
const error = ref(null)

// --- computed ---

// determina se l'utente loggato è il proprietario
const isOwner = computed(() => {
  if (!book.value || !authStore.userId) return false
  return book.value.ownerId === authStore.userId
})

// gestisce classi css per il badge stato
const statusBadgeClass = computed(() => {
  if (!book.value) return ''
  if (book.value.status === 'available') {
    return 'bg-green-100 text-green-800 border-green-200' 
  } else {
    return 'bg-orange-100 text-orange-800 border-orange-200'
  }
})

// label leggibile dello stato
const statusLabel = computed(() => {
    if (!book.value) return ''
    return book.value.status === 'available' ? 'Disponibile' : 'In Prestito'
})

// --- funzioni ---

// navigazione indietro
function goBack() {
  router.back()
}

async function fetchBookDetails() {
    isLoading.value = true
  const bookId = route.params.id 

  console.log("Sto cercando il libro con ID:", bookId) 

  try {
    // CHIAMATA AL BACKEND CON L'ID
    const response = await apiClient.get(`/books/${bookId}`)
    
    // Assegna la risposta
    book.value = response 

  } catch (err) {
    console.error("Errore fetch:", err)
} finally {
    isLoading.value = false
  }
}

// azione: richiedi prestito (visitatore)
async function requestLoan() {
    if(!confirm("Vuoi inviare una richiesta di prestito al proprietario?")) return
    
    try {
        // [apiClient.post(`/loans/request`, { bookId: book.value.id })]
        alert("Richiesta inviata! Il proprietario riceverà una notifica.")
    } catch (e) {
        alert("Errore nell'invio della richiesta.")
    }
}

// azione: elimina libro (proprietario)
async function deleteBook() {
    if(!confirm("Sei sicuro? Questa azione è irreversibile.")) return

    try {
        // [apiClient.delete(`/books/${book.value.id}`)]
        alert("Libro eliminato.")
        router.push('/dashboard') // o alla lista libreria
    } catch (e) {
        alert("Errore durante l'eliminazione.")
    }
}

// caricamento iniziale
onMounted(() => {
  fetchBookDetails()
})

</script>