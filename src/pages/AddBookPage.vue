<template>
  <div class="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl border-2 border-thistle space-y-6">

    <h1 class="text-3xl font-display text-center text-paynes-gray">
      Aggiungi un Libro
    </h1>
    <p v-if="generalError" class="text-sm text-red-700 font-medium mt-2 text-center">errore: {{ generalError }}</p>

    <div v-if="!form.targetLibraryId || !hasLibraries" class="space-y-3 p-4 border rounded-lg border-ash-gray">
        <label for="librarySelect" class="block text-sm font-medium text-paynes-gray">A quale Libreria vuoi aggiungere questo libro? *</label>
        <select 
            v-model="form.targetLibraryId" 
            id="librarySelect"
            :disabled="isFetchingLibraries || !hasLibraries"
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp disabled:opacity-70">
            <option disabled value="">seleziona una libreria</option>
            <option v-for="lib in userLibraries" :key="lib.id" :value="lib.id">
                {{ lib.name }}
            </option>
        </select>
        <p v-if="isFetchingLibraries" class="text-sm text-paynes-gray/70">caricamento librerie...</p>
        <p v-else-if="!hasLibraries" class="text-sm text-red-700">non hai librerie. premi il pulsante in basso per crearne una.</p>
    </div>

    <hr v-if="form.targetLibraryId && hasLibraries" class="border-thistle" />

    <div class="grid grid-cols-2 gap-4" v-if="form.targetLibraryId && hasLibraries">
        <button
            @click="inputMode = 'manual'"
            :class="inputMode === 'manual' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
            <i class="fa-solid fa-pen-to-square mb-2 text-xl"></i><br />
            Dati Manuali
        </button>
        <button
            @click="inputMode = 'isbn'"
            :class="inputMode === 'isbn' ? 'bg-zomp text-white' : 'bg-tea-rose-red/20 text-paynes-gray hover:bg-tea-rose-red/40'"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
            <i class="fa-solid fa-barcode mb-2 text-xl"></i><br />
            Codice ISBN
        </button>
    </div>
    
    <hr class="border-thistle" v-if="inputMode !== null && hasLibraries" />

    <div v-if="inputMode === 'manual' && hasLibraries" class="space-y-4">
        <h2 class="text-xl font-display text-paynes-gray">Dettagli Opera</h2>

        <div class="grid grid-cols-2 gap-3">
            <div>
                <label for="title" class="block text-sm font-medium text-paynes-gray">Titolo *</label>
                <input v-model="form.title" id="title" type="text" required placeholder="es. L'ombra del vento"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
            </div>
            <div>
                <label for="author" class="block text-sm font-medium text-paynes-gray">Autore *</label>
                <input v-model="form.author" id="author" type="text" required placeholder="es. Carlos Ruiz Zafón"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
            </div>
        </div>
        
        <p v-if="isFetchingDetails" class="text-sm text-paynes-gray/70">ricerca dati in corso...</p>
        <p v-else-if="bookDetailsFound" class="text-sm text-zomp font-semibold">dettagli trovati! isbn: {{ form.isbn || 'n/a' }}</p>

        <div class="space-y-3 p-4 border rounded-lg border-thistle">
            <h3 class="text-md font-semibold text-paynes-gray">Dati Statici (Opera)</h3>
            
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label for="isbnManual" class="block text-sm font-medium text-paynes-gray">ISBN (Univoco)</label>
                    <input v-model="form.isbn" id="isbnManual" type="text" placeholder="es. 978-8804689498"
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
                </div>
                <div>
                    <label for="year" class="block text-sm font-medium text-paynes-gray">Anno Pubblicazione</label>
                    <input v-model.number="form.publicationYear" id="year" type="number" placeholder="es. 2001"
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
                </div>
            </div>

            <div>
                <label for="cover" class="block text-sm font-medium text-paynes-gray">Copertina (Opzionale)</label>
                <input @change="handleCoverUpload" id="cover" type="file" accept="image/*"
                    class="w-full text-sm text-paynes-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-ash-gray/30 file:text-paynes-gray hover:file:bg-ash-gray/50" />
                <p v-if="uploadError" class="text-xs text-red-700 font-medium mt-1">errore: {{ uploadError }}</p>
            </div>

        </div>
    </div>
    
    <div v-else-if="inputMode === 'isbn' && hasLibraries" class="space-y-4 text-center p-4 bg-ash-gray/20 rounded-lg">
        <h2 class="text-xl font-display text-paynes-gray">Cerca per Codice ISBN</h2>

        <div class="flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0">
            <div class="w-full md:w-1/2">
                <label for="isbnCode" class="block text-sm font-medium text-paynes-gray mb-1">Codice ISBN *</label>
                <input v-model="form.isbn" id="isbnCode" type="text" placeholder="es. 978-..."
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp" />
                <button @click="fetchBookByIsbn" :disabled="!isIsbnValid"
                    class="w-full mt-2 bg-paynes-gray text-white py-2 rounded-lg hover:bg-paynes-gray/80 transition duration-150 disabled:opacity-50 font-semibold">
                    Cerca Dettagli
                </button>
            </div>
            
            <div class="w-full md:w-1/2 flex flex-col justify-between">
                <p class="text-sm text-paynes-gray/70 mb-1">o scansiona:</p>
                <button @click="openCameraScanner" disabled
                    class="w-full bg-thistle text-paynes-gray py-4 rounded-lg shadow-md font-semibold disabled:opacity-50 cursor-not-allowed">
                    <i class="fa-solid fa-camera mb-1 text-xl"></i><br />
                    Scanner (TODO)
                </button>
            </div>
        </div>

        <p v-if="isbnError" class="text-sm text-red-700 font-medium mt-2">errore ricerca: {{ isbnError }}</p>
        <p v-if="isFetchingIsbnDetails" class="text-sm text-paynes-gray/70 mt-2">ricerca in corso per {{ form.isbn }}...</p>
        <p v-if="isBookDataAvailable" class="text-sm text-zomp font-semibold mt-2">dettagli libro trovati. completa i dati copia in basso.</p>
    </div>
    
    
    <div v-if="isBookDataAvailable && hasLibraries" class="space-y-4 pt-4">
        <hr class="border-thistle" />
        <h2 class="text-xl font-display text-paynes-gray">Dati della tua Copia</h2>

        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block text-sm font-medium text-paynes-gray mb-1">Condizione *</label>
                <div class="space-y-1">
                    <label v-for="cond in conditions" :key="cond" class="flex items-center text-sm text-paynes-gray">
                        <input type="radio" v-model="copyForm.condition" :value="cond" required class="form-radio text-zomp" />
                        <span class="ml-2">{{ cond }}</span>
                    </label>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-paynes-gray mb-1">Stato *</label>
                <div class="space-y-1">
                    <label v-for="stat in statuses" :key="stat.value" class="flex items-center text-sm text-paynes-gray">
                        <input type="radio" v-model="copyForm.status" :value="stat.value" required class="form-radio text-zomp" />
                        <span class="ml-2">{{ stat.label }}</span>
                    </label>
                </div>
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-paynes-gray mb-1">Tag/Generi (Opzionale)</label>
            <div class="flex flex-wrap gap-2">
                <button v-for="tag in availableTags" :key="tag" @click="toggleTag(tag)"
                    :class="copyForm.tags.includes(tag) ? 'bg-paynes-gray text-white' : 'bg-ash-gray/30 text-paynes-gray hover:bg-ash-gray/50'"
                    class="px-3 py-1 text-sm rounded-full transition duration-150">
                    {{ tag }}
                </button>
            </div>
        </div>

        <div>
            <label for="ownerNotes" class="block text-sm font-medium text-paynes-gray">Note Personali (max 250 parole)</label>
            <textarea v-model="copyForm.ownerNotes" id="ownerNotes" rows="4" maxlength="250"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp"></textarea>
        </div>
    </div>


    <hr class="border-thistle" v-if="form.targetLibraryId && hasLibraries" />

    <button 
      @click="handleFinalAction" 
      :disabled="!isReadyToSave && hasLibraries" 
      :class="[!hasLibraries || (isReadyToSave && hasLibraries) ? 'bg-zomp text-white' : 'bg-ash-gray/70 text-paynes-gray']"
      class="w-full py-3 rounded-lg hover:bg-paynes-gray transition duration-150 disabled:opacity-50 font-bold text-lg">
      {{ hasLibraries ? 'Aggiungi Copia' : 'Crea la Tua Prima Libreria' }}
    </button>
    
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '@/services/apiClient'; 
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const route = useRoute();

