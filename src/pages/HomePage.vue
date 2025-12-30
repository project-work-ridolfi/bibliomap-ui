<template>
  <div
    id="home-page"
    class="flex flex-col w-full h-[calc(100vh-80px)] lg:px-4 gap-3 overflow-hidden">
    <div
      v-if="!authStore.isAuthenticated"
      class="shrink-0 w-full flex justify-between items-center p-3 rounded-xl bg-theme-primary shadow-sm px-6 h-auto border border-[var(--border-color)]">
      <div class="flex flex-col">
        <h2 class="font-bold text-theme-main text-sm lowercase">
          benvenuto su bibliomap
        </h2>
        <p class="text-theme-main opacity-70 text-xs mt-1 max-w-2xl font-medium lowercase">
          accedi per funzionalita complete.
        </p>
      </div>
      <router-link
        to="/login"
        class="bg-[var(--paynes-gray)] text-white px-4 py-2 rounded-lg hover:bg-[var(--zomp)] transition text-xs font-bold whitespace-nowrap ml-4 border-none lowercase">
        accedi o registrati
      </router-link>
    </div>

    <main
      class="flex flex-col lg:flex-row w-full flex-grow gap-4 overflow-hidden h-full">
      <aside
        class="w-full lg:w-4/12 flex flex-col rounded-xl border border-[var(--border-color)] bg-theme-primary shadow-lg overflow-hidden h-full relative">
        <div
          class="p-3 border-b border-[var(--border-color)] flex justify-between items-center shrink-0 z-20 bg-theme-primary">
          <h2 class="font-display text-lg text-theme-main lowercase">
            vicini a te:
            <span class="font-bold">{{ filteredBooks.length }}</span>
          </h2>
          <button
            @click="toggleFilters"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition font-bold text-xs uppercase"
            :class="
              showFilters
                ? 'bg-[var(--zomp)] text-white border-[var(--zomp)]'
                : 'bg-theme-primary text-theme-main border-[var(--border-color)] hover:border-[var(--zomp)]'
            ">
            <i class="fa-solid fa-filter"></i>
            filtri
          </button>
        </div>

        <div
          v-if="showFilters"
          class="p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs space-y-3 shrink-0 animate-fade-in z-10 flex flex-col">
          <input
            v-model="filters.searchText"
            type="text"
            placeholder="cerca titolo o autore..."
            class="w-full p-2 rounded border border-[var(--border-color)] bg-theme-primary text-theme-main focus:outline-none focus:border-[var(--accent-color)]" />

          <div class="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="avail-filter"
              v-model="filters.onlyAvailable"
              class="w-4 h-4 accent-[var(--zomp)]" />
            <label
              for="avail-filter"
              class="font-bold text-theme-main opacity-80 cursor-pointer lowercase"
              >mostra solo disponibili</label
            >
          </div>

          <div class="flex flex-col gap-1">
            <span
              class="text-[10px] uppercase font-bold text-theme-main opacity-70 lowercase"
              >ordina per</span
            >
            <div class="flex gap-2">
              <button
                @click="handleSort('distance')"
                class="flex-1 py-1.5 rounded border border-[var(--border-color)] transition text-center flex items-center justify-center gap-1 lowercase"
                :class="
                  sortField === 'distance'
                    ? 'bg-[var(--paynes-gray)] text-white border-transparent'
                    : 'bg-theme-primary hover:bg-[var(--bg-secondary)] text-theme-main'
                ">
                distanza
                <i
                  v-if="sortField === 'distance'"
                  class="fa-solid"
                  :class="
                    sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'
                  "></i>
              </button>
              <button
                @click="handleSort('title')"
                class="flex-1 py-1.5 rounded border border-[var(--border-color)] transition text-center flex items-center justify-center gap-1 lowercase"
                :class="
                  sortField === 'title'
                    ? 'bg-[var(--paynes-gray)] text-white border-transparent'
                    : 'bg-theme-primary hover:bg-[var(--bg-secondary)] text-theme-main'
                ">
                titolo
                <i
                  v-if="sortField === 'title'"
                  class="fa-solid"
                  :class="
                    sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'
                  "></i>
              </button>
              <button
                @click="handleSort('author')"
                class="flex-1 py-1.5 rounded border border-[var(--border-color)] transition text-center flex items-center justify-center gap-1 lowercase"
                :class="
                  sortField === 'author'
                    ? 'bg-[var(--paynes-gray)] text-white border-transparent'
                    : 'bg-theme-primary hover:bg-[var(--bg-secondary)] text-theme-main'
                ">
                autore
                <i
                  v-if="sortField === 'author'"
                  class="fa-solid"
                  :class="
                    sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'
                  "></i>
              </button>
            </div>
          </div>

          <div v-if="availableTags.length > 0" class="flex flex-col gap-1">
            <span
              class="text-[10px] uppercase font-bold text-theme-main opacity-70 lowercase"
              >filtra per tag</span
            >
            <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              <button
                v-for="tag in availableTags"
                :key="tag"
                @click="toggleTag(tag)"
                class="px-2 py-1 rounded-full text-[10px] border transition lowercase"
                :class="
                  selectedTag === tag
                    ? 'bg-[var(--zomp)] text-white border-transparent'
                    : 'bg-theme-primary border-[var(--border-color)] text-theme-main hover:border-[var(--zomp)]'
                ">
                {{ tag }}
              </button>
            </div>
          </div>
        </div>

        <div
          ref="listContainer"
          class="flex-grow p-3 relative overflow-hidden flex flex-col bg-theme-primary">
          <div
            v-if="isFetchingBooks"
            class="absolute inset-0 flex flex-col items-center justify-center bg-theme-primary z-20">
            <i
              class="fa-solid fa-circle-notch fa-spin text-2xl text-[var(--paynes-gray)]"></i>
          </div>

          <div
            v-else-if="filteredBooks.length === 0"
            class="flex flex-col items-center justify-center mt-4 px-4 text-center">
            <p class="text-theme-main opacity-70 text-sm mb-4 lowercase">
              nessun libro trovato in quest area.
            </p>
            <div
              class="w-full max-w-[240px] flex flex-col gap-2 bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
              <div class="flex justify-between items-center">
                <span
                  class="text-[10px] uppercase font-bold text-theme-main opacity-80 lowercase"
                  >espandi raggio</span
                >
                <span class="text-xs font-bold text-[var(--zomp)] lowercase">{{
                  expansionRadius >= 1000
                    ? (expansionRadius / 1000).toFixed(1) + " km"
                    : expansionRadius + " m"
                }}</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="500"
                v-model.number="expansionRadius"
                @change="applyRadiusZoom"
                class="w-full h-1.5 bg-[var(--ash-gray)] rounded-lg appearance-none cursor-pointer accent-[var(--zomp)]" />
            </div>
          </div>

          <div v-else class="flex flex-col gap-2 w-full h-full overflow-y-auto">
            <div
              v-for="book in paginatedBooks"
              :key="book.id"
              @click="zoomToBook(book)"
              class="cursor-pointer p-2 rounded-xl flex flex-col gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm hover:border-[var(--accent-color)] transition duration-200">
              <div class="flex items-start w-full">
                <div
                  class="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-200 relative">
                  <img
                    :src="book.coverUrl"
                    class="w-full h-full object-cover"
                    alt="copertina"
                    @error="
                      (e) => (e.target.src = assignDefaultCover(book.id))
                    " />
                </div>
                <div
                  class="flex-grow ml-3 flex flex-col min-h-[96px] text-left">
                  <div>
                    <p
                      class="font-bold text-theme-main text-sm leading-tight mb-0.5 lowercase">
                      {{ book.title }}
                    </p>
                    <p class="text-xs text-theme-main opacity-80 italic lowercase">
                      {{ book.author }}
                    </p>
                  </div>
                  <div
                    v-if="book.tags && book.tags.length > 0"
                    class="flex flex-wrap gap-1 mt-1 mb-1">
                    <span
                      v-for="t in book.tags"
                      :key="t"
                      class="text-[9px] bg-[var(--ash-gray)]/30 px-1.5 py-0.5 rounded text-theme-main opacity-80 lowercase"
                      >{{ t }}</span
                    >
                  </div>
                  <div class="mt-auto space-y-1">
                    <div
                      v-if="book.libraryName"
                      class="flex items-center text-xs text-theme-main opacity-70 font-medium">
                      <i class="fa-solid fa-shop mr-1.5 text-[10px]"></i>
                      <span class="truncate lowercase">{{ book.libraryName }}</span>
                    </div>
                    <div
                      class="flex items-center text-xs text-theme-main opacity-60">
                      <i class="fa-solid fa-location-dot mr-2 text-[10px]"></i>
                      <span>{{ book.distance.toFixed(1) }} km</span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="flex gap-2 mt-1 border-t border-[var(--border-color)] pt-2 opacity-90">
                <button
                  @click.stop="goToBookDetails(book.id)"
                  class="flex-1 py-1.5 px-2 rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--paynes-gray)] hover:text-white text-theme-main text-xs font-semibold transition flex items-center justify-center gap-2 lowercase">
                  <i class="fa-solid fa-eye"></i> vedi
                </button>
                <button
                  v-if="authStore.isAuthenticated"
                  @click.stop="openConfirmModal(book)"
                  class="flex-1 py-1.5 px-2 rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white text-theme-main text-xs font-semibold transition flex items-center justify-center gap-2 lowercase">
                  <i class="fa-solid fa-hand-holding-hand"></i> richiedi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-2 border-t border-[var(--border-color)] bg-theme-primary flex justify-between items-center shrink-0 text-xs text-theme-main font-semibold h-12">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white disabled:opacity-30 transition">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="lowercase">pag {{ currentPage }} / {{ totalPages || 1 }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage >= totalPages || totalPages === 0"
            class="w-8 h-8 flex items-center justify-center rounded bg-[var(--ash-gray)]/20 hover:bg-[var(--zomp)] hover:text-white disabled:opacity-30 transition">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </aside>

      <section
        class="w-full lg:w-8/12 flex-grow flex flex-col gap-3 relative h-full">
        <div
          class="flex-grow rounded-xl overflow-hidden shadow-xl border border-[var(--border-color)] relative">
          <div id="map" class="w-full h-full bg-gray-100"></div>
          <div
            class="absolute bottom-6 left-4 bg-theme-primary border border-[var(--border-color)] p-2 rounded-lg shadow text-xs text-theme-main z-10">
            <div class="flex items-center">
              <span
                class="inline-block w-3 h-3 rounded-full bg-[var(--zomp)] mr-2 border border-white"></span>
              <span class="lowercase">librerie vicine</span>
            </div>
          </div>
        </div>

        <div
          class="text-[10px] text-center p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col gap-1 shrink-0 shadow-sm">
          <div
            v-if="isLocationLoading"
            class="text-[var(--zomp)] font-bold animate-pulse lowercase">
            <i class="fa-solid fa-satellite-dish"></i> ricerca posizione...
          </div>
          <div v-else class="flex flex-col gap-1 w-full px-2">
            <div class="flex justify-between items-center w-full">
              <span class="opacity-70 lowercase"
                >posizione stimata ({{
                  gpsAccuracy ? "~" + Math.round(gpsAccuracy) + "m" : "n/a"
                }})</span
              >
              <button
                @click="handleGeolocationFlow"
                class="underline text-blue-500 hover:text-blue-700 lowercase">
                riprova
              </button>
            </div>
            <div
              class="text-[var(--paynes-gray)] font-bold border-t border-gray-300 pt-1 mt-1 lowercase">
              <i class="fa-solid fa-arrows-up-down-left-right mr-1"></i>
              trascina il segnaposto rosa sulla mappa se la posizione e'
              sbagliata.
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <app-modal
    :is-open="isConfirmModalOpen"
    title="conferma richiesta"
    @close="isConfirmModalOpen = false">
    <div v-if="bookToRequest" class="space-y-4 text-theme-main">
      <p class="text-sm lowercase">richiedi in prestito:</p>
      <div
        class="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
        <p class="font-bold text-base lowercase">{{ bookToRequest.title }}</p>
        <p class="text-xs italic opacity-80 lowercase">{{ bookToRequest.author }}</p>
      </div>
      <div class="flex justify-end gap-3 pt-2">
        <button
          @click="isConfirmModalOpen = false"
          class="px-4 py-2 rounded-lg transition text-sm font-bold border border-[var(--border-color)] hover:bg-[var(--ash-gray)]/20 lowercase">
          annulla
        </button>
        <button
          @click="confirmLoanRequest"
          :disabled="isSending"
          class="bg-[var(--zomp)] text-white px-4 py-2 rounded-lg hover:bg-[var(--paynes-gray)] transition text-sm font-bold disabled:opacity-50 flex items-center gap-2 lowercase">
          <i v-if="isSending" class="fa-solid fa-circle-notch fa-spin"></i>
          {{ isSending ? "invio..." : "conferma" }}
        </button>
      </div>
    </div>
  </app-modal>
</template>

<script setup>
import {
  ref,
  shallowRef,
  computed,
  onMounted,
  onUnmounted,
  watch,
  reactive,
} from "vue";
import { useRouter } from "vue-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/AppModal.vue";

const authStore = useAuthStore();
const router = useRouter();

const ROME_CENTER = { lat: 41.9028, lng: 12.4964 };
const CARD_HEIGHT = 180;
const MAX_SEARCH_RADIUS = 20;
const MAX_ZOOM_OUT = 10;

const map = shallowRef(null);
const mapLoaded = ref(false);
const listContainer = ref(null);
const isFetchingBooks = ref(false);
const isLocationLoading = ref(false);
const userMarker = shallowRef(null);
const gpsAccuracy = ref(null);
const currentMarkers = shallowRef([]);

const showFilters = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(3);
const filters = reactive({ searchText: "", onlyAvailable: false });
const selectedTag = ref(null);
const expansionRadius = ref(1000);

const sortField = ref(null);
const sortDirection = ref(null);

const books = ref([]);
const isConfirmModalOpen = ref(false);
const bookToRequest = ref(null);
const isSending = ref(false);

const DEFAULT_COVERS = [
  "/images/cover_default_1.png",
  "/images/cover_default_2.png",
  "/images/cover_default_3.png",
];

// assegna una copertina di default basata sull id del libro
function assignDefaultCover(bookId) {
  if (!bookId) return DEFAULT_COVERS[0];
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) hash += bookId.charCodeAt(i);
  return DEFAULT_COVERS[hash % DEFAULT_COVERS.length];
}

