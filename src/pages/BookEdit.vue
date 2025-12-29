<template>
    <main class="max-w-4xl mx-auto p-6 space-y-10 relative">
        <div class="flex justify-between items-center mb-8">
            <h1 class="font-display text-2xl text-paynes-gray">modifica copia</h1>
            <div class="flex gap-4">
                <button @click="goBack" class="px-4 py-2 text-sm font-bold text-paynes-gray hover:text-zomp transition">
                    annulla
                </button>
                <button @click="saveChanges" :disabled="isSaving"
                    class="bg-zomp text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50">
                    <span v-if="isSaving font-bold text-xs uppercase tracking-widest">salvataggio...</span>
                    <span v-else>salva</span>
                </button>
            </div>
        </div>

        <div v-if="isLoading" class="text-center py-20">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-paynes-gray"></i>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-10 animate-fade-in">
            <section class="space-y-6 flex flex-col items-center">
                <div class="relative w-full aspect-[2/3] shadow-2xl rounded-2xl overflow-hidden bg-ash-gray/10 group">
                    <img :src="previewCover || form.coverUrl || '/images/cover_placeholder.png'"
                        class="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                        alt="anteprima" />
                    
                    <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-3">
                        <label class="cursor-pointer bg-white text-paynes-gray px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-zomp hover:text-white transition">
                            carica file
                            <input type="file" accept="image/*" class="hidden" @change="handleFileUpload">
                        </label>
                        
                        <button @click="startCamera" class="bg-white text-paynes-gray px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-zomp hover:text-white transition">
                            scatta foto
                        </button>

                        <button @click="removeCurrentCover" class="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-red-600 transition">
                            rimuovi
                        </button>
                    </div>
                </div>

                <div class="w-full space-y-2">
                    <label class="block text-[10px] font-black text-paynes-gray uppercase tracking-widest ml-1">stato prestito</label>
                    <select v-model="form.status" class="w-full p-3 rounded-xl border border-thistle bg-white focus:ring-2 focus:ring-zomp outline-none text-sm">
                        <option value="available">disponibile</option>
                        <option value="loaned">in prestito</option>
                        <option value="maintenance">non disponibile</option>
                    </select>
                </div>
            </section>

            <section class="md:col-span-2 space-y-8">
                <div class="space-y-1">
                    <h2 class="text-3xl font-display text-paynes-gray">{{ form.title }}</h2>
                    <p class="text-sm opacity-60">gestisci i dettagli della tua copia fisica</p>
                </div>

                <div class="space-y-6">
                    <div>
                        <label class="block text-[10px] font-black text-paynes-gray uppercase tracking-widest mb-2">condizioni</label>
                        <select v-model="form.condition" class="w-full p-4 rounded-xl border border-thistle bg-white focus:ring-2 focus:ring-zomp outline-none transition">
                            <option value="nuovo">nuovo / come nuovo</option>
                            <option value="ottime">ottime condizioni</option>
                            <option value="buone">buone condizioni</option>
                            <option value="accettabili">accettabili / rovinato</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-paynes-gray uppercase tracking-widest mb-2">tags</label>
                        <div class="flex flex-wrap gap-2 p-3 border border-thistle rounded-xl bg-white min-h-[50px]">
                            <span v-for="(tag, idx) in form.tags" :key="idx" class="bg-zomp/10 text-zomp text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                                {{ tag }}
                                <button @click="removeTag(idx)" class="hover:text-red-500"><i class="fa-solid fa-xmark"></i></button>
                            </span>
                            <input v-model="newTag" @keydown.enter.prevent="addTag" placeholder="aggiungi tag..." class="flex-grow bg-transparent outline-none text-sm p-1">
                        </div>
                        <div class="mt-2 flex flex-wrap gap-2">
                            <button v-for="tag in commonTags" :key="tag" @click="addSuggestedTag(tag)" class="text-[9px] font-bold uppercase border border-thistle px-2 py-1 rounded hover:bg-thistle transition">
                                + {{ tag }}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black text-paynes-gray uppercase tracking-widest mb-2">note personali</label>
                        <textarea v-model="form.ownerNotes" rows="5" class="w-full p-4 rounded-xl border border-thistle bg-white focus:ring-2 focus:ring-zomp outline-none text-sm transition" placeholder="scrivi qui dettagli sulla tua copia..."></textarea>
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
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/services/apiClient'

