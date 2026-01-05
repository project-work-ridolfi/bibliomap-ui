<template>
  <main class="max-w-4xl mx-auto p-6 space-y-10 relative">
    <div class="flex justify-between items-center mb-8">
      <h1 class="font-display text-3xl text-theme-main uppercase">Modifica</h1>
      <div class="flex gap-4">
        <button
          @click="goBack"
          class="px-4 py-2 text-sm font-bold text-theme-main hover:text-zomp transition uppercase">
          Annulla
        </button>
        <button
          @click="saveChanges"
          :disabled="isSaving"
          class="btn-modal-confirm px-6 py-2 justify-center">
          <span v-if="isSaving" class="text-xs uppercase tracking-widest font-bold">Salvataggio...</span>
          <span v-else class="uppercase">Salva</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-zomp"></i>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-10 custom-fade-in">
      <section class="space-y-6 flex flex-col items-center">
        <div
          class="relative w-full aspect-[2/3] shadow-2xl rounded-2xl overflow-hidden bg-theme-primary border border-border-color group">
          <img
            :src="previewCover || currentImage"
            class="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            alt="anteprima" />

          <div
            class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-3">
            <label
              class="cursor-pointer bg-white text-paynes-gray px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-zomp hover:text-white transition uppercase">
              Carica file
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileUpload" />
            </label>

            <button
              @click="startCamera"
              class="bg-white text-paynes-gray px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-zomp hover:text-white transition uppercase">
              Scatta foto
            </button>

            <button
              @click="removeCurrentCover"
              class="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-red-600 transition uppercase">
              Rimuovi
            </button>
          </div>
        </div>

        <div class="w-full space-y-2">
          <label class="block text-[10px] font-bold text-theme-main uppercase tracking-widest ml-1 opacity-70">Stato prestito</label>
          <select v-model="form.status" class="filter-input">
            <option value="available">Disponibile</option>
            <option value="loaned">In prestito</option>
            <option value="maintenance">Non disponibile</option>
          </select>
        </div>
      </section>

      <section class="md:col-span-2 space-y-8">
        <div class="space-y-1">
          <h2 class="text-3xl font-display text-theme-main uppercase">
            {{ form.title }}
          </h2>
          <p class="text-sm text-theme-main opacity-60 italic">
            Gestisci i dettagli della tua copia fisica
          </p>
        </div>

        <div class="space-y-6 text-theme-main">
          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">Condizioni</label>
            <select v-model="form.condition" class="filter-input">
              <option v-for="opt in conditionOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">Tags</label>
            <div class="flex flex-wrap gap-2 p-3 border border-border-color rounded-xl bg-theme-secondary min-h-[50px]">
              <span
                v-for="(tag, idx) in form.tags"
                :key="idx"
                class="bg-zomp text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 uppercase">
                {{ tag }}
                <button @click="removeTag(idx)" class="hover:text-red-500">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </span>
              <input
                v-model="newTag"
                @keydown.enter.prevent="addTag"
                placeholder="Aggiungi tag..."
                class="flex-grow bg-transparent outline-none text-theme-main text-sm p-1" />
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="tag in commonTags"
                :key="tag"
                @click="addSuggestedTag(tag)"
                class="btn-tag text-[9px] font-bold uppercase border border-border-color px-2 py-1 rounded transition">
                + {{ tag }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold uppercase tracking-widest mb-2 opacity-70">Note personali</label>
            <textarea
              v-model="form.ownerNotes"
              rows="5"
              class="w-full p-4 rounded-xl border border-border-color bg-theme-primary text-theme-main focus:ring-2 focus:ring-zomp outline-none text-sm transition-colors resize-none"
              placeholder="Scrivi qui dettagli sulla tua copia..."></textarea>
          </div>
        </div>
      </section>
    </div>

    <div v-if="isCameraOpen" class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <video ref="video" autoplay playsinline class="max-w-full max-h-[70vh] rounded-2xl shadow-2xl"></video>
      <div class="mt-8 flex gap-6">
        <button @click="captureImage" class="w-16 h-16 bg-white rounded-full border-4 border-zomp flex items-center justify-center shadow-xl">
          <i class="fa-solid fa-camera text-2xl text-zomp"></i>
        </button>
        <button @click="stopCamera" class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-xl">
          <i class="fa-solid fa-xmark text-2xl text-white"></i>
        </button>
      </div>
      <canvas ref="canvas" class="hidden"></canvas>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { apiClient } from "@/services/apiClient"
import { TAGS, CONDITIONS } from "@/utils/constants.js"

const route = useRoute()
const router = useRouter()

const form = reactive({
  id: "",
  title: "",
  status: "available",
  condition: "", // inizializzato vuoto per attendere be
  ownerNotes: "",
  tags: [],
  coverUrl: "",
  customCover: "",
})

const conditionOptions = CONDITIONS
const commonTags = TAGS

const previewCover = ref(null)
const selectedFile = ref(null)
const useDefault = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)
const newTag = ref("")

