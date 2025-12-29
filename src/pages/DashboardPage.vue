<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main">
    
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-display text-theme-main">
          ciao <span class="text-[var(--zomp)]">{{ userData?.username || "persona cara" }}</span>!
        </h1>
        <p class="opacity-80 text-sm lowercase">ecco la panoramica della tua attivita</p>
      </div>
      <router-link to="/add-book" class="bg-[var(--zomp)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition transform hover:scale-105 flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> nuovo libro
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 rounded-2xl shadow-md border border-[var(--thistle)] overflow-hidden bg-theme-primary">
        <div @click="toggleStats" class="p-6 cursor-pointer hover:bg-[var(--bg-secondary)] transition flex justify-between items-center group">
          <h3 class="text-lg font-bold text-theme-main flex items-center group-hover:text-[var(--zomp)] lowercase">
            <i class="fa-solid fa-chart-pie mr-2 text-[var(--zomp)]"></i> riepilogo attivita
          </h3>
          <i class="fa-solid fa-chevron-down transition-transform duration-300" :class="isStatsOpen ? 'rotate-180 text-[var(--zomp)]' : 'text-gray-400'"></i>
        </div>

        <div v-if="!isStatsOpen" class="px-6 pb-6 grid grid-cols-3 gap-4 text-center">
          <div v-for="stat in statCards" :key="stat.label" class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--thistle)]/30">
            <div class="text-2xl font-display" :class="stat.color">{{ stat.value }}</div>
            <div class="text-xs opacity-70 uppercase font-bold tracking-wider">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="bg-theme-primary p-6 rounded-2xl shadow-md border border-[var(--thistle)] flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-theme-main mb-2 lowercase">visibilita mappa</h3>
          <div v-if="userData?.id" class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[var(--zomp)] text-[var(--zomp)]">
              <i class="fa-solid fa-eye"></i>
            </div>
            <div>
              <p class="font-bold text-sm text-theme-main lowercase">profilo attivo</p>
              <p class="text-xs opacity-70 lowercase">visibilita: {{ userData.visibility || "standard" }}</p>
            </div>
          </div>
        </div>
        <router-link to="/profile" class="text-center text-sm text-[var(--zomp)] font-bold hover:underline border-t border-[var(--thistle)] pt-3 mt-4 lowercase">
          gestisci privacy <i class="fa-solid fa-arrow-right ml-1"></i>
        </router-link>
      </div>
    </div>

    <div v-if="pendingRequests.length > 0" class="bg-[var(--tea-rose)]/20 border-l-4 border-[var(--tea-rose)] p-4 rounded-r-xl">
      <h3 class="font-bold text-theme-main mb-3 flex items-center lowercase">
        <i class="fa-solid fa-bell mr-2 text-[var(--tea-rose)]"></i> richieste da gestire ({{ pendingRequests.length }})
      </h3>
      <div class="space-y-2">
        <div v-for="req in pendingRequests" :key="req.id" class="flex justify-between items-center bg-theme-primary p-3 rounded-lg shadow-sm border border-[var(--thistle)]/50">
          <div class="text-sm">
            <span class="font-bold text-theme-main">{{ req.requesterUsername }}</span> desidera <span class="italic text-[var(--zomp)]">{{ req.title }}</span>
          </div>
          <button @click="openManageModal(req)" class="bg-[var(--zomp)] text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition lowercase">
            gestisci richiesta
          </button>
        </div>
      </div>
    </div>

    <hr class="border-[var(--thistle)]" />

    <div>
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-display text-theme-main lowercase">le tue librerie</h2>
        <div class="flex gap-4">
          <router-link to="/create-library" class="text-sm text-[var(--zomp)] font-bold hover:underline lowercase">crea nuova</router-link>
          <router-link to="/libraries" class="text-sm text-[var(--paynes-gray)] font-bold hover:underline lowercase">gestisci tutte</router-link>
        </div>
      </div>
      <div v-if="isLoadingLibs" class="text-center py-10 opacity-60">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
      </div>
      <div v-else class="space-y-1">
        <LibraryAccordion v-for="lib in libraries" :key="lib.id" :library="lib" @toggle="toggleLibrary(lib.id)" @bookMoved="moveBook" />
      </div>
    </div>

    <AppModal :is-open="isManageModalOpen" title="gestione richiesta prestito" @close="isManageModalOpen = false">
      <div class="p-6 space-y-6 font-sans">
        <div class="flex gap-4">
          <button @click="modalForm.action = 'ACCEPT'" :class="modalForm.action === 'ACCEPT' ? 'bg-[var(--zomp)] text-white' : 'bg-gray-100'" class="flex-1 py-3 rounded-xl font-bold transition lowercase">accetta</button>
          <button @click="modalForm.action = 'REJECT'" :class="modalForm.action === 'REJECT' ? 'bg-red-500 text-white' : 'bg-gray-100'" class="flex-1 py-3 rounded-xl font-bold transition lowercase">rifiuta</button>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold uppercase opacity-60">messaggio per il richiedente</label>
          <textarea v-model="modalForm.notes" class="w-full p-3 border border-[var(--thistle)] rounded-xl focus:ring-2 focus:ring-[var(--zomp)] outline-none transition" rows="3" placeholder="scrivi qui eventuali note o accordi..."></textarea>
        </div>

        <div v-if="modalForm.action === 'ACCEPT'" class="space-y-4 animate-fade-in">
          <label class="text-xs font-bold uppercase opacity-60">disponibilita per lo scambio</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="day in days" :key="day" @click="toggleDay(day)" :class="modalForm.selectedDays.includes(day) ? 'bg-[var(--tea-rose)] text-theme-main border-[var(--tea-rose)]' : 'border-gray-200'" class="px-3 py-1 border rounded-full text-xs font-bold transition lowercase">{{ day }}</button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="slot in timeSlots" :key="slot" @click="toggleSlot(slot)" :class="modalForm.selectedSlots.includes(slot) ? 'bg-[var(--tea-rose)] text-theme-main border-[var(--tea-rose)]' : 'border-gray-200'" class="p-2 border rounded-lg text-[10px] font-bold transition lowercase">{{ slot }}</button>
          </div>
        </div>

        <button @click="submitLoanManagement" :disabled="!modalForm.action" class="w-full bg-theme-main text-white py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-30 transition lowercase">conferma decisione</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue"
