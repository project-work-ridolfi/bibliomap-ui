<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main font-sans">
    
    <div v-if="overdueLoans.length > 0" class="bg-red-100 border-2 border-red-500 p-6 rounded-2xl animate-pulse">
      <h3 class="text-red-700 font-black flex items-center gap-2 uppercase tracking-tighter">
        <i class="fa-solid fa-triangle-exclamation"></i> attenzione prestiti scaduti
      </h3>
      <div class="mt-4 space-y-3">
        <div v-for="loan in overdueLoans" :key="loan.id" class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 p-4 rounded-xl border border-red-200">
          <div>
            <p class="text-sm font-bold text-red-800 lowercase">devi restituire {{ loan.title }}</p>
            <p class="text-xs text-red-600 lowercase">scaduto il {{ formatDate(loan.expectedReturnDate) }}</p>
          </div>
          <button @click="openContactModal(loan)" class="mt-3 md:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition lowercase">
            contatta proprietario
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-display text-theme-main">
          Ciao <span class="text-[var(--zomp)]">{{ userData?.username || "" }}</span>!
        </h1>
        <p class="opacity-80 text-sm">panoramica attività</p>
      </div>
      <router-link to="/add-book" class="bg-[var(--zomp)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition transform hover:scale-105 flex items-center gap-2 no-underline">
        <i class="fa-solid fa-plus"></i> nuovo libro
      </router-link>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 rounded-2xl shadow-md border border-[var(--thistle)] overflow-hidden bg-theme-primary">
        <div @click="isStatsOpen = !isStatsOpen" class="p-6 cursor-pointer hover:bg-[var(--bg-secondary)] transition flex justify-between items-center group">
          <h3 class="text-lg font-bold text-theme-main flex items-center group-hover:text-[var(--zomp)] lowercase">
            <i class="fa-solid fa-chart-line mr-2 text-[var(--zomp)]"></i> riepilogo e analisi
          </h3>
          <i class="fa-solid fa-chevron-down transition-transform duration-300" :class="isStatsOpen ? 'rotate-180 text-[var(--zomp)]' : ''"></i>
        </div>
        
        <div v-if="isStatsOpen" class="px-6 pb-6 border-t border-thistle pt-6">
          <Stats :userId="userData?.id" />
        </div>

        <div v-else class="px-6 pb-6 grid grid-cols-3 gap-4 text-center">
          <div v-for="stat in statCards" :key="stat.label" class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--thistle)]/30">
            <div class="text-2xl font-display" :class="stat.color">{{ stat.value }}</div>
            <div class="text-[10px] opacity-70 font-bold tracking-wider uppercase">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <div class="bg-theme-primary p-6 rounded-2xl shadow-md border border-[var(--thistle)] flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold text-theme-main mb-2 lowercase">mappa</h3>
          <div v-if="userData?.id" class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-[var(--zomp)] text-[var(--zomp)]">
              <i class="fa-solid fa-eye"></i>
            </div>
            <div>
              <p class="font-bold text-sm text-theme-main lowercase">profilo attivo</p>
              <p class="text-xs opacity-70 lowercase">visibilita {{ userData.visibility || "standard" }}</p>
            </div>
          </div>
        </div>
        <router-link to="/profile" class="text-center text-sm text-[var(--zomp)] font-bold hover:underline border-t border-[var(--thistle)] pt-3 mt-4 lowercase">
          privacy <i class="fa-solid fa-arrow-right ml-1"></i>
        </router-link>
      </div>
    </div>

    <div v-if="pendingRequests.length > 0" class="bg-[var(--tea-rose)]/20 border-l-4 border-[var(--tea-rose)] p-4 rounded-r-xl">
      <h3 class="font-bold text-theme-main mb-3 flex items-center lowercase">
        <i class="fa-solid fa-bell mr-2 text-[var(--tea-rose)]"></i> nuove richieste ({{ pendingRequests.length }})
      </h3>
      <div class="space-y-2">
        <div v-for="req in pendingRequests" :key="req.id" class="flex justify-between items-center bg-theme-primary p-3 rounded-lg shadow-sm border border-[var(--thistle)]/50">
          <div class="text-sm">
            <span class="font-bold text-theme-main lowercase">{{ req.requesterUsername }}</span> chiede <span class="italic text-[var(--zomp)]">{{ req.title }}</span>
          </div>
          <button @click="openManageModal(req)" class="bg-[var(--zomp)] text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition lowercase">
            gestisci
          </button>
        </div>
      </div>
    </div>

    <div v-if="acceptedLoans.length > 0" class="bg-[var(--zomp)]/10 border-l-4 border-[var(--zomp)] p-4 rounded-r-xl space-y-3">
      <h3 class="font-bold text-theme-main flex items-center lowercase">
        <i class="fa-solid fa-handshake mr-2 text-[var(--zomp)]"></i> scambi da confermare ({{ acceptedLoans.length }})
      </h3>
      <div class="space-y-2">
        <div v-for="loan in acceptedLoans" :key="loan.id" class="flex justify-between items-center bg-theme-primary p-3 rounded-lg shadow-sm border border-[var(--thistle)]/50">
          <div class="text-sm">
            <template v-if="loan.ownerId === userData?.id">
              consegna <span class="italic font-bold">{{ loan.title }}</span> a <span class="text-[var(--zomp)]">{{ loan.requesterUsername }}</span>
            </template>
            <template v-else>
              ricevi <span class="italic font-bold">{{ loan.title }}</span> da <span class="text-[var(--zomp)]">{{ loan.ownerUsername }}</span>
            </template>
          </div>
          <button @click="confirmExchange(loan.id)" class="bg-[var(--zomp)] text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:opacity-90 transition lowercase">
            conferma scambio
          </button>
        </div>
      </div>
    </div>

    <hr class="border-[var(--thistle)]" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-4">
        <h3 class="text-xl font-display text-theme-main lowercase border-b border-[var(--thistle)] pb-2">libri in lettura</h3>
        <div v-if="borrowedBooks.length === 0" class="text-xs opacity-50 italic lowercase">nessun libro ricevuto</div>
        <div v-for="loan in borrowedBooks" :key="loan.id" class="bg-theme-primary p-4 rounded-xl shadow-sm border border-[var(--thistle)]/30">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-bold text-[var(--zomp)]">{{ loan.title }}</h4>
              <p class="text-[10px] opacity-60 lowercase">da: {{ loan.ownerUsername }}</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] uppercase font-black opacity-30">scadenza</p>
              <p class="text-sm font-mono" :class="isOverdue(loan.expectedReturnDate) ? 'text-red-500 font-bold' : ''">
                {{ formatDate(loan.expectedReturnDate) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-xl font-display text-theme-main lowercase border-b border-[var(--thistle)] pb-2">libri prestati</h3>
        <div v-if="lentBooks.length === 0" class="text-xs opacity-50 italic lowercase">nessun libro prestato</div>
        <div v-for="loan in lentBooks" :key="loan.id" class="bg-theme-primary p-4 rounded-xl shadow-sm border border-[var(--thistle)]/30">
          <div class="flex justify-between items-start">
            <div class="flex-grow">
              <h4 class="font-bold text-[var(--paynes-gray)]">{{ loan.title }}</h4>
              <p class="text-[10px] opacity-60 lowercase">a: {{ loan.requesterUsername }}</p>
              <div class="mt-3 flex gap-2">
                <button @click="returnBook(loan.id)" class="text-[9px] font-bold text-[var(--zomp)] border border-[var(--zomp)] px-2 py-1 rounded hover:bg-[var(--zomp)] hover:text-white transition lowercase">
                  restituito
                </button>
                <button @click="extendLoan(loan.id)" class="text-[9px] font-bold text-[var(--paynes-gray)] border border-[var(--paynes-gray)] px-2 py-1 rounded hover:bg-[var(--paynes-gray)] hover:text-white transition lowercase">
                  allunga
                </button>
              </div>
            </div>
            <div class="text-right ml-4">
              <p class="text-[9px] uppercase font-black opacity-30">rientro</p>
              <p class="text-sm font-mono lowercase">{{ formatDate(loan.expectedReturnDate) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-display text-theme-main lowercase">librerie</h2>
        <div class="flex gap-4">
          <router-link to="/library" class="text-sm text-[var(--zomp)] font-bold hover:underline lowercase">crea</router-link>
          <router-link to="/libraries" class="text-sm text-[var(--paynes-gray)] font-bold hover:underline lowercase">tutte</router-link>
        </div>
      </div>
      <div v-if="isLoadingLibs" class="text-center py-10 opacity-60">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl"></i>
      </div>
      <div v-else class="space-y-1">
        <LibraryAccordion v-for="lib in libraries" :key="lib.id" :library="lib" @toggle="toggleLibrary(lib.id)" @bookMoved="moveBook" @delete-library="openDeleteModal('library', $event)" />
      </div>
    </div>

    <AppModal :is-open="isManageModalOpen" :title="modalTitle" @close="isManageModalOpen = false">
      <div class="p-6 space-y-6">
        <div v-if="!isContactMode" class="flex gap-4">
          <button @click="modalForm.action = 'ACCEPT'" :class="modalForm.action === 'ACCEPT' ? 'bg-[var(--zomp)] text-white' : 'bg-gray-100'" class="flex-1 py-3 rounded-xl font-bold transition lowercase">accetta</button>
          <button @click="modalForm.action = 'REJECT'" :class="modalForm.action === 'REJECT' ? 'bg-red-500 text-white' : 'bg-gray-100'" class="flex-1 py-3 rounded-xl font-bold transition lowercase">rifiuta</button>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase opacity-40">messaggio</label>
          <textarea v-model="modalForm.notes" class="w-full p-3 border border-[var(--thistle)] rounded-xl outline-none text-sm" rows="3" placeholder="scrivi un messaggio"></textarea>
        </div>
        <div v-if="modalForm.action === 'ACCEPT' || isContactMode" class="space-y-4">
          <label class="text-[10px] font-black uppercase opacity-40">proponi disponibilita</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="day in days" :key="day" @click="toggleDay(day)" :class="modalForm.selectedDays.includes(day) ? 'bg-[var(--tea-rose)] text-theme-main' : 'border-gray-200'" class="px-3 py-1 border rounded-full text-[10px] font-bold lowercase">{{ day }}</button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="slot in timeSlots" :key="slot" @click="toggleSlot(slot)" :class="modalForm.selectedSlots.includes(slot) ? 'bg-[var(--tea-rose)] text-theme-main' : 'border-gray-200'" class="p-2 border rounded-lg text-[10px] font-bold lowercase text-left">{{ slot }}</button>
          </div>
        </div>
        <div class="pt-4 border-t border-thistle">
          <button @click="handleModalSubmit" :disabled="!isContactMode && !modalForm.action" class="w-full bg-[var(--paynes-gray)] text-white py-4 rounded-xl font-bold hover:opacity-90 disabled:opacity-30 transition shadow-lg lowercase">
            {{ isContactMode ? 'invia messaggio' : 'invia risposta' }}
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue"
import { apiClient } from "@/services/apiClient"
import LibraryAccordion from "@/components/LibraryAccordion.vue"
import AppModal from "@/components/AppModal.vue"
import Stats from "@/components/stats.vue"

// stato dashboard
const userData = ref(null)
const isStatsOpen = ref(false)
const myTotalBooks = ref(0)
const totalLoansIn = ref(0)
const totalLoansOut = ref(0)

const activeLoans = ref([])
const pendingRequests = ref([])
const acceptedLoans = ref([])
const isLoadingLibs = ref(true)
const libraries = ref([])

// stato modale
const isManageModalOpen = ref(false)
const isContactMode = ref(false)
const selectedRequest = ref(null)
const modalForm = reactive({ action: '', notes: '', selectedDays: [], selectedSlots: [] })

const modalTitle = computed(() => isContactMode.value ? "contatta proprietario" : "gestione richiesta")
const days = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']
const timeSlots = ['mattina 08-12', 'pranzo 12-14', 'pomeriggio 14-18', 'sera 18-20']

// calcolo cards riepilogo
const statCards = computed(() => [
  { label: 'i tuoi libri', value: myTotalBooks.value, color: 'text-theme-main' },
  { label: 'ricevuti', value: totalLoansIn.value, color: 'text-[var(--zomp)]' },
  { label: 'prestati', value: totalLoansOut.value, color: 'text-[var(--paynes-gray)]' }
])

// filtri prestiti
const borrowedBooks = computed(() => activeLoans.value.filter(l => l.requesterId === userData.value?.id && l.status === 'ON_LOAN'))
const lentBooks = computed(() => activeLoans.value.filter(l => l.ownerId === userData.value?.id && l.status === 'ON_LOAN'))
const overdueLoans = computed(() => borrowedBooks.value.filter(l => isOverdue(l.expectedReturnDate)))

// utility
const isOverdue = (d) => d ? new Date(d) < new Date() : false
const formatDate = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '-'

// caricamento dati
onMounted(async () => {
  await fetchUserMe()
  await Promise.all([
    fetchUserCounts(),
    fetchLibraries(),
    fetchIncomingRequests(),
    fetchActiveLoans(),
    fetchAcceptedLoans()
  ])
})

// chiamate api conteggi
async function fetchUserCounts() {
  try {
    const [books, loansIn, loansOut] = await Promise.all([
      apiClient.get("/users/me/books/count"),
      apiClient.get("/loan/total/in"),
      apiClient.get("/loan/total/out")
    ])
    myTotalBooks.value = books
    totalLoansIn.value = loansIn
    totalLoansOut.value = loansOut
  } catch (e) {}
}

// chiamate api liste
async function fetchUserMe() { try { userData.value = await apiClient.get("/users/me") } catch (e) {} }
async function fetchLibraries() {
  isLoadingLibs.value = true
  try {
    const res = await apiClient.get("/users/me/libraries")
    libraries.value = res.libraries.map(l => ({ ...l, isOpen: false, books: [], isLoadingBooks: false, bookCount: l.count || 0 }))
  } finally { isLoadingLibs.value = false }
}
async function fetchIncomingRequests() { try { pendingRequests.value = await apiClient.get("/loan/requests/incoming") || [] } catch (e) {} }
async function fetchActiveLoans() { try { activeLoans.value = await apiClient.get("/loan/active") || []; activeLoansCount.value = activeLoans.value.length } catch (e) {} }
async function fetchAcceptedLoans() { try { const all = await apiClient.get("/loan/all"); acceptedLoans.value = all.filter(l => l.status === 'ACCEPTED') } catch (e) {} }

// gestione modale
function openManageModal(req) {
  selectedRequest.value = req
  isContactMode.value = false
  Object.assign(modalForm, { action: '', notes: '', selectedDays: [], selectedSlots: [] })
  isManageModalOpen.value = true
}

function openContactModal(loan) {
  selectedRequest.value = loan
  isContactMode.value = true
  modalForm.action = 'CONTACT'
  Object.assign(modalForm, { notes: '', selectedDays: [], selectedSlots: [] })
  isManageModalOpen.value = true
}

async function handleModalSubmit() {
  if (isContactMode.value) await submitContact()
  else await submitLoanManagement()
}

async function submitContact() {
  try {
    await apiClient.post(`/loan/${selectedRequest.value.id}/contact`, {
      notes: modalForm.notes,
      days: modalForm.selectedDays.join(', '),
      slots: modalForm.selectedSlots.join(', ')
    })
    isManageModalOpen.value = false
  } catch (e) {}
}

async function submitLoanManagement() {
  try {
    await apiClient.patch(`/loan/${selectedRequest.value.id}/status`, {
      action: modalForm.action,
      notes: modalForm.notes,
      days: modalForm.selectedDays.join(', '),
      slots: modalForm.selectedSlots.join(', ')
    })
    await Promise.all([fetchIncomingRequests(), fetchAcceptedLoans()])
    isManageModalOpen.value = false
  } catch (e) {}
}

// azioni prestiti
async function confirmExchange(id) {
  try { await apiClient.post(`/loan/${id}/start`); await Promise.all([fetchAcceptedLoans(), fetchActiveLoans()]) } catch (e) {}
}

async function returnBook(id) {
  try { await apiClient.post(`/loan/${id}/return`, { condition: 'ottimo' }); await fetchActiveLoans() } catch (e) {}
}

async function extendLoan(id) {
  try { await apiClient.patch(`/loan/${id}/status`, { action: 'EXTEND' }); await fetchActiveLoans() } catch (e) {}
}

// accordion
async function toggleLibrary(id) {
  const lib = libraries.value.find(l => l.id === id); if (!lib) return; lib.isOpen = !lib.isOpen
  if (lib.isOpen && !lib.books.length) { 
    lib.isLoadingBooks = true
    try { const res = await apiClient.get(`/libraries/${id}`); lib.books = res.books || []; lib.bookCount = lib.books.length } 
    finally { lib.isLoadingBooks = false } 
  }
}

function openDeleteModal(type, data) {
  confirmModal.value = {
    show: true,
    type,
    target: data,
    title: type === "library" ? "elimina libreria" : "elimina libro",
    message:
      type === "library"
        ? `vuoi eliminare la libreria "${data.name}"?`
        : `vuoi rimuovere "${data.book.title}"?`,
  };
}

async function moveBook({ bookId, toLibraryId }) { try { await apiClient.patch(`/books/${bookId}/move`, { libraryId: toLibraryId }); await fetchLibraries() } catch (e) {} }

function toggleDay(d) { const i = modalForm.selectedDays.indexOf(d); i === -1 ? modalForm.selectedDays.push(d) : modalForm.selectedDays.splice(i, 1) }
function toggleSlot(s) { const i = modalForm.selectedSlots.indexOf(s); i === -1 ? modalForm.selectedSlots.push(s) : modalForm.selectedSlots.splice(i, 1) }
</script>