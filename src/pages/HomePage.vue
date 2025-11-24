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
                  <button @click="setActiveFilter('nuovi')" :class="{'bg-zomp text-white': activeFilter === 'nuovi', 'bg-ash-gray/30 text-paynes-gray': activeFilter !== 'nuovi'}" class="px-4 py-2 rounded-full font-semibold transition duration-150">Nuovi Arrivi</button>
              </div>
          </div>

          <p v-if="isLocationLoading" class="text-sm text-zomp text-center animate-pulse">ricerca posizione in corso...</p>
          <p v-if="locationError" class="text-sm text-red-700 text-center">{{ locationError }}</p>
          <p v-if="generalError" class="text-sm text-red-700 text-center bg-red-100 p-2 rounded">{{ generalError }}</p>

          <div v-if="isFetchingBooks" class="text-center text-paynes-gray/70 py-10">
             <i class="fa-solid fa-circle-notch fa-spin text-2xl"></i>
             <p class="mt-2">caricamento libri...</p>
          </div>
          
          <div v-else-if="filteredBooks.length === 0" class="text-center text-paynes-gray/70 py-10">
             nessun libro trovato nel raggio di {{ MAX_RADIUS_KM }} km.
          </div>
          
          <div v-else class="book-list space-y-3 overflow-y-auto pr-2">
           <div v-for="book in filteredBooks" 
                 :key="book.id" 
                 :id="'book-' + book.id"
                 @click="zoomToBook(book)"
                 @keydown.enter.prevent="zoomToBook(book)" 
                 @keydown.space.prevent="zoomToBook(book)"
                 tabindex="0"
                 role="button"
                 :aria-label="'Seleziona il libro ' + book.title"
                 :class="{'border-zomp border-2 shadow-md bg-white': book.id === selectedBookId, 'border-thistle border bg-white/50': book.id !== selectedBookId}"
                 class="book-card p-3 rounded-xl flex items-start transition duration-200 cursor-pointer hover:shadow-md focus:outline focus:outline-2 focus:outline-blue-600">
              
              <div class="w-20 h-24 flex-shrink-0 rounded-md overflow-hidden shadow-sm bg-gray-200">
                <img :src="book.coverUrl" alt="copertina" class="w-full h-full object-cover">
              </div>

              <div class="flex-grow ml-3 text-left">
                <p class="font-bold text-paynes-gray text-lg leading-tight">{{ book.title }}</p>
                <p class="text-sm text-paynes-gray/80 italic mb-1">{{ book.author }}</p>
                
                <div class="flex items-center text-xs text-paynes-gray/60 mt-2">
                    <i class="fa-solid fa-location-dot mr-1"></i>
                    <span>{{ book.libraryName }} ({{ book.distance.toFixed(1) }} km)</span>
                </div>
              </div>

              <button v-if="authStore.isAuthenticated" @click.stop="requestLoan(book.id)"
                      class="ml-2 p-2 rounded-full bg-ash-gray/20 hover:bg-zomp hover:text-white text-paynes-gray transition duration-150"
                      title="Richiedi Prestito"
                      tabindex="0"> <i class="fa-solid fa-hand-holding-hand"></i>
              </button>
            </div>
          </div>
        </aside>

        <section id="map-area" class="w-full lg:w-2/3 flex-grow rounded-xl overflow-hidden shadow-xl border-2 border-thistle relative">
          <div id="map" class="w-full h-full min-h-[400px]"></div>
          
          <div class="absolute bottom-4 left-4 bg-white/90 p-2 rounded-lg shadow text-xs text-paynes-gray z-10 backdrop-blur-sm">
             <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-zomp block"></span> Librerie vicine
             </div>
          </div>
        </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'; // Assicurati di importare il CSS!
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/apiClient';

const authStore = useAuthStore();

// --- STATI ---
const map = ref(null);
const mapLoaded = ref(false);
const isFetchingBooks = ref(false);
const isLocationLoading = ref(false);
const locationError = ref(null);
const generalError = ref(null);
const userLocation = ref(null); 
const selectedBookId = ref(null);
const currentMarkers = ref([]); // Array per tenere traccia dei marker sulla mappa

// --- DATI ---
const books = ref([]); 
const activeFilter = ref('vicini');

// Costanti
const ROME_CENTER = { lat: 41.9028, lng: 12.4964 };
const MAX_RADIUS_KM = 5;

// --- LOGICA COPERTINE DEFAULT ---
// Array di percorsi alle immagini in /public/images/
const DEFAULT_COVERS = [
    '/images/cover_default_1.png',
    '/images/cover_default_2.png',
    '/images/cover_default_3.png',
    '/images/cover_default_4.png',
     '/images/cover_default_5.png',
    '/images/cover_default_6.png',
    '/images/cover_default_7.png'
];

function assignDefaultCover(bookId) {
    // Usa l'ID (o hash) per scegliere sempre la stessa cover per lo stesso libro
    // Somma i codici ASCII dell'ID
    let hash = 0;
    for (let i = 0; i < bookId.length; i++) {
        hash += bookId.charCodeAt(i);
    }
    const index = hash % DEFAULT_COVERS.length;
    return DEFAULT_COVERS[index];
}


// --- COMPUTED ---
const filteredBooks = computed(() => books.value);

