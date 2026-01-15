<template>
  <main class="max-w-7xl mx-auto p-6 space-y-8">
    <div class="flex justify-between items-start">
      <button
        @click="goBack"
        aria-label="torna alla pagina precedente"
        class="flex items-center text-theme-main hover:text-zomp transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-zomp rounded-lg p-1">
        <i class="fa-solid fa-arrow-left mr-2"></i>
        torna indietro
      </button>

      <div v-if="isOwner" class="flex gap-3">
        <button
          @click="router.push(`/libraries/${library.id}/edit`)"
          aria-label="modifica impostazioni libreria"
          class="bg-zomp text-white px-5 py-2.5 rounded-xl font-bold text-[10px] shadow-md hover:opacity-90 transition flex items-center gap-2">
          <i class="fa-solid fa-pen-to-square"></i>
          modifica libreria
        </button>

        <router-link
          :to="{
            path: '/add-book',
            query: { libraryId: library.id, returnTo: route.path },
          }"
          aria-label="aggiungi nuovo libro"
          class="bg-zomp text-white px-5 py-2.5 rounded-xl font-bold text-[10px] shadow-md hover:opacity-90 transition flex items-center gap-2">
          <i class="fa-solid fa-plus"></i>
          nuovo libro
        </router-link>
      </div>
    </div>

    <div
      v-if="isLoading"
      role="status"
      class="text-center py-20 text-theme-main opacity-70">
      <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-2 text-zomp"></i>
      <p>caricamento libreria...</p>
    </div>

    <div
      v-else-if="error"
      role="alert"
      class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
      <p class="text-red-700 dark:text-red-400 font-medium">
        errore: {{ error }}
      </p>
    </div>

    <div v-else-if="library" class="grid md:grid-cols-4 gap-8">
      <aside class="md:col-span-1 space-y-6">
        <header>
          <h1 class="text-3xl font-display text-theme-main">
            {{ library.name }}
          </h1>
        </header>

        <div
          v-if="isMapVisible"
          class="h-64 shadow-lg rounded-xl overflow-hidden border border-thistle">
          <MiniMap :lat="library.latitude" :lng="library.longitude" />
        </div>

        <section
          class="bg-theme-primary p-5 rounded-xl shadow border border-thistle transition-colors">
          <h3
            class="font-bold text-lg text-theme-main border-b border-thistle pb-2 mb-3">
            info
          </h3>
          <dl class="text-sm space-y-3 text-theme-main">
            <div class="flex justify-between">
              <dt class="opacity-70">proprietario:</dt>
              <router-link
                :to="`/profile/${library.ownerId}`"
                aria-label="vedi profilo proprietario"
                class="font-bold hover:text-zomp transition-colors cursor-pointer">
                {{ library.ownerName || "utente anonimo" }}
              </router-link>
            </div>
            <div class="flex justify-between">
              <dt class="opacity-70">visibilità:</dt>
              <dd class="font-bold text-[12px] tracking-widest uppercase">
                {{ visibilityLabel }}
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="opacity-70">libri totali:</dt>
              <dd class="font-bold">{{ books.totalCount }}</dd>
            </div>
          </dl>

          <button
            v-if="isOwner"
            @click="openDeleteLibraryModal"
            aria-label="elimina definitivamente questa libreria"
            class="w-full mt-6 p-3 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl transition flex items-center justify-center gap-2 font-bold text-xs shadow-sm">
            <i class="fa-solid fa-trash-can"></i>
            elimina libreria
          </button>
        </section>
      </aside>

      <section class="md:col-span-3 space-y-6">
        <h2
          class="text-2xl font-bold text-theme-main border-b border-thistle pb-2">
          Libri ({{ books.totalCount }})
        </h2>

        <div
          v-if="books.list.length === 0"
          class="p-10 bg-[var(--bg-secondary)] rounded-xl border border-thistle text-center text-theme-main opacity-70">
          <i class="fa-solid fa-book-open-reader text-5xl mb-4 opacity-20"></i>
          <p class="font-medium">nessun libro trovato in questa libreria.</p>
        </div>

        <ul v-else class="space-y-4">
          <li
            v-for="book in books.list"
            :key="book.id"
            class="bg-theme-primary shadow rounded-xl p-4 flex items-center justify-between border border-thistle transition-all hover:border-zomp group">
            <div class="flex items-center space-x-4">
              <div
                class="relative w-16 h-24 flex-shrink-0 shadow-md rounded-md overflow-hidden bg-gray-200 border border-thistle/30">
                <img
                  v-if="book.customCover || book.coverUrl"
                  :src="book.customCover || book.coverUrl"
                  class="w-full h-full object-cover"
                  alt="copertina libro" />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400">
                  <i class="fa-solid fa-book text-xl"></i>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-bold text-theme-main leading-tight">
                  {{ book.title }}
                </h3>
                <p class="text-sm text-theme-main opacity-70 italic">
                  di {{ book.author }}
                </p>
                <div class="mt-2">
                  <span
                    :class="getStatusBadgeClass(book.status)"
                    class="px-3 py-1 rounded-full text-[10px] font-black border shadow-sm">
                    {{
                      book.status === "available"
                        ? "disponibile"
                        : "in prestito"
                    }}
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
                    aria-label="richiedi in prestito"
                    class="bg-zomp text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-opacity-90 transition transform hover:-translate-y-0.5 flex items-center">
                    <i class="fa-solid fa-hand-holding-heart mr-2"></i>chiedi in
                    prestito
                  </button>
                  <span
                    v-else
                    class="text-[11px] font-black text-paynes-gray opacity-60 bg-[var(--bg-secondary)] px-3 py-2 rounded-lg border border-thistle">
                    <i class="fa-solid fa-check mr-1"></i> richiesta inviata
                  </span>
                </template>
              </div>

              <button
                @click="router.push(`/books/${book.id}`)"
                title="vedi dettagli"
                aria-label="vedi dettagli libro"
                class="p-2.5 text-theme-main hover:text-zomp hover:bg-ash-gray/20 rounded-xl transition border border-transparent hover:border-thistle">
                <i class="fa-solid fa-eye text-lg"></i>
              </button>

              <div
                v-if="isOwner"
                class="flex space-x-1 border-l border-thistle pl-3">
                <button
                  @click="router.push(`/books/${book.id}/edit`)"
                  title="modifica"
                  aria-label="modifica libro"
                  class="p-2 text-theme-main hover:bg-ash-gray/20 rounded-lg transition">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button
                  @click="openMoveModal(book)"
                  title="sposta"
                  aria-label="sposta libro in altra libreria"
                  class="p-2 text-theme-main hover:bg-ash-gray/20 rounded-lg transition">
                  <i class="fa-solid fa-right-left"></i>
                </button>
                <button
                  @click="openDeleteBookUI(book)"
                  :disabled="book.status !== 'available'"
                  :class="
                    book.status === 'available'
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-300 cursor-not-allowed'
                  "
                  aria-label="elimina libro"
                  class="p-2 rounded-lg transition">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <AppModal
      :is-open="deleteModal.show"
      :title="deleteModalTitle"
      @close="closeDeleteModal">
      <div
        v-if="deleteModal.step === 'confirm'"
        class="flex flex-col items-center text-center space-y-4 p-4">
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
          <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>
        <p class="text-lg font-medium text-theme-main">
          {{ deleteModal.message }}
        </p>
        <p
          class="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100">
          <i class="fa-solid fa-circle-info mr-1"></i>
          azione <strong>irreversibile</strong>.
        </p>
        <div class="flex gap-3 w-full mt-4">
          <button
            @click="closeDeleteModal"
            aria-label="annulla eliminazione"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition">
            annulla
          </button>
          <button
            @click="executeDelete"
            aria-label="conferma eliminazione"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition flex justify-center items-center gap-2">
            <i class="fa-solid fa-trash"></i> conferma
          </button>
        </div>
      </div>

      <div
        v-else-if="deleteModal.step === 'loading'"
        class="flex flex-col items-center justify-center py-8 space-y-4">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500"></i>
        <p class="text-theme-main font-medium">eliminazione in corso...</p>
      </div>

      <div
        v-else-if="deleteModal.step === 'success'"
        class="flex flex-col items-center text-center space-y-4 p-4">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-zomp mb-2 animate-bounce">
          <i class="fa-solid fa-check text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold text-theme-main">eliminato!</h3>
        <p class="text-sm text-gray-600">{{ deleteModal.successMsg }}</p>
        <button
          @click="handleDeleteSuccess"
          aria-label="chiudi messaggio conferma"
          class="w-full mt-4 px-4 py-2 bg-zomp text-white rounded-lg hover:bg-opacity-90 font-bold transition">
          chiudi
        </button>
      </div>

      <div
        v-else-if="deleteModal.step === 'error'"
        class="flex flex-col items-center text-center space-y-4 p-4">
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
          <i class="fa-solid fa-xmark text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold text-red-600">errore</h3>
        <p class="text-sm text-gray-600">
          non è stato possibile completare l'operazione.
        </p>
        <button
          @click="closeDeleteModal"
          aria-label="chiudi messaggio errore"
          class="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition">
          chiudi
        </button>
      </div>
    </AppModal>

    <AppModal
      :isOpen="isLoanConfirmModalOpen"
      title="richiesta di prestito"
      @close="isLoanConfirmModalOpen = false">
      <div v-if="currentBook" class="space-y-4 text-theme-main p-4">
        <p class="text-sm">confermi la richiesta di prestito per:</p>
        <div
          class="p-4 bg-[var(--bg-secondary)] border border-thistle rounded-xl font-bold italic">
          {{ currentBook.title }}
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="isLoanConfirmModalOpen = false"
            aria-label="annulla richiesta"
            class="px-4 py-2 text-sm font-bold opacity-60">
            annulla
          </button>
          <button
            @click="confirmLoanRequest"
            :disabled="isSendingLoan"
            aria-label="conferma invio richiesta"
            class="bg-zomp text-white px-6 py-2 rounded-xl font-bold shadow-md flex items-center gap-2">
            <i
              v-if="isSendingLoan"
              class="fa-solid fa-circle-notch fa-spin"></i>
            invia richiesta
          </button>
        </div>
      </div>
    </AppModal>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/AppModal.vue";
