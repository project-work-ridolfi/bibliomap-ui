<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main font-sans">
    
    <div v-if="overdueLoans.length > 0" class="bg-red-100 dark:bg-red-900/20 border-2 border-red-500 p-6 rounded-2xl animate-pulse">
      <h3 class="text-red-700 dark:text-red-400 font-black flex items-center gap-2 uppercase tracking-tighter">
        <i class="fa-solid fa-triangle-exclamation"></i> attenzione prestiti scaduti
      </h3>
      <div class="mt-4 space-y-3">
        <div v-for="loan in overdueLoans" :key="loan.id" class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <div>
            <p class="text-sm font-bold text-red-800 dark:text-red-300 lowercase">devi restituire {{ loan.title }}</p>
            <p class="text-xs text-red-600 dark:text-red-400 lowercase">scaduto il {{ formatDate(loan.expectedReturnDate) }}</p>
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
        <div v-if="isStatsOpen" class="px-6 pb-6 border-t border-thistle pt-6 animate-fade-in">
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
          <h3 class="text-lg font-bold text-theme-main mb-2 lowercase">la tua posizione</h3>
          <div v-if="userData" class="flex flex-col gap-3">
             <div class="h-32 rounded-xl overflow-hidden border border-thistle bg-[var(--bg-secondary)]">
                <MiniMap v-if="userData.latitude" :lat="userData.latitude" :lng="userData.longitude" :zoom="12" />
                <div v-else class="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)] text-[10px] opacity-50 lowercase p-4 text-center">posizione non impostata</div>
             </div>
             <p class="text-[10px] uppercase font-black tracking-widest opacity-60">Visibilità: {{ formatVisibility(userData.visibility) }}</p>
          </div>
        </div>
        <router-link to="/profile" class="text-center text-sm text-[var(--zomp)] font-bold hover:underline border-t border-[var(--thistle)] pt-3 mt-4 lowercase">impostazioni profilo <i class="fa-solid fa-arrow-right ml-1"></i></router-link>
      </div>
    </div>

    <div v-if="pendingRequests.length > 0" class="bg-[var(--tea-rose)]/20 border-l-4 border-[var(--tea-rose)] p-4 rounded-r-xl">
      <h3 class="font-bold text-theme-main mb-3 flex items-center font-display lowercase">
        <i class="fa-solid fa-bell mr-2 text-[var(--tea-rose)]"></i> nuove richieste ({{ pendingRequests.length }})
      </h3>
      <div class="space-y-2">
        <div v-for="req in pendingRequests" :key="req.id" class="flex justify-between items-center bg-theme-primary p-3 rounded-lg shadow-sm border border-[var(--thistle)]/50">
          <div class="text-sm">
            <span class="font-bold text-theme-main lowercase">{{ req.requesterUsername }}</span> chiede <span class="italic text-[var(--zomp)]">{{ req.title }}</span>
          </div>
          <button @click="openManageModal(req)" class="bg-[var(--zomp)] text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition lowercase">gestisci</button>
        </div>
      </div>
    </div>

    <div v-if="acceptedLoans.length > 0" class="bg-[var(--zomp)]/10 border-l-4 border-[var(--zomp)] p-4 rounded-r-xl space-y-3">
      <h3 class="font-bold text-theme-main flex items-center font-display lowercase">
        <i class="fa-solid fa-handshake mr-2 text-[var(--zomp)]"></i> scambi da confermare ({{ acceptedLoans.length }})
      </h3>
      <div class="space-y-2">
        <div v-for="loan in acceptedLoans" :key="loan.id" class="flex justify-between items-center bg-theme-primary p-3 rounded-lg shadow-sm border border-[var(--thistle)]/50">
          <div class="text-sm">
            <template v-if="loan.ownerId === userData?.id">consegna <span class="italic font-bold">{{ loan.title }}</span> a <span class="text-[var(--zomp)]">{{ loan.requesterUsername }}</span></template>
            <template v-else>ricevi <span class="italic font-bold">{{ loan.title }}</span> da <span class="text-[var(--zomp)]">{{ loan.ownerUsername }}</span></template>
          </div>
          <button v-if="loan.ownerId === userData?.id" @click="confirmExchange(loan.id)" class="bg-[var(--zomp)] text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:opacity-90 transition lowercase">conferma consegna</button>
          <span v-else class="text-[10px] italic opacity-60">in attesa di consegna dal proprietario</span>
        </div>
      </div>
    </div>

    <hr class="border-[var(--thistle)]" />

    <div class="space-y-4">
      <div class="flex justify-between items-center border-b border-[var(--thistle)] pb-2">
        <h3 class="text-xl font-display text-theme-main lowercase">libri che sto leggendo</h3>
        <div v-if="borrowedBooks.length > 3" class="flex gap-2">
          <button @click="prevBorrowed" :disabled="borrowedIndex === 0" class="p-1 disabled:opacity-30 hover:text-[var(--zomp)] transition"><i class="fa-solid fa-chevron-left"></i></button>
          <button @click="nextBorrowed" :disabled="borrowedIndex >= borrowedBooks.length - 3" class="p-1 disabled:opacity-30 hover:text-[var(--zomp)] transition"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
      <div v-if="borrowedBooks.length === 0" class="text-sm opacity-50 italic py-4">nessun libro ricevuto in prestito</div>
      <div v-else class="relative overflow-hidden">
        <div class="flex transition-transform duration-500 ease-in-out gap-4" :style="{ transform: `translateX(-${borrowedIndex * (100 / 3 + 0.5)}%)` }">
          <div v-for="loan in borrowedBooks" :key="loan.id" class="w-full md:w-[calc(33.333%-11px)] shrink-0 bg-theme-primary p-5 rounded-xl shadow-sm border border-[var(--thistle)]/40 flex flex-col justify-between h-full min-h-[160px]">
            <div>
              <h4 class="font-bold text-[var(--zomp)] text-lg leading-tight">{{ loan.title }}</h4>
              <p class="text-xs opacity-60 lowercase mt-1">da: {{ loan.ownerUsername }}</p>
            </div>
            <div class="mt-6 flex justify-between items-end border-t border-thistle pt-4">
              <div>
                <p class="text-[9px] uppercase font-black opacity-30 tracking-widest">scadenza</p>
                <p class="text-sm font-mono" :class="isOverdue(loan.expectedReturnDate) ? 'text-red-500 font-bold' : ''">{{ formatDate(loan.expectedReturnDate) }}</p>
              </div>
              <button @click="openContactModal(loan)" class="text-[10px] font-bold border border-thistle px-3 py-2 rounded-lg hover:bg-ash-gray/20 transition">contatta</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex justify-between items-center border-b border-[var(--thistle)] pb-2">
        <h3 class="text-xl font-display text-theme-main lowercase">libri che ho prestato</h3>
        <div v-if="lentBooks.length > 3" class="flex gap-2">
          <button @click="prevLent" :disabled="lentIndex === 0" class="p-1 disabled:opacity-30 hover:text-[var(--zomp)] transition"><i class="fa-solid fa-chevron-left"></i></button>
          <button @click="nextLent" :disabled="lentIndex >= lentBooks.length - 3" class="p-1 disabled:opacity-30 hover:text-[var(--zomp)] transition"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
      <div v-if="lentBooks.length === 0" class="text-sm opacity-50 italic py-4">non hai prestato alcun libro</div>
      <div v-else class="relative overflow-hidden">
        <div class="flex transition-transform duration-500 ease-in-out gap-4" :style="{ transform: `translateX(-${lentIndex * (100 / 3 + 0.5)}%)` }">
          <div v-for="loan in lentBooks" :key="loan.id" class="w-full md:w-[calc(33.333%-11px)] shrink-0 bg-theme-primary p-5 rounded-xl shadow-sm border border-[var(--thistle)]/40 flex flex-col justify-between h-full min-h-[220px]">
            <div class="flex justify-between items-start">
              <div class="min-w-0">
                <h4 class="font-bold text-theme-main text-lg leading-tight truncate">{{ loan.title }}</h4>
                <p class="text-xs opacity-60 lowercase mt-1">a: {{ loan.requesterUsername }}</p>
              </div>
              <div class="text-right shrink-0 ml-2">
                <p class="text-[9px] uppercase font-black opacity-30 tracking-widest">rientro</p>
                <p class="text-sm font-mono">{{ formatDate(loan.expectedReturnDate) }}</p>
              </div>
            </div>
            <div class="mt-6 flex flex-col gap-2 border-t border-thistle pt-4">
              <button @click="openReturnModal(loan)" class="w-full bg-[var(--zomp)] text-white py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md">segnala come restituito</button>
              <button @click="openExtendModal(loan)" class="w-full bg-theme-primary border border-thistle text-theme-main py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider">allunga prestito</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div class="flex justify-between items-end mb-6">
        <h2 class="text-2xl font-display text-theme-main lowercase">le mie librerie</h2>
        <router-link to="/library" class="text-sm text-[var(--zomp)] font-bold hover:underline lowercase">crea nuova</router-link>
      </div>
      <div v-if="isLoadingLibs" class="text-center py-10 opacity-60"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-zomp"></i></div>
      <div v-else class="space-y-2">
        <LibraryAccordion v-for="lib in libraries" :key="lib.id" :library="lib" @toggle="toggleLibrary(lib.id)" @bookMoved="moveBook" @delete-library="handleOpenDeleteUI('library', $event)" @delete-book="handleOpenDeleteUI('book', $event.book)" />
      </div>
    </div>

    <AppModal :isOpen="confirmModal.show" :title="deleteModalTitle" @close="confirmModal.show = false">
      <div class="p-6 text-center space-y-4 text-theme-main">
        <template v-if="confirmModal.step === 'confirm'">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2"><i class="fa-solid fa-triangle-exclamation text-3xl"></i></div>
          <p class="text-lg font-medium">{{ confirmModal.message }}</p>
          <p class="text-sm opacity-70 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]"><i class="fa-solid fa-circle-info mr-1"></i>Azione <strong>irreversibile</strong>.</p>
          <div class="flex gap-3 pt-4">
            <button @click="confirmModal.show = false" class="flex-1 py-3 border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-secondary)] font-bold transition">Annulla</button>
            <button @click="handleExecuteDelete" class="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold shadow-md hover:bg-red-700 transition">{{ confirmModal.confirmBtn }}</button>
          </div>
        </template>
        <template v-else-if="confirmModal.step === 'loading'"><i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500 mb-4 py-8"></i><p class="font-bold">Cancellazione in corso...</p></template>
        <template v-else-if="confirmModal.step === 'success'">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-zomp mx-auto mb-2 animate-bounce"><i class="fa-solid fa-check text-3xl"></i></div>
          <h3 class="text-xl font-bold">Completato!</h3>
          <p class="text-sm opacity-70">{{ confirmModal.successMsg }}</p>
          <button @click="confirmModal.show = false" class="w-full mt-4 px-4 py-3 bg-zomp text-white rounded-xl font-bold transition">Chiudi</button>
        </template>
      </div>
    </AppModal>

    <AppModal :is-open="isManageModalOpen" :title="modalTitle" @close="isManageModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main">
        <div v-if="!isContactMode" class="flex gap-4">
          <button @click="modalForm.action = 'ACCEPT'" :class="modalForm.action === 'ACCEPT' ? 'bg-[var(--zomp)] text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800'" class="flex-1 py-3 rounded-xl font-bold transition">accetta</button>
          <button @click="modalForm.action = 'REJECT'" :class="modalForm.action === 'REJECT' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800'" class="flex-1 py-3 rounded-xl font-bold transition">rifiuta</button>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase opacity-40 tracking-widest">messaggio per l'utente</label>
          <textarea v-model="modalForm.notes" class="w-full p-3 bg-theme-primary border border-[var(--thistle)] rounded-xl outline-none text-sm" rows="3"></textarea>
        </div>
        <div v-if="modalForm.action === 'ACCEPT' || isContactMode" class="space-y-4">
          <label class="text-[10px] font-black uppercase opacity-40 tracking-widest">proponi disponibilità per lo scambio</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="day in days" :key="day" @click="toggleDay(day)" :class="modalForm.selectedDays.includes(day) ? 'bg-[var(--tea-rose)] text-theme-main border-[var(--tea-rose)]' : 'border-gray-200 dark:border-gray-700'" class="px-3 py-1 border rounded-full text-[10px] font-bold lowercase transition">{{ day }}</button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="slot in timeSlots" :key="slot" @click="toggleSlot(slot)" :class="modalForm.selectedSlots.includes(slot) ? 'bg-[var(--tea-rose)] text-theme-main border-[var(--tea-rose)]' : 'border-gray-200 dark:border-gray-700'" class="p-2 border rounded-lg text-[10px] font-bold lowercase text-left transition">{{ slot }}</button>
          </div>
        </div>
        <button @click="handleModalSubmit" :disabled="!isContactMode && !modalForm.action" class="w-full bg-[var(--paynes-gray)] text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-30">{{ isContactMode ? 'invia messaggio' : 'invia risposta' }}</button>
      </div>
    </AppModal>

    <AppModal :is-open="isReturnModalOpen" title="conferma restituzione" @close="isReturnModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main">
        <p class="text-sm">Il libro è tornato? Aggiorna la condizione attuale della copia.</p>
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase opacity-40 tracking-widest">condizione attuale</label>
          <select v-model="returnForm.condition" class="w-full p-3 bg-theme-primary border border-[var(--thistle)] rounded-xl outline-none text-sm text-theme-main">
            <option v-for="opt in conditionOptions" :key="opt.en" :value="opt.en">{{ opt.it }}</option>
          </select>
        </div>
        <button @click="confirmReturn" class="w-full bg-[var(--zomp)] text-white py-4 rounded-xl font-bold shadow-lg">conferma rientro</button>
      </div>
    </AppModal>

    <AppModal :is-open="isExtendModalOpen" title="allunga prestito" @close="isExtendModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main">
        <p class="text-sm">Di quanti giorni vuoi estendere il prestito?</p>
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase opacity-40 tracking-widest">giorni da aggiungere</label>
          <select v-model.number="extendForm.days" class="w-full p-3 bg-theme-primary border border-[var(--thistle)] rounded-xl outline-none text-sm text-theme-main">
            <option :value="3">3 giorni</option><option :value="7">1 settimana</option><option :value="14">2 settimane</option><option :value="30">1 mese</option>
          </select>
        </div>
        <button @click="confirmExtension" class="w-full bg-[var(--paynes-gray)] text-white py-4 rounded-xl font-bold shadow-lg">conferma estensione</button>
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
import MiniMap from "@/components/MiniMap.vue"
import { deleteConfig, executeDeletion } from "@/utils/helpers"

