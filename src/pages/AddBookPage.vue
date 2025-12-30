<template>
  <div
    class="max-w-4xl mx-auto p-8 shadow-xl rounded-2xl border-2 transition-colors duration-300 bg-theme-primary text-theme-main border-gray-200 dark:border-gray-700 relative space-y-6">
    <h1 class="text-3xl font-display text-center text-theme-main lowercase">
      aggiungi un libro
    </h1>

    <div
      class="space-y-3 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)]">
      <label
        class="block text-sm font-bold text-theme-main lowercase opacity-70"
        >libreria di destinazione *</label
      >
      <p v-if="isFetchingLibraries" class="text-sm animate-pulse lowercase">
        caricamento librerie...
      </p>
      <div v-else-if="!hasLibraries" class="text-center py-4">
        <p class="text-sm text-red-500 mb-2 lowercase">
          non hai ancora creato nessuna libreria
        </p>
        <router-link
          to="/create-library"
          class="text-[var(--zomp)] font-bold underline text-sm"
          >crea la tua prima libreria</router-link
        >
      </div>
      <div
        v-else-if="userLibraries.length === 1"
        class="flex items-center text-theme-main font-bold">
        <i class="fa-solid fa-shop mr-2 text-[var(--zomp)]"></i>
        <span>{{ userLibraries[0].name }}</span>
      </div>
      <select
        v-else
        v-model="form.targetLibraryId"
        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600 outline-none">
        <option disabled value="">seleziona una libreria</option>
        <option v-for="lib in userLibraries" :key="lib.id" :value="lib.id">
          {{ lib.name }}
        </option>
      </select>
    </div>

    <div
      class="grid grid-cols-2 gap-4"
      v-if="form.targetLibraryId && hasLibraries">
      <button
        @click="switchMode('manual')"
        :class="
          inputMode === 'manual'
            ? 'bg-[var(--zomp)] text-white border-transparent'
            : 'bg-white border-gray-200 text-theme-main'
        "
        class="p-4 rounded-xl shadow-sm transition duration-150 font-bold border-2 lowercase">
        <i class="fa-solid fa-pen-to-square mb-1"></i><br />
        manuale
      </button>
      <button
        @click="switchMode('isbn')"
        :class="
          inputMode === 'isbn'
            ? 'bg-[var(--zomp)] text-white border-transparent'
            : 'bg-white border-gray-200 text-theme-main'
        "
        class="p-4 rounded-xl shadow-sm transition duration-150 font-bold border-2 lowercase">
        <i class="fa-solid fa-barcode mb-1"></i><br />
        isbn
      </button>
    </div>

    <div
      v-if="inputMode === 'isbn' && hasLibraries"
      class="space-y-4 p-5 rounded-xl border border-gray-200 bg-[var(--bg-secondary)] animate-fade-in">
      <div v-if="!isScanning" class="flex flex-col md:flex-row gap-6">
        <div class="flex-grow space-y-2">
          <div class="flex items-center gap-2">
            <label class="block text-sm font-bold opacity-70 lowercase"
              >codice isbn</label
            >
            <div class="relative group">
              <button
                class="w-4 h-4 rounded-full bg-[var(--paynes-gray)] text-white text-[10px] flex items-center justify-center font-bold cursor-help">
                ?
              </button>
              <div
                class="absolute left-6 top-0 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-50 text-paynes-gray lowercase">
                l'isbn è un codice di 13 cifre che identifica univocamente un
                libro.
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              v-model="form.isbn"
              type="text"
              placeholder="es. 978..."
              class="w-full px-3 py-2 border rounded-lg bg-theme-primary border-gray-300 outline-none focus:ring-2 focus:ring-[var(--zomp)] text-theme-main" />
            <button
              @click="fetchBookByIsbn"
              :disabled="!isIsbnValid"
              class="bg-[var(--paynes-gray)] text-white px-4 rounded-lg hover:opacity-90 disabled:opacity-30 transition">
              <i class="fa-solid fa-search"></i>
            </button>
          </div>
        </div>
        <button
          @click="handleStartScan"
          class="md:w-48 bg-[var(--paynes-gray)] text-white py-2 px-4 rounded-lg shadow font-bold flex items-center justify-center gap-2 self-end lowercase">
          <i class="fa-solid fa-camera"></i> scanner
        </button>
      </div>
      <div v-else class="space-y-4">
        <div
          ref="scannerContainer"
          class="border-2 border-[var(--zomp)] rounded-xl overflow-hidden h-48 relative bg-black">
          <div
            v-if="isLoadingCamera"
            class="absolute inset-0 flex items-center justify-center text-white/70 z-10 lowercase">
            avvio fotocamera...
          </div>
          <div class="scanning-bar"></div>
        </div>
        <button
          @click="handleStopScan"
          class="w-full py-2 text-red-500 font-bold text-sm lowercase">
          ferma scanner
        </button>
      </div>
      <p v-if="isbnError" class="text-xs text-red-600 text-center font-bold">
        {{ isbnError }}
      </p>
    </div>

    <div
      v-if="(inputMode === 'manual' || bookDetailsFound) && hasLibraries"
      class="space-y-8 animate-slide-up">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          :class="
            isDragging
              ? 'border-[var(--zomp)] bg-[var(--zomp)]/10'
              : 'border-gray-300 bg-white'
          "
          class="border-2 border-dashed rounded-xl p-4 transition-all text-center relative flex flex-col items-center justify-center min-h-[180px]">
          <div v-if="previewUrl" class="relative group">
            <img
              :src="previewUrl"
              class="h-32 object-contain rounded shadow-md" />
            <button
              @click.stop="removeCover"
              type="button"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 z-10">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div v-else class="space-y-1 opacity-50">
            <i class="fa-solid fa-cloud-arrow-up text-2xl text-theme-main"></i>
            <p class="text-xs lowercase text-theme-main">
              carica o trascina copertina
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            @change="handleCoverUpload"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>

        <button
          @click="startPhotoCapture"
          class="h-[180px] rounded-xl border-2 border-dashed border-[var(--paynes-gray)] text-[var(--paynes-gray)] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition lowercase font-bold">
          <i class="fa-solid fa-camera text-2xl"></i>
          <span class="text-xs">scatta foto alla copia</span>
        </button>
      </div>

      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-secondary)] p-6 rounded-xl">
        <div class="md:col-span-2">
          <label class="block text-xs font-bold opacity-70 mb-1 lowercase"
            >titolo *</label
          >
          <input
            v-model="form.title"
            type="text"
            :readonly="lockedFields.includes('title')"
            @input="debouncedManualSearch"
            class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300 text-theme-main" />
        </div>
        <div>
          <label class="block text-xs font-bold opacity-70 mb-1 lowercase"
            >autore *</label
          >
          <input
            v-model="form.author"
            type="text"
            :readonly="lockedFields.includes('author')"
            @input="debouncedManualSearch"
            class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300 text-theme-main" />
        </div>
        <div>
          <label class="block text-xs font-bold opacity-70 mb-1 lowercase"
            >editore</label
          >
          <input
            v-model="form.publisher"
            type="text"
            :readonly="lockedFields.includes('publisher')"
            class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300 text-theme-main" />
        </div>
        <div class="grid grid-cols-2 gap-4 md:col-span-2">
          <div>
            <label class="block text-xs font-bold opacity-70 mb-1 lowercase"
              >anno</label
            >
            <input
              v-model.number="form.publicationYear"
              type="number"
              class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300 text-theme-main" />
          </div>
          <div>
            <label class="block text-xs font-bold opacity-70 mb-1 lowercase"
              >lingua</label
            >
            <input
              v-model="form.language"
              type="text"
              class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300 text-theme-main" />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <h2
          class="text-xl font-display text-[var(--paynes-gray)] lowercase text-theme-main">
          dati della tua copia
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-bold opacity-70 mb-2 lowercase"
              >condizione *</label
            >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cond in conditions"
                :key="cond.value"
                @click="copyForm.condition = cond.value"
                :class="
                  copyForm.condition === cond.value
                    ? 'bg-[var(--zomp)] text-white border-transparent'
                    : 'bg-white border-gray-200 text-theme-main'
                "
                class="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all lowercase">
                {{ cond.label }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold opacity-70 mb-2 lowercase"
              >stato *</label
            >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="stat in statuses"
                :key="stat.value"
                @click="copyForm.status = stat.value"
                :class="
                  copyForm.status === stat.value
                    ? 'bg-[var(--paynes-gray)] text-white border-transparent'
                    : 'bg-white border-gray-200 text-theme-main'
                "
                class="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all lowercase">
                {{ stat.label }}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold opacity-70 mb-2 lowercase"
            >tag e generi</label
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in copyForm.tags"
              :key="tag"
              @click="toggleTag(tag)"
              class="bg-[var(--zomp)] text-white px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-transparent transition-all lowercase">
              {{ tag }} <i class="fa-solid fa-xmark ml-1"></i>
            </button>
            <hr
              v-if="copyForm.tags.length > 0"
              class="w-full border-transparent h-1" />
            <button
              v-for="tag in availableTags"
              :key="tag"
              @click="toggleTag(tag)"
              :class="
                copyForm.tags.includes(tag)
                  ? 'hidden'
                  : 'bg-white border-gray-200 text-theme-main'
              "
              class="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all lowercase">
              {{ tag }}
            </button>
            <button
              v-if="!showTagInput"
              @click="showTagInput = true"
              class="w-8 h-8 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-[var(--zomp)] hover:bg-white transition">
              <i class="fa-solid fa-plus"></i>
            </button>
            <div v-else class="flex gap-1">
              <input
                ref="tagInputRef"
                v-model="newCustomTag"
                @keyup.enter="addCustomTag"
                @blur="cancelTagInput"
                class="px-3 py-1 text-xs border-2 rounded-lg w-24 bg-white outline-none focus:border-[var(--zomp)] text-theme-main" />
              <button
                @click="addCustomTag"
                class="bg-[var(--zomp)] text-white px-2 rounded-lg text-xs font-bold">
                ok
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold opacity-70 mb-1 lowercase"
            >note personali</label
          >
          <textarea
            v-model="copyForm.ownerNotes"
            rows="3"
            class="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--zomp)] resize-none border-gray-300 text-theme-main"></textarea>
        </div>
      </div>
    </div>

    <div v-if="hasLibraries" class="flex gap-4 pt-6">
      <button
        @click="router.push('/dashboard')"
        class="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-[var(--paynes-gray)] hover:bg-gray-50 transition lowercase text-theme-main">
        annulla
      </button>
      <button
        @click="submitBook"
        :disabled="isSubmitting"
        class="flex-[2] py-3 rounded-xl font-bold text-white shadow-lg transition duration-150 lowercase disabled:opacity-30"
        :class="isReadyToSave ? 'bg-[var(--zomp)]' : 'bg-gray-400'">
        <span v-if="isSubmitting"
          ><i class="fa-solid fa-circle-notch fa-spin mr-2"></i
          >salvataggio...</span
        >
        <span v-else>salva libro e copia</span>
      </button>
    </div>

    <div
      v-if="showConflictModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slide-up">
        <h3 class="font-display text-lg mb-4 lowercase text-paynes-gray">
          libri simili trovati
        </h3>
        <div class="space-y-3 max-h-80 overflow-y-auto pr-2">
          <button
            v-for="book in conflictBooks"
            :key="book.isbn"
            @click="selectBookFromModal(book)"
            class="w-full text-left p-3 border-2 border-gray-100 rounded-xl hover:border-[var(--zomp)] hover:bg-[var(--zomp)]/5 transition flex gap-3 items-center">
            <div
              class="w-10 h-14 bg-gray-100 flex items-center justify-center rounded shrink-0 overflow-hidden text-paynes-gray">
              <img
                v-if="book.cover"
                :src="book.cover"
                class="w-full h-full object-cover" />
              <i v-else class="fa-solid fa-book opacity-30"></i>
            </div>
            <div class="text-xs overflow-hidden flex-grow text-paynes-gray">
              <strong class="block truncate text-sm">{{ book.title }}</strong>
              <span class="block opacity-70 truncate">{{ book.author }}</span>
              <div class="mt-1 opacity-50 flex gap-2">
                <span>{{ book.publisher }}</span>
                <span>{{ book.publication_year }}</span>
                <span class="uppercase font-bold">{{ book.language }}</span>
              </div>
            </div>
          </button>
        </div>
        <button
          @click="showConflictModal = false"
          class="mt-6 w-full py-3 border-2 border-gray-200 rounded-xl font-bold text-sm lowercase text-paynes-gray">
          inserisci i dati manualmente
        </button>
      </div>
    </div>

    <div
      v-if="showIsbnRequestModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-slide-up">
        <h3 class="font-display text-lg lowercase text-paynes-gray">
          isbn mancante
        </h3>
        <p class="text-sm text-paynes-gray lowercase">
          per salvare questo libro nel database mondiale è necessario l'isbn. lo
          trovi sul retro del libro.
        </p>
        <div class="flex gap-2 items-center justify-center">
          <input
            v-model="form.isbn"
            type="text"
            placeholder="978..."
            class="px-4 py-2 border-2 rounded-xl outline-none focus:border-[var(--zomp)] text-center w-full text-paynes-gray" />
          <div class="relative group">
            <button
              class="w-6 h-6 rounded-full bg-gray-200 text-xs flex items-center justify-center font-bold text-paynes-gray cursor-help">
              ?
            </button>
            <div
              class="absolute right-0 bottom-8 w-48 p-2 bg-paynes-gray text-white text-[10px] rounded shadow-xl hidden group-hover:block text-left">
              codice di 13 cifre che identifica univocamente l'edizione.
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 mt-4">
          <button
            @click="handleIsbnModalSubmit"
            :disabled="!isIsbnValid"
            class="w-full py-3 bg-[var(--zomp)] text-white rounded-xl font-bold lowercase disabled:opacity-30">
            cerca e valida
          </button>
          <button
            @click="forceSubmitWithoutIsbn"
            class="w-full py-2 text-[var(--paynes-gray)] text-xs underline lowercase">
            non lo trovo / procedi senza isbn
          </button>
          <button
            @click="showIsbnRequestModal = false"
            class="w-full py-2 text-red-500 text-xs lowercase">
            annulla
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isCapturingPhoto || isCropping"
      class="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
      <div
        v-if="isCapturingPhoto"
        class="w-full h-full flex flex-col items-center">
        <video
          ref="photoVideo"
          autoplay
          playsinline
          class="max-w-full max-h-[70vh] rounded-2xl shadow-2xl bg-gray-900"></video>
        <div class="mt-8 flex gap-6">
          <button
            @click="takePhoto"
            class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <i class="fa-solid fa-camera text-2xl text-paynes-gray"></i>
          </button>
          <button
            @click="stopPhotoCapture"
            class="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl">
            <i class="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>
      </div>
      <div
        v-if="isCropping"
        class="w-full h-full flex flex-col items-center animate-fade-in">
        <h2 class="text-white mb-4 lowercase font-bold">regola l'immagine</h2>
        <div
          class="relative max-w-full max-h-[65vh] border-4 border-white rounded-xl overflow-hidden bg-white shadow-2xl flex items-center justify-center">
          <img
            :src="rawImageData"
            class="max-h-[65vh] object-contain transition-transform duration-300 origin-center"
            :style="`transform: scale(${cropZoom});`" />
          <div
            class="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
            <div
              class="w-full h-full border-2 border-white border-dashed opacity-50"></div>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-6">
          <button
            @click="cropZoom = Math.max(0.1, cropZoom - 0.1)"
            class="w-10 h-10 bg-white/20 text-white rounded-full hover:bg-white/40 transition font-bold">
            -
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            v-model.number="cropZoom"
            class="w-32 accent-[var(--zomp)]" />
          <button
            @click="cropZoom = Math.min(5, cropZoom + 0.1)"
            class="w-10 h-10 bg-white/20 text-white rounded-full hover:bg-white/40 transition font-bold">
            +
          </button>
        </div>
        <div class="mt-8 flex gap-6">
          <button
            @click="applyCrop"
            class="bg-[var(--zomp)] text-white px-10 py-3 rounded-xl font-bold lowercase shadow-xl">
            conferma
          </button>
          <button
            @click="isCropping = false"
            class="bg-red-500 text-white px-10 py-3 rounded-xl font-bold lowercase shadow-xl text-xs">
            annulla
          </button>
        </div>
      </div>
      <canvas ref="photoCanvas" class="hidden"></canvas>
    </div>

    <AppModal
      :isOpen="isModalOpen"
      :title="modalTitle"
      :content="modalContent"
      @close="handleModalClose">
      <div v-if="isSuccess" class="flex justify-end pt-4">
        <button
          @click="handleModalClose"
          class="bg-[var(--zomp)] text-white px-8 py-2 rounded-xl font-bold lowercase">
          finito
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiClient } from "@/services/apiClient";
import { startScanner, stopScanner } from "@/services/scannerService";
import AppModal from "@/components/AppModal.vue";

