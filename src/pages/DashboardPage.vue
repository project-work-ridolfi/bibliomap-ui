<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main">

    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-display text-theme-main">
          Bentornato, <span class="text-[var(--zomp)]">{{ userData?.username || '...' }}</span>
        </h1>
        <p class="opacity-80 text-sm">Panoramica del tuo account.</p>
      </div>
      <router-link to="/add-book" 
        class="bg-[var(--zomp)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition transform hover:scale-105 flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Nuovo Libro
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div 
        class="md:col-span-2 rounded-2xl shadow-md border border-[var(--thistle)] overflow-hidden transition-all duration-300 bg-theme-primary"
        :class="isStatsOpen ? 'row-span-2' : ''">
        
        <div 
            @click="toggleStats"
            class="p-6 cursor-pointer hover:bg-[var(--bg-secondary)] transition flex justify-between items-center group">
            <h3 class="text-lg font-bold text-theme-main flex items-center group-hover:text-[var(--zomp)]">
              <i class="fa-solid fa-chart-pie mr-2 text-[var(--zomp)]"></i> Le tue Attività
            </h3>
            <i class="fa-solid fa-chevron-down transition-transform duration-300"
               :class="isStatsOpen ? 'rotate-180 text-[var(--zomp)]' : 'text-gray-400'"></i>
        </div>

        <div v-if="isStatsOpen" class="p-6 border-t border-[var(--thistle)] bg-[var(--bg-secondary)] animate-fade-in">
            
            <div v-if="isLoadingStats" class="text-center py-8 opacity-60">
                <i class="fa-solid fa-circle-notch fa-spin"></i> Caricamento dati...
            </div>
            
            <div v-else-if="statsError" class="text-center py-8 text-red-500">
                <i class="fa-solid fa-triangle-exclamation mb-2"></i><br>
                Impossibile recuperare le statistiche (API 404 o Errore Server)
            </div>

            <div v-else class="space-y-8">
                <div class="chart-container">
                    <h4 class="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Libri Aggiunti (Ultimi 6 mesi)</h4>
                    <div class="flex items-end gap-2 h-32 border-b border-[var(--paynes-gray)] pb-1">
                         <div v-for="(point, i) in statsData.booksHistory" :key="i" class="flex-1 flex flex-col items-center group relative">
                            <div class="w-full bg-[var(--paynes-gray)] rounded-t hover:opacity-80 transition-all" 
                                 :style="{ height: point.value + '%' }"></div>
                            <span class="text-[10px] mt-1 opacity-60">{{ point.label }}</span>
                            <div class="absolute bottom-full mb-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                                {{ point.count }} libri
                            </div>
                         </div>
                    </div>
                </div>

                <div class="chart-container">
                    <h4 class="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Attività Prestiti (Ultimi 6 mesi)</h4>
                    <div class="flex items-end gap-4 h-32 border-b border-[var(--paynes-gray)] pb-1">
                         <div v-for="(point, i) in statsData.loansHistory" :key="i" class="flex-1 flex flex-col justify-end items-center gap-1 group relative">
                            <div class="flex gap-1 w-full justify-center items-end h-full">
                                <div class="w-1/2 bg-[var(--tea-rose)] rounded-t hover:opacity-80 transition-all" 
                                     :style="{ height: point.requests + '%' }"></div>
                                <div class="w-1/2 bg-[var(--zomp)] rounded-t hover:opacity-80 transition-all" 
                                     :style="{ height: point.loans + '%' }"></div>
                            </div>
                            <span class="text-[10px] mt-1 opacity-60">{{ point.label }}</span>
                         </div>
                    </div>
                    <div class="flex justify-center gap-4 mt-2 text-xs">
                        <div class="flex items-center"><span class="w-3 h-3 bg-[var(--tea-rose)] mr-1 rounded"></span> Richieste</div>
                        <div class="flex items-center"><span class="w-3 h-3 bg-[var(--zomp)] mr-1 rounded"></span> Prestiti</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="px-6 pb-6 grid grid-cols-3 gap-4 text-center">
             <div class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--thistle)]/30">
                <div class="text-2xl font-display text-theme-main">{{ quickStats.totalBooks }}</div>
                <div class="text-xs opacity-70 uppercase font-bold tracking-wider">Libri</div>
            </div>
            <div class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--thistle)]/30">
                <div class="text-2xl font-display text-[var(--zomp)]">{{ quickStats.activeLoans }}</div>
                <div class="text-xs opacity-70 uppercase font-bold tracking-wider">In Prestito</div>
            </div>
            <div class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--thistle)]/30">
                <div class="text-2xl font-display text-[var(--tea-rose)]">{{ quickStats.pendingRequests }}</div>
                <div class="text-xs opacity-70 uppercase font-bold tracking-wider">Richieste</div>
            </div>
        </div>
      </div>

      <div class="bg-theme-primary p-6 rounded-2xl shadow-md border border-[var(--thistle)] flex flex-col justify-between">
        <div>
            <h3 class="text-lg font-bold text-theme-main mb-2">Visibilità Mappa</h3>
            
            <div v-if="userData?.location" class="flex items-center gap-3 mb-4 animate-fade-in">
                <div class="w-10 h-10 rounded-full flex items-center justify-center border-2"
                    :class="userData.location.visibility === 'all' ? 'border-[var(--zomp)] text-[var(--zomp)]' : 'border-gray-400 text-gray-400'">
                    <i :class="userData.location.visibility === 'all' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
                </div>
                <div>
                    <p class="font-bold text-sm text-theme-main">
                        {{ userData.location.visibility === 'all' ? 'Visibile a tutti' : (userData.location.visibility === 'friends' ? 'Solo utenti registrati' : 'Nascosto') }}
                    </p>
                    <p class="text-xs opacity-70">
                        Raggio offuscamento: {{ userData.location.blurRadius }}m
                    </p>
                </div>
            </div>
            
            <div v-else class="text-center py-6 px-4 bg-[var(--bg-secondary)] rounded-lg border border-dashed border-[var(--thistle)]">
                <p class="text-sm opacity-70 italic mb-2">Posizione non impostata</p>
                <i class="fa-solid fa-map-location-dot text-2xl opacity-30"></i>
            </div>
        </div>
        
        <router-link to="/library?from=dashboard" class="text-center text-sm text-[var(--zomp)] font-bold hover:underline border-t border-[var(--thistle)] pt-3 mt-4">
            Gestisci Posizione <i class="fa-solid fa-arrow-right ml-1"></i>
        </router-link>
      </div>
    </div>

    <div v-if="pendingRequests.length > 0" class="bg-[var(--tea-rose)]/20 border-l-4 border-[var(--tea-rose)] p-4 rounded-r-xl">
        <h3 class="font-bold text-theme-main mb-3 flex items-center">
            <i class="fa-solid fa-bell mr-2 text-[var(--tea-rose)]"></i> Richieste in attesa ({{ pendingRequests.length }})
        </h3>
        <div class="space-y-2">
            <div v-for="req in pendingRequests" :key="req.id" class="flex justify-between items-center bg-theme-primary p-3 rounded-lg shadow-sm border border-[var(--thistle)]/50">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[var(--paynes-gray)] text-white flex items-center justify-center text-xs font-bold">
                        {{ getInitials(req.requesterName) }}
                    </div>
                    <div class="text-sm">
                        <span class="font-bold text-theme-main">{{ req.requesterName }}</span> chiede 
                        <span class="italic text-[var(--zomp)]">{{ req.bookTitle }}</span>
                        <div class="text-[10px] opacity-60">{{ formatDate(req.createdAt) }}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button @click="handleRequest(req.id, 'rejected')" class="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-full transition" title="Rifiuta">
                        <i class="fa-solid fa-times"></i>
                    </button>
                    <button @click="handleRequest(req.id, 'accepted')" class="w-8 h-8 flex items-center justify-center text-[var(--zomp)] hover:bg-[var(--zomp)]/10 rounded-full transition" title="Accetta">
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <hr class="border-[var(--thistle)]">

    <div>
        <div class="flex justify-between items-end mb-6">
            <h2 class="text-2xl font-display text-theme-main">Le tue Librerie</h2>
            <button @click="fetchLibraries" class="text-sm text-[var(--zomp)] hover:underline"><i class="fa-solid fa-rotate-right mr-1"></i> Aggiorna</button>
        </div>
        
        <div v-if="isLoadingLibs" class="text-center py-10 opacity-60">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[var(--zomp)]"></i>
        </div>

        <div v-else-if="librariesError" class="bg-red-100 dark:bg-red-900/20 text-red-700 p-4 rounded-xl border border-red-200 text-center">
            Errore caricamento librerie. Riprova più tardi.
        </div>

        <div v-else-if="libraries.length === 0" class="text-center py-12 bg-[var(--bg-secondary)] rounded-2xl border border-dashed border-[var(--paynes-gray)]/30">
            <p class="text-theme-main mb-4">Non hai ancora creato nessuna libreria.</p>
            <router-link to="/create-library" class="text-[var(--zomp)] font-bold hover:underline">Creane una ora</router-link>
        </div>

        <div v-else class="space-y-4">
            <div v-for="lib in libraries" :key="lib.id" 
                class="bg-theme-primary rounded-xl shadow-sm border border-[var(--thistle)] overflow-hidden transition-all duration-300"
                :class="{'ring-2 ring-[var(--zomp)]/50 shadow-md': lib.isOpen}">
                
                <div @click="toggleLibrary(lib.id)" 
                    class="p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--bg-secondary)] transition">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-lg bg-[var(--paynes-gray)] text-white flex items-center justify-center text-lg shadow-sm">
                            <i class="fa-solid fa-shop"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-theme-main">{{ lib.name }}</h3>
                            <div class="flex gap-2 text-xs">
                                <span class="bg-[var(--bg-secondary)] border border-[var(--thistle)] px-2 py-0.5 rounded-full opacity-80">
                                    {{ lib.bookCount || 0 }} libri
                                </span>
                                <span v-if="lib.visibility === 'public'" class="bg-[var(--zomp)]/10 text-[var(--zomp)] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[var(--zomp)]/20">
                                    <i class="fa-solid fa-globe text-[10px]"></i> Pubblica
                                </span>
                                <span v-else class="bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-200 dark:border-gray-600">
                                    <i class="fa-solid fa-lock text-[10px]"></i> Privata
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <i class="fa-solid fa-chevron-down transition-transform duration-300 text-gray-400" 
                           :class="{'rotate-180 text-[var(--zomp)]': lib.isOpen}"></i>
                    </div>
                </div>

                <div v-if="lib.isOpen" class="bg-[var(--bg-secondary)]/50 border-t border-[var(--thistle)] p-4 animate-fade-in">
                    
                    <div v-if="!lib.booksLoaded && !lib.booksError" class="text-center py-4 text-xs opacity-60">
                        <i class="fa-solid fa-circle-notch fa-spin"></i> Carico libri...
                    </div>
                    
                    <div v-else-if="lib.booksError" class="text-center py-4 text-xs text-red-500">
                        Impossibile caricare i libri di questa libreria.
                    </div>

                    <div v-else-if="lib.books && lib.books.length === 0" class="text-center py-6 text-sm opacity-60">
                        Questa libreria è vuota. 
                        <router-link :to="`/add-book?libraryId=${lib.id}`" class="text-[var(--zomp)] font-bold ml-1 hover:underline">Aggiungi un libro</router-link>
                    </div>

                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div v-for="book in lib.books" :key="book.id" class="flex gap-3 bg-theme-primary p-3 rounded-lg border border-[var(--thistle)] hover:border-[var(--zomp)] hover:shadow-md transition group relative">
                            <div class="w-16 h-24 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                <img v-if="book.coverUrl" :src="book.coverUrl" class="w-full h-full object-cover">
                                <div v-else class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-book"></i></div>
                            </div>
                            
                            <div class="flex-grow min-w-0 flex flex-col justify-center">
                                <h4 class="font-bold text-theme-main truncate text-sm leading-tight mb-1" :title="book.title">{{ book.title }}</h4>
                                <p class="text-xs opacity-70 truncate mb-2">{{ book.author }}</p>
                                
                                <div class="flex items-center gap-2">
                                    <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                                        :class="getStatusBadgeClass(book.status)">
                                        {{ getStatusLabel(book.status) }}
                                    </span>
                                </div>
                            </div>
                            
                            <router-link :to="`/edit-copy/${book.id}`" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-[var(--zomp)]">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </router-link>
                        </div>
                    </div>
                    
                    <div class="mt-4 text-center">
                        <router-link :to="`/add-book?libraryId=${lib.id}`" class="inline-block text-xs font-bold text-[var(--zomp)] uppercase tracking-wider hover:bg-[var(--zomp)]/10 px-4 py-2 rounded-lg transition border border-transparent hover:border-[var(--zomp)]/20">
                            + Aggiungi libro qui
                        </router-link>
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
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

