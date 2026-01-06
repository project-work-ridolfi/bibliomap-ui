<template>
  <main
    class="max-w-4xl mx-auto p-6 space-y-12 animate-fade-in text-theme-main">
    <section id="chi-siamo" class="scroll-mt-24 space-y-4">
      <h1 class="text-4xl font-display text-zomp uppercase">Chi Siamo</h1>
      <div
        class="prose prose-sm dark:prose-invert max-w-none border-l-4 border-tea-rose pl-4 py-2 bg-theme-secondary/30 rounded-r-xl">
        <p class="text-lg">
          <strong>BIBLIOMAP</strong> è un'applicazione web nata come progetto finale per il corso di laurea in Informatica per le aziende digitali presso
          l'<strong>Università Telematica Pegaso</strong>.
        </p>
        <p>
          L'obiettivo del progetto è favorire il riuso e la condivisione della
          cultura attraverso una piattaforma di scambio libri basata sulla
          geolocalizzazione, promuovendo l'aggregazione sociale e la
          sostenibilità ambientale.
        </p>
        <br></br>
        <p class="text-s italic opacity-90  text-right">
          Sviluppato da: Adriana Ridolfi <br />
          Matricola: 0312301425 <br />
        </p>
      </div>
    </section>

    <hr class="border-thistle opacity-30" />

    <section id="termini" class="scroll-mt-24 legal-content">
      <div v-html="TERMS_AND_CONDITIONS"></div>
    </section>

    <hr class="border-thistle opacity-30" />

    <section id="privacy" class="scroll-mt-24 legal-content pb-20">
      <div v-html="PRIVACY_POLICY"></div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from "@/utils/legalTexts";

const route = useRoute();

// Funzione per gestire lo scroll all'id presente nell'URL
const scrollToHash = () => {
  if (route.hash) {
    const el = document.querySelector(route.hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

onMounted(scrollToHash);
// Se l'utente clicca un link diverso mentre è già nella pagina
watch(() => route.hash, scrollToHash);
</script>

<style scoped>
/* Stili per rendere il testo legale (HTML iniettato) coerente col tema */
.legal-content :deep(h1) {
  @apply text-3xl font-display text-zomp mb-6 uppercase;
}
.legal-content :deep(h2) {
  @apply text-xl font-bold text-paynes-gray mt-8 mb-4 border-b border-thistle pb-2 uppercase;
}
.legal-content :deep(h3) {
  @apply text-sm font-bold text-paynes-gray mt-6 mb-2 uppercase opacity-80;
}
.legal-content :deep(p) {
  @apply text-sm leading-relaxed mb-4 opacity-90;
}
.legal-content :deep(ul) {
  @apply list-disc list-inside text-sm mb-4 space-y-1 opacity-90;
}
.legal-content :deep(table) {
  @apply w-full text-xs mb-6 border-collapse border border-thistle;
}
.legal-content :deep(th),
.legal-content :deep(td) {
  @apply border border-thistle p-2 text-left;
}
.legal-content :deep(hr) {
  @apply border-t border-thistle opacity-20 my-8;
}
</style>
