<template>
  <div class="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl border-2 border-thistle space-y-6">
    <h1 class="text-3xl font-display text-center text-paynes-gray">Dove ti trovi? 🗺️</h1>
    <p class="text-center text-paynes-gray">
      Per mostrarti i libri più vicini, abbiamo bisogno della tua posizione. Scegli come preferisci impostarla:
    </p>

    <div class="grid grid-cols-3 gap-4">
      <button 
        @click="locationMode = 'geo'"
        :class="locationMode === 'geo' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'"
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle"
      >
        <i class="fa-solid fa-location-arrow mb-2 text-xl"></i><br>
        Browser
      </button>
      <button 
        @click="locationMode = 'map'"
        :class="locationMode === 'map' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'"
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle"
      >
        <i class="fa-solid fa-map-pin mb-2 text-xl"></i><br>
        Sulla Mappa
      </button>
      <button 
        @click="locationMode = 'address'"
        :class="locationMode === 'address' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'"
        class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle"
      >
        <i class="fa-solid fa-house mb-2 text-xl"></i><br>
        Indirizzo
      </button>
    </div>

    <div v-if="locationMode === 'address'" class="space-y-3">
        <label for="address" class="block text-sm font-medium text-paynes-gray">Indirizzo Completo *</label>
        <input v-model="form.address" id="address" type="text" placeholder="Via Roma 1, 00100 Roma" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp">
    </div>

    <div v-else-if="locationMode === 'map'" class="text-center p-4 bg-ash-gray/20 rounded-lg">
        <p class="text-sm text-paynes-gray">
            Clicca sul punto esatto sulla mappa per impostare la tua posizione.
        </p>
        
        <div id="map-container" class="h-64 w-full rounded-lg mt-2">
            <div id="map" class="h-full w-full rounded-lg"></div>
        </div>
        
        <p v-if="form.latitude" class="mt-2 text-sm text-zomp font-semibold">
            Posizione selezionata! Lat: {{ form.latitude.toFixed(4) }}, Lng: {{ form.longitude.toFixed(4) }}
        </p>
        <p v-else class="mt-2 text-sm text-paynes-gray/70">
            Seleziona la tua posizione sulla mappa.
        </p>
    </div>
    
    <div v-else-if="locationMode === 'geo'" class="text-center p-4 bg-zomp/20 rounded-lg">
        <p class="text-sm text-paynes-gray font-semibold">
            Clicca su "Ottieni Posizione" e accetta il popup del browser.
        </p>
        <button 
            @click="getGeolocation"
            class="mt-2 bg-paynes-gray text-white py-2 px-4 rounded-lg hover:bg-paynes-gray/80 transition duration-150"
        >
            <i class="fa-solid fa-crosshairs mr-2"></i> Ottieni Posizione
        </button>
        <p v-if="form.latitude" class="mt-2 text-sm text-zomp">
            Posizione ottenuta! ({{ form.latitude.toFixed(2) }}, {{ form.longitude.toFixed(2) }})
        </p>
    </div>

    <hr class="border-thistle">

 <div class="max-w-xl mx-auto p-8 bg-theme-primary shadow-xl rounded-2xl border-2 border-thistle space-y-6">
    <hr class="border-thistle">

        <h2 class="text-xl font-display text-paynes-gray text-center">Privacy della Posizione 🔒</h2>
        
        <div class="p-3 bg-tea-rose-red/20 border-l-4 border-tea-rose-red text-sm text-paynes-gray">
            Importante: Qui decidi la precisione della tua posizione. Se scegli "Posizione Esatta" (0m), la tua posizione non verrà offuscata. Puoi cambiare queste impostazioni di precisione e visibilità in qualsiasi momento dal tuo Profilo Utente.
        </div>
        
        <div>
            <label for="visibility" class="block text-sm font-medium mb-1 text-paynes-gray">Chi può vedere la mia area di prossimità?</label>
            <select v-model="form.visibility" id="visibility" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp">
                <option value="all">Tutti gli utenti di Bibliomap</option>
                <option value="friends">Solo i miei amici (Mock)</option>
                <option value="private">Nessuno (Uso solo per distanza da me)</option>
            </select>
        </div>

        <div class="space-y-2">
            <label for="precision" class="block text-sm font-medium text-paynes-gray">
                Livello di Offuscamento (Precisione):
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
                    max="2000" 
                    step="100"
                    class="w-full h-2 bg-thistle rounded-lg appearance-none cursor-pointer range-lg dark:bg-ash-gray focus:outline-none focus:ring-2 focus:ring-zomp"
                >
            </div>
            
            <div class="flex justify-between text-xs text-paynes-gray/70">
                <span>Posizione Esatta (0m)</span>
                <span>Area Larga (2km)</span>
            </div>

            <p class="text-xs text-paynes-gray/70 mt-1">
                Scegli quanto vuoi che la tua posizione sia offuscata, per incrementi di 100 metri.
            </p>
        </div>
    </div>

    <button
        @click="saveLocationAndContinue"
        :disabled="!isLocationSet"
        id="save-location-btn"
        class="w-full bg-zomp text-white py-3 rounded-lg hover:bg-paynes-gray transition duration-150 disabled:opacity-50 font-bold text-lg"
    >
        Salva Posizione e Inserisci il tuo Primo Libro!
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import maplibregl from 'maplibre-gl';

