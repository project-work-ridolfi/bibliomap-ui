<template>
  <main
    class="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in text-theme-main font-sans">
    <button
      @click="router.back()"
      class="flex items-center text-theme-main hover:text-zomp transition-colors font-medium rounded-lg p-1">
      <i class="fa-solid fa-arrow-left mr-2"></i> Torna indietro
    </button>

    <div v-if="isLoading" role="status" class="text-center py-20 opacity-70">
      <i class="fa-solid fa-circle-notch fa-spin text-4xl mb-2 text-zomp"></i>
      <p class="text-[10px] font-bold tracking-widest">
        Caricamento profilo...
      </p>
    </div>

    <div v-else-if="profile" class="grid md:grid-cols-4 gap-8">
      <aside class="md:col-span-1 space-y-6">
        <header class="space-y-2">
          <h1
            class="text-3xl font-display text-theme-main break-words leading-tight">
            {{ profile.userName }}
          </h1>
        </header>

        <div
          v-if="isMapVisible"
          class="h-64 shadow-lg rounded-xl overflow-hidden border border-thistle">
          <MiniMap
            :lat="profile.coords?.latitude"
            :lng="profile.coords?.longitude" />
        </div>

        <section
          class="bg-theme-primary p-5 rounded-xl shadow border border-thistle space-y-4">
          <h3
            class="font-bold text-lg border-b border-thistle pb-2 mb-3 text-theme-main">
            Dati Utente
          </h3>
          <dl class="text-sm space-y-3">
            <div class="flex justify-between">
              <dt class="opacity-70">Libri totali:</dt>
              <dd class="font-bold">{{ userCounters.myBooksCount || 0 }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="opacity-70">Visibilità profilo:</dt>
              <dd class="font-bold">{{ visibilityIta }}</dd>
            </div>
          </dl>

          <button
            v-if="isMyProfile"
            @click="toggleEditMode"
            class="w-full btn-primary !py-4 flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-transform">
            <i
              class="fa-solid"
              :class="isEditMode ? 'fa-eye' : 'fa-user-gear'"></i>
            <span class="tracking-widest">{{
              isEditMode ? "VEDI PROFILO" : "GESTISCI PROFILO"
            }}</span>
          </button>

          <div v-else-if="isAuthenticated" class="pt-4 border-t border-thistle">
            <p class="text-[10px] font-black opacity-60 mb-1">Affinità Gusti</p>
            <p class="text-2xl font-display text-zomp">{{ affinityScore }}%</p>
            <p class="text-[10px] italic opacity-60 leading-tight">
              {{ affinityMessage }}
            </p>
          </div>
        </section>
      </aside>

      <section class="md:col-span-3">
        <div v-if="isEditMode && isMyProfile" class="animate-fade-in">
          <h2
            class="text-2xl font-display tracking-widest border-b border-thistle pb-4 mb-8">
            Impostazioni Account
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div class="space-y-8">
              <div class="space-y-4">
                <h3 class="font-display text-s text-zomp tracking-widest">
                  Credenziali
                </h3>
                <div>
                  <label class="block text-[12px] font-bold mb-1 opacity-60"
                    >username</label
                  >
                  <input
                    v-model="profileForm.username"
                    type="text"
                    class="input-field"
                    :class="{
                      'border-red-500':
                        profileForm.username && !usernameAvailability,
                    }" />
                  <p
                    v-if="isUsernameModified && !usernameAvailability"
                    class="text-[10px] text-red-500 mt-1 font-bold uppercase">
                    username occupato
                  </p>
                  <p
                    v-else-if="isUsernameModified && usernameAvailability"
                    class="text-[10px] text-zomp mt-1 font-bold uppercase">
                    disponibile
                  </p>
                </div>
                <button
                  @click="handleUpdateUsername"
                  :disabled="
                    !isUsernameModified ||
                    !usernameAvailability ||
                    isCheckingUsername
                  "
                  class="btn-primary uppercase">
                  {{ isCheckingUsername ? "verifica..." : "salva username" }}
                </button>

                <div class="pt-6 border-t border-thistle mt-6">
                  <button
                    v-if="!isChangingPassword"
                    @click="isChangingPassword = true"
                    class="btn-outline uppercase">
                    cambia password
                  </button>
                  <div v-else class="space-y-4">
                    <input
                      v-model="passwordForm.old"
                      type="password"
                      placeholder="pass attuale"
                      class="input-field" />
                    <div>
                      <input
                        v-model="passwordForm.new"
                        type="password"
                        placeholder="nuova pass"
                        class="input-field"
                        @input="validatePassword" />
                      <div
                        v-if="passwordForm.new"
                        class="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
                        <ul class="text-[9px] space-y-1 font-bold uppercase">
                          <li
                            :class="
                              passRequirements.minLength
                                ? 'text-zomp'
                                : 'text-red-500'
                            ">
                            • almeno otto caratteri
                          </li>
                          <li
                            :class="
                              passRequirements.hasUpper
                                ? 'text-zomp'
                                : 'text-red-500'
                            ">
                            • una maiuscola
                          </li>
                          <li
                            :class="
                              passRequirements.hasNumber
                                ? 'text-zomp'
                                : 'text-red-500'
                            ">
                            • un numero
                          </li>
                          <li
                            :class="
                              passRequirements.hasSpecial
                                ? 'text-zomp'
                                : 'text-red-500'
                            ">
                            • un carattere speciale
                          </li>
                        </ul>
                      </div>
                    </div>
                    <input
                      v-model="passwordForm.confirm"
                      type="password"
                      placeholder="conferma nuova"
                      class="input-field" />
                    <div class="flex gap-2">
                      <button
                        @click="updatePassword"
                        :disabled="!isPasswordValid"
                        class="flex-1 btn-primary uppercase">
                        salva
                      </button>
                      <button
                        @click="cancelPasswordChange"
                        class="flex-1 btn-outline uppercase">
                        chiudi
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-6 border-t border-thistle space-y-4">
                <h3
                  class="font-display text-s text-zomp tracking-widest">
                  Documenti e dati
                </h3>
                <div
                  v-for="type in ['privacy', 'terms']"
                  :key="type"
                  class="flex items-center justify-between p-3 border border-thistle rounded-xl bg-white/50">
                  <span
                    @click="openLegal(type)"
                    class="text-xs font-bold underline cursor-pointer decoration-zomp"
                    >{{
                      type === "privacy"
                        ? "privacy policy"
                        : "termini e condizioni"
                    }}</span
                  >
                  <button @click="downloadPDF(type)" class="text-zomp">
                    <VueFeather type="download" size="18"></VueFeather>
                  </button>
                </div>
                <button
                  @click="handleExportRequest"
                  class="w-full text-[12px] font-bold py-2 border-2 border-dashed border-ash-gray rounded-xl hover:bg-ash-gray/10 transition-colors">
                  richiedi copia dati
                </button>
              </div>
            </div>

            <div class="space-y-8">
              <div class="space-y-4">
                <h3 class="font-display text-s text-zomp tracking-widest">
                  Impostazioni privacy
                </h3>
                <div  class="block text-[12px] font-bold mb-1 opacity-60"> <span> visibilità profilo: </span>
                <select
                  v-model="profileForm.visibility"
                  class="input-field font-bold text-[11px]">
                  <option value="all">pubblico</option>
                  <option value="logged_in">utenti registrati</option>
                  <option value="private">privato</option>
                </select>
                </div>
                <div>
                  <div
                    class="block text-[12px] font-bold mb-1 opacity-60">
                    <span>raggio sfocatura: &nbsp; &nbsp;</span
                    ><span>{{ profileForm.blurRadius }} metri</span>
                  </div>
                  <input
                    v-model.number="profileForm.blurRadius"
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    class="w-full accent-zomp" />
                </div>
                <button
                  @click="handlePrivacyUpdate"
                  :disabled="!isPrivacyModified"
                  class="btn-primary uppercase">
                  salva privacy
                </button>
              </div>
              <div class="pt-6 border-t border-thistle space-y-4">
                <h3 class="font-display text-s text-zomp tracking-widest">
                  La tua posizione
                </h3>
                <div
                  id="mini-map-edit"
                  class="h-32 rounded-xl border-2 border-thistle overflow-hidden bg-ash-gray/10"></div>
                <button
                  @click="router.push('/set-location')"
                  class="w-full btn-outline flex items-center justify-center">
                  <VueFeather type="map-pin" size="14" class="mr-2"></VueFeather
                  >cambia posizione
                </button>
              </div>
              <div class="flex justify-end pt-4">
                <button
                  @click="confirmDelete = true"
                  class="text-[10px] font-bold text-red-600 hover:underline">
                  elimina definitivamente l'account
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-12 animate-fade-in">
          <div class="space-y-4">
            <h2
              class="text-xl font-display tracking-widest border-b border-thistle pb-2">
              {{
                isMyProfile
                  ? "Le tue statistiche"
                  : "Le statistiche di " + profile.userName
              }}
            </h2>
            <UserStats :userId="profileId" />
          </div>

          <div class="space-y-4">
            <h2
              class="text-xl font-display tracking-widest border-b border-thistle pb-2 text-theme-main">
              Librerie
            </h2>
            <div
              v-if="libraries.length === 0"
              class="p-10 bg-[var(--bg-secondary)] rounded-xl border border-thistle text-center opacity-60 italic">
              Nessuna libreria disponibile.
            </div>
            <LibraryAccordion
              v-for="lib in libraries"
              :key="lib.id"
              :library="lib"
              :isOwner="isMyProfile"
              @toggle="handleToggleLibrary(lib.id)" />
          </div>
        </div>
      </section>
    </div>

    <AppModal
      :is-open="uiModal.open"
      :title="uiModal.title"
      @close="uiModal.open = false">
      <div class="p-4 text-center space-y-4 text-theme-main">
        <p class="text-sm font-bold">{{ uiModal.message }}</p>
        <button
          @click="uiModal.open = false"
          class="btn-primary w-32 mx-auto uppercase">
          chiudi
        </button>
      </div>
    </AppModal>

    <AppModal
      :is-open="confirmDelete"
      title="eliminazione profilo"
      @close="confirmDelete = false">
      <div class="p-4 text-center space-y-6 text-theme-main">
        <p class="text-sm font-bold">attenzione operazione irreversibile</p>
        <div class="flex gap-4">
          <button
            @click="handleDeleteAccount"
            class="flex-1 btn-red py-3 font-bold">
            conferma
          </button>
          <button
            @click="confirmDelete = false"
            class="flex-1 btn-outline py-3 font-bold">
            annulla
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal
      :is-open="legalModal.open"
      :title="legalModal.title"
      @close="legalModal.open = false">
      <div
        v-html="legalModal.content"
        class="prose dark:prose-invert max-w-none text-sm px-4 py-2 text-theme-main"></div>
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
import { downloadAsPDF } from "@/utils/pdfGenerator";
import maplibregl from "maplibre-gl";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const isEditMode = ref(false);
const isChangingPassword = ref(false);
const confirmDelete = ref(false);
const uiModal = ref({ open: false, title: "", message: "" });
const legalModal = ref({ open: false, title: "", content: "" });