const route = useRoute()
const router = useRouter()

const form = reactive({
    id: '',
    title: '',
    status: 'available',
    condition: 'ottime',
    ownerNotes: '',
    tags: [],
    coverUrl: '',
})

const commonTags = ['fantascienza', 'romanzo', 'classico', 'riferimento', 'thriller']
const previewCover = ref(null)
const selectedFile = ref(null)
const useDefault = ref(false)
const isLoading = ref(true)
const isSaving = ref(false)
const newTag = ref('')

// camera states
const isCameraOpen = ref(false)
const video = ref(null)
const canvas = ref(null)
const stream = ref(null)

function goBack() { router.back() }

async function loadData() {
    isLoading.value = true
    try {
        const data = await apiClient.get(`/books/${route.params.id}`)
        form.id = data.id
        form.title = data.title
        form.status = data.status || 'available'
        form.condition = data.condition || 'buone'
        form.ownerNotes = data.ownerNotes || ''
        form.tags = data.tags || []
        form.coverUrl = data.coverUrl
    } catch (e) {
        console.error("errore caricamento")
    } finally {
        isLoading.value = false
    }
}

function addTag() {
    const val = newTag.value.trim().toLowerCase()
    if (val && !form.tags.includes(val)) form.tags.push(val)
    newTag.value = ''
}

function addSuggestedTag(tag) {
    if (!form.tags.includes(tag)) form.tags.push(tag)
}

function removeTag(idx) { form.tags.splice(idx, 1) }

// rimpiazza immagine attuale o quella di google
function removeCurrentCover() {
    previewCover.value = '/images/cover_placeholder.png'
    selectedFile.value = null
    useDefault.value = true
}

function handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return alert("max 2mb")

    selectedFile.value = file
    useDefault.value = false
    const reader = new FileReader()
    reader.onload = (e) => { previewCover.value = e.target.result }
    reader.readAsDataURL(file)
}

// logica fotocamera
async function startCamera() {
    isCameraOpen.value = true
    try {
        stream.value = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        video.value.srcObject = stream.value
    } catch (e) {
        alert("fotocamera non disponibile")
        isCameraOpen.value = false
    }
}

function stopCamera() {
    if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
    }
    isCameraOpen.value = false
}

function captureImage() {
    const context = canvas.value.getContext('2d')
    canvas.value.width = video.value.videoWidth
    canvas.value.height = video.value.videoHeight
    context.drawImage(video.value, 0, 0)
    
    canvas.value.toBlob((blob) => {
        const file = new File([blob], "photo_cover.jpg", { type: "image/jpeg" })
        selectedFile.value = file
        previewCover.value = URL.createObjectURL(blob)
        useDefault.value = false
        stopCamera()
    }, 'image/jpeg', 0.8)
}

async function saveChanges() {
    isSaving.value = true
    try {
        const formData = new FormData()
        formData.append('status', form.status)
        formData.append('condition', form.condition)
        formData.append('ownerNotes', form.ownerNotes)
        formData.append('tags', form.tags.join(','))
        formData.append('useDefaultCover', useDefault.value)

        if (selectedFile.value) {
            formData.append('coverFile', selectedFile.value)
        }

        await apiClient.put(`/copies/${form.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        router.push(`/books/${form.id}`)
    } catch (e) {
        alert("errore salvataggio")
    } finally {
        isSaving.value = false
    }
}

onMounted(loadData)
</script>

<style scoped>
.font-display { font-family: 'Mochiy Pop P One', cursive; }
</style>