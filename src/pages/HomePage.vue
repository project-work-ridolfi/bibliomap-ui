<template>
  <div id="home-page" class="flex flex-col w-full h-[calc(100vh-80px)] lg:px-4 gap-3 overflow-hidden">
    <div v-if="!authStore.isAuthenticated"
      class="shrink-0 w-full flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-[var(--tea-rose)] to-[var(--thistle)] shadow-sm px-6 h-auto border border-[var(--border-color)]">
      <div class="flex flex-col">
        <h2 class="font-bold text-[var(--paynes-gray)] text-sm">Benvenuto su Bibliomap</h2>
        <p class="text-[var(--paynes-gray)] text-xs mt-1 max-w-2xl font-medium">
          Accedi per funzionalita complete.
        </p>
      </div>
      <router-link to="/login"
        class="bg-[var(--paynes-gray)] text-white px-4 py-2 rounded-lg hover:bg-[var(--zomp)] transition text-xs font-bold whitespace-nowrap ml-4 border-none">
        Accedi o Registrati
      </router-link>
    </div>

    <main class="flex flex-col lg:flex-row w-full flex-grow gap-4 overflow-hidden h-full">

      <aside
        class="w-full lg:w-4/12 flex flex-col rounded-xl border border-[var(--border-color)] bg-theme-primary shadow-lg overflow-hidden h-full relative">

        <div
          class="p-3 border-b border-[var(--border-color)] flex justify-between items-center shrink-0 z-20 bg-theme-primary">
          <h2 class="font-display text-lg text-theme-main">
            Vicini a te: <span class="font-bold">{{ filteredBooks.length }}</span>
          </h2>
          <button @click="toggleFilters"
            class="p-2 w-8 h-8 flex items-center justify-center rounded-full transition text-theme-main hover:bg-[var(--ash-gray)]/20"
            :class="{ 'bg-[var(--zomp)] text-white hover:bg-[var(--zomp)]': showFilters }">
            <i class="fa-solid fa-filter"></i>
          </button>
        </div>

        <div v-if="showFilters"
          class="p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs space-y-3 shrink-0 animate-fade-in z-10 flex flex-col">

          <input v-model="filters.searchText" type="text" placeholder="Cerca titolo o autore..."
            class="w-full p-2 rounded border border-[var(--border-color)] bg-theme-primary text-theme-main focus:outline-none focus:border-[var(--accent-color)]">

          <div class="flex flex-col gap-1">
            <span class="text-[10px] uppercase font-bold text-theme-main opacity-70">Ordina per</span>
            <div class="flex gap-2">
              <button @click="handleSort('distance')"
                class="flex-1 py-1.5 rounded border border-[var(--border-color)] transition text-center flex items-center justify-center gap-1"
                :class="sortField === 'distance' ? 'bg-[var(--paynes-gray)] text-white border-transparent' : 'bg-white hover:bg-gray-50 text-theme-main'">
                Distanza
                <i v-if="sortField === 'distance'" class="fa-solid"
                  :class="sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'"></i>
              </button>
              <button @click="handleSort('title')"
                class="flex-1 py-1.5 rounded border border-[var(--border-color)] transition text-center flex items-center justify-center gap-1"
                :class="sortField === 'title' ? 'bg-[var(--paynes-gray)] text-white border-transparent' : 'bg-white hover:bg-gray-50 text-theme-main'">
                Titolo
                <i v-if="sortField === 'title'" class="fa-solid"
                  :class="sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'"></i>
              </button>
              <button @click="handleSort('author')"
                class="flex-1 py-1.5 rounded border border-[var(--border-color)] transition text-center flex items-center justify-center gap-1"
                :class="sortField === 'author' ? 'bg-[var(--paynes-gray)] text-white border-transparent' : 'bg-white hover:bg-gray-50 text-theme-main'">
                Autore
                <i v-if="sortField === 'author'" class="fa-solid"
                  :class="sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'"></i>
              </button>
            </div>
          </div>

          <div v-if="availableTags.length > 0" class="flex flex-col gap-1">
            <span class="text-[10px] uppercase font-bold text-theme-main opacity-70">Filtra per Tag</span>
            <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              <button v-for="tag in availableTags" :key="tag" @click="toggleTag(tag)"
                class="px-2 py-1 rounded-full text-[10px] border transition"
                :class="selectedTag === tag ? 'bg-[var(--zomp)] text-white border-transparent' : 'bg-white border-[var(--border-color)] text-theme-main hover:border-[var(--zomp)]'">
                {{ tag }}
              </button>
            </div>
          </div>

        </div>

        <div ref="listContainer" class="flex-grow p-3 relative overflow-hidden flex flex-col bg-theme-primary">

          <div class="text-[10px] text-center mb-2 p-1.5 rounded bg-gray-100 border border-gray-200 flex flex-col gap-1">
             <div v-if="isLocationLoading" class="text-[var(--zomp)] font-bold animate-pulse">
               <i class="fa-solid fa-satellite-dish"></i> Ricerca posizione...
             </div>
             <div v-else class="flex flex-col gap-1 w-full px-2">
                <div class="flex justify-between items-center w-full">
                  <span class="opacity-70">Posizione stimata ({{ gpsAccuracy ? '~' + Math.round(gpsAccuracy) + 'm' : 'N/A' }})</span>
                  <button @click="handleGeolocationFlow" class="underline text-blue-500 hover:text-blue-700">Riprova</button>
                </div>
                <div class="text-[var(--paynes-gray)] font-bold border-t border-gray-300 pt-1 mt-1">
                   <i class="fa-solid fa-arrows-up-down-left-right mr-1"></i>
                   Trascina il segnaposto rosa sulla mappa se la posizione è sbagliata.
                </div>
             </div>
             <div v-if="locationError" class="text-red-500 font-mono text-[9px] break-words leading-tight">
               {{ locationError }}
             </div>
          </div>

          <div v-if="isFetchingBooks"
            class="absolute inset-0 flex flex-col items-center justify-center bg-theme-primary z-20">
            <i class="fa-solid fa-circle-notch fa-spin text-2xl text-[var(--paynes-gray)]"></i>
          </div>

          <div v-else-if="filteredBooks.length === 0" class="flex flex-col items-center justify-center mt-4 px-4 text-center">
            <p class="text-theme-main opacity-70 text-sm mb-4">
              Nessun libro trovato in quest'area.
            </p>
            
            <div class="w-full max-w-[240px] flex flex-col gap-2 bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
              <div class="flex justify-between items-center">
                <span class="text-[10px] uppercase font-bold text-theme-main opacity-80">Espandi raggio</span>
                <span class="text-xs font-bold text-[var(--zomp)]">{{ expansionRadius >= 1000 ? (expansionRadius / 1000).toFixed(1) + ' km' : expansionRadius + ' m' }}</span>
              </div>
              
              <input 
                type="range" 
                min="500" 
                max="15000" 
                step="500" 
                v-model.number="expansionRadius"
                @change="applyRadiusZoom"
                class="w-full h-1.5 bg-[var(--ash-gray)] rounded-lg appearance-none cursor-pointer accent-[var(--zomp)]"
              >
              <p class="text-[10px] text-theme-main opacity-60 text-left">
                Trascina per visualizzare un'area più ampia della città.
              </p>
            </div>
          </div>

          <div v-else class="flex flex-col gap-2 w-full h-full overflow-y-auto">
            <div v-for="book in paginatedBooks" :key="book.id" @click="zoomToBook(book)"
              class="cursor-pointer p-2 rounded-xl flex flex-col gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm hover:border-[var(--accent-color)] transition duration-200">

              <div class="flex items-start w-full">
                <div class="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-200 relative">
                  <img :src="book.coverUrl" class="w-full h-full object-cover" alt="Copertina">
                </div>

                <div class="flex-grow ml-3 flex flex-col min-h-[96px] text-left">
                  <div>
                    <p class="font-bold text-theme-main text-sm leading-tight mb-0.5">{{ book.title }}</p>
                    <p class="text-xs text-theme-main opacity-80 italic">{{ book.author }}</p>
                  </div>

                  <div v-if="book.tags && book.tags.length > 0" class="flex flex-wrap gap-1 mt-1 mb-1">
                    <span v-for="t in book.tags" :key="t"
                      class="text-[9px] bg-[var(--ash-gray)]/30 px-1.5 py-0.5 rounded text-theme-main opacity-80">
                      {{ t }}
                    </span>
                  </div>

                  <div class="mt-auto space-y-1">
                    <div v-if="book.libraryName"
                      class="flex items-center text-xs text-theme-main opacity-70 font-medium">
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
                <button v-if="authStore.isAuthenticated" @click.stop="openConfirmModal(book)"
                  class="flex-1 py-1.5 px-2 rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white text-theme-main text-xs font-semibold transition flex items-center justify-center gap-2">
                  <i class="fa-solid fa-hand-holding-hand"></i> Richiedi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-2 border-t border-[var(--border-color)] bg-theme-primary flex justify-between items-center shrink-0 text-xs text-theme-main font-semibold h-12">
          <button @click="prevPage" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span>Pag {{ currentPage }} / {{ totalPages || 1 }}</span>
          <button @click="nextPage" :disabled="currentPage >= totalPages || totalPages === 0"
            class="w-8 h-8 flex items-center justify-center rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>

      </aside>

      <section
        class="w-full lg:w-8/12 flex-grow rounded-xl overflow-hidden shadow-xl border border-[var(--border-color)] relative h-full">
        <div id="map" class="w-full h-full bg-gray-100"></div>

        <div
          class="absolute bottom-6 left-4 bg-theme-primary border border-[var(--border-color)] p-2 rounded-lg shadow text-xs text-theme-main z-10">
          <div class="flex items-center">
            <span class="inline-block w-3 h-3 rounded-full bg-[var(--zomp)] mr-2 border border-white"></span>
            <span>Librerie vicine</span>
          </div>
        </div>
      </section>

    </main>
  </div>
  
  <app-modal :is-open="isConfirmModalOpen" title="Conferma Richiesta di Prestito" @close="isConfirmModalOpen = false">
    <div v-if="bookToRequest" class="space-y-4 text-theme-main">
      <p class="text-sm">
        Stai per richiedere in prestito una copia di:
      </p>
      <div class="p-3 bg-gray-100 border border-[var(--border-color)] rounded-lg">
        <p class="font-bold text-base">{{ bookToRequest.title }}</p>
        <p class="text-xs italic opacity-80">{{ bookToRequest.author }}</p>
        <p class="text-xs mt-2">
          Proprietario: <span class="font-semibold">{{ bookToRequest.ownerName }}</span>
        </p>
      </div>
      
      <p class="text-xs font-semibold text-red-500">
        La richiesta verrà inviata direttamente al proprietario per l'approvazione.
      </p>
      
      <div class="flex justify-end gap-3 pt-2">
        <button @click="isConfirmModalOpen = false" 
          class="px-4 py-2 rounded-lg transition text-sm font-bold border border-[var(--border-color)] hover:bg-[var(--ash-gray)]/20">
          Annulla
        </button>
        <button @click="confirmLoanRequest" 
          :disabled="isSending"
          class="bg-[var(--zomp)] text-white px-4 py-2 rounded-lg hover:bg-[var(--paynes-gray)] transition text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
          <i v-if="isSending" class="fa-solid fa-circle-notch fa-spin"></i>
          {{ isSending ? 'Invio...' : 'Conferma Richiesta' }}
        </button>
      </div>
    </div>
  </app-modal>
  
  <app-modal :is-open="isResultModalOpen" :title="modalResultTitle" @close="isResultModalOpen = false">
    <div class="space-y-4">
      <div v-if="modalResultIcon" class="flex justify-center text-4xl">
        <i class="fa-solid" :class="modalResultIcon"></i>
      </div>
      <p class="text-sm text-theme-main text-center">{{ modalResultMessage }}</p>
      
      <div class="flex justify-center pt-2">
        <button @click="isResultModalOpen = false" 
          class="bg-[var(--paynes-gray)] text-white px-4 py-2 rounded-lg hover:bg-[var(--zomp)] transition text-sm font-bold">
          OK
        </button>
      </div>
    </div>
  </app-modal>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/services/apiClient'
