<template>
  <div class="max-w-4xl mx-auto p-8 shadow-xl rounded-2xl border-2 transition-colors duration-300 bg-theme-primary text-theme-main border-gray-200 dark:border-gray-700 relative space-y-6">

    <h1 class="text-3xl font-display text-center text-theme-main lowercase">
      aggiungi un libro
    </h1>
    
    <div class="space-y-3 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)]">
        <label class="block text-sm font-bold text-theme-main lowercase opacity-70">libreria di destinazione *</label>
        
        <p v-if="isFetchingLibraries" class="text-sm animate-pulse lowercase">caricamento librerie...</p>

        <div v-else-if="!hasLibraries" class="text-center">
            <p class="text-sm text-red-500 mb-2 lowercase">non hai ancora creato nessuna libreria</p>
            <router-link to="/create-library" class="text-[var(--zomp)] font-bold underline text-sm">crea la tua prima libreria</router-link>
        </div>

        <div v-else-if="userLibraries.length === 1" class="flex items-center text-theme-main font-bold">
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

    <div class="grid grid-cols-2 gap-4" v-if="form.targetLibraryId && hasLibraries">
        <button
            @click="switchMode('manual')"
            :class="inputMode === 'manual' ? 'bg-[var(--zomp)] text-white border-transparent' : 'bg-white border-gray-200 text-theme-main'"
            class="p-4 rounded-xl shadow-sm transition duration-150 font-bold border-2 lowercase">
            <i class="fa-solid fa-pen-to-square mb-1"></i><br /> manuale
        </button>
        <button
            @click="switchMode('isbn')"
            :class="inputMode === 'isbn' ? 'bg-[var(--zomp)] text-white border-transparent' : 'bg-white border-gray-200 text-theme-main'"
            class="p-4 rounded-xl shadow-sm transition duration-150 font-bold border-2 lowercase">
            <i class="fa-solid fa-barcode mb-1"></i><br /> isbn
        </button>
    </div>
    
    <div v-if="inputMode === 'isbn' && hasLibraries" class="space-y-4 p-5 rounded-xl border border-gray-200 bg-[var(--bg-secondary)] animate-fade-in">
         <div v-if="!isScanning" class="flex flex-col md:flex-row gap-6">
             <div class="flex-grow space-y-2">
                <div class="flex items-center gap-2">
                    <label class="block text-sm font-bold opacity-70 lowercase">codice isbn</label>
                    <div class="relative group">
                        <button class="w-4 h-4 rounded-full bg-[var(--paynes-gray)] text-white text-[10px] flex items-center justify-center font-bold cursor-help">?</button>
                        <div class="absolute left-6 top-0 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-xl hidden group-hover:block z-50">
                            <p class="text-[11px] leading-snug lowercase">l'isbn è un codice di 13 cifre che identifica univocamente un libro nei cataloghi mondiali.</p>
                        </div>
                    </div>
                </div>
                 <div class="flex gap-2">
                    <input v-model="form.isbn" type="text" placeholder="es. 978..." class="w-full px-3 py-2 border rounded-lg bg-theme-primary border-gray-300 outline-none focus:ring-2 focus:ring-[var(--zomp)]" />
                    <button @click="fetchBookByIsbn" :disabled="!isIsbnValid" class="bg-[var(--paynes-gray)] text-white px-4 rounded-lg hover:opacity-90 disabled:opacity-30 transition"><i class="fa-solid fa-search"></i></button>
                </div>
             </div>
             <button @click="handleStartScan" class="md:w-48 bg-[var(--paynes-gray)] text-white py-2 px-4 rounded-lg shadow font-bold flex items-center justify-center gap-2 self-end lowercase"><i class="fa-solid fa-camera"></i> scanner</button>
         </div>
         <div v-else class="space-y-4">
             <div ref="scannerContainer" class="border-2 border-[var(--zomp)] rounded-xl overflow-hidden h-48 relative bg-black">
                <div v-if="isLoadingCamera" class="absolute inset-0 flex items-center justify-center text-white/70 z-10 lowercase">avvio fotocamera...</div>
                <div class="scanning-bar"></div> 
            </div>
            <button @click="handleStopScan" class="w-full py-2 text-red-500 font-bold text-sm lowercase">ferma scanner</button>
         </div>
         <p v-if="isbnError" class="text-xs text-red-600 text-center font-bold">{{ isbnError }}</p>
    </div>

    <div v-if="(inputMode === 'manual' || bookDetailsFound) && hasLibraries" class="space-y-8 animate-slide-up">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div @dragenter.prevent="isDragging = true" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
                :class="isDragging ? 'border-[var(--zomp)] bg-[var(--zomp)]/10' : 'border-gray-300 bg-white'"
                class="border-2 border-dashed rounded-xl p-4 transition-all text-center relative flex flex-col items-center justify-center min-h-[180px]">
                
                <div v-if="previewUrl" class="relative group">
                    <img :src="previewUrl" class="h-32 object-contain rounded shadow-md" />
                    <button @click="removeCover" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"><i class="fa-solid fa-times"></i></button>
                </div>
                <div v-else class="space-y-1 opacity-50">
                    <i class="fa-solid fa-cloud-arrow-up text-2xl"></i>
                    <p class="text-xs lowercase">carica o trascina copertina</p>
                </div>
                <input type="file" accept="image/*" @change="handleCoverUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            
            <button @click="startPhotoCapture" class="h-[180px] rounded-xl border-2 border-dashed border-[var(--paynes-gray)] text-[var(--paynes-gray)] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition lowercase">
                <i class="fa-solid fa-camera text-2xl"></i>
                <span class="font-bold text-xs">scatta foto alla copia</span>
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--bg-secondary)] p-6 rounded-xl">
             <div class="md:col-span-2">
                 <label class="block text-xs font-bold opacity-70 mb-1 lowercase">titolo *</label>
                 <input v-model="form.title" type="text" :readonly="lockedFields.includes('title')" @input="debouncedManualSearch" class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300" />
             </div>
             <div>
                <label class="block text-xs font-bold opacity-70 mb-1 lowercase">autore *</label>
                <input v-model="form.author" type="text" :readonly="lockedFields.includes('author')" @input="debouncedManualSearch" class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300" />
            </div>
            <div>
                 <label class="block text-xs font-bold opacity-70 mb-1 lowercase">editore</label>
                 <input v-model="form.publisher" type="text" :readonly="lockedFields.includes('publisher')" class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300" />
            </div>
            <div class="grid grid-cols-2 gap-4 md:col-span-2">
                <div>
                    <label class="block text-xs font-bold opacity-70 mb-1 lowercase">anno</label>
                    <input v-model.number="form.publicationYear" type="number" class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300" />
                </div>
                <div>
                    <label class="block text-xs font-bold opacity-70 mb-1 lowercase">lingua</label>
                    <input v-model="form.language" type="text" class="w-full px-3 py-2 border rounded-lg bg-theme-primary outline-none focus:ring-2 focus:ring-[var(--zomp)] border-gray-300" />
                </div>
            </div>
        </div>
        
        <div class="space-y-6">
             <h2 class="text-xl font-display text-[var(--paynes-gray)] lowercase">dati della tua copia</h2>
             
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label class="block text-xs font-bold opacity-70 mb-2 lowercase">condizione *</label>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="cond in conditions" :key="cond" @click="copyForm.condition = cond"
                            :class="copyForm.condition === cond ? 'bg-[var(--zomp)] text-white border-transparent' : 'bg-white border-gray-200'"
                            class="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all lowercase">
                            {{ cond }}
                        </button>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold opacity-70 mb-2 lowercase">stato *</label>
                    <div class="flex flex-wrap gap-2">
                        <button v-for="stat in statuses" :key="stat.value" @click="copyForm.status = stat.value"
                            :class="copyForm.status === stat.value ? 'bg-[var(--paynes-gray)] text-white border-transparent' : 'bg-white border-gray-200'"
                            class="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all lowercase">
                            {{ stat.label }}
                        </button>
                    </div>
                </div>
             </div>

             <div>
                 <label class="block text-xs font-bold opacity-70 mb-2 lowercase">tag e generi</label>
                 <div class="flex flex-wrap gap-2">
                     <button v-for="tag in availableTags" :key="tag" @click="toggleTag(tag)" 
                        :class="copyForm.tags.includes(tag) ? 'bg-[var(--zomp)] text-white border-transparent' : 'bg-white border-gray-200'" 
                        class="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all lowercase">
                        {{ tag }}
                     </button>
                     <button v-if="!showTagInput" @click="showTagInput = true" class="w-8 h-8 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-[var(--zomp)] hover:bg-white transition"><i class="fa-solid fa-plus"></i></button>
                     <div v-else class="flex gap-1">
                        <input ref="tagInputRef" v-model="newCustomTag" @keyup.enter="addCustomTag" @blur="cancelTagInput" class="px-3 py-1 text-xs border-2 rounded-lg w-24 bg-white outline-none focus:border-[var(--zomp)]" />
                        <button @click="addCustomTag" class="bg-[var(--zomp)] text-white px-2 rounded-lg text-xs font-bold">ok</button>
                     </div>
                 </div>
             </div>

             <div>
                <label class="block text-xs font-bold opacity-70 mb-1 lowercase">note personali</label>
                <textarea v-model="copyForm.ownerNotes" rows="3" class="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--zomp)] resize-none border-gray-300"></textarea>
            </div>
        </div>
    </div>

    <div v-if="hasLibraries" class="flex gap-4 pt-6">
        <button @click="router.push('/dashboard')" class="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-[var(--paynes-gray)] hover:bg-gray-50 transition lowercase">
            annulla
        </button>
        <button @click="submitBook" :disabled="!isReadyToSave || isSubmitting" 
            class="flex-[2] py-3 rounded-xl font-bold text-white shadow-lg transition duration-150 lowercase disabled:opacity-30"
            :class="isReadyToSave ? 'bg-[var(--zomp)]' : 'bg-gray-400'">
            <span v-if="isSubmitting"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i>salvataggio...</span>
            <span v-else>salva libro e copia</span>
        </button>
    </div>

    <div v-if="showConflictModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
         <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-slide-up">
             <h3 class="font-display text-lg mb-4 lowercase">libri simili trovati</h3>
             <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                 <button v-for="book in conflictBooks" :key="book.isbn" @click="selectBookFromModal(book)" class="w-full text-left p-3 border-2 border-gray-100 rounded-xl hover:border-[var(--zomp)] hover:bg-[var(--zomp)]/5 transition text-sm">
                    <strong>{{ book.title }}</strong><br><span class="opacity-60">{{ book.author }}</span>
                 </button>
             </div>
             <button @click="showConflictModal = false" class="mt-6 w-full py-2 text-[var(--zomp)] font-bold text-sm lowercase">chiudi</button>
         </div>
    </div>

    <div v-if="isCapturingPhoto" class="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
        <video ref="photoVideo" autoplay playsinline class="max-w-full max-h-[70vh] rounded-2xl shadow-2xl"></video>
        <div class="mt-8 flex gap-6">
            <button @click="takePhoto" class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl"><i class="fa-solid fa-camera text-2xl"></i></button>
            <button @click="stopPhotoCapture" class="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center"><i class="fa-solid fa-xmark text-2xl"></i></button>
        </div>
        <canvas ref="photoCanvas" class="hidden"></canvas>
    </div>

    <AppModal :isOpen="isModalOpen" :title="modalTitle" :content="modalContent" @close="handleModalClose">
      <div v-if="isSuccess" class="flex justify-end pt-4">
            <button @click="handleModalClose" class="bg-[var(--zomp)] text-white px-8 py-2 rounded-xl font-bold lowercase">continua</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import { apiClient } from "@/services/apiClient"
