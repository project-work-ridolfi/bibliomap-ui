<template>
  <main class="max-w-4xl mx-auto p-6 space-y-8 relative">
    <button
      @click="goBack"
      aria-label="torna alla pagina precedente"
      class="flex items-center text-paynes-gray hover:text-zomp transition-colors font-medium mb-4 focus:outline-none focus:ring-2 focus:ring-zomp rounded-lg p-1">
      <i class="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>
      Torna indietro
    </button>

    <div
      v-if="isLoading"
      role="status"
      class="text-center py-10 text-paynes-gray/70">
      <i
        class="fa-solid fa-circle-notch fa-spin text-3xl mb-2"
        aria-hidden="true"></i>
      <p>recupero dettagli libro...</p>
    </div>

    <div
      v-else-if="error"
      role="alert"
      class="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
      <p class="text-red-700 font-medium">Errore: {{ error }}</p>
      <button
        @click="fetchBookDetails"
        class="mt-2 underline text-sm text-paynes-gray hover:text-black focus:outline-none focus:ring-2 focus:ring-red-500 rounded">
        Riprova
      </button>
    </div>

    <article
      v-else-if="book"
      class="bg-white shadow-xl rounded-2xl border-2 border-thistle overflow-hidden">
      <div class="md:grid md:grid-cols-3">
        <section
          class="bg-ash-gray/10 p-6 md:col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-thistle">
          <div
            class="relative w-48 h-72 shadow-lg rounded-lg overflow-hidden bg-white">
            <img
              v-if="displayCover"
              :src="displayCover"
              :alt="`Copertina del libro ${book.title}`"
              class="w-full h-full object-cover" />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-paynes-gray/10 text-paynes-gray"
              aria-label="copertina non disponibile">
              <i
                class="fa-solid fa-book text-4xl opacity-50"
                aria-hidden="true"></i>
            </div>
          </div>

          <div class="mt-6">
            <span
              :class="statusBadgeClass"
              class="px-4 py-2 rounded-full text-sm font-bold shadow-sm border">
              {{ statusLabel }}
            </span>
          </div>
        </section>

        <section
          class="p-6 md:col-span-2 flex flex-col justify-between space-y-6">
          <header>
            <h1 class="text-3xl font-display text-paynes-gray mb-1">
              {{ book.title }}
            </h1>
            <h2 class="text-xl text-paynes-gray/80 font-medium">
              di {{ book.author }}
            </h2>
          </header>

          <div class="space-y-3">
            <h3
              class="text-sm font-bold uppercase tracking-wider text-paynes-gray/60 border-b border-thistle pb-1">
              Dettagli Edizione
            </h3>

            <dl class="text-paynes-gray space-y-2 text-sm">
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center">
                  <i
                    class="fa-solid fa-calendar-days w-5 text-zomp mr-1"
                    aria-hidden="true"></i>
                  Anno:
                </dt>
                <dd>
                  <strong>{{ book.publicationYear || "N/D" }}</strong>
                </dd>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center">
                  <i
                    class="fa-solid fa-building w-5 text-zomp mr-1"
                    aria-hidden="true"></i>
                  Editore:
                </dt>
                <dd>
                  <strong>{{ book.publisher || "N/D" }}</strong>
                </dd>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center">
                  <i
                    class="fa-solid fa-book-open w-5 text-zomp mr-1"
                    aria-hidden="true"></i>
                  Formato:
                </dt>
                <dd>
                  <strong>{{ book.coverType || "N/D" }}</strong>
                </dd>
              </div>
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center">
                  <i
                    class="fa-solid fa-language w-5 text-zomp mr-1"
                    aria-hidden="true"></i>
                  Lingua:
                </dt>
                <dd>
                  <strong>{{ book.language || "Italiano" }}</strong>
                </dd>
              </div>
            </dl>

            <h3
              class="text-sm font-bold uppercase tracking-wider text-paynes-gray/60 border-b border-thistle pb-1 mt-4">
              Info Copia
            </h3>
            <dl class="text-paynes-gray space-y-2 text-sm">
              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center">
                  <i
                    class="fa-solid fa-location-dot w-5 text-zomp mr-1"
                    aria-hidden="true"></i>
                  Libreria:
                </dt>
                <dd>
                  <router-link
                    :to="`/libraries/${book.libraryId}`"
                    class="font-bold text-paynes-gray hover:text-zomp underline decoration-2 underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-zomp rounded px-1 -ml-1"
                    :aria-label="`Vai alla libreria ${book.libraryName}`">
                    {{ book.libraryName }}
                  </router-link>
                </dd>
              </div>

              <div class="grid grid-cols-[100px_1fr] items-center">
                <dt class="flex items-center">
                  <i
                    class="fa-solid fa-heart-pulse w-5 text-zomp mr-1"
                    aria-hidden="true"></i>
                  Condizioni:
                </dt>
                <dd>
                  <strong>{{ book.condition }}</strong>
                </dd>
              </div>
            </dl>
          </div>

          <div v-if="book.tags && book.tags.length > 0">
            <div class="flex flex-wrap gap-2 mt-2" aria-label="Tag del libro">
              <span
                v-for="tag in book.tags"
                :key="tag"
                class="px-3 py-1 bg-ash-gray/30 text-paynes-gray text-xs rounded-full border border-thistle/50">
                #{{ tag }}
              </span>
            </div>
          </div>

          <div
            v-if="book.ownerNotes"
            class="relative bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-sm text-gray-600 italic mt-2">
            <i
              class="fa-solid fa-quote-left absolute top-2 left-2 text-yellow-400 text-xl opacity-80"
              aria-hidden="true"></i>
            <p class="px-4 py-1 text-center">
              {{ book.ownerNotes }}
            </p>
            <i
              class="fa-solid fa-quote-right absolute bottom-2 right-2 text-yellow-400 text-xl opacity-80"
              aria-hidden="true"></i>
          </div>

          <div class="pt-4 border-t border-thistle flex justify-end">
            <div v-if="isOwner" class="flex space-x-3">
              <button
                @click="router.push(`/books/${book.id}/edit`)"
                aria-label="modifica dettagli libro"
                title="Modifica"
                class="p-3 text-paynes-gray hover:bg-ash-gray/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-zomp">
                <i
                  class="fa-solid fa-pen-to-square text-lg"
                  aria-hidden="true"></i>
              </button>

              <button
                @click="openMoveModal"
                aria-label="sposta in altra libreria"
                title="Sposta in altra libreria"
                class="p-3 text-paynes-gray hover:bg-ash-gray/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-zomp">
                <i
                  class="fa-solid fa-right-left text-lg"
                  aria-hidden="true"></i>
              </button>

              <button
                @click="openDeleteModal"
                aria-label="elimina libro definitivamente"
                title="Elimina"
                class="p-3 text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                <i class="fa-solid fa-trash text-lg" aria-hidden="true"></i>
              </button>
            </div>

            <div v-else>
              <button
                v-if="book.status === 'available'"
                @click="openLoanConfirmModal"
                class="bg-zomp text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-opacity-90 transition transform hover:-translate-y-0.5 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zomp">
                <i
                  class="fa-solid fa-hand-holding-heart mr-2"
                  aria-hidden="true"></i>
                Chiedi in Prestito
              </button>
              <button
                v-else
                disabled
                aria-disabled="true"
                class="bg-ash-gray text-white px-6 py-3 rounded-xl font-bold cursor-not-allowed opacity-70">
                Non Disponibile
              </button>
            </div>
          </div>
        </section>
      </div>
    </article>

    <AppModal
      :isOpen="showMoveModal"
      title="Sposta Copia"
      @close="showMoveModal = false">
      <div class="space-y-4 max-w-full">
        <p
          class="text-xs font-bold uppercase tracking-widest text-paynes-gray opacity-60">
          Seleziona destinazione:
        </p>

        <div v-if="isFetchingLibraries" class="text-center py-6">
          <i class="fa-solid fa-circle-notch fa-spin text-zomp text-xl"></i>
        </div>

        <div
          v-else
          class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          <button
            v-for="lib in userLibraries"
            :key="lib.id"
            @click="confirmMove(lib.id)"
            :disabled="lib.id === book.libraryId"
            class="w-full text-left p-3 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group"
            :class="
              lib.id === book.libraryId
                ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                : 'border-thistle hover:border-zomp hover:bg-zomp/5 active:scale-[0.98]'
            ">
            <span
              class="font-bold text-sm truncate pr-2"
              :class="
                lib.id === book.libraryId
                  ? 'text-paynes-gray/50'
                  : 'text-paynes-gray group-hover:text-zomp'
              ">
              {{ lib.name }}
            </span>

            <div
              v-if="lib.id === book.libraryId"
              class="shrink-0 flex items-center gap-1.5 text-[9px] font-black uppercase text-zomp bg-zomp/10 px-2 py-1 rounded-md">
              <i class="fa-solid fa-location-dot"></i>
              Qui
            </div>
            <div
              v-else
              class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <i class="fa-solid fa-chevron-right text-zomp text-xs"></i>
            </div>
          </button>
        </div>

        <div class="pt-2">
          <button
            @click="showMoveModal = false"
            class="w-full py-2 text-xs font-bold text-paynes-gray/60 hover:text-red-500 transition-colors uppercase tracking-widest">
            Annulla
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal
      :isOpen="showDeleteModal"
      :title="deleteModalTitle"
      @close="handleModalClose">
      <div
        v-if="deleteStep === 'confirm'"
        class="flex flex-col items-center text-center space-y-4">
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
          <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>

        <p class="text-lg font-medium text-paynes-gray">
          Sei sicuro di voler eliminare questo libro?
        </p>

        <p
          class="text-sm text-gray-500 bg-red-50 p-3 rounded-lg border border-red-100">
          <i class="fa-solid fa-circle-info mr-1"></i>
          Questa azione è <strong>irreversibile</strong>. Il libro verrà rimosso
          permanentemente dalla tua libreria.
        </p>

        <div class="flex gap-3 w-full mt-4">
          <button
            @click="showDeleteModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-bold transition">
            Annulla
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition flex justify-center items-center gap-2">
            <i class="fa-solid fa-trash"></i> Elimina
          </button>
        </div>
      </div>

      <div
        v-else-if="deleteStep === 'loading'"
        class="flex flex-col items-center justify-center py-8 space-y-4">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500"></i>
        <p class="text-paynes-gray font-medium">Eliminazione in corso...</p>
      </div>

      <div
        v-else-if="deleteStep === 'success'"
        class="flex flex-col items-center text-center space-y-4">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-zomp mb-2 animate-bounce">
          <i class="fa-solid fa-check text-3xl"></i>
        </div>
        <h3 class="text-xl font-bold text-paynes-gray">Libro Eliminato!</h3>
        <p class="text-sm text-gray-600">
          L'operazione è andata a buon fine. Verrai reindirizzato alla Home
          Page.
        </p>
        <button
          @click="handleModalClose"
          class="w-full mt-4 px-4 py-2 bg-zomp text-white rounded-lg hover:bg-opacity-90 font-bold transition">
          Chiudi e vai alla Home
        </button>
      </div>
    </AppModal>

    <AppModal
      :isOpen="isLoanConfirmModalOpen"
      title="Richiesta di Prestito"
      @close="isLoanConfirmModalOpen = false">
      <div v-if="book" class="space-y-4 text-paynes-gray">
        <p class="text-sm">
          Confermi di voler inviare una richiesta di prestito per il libro:
        </p>
        <div class="p-3 bg-gray-100 border border-thistle rounded-lg">
          <p class="font-bold text-base">{{ book.title }}</p>
          <p class="text-xs italic opacity-80">di {{ book.author }}</p>
          <p class="text-xs mt-2">
            Proprietario:
            <span class="font-semibold">{{ book.ownerName }}</span>
          </p>
        </div>

        <p class="text-xs font-semibold text-red-500">
          Il proprietario riceverà una notifica e dovrà approvare la richiesta.
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="isLoanConfirmModalOpen = false"
            class="px-4 py-2 rounded-lg transition text-sm font-bold border border-gray-300 hover:bg-gray-50">
            Annulla
          </button>
          <button
            @click="confirmLoanRequest"
            :disabled="isSendingLoan"
            class="bg-zomp text-white px-4 py-2 rounded-lg hover:bg-paynes-gray transition text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <i
              v-if="isSendingLoan"
              class="fa-solid fa-circle-notch fa-spin"></i>
            {{ isSendingLoan ? "Invio..." : "Conferma Richiesta" }}
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal
      :isOpen="isLoanResultModalOpen"
      :title="loanResultTitle"
      @close="isLoanResultModalOpen = false">
      <div class="space-y-4">
        <div v-if="loanResultIcon" class="flex justify-center text-4xl">
          <i class="fa-solid" :class="loanResultIcon"></i>
        </div>
        <p class="text-sm text-paynes-gray text-center">
          {{ loanResultMessage }}
        </p>

        <div class="flex justify-center pt-2">
          <button
            @click="isLoanResultModalOpen = false"
            class="bg-paynes-gray text-white px-4 py-2 rounded-lg hover:bg-zomp transition text-sm font-bold">
            OK
          </button>
        </div>
      </div>
    </AppModal>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/AppModal.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// states