// Stato Dati
const userData = ref(null);
const isStatsOpen = ref(false);
const myTotalBooks = ref(0);
const totalLoansIn = ref(0);
const totalLoansOut = ref(0);
const activeLoans = ref([]);
const pendingRequests = ref([]);
const acceptedLoans = ref([]);
const isLoadingLibs = ref(true);
const libraries = ref([]);

// Indici Carousel
const borrowedIndex = ref(0);
const lentIndex = ref(0);

const conditionOptions = [
    { it: 'Nuovo', en: 'NEW' }, { it: 'Ottimo', en: 'GREAT' }, { it: 'Buono', en: 'GOOD' }, { it: 'Usurato', en: 'WORN' }, { it: 'Rovinato', en: 'DAMAGED' }
]

const days = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']
const timeSlots = ['mattina 08-12', 'pranzo 12-14', 'pomeriggio 14-18', 'sera 18-20']

const isManageModalOpen = ref(false);
const isContactMode = ref(false);
const isReturnModalOpen = ref(false);
const isExtendModalOpen = ref(false);
const selectedRequest = ref(null);
const selectedLoan = ref(null);

const confirmModal = reactive({ show: false, step: 'confirm', type: '', id: null, title: '', message: '', confirmBtn: '', successMsg: '' });
const modalForm = reactive({ action: '', notes: '', selectedDays: [], selectedSlots: [] });
const returnForm = reactive({ condition: 'GREAT' });
const extendForm = reactive({ days: 7 });

