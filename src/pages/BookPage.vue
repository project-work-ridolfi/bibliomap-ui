<template>
  <main class="max-w-4xl mx-auto p-6 space-y-8 relative">
    <button
      @click="goBack"
      aria-label="torna alla pagina precedente"
      class="flex items-center text-theme-main hover:text-zomp transition-colors font-medium mb-4 focus:outline-none focus:ring-2 focus:ring-zomp rounded-lg p-1">
      <i class="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>
      Torna indietro
    </button>

    <div
      v-if="isLoading"
      role="status"
      class="text-center py-10 text-theme-main opacity-70">
      <i
        class="fa-solid fa-circle-notch fa-spin text-3xl mb-2 text-zomp"
        aria-hidden="true"></i>
      <p class="uppercase font-bold text-xs tracking-widest">recupero dettagli libro...</p>
    </div>

    <div
      v-else-if="error"
      role="alert"
      class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
      <p class="text-red-700 dark:text-red-400 font-medium">
        Errore: {{ error }}
      </p>
      <button
        @click="fetchBookDetails"
        class="mt-2 underline text-sm text-theme-main hover:text-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded">
        Riprova
      </button>
    </div>

    <article
      v-else-if="book"
      class="bg-theme-primary shadow-xl rounded-2xl border-2 border-thistle overflow-hidden transition-colors duration-300 custom-fade-in">
      <div class="md:grid md:grid-cols-3">
        <section
          class="bg-theme-secondary p-6 md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-thistle">
          <div
            class="relative w-48 h-72 shadow-lg rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-border-color">
            <img
              v-if="displayCover"
              :src="displayCover"
              :alt="`Copertina del libro ${book.title}`"
              class="w-full h-full object-cover" />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-theme-main/10 text-theme-main"
              aria-label="copertina non disponibile">
              <i
                class="fa-solid fa-book text-4xl opacity-50"
                aria-hidden="true"></i>
            </div>
          </div>

          <div class="mt-6">
            <span
              :class="statusBadgeClass"
              class="px-4 py-2 rounded-full text-xs font-bold shadow-sm border uppercase tracking-wider">
              {{ statusLabel }}
            </span>
          </div>
        </section>

        <section
          class="p-6 md:col-span-2 flex flex-col justify-between space-y-6">
          <header>
            <h1 class="text-3xl font-display text-theme-main mb-1 uppercase tracking-tight">
              {{ book.title }}
            </h1>
            <h2 class="text-xl text-theme-main opacity-80 font-medium italic">
              di {{ book.author }}
            </h2>
          </header>

          <div class="space-y-3">
            <h3
              class="text-[10px] font-bold tracking-widest text-theme-main opacity-60 border-b border-thistle pb-1 uppercase">
              Dettagli Edizione
            </h3>

            <dl class="text-theme-main space-y-2 text-sm">
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">
                  <i class="fa-solid fa-calendar-days w-5 text-zomp mr-1"></i>
                  Anno:
                </dt>
                <dd>
                  <strong class="text-xs">{{ book.publicationYear || "N/D" }}</strong>
                </dd>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">
                  <i class="fa-solid fa-building w-5 text-zomp mr-1"></i>
                  Editore:
                </dt>
                <dd>
                  <strong class="text-xs">{{ book.publisher || "N/D" }}</strong>
                </dd>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">
                  <i class="fa-solid fa-language w-5 text-zomp mr-1"></i>
                  Lingua:
                </dt>
                <dd>
                  <strong class="text-xs">{{ book.language || "Italiano" }}</strong>
                </dd>
              </div>
            </dl>

            <h3
              class="text-[10px] font-bold tracking-widest text-theme-main opacity-60 border-b border-thistle pb-1 mt-4 uppercase">
              Info Copia
            </h3>
            <dl class="text-theme-main space-y-2 text-sm">
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">
                  <i class="fa-solid fa-location-dot w-5 text-zomp mr-1"></i>
                  Libreria:
                </dt>
                <dd>
                  <router-link
                    :to="`/libraries/${book.libraryId}`"
                    class="font-bold text-xs text-theme-main hover:text-zomp underline decoration-2 underline-offset-2 transition-colors">
                    {{ book.libraryName }}
                  </router-link>
                </dd>
              </div>

              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">
                  <i class="fa-solid fa-heart-pulse w-5 text-zomp mr-1"></i>
                  Condizioni:
                </dt>
                <dd>
                  <strong class="text-xs">{{ mappedCondition }}</strong>
                </dd>
              </div>
            </dl>
          </div>

          <div v-if="book.tags && book.tags.length > 0">
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="tag in book.tags"
                :key="tag"
                class="px-3 py-1 bg-zomp/10 text-accent-color text-[10px] font-bold uppercase rounded-full border border-accent-color/20">
                #{{ tag }}
              </span>
            </div>
          </div>

          <div
            v-if="book.ownerNotes"
            class="relative bg-theme-secondary p-6 rounded-xl border border-thistle text-sm text-theme-main italic mt-2">
            <i class="fa-solid fa-quote-left absolute top-2 left-2 text-zomp text-xl opacity-40"></i>
            <p class="px-4 py-1 text-center">
              {{ book.ownerNotes }}
            </p>
            <i class="fa-solid fa-quote-right absolute bottom-2 right-2 text-zomp text-xl opacity-40"></i>
          </div>

          <div class="pt-4 border-t border-thistle flex justify-end">
            <div v-if="isOwner" class="flex space-x-3">
              <button
                @click="router.push(`/books/${book.id}/edit`)"
                title="Modifica"
                class="btn-pagination w-10 h-10">
                <i class="fa-solid fa-pen-to-square text-lg"></i>
              </button>

              <button
                @click="openMoveModal"
                title="Sposta"
                class="btn-pagination w-10 h-10">
                <i class="fa-solid fa-right-left text-lg"></i>
              </button>

              <button
                @click="openDeleteModal"
                title="Elimina"
                class="btn-pagination w-10 h-10 hover:bg-red-500 !text-red-500 hover:!text-white">
                <i class="fa-solid fa-trash text-lg"></i>
              </button>
            </div>

            <div v-else>
              <button
                v-if="book.status === 'available'"
                @click="openLoanConfirmModal"
                class="btn-modal-confirm px-8 py-3 uppercase text-xs tracking-widest">
                <i class="fa-solid fa-hand-holding-heart mr-2"></i>
                Chiedi in Prestito
              </button>
              <button
                v-else
                disabled
                class="px-8 py-3 bg-theme-secondary text-theme-main border border-border-color rounded-xl font-bold cursor-not-allowed opacity-40 uppercase text-xs tracking-widest">
                Non Disponibile
              </button>
            </div>
          </div>
        </section>
      </div>
    </article>

    <AppModal :isOpen="showMoveModal" title="Sposta Copia" @close="showMoveModal = false">
      <div class="space-y-4 max-w-full text-theme-main">
        <p class="text-[10px] font-bold tracking-widest opacity-60 uppercase">
          Seleziona destinazione:
        </p>
        <div v-if="isFetchingLibraries" class="text-center py-6">
          <i class="fa-solid fa-circle-notch fa-spin text-zomp text-xl"></i>
        </div>
        <div v-else class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          <button
            v-for="lib in userLibraries"
            :key="lib.id"
            @click="confirmMove(lib.id)"
            :disabled="lib.id === book.libraryId"
            class="w-full text-left p-3 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group"
            :class="lib.id === book.libraryId ? 'opacity-40 cursor-not-allowed border-border-color' : 'border-border-color hover:border-accent-color bg-theme-primary'">
            <span class="font-bold text-xs uppercase tracking-tight truncate pr-2">{{ lib.name }}</span>
            <div v-if="lib.id === book.libraryId" class="shrink-0 text-[9px] font-black text-zomp bg-zomp/10 px-2 py-1 rounded-md uppercase">Qui</div>
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal :isOpen="showDeleteModal" :title="deleteModalTitle" @close="handleModalClose">
       <div v-if="deleteStep === 'confirm'" class="flex flex-col items-center text-center space-y-4 text-theme-main">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mb-2">
          <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>
        <p class="text-sm font-bold uppercase tracking-tight">{{ deleteUI.message }}</p>
        <div class="flex gap-3 w-full mt-4">
          <button @click="showDeleteModal = false" class="btn-modal-cancel flex-1 uppercase text-xs">Annulla</button>
          <button @click="confirmDelete" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold uppercase text-xs">Elimina</button>
        </div>
      </div>
      <div v-else-if="deleteStep === 'loading'" class="text-center py-8">
         <i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500"></i>
      </div>
      <div v-else-if="deleteStep === 'success'" class="text-center space-y-4">
          <i class="fa-solid fa-check text-4xl text-accent-color"></i>
          <p class="uppercase font-bold text-xs tracking-widest">Eliminato!</p>
          <button @click="handleModalClose" class="btn-modal-confirm w-full justify-center text-xs uppercase">Chiudi</button>
      </div>
    </AppModal>

    <AppModal :isOpen="isLoanConfirmModalOpen" title="Richiesta di Prestito" @close="isLoanConfirmModalOpen = false">
      <div v-if="book" class="space-y-4 text-theme-main">
        <div class="p-4 bg-theme-secondary border border-border-color rounded-xl">
          <p class="font-bold text-sm uppercase tracking-tight">{{ book.title }}</p>
          <p class="text-[10px] italic opacity-70">di {{ book.author }}</p>
          <p class="text-[10px] mt-2 uppercase font-bold">Proprietario: {{ book.ownerName }}</p>
        </div>
        <p class="text-[10px] font-bold text-red-500 uppercase italic">Il proprietario riceverà una notifica per approvare.</p>
        <div class="flex gap-3 pt-2">
          <button @click="isLoanConfirmModalOpen = false" class="btn-modal-cancel flex-1 uppercase text-xs font-bold">Annulla</button>
          <button @click="confirmLoanRequest" :disabled="isSendingLoan" class="btn-modal-confirm flex-1 justify-center text-xs uppercase tracking-widest font-bold">
            <i v-if="isSendingLoan" class="fa-solid fa-circle-notch fa-spin"></i> {{ isSendingLoan ? 'Invio...' : 'Conferma' }}
          </button>
        </div>
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
import { deleteConfig, executeDeletion } from "@/utils/helpers";
import { CONDITIONS } from "@/utils/constants.js";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const book = ref(null);
const isLoading = ref(true);
const error = ref(null);

