<template>
    <main class="max-w-4xl mx-auto p-6 space-y-8 relative">

        <div class="flex justify-between items-center mb-4">
            <button @click="goBack" class="flex items-center text-paynes-gray hover:text-zomp transition font-medium">
                <i class="fa-solid fa-arrow-left mr-2"></i> Annulla
            </button>
            <h1 class="font-display text-2xl text-paynes-gray">Modifica Copia</h1>
        </div>

        <div v-if="isLoading" class="text-center py-10">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-paynes-gray"></i>
        </div>
        <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded text-center">{{ error }}</div>

        <article v-else-if="form"
            class="bg-white shadow-xl rounded-2xl border-2 border-thistle overflow-hidden animate-fade-in">

            <div class="md:grid md:grid-cols-3">

                <section
                    class="bg-ash-gray/10 p-6 md:col-span-1 flex flex-col items-center border-b md:border-b-0 md:border-r border-thistle gap-4">

                    <div class="relative w-48 h-72 shadow-lg rounded-lg overflow-hidden bg-white group">

                        <img :src="previewCover || form.coverUrl || '/images/cover_placeholder.png'"
                            class="w-full h-full object-cover transition duration-300 group-hover:opacity-50"
                            alt="anteprima copertina" />

                        <div
                            class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 gap-2">
                            <label
                                class="cursor-pointer bg-zomp text-white px-3 py-1 rounded-full text-xs font-bold shadow hover:scale-105 transition">
                                <i class="fa-solid fa-upload mr-1"></i> Carica
                                <input type="file" accept="image/*" class="hidden" @change="handleFileUpload">
                            </label>

                            <button @click="openDefaultCovers"
                                class="bg-paynes-gray text-white px-3 py-1 rounded-full text-xs font-bold shadow hover:scale-105 transition">
                                <i class="fa-solid fa-image mr-1"></i> Default
                            </button>
                        </div>
                    </div>

                    <p class="text-xs text-paynes-gray opacity-70 text-center px-4">
                        formati supportati: jpg, png. max 2mb.
                    </p>

                    <div class="w-full mt-2">
                        <label class="block text-xs font-bold text-paynes-gray uppercase mb-1 ml-1">Stato</label>
                        <select v-model="form.status"
                            class="w-full p-2 rounded-lg border border-thistle bg-white focus:outline-none focus:ring-2 focus:ring-zomp text-sm">
                            <option value="available">Disponibile</option>
                            <option value="loaned">In Prestito</option>
                            <option value="maintenance">Non Disponibile</option>
                        </select>
                    </div>
                </section>

                <section class="p-6 md:col-span-2 flex flex-col justify-between space-y-6">

                    <header class="border-b border-thistle pb-4">
                        <h2 class="text-2xl font-display text-paynes-gray opacity-60">{{ form.title }}</h2>
                        <p class="text-sm text-paynes-gray/60">Modifica i dettagli della tua copia</p>
                    </header>

                    <div class="space-y-4">

                        <div>
                            <label class="block text-xs font-bold text-paynes-gray uppercase mb-1">Condizioni</label>
                            <select v-model="form.condition"
                                class="w-full p-2 rounded-lg border border-thistle bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zomp transition">
                                <option value="nuovo">Nuovo / Come Nuovo</option>
                                <option value="ottime">Ottime Condizioni</option>
                                <option value="buone">Buone Condizioni</option>
                                <option value="accettabili">Accettabili / Rovinato</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-paynes-gray uppercase mb-1">Tags (premi
                                invio)</label>
                            <div
                                class="flex flex-wrap gap-2 p-2 border border-thistle rounded-lg bg-white min-h-[42px]">
                                <span v-for="(tag, idx) in form.tags" :key="idx"
                                    class="bg-ash-gray/30 text-paynes-gray text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    #{{ tag }}
                                    <button @click="removeTag(idx)" class="hover:text-red-500"><i
                                            class="fa-solid fa-xmark"></i></button>
                                </span>
                                <input v-model="newTag" @keydown.enter.prevent="addTag" placeholder="aggiungi tag..."
                                    class="flex-grow bg-transparent outline-none text-sm min-w-[80px]">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-paynes-gray uppercase mb-1">Note
                                Personali</label>
                            <div class="relative">
                                <i class="fa-solid fa-pen absolute top-3 left-3 text-gray-400 text-xs"></i>
                                <textarea v-model="form.ownerNotes" rows="4"
                                    class="w-full pl-8 p-2 rounded-lg border border-thistle bg-yellow-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zomp text-sm transition"
                                    placeholder="Scrivi qui eventuali note sulla tua copia (es. dedica, pagine piegate)..."></textarea>
                            </div>
                        </div>

                    </div>

                    <div class="pt-4 border-t border-thistle flex justify-end gap-3">
                        <button @click="saveChanges" :disabled="isSaving"
                            class="bg-zomp text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-opacity-90 transition flex items-center gap-2 disabled:opacity-50">
                            <span v-if="isSaving"><i class="fa-solid fa-circle-notch fa-spin"></i> Salvataggio...</span>
                            <span v-else><i class="fa-solid fa-floppy-disk"></i> Salva Modifiche</span>
                        </button>
                    </div>

                </section>
            </div>
        </article>

        <div v-if="showDefaultsModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
            @click.self="showDefaultsModal = false">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                <h3 class="font-display text-xl text-paynes-gray mb-4">Scegli copertina default</h3>

                <div class="grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
                    <button v-for="(cover, idx) in DEFAULT_COVERS" :key="idx" @click="selectDefault(cover)"
                        class="rounded-lg overflow-hidden border-2 border-transparent hover:border-zomp transition focus:outline-none focus:ring-2 focus:ring-zomp">
                        <img :src="cover" class="w-full h-auto object-cover aspect-[2/3]">
                    </button>
                </div>

                <button @click="resetToBookCover"
                    class="w-full mt-4 py-2 border border-dashed border-gray-400 text-gray-500 rounded hover:bg-gray-50 text-sm">
                    Usa copertina originale del libro
                </button>
            </div>
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

