<template>
  <div
    class="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl border-2 border-thistle space-y-6">
    <template v-if="isFirstLibraryMode">
      <h1 class="text-3xl font-display text-center text-paynes-gray">
        La tua Prima Libreria
      </h1>
      <p class="text-center text-paynes-gray">
        Una **Libreria** è uno scaffale virtuale che puoi associare a una
        posizione fisica. Qui potrai catalogare i tuoi libri per condividerli o
        semplicemente tenerli organizzati. Iniziamo!
      </p>
      <hr class="border-thistle" />
    </template>

    <h2 class="text-2xl font-display text-center text-paynes-gray">
      {{ isFirstLibraryMode ? "Configurazione Veloce" : "Aggiungi una Nuova Libreria" }}
    </h2>

    <form @submit.prevent="createLibrary" class="space-y-6">
      <div>
        <label
          for="libraryName"
          class="block text-lg font-medium text-paynes-gray">
          Nome della Libreria *
        </label>
        <input
          v-model="form.name"
          id="libraryName"
          type="text"
          required
          :placeholder="
            isFirstLibraryMode
              ? 'Il mio scaffale, la mia biblioteca...'
              : 'Nome univoco'
          "
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp text-lg" />
        <p v-if="isFirstLibraryMode" class="mt-1 text-sm text-paynes-gray/70">
          Scegli un nome che ti aiuti a identificare questa raccolta di libri (es. "Il mio primo scaffale").
          Ti consigliamo **{{ prefillData.name }}**.
        </p>
      </div>

      <div>
        <label class="block text-lg font-medium text-paynes-gray">
          Posizione della Libreria *
        </label>

        <div class="space-y-2">
          <div
            v-if="userLocation.latitude"
            @click="locationMode = 'user'"
            :class="
              locationMode === 'user'
                ? 'bg-zomp text-white border-zomp'
                : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40 border-thistle'
            "
            class="p-3 rounded-xl shadow-md transition duration-150 font-semibold border-2 cursor-pointer">
            <i class="fa-solid fa-location-arrow mr-2"></i>
            Usa la tua posizione salvata ({{ userLocation.display }})
          </div>

          <div
            @click="locationMode = 'new'"
            :class="
              locationMode === 'new'
                ? 'bg-zomp text-white border-zomp'
                : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40 border-thistle'
            "
            class="p-3 rounded-xl shadow-md transition duration-150 font-semibold border-2 cursor-pointer">
            <i class="fa-solid fa-map-pin mr-2"></i>
            Nuova Posizione (TODO: Navigare a SetLocation per le Librerie)
          </div>
        </div>

        <p class="mt-1 text-sm text-paynes-gray/70">
          La posizione viene utilizzata per calcolare le distanze. Scegli se usare
          quella che hai già impostato per il tuo profilo o aggiungerne una nuova.
        </p>
      </div>

      <div>
        <label
          for="visibility"
          class="block text-lg font-medium mb-1 text-paynes-gray"
          >Visibilità (Chi può vedere questa Libreria?)</label
        >
        <select
          v-model="form.visibility"
          id="visibility"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp text-lg">
          <option value="all">Tutti gli utenti di Bibliomap</option>
          <option value="friends">Solo i miei amici (Mock)</option>
          <option value="private">Nessuno (Libreria privata)</option>
        </select>
        <p class="mt-1 text-sm text-paynes-gray/70">
          Questo controllo imposta chi può vedere i libri di questa specifica libreria.
          È pre-impostato su **{{ prefillData.visibilityDisplay }}** (sezione privacy della tua posizione).
        </p>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-700 font-medium mt-2">
        Errore: {{ errorMessage }}
      </p>

      <div class="flex" :class="isFirstLibraryMode ? 'justify-between space-x-4' : 'justify-center'">
        <button
          v-if="isFirstLibraryMode"
          @click.prevent="skipAndContinue"
          class="w-1/2 bg-thistle text-paynes-gray py-3 rounded-lg hover:bg-ash-gray transition duration-150 font-bold text-lg">
          Salta
        </button>

        <button
          type="submit"
          :disabled="!isFormValid"
          :class="isFirstLibraryMode ? 'w-1/2' : 'w-full'"
          id="create-library-btn"
          class="bg-zomp text-white py-3 rounded-lg hover:bg-paynes-gray transition duration-150 disabled:opacity-50 font-bold text-lg">
          <i
            :class="isLoading ? 'fa-spinner fa-spin' : 'fa-plus'"
            class="fa-solid mr-2"></i>
          Crea Libreria
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiClient } from "@/services/apiClient"; // Assumo che apiClient esista

const route = useRoute();
const router = useRouter();

// --- STATO E DATI ---

// Mock dei dati dell'utente, normalmente verrebbero da Vuex/Pinia o una chiamata API
const userMockData = {
  defaultName: "Il mio primo scaffale",
  defaultVisibility: "all",
  defaultLocation: {
    latitude: 41.9029,
    longitude: 12.4963,
    display: "Roma Centro (mock)",
  },
};

const isLoading = ref(false);
const errorMessage = ref(null);
const locationMode = ref("user"); // 'user' (salvata) o 'new' (nuova posizione)

const form = ref({
  name: "",
  // lat e lng non sono necessari se usiamo 'userLocation' come riferimento
  visibility: userMockData.defaultVisibility,
  locationReference: "user", // user/new
});

