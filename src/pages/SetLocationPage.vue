<template>
  <div
    class="max-w-xl mx-auto p-8 bg-theme-primary shadow-xl rounded-2xl border-2 border-thistle space-y-6">
    <h1 class="text-3xl font-display text-center text-theme-main uppercase">
      Dove ti trovi?
    </h1>
    <p class="text-center text-theme-main opacity-80">
      Per mostrarti i libri più vicini, abbiamo bisogno della tua posizione.
      Scegli come preferisci impostarla:
    </p>

    <div class="grid grid-cols-3 gap-4">
      <button
        @click="locationMode = 'geo'"
        :class="
          locationMode === 'geo'
            ? 'bg-zomp text-white border-zomp'
            : 'bg-theme-primary text-theme-main border-thistle hover:border-zomp'
        "
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2">
        <i class="fa-solid fa-location-arrow mb-2 text-xl"></i><br />
        Browser
      </button>
      <button
        @click="locationMode = 'map'"
        :class="
          locationMode === 'map'
            ? 'bg-zomp text-white border-zomp'
            : 'bg-theme-primary text-theme-main border-thistle hover:border-zomp'
        "
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2">
        <i class="fa-solid fa-map-pin mb-2 text-xl"></i><br />
        Sulla Mappa
      </button>
      <button
        @click="locationMode = 'address'"
        :class="
          locationMode === 'address'
            ? 'bg-zomp text-white border-zomp'
            : 'bg-theme-primary text-theme-main border-thistle hover:border-zomp'
        "
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2">
        <i class="fa-solid fa-house mb-2 text-xl"></i><br />
        Indirizzo
      </button>
    </div>

    <div
      v-if="locationMode === 'address'"
      class="space-y-3 p-4 border rounded-lg border-thistle bg-theme-primary custom-fade-in">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label
            for="streetType"
            class="block text-sm font-medium text-theme-main mb-1">
            Tipo di Indirizzo*
          </label>
          <input
            v-model="form.streetType"
            id="streetType"
            type="text"
            required
            placeholder="Via, Piazza, ecc."
            class="filter-input" />
        </div>
        <div>
          <label
            for="streetName"
            class="block text-sm font-medium text-theme-main mb-1">
            Nome della Via*
          </label>
          <input
            v-model="form.streetName"
            id="streetName"
            type="text"
            required
            placeholder="Roma, Garibaldi, ecc."
            class="filter-input" />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label
            for="houseNumber"
            class="block text-sm font-medium text-theme-main mb-1">
            Civico
          </label>
          <input
            v-model="form.houseNumber"
            id="houseNumber"
            type="text"
            placeholder="10A"
            class="filter-input" />
        </div>
        <div>
          <label
            for="zipCode"
            class="block text-sm font-medium text-theme-main mb-1">
            CAP*
          </label>
          <input
            v-model="form.zipCode"
            id="zipCode"
            type="text"
            required
            placeholder="001xx"
            class="filter-input" />
        </div>
        <div class="relative group">
          <label
            for="city"
            class="block text-sm font-medium text-theme-main mb-1">
            Città
          </label>
          <input
            id="city"
            value="Roma"
            disabled
            class="filter-input bg-theme-secondary opacity-60 cursor-not-allowed" />
          <div
            class="absolute top-full mt-2 hidden group-hover:block bg-paynes-gray text-white text-[10px] rounded py-1 px-2 z-10 w-40">
            Al momento il servizio è disponibile solo per Roma.
          </div>
        </div>
      </div>
      <p v-if="locationError" class="text-xs text-red-500 font-bold mt-2">
        ERRORE: {{ locationError }}
      </p>
      <p
        v-if="form.latitude && !locationError"
        class="text-xs text-zomp font-bold mt-2 uppercase">
        Indirizzo convertito! Lat: {{ form.latitude.toFixed(4) }}, Lng:
        {{ form.longitude.toFixed(4) }}
      </p>
    </div>

    <div
      v-else-if="locationMode === 'map'"
      class="text-center p-4 bg-theme-secondary rounded-lg border border-thistle custom-fade-in">
      <p class="text-sm text-theme-main font-medium mb-3">
        Clicca sulla mappa per impostare la tua posizione.
      </p>

      <div
        id="map-container"
        class="h-64 w-full rounded-xl overflow-hidden border border-thistle shadow-inner">
        <div id="map" class="h-full w-full"></div>
      </div>

      <p
        v-if="form.latitude"
        class="mt-3 text-xs text-zomp font-bold uppercase">
        Posizione selezionata! Lat: {{ form.latitude.toFixed(4) }}, Lng:
        {{ form.longitude.toFixed(4) }}
      </p>
      <p
        v-else
        class="mt-3 text-xs text-theme-main opacity-60 uppercase font-bold">
        Seleziona un punto sulla mappa.
      </p>
    </div>

    <div
      v-else-if="locationMode === 'geo'"
      class="text-center p-6 bg-theme-secondary rounded-lg border border-thistle custom-fade-in">
      <p class="text-sm text-theme-main font-bold mb-1">
        Clicca su "Ottieni Posizione" e accetta il popup del browser.
      </p>
      <p class="text-[10px] text-red-500 uppercase font-bold mb-4">
        Attenzione: Se usi una VPN, la posizione potrebbe non essere accurata.
      </p>
      <button
        @click="getGeolocation"
        :disabled="isLoadingLocation"
        class="btn-sort inline-flex max-w-xs mx-auto py-3 px-6 text-sm">
        <i
          :class="isLoadingLocation ? 'fa-spinner fa-spin' : 'fa-crosshairs'"
          class="fa-solid mr-2"></i>
        {{ isLoadingLocation ? "RICERCA IN CORSO..." : "OTTIENI POSIZIONE" }}
      </button>
      <p
        v-if="form.latitude"
        class="mt-4 text-xs text-zomp font-bold uppercase">
        Posizione ottenuta! ({{ form.latitude.toFixed(2) }},
        {{ form.longitude.toFixed(2) }})
      </p>
      <p v-if="locationError" class="mt-4 text-xs text-red-500 font-bold">
        ERRORE: {{ locationError }}
      </p>
    </div>

    <div class="space-y-6 pt-4 border-t border-thistle">
      <h2 class="text-xl font-display text-theme-main text-center uppercase">
        Privacy della Posizione
      </h2>

      <div
        class="p-4 bg-theme-secondary border-l-4 border-zomp rounded-r-lg text-xs text-theme-main font-medium">
        Qui decidi la precisione della tua posizione. Se scegli "Posizione
        Esatta" (0m), la tua posizione non verrà offuscata. Puoi cambiarla in
        qualsiasi momento dal tuo Profilo.
      </div>

      <div>
        <label
          for="visibility"
          class="block text-xs font-bold uppercase text-theme-main mb-2"
          >Chi può vedere dove ti trovi?</label
        >
        <select v-model="form.visibility" id="visibility" class="filter-input">
          <option value="all">Tutti gli utenti</option>
          <option value="friends">Solo utenti registrati</option>
          <option value="private">Nessuno (solo uso distanze personali)</option>
        </select>
      </div>

      <div class="space-y-3">
        <label
          for="precision"
          class="block text-xs font-bold uppercase text-theme-main">
          Livello di Offuscamento:
        </label>

        <div
          class="text-center text-lg font-bold text-zomp p-2 bg-theme-secondary border border-thistle rounded-lg">
          {{ displayBlurRadius }}
        </div>

        <input
          type="range"
          id="precision"
          v-model.number="form.blurRadius"
          min="0"
          max="500"
          step="10"
          class="w-full h-2 bg-thistle rounded-lg appearance-none cursor-pointer accent-zomp" />

        <div
          class="flex justify-between text-[10px] text-theme-main font-bold opacity-60 uppercase">
          <span>Esatta (0m)</span>
          <span>Area Larga (500m)</span>
        </div>
      </div>
    </div>

    <div class="flex justify-between space-x-4 pt-4">
      <button
        @click="skipAndContinue"
        class="w-1/2 btn-modal-cancel py-3 text-lg uppercase">
        Salta
      </button>
      <button
        @click="saveLocation"
        :disabled="!isLocationSet || !authStore.isAuthenticated"
        id="save-location-btn"
        class="w-1/2 btn-modal-confirm py-3 text-lg justify-center uppercase">
        Salva
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import maplibregl from "maplibre-gl";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";

