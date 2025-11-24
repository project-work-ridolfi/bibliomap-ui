<template>
  <div id="home-page" class="flex flex-col w-full min-h-screen lg:p-4 gap-4">

    <div v-if="!authStore.isAuthenticated" class="w-full text-center p-3 border border-thistle rounded-xl bg-ash-gray/10 shadow-md">
        <p class="font-semibold text-paynes-gray mb-2">vuoi vedere più libri o richiederne uno in prestito?</p>
        <router-link 
          to="/login"
          class="inline-block bg-zomp text-white px-4 py-2 rounded-lg hover:bg-paynes-gray transition duration-150 font-semibold text-sm">
          Accedi o Registrati
        </router-link>
    </div>
    
    <main id="main-content" class="flex flex-col lg:flex-row w-full flex-grow gap-4"> 
    
        <aside id="sidebar" class="w-full lg:w-1/3 flex flex-col p-4 rounded-xl border-2 border-thistle bg-theme-primary space-y-4 shadow-lg">
          
          <div class="filter-section">
              <h2 class="font-display text-2xl text-paynes-gray mb-3">Filtra:</h2>
              <div class="flex flex-wrap justify-around gap-2">
                  <button @click="setActiveFilter('vicini')" :class="{'bg-zomp text-white': activeFilter === 'vicini', 'bg-ash-gray/30 text-paynes-gray': activeFilter !== 'vicini'}" class="px-4 py-2 rounded-full font-semibold transition duration-150">Più Vicini</button>
                  <button @click="setActiveFilter('letti')" :class="{'bg-zomp text-white': activeFilter === 'letti', 'bg-ash-gray/30 text-paynes-gray': activeFilter !== 'letti'}" class="px-4 py-2 rounded-full font-semibold transition duration-150">Più Letti</button>
                  <button @click="setActiveFilter('nuovi')" :class="{'bg-zomp text-white': activeFilter === 'nuovi', 'bg-ash-gray/30 text-paynes-gray': activeFilter !== 'nuovi'}" class="px-4 py-2 rounded-full font-semibold transition duration-150">Nuovi Arrivi</button>
              </div>
          </div>

          <p v-if="isLocationLoading" class="text-sm text-zomp text-center">ricerca posizione in corso...</p>
          <p v-if="locationError" class="text-sm text-red-700 text-center">errore geolocalizzazione: {{ locationError }}</p>
          <p v-if="generalError" class="text-sm text-red-700 text-center bg-red-100 p-2 rounded">{{ generalError }}</p>
          <div v-if="isFetchingBooks" class="text-center text-paynes-gray/70">caricamento libri...</div>
          <div v-else-if="filteredBooks.length === 0" class="text-center text-paynes-gray/70">nessun libro trovato nel raggio di 5 km.</div>
          <div v-else class="book-list space-y-3 overflow-y-auto">
            <div v-for="book in filteredBooks" :key="book.id" :id="'book-' + book.id"
                 @click="zoomToBook(book)"
                 :class="{'border-zomp border-2 shadow-lg': book.id === selectedBookId, 'border-thistle border': book.id !== selectedBookId}"
                 class="book-card p-3 rounded-xl flex items-center transition duration-200 cursor-pointer bg-theme-primary">
              
              <div class="w-12 h-12 flex-shrink-0 rounded-lg bg-tea-rose-red flex justify-center items-center text-white text-xl">
                <i :class="book.coverIcon"></i>
              </div>

              <div class="flex-grow ml-3 text-left">
                <p class="font-bold text-paynes-gray">{{ book.title }}</p>
                <p class="text-sm text-paynes-gray/80">{{ book.author }}</p>
                <p class="text-xs text-paynes-gray/60">Libreria: {{ book.libraryName }} ({{ book.distance.toFixed(1) }} km)</p>
              </div>

              <button v-if="authStore.isAuthenticated" @click.stop="requestLoan(book.id)"
                      class="ml-3 p-2 rounded-full bg-zomp hover:bg-paynes-gray text-white text-sm transition duration-150">
                <i class="fa-solid fa-hand-holding-hand"></i>
              </button>
            </div>
          </div>
        </aside>

        <section id="map-area" class="w-full lg:w-2/3 flex-grow rounded-xl overflow-hidden shadow-xl border-2 border-thistle">
          <div id="map" class="w-full h-full min-h-[400px]"></div>
        </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/apiClient';

const authStore = useAuthStore();

// --- STATI DI CONTROLLO ---
const map = ref(null);
const mapLoaded = ref(false);
const isFetchingBooks = ref(false);
const isLocationLoading = ref(false);
const locationError = ref(null);
const generalError = ref(null);
const userLocation = ref(null); 
const selectedBookId = ref(null);

// --- DATI DINAMICI ---
const books = ref([]); 
const activeFilter = ref('vicini');

// Costanti
const ROME_CENTER = { lat: 41.9028, lng: 12.4964 };
const MAX_RADIUS_KM = 5;

// --- PROPRIETÀ COMPUTATE ---
const filteredBooks = computed(() => {
  return books.value;
});

const userMapCenter = computed(() => {
    if (authStore.isAuthenticated && authStore.user && authStore.user.latitude) {
        return { lat: authStore.user.latitude, lng: authStore.user.longitude };
    }
    if (userLocation.value) {
        return userLocation.value;
    }
    return ROME_CENTER;
});

// --- CICLO DI VITA ---
onMounted(() => {
    if (!authStore.isAuthenticated || !authStore.user || !authStore.user.latitude) {
        getBrowserGeolocation();
    } else {
        initMap(authStore.user.latitude, authStore.user.longitude);
        fetchBooks();
    }
});

