<template>
  <div class="max-w-2xl mx-auto p-8 shadow-xl rounded-2xl border-2 transition-colors duration-300 bg-theme-primary text-theme-main border-gray-200 dark:border-gray-700 relative">

    <h1 class="text-3xl font-display text-center text-theme-main">
      Aggiungi un Libro
    </h1>
    
    <p v-if="generalError" class="text-sm text-red-700 dark:text-red-400 font-medium mt-2 text-center">errore: {{ generalError }}</p>

    <div class="space-y-3 p-4 border rounded-lg border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)]">
        <label class="block text-sm font-medium text-theme-main">Libreria di destinazione *</label>
        
        <p v-if="isFetchingLibraries" class="text-sm text-theme-main opacity-70 animate-pulse">caricamento librerie...</p>

        <div v-else-if="!hasLibraries" class="text-center">
            <p class="text-sm text-red-700 dark:text-red-400 mb-2">non hai ancora creato nessuna libreria</p>
            <router-link to="/create-library" class="text-[var(--zomp)] font-bold underline text-sm">crea la tua prima libreria</router-link>
        </div>

        <div v-else-if="userLibraries.length === 1" class="flex items-center text-theme-main font-bold">
            <i class="fa-solid fa-shop mr-2 text-[var(--zomp)]"></i>
            <span>{{ userLibraries[0].name }}</span>
            <input type="hidden" :value="userLibraries[0].id">
        </div>

        <select 
            v-else
            v-model="form.targetLibraryId" 
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] focus:border-[var(--zomp)] bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600">
            <option disabled value="">seleziona una libreria</option>
            <option v-for="lib in userLibraries" :key="lib.id" :value="lib.id">
                {{ lib.name }}
            </option>
        </select>
    </div>

    <hr v-if="form.targetLibraryId && hasLibraries" class="border-gray-200 dark:border-gray-700" />

    <div class="grid grid-cols-2 gap-4" v-if="form.targetLibraryId && hasLibraries">
        <button
            @click="switchMode('manual')"
            :class="inputMode === 'manual' ? 'bg-[var(--zomp)] text-white border-transparent' : 'bg-[var(--bg-secondary)] text-theme-main border-gray-200 dark:border-gray-600 hover:opacity-80'"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2">
            <i class="fa-solid fa-pen-to-square mb-2 text-xl"></i><br />
            Dati Manuali
        </button>
        <button
            @click="switchMode('isbn')"
            :class="inputMode === 'isbn' ? 'bg-[var(--zomp)] text-white border-transparent' : 'bg-[var(--bg-secondary)] text-theme-main border-gray-200 dark:border-gray-600 hover:opacity-80'"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2">
            <i class="fa-solid fa-barcode mb-2 text-xl"></i><br />
            Codice ISBN
        </button>
    </div>
    
    <hr class="border-gray-200 dark:border-gray-700" v-if="inputMode !== null && hasLibraries" />

    <div v-if="inputMode === 'isbn' && hasLibraries" class="space-y-4 text-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)]">
        <h2 class="text-xl font-display text-theme-main">Ricerca ISBN</h2>

        <div v-if="!isScanning" class="flex flex-col md:flex-row gap-4">
            
            <div class="w-full md:w-1/2 flex flex-col items-start text-left">
                
                <div class="flex items-center gap-2 mb-1">
                    <label for="isbnCode" class="block text-sm font-medium text-theme-main">
                        Codice ISBN
                    </label>
                    
                    <div class="relative group z-50">
                        <button class="w-5 h-5 rounded-full bg-[var(--paynes-gray)] text-white text-xs flex items-center justify-center font-bold cursor-help shadow-sm">
                            ?
                        </button>
                        <div class="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-64 p-3 bg-theme-primary text-theme-main border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl hidden group-hover:block z-50">
                            <p class="text-xs text-theme-main mb-2 text-left leading-snug">
                                L'ISBN è un codice di 13 cifre che identifica univocamente un libro. Lo trovi sul retro della copertina vicino al codice a barre.
                            </p>
                            <div class="absolute top-1/2 -left-2 -mt-1 border-8 border-transparent border-r-gray-200 dark:border-r-gray-600"></div>
                        </div>
                    </div>
                    </div>

                <div class="flex gap-2 w-full">
                    <input v-model="form.isbn" id="isbnCode" type="text" placeholder="es. 978..."
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] focus:border-[var(--zomp)] bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600" />
                    <button @click="fetchBookByIsbn" :disabled="!isIsbnValid"
                        class="bg-[var(--paynes-gray)] text-white px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 shadow-sm transition">
                        <i class="fa-solid fa-search"></i>
                    </button>
                </div>
            </div>
            
            <div class="w-full md:w-1/2 flex flex-col justify-end">
                <button @click="handleStartScan"
                    class="w-full bg-[var(--paynes-gray)] text-white py-2 px-4 rounded-lg shadow hover:bg-[var(--zomp)] transition font-semibold flex items-center justify-center gap-2 border border-transparent">
                    <i class="fa-solid fa-camera"></i>
                    Avvia Scanner
                </button>
            </div>
        </div>

        <div v-else class="space-y-4 animate-fade-in">
            <div ref="scannerContainer" class="border-2 border-[var(--zomp)] rounded-lg overflow-hidden h-64 relative scanner-video-container bg-black">
                <div v-if="isLoadingCamera" class="absolute inset-0 flex items-center justify-center text-white/70 z-10">
                    <i class="fa-solid fa-circle-notch fa-spin mr-2"></i> avvio fotocamera...
                </div>
                <div v-else class="scanning-bar"></div> 
            </div>
            
            <button @click="handleStopScan"
                class="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 font-bold text-sm shadow">
                Ferma Scanner
            </button>

            <p class="text-xs text-theme-main">
                Inquadra il codice a barre ISBN sul retro del libro
            </p>
        </div>

        <p v-if="isbnError" class="text-sm text-red-700 font-medium mt-2">errore: {{ isbnError }}</p>
    </div>

    <div v-if="(inputMode === 'manual' || bookDetailsFound) && hasLibraries" class="space-y-6 relative">
        
        <div v-if="isManualSearching" class="absolute top-0 right-0 p-2 z-10">
            <i class="fa-solid fa-circle-notch fa-spin text-[var(--zomp)]"></i>
        </div>

        <div class="flex items-center justify-between">
            <h2 class="text-xl font-display text-theme-main">Dati Bibliografici</h2>
            <span v-if="isbnLocked" class="text-xs bg-[var(--zomp)] text-white px-2 py-1 rounded shadow-sm">
                <i class="fa-solid fa-lock mr-1"></i>Dati da ISBN
            </span>
            <span v-else-if="hasSuggestions"
                class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded shadow-sm border border-yellow-200">
                <i class="fa-solid fa-wand-magic-sparkles mr-1"></i>Suggeriti
            </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-theme-main mb-1">Titolo *</label>
                <input v-model="form.title" type="text" 
                    :readonly="lockedFields.includes('title')"
                    @input="debouncedManualSearch"
                    :class="lockedFields.includes('title') ? 'opacity-60 cursor-not-allowed' : ''"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600" />
            </div>

            <div>
                <label class="block text-sm font-medium text-theme-main mb-1">Autore *</label>
                <input v-model="form.author" type="text" 
                    :readonly="lockedFields.includes('author')"
                    @input="debouncedManualSearch"
                    :class="lockedFields.includes('author') ? 'opacity-60 cursor-not-allowed' : ''"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600" />
            </div>

            <div>
                <label class="block text-sm font-medium text-theme-main mb-1">Editore</label>
                <input v-model="form.publisher" type="text" 
                    :readonly="lockedFields.includes('publisher')"
                    @input="debouncedManualSearch"
                    :class="[
                        lockedFields.includes('publisher') ? 'opacity-60 cursor-not-allowed' : '',
                        isFieldSuggested('publisher') ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200' : ''
                    ]"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600 transition-colors duration-500" />
            </div>

            <div>
                <label class="block text-sm font-medium text-theme-main mb-1">Anno</label>
                <input v-model.number="form.publicationYear" type="number" placeholder="YYYY"
                    :readonly="lockedFields.includes('publicationYear')"
                    @input="debouncedManualSearch"
                    :class="[
                        lockedFields.includes('publicationYear') ? 'opacity-60 cursor-not-allowed' : '',
                        isFieldSuggested('publicationYear') ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200' : ''
                    ]"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600 transition-colors duration-500" />
            </div>

            <div>
                <label class="block text-sm font-medium text-theme-main mb-1">Lingua</label>
                <input v-model="form.language" type="text" list="languages" 
                    :readonly="lockedFields.includes('language')"
                    @input="debouncedManualSearch"
                    :class="[
                        lockedFields.includes('language') ? 'opacity-60 cursor-not-allowed' : '',
                        isFieldSuggested('language') ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200' : ''
                    ]"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600 transition-colors duration-500" />
                <datalist id="languages">
                    <option value="Italiano"></option>
                    <option value="Inglese"></option>
                    <option value="Francese"></option>
                    <option value="Spagnolo"></option>
                    <option value="Tedesco"></option>
                </datalist>
            </div>
            
             <div class="md:col-span-2" v-if="form.isbn">
                <label class="block text-sm font-medium text-theme-main mb-1">ISBN Associato</label>
                <input v-model="form.isbn" type="text"
                    :class="isFieldSuggested('isbn') ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200' : ''"
                    class="w-full px-3 py-2 border rounded-lg opacity-70 font-mono text-sm bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600" />
            </div>
        </div>

        <div class="space-y-2">
            <div class="flex justify-between items-end">
                <label class="block text-sm font-medium text-theme-main">Copertina</label>
                <a v-if="form.title" :href="googleSearchUrl" target="_blank" class="text-xs text-theme-main hover:text-[var(--zomp)] flex items-center gap-1 transition">
                    <i class="fa-brands fa-google"></i>
                    Cerca su Google
                </a>
            </div>
            
            <div 
                @dragenter.prevent="isDragging = true" 
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                :class="[
                    isDragging ? 'border-[var(--zomp)] bg-[var(--zomp)]/10' : 'border-gray-300 dark:border-gray-600 bg-theme-primary',
                    isFieldSuggested('cover') && !form.coverFile ? 'border-yellow-300 bg-yellow-50/50' : ''
                ]"
                class="border-2 border-dashed rounded-xl p-6 transition-all text-center relative flex flex-col items-center justify-center min-h-[160px]">
                
                <div v-if="previewUrl" class="relative group mb-2">
                    <img :src="previewUrl" class="h-32 object-contain rounded shadow-sm" />
                    <span v-if="isFieldSuggested('cover') && !form.coverFile" class="absolute top-0 left-0 bg-yellow-400 text-white text-[10px] px-1 font-bold rounded shadow-sm">AUTO</span>
                    <button @click="removeCover" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>

                <div v-else class="space-y-2 pointer-events-none">
                    <i class="fa-solid fa-cloud-arrow-up text-3xl text-theme-main opacity-50"></i>
                    <p class="text-sm text-theme-main">
                        Trascina qui l'immagine o 
                        <span class="text-[var(--zomp)] font-bold">clicca per sfogliare</span>
                    </p>
                </div>

                <input type="file" accept="image/*" @change="handleCoverUpload" 
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    :disabled="!!previewUrl" />
            </div>
            
            <p v-if="!previewUrl" class="text-[10px] text-theme-main opacity-60 text-right italic">
                * se non carichi un'immagine, verrà assegnata una copertina casuale.
            </p>
            <p v-if="uploadError" class="text-xs text-red-700 font-medium">{{ uploadError }}</p>
        </div>

    </div>
    
    <div v-if="(inputMode === 'manual' || bookDetailsFound) && hasLibraries" class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-display text-theme-main">Dati della tua Copia</h2>

        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="block text-sm font-medium text-theme-main mb-1">Condizione *</label>
                <div class="space-y-1">
                    <label v-for="cond in conditions" :key="cond" class="flex items-center text-sm text-theme-main cursor-pointer">
                        <input type="radio" v-model="copyForm.condition" :value="cond" required class="form-radio text-[var(--zomp)] focus:ring-[var(--zomp)]" />
                        <span class="ml-2 capitalize">{{ cond }}</span>
                    </label>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-theme-main mb-1">Stato *</label>
                <div class="space-y-1">
                    <label v-for="stat in statuses" :key="stat.value" class="flex items-center text-sm text-theme-main cursor-pointer">
                        <input type="radio" v-model="copyForm.status" :value="stat.value" required class="form-radio text-[var(--zomp)] focus:ring-[var(--zomp)]" />
                        <span class="ml-2 capitalize">{{ stat.label }}</span>
                    </label>
                </div>
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-theme-main mb-2">Tag/Generi</label>
            <div class="flex flex-wrap gap-2 items-center">
                <button v-for="tag in allDisplayTags" :key="tag" @click="toggleTag(tag)"
                    :class="copyForm.tags.includes(tag) ? 'bg-[var(--paynes-gray)] text-white border-[var(--paynes-gray)]' : 'bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100'"
                    class="px-3 py-1 text-sm rounded-full transition duration-150 capitalize border shadow-sm">
                    {{ tag }}
                </button>

                <div class="relative flex items-center">
                    <button v-if="!showTagInput" 
                        @click="showTagInput = true" 
                        :disabled="customTagsCount >= 2"
                        class="w-8 h-8 rounded-full bg-[var(--zomp)] text-white flex items-center justify-center shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <i class="fa-solid fa-plus text-xs"></i>
                    </button>

                    <div v-else class="flex items-center animate-fade-in">
                        <input 
                            ref="tagInputRef"
                            v-model="newCustomTag"
                            @keyup.enter="addCustomTag"
                            @blur="cancelTagInput"
                            placeholder="nuovo tag..."
                            maxlength="32"
                            class="px-3 py-1 text-sm border rounded-l-full focus:outline-none focus:border-[var(--zomp)] w-28 bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600"
                        />
                        <button @click="addCustomTag" class="bg-[var(--zomp)] text-white px-2 py-1 text-sm rounded-r-full hover:opacity-90 h-[30px] border-y border-r border-[var(--zomp)]">
                            OK
                        </button>
                    </div>
                </div>
            </div>
            <p v-if="tagError" class="text-xs text-red-500 mt-1">{{ tagError }}</p>
        </div>

        <div>
            <label class="block text-sm font-medium text-theme-main">Note Personali</label>
            <textarea v-model="copyForm.ownerNotes" rows="3" maxlength="250"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--zomp)] resize-none bg-theme-primary text-theme-main border-gray-300 dark:border-gray-600"></textarea>
        </div>
    </div>

    <div v-if="hasLibraries" class="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-4">
        
        <button v-if="isFirstLibrary" @click="skip"
            class="w-1/3 bg-[var(--thistle)] text-[var(--paynes-gray)] py-3 rounded-lg hover:opacity-80 transition duration-150 font-bold text-lg shadow-sm">
            Salta
        </button>

        <button 
        @click="submitBook" 
        :disabled="!isReadyToSave" 
        :class="[
            isReadyToSave ? 'bg-[var(--zomp)] text-white hover:bg-[var(--paynes-gray)] border-[var(--paynes-gray)]' : 'bg-[var(--ash-gray)] opacity-60 text-white cursor-not-allowed border-transparent',
            isFirstLibrary ? 'w-2/3' : 'w-full'
        ]"
        class="py-3 rounded-lg transition duration-150 font-bold text-lg shadow-md border-2">
        Salva Libro e Copia
        </button>
    </div>

    <div v-if="showConflictModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-theme-primary rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-[var(--bg-secondary)] rounded-t-xl">
                <h3 class="font-display text-lg text-theme-main">Trovati {{ conflictBooks.length }} risultati</h3>
                <button @click="showConflictModal = false" class="text-gray-500 hover:text-red-500 transition">
                    <i class="fa-solid fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="p-4 overflow-y-auto space-y-3 bg-[var(--bg-secondary)]">
                <p class="text-sm text-theme-main mb-2">Quale edizione stai cercando?</p>
                
                <button v-for="book in conflictBooks" :key="book.isbn" 
                    @click="selectBookFromModal(book)"
                    class="w-full text-left flex gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[var(--zomp)] hover:bg-[var(--zomp)]/5 transition group bg-theme-primary">
                    
                    <div class="w-16 h-24 bg-gray-200 flex-shrink-0 rounded overflow-hidden">
                        <img v-if="book.cover" :src="book.cover" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                            <i class="fa-solid fa-book"></i>
                        </div>
                    </div>

                    <div class="flex flex-col justify-center">
                        <span class="font-bold text-theme-main group-hover:text-[var(--zomp)]">{{ book.title }}</span>
                        <span class="text-sm text-gray-600 dark:text-gray-400">{{ book.author }}</span>
                        <div class="text-xs text-gray-500 mt-1 flex gap-2">
                            <span v-if="book.publication_year" class="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{ book.publication_year }}</span>
                            <span v-if="book.publisher">{{ book.publisher }}</span>
                        </div>
                        <span class="text-[10px] font-mono text-gray-400 mt-1">ISBN: {{ book.isbn }}</span>
                    </div>
                </button>
            </div>
            
            <div class="p-3 border-t border-gray-200 dark:border-gray-700 text-center bg-theme-primary rounded-b-xl">
                <button @click="showConflictModal = false" class="text-sm text-[var(--zomp)] hover:underline font-medium">
                    Nessuno di questi, continuo a mano
                </button>
            </div>
        </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/services/apiClient'
