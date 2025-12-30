<template>
  <main class="max-w-7xl mx-auto p-6 space-y-8">
    <button
      @click="goBack"
      aria-label="torna alla pagina precedente"
      class="flex items-center text-paynes-gray hover:text-zomp transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-zomp rounded-lg p-1">
      <i class="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>
      Torna indietro
    </button>

    <div
      v-if="isLoading"
      role="status"
      class="text-center py-20 text-paynes-gray/70">
      <i
        class="fa-solid fa-circle-notch fa-spin text-4xl mb-2"
        aria-hidden="true"></i>
      <p>Caricamento libreria...</p>
    </div>

    <div
      v-else-if="error"
      role="alert"
      class="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
      <p class="text-red-700 font-medium">Errore: {{ error }}</p>
    </div>

    <div
      v-else-if="!library"
      role="alert"
      class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
      <p class="text-yellow-700 font-medium">
        Libreria non trovata o non accessibile.
      </p>
    </div>

    <div v-else class="grid md:grid-cols-4 gap-8">
      <aside class="md:col-span-1 space-y-6">
        <header>
          <h1 class="text-3xl font-display text-paynes-gray mb-1">
            {{ library.name }}
          <button
            v-if="isOwner"
            @click="router.push(`/libraries/${library.id}/edit`)"
            aria-label="Modifica dettagli libreria"
            title="Modifica Libreria"
            class="p-2 text-paynes-gray hover:bg-ash-gray/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-zomp">
            <i class="fa-solid fa-pen-to-square text-lg" aria-hidden="true"></i>
          </button>
           </h1>
        </header>

        <section
          v-if="isMapVisible"
          class="bg-gray-100 h-64 rounded-xl overflow-hidden shadow-lg border border-thistle">
          <div
            class="w-full h-full flex items-center justify-center text-paynes-gray/60">
            <i class="fa-solid fa-map-location-dot text-3xl mr-2"></i>
            Area Mappa (Mock)
          </div>
        </section>

        <section class="bg-white p-4 rounded-xl shadow border border-thistle">
          <h3 class="font-bold text-lg text-paynes-gray border-b pb-2 mb-3">
            Info
          </h3>
          <dl class="text-sm space-y-2">
            <div>
              <dt class="font-medium text-paynes-gray/70">Proprietario:</dt>
              <dd class="font-bold">{{ library.ownerName || "Utente anonimo" }}</dd>
            </div>
            <div>
              <dt class="font-medium text-paynes-gray/70">Visibilità:</dt>
              <dd class="font-bold">{{ visibility }}</dd>
            </div>
            <div>
              <dt class="font-medium text-paynes-gray/70">Libri:</dt>
              <dd class="font-bold">{{ books.totalCount }} totali</dd>
            </div>
          </dl>
        </section>
      </aside>

      <section class="md:col-span-3 space-y-6">
        <h2 class="text-2xl font-bold text-paynes-gray border-b pb-2">
          Libri in Libreria ({{ books.totalCount }})
        </h2>

        <div
          v-if="books.list.length === 0"
          class="p-6 bg-gray-50 rounded-xl border border-thistle text-center text-paynes-gray/70">
          <i class="fa-solid fa-book-open-reader text-4xl mb-3"></i>
          <p class="font-medium">Nessun libro trovato.</p>
        </div>

        <ul v-else class="space-y-4">
          <li
            v-for="book in books.list"
            :key="book.id"
            class="bg-white shadow rounded-lg p-4 flex items-center justify-between border border-thistle">
            <div class="flex items-center space-x-4">
              <div
                class="relative w-16 h-24 flex-shrink-0 shadow-md rounded-md overflow-hidden bg-gray-200">
                <img
                  v-if="book.coverUrl"
                  :src="book.coverUrl"
                  :alt="`Copertina di ${book.title}`"
                  class="w-full h-full object-cover" />
                <i
                  v-else
                  class="fa-solid fa-book text-xl text-gray-500 flex items-center justify-center h-full"></i>
              </div>

              <div>
                <h3 class="text-lg font-bold text-paynes-gray">
                  {{ book.title }}
                </h3>
                <p class="text-sm text-paynes-gray/80">di {{ book.author }}</p>
                <span
                  :class="
                    book.status === 'available'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-orange-100 text-orange-800 border-orange-200'
                  "
                  class="mt-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border">
                  {{
                    book.status === "available" ? "Disponibile" : "In Prestito"
                  }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <button
                @click="router.push(`/books/${book.id}`)"
                aria-label="Vedi dettagli completi del libro"
                title="Vedi Dettagli"
                class="p-3 text-paynes-gray hover:text-zomp hover:bg-ash-gray/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-zomp">
                <i class="fa-solid fa-eye text-lg"></i>
              </button>

              <div v-if="isOwner" class="flex space-x-2 border-l pl-3">
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
                  @click="alert('Funzionalità Sposta (mock)')"
                  aria-label="sposta in altra libreria"
                  title="Sposta in altra libreria"
                  class="p-3 text-paynes-gray hover:bg-ash-gray/20 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-zomp">
                  <i
                    class="fa-solid fa-right-left text-lg"
                    aria-hidden="true"></i>
                </button>
                <button
                  @click="alert('Funzionalità Elimina (mock)')"
                  aria-label="elimina libro definitivamente"
                  title="Elimina"
                  class="p-3 text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <i class="fa-solid fa-trash text-lg" aria-hidden="true"></i>
                </button>
              </div>

              <div v-else-if="isAuthenticated" class="border-l pl-3">
                <button
                  v-if="book.status === 'available'"
                  @click="openLoanConfirmModal(book)"
                  class="bg-zomp text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-opacity-90 transition transform hover:-translate-y-0.5 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zomp">
                  <i
                    class="fa-solid fa-hand-holding-heart mr-2"
                    aria-hidden="true"></i>
                  Prestito
                </button>
                <span v-else class="text-sm text-gray-500"
                  >Non disponibile</span
                >
              </div>
            </div>
          </li>
        </ul>

        <div
          v-if="books.totalCount > books.pageSize"
          class="flex justify-center pt-4">
          <button
            @click="handlePageChange(books.currentPage - 1)"
            :disabled="books.currentPage === 0"
            class="p-2 mr-2 border rounded">
            Precedente
          </button>
          <span class="p-2"
            >Pagina {{ books.currentPage + 1 }} di
            {{ Math.ceil(books.totalCount / books.pageSize) }}</span
          >
          <button
            @click="handlePageChange(books.currentPage + 1)"
            :disabled="
              (books.currentPage + 1) * books.pageSize >= books.totalCount
            "
            class="p-2 ml-2 border rounded">
            Successiva
          </button>
        </div>
      </section>
    </div>

    <AppModal
      :isOpen="isLoanConfirmModalOpen"
      title="Richiesta di Prestito"
      @close="isLoanConfirmModalOpen = false">
      <div v-if="currentBook" class="space-y-4 text-paynes-gray">
        <p class="text-sm">Confermi la richiesta di prestito per:</p>
        <div class="p-3 bg-gray-100 border border-thistle rounded-lg">
          <p class="font-bold text-base">{{ currentBook.title }}</p>
          <p class="text-xs mt-2">
            Proprietario:
            <span class="font-semibold">{{
              currentBook.ownerName || "Utente anonimo"
            }}</span>
          </p>
        </div>

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
import AppModal from "@/components/AppModal.vue"; // necessaria per le modali

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// states
const library = ref(null);
const books = ref({ list: [], totalCount: 0, currentPage: 0, pageSize: 10 });
const isLoading = ref(true);
const error = ref(null);
const visibility = ref("Tutti"); // visibilità libreria

// loan modals states
const currentBook = ref(null);
const isLoanConfirmModalOpen = ref(false);
const isLoanResultModalOpen = ref(false);
const isSendingLoan = ref(false);
const loanResultTitle = ref("");
const loanResultMessage = ref("");
const loanResultIcon = ref(null);

// computed
const isAuthenticated = computed(() => authStore.isAuthenticated);

const isOwner = computed(() => {
  // verifica se l'id del proprietario della libreria (ownerid) corrisponde all'id utente loggato
  if (!library.value || !authStore.userId) return false;
  return library.value.ownerId === authStore.userId;
});

const isMapVisible = computed(() => {
  // visibile se pubblica ('all' nel be) o se sei il proprietario
  return (
    isOwner.value ||
    (library.value &&
      (library.value.visibility === "public" ||
        library.value.visibility === "all"))
  );
});

// methods

function goBack() {
  router.back();
}

// logica per il cambio pagina
async function handlePageChange(newPage) {
  // se nuova pagina è valida
  if (newPage >= 0 && newPage * books.value.pageSize < books.value.totalCount) {
    await fetchLibraryDetails(newPage);
    window.scrollTo(0, 0);
  }
}

async function fetchLibraryDetails(page = 0) {
  isLoading.value = true;
  error.value = null;
  const libraryId = route.params.id;
  const pageSize = books.value.pageSize;

  try {
    // chiamo l'api senza parametri di paginazione, perché il be non li gestisce
    const response = await apiClient.get(`/libraries/${libraryId}`);

    // i dati della libreria sono al livello superiore
    library.value = {
      id: response.id,
      name: response.name,
      visibility: response.visibility,
      ownerId: response.ownerId,
      ownerName: response.ownerName,
    };

    const vis = response.visibility;
    if (vis === "public" || vis === "all") {
      visibility.value = "Tutti";
    } else if (vis === "private") {
      visibility.value = "Privata";
    } else {
      visibility.value = "Utenti registrati";
    }
    // --- correzione per api che restituisce l'array dei libri direttamente in 'books' ---
    const rawBooks = response.books || []; // l'array completo di bookdetaildto
    const total = rawBooks.length;

    // simulazione di paginazione client-side
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedList = rawBooks.slice(start, end);

    books.value = {
      list: paginatedList,
      totalCount: total,
      currentPage: page,
      pageSize: pageSize,
    };
  } catch (err) {
    console.error("fetch error:", err);
    // gestione errore 404/403
    if (
      err.response &&
      (err.response.status === 404 || err.response.status === 403)
    ) {
      error.value =
        err.response.data?.message ||
        "libreria non trovata o non autorizzato a vederla.";
      library.value = null; // nasconde il layout principale
    } else {
      error.value = "impossibile caricare i dettagli della libreria.";
    }
  } finally {
    isLoading.value = false;
  }
}

// *** logica prestito libro ***

function openLoanConfirmModal(bookItem) {
  // reindirizza al login se non autenticato
  if (!isAuthenticated.value) {
    router.push("/login");
    return;
  }

  // estende l'oggetto bookitem con l'ownername preso dal livello superiore della libreria
  // perché i bookdetaildto annidati hanno ownername: null
  currentBook.value = {
    ...bookItem,
    ownerName: library.value.ownerName,
  };

  isLoanConfirmModalOpen.value = true;
}

async function confirmLoanRequest() {
  if (!currentBook.value || currentBook.value.status !== "available") return;

  isLoanConfirmModalOpen.value = false;
  isSendingLoan.value = true;
  loanResultTitle.value = "";
  loanResultMessage.value = "";
  loanResultIcon.value = null;

  try {
    // copia id è currentbook.value.id
    const response = await apiClient.post(`/loan/${currentBook.value.id}`, {});

    loanResultTitle.value = "richiesta inviata";
    loanResultMessage.value = `richiesta inviata al proprietario ${currentBook.value.ownerName || "anonimo"}. sarai notificato quando sarà approvata. id: ${response.loanId}`;
    loanResultIcon.value = "fa-circle-check text-green-500";
  } catch (e) {
    console.error("errore richiesta prestito", e);
    const errorMessage =
      e.response?.data?.message || "errore durante l'invio della richiesta.";

    loanResultTitle.value = "errore richiesta";
    loanResultMessage.value = `si è verificato un problema: ${errorMessage}`;
    loanResultIcon.value = "fa-circle-xmark text-red-500";
  } finally {
    isSendingLoan.value = false;
    isLoanResultModalOpen.value = true;
    currentBook.value = null;
  }
}

// hooks
onMounted(() => {
  // chiamiamo fetchlibrarydetails con pagina 0 all'inizio
  fetchLibraryDetails();
});
</script>
