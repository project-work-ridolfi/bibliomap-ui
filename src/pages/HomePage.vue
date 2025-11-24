<template>
  <div id="home-page" class="flex flex-col w-full h-[calc(100vh-160px)] lg:px-4 gap-3 overflow-hidden">

    <div v-if="!authStore.isAuthenticated" class="shrink-0 w-full flex justify-between items-center p-2 border border-thistle rounded-xl bg-ash-gray/10 shadow-sm px-4 h-12">
        <p class="font-semibold text-paynes-gray text-xs">Accedi per i prestiti</p>
        <router-link to="/login" class="bg-zomp text-white px-3 py-1 rounded-lg hover:bg-paynes-gray transition text-xs font-bold">
          Login
        </router-link>
    </div>
    
    <main id="main-content" class="flex flex-col lg:flex-row w-full flex-grow gap-4 overflow-hidden h-full"> 
    
        <aside id="sidebar" class="w-full lg:w-4/12 flex flex-col rounded-xl border-2 border-thistle bg-theme-primary shadow-lg overflow-hidden h-full relative">
          
          <div class="p-3 border-b border-thistle/50 bg-white/50 flex justify-between items-center shrink-0 z-20">
              <h2 class="font-display text-lg text-paynes-gray">
                 Vicini a te: <span class="font-bold">{{ filteredBooks.length }}</span>
              </h2>
              <button @click="toggleFilters" 
                class="p-2 w-8 h-8 flex items-center justify-center rounded-full transition"
                :class="{'bg-zomp text-white': showFilters, 'hover:bg-ash-gray/20 text-paynes-gray': !showFilters}">
                <i class="fa-solid fa-filter"></i>
              </button>
          </div>

          <div v-if="showFilters" class="p-3 bg-ash-gray/10 border-b border-thistle/50 text-xs space-y-2 shrink-0 animate-fade-in z-10">
              <input v-model="filters.searchText" type="text" placeholder="Cerca titolo o autore..." class="w-full p-2 rounded border border-thistle focus:outline-zomp">
              <select v-model="filters.sortBy" class="w-full p-2 rounded border border-thistle focus:outline-zomp">
                  <option value="distance">Più Vicini</option>
                  <option value="title">Titolo (A-Z)</option>
                  <option value="author">Autore (A-Z)</option>
              </select>
          </div>

          <div ref="listContainer" class="flex-grow p-3 relative overflow-hidden flex flex-col">
            
            <div v-if="isLocationLoading" class="text-xs text-zomp text-center animate-pulse mb-2">📍 Recupero posizione...</div>
            <div v-if="locationError" class="text-xs text-red-600 text-center mb-2 bg-red-50 p-1 rounded">{{ locationError }}</div>
            
            <div v-if="isFetchingBooks" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                <i class="fa-solid fa-circle-notch fa-spin text-2xl text-paynes-gray"></i>
            </div>

            <div v-else-if="filteredBooks.length === 0" class="text-center text-paynes-gray/70 mt-10">
                Nessun libro trovato.
            </div>
            
            <div v-else class="flex flex-col gap-2 w-full h-full">
                <div v-for="book in paginatedBooks" 
                        :key="book.id" 
                        @click="zoomToBook(book)"
                        class="book-card cursor-pointer p-2 rounded-xl flex flex-col gap-2 bg-white/80 border border-thistle shadow-sm hover:shadow-md hover:border-zomp transition duration-200">
                    
                    <div class="flex items-start w-full">
                        <div class="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-200 border border-gray-100 relative">
                            <img :src="book.coverUrl" class="w-full h-full object-cover">
                        </div>

                        <div class="flex-grow ml-3 flex flex-col justify-between h-24 text-left overflow-hidden">
                            <div>
                                <p class="font-bold text-paynes-gray text-sm truncate leading-tight mb-0.5" :title="book.title">{{ book.title }}</p>
                                <p class="text-xs text-paynes-gray/80 italic truncate">{{ book.author }}</p>
                            </div>
                            
                            <div class="mt-auto space-y-1">
                                <div class="flex items-center text-xs text-paynes-gray/70 font-medium">
                                    <i class="fa-solid fa-shop mr-1.5 text-[10px]"></i>
                                    <span class="truncate">{{ book.libraryName || 'Libreria Privata' }}</span>
                                </div>
                                <div class="flex items-center text-xs text-paynes-gray/60">
                                    <i class="fa-solid fa-location-dot mr-2 text-[10px]"></i>
                                    <span>{{ book.distance.toFixed(1) }} km</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2 mt-1 border-t border-thistle/20 pt-2">
                        <button @click.stop="goToBookDetails(book.id)" 
                                class="flex-1 py-1.5 px-2 rounded-full bg-ash-gray/20 hover:bg-paynes-gray hover:text-white text-paynes-gray text-xs font-semibold transition flex items-center justify-center gap-2"> 
                                <i class="fa-solid fa-eye"></i> Vedi
                        </button>
                        <button v-if="authStore.isAuthenticated" @click.stop="requestLoan(book.id)" 
                                class="flex-1 py-1.5 px-2 rounded-full bg-ash-gray/20 hover:bg-zomp hover:text-white text-paynes-gray text-xs font-semibold transition flex items-center justify-center gap-2"> 
                                <i class="fa-solid fa-hand-holding-hand"></i> Richiedi
                        </button>
                    </div>

                </div>
            </div>
          </div>

          <div class="p-2 border-t border-thistle/50 bg-white/50 flex justify-between items-center shrink-0 text-xs text-paynes-gray font-semibold h-10">
             <button @click="prevPage" :disabled="currentPage === 1" class="w-8 h-8 flex items-center justify-center rounded bg-ash-gray/20 hover:bg-zomp hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-left"></i></button>
             <span>Pag {{ currentPage }} / {{ totalPages || 1 }}</span>
             <button @click="nextPage" :disabled="currentPage >= totalPages || totalPages === 0" class="w-8 h-8 flex items-center justify-center rounded bg-ash-gray/20 hover:bg-zomp hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"><i class="fa-solid fa-chevron-right"></i></button>
          </div>

        </aside>

        <section id="map-area" class="w-full lg:w-8/12 flex-grow rounded-xl overflow-hidden shadow-xl border-2 border-thistle relative h-full">
          <div id="map" class="w-full h-full bg-gray-100"></div>
          
          <div class="absolute bottom-4 left-4 bg-white/90 p-2 rounded-lg shadow text-xs text-paynes-gray z-10 backdrop-blur-sm pointer-events-none">
             <span class="inline-block w-2 h-2 rounded-full bg-zomp mr-1"></span> Librerie vicine
          </div>
        </section>
    </main>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css' 
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/services/apiClient'