import { useAuthStore } from '@/stores/authStore'
import { startScanner, stopScanner } from '@/services/scannerService'

const debounce = (fn, delay) => {
    let timeoutId
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// general states
const userLibraries = ref([])
const isFetchingLibraries = ref(false)
const generalError = ref(null)
const inputMode = ref(null)

// form specific states
const form = ref({
  targetLibraryId: '', 
  isbn: '',
  title: '',
  author: '',
  publisher: '',
  language: '',
  publicationYear: null,
  coverFile: null
})

const copyForm = ref({
    status: 'available',
    condition: null,
    ownerNotes: '',
    tags: []
})

// ui states
const isDragging = ref(false)
const uploadError = ref(null)
const previewUrl = ref(null)
const isbnLocked = ref(false) 
const isbnError = ref(null)
const bookDetailsFound = ref(false)
const lockedFields = ref([])

// tag states
const newCustomTag = ref('')
const showTagInput = ref(false)
const tagError = ref(null)
const tagInputRef = ref(null)

// scanner states
const isScanning = ref(false)
const scannerContainer = ref(null)
const isLoadingCamera = ref(false)

// smart search states
const isManualSearching = ref(false)
const suggestedFields = ref([])
const showConflictModal = ref(false)
const conflictBooks = ref([])
const searchCache = new Map()

// static data
const conditions = ['ottima', 'buona', 'accettabile', 'usurata']
const statuses = [
    { label: 'disponibile', value: 'available' },
    { label: 'in prestito', value: 'on_loan' }
]
const availableTags = ['fiction', 'fantasy', 'thriller', 'storico', 'saggio', 'scientifico', 'biografia', 'poesia', 'arte', 'manualistica']

onMounted(() => {
    const queryLibId = route.query.libraryId
    if (queryLibId) {
        form.value.targetLibraryId = queryLibId
    }
    fetchUserLibraries()
})

onUnmounted(() => {
    if (isScanning.value) {
        stopScanner()
    }
})

// watcher to reset states on isbn change
watch(() => form.value.isbn, (newVal) => {
    if (!newVal || newVal.trim() === '') {
        isbnLocked.value = false
        lockedFields.value = []
    }
})

// watcher for tag input focus
watch(showTagInput, (val) => {
    if (val) {
        nextTick(() => tagInputRef.value?.focus())
    }
})

// watcher reset suggestion on mode change
watch(inputMode, (newVal) => {
    if (newVal === 'isbn') {
        suggestedFields.value = []
        isManualSearching.value = false
    }
})

const hasLibraries = computed(() => userLibraries.value.length > 0)
const isFirstLibrary = computed(() => userLibraries.value.length === 1)

const isIsbnValid = computed(() => {
    const s = form.value.isbn
    return s && (s.length === 10 || s.length === 13)
})

const isReadyToSave = computed(() => {
    const baseValid = form.value.title && form.value.author && form.value.targetLibraryId
    const copyValid = copyForm.value.condition
    return baseValid && copyValid
})

const googleSearchUrl = computed(() => {
    const query = `${form.value.title || ''} ${form.value.author || ''} cover libro`.trim()
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`
})

const allDisplayTags = computed(() => {
    const custom = copyForm.value.tags.filter(t => !availableTags.includes(t))
    return [...availableTags, ...custom]
})

const customTagsCount = computed(() => {
    return copyForm.value.tags.filter(t => !availableTags.includes(t)).length
})

const hasSuggestions = computed(() => suggestedFields.value.length > 0)

const debouncedManualSearch = debounce(async () => {
    if (inputMode.value !== 'manual' || !form.value.title || !form.value.author || form.value.title.length < 3) {
        return
    }

    const cacheKey = `${form.value.title.toLowerCase().trim()}|${form.value.author.toLowerCase().trim()}|${form.value.publicationYear || ''}`
    
    if (searchCache.has(cacheKey)) {
        handleSearchResults(searchCache.get(cacheKey))
        return
    }

    isManualSearching.value = true
    try {
        const res = await apiClient.get('/books/external/search-isbn', {
            params: {
                title: form.value.title,
                author: form.value.author,
                year: form.value.publicationYear || 0,
                publisher: form.value.publisher,
                language: form.value.language
            }
        })
        
        searchCache.set(cacheKey, res)
        handleSearchResults(res)

    } catch (e) {
        console.error("smart search error", e)
    } finally {
        isManualSearching.value = false
    }
}, 600)

function handleSearchResults(books) {
    if (!books || books.length === 0) return

    if (books.length === 1) {
        applySuggestion(books[0])
    } else {
        conflictBooks.value = books
        showConflictModal.value = true
    }
}

function applySuggestion(book) {
    if (book.publisher && (!form.value.publisher || suggestedFields.value.includes('publisher'))) {
        form.value.publisher = book.publisher
        markAsSuggested('publisher')
    }

    if (book.publication_year > 0 && (!form.value.publicationYear || suggestedFields.value.includes('publicationYear'))) {
        form.value.publicationYear = book.publication_year
        markAsSuggested('publicationYear')
    }

    if (book.language && (!form.value.language || suggestedFields.value.includes('language'))) {
        form.value.language = book.language
        markAsSuggested('language')
    }

    if (book.isbn && (!form.value.isbn || suggestedFields.value.includes('isbn'))) {
        form.value.isbn = book.isbn
        markAsSuggested('isbn')
    }

    if (book.cover && !form.value.coverFile && (!previewUrl.value || suggestedFields.value.includes('cover'))) {
        previewUrl.value = book.cover.replace('http:', 'https:')
        markAsSuggested('cover')
    }
}

function selectBookFromModal(book) {
    form.value.title = book.title
    form.value.author = book.author
    suggestedFields.value = [] 
    form.value.coverFile = null
    applySuggestion(book)
    showConflictModal.value = false
}

function markAsSuggested(field) {
    if (!suggestedFields.value.includes(field)) {
        suggestedFields.value.push(field)
    }
}

function isFieldSuggested(field) {
    return suggestedFields.value.includes(field)
}

function addCustomTag() {
    tagError.value = null
    const val = newCustomTag.value.trim().toLowerCase()
    
    if (!val) {
        showTagInput.value = false
        return
    }

    if (val.includes(' ')) {
        tagError.value = "usa una parola singola"
        return
    }
    if (val.length > 32) {
        tagError.value = "max 32 caratteri"
        return
    }
    if (copyForm.value.tags.includes(val)) {
        newCustomTag.value = ''
        showTagInput.value = false
        return
    }

    copyForm.value.tags.push(val)
    newCustomTag.value = ''
    showTagInput.value = false
}

function cancelTagInput() {
    setTimeout(() => {
        if (!newCustomTag.value) showTagInput.value = false
    }, 200)
}

function toggleTag(tag) {
    const idx = copyForm.value.tags.indexOf(tag)
    if (idx === -1) copyForm.value.tags.push(tag)
    else copyForm.value.tags.splice(idx, 1)
}

function switchMode(mode) {
    inputMode.value = mode
    if (mode === 'manual') {
        if (!bookDetailsFound.value) {
            isbnLocked.value = false
        }
        if(form.value.title && form.value.author) debouncedManualSearch()
    }
}

async function fetchUserLibraries() {
    isFetchingLibraries.value = true
    try {
        const res = await apiClient.get('/users/me/libraries')
        const libs = res.results || res.libraries || (Array.isArray(res) ? res : [])
        userLibraries.value = libs

        if (libs.length === 1) form.value.targetLibraryId = libs[0].id
        
        if (form.value.targetLibraryId && !libs.find(l => l.id === form.value.targetLibraryId)) {
            form.value.targetLibraryId = ''
        } else if (form.value.targetLibraryId && !inputMode.value) {
            inputMode.value = 'manual'
        }
    } catch (e) {
        generalError.value = "errore caricamento librerie"
    } finally {
        isFetchingLibraries.value = false
    }
}

function handleDrop(e) {
    isDragging.value = false
    uploadError.value = null
    const files = e.dataTransfer.files
    if (files.length > 0) {
        processFile(files[0])
    }
}

function handleCoverUpload(e) {
    uploadError.value = null
    const files = e.target.files
    if (files.length > 0) {
        processFile(files[0])
    }
}

function processFile(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
        uploadError.value = "il file deve essere un'immagine"
        return
    }
    if (file.size > 5 * 1024 * 1024) {
        uploadError.value = "immagine troppo grande (max 5mb)"
        return
    }
    
    form.value.coverFile = file
    previewUrl.value = URL.createObjectURL(file)
    const idx = suggestedFields.value.indexOf('cover')
    if(idx > -1) suggestedFields.value.splice(idx, 1)
}

function removeCover() {
    form.value.coverFile = null
    if (previewUrl.value && !isFieldSuggested('cover')) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
    const idx = suggestedFields.value.indexOf('cover')
    if(idx > -1) suggestedFields.value.splice(idx, 1)
}

async function handleStartScan() {
    isbnError.value = null
    isScanning.value = true
    isLoadingCamera.value = true

    try {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (!scannerContainer.value) {
            throw new Error('container scanner non trovato')
        }

        await startScanner(scannerContainer.value, onIsbnDetected)
    } catch (error) {
        console.error(error)
        isbnError.value = "impossibile accedere alla fotocamera. verifica i permessi."
        isScanning.value = false
    } finally {
        isLoadingCamera.value = false
    }
}

async function handleStopScan() {
    await stopScanner()
    isScanning.value = false
}

function onIsbnDetected(code) {
    form.value.isbn = code
    handleStopScan()
    fetchBookByIsbn()
}

async function fetchBookByIsbn() {
    if (!isIsbnValid.value) return
    isbnError.value = null
    lockedFields.value = []
    bookDetailsFound.value = false
    
    try {
        const res = await apiClient.get('/books/external/lookup-metadata', {
            params: { isbn: form.value.isbn }
        })

        form.value.title = res.title || ''
        form.value.author = res.author || ''
        form.value.publisher = res.publisher || ''
        form.value.publicationYear = res.publicationYear || ''
        
        if (res.language) form.value.language = res.language

        if (form.value.title) lockedFields.value.push('title')
        if (form.value.author) lockedFields.value.push('author')
        if (form.value.publisher) lockedFields.value.push('publisher')
        if (form.value.publicationYear) lockedFields.value.push('publicationYear')
        if (form.value.language) lockedFields.value.push('language')

        if (res.coverUrl) {
            previewUrl.value = res.coverUrl.replace('http:', 'https:')
            form.value.coverFile = null 
        }
        
        bookDetailsFound.value = true
        isbnLocked.value = true 
        inputMode.value = 'manual' 

    } catch (e) {
        console.error(e)
        isbnError.value = "impossibile recuperare i dati per questo isbn"
    }
}

function skip() {
    router.push('/dashboard')
}

async function submitBook() {
    if (!isReadyToSave.value) return
    
    console.log("salvataggio", { ...form.value, ...copyForm.value })
    alert("Funzionalità di salvataggio backend da implementare")
}
</script>

<style scoped>
.scanner-video-container :deep(video), 
.scanner-video-container :deep(canvas) {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.scanning-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #fac8cd; 
    box-shadow: 0 0 8px 2px rgba(250, 200, 205, 1);
    z-index: 5;
    animation: scan-animation 2s linear infinite;
}

@keyframes scan-animation {
    0% { top: 5%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 95%; opacity: 0; }
}
</style>