import MiniMap from "@/components/MiniMap.vue";

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
const isSendingLoan = ref(false);
const isMoveModalOpen = ref(false);

// stato unificato per eliminazione libreria o libro
const deleteModal = reactive({
  show: false,
  step: "confirm",
  type: null,
  targetId: null,
  message: "",
  successMsg: "",
});

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isOwner = computed(() => library.value?.ownerId === authStore.userId);
const isMapVisible = computed(
  () =>
    library.value &&
    (isOwner.value ||
      library.value.visibility === "all" ||
      library.value.visibility === "public")
);

const deleteModalTitle = computed(() => {
  if (deleteModal.step === "loading") return "attendere...";
  if (deleteModal.step === "success") return "operazione completata";
  return deleteModal.type === "library" ? "elimina libreria" : "elimina libro";
});

function getStatusBadgeClass(status) {
  return status === "available"
    ? "bg-zomp text-white border-zomp"
    : "bg-tea-rose-red/20 text-paynes-gray border-thistle";
}

function goBack() {
  router.back();
}

async function fetchLibraryDetails(page = 0) {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/libraries/${route.params.id}`);
    library.value = response;
    visibilityLabel.value =
      response.visibility === "all"
        ? "tutti"
        : response.visibility === "private"
        ? "privata"
        : "utenti registrati";
    const rawBooks = response.books || [];
    const start = page * books.value.pageSize;
    books.value = {
      list: rawBooks.slice(start, start + books.value.pageSize),
      totalCount: rawBooks.length,
      currentPage: page,
      pageSize: 10,
    };
  } catch (err) {
    error.value = "libreria non trovata.";
  } finally {
    isLoading.value = false;
  }
}

// navigazione tra librerie senza refresh
watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchLibraryDetails();
  }
);

// eliminazione libreria
function openDeleteLibraryModal() {
  deleteModal.type = "library";
  deleteModal.targetId = library.value.id;
  deleteModal.message = `sei sicuro di voler eliminare la libreria "${library.value.name}"? tutti i libri contenuti saranno rimossi.`;
  deleteModal.successMsg = "la libreria è stata rimossa con successo.";
  deleteModal.step = "confirm";
  deleteModal.show = true;
}

// eliminazione libro
function openDeleteBookUI(book) {
  currentBook.value = book;
  deleteModal.type = "book";
  deleteModal.targetId = book.id;
  deleteModal.message = `vuoi eliminare il libro "${book.title}" dalla libreria?`;
  deleteModal.successMsg = "il libro è stato rimosso dalla collezione.";
  deleteModal.step = "confirm";
  deleteModal.show = true;
}

async function executeDelete() {
  deleteModal.step = "loading";
  try {
    if (deleteModal.type === "library") {
      await apiClient.delete(`/libraries/${deleteModal.targetId}`);
    } else {
      await apiClient.delete(`/copies/${deleteModal.targetId}`);
    }
    deleteModal.step = "success";
  } catch (e) {
    deleteModal.step = "error";
  }
}

function handleDeleteSuccess() {
  if (deleteModal.type === "library") {
    router.push("/");
  } else {
    deleteModal.show = false;
    fetchLibraryDetails(books.value.currentPage);
  }
}

function closeDeleteModal() {
  deleteModal.show = false;
}

// prestito
function openLoanConfirmModal(bookItem) {
  if (!isAuthenticated.value) router.push("/login");
  else {
    currentBook.value = bookItem;
    isLoanConfirmModalOpen.value = true;
  }
}

async function confirmLoanRequest() {
  isSendingLoan.value = true;
  try {
    await apiClient.post(`/loan/${currentBook.value.id}`, {});
    isLoanConfirmModalOpen.value = false;
    fetchLibraryDetails(books.value.currentPage);
  } catch (e) {
    alert("errore richiesta prestito");
  } finally {
    isSendingLoan.value = false;
  }
}

onMounted(fetchLibraryDetails);
</script>