const authStore = useAuthStore()
const router = useRouter()

// --- STATI ---
const map = shallowRef(null)
const mapLoaded = ref(false)
const listContainer = ref(null) 
const isFetchingBooks = ref(false)
const isLocationLoading = ref(false)
const locationError = ref(null)
const userLocation = ref(null) 
const currentMarkers = shallowRef([]) 

const showFilters = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(3) 
const filters = reactive({ searchText: '', sortBy: 'distance' })

const books = ref([]) 
const ROME_CENTER = { lat: 41.9028, lng: 12.4964 }
const MAX_RADIUS_KM = 10
const CARD_HEIGHT = 160 

const DEFAULT_COVERS = [
    '/images/cover_default_1.png',
    '/images/cover_default_2.png',
    '/images/cover_default_3.png',
    '/images/cover_default_4.png',
    '/images/cover_default_5.png',
    '/images/cover_default_6.png',
    '/images/cover_default_7.png'
]

function assignDefaultCover(bookId) {
    if(!bookId) return DEFAULT_COVERS[0]
    let hash = 0
    for (let i = 0; i < bookId.length; i++) { hash += bookId.charCodeAt(i) }
    return DEFAULT_COVERS[hash % DEFAULT_COVERS.length]
}

// --- LOGICA LAYOUT ---
const calculateItemsPerPage = () => {
    if (listContainer.value) {
        const containerHeight = listContainer.value.clientHeight
        const count = Math.floor((containerHeight - 10) / CARD_HEIGHT) 
        itemsPerPage.value = count > 1 ? count : 2
        if(currentPage.value > totalPages.value) currentPage.value = 1
    }
}

let resizeObserver = null

