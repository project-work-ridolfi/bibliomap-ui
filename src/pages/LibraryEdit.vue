<template>
  <main class="max-w-4xl mx-auto p-6 space-y-8 relative text-theme-main">
    <div class="flex justify-between items-center mb-4">
      <button
        @click="goBack"
        aria-label="annulla e torna indietro"
        class="flex items-center text-theme-main opacity-70 hover:text-accent-color transition font-medium uppercase text-xs">
        <i class="fa-solid fa-arrow-left mr-2"></i> annulla
      </button>
      <h1 class="font-display text-2xl text-theme-main uppercase">modifica libreria</h1>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-accent-color"></i>
    </div>
    <div
      v-else-if="error"
      role="alert"
      class="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-center font-bold uppercase text-xs border border-red-200">
      {{ error }}
    </div>

    <article
      v-else-if="form.id"
      class="bg-theme-primary shadow-xl rounded-2xl border-2 border-border-color overflow-hidden custom-fade-in">
      <div class="md:grid md:grid-cols-2">
        <section
          class="p-6 flex flex-col justify-start space-y-6 border-b md:border-b-0 md:border-r border-border-color"
          aria-label="dettagli libreria">
          <header class="border-b border-border-color pb-4">
            <h2 class="text-2xl font-display text-theme-main uppercase">
              {{ form.name }}
            </h2>
            <p class="text-sm text-theme-main opacity-60">
              modifica il dettaglio della libreria
            </p>
          </header>

          <div class="space-y-4">
            <div>
              <label
                for="libraryName"
                class="block text-[10px] font-bold text-theme-main uppercase mb-1"
                >nome libreria</label
              >
              <!-- input nome libreria -->
              <input
                v-model="form.name"
                id="libraryName"
                type="text"
                aria-label="nome della libreria"
                placeholder="nome della collezione"
                class="filter-input" />
            </div>

            <div>
              <label
                for="visibility"
                class="block text-[10px] font-bold text-theme-main uppercase mb-1"
                >visibilità</label
              >
              <!-- selezione livello visibilita libreria -->
              <select
                v-model="form.visibility"
                id="visibility"
                aria-label="seleziona visibilita della libreria"
                class="filter-input">
                <option value="all">pubblica (visibile a tutti)</option>
                <option value="logged_in">
                  visibile solo a utente registrato
                </option>
                <option value="private">privata (visibile solo a te)</option>
              </select>
              <p class="text-[10px] text-theme-main opacity-60 mt-1 italic font-medium uppercase">
                se è privata, solo tu potrai vedere i libri e la posizione.
              </p>
            </div>

            <hr class="border-border-color" />

            <div class="space-y-2">
              <label
                for="precision"
                class="block text-[10px] font-bold text-theme-main uppercase">
                livello di offuscamento
              </label>

              <!-- display valore blur radius -->
              <div
                class="text-center text-lg font-bold text-accent-color p-1 bg-theme-secondary rounded-md border border-border-color"
                aria-live="polite">
                {{ displayBlurRadius }}
              </div>

              <!-- slider controllo blur radius -->
              <div class="flex items-center space-x-3">
                <input
                  type="range"
                  id="precision"
                  v-model.number="form.blurRadius"
                  min="0"
                  max="500"
                  step="10"
                  aria-label="slider livello offuscamento posizione"
                  class="w-full h-2 bg-thistle rounded-lg appearance-none cursor-pointer accent-accent-color" />
              </div>

              <div class="flex justify-between text-[10px] text-theme-main opacity-60 font-bold uppercase">
                <span>posizione esatta (0m)</span>
                <span>area larga (500m)</span>
              </div>
            </div>
          </div>
        </section>

        <section 
          class="p-6 space-y-4 bg-theme-secondary md:bg-theme-primary"
          aria-label="gestione posizione libreria">
          <h3
            class="text-sm font-bold text-theme-main border-b border-border-color pb-2 uppercase">
            posizione libreria
          </h3>

          <p v-if="form.latitude" class="text-[10px] text-accent-color font-bold uppercase">
            posizione attuale: lat {{ form.latitude.toFixed(4) }}, lng
            {{ form.longitude.toFixed(4) }}
          </p>

          <!-- pulsanti modalita acquisizione posizione -->
          <div class="grid grid-cols-3 gap-3">
            <button
              @click="locationMode = 'geo'"
              :class="
                locationMode === 'geo'
                  ? 'btn-filters--active border-accent-color'
                  : 'bg-theme-primary border-border-color text-theme-main opacity-70'
              "
              aria-label="utilizza gps del browser"
              :aria-pressed="locationMode === 'geo'"
              class="p-2 rounded-lg shadow-sm transition font-bold border-2 text-[10px] uppercase">
              <i class="fa-solid fa-location-arrow mb-1"></i><br />
              gps
            </button>
            <button
              @click="locationMode = 'map'"
              :class="
                locationMode === 'map'
                  ? 'btn-filters--active border-accent-color'
                  : 'bg-theme-primary border-border-color text-theme-main opacity-70'
              "
              aria-label="seleziona posizione su mappa interattiva"
              :aria-pressed="locationMode === 'map'"
              class="p-2 rounded-lg shadow-sm transition font-bold border-2 text-[10px] uppercase">
              <i class="fa-solid fa-map-pin mb-1"></i><br />
              mappa
            </button>
            <button
              @click="locationMode = 'address'"
              :class="
                locationMode === 'address'
                  ? 'btn-filters--active border-accent-color'
                  : 'bg-theme-primary border-border-color text-theme-main opacity-70'
              "
              aria-label="inserisci indirizzo manuale"
              :aria-pressed="locationMode === 'address'"
              class="p-2 rounded-lg shadow-sm transition font-bold border-2 text-[10px] uppercase">
              <i class="fa-solid fa-house mb-1"></i><br />
              indirizzo
            </button>
          </div>

          <div class="relative h-96 pt-2">
            <!-- errore durante ricerca posizione -->
            <div
              v-if="locationError"
              role="alert"
              class="absolute inset-x-0 top-0 text-[10px] text-red-500 font-bold uppercase p-2 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded z-10">
              errore: {{ locationError }}
            </div>

            <!-- modalita gps geolocalizzazione -->
            <div
              v-if="locationMode === 'geo'"
              class="flex flex-col h-full justify-center items-center text-center p-4 bg-theme-secondary rounded-xl border border-border-color space-y-2">
              <p class="text-xs text-theme-main font-bold uppercase opacity-70">
                clicca per usare la posizione del browser.
              </p>
              <button
                @click="getGeolocation"
                :disabled="isLoadingLocation"
                aria-label="ottieni posizione attuale da gps"
                class="btn-sort px-6 py-2">
                <i
                  :class="
                    isLoadingLocation ? 'fa-spinner fa-spin' : 'fa-crosshairs'
                  "
                  class="fa-solid mr-2"></i>
                {{ isLoadingLocation ? "ricerca..." : "ottieni posizione" }}
              </button>
              <p v-if="tempLocation.latitude" aria-live="polite" class="text-[10px] text-accent-color font-bold uppercase">
                posizione ottenuta!
              </p>
            </div>

            <!-- modalita mappa interattiva -->
            <div v-else-if="locationMode === 'map'" class="h-full space-y-2">
              <div 
                id="map-container" 
                aria-label="mappa interattiva per selezionare posizione"
                class="h-64 w-full rounded-xl border border-border-color overflow-hidden shadow-inner">
                <div id="map" class="h-full w-full"></div>
              </div>
              <p
                v-if="tempLocation.latitude"
                aria-live="polite"
                class="mt-2 text-[10px] text-accent-color font-bold uppercase">
                posizione selezionata! lat:
                {{ tempLocation.latitude.toFixed(4) }}, lng:
                {{ tempLocation.longitude.toFixed(4) }}
              </p>
              <p v-else class="mt-2 text-[10px] text-theme-main opacity-60 font-bold uppercase text-center">
                clicca sulla mappa per selezionare la posizione.
              </p>
            </div>

            <!-- modalita indirizzo manuale -->
            <div
              v-else-if="locationMode === 'address'"
              class="space-y-3 p-4 border rounded-xl border-border-color bg-theme-secondary h-full overflow-y-auto">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label
                    for="streetType"
                    class="block text-[10px] font-bold text-theme-main uppercase mb-1"
                    >tipo *</label
                  >
                  <!-- input tipo via piazza ecc -->
                  <input
                    v-model="formAddress.streetType"
                    id="streetType"
                    type="text"
                    required
                    aria-label="tipo di via piazza ecc"
                    placeholder="via, piazza, ecc."
                    class="filter-input" />
                </div>
                <div>
                  <label
                    for="streetName"
                    class="block text-[10px] font-bold text-theme-main uppercase mb-1"
                    >nome via *</label
                  >
                  <!-- input nome della via -->
                  <input
                    v-model="formAddress.streetName"
                    id="streetName"
                    type="text"
                    required
                    aria-label="nome della via"
                    placeholder="garibaldi, ecc."
                    class="filter-input" />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label
                    for="houseNumber"
                    class="block text-[10px] font-bold text-theme-main uppercase mb-1"
                    >civico</label
                  >
                  <!-- input numero civico -->
                  <input
                    v-model="formAddress.houseNumber"
                    id="houseNumber"
                    type="text"
                    aria-label="numero civico"
                    placeholder="10a"
                    class="filter-input" />
                </div>
                <div>
                  <label
                    for="zipCode"
                    class="block text-[10px] font-bold text-theme-main uppercase mb-1"
                    >cap *</label
                  >
                  <!-- input codice postale -->
                  <input
                    v-model="formAddress.zipCode"
                    id="zipCode"
                    type="text"
                    required
                    aria-label="codice postale"
                    placeholder="001xx"
                    class="filter-input" />
                </div>
                <div>
                  <label
                    for="city"
                    class="block text-[10px] font-bold text-theme-main uppercase mb-1"
                    >città</label
                  >
                  <!-- citta predefinita roma non modificabile -->
                  <input
                    id="city"
                    value="Roma"
                    disabled
                    aria-label="citta roma predefinita"
                    class="filter-input opacity-60 cursor-not-allowed" />
                </div>
              </div>
              <!-- geocodifica indirizzo in coordinate -->
              <button
                @click="geocodeAddress"
                :disabled="isLoadingLocation || !isAddressValid"
                aria-label="converti indirizzo in coordinate geografiche"
                class="btn-sort w-full mt-2 py-2">
                <i
                  :class="
                    isLoadingLocation ? 'fa-spinner fa-spin' : 'fa-search'
                  "
                  class="fa-solid mr-2"></i>
                {{ isLoadingLocation ? "ricerca..." : "cerca indirizzo" }}
              </button>
              <p
                v-if="tempLocation.latitude && !locationError"
                aria-live="polite"
                class="text-[10px] text-accent-color font-bold uppercase mt-2">
                indirizzo convertito! lat:
                {{ tempLocation.latitude.toFixed(4) }}, lng:
                {{ tempLocation.longitude.toFixed(4) }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div class="p-6 border-t border-border-color flex justify-between gap-3 bg-theme-secondary">
        <!-- apertura modal conferma eliminazione libreria -->
        <button
          @click="openDeleteModal"
          aria-label="elimina libreria definitivamente"
          class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition border border-transparent hover:border-red-200 font-bold uppercase text-[10px] tracking-wider">
          <i class="fa-solid fa-trash mr-1"></i> elimina libreria
        </button>
        <!-- salva modifiche libreria -->
        <button
          @click="saveChanges"
          :disabled="isSaving || !form.name"
          :aria-busy="isSaving"
          aria-label="salva modifiche libreria"
          class="btn-modal-confirm px-8 py-2 justify-center text-xs tracking-widest uppercase"
          :class="isSaving || !form.name ? 'opacity-30 cursor-not-allowed' : ''">
          <span v-if="isSaving">
            <i class="fa-solid fa-circle-notch fa-spin"></i> salvataggio...
          </span>
          <span v-else> <i class="fa-solid fa-floppy-disk"></i> salva </span>
        </button>
      </div>
    </article>

    <!-- modal eliminazione libreria -->
    <app-modal
      :is-open="showDeleteModal"
      :title="deleteModalTitle"
      @close="handleModalClose">
      <!-- step conferma eliminazione -->
      <div
        v-if="deleteStep === 'confirm'"
        class="flex flex-col items-center text-center space-y-4 p-4 text-theme-main">
        <div
          class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mb-2">
          <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>

        <p class="text-lg font-bold uppercase tracking-tight">
          sei sicuro di voler eliminare la libreria "{{ form.name }}"?
        </p>

        <p
          class="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800 uppercase tracking-tighter">
          <i class="fa-solid fa-circle-info mr-1"></i>
          azione <strong>irreversibile</strong>. questa operazione cancellerà
          anche **tutti i libri** al suo interno.
        </p>

        <div class="flex gap-3 w-full mt-4">
          <button
            @click="showDeleteModal = false"
            aria-label="annulla eliminazione"
            class="flex-1 btn-modal-cancel uppercase text-xs font-bold">
            annulla
          </button>
          <!-- conferma eliminazione libreria -->
          <button
            @click="confirmDelete"
            aria-label="conferma eliminazione libreria definitivamente"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition flex justify-center items-center gap-2 uppercase text-xs">
            <i class="fa-solid fa-trash"></i> elimina definitivamente
          </button>
        </div>
      </div>

      <!-- step caricamento eliminazione -->
      <div
        v-else-if="deleteStep === 'loading'"
        class="flex flex-col items-center justify-center py-8 space-y-4">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500"></i>
        <p class="text-theme-main font-bold uppercase text-sm">eliminazione in corso...</p>
      </div>

      <!-- step successo eliminazione -->
      <div
        v-else-if="deleteStep === 'success'"
        class="flex flex-col items-center text-center space-y-4 p-4">
        <div
          class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-accent-color mb-2 animate-bounce">
          <i class="fa-solid fa-check text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold text-theme-main uppercase">libreria eliminata!</h3>
        <p class="text-sm text-theme-main opacity-70 italic font-medium">
          l'operazione è andata a buon fine. sarai reindirizzato alla home page.
        </p>
        <!-- chiudi modal e torna home -->
        <button
          @click="handleModalClose"
          aria-label="chiudi notifica e vai alla home"
          class="w-full mt-4 btn-modal-confirm justify-center uppercase font-bold text-xs tracking-widest py-3">
          chiudi e vai alla home
        </button>
      </div>

      <!-- step errore eliminazione -->
      <div
        v-else-if="deleteStep === 'error'"
        class="flex flex-col items-center text-center space-y-4 p-4 text-theme-main">
        <div
          class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mb-2">
          <i class="fa-solid fa-xmark text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold uppercase text-red-600">qualcosa è andato storto</h3>
        <p class="text-sm opacity-70 uppercase font-bold">
          non è stato possibile eliminare la libreria. riprova.
        </p>
        <button
          @click="showDeleteModal = false"
          aria-label="chiudi modal errore"
          class="w-full mt-4 btn-modal-cancel uppercase font-bold text-xs py-3">
          chiudi
        </button>
      </div>
    </app-modal>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/AppModal.vue";

const route = useRoute();
const router = useRouter();

const mapTilerApiKey = import.meta.env.VITE_MAPTILER_KEY;
const geocodingServiceUrl = "https://api.maptiler.com/geocoding";
const ROME_CENTER = [12.4963, 41.9029];

// form principale dati libreria
const form = reactive({
  id: "",
  name: "",
  visibility: "all",
  latitude: null,
  longitude: null,
  blurRadius: 0,
});

// modalita acquisizione posizione
const locationMode = ref("map");
// posizione temporanea durante modifica
const tempLocation = reactive({ latitude: null, longitude: null });
// dati indirizzo manuale
const formAddress = reactive({
  streetType: "via",
  streetName: "",
  houseNumber: "",
  zipCode: "",
  city: "Roma",
});

const isLoading = ref(true);
const isSaving = ref(false);
const isLoadingLocation = ref(false);
const error = ref(null);
const locationError = ref(null);

// modal eliminazione libreria
const showDeleteModal = ref(false);
// step del processo eliminazione
const deleteStep = ref("confirm");

const map = ref(null);
const marker = ref(null);
const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`;

// formatta display del raggio offuscamento
const displayBlurRadius = computed(() => {
  const radius = form.blurRadius;
  if (radius === 0 || radius === null || isNaN(radius))
    return "esatta (0m)";
  if (radius < 1000) return `${radius}m di raggio`;
  return `${(radius / 1000).toFixed(1)} km di raggio`;
});

// valida campi obbligatori indirizzo manuale
const isAddressValid = computed(() => {
  return formAddress.streetName.length > 0 && formAddress.zipCode.length > 0;
});

// titolo modal eliminazione in base al step
const deleteModalTitle = computed(() => {
  switch (deleteStep.value) {
    case "confirm":
      return "conferma eliminazione";
    case "loading":
      return "attendere...";
    case "success":
      return "completato";
    case "error":
      return "errore";
    default:
      return "";
  }
});

// torna alla pagina precedente
function goBack() {
  router.back();
}

// carica dati libreria da api
async function loadData() {
  isLoading.value = true;
  error.value = null;
  const libraryId = route.params.id;

  try {
    const response = await apiClient.get(`/libraries/${libraryId}`);
    form.id = response.id;
    form.name = response.name;
    form.visibility = response.visibility || "all";
    form.latitude = response.latitude;
    form.longitude = response.longitude;
    form.blurRadius = response.blurRadius || 0;

    tempLocation.latitude = form.latitude;
    tempLocation.longitude = form.longitude;
  } catch (e) {
    error.value = "errore caricamento dati";
    console.error(e);
  } finally {
    isLoading.value = false;
  }
}

// inizializza mappa maplibre
const initMap = async () => {
  await nextTick();
  const mapDiv = document.getElementById("map");
  if (mapDiv) {
    if (map.value) {
      map.value.remove();
      map.value = null;
      marker.value = null;
    }

    const initialCenter = tempLocation.longitude
      ? [tempLocation.longitude, tempLocation.latitude]
      : ROME_CENTER;

    map.value = new maplibregl.Map({
      container: "map",
      style: styleUrl,
      center: initialCenter,
      zoom: 12,
    });

    // marcatore mappa colore verde
    marker.value = new maplibregl.Marker({ color: "#629677" })
      .setLngLat(initialCenter)
      .addTo(map.value);

    // aggiorna posizione al click su mappa
    map.value.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      tempLocation.latitude = lat;
      tempLocation.longitude = lng;
      marker.value.setLngLat([lng, lat]);
    });
  }
};

// ottiene posizione utente da gps
async function getGeolocation() {
  locationError.value = null;
  isLoadingLocation.value = true;
  if (!navigator.geolocation) {
    locationError.value = "geolocalizzazione non supportata.";
    isLoadingLocation.value = false;
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      tempLocation.latitude = position.coords.latitude;
      tempLocation.longitude = position.coords.longitude;
      isLoadingLocation.value = false;
    },
    (e) => {
      locationError.value = "permesso negato o posizione non disponibile.";
      isLoadingLocation.value = false;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

// geocodifica indirizzo in coordinate
async function geocodeAddress() {
  locationError.value = null;
  isLoadingLocation.value = true;
  if (!isAddressValid.value) {
    locationError.value = "campi via e cap obbligatori.";
    isLoadingLocation.value = false;
    return;
  }

  const addressPart = `${formAddress.streetType} ${formAddress.streetName}, ${formAddress.zipCode} Roma`;
  const url = `${geocodingServiceUrl}/${encodeURIComponent(addressPart)}.json?key=${mapTilerApiKey}&limit=1&country=IT`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      tempLocation.latitude = lat;
      tempLocation.longitude = lng;
    } else {
      locationError.value = "indirizzo non trovato a roma.";
    }
  } catch (e) {
    locationError.value = "errore nella ricerca indirizzo.";
  } finally {
    isLoadingLocation.value = false;
  }
}

// salva modifiche libreria su api
async function saveChanges() {
  isSaving.value = true;
  locationError.value = null;

  // geocodifica se indirizzo non ancora convertito
  if (locationMode.value === "address" && !tempLocation.latitude) {
    await geocodeAddress();
    if (locationError.value || !tempLocation.latitude) {
      isSaving.value = false;
      return;
    }
  }

  if (!tempLocation.latitude || !tempLocation.longitude) {
    locationError.value = "seleziona una posizione valida.";
    isSaving.value = false;
    return;
  }

  // verifica se posizione e cambiata
  const isLocationChanged =
    tempLocation.latitude != form.latitude ||
    tempLocation.longitude != form.longitude;

  const payload = {
    name: form.name,
    visibility: form.visibility,
    latitude: tempLocation.latitude,
    longitude: tempLocation.longitude,
    blurRadius: form.blurRadius,
    locationType: isLocationChanged ? "new_location" : "old_location",
  };

  try {
    await apiClient.put(`/libraries/${form.id}`, payload);
    router.push(`/libraries/${form.id}`);
  } catch (e) {
    error.value = "errore durante il salvataggio.";
  } finally {
    isSaving.value = false;
  }
}

// apre modal eliminazione libreria
function openDeleteModal() {
  deleteStep.value = "confirm";
  showDeleteModal.value = true;
}

// elimina libreria su api
async function confirmDelete() {
  deleteStep.value = "loading";
  try {
    await apiClient.delete(`/libraries/${form.id}`);
    setTimeout(() => { deleteStep.value = "success"; }, 800);
  } catch (e) {
    deleteStep.value = "error";
  }
}

// gestisce chiusura modal con navigazione se successo
function handleModalClose() {
  showDeleteModal.value = false;
  if (deleteStep.value === "success") {
    router.push("/");
  }
}

// guarda cambio modalita per inizializzare mappa
watch(locationMode, async (newMode, oldMode) => {
  locationError.value = null;
  if (oldMode === "map" && map.value) {
    map.value.remove();
    map.value = null;
    marker.value = null;
  }
  if (newMode === "map") {
    await initMap();
    if (map.value && tempLocation.longitude) {
      map.value.setCenter([tempLocation.longitude, tempLocation.latitude]);
    }
  }
});

// sincronizza marcatore mappa con tempLocation
watch(
  () => [tempLocation.latitude, tempLocation.longitude],
  ([lat, lng]) => {
    if (locationMode.value === "map" && marker.value && lat && lng) {
      marker.value.setLngLat([lng, lat]);
    }
  }
);

// carica dati al mount
onMounted(async () => {
  await loadData();
  if (locationMode.value === "map") {
    await initMap();
  }
});
</script>