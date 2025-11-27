<template>
    <main class="max-w-4xl mx-auto p-6 space-y-8 relative">

        <button @click="goBack" aria-label="torna alla pagina precedente"
            class="flex items-center text-paynes-gray hover:text-zomp transition-colors font-medium mb-4 focus:outline-none focus:ring-2 focus:ring-zomp rounded-lg p-1">
            <i class="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>
            Torna indietro
        </button>

        <div v-if="isLoading" role="status" class="text-center py-10 text-paynes-gray/70">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl mb-2" aria-hidden="true"></i>
            <p>recupero dettagli libro...</p>
        </div>

        <div v-else-if="error" role="alert" class="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p class="text-red-700 font-medium">Errore: {{ error }}</p>
            <button @click="fetchBookDetails"
                class="mt-2 underline text-sm text-paynes-gray hover:text-black focus:outline-none focus:ring-2 focus:ring-red-500 rounded">
                Riprova
            </button>
        </div>

        <article v-else-if="book" class="bg-white shadow-xl rounded-2xl border-2 border-thistle overflow-hidden">

            <div class="md:grid md:grid-cols-3">

                <section
                    class="bg-ash-gray/10 p-6 md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-thistle">
                    <div class="relative w-48 h-72 shadow-lg rounded-lg overflow-hidden bg-white">
                        <img v-if="book.coverUrl" :src="book.coverUrl" :alt="`Copertina del libro ${book.title}`"
                            class="w-full h-full object-cover" />
                        <div v-else
                            class="w-full h-full flex items-center justify-center bg-paynes-gray/10 text-paynes-gray"
                            aria-label="copertina non disponibile">
                            <i class="fa-solid fa-book text-4xl opacity-50" aria-hidden="true"></i>
                        </div>
                    </div>

                    <div class="mt-6">
                        <span :class="statusBadgeClass"
                            class="px-4 py-2 rounded-full text-sm font-bold shadow-sm border">
                            {{ statusLabel }}
                        </span>
                    </div>
                </section>

                <section class="p-6 md:col-span-2 flex flex-col justify-between space-y-6">

                    <header>
                        <h1 class="text-3xl font-display text-paynes-gray mb-1">{{ book.title }}</h1>
                        <h2 class="text-xl text-paynes-gray/80 font-medium">di {{ book.author }}</h2>
                    </header>

                    <div class="space-y-3">
                        <h3
                            class="text-sm font-bold uppercase tracking-wider text-paynes-gray/60 border-b border-thistle pb-1">
                            Dettagli Edizione</h3>

                        <dl class="text-paynes-gray space-y-2 text-sm">
                            <div class="grid grid-cols-[100px_1fr] items-center">
                                <dt class="flex items-center">
                                    <i class="fa-solid fa-calendar-days w-5 text-zomp mr-1" aria-hidden="true"></i>
                                    Anno:
                                </dt>
                                <dd><strong>{{ book.publicationYear || 'N/D' }}</strong></dd>
                            </div>
                            <div class="grid grid-cols-[100px_1fr] items-center">
                                <dt class="flex items-center">
                                    <i class="fa-solid fa-building w-5 text-zomp mr-1" aria-hidden="true"></i> Editore:
                                </dt>
                                <dd><strong>{{ book.publisher || 'N/D' }}</strong></dd>
                            </div>
                            <div class="grid grid-cols-[100px_1fr] items-center">
                                <dt class="flex items-center">
                                    <i class="fa-solid fa-book-open w-5 text-zomp mr-1" aria-hidden="true"></i> Formato:
                                </dt>
                                <dd><strong>{{ book.coverType || 'N/D' }}</strong></dd>
                            </div>
                            <div class="grid grid-cols-[100px_1fr] items-center">
                                <dt class="flex items-center">
                                    <i class="fa-solid fa-language w-5 text-zomp mr-1" aria-hidden="true"></i> Lingua:
                                </dt>
                                <dd><strong>{{ book.language || 'Italiano' }}</strong></dd>
                            </div>
                        </dl>

                        <h3
                            class="text-sm font-bold uppercase tracking-wider text-paynes-gray/60 border-b border-thistle pb-1 mt-4">
                            Info Copia</h3>
                        <dl class="text-paynes-gray space-y-2 text-sm">

                            <div class="grid grid-cols-[100px_1fr] items-center">
                                <dt class="flex items-center">
                                    <i class="fa-solid fa-location-dot w-5 text-zomp mr-1" aria-hidden="true"></i>
                                    Libreria:
                                </dt>
                                <dd>
                                    <router-link :to="`/libraries/${book.libraryId}`"
                                        class="font-bold text-paynes-gray hover:text-zomp underline decoration-2 underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-zomp rounded px-1 -ml-1"
                                        :aria-label="`Vai alla libreria ${book.libraryName}`">
                                        {{ book.libraryName }}
                                    </router-link>
                                </dd>
                            </div>

                            <div class="grid grid-cols-[100px_1fr] items-center">
                                <dt class="flex items-center">
                                    <i class="fa-solid fa-heart-pulse w-5 text-zomp mr-1" aria-hidden="true"></i>
                                    Condizioni:
                                </dt>
                                <dd><strong>{{ book.condition }}</strong></dd>
                            </div>
                        </dl>
                    </div>

                    <div v-if="book.tags && book.tags.length > 0">
                        <div class="flex flex-wrap gap-2 mt-2" aria-label="Tag del libro">
                            <span v-for="tag in book.tags" :key="tag"
                                class="px-3 py-1 bg-ash-gray/30 text-paynes-gray text-xs rounded-full border border-thistle/50">
                                #{{ tag }}
                            </span>
                        </div>
                    </div>

                    <div v-if="book.ownerNotes"
                        class="relative bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-sm text-gray-600 italic mt-2">
                        <i class="fa-solid fa-quote-left absolute top-2 left-2 text-yellow-400 text-xl opacity-80"
                            aria-hidden="true"></i>
                        <p class="px-4 py-1 text-center">
                            {{ book.ownerNotes }}
                        </p>
                        <i class="fa-solid fa-quote-right absolute bottom-2 right-2 text-yellow-400 text-xl opacity-80"
                            aria-hidden="true"></i>
                    </div>

                    <div class="pt-4 border-t border-thistle flex justify-end">

                        <div v-if="isOwner" class="flex space-x-3">
                            <button aria-label="modifica dettagli libro" title="Modifica"
                                class="p-3 text-paynes-gray hover:bg-ash-gray/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-zomp">
                                <i class="fa-solid fa-pen-to-square text-lg" aria-hidden="true"></i>
                            </button>

                            <button @click="moveBook" aria-label="sposta in altra libreria"
                                title="Sposta in altra libreria"
                                class="p-3 text-paynes-gray hover:bg-ash-gray/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-zomp">
                                <i class="fa-solid fa-arrow-right-from-bracket text-lg" aria-hidden="true"></i>
                            </button>

                            <button @click="openDeleteModal" aria-label="elimina libro definitivamente" title="Elimina"
                                class="p-3 text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                                <i class="fa-solid fa-trash text-lg" aria-hidden="true"></i>
                            </button>
                        </div>

                        <div v-else>
                            <button v-if="book.status === 'available'" @click="requestLoan"
                                class="bg-zomp text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-opacity-90 transition transform hover:-translate-y-0.5 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zomp">
                                <i class="fa-solid fa-hand-holding-heart mr-2" aria-hidden="true"></i>
                                Chiedi in Prestito
                            </button>
                            <button v-else disabled aria-disabled="true"
                                class="bg-ash-gray text-white px-6 py-3 rounded-xl font-bold cursor-not-allowed opacity-70">
                                Non Disponibile
                            </button>
                        </div>

                    </div>

                </section>
            </div>
        </article>

        <AppModal :isOpen="showDeleteModal" :title="deleteModalTitle" @close="handleModalClose">

            <div v-if="deleteStep === 'confirm'" class="flex flex-col items-center text-center space-y-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                    <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
                </div>

                <p class="text-lg font-medium text-paynes-gray">Sei sicuro di voler eliminare questo libro?</p>

                <p class="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100">
                    <i class="fa-solid fa-circle-info mr-1"></i>
                    Questa azione è <strong>irreversibile</strong>. Il libro verrà rimosso permanentemente dalla tua
                    libreria.
                </p>

                <div class="flex gap-3 w-full mt-4">
                    <button @click="showDeleteModal = false"
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition">
                        Annulla
                    </button>
                    <button @click="confirmDelete"
                        class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition flex justify-center items-center gap-2">
                        <i class="fa-solid fa-trash"></i> Elimina
                    </button>
                </div>
            </div>

            <div v-else-if="deleteStep === 'loading'" class="flex flex-col items-center justify-center py-8 space-y-4">
                <i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500"></i>
                <p class="text-paynes-gray font-medium">Eliminazione in corso...</p>
            </div>

            <div v-else-if="deleteStep === 'success'" class="flex flex-col items-center text-center space-y-4">
                <div
                    class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-zomp mb-2 animate-bounce">
                    <i class="fa-solid fa-check text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-paynes-gray">Libro Eliminato!</h3>
                <p class="text-sm text-gray-600">
                    L'operazione è andata a buon fine. Verrai reindirizzato alla Home Page.
                </p>
                <button @click="handleModalClose"
                    class="w-full mt-4 px-4 py-2 bg-zomp text-white rounded-lg hover:bg-opacity-90 font-bold transition">
                    Chiudi e vai alla Home
                </button>
            </div>

            <div v-else-if="deleteStep === 'error'" class="flex flex-col items-center text-center space-y-4">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
                    <i class="fa-solid fa-xmark text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-red-600">Qualcosa è andato storto</h3>
                <p class="text-sm text-gray-600">
                    Non siamo riusciti ad eliminare il libro. Riprova più tardi.
                </p>
                <button @click="showDeleteModal = false"
                    class="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition">
                    Chiudi
                </button>
            </div>

        </AppModal>

    </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/services/apiClient'