const isCameraOpen = ref(false)
const video = ref(null)
const canvas = ref(null)
const stream = ref(null)

const currentImage = computed(() => {
  if (useDefault.value) return "/images/cover_placeholder.png"
  if (form.customCover) {
    return form.customCover.startsWith("data:") ? form.customCover : `data:image/jpeg;base64,${form.customCover}`
  }
  return form.coverUrl || "/images/cover_placeholder.png"
})

function goBack() {
  router.back()
}

async function loadData() {
  isLoading.value = true
  try {
    const data = await apiClient.get(`/books/${route.params.id}`)
    form.id = data.id
    form.title = data.title
    form.status = data.status || "available"
    form.ownerNotes = data.ownerNotes || ""
    form.tags = data.tags || []
    form.coverUrl = data.coverUrl
    form.customCover = data.customCover
    
    // mapping condizione dal be: se non trova match usa 'good'
    const foundCondition = conditionOptions.find(c => c.value === data.condition)
    form.condition = foundCondition ? foundCondition.value : "good"
    
  } catch (e) {
    console.error("errore caricamento dati")
  } finally {
    isLoading.value = false
  }
}

function addTag() {
  const val = newTag.value.trim().toLowerCase()
  if (val && !form.tags.includes(val)) form.tags.push(val)
  newTag.value = ""
}

function addSuggestedTag(tag) {
  if (!form.tags.includes(tag)) form.tags.push(tag)
}

function removeTag(idx) {
  form.tags.splice(idx, 1)
}

function removeCurrentCover() {
  previewCover.value = null
  selectedFile.value = null
  useDefault.value = true
  form.customCover = ""
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  selectedFile.value = file
  useDefault.value = false
  const reader = new FileReader()
  reader.onload = (e) => { previewCover.value = e.target.result }
  reader.readAsDataURL(file)
}

async function startCamera() {
  isCameraOpen.value = true
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    video.value.srcObject = stream.value
  } catch (e) {
    isCameraOpen.value = false
  }
}

function stopCamera() {
  if (stream.value) stream.value.getTracks().forEach(t => t.stop())
  isCameraOpen.value = false
}

function captureImage() {
  const context = canvas.value.getContext("2d")
  canvas.value.width = video.value.videoWidth
  canvas.value.height = video.value.videoHeight
  context.drawImage(video.value, 0, 0)
  canvas.value.toBlob(blob => {
    selectedFile.value = new File([blob], "photo.jpg", { type: "image/jpeg" })
    previewCover.value = URL.createObjectURL(blob)
    useDefault.value = false
    stopCamera()
  }, "image/jpeg", 0.8)
}

async function saveChanges() {
  isSaving.value = true
  try {
    const formData = new FormData()
    formData.append("status", form.status)
    formData.append("condition", form.condition)
    formData.append("ownerNotes", form.ownerNotes)
    formData.append("tags", form.tags.join(","))
    formData.append("useDefaultCover", useDefault.value)
    if (selectedFile.value) formData.append("coverFile", selectedFile.value)

    await apiClient.put(`/books/copies/${form.id}`, formData)
    router.push(`/books/${form.id}`)
  } catch (e) {
    console.error("errore salvataggio")
  } finally {
    isSaving.value = false
  }
}

onMounted(loadData)
</script>