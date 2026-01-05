<template>
  <main class="max-w-4xl mx-auto p-6 space-y-8 relative">
    <button
      @click="goBack"
      aria-label="torna alla pagina precedente"
      class="flex items-center text-theme-main hover:text-zomp transition-colors font-medium mb-4 focus:outline-none focus:ring-2 focus:ring-zomp rounded-lg p-1 uppercase text-xs">
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
      <p class="text-red-700 dark:text-red-400 font-medium font-bold uppercase text-xs">
        Errore: {{ error }}
      </p>
      <button
        @click="fetchBookDetails"
        class="mt-2 underline text-xs font-bold uppercase text-theme-main hover:text-accent-color">
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
              class="w-full h-full flex items-center justify-center bg-theme-main/10 text-theme-main">
              <i class="fa-solid fa-book text-4xl opacity-50"></i>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3 items-center">
            <span
              :class="statusBadgeClass"
              class="px-4 py-2 rounded-full text-[10px] font-bold shadow-sm border uppercase tracking-wider">
              {{ statusLabel }}
            </span>
            <div class="flex items-center gap-1 text-[10px] font-bold opacity-60 uppercase tracking-tighter">
              <i class="fa-solid fa-eye"></i>
              {{ book.views || 0 }} visualizzazioni
            </div>
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
            <h3 class="text-[10px] font-bold tracking-widest text-theme-main opacity-60 border-b border-thistle pb-1 uppercase">
              Dettagli Edizione
            </h3>
            <dl class="text-theme-main space-y-2 text-sm">
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">Anno:</dt>
                <dd><strong class="text-xs">{{ book.publicationYear || "N/D" }}</strong></dd>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">Editore:</dt>
                <dd><strong class="text-xs">{{ book.publisher || "N/D" }}</strong></dd>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">Lingua:</dt>
                <dd><strong class="text-xs">{{ book.language || "Italiano" }}</strong></dd>
              </div>
            </dl>

            <h3 class="text-[10px] font-bold tracking-widest text-theme-main opacity-60 border-b border-thistle pb-1 mt-4 uppercase">
              Info Copia
            </h3>
            <dl class="text-theme-main space-y-2 text-sm">
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">Libreria:</dt>
                <dd>
                  <router-link :to="`/libraries/${book.libraryId}`" class="font-bold text-xs text-theme-main hover:text-zomp underline">
                    {{ book.libraryName }}
                  </router-link>
                </dd>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center opacity-70 text-[10px] font-bold uppercase">Condizione:</dt>
                <dd><strong class="text-xs">{{ mappedCondition }}</strong></dd>
              </div>
            </dl>
          </div>

          <div v-if="book.tags && book.tags.length > 0">
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="tag in book.tags" :key="tag" class="px-3 py-1 bg-zomp/10 text-accent-color text-[10px] font-bold uppercase rounded-full border border-accent-color/20">
                #{{ tag }}
              </span>
            </div>
          </div>

          <div v-if="book.ownerNotes" class="relative bg-theme-secondary p-6 rounded-xl border border-thistle text-sm text-theme-main italic mt-2">
            <p class="px-4 py-1 text-center">{{ book.ownerNotes }}</p>
          </div>

          <div class="pt-4 border-t border-thistle flex flex-wrap gap-3 justify-end items-center">
            
            <div v-if="isOwner" class="flex space-x-3">
              <button @click="router.push(`/books/${book.id}/edit`)" class="btn-pagination w-10 h-10"><i class="fa-solid fa-pen-to-square"></i></button>
              <button @click="openMoveModal" class="btn-pagination w-10 h-10"><i class="fa-solid fa-right-left"></i></button>
              <button @click="openDeleteModal" class="btn-pagination w-10 h-10 hover:bg-red-500 !text-red-500 hover:!text-white"><i class="fa-solid fa-trash"></i></button>
            </div>

            <div v-else class="flex flex-wrap gap-3">
              <button 
                @click="getSimilarBook" 
                :disabled="isSearchingSimilar"
                class="btn-sort px-6 py-3 uppercase text-xs tracking-widest flex items-center gap-2">
                <i :class="isSearchingSimilar ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'" class="fa-solid"></i>
                Suggerisci simile
              </button>

              <template v-if="authStore.isAuthenticated">
                <button
                  v-if="book.status === 'available'"
                  @click="openLoanConfirmModal"
                  class="btn-modal-confirm px-8 py-3 uppercase text-xs tracking-widest">
                  Chiedi in Prestito
                </button>
                <button v-else disabled class="px-8 py-3 bg-theme-secondary text-theme-main border border-border-color rounded-xl font-bold cursor-not-allowed opacity-40 uppercase text-xs tracking-widest">
                  In Prestito
                </button>
              </template>
              <template v-else>
                 <router-link
                  to="/login"
                  class="btn-modal-confirm px-8 py-3 uppercase text-xs tracking-widest text-center">
                  Accedi per richiedere
                </router-link>
              </template>
            </div>
          </div>
        </section>
      </div>
    </article>

    <section v-if="suggestedBook" class="custom-fade-in bg-zomp/5 border-2 border-dashed border-zomp/30 rounded-2xl p-6 text-center">
        <h3 class="text-xs font-bold uppercase text-zomp tracking-widest mb-4">Potrebbe interessarti anche questo volume:</h3>
        <div class="flex flex-col items-center gap-2">
            <p class="font-display text-lg text-theme-main">{{ suggestedBook.title }}</p>
            <p class="text-xs italic opacity-70 mb-4">di {{ suggestedBook.author }}</p>
            <button @click="goToSuggested" class="btn-modal-confirm px-6 py-2 uppercase text-[10px]">Vedi suggerimento</button>
        </div>
    </section>

    <AppModal :isOpen="showMoveModal" title="Sposta Copia" @close="showMoveModal = false">
        <div class="space-y-4 text-theme-main">
            <p class="text-[10px] font-bold tracking-widest opacity-60 uppercase">Seleziona destinazione:</p>
            <div v-if="isFetchingLibraries" class="text-center py-6"><i class="fa-solid fa-circle-notch fa-spin text-zomp"></i></div>
            <div v-else class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                <button v-for="lib in userLibraries" :key="lib.id" @click="confirmMove(lib.id)" :disabled="lib.id === book.libraryId"
                    class="w-full text-left p-3 rounded-xl border-2 transition-all"
                    :class="lib.id === book.libraryId ? 'opacity-40 cursor-not-allowed' : 'border-border-color bg-theme-primary hover:border-accent-color'">
                    <span class="font-bold text-xs uppercase">{{ lib.name }}</span>
                </button>
            </div>
        </div>
    </AppModal>

    <AppModal :isOpen="showDeleteModal" :title="deleteModalTitle" @close="handleModalClose">
        <div v-if="deleteStep === 'confirm'" class="flex flex-col items-center text-center space-y-4">
            <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600"><i class="fa-solid fa-triangle-exclamation text-3xl"></i></div>
            <p class="text-sm font-bold uppercase">{{ deleteUI.message }}</p>
            <div class="flex gap-3 w-full mt-4">
                <button @click="showDeleteModal = false" class="btn-modal-cancel flex-1 uppercase text-xs">Annulla</button>
                <button @click="confirmDelete" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-xs uppercase">Elimina</button>
            </div>
        </div>
        <div v-else-if="deleteStep === 'loading'" class="text-center py-8"><i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500"></i></div>
    </AppModal>

    <AppModal :isOpen="isLoanConfirmModalOpen" title="Richiesta di Prestito" @close="isLoanConfirmModalOpen = false">
        <div v-if="book" class="space-y-4 text-theme-main">
            <div class="p-4 bg-theme-secondary border border-border-color rounded-xl">
                <p class="font-bold text-sm uppercase tracking-tight">{{ book.title }}</p>
                <p class="text-[10px] italic opacity-70">di {{ book.author }}</p>
            </div>
            <div class="flex gap-3 pt-2">
                <button @click="isLoanConfirmModalOpen = false" class="btn-modal-cancel flex-1 uppercase text-xs font-bold">Annulla</button>
                <button @click="confirmLoanRequest" :disabled="isSendingLoan" class="btn-modal-confirm flex-1 justify-center text-xs uppercase tracking-widest">
                    {{ isSendingLoan ? 'Invio...' : 'Conferma' }}
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
import { deleteConfig, executeDeletion } from "@/utils/helpers";
import { CONDITIONS } from "@/utils/constants.js";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const book = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Suggerimenti
const isSearchingSimilar = ref(false);
const suggestedBook = ref(null);

