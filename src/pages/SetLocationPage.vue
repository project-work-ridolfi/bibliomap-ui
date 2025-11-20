<template>
  <div
    class="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl border-2 border-thistle space-y-6">
    <h1 class="text-3xl font-display text-center text-paynes-gray">
      Dove ti trovi?
    </h1>
    <p class="text-center text-paynes-gray">
      Per mostrarti i libri più vicini, abbiamo bisogno della tua posizione.
      Scegli come preferisci impostarla:
    </p>

    <div class="grid grid-cols-3 gap-4">
      <button
        @click="locationMode = 'geo'"
        :class="
          locationMode === 'geo'
            ? 'bg-zomp text-white'
            : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'
        "
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
        <i class="fa-solid fa-location-arrow mb-2 text-xl"></i><br />
        Browser
      </button>
      <button
        @click="locationMode = 'map'"
        :class="
          locationMode === 'map'
            ? 'bg-zomp text-white'
            : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'
        "
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
        <i class="fa-solid fa-map-pin mb-2 text-xl"></i><br />
        Sulla Mappa
      </button>
      <button
        @click="locationMode = 'address'"
        :class="
          locationMode === 'address'
            ? 'bg-zomp text-white'
            : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'
        "
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
        <i class="fa-solid fa-house mb-2 text-xl"></i><br />
        Indirizzo
      </button>
    </div>

    <div
      v-if="locationMode === 'address'"
      class="space-y-3 p-4 border rounded-lg border-thistle">
      <div class="grid grid-cols-2 gap-3">
         <div>
          <label for="streetType" class="block text-sm font-medium text-paynes-gray">
            Tipo di Indirizzo *
         </label>
          <input v-model="form.streetType" id="streetType" type="text" required placeholder="Via, Piazza, ecc."
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
        </div>
        <div>
          <label for="streetName"  class="block text-sm font-medium text-paynes-gray">
            Nome della Via *
            </label>
          <input v-model="form.streetName" id="streetName" type="text" required placeholder="Roma, Garibaldi, ecc."
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label for="houseNumber" class="block text-sm font-medium text-paynes-gray">
            Civico
            </label>
          <input v-model="form.houseNumber" id="houseNumber" type="text" placeholder="10A"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
        </div>
        <div>
          <label for="zipCode" class="block text-sm font-medium text-paynes-gray">
            CAP *
            </label>
          <input v-model="form.zipCode" id="zipCode" type="text" required placeholder="001xx"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
        </div>
        <div class="relative group">
          <label for="city" class="block text-sm font-medium text-paynes-gray">
            Città
            </label>
          <input id="city" value="Roma" disabled
            class="w-full px-3 py-2 border rounded-lg bg-gray-100 text-paynes-gray/80 cursor-not-allowed" />
          <div  class="absolute top-full mt-2 hidden group-hover:block bg-paynes-gray text-white text-xs rounded py-1 px-2 z-10 w-40">
            Al momento il servizio è disponibile solo per Roma.
          </div>
        </div>
      </div>
      <p v-if="locationError" class="text-sm text-red-700 font-medium mt-2">
        Errore: {{ locationError }}
      </p>
      <p
        v-if="form.latitude && !locationError"
        class="text-sm text-zomp font-semibold mt-2">
        Indirizzo convertito! Lat: {{ form.latitude.toFixed(4) }}, Lng:
        {{ form.longitude.toFixed(4) }}
      </p>
    </div>
    <div
      v-else-if="locationMode === 'map'"
      class="text-center p-4 bg-ash-gray/20 rounded-lg">
      <p class="text-sm text-paynes-gray">
        Clicca sul punto esatto sulla mappa per impostare la tua posizione.
      </p>

      <div id="map-container" class="h-64 w-full rounded-lg mt-2">
        <div id="map" class="h-full w-full rounded-lg"></div>
      </div>

      <p v-if="form.latitude" class="mt-2 text-sm text-zomp font-semibold">
        Posizione selezionata! Lat: {{ form.latitude.toFixed(4) }}, Lng:
        {{ form.longitude.toFixed(4) }}
      </p>
      <p v-else class="mt-2 text-sm text-paynes-gray/70">
        Seleziona la tua posizione sulla mappa.
      </p>
    </div>

    <div
      v-else-if="locationMode === 'geo'"
      class="text-center p-4 bg-zomp/20 rounded-lg">
      <p class="text-sm text-paynes-gray font-semibold">
        Clicca su "Ottieni Posizione" e accetta il popup del browser.
      </p>
      <p class="text-xs text-red-700 mt-1 mb-2">
        Attenzione: Se usi una VPN, la posizione potrebbe non essere accurata.
      </p>
      <button
        @click="getGeolocation"
        :disabled="isLoadingLocation"
        class="mt-2 bg-paynes-gray text-white py-2 px-4 rounded-lg hover:bg-paynes-gray/80 transition duration-150 disabled:opacity-50">
        <i
          :class="isLoadingLocation ? 'fa-spinner fa-spin' : 'fa-crosshairs'"
          class="fa-solid mr-2"></i>
        {{ isLoadingLocation ? "Ricerca..." : "Ottieni Posizione" }}
      </button>
      <p v-if="form.latitude" class="mt-2 text-sm text-zomp">
        Posizione ottenuta! ({{ form.latitude.toFixed(2) }},
        {{ form.longitude.toFixed(2) }})
      </p>
      <p v-if="locationError" class="mt-2 text-sm text-red-700 font-medium">
        Errore: {{ locationError }}
      </p>
    </div>

    <hr class="border-thistle" />

    <div
      class="max-w-xl mx-auto p-8 bg-theme-primary shadow-xl rounded-2xl border-2 border-thistle space-y-6">
      <hr class="border-thistle" />

      <h2 class="text-xl font-display text-paynes-gray text-center">
        Privacy della Posizione
      </h2>

      <div
        class="p-3 bg-tea-rose-red/20 border-l-4 border-tea-rose-red text-sm text-paynes-gray">
        Importante: Qui decidi la precisione della tua posizione. Se scegli
        "Posizione Esatta" (0m), la tua posizione non verrà offuscata. Puoi
        cambiare queste impostazioni di precisione e visibilità in qualsiasi
        momento dal tuo Profilo Utente.
      </div>

      <div>
        <label
          for="visibility"
          class="block text-sm font-medium mb-1 text-paynes-gray"
          >Chi può vedere la mia area di prossimità?</label
        >
        <select
          v-model="form.visibility"
          id="visibility"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp">
          <option value="all">Tutti</option>
          <option value="friends">Solo gli utenti loggati</option>
          <option value="private">Nessuno (Uso solo per distanza da me)</option>
        </select>
      </div>

      <div class="space-y-2">
        <label
          for="precision"
          class="block text-sm font-medium text-paynes-gray">
          Livello di Offuscamento (Precisione):
        </label>

        <div
          class="text-center text-lg font-bold text-zomp p-1 bg-ash-gray/20 rounded-md">
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
            class="w-full h-2 bg-thistle rounded-lg appearance-none cursor-pointer range-lg dark:bg-ash-gray focus:outline-none focus:ring-2 focus:ring-zomp" />
        </div>

        <div class="flex justify-between text-xs text-paynes-gray/70">
          <span>Posizione Esatta (0m)</span>
          <span>Area Larga (500m)</span>
        </div>

        <p class="text-xs text-paynes-gray/70 mt-1">
          Scegli quanto vuoi che la tua posizione sia offuscata, per incrementi
          di 10 metri.
        </p>
      </div>
    </div>

    <div class="flex justify-between space-x-4">
      <button
        @click="skipAndContinue"
        class="w-1/2 bg-thistle text-paynes-gray py-3 rounded-lg hover:bg-ash-gray transition duration-150 font-bold text-lg">
        Salta
      </button>
    <button
        @click="saveLocation"
        :disabled="!isLocationSet || !authStore.isAuthenticated" id="save-location-btn"
        class="w-1/2 bg-zomp text-white py-3 rounded-lg hover:bg-paynes-gray transition duration-150 disabled:opacity-50 font-bold text-lg">
        Salva Posizione
    </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue"