import AppModal from '@/components/AppModal.vue'

const authStore = useAuthStore()
const router = useRouter()

const ROME_CENTER = { lat: 41.9028, lng: 12.4964 }
const CARD_HEIGHT = 180
const MAX_SEARCH_RADIUS = 20

const map = shallowRef(null)
const mapLoaded = ref(false)
const listContainer = ref(null)
const isFetchingBooks = ref(false)
const isLocationLoading = ref(false)
const locationError = ref(null)
const userLocation = ref(null)
const userMarker = shallowRef(null) // ref per il marker trascinabile
const gpsAccuracy = ref(null)
const currentMarkers = shallowRef([])
const accuracyCircleId = 'user-accuracy-circle' 

const showFilters = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(3)
const filters = reactive({ searchText: '' })
const selectedTag = ref(null)
const expansionRadius = ref(1000)

const sortField = ref(null)
const sortDirection = ref(null)

const books = ref([])

// stati per le modali di prestito
const isConfirmModalOpen = ref(false) // modale 1: conferma richiesta
const isResultModalOpen = ref(false) // modale 2: risultato
const bookToRequest = ref(null) // libro selezionato per la richiesta
const isSending = ref(false) // stato di caricamento invio richiesta
const modalResultTitle = ref('') // titolo risultato
const modalResultMessage = ref('') // messaggio risultato
const modalResultIcon = ref(null) // icona risultato

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
  if (!bookId) return DEFAULT_COVERS[0]
  let hash = 0
  for (let i = 0; i < bookId.length; i++) { hash += bookId.charCodeAt(i) }
  return DEFAULT_COVERS[hash % DEFAULT_COVERS.length]
}