// MAPPING CONDIZIONE
const mappedCondition = computed(() => {
  if (!book.value || !book.value.condition) return "N/D";
  
  // Cerchiamo il match ignorando maiuscole/minuscole
  const found = CONDITIONS.find(
    (c) => c.value.toLowerCase() === book.value.condition.toLowerCase()
  );
  
  return found ? found.label : book.value.condition;
});

const showDeleteModal = ref(false);
const deleteStep = ref("confirm");
const deleteUI = reactive({ title: "", message: "", confirmBtn: "", successMsg: "" });
const showMoveModal = ref(false);
const userLibraries = ref([]);
const isFetchingLibraries = ref(false);
const isLoanConfirmModalOpen = ref(false);
const isLoanResultModalOpen = ref(false);
const isSendingLoan = ref(false);
const loanResultTitle = ref("");
const loanResultMessage = ref("");
const loanResultIcon = ref(null);

const isOwner = computed(() => book.value?.ownerId === authStore.userId);

const displayCover = computed(() => {
  if (!book.value) return null;
  if (book.value.customCover) {
     return book.value.customCover.startsWith("data:") 
      ? book.value.customCover 
      : `data:image/jpeg;base64,${book.value.customCover}`;
  }
  return book.value.coverUrl;
});

const statusBadgeClass = computed(() => {
  if (!book.value) return "";
  return book.value.status === "available"
    ? "bg-zomp text-white border-zomp"
    : "bg-theme-secondary text-theme-main border-border-color opacity-70";
});