// calcola quanti libri mostrare per pagina in base all altezza del contenitore
const calculateItemsPerPage = () => {
  if (listContainer.value) {
    const containerHeight = listContainer.value.clientHeight;
    itemsPerPage.value = Math.max(
      Math.floor((containerHeight - 10) / CARD_HEIGHT),
      2
    );
  }
};

let resizeObserver = null;

onMounted(() => {
  if (listContainer.value) {
    resizeObserver = new ResizeObserver(() => calculateItemsPerPage());
    resizeObserver.observe(listContainer.value);
  }
  handleGeolocationFlow();
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  if (map.value) map.value.remove();
});

// estrae tutti i tag unici dai libri caricati
const availableTags = computed(() => {
  const allTags = books.value.flatMap((b) => b.tags || []);
  return [...new Set(allTags)].sort();
});

// gestisce l ordinamento della lista libri
const handleSort = (field) => {
  if (sortField.value !== field) {
    sortField.value = field;
    sortDirection.value = "asc";
  } else {
    if (sortDirection.value === "asc") sortDirection.value = "desc";
    else {
      sortField.value = null;
      sortDirection.value = null;
    }
  }
};

// filtra e ordina i libri in base alle preferenze dell utente
const filteredBooks = computed(() => {
  let result = [...books.value];
  if (selectedTag.value)
    result = result.filter((b) => b.tags && b.tags.includes(selectedTag.value));
  
  // FIX: logica filtro disponibili migliorata
  if (filters.onlyAvailable)
    result = result.filter((b) => b.status === "available");

  if (sortField.value && sortDirection.value) {
    result.sort((a, b) => {
      let compare = 0;
      if (sortField.value === "distance") compare = a.distance - b.distance;
      if (sortField.value === "title") compare = a.title.localeCompare(b.title);
      if (sortField.value === "author")
        compare = a.author.localeCompare(b.author);
      return sortDirection.value === "asc" ? compare : -compare;
    });
  } else {
    result.sort((a, b) => a.distance - b.distance);
  }
  return result;
});