onMounted(() => {
    if (listContainer.value) {
        resizeObserver = new ResizeObserver(() => calculateItemsPerPage())
        resizeObserver.observe(listContainer.value)
    }
    handleGeolocationFlow()
})

onUnmounted(() => {
    if (resizeObserver) resizeObserver.disconnect()
    if (map.value) map.value.remove()
})

// --- COMPUTED ---
const filteredBooks = computed(() => {
    let result = [...books.value]
    if (authStore.isAuthenticated && authStore.user) {
        result = result.filter(b => b.ownerId !== authStore.user.id)
    }
    if (filters.searchText) {
        const term = filters.searchText.toLowerCase()
        result = result.filter(b => 
            b.title.toLowerCase().includes(term) || 
            b.author.toLowerCase().includes(term)
        )
    }
    result.sort((a, b) => {
        if (filters.sortBy === 'distance') return a.distance - b.distance
        if (filters.sortBy === 'title') return a.title.localeCompare(b.title)
        if (filters.sortBy === 'author') return a.author.localeCompare(b.author)
        return 0
    })
    return result
})

const totalPages = computed(() => {
    const total = Math.ceil(filteredBooks.value.length / itemsPerPage.value)
    return total > 0 ? total : 1
})

const paginatedBooks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredBooks.value.slice(start, end)
})

// --- WATCHERS ---
watch(() => filters, () => { currentPage.value = 1; updateMapMarkers() }, { deep: true })
watch(filteredBooks, () => { if (mapLoaded.value) updateMapMarkers() })

// --- GEO ---
async function handleGeolocationFlow() {
    isLocationLoading.value = true
    locationError.value = null
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => finalizeLocation(pos.coords.latitude, pos.coords.longitude),
            async () => { await tryUserStoredLocation() },
            { enableHighAccuracy: false, timeout: 4000 } 
        )
    } else {
        await tryUserStoredLocation()
    }
}

async function tryUserStoredLocation() {
    if (authStore.isAuthenticated && authStore.user?.latitude) {
        finalizeLocation(authStore.user.latitude, authStore.user.longitude)
        locationError.value = "Uso posizione profilo." 
    } else {
        locationError.value = "Posizione non trovata. Uso Roma."
        finalizeLocation(ROME_CENTER.lat, ROME_CENTER.lng)
    }
}

function finalizeLocation(lat, lng) {
    userLocation.value = { lat, lng }
    isLocationLoading.value = false
    initMap(lat, lng)
    fetchBooks()
}

async function fetchBooks() {
    if(!userLocation.value) return
    isFetchingBooks.value = true
    const { lat, lng } = userLocation.value
    
    try {
        const results = await apiClient.get('/books/nearby', { 
            params: { 
                lat, lng, radius: MAX_RADIUS_KM,
                exclude_user: authStore.user?.id 
            } 
        })
        
        const rawBooks = Array.isArray(results) ? results : (results.results || [])
        
        books.value = rawBooks.map(b => {
            
            // --- LOGICA COVER B64 ---
            let finalCover
            
            if (b.cover) {
                // Se il B64 nel DB ha già l'intestazione "data:image/...", usalo così com'è.
                if (b.cover.startsWith('data:image')) {
                    finalCover = b.cover
                } else {
                    // Altrimenti aggiungiamo noi l'intestazione standard (assumiamo jpeg o png)
                    // Nota: Se supporti vari formati, meglio che il prefisso sia salvato nel DB.
                    finalCover = `data:image/jpeg;base64,${b.cover}`
                }
            } else {
                // Se è null, usa il default generato dall'hash dell'ID
                finalCover = assignDefaultCover(b.id)
            }

            return {
                ...b,
                coverUrl: finalCover, // Vue userà questo nel tag <img :src="...">
                libraryName: b.libraryName || 'Libreria Privata'
            }
        })

    } catch (err) { 
        console.error(err) 
        generalError.value = "Errore caricamento libri" // Gestione errore base
    } finally { 
        isFetchingBooks.value = false 
    }
}