import AppModal from '@/components/AppModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// states
const book = ref(null)
const isLoading = ref(true)
const error = ref(null)

// computed
const isOwner = computed(() => {
    if (!book.value || !authStore.userId) return false
    return book.value.ownerId === authStore.userId
})

const statusBadgeClass = computed(() => {
    if (!book.value) return ''
    if (book.value.status === 'available') {
        return 'bg-green-100 text-green-800 border-green-200'
    } else {
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
})

const statusLabel = computed(() => {
    if (!book.value) return ''
    return book.value.status === 'available' ? 'Disponibile' : 'In Prestito'
})

// methods
function goBack() { router.back() }

async function fetchBookDetails() {
    isLoading.value = true
    const bookId = route.params.id
    error.value = null

    try {
        const response = await apiClient.get(`/books/${bookId}`)
        book.value = response
    } catch (err) {
        console.error("fetch error:", err)
        error.value = "Impossibile caricare il libro. Potrebbe essere stato rimosso o l'ID non è valido."
    } finally {
        isLoading.value = false
    }
}

async function requestLoan() {
    if (!authStore.isAuthenticated) {
        router.push('/login')
        return
    }

    if (!confirm("Vuoi inviare una richiesta di prestito al proprietario?")) return

    try {
        // [apiClient.post(`/loans/request`, { bookId: book.value.id })]
        alert("Richiesta inviata con successo.")
    } catch (e) {
        alert("Errore nell'invio della richiesta.")
    }
}

async function moveBook() {
    // todo: open modal
    alert("Funzionalità 'Sposta in altra libreria' in arrivo.")
}

const showDeleteModal = ref(false)
const deleteStep = ref('confirm') // 'confirm', 'loading', 'success', 'error'

const deleteModalTitle = computed(() => {
    switch (deleteStep.value) {
        case 'confirm': return 'Conferma Eliminazione';
        case 'loading': return 'Attendere...';
        case 'success': return 'Operazione Completata';
        case 'error': return 'Errore';
        default: return '';
    }
})

function openDeleteModal() {
    deleteStep.value = 'confirm'
    showDeleteModal.value = true
}

// Chiamata API vera e propria
async function confirmDelete() {
    deleteStep.value = 'loading'

    try {
        // Endpoint API corretto come discusso prima
        await apiClient.delete(`/copies/${book.value.id}`)

        // Timeout estetico per non far sparire subito lo spinner se l'API è troppo veloce
        setTimeout(() => {
            deleteStep.value = 'success'
        }, 800)

    } catch (e) {
        console.error(e)
        deleteStep.value = 'error'
    }
}

// Gestisce la chiusura: se è successo redirect, altrimenti chiude solo
function handleModalClose() {
    showDeleteModal.value = false
    if (deleteStep.value === 'success') {
        router.push('/')
    }
}

onMounted(() => {
    fetchBookDetails()
})
</script>