import { startScanner, stopScanner } from "@/services/scannerService"
import AppModal from "@/components/AppModal.vue"

const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const route = useRoute()
const router = useRouter()

// stati base
const userLibraries = ref([])
const isFetchingLibraries = ref(false)
const inputMode = ref(null)
const isSubmitting = ref(false)

// stati modale
const isModalOpen = ref(false)
const modalTitle = ref("")
const modalContent = ref("")
const isSuccess = ref(false)

// form
const form = ref({
  targetLibraryId: "", isbn: "", title: "", author: "",
  publisher: "", language: "", publicationYear: null, coverFile: null
})

const copyForm = ref({ status: "available", condition: null, ownerNotes: "", tags: [] })

// ui/image
const isDragging = ref(false)
const previewUrl = ref(null)
const isbnError = ref(null)
const bookDetailsFound = ref(false)
const lockedFields = ref([])
const showTagInput = ref(false)
const newCustomTag = ref("")
const tagInputRef = ref(null)

// scanner/photo
const isScanning = ref(false)
const scannerContainer = ref(null)
const isLoadingCamera = ref(false)
const isCapturingPhoto = ref(false)
const photoVideo = ref(null)
const photoCanvas = ref(null)
const photoStream = ref(null)

// smart search
const showConflictModal = ref(false)
const conflictBooks = ref([])
const searchCache = new Map()