// calcola il numero totale di pagine
const totalPages = computed(() =>
  Math.max(Math.ceil(filteredBooks.value.length / itemsPerPage.value), 1)
);

// estrae la porzione di libri per la pagina corrente
const paginatedBooks = computed(() =>
  filteredBooks.value.slice(
    (currentPage.value - 1) * itemsPerPage.value,
    currentPage.value * itemsPerPage.value
  )
);

// mostra o nasconde la sezione filtri
const toggleFilters = () => (showFilters.value = !showFilters.value);

// attiva o disattiva un tag di filtraggio
const toggleTag = (tag) => {
  selectedTag.value = selectedTag.value === tag ? null : tag;
  currentPage.value = 1;
  updateMapMarkers();
};

watch(
  () => filters.searchText,
  () => {
    searchInCurrentArea();
    currentPage.value = 1;
  }
);
watch(
  () => filters.onlyAvailable,
  () => {
    currentPage.value = 1;
    updateMapMarkers();
  }
);
watch(filteredBooks, () => {
  if (mapLoaded.value) updateMapMarkers();
});

// avvia il flusso per ottenere la posizione dell utente
async function handleGeolocationFlow() {
  isLocationLoading.value = true;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsAccuracy.value = pos.coords.accuracy;
        finalizeLocation(pos.coords.latitude, pos.coords.longitude, 15);
      },
      () => finalizeLocationFromProfile(),
      { timeout: 10000 }
    );
  } else finalizeLocationFromProfile();
}