// file handling states
const previewCover = ref(null)
const selectedFile = ref(null)
const useDefault = ref(false)

// ui states
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref(null)
const newTag = ref('')
const showDefaultsModal = ref(false)

// path alle immagini statiche nel public folder
const DEFAULT_COVERS = [
    '/images/cover_default_1.png',
    '/images/cover_default_2.png',
    '/images/cover_default_3.png',
    '/images/cover_default_4.png'
]

function goBack() { router.back() }

// fetch dati copia
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
        error.value = "errore caricamento dati"
        console.error(e)
    } finally {
        isLoading.value = false
    }
}

function addTag() {
    const val = newTag.value.trim()
    if (val && !form.tags.includes(val)) {
        form.tags.push(val)
    }
    newTag.value = ''
}
function removeTag(idx) {
    form.tags.splice(idx, 1)
}

function openDefaultCovers() { showDefaultsModal.value = true }

// gestisce upload da file system
function handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
        alert("file troppo grande (max 2mb)")
        return
    }

    selectedFile.value = file
    useDefault.value = false

    const reader = new FileReader()
    reader.onload = (e) => { previewCover.value = e.target.result }
    reader.readAsDataURL(file)
}

// gestisce selezione cover default
// converte l'asset statico in un file blob per l'upload
async function selectDefault(path) {
    try {
        // fetch file from public folder
        const response = await fetch(path)
        const blob = await response.blob()
        const file = new File([blob], "default_cover.png", { type: "image/png" })

        selectedFile.value = file
        previewCover.value = path
        useDefault.value = false
        showDefaultsModal.value = false
    } catch (e) {
        console.error("errore caricamento default", e)
    }
}

// ripristina cover originale del libro
// useDefault true dice al be di settare null su customCover
function resetToBookCover() {
    selectedFile.value = null
    previewCover.value = null
    useDefault.value = true
    showDefaultsModal.value = false
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
        console.error(e)
    } finally {
        isSaving.value = false
    }
}

onMounted(loadData)
</script>