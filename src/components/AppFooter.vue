<template>
  <footer class="bg-gray-900 text-white mt-auto border-t border-gray-800">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="text-center mb-6">
        <!-- Titolo principale del footer -->
        <h3 class="text-2xl font-display text-zomp mb-2 uppercase">bibliomap</h3>
        <!-- Descrizione/claim del progetto -->
        <p class="text-gray-400 text-sm italic">
          Scopri, condividi e scambia libri nella tua comunità
        </p>
      </div>

      <div class="flex flex-wrap justify-center gap-6 mb-6 text-xs font-bold uppercase tracking-widest">
        <!-- Link alla sezione Chi Siamo -->
        <router-link 
          to="/about#chi-siamo" 
          class="text-gray-400 hover:text-white transition"
          aria-label="Chi Siamo">
          Chi Siamo
        </router-link>
        <!-- Link alla Privacy Policy -->
        <router-link 
          to="/about#privacy" 
          class="text-gray-400 hover:text-white transition"
          aria-label="Privacy Policy">
          Privacy Policy
        </router-link>
        <!-- Link ai Termini e Condizioni -->
        <router-link 
          to="/about#termini" 
          class="text-gray-400 hover:text-white transition"
          aria-label="Termini e Condizioni">
          Termini e Condizioni
        </router-link>
        <!-- Link per contattare via mail -->
        <a 
          href="mailto:adriana.ridolfi@studenti.unipegaso.it" 
          class="text-gray-400 hover:text-white transition font-sans"
          aria-label="Contatta via email">
          Contatti
        </a>
      </div>

      <!-- Copyright e informazioni aggiuntive -->
      <div class="text-center text-gray-500 text-[10px] uppercase tracking-tighter">
        <p>&copy; 2026 BiblioMap. Tutti i diritti riservati.</p>
        <p class="mt-1">Project work di Adriana Ridolfi, matricola: 0312301425</p>
        <p>Università Telematica Pegaso</p>
      </div>
    </div>
  </footer>
</template>