const calculateItemsPerPage = () => {
  if (listContainer.value) {
    const containerHeight = listContainer.value.clientHeight
    const count = Math.floor((containerHeight - 10) / CARD_HEIGHT)
    itemsPerPage.value = count > 1 ? count : 2
    if (currentPage.value > totalPages.value) currentPage.value = 1
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

const availableTags = computed(() => {
  if (!books.value || books.value.length === 0) return []
  const allTags = books.value.flatMap(b => b.tags || [])
  return [...new Set(allTags)].sort()
})

const handleSort = (field) => {
  if (sortField.value !== field) {
    sortField.value = field
    sortDirection.value = 'asc'
  } else {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortField.value = null
      sortDirection.value = null
    }
  }
}

const filteredBooks = computed(() => {
  let result = [...books.value]

  if (selectedTag.value) {
    result = result.filter(b => b.tags && b.tags.includes(selectedTag.value))
  }

  if (sortField.value && sortDirection.value) {
    result.sort((a, b) => {
      let compare = 0
      if (sortField.value === 'distance') compare = a.distance - b.distance
      if (sortField.value === 'title') compare = a.title.localeCompare(b.title)
      if (sortField.value === 'author') compare = a.author.localeCompare(b.author)

      return sortDirection.value === 'asc' ? compare : -compare
    })
  } else {
    result.sort((a, b) => a.distance - b.distance)
  }
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

const toggleFilters = () => showFilters.value = !showFilters.value
const toggleTag = (tag) => {
  selectedTag.value = selectedTag.value === tag ? null : tag
  currentPage.value = 1
  updateMapMarkers()
}

watch(() => filters.searchText, () => {
  searchInCurrentArea()
  currentPage.value = 1
  selectedTag.value = null
}, { debounce: 300 })

watch(filteredBooks, () => { if (mapLoaded.value) updateMapMarkers() })

async function handleGeolocationFlow() {
  isLocationLoading.value = true
  locationError.value = null
  gpsAccuracy.value = null
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        gpsAccuracy.value = accuracy
        
        // se l'accuratezza è pessima (> 2km) zoomiamo meno
        let startZoom = 15
        if (accuracy > 5000) startZoom = 11
        else if (accuracy > 2000) startZoom = 13
        
        finalizeLocation(latitude, longitude, startZoom)
      },
      async (err) => {
        locationError.value = "GPS non disponibile, uso posizione default"
        await tryUserStoredLocation()
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  } else {
    await tryUserStoredLocation()
  }
}

async function tryUserStoredLocation() {
  if (authStore.isAuthenticated && authStore.user?.latitude) {
    finalizeLocation(authStore.user.latitude, authStore.user.longitude, 15)
  } else {
    finalizeLocation(ROME_CENTER.lat, ROME_CENTER.lng, 12)
  }
}

function finalizeLocation(lat, lng, zoomLevel = 15) {
  userLocation.value = { lat, lng }
  isLocationLoading.value = false
  initMap(lat, lng, zoomLevel)
}

function getMapRadius() {
  if (!map.value) return 1
  const bounds = map.value.getBounds()
  const center = map.value.getCenter()
  const northEast = bounds.getNorthEast()
  const distanceMeters = center.distanceTo(northEast)
  return parseFloat((distanceMeters / 1000).toFixed(2))
}

async function fetchBooks(lat, lng, radius) {
  isFetchingBooks.value = true

  try {
    const currentUserId = authStore.userId
    const results = await apiClient.get('/books/nearby', {
      params: {
        lat,
        lng,
        radius,
        search: filters.searchText,
        exclude_user: currentUserId ? currentUserId : undefined
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
        libraryName: b.libraryName || 'libreria privata',
        ownerName: b.username || 'utente sconosciuto',
        tags: b.tags || []
      }
    })

  } catch (err) {
    console.error(err)
  } finally {
    isFetchingBooks.value = false
  }
}

function searchInCurrentArea() {
  if (!map.value) return
  // usiamo la posizione del marker utente come centro della ricerca
  // se non esiste (caso limite), usiamo centro mappa
  let lat, lng
  if (userMarker.value) {
    const lngLat = userMarker.value.getLngLat()
    lng = lngLat.lng
    lat = lngLat.lat
  } else {
    const center = map.value.getCenter()
    lng = center.lng
    lat = center.lat
  }

  let radius = getMapRadius()
  if (radius > MAX_SEARCH_RADIUS) {
    radius = MAX_SEARCH_RADIUS
  }
  
  fetchBooks(lat, lng, radius)
}

function applyRadiusZoom() {
  if (!map.value) return
  const targetZoom = 15.5 - Math.log2(expansionRadius.value / 500)
  map.value.flyTo({ zoom: targetZoom, speed: 1.2 })
}

function createGeoJSONCircle(center, radiusInKm, points = 64) {
    const coords = { latitude: center[1], longitude: center[0] }
    const km = radiusInKm
    const ret = []
    const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180))
    const distanceY = km / 110.574

    let theta, x, y
    for (let i = 0; i < points; i++) {
        theta = (i / points) * (2 * Math.PI)
        x = distanceX * Math.cos(theta)
        y = distanceY * Math.sin(theta)
        ret.push([coords.longitude + x, coords.latitude + y])
    }
    ret.push(ret[0])
    return {
        type: "FeatureCollection",
        features: [{
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [ret] }
        }]
    }
}