const route = useRoute();
const router = useRouter();

// stati base
const userLibraries = ref([]);
const isFetchingLibraries = ref(false);
const inputMode = ref(null);
const isSubmitting = ref(false);
const isSearching = ref(false); // Flag per evitare doppie modali
const isModalOpen = ref(false);
const modalTitle = ref("");
const modalContent = ref("");
const isSuccess = ref(false);
const showIsbnRequestModal = ref(false);
const showConflictModal = ref(false);
const conflictBooks = ref([]);
const searchCache = new Map();

// form
const form = ref({
  targetLibraryId: "",
  isbn: "",
  title: "",
  author: "",
  publisher: "",
  language: "",
  publicationYear: null,
  coverFile: null,
});
const copyForm = ref({
  status: "available",
  condition: null,
  ownerNotes: "",
  tags: [],
});

// ui/image/crop
const isDragging = ref(false);
const previewUrl = ref(null);
const rawImageData = ref(null);
const isCropping = ref(false);
const cropZoom = ref(1);
const isbnError = ref(null);
const bookDetailsFound = ref(false);
const lockedFields = ref([]);
const showTagInput = ref(false);
const newCustomTag = ref("");
const tagInputRef = ref(null);

// scanner/photo
const isScanning = ref(false);
const scannerContainer = ref(null);
const isLoadingCamera = ref(false);
const isCapturingPhoto = ref(false);
const photoVideo = ref(null);
const photoCanvas = ref(null);
const photoStream = ref(null);

