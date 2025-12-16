<template>
  <main class="max-w-4xl mx-auto p-6 space-y-8 relative">
    <div class="flex justify-between items-center mb-4">
      <button @click="goBack"
        class="flex items-center text-paynes-gray hover:text-zomp transition font-medium">
        <i class="fa-solid fa-arrow-left mr-2"></i> annulla
      </button>
      <h1 class="font-display text-2xl text-paynes-gray">modifica libreria</h1>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-paynes-gray"></i>
    </div>
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded text-center">{{ error }}</div>

    <article v-else-if="form.id"
      class="bg-white shadow-xl rounded-2xl border-2 border-thistle overflow-hidden animate-fade-in">

      <div class="md:grid md:grid-cols-2">
        
        <section
          class="p-6 flex flex-col justify-start space-y-6 border-b md:border-b-0 md:border-r border-thistle">

          <header class="border-b border-thistle pb-4">
            <h2 class="text-2xl font-display text-paynes-gray">{{ form.name }}</h2>
            <p class="text-sm text-paynes-gray/60">modifica il dettaglio della libreria</p>
          </header>

          <div class="space-y-4">
            <div>
              <label for="libraryName" class="block text-xs font-bold text-paynes-gray uppercase mb-1">nome libreria</label>
              <input v-model="form.name" id="libraryName" type="text" placeholder="nome della collezione"
                class="w-full p-2 rounded-lg border border-thistle bg-white focus:outline-none focus:ring-2 focus:ring-zomp text-sm" />
            </div>

            <div>
              <label for="visibility" class="block text-xs font-bold text-paynes-gray uppercase mb-1">visibilità</label>
              <select v-model="form.visibility" id="visibility"
                class="w-full p-2 rounded-lg border border-thistle bg-white focus:outline-none focus:ring-2 focus:ring-zomp text-sm">
                <option value="all">pubblica (visibile a tutti)</option>
                <option value="logged_in"> visibile solo a utente registrato</option>
                <option value="private">privata (visibile solo a te)</option>
              </select>
              <p class="text-xs text-paynes-gray/70 mt-1">
                se è privata, solo tu potrai vedere i libri e la posizione.
              </p>
            </div>
            
            <hr class="border-thistle"/>
            
            <div class="space-y-2">
              <label for="precision" class="block text-xs font-bold text-paynes-gray uppercase">
                livello di offuscamento
              </label>

              <div class="text-center text-lg font-bold text-zomp p-1 bg-ash-gray/20 rounded-md">
                {{ displayBlurRadius }}
              </div>

              <div class="flex items-center space-x-3">
                <input
                  type="range"
                  id="precision"
                  v-model.number="form.blurRadius"
                  min="0"
                  max="500"
                  step="10"
                  class="w-full h-2 bg-thistle rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-zomp" />
              </div>

              <div class="flex justify-between text-xs text-paynes-gray/70">
                <span>posizione esatta (0m)</span>
                <span>area larga (500m)</span>
              </div>
            </div>
          </div>
          
        </section>

        <section class="p-6 space-y-4">

          <h3 class="text-lg font-bold text-paynes-gray border-b border-thistle pb-2">posizione libreria</h3>
          
          <p v-if="form.latitude" class="text-sm text-zomp font-semibold">
              posizione attuale: lat {{ form.latitude.toFixed(4) }}, lng {{ form.longitude.toFixed(4) }}
          </p>

          <div class="grid grid-cols-3 gap-3">
            <button
              @click="locationMode = 'geo'"
              :class="locationMode === 'geo' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'"
              class="p-2 rounded-lg shadow-md transition font-semibold border-2 border-thistle text-xs">
              <i class="fa-solid fa-location-arrow mb-1"></i><br />
              gps
            </button>
            <button
              @click="locationMode = 'map'"
              :class="locationMode === 'map' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'"
              class="p-2 rounded-lg shadow-md transition font-semibold border-2 border-thistle text-xs">
              <i class="fa-solid fa-map-pin mb-1"></i><br />
              mappa
            </button>
            <button
              @click="locationMode = 'address'"
              :class="locationMode === 'address' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'"
              class="p-2 rounded-lg shadow-md transition font-semibold border-2 border-thistle text-xs">
              <i class="fa-solid fa-house mb-1"></i><br />
              indirizzo
            </button>
          </div>
          
          <div class="relative h-96 pt-2"> 
            
            <div v-if="locationError" class="absolute inset-x-0 top-0 text-sm text-red-700 font-medium p-2 border border-red-300 rounded z-10">
              errore: {{ locationError }}
            </div>

            <div v-if="locationMode === 'geo'" class="flex flex-col h-full justify-center items-center text-center p-4 bg-zomp/20 rounded-lg space-y-2">
              <p class="text-sm text-paynes-gray font-semibold">
                clicca per usare la posizione del browser.
              </p>
              <button @click="getGeolocation" :disabled="isLoadingLocation"
                class="bg-paynes-gray text-white py-2 px-4 rounded-lg hover:bg-paynes-gray/80 transition disabled:opacity-50">
                <i :class="isLoadingLocation ? 'fa-spinner fa-spin' : 'fa-crosshairs'" class="fa-solid mr-2"></i>
                {{ isLoadingLocation ? "ricerca..." : "ottieni posizione" }}
              </button>
              <p v-if="tempLocation.latitude" class="text-sm text-zomp">
                posizione ottenuta!
              </p>
            </div>

            <div v-else-if="locationMode === 'map'" class="h-full space-y-2">
              <div id="map-container" class="h-64 w-full rounded-lg">
                <div id="map" class="h-full w-full rounded-lg"></div>
              </div>
              <p v-if="tempLocation.latitude" class="mt-2 text-sm text-zomp font-semibold">
                posizione selezionata! lat: {{ tempLocation.latitude.toFixed(4) }}, lng: {{ tempLocation.longitude.toFixed(4) }}
              </p>
              <p v-else class="mt-2 text-sm text-paynes-gray/70">
                clicca sulla mappa per selezionare la posizione.
              </p>
            </div>

            <div v-else-if="locationMode === 'address'" class="space-y-3 p-4 border rounded-lg border-thistle h-full overflow-y-auto">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="streetType" class="block text-sm font-medium text-paynes-gray">tipo *</label>
                  <input v-model="formAddress.streetType" id="streetType" type="text" required placeholder="via, piazza, ecc."
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
                </div>
                <div>
                  <label for="streetName" class="block text-sm font-medium text-paynes-gray">nome via *</label>
                  <input v-model="formAddress.streetName" id="streetName" type="text" required placeholder="Roma, garibaldi, ecc."
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label for="houseNumber" class="block text-sm font-medium text-paynes-gray">civico</label>
                  <input v-model="formAddress.houseNumber" id="houseNumber" type="text" placeholder="10a"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
                </div>
                <div>
                  <label for="zipCode" class="block text-sm font-medium text-paynes-gray">cap *</label>
                  <input v-model="formAddress.zipCode" id="zipCode" type="text" required placeholder="001xx"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
                </div>
                <div>
                  <label for="city" class="block text-sm font-medium text-paynes-gray">città</label>
                  <input id="city" value="Roma" disabled
                    class="w-full px-3 py-2 border rounded-lg bg-gray-100 text-paynes-gray/80 cursor-not-allowed" />
                </div>
              </div>
              <button @click="geocodeAddress" :disabled="isLoadingLocation || !isAddressValid"
                class="w-full mt-2 bg-paynes-gray text-white py-2 px-4 rounded-lg hover:bg-paynes-gray/80 transition disabled:opacity-50">
                <i :class="isLoadingLocation ? 'fa-spinner fa-spin' : 'fa-search'" class="fa-solid mr-2"></i>
                {{ isLoadingLocation ? 'ricerca...' : 'cerca indirizzo' }}
              </button>
              <p v-if="tempLocation.latitude && !locationError" class="text-sm text-zomp font-semibold mt-2">
                indirizzo convertito! lat: {{ tempLocation.latitude.toFixed(4) }}, lng: {{ tempLocation.longitude.toFixed(4) }}
              </p>
            </div>
          </div>
          
        </section>
      </div>
      
      <div class="p-6 border-t border-thistle flex justify-between gap-3">
          <button @click="openDeleteModal"
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-semibold">
            <i class="fa-solid fa-trash mr-1"></i> elimina libreria
          </button>
          <button @click="saveChanges" :disabled="isSaving"
              class="bg-zomp text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50">
              <span v-if="isSaving"><i class="fa-solid fa-circle-notch fa-spin"></i> salvataggio...</span>
              <span v-else><i class="fa-solid fa-floppy-disk"></i> salva modifiche</span>
          </button>
      </div>
    </article>
    
    <app-modal :is-open="showDeleteModal" :title="deleteModalTitle" @close="handleModalClose">
      
      <div v-if="deleteStep === 'confirm'" class="flex flex-col items-center text-center space-y-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>

        <p class="text-lg font-medium text-paynes-gray">sei sicuro di voler eliminare la libreria "{{ form.name }}"?</p>

        <p class="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100">
            <i class="fa-solid fa-circle-info mr-1"></i>
            azione <strong>irreversibile</strong>. questa operazione cancellerà anche **tutti i libri** al suo interno.
        </p>

        <div class="flex gap-3 w-full mt-4">
            <button @click="showDeleteModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition">
                annulla
            </button>
            <button @click="confirmDelete"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition flex justify-center items-center gap-2">
                <i class="fa-solid fa-trash"></i> elimina definitivamente
            </button>
        </div>
      </div>

      <div v-else-if="deleteStep === 'loading'" class="flex flex-col items-center justify-center py-8 space-y-4">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500"></i>
        <p class="text-paynes-gray font-medium">eliminazione in corso...</p>
      </div>

      <div v-else-if="deleteStep === 'success'" class="flex flex-col items-center text-center space-y-4">
        <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-zomp mb-2 animate-bounce">
            <i class="fa-solid fa-check text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold text-paynes-gray">libreria eliminata!</h3>
        <p class="text-sm text-gray-600">
            l'operazione è andata a buon fine. sarai reindirizzato alla home page.
        </p>
        <button @click="handleModalClose"
            class="w-full mt-4 px-4 py-2 bg-zomp text-white rounded-lg hover:bg-opacity-90 font-bold transition">
            chiudi e vai alla home
        </button>
      </div>

      <div v-else-if="deleteStep === 'error'" class="flex flex-col items-center text-center space-y-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <i class="fa-solid fa-xmark text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold text-red-600">qualcosa è andato storto</h3>
        <p class="text-sm text-gray-600">
            non è stato possibile eliminare la libreria. riprova.
        </p>
        <button @click="showDeleteModal = false"
            class="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition">
            chiudi
        </button>
      </div>
    </app-modal>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { apiClient } from '@/services/apiClient'