// dati statici
const conditions = ["nuovo", "ottimo", "buono", "usurato"] //TODO condizioni tutte uguali ovunque
const statuses = [
  { label: "disponibile", value: "available" },
  { label: "in prestito", value: "on_loan" },
]
const availableTags = ["fiction", "fantasy", "fantascienza", "thriller", "storico", "saggio", "biografia"]

onMounted(() => {
  const qLib = route.query.libraryId
  if (qLib) form.value.targetLibraryId = qLib
  fetchUserLibraries()
})

onUnmounted(() => {
  if (isScanning.value) stopScanner()
  stopPhotoCapture()
})

watch(showTagInput, (v) => { if (v) nextTick(() => tagInputRef.value?.focus()) })

const hasLibraries = computed(() => userLibraries.value.length > 0)
const isIsbnValid = computed(() => form.value.isbn?.length === 10 || form.value.isbn?.length === 13)
const isReadyToSave = computed(() => form.value.title && form.value.author && copyForm.value.condition)

// debounced search automatica (autofill)
const debouncedManualSearch = debounce(async () => {
  if (inputMode.value !== "manual" || !form.value.title || form.value.title.length < 3) return
  
  const cacheKey = `${form.value.title.toLowerCase()}|${form.value.author?.toLowerCase()}`
  if (searchCache.has(cacheKey)) {
    handleSearchResults(searchCache.get(cacheKey))
    return
  }

  try {
    const res = await apiClient.get("/books/external/search-isbn", {
      params: { title: form.value.title, author: form.value.author }
    })
    searchCache.set(cacheKey, res)
    handleSearchResults(res)
  } catch (e) { console.error(e) }
}, 800)

