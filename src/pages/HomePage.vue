<template>
  <div id="home-page" class="flex flex-col w-full h-[calc(100vh-80px)] lg:px-4 gap-3 overflow-hidden">
    <div v-if="!authStore.isAuthenticated" class="shrink-0 w-full flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-[var(--tea-rose)] to-[var(--thistle)] shadow-sm px-6 h-auto border border-[var(--border-color)]">
      <div class="flex flex-col">
        <h2 class="font-bold text-[var(--paynes-gray)] text-sm">Benvenuto su Bibliomap</h2>
        <p class="text-[var(--paynes-gray)] text-xs mt-1 max-w-2xl font-medium">
          Per vedere più libri, accedere ai dettagli completi delle edizioni e richiedere prestiti agli altri utenti, è necessario accedere o creare un nuovo account gratuito.
        </p>
      </div>
      <router-link to="/login" class="bg-[var(--paynes-gray)] text-white px-4 py-2 rounded-lg hover:bg-[var(--zomp)] transition text-xs font-bold whitespace-nowrap ml-4 border-none">
        Accedi o Registrati
      </router-link>
    </div>

    <main class="flex flex-col lg:flex-row w-full flex-grow gap-4 overflow-hidden h-full">
      
      <aside class="w-full lg:w-4/12 flex flex-col rounded-xl border border-[var(--border-color)] bg-theme-primary shadow-lg overflow-hidden h-full relative">
        
        <div class="p-3 border-b border-[var(--border-color)] flex justify-between items-center shrink-0 z-20 bg-theme-primary">
          <h2 class="font-display text-lg text-theme-main">
            Vicini a te: <span class="font-bold">{{ filteredBooks.length }}</span>
          </h2>
          <button @click="toggleFilters" 
            class="p-2 w-8 h-8 flex items-center justify-center rounded-full transition text-theme-main hover:bg-[var(--ash-gray)]/20"
            :class="{'bg-[var(--zomp)] text-white hover:bg-[var(--zomp)]': showFilters}">
            <i class="fa-solid fa-filter"></i>
          </button>
        </div>

        <div v-if="showFilters" class="p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs space-y-2 shrink-0 animate-fade-in z-10">
          <input v-model="filters.searchText" type="text" placeholder="Cerca titolo o autore..." class="w-full p-2 rounded border border-[var(--border-color)] bg-theme-primary text-theme-main focus:outline-none focus:border-[var(--accent-color)]">
          <select v-model="filters.sortBy" class="w-full p-2 rounded border border-[var(--border-color)] bg-theme-primary text-theme-main focus:outline-none focus:border-[var(--accent-color)]">
            <option value="distance">Più Vicini</option>
            <option value="title">Titolo (A-Z)</option>
            <option value="author">Autore (A-Z)</option>
          </select>
        </div>

        <div ref="listContainer" class="flex-grow p-3 relative overflow-hidden flex flex-col bg-theme-primary">
          
          <div v-if="isLocationLoading" class="text-xs text-[var(--zomp)] text-center animate-pulse mb-2">Recupero posizione...</div>
          <div v-if="locationError" class="text-xs text-red-500 text-center mb-2 p-1">{{ locationError }}</div>
          
          <div v-if="isFetchingBooks" class="absolute inset-0 flex flex-col items-center justify-center bg-theme-primary z-20">
            <i class="fa-solid fa-circle-notch fa-spin text-2xl text-[var(--paynes-gray)]"></i>
          </div>

          <div v-else-if="filteredBooks.length === 0" class="text-center text-theme-main opacity-70 mt-10 text-sm">
            Nessun libro trovato.
          </div>
          
          <div v-else class="flex flex-col gap-2 w-full h-full overflow-y-auto">
            <div v-for="book in paginatedBooks" 
              :key="book.id" 
              @click="zoomToBook(book)"
              class="cursor-pointer p-2 rounded-xl flex flex-col gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm hover:border-[var(--accent-color)] transition duration-200">
              
              <div class="flex items-start w-full">
                <div class="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-200 relative">
                  <img :src="book.coverUrl" class="w-full h-full object-cover" alt="Copertina">
                </div>

                <div class="flex-grow ml-3 flex flex-col justify-between h-24 text-left overflow-hidden">
                  <div>
                    <p class="font-bold text-theme-main text-sm truncate leading-tight mb-0.5">{{ book.title }}</p>
                    <p class="text-xs text-theme-main opacity-80 italic truncate">{{ book.author }}</p>
                  </div>
                  
                  <div class="mt-auto space-y-1">
                    <div class="flex items-center text-xs text-theme-main opacity-70 font-medium">
                      <i class="fa-solid fa-shop mr-1.5 text-[10px]"></i>
                      <span class="truncate">{{ book.libraryName }}</span>
                    </div>
                    <div class="flex items-center text-xs text-theme-main opacity-60">
                      <i class="fa-solid fa-location-dot mr-2 text-[10px]"></i>
                      <span>{{ book.distance.toFixed(1) }} km</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 mt-1 border-t border-[var(--border-color)] pt-2 opacity-90">
                <button @click.stop="goToBookDetails(book.id)" 
                  class="flex-1 py-1.5 px-2 rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--paynes-gray)] hover:text-white text-theme-main text-xs font-semibold transition flex items-center justify-center gap-2"> 
                  <i class="fa-solid fa-eye"></i> Vedi
                </button>
                <button v-if="authStore.isAuthenticated" @click.stop="requestLoan(book.id)" 
                  class="flex-1 py-1.5 px-2 rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white text-theme-main text-xs font-semibold transition flex items-center justify-center gap-2"> 
                  <i class="fa-solid fa-hand-holding-hand"></i> Richiedi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="p-2 border-t border-[var(--border-color)] bg-theme-primary flex justify-between items-center shrink-0 text-xs text-theme-main font-semibold h-12">
          <button @click="prevPage" :disabled="currentPage === 1" class="w-8 h-8 flex items-center justify-center rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span>Pag {{ currentPage }} / {{ totalPages || 1 }}</span>
          <button @click="nextPage" :disabled="currentPage >= totalPages || totalPages === 0" class="w-8 h-8 flex items-center justify-center rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

      </aside>

      <section class="w-full lg:w-8/12 flex-grow rounded-xl overflow-hidden shadow-xl border border-[var(--border-color)] relative h-full">
        <div id="map" class="w-full h-full bg-gray-100"></div>
        
        <div class="absolute bottom-6 left-4 bg-theme-primary border border-[var(--border-color)] p-2 rounded-lg shadow text-xs text-theme-main z-10">
          <div class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-[var(--zomp)] mr-2 border border-white"></span>
            <span>Librerie vicine</span>
          </div>
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