const modalTitle = computed(() => isContactMode.value ? "contatta utente" : "gestione richiesta");
const deleteModalTitle = computed(() => confirmModal.step === 'loading' ? 'Attendere...' : confirmModal.step === 'success' ? 'Completato' : confirmModal.title);
const statCards = computed(() => [
  { label: 'i tuoi libri', value: myTotalBooks.value, color: 'text-theme-main' },
  { label: 'ricevuti', value: totalLoansIn.value, color: 'text-[var(--zomp)]' },
  { label: 'prestati', value: totalLoansOut.value, color: 'text-[var(--paynes-gray)]' }
]);

const borrowedBooks = computed(() => activeLoans.value.filter(l => l.requesterId === userData.value?.id && l.status === 'ON_LOAN'));
const lentBooks = computed(() => activeLoans.value.filter(l => l.ownerId === userData.value?.id && l.status === 'ON_LOAN'));
const overdueLoans = computed(() => borrowedBooks.value.filter(l => isOverdue(l.expectedReturnDate)));

// Carousel Handlers
function nextBorrowed() { if (borrowedIndex.value < borrowedBooks.value.length - 3) borrowedIndex.value++ }
function prevBorrowed() { if (borrowedIndex.value > 0) borrowedIndex.value-- }
function nextLent() { if (lentIndex.value < lentBooks.value.length - 3) lentIndex.value++ }
function prevLent() { if (lentIndex.value > 0) lentIndex.value-- }

