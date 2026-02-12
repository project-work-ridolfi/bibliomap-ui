<template>
  <div
    class="max-w-xl mx-auto p-8 bg-theme-primary shadow-xl rounded-2xl border-2 border-thistle space-y-6 relative">
    <button
      @click="handleBack"
      aria-label="torna alla pagina precedente"
      class="absolute top-4 left-4 text-theme-main hover:text-zomp transition-colors flex items-center gap-2 font-bold text-xs uppercase">
      <i class="fa-solid fa-arrow-left"></i> torna indietro
    </button>

    <div v-if="isFirstLibrary" class="space-y-4 text-center pt-4">
      <h1 class="text-3xl font-display text-theme-main uppercase">
        Crea la tua prima libreria
      </h1>
      <p class="text-theme-main opacity-70 text-sm">
        una libreria in bibliomap rappresenta una collezione fisica di libri in
        un luogo specifico.
      </p>
    </div>
    <div v-else class="text-center pt-4">
      <h1 class="text-3xl font-display text-theme-main uppercase">
        Aggiungi una Nuova Libreria
      </h1>
    </div>

    <hr class="border-thistle" />

    <div class="space-y-4">
      <div>
        <label
          for="libraryName"
          class="block text-xs font-bold uppercase mb-1 text-theme-main"
          >nome libreria *</label
        >
        <input
          v-model="form.name"
          id="libraryName"
          type="text"
          required
          aria-label="inserisci nome della libreria"
          placeholder="es. scaffale in salotto"
          class="filter-input" />
      </div>

      <div>
        <label class="block text-xs font-bold uppercase mb-1 text-theme-main"
          >posizione</label
        >
        <p class="text-[10px] text-theme-main opacity-60 mb-2 uppercase font-bold">
          dove si trovano fisicamente questi libri?
        </p>
        <div class="grid grid-cols-2 gap-4">
          <button
            @click="form.location = 'user_default'"
            :class="
              form.location === 'user_default'
                ? 'bg-zomp text-white border-zomp'
                : 'bg-theme-primary text-theme-main border-thistle'
            "
            :disabled="userHasSkippedLocation"
            aria-label="usa la mia posizione registrata"
            class="p-4 rounded-xl shadow-md transition duration-150 font-bold border-2 disabled:opacity-30 uppercase text-[10px]">
            usa la mia posizione
          </button>
          <button
            @click="form.location = 'new_location'"
            :class="
              form.location === 'new_location'
                ? 'bg-zomp text-white border-zomp'
                : 'bg-theme-primary text-theme-main border-thistle'
            "
            aria-label="inserisci una nuova posizione"
            class="p-4 rounded-xl shadow-md transition duration-150 font-bold border-2 uppercase text-[10px]">
            nuova posizione
          </button>
        </div>

        <!-- sezione inserimento posizione libreria -->
        <div
          v-if="form.location === 'new_location'"
          class="mt-4 space-y-4 p-4 border rounded-xl border-thistle bg-theme-secondary custom-fade-in">
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="libLocMode = 'geo'"
              :class="libLocMode === 'geo' ? 'bg-zomp text-white border-zomp' : 'bg-theme-primary border-thistle'"
              aria-label="ottieni posizione da browser"
              class="p-2 border rounded-lg text-[10px] font-bold uppercase transition">
              browser
            </button>
            <button
              @click="libLocMode = 'map'"
              :class="libLocMode === 'map' ? 'bg-zomp text-white border-zomp' : 'bg-theme-primary border-thistle'"
              aria-label="seleziona posizione da mappa interattiva"
              class="p-2 border rounded-lg text-[10px] font-bold uppercase transition">
              mappa
            </button>
            <button
              @click="libLocMode = 'address'"
              :class="libLocMode === 'address' ? 'bg-zomp text-white border-zomp' : 'bg-theme-primary border-thistle'"
              aria-label="inserisci indirizzo manualmente"
              class="p-2 border rounded-lg text-[10px] font-bold uppercase transition">
              indirizzo
            </button>
          </div>

          <!-- input indirizzo manuale -->
          <div v-if="libLocMode === 'address'" class="space-y-2">
            <input
              v-model="form.streetName"
              type="text"
              aria-label="inserisci nome della via"
              placeholder="nome della via"
              class="filter-input text-sm" />
            <div class="flex gap-2">
              <input
                v-model="form.zipCode"
                type="text"
                aria-label="inserisci codice postale"
                placeholder="cap"
                class="filter-input text-sm w-1/2" />
              <input
                value="Roma"
                disabled
                aria-label="città predefinita roma"
                class="filter-input text-sm w-1/2 bg-theme-primary opacity-50 cursor-not-allowed" />
            </div>
          </div>

          <!-- mappa interattiva -->
          <div v-else-if="libLocMode === 'map'" class="space-y-2">
            <div
              id="map-lib-container"
              aria-label="mappa interattiva per selezionare posizione libreria"
              class="h-48 w-full rounded-lg border-2 border-thistle overflow-hidden">
              <div id="map-lib" class="h-full w-full"></div>
            </div>
          </div>

          <!-- geolocalizzazione browser -->
          <div v-else-if="libLocMode === 'geo'" class="text-center space-y-2">
            <button
              @click="getLibGeolocation"
              :disabled="isLoadingLoc"
              aria-label="ottieni posizione attuale da gps"
              class="btn-sort inline-flex py-2 px-4 text-[10px]">
              <i
                v-if="isLoadingLoc"
                class="fa-solid fa-spinner fa-spin mr-2"></i>
              {{ isLoadingLoc ? "ricerca..." : "ottieni posizione" }}
            </button>
            <p
              v-if="form.latitude"
              class="text-[10px] text-zomp font-bold uppercase">
              posizione ottenuta: {{ form.latitude.toFixed(4) }},
              {{ form.longitude.toFixed(4) }}
            </p>
          </div>

          <p
            v-if="form.latitude"
            class="text-center text-[10px] text-zomp font-bold uppercase">
            posizione libreria impostata!
          </p>
        </div>

        <!-- messaggio errore posizione obbligatoria -->
        <p
          v-if="userHasSkippedLocation && form.location === 'user_default'"
          role="alert"
          class="text-xs text-red-500 font-bold mt-2 text-center uppercase">
          devi specificare una nuova posizione per la libreria.
        </p>
      </div>

      <!-- selezione visibilita libreria -->
      <div>
        <label
          for="visibility"
          class="block text-xs font-bold uppercase mb-1 text-theme-main"
          >visibilità libreria</label
        >
        <select
          v-model="form.visibility"
          id="visibility"
          aria-label="seleziona livello di visibilita della libreria"
          class="filter-input">
          <option value="all">tutti</option>
          <option value="logged_in">solo gli utenti loggati</option>
          <option value="private">nessuno (solo io)</option>
        </select>
      </div>
    </div>

    <!-- messaggio errore creazione -->
    <p
      v-if="errorMessage"
      role="alert"
      class="text-xs text-red-500 font-bold mt-2 text-center uppercase">
      {{ errorMessage }}
    </p>

    <!-- pulsanti azione -->
    <div class="flex justify-between space-x-4 pt-4">
      <button
        v-if="isFirstLibrary"
        @click="skip"
        aria-label="salta creazione libreria"
        class="w-1/2 btn-modal-cancel py-3 text-lg uppercase">
        salta
      </button>
      <button
        @click="createLibrary"
        :disabled="!isFormValid"
        :aria-busy="false"
        :class="isFirstLibrary ? 'w-1/2' : 'w-full'"
        aria-label="salva e crea nuova libreria"
        class="btn-modal-confirm py-3 text-lg uppercase justify-center">
        {{ isFirstLibrary ? "continua" : "crea libreria" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import maplibregl from "maplibre-gl";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// verifica se e la prima libreria dell'utente
const isFirstLibrary = computed(() => route.query.from === "setup");
// verifica se utente ha saltato fase geolocalizzazione
const userHasSkippedLocation = computed(
  () => route.query.locationSkipped === "true"
);

// se arriviamo da setup, il tasto indietro torna a set-location
const returnTo = computed(() => {
  if (isFirstLibrary.value) return "/set-location";
  return route.query.returnTo || "/";
});

// modalita inserimento posizione geo mappa o indirizzo
const libLocMode = ref("geo");
const isLoadingLoc = ref(false);
// form dati libreria
const form = ref({
  name: "",
  location: "user_default",
  visibility: "all",
  latitude: null,
  longitude: null,
  streetName: "",
  zipCode: "",
});

const errorMessage = ref(null);
// istanza mappa maplibre
const map = ref(null);
// marcatore mappa
const marker = ref(null);

// valida form in base alla modalita inserimento
const isFormValid = computed(() => {
  const nameSet = form.value.name.trim() !== "";
  if (form.value.location === "new_location") {
    return (
      nameSet &&
      (form.value.latitude !== null ||
        (form.value.streetName !== "" && form.value.zipCode !== ""))
    );
  }
  return nameSet && !userHasSkippedLocation.value;
});

// torna alla pagina precedente
const handleBack = () => {
  router.push(returnTo.value);
};

// inizializza mappa interattiva maplibre
const initLibMap = async () => {
  await nextTick();
  const container = document.getElementById("map-lib");
  if (!container) return;

  if (map.value) {
    map.value.remove();
    map.value = null;
  }

  const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
  map.value = new maplibregl.Map({
    container: "map-lib",
    style: `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerKey}`,
    center: [12.4963, 41.9029],
    zoom: 12,
  });

  // marcatore rosso posizione predefinita roma
  marker.value = new maplibregl.Marker({ color: "#629677" })
    .setLngLat([12.4963, 41.9029])
    .addTo(map.value);

  // aggiorna posizione al click su mappa
  map.value.on("click", (e) => {
    form.value.latitude = e.lngLat.lat;
    form.value.longitude = e.lngLat.lng;
    marker.value.setLngLat([e.lngLat.lng, e.lngLat.lat]);
  });
  
  // ridimensiona mappa al caricamento
  map.value.on('load', () => { map.value.resize(); });
};

// guarda cambio modalita per inizializzare mappa
watch(
  [libLocMode, () => form.value.location],
  async ([newMode, newLoc]) => {
    if (newMode === "map" && newLoc === "new_location") {
      await initLibMap();
    }
  },
  { immediate: true }
);

// ottiene posizione utente da geolocalizzazione browser
const getLibGeolocation = () => {
  isLoadingLoc.value = true;
  navigator.geolocation.getCurrentPosition(
    (p) => {
      form.value.latitude = p.coords.latitude;
      form.value.longitude = p.coords.longitude;
      isLoadingLoc.value = false;
    },
    () => {
      isLoadingLoc.value = false;
    }
  );
};

// crea libreria con api e naviga a aggiungi libro
const createLibrary = async () => {
  errorMessage.value = null;
  
  // geocodifica se indirizzo
  if (form.value.location === "new_location" && libLocMode.value === "address" && !form.value.latitude) {
    const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
    const addr = `Via ${form.value.streetName}, ${form.value.zipCode} Roma`;
    try {
      const res = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(addr)}.json?key=${mapTilerKey}`);
      const data = await res.json();
      if (data.features?.length) {
        form.value.latitude = data.features[0].geometry.coordinates[1];
        form.value.longitude = data.features[0].geometry.coordinates[0];
      }
    } catch (e) { console.error(e); }
  }

  const payload = {
    name: form.value.name,
    locationType: form.value.location,
    visibility: form.value.visibility,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
  };

  try {
    const response = await apiClient.post("/libraries", payload);
    router.push({
      path: "/add-book",
      query: {
        libraryId: response.libraryId,
        returnTo: returnTo.value,
        isSetup: isFirstLibrary.value ? "true" : "false",
      },
    });
  } catch (error) {
    errorMessage.value = error.body?.message || "errore durante la creazione della libreria";
  }
};

// inicializza form con dati setup
onMounted(() => {
  if (isFirstLibrary.value) {
    form.value.name = "la mia prima libreria";
    const initialVisibility = route.query.visibility;
    if (["all", "logged_in", "private"].includes(initialVisibility))
      form.value.visibility = initialVisibility;
    if (userHasSkippedLocation.value) form.value.location = "new_location";
  }
});

// pulisce mappa al unmount
onUnmounted(() => { if (map.value) map.value.remove(); });

// salta creazione libreria e torna home
const skip = () => { router.push("/"); };
</script>