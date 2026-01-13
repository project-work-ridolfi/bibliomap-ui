<template>
  <!-- Overlay modale visibile solo se isOpen è true -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-paynes-gray bg-opacity-70 backdrop-blur-sm transition-opacity"
    @click.self="emit('close')">
    <!-- Contenitore principale della modale -->
    <div
      class="bg-theme-primary rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto m-4 p-6 border-2 border-thistle animate-fade-in">
      <!-- Header modale con titolo e pulsante chiudi -->
      <div
        class="flex justify-between items-start border-b border-thistle pb-2 mb-4 sticky top-0 bg-theme-primary z-10">
        <!-- Titolo modale -->
        <h2 class="text-xl font-bold font-display text-paynes-gray">
          {{ title }}
        </h2>
        <!-- Bottone per chiudere la modale -->
        <button
          @click="emit('close')"
          class="text-paynes-gray hover:text-red-500 p-1 rounded-full transition-colors"
          aria-label="Chiudi modale">
          <VueFeather type="x" size="20"></VueFeather>
        </button>
      </div>

      <!-- Contenuto HTML passato come prop -->
      <div
        v-if="content"
        class="text-paynes-gray prose max-w-none"
        v-html="content"></div>

      <!-- Slot per contenuto custom se prop content è vuoto -->
      <div v-else class="text-paynes-gray">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import VueFeather from "vue-feather";

// Props per il componente modale
defineProps({
  isOpen: { type: Boolean, required: true }, // Stato visibilità modale
  title: { type: String, required: true },   // Titolo della modale
  content: { type: String, default: "" },    // Contenuto HTML opzionale
});

// Eventi emessi dalla modale
const emit = defineEmits(["close"]); // Chiudi modale
</script>

<style scoped>
/* Stile per titoli h2 all'interno di prose */
.prose h2 {
  font-family: "Caveat Brush", cursive;
  color: var(--zomp);
  margin-top: 1.5em;
}

/* Stile per titoli h3 all'interno di prose */
.prose h3 {
  color: var(--paynes-gray);
  border-bottom: 1px solid var(--thistle);
  padding-bottom: 0.3em;
}

/* Stile per paragrafi e liste nella modale */
.prose p,
.prose li {
  font-family: "Quicksand", sans-serif;
  font-size: 0.95em;
}
</style>
