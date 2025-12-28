<template>
  <div
    class="bg-theme-primary rounded-xl shadow-sm border border-[var(--thistle)] overflow-hidden mb-4">
    <div
      @click="$emit('toggle')"
      class="p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition">
      <div class="flex items-center gap-4">
        <div
          class="w-10 h-10 rounded-lg bg-[var(--paynes-gray)] text-white flex items-center justify-center">
          <i class="fa-solid fa-book-bookmark"></i>
        </div>
        <div>
          <h3 class="font-bold text-lg text-theme-main">{{ library.name }}</h3>
          <p
            v-if="library.books && library.books.length > 0"
            class="text-xs opacity-60 uppercase tracking-widest">
            {{ library.books.length }} libri
          </p>
          <p v-else class="text-xs opacity-60 uppercase tracking-widest">
             clicca per caricare i libri
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <router-link
          :to="{ path: '/add-book', query: { libraryId: library.id } }"
          @click.stop
          class="p-2 text-[var(--zomp)] hover:bg-[var(--zomp)]/10 rounded-full transition">
          <i class="fa-solid fa-plus-circle text-xl"></i>
        </router-link>

        <button
          @click.stop="$emit('delete-library', library)"
          class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
          <i class="fa-solid fa-trash-can"></i>
        </button>

        <i
          class="fa-solid fa-chevron-down transition-transform duration-300 text-gray-300"
          :class="{ 'rotate-180 text-[var(--zomp)]': library.isOpen }"></i>
      </div>
    </div>

    <div
      v-if="library.isOpen"
      class="bg-[var(--bg-secondary)]/50 border-t border-[var(--thistle)] p-4">
      <div v-if="library.isLoadingBooks" class="text-center py-4">
        <i class="fa-solid fa-circle-notch fa-spin text-[var(--zomp)]"></i>
      </div>

      <draggable
        v-model="internalBooks"
        group="books"
        item-key="id"
        @change="handleMove"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[50px]">
        <template #item="{ element: book }">
          <div
            class="flex gap-3 bg-theme-primary p-3 rounded-lg border border-[var(--thistle)] group relative cursor-move">
            <div
              class="w-12 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
              <img
                v-if="book.coverUrl"
                :src="book.coverUrl"
                class="w-full h-full object-cover" />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400">
                <i class="fa-solid fa-book"></i>
              </div>
            </div>
            <div class="flex-grow min-w-0 text-sm">
              <h4 class="font-bold text-theme-main truncate">
                {{ book.title }}
              </h4>
              <p class="text-[10px] opacity-60 truncate">{{ book.author }}</p>
              <span
                class="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--paynes-gray)]">
                {{ book.status }}
              </span>
            </div>

            <button
              v-if="book.status && book.status.toLowerCase() === 'available'"
              @click.stop="
                $emit('delete-book', { book, libraryId: library.id })
              "
              class="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition p-1">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";

const props = defineProps(["library"]);
const emit = defineEmits([
  "toggle",
  "bookMoved",
  "delete-library",
  "delete-book",
]);

const internalBooks = computed({
  get: () => props.library.books || [],
  set: (val) => {},
});

const handleMove = (evt) => {
  if (evt.added) {
    emit("bookMoved", {
      bookId: evt.added.element.id,
      toLibraryId: props.library.id,
    });
  }
};
</script>