// --- MAPPA ---
const initMap = (lat, lng) => {
    const mapTilerApiKey = import.meta.env.VITE_MAPTILER_KEY
    const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`

    map.value = new maplibregl.Map({
        container: 'map',
        style: styleUrl,
        center: [lng, lat],
        zoom: 13,
        attributionControl: false
    })
    
    if (authStore.isAuthenticated || userLocation.value) {
         new maplibregl.Marker({ color: '#fac8cd' }).setLngLat([lng, lat]).addTo(map.value)
    }

    map.value.on('load', () => {
        mapLoaded.value = true
        updateMapMarkers()
    })
}

const updateMapMarkers = () => {
    if (!map.value || !mapLoaded.value) return

    currentMarkers.value.forEach(m => m.remove())
    currentMarkers.value = []

    filteredBooks.value.forEach(book => {
        
        // 1. PIN HTML
        const markerContainer = document.createElement('div')
        markerContainer.className = 'marker-container'
        
        const pin = document.createElement('div')
        pin.className = 'custom-book-pin'
        // Icona bianca pura, grande e nitida
        pin.innerHTML = `<i class="fa-solid fa-book text-white text-2xl drop-shadow-md rotate-45"></i>` 
        
        markerContainer.appendChild(pin)

        // 2. POPUP LIBRERIA 
        const popupHTML = `
            <div class="flex flex-col items-center gap-3 p-2 w-[180px]">
                <div class="text-center">
                    <p class="font-bold text-paynes-gray text-sm leading-tight mb-1">${book.libraryName}</p>
                    <p class="text-[10px] text-paynes-gray/60 italic">Gestita da ${book.ownerName}</p>
                </div>
                
                <button id="btn-lib-${book.id}" class="popup-circle-btn" title="Vai alla Libreria">
                    <i class="fa-solid fa-shop"></i>
                </button>
            </div>
        `

        const popup = new maplibregl.Popup({ offset: 45, closeButton: false, maxWidth: '220px' }) 
            .setHTML(popupHTML)

        popup.on('open', () => {
             document.getElementById(`btn-lib-${book.id}`)?.addEventListener('click', () => goToLibrary(book.ownerId)) // O libraryId se esiste
        })

        const marker = new maplibregl.Marker({ element: markerContainer, anchor: 'bottom' })
            .setLngLat([book.lng, book.lat])
            .setPopup(popup)
            .addTo(map.value)

        const newMarkers = [...currentMarkers.value, marker]
        currentMarkers.value = newMarkers
    })
}

const toggleFilters = () => showFilters.value = !showFilters.value
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const goToBookDetails = (id) => router.push(`/books/${id}`)
const requestLoan = (id) => console.log("Prestito", id)

// Nuova funzione per navigare alla libreria
const goToLibrary = (ownerId) => {
    // router.push(`/libraries/${ownerId}`) // Da implementare rotta
    console.log("Vai a libreria di utente:", ownerId)
    alert("Prossimamente: Pagina Libreria")
}

const zoomToBook = (book) => {
    if(map.value) {
        map.value.flyTo({ center: [book.lng, book.lat], zoom: 15, speed: 1.5 })
    }
}

</script>

<style>
/* CSS PIN MAPPA */
.marker-container {
    width: 50px; 
    height: 50px;
    display: flex; justify-content: center; align-items: flex-end;
    cursor: pointer;
}

.custom-book-pin {
    width: 44px; 
    height: 44px;
    background-color: #629677; 
    border: 3px solid white; 
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg); 
    display: flex; justify-content: center; align-items: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    transition: transform 0.2s, background-color 0.2s;
}

/* Hover effect sul pin */
.marker-container:hover .custom-book-pin {
    transform: rotate(-45deg) scale(1.15);
    background-color: #495d63; /* Cambia colore all'hover */
    z-index: 50; 
}

/* CSS POPUP & BOTTONI */
.maplibregl-popup-content {
    border-radius: 12px !important;
    padding: 8px !important;
    border: 2px solid #d8a48f; /* Bordo colorato per staccare dalla mappa */
    box-shadow: 0 5px 15px rgba(0,0,0,0.2) !important;
    font-family: inherit;
}

/* Bottone circolare grande nel popup */
.popup-circle-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(178, 190, 181, 0.2); /* ash-gray/20 */
    color: #495d63;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.popup-circle-btn:hover {
    background-color: #629677; /* Zomp */
    color: white;
    transform: scale(1.1);
}
</style>