const userMapCenter = computed(() => {
    if (authStore.isAuthenticated && authStore.user && authStore.user.latitude) {
        return { lat: authStore.user.latitude, lng: authStore.user.longitude };
    }
    return userLocation.value || ROME_CENTER;
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
        map.value.flyTo({ center: [newCenter.lng, newCenter.lat], zoom: 13 }); 
        fetchBooks(); 
    }
}, { deep: true });


// --- GEOLOCALIZZAZIONE ---
function getBrowserGeolocation() {
    isLocationLoading.value = true;
    locationError.value = null;

    if (!navigator.geolocation) {
        locationError.value = "Geolocalizzazione non supportata.";
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
            locationError.value = "Impossibile ottenere posizione. Uso Roma Centro.";
            isLocationLoading.value = false;
            initMap(ROME_CENTER.lat, ROME_CENTER.lng);
            fetchBooks();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

// --- FETCH LIBRI ---
async function fetchBooks() {
    isFetchingBooks.value = true;
    generalError.value = null;
    const center = userMapCenter.value;
    
    // Parametri gestiti dall'apiClient
    const params = {
        lat: center.lat,
        lng: center.lng,
        radius: MAX_RADIUS_KM,
        visibility: authStore.isAuthenticated ? 'logged-in' : 'public' 
    };

    try {
        const results = await apiClient.get('/books/nearby', { params });
        const booksArray = Array.isArray(results) ? results : (results.results || []);

        // Mappatura dati con gestione copertina
        books.value = booksArray.map(book => ({
            ...book,
            // Se il BE manda una cover, usala, altrimenti assegna default
            coverUrl: book.cover ? book.cover : assignDefaultCover(book.id)
        }));

        if (map.value && mapLoaded.value) {
            updateMapMarkers(); // Funzione aggiornata per usare Marker HTML
        }

    } catch (error) {
        generalError.value = "Errore: " + (error.message || "Errore sconosciuto");
    } finally {
        isFetchingBooks.value = false;
    }
}


// --- MAPPA & MARKERS ---
const initMap = (lat, lng) => {
    const mapTilerApiKey = 'smRAOMoK3wb8jS0gS8B0'; 
    const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`;

    map.value = new maplibregl.Map({
        container: 'map',
        style: styleUrl,
        center: [lng, lat],
        zoom: 13
    });
    
    // Marker posizione utente (Puntino rosso semplice)
    if (authStore.isAuthenticated || userLocation.value) {
         new maplibregl.Marker({ color: '#fac8cd' }) 
            .setLngLat([lng, lat])
            .addTo(map.value);
    }

    map.value.on('load', () => {
        mapLoaded.value = true;
        updateMapMarkers();
    });
};

// Funzione per creare i marker personalizzati (ICONCINE DEI LIBRI)
const updateMapMarkers = () => {
    if (!map.value || !mapLoaded.value) return;

    // 1. Rimuovi i vecchi marker
    currentMarkers.value.forEach(marker => marker.remove());
    currentMarkers.value = [];

    // 2. Aggiungi i nuovi marker per ogni libro
    books.value.forEach(book => {
        
        // Creazione elemento DOM personalizzato
        const el = document.createElement('div');
        el.className = 'custom-book-marker';
        
        // Inseriamo l'icona SVG (Feather Book) direttamente nell'HTML
        // Questo simula l'icona del libro che volevi
        el.innerHTML = `
          <div class="marker-pin-inner">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
             </svg>
          </div>
        `;

        // Gestione Click sul marker
        el.addEventListener('click', () => {
            zoomToBook(book);
        });

        // Creazione Marker MapLibre
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([book.lng, book.lat])
            .addTo(map.value);

        currentMarkers.value.push(marker);
    });
};

const zoomToBook = (book) => {
    map.value.flyTo({ center: [book.lng, book.lat], zoom: 15, speed: 1.2 });
    selectedBookId.value = book.id;
    const element = document.getElementById('book-' + book.id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// ... (setActiveFilter e requestLoan rimangono uguali)
const setActiveFilter = (filter) => { activeFilter.value = filter; fetchBooks(); };
const requestLoan = (bookId) => { console.log("Richiesta prestito:", bookId); };
</script>

<style>
/* CSS PER I MARKER PERSONALIZZATI */

.custom-book-marker {
    cursor: pointer;
    width: 36px;
    height: 36px;
    /* Usiamo flex per centrare l'icona */
    display: flex;
    justify-content: center;
    align-items: center;
    /* Effetto 'Goccia' o Pin */
    background-color: #629677; /* Zomp */
    border: 2px solid white;
    border-radius: 50% 50% 50% 0; /* Forma a goccia */
    transform: rotate(-45deg); /* Ruotiamo per far puntare in basso */
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    transition: transform 0.2s ease, background-color 0.2s;
}

/* L'interno del marker deve essere ruotato al contrario per avere l'icona dritta */
.marker-pin-inner {
    transform: rotate(45deg);
    color: white;
}

/* Hover effect */
.custom-book-marker:hover {
    transform: rotate(-45deg) scale(1.1);
    background-color: #495d63; /* Paynes Gray */
    z-index: 10; /* Porta in primo piano */
}

/* Stile scrollbar lista */
.book-list::-webkit-scrollbar {
    width: 6px;
}
.book-list::-webkit-scrollbar-track {
    background: transparent;
}
.book-list::-webkit-scrollbar-thumb {
    background-color: #d8a48f; /* Thistle scuro */
    border-radius: 10px;
}
</style>