const statusLabel = computed(() =>
  book.value?.status === "available" ? "Disponibile" : "In Prestito"
);

const deleteModalTitle = computed(() => {
  switch (deleteStep.value) {
    case "confirm": return deleteUI.title;
    case "loading": return "Attendere...";
    case "success": return "Operazione Completata";
    case "error": return "Errore";
    default: return "";
  }
});

function goBack() { router.back(); }

async function fetchBookDetails() {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/books/${route.params.id}`);
    book.value = response;
  } catch (err) {
    error.value = "Impossibile caricare il libro.";
  } finally {
    isLoading.value = false;
  }
}

async function openMoveModal() {
  showMoveModal.value = true;
  isFetchingLibraries.value = true;
  try {
    const res = await apiClient.get("/users/me/libraries");
    userLibraries.value = res.libraries || [];
  } finally {
    isFetchingLibraries.value = false;
  }
}

async function confirmMove(newLibraryId) {
  try {
    await apiClient.patch(`/books/copies/${book.value.id}/move`, { libraryId: newLibraryId });
    showMoveModal.value = false;
    await fetchBookDetails();
  } catch (e) {
    alert("Errore durante lo spostamento");
  }
}

function openLoanConfirmModal() {
  if (!authStore.isAuthenticated) router.push("/login");
  else isLoanConfirmModalOpen.value = true;
}

async function confirmLoanRequest() {
  if (!book.value || book.value.status !== "available") return;
  isLoanConfirmModalOpen.value = false;
  isSendingLoan.value = true;
  try {
    await apiClient.post(`/loan/${book.value.id}`, {});
    loanResultTitle.value = "Richiesta Inviata";
    loanResultMessage.value = `Successo.`;
    loanResultIcon.value = "fa-circle-check text-green-500";
  } catch (e) {
    loanResultTitle.value = "Errore";
    loanResultMessage.value = "Problema.";
    loanResultIcon.value = "fa-circle-xmark text-red-500";
  } finally {
    isSendingLoan.value = false;
    isLoanResultModalOpen.value = true;
  }
}

function openDeleteModal() {
  const config = deleteConfig.book;
  deleteUI.title = config.title;
  deleteUI.message = config.message(book.value.title);
  deleteUI.confirmBtn = config.confirmBtn;
  deleteUI.successMsg = config.successMsg;
  deleteStep.value = "confirm";
  showDeleteModal.value = true;
}

async function confirmDelete() {
  deleteStep.value = "loading";
  const res = await executeDeletion("book", book.value.id);
  if (res.success) {
    setTimeout(() => { deleteStep.value = "success"; }, 800);
  } else {
    deleteStep.value = "error";
  }
}

function handleModalClose() {
  showDeleteModal.value = false;
  if (deleteStep.value === "success") router.push("/");
}

onMounted(fetchBookDetails);
</script>