// MAPPING CONDIZIONE
const mappedCondition = computed(() => {
  if (!book.value || !book.value.condition) return "N/D";
  const found = CONDITIONS.find(c => c.value.toLowerCase() === book.value.condition.toLowerCase());
  return found ? found.label : book.value.condition;
});

const showDeleteModal = ref(false);
const deleteStep = ref("confirm");
const deleteUI = reactive({ title: "", message: "", confirmBtn: "", successMsg: "" });
const showMoveModal = ref(false);
const userLibraries = ref([]);
const isFetchingLibraries = ref(false);
const isLoanConfirmModalOpen = ref(false);
const isSendingLoan = ref(false);

const isOwner = computed(() => book.value?.ownerId === authStore.userId);

const displayCover = computed(() => {
  if (!book.value) return null;
  if (book.value.customCover) {
     return book.value.customCover.startsWith("data:") ? book.value.customCover : `data:image/jpeg;base64,${book.value.customCover}`;
  }
  return book.value.coverUrl;
});

const statusBadgeClass = computed(() => {
  if (!book.value) return "";
  return book.value.status === "available" ? "bg-zomp text-white border-zomp" : "bg-theme-secondary text-theme-main border-border-color opacity-70";
});

const statusLabel = computed(() => book.value?.status === "available" ? "Disponibile" : "In Prestito");

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
  suggestedBook.value = null;
  try {
    const response = await apiClient.get(`/books/${route.params.id}`);
    book.value = response;
  } catch (err) {
    error.value = "Impossibile caricare il libro.";
  } finally {
    isLoading.value = false;
  }
}