// usa la posizione salvata nel profilo se quella del browser fallisce
function finalizeLocationFromProfile() {
  if (authStore.isAuthenticated && authStore.user?.latitude) {
    finalizeLocation(authStore.user.latitude, authStore.user.longitude, 15);
  } else {
    finalizeLocation(ROME_CENTER.lat, ROME_CENTER.lng, 12);
  }
}

// imposta la posizione finale e inizializza la mappa
function finalizeLocation(lat, lng, zoomLevel) {
  isLocationLoading.value = false;
  initMap(lat, lng, zoomLevel);
}

// recupera i libri vicini dal backend
async function fetchBooks(lat, lng, radius) {
  isFetchingBooks.value = true;
  try {
    const results = await apiClient.get("/books/nearby", {
      params: {
        lat,
        lng,
        radius,
        search: filters.searchText,
        exclude_user: authStore.userId,
      },
    });
    const rawBooks = Array.isArray(results) ? results : results.results || [];
    books.value = rawBooks.map((b) => {
      let finalCover = b.cover;
      if (
        b.cover &&
        !b.cover.startsWith("http") &&
        !b.cover.startsWith("data:image")
      ) {
        finalCover = `data:image/jpeg;base64,${b.cover}`;
      }
      return {
        ...b,
        libraryId: b.libraryId,
        coverUrl: finalCover || assignDefaultCover(b.id),
        libraryName: b.libraryName || "libreria privata",
        ownerName: b.username || "utente",
      };
    });
  } catch (err) {
    console.error(err);
  } finally {
    isFetchingBooks.value = false;
  }
}