// stati mappa e dati
const map = shallowRef(null)
const mapLoaded = ref(false)
const listContainer = ref(null) 
const isFetchingBooks = ref(false)
const isLocationLoading = ref(false)
const locationError = ref(null)
const userLocation = ref(null) 
const currentMarkers = shallowRef([]) 

// filtri e paginazione
const showFilters = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(3) 
const filters = reactive({ searchText: '', sortBy: 'distance' })

const books = ref([]) 
const ROME_CENTER = { lat: 41.9028, lng: 12.4964 }
const CARD_HEIGHT = 160 

// cover placeholder
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

// calcolo layout responsive
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

// computed
const filteredBooks = computed(() => {
    // il filtro backend gestisce la distanza, qui filtriamo solo logicamente se necessario
    let result = [...books.value]
    
    // ordinamento client side per i risultati visibili
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

// watchers
watch(() => filters, () => { 
    // se cambia il testo cerchiamo subito via api
    if (filters.searchText !== '') {
        searchInCurrentArea()
    }
    currentPage.value = 1
    updateMapMarkers() 
}, { deep: true })

watch(filteredBooks, () => { if (mapLoaded.value) updateMapMarkers() })

// geolocalizzazione iniziale
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
        locationError.value = "uso posizione profilo" 
    } else {
        locationError.value = "uso posizione default roma"
        finalizeLocation(ROME_CENTER.lat, ROME_CENTER.lng)
    }
}

function finalizeLocation(lat, lng) {
    userLocation.value = { lat, lng }
    isLocationLoading.value = false
    initMap(lat, lng)
    // la prima fetch viene fatta da initMap -> load
}

// calcola raggio visibile mappa in km
function getMapRadius() {
    if (!map.value) return 1
    const bounds = map.value.getBounds()
    const center = map.value.getCenter()
    const northEast = bounds.getNorthEast()
    // distanza in metri convertita in km
    const distanceMeters = center.distanceTo(northEast)
    return parseFloat((distanceMeters / 1000).toFixed(2))
}

