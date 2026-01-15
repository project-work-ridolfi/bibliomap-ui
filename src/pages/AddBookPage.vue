<template>
  <div
    class="max-w-4xl mx-auto p-8 shadow-xl rounded-2xl border-2 transition-colors duration-300 bg-theme-primary text-theme-main border-border-color relative space-y-6">
    <button
      @click="handleCancel"
      class="absolute top-4 left-4 text-theme-main opacity-70 hover:text-accent-color transition-colors flex items-center gap-2 font-bold text-xs uppercase"
      aria-label="annulla o salta operazione">
      <i class="fa-solid fa-arrow-left"></i> {{ isSetup ? "salta" : "annulla" }}
    </button>

    <h1 class="text-3xl font-display text-center text-theme-main pt-4 uppercase">
      aggiungi un libro
    </h1>

    <div
      v-if="!isPostSaveScreen"
      class="space-y-3 p-5 rounded-xl border border-border-color bg-theme-secondary">
      <label class="block text-sm font-bold text-theme-main opacity-70 uppercase"
        >libreria di destinazione *</label
      >
      <p v-if="isFetchingLibraries" class="text-sm animate-pulse uppercase">
        caricamento librerie...
      </p>
      <div v-else-if="!hasLibraries" class="text-center py-4">
        <p class="text-sm text-red-500 mb-2 uppercase font-bold">
          non hai ancora creato nessuna libreria
        </p>
        <router-link
          to="/create-library"
          class="text-accent-color font-bold underline text-sm uppercase"
          aria-label="vai alla pagina crea libreria"
          >crea la tua prima libreria</router-link
        >
      </div>
      <div
        v-else-if="userLibraries.length === 1"
        class="flex items-center text-theme-main font-bold">
        <i class="fa-solid fa-shop mr-2 text-accent-color"></i>
        <span>{{ userLibraries[0].name }}</span>
      </div>
      <select
        v-else
        v-model="form.targetLibraryId"
        class="filter-input"
        aria-label="seleziona libreria di destinazione">
        <option disabled value="">seleziona una libreria</option>
        <option v-for="lib in userLibraries" :key="lib.id" :value="lib.id">
          {{ lib.name }}
        </option>
      </select>
    </div>

    <div v-if="isPostSaveScreen" class="flex flex-col items-center justify-center py-10 space-y-6 text-center custom-fade-in">
      <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-500 text-green-600 mb-2">
        <i class="fa-solid fa-check text-2xl"></i>
      </div>
      <h2 class="text-2xl font-bold uppercase text-theme-main">libro aggiunto con successo!</h2>
      <p class="text-sm opacity-70 max-w-md">il libro è stato inserito correttamente nella tua libreria.</p>
      
      <div class="flex gap-4 mt-4 w-full justify-center">
        <button 
          @click="resetFormForNewBook" 
          class="px-6 py-3 bg-theme-primary border-2 border-accent-color text-accent-color rounded-xl font-bold uppercase text-xs hover:bg-theme-secondary transition"
          aria-label="aggiungi un altro libro">
          <i class="fa-solid fa-plus mr-2"></i> aggiungi altro
        </button>
        <button 
          @click="goToLibrary" 
          class="px-6 py-3 bg-accent-color text-white rounded-xl font-bold uppercase text-xs hover:bg-opacity-90 transition shadow-md"
          aria-label="vai alla libreria">
          vai alla libreria <i class="fa-solid fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>

    <template v-else>
      <div
        class="grid grid-cols-2 gap-4"
        v-if="form.targetLibraryId && hasLibraries">
        <button
          @click="switchMode('manual')"
          :class="
            inputMode === 'manual'
              ? 'btn-sort--active'
              : 'bg-theme-primary border-border-color text-theme-main'
          "
          class="p-4 rounded-xl shadow-sm transition duration-150 font-bold border-2 uppercase text-xs"
          aria-label="modalità inserimento manuale">
          <i class="fa-solid fa-pen-to-square mb-1 text-lg"></i><br />
          manuale
        </button>
        <button
          @click="switchMode('isbn')"
          :class="
            inputMode === 'isbn'
              ? 'btn-sort--active'
              : 'bg-theme-primary border-border-color text-theme-main'
          "
          class="p-4 rounded-xl shadow-sm transition duration-150 font-bold border-2 uppercase text-xs"
          aria-label="modalità inserimento isbn">
          <i class="fa-solid fa-barcode mb-1 text-lg"></i><br />
          isbn
        </button>
      </div>

      <div
        v-if="inputMode === 'isbn' && hasLibraries"
        class="space-y-4 p-5 rounded-xl border border-border-color bg-theme-secondary custom-fade-in">
        <div v-if="!isScanning" class="flex flex-col md:flex-row gap-6">
          <div class="flex-grow space-y-2">
            <div class="flex items-center gap-2">
              <label class="block text-sm font-bold opacity-70 uppercase"
                >codice isbn</label
              >
              <div class="relative group">
                <button
                  class="w-4 h-4 rounded-full bg-theme-main text-theme-primary text-[10px] flex items-center justify-center font-bold cursor-help"
                  aria-label="info su isbn">
                  ?
                </button>
                <div
                  class="absolute left-6 top-0 w-64 p-3 bg-theme-primary border border-border-color rounded-lg shadow-xl hidden group-hover:block z-50 text-xs italic">
                  l'isbn è un codice di 13 cifre che identifica univocamente un libro, tipicamente si trova nella quarta di copertina.
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <input
                v-model="form.isbn"
                type="text"
                placeholder="es. 978..."
                class="filter-input"
                aria-label="inserisci codice isbn" />
              <button
                @click="fetchBookByIsbn"
                :disabled="!isIsbnValid"
                class="btn-sort px-4"
                aria-label="cerca libro per isbn">
                <i class="fa-solid fa-search"></i>
              </button>
            </div>
          </div>
          <button
            @click="handleStartScan"
            class="btn-sort md:w-48 py-2 px-4 shadow font-bold flex items-center justify-center gap-2 self-end uppercase text-xs"
            aria-label="avvia scanner fotocamera">
            <i class="fa-solid fa-camera"></i> scanner
          </button>
        </div>
        <div v-else class="space-y-4">
          <div
            ref="scannerContainer"
            id="scanner-container"
            class="border-2 border-accent-color rounded-xl overflow-hidden h-48 relative bg-black">
            <div
              v-if="isLoadingCamera"
              class="absolute inset-0 flex items-center justify-center text-white/70 z-10 uppercase text-xs font-bold">
              avvio fotocamera...
            </div>
            <div class="scanning-bar"></div>
          </div>
          <button
            @click="handleStopScan"
            class="w-full py-2 text-red-500 font-bold text-sm uppercase"
            aria-label="ferma scansione">
            ferma scanner
          </button>
        </div>
        <p v-if="isbnError" class="text-xs text-red-600 text-center font-bold uppercase">
          {{ isbnError }}
        </p>
      </div>

      <div
        v-if="(inputMode === 'manual' || bookDetailsFound) && hasLibraries"
        class="space-y-8 custom-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            :class="
              isDragging
                ? 'border-accent-color bg-accent-color/10'
                : 'border-border-color bg-theme-primary'
            "
            class="border-2 border-dashed rounded-xl p-4 transition-all text-center relative flex flex-col items-center justify-center min-h-[180px]"
            role="button"
            tabindex="0"
            aria-label="area caricamento copertina">
            
            <div v-if="previewUrl" class="relative group w-[120px] aspect-[2/3] shadow-md rounded overflow-hidden">
              <img
                :src="previewUrl"
                class="w-full h-full object-cover"
                alt="anteprima copertina" />
              <button
                @click.stop="removeCover"
                type="button"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-600 z-10"
                aria-label="rimuovi copertina">
                <i class="fa-solid fa-times text-xs"></i>
              </button>
            </div>
            
            <div v-else class="space-y-1 opacity-50 pointer-events-none">
              <i class="fa-solid fa-cloud-arrow-up text-2xl text-theme-main"></i>
              <p class="text-xs text-theme-main uppercase font-bold tracking-tighter">carica o trascina copertina</p>
            </div>
            <input
              type="file"
              accept="image/*"
              @change="handleCoverUpload"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="seleziona file immagine" />
          </div>

          <button
            @click="startPhotoCapture"
            class="h-[180px] rounded-xl border-2 border-dashed border-border-color bg-theme-primary text-theme-main flex flex-col items-center justify-center gap-2 hover:bg-theme-secondary transition font-bold uppercase shadow-sm"
            aria-label="scatta foto copertina">
            <i class="fa-solid fa-camera text-2xl"></i>
            <span class="text-xs">scatta foto alla copia</span>
          </button>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-theme-secondary p-6 rounded-xl border border-border-color shadow-sm">
          <div class="md:col-span-2">
            <label class="block text-[10px] font-bold opacity-70 mb-1 uppercase"
              >titolo *</label
            >
            <input
              v-model="form.title"
              type="text"
              :readonly="lockedFields.includes('title')"
              @input="debouncedManualSearch"
              class="filter-input"
              aria-label="titolo libro" />
          </div>
          <div>
            <label class="block text-[10px] font-bold opacity-70 mb-1 uppercase"
              >autore *</label
            >
            <input
              v-model="form.author"
              type="text"
              :readonly="lockedFields.includes('author')"
              @input="debouncedManualSearch"
              class="filter-input"
              aria-label="autore libro" />
          </div>
          <div>
            <label class="block text-[10px] font-bold opacity-70 mb-1 uppercase">editore</label>
            <input
              v-model="form.publisher"
              type="text"
              :readonly="lockedFields.includes('publisher')"
              class="filter-input"
              aria-label="editore" />
          </div>
          <div class="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label class="block text-[10px] font-bold opacity-70 mb-1 uppercase">anno</label>
              <input
                v-model.number="form.publicationYear"
                type="number"
                class="filter-input"
                aria-label="anno pubblicazione" />
            </div>
            <div>
              <label class="block text-[10px] font-bold opacity-70 mb-1 uppercase"
                >lingua</label
              >
              <input
                v-model="form.language"
                type="text"
                class="filter-input"
                aria-label="lingua" />
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <h2
            class="text-xl font-display text-theme-main uppercase">
            dati della tua copia:
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-[10px] font-bold opacity-70 mb-2 uppercase"
                >condizione *</label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cond in conditions"
                  :key="cond.value"
                  @click="copyForm.condition = cond.value"
                  :class="
                    copyForm.condition === cond.value
                      ? 'btn-filters--active border-transparent'
                      : 'bg-theme-primary border-border-color text-theme-main'
                  "
                  class="px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all uppercase"
                  :aria-label="'imposta condizione ' + cond.label">
                  {{ cond.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-bold opacity-70 mb-2 uppercase"
                >stato *</label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="stat in statuses"
                  :key="stat.value"
                  @click="copyForm.status = stat.value"
                  :class="
                    copyForm.status === stat.value
                      ? 'btn-sort--active border-transparent'
                      : 'bg-theme-primary border-border-color text-theme-main'
                  "
                  class="px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all uppercase"
                  :aria-label="'imposta stato ' + stat.label">
                  {{ stat.label }}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold opacity-70 mb-2 uppercase"
              >tag e generi</label
            >
            <div class="tag-list tag-list-scrollable p-2 bg-theme-primary border border-border-color rounded-xl min-h-[60px]">
              
              <div v-if="copyForm.tags.length > 0" class="flex flex-wrap gap-2 mb-3 pb-2 border-b border-dashed border-border-color">
                <button
                  v-for="tag in copyForm.tags"
                  :key="tag"
                  @click="toggleTag(tag)"
                  class="btn-tag--active px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase flex items-center gap-1 hover:bg-red-500 hover:text-white"
                  :aria-label="'rimuovi tag ' + tag">
                  {{ tag }} <i class="fa-solid fa-xmark ml-1"></i>
                </button>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in availableTags"
                  :key="tag"
                  @click="toggleTag(tag)"
                  :class="copyForm.tags.includes(tag) ? 'hidden' : 'btn-tag px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all uppercase cursor-pointer hover:border-accent-color'"
                  :aria-label="'aggiungi tag ' + tag">
                  {{ tag }}
                </button>
                
                <button
                  v-if="!showTagInput"
                  @click="showTagInput = true"
                  class="w-8 h-8 rounded-lg bg-theme-secondary border-2 border-border-color flex items-center justify-center text-accent-color hover:bg-theme-primary transition shadow-sm cursor-pointer"
                  title="aggiungi tag personalizzato"
                  aria-label="aggiungi nuovo tag">
                  <i class="fa-solid fa-plus"></i>
                </button>
                
                <div v-else class="flex gap-1 items-center">
                  <input
                    ref="tagInputRef"
                    v-model="newCustomTag"
                    @keyup.enter="addCustomTag"
                    @blur="cancelTagInput"
                    placeholder="nuovo tag..."
                    class="px-3 py-1 text-[10px] border-2 rounded-lg w-24 bg-theme-primary border-border-color outline-none focus:border-accent-color text-theme-main uppercase"
                    aria-label="nome nuovo tag" />
                  <button
                    @click="addCustomTag"
                    class="btn-tag--active px-2 py-1 rounded-lg text-[10px] font-bold uppercase"
                    aria-label="conferma nuovo tag">
                    ok
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold opacity-70 mb-1 uppercase"
              >note personali</label
            >
            <textarea
              v-model="copyForm.ownerNotes"
              rows="3"
              class="w-full px-3 py-2 border rounded-xl bg-theme-primary border-border-color outline-none focus:ring-2 focus:ring-accent-color resize-none text-theme-main text-sm"
              aria-label="note personali"></textarea>
          </div>
        </div>
      </div>

      <div v-if="hasLibraries" class="flex gap-4 pt-6">
        <button
          @click="handleCancel"
          class="flex-1 py-3 border-2 border-border-color rounded-xl font-bold text-theme-main hover:bg-theme-secondary transition uppercase text-xs tracking-widest"
          aria-label="annulla inserimento">
          {{ isSetup ? "salta" : "annulla" }}
        </button>
        <button
          @click="submitBook"
          :disabled="isSubmitting"
          class="flex-[2] btn-modal-confirm py-3 justify-center text-xs tracking-widest uppercase"
          :class="isReadyToSave ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'"
          aria-label="salva libro">
          <span v-if="isSubmitting"
            ><i class="fa-solid fa-circle-notch fa-spin mr-2"></i
            >salvataggio...</span
          >
          <span v-else>salva</span>
        </button>
      </div>
    </template>

    <div
      v-if="showConflictModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        class="bg-theme-primary rounded-2xl shadow-2xl p-6 border border-border-color max-w-lg w-full custom-fade-in">
        <h3 class="font-display text-lg mb-4 text-theme-main uppercase">
          libri simili trovati
        </h3>
        <div class="space-y-3 max-h-80 overflow-y-auto pr-2">
          <button
            v-for="book in conflictBooks"
            :key="book.isbn"
            @click="selectBookFromModal(book)"
            class="w-full text-left p-3 border-2 border-border-color bg-theme-secondary rounded-xl hover:border-accent-color transition flex gap-3 items-center"
            :aria-label="'seleziona libro ' + book.title">
            <div
              class="w-10 h-14 bg-theme-primary border border-border-color flex items-center justify-center rounded shrink-0 overflow-hidden text-theme-main">
              <img
                v-if="book.cover"
                :src="book.cover"
                class="w-full h-full object-cover"
                alt="" />
              <i v-else class="fa-solid fa-book opacity-30"></i>
            </div>
            <div class="text-xs overflow-hidden flex-grow text-theme-main">
              <strong class="block truncate text-sm uppercase tracking-tighter">{{ book.title }}</strong>
              <span class="block opacity-70 truncate italic">{{ book.author }}</span>
            </div>
          </button>
        </div>
        <button
          @click="showConflictModal = false"
          class="btn-modal-cancel mt-6 w-full uppercase"
          aria-label="ignora suggerimenti e usa dati manuali">
          inserisci i dati manualmente
        </button>
      </div>
    </div>

    <div
      v-if="showIsbnRequestModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        class="bg-theme-primary rounded-2xl shadow-2xl border border-border-color max-w-md w-full p-6 text-center space-y-4 custom-fade-in">
        <h3 class="font-display text-lg text-theme-main uppercase">isbn mancante</h3>
        <p class="text-sm text-theme-main opacity-70">
          per salvare questo libro nel database mondiale è necessario l'isbn.
        </p>
        <div class="flex gap-2 items-center justify-center">
          <input
            v-model="form.isbn"
            type="text"
            placeholder="978..."
            class="filter-input text-center"
            aria-label="inserisci isbn" />
        </div>
        <div class="flex flex-col gap-2 mt-4">
          <button
            @click="handleIsbnModalSubmit"
            :disabled="!isIsbnValid"
            class="btn-modal-confirm w-full py-3 justify-center uppercase font-bold text-xs"
            aria-label="cerca e valida isbn">
            cerca e valida
          </button>
          <button
            @click="forceSubmitWithoutIsbn"
            class="w-full py-2 text-theme-main text-xs underline uppercase font-bold opacity-60"
            aria-label="procedi senza isbn">
            non lo trovo / procedi senza isbn
          </button>
          <button
            @click="showIsbnRequestModal = false"
            class="w-full py-2 text-red-500 text-xs uppercase font-bold"
            aria-label="annulla operazione">
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
            class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"
            aria-label="scatta foto">
            <i class="fa-solid fa-camera text-2xl text-paynes-gray"></i>
          </button>
          <button
            @click="stopPhotoCapture"
            class="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl"
            aria-label="chiudi fotocamera">
            <i class="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>
      </div>
      <div
        v-if="isCropping"
        class="w-full h-full flex flex-col items-center custom-fade-in">
        <h2 class="text-white mb-4 font-bold uppercase">regola l'immagine</h2>
        <div
          class="relative max-w-full max-h-[65vh] border-4 border-white rounded-xl overflow-hidden bg-white shadow-2xl flex items-center justify-center">
          <img
            :src="rawImageData"
            class="max-h-[65vh] object-contain transition-transform duration-300 origin-center"
            :style="`transform: scale(${cropZoom});`" 
            alt="immagine da ritagliare" />
          <div
            class="absolute inset-0 border-[40px] border-black/50 pointer-events-none flex items-center justify-center">
            <div
              class="w-full h-full border-2 border-white border-dashed opacity-50"></div>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-6">
          <button
            @click="cropZoom = Math.max(0.1, cropZoom - 0.1)"
            class="w-10 h-10 bg-white/20 text-white rounded-full hover:bg-white/40 transition font-bold"
            aria-label="riduci zoom">
            -
          </button>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            v-model.number="cropZoom"
            class="w-32 accent-accent-color"
            aria-label="livello zoom" />
          <button
            @click="cropZoom = Math.min(5, cropZoom + 0.1)"
            class="w-10 h-10 bg-white/20 text-white rounded-full hover:bg-white/40 transition font-bold"
            aria-label="aumenta zoom">
            +
          </button>
        </div>
        <div class="mt-8 flex gap-6">
          <button
            @click="applyCrop"
            class="bg-accent-color text-white px-10 py-3 rounded-xl font-bold shadow-xl uppercase text-xs"
            aria-label="conferma ritaglio">
            conferma
          </button>
          <button
            @click="isCropping = false"
            class="bg-red-500 text-white px-10 py-3 rounded-xl font-bold shadow-xl uppercase text-xs"
            aria-label="annulla ritaglio">
            annulla
          </button>
        </div>
      </div>
      <canvas ref="photoCanvas" class="hidden"></canvas>
    </div>

    <AppModal
      :isOpen="isModalOpen"
      :title="modalTitle"
      @close="handleModalClose">
      <div class="modal-request-content">
        <p class="text-theme-main font-bold uppercase tracking-tighter mb-6">{{ modalContent }}</p>
        <button
          @click="handleModalClose"
          class="btn-modal-confirm px-12 py-2 uppercase font-bold text-xs tracking-widest"
          aria-label="chiudi messaggio">
          chiudi
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
import { TAGS, CONDITIONS } from "@/utils/constants.js";

const route = useRoute();
const router = useRouter();

const returnTo = computed(() => route.query.returnTo || "/");
const isSetup = computed(() => route.query.isSetup === "true");

const userLibraries = ref([]);
const isFetchingLibraries = ref(false);
const inputMode = ref(null);
const isSubmitting = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const modalTitle = ref("");
const modalContent = ref("");
const isSuccess = ref(false);
// nuova variabile per gestire la view post-salvataggio
const isPostSaveScreen = ref(false); 
const showIsbnRequestModal = ref(false);
const showConflictModal = ref(false);
const conflictBooks = ref([]);
const searchCache = new Map();

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

const isScanning = ref(false);
const scannerContainer = ref(null);
const isLoadingCamera = ref(false);
const isCapturingPhoto = ref(false);
const photoVideo = ref(null);
const photoCanvas = ref(null);
const photoStream = ref(null);

const conditions = CONDITIONS;
const statuses = [
  { label: "disponibile", value: "available" },
  { label: "in prestito", value: "on_loan" },
];
const availableTags = TAGS;

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

function handleCancel() {
  router.push(returnTo.value);
}
function handleModalClose() {
  isModalOpen.value = false;
  // se era successo ora non serve redirect qui perché gestito dalla schermata post-save
}

// resetta il form per inserire un nuovo libro
function resetFormForNewBook() {
  isPostSaveScreen.value = false;
  inputMode.value = null; // torna alla selezione modalità
  form.value = {
    targetLibraryId: form.value.targetLibraryId, // mantieni libreria
    isbn: "",
    title: "",
    author: "",
    publisher: "",
    language: "",
    publicationYear: null,
    coverFile: null,
  };
  copyForm.value = {
    status: "available",
    condition: null,
    ownerNotes: "",
    tags: [],
  };
  previewUrl.value = null;
  bookDetailsFound.value = false;
  lockedFields.value = [];
}

// naviga alla libreria corrente
function goToLibrary() {
  if (form.value.targetLibraryId) {
    router.push(`/libraries/${form.value.targetLibraryId}`);
  } else {
    router.push(returnTo.value);
  }
}

async function handleStartScan() {
  isScanning.value = true;
  isLoadingCamera.value = true;
  await nextTick();
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
  lockedFields.value = ["title", "author"];
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
    // invece di mostrare modale, attivo schermata successo inline
    isPostSaveScreen.value = true;
  } catch (e) {
    showModal("attenzione", "errore salvataggio", false);
  } finally {
    isSubmitting.value = false;
  }
}

function handleCoverUpload(e) {
  const f = e.target.files[0];
  if (f) {
    form.value.coverFile = f;
    previewUrl.value = URL.createObjectURL(f);
    rawImageData.value = null;
    isCropping = false;
  }
}
function handleDrop(e) {
  isDragging.value = false;
  const f = e.dataTransfer.files[0];
  if (f) {
    form.value.coverFile = f;
    previewUrl.value = URL.createObjectURL(f);
    rawImageData.value = null;
    isCropping = false;
  }
}
function applyCrop() {
  const canvas = photoCanvas.value;
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = rawImageData.value;
  img.onload = () => {
    const renderWidth = img.width * cropZoom.value;
    const renderHeight = img.height * cropZoom.value;
    canvas.width = 400;
    canvas.height = 600;
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
function selectBookFromModal(book) {
  applySuggestion(book);
  showConflictModal.value = false;
}
function handleIsbnModalSubmit() {
  showIsbnRequestModal.value = false;
  fetchBookByIsbn();
}
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
const debouncedManualSearch = debounce(async () => {
  if (
    inputMode.value !== "manual" ||
    !form.value.title ||
    form.value.title.length < 4 ||
    isSearching.value
  )
    return;
  const cacheKey = `${form.value.title}|${form.value.author}`;
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
watch([() => form.value.title, () => form.value.author], () => {
  if (inputMode.value === "manual" && !lockedFields.value.includes("title"))
    debouncedManualSearch();
});
</script>

<style scoped>
#scanner-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

#scanner-container :deep(video),
#scanner-container :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.scanning-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--zomp);
  box-shadow: 0 0 12px var(--zomp);
  animation: scan 2s linear infinite;
  z-index: 10;
}

@keyframes scan {
  0% { top: 5%; }
  100% { top: 95%; }
}

.tag-list {
  max-height: 200px;
  overflow-y: auto;
}

.tag-list::-webkit-scrollbar { width: 8px; }
.tag-list::-webkit-scrollbar-thumb {
  background-color: var(--zomp);
  border-radius: 10px;
}
.tag-list::-webkit-scrollbar-track { background-color: rgba(0, 0, 0, 0.1); }

.modal-request-content {
  padding: 1.5rem;
  text-align: center;
}
</style>