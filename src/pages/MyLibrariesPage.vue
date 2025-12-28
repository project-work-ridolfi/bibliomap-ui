<template>
  <div
    class="max-w-6xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main font-sans">
    <div class="flex justify-between items-center">
      <div>
        <h1
          class="text-3xl font-display text-theme-main uppercase tracking-tight">
          le tue <span class="text-[var(--zomp)]">librerie</span>
        </h1>
        <p class="opacity-70 text-sm lowercase mt-1">
          gestisci i tuoi spazi di lettura
        </p>
      </div>
      <router-link
        to="/library"
        class="bg-[var(--zomp)] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition transform hover:scale-105">
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
        <p class="italic opacity-60 lowercase font-bold">
          nessuna libreria presente.
        </p>
      </div>

      <LibraryAccordion
        v-for="lib in libraries"
        :key="lib.id"
        :library="lib"
        @toggle="toggleLibrary(lib.id)"
        @bookMoved="moveBook"
        @delete-library="openDeleteModal('library', $event)"
        @delete-book="openDeleteModal('book', $event)" />
    </div>

    <AppModal
      :is-open="confirmModal.show"
      :title="confirmModal.title"
      @close="confirmModal.show = false">
      <div class="p-6 text-center space-y-6">
        <div
          class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <p class="text-sm text-paynes-gray lowercase leading-relaxed font-bold">
          {{ confirmModal.message }}<br />
          <span class="font-black text-red-500 uppercase text-xs mt-2 block"
            >l'azione e' irreversibile.</span
          >
        </p>
        <div class="flex gap-3 pt-2">
          <button
            @click="confirmModal.show = false"
            class="flex-1 px-4 py-2 border-2 border-ash-gray rounded-xl font-bold uppercase text-[10px]">
            annulla
          </button>
          <button
            @click="handleDelete"
            class="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold uppercase text-[10px] hover:bg-red-600 transition">
            conferma elimina
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiClient } from "@/services/apiClient";
import LibraryAccordion from "@/components/LibraryAccordion.vue";
import AppModal from "@/components/AppModal.vue";

const router = useRouter();
const libraries = ref([]);
const isLoading = ref(true);
const confirmModal = ref({
  show: false,
  title: "",
  message: "",
  type: "",
  target: null,
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
    await apiClient.patch(`/books/${bookId}/move`, { libraryId: toLibraryId });
    await fetchLibraries();
  } catch (e) {
    await fetchLibraries();
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

async function handleDelete() {
  const { type, target } = confirmModal.value;
  try {
    if (type === "library") {
      await apiClient.delete(`/libraries/${target.id}`);
    } else {
      await apiClient.delete(`/copies/${target.book.id}`);
    }
    confirmModal.value.show = false;
    await fetchLibraries();
  } catch (e) {
    console.error(e);
  }
}
</script>
