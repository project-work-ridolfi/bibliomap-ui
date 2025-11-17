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
          <button @click="form.location = 'user_default'" :class="form.location === 'user_default' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20'"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
            Usa la mia posizione
          </button>
          <button @click="form.location = 'new_location'" :class="form.location === 'new_location' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20'"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
            Nuova Posizione (TODO)
          </button>
        </div>
        <p v-if="form.location === 'user_default'" class="text-sm text-zomp font-semibold mt-2 text-center">
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
          <option value="all">Tutti gli utenti di Bibliomap</option>
          <option value="friends">Solo i miei amici (Mock)</option>
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
        class="w-full bg-zomp text-white py-3 rounded-lg hover:bg-paynes-gray transition duration-150 disabled:opacity-50 font-bold text-lg">
        {{ isFirstLibrary ? 'Crea e Aggiungi Libri' : 'Crea Libreria' }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '@/services/apiClient'; // Assuming you have this

const router = useRouter();
const route = useRoute();

// This computed property determines which version of the page to show
const isFirstLibrary = computed(() => route.query.from === 'setup');

const form = ref({
  name: '',
  location: 'user_default', // 'user_default' or 'new_location'
  visibility: 'all', // 'all', 'friends', 'private'
});

const errorMessage = ref(null);

const isFormValid = computed(() => {
    return form.value.name.trim() !== '';
});

// Mock function to fetch user preferences
const fetchUserPreferences = async () => {
    console.log("Mock: Chiamata al BE per recuperare le preferenze di posizione/visibilità dell'utente...");
    // In a real app, this would be an API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                visibility: 'all', // Default visibility from user profile
                // location data could also be fetched here
            });
        }, 500);
    });
};


onMounted(async () => {
  if (isFirstLibrary.value) {
    // We are in the "first library" flow
    form.value.name = 'La mia prima libreria';
    // The visibility is passed via query param from the SetLocationPage
    const initialVisibility = route.query.visibility;
    if (['all', 'friends', 'private'].includes(initialVisibility)) {
        form.value.visibility = initialVisibility;
    }
  } else {
    // We are in the "add new library" flow
    // Fetch user's default settings from the backend
    try {
        const prefs = await fetchUserPreferences();
        form.value.visibility = prefs.visibility;
    } catch (error) {
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
      location: form.value.location, // This will need more complex handling for 'new_location'
      visibility: form.value.visibility
  };

  try {
    // Replace with your actual API endpoint for creating a library
    console.log("Chiamata al BE per creare la libreria:", payload);
    // const response = await apiClient.post('/libraries', payload);
    // const newLibraryId = response.data.id;

    // On success, navigate to the page to add a new book
    // possibly passing the new library ID
    // router.push(`/new-book?libraryId=${newLibraryId}`);
    router.push('/new-book');

  } catch (error) {
    console.error("Errore durante la creazione della libreria:", error);
    errorMessage.value = "Si è verificato un errore durante la creazione della libreria. Riprova.";
  }
};

const skip = () => {
  // If the user skips, just go to the next step
  console.log("Creazione prima libreria saltata.");
  router.push('/new-book');
};

</script>