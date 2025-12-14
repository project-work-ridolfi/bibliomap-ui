<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main">

    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-display text-theme-main">
          ciao <span class="text-[var(--zomp)]">{{ userData?.username || 'persona cara' }}</span>!
        </h1>
        <p class="opacity-80 text-sm">ecco la panoramica della tua attività</p>
      </div>
      <router-link to="/add-book" 
        class="bg-[var(--zomp)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition transform hover:scale-105 flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> nuovo libro
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div class="md:col-span-2 rounded-2xl shadow-md border border-[var(--thistle)] overflow-hidden bg-theme-primary">
        <div @click="toggleStats" class="p-6 cursor-pointer hover:bg-[var(--bg-secondary)] transition flex justify-between items-center group">
            <h3 class="text-lg font-bold text-theme-main flex items-center group-hover:text-[var(--zomp)]">
              <i class="fa-solid fa-chart-pie mr-2 text-[var(--zomp)]"></i> riepilogo attivita'
            </h3>
            <i class="fa-solid fa-chevron-down transition-transform duration-300" :class="isStatsOpen ? 'rotate-180 text-[var(--zomp)]' : 'text-gray-400'"></i>
        </div>

        <div v-if="!isStatsOpen" class="px-6 pb-6 grid grid-cols-3 gap-4 text-center">
             <div class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--thistle)]/30">
                <div class="text-2xl font-display text-theme-main">{{ quickStats.totalBooks }}</div>
                <div class="text-xs opacity-70 uppercase font-bold tracking-wider">libri</div>
            </div>
            <div class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--thistle)]/30">
                <div class="text-2xl font-display text-[var(--zomp)]">{{ quickStats.activeLoans }}</div>
                <div class="text-xs opacity-70 uppercase font-bold tracking-wider">in prestito</div>
            </div>
            <div class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--thistle)]/30">
                <div class="text-2xl font-display text-[var(--tea-rose)]">{{ quickStats.pendingRequests }}</div>
                <div class="text-xs opacity-70 uppercase font-bold tracking-wider">richieste</div>
            </div>
        </div>
      </div>

      <div class="bg-theme-primary p-6 rounded-2xl shadow-md border border-[var(--thistle)] flex flex-col justify-between">
        <div>
            <h3 class="text-lg font-bold text-theme-main mb-2">visibilita' mappa</h3>
            <div v-if="userData?.id" class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[var(--zomp)] text-[var(--zomp)]">
                    <i class="fa-solid fa-eye"></i>
                </div>
                <div>
                    <p class="font-bold text-sm text-theme-main">profilo attivo</p>
                    <p class="text-xs opacity-70">visibilita': {{ userData.visibility || 'standard' }}</p>
                </div>
            </div>
        </div>
        <router-link to="/set-location" class="text-center text-sm text-[var(--zomp)] font-bold hover:underline border-t border-[var(--thistle)] pt-3 mt-4">
            modifica posizione <i class="fa-solid fa-arrow-right ml-1"></i>
        </router-link>
      </div>
    </div>

    <div v-if="pendingRequests.length > 0" class="bg-[var(--tea-rose)]/20 border-l-4 border-[var(--tea-rose)] p-4 rounded-r-xl">
        <h3 class="font-bold text-theme-main mb-3 flex items-center">
            <i class="fa-solid fa-bell mr-2 text-[var(--tea-rose)]"></i> richieste da gestire ({{ pendingRequests.length }})
        </h3>
        <div class="space-y-2">
            <div v-for="req in pendingRequests" :key="req.id" class="flex justify-between items-center bg-theme-primary p-3 rounded-lg shadow-sm border border-[var(--thistle)]/50">
                <div class="text-sm">
                    <span class="font-bold text-theme-main">{{ req.requesterName }}</span> desidera 
                    <span class="italic text-[var(--zomp)]">{{ req.title }}</span>
                </div>
                <div class="flex gap-2">
                    <button @click="handleLoanStatus(req.id, 'REJECT')" class="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                        <i class="fa-solid fa-times"></i>
                    </button>
                    <button @click="handleLoanStatus(req.id, 'ACCEPT')" class="text-[var(--zomp)] hover:bg-green-50 p-2 rounded-full transition">
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <hr class="border-[var(--thistle)]">

    <div>
        <div class="flex justify-between items-end mb-6">
            <h2 class="text-2xl font-display text-theme-main">le tue librerie</h2>
            <router-link to="/create-library" class="text-sm text-[var(--zomp)] font-bold hover:underline">
                <i class="fa-solid fa-plus mr-1"></i> crea nuova
            </router-link>
        </div>
        
        <div v-if="isLoadingLibs" class="text-center py-10 opacity-60">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
        </div>

        <div v-else class="space-y-4">
            <div v-for="lib in libraries" :key="lib.id" 
                class="bg-theme-primary rounded-xl shadow-sm border border-[var(--thistle)] overflow-hidden">
                
                <div @click="toggleLibrary(lib.id)" 
                    class="p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition">
                    
                    <div class="flex items-center gap-4 flex-grow">
                        <div class="w-10 h-10 rounded-lg bg-[var(--paynes-gray)] text-white flex items-center justify-center">
                            <i class="fa-solid fa-book-bookmark"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-theme-main">{{ lib.name }}</h3>
                            <p class="text-xs opacity-60 uppercase tracking-widest">libreria personale</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <router-link :to="`/libraries/${lib.id}/edit`" @click.stop class="text-gray-400 hover:text-[var(--zomp)] transition">
                            <i class="fa-solid fa-gear"></i>
                        </router-link>
                        <i class="fa-solid fa-chevron-down transition-transform duration-300 text-gray-300" 
                           :class="{'rotate-180 text-[var(--zomp)]': lib.isOpen}"></i>
                    </div>
                </div>

                <div v-if="lib.isOpen" class="bg-[var(--bg-secondary)]/50 border-t border-[var(--thistle)] p-4 animate-fade-in">
                    <div v-if="lib.isLoadingBooks" class="text-center py-4"><i class="fa-solid fa-circle-notch fa-spin"></i></div>
                    <div v-else-if="lib.books.length === 0" class="text-center py-4 text-sm opacity-60 italic">
                        nessun libro presente in questa libreria.
                    </div>
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div v-for="book in lib.books" :key="book.id" class="flex gap-3 bg-theme-primary p-3 rounded-lg border border-[var(--thistle)] group relative">
                            <div class="w-12 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                                <img v-if="book.coverUrl" :src="book.coverUrl" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-grow min-w-0">
                                <h4 class="font-bold text-theme-main truncate text-sm">{{ book.title }}</h4>
                                <span class="text-[10px] uppercase font-bold opacity-60">{{ book.status }}</span>
                            </div>
                            <router-link :to="`/books/${book.id}`" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-[var(--zomp)]">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiClient } from '@/services/apiClient'