// Dati Utente
const userData = ref(null)

// Stato Librerie
const isLoadingLibs = ref(true)
const librariesError = ref(false)
const libraries = ref([])

// Stato Richieste
const pendingRequests = ref([])

// Stato Statistiche (Accordion)
const isStatsOpen = ref(false)
const isLoadingStats = ref(false)
const statsError = ref(false)
const statsData = ref({ booksHistory: [], loansHistory: [] })

// Statistiche rapide (visualizzate quando chiuso)
const quickStats = computed(() => {
    // Calcolate lato client per velocità, basandosi sui dati caricati se disponibili
    const totalBooks = libraries.value.reduce((acc, lib) => acc + (lib.bookCount || 0), 0)
    return {
        totalBooks: totalBooks,
        activeLoans: 0, // Dato che verrebbe dalle API statistiche
        pendingRequests: pendingRequests.value.length
    }
})

onMounted(async () => {
    await fetchUserMe()
    fetchLibraries()
    fetchPendingRequests()
})

// 1. GET /api/users/me
async function fetchUserMe() {
    try {
        const res = await apiClient.get('/users/me')
        userData.value = res
        // Se l'utente non ha username nel backend, usiamo quello dello store o fallback
        if (!userData.value.username && authStore.user) {
            userData.value.username = authStore.user.username
        }
    } catch (e) {
        console.error("Errore fetch user me", e)
    }
}