const isOverdue = (d) => d ? new Date(d) < new Date() : false;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '-';
const formatVisibility = (v) => {
  const map = { 'all': 'Tutti', 'logged_in': 'Utenti registrati', 'private': 'Privato' };
  return map[v] || 'Standard';
};

onMounted(async () => {
  await fetchUserMe();
  await Promise.all([fetchUserCounts(), fetchLibraries(), fetchIncomingRequests(), fetchActiveLoans(), fetchAcceptedLoans()]);
});

async function fetchUserCounts() {
  if (!userData.value?.id) return;
  try {
    const stats = await apiClient.get(`/stats/user/${userData.value.id}`);
    myTotalBooks.value = stats.myBooks || 0;
    totalLoansIn.value = stats.loansIn || 0;
    totalLoansOut.value = stats.loansOut || 0;
  } catch (e) {}
}

async function fetchUserMe() { try { userData.value = await apiClient.get("/users/me") } catch (e) {} }
async function fetchLibraries() {
  isLoadingLibs.value = true;
  try {
    const res = await apiClient.get("/users/me/libraries");
    libraries.value = res.libraries.map(l => ({ ...l, isOpen: false, books: [], isLoadingBooks: false }));
  } finally { isLoadingLibs.value = false; }
}
async function fetchIncomingRequests() { try { pendingRequests.value = await apiClient.get("/loan/requests/incoming") || [] } catch (e) {} }
async function fetchActiveLoans() { try { activeLoans.value = await apiClient.get("/loan/active") || [] } catch (e) {} }
async function fetchAcceptedLoans() { try { const all = await apiClient.get("/loan/all"); acceptedLoans.value = all.filter(l => l.status === 'ACCEPTED') } catch (e) {} }

