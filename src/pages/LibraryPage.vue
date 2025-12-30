<template>
  <div class="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl border-2 border-thistle space-y-6">
    <div v-if="isFirstLibrary" class="space-y-4 text-center">
      <h1 class="text-3xl font-display text-paynes-gray">Crea la tua prima libreria</h1>
      <p class="text-paynes-gray">
        Una "libreria" in Bibliomap rappresenta una collezione fisica di libri in un luogo specifico.
      </p>
    </div>
    <div v-else class="text-center">
      <h1 class="text-3xl font-display text-paynes-gray">Aggiungi una Nuova Libreria</h1>
    </div>

    <hr class="border-thistle" />

    <div class="space-y-4">
      <div>
        <label for="libraryName" class="block text-sm font-medium text-paynes-gray">Nome Libreria *</label>
        <input v-model="form.name" id="libraryName" type="text" required placeholder="Es. Scaffale in salotto"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium text-paynes-gray">Posizione</label>
        <p class="text-xs text-paynes-gray/70 mb-2">Dove si trovano fisicamente questi libri?</p>
        <div class="grid grid-cols-2 gap-4">
          <button 
            @click="form.location = 'user_default'" 
            :class="form.location === 'user_default' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20'"
            :disabled="userHasSkippedLocation"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle disabled:opacity-50 disabled:cursor-not-allowed">
            Usa la mia posizione
          </button>
          <button @click="form.location = 'new_location'" :class="form.location === 'new_location' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20'"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
            Nuova Posizione
          </button>
        </div>

        <div v-if="form.location === 'new_location'" class="mt-4 space-y-4 p-4 border rounded-xl border-thistle bg-[var(--bg-secondary)] animate-fade-in">
          <div class="grid grid-cols-3 gap-2">
            <button @click="libLocMode = 'geo'" :class="libLocMode === 'geo' ? 'bg-zomp text-white' : 'bg-white'" class="p-2 border rounded-lg text-xs font-bold transition">Browser</button>
            <button @click="libLocMode = 'map'" :class="libLocMode === 'map' ? 'bg-zomp text-white' : 'bg-white'" class="p-2 border rounded-lg text-xs font-bold transition">Mappa</button>
            <button @click="libLocMode = 'address'" :class="libLocMode === 'address' ? 'bg-zomp text-white' : 'bg-white'" class="p-2 border rounded-lg text-xs font-bold transition">Indirizzo</button>
          </div>

          <div v-if="libLocMode === 'address'" class="space-y-2">
            <input v-model="form.streetName" type="text" placeholder="Nome della Via" class="w-full px-3 py-1 text-sm border rounded-lg outline-none" />
            <div class="flex gap-2">
              <input v-model="form.zipCode" type="text" placeholder="CAP" class="w-1/2 px-3 py-1 text-sm border rounded-lg outline-none" />
              <input value="Roma" disabled class="w-1/2 px-3 py-1 text-sm border rounded-lg bg-gray-50 opacity-60" />
            </div>
          </div>

          <div v-else-if="libLocMode === 'map'" class="space-y-2">
            <div id="map-lib-container" class="h-48 w-full rounded-lg border border-thistle">
              <div id="map-lib" class="h-full w-full rounded-lg"></div>
            </div>
          </div>

          <div v-else-if="libLocMode === 'geo'" class="text-center">
            <button @click="getLibGeolocation" :disabled="isLoadingLoc" class="text-xs bg-paynes-gray text-white px-4 py-2 rounded-lg">
              {{ isLoadingLoc ? 'Ricerca...' : 'Ottieni Posizione' }}
            </button>
          </div>

          <p v-if="form.latitude" class="text-center text-[10px] text-zomp font-bold">Posizione libreria impostata!</p>
        </div>

        <p v-if="userHasSkippedLocation && form.location === 'user_default'" class="text-xs text-red-700 font-semibold mt-2 text-center">
          Devi specificare una nuova posizione per la libreria.
        </p>
      </div>

      <div>
        <label for="visibility" class="block text-sm font-medium mb-1 text-paynes-gray">Visibilità Libreria</label>
        <select v-model="form.visibility" id="visibility"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp outline-none">
          <option value="all">Tutti</option>
          <option value="logged_in">Solo gli utenti loggati</option>
          <option value="private">Nessuno (Solo io)</option>
        </select>
      </div>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-700 font-medium mt-2 text-center">{{ errorMessage }}</p>

    <div class="flex justify-between space-x-4 pt-4">
      <button v-if="isFirstLibrary" @click="skip"
        class="w-1/2 bg-thistle text-paynes-gray py-3 rounded-lg hover:bg-ash-gray transition duration-150 font-bold text-lg">
        Salta
      </button>
      <button @click="createLibrary" :disabled="!isFormValid"
        :class="isFirstLibrary ? 'w-1/2' : 'w-full'"
        class="bg-zomp text-white py-3 rounded-lg hover:bg-paynes-gray transition duration-150 disabled:opacity-50 font-bold text-lg">
        {{ isFirstLibrary ? 'Crea e Aggiungi Libri' : 'Crea Libreria' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiClient } from '@/services/apiClient' 
import { useAuthStore } from '@/stores/authStore'
import maplibregl from "maplibre-gl"

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isFirstLibrary = computed(() => route.query.from === 'setup')
const userHasSkippedLocation = computed(() => route.query.locationSkipped === 'true')

const libLocMode = ref('geo')
const isLoadingLoc = ref(false)
const form = ref({
  name: '',
  location: 'user_default',
  visibility: 'all',
  latitude: null,
  longitude: null,
  streetName: '',
  zipCode: ''
})

const errorMessage = ref(null)
const map = ref(null)
const marker = ref(null)

const isFormValid = computed(() => {
    const nameSet = form.value.name.trim() !== ''
    if (form.value.location === 'new_location') {
        return nameSet && (form.value.latitude !== null || (form.value.streetName !== '' && form.value.zipCode !== ''))
    }
    return nameSet && !userHasSkippedLocation.value
})

const initLibMap = async () => {
  if (map.value) return
  await nextTick()
  const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY
  map.value = new maplibregl.Map({
    container: "map-lib",
    style: `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerKey}`,
    center: [12.4963, 41.9029],
    zoom: 12
  })
  marker.value = new maplibregl.Marker({ color: "#629677" }).setLngLat([12.4963, 41.9029]).addTo(map.value)
  map.value.on("click", (e) => {
    form.value.latitude = e.lngLat.lat
    form.value.longitude = e.lngLat.lng
    marker.value.setLngLat([e.lngLat.lng, e.lngLat.lat])
  })
}

watch(libLocMode, (mode) => {
    if (mode === 'map') initLibMap()
})

watch(() => form.value.location, (val) => {
    if (val === 'new_location' && libLocMode.value === 'map') initLibMap()
})

const getLibGeolocation = () => {
    isLoadingLoc.value = true
    navigator.geolocation.getCurrentPosition((p) => {
        form.value.latitude = p.coords.latitude
        form.value.longitude = p.coords.longitude
        isLoadingLoc.value = false
    }, () => { isLoadingLoc.value = false })
}

const createLibrary = async () => {
  errorMessage.value = null
  if (form.value.location === 'new_location' && libLocMode.value === 'address' && !form.value.latitude) {
      const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY
      const addr = `Via ${form.value.streetName}, ${form.value.zipCode} Roma`
      try {
          const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(addr)}.json?key=${mapTilerKey}`)
          const data = await res.json()
          if (data.features?.length) {
              form.value.latitude = data.features[0].geometry.coordinates[1]
              form.value.longitude = data.features[0].geometry.coordinates[0]
          }
      } catch (e) { console.error(e) }
  }

  const payload = {
      name: form.value.name,
      locationType: form.value.location, 
      visibility: form.value.visibility,
      latitude: form.value.latitude,
      longitude: form.value.longitude
  }

  try {
    const response = await apiClient.post('/libraries', payload)
    router.push(`/add-book?libraryId=${response.libraryId}`)
  } catch (error) {
    errorMessage.value = error.body?.message || "errore durante la creazione della libreria"
  }
}

onMounted(async () => {
  if (isFirstLibrary.value) {
    form.value.name = 'La mia prima libreria'
    const initialVisibility = route.query.visibility
    if (['all', 'logged_in', 'private'].includes(initialVisibility)) form.value.visibility = initialVisibility
    if (userHasSkippedLocation.value) form.value.location = 'new_location'
  }
})

const skip = () => { router.push('/') }
</script>