// 2. GET /api/users/me/libraries
async function fetchLibraries() {
    isLoadingLibs.value = true
    librariesError.value = false
    try {
        const res = await apiClient.get('/users/me/libraries')
        // Mappiamo i risultati. Le API potrebbero tornare un array diretto o un oggetto paginato
        const rawLibs = Array.isArray(res) ? res : (res.results || res.libraries || [])
        
        libraries.value = rawLibs.map(lib => ({
            ...lib,
            isOpen: false,
            booksLoaded: false,
            booksError: false,
            books: [],
            // Se l'API libraries non torna bookCount, lo inizializziamo a 0
            bookCount: lib.bookCount !== undefined ? lib.bookCount : 0 
        }))
    } catch (e) {
        console.error("Errore fetch libraries", e)
        librariesError.value = true
    } finally {
        isLoadingLibs.value = false
    }
}

// 3. Toggle Library -> Lazy Load Books
// Non c'è un endpoint esplicito nel tuo elenco per "get books of library X", 
// ma solitamente GET /api/libraries/{id} torna i dettagli inclusi i libri, oppure si usa un search.
// Assumerò che GET /api/libraries/{id} ritorni l'oggetto completo LibraryDTO che però 
// nell'OpenAPI non ha la lista "books" esplicita nel DTO, ma BookDetailDTO ha libraryId.
// Probabilmente il backend popola la lista. Se fallisce, mostrerà errore.
async function toggleLibrary(libId) {
    const lib = libraries.value.find(l => l.id === libId)
    if (!lib) return

    lib.isOpen = !lib.isOpen

    // Se apriamo e non abbiamo ancora caricato i libri
    if (lib.isOpen && !lib.booksLoaded) {
        try {
            // Chiamata reale al BE
            const res = await apiClient.get(`/libraries/${libId}`)
            // Assumiamo che la risposta contenga una lista di libri (es. res.books)
            // Se il DTO backend non ha books, questo fallirà (che è quello che ti aspetti "404" o struttura mancante)
            lib.books = res.books || []
            lib.booksLoaded = true
        } catch (e) {
            console.warn(`Impossibile caricare libri per lib ${libId}:`, e)
            lib.booksError = true
            // Fallback per test UI se BE non è pronto su questo endpoint
            // lib.books = [] 
        }
    }
}