function openManageModal(req) { selectedRequest.value = req; isContactMode.value = false; modalForm.action = ''; modalForm.notes = ''; modalForm.selectedDays = []; modalForm.selectedSlots = []; isManageModalOpen.value = true; }
function openContactModal(loan) { selectedRequest.value = loan; isContactMode.value = true; modalForm.notes = ''; modalForm.selectedDays = []; modalForm.selectedSlots = []; isManageModalOpen.value = true; }
function openReturnModal(loan) { selectedLoan.value = loan; isReturnModalOpen.value = true; }
function openExtendModal(loan) { selectedLoan.value = loan; extendForm.days = 7; isExtendModalOpen.value = true; }

async function handleModalSubmit() {
  const payload = { notes: modalForm.notes, days: modalForm.selectedDays.join(', '), slots: modalForm.selectedSlots.join(', ') };
  if (isContactMode.value) { await apiClient.post(`/loan/${selectedRequest.value.id}/contact`, payload); }
  else { await apiClient.patch(`/loan/${selectedRequest.value.id}/status`, { ...payload, action: modalForm.action }); await fetchIncomingRequests(); await fetchAcceptedLoans(); }
  isManageModalOpen.value = false;
}

async function confirmExchange(id) { await apiClient.post(`/loan/${id}/start`); await Promise.all([fetchAcceptedLoans(), fetchActiveLoans(), fetchUserCounts()]); }
async function confirmReturn() { await apiClient.post(`/loan/${selectedLoan.value.id}/return`, { condition: returnForm.condition }); isReturnModalOpen.value = false; await Promise.all([fetchActiveLoans(), fetchUserCounts()]); }
async function confirmExtension() { await apiClient.patch(`/loan/${selectedLoan.value.id}/extend`, { days: extendForm.days }); isExtendModalOpen.value = false; await fetchActiveLoans(); }