const book = ref(null);
const isLoading = ref(true);
const error = ref(null);

// move states
const showMoveModal = ref(false);
const userLibraries = ref([]);
const isFetchingLibraries = ref(false);

// loan states
const isLoanConfirmModalOpen = ref(false);
const isLoanResultModalOpen = ref(false);
const isSendingLoan = ref(false);
const loanResultTitle = ref("");
const loanResultMessage = ref("");
const loanResultIcon = ref(null);

// computed
const isOwner = computed(() => {
  if (!book.value || !authStore.userId) return false;
  return book.value.ownerId === authStore.userId;
});

// Priorità immagine: customCover (Base64) > coverUrl (URL)
const displayCover = computed(() => {
  if (!book.value) return null;
  return book.value.customCover || book.value.coverUrl;
});

const statusBadgeClass = computed(() => {
  if (!book.value) return "";
  if (book.value.status === "available") {
    return "bg-green-100 text-green-800 border-green-200";
  } else {
    return "bg-orange-100 text-orange-800 border-orange-200";
  }
});

const statusLabel = computed(() => {
  if (!book.value) return "";
  return book.value.status === "available" ? "Disponibile" : "In Prestito";
});

// methods
function goBack() {
  router.back();
}

async function fetchBookDetails() {
  isLoading.value = true;
  const bookId = route.params.id;
  error.value = null;
  try {
    const response = await apiClient.get(`/books/${bookId}`);
    book.value = response;
  } catch (err) {
    error.value = "Impossibile caricare il libro.";
  } finally {
    isLoading.value = false;
  }
}