import { apiClient } from "@/services/apiClient"
import LibraryAccordion from "@/components/LibraryAccordion.vue"
import AppModal from "@/components/AppModal.vue"

// variabili stato
const userData = ref(null)
const isLoadingLibs = ref(true)
const libraries = ref([])
const pendingRequests = ref([])
const activeLoansCount = ref(0)
const isStatsOpen = ref(false)

// stato modale gestione
const isManageModalOpen = ref(false)
const selectedRequest = ref(null)
const modalForm = reactive({ action: '', notes: '', selectedDays: [], selectedSlots: [] })

const days = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']
const timeSlots = ['mattina 08-12', 'pausa pranzo 12-14', 'pomeriggio 14-18', 'sera 18-20']

// calcolo statistiche dashboard
const quickStats = computed(() => ({
  totalBooks: libraries.value.reduce((acc, lib) => acc + (lib.bookCount || 0), 0),
  activeLoans: activeLoansCount.value,
  pendingRequests: pendingRequests.value.length
}))

const statCards = computed(() => [
  { label: 'libri', value: quickStats.value.totalBooks, color: 'text-theme-main' },
  { label: 'in prestito', value: quickStats.value.activeLoans, color: 'text-[var(--zomp)]' },
  { label: 'richieste', value: quickStats.value.pendingRequests, color: 'text-[var(--tea-rose)]' }
])

// caricamento iniziale dati
onMounted(async () => {
  await Promise.all([fetchUserMe(), fetchLibraries(), fetchIncomingRequests(), fetchActiveLoans()])
})

// funzioni recupero dati api
async function fetchUserMe() { try { userData.value = await apiClient.get("/users/me") } catch (e) {}}
async function fetchLibraries() {
  isLoadingLibs.value = true
  try {
    const res = await apiClient.get("/users/me/libraries")
    libraries.value = res.libraries.map(l => ({ ...l, isOpen: false, books: [], isLoadingBooks: false, bookCount: l.count || 0 }))
  } finally { isLoadingLibs.value = false }
}
async function fetchIncomingRequests() { try { pendingRequests.value = await apiClient.get("/loan/requests/incoming") || [] } catch (e) {}}
async function fetchActiveLoans() { try { const res = await apiClient.get("/loan/active"); activeLoansCount.value = res.length || 0 } catch (e) {}}

// logica apertura modale gestione
function openManageModal(req) {
  selectedRequest.value = req
  modalForm.action = ''
  modalForm.notes = ''
  modalForm.selectedDays = []
  modalForm.selectedSlots = []
  isManageModalOpen.value = true
}

// selezione giorni e orari
function toggleDay(day) {
  const index = modalForm.selectedDays.indexOf(day)
  index === -1 ? modalForm.selectedDays.push(day) : modalForm.selectedDays.splice(index, 1)
}
function toggleSlot(slot) {
  const index = modalForm.selectedSlots.indexOf(slot)
  index === -1 ? modalForm.selectedSlots.push(slot) : modalForm.selectedSlots.splice(index, 1)
}

// invio gestione prestito al server
async function submitLoanManagement() {
  try {
    const availabilityStr = `giorni: ${modalForm.selectedDays.join(', ')} | orari: ${modalForm.selectedSlots.join(', ')}`
    const finalNotes = modalForm.notes + (modalForm.selectedDays.length ? `\n\ndisponibilita: ${availabilityStr}` : '')
    
    await apiClient.patch(`/loan/${selectedRequest.value.id}/status`, {
      action: modalForm.action,
      notes: finalNotes
    })
    
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== selectedRequest.value.id)
    if (modalForm.action === 'ACCEPT') await fetchActiveLoans()
    isManageModalOpen.value = false
  } catch (e) {}
}

// logica librerie accordion
async function toggleLibrary(libId) {
  const lib = libraries.value.find(l => l.id === libId)
  if (!lib) return
  lib.isOpen = !lib.isOpen
  if (lib.isOpen && !lib.books.length) {
    lib.isLoadingBooks = true
    try {
      const res = await apiClient.get(`/libraries/${libId}`)
      lib.books = res.books || []
      lib.bookCount = lib.books.length
    } finally { lib.isLoadingBooks = false }
  }
}

async function moveBook({ bookId, toLibraryId }) {
  try {
    await apiClient.patch(`/books/${bookId}/move`, { libraryId: toLibraryId })
    await fetchLibraries()
  } catch (e) {}
}

const toggleStats = () => (isStatsOpen.value = !isStatsOpen.value)
</script>