// esegue una ricerca libri nell area attualmente visualizzata sulla mappa
function searchInCurrentArea() {
  if (!map.value) return;
  const pos = userMarker.value
    ? userMarker.value.getLngLat()
    : map.value.getCenter();
  const bounds = map.value.getBounds();
  const radius = Math.min(
    map.value.getCenter().distanceTo(bounds.getNorthEast()) / 1000,
    MAX_SEARCH_RADIUS
  );
  fetchBooks(pos.lat, pos.lng, radius);
}

// aggiorna lo zoom della mappa in base al raggio di espansione selezionato
function applyRadiusZoom() {
  if (!map.value) return;
  map.value.flyTo({
    zoom: 15.5 - Math.log2(expansionRadius.value / 500),
    speed: 1.2,
  });
}

// inizializza la mappa maplibre
const initMap = (lat, lng, zoomLevel) => {
  if (map.value) {
    map.value.flyTo({ center: [lng, lat], zoom: zoomLevel });
    return;
  }
  map.value = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${
      import.meta.env.VITE_MAPTILER_KEY
    }`,
    center: [lng, lat],
    zoom: zoomLevel,
    minZoom: MAX_ZOOM_OUT,
    attributionControl: false,
  });
  map.value.on("load", () => {
    mapLoaded.value = true;
    createUserMarker(lat, lng);
    searchInAreaOnLoad(lat, lng);
  });
  map.value.on("moveend", () => {
    if (filters.searchText === "") searchInCurrentArea();
  });
};

// esegue la prima ricerca al caricamento della mappa
const searchInAreaOnLoad = (lat, lng) => {
  fetchBooks(lat, lng, 1);
};

// crea il marker trascinabile per la posizione dell utente
const createUserMarker = (lat, lng) => {
  userMarker.value = new maplibregl.Marker({
    color: "#fac8cd",
    draggable: true,
  })
    .setLngLat([lng, lat])
    .addTo(map.value);
  userMarker.value.on("dragend", () => searchInCurrentArea());
};

// aggiorna i marker delle librerie sulla mappa
const updateMapMarkers = () => {
  if (!map.value || !mapLoaded.value) return;
  currentMarkers.value.forEach((m) => m.remove());
  currentMarkers.value = [];

  const librariesMap = new Map();

  filteredBooks.value.forEach((book) => {
    const key = book.libraryId || `${book.lat}-${book.lng}`;
    if (!librariesMap.has(key)) {
      librariesMap.set(key, {
        id: book.libraryId,
        name: book.libraryName,
        owner: book.ownerName,
        lat: book.lat,
        lng: book.lng,
        booksCount: 0,
      });
    }
    librariesMap.get(key).booksCount++;
  });

  librariesMap.forEach((lib) => {
    const el = document.createElement("div");
    el.className = "marker-container";
    el.innerHTML = `<div class="custom-book-pin"><i class="fa-solid fa-shop text-white text-xl"></i></div>`;

    const ownerLine =
      lib.owner && lib.owner !== "utente"
        ? `<p class="text-[10px] text-theme-main opacity-60 italic">di ${lib.owner}</p>`
        : "";

    const popupContent = `
      <div class="flex flex-col items-center gap-2 p-2 w-[160px]">
        <div class="text-center">
          <p class="font-bold text-xs leading-tight mb-0.5 lowercase">libreria: ${
            lib.name
          }</p>
          ${ownerLine}
          <p class="text-[9px] mt-1 font-semibold text-[var(--zomp)] lowercase">${
            lib.booksCount
          } libri disponibili</p>
        </div>
        <button id="btn-lib-${
          lib.id || "temp"
        }" class="bg-[var(--zomp)] text-white text-[10px] font-bold py-1.5 px-3 rounded-full hover:bg-[var(--paynes-gray)] transition uppercase w-full">
            vedi libreria
        </button>
      </div>`;

    const popup = new maplibregl.Popup({
      offset: 45,
      closeButton: false,
    }).setHTML(popupContent);

    popup.on("open", () => {
      document
        .getElementById(`btn-lib-${lib.id || "temp"}`)
        ?.addEventListener("click", () => {
          if (lib.id) router.push(`/libraries/${lib.id}`);
          else console.warn("id libreria non disponibile per questo marker");
        });
    });

    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([lib.lng, lib.lat])
      .setPopup(popup)
      .addTo(map.value);

    currentMarkers.value.push(marker);
  });
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const goToBookDetails = (id) => router.push(`/books/${id}`);
const zoomToBook = (book) =>
  map.value?.flyTo({ center: [book.lng, book.lat], zoom: 16 });
const openConfirmModal = (book) => {
  bookToRequest.value = book;
  isConfirmModalOpen.value = true;
};

// conferma la richiesta di prestito al backend
const confirmLoanRequest = async () => {
  if (!bookToRequest.value) return;
  isSending.value = true;
  try {
    await apiClient.post(`/loan/${bookToRequest.value.id}`);
    isConfirmModalOpen.value = false;
  } catch (err) {
    console.error(err);
  } finally {
    isSending.value = false;
    bookToRequest.value = null;
  }
};
</script>

<style scoped>
.font-display {
  font-family: "Mochiy Pop P One", cursive;
}
</style>