const initMap = (lat, lng, zoomLevel) => {
  // se mappa esiste, spostiamo marker e vista
  if (map.value) {
    map.value.flyTo({ center: [lng, lat], zoom: zoomLevel })
    
    if (userMarker.value) {
      userMarker.value.setLngLat([lng, lat])
    } else {
      createUserMarker(lat, lng)
    }
    
    drawAccuracyCircle(lat, lng)
    searchInCurrentArea()
    return
  }

  const mapTilerApiKey = import.meta.env.VITE_MAPTILER_KEY
  const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`

  map.value = new maplibregl.Map({
    container: 'map',
    style: styleUrl,
    center: [lng, lat],
    zoom: zoomLevel,
    attributionControl: false
  })

  map.value.on('load', () => {
    mapLoaded.value = true
    createUserMarker(lat, lng)
    drawAccuracyCircle(lat, lng)
    searchInCurrentArea()
  })

  // se l'utente sposta la mappa manualmente (pan/zoom), rilanciamo la ricerca
  // centrata sempre sul marker utente, ma col nuovo raggio visibile
  map.value.on('moveend', () => {
    if (filters.searchText === '') {
      searchInCurrentArea()
    }
  })
}

// crea marker draggable
const createUserMarker = (lat, lng) => {
  if (userMarker.value) return

  userMarker.value = new maplibregl.Marker({ color: '#fac8cd', draggable: true })
    .setLngLat([lng, lat])
    .addTo(map.value)

  userMarker.value.on('dragend', () => {
    const newPos = userMarker.value.getLngLat()
    // aggiorniamo la posizione utente logica
    userLocation.value = { lat: newPos.lat, lng: newPos.lng }
    // spostiamo anche il cerchio accuratezza
    drawAccuracyCircle(newPos.lat, newPos.lng)
    // rilanciamo ricerca
    searchInCurrentArea()
  })
}

const drawAccuracyCircle = (lat, lng) => {
  if (!map.value || !gpsAccuracy.value || gpsAccuracy.value < 100) {
    // se accuratezza alta o nulla, nascondi cerchio se esiste
    if (map.value && map.value.getLayer(accuracyCircleId)) {
       map.value.setLayoutProperty(accuracyCircleId, 'visibility', 'none')
    }
    return
  }
  
  const radiusKm = gpsAccuracy.value / 1000
  const circleData = createGeoJSONCircle([lng, lat], radiusKm)

  if (map.value.getSource(accuracyCircleId)) {
    map.value.getSource(accuracyCircleId).setData(circleData)
    map.value.setLayoutProperty(accuracyCircleId, 'visibility', 'visible')
  } else {
    map.value.addSource(accuracyCircleId, {
      type: 'geojson',
      data: circleData
    })
    map.value.addLayer({
      id: accuracyCircleId,
      type: 'fill',
      source: accuracyCircleId,
      layout: {}, // default visible
      paint: {
        'fill-color': '#fac8cd',
        'fill-opacity': 0.2,
        'fill-outline-color': '#fac8cd'
      }
    })
  }
}

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

    let popupContent = `
            <div class="flex flex-col items-center gap-3 p-2 w-[180px]">
                <div class="text-center">`

    if (book.libraryName) {
      popupContent += `<p class="font-bold text-theme-main text-sm leading-tight mb-1">${book.libraryName}</p>`
    }

    if (book.ownerName) {
      popupContent += `<p class="text-[10px] text-theme-main opacity-60 italic">Gestita da ${book.ownerName}</p>`
    }

    popupContent += `
                </div>
                <button id="btn-lib-${book.id}" class="popup-circle-btn" title="Vai alla Libreria">
                    <i class="fa-solid fa-shop"></i>
                </button>
            </div>
        `

    const popup = new maplibregl.Popup({ offset: 45, closeButton: false, maxWidth: '220px' })
      .setHTML(popupContent)

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

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const goToBookDetails = (id) => router.push(`/books/${id}`)
const goToLibrary = (ownerId) => alert("todo libreria")

const zoomToBook = (book) => {
  if (map.value) {
    map.value.flyTo({ center: [book.lng, book.lat], zoom: 16, speed: 1.5 })
  }
}

// funzione per aprire la modale di conferma
const openConfirmModal = (book) => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  bookToRequest.value = book
  isConfirmModalOpen.value = true
}

// funzione che invia la richiesta dopo la conferma
const confirmLoanRequest = async () => {
  if (!bookToRequest.value) return
  
  const copyId = bookToRequest.value.id
  isConfirmModalOpen.value = false // chiude la modale di conferma
  isSending.value = true // attiva lo stato di invio
  
  // resetta risultati precedenti
  modalResultTitle.value = ''
  modalResultMessage.value = ''
  modalResultIcon.value = null

  try {
    // chiamata al be per creare richiesta di prestito
    const response = await apiClient.post(`/loan/${copyId}`, {})
    console.log("prestito richiesto con successo", response.loanId)
    
    // gestisce successo con modale
    modalResultTitle.value = 'Richiesta Inviata'
    modalResultMessage.value = `La tua richiesta di prestito per il libro '${bookToRequest.value.title}' è stata inviata al proprietario. Sarai notificato quando sarà accettata. ID richiesta: ${response.loanId}`
    modalResultIcon.value = 'fa-circle-check text-green-500'

  } catch (error) {
    console.error("errore richiesta prestito", error)
    const errorMessage = error.response?.data?.message || 'Errore generico durante la richiesta di prestito'
    
    // gestisce errore con modale
    modalResultTitle.value = 'Errore Richiesta'
    modalResultMessage.value = `Si è verificato un problema: ${errorMessage}`
    modalResultIcon.value = 'fa-circle-xmark text-red-500'

  } finally {
    isSending.value = false // disattiva lo stato di invio
    isResultModalOpen.value = true // apre la modale di risultato
    bookToRequest.value = null
  }
}
</script>