const router = useRouter()

const locationMode = ref('geo') // geo, map, address
const form = ref({
    latitude: null,
    longitude: null,
    address: '',
    visibility: 'all' 
})

// per gestire lo stato (caricamento) e l'errore
const isLoadingLocation = ref(false)
const locationError = ref(null)

const displayBlurRadius = computed(() => {
    const radius = form.value.blurRadius;
    
    if (radius === 0) {
        return 'Posizione Esatta (0 metri)';
    }
    if (radius < 1000) {
        return `Offuscamento: ${radius} metri di raggio`;
    } else {
        // Mostra in chilometri con una cifra decimale
        return `Offuscamento: ${(radius / 1000).toFixed(1)} km di raggio`;
    }
});

// --- MAP LIBRE STATE E LOGICA ---
const map = ref(null);
const marker = ref(null);
const mapTilerApiKey = 'smRAOMoK3wb8jS0gS8B0'; // TODO : Spostare in variabile d'ambiente
const styleUrl = `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`;

// Funzione di inizializzazione mappa
const initMap = async () => {
    // Evita di reinizializzare la mappa se esiste già
    if (map.value) {
        map.value.resize(); // Assicura che la mappa si adatti al contenitore
        return;
    }
    
    // Attendi il rendering del div #map
    await nextTick(); 

    if (document.getElementById('map')) {
        map.value = new maplibregl.Map({
            container: 'map',
            style: styleUrl, 
            center: [12.4963, 41.9029], // Centro iniziale (Roma)
            zoom: 12,
        });

        // Crea il marker (colore accento: #fac8cd)
        marker.value = new maplibregl.Marker({ color: '#495d63' })
            .setLngLat(map.value.getCenter())
            .addTo(map.value);

        // Listener Click: Cattura le coordinate
        map.value.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            
            // 1. Aggiorna lo stato Vue (e abilita il pulsante Salva)
            form.value.latitude = lat;
            form.value.longitude = lng;
            
            // 2. Muovi il marker
            marker.value.setLngLat([lng, lat]);
        });
        
        // Se la posizione è già stata impostata (es. da Geolocation)
        if (form.value.latitude && form.value.longitude) {
            marker.value.setLngLat([form.value.longitude, form.value.latitude]);
            map.value.setCenter([form.value.longitude, form.value.latitude]);
        }
    }
};

// --- GESTIONE DEL CAMBIO MODALITÀ ---

// 1. Watch per inizializzare quando l'utente clicca su "Sulla Mappa"
watch(locationMode, (newMode) => {
    if (newMode === 'map') {
        initMap();
    }
});

// 2. onMounted per l'inizializzazione iniziale se la modalità di default è 'map'
onMounted(() => {
    if (locationMode.value === 'map') {
        initMap();
    }
});

// --- ACCESSO GEOLOCALIZZAZIONE ---
function getGeolocation() {
    // 1. Reset e stato di caricamento
    form.value.latitude = null;
    form.value.longitude = null;
    locationError.value = null;
    isLoadingLocation.value = true;

    // 2. Controllo dell'API (sempre buona norma)
    if (!navigator.geolocation) {
        locationError.value = 'Il tuo browser non supporta la geolocalizzazione.';
        isLoadingLocation.value = false;
        return;
    }

    // 3. Richiesta della posizione
    navigator.geolocation.getCurrentPosition(
        
        // Successo
        (position) => {
            form.value.latitude = position.coords.latitude;
            form.value.longitude = position.coords.longitude;
            isLoadingLocation.value = false;
            // Potresti voler spostare il focus sul pulsante "Salva" per usabilità
            nextTick(() => {
                document.querySelector('#save-location-btn').focus();
            });
        }, 
        
        // Errore
        (error) => {
            isLoadingLocation.value = false;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    locationError.value = "Accesso alla posizione negato. Per favore, permetti l'accesso nelle impostazioni del browser.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    locationError.value = "Informazioni sulla posizione non disponibili.";
                    break;
                case error.TIMEOUT:
                    locationError.value = "La richiesta di posizione è scaduta. Riprova.";
                    break;
                default:
                    locationError.value = "Si è verificato un errore sconosciuto durante la geolocalizzazione.";
                    break;
            }
        },
        
        // Opzioni (massima accuratezza, tempo di attesa)
        { 
            enableHighAccuracy: true, 
            timeout: 5000, 
            maximumAge: 0 
        }
    );
}

const isLocationSet = computed(() => {
    if (locationMode.value === 'geo' && form.value.latitude) return true;
    if (locationMode.value === 'map' && form.value.latitude) return true; 
    if (locationMode.value === 'address' && form.value.address.length > 5) return true;
    return false;
})


function saveLocationAndContinue() {
    if (isLocationSet.value) {
        
        console.log('Dati finali da salvare, inclusa la privacy:', form.value);
        
        // QUI CI SAREBBE LA CHIAMATA API AL BACK-END per salvare:
        // form.latitude (Posizione Offuscata dal BE)
        // form.visibility
        // form.blurRadius (raggio)
        
        router.push('/add-book'); 
    }
}

</script>