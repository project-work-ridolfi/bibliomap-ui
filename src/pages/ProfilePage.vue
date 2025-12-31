<template>
  <main class="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main">
    <button
      @click="router.back()"
      class="flex items-center text-theme-main hover:text-zomp transition-colors font-medium rounded-lg p-1"
    >
      <i class="fa-solid fa-arrow-left mr-2"></i> Torna indietro
    </button>

    <div v-if="isLoading" role="status" class="text-center py-20 opacity-70">
      <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-2 text-zomp"></i>
      <p class="uppercase text-[10px] font-bold tracking-widest">Caricamento profilo...</p>
    </div>

    <div v-else-if="profile" class="grid md:grid-cols-4 gap-8">
      
      <aside class="md:col-span-1 space-y-6">
        <header class="space-y-2">
          <h1 class="text-3xl font-display text-theme-main break-words leading-tight">
            {{ profile.userName }}
          </h1>
        </header>

        <div v-if="isMapVisible" class="h-64 shadow-lg rounded-xl overflow-hidden border border-thistle">
          <MiniMap :lat="profile.coords?.latitude" :lng="profile.coords?.longitude" />
        </div>

        <section class="bg-theme-primary p-5 rounded-xl shadow border border-thistle space-y-4">
          <h3 class="font-bold text-lg border-b border-thistle pb-2 mb-3 lowercase">Dati Utente</h3>
          <dl class="text-sm space-y-3">
            <div class="flex justify-between">
              <dt class="opacity-70">Libri totali:</dt>
              <dd class="font-bold">{{ userCounters.myBooksCount || 0 }}</dd>
            </div>
          </dl>

          <button 
            v-if="isMyProfile" 
            @click="isEditMode = !isEditMode"
            class="w-full btn-primary !py-3 flex items-center justify-center gap-2"
          >
            <i class="fa-solid" :class="isEditMode ? 'fa-eye' : 'fa-user-gear'"></i>
            {{ isEditMode ? 'Vedi Profilo' : 'Gestisci Profilo' }}
          </button>

          <div v-else-if="isAuthenticated" class="pt-4 border-t border-thistle">
            <p class="text-[10px] font-black uppercase opacity-60 mb-1">Affinità Gusti</p>
            <p class="text-2xl font-display text-zomp">{{ affinityScore }}%</p>
            <p class="text-[10px] italic opacity-60 leading-tight">{{ affinityMessage }}</p>
          </div>
        </section>
      </aside>

      <section class="md:col-span-3 space-y-10">

        <div v-if="isEditMode && isMyProfile" class="animate-fade-in space-y-8">
          <div class="flex justify-center gap-4 mb-[-2px] relative z-10">
            <button @click="activeTab = 'settings'" :class="activeTab === 'settings' ? 'tab-active' : 'tab-inactive'">
              <VueFeather type="user" size="20" class="mr-2"></VueFeather> GESTIONE PROFILO
            </button>
            <button @click="activeTab = 'loans'" :class="activeTab === 'loans' ? 'tab-active' : 'tab-inactive'">
              <VueFeather type="repeat" size="20" class="mr-2"></VueFeather> GESTIONE RICHIESTE
            </button>
          </div>

          <div class="main-container relative z-0">
             <div v-if="activeTab === 'settings'" class="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
                <div class="space-y-8">
                   <div class="space-y-4">
                      <h3 class="font-display text-xs uppercase text-zomp tracking-widest">credenziali</h3>
                      <div>
                        <label class="block text-[10px] font-bold uppercase mb-1 opacity-60">username</label>
                        <input v-model="profileForm.username" type="text" class="input-field" :class="{'border-red-500': profileForm.username && !usernameAvailability}" />
                        <p v-if="isUsernameModified && !usernameAvailability" class="text-[10px] text-red-500 mt-1 font-bold uppercase">occupato</p>
                        <p v-else-if="isUsernameModified && usernameAvailability" class="text-[10px] text-zomp mt-1 font-bold uppercase">disponibile</p>
                      </div>
                      <button @click="handleUpdateUsername" :disabled="!isUsernameModified || !usernameAvailability" class="btn-primary uppercase">salva username</button>

                      <div class="pt-6 border-t border-thistle mt-6">
                        <button v-if="!isChangingPassword" @click="isChangingPassword = true" class="btn-outline uppercase">cambia password</button>
                        <div v-else class="space-y-4">
                          <input v-model="passwordForm.old" type="password" placeholder="pass attuale" class="input-field" />
                          <input v-model="passwordForm.new" type="password" placeholder="nuova pass" class="input-field" @input="validatePassword" />
                          <input v-model="passwordForm.confirm" type="password" placeholder="conferma" class="input-field" />
                          <div class="flex gap-2">
                            <button @click="updatePassword" :disabled="!isPasswordValid" class="flex-1 btn-primary uppercase">salva</button>
                            <button @click="isChangingPassword = false" class="flex-1 btn-outline uppercase">chiudi</button>
                          </div>
                        </div>
                      </div>
                   </div>
                   <div class="pt-6 border-t border-thistle space-y-4">
                      <h3 class="font-display text-xs uppercase text-paynes-gray tracking-widest">documenti e dati</h3>
                      <button @click="openLegal('privacy')" class="w-full btn-outline !text-[10px]">privacy policy</button>
                      <button @click="openLegal('terms')" class="w-full btn-outline !text-[10px]">termini e condizioni</button>
                      <button @click="handleExportRequest" class="w-full text-[10px] font-bold uppercase py-2 border-2 border-dashed border-ash-gray rounded-xl">richiedi copia dati</button>
                   </div>
                </div>

                <div class="space-y-8">
                   <div class="space-y-4">
                      <h3 class="font-display text-xs uppercase text-zomp tracking-widest">privacy mappa</h3>
                      <select v-model="profileForm.visibility" class="input-field font-bold text-[11px]">
                        <option value="all">pubblico</option>
                        <option value="logged-in">utenti registrati</option>
                        <option value="private">privato</option>
                      </select>
                      <input v-model.number="profileForm.blurRadius" type="range" min="0" max="500" step="10" class="w-full accent-zomp" />
                      <button @click="handlePrivacyUpdate" class="btn-primary uppercase">salva privacy</button>
                   </div>
                   <div class="pt-6 border-t border-thistle space-y-4">
                      <h3 class="font-display text-xs uppercase text-zomp tracking-widest">la tua posizione</h3>
                      <div id="mini-map-edit" class="h-32 rounded-xl border-2 border-thistle"></div>
                      <button @click="router.push('/set-location')" class="w-full btn-outline uppercase">cambia posizione</button>
                   </div>
                   <button @click="confirmDelete = true" class="text-[10px] font-bold uppercase text-red-600 hover:underline w-full text-right">elimina account</button>
                </div>
             </div>

             <div v-else-if="activeTab === 'loans'" class="animate-fade-in space-y-12">
                <section>
                  <h3 class="font-display text-xs uppercase mb-6 text-zomp tracking-widest underline underline-offset-8">richieste ricevute</h3>
                  <div v-for="loan in incomingLoans" :key="loan.id" class="flex justify-between items-center p-5 border border-thistle rounded-2xl mb-4">
                    <span class="font-bold text-sm uppercase">{{ loan.title }}</span>
                    <div class="flex gap-3">
                      <button @click="manageLoan(loan.id, 'ACCEPT')" class="px-6 py-2 bg-zomp text-white rounded-lg font-bold text-[10px]">SI</button>
                      <button @click="manageLoan(loan.id, 'REJECT')" class="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-bold text-[10px]">NO</button>
                    </div>
                  </div>
                </section>
             </div>
          </div>
        </div>

        <div v-else class="space-y-12 animate-fade-in">
          <div class="space-y-4">
            <h2 class="text-xl font-display uppercase tracking-widest border-b border-thistle pb-2">Insights Patrimonio</h2>
            <UserStats :userId="profileId" />
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-display uppercase tracking-widest border-b border-thistle pb-2">Librerie Pubbliche</h2>
            <div v-if="libraries.length === 0" class="p-10 bg-[var(--bg-secondary)] rounded-xl border border-thistle text-center opacity-60 italic">
              Nessuna libreria disponibile per questo utente.
            </div>
            <LibraryAccordion
              v-for="lib in libraries"
              :key="lib.id"
              :library="lib"
              :isOwner="isMyProfile"
              @toggle="handleToggleLibrary(lib.id)"
            />
          </div>
        </div>
      </section>
    </div>

    <AppModal :is-open="confirmDelete" title="eliminazione profilo" @close="confirmDelete = false">
      <div class="p-4 text-center space-y-6 text-theme-main">
        <p class="text-sm uppercase font-bold">attenzione operazione irreversibile</p>
        <div class="flex gap-4">
          <button @click="handleDeleteAccount" class="flex-1 btn-red">conferma</button>
          <button @click="confirmDelete = false" class="flex-1 btn-outline">annulla</button>
        </div>
      </div>
    </AppModal>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/appModal.vue";