// --- STATI DATI UTENTE E LIBRERIA ---
const userLibraries = ref([]);
const isFetchingLibraries = ref(false);
const currentUserId = computed(() => authStore.userId); // ID Utente loggato

// --- STATI UI ---
const inputMode = ref(null); 
const generalError = ref(null);
const isbnError = ref(null);

// --- MODELLO DATI LIBRO (statico) ---
const form = ref({
  targetLibraryId: route.query.libraryId || '', // Inizializzato dall'URL o vuoto
  isbn: '',
  title: '',
  author: '',
  publicationYear: null,
  coverFile: null, // oggetto file
});

// --- MODELLO DATI COPIA (dinamico) ---
const copyForm = ref({
    status: 'available', // Default: Disponibile
    condition: null, // Obbligatorio
    ownerNotes: '',
    tags: [],
});

// dati statici per il form copia
const conditions = ['ottima', 'buona', 'accettabile', 'usurata'];
const statuses = [
    { label: 'disponibile', value: 'available' },
    { label: 'in prestito', value: 'on_loan' },
];
const availableTags = ['fiction', 'fantasy', 'thriller', 'storico', 'saggio', 'scientifico', 'biografia', 'poesia'];

// --- STATI RICERCA E CARICAMENTO ---
const isFetchingDetails = ref(false); 
const isFetchingIsbnDetails = ref(false); 