const mapTilerApiKey = import.meta.env.VITE_MAPTILER_KEY;
const geocodingServiceUrl = "https://api.maptiler.com/geocoding";

const router = useRouter();
const authStore = useAuthStore();

const locationMode = ref("geo");
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
});

const isLoadingLocation = ref(false);
const locationError = ref(null);

const displayBlurRadius = computed(() => {
  const radius = form.value.blurRadius;
  if (!radius) return "Posizione Esatta (0m)";
  return `Offuscamento: ${radius}m di raggio`;
});

const isAddressValid = computed(() => {
  return form.value.streetName.length > 0 && form.value.zipCode.length > 0;
});

const isLocationSet = computed(() => {
  return (
    (form.value.latitude !== null && form.value.longitude !== null) ||
    (locationMode.value === "address" && isAddressValid.value)
  );
});

// --- LOGICA MAPPA ---
const map = ref(null);
const marker = ref(null);
const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`;

const initMap = async () => {
  await nextTick();
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  if (map.value) {
    map.value.remove();
    map.value = null;
  }

  map.value = new maplibregl.Map({
    container: "map",
    style: styleUrl,
    center: [12.4963, 41.9029],
    zoom: 12,
  });

  marker.value = new maplibregl.Marker({ color: "#495d63" })
    .setLngLat(map.value.getCenter())
    .addTo(map.value);

  map.value.on("click", (e) => {
    const { lng, lat } = e.lngLat;
    form.value.latitude = lat;
    form.value.longitude = lng;
    marker.value.setLngLat([lng, lat]);
  });

  if (form.value.latitude && form.value.longitude) {
    marker.value.setLngLat([form.value.longitude, form.value.latitude]);
    map.value.setCenter([form.value.longitude, form.value.latitude]);
  }

  map.value.on("load", () => {
    map.value.resize();
  });
};

watch(locationMode, async (newMode) => {
  locationError.value = null;
  if (newMode === "map") {
    await initMap();
  }
});

onMounted(async () => {
  if (locationMode.value === "map") {
    await initMap();
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

// --- GEOLOCALIZZAZIONE ---
async function getGeolocation() {
  locationError.value = null;
  isLoadingLocation.value = true;
  if (!navigator.geolocation) {
    locationError.value = "Geolocalizzazione non supportata.";
    isLoadingLocation.value = false;
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = position.coords.latitude;
      form.value.longitude = position.coords.longitude;
      isLoadingLocation.value = false;
    },
    (error) => {
      locationError.value = "Permesso negato o posizione non disponibile.";
      isLoadingLocation.value = false;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// --- GEOCODING ---
async function geocodeAddress() {
  locationError.value = null;
  isLoadingLocation.value = true;
  const addressPart = `${form.value.streetType} ${form.value.streetName}, ${form.value.zipCode} Roma`;
  const url = `${geocodingServiceUrl}/${encodeURIComponent(
    addressPart
  )}.json?key=${mapTilerApiKey}&limit=1&country=IT`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      form.value.latitude = lat;
      form.value.longitude = lng;
    } else {
      locationError.value = "Indirizzo non trovato a Roma.";
    }
  } catch (e) {
    locationError.value = "Errore durante la ricerca dell'indirizzo.";
  } finally {
    isLoadingLocation.value = false;
  }
}

// --- SALVATAGGIO ---
async function saveLocation() {
  if (
    locationMode.value === "address" &&
    (!form.value.latitude || !form.value.longitude)
  ) {
    await geocodeAddress();
    if (locationError.value) return;
  }

  if (form.value.latitude && form.value.longitude) {
    try {
      await apiClient.post("/users/set-location", {
        latitude: form.value.latitude,
        longitude: form.value.longitude,
        blurRadius: form.value.blurRadius,
        visibility: form.value.visibility,
      });
      router.push("/library");
    } catch (e) {
      locationError.value = "Errore nel salvataggio della posizione.";
    }
  }
}

function skipAndContinue() {
  router.push({ path: "/library", query: { locationSkipped: true } });
}
</script>