watch(userMapCenter, (newCenter) => {
    if (mapLoaded.value && newCenter) {
        map.value.setCenter([newCenter.lng, newCenter.lat]); 
        fetchBooks(); 
    }
}, { deep: true });

// --- GEOLOCALIZZAZIONE ---
function getBrowserGeolocation() {
    isLocationLoading.value = true;
    locationError.value = null;

    if (!navigator.geolocation) {
        locationError.value = "geolocalizzazione non supportata.";
        isLocationLoading.value = false;
        initMap(ROME_CENTER.lat, ROME_CENTER.lng);
        fetchBooks();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            userLocation.value = { lat: latitude, lng: longitude };
            initMap(latitude, longitude);
            isLocationLoading.value = false;
            fetchBooks();
        },
        (error) => {
            locationError.value = "permesso negato, uso posizione default.";
            isLocationLoading.value = false;
            initMap(ROME_CENTER.lat, ROME_CENTER.lng);
            fetchBooks();
            console.error(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

// --- FETCH LIBRI (CORRETTO) ---
async function fetchBooks() {
    isFetchingBooks.value = true;
    generalError.value = null;

    const center = userMapCenter.value;
    const params = {
        lat: center.lat,
        lng: center.lng,
        radius: MAX_RADIUS_KM,
        visibility: authStore.isAuthenticated ? 'logged-in' : 'public' 
    };

    try {
        console.log(">>> Richiesta API Books a:", '/books/nearby', params);
        
        const response = await apiClient.get('/books/nearby', { params });
        
        // DEBUG: Vediamo cosa arriva davvero
        console.log(">>> Risposta API Books:", response);

        // CORREZIONE: Gestione flessibile della risposta (axios wrap vs direct data)
        // Se response.data esiste usa quello, altrimenti usa response stessa
        let results = [];
        if (response.data && Array.isArray(response.data)) {
            results = response.data;
        } else if (Array.isArray(response)) {
            results = response;
        } else if (response.data && response.data.results) {
             // Caso in cui il BE ritorna { results: [...] }
            results = response.data.results;
        } else {
            console.warn("Formato risposta inatteso:", response);
            results = [];
        }
        
        books.value = results.map(book => ({
            ...book,
            coverIcon: 'fa-book' 
        }));

        if (map.value && mapLoaded.value) {
            updateMapPins();
        }

    } catch (error) {
        generalError.value = "Errore: " + (error.response?.data?.message || error.message);
        console.error("API Error:", error);
    } finally {
        isFetchingBooks.value = false;
    }
}

// --- MAPPA (CORRETTA CON IL TUO STILE) ---
const initMap = (lat, lng) => {
    const mapTilerApiKey = 'smRAOMoK3wb8jS0gS8B0'; 
    // RIpristinato il tuo stile specifico UUID
    const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`;

    map.value = new maplibregl.Map({
        container: 'map',
        style: styleUrl,
        center: [lng, lat],
        zoom: 13
    });
    
    if (authStore.isAuthenticated || userLocation.value) {
         new maplibregl.Marker({ color: '#fac8cd' }) 
            .setLngLat([lng, lat])
            .addTo(map.value);
    }

    map.value.on('load', () => {
        mapLoaded.value = true;
        updateMapPins();
    });
};

const updateMapPins = () => {
    if (!map.value || !mapLoaded.value) return;

    // Controllo sicurezza se books è vuoto
    if (books.value.length === 0) return;

    const geojson = {
        type: 'FeatureCollection',
        features: books.value.map(book => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [book.lng, book.lat]
            },
            properties: {
                id: book.id,
                title: book.title,
                author: book.author,
                library: book.libraryName,
                distance: book.distance || 0
            }
        }))
    };

    if (map.value.getSource('books-data')) {
        map.value.getSource('books-data').setData(geojson);
    } else {
        map.value.addSource('books-data', { type: 'geojson', data: geojson });
    }
    
    if (map.value.getLayer('book-circles')) map.value.removeLayer('book-circles');
    
    map.value.addLayer({
        id: 'book-circles',
        type: 'circle',
        source: 'books-data',
        paint: {
            'circle-color': '#629677',
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#495d63',
        }
    });

    map.value.on('click', 'book-circles', (e) => {
        const id = e.features[0].properties.id;
        const book = books.value.find(b => b.id == id);
        if(book) zoomToBook(book);
    });
    
    map.value.on('mouseenter', 'book-circles', () => {
        map.value.getCanvas().style.cursor = 'pointer';
    });
    map.value.on('mouseleave', 'book-circles', () => {
        map.value.getCanvas().style.cursor = '';
    });
};

const zoomToBook = (book) => {
    map.value.flyTo({ center: [book.lng, book.lat], zoom: 15 });
    selectedBookId.value = book.id;
    const element = document.getElementById('book-' + book.id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

const setActiveFilter = (filter) => {
    activeFilter.value = filter;
    fetchBooks(); 
};

const requestLoan = (bookId) => {
    console.log("Richiesta prestito per:", bookId);
};
</script>

<style scoped>

#home-page {
    min-height: 100vh; 
}

#sidebar {
    max-width: 450px; 
}

.book-list {
    /* imposta l'altezza massima per la scrollbar nella lista */
    max-height: 60vh; 
}

.book-card {
    /* box-shadow leggera e border per somigliare al mockup */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
}

/* Stile per l'elemento selezionato (il bordo più scuro è gestito dal v-bind) */

@media (max-width: 1024px) {
    #sidebar {
        /* full width su mobile/tablet */
        max-width: none;
    }
}
</style>