// LOGICA SUGGERIMENTI
async function getSimilarBook() {
  isSearchingSimilar.value = true;
  try {
    // Chiamata all'endpoint del BE
    const response = await apiClient.get(`/books/${book.value.id}/similar`);
    if (response && response.id) {
        suggestedBook.value = response;
    } else {
        alert("Non abbiamo trovato libri simili nelle vicinanze al momento.");
    }
  } catch (e) {
    console.error("Errore ricerca simile:", e);
  } finally {
    isSearchingSimilar.value = false;
  }
}

function goToSuggested() {
    if (suggestedBook.value) {
        router.push(`/books/${suggestedBook.value.id}`);
    }
}

// Watcher per ricaricare i dati se cambiamo libro tramite suggerimento
watch(() => route.params.id, () => {
    fetchBookDetails();
});

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
  } catch (e) { alert("Errore durante lo spostamento"); }
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
    alert("Richiesta inviata con successo!");
  } catch (e) { alert("Errore durante l'invio della richiesta."); }
  finally { isSendingLoan.value = false; }
}

function openDeleteModal() {
  const config = deleteConfig.book;
  deleteUI.title = config.title;
  deleteUI.message = config.message(book.value.title);
  deleteStep.value = "confirm";
  showDeleteModal.value = true;
}

async function confirmDelete() {
  deleteStep.value = "loading";
  const res = await executeDeletion("book", book.value.id);
  if (res.success) {
    setTimeout(() => { deleteStep.value = "success"; }, 800);
  } else { deleteStep.value = "error"; }
}

function handleModalClose() {
  showDeleteModal.value = false;
  if (deleteStep.value === "success") router.push("/");
}

onMounted(fetchBookDetails);
</script>