// statici
const conditions = [
  { label: "Nuovo", value: "New" },
  { label: "Ottimo", value: "Great" },
  { label: "Buono", value: "Good" },
  { label: "Usurato", value: "Worn" },
  { label: "Rovinato", value: "Damaged" },
];
const statuses = [
  { label: "disponibile", value: "available" },
  { label: "in prestito", value: "on_loan" },
];
const availableTags = [
  "romanzo rosa",
  "fantasy",
  "fantascienza",
  "horror",
  "thriller",
  "storico",
  "giallo",
  "biografia",
  "saggio",
  "scientifico",
];

onMounted(() => {
  const qLib = route.query.libraryId;
  if (qLib) form.value.targetLibraryId = qLib;
  fetchUserLibraries();
});

onUnmounted(() => {
  if (isScanning.value) stopScanner();
  stopPhotoCapture();
});

const hasLibraries = computed(() => userLibraries.value.length > 0);
const isIsbnValid = computed(
  () => form.value.isbn?.length === 10 || form.value.isbn?.length === 13
);
const isReadyToSave = computed(
  () =>
    form.value.title &&
    form.value.author &&
    copyForm.value.condition &&
    form.value.targetLibraryId
);

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const debouncedManualSearch = debounce(async () => {
  // Se è già in corso una ricerca o se i campi sono bloccati, usciamo
  if (
    inputMode.value !== "manual" ||
    !form.value.title ||
    form.value.title.length < 4 ||
    isSearching.value
  )
    return;

  const cacheKey = `${form.value.title.toLowerCase()}|${form.value.author?.toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    handleSearchResults(searchCache.get(cacheKey));
    return;
  }

  isSearching.value = true;
  try {
    const res = await apiClient.get("/books/external/search-isbn", {
      params: { title: form.value.title, author: form.value.author },
    });
    searchCache.set(cacheKey, res);
    handleSearchResults(res);
  } catch (e) {
    console.error(e);
  } finally {
    isSearching.value = false;
  }
}, 1500);

function handleSearchResults(books) {
  if (!books || books.length === 0) return;
  if (books.length === 1) applySuggestion(books[0]);
  else {
    conflictBooks.value = books;
    showConflictModal.value = true;
  }
}

function applySuggestion(book) {
  form.value.title = book.title || form.value.title;
  form.value.author = book.author || form.value.author;
  form.value.publisher = book.publisher || form.value.publisher;
  form.value.language = book.language || form.value.language;
  form.value.publicationYear =
    book.publication_year || form.value.publicationYear;
  form.value.isbn = book.isbn || form.value.isbn;
  if (book.cover && !form.value.coverFile)
    previewUrl.value = book.cover.replace("http:", "https:");
  bookDetailsFound.value = true;
  // Blocco temporaneo watcher per evitare loop su autofill
  lockedFields.value = ["title", "author"];
}

function selectBookFromModal(book) {
  applySuggestion(book);
  showConflictModal.value = false;
}

async function fetchUserLibraries() {
  isFetchingLibraries.value = true;
  try {
    const res = await apiClient.get("/users/me/libraries");
    userLibraries.value = res.libraries || [];
    if (userLibraries.value.length === 1)
      form.value.targetLibraryId = userLibraries.value[0].id;
  } finally {
    isFetchingLibraries.value = false;
  }
}

async function fetchBookByIsbn() {
  if (!isIsbnValid.value) return;
  isbnError.value = null;
  try {
    const res = await apiClient.get("/books/external/lookup-metadata", {
      params: { isbn: form.value.isbn },
    });
    applySuggestion({ ...res, isbn: form.value.isbn });
    inputMode.value = "manual";
  } catch (e) {
    isbnError.value = "libro non trovato";
  }
}

function handleIsbnModalSubmit() {
  showIsbnRequestModal.value = false;
  fetchBookByIsbn();
}

// GESTIONE IMMAGINE E RITAGLIO DINAMICO (GRANDZZA INIZIALE REALE)
function handleCoverUpload(e) {
  const f = e.target.files[0];
  if (f) initCrop(f);
}
function handleDrop(e) {
  isDragging.value = false;
  const f = e.dataTransfer.files[0];
  if (f) initCrop(f);
}

function initCrop(f) {
  const reader = new FileReader();
  reader.onload = (e) => {
    rawImageData.value = e.target.result;
    cropZoom.value = 1; // Grandezza iniziale = stessa della foto
    isCropping.value = true;
  };
  reader.readAsDataURL(f);
}

function applyCrop() {
  const canvas = photoCanvas.value;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = rawImageData.value;
  img.onload = () => {
    // Calcoliamo la dimensione basata sullo zoom dell'utente (senza perdere pezzi a zoom 1)
    const renderWidth = img.width * cropZoom.value;
    const renderHeight = img.height * cropZoom.value;

    canvas.width = 400;
    canvas.height = 600;

    // Disegniamo l'immagine centrata nel canvas del risultato
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      (canvas.width - renderWidth) / 2,
      (canvas.height - renderHeight) / 2,
      renderWidth,
      renderHeight
    );

    canvas.toBlob(
      (b) => {
        form.value.coverFile = new File([b], "cover.jpg", {
          type: "image/jpeg",
        });
        previewUrl.value = URL.createObjectURL(b);
        isCropping.value = false;
      },
      "image/jpeg",
      0.9
    );
  };
}

function removeCover() {
  form.value.coverFile = null;
  previewUrl.value = null;
  rawImageData.value = null;
}

async function startPhotoCapture() {
  isCapturingPhoto.value = true;
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    photoStream.value = s;
    photoVideo.value.srcObject = s;
  } catch (e) {
    isCapturingPhoto.value = false;
  }
}

function stopPhotoCapture() {
  if (photoStream.value) photoStream.value.getTracks().forEach((t) => t.stop());
  isCapturingPhoto.value = false;
}

function takePhoto() {
  const ctx = photoCanvas.value.getContext("2d");
  photoCanvas.value.width = photoVideo.value.videoWidth;
  photoCanvas.value.height = photoVideo.value.videoHeight;
  ctx.drawImage(photoVideo.value, 0, 0);
  rawImageData.value = photoCanvas.value.toDataURL("image/jpeg");
  cropZoom.value = 1;
  isCropping.value = true;
  stopPhotoCapture();
}

async function handleStartScan() {
  isScanning.value = true;
  isLoadingCamera.value = true;
  try {
    await startScanner(scannerContainer.value, (c) => {
      form.value.isbn = c;
      handleStopScan();
      fetchBookByIsbn();
    });
  } catch (e) {
    isScanning.value = false;
  } finally {
    isLoadingCamera.value = false;
  }
}
function handleStopScan() {
  stopScanner();
  isScanning.value = false;
}

function addCustomTag() {
  const v = newCustomTag.value.trim().toLowerCase();
  if (v && !copyForm.value.tags.includes(v)) copyForm.value.tags.push(v);
  newCustomTag.value = "";
  showTagInput.value = false;
}
function cancelTagInput() {
  setTimeout(() => {
    if (!newCustomTag.value) showTagInput.value = false;
  }, 200);
}
function toggleTag(t) {
  const i = copyForm.value.tags.indexOf(t);
  if (i === -1) copyForm.value.tags.push(t);
  else copyForm.value.tags.splice(i, 1);
}

function switchMode(m) {
  inputMode.value = m;
  if (m === "manual") lockedFields.value = [];
}

function showModal(t, c, s = false) {
  modalTitle.value = t;
  modalContent.value = c;
  isSuccess.value = s;
  isModalOpen.value = true;
}
function handleModalClose() {
  isModalOpen.value = false;
  if (isSuccess.value) router.push("/dashboard");
}

async function submitBook() {
  if (!isReadyToSave.value || isSubmitting.value) return;
  if (!form.value.isbn) {
    showIsbnRequestModal.value = true;
    return;
  }
  executeSubmit();
}

function forceSubmitWithoutIsbn() {
  showIsbnRequestModal.value = false;
  executeSubmit();
}

async function executeSubmit() {
  isSubmitting.value = true;
  try {
    const bookDTO = {
      ...form.value,
      ...copyForm.value,
      libraryId: form.value.targetLibraryId,
      coverUrl: form.value.coverFile ? null : previewUrl.value,
    };
    const fd = new FormData();
    fd.append(
      "book",
      new Blob([JSON.stringify(bookDTO)], { type: "application/json" })
    );
    if (form.value.coverFile) fd.append("cover", form.value.coverFile);
    await apiClient.post("/books/save", fd);
    showModal("ottimo", "libro aggiunto correttamente", true);
  } catch (e) {
    showModal("attenzione", "errore salvataggio", false);
  } finally {
    isSubmitting.value = false;
  }
}

watch([() => form.value.title, () => form.value.author], () => {
  if (inputMode.value === "manual" && !lockedFields.value.includes("title"))
    debouncedManualSearch();
});
</script>

<style scoped>
.scanning-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--zomp);
  box-shadow: 0 0 12px var(--zomp);
  animation: scan 2s linear infinite;
  z-index: 5;
}
@keyframes scan {
  0% {
    top: 5%;
  }
  100% {
    top: 95%;
  }
}
.font-display {
  font-family: "Mochiy Pop P One", cursive;
}
</style>
