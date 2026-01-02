<template>
  <main class="max-w-7xl mx-auto p-6 space-y-8">
    <button
      @click="goBack"
      aria-label="torna alla pagina precedente"
      class="flex items-center text-theme-main hover:text-zomp transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-zomp rounded-lg p-1">
      <i class="fa-solid fa-arrow-left mr-2"></i>
      Torna indietro
    </button>

    <div v-if="isLoading" role="status" class="text-center py-20 text-theme-main opacity-70">
      <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-2 text-zomp"></i>
      <p>Caricamento libreria...</p>
    </div>

    <div v-else-if="error" role="alert" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
      <p class="text-red-700 dark:text-red-400 font-medium">Errore: {{ error }}</p>
    </div>

    <div v-else-if="library" class="grid md:grid-cols-4 gap-8">
      <aside class="md:col-span-1 space-y-6">
        <header class="flex items-center justify-between">
          <h1 class="text-3xl font-display text-theme-main">{{ library.name }}</h1>
          <button v-if="isOwner" @click="router.push(`/libraries/${library.id}/edit`)" class="p-2 text-theme-main hover:bg-ash-gray/20 rounded-lg">
            <i class="fa-solid fa-pen-to-square text-lg"></i>
          </button>
        </header>

        <div v-if="isMapVisible" class="h-64 shadow-lg rounded-xl overflow-hidden border border-thistle">
          <MiniMap :lat="library.latitude" :lng="library.longitude" />
        </div>

        <section class="bg-theme-primary p-5 rounded-xl shadow border border-thistle transition-colors">
          <h3 class="font-bold text-lg text-theme-main border-b border-thistle pb-2 mb-3">Info</h3>
          <dl class="text-sm space-y-3 text-theme-main">
            <div class="flex justify-between">
              <dt class="opacity-70">Proprietario:</dt>
              <router-link :to="`/profile/${library.ownerId}`" class="font-bold hover:text-zomp transition-colors cursor-pointer">
                    {{ library.ownerName || "Utente anonimo" }}
            </router-link>
            </div>
            <div class="flex justify-between">
              <dt class="opacity-70">Visibilità:</dt>
              <dd class="font-bold uppercase text-[10px] tracking-widest">{{ visibilityLabel }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="opacity-70">Libri totali:</dt>
              <dd class="font-bold">{{ books.totalCount }}</dd>
            </div>
          </dl>
        </section>
      </aside>

      <section class="md:col-span-3 space-y-6">
        <h2 class="text-2xl font-bold text-theme-main border-b border-thistle pb-2">
          Libri in Libreria ({{ books.totalCount }})
        </h2>

        <div v-if="books.list.length === 0" class="p-10 bg-[var(--bg-secondary)] rounded-xl border border-thistle text-center text-theme-main opacity-70">
          <i class="fa-solid fa-book-open-reader text-5xl mb-4 opacity-20"></i>
          <p class="font-medium">Nessun libro trovato in questa libreria.</p>
        </div>

        <ul v-else class="space-y-4">
          <li v-for="book in books.list" :key="book.id" class="bg-theme-primary shadow rounded-xl p-4 flex items-center justify-between border border-thistle transition-all hover:border-zomp group">
            <div class="flex items-center space-x-4">
              <div class="relative w-16 h-24 flex-shrink-0 shadow-md rounded-md overflow-hidden bg-gray-200">
                <img v-if="book.customCover || book.coverUrl" :src="book.customCover || book.coverUrl" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <i class="fa-solid fa-book text-xl"></i>
                </div>
              </div>

              <div>
                <h3 class="text-lg font-bold text-theme-main leading-tight">{{ book.title }}</h3>
                <p class="text-sm text-theme-main opacity-70">di {{ book.author }}</p>
                <div class="mt-2">
                  <span :class="getStatusBadgeClass(book.status)" class="px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm">
                    {{ book.status === "available" ? "Disponibile" : "In Prestito" }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <div v-if="!isOwner && isAuthenticated" class="flex items-center">
                <template v-if="book.status === 'available'">
                  <button
                    v-if="!book.hasPendingRequest"
                    @click="openLoanConfirmModal(book)"
                    class="bg-zomp text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-opacity-90 transition transform hover:-translate-y-0.5 flex items-center">
                    <i class="fa-solid fa-hand-holding-heart mr-2"></i>
                    Chiedi in Prestito
                  </button>
                  <span v-else class="text-[11px] font-black uppercase text-paynes-gray opacity-60 bg-[var(--bg-secondary)] px-3 py-2 rounded-lg border border-thistle">
                    <i class="fa-solid fa-check mr-1"></i> Richiesta inviata
                  </span>
                </template>
              </div>

              <button
                @click="router.push(`/books/${book.id}`)"
                title="Vedi Dettagli"
                class="p-2.5 text-theme-main hover:text-zomp hover:bg-ash-gray/20 rounded-xl transition border border-transparent hover:border-thistle">
                <i class="fa-solid fa-eye text-lg"></i>
              </button>

              <div v-if="isOwner" class="flex space-x-1 border-l border-thistle pl-3">
                <button @click="router.push(`/books/${book.id}/edit`)" title="Modifica" class="p-2 text-theme-main hover:bg-ash-gray/20 rounded-lg transition">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button @click="openMoveModal(book)" title="Sposta" class="p-2 text-theme-main hover:bg-ash-gray/20 rounded-lg transition">
                  <i class="fa-solid fa-right-left"></i>
                </button>
                <button
                  @click="openDeleteUI(book)"
                  :disabled="book.status !== 'available'"
                  :class="book.status === 'available' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-300 opacity-50 cursor-not-allowed'"
                  class="p-2 rounded-lg transition">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="books.totalCount > books.pageSize" class="flex justify-center items-center gap-4 pt-4 text-theme-main">
          <button @click="handlePageChange(books.currentPage - 1)" :disabled="books.currentPage === 0" class="p-2 rounded-lg border border-thistle disabled:opacity-30">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="text-sm font-bold">Pagina {{ books.currentPage + 1 }} di {{ Math.ceil(books.totalCount / books.pageSize) }}</span>
          <button @click="handlePageChange(books.currentPage + 1)" :disabled="(books.currentPage + 1) * books.pageSize >= books.totalCount" class="p-2 rounded-lg border border-thistle disabled:opacity-30">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </section>
    </div>

    <AppModal :isOpen="confirmModal.show" :title="deleteModalTitle" @close="confirmModal.show = false">
      <div v-if="currentBook" class="p-6 text-center space-y-4 text-theme-main">
        <template v-if="confirmModal.step === 'confirm'">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2">
            <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
          </div>
          <p class="text-lg font-medium">{{ confirmModal.message }}</p>
          <p class="text-sm opacity-70 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
            <i class="fa-solid fa-circle-info mr-1"></i>
            Questa azione è <strong>irreversibile</strong>.
          </p>
          <div class="flex gap-3 pt-4">
            <button @click="confirmModal.show = false" class="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] font-bold transition">
              Annulla
            </button>
            <button @click="handleExecuteDelete" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold shadow-md hover:bg-red-700 transition">
              {{ confirmModal.confirmBtn }}
            </button>
          </div>
        </template>

        <template v-else-if="confirmModal.step === 'loading'">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500"></i>
          <p class="font-bold">Eliminazione in corso...</p>
        </template>

        <template v-else-if="confirmModal.step === 'success'">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-zomp mx-auto mb-2 animate-bounce">
            <i class="fa-solid fa-check text-3xl"></i>
          </div>
          <h3 class="text-xl font-bold">Operazione completata!</h3>
          <p class="text-sm opacity-70">{{ confirmModal.successMsg }}</p>
          <button @click="confirmModal.show = false" class="w-full mt-4 px-4 py-2 bg-zomp text-white rounded-lg hover:bg-opacity-90 font-bold transition">
            Chiudi
          </button>
        </template>
      </div>
    </AppModal>

    <AppModal :isOpen="isMoveModalOpen" title="Sposta libro" @close="isMoveModalOpen = false">
       <div class="p-4 text-center">
         <p class="text-theme-main mb-4">Funzionalità di spostamento rapido in arrivo.</p>
         <button @click="isMoveModalOpen = false" class="bg-zomp text-white px-6 py-2 rounded-xl font-bold">OK</button>
       </div>
    </AppModal>

    <AppModal :isOpen="isLoanConfirmModalOpen" title="Richiesta di Prestito" @close="isLoanConfirmModalOpen = false">
      <div v-if="currentBook" class="space-y-4 text-theme-main">
        <p class="text-sm">Confermi la richiesta di prestito per:</p>
        <div class="p-4 bg-[var(--bg-secondary)] border border-thistle rounded-xl">
          <p class="font-bold text-lg leading-tight">{{ currentBook.title }}</p>
          <p class="text-xs mt-2 opacity-70">Proprietario: <span class="font-bold">{{ library.ownerName || "Anonimo" }}</span></p>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button @click="isLoanConfirmModalOpen = false" class="px-4 py-2 text-sm font-bold opacity-60">Annulla</button>
          <button @click="confirmLoanRequest" :disabled="isSendingLoan" class="bg-zomp text-white px-6 py-2 rounded-xl font-bold shadow-md flex items-center gap-2">
            <i v-if="isSendingLoan" class="fa-solid fa-circle-notch fa-spin"></i>
            Invia Richiesta
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal :isOpen="isLoanResultModalOpen" :title="loanResultTitle" @close="isLoanResultModalOpen = false">
      <div class="p-6 text-center space-y-4">
        <i class="fa-solid text-4xl" :class="loanResultIcon"></i>
        <p class="text-theme-main">{{ loanResultMessage }}</p>
        <button @click="isLoanResultModalOpen = false" class="bg-paynes-gray text-white px-8 py-2 rounded-xl font-bold">Chiudi</button>
      </div>
    </AppModal>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/AppModal.vue";
import MiniMap from "@/components/MiniMap.vue";
import { deleteConfig, executeDeletion } from "@/utils/helpers";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const library = ref(null);
const books = ref({ list: [], totalCount: 0, currentPage: 0, pageSize: 10 });
const isLoading = ref(true);
const error = ref(null);
const visibilityLabel = ref("");

const currentBook = ref(null);
const isLoanConfirmModalOpen = ref(false);
const isLoanResultModalOpen = ref(false);
const isMoveModalOpen = ref(false);
const isSendingLoan = ref(false);

const loanResultTitle = ref("");
const loanResultMessage = ref("");
const loanResultIcon = ref(null);

// STATO ELIMINAZIONE CENTRALIZZATO
const confirmModal = reactive({
  show: false,
  step: 'confirm',
  title: '',
  message: '',
  confirmBtn: '',
  successMsg: ''
});

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isOwner = computed(() => library.value?.ownerId === authStore.userId);
const isMapVisible = computed(() => library.value && (isOwner.value || library.value.visibility === "public" || library.value.visibility === "all"));

const deleteModalTitle = computed(() => {
  if (confirmModal.step === 'loading') return 'Attendere...';
  if (confirmModal.step === 'success') return 'Operazione Completata';
  return confirmModal.title;
});

function getStatusBadgeClass(status) {
  return status === "available" 
    ? "bg-zomp text-white border-zomp"
    : "bg-tea-rose-red/20 text-paynes-gray border-thistle";
}

function goBack() { router.back(); }

async function fetchLibraryDetails(page = 0) {
  isLoading.value = true; error.value = null;
  try {
    const response = await apiClient.get(`/libraries/${route.params.id}`);
    library.value = response;
    visibilityLabel.value = response.visibility === "all" ? "Tutti" : response.visibility === "private" ? "Privata" : "Utenti registrati";
    const rawBooks = response.books || [];
    const start = page * books.value.pageSize;
    books.value = { list: rawBooks.slice(start, start + books.value.pageSize), totalCount: rawBooks.length, currentPage: page, pageSize: 10 };
  } catch (err) { error.value = "Libreria non trovata."; }
  finally { isLoading.value = false; }
}

async function handlePageChange(newPage) {
  if (newPage >= 0 && newPage * books.value.pageSize < books.value.totalCount) {
    await fetchLibraryDetails(newPage);
    window.scrollTo(0, 0);
  }
}

function openLoanConfirmModal(bookItem) {
  if (!isAuthenticated.value) router.push("/login");
  else { currentBook.value = bookItem; isLoanConfirmModalOpen.value = true; }
}

async function confirmLoanRequest() {
  if (!currentBook.value || currentBook.value.status !== "available") return;
  isLoanConfirmModalOpen.value = false; isSendingLoan.value = true;
  try {
    await apiClient.post(`/loan/${currentBook.value.id}`, {});
    const bookInList = books.value.list.find(b => b.id === currentBook.value.id);
    if (bookInList) bookInList.hasPendingRequest = true;
    loanResultTitle.value = "Richiesta Inviata"; 
    loanResultMessage.value = "Richiesta inviata con successo.";
    loanResultIcon.value = "fa-circle-check text-green-500";
  } catch (e) {
    loanResultTitle.value = "Errore"; 
    loanResultIcon.value = "fa-circle-xmark text-red-500";
  } finally { isSendingLoan.value = false; isLoanResultModalOpen.value = true; }
}

function openMoveModal(book) { currentBook.value = book; isMoveModalOpen.value = true; }

// LOGICA ELIMINAZIONE CON HELPERS
function openDeleteUI(book) {
  currentBook.value = book;
  const config = deleteConfig.book;
  confirmModal.title = config.title;
  confirmModal.message = config.message(book.title);
  confirmModal.confirmBtn = config.confirmBtn;
  confirmModal.successMsg = config.successMsg;
  confirmModal.step = 'confirm';
  confirmModal.show = true;
}

async function handleExecuteDelete() {
  confirmModal.step = 'loading';
  const res = await executeDeletion('book', currentBook.value.id);
  if (res.success) {
    confirmModal.step = 'success';
    await fetchLibraryDetails(books.value.currentPage);
  } else {
    confirmModal.show = false;
    alert(res.error);
  }
}

onMounted(fetchLibraryDetails);
</script>

<style scoped>
.font-display { font-family: "Mochiy Pop P One", cursive; }
</style>