async function toggleLibrary(id) {
  const lib = libraries.value.find(l => l.id === id); if (!lib) return; lib.isOpen = !lib.isOpen;
  if (lib.isOpen && !lib.books.length) { lib.isLoadingBooks = true; const res = await apiClient.get(`/libraries/${id}`); lib.books = res.books || []; lib.isLoadingBooks = false; }
}
async function moveBook({ bookId, toLibraryId }) { await apiClient.patch(`/copies/${bookId}/move`, { libraryId: toLibraryId }); await fetchLibraries(); }

function handleOpenDeleteUI(type, data) {
  confirmModal.type = type; confirmModal.id = data.id;
  const config = deleteConfig[type]; const displayName = type === 'library' ? data.name : data.title;
  confirmModal.title = config.title; confirmModal.message = config.message(displayName); confirmModal.confirmBtn = config.confirmBtn; confirmModal.successMsg = config.successMsg;
  confirmModal.step = 'confirm'; confirmModal.show = true;
}

async function handleExecuteDelete() {
  confirmModal.step = 'loading';
  const res = await executeDeletion(confirmModal.type, confirmModal.id);
  if (res.success) {
    confirmModal.step = 'success';
    if (confirmModal.type === 'library') await fetchLibraries();
    else { const openLib = libraries.value.find(l => l.isOpen); if (openLib) { const res = await apiClient.get(`/libraries/${openLib.id}`); openLib.books = res.books || [] } }
    await fetchUserCounts();
  } else { confirmModal.show = false; alert(res.error); }
}

function toggleDay(d) { const i = modalForm.selectedDays.indexOf(d); i === -1 ? modalForm.selectedDays.push(d) : modalForm.selectedDays.splice(i, 1) }
function toggleSlot(s) { const i = modalForm.selectedSlots.indexOf(s); i === -1 ? modalForm.selectedSlots.push(s) : modalForm.selectedSlots.splice(i, 1) }
</script>

<style scoped> .font-display { font-family: "Mochiy Pop P One", cursive; } </style>