import { useRouter } from "vue-router"
import maplibregl from "maplibre-gl"
import { apiClient } from "@/services/apiClient"

const mapTilerApiKey = import.meta.env.VITE_MAPTILER_KEY
const geocodingServiceUrl = "https://api.maptiler.com/geocoding"

const router = useRouter()

const locationMode = ref("geo")
const form = ref({
  latitude: null,
  longitude: null,
  streetType: "Via",
  streetName: "",
  houseNumber: "",
  zipCode: "",
  city: "Roma",
  visibility: "all",
  blurRadius: 0,
})

const isLoadingLocation = ref(false)
const locationError = ref(null)

// --- COMPUTED PROPERTIES ---

const displayBlurRadius = computed(() => {
  const radius = form.value.blurRadius

  if (radius === 0 || radius === null || isNaN(radius)) {
    return "Posizione Esatta (0 metri)"
  }
  if (radius < 1000) {
    return `Offuscamento: ${radius} metri di raggio`
  } else {
    return `Offuscamento: ${(radius / 1000).toFixed(1)} km di raggio`
  }
})

const isAddressValid = computed(() => {
  return form.value.streetName.length > 0 && form.value.zipCode.length > 0
})

const isLocationSet = computed(() => {
  if (locationMode.value === "geo" && form.value.latitude) return true
  if (locationMode.value === "map" && form.value.latitude) return true
  if (locationMode.value === "address" && isAddressValid.value) return true
  return false
})