// --- FUNZIONI DI UTILITÀ ---

// funzione per l'autenticazione (richiesta all'arrivo della pagina)
onMounted(() => {
    // se l'id libreria è nell'url, lo impostiamo come target predefinito
    if (libraryId.value) {
        form.value.targetLibraryId = libraryId.value;
        inputMode.value = 'manual';
    }
    fetchUserLibraries(); // carica le librerie dell'utente loggato
});

// recupera le librerie dell'utente (necessario per il menù a tendina)
async function fetchUserLibraries() {
    isFetchingLibraries.value = true
    generalError.value = null // resetta l'errore generale

    try {
        const response = await apiClient.get('/users/me/libraries')
        
        // il be ritorna: { libraries: [...], count: N }
        if (response && Array.isArray(response.libraries)) {
            userLibraries.value = response.libraries

            // se c'è solo una libreria e non è stata scelta la seleziona automaticamente
            if (userLibraries.value.length === 1 && !form.value.targetLibraryId) {
                form.value.targetLibraryId = userLibraries.value[0].id
            }

        } else {
            // se la risposta è success (200 OK) ma malformata
            userLibraries.value = []
            generalError.value = "risposta be malformata durante il caricamento delle librerie."
        }

    } catch (error) {
        // cattura errori 401/500 lanciati da apiClient
        const errorMsg = error.message || "errore di rete non specificato."
        generalError.value = "impossibile caricare la lista delle librerie: " + errorMsg
        console.error("errore be librerie:", error)
    } finally {
        isFetchingLibraries.value = false
    }
}
// gestisce il toggle dei tag
function toggleTag(tag) {
    const index = copyForm.value.tags.indexOf(tag);
    if (index === -1) {
        copyForm.value.tags.push(tag);
    } else {
        copyForm.value.tags.splice(index, 1);
    }
}

// gestisce l'upload della copertina
function handleCoverUpload(event) {
  uploadError.value = null;
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) { // limite 2mb
    uploadError.value = "l'immagine è troppo grande (max 2mb).";
    form.value.coverFile = null;
    return;
  }
  
  form.value.coverFile = file;
  console.log("file copertina selezionato:", file.name);
}


// --- LOGICA DI VALIDAZIONE E RICERCA ---

const isBookDataAvailable = computed(() => {
    return form.value.title.trim() !== '' && form.value.author.trim() !== '';
});

const isIsbnValid = computed(() => {
    const isbn = form.value.isbn;
    return isbn && (isbn.length === 10 || isbn.length === 13);
});