function handleSearchResults(books) {
  if (!books?.length) return
  if (books.length === 1) applySuggestion(books[0])
  else { conflictBooks.value = books; showConflictModal.value = true }
}

function applySuggestion(book) {
  form.value.title = book.title || form.value.title
  form.value.author = book.author || form.value.author
  form.value.publisher = book.publisher || form.value.publisher
  form.value.language = book.language || form.value.language
  form.value.publicationYear = book.publication_year || form.value.publicationYear
  form.value.isbn = book.isbn || form.value.isbn
  if (book.cover && !form.value.coverFile) previewUrl.value = book.cover.replace("http:", "https:")
}

function selectBookFromModal(book) {
  applySuggestion(book)
  showConflictModal.value = false
}

// api calls
async function fetchUserLibraries() {
  isFetchingLibraries.value = true
  try {
    const res = await apiClient.get("/users/me/libraries")
    userLibraries.value = res.libraries || []
    if (userLibraries.value.length === 1) form.value.targetLibraryId = userLibraries.value[0].id
  } finally { isFetchingLibraries.value = false }
}

async function fetchBookByIsbn() {
  if (!isIsbnValid.value) return
  isbnError.value = null
  try {
    const res = await apiClient.get("/books/external/lookup-metadata", { params: { isbn: form.value.isbn } })
    applySuggestion({ ...res, isbn: form.value.isbn })
    bookDetailsFound.value = true
    inputMode.value = "manual"
    lockedFields.value = ["title", "author"]
  } catch (e) { isbnError.value = "libro non trovato" }
}

