<template>
  <footer class="bg-gray-900 text-white mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Tagline -->
      <div class="text-center mb-6">
        <h3 class="text-2xl font-bold mb-2">BiblioMap</h3>
        <p class="text-gray-400 text-sm">
          📚 Scopri, condividi e scambia libri nella tua comunità
        </p>
      </div>

      <!-- Links -->
      <div class="flex flex-wrap justify-center gap-6 mb-6 text-sm">
        <router-link to="/about" class="text-gray-400 hover:text-white transition">
          Chi Siamo
        </router-link>
        <router-link to="/privacy" class="text-gray-400 hover:text-white transition">
          Privacy Policy
        </router-link>
        <router-link to="/terms" class="text-gray-400 hover:text-white transition">
          Termini e Condizioni
        </router-link>
        <a href="mailto:info@bibliomap.it" class="text-gray-400 hover:text-white transition">
          Contatti
        </a>
      </div>

      <!-- Copyright -->
      <div class="text-center text-gray-500 text-xs">
        <p>&copy; 2025 BiblioMap. Tutti i diritti riservati.</p>
        <p class="mt-1">Progetto di tesi - Università Pegaso</p>
      </div>
    </div>
  </footer>
</template>