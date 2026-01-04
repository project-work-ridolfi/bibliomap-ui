<template>
  <div
    class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main font-sans">
    <div
      v-if="overdueLoans.length > 0"
      class="bg-red-100 dark:bg-red-900/20 border-2 border-red-500 p-6 rounded-2xl animate-pulse">
      <h3
        class="text-red-700 dark:text-red-400 font-black flex items-center gap-2 tracking-tighter">
        <i class="fa-solid fa-triangle-exclamation"></i> azioni urgenti
        richieste
      </h3>
      <div class="mt-4 space-y-3">
        <div
          v-for="loan in overdueLoans"
          :key="loan.id"
          class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
          <p class="text-sm font-bold text-red-800 dark:text-red-300">
            devi restituire
            <router-link
              :to="`/books/${loan.copyId}`"
              class="italic hover:underline"
              >{{ loan.title }}</router-link
            >
            (scaduto il {{ formatDate(loan.expectedReturnDate) }})
          </p>
          <button
            @click="openContactModal(loan)"
            class="mt-3 md:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-700 transition">
            contatta proprietario
          </button>
        </div>
      </div>
    </div>

    <div
      class="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-thistle pb-6">
      <div>
        <h1 class="text-5xl font-display text-theme-main">
          Centro <span class="text-zomp">operativo</span>
        </h1>
        <p class="opacity-60 text-sm">
          Gestisci i tuoi scambi e le tue letture in corso
        </p>
      </div>
      <div class="flex gap-3">
        <router-link
          to="/add-book"
          class="bg-zomp text-white px-5 py-2.5 rounded-xl font-bold text-[10px] shadow-md hover:opacity-90 transition flex items-center gap-2">
          <i class="fa-solid fa-plus"></i> nuovo libro
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3 space-y-10">
        <section
          v-if="pendingRequests.length > 0"
          class="bg-tea-rose/10 border-l-4 border-tea-rose p-6 rounded-r-2xl space-y-4">
          <h3
            class="font-display text-m text-theme-main flex items-center gap-2">
            <i class="fa-solid fa-bell text-tea-rose"></i> Nuove richieste di
            prestito:
          </h3>
          <div class="space-y-3">
            <div
              v-for="req in pendingRequests"
              :key="req.id"
              class="flex justify-between items-center bg-theme-primary p-4 rounded-xl shadow-sm border border-thistle">
              <p class="text-sm">
                <router-link
                  :to="`/profile/${req.requesterId}`"
                  class="font-bold hover:text-zomp"
                  >{{ req.requesterUsername }}</router-link
                >
                vorrebbe leggere
                <router-link
                  :to="`/books/${req.copyId}`"
                  class="italic text-zomp hover:underline"
                  >{{ req.title }}</router-link
                >
              </p>
              <button
                @click="openManageModal(req)"
                class="bg-zomp text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">
                gestisci
              </button>
            </div>
          </div>
        </section>

        <section
          v-if="acceptedLoans.length > 0"
          class="bg-zomp/10 border-l-4 border-zomp p-6 rounded-r-2xl space-y-4">
          <h3
            class="font-display text-m text-theme-main flex items-center gap-2">
            <i class="fa-solid fa-handshake text-zomp"></i> Scambi da
            confermare:
          </h3>
          <div class="space-y-3">
            <div
              v-for="loan in acceptedLoans"
              :key="loan.id"
              class="flex justify-between items-center bg-theme-primary p-4 rounded-xl shadow-sm border border-thistle">
              <p class="text-sm">
                <template v-if="loan.ownerId === userData?.id"
                  >Conferma la consegna di
                  <router-link
                    :to="`/books/${loan.copyId}`"
                    class="font-bold hover:text-zomp"
                    >{{ loan.title }}</router-link
                  >
                  a
                  <router-link
                    :to="`/profile/${loan.requesterId}`"
                    class="text-zomp hover:underline"
                    >{{ loan.requesterUsername }}</router-link
                  >
                </template>
                <template v-else
                  >Hai ricevuto
                  <router-link
                    :to="`/books/${loan.copyId}`"
                    class="font-bold hover:text-zomp"
                    >{{ loan.title }}</router-link
                  >
                  da
                  <router-link
                    :to="`/profile/${loan.ownerId}`"
                    class="text-zomp hover:underline"
                    >{{ loan.ownerUsername }}</router-link
                  >
                </template>
              </p>
              <button
                @click="confirmExchange(loan.id)"
                class="bg-zomp text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase">
                conferma
              </button>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <div
            class="flex justify-between items-center border-b border-thistle pb-2">
            <h3 class="text-xl font-display text-theme-main">Stai leggendo:</h3>
            <div v-if="borrowedBooks.length > 3" class="flex gap-2">
              <button
                @click="prevBorrowed"
                :disabled="borrowedIndex === 0"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                @click="nextBorrowed"
                :disabled="borrowedIndex >= borrowedBooks.length - 3"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div
            v-if="borrowedBooks.length === 0"
            class="text-sm opacity-40 italic py-4">
            nessun prestito attivo in entrata
          </div>
          <div v-else class="relative overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-in-out gap-4"
              :style="{
                transform: `translateX(-${borrowedIndex * (100 / 3 + 0.5)}%)`,
              }">
              <div
                v-for="loan in borrowedBooks"
                :key="loan.id"
                class="w-full md:w-[calc(33.333%-11px)] shrink-0 bg-theme-primary p-5 rounded-xl shadow-sm border border-thistle flex flex-col justify-between min-h-[160px]">
                <div>
                  <router-link :to="`/books/${loan.copyId}`" class="block">
                    <h4
                      class="font-bold text-zomp text-lg leading-tight truncate hover:underline">
                    </h4>
                  </router-link>
                  <p class="text-[10px] opacity-60">
                    Proprietario:
                  </p>
                </div>
                <div
                  class="mt-4 flex justify-between items-end pt-3 border-t border-thistle/50">
                  <div class="min-w-0">
                    <p class="text-[8px] font-black opacity-40">scadenza</p>
                    <p
                      class="text-xs font-mono"
                      :class="
                        isOverdue(loan.expectedReturnDate)
                          ? 'text-red-500 font-bold'
                          : ''
                      ">
                      {{ formatDate(loan.expectedReturnDate) }}
                    </p>
                  </div>
                  <button
                    @click="openContactModal(loan)"
                    class="text-[9px] font-bold border border-thistle px-2 py-1.5 rounded-lg hover:bg-ash-gray/20">
                    contatta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <div
            class="flex justify-between items-center border-b border-thistle pb-2">
            <h3 class="text-xl font-display text-theme-main">Hai prestato:</h3>
            <div v-if="lentBooks.length > 3" class="flex gap-2">
              <button
                @click="prevLent"
                :disabled="lentIndex === 0"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button
                @click="nextLent"
                :disabled="lentIndex >= lentBooks.length - 3"
                class="p-1 disabled:opacity-20 hover:text-zomp transition">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div
            v-if="lentBooks.length === 0"
            class="text-sm opacity-40 italic py-4">
            non hai libri attualmente in prestito ad altri
          </div>
          <div v-else class="relative overflow-hidden">
            <div
              class="flex transition-transform duration-500 ease-in-out gap-4"
              :style="{
                transform: `translateX(-${lentIndex * (100 / 3 + 0.5)}%)`,
              }">
              <div
                v-for="loan in lentBooks"
                :key="loan.id"
                class="w-full md:w-[calc(33.333%-11px)] shrink-0 bg-theme-primary p-5 rounded-xl shadow-sm border border-thistle flex flex-col justify-between min-h-[160px]">
                <div>
                  <h4
                    class="font-bold text-theme-main text-lg leading-tight truncate">
                    {{ loan.title }}
                  </h4>
                  <p class="text-[10px] opacity-60">
                    Lettore: {{ loan.requesterUsername }}
                      class="hover:text-zomp"
                      >{{ loan.requesterUsername }}</router-link
                    >
                  </p>
                </div>
                <div
                  class="mt-4 flex flex-col gap-2 pt-3 border-t border-thistle/50">
                  <button
                    @click="openReturnModal(loan)"
                    class="w-full bg-zomp text-white py-2 rounded-lg font-bold text-[9px] tracking-wider shadow-sm">
                    segnala rientro
                  </button>
                  <button
                    @click="openExtendModal(loan)"
                    class="w-full border border-thistle text-theme-main py-2 rounded-lg font-bold text-[9px] opacity-70">
                    allunga scadenza
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside class="lg:col-span-1 space-y-6">
        <section
          class="bg-theme-primary p-6 rounded-2xl shadow-md border border-thistle space-y-6">
          <h3
            class="font-display text-s text-zomp tracking-widest border-b border-thistle pb-2">
            Navigazione
          </h3>
          <nav class="flex flex-col gap-3">
            <router-link :to="`/profile/${userData?.id}`" class="nav-link">
              <i class="fa-solid fa-id-card"></i> Il tuo profilo
            </router-link>
            <router-link to="/libraries" class="nav-link">
              <i class="fa-solid fa-book-bookmark"></i> Le tue librerie
            </router-link>
            <router-link to="/stats" class="nav-link">
              <i class="fa-solid fa-chart-pie"></i> Tutte le statistiche
            </router-link>
            <router-link to="/map" class="nav-link">
              <i class="fa-solid fa-map-location-dot"></i> Esplora la mappa
            </router-link>
          </nav>
        </section>

        <section
          v-if="userData"
          class="p-5 bg-ash-gray/10 rounded-2xl border border-dashed border-thistle">
          <p class="text-[9px] font-black opacity-40 mb-2">Privacy Corrente</p>
          <p class="text-xs font-bold text-theme-main">
            Visibilità:
            <span class="text-zomp">{{
              formatVisibility(userData.visibility)
            }}</span>
          </p>
          <p class="text-[10px] opacity-60 mt-1 leading-tight">
            Puoi cambiare chi vede la tua posizione nelle impostazioni del
            profilo.
          </p>
        </section>
      </aside>
    </div>

    <AppModal
      :is-open="isManageModalOpen"
      :title="modalTitle"
      @close="isManageModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main">
        <div v-if="!isContactMode" class="flex gap-4">
          <button
            @click="modalForm.action = 'ACCEPT'"
            :class="
              modalForm.action === 'ACCEPT'
                ? 'bg-[var(--zomp)] text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800'
            "
            class="flex-1 py-3 rounded-xl font-bold transition">
            accetta
          </button>
          <button
            @click="modalForm.action = 'REJECT'"
            :class="
              modalForm.action === 'REJECT'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800'
            "
            class="flex-1 py-3 rounded-xl font-bold transition">
            rifiuta
          </button>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-black opacity-40 tracking-widest"
            >messaggio per l'utente</label
          >
          <textarea
            v-model="modalForm.notes"
            class="w-full p-3 bg-theme-primary border border-[var(--thistle)] rounded-xl outline-none text-sm"
            rows="3"></textarea>
        </div>
        <div
          v-if="modalForm.action === 'ACCEPT' || isContactMode"
          class="space-y-4">
          <label class="text-[10px] font-black opacity-40 tracking-widest"
            >proponi disponibilità per lo scambio</label
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in days"
              :key="day"
              @click="toggleDay(day)"
              :class="
                modalForm.selectedDays.includes(day)
                  ? 'bg-[var(--tea-rose)] text-theme-main border-[var(--tea-rose)]'
                  : 'border-gray-200 dark:border-gray-700'
              "
              class="px-3 py-1 border rounded-full text-[10px] font-bold transition">
              {{ day }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="slot in timeSlots"
              :key="slot"
              @click="toggleSlot(slot)"
              :class="
                modalForm.selectedSlots.includes(slot)
                  ? 'bg-[var(--tea-rose)] text-theme-main border-[var(--tea-rose)]'
                  : 'border-gray-200 dark:border-gray-700'
              "
              class="p-2 border rounded-lg text-[10px] font-bold text-left transition">
              {{ slot }}
            </button>
          </div>
        </div>
        <button
          @click="handleModalSubmit"
          :disabled="!isContactMode && !modalForm.action"
          class="w-full bg-[var(--paynes-gray)] text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-30">
          {{ isContactMode ? "invia messaggio" : "invia risposta" }}
        </button>
      </div>
    </AppModal>

    <AppModal
      :is-open="isReturnModalOpen"
      title="conferma restituzione"
      @close="isReturnModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main">
        <p class="text-sm">
          Il libro è tornato? Aggiorna la condizione attuale della copia.
        </p>
        <div class="space-y-2">
          <label class="text-[10px] font-black opacity-40 tracking-widest"
            >condizione attuale</label
          >
          <select
            v-model="returnForm.condition"
            class="w-full p-3 bg-theme-primary border border-[var(--thistle)] rounded-xl outline-none text-sm text-theme-main">
            <option
              v-for="opt in conditionOptions"
              :key="opt.en"
              :value="opt.en">
              {{ opt.it }}
            </option>
          </select>
        </div>
        <button
          @click="confirmReturn"
          class="w-full bg-[var(--zomp)] text-white py-4 rounded-xl font-bold shadow-lg">
          conferma rientro
        </button>
      </div>
    </AppModal>

    <AppModal
      :is-open="isExtendModalOpen"
      title="allunga prestito"
      @close="isExtendModalOpen = false">
      <div class="p-6 space-y-6 text-theme-main">
        <p class="text-sm">Di quanti giorni vuoi estendere il prestito?</p>
        <div class="space-y-2">
          <label class="text-[10px] font-black opacity-40 tracking-widest"
            >giorni da aggiungere</label
          >
          <select
            v-model.number="extendForm.days"
            class="w-full p-3 bg-theme-primary border border-[var(--thistle)] rounded-xl outline-none text-sm text-theme-main">
            <option :value="3">3 giorni</option>
            <option :value="7">1 settimana</option>
            <option :value="14">2 settimane</option>
            <option :value="30">1 mese</option>
          </select>
        </div>
        <button
          @click="confirmExtension"
          class="w-full bg-[var(--paynes-gray)] text-white py-4 rounded-xl font-bold shadow-lg">
          conferma estensione
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/appModal.vue";
import { deleteConfig, executeDeletion } from "@/utils/helpers";
import { useRouter } from "vue-router";

const router = useRouter();
const userData = ref(null);
const activeLoans = ref([]);
const pendingRequests = ref([]);
const acceptedLoans = ref([]);
const borrowedIndex = ref(0);
const lentIndex = ref(0);

const isManageModalOpen = ref(false);
const isContactMode = ref(false);
const isReturnModalOpen = ref(false);
const isExtendModalOpen = ref(false);
const selectedRequest = ref(null);
const selectedLoan = ref(null);

const modalForm = reactive({
  action: "",
  notes: "",
  selectedDays: [],
  selectedSlots: [],
});
const returnForm = reactive({ condition: "GREAT" });
const extendForm = reactive({ days: 7 });

const days = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"];
const timeSlots = [
  "mattina 08-12",
  "pranzo 12-14",
  "pomeriggio 14-18",
  "sera 18-20",
];
const conditionOptions = [
  { it: "Nuovo", en: "NEW" },
  { it: "Ottimo", en: "GREAT" },
  { it: "Buono", en: "GOOD" },
  { it: "Usurato", en: "WORN" },
  { it: "Rovinato", en: "DAMAGED" },
];

const borrowedBooks = computed(() =>
  activeLoans.value.filter(
    (l) => l.requesterId === userData.value?.id && l.status === "ON_LOAN"
  )
);
const lentBooks = computed(() =>
  activeLoans.value.filter(
    (l) => l.ownerId === userData.value?.id && l.status === "ON_LOAN"
  )
);
const overdueLoans = computed(() =>
  borrowedBooks.value.filter((l) => isOverdue(l.expectedReturnDate))
);
const modalTitle = computed(() =>
  isContactMode.value ? "contatta utente" : "gestione richiesta"
);

// Metodi Navigazione Carousel
function nextBorrowed() {
  if (borrowedIndex.value < borrowedBooks.value.length - 3)
    borrowedIndex.value++;
}
function prevBorrowed() {
  if (borrowedIndex.value > 0) borrowedIndex.value--;
}
function nextLent() {
  if (lentIndex.value < lentBooks.value.length - 3) lentIndex.value++;
}
function prevLent() {
  if (lentIndex.value > 0) lentIndex.value--;
}

// Lifecycle & Fetch
onMounted(async () => {
  await fetchUserMe();
  await Promise.all([
    fetchIncomingRequests(),
    fetchActiveLoans(),
    fetchAcceptedLoans(),
  ]);
});

async function fetchUserMe() {
  try {
    userData.value = await apiClient.get("/users/me");
  } catch (e) {}
}
async function fetchIncomingRequests() {
  try {
    pendingRequests.value =
      (await apiClient.get("/loan/requests/incoming")) || [];
  } catch (e) {}
}
async function fetchActiveLoans() {
  try {
    activeLoans.value = (await apiClient.get("/loan/active")) || [];
  } catch (e) {}
}
async function fetchAcceptedLoans() {
  try {
    const all = await apiClient.get("/loan/all");
    acceptedLoans.value = all.filter((l) => l.status === "ACCEPTED");
  } catch (e) {}
}

// Azioni Prestiti (Stesse del backend)
async function confirmExchange(id) {
  await apiClient.post(`/loan/${id}/start`);
  await Promise.all([fetchAcceptedLoans(), fetchActiveLoans()]);
}
async function confirmReturn() {
  await apiClient.post(`/loan/${selectedLoan.value.id}/return`, {
    condition: returnForm.condition,
  });
  isReturnModalOpen.value = false;
  fetchActiveLoans();
}
async function confirmExtension() {
  await apiClient.patch(`/loan/${selectedLoan.value.id}/extend`, {
    days: extendForm.days,
  });
  isExtendModalOpen.value = false;
  fetchActiveLoans();
}

async function handleModalSubmit() {
  const payload = {
    notes: modalForm.notes,
    days: modalForm.selectedDays.join(", "),
    slots: modalForm.selectedSlots.join(", "),
  };
  if (isContactMode.value) {
    await apiClient.post(`/loan/${selectedRequest.value.id}/contact`, payload);
  } else {
    await apiClient.patch(`/loan/${selectedRequest.value.id}/status`, {
      ...payload,
      action: modalForm.action,
    });
    await Promise.all([fetchIncomingRequests(), fetchAcceptedLoans()]);
  }
  isManageModalOpen.value = false;
}

// Helpers Modali
function openManageModal(req) {
  selectedRequest.value = req;
  isContactMode.value = false;
  modalForm.action = "";
  modalForm.notes = "";
  modalForm.selectedDays = [];
  modalForm.selectedSlots = [];
  isManageModalOpen.value = true;
}
function openContactModal(loan) {
  selectedRequest.value = loan;
  isContactMode.value = true;
  modalForm.notes = "";
  modalForm.selectedDays = [];
  modalForm.selectedSlots = [];
  isManageModalOpen.value = true;
}
function openReturnModal(loan) {
  selectedLoan.value = loan;
  isReturnModalOpen.value = true;
}
function openExtendModal(loan) {
  selectedLoan.value = loan;
  extendForm.days = 7;
  isExtendModalOpen.value = true;
}
function toggleDay(d) {
  const i = modalForm.selectedDays.indexOf(d);
  i === -1
    ? modalForm.selectedDays.push(d)
    : modalForm.selectedDays.splice(i, 1);
}
function toggleSlot(s) {
  const i = modalForm.selectedSlots.indexOf(s);
  i === -1
    ? modalForm.selectedSlots.push(s)
    : modalForm.selectedSlots.splice(i, 1);
}

const isOverdue = (d) => (d ? new Date(d) < new Date() : false);
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("it-IT") : "-");
const formatVisibility = (v) =>
  ({ all: "Tutti", logged_in: "Registrati", private: "Privato" }[v] ||
  "Privato");
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 11px;
  color: var(--theme-main);
  border: 1px solid transparent;
  transition: all 0.2s;
}
.nav-link:hover {
  background: var(--zomp);
  color: white;
  transform: translateX(5px);
}
.nav-link i {
  opacity: 0.5;
  width: 16px;
}
.nav-link:hover i {
  opacity: 1;
}
.btn-outline {
  border: 2px solid var(--zomp);
  color: var(--zomp);
  font-weight: bold;
  border-radius: 12px;
  transition: all 0.2s;
}
.btn-outline:hover {
  background: var(--zomp);
  color: white;
}
</style>