// img/file/camera
function handleCoverUpload(e) { const f = e.target.files[0]; if (f) processFile(f) }
function handleDrop(e) { isDragging.value = false; const f = e.dataTransfer.files[0]; if (f) processFile(f) }
function processFile(f) { 
  if (!f.type.startsWith("image/")) return
  form.value.coverFile = f
  previewUrl.value = URL.createObjectURL(f)
}
function removeCover() { form.value.coverFile = null; previewUrl.value = null }

async function startPhotoCapture() {
  isCapturingPhoto.value = true
  try {
    photoStream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    photoVideo.value.srcObject = photoStream.value
  } catch (e) { isCapturingPhoto.value = false }
}
function stopPhotoCapture() {
  if (photoStream.value) photoStream.value.getTracks().forEach(t => t.stop())
  isCapturingPhoto.value = false
}
function takePhoto() {
  const ctx = photoCanvas.value.getContext('2d')
  photoCanvas.value.width = photoVideo.value.videoWidth
  photoCanvas.value.height = photoVideo.value.videoHeight
  ctx.drawImage(photoVideo.value, 0, 0)
  photoCanvas.value.toBlob(b => {
    processFile(new File([b], "capture.jpg", { type: "image/jpeg" }))
    stopPhotoCapture()
  }, 'image/jpeg', 0.8)
}

// scanner
async function handleStartScan() {
  isScanning.value = true; isLoadingCamera.value = true
  try { await startScanner(scannerContainer.value, (c) => { form.value.isbn = c; handleStopScan(); fetchBookByIsbn() }) }
  catch (e) { isScanning.value = false } finally { isLoadingCamera.value = false }
}
function handleStopScan() { stopScanner(); isScanning.value = false }

// tags
function addCustomTag() {
  const v = newCustomTag.value.trim().toLowerCase()
  if (v && !copyForm.value.tags.includes(v)) copyForm.value.tags.push(v)
  newCustomTag.value = ""; showTagInput.value = false
}
function cancelTagInput() { setTimeout(() => { if (!newCustomTag.value) showTagInput.value = false }, 200) }
function toggleTag(t) {
  const i = copyForm.value.tags.indexOf(t)
  if (i === -1) copyForm.value.tags.push(t)
  else copyForm.value.tags.splice(i, 1)
}

function switchMode(m) { inputMode.value = m; if (m === 'manual') lockedFields.value = [] }

function showModal(t, c, s = false) { modalTitle.value = t; modalContent.value = c; isSuccess.value = s; isModalOpen.value = true }
function handleModalClose() { isModalOpen.value = false; if (isSuccess.value) router.push("/dashboard") }

async function submitBook() {
  if (!isReadyToSave.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const bookDTO = { ...form.value, ...copyForm.value, libraryId: form.value.targetLibraryId, coverUrl: form.value.coverFile ? null : previewUrl.value }
    const fd = new FormData()
    fd.append("book", new Blob([JSON.stringify(bookDTO)], { type: "application/json" }))
    if (form.value.coverFile) fd.append("cover", form.value.coverFile)
    await apiClient.post("/books/save", fd)
    showModal("ottimo", "libro aggiunto correttamente", true)
  } catch (e) { showModal("attenzione", "errore salvataggio", false) } finally { isSubmitting.value = false }
}
</script>

<style scoped>
.scanning-bar {
  position: absolute; top: 0; left: 0; width: 100%; height: 3px;
  background-color: var(--zomp); box-shadow: 0 0 12px var(--zomp);
  animation: scan 2s linear infinite; z-index: 5;
}
@keyframes scan { 0% { top: 5% } 100% { top: 95% } }
.font-display { font-family: 'Mochiy Pop P One', cursive; }
</style>