const userLocation = ref({
  latitude: null,
  longitude: null,
  visibility: null,
  display: null,
});

// --- COMPUTED PROPERTIES ---

// Modalità di visualizzazione: true se veniamo da setLocation/onboarding
const isFirstLibraryMode = computed(
  () => route.query.onboarding === "true" || route.query.from === "setLocation"
);

// Dati pre-fill o suggeriti
const prefillData = computed(() => {
  const vis = userLocation.value.visibility || userMockData.defaultVisibility;
  return {
    name: userMockData.defaultName,
    visibility: vis,
    visibilityDisplay:
      vis === "all"
        ? "Tutti"
        : vis === "friends"
        ? "Solo amici"
        : "Nessuno",
  };
});

const isFormValid = computed(() => {
  return form.value.name.length > 0 && form.value.locationReference;
});

// --- FUNZIONI API MOCK ---

// Simula il recupero dei dati di posizione/visibilità dell'utente dal BE
async function fetchUserLibraryDefaults() {
  console.log("Mock: Chiamata al BE per i dati predefiniti dell'utente...");
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simula latenza

  try {
    // Simula risposta del BE con i dati salvati dall'utente
    const mockResponse = {
      defaultLocation: userMockData.defaultLocation,
      defaultVisibility: userMockData.defaultVisibility,
    };
    
    // Aggiorna lo stato della posizione utente
    userLocation.value.latitude = mockResponse.defaultLocation.latitude;
    userLocation.value.longitude = mockResponse.defaultLocation.longitude;
    userLocation.value.visibility = mockResponse.defaultVisibility;
    userLocation.value.display = mockResponse.defaultLocation.display;
    
    // Pre-fill della visibilità nella modalità normale
    form.value.visibility = mockResponse.defaultVisibility;
  } catch (e) {
    console.error("Mock: Errore nel recupero dati utente", e);
    // In caso di errore, usa i valori di fallback del mock iniziale
    userLocation.value.latitude = userMockData.defaultLocation.latitude;
    userLocation.value.longitude = userMockData.defaultLocation.longitude;
    userLocation.value.visibility = userMockData.defaultVisibility;
    userLocation.value.display = userMockData.defaultLocation.display;
  } finally {
    isLoading.value = false;
  }
}

// --- LOGICA DI INIZIALIZZAZIONE ---

onMounted(() => {
  // 1. Logica di inizializzazione per la Modalità Onboarding
  if (isFirstLibraryMode.value) {
    console.log("Modalità: Prima Libreria (Onboarding)");
    // Pre-fill: nome e visibilità con i dati consigliati
    form.value.name = prefillData.value.name;
    form.value.visibility = prefillData.value.visibility;
    
    // Poiché veniamo da setLocation, la posizione è stata salvata
    userLocation.value = userMockData.defaultLocation;
    userLocation.value.visibility = userMockData.defaultVisibility;
  } 
  // 2. Logica di inizializzazione per la Modalità Normale (Aggiungi Libreria)
  else {
    console.log("Modalità: Aggiungi Libreria (Normale)");
    // Chiamata al BE per recuperare i default dell'utente
    fetchUserLibraryDefaults();
    // Il nome rimane vuoto in questa modalità
    form.value.name = "";
  }
});

// --- GESTIONE DEI PULSANTI ---

// Gestione del bottone "Crea Libreria"
async function createLibrary() {
  if (!isFormValid.value) return;

  isLoading.value = true;
  errorMessage.value = null;

  // Determina le coordinate da inviare al BE
  let latToSend = userLocation.value.latitude;
  let lngToSend = userLocation.value.longitude;
  let locationModeSent = "user_default";

  if (locationMode.value === 'new') {
    // TODO: Qui dovresti navigare all'interfaccia di SetLocation per le librerie, 
    // ma per ora simuliamo l'uso della posizione utente come fallback.
    // Nella realtà, se locationMode fosse 'new', o avresti un sub-form qui, 
    // oppure reindirizzeresti l'utente.
    console.warn("TODO: 'Nuova Posizione' selezionata. Gestione della nuova posizione da implementare (es. naviga a /set-library-location)");
    errorMessage.value = "La selezione di 'Nuova Posizione' è in fase di implementazione (TODO)."
    isLoading.value = false;
    return;
  }


  const payload = {
    name: form.value.name,
    latitude: latToSend,
    longitude: lngToSend,
    visibility: form.value.visibility,
    locationMode: locationModeSent,
  };

  try {
    console.log("Chiamata API al BE per creare la libreria. Payload:", payload);
    // await apiClient.post('/libraries/create', payload) 

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula chiamata OK

    console.log("Libreria creata con successo.");
    // Passaggio finale: reindirizza alla pagina per l'aggiunta del primo libro
    router.push("/new-book");
  } catch (e) {
    errorMessage.value =
      "Si è verificato un errore durante la creazione della libreria.";
    console.error("Errore creazione libreria:", e);
  } finally {
    isLoading.value = false;
  }
}

// Gestione del bottone "Salta" (solo in modalità Onboarding)
function skipAndContinue() {
  console.log("Creazione libreria saltata. Navigazione a /new-book.");
  router.push("/new-book");
}
</script>

<style scoped>
/* Stili TailwindCSS/Vue */
</style>