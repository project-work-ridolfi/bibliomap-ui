<template>
  <div id="home-page" class="page-container" aria-label="pagina principale">
    <div
      v-if="!authStore.isAuthenticated"
      class="welcome-banner"
      aria-label="banner di benvenuto">
      <div class="flex flex-col">
        <h2 class="welcome-title">benvenuta/o su bibliomap!</h2>
        <p class="welcome-subtitle">accedi per vedere tutte le funzionalità.</p>
      </div>

      <router-link
        to="/login"
        class="btn-login"
        aria-label="vai alla pagina di accesso o registrazione">
        accedi o registrati
      </router-link>
    </div>

    <main class="main-layout" aria-label="contenuto principale">
      <aside class="sidebar-container" aria-label="lista libri e filtri">
        <div class="sidebar-header">
          <h2 class="sidebar-title">
            vicini a te: <span>{{ filteredBooks.length }}</span>
          </h2>

          <button
            @click="toggleFilters"
            class="btn-filters"
            :class="showFilters ? 'btn-filters--active' : 'btn-filters--inactive'"
            aria-label="mostra o nascondi filtri">
            <i class="fa-solid fa-filter" aria-hidden="true"></i>
            filtri
          </button>
        </div>

        <div v-if="showFilters" class="filters-drawer" aria-label="filtri ricerca">
          <input
            v-model="filters.searchText"
            type="text"
            placeholder="cerca titolo o autore..."
            class="filter-input"
            aria-label="cerca per titolo o autore" />

          <div class="filter-checkbox-group">
            <input
              type="checkbox"
              id="avail-filter"
              v-model="filters.onlyAvailable"
              class="filter-checkbox"
              aria-label="mostra solo libri disponibili" />

            <label for="avail-filter" class="filter-label">
              mostra solo libri disponibili
            </label>
          </div>

          <div class="sort-section">
            <span class="sort-label">ordina per:</span>

            <div class="sort-buttons">
              <button
                @click="handleSort('distance')"
                class="btn-sort"
                :class="{ 'btn-sort--active': sortField === 'distance' }"
                aria-label="ordina per distanza">
                distanza
                <i
                  v-if="sortField === 'distance'"
                  class="fa-solid"
                  :class="sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'"
                  aria-hidden="true"></i>
              </button>

              <button
                @click="handleSort('title')"
                class="btn-sort"
                :class="{ 'btn-sort--active': sortField === 'title' }"
                aria-label="ordina per titolo">
                titolo
                <i
                  v-if="sortField === 'title'"
                  class="fa-solid"
                  :class="sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'"
                  aria-hidden="true"></i>
              </button>

              <button
                @click="handleSort('author')"
                class="btn-sort"
                :class="{ 'btn-sort--active': sortField === 'author' }"
                aria-label="ordina per autore">
                autore
                <i
                  v-if="sortField === 'author'"
                  class="fa-solid"
                  :class="sortDirection === 'asc' ? 'fa-caret-up' : 'fa-caret-down'"
                  aria-hidden="true"></i>
              </button>
            </div>
          </div>

          <div v-if="availableTags.length > 0" class="sort-section">
            <span class="sort-label">filtra per tag</span>

            <div class="tag-list-scrollable" aria-label="lista tag disponibili">
              <button
                v-for="tag in availableTags"
                :key="tag"
                @click="toggleTag(tag)"
                class="btn-tag"
                :class="{ 'btn-tag--active': selectedTag === tag }"
                :aria-label="`filtra per tag ${tag}`">
                {{ tag }}
              </button>
            </div>
          </div>
        </div>

        <div ref="listContainer" class="book-list-container" aria-label="elenco libri">
          <div
            v-if="isFetchingBooks"
            class="flex justify-center items-center absolute inset-0 z-20 bg-theme-primary"
            aria-label="caricamento libri">
            <i class="fa-solid fa-circle-notch fa-spin text-2xl" aria-hidden="true"></i>
          </div>

          <div
            v-else-if="filteredBooks.length === 0"
            class="flex-center flex-col mt-4 px-4 text-center"
            aria-label="nessun libro trovato">
            <p class="opacity-70 text-sm mb-4">
              nessun libro trovato in quest area.
            </p>

            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              v-model.number="expansionRadius"
              @change="applyRadiusZoom"
              aria-label="espandi raggio di ricerca" />
          </div>

          <div v-else class="book-scroll-area">
            <div
              v-for="book in paginatedBooks"
              :key="book.id"
              @click="zoomToBook(book)"
              class="book-card"
              :aria-label="`libro ${book.title} di ${book.author}`">
              <img
                :src="book.coverUrl"
                @error="(e) => (e.target.src = assignDefaultCover(book.id))"
                :alt="`copertina del libro ${book.title}`" />

              <button
                @click.stop="goToBookDetails(book.id)"
                class="book-footer-btn view"
                aria-label="vai al dettaglio libro">
                vedi
              </button>

              <button
                v-if="authStore.isAuthenticated"
                @click.stop="openConfirmModal(book)"
                class="book-footer-btn request"
                aria-label="richiedi libro in prestito">
                richiedi
              </button>
            </div>
          </div>
        </div>

        <div class="pagination-footer" aria-label="paginazione libri">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="btn-pagination"
            aria-label="pagina precedente">
            <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>

          <span class="text-xs font-semibold">
            pag {{ currentPage }} / {{ totalPages || 1 }}
          </span>

          <button
            @click="nextPage"
            :disabled="currentPage >= totalPages || totalPages === 0"
            class="btn-pagination"
            aria-label="pagina successiva">
            <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </aside>

      <section class="map-layout-section" aria-label="mappa librerie">
        <div id="map" class="w-full h-full" aria-label="mappa interattiva"></div>
      </section>
    </main>
  </div>
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