import MiniMap from "@/components/miniMap.vue";
import LibraryAccordion from "@/components/libraryAccordion.vue";
import UserStats from "@/components/userStats.vue";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from "@/utils/legalTexts";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// UI States
const isLoading = ref(true);
const isEditMode = ref(false);
const activeTab = ref("settings");
const isChangingPassword = ref(false);
const confirmDelete = ref(false);

// Data States
const profile = ref(null);
const userCounters = ref({ myBooksCount: 0 });
const libraries = ref([]);
const incomingLoans = ref([]);

// Form States
const profileForm = reactive({ username: "", visibility: "all", blurRadius: 0 });
const passwordForm = reactive({ old: "", new: "", confirm: "" });
const usernameAvailability = ref(true);

const profileId = computed(() => route.params.id);
const isMyProfile = computed(() => profileId.value === authStore.userId);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isMapVisible = computed(() => profile.value?.coords && (isMyProfile.value || profile.value.visibility !== 'private'));

// Affinità
const affinityScore = ref(0);
const affinityMessage = ref("");

async function fetchProfileData() {
  isLoading.value = true;
  try {
    // 1. Dati Profilo DTO
    const resProfile = await apiClient.get(`/users/${profileId.value}`);
    profile.value = resProfile;
    
    if (isMyProfile.value) {
      profileForm.username = resProfile.userName;
      profileForm.visibility = resProfile.visibility;
      profileForm.blurRadius = resProfile.blurRadius;
    }

    // 2. Counters
    const resCount = await apiClient.get(`/stats/user/${profileId.value}/counters`);
    userCounters.value = resCount;

    // 3. Caricamento Librerie (ciclo ID)
    const libDetails = [];
    if (resProfile.libraryIds) {
      for (const lid of resProfile.libraryIds) {
        try {
          const detail = await apiClient.get(`/libraries/${lid}`);
          libDetails.push({ ...detail, isOpen: false, books: [] });
        } catch (e) { console.error("Libreria non accessibile", lid); }
      }
    }
    libraries.value = libDetails;

    // 4. Affinità
    if (!isMyProfile.value && isAuthenticated.value) calculateAffinity();
    
    // 5. Loans se è il mio
    if (isMyProfile.value) {
      const loans = await apiClient.get("/loan/requests/incoming");
      incomingLoans.value = loans || [];
    }

  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

async function handleToggleLibrary(libId) {
  const lib = libraries.value.find(l => l.id === libId);
  if (!lib) return;
  lib.isOpen = !lib.isOpen;
  if (lib.isOpen && lib.books.length === 0) {
    const res = await apiClient.get(`/libraries/${libId}`);
    lib.books = res.books || [];
  }
}

async function calculateAffinity() {
  try {
    const myStats = await apiClient.get(`/stats/user/${authStore.userId}/full`);
    const targetTags = Object.keys(profile.value.topTags || {});
    const myTags = myStats.weeklyRequests?.labels || [];
    const common = targetTags.filter(t => myTags.includes(t));
    affinityScore.value = Math.round((common.length / Math.max(targetTags.length, 1)) * 100);
    affinityMessage.value = affinityScore.value > 50 ? "Anime gemelle letterarie!" : "Gusti differenti, scambiate idee!";
  } catch (e) { affinityScore.value = 0; }
}

// Logic Gestione
const isUsernameModified = computed(() => profileForm.username !== profile.value?.userName);
async function handleUpdateUsername() {
  await apiClient.put(`/users/${authStore.userId}/username`, { username: profileForm.username });
  await authStore.fetchCurrentUser();
  fetchProfileData();
}

async function handlePrivacyUpdate() {
  await apiClient.put(`/users/${authStore.userId}/privacy`, { 
    visibility: profileForm.visibility, 
    blurRadius: profileForm.blurRadius 
  });
  await authStore.fetchCurrentUser();
}

async function handleDeleteAccount() {
  await apiClient.delete(`/users/me`);
  authStore.logout();
  window.location.href = "/";
}

async function manageLoan(id, action) {
  await apiClient.patch(`/loan/${id}/status`, { action });
  const loans = await apiClient.get("/loan/requests/incoming");
  incomingLoans.value = loans || [];
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '---';

onMounted(fetchProfileData);
watch(() => route.params.id, fetchProfileData);
</script>

<style scoped>
.font-display { font-family: "Mochiy Pop P One", cursive; }
.main-container { background: var(--bg-primary); border: 2px solid var(--thistle); border-radius: 1.5rem; padding: 2.5rem; }
.tab-active { padding: 1rem 2rem; border: 2px solid var(--thistle); border-bottom-color: var(--bg-primary); border-top-left-radius: 1rem; border-top-right-radius: 1rem; color: var(--zomp); font-family: "Mochiy Pop P One"; font-size: 12px; background: var(--bg-primary); z-index: 20; }
.tab-inactive { padding: 1rem 2rem; border: 2px solid transparent; color: var(--paynes-gray); font-family: "Mochiy Pop P One"; font-size: 12px; opacity: 0.6; }
.input-field { width: 100%; padding: 0.75rem; border: 2px solid var(--ash-gray); border-radius: 0.75rem; background: transparent; outline: none; }
.btn-primary { background: var(--zomp); color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: bold; font-size: 11px; transition: opacity 0.2s; }
.btn-outline { border: 2px solid var(--zomp); color: var(--zomp); padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: bold; font-size: 11px; background: transparent; }
.btn-red { background: #ef4444; color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: bold; font-size: 11px; width: 100%; }
</style>