import AppModal from '@/components/AppModal.vue' // si assume esista

const route = useRoute()
const router = useRouter()

const mapTilerApiKey = import.meta.env.VITE_MAPTILER_KEY
const geocodingServiceUrl = "https://api.maptiler.com/geocoding"
const ROME_CENTER = [12.4963, 41.9029]

// stati dati libreria
const form = reactive({
    id: '',
    name: '',
    visibility: 'all',
    latitude: null, // latitudine salvata
    longitude: null, // longitudine salvata
    blurRadius: 0,
})

// stati per logica di localizzazione temporanea
const locationMode = ref("map") // default mappa per la modifica
const tempLocation = reactive({ latitude: null, longitude: null }) // posizione scelta dall'utente (temporanea)
const formAddress = reactive({
    streetType: "via",
    streetName: "",
    houseNumber: "",
    zipCode: "",
    city: "Roma",
})

// stati ui
const isLoading = ref(true)
const isSaving = ref(false)
const isLoadingLocation = ref(false)
const error = ref(null)
const locationError = ref(null)

// stati per eliminazione modale
const showDeleteModal = ref(false)
const deleteStep = ref('confirm') // 'confirm', 'loading', 'success', 'error'

// maplibre states
const map = ref(null)
const marker = ref(null)
const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`

// --- computed properties ---

const displayBlurRadius = computed(() => {
    // descrive il raggio di offuscamento
    const radius = form.blurRadius
    if (radius === 0 || radius === null || isNaN(radius)) return "posizione esatta (0 metri)"
    if (radius < 1000) return `offuscamento: ${radius} metri di raggio`
    return `offuscamento: ${(radius / 1000).toFixed(1)} km di raggio`
})

const isAddressValid = computed(() => {
    // verifica se indirizzo è minimo valido per geocodifica
    return formAddress.streetName.length > 0 && formAddress.zipCode.length > 0
})

const deleteModalTitle = computed(() => {
    switch (deleteStep.value) {
        case 'confirm': return 'conferma eliminazione';
        case 'loading': return 'attendere...';
        case 'success': return 'operazione completata';
        case 'error': return 'errore';
        default: return '';
    }
})

// --- methods ---

function goBack() { router.back() }

// fetch dati libreria
async function loadData() {
    isLoading.value = true
    error.value = null
    const libraryId = route.params.id

    try {
        const response = await apiClient.get(`/libraries/${libraryId}`)

        // popola form con i dati esistenti 
        form.id = response.id
        form.name = response.name
        form.visibility = response.visibility || 'all'
        form.latitude = response.latitude 
        form.longitude = response.longitude
        form.blurRadius = response.blurRadius || 0

        // inizializza la posizione temporanea con i dati esistenti (da modificare)
        tempLocation.latitude = form.latitude
        tempLocation.longitude = form.longitude

    } catch (e) {
        error.value = "errore caricamento dati della libreria"
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

// --- logica mappa ---
const initMap = async () => {
    // inizializza la mappa
    await nextTick() // aspetta che l'elemento #map sia nel dom e visibile

    if (document.getElementById("map")) {
        // se l'oggetto mappa esiste già, lo distruggiamo per una re-inizializzazione pulita
        if (map.value) {
            map.value.remove()
            map.value = null
            marker.value = null
        }
        
        const initialCenter = tempLocation.longitude ? [tempLocation.longitude, tempLocation.latitude] : ROME_CENTER

        map.value = new maplibregl.Map({
            container: "map",
            style: styleUrl,
            center: initialCenter,
            zoom: 12,
        })

        marker.value = new maplibregl.Marker({ color: "#495d63" })
            .setLngLat(initialCenter)
            .addTo(map.value)

        map.value.on("click", (e) => {
            const { lng, lat } = e.lngLat
            tempLocation.latitude = lat
            tempLocation.longitude = lng
            marker.value.setLngLat([lng, lat])
        })
    }
}

// --- geolocalizzazione browser (gps) ---
async function getGeolocation() {
    locationError.value = null
    isLoadingLocation.value = true
    tempLocation.latitude = null
    tempLocation.longitude = null

    if (!navigator.geolocation) {
        locationError.value = "geolocalizzazione non supportata dal browser."
        isLoadingLocation.value = false
        return
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            tempLocation.latitude = position.coords.latitude
            tempLocation.longitude = position.coords.longitude
            isLoadingLocation.value = false
        },
        (e) => {
            let errorMessage = "errore sconosciuto"
            if (e.code === e.PERMISSION_DENIED) errorMessage = "permesso negato. abilita la geolocalizzazione."
            if (e.code === e.POSITION_UNAVAILABLE) errorMessage = "posizione non disponibile."
            locationError.value = errorMessage
            isLoadingLocation.value = false
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
}

// --- geocodifica indirizzo ---
async function geocodeAddress() {
    // geocodifica l'indirizzo
    locationError.value = null
    isLoadingLocation.value = true
    tempLocation.latitude = null
    tempLocation.longitude = null

    if (!isAddressValid.value) {
        locationError.value = "devi compilare i campi via e cap."
        isLoadingLocation.value = false
        return
    }

    const addressPart = `${formAddress.streetType} ${formAddress.streetName} ${formAddress.houseNumber || ''}, ${formAddress.zipCode} ${formAddress.city}`
    // limitiamo la ricerca all'area di roma
    const url = `${geocodingServiceUrl}/${encodeURIComponent(addressPart)}.json?key=${mapTilerApiKey}&limit=1&language=it&country=IT&bbox=12.2,41.7,12.7,42.0`

    try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`geocodifica fallita: errore http ${response.status}`)

        const data = await response.json()
        if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].geometry.coordinates
            tempLocation.latitude = lat
            tempLocation.longitude = lng
        } else {
            locationError.value = "indirizzo non trovato o non valido nell'area di roma."
        }
    } catch (e) {
        locationError.value = `errore api: ${e.message}. riprova.`
    } finally {
        isLoadingLocation.value = false
    }
}


async function saveChanges() {
    // salva le modifiche della libreria
    isSaving.value = true
    locationError.value = null

    // 1. gestisce geocodifica se modalità indirizzo
    if (locationMode.value === "address" && !tempLocation.latitude) {
        await geocodeAddress()
        if (locationError.value || !tempLocation.latitude) {
            isSaving.value = false
            return
        }
    }

    // 2. verifica finale posizione
    if (!tempLocation.latitude || !tempLocation.longitude) {
        locationError.value = "seleziona una posizione valida prima di salvare."
        isSaving.value = false
        return
    }

    // 3. crea payload
    const payload = {
        name: form.name,
        visibility: form.visibility,
        latitude: tempLocation.latitude,
        longitude: tempLocation.longitude,
        blurRadius: form.blurRadius,
    }
    
    // 4. invia al be (put /api/libraries/{id})
    try {
        await apiClient.put(`/libraries/${form.id}`, payload) 
        router.push(`/libraries/${form.id}`)
    } catch (e) {
        error.value = "errore durante il salvataggio della libreria."
        console.error(e)
    } finally {
        isSaving.value = false
    }
}

function openDeleteModal() {
    // apre la modale di conferma eliminazione
    deleteStep.value = 'confirm'
    showDeleteModal.value = true
}

async function confirmDelete() {
    // esegue la cancellazione della libreria
    deleteStep.value = 'loading'

    try {
        // chiamata delete /api/libraries/{id}
        await apiClient.delete(`/libraries/${form.id}`)

        // timeout estetico
        setTimeout(() => {
            deleteStep.value = 'success'
        }, 800)

    } catch (e) {
        console.error("errore durante l'eliminazione", e)
        deleteStep.value = 'error'
    }
}

function handleModalClose() {
    // gestisce la chiusura della modale di eliminazione
    showDeleteModal.value = false
    if (deleteStep.value === 'success') {
        router.push('/')
    }
}

// --- watch e hooks ---

// watch per distruggere e ricreare la mappa quando la modalità cambia
watch(locationMode, async (newMode, oldMode) => {
    locationError.value = null
    
    // 1. clean up quando esce dalla mappa (solo se era in modalità mappa)
    if (oldMode === 'map' && map.value) {
        map.value.remove()
        map.value = null
        marker.value = null
    }

    // resetta temp location se non si è nella modalità indirizzo
    if (newMode !== "address") {
        tempLocation.latitude = form.latitude
        tempLocation.longitude = form.longitude
    }

    // 2. inizializza la mappa quando si torna in modalità 'map'
    if (newMode === "map") {
        await nextTick() // aspetta che il div sia ricostruito in v-else-if
        
        await initMap() // inizializza la mappa

        // centra la mappa sulla posizione corrente/temporanea
        if (map.value && tempLocation.longitude) {
             map.value.setCenter([tempLocation.longitude, tempLocation.latitude])
        }
    }
})

// watch per aggiornare il marker sulla mappa
watch(() => [tempLocation.latitude, tempLocation.longitude], ([lat, lng]) => {
    // sposta il marker sulla mappa
    if (locationMode.value === 'map' && marker.value && lat && lng) {
        marker.value.setLngLat([lng, lat])
    }
})

onMounted(async () => {
    await loadData()
    // inizializza la mappa all'avvio, se la modalità è 'map' (default)
    if (locationMode.value === 'map') {
        await initMap()
    }
})
</script>