// 4. GET /api/requests/my
async function fetchPendingRequests() {
    try {
        // Parametri query basati su standard REST comuni, visto che openapi dice string
        const res = await apiClient.get('/requests/my', {
            params: { status: 'pending', type: 'incoming' }
        })
        pendingRequests.value = Array.isArray(res) ? res : (res.results || [])
    } catch (e) {
        console.error("Errore fetch requests", e)
    }
}

// 5. PATCH /api/requests/{id}
async function handleRequest(reqId, newStatus) {
    try {
        await apiClient.patch(`/requests/${reqId}`, { status: newStatus })
        // Rimuovi dalla UI locale dopo successo
        pendingRequests.value = pendingRequests.value.filter(r => r.id !== reqId)
    } catch (e) {
        console.error("Errore update request", e)
        alert("Errore nell'aggiornamento della richiesta")
    }
}

// 6. Accordion Statistiche -> GET /api/stats/user/{id}
async function toggleStats() {
    isStatsOpen.value = !isStatsOpen.value
    
    // Se apriamo e non abbiamo dati
    if (isStatsOpen.value && statsData.value.booksHistory.length === 0 && !isLoadingStats.value) {
        isLoadingStats.value = true
        statsError.value = false
        
        try {
            const userId = userData.value?.id || authStore.user?.id
            if (!userId) throw new Error("User ID mancante")

            // Chiamata al BE
            const res = await apiClient.get(`/stats/user/${userId}`)
            
            // Qui mappiamo la risposta del BE nel formato grafico.
            // Se il BE torna 404 come previsto, andrà nel catch.
            statsData.value = transformStats(res)
            
        } catch (e) {
            console.error("API Stats error", e)
            statsError.value = true
        } finally {
            isLoadingStats.value = false
        }
    }
}

// Helpers Grafici e UI
function transformStats(apiRes) {
    // Funzione placeholder per trasformare i dati reali quando ci saranno
    return {
        booksHistory: [],
        loansHistory: []
    }
}

function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('it-IT')
}

function getStatusLabel(status) {
    const map = { 'available': 'Disp.', 'on_loan': 'In Prestito', 'reading': 'In Lettura' }
    return map[status] || status
}

function getStatusBadgeClass(status) {
    if (status === 'available') return 'bg-[var(--zomp)]/10 text-[var(--zomp)] border-[var(--zomp)]/20'
    if (status === 'on_loan') return 'bg-[var(--tea-rose)]/20 text-[var(--paynes-gray)] border-[var(--tea-rose)]'
    return 'bg-gray-100 text-gray-500 border-gray-200'
}
</script>

<style scoped>
/* Classi utility per grafici CSS-only */
.chart-container {
    @apply w-full;
}
</style>