const userData = ref(null)
const isLoadingLibs = ref(true)
const libraries = ref([])
const pendingRequests = ref([])
const activeLoansCount = ref(0)
const isStatsOpen = ref(false)

// statistiche rapide: sommano il bookCount ritornato dal BE per ogni libreria
const quickStats = computed(() => {
    const total = libraries.value.reduce((acc, lib) => {
        // usa il conteggio inviato dal BE nell'elenco librerie, se non c'è usa la lunghezza array libri caricata
        return acc + (lib.bookCount !== undefined ? lib.bookCount : (lib.books.length || 0))
    }, 0)
    
    return {
        totalBooks: total,
        activeLoans: activeLoansCount.value,
        pendingRequests: pendingRequests.value.length
    }
})

onMounted(async () => {
    // caricamento dati parallelo
    await Promise.all([
        fetchUserMe(),
        fetchLibraries(),
        fetchIncomingRequests(),
        fetchActiveLoans()
    ])
})

async function fetchUserMe() {
    try {
        userData.value = await apiClient.get('/users/me')
    } catch (e) {
        console.warn("errore caricamento profilo")
    }
}

async function fetchLibraries() {
    isLoadingLibs.value = true
    try {
        const res = await apiClient.get('/users/me/libraries')
        // il BE torna { libraries: [...], count: X }
        const data = res.libraries || []
        libraries.value = data.map(l => ({ 
            ...l, 
            isOpen: false, 
            books: [], 
            isLoadingBooks: false,
            // inizializza col conteggio metadati se disponibile nell'elenco generale
            bookCount: l.count || 0 
        }))
    } catch (e) {
        console.error("errore librerie")
    } finally {
        isLoadingLibs.value = false
    }
}

async function fetchIncomingRequests() {
    try {
        pendingRequests.value = await apiClient.get('/loan/requests/incoming') || []
    } catch (e) {
        console.error("errore richieste")
    }
}

async function fetchActiveLoans() {
    try {
        // chiama l'api che restituisce i prestiti in corso
        const res = await apiClient.get('/loan/active')
        activeLoansCount.value = Array.isArray(res) ? res.length : 0
    } catch (e) {
        console.error("errore prestiti attivi")
    }
}

async function handleLoanStatus(loanId, action) {
    try {
        await apiClient.patch(`/loan/${loanId}/status`, { action })
        pendingRequests.value = pendingRequests.value.filter(r => r.id !== loanId)
        // ricarica i prestiti se accettato per aggiornare contatore
        if(action === 'ACCEPT') fetchActiveLoans()
    } catch (e) {
        alert("errore aggiornamento")
    }
}

async function toggleLibrary(libId) {
    const lib = libraries.value.find(l => l.id === libId)
    lib.isOpen = !lib.isOpen
    if (lib.isOpen && lib.books.length === 0) {
        lib.isLoadingBooks = true
        try {
            const res = await apiClient.get(`/libraries/${libId}`)
            lib.books = res.books || []
            // aggiorna il conteggio reale dopo il caricamento dettagliato
            lib.bookCount = lib.books.length
        } finally {
            lib.isLoadingBooks = false
        }
    }
}

const toggleStats = () => isStatsOpen.value = !isStatsOpen.value
</script>