const isCopyFormValid = computed(() => {
    // verifica se la condizione è stata selezionata
    return copyForm.value.condition !== null;
});

const isReadyToSave = computed(() => {
    // pronto se: libro statico è disponibile, target libreria è scelto, e dati copia validi
    return isBookDataAvailable.value && form.value.targetLibraryId !== '' && isCopyFormValid.value;
});

const hasLibraries = computed(() => userLibraries.value.length > 0);

// watcher per la ricerca automatica
watch([() => form.value.title, () => form.value.author], ([newTitle, newAuthor]) => {
  if (inputMode.value === 'manual' && newTitle && newTitle.trim().length > 3 && newAuthor && newAuthor.trim().length > 3) {
    fetchBookDetails(newTitle.trim(), newAuthor.trim());
  }
});

// funzione per cercare dettagli (precompilazione)
async function fetchBookDetails(title, author) {
  isFetchingDetails.value = true;

  // [apiClient.get('/external/book-details?title=' + title + '&author=' + author)]
  await new Promise(resolve => setTimeout(resolve, 1000)); // simulazione be

  // [Rimuovi Dati Mock]
  const isbnData = '978-0143039952';
  const yearData = 2006;
  
  // applica risultati solo se l'utente non ha modificato i campi nel frattempo
  if (form.value.title.trim() === title && form.value.author.trim() === author) {
    form.value.isbn = isbnData;
    form.value.publicationYear = yearData;
  }
  
  isFetchingDetails.value = false;
}

// funzione per cercare dettagli tramite isbn
async function fetchBookByIsbn() {
  isbnError.value = null;
  generalError.value = null;
  if (!isIsbnValid.value) {
    isbnError.value = "inserisci un isbn valido di 10 o 13 cifre.";
    return;
  }
  
  isFetchingIsbnDetails.value = true;

  // [apiClient.get('/external/book-by-isbn/' + form.value.isbn)]
  await new Promise(resolve => setTimeout(resolve, 1500)); // simulazione be

  // [Rimuovi Dati Mock]
  const titleData = 'il nome del vento';
  const authorData = 'patrick rothfuss';
  const yearData = 2007;

  // applica i risultati e passa a modalità manuale per i controlli finali
  form.value.title = titleData;
  form.value.author = authorData;
  form.value.publicationYear = yearData;
  inputMode.value = 'manual'; // passa a manuale per visualizzare e completare

  isFetchingIsbnDetails.value = false;
}


// --- LOGICA FINALE SALVATAGGIO ---

async function addBookToLibrary() {
  if (!isReadyToSave.value) {
    generalError.value = "assicurati di aver selezionato la libreria, titolo, autore e condizione.";
    return;
  }
  
  generalError.value = null;

  // 1. Dati Statici del Libro (BOOK)
  const bookPayload = {
    isbn: form.value.isbn, // obbligatorio se trovato, altrimenti può essere nullo
    title: form.value.title,
    author: form.value.author,
    publicationYear: form.value.publicationYear,
  };
  
  // 2. Dati della Copia (COPIES)
  const copyPayload = {
    libraryId: form.value.targetLibraryId,
    status: copyForm.value.status,
    condition: copyForm.value.condition,
    ownerNotes: copyForm.value.ownerNotes,
    tags: copyForm.value.tags,
  };

  // Logica di salvataggio: in un'architettura completa, questo sarebbe un multipart form
  // che include bookPayload, copyPayload e form.coverFile.
  
  try {
    // [apiClient.post('/books/add-copy-and-book', { book: bookPayload, copy: copyPayload })] // mock call
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    
    alert(`libro '${form.value.title}' aggiunto con successo alla libreria!`);
    
    // reset del form per aggiungere un nuovo libro
    form.value = { targetLibraryId: form.value.targetLibraryId, isbn: '', title: '', author: '', publicationYear: null, coverFile: null };
    copyForm.value = { status: 'available', condition: null, ownerNotes: '', tags: [] };

  } catch (error) {
    generalError.value = "errore be durante l'aggiunta del libro.";
    console.error("errore be:", error);
  }
}
</script>