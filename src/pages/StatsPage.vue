<template>
  <main class="max-w-6xl mx-auto p-6 space-y-10 animate-fade-in text-theme-main">
    <header>
      <h1 class="text-3xl font-display">bibliomap <span class="text-zomp">insights</span></h1>
      <p class="opacity-60 text-sm">analisi e numeri della community</p>
    </header>

    <section v-if="authStore.isAuthenticated" class="space-y-4">
      <h2 class="text-sm font-black tracking-widest opacity-40">le tue statistiche</h2>
      <UserStats :userId="authStore.userId" />
    </section>

    <section class="space-y-4">
      <h2 class="text-sm font-black tracking-widest opacity-40">statistiche globali</h2>
      <GlobalStats /> 
    </section>
  </main>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import UserStats from '@/components/userStats.vue';
import GlobalStats from '@/components/globalStats.vue';
const authStore = useAuthStore();
</script>