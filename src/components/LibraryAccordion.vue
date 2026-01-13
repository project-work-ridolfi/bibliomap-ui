<template>
  <div
    class="bg-theme-primary rounded-xl shadow-sm border border-[var(--thistle)] overflow-hidden mb-4 transition">
    <div
      @click="$emit('toggle')"
      class="p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition"
      aria-label="Apri o chiudi la libreria">
      <div class="flex items-center gap-4">
        <div
          class="w-10 h-10 rounded-lg bg-[var(--paynes-gray)] text-white flex items-center justify-center shadow-sm"
          aria-label="Icona libreria">
          <i class="fa-solid fa-book-bookmark"></i>
        </div>
        <div>
          <h3 class="font-bold text-lg text-theme-main" :aria-label="`Nome libreria ${library.name}`">{{ library.name }}</h3>
          <p
            v-if="library.books && library.books.length > 0"
            class="text-[10px] opacity-60 font-black tracking-widest"
            :aria-label="`${library.books.length} libri presenti`">
            {{ library.books.length }} libri
          </p>
          <p v-else class="text-[10px] opacity-60 font-black tracking-widest" aria-label="Clicca per caricare i libri">
            clicca per caricare i libri
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <router-link
          :to="`/libraries/${library.id}`"
          @click.stop
          class="btn-book-footer view"
          title="Vedi dettagli libreria"
          aria-label="Vedi dettagli libreria">
          <i class="fa-solid fa-eye"></i>
        </router-link>

        <router-link
          v-if="isOwner"
          :to="`/libraries/${library.id}/edit`"
          @click.stop
          class="p-2 text-ash-gray hover:text-zomp transition"
          title="Modifica libreria"
          aria-label="Modifica libreria">
          <i class="fa-solid fa-pen-to-square"></i>
        </router-link>

        <router-link
          v-if="isOwner"
          :to="{ path: '/add-book', query: { libraryId: library.id } }"
          @click.stop
          class="p-2 text-ash-gray hover:text-zomp transition"
          title="Aggiungi nuovo libro alla libreria"
          aria-label="Aggiungi libro">
          <i class="fa-solid fa-plus-circle text-xl"></i>
        </router-link>

        <button
          v-if="isOwner"
          @click.stop="$emit('delete-library', library)"
          class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
          title="Elimina libreria"
          aria-label="Elimina libreria">
          <i class="fa-solid fa-trash-can"></i>
        </button>

        <i
          class="fa-solid fa-chevron-down transition-transform duration-300 text-gray-300"
          :class="{ 'rotate-180 text-[var(--zomp)]': library.isOpen }"
          aria-label="Apri o chiudi lista libri"></i>
      </div>
    </div>

    <div
      v-if="library.isOpen"
      class="bg-[var(--bg-secondary)]/30 border-t border-[var(--thistle)] p-4 transition">
      <div v-if="library.isLoadingBooks" class="text-center py-6" aria-label="Caricamento libri in corso">
        <i
          class="fa-solid fa-circle-notch fa-spin text-[var(--zomp)] text-xl"
          aria-label="Icona caricamento"></i>
      </div>

      <draggable
        v-model="internalBooks"
        group="books"
        item-key="id"
        :disabled="!isOwner"
        @change="handleMove"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[50px]"
        aria-label="Lista libri">
        <template #item="{ element: book }">
          <div
            class="book-card-content book-card group relative book-card-hover"
            :class="isOwner ? 'cursor-move' : 'cursor-default'"
            :aria-label="`Libro ${book.title} di ${book.author}, stato ${book.status}`">
            <div
              class="book-cover flex-shrink-0 overflow-hidden relative border border-[var(--thistle)]/30"
              aria-label="Copertina libro">
              
              <img
                :src="resolveCover(book)"
                class="w-full h-full object-cover"
                :alt="`Copertina di ${book.title}`"/>

              <router-link
                :to="`/books/${book.id}`"
                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                aria-label="Visualizza libro">
                <i class="fa-solid fa-eye"></i>
              </router-link>
            </div>

            <div
              class="book-info justify-between py-0.5">
              <div>
                <h4 class="book-title" :aria-label="`Titolo libro: ${book.title}`">
                  {{ book.title }}
                </h4>
                <p
                  class="book-author truncate italic"
                  :aria-label="`Autore: ${book.author}`">
                  {{ book.author }}
                </p>
              </div>
              <div>
                <span
                  class="text-[9px] font-black px-1.5 py-0.5 rounded bg-[var(--bg-secondary)]text-theme-main border border-[var(--thistle)]/20"
                  :aria-label="`Stato: ${book.status}`">
                  {{ book.status }}
                </span>
              </div>
            </div>

            <button
              v-if="
                book.status &&
                book.status.toLowerCase() === 'available' &&
                isOwner
              "
              @click.stop="
                $emit('delete-book', { book, libraryId: library.id })
              "
              class="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition p-1"
              title="Rimuovi libro"
              aria-label="Rimuovi libro">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </template>
      </draggable>

      <div
        v-if="
          !library.isLoadingBooks &&
          (!library.books || library.books.length === 0)
        "
        class="text-center py-4 welcome-subtitle"
        aria-label="Nessun libro presente">
        Nessun libro presente in questa libreria.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import draggable from "vuedraggable"
import { apiClient } from "@/services/apiClient"

const props = defineProps({
  library: Object,
  isOwner: Boolean, 
})

const emit = defineEmits([
  "toggle",
  "bookMoved",
  "delete-library",
  "delete-book",
])

// array copertine statiche per fallback
const DEFAULT_COVERS = [
  "/images/cover_default_1.png",
  "/images/cover_default_2.png",
  "/images/cover_default_3.png",
  "/images/cover_default_4.png",
  "/images/cover_default_5.png",
  "/images/cover_default_6.png",
  "/images/cover_default_7.png"
]

// logica risoluzione immagine: custom > url > default hash
const resolveCover = (book) => {
  if (book.customCover) {
    return book.customCover.startsWith("data:") 
      ? book.customCover 
      : `data:image/jpeg;base64,${book.customCover}`
  }
  
  if (book.coverUrl) return book.coverUrl

  // generazione indice deterministico basato su id
  let hash = 0
  const str = book.id || "default"
  for (let i = 0; i < str.length; i++) {
    hash += str.charCodeAt(i)
  }
  return DEFAULT_COVERS[hash % DEFAULT_COVERS.length]
}

const internalBooks = computed({
  get: () => props.library.books || [],
  set: (val) => {
    props.library.books = val
  },
})

const handleMove = async (evt) => {
  if (evt.added) {
    const bookId = evt.added.element.id
    const toLibraryId = props.library.id

    try {
      await apiClient.patch(`/copies/${bookId}/move`, {
        libraryId: toLibraryId,
      })

      emit("bookMoved", {
        bookId: bookId,
        toLibraryId: toLibraryId,
      })
    } catch (err) {
      console.error("errore durante lo spostamento del libro", err)
    }
  }
}
</script>