// GESTIONE SPOSTAMENTO
async function openMoveModal() {
  showMoveModal.value = true;
  isFetchingLibraries.value = true;
  try {
    const res = await apiClient.get("/users/me/libraries");
    userLibraries.value = res.libraries || [];
  } catch (e) {
    console.error("Errore caricamento librerie");
  } finally {
    isFetchingLibraries.value = false;
  }
}

async function confirmMove(newLibraryId) {
  try {
    // Chiamata all'endpoint PATCH specifico per lo spostamento
    await apiClient.patch(`/copies/${book.value.id}/move`, {
      libraryId: newLibraryId,
    });
    showMoveModal.value = false;
    // Ricarichiamo i dettagli per aggiornare il nome della libreria a video
    await fetchBookDetails();
  } catch (e) {
    alert("Errore durante lo spostamento");
  }
}

// PRESTITO
function openLoanConfirmModal() {
  if (!authStore.isAuthenticated) {
    router.push("/login");
    return;
  }
  isLoanConfirmModalOpen.value = true;
}

async function confirmLoanRequest() {
  if (!book.value || book.value.status !== "available") return;
  isLoanConfirmModalOpen.value = false;
  isSendingLoan.value = true;
  try {
    await apiClient.post(`/loan/${book.value.id}`, {});
    loanResultTitle.value = "Richiesta Inviata";
    loanResultMessage.value = `Richiesta inviata con successo.`;
    loanResultIcon.value = "fa-circle-check text-green-500";
  } catch (e) {
    loanResultTitle.value = "Errore Richiesta";
    loanResultMessage.value = "Si è verificato un problema.";
    loanResultIcon.value = "fa-circle-xmark text-red-500";
  } finally {
    isSendingLoan.value = false;
    isLoanResultModalOpen.value = true;
  }
}

// ELIMINAZIONE
const showDeleteModal = ref(false);
const deleteStep = ref("confirm");
const deleteModalTitle = computed(() => {
  switch (deleteStep.value) {
    case "confirm":
      return "Conferma Eliminazione";
    case "loading":
      return "Attendere...";
    case "success":
      return "Operazione Completata";
    case "error":
      return "Errore";
    default:
      return "";
  }
});

function openDeleteModal() {
  deleteStep.value = "confirm";
  showDeleteModal.value = true;
}

async function confirmDelete() {
  deleteStep.value = "loading";
  try {
    await apiClient.delete(`/copies/${book.value.id}`);
    setTimeout(() => {
      deleteStep.value = "success";
    }, 800);
  } catch (e) {
    deleteStep.value = "error";
  }
}

function handleModalClose() {
  showDeleteModal.value = false;
  if (deleteStep.value === "success") router.push("/");
}

onMounted(() => {
  fetchBookDetails();
});
</script>
