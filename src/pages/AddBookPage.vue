<template>
  <div class="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl border-2 border-thistle space-y-6 text-center">
    <div class="book-avatar mx-auto mb-4" style="background-color: #fac8cd; width: 80px; height: 80px;">
        <i class="fa-solid fa-book text-4xl text-white"></i>
    </div>
    
    <h1 class="text-3xl font-display text-paynes-gray">📚 Complimenti! Sei Pronto!</h1>
    <h2 class="text-2xl font-display text-zomp">Aggiungi il tuo primo libro a Bibliomap!</h2>
    
    <p class="text-paynes-gray text-lg">
      Inizia la tua esperienza di condivisione di libri! Il primo passo è aggiungere un volume alla tua libreria virtuale.
    </p>

    <div class="p-6 bg-ash-gray/20 rounded-lg">
        <p class="text-sm font-medium text-paynes-gray mb-3">
            Puoi usare il codice ISBN o inserire i dettagli manualmente.
        </p>
        <button
            @click="router.push('/add-book-form')"
            class="w-full bg-zomp text-white py-3 rounded-lg hover:bg-paynes-gray transition duration-150 font-bold text-lg flex items-center justify-center gap-2"
        >
            <i class="fa-solid fa-plus-circle text-xl"></i> Aggiungi un Libro
        </button>
    </div>
    
    <p class="mt-6 text-sm text-paynes-gray">
      Potrai farlo anche in seguito dalla tua pagina profilo o dalla pagina 'Aggiungi'.
    </p>

    <button
        @click="router.push('/map')"
        class="text-sm text-thistle hover:text-paynes-gray underline mt-4"
    >
        Vai alla Mappa (Salva per dopo)
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>