// recupero libri dinamico
async function fetchBooks(lat, lng, radius) {
    isFetchingBooks.value = true
    
    try {
        const results = await apiClient.get('/books/nearby', { 
            params: { 
                lat, 
                lng, 
                radius,
                search: filters.searchText, // passa ricerca al backend
                exclude_user: authStore.user?.id 
            } 
        })
        
        const rawBooks = Array.isArray(results) ? results : (results.results || [])
        
        books.value = rawBooks.map(b => {
            let finalCover
            if (b.cover) {
                if (b.cover.startsWith('data:image')) {
                    finalCover = b.cover
                } else {
                    finalCover = `data:image/jpeg;base64,${b.cover}`
                }
            } else {
                finalCover = assignDefaultCover(b.id)
            }

            return {
                ...b,
                coverUrl: finalCover, 
                libraryName: b.libraryName || 'Libreria Privata'
            }
        })

    } catch (err) { 
        console.error(err) 
    } finally { 
        isFetchingBooks.value = false 
    }
}

// trigger ricerca su area corrente
function searchInCurrentArea() {
    if (!map.value) return
    const center = map.value.getCenter()
    const radius = getMapRadius()
    // non cercare se il raggio è enorme > 100km per evitare carico
    const safeRadius = radius > 100 ? 100 : radius
    fetchBooks(center.lat, center.lng, safeRadius)
}

// inizializzazione mappa
const initMap = (lat, lng) => {
    const mapTilerApiKey = import.meta.env.VITE_MAPTILER_KEY
    const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`

    map.value = new maplibregl.Map({
        container: 'map',
        style: styleUrl,
        center: [lng, lat],
        zoom: 15, // zoom aumentato come richiesto
        attributionControl: false
    })
    
    // marker posizione utente
    if (authStore.isAuthenticated || userLocation.value) {
         new maplibregl.Marker({ color: '#fac8cd' }).setLngLat([lng, lat]).addTo(map.value)
    }

    map.value.on('load', () => {
        mapLoaded.value = true
        searchInCurrentArea()
    })

    // evento spostamento mappa per ricaricare libri
    map.value.on('moveend', () => {
        searchInCurrentArea()
    })
}

// gestione marker
const updateMapMarkers = () => {
    if (!map.value || !mapLoaded.value) return

    currentMarkers.value.forEach(m => m.remove())
    currentMarkers.value = []

    filteredBooks.value.forEach(book => {
        
        const markerContainer = document.createElement('div')
        markerContainer.className = 'marker-container'
        
        const pin = document.createElement('div')
        pin.className = 'custom-book-pin'
        pin.innerHTML = `<i class="fa-solid fa-book text-white text-2xl drop-shadow-md rotate-45"></i>` 
        
        markerContainer.appendChild(pin)

        const popupHTML = `
            <div class="flex flex-col items-center gap-3 p-2 w-[180px]">
                <div class="text-center">
                    <p class="font-bold text-theme-main text-sm leading-tight mb-1">${book.libraryName}</p>
                    <p class="text-[10px] text-theme-main opacity-60 italic">Gestita da ${book.ownerName}</p>
                </div>
                
                <button id="btn-lib-${book.id}" class="popup-circle-btn" title="Vai alla Libreria">
                    <i class="fa-solid fa-shop"></i>
                </button>
            </div>
        `

        const popup = new maplibregl.Popup({ offset: 45, closeButton: false, maxWidth: '220px' }) 
            .setHTML(popupHTML)

        popup.on('open', () => {
             document.getElementById(`btn-lib-${book.id}`)?.addEventListener('click', () => goToLibrary(book.ownerId))
        })

        const marker = new maplibregl.Marker({ element: markerContainer, anchor: 'bottom' })
            .setLngLat([book.lng, book.lat])
            .setPopup(popup)
            .addTo(map.value)

        const newMarkers = [...currentMarkers.value, marker]
        currentMarkers.value = newMarkers
    })
}

// navigazione
const toggleFilters = () => showFilters.value = !showFilters.value
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const goToBookDetails = (id) => router.push(`/books/${id}`)
const requestLoan = (id) => console.log("prestito", id)
const goToLibrary = (ownerId) => alert("todo libreria")

const zoomToBook = (book) => {
    if(map.value) {
        map.value.flyTo({ center: [book.lng, book.lat], zoom: 16, speed: 1.5 })
    }
}
</script>