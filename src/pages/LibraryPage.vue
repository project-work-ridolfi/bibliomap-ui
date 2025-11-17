<template>
  <div class="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl border-2 border-thistle space-y-6">
    <div v-if="isFirstLibrary" class="space-y-4 text-center">
      <h1 class="text-3xl font-display text-paynes-gray">Crea la tua prima libreria</h1>
      <p class="text-paynes-gray">
        Una "libreria" in Bibliomap rappresenta una collezione fisica di libri in un luogo specifico.
        Puoi pensare ad essa come a uno scaffale o una scatola di libri che vuoi condividere.
      </p>
    </div>
    <div v-else class="text-center">
      <h1 class="text-3xl font-display text-paynes-gray">Aggiungi una Nuova Libreria</h1>
    </div>

    <hr class="border-thistle" />

    <!-- Form -->
    <div class="space-y-4">
      <!-- Library Name -->
      <div>
        <label for="libraryName" class="block text-sm font-medium text-paynes-gray">Nome Libreria *</label>
        <input v-model="form.name" id="libraryName" type="text" required placeholder="Es. Scaffale in salotto"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
        <p v-if="isFirstLibrary" class="text-xs text-paynes-gray/70 mt-1">
          Dai un nome a questa collezione di libri.
        </p>
      </div>

      <!-- Location -->
      <div>
        <label class="block text-sm font-medium text-paynes-gray">Posizione</label>
        <p class="text-xs text-paynes-gray/70 mb-2">
          Dove si trovano fisicamente questi libri?
        </p>
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
            Nuova Posizione (TODO)
          </button>
        </div>
        <p v-if="userHasSkippedLocation" class="text-xs text-red-700 font-semibold mt-2 text-center">
          Hai saltato l'impostazione della posizione del profilo. Devi specificare una nuova posizione per la libreria.
        </p>
        <p v-else-if="form.location === 'user_default'" class="text-sm text-zomp font-semibold mt-2 text-center">
          Verrà usata la posizione associata al tuo profilo.
        </p>
         <p v-if="form.location === 'new_location'" class="text-sm text-red-700 font-semibold mt-2 text-center">
          TODO: Implementare la modifica della posizione per la libreria.
        </p>
      </div>

      <!-- Visibility -->
      <div>
        <label for="visibility" class="block text-sm font-medium mb-1 text-paynes-gray">Visibilità Libreria</label>
        <select v-model="form.visibility" id="visibility"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp">
          <option value="all">Tutti</option>
          <option value="logged-in">Solo gli utenti loggati</option>
          <option value="private">Nessuno (Solo io)</option>
        </select>
        <p v-if="isFirstLibrary" class="text-xs text-paynes-gray/70 mt-1">
          Abbiamo pre-impostato la visibilità che hai scelto per il tuo profilo. Puoi cambiarla se vuoi.
        </p>
      </div>
    </div>

     <p v-if="errorMessage" class="text-sm text-red-700 font-medium mt-2 text-center">
        Errore: {{ errorMessage }}
     </p>

    <!-- Buttons -->
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '@/services/apiClient'; 

const router = useRouter();
const route = useRoute();

// determina la versione da mostrare e se l'utente ha saltato il setup della posizione
const isFirstLibrary = computed(() => route.query.from === 'setup');
const userHasSkippedLocation = computed(() => route.query.locationSkipped === 'true');

const form = ref({
  name: '',
  location: 'user_default', // 'user_default' or 'new_location'
  visibility: 'all', 
});

const errorMessage = ref(null);

const isFormValid = computed(() => {
    return form.value.name.trim() !== '';
});


const fetchUserPreferences = async () => {
    console.log("Mock: Chiamata al BE per recuperare le preferenze di posizione/visibilità dell'utente...");
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                visibility: 'all', 
            });
        }, 500);
    });
};

onMounted(async () => {
  if (isFirstLibrary.value) {
    form.value.name = 'La mia prima libreria'
    const initialVisibility = route.query.visibility;
    if (['all', 'logged-in', 'private'].includes(initialVisibility)) {
        form.value.visibility = initialVisibility;
    }

    // Se l'utente ha saltato la posizione, forza la scelta di una nuova posizione
    if (userHasSkippedLocation.value) {
      form.value.location = 'new_location';
    }

  } else {
    try {
        const prefs = await fetchUserPreferences();
        form.value.visibility = prefs.visibility;
    } catch (error) {s
        console.error("Errore nel recuperare le preferenze:", error);
        errorMessage.value = "Impossibile caricare le tue preferenze.";
    }
  }
});

const createLibrary = async () => {
  errorMessage.value = null;
  if (!isFormValid.value) {
      errorMessage.value = "Il nome della libreria è obbligatorio.";
      return;
  }

  const payload = {
      name: form.value.name,
      // La location sarà gestita dal backend in base alla scelta
      location_type: form.value.location, // 'user_default' or 'new_location'
      // Se 'new_location', ci saranno altri campi (da implementare)
      visibility: form.value.visibility
  };

  try {
    console.log("Chiamata al BE per creare la libreria:", payload);
    // TODO: Chiamata reale al BE per la creazione.
    // Se la location è 'new_location', probabilmente si dovrebbe navigare 
    // a un'altra pagina per definire la nuova posizione prima di salvare.
    // Per ora, navighiamo direttamente a new-book.
    router.push('/new-book');

  } catch (error) {
    console.error("Errore durante la creazione della libreria:", error);
    errorMessage.value = "Si è verificato un errore durante la creazione della libreria. Riprova.";
  }
};

const skip = () => {
  console.log("Creazione prima libreria saltata.");
  router.push('/home');
};

</script>