const isZoomingToBook = ref(false);

const DEFAULT_COVERS = [
  "/images/cover_default_1.png",
  "/images/cover_default_2.png",
  "/images/cover_default_3.png",
  "/images/cover_default_4.png",
  "/images/cover_default_5.png",
  "/images/cover_default_6.png",
  "/images/cover_default_7.png",
];

// assegna una copertina di default basata sull id del libro
function assignDefaultCover(bookId) {
  if (!bookId) {
    return DEFAULT_COVERS[0];
  }

  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash += bookId.charCodeAt(i);
  }
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

// gestisce l'ordinamento della lista libri
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

// filtra e ordina i libri in base alle preferenze dell'utente
const filteredBooks = computed(() => {
  let result = [...books.value];

  if (selectedTag.value)
    result = result.filter((b) => b.tags && b.tags.includes(selectedTag.value));

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
      // logica priorità copertina: custom > url > default
      let finalCover = null;

      if (b.customCover) {
        finalCover = b.customCover.startsWith("data:")
          ? b.customCover
          : `data:image/jpeg;base64,${b.customCover}`;
      } else if (b.coverUrl || b.cover) {
        const url = b.coverUrl || b.cover;
        // gestisce url relativi o assoluti vs base64 grezzi
        finalCover =
          url.startsWith("http") || url.startsWith("/")
            ? url
            : `data:image/jpeg;base64,${url}`;
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

// esegue una ricerca libri nell'area attualmente visualizzata sulla mappa
function searchInCurrentArea() {
  if (!map.value || isZoomingToBook.value) return;
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

// crea il marker trascinabile per la posizione dell'utente
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

<p class="font-bold text-xs leading-tight mb-0.5">libreria: ${lib.name}</p>

${ownerLine}

<p class="text-[9px] mt-1 font-semibold text-[var(--zomp)]">${
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
        });
    });

    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([lib.lng, lib.lat])
      .setPopup(popup)
      .addTo(map.value);

    marker._libraryId = lib.id;
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

const zoomToBook = (book) => {
  if (!map.value) return;

  isZoomingToBook.value = true;

  map.value.flyTo({
    center: [book.lng, book.lat],
    zoom: 15.5,
    speed: 1.2,
  });

  map.value.once("idle", () => {
    const targetMarker = currentMarkers.value.find(
      (m) => m._libraryId === book.libraryId
    );
    if (targetMarker) {
      if (!targetMarker.getPopup().isOpen()) {
        targetMarker.togglePopup();
      }
    }
    isZoomingToBook.value = false;
  });
};

const openConfirmModal = (book) => {
  bookToRequest.value = book;

  isConfirmModalOpen.value = true;
};

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