<template>
  <div
    class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main font-sans">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-display text-theme-main tracking-tight">
          le tue <span class="text-[var(--zomp)]">librerie</span>
        </h1>
        <p class="opacity-70 text-sm mt-1">gestisci i tuoi spazi di lettura</p>
      </div>
      <router-link
        to="/library"
        class="bg-[var(--zomp)] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition transform hover:scale-105">
        <i class="fa-solid fa-plus"></i>
        nuova libreria
      </router-link>
    </div>

    <div v-if="isLoading" class="text-center py-20">
      <i
        class="fa-solid fa-circle-notch fa-spin text-4xl text-[var(--zomp)]"></i>
    </div>

    <div v-else class="space-y-3">
      <div
        v-if="libraries.length === 0"
        class="text-center py-20 border-2 border-dashed border-[var(--thistle)] rounded-2xl">
        <p class="italic opacity-60 font-bold">nessuna libreria presente.</p>
      </div>

      <LibraryAccordion
        v-for="lib in libraries"
        :key="lib.id"
        :library="lib"
        :is-owner="true"
        @toggle="toggleLibrary(lib.id)"
        @bookMoved="moveBook"
        @delete-library="handleOpenDeleteUI('library', $event)"
        @delete-book="handleOpenDeleteUI('book', $event.book)" />
    </div>

    <AppModal
      :is-open="confirmModal.show"
      :title="deleteModalTitle"
      @close="confirmModal.show = false">
      <div class="p-6 text-center space-y-4 text-theme-main">
        <template v-if="confirmModal.step === 'confirm'">
          <div
            class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2">
            <i class="fa-solid fa-triangle-exclamation text-3xl"></i>
          </div>

          <p class="text-lg font-medium">{{ confirmModal.message }}</p>

          <p
            class="text-sm opacity-70 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]">
            <i class="fa-solid fa-circle-info mr-1"></i>
            Questa azione è <strong>irreversibile</strong>.
          </p>

          <div class="flex gap-3 pt-4">
            <button
              @click="confirmModal.show = false"
              class="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] font-bold transition">
              Annulla
            </button>
            <button
              @click="handleExecuteDelete"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md transition">
              {{ confirmModal.confirmBtn }}
            </button>
          </div>
        </template>

        <template v-else-if="confirmModal.step === 'loading'">
          <div class="py-8">
            <i
              class="fa-solid fa-circle-notch fa-spin text-4xl text-red-500 mb-4"></i>
            <p class="font-bold">Eliminazione in corso...</p>
          </div>
        </template>

        <template v-else-if="confirmModal.step === 'success'">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-zomp mx-auto mb-2 animate-bounce">
            <i class="fa-solid fa-check text-3xl"></i>
          </div>
          <h3 class="text-xl font-bold">Operazione completata!</h3>
          <p class="text-sm opacity-70">{{ confirmModal.successMsg }}</p>
          <button
            @click="confirmModal.show = false"
            class="w-full mt-4 px-4 py-2 bg-zomp text-white rounded-lg font-bold transition">
            Chiudi
          </button>
        </template>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { apiClient } from "@/services/apiClient";
import LibraryAccordion from "@/components/LibraryAccordion.vue";
import AppModal from "@/components/AppModal.vue";
import { deleteConfig, executeDeletion } from "@/utils/helpers";

const libraries = ref([]);
const isLoading = ref(true);

// Stato modale centralizzato
const confirmModal = reactive({
  show: false,
  step: "confirm",
  type: "",
  id: null,
  title: "",
  message: "",
  confirmBtn: "",
  successMsg: "",
});

const deleteModalTitle = computed(() => {
  if (confirmModal.step === "loading") return "Attendere...";
  if (confirmModal.step === "success") return "Completato";
  return confirmModal.title;
});

onMounted(fetchLibraries);

async function fetchLibraries() {
  isLoading.value = true;
  try {
    const res = await apiClient.get("/users/me/libraries");
    const data = res.libraries || [];
    libraries.value = data.map((l) => {
      const existing = libraries.value.find((ex) => ex.id === l.id);
      return {
        ...l,
        isOpen: existing ? existing.isOpen : false,
        books: existing ? existing.books : [],
        isLoadingBooks: false,
      };
    });
  } finally {
    isLoading.value = false;
  }
}

async function toggleLibrary(libId) {
  const lib = libraries.value.find((l) => l.id === libId);
  if (!lib) return;
  lib.isOpen = !lib.isOpen;
  if (lib.isOpen && lib.books.length === 0) {
    lib.isLoadingBooks = true;
    try {
      const res = await apiClient.get(`/libraries/${libId}`);
      lib.books = res.books || [];
    } finally {
      lib.isLoadingBooks = false;
    }
  }
}

async function moveBook({ bookId, toLibraryId }) {
  try {
    await apiClient.patch(`/copies/${bookId}/move`, { libraryId: toLibraryId });
    await fetchLibraries();
  } catch (e) {
    await fetchLibraries();
  }
}

// LOGICA APERTURA MODALE HELPERS
function handleOpenDeleteUI(type, data) {
  confirmModal.type = type;
  confirmModal.id = data.id;

  const config = deleteConfig[type];
  const displayName = type === "library" ? data.name : data.title;

  confirmModal.title = config.title;
  confirmModal.message = config.message(displayName);
  confirmModal.confirmBtn = config.confirmBtn;
  confirmModal.successMsg = config.successMsg;

  confirmModal.step = "confirm";
  confirmModal.show = true;
}

// LOGICA ESECUZIONE HELPERS
async function handleExecuteDelete() {
  confirmModal.step = "loading";
  const res = await executeDeletion(confirmModal.type, confirmModal.id);

  if (res.success) {
    confirmModal.step = "success";
    await fetchLibraries();
  } else {
    confirmModal.show = false;
    alert(res.error);
  }
}
</script>