// --- MAP LIBRE STATE E LOGICA ---
const map = ref(null)
const marker = ref(null)
const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`

const initMap = async () => {
  if (map.value) {
    map.value.resize()
    return
  }

  await nextTick()

  if (document.getElementById("map")) {
    map.value = new maplibregl.Map({
      container: "map",
      style: styleUrl,
      center: [12.4963, 41.9029],
      zoom: 12,
    })

    marker.value = new maplibregl.Marker({ color: "#495d63" })
      .setLngLat(map.value.getCenter())
      .addTo(map.value)

    map.value.on("click", (e) => {
      const { lng, lat } = e.lngLat
      form.value.latitude = lat
      form.value.longitude = lng
      marker.value.setLngLat([lng, lat])
    })

    if (form.value.latitude && form.value.longitude) {
      marker.value.setLngLat([form.value.longitude, form.value.latitude])
      map.value.setCenter([form.value.longitude, form.value.latitude])
    }
  }
}

// --- GESTIONE DEL CAMBIO MODALITÀ ---

watch(locationMode, (newMode) => {
  locationError.value = null
  form.value.latitude = null
  form.value.longitude = null

  if (newMode === "map") {
    initMap()
  }
})

onMounted(() => {
  if (locationMode.value === "map") {
    initMap()
  }
})

watch([() => form.value.streetName, () => form.value.zipCode], () => {
  if (locationMode.value === "address") {
    form.value.latitude = null
    form.value.longitude = null
  }
})

// --- GEOLOCALIZZAZIONE BROWSER (GPS) ---
async function getGeolocation() {
  locationError.value = null
  isLoadingLocation.value = true
  form.value.latitude = null
  form.value.longitude = null

  if (!navigator.geolocation) {
    locationError.value = "Geolocalizzazione non supportata dal browser."
    isLoadingLocation.value = false
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = position.coords.latitude
      form.value.longitude = position.coords.longitude
      isLoadingLocation.value = false
      console.log(`Geolocalizzazione riuscita: Lat=${form.value.latitude}, Lng=${form.value.longitude}`)
    },
    (error) => {
      let errorMessage = "Errore sconosciuto"
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Permesso negato. Abilita la geolocalizzazione nel browser."
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Posizione non disponibile."
          break
        case error.TIMEOUT:
          errorMessage = "Timeout nella richiesta di geolocalizzazione."
          break
      }
      locationError.value = errorMessage
      isLoadingLocation.value = false
      console.error("Errore geolocalizzazione:", error)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

// --- GEOCODIFICA INDIRIZZO ---
async function geocodeAddress() {
  locationError.value = null
  isLoadingLocation.value = true
  form.value.latitude = null
  form.value.longitude = null

  if (!isAddressValid.value) {
    locationError.value = "Devi compilare i campi Via e CAP."
    isLoadingLocation.value = false
    return
  }

  const addressPart = `${form.value.streetType} ${form.value.streetName} ${form.value.houseNumber || ''}, ${form.value.zipCode} ${form.value.city}`
  const url = `${geocodingServiceUrl}/${encodeURIComponent(addressPart)}.json?key=${mapTilerApiKey}&limit=1&language=it&country=IT&bbox=12.2,41.7,12.7,42.0`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Geocodifica fallita: Errore HTTP ${response.status}`)
    }

    const data = await response.json()
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates
      form.value.latitude = lat
      form.value.longitude = lng
      console.log(`Geocodifica riuscita: Lat=${lat}, Lng=${lng}`)
    } else {
      locationError.value = "Indirizzo non trovato o non valido nell'area di Roma."
    }
  } catch (e) {
    console.error("Errore Geocoding API:", e)
    locationError.value = `Errore API: ${e.message}. Riprova.`
  } finally {
    isLoadingLocation.value = false
  }
}

// --- GESTIONE DEI PULSANTI FINALI ---

async function saveLocation() {
  // Gestione modalità indirizzo: geocodifica se necessario
  if (locationMode.value === "address") {
    if (!isAddressValid.value) {
      locationError.value = "Devi compilare i campi Via e CAP."
      return
    }

    if (!form.value.latitude || !form.value.longitude) {
      await geocodeAddress()
      if (locationError.value || !form.value.latitude) return
    }
  }

  // Verifica finale per tutte le modalità
  if (form.value.latitude && form.value.longitude) {
    const payload = {
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      blurRadius: form.value.blurRadius,
      visibility: form.value.visibility,
    }

    try {
      await apiClient.post('/users/set-location', payload) 
      console.log("Posizione salvata con successo. Payload:", payload)
      router.push({ 
        path: '/library', 
        query: { from: 'setup', visibility: form.value.visibility } 
      })
    } catch (e) {
      locationError.value = "Errore durante il salvataggio della posizione nel server."
      console.error("Errore salvataggio BE:", e)
    }
  } else {
    locationError.value = "Seleziona una posizione valida prima di salvare."
  }
}

function skipAndContinue() {
  console.log("Posizione saltata. Navigazione a /library in modalità setup.")
  router.push({ 
    path: '/library', 
    query: { 
      from: 'setup', 
      visibility: form.value.visibility, 
      locationSkipped: true 
    } 
  })
}
</script>