const profile = ref(null);
const userCounters = ref({ myBooksCount: 0 });
const libraries = ref([]);

const profileForm = reactive({
  username: "",
  visibility: "all",
  blurRadius: 0,
});
const passwordForm = reactive({ old: "", new: "", confirm: "" });
const usernameAvailability = ref(true);
const isCheckingUsername = ref(false);
const passRequirements = reactive({
  minLength: false,
  hasUpper: false,
  hasNumber: false,
  hasSpecial: false,
});
let checkTimeout = null;
let mapInstanceEdit = null;

const profileId = computed(() => route.params.id);
const isMyProfile = computed(() => profileId.value === authStore.userId);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isMapVisible = computed(
  () =>
    profile.value?.coords &&
    (isMyProfile.value || profile.value.visibility !== "private")
);

const visibilityIta = computed(() => {
  const v = profile.value?.visibility;
  return (
    { all: "pubblico", "logged_in": "utenti registrati", private: "privato" }[
      v
    ] || "privato"
  );
});

const isUsernameModified = computed(
  () => profileForm.username !== profile.value?.userName
);
const isPrivacyModified = computed(
  () =>
    profileForm.visibility !== profile.value?.visibility ||
    profileForm.blurRadius !== profile.value?.blurRadius
);

async function fetchProfileData() {
  isLoading.value = true;
  try {
    const resProfile = await apiClient.get(`/users/${profileId.value}`);
    profile.value = resProfile;

    if (isMyProfile.value) {
      Object.assign(profileForm, {
        username: resProfile.userName,
        visibility: resProfile.visibility,
        blurRadius: resProfile.blurRadius,
      });
    }

    const resCount = await apiClient.get(
      `/stats/user/${profileId.value}/counters`
    );
    userCounters.value = resCount;

    const libDetails = [];
    if (resProfile.libraryIds) {
      for (const lid of resProfile.libraryIds) {
        try {
          const detail = await apiClient.get(`/libraries/${lid}`);
          libDetails.push({ ...detail, isOpen: false, books: [] });
        } catch (e) {}
      }
    }
    libraries.value = libDetails;
    if (!isMyProfile.value && isAuthenticated.value) calculateAffinity();
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

function validatePassword() {
  const p = passwordForm.new;
  passRequirements.minLength = p.length >= 8;
  passRequirements.hasUpper = /[A-Z]/.test(p);
  passRequirements.hasNumber = /\d/.test(p);
  passRequirements.hasSpecial = /[@$!%*?&]/.test(p);
}
const isPasswordValid = computed(
  () =>
    Object.values(passRequirements).every((v) => v) &&
    passwordForm.new === passwordForm.confirm
);

async function toggleEditMode() {
  isEditMode.value = !isEditMode.value;
  if (isEditMode.value) {
    await nextTick();
    initEditMap();
  }
}

async function handleUpdateUsername() {
  await apiClient.put(`/users/${authStore.userId}/username`, {
    username: profileForm.username,
  });
  await authStore.fetchCurrentUser();
  fetchProfileData();
  uiModal.value = {
    open: true,
    title: "Successo",
    message: "Username aggiornato",
  };
}

async function updatePassword() {
  try {
    await apiClient.put(`/users/${authStore.userId}/password`, {
      old: passwordForm.old,
      new: passwordForm.new,
    });
    cancelPasswordChange();
    uiModal.value = {
      open: true,
      title: "Successo",
      message: "Password modificata",
    };
  } catch (e) {
    uiModal.value = {
      open: true,
      title: "Errore",
      message: "Password attuale errata",
    };
  }
}

async function handlePrivacyUpdate() {
  await apiClient.put(`/users/${authStore.userId}/privacy`, {
    visibility: profileForm.visibility,
    blurRadius: profileForm.blurRadius,
  });
  await authStore.fetchCurrentUser();
  fetchProfileData();
  uiModal.value = {
    open: true,
    title: "Privacy",
    message: "Impostazioni salvate",
  };
}

async function handleExportRequest() {
  try {
    const res = await apiClient.get("/users/export");
    uiModal.value = {
      open: true,
      title: "Esportazione Dati",
      message:
        res.message ||
        "Richiesta inviata con successo. Riceverai i dati via email.",
    };
  } catch (e) {
    uiModal.value = {
      open: true,
      title: "Errore",
      message: "Impossibile completare la richiesta di export.",
    };
  }
}

async function handleDeleteAccount() {
  await apiClient.delete(`/users/me`);
  authStore.logout();
  window.location.href = "/";
}

async function handleToggleLibrary(libId) {
  const lib = libraries.value.find((l) => l.id === libId);
  if (!lib) return;
  lib.isOpen = !lib.isOpen;
  if (lib.isOpen && lib.books.length === 0) {
    const res = await apiClient.get(`/libraries/${libId}`);
    lib.books = res.books || [];
  }
}

function cancelPasswordChange() {
  isChangingPassword.value = false;
  Object.assign(passwordForm, { old: "", new: "", confirm: "" });
}
function openLegal(t) {
  legalModal.value = {
    open: true,
    title: t === "terms" ? "Termini e Condizioni" : "Privacy Policy",
    content: t === "terms" ? TERMS_AND_CONDITIONS : PRIVACY_POLICY,
  };
}
function downloadPDF(t) {
  downloadAsPDF(
    t === "terms" ? TERMS_AND_CONDITIONS : PRIVACY_POLICY,
    `bibliomap_${t}`
  );
}

async function initEditMap() {
  if (!profile.value?.coords || mapInstanceEdit) return;
  mapInstanceEdit = new maplibregl.Map({
    container: "mini-map-edit",
    style: `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${
      import.meta.env.VITE_MAPTILER_KEY
    }`,
    center: [profile.value.coords.longitude, profile.value.coords.latitude],
    zoom: 12,
    interactive: false,
  });
  new maplibregl.Marker({ color: "#629677" })
    .setLngLat([profile.value.coords.longitude, profile.value.coords.latitude])
    .addTo(mapInstanceEdit);
}

const affinityScore = ref(0);
const affinityMessage = ref("");
async function calculateAffinity() {
  try {
    const myStats = await apiClient.get(`/stats/user/${authStore.userId}/full`);
    const targetTags = Object.keys(profile.value.topTags || {});
    const myTags = myStats.weeklyRequests?.labels || [];
    const common = targetTags.filter((t) => myTags.includes(t));
    affinityScore.value = Math.round(
      (common.length / Math.max(targetTags.length, 1)) * 100
    );
    affinityMessage.value =
      affinityScore.value > 50
        ? "Anime gemelle letterarie!"
        : "Scoprite nuovi generi insieme.";
  } catch (e) {
    affinityScore.value = 0;
  }
}

watch(
  () => profileForm.username,
  (newVal) => {
    if (!isUsernameModified.value) {
      usernameAvailability.value = true;
      return;
    }
    if (checkTimeout) clearTimeout(checkTimeout);
    isCheckingUsername.value = true;
    checkTimeout = setTimeout(async () => {
      try {
        const res = await apiClient.get(`/users/check-exists/${newVal}`);
        usernameAvailability.value = !res.exists;
      } finally {
        isCheckingUsername.value = false;
      }
    }, 500);
  }
);

onMounted(fetchProfileData);
watch(() => route.params.id, fetchProfileData);
</script>

<style scoped>

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--ash-gray);
  border-radius: 0.75rem;
  background: transparent;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus {
  border-color: var(--zomp);
}
.btn-primary {
  width: 100%;
  background: var(--zomp);
  color: white;
  padding: 0.8rem;
  border-radius: 0.75rem;
  font-weight: bold;
  font-size: 11px;
  text-transform: uppercase;
  transition: all 0.2s;
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-outline {
  width: 100%;
  border: 2px solid var(--zomp);
  color: var(--zomp);
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: bold;
  font-size: 11px;
  text-transform: uppercase;
  background: transparent;
  transition: all 0.2s;
}
.btn-outline:hover {
  background: var(--zomp);
  color: white;
}
.btn-red {
  background: #ef4444;
  color: white;
  border-radius: 0.75rem;
  font-weight: bold;
  font-size: 11px;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
input[type="range"] {
  accent-color: var(--zomp);
}
</style>
