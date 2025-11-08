<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-paynes-gray bg-opacity-70 backdrop-blur-sm transition-opacity" @click.self="emit('close')">
    
    <div class="bg-theme-primary rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto m-4 p-6 border-2 border-thistle">
      
      <div class="flex justify-between items-start border-b pb-2 mb-4 sticky top-0 bg-theme-primary z-10">
        <h2 class="text-xl font-bold font-display text-paynes-gray">{{ title }}</h2>
        <button @click="emit('close')" class="text-paynes-gray hover:text-tea-rose-red p-1 rounded-full" aria-label="Chiudi">
            <VueFeather type="x" size="20"></VueFeather>
        </button>
      </div>
      
      <div class="text-paynes-gray prose max-w-none" v-html="content"></div>

    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import VueFeather from 'vue-feather' // Importa il componente Icone

defineProps({
    /** Controlla la visibilità della modale */
    isOpen: {
        type: Boolean,
        required: true
    },
    /** Titolo visualizzato nell'header della modale */
    title: {
        type: String,
        required: true
    },
    /** Contenuto HTML (da markdown) da visualizzare nel corpo */
    content: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['close'])
</script>

<style scoped>
/* Adatta gli stili di un blocco di testo (prose) */
.prose h2 { font-family: 'Caveat Brush', cursive; color: var(--zomp); margin-top: 1.5em; }
.prose h3 { color: var(--paynes-gray); border-bottom: 1px solid var(--thistle); padding-bottom: 0.3em; }
.prose p, .prose li { font-family: 'Quicksand', sans-serif; font-size: 0.95em; }

/* Modalità Notte: adatta i colori interni al prose */
html.dark .prose h2, html.dark .prose h3 { color: var(--tea-rose-red); }
html.dark .prose p, html.dark .prose li { color: var(--text-primary); }
</style>