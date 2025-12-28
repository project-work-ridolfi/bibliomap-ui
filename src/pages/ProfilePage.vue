<template>
  <div class="max-w-5xl mx-auto p-4 md:p-8 transition-colors duration-300">
    <div class="flex justify-center gap-4 mb-[-2px] relative z-10">
      <button
        @click="activeTab = 'settings'"
        :class="activeTab === 'settings' ? 'tab-active' : 'tab-inactive'">
        <VueFeather type="user" size="20" class="mr-2"></VueFeather>
        GESTIONE PROFILO
      </button>
      <button
        @click="activeTab = 'loans'"
        :class="activeTab === 'loans' ? 'tab-active' : 'tab-inactive'">
        <VueFeather type="repeat" size="20" class="mr-2"></VueFeather>
        GESTIONE RICHIESTE
      </button>
    </div>

    <div class="main-container relative z-0 min-h-[500px]">
      <div
        v-if="!authStore.user"
        class="flex flex-col items-center py-20 text-ash-gray uppercase text-[10px] tracking-widest font-bold">
        caricamento...
      </div>

      <div
        v-else-if="activeTab === 'settings'"
        class="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
        <div class="space-y-8">
          <div class="space-y-4">
            <h3
              class="font-display text-xs uppercase text-zomp tracking-widest">
              Credenziali
            </h3>
            <div class="space-y-4">
              <input
                v-model="profileData.username"
                type="text"
                class="input-field"
                placeholder="Username" />
              <button
                @click="updateUsername"
                :disabled="!isUsernameModified"
                class="btn-primary">
                salva username
              </button>

              <div class="pt-6 border-t border-thistle mt-6">
                <button
                  v-if="!isChangingPassword"
                  @click="isChangingPassword = true"
                  class="btn-outline uppercase">
                  cambia password
                </button>
                <div v-else class="space-y-2">
                  <input
                    v-model="passwordForm.old"
                    type="password"
                    placeholder="Pass attuale"
                    class="input-field" />
                  <input
                    v-model="passwordForm.new"
                    type="password"
                    placeholder="Nuova pass"
                    class="input-field" />
                  <input
                    v-model="passwordForm.confirm"
                    type="password"
                    placeholder="Conferma nuova"
                    class="input-field" />

                  <p
                    v-if="passwordError"
                    class="text-[10px] text-red-500 font-bold uppercase">
                    {{ passwordError }}
                  </p>

                  <div class="flex gap-2">
                    <button
                      @click="updatePassword"
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
          </div>

          <div class="pt-6 border-t border-thistle space-y-4">
            <h3
              class="font-display text-xs uppercase text-paynes-gray tracking-widest">
              Documenti e Dati
            </h3>
            <div
              class="flex items-center justify-between p-3 border border-thistle rounded-xl">
              <span
                @click="openLegal('privacy')"
                class="text-xs font-bold uppercase underline cursor-pointer decoration-zomp"
                >Privacy Policy</span
              >
              <button @click="downloadPDF('privacy')" class="text-zomp">
                <VueFeather type="download" size="18"></VueFeather>
              </button>
            </div>
            <div
              class="flex items-center justify-between p-3 border border-thistle rounded-xl">
              <span
                @click="openLegal('terms')"
                class="text-xs font-bold uppercase underline cursor-pointer decoration-zomp"
                >Termini e Condizioni</span
              >
              <button @click="downloadPDF('terms')" class="text-zomp">
                <VueFeather type="download" size="18"></VueFeather>
              </button>
            </div>
            <button
              @click="handleExportRequest"
              class="w-full text-[10px] font-bold uppercase py-2 border-2 border-dashed border-ash-gray rounded-xl text-paynes-gray hover:bg-ash-gray/10 transition">
              richiedi copia dei tuoi dati
            </button>
          </div>
        </div>

        <div class="space-y-8 flex flex-col justify-between">
          <div class="space-y-4">
            <h3
              class="font-display text-xs uppercase text-zomp tracking-widest">
              Privacy Mappa
            </h3>
            <div class="space-y-4">
              <select v-model="profileData.visibility" class="input-field">
                <option value="all">Pubblico (Tutti)</option>
                <option value="logged-in">Utenti registrati</option>
                <option value="private">Privato (Solo tu)</option>
              </select>
              <div>
                <div
                  class="flex justify-between text-[10px] font-bold uppercase mb-2">
                  <span>Raggio sfocatura</span
                  ><span>{{ profileData.blurRadius }} metri</span>
                </div>
                <input
                  v-model="profileData.blurRadius"
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  class="w-full accent-zomp" />
              </div>
              <button
                @click="updatePrivacy"
                :disabled="!isPrivacyModified"
                class="btn-primary">
                salva impostazioni privacy
              </button>
            </div>
          </div>

          <div class="flex justify-end pt-8">
            <button
              @click="confirmDelete = true"
              class="text-[10px] font-bold uppercase text-red-600 hover:underline transition-all">
              elimina definitivamente il mio account
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'loans'" class="animate-fade-in space-y-12">
        <section>
          <h3
            class="font-display text-xs uppercase mb-6 text-zomp tracking-widest underline decoration-thistle underline-offset-8">
            Richieste Libri (da parte di altri)
          </h3>
          <div
            v-if="incomingLoans.length === 0"
            class="text-center py-16 italic text-ash-gray text-sm border border-dashed border-thistle rounded-2xl">
            nessuna richiesta di prestito ricevuta.
          </div>
          <div
            v-for="loan in incomingLoans"
            :key="loan.id"
            class="flex justify-between items-center p-5 border border-thistle rounded-2xl mb-4 bg-gray-50/30">
            <span class="font-bold text-sm uppercase text-paynes-gray">{{
              loan.title
            }}</span>
            <div class="flex gap-3">
              <button
                @click="manageLoan(loan.id, 'ACCEPT')"
                class="px-6 py-2 bg-zomp text-white rounded-lg font-bold text-[10px] uppercase transition">
                si
              </button>
              <button
                @click="manageLoan(loan.id, 'REJECT')"
                class="px-6 py-2 border-2 border-red-500 text-red-500 rounded-lg font-bold text-[10px] uppercase transition">
                no
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3
            class="font-display text-xs uppercase mb-6 text-paynes-gray tracking-widest underline decoration-thistle underline-offset-8">
            Richieste Effettuate (da te)
          </h3>
          <div
            v-if="myRequests.length === 0"
            class="text-center py-10 italic text-ash-gray text-sm">
            non hai effettuato alcuna richiesta.
          </div>
          <div
            v-for="loan in myRequests"
            :key="loan.id"
            class="p-4 border border-thistle rounded-xl mb-3 flex justify-between items-center bg-gray-50/10">
            <div>
              <p class="font-bold uppercase text-xs text-paynes-gray">
                {{ loan.title }}
              </p>
              <span
                class="text-[9px] font-black uppercase px-2 py-0.5 rounded"
                :class="statusColor(loan.status)"
                >{{ statusLabel(loan.status) }}</span
              >
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold uppercase opacity-50 italic">
                chiesto a: {{ loan.ownerId }}
              </p>
              <p
                v-if="loan.expectedReturnDate"
                class="text-[9px] font-bold text-ash-gray italic">
                scadenza: {{ formatDate(loan.expectedReturnDate) }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <AppModal
      :is-open="uiModal.open"
      :title="uiModal.title"
      @close="uiModal.open = false">
      <div class="p-4 text-center space-y-4">
        <p class="text-paynes-gray text-sm">{{ uiModal.message }}</p>
        <button
          @click="uiModal.open = false"
          class="btn-primary w-32 mx-auto uppercase">
          chiudi
        </button>
      </div>
    </AppModal>

    <AppModal
      :is-open="confirmDelete"
      title="Eliminazione Profilo"
      @close="confirmDelete = false">
      <div class="p-4 text-center space-y-6">
        <p class="text-paynes-gray text-sm uppercase font-bold">
          attenzione: l'operazione è irreversibile.
        </p>
        <div class="flex gap-4">
          <button @click="handleDelete" class="flex-1 btn-red py-3">
            conferma
          </button>
          <button
            @click="confirmDelete = false"
            class="flex-1 btn-outline py-3">
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
        class="prose dark:prose-invert max-w-none text-sm px-4 py-2"></div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/apiClient";
import AppModal from "@/components/AppModal.vue";
import { downloadAsPDF } from "@/utils/pdfGenerator";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from "@/utils/legalTexts";

const authStore = useAuthStore();
const activeTab = ref("settings");
const confirmDelete = ref(false);

// stato modale unica per messaggi ui
const uiModal = ref({ open: false, title: "", message: "" });

const profileData = ref({ username: "", visibility: "all", blurRadius: 200 });
const initialData = ref({ username: "", visibility: "all", blurRadius: 200 });
const isChangingPassword = ref(false);
const passwordForm = ref({ old: "", new: "", confirm: "" });
const passwordError = ref("");

const incomingLoans = ref([]);
const allUserLoans = ref([]);
const legalModal = ref({ open: false, title: "", content: "" });

const myRequests = computed(() =>
  allUserLoans.value.filter((l) => l.requesterId === authStore.user?.id)
);
const isUsernameModified = computed(
  () => profileData.value.username !== initialData.value.username
);
const isPrivacyModified = computed(
  () =>
    profileData.value.visibility !== initialData.value.visibility ||
    profileData.value.blurRadius !== initialData.value.blurRadius
);

const showMsg = (title, message) => {
  uiModal.value = { open: true, title, message };
};

const sync = () => {
  if (authStore.user) {
    const d = {
      username: authStore.user.username,
      visibility: authStore.user.visibility || "all",
      blurRadius: parseInt(authStore.user.blurRadius) || 0,
    };
    initialData.value = { ...d };
    profileData.value = { ...d };
  }
};

onMounted(async () => {
  if (authStore.userId && !authStore.user) await authStore.fetchCurrentUser();
  sync();
  await fetchLoans();
});

watch(() => authStore.user, sync);

async function fetchLoans() {
  try {
    const inc = await apiClient.get("/loan/requests/incoming");
    incomingLoans.value = Array.isArray(inc) ? inc : [];
    const all = await apiClient.get("/loan/all");
    allUserLoans.value = Array.isArray(all) ? all : [];
  } catch (e) {
    console.error(e);
  }
}

async function updateUsername() {
  try {
    await apiClient.put(`/users/${authStore.user.id}/privacy`, {
      username: profileData.value.username,
    });
    await authStore.fetchCurrentUser();
    showMsg("Successo", "Username aggiornato correttamente.");
  } catch (e) {
    showMsg("Errore", "Impossibile aggiornare l'username.");
  }
}

async function updatePassword() {
  passwordError.value = "";
  if (!passwordForm.value.old || !passwordForm.value.new)
    return (passwordError.value = "compila tutti i campi");
  if (passwordForm.value.new !== passwordForm.value.confirm)
    return (passwordError.value = "le password non coincidono");

  try {
    await apiClient.put(`/users/${authStore.user.id}/password`, {
      old: passwordForm.value.old,
      new: passwordForm.value.new,
    });
    isChangingPassword.value = false;
    passwordForm.value = { old: "", new: "", confirm: "" };
    showMsg("Sicurezza", "Password aggiornata con successo.");
  } catch (e) {
    if (e.response?.status === 406)
      passwordError.value = "la password attuale è errata";
    else
      showMsg(
        "Errore",
        "Si è verificato un problema durante il cambio password."
      );
  }
}

function cancelPasswordChange() {
  isChangingPassword.value = false;
  passwordForm.value = { old: "", new: "", confirm: "" };
  passwordError.value = "";
}

async function updatePrivacy() {
  try {
    await apiClient.put(`/users/${authStore.user.id}/privacy`, {
      visibility: profileData.value.visibility,
      blurRadius: profileData.value.blurRadius,
    });
    await authStore.fetchCurrentUser();
    showMsg("Privacy", "Impostazioni salvate correttamente.");
  } catch (e) {
    showMsg("Errore", "Impossibile salvare le impostazioni.");
  }
}

async function manageLoan(id, action) {
  try {
    await apiClient.patch(`/loan/${id}/status`, { action });
    await fetchLoans();
    showMsg(
      "Prestito",
      `Richiesta ${action === "ACCEPT" ? "accettata" : "rifiutata"}.`
    );
  } catch (e) {
    showMsg("Errore", "Impossibile processare la richiesta.");
  }
}

async function handleExportRequest() {
  try {
    const res = await apiClient.get("/users/export");
    showMsg("Esportazione", res.message);
  } catch (e) {
    showMsg("Errore", "Richiesta di esportazione fallita.");
  }
}

async function handleDelete() {
  try {
    await apiClient.delete(`/users/me`);
    authStore.logout();
    window.location.href = "/";
  } catch (e) {
    confirmDelete.value = false;
    if (e.response?.status === 409) {
      showMsg(
        "Azione Bloccata",
        "Non puoi eliminare l'account con prestiti attivi. Controlla la tua email."
      );
    } else {
      showMsg("Errore", "Impossibile eliminare l'account al momento.");
    }
  }
}

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("it-IT") : "");
const statusLabel = (s) =>
  ({
    PENDING: "in attesa",
    ACCEPTED: "accettata",
    ON_LOAN: "in corso",
    RETURNED: "restituito",
    REJECTED: "rifiutata",
  }[s] || s);
const statusColor = (s) =>
  ({
    PENDING: "bg-ash-gray/20 text-ash-gray",
    ACCEPTED: "bg-zomp/20 text-zomp",
    ON_LOAN: "bg-paynes-gray/20 text-paynes-gray",
    RETURNED: "bg-zomp/20 text-zomp",
  }[s] || "bg-red-500/20 text-red-500");

function openLegal(t) {
  legalModal.value = {
    open: true,
    title: t === "terms" ? "Termini e Condizioni" : "Privacy Policy",
    content: t === "terms" ? TERMS_AND_CONDITIONS : PRIVACY_POLICY,
  };
}

function downloadPDF(t) {
  const c = t === "terms" ? TERMS_AND_CONDITIONS : PRIVACY_POLICY;
  downloadAsPDF(c, t === "terms" ? "Bibliomap_Termini" : "Bibliomap_Privacy");
}
</script>

<style scoped>
.font-display {
  font-family: "Mochiy Pop P One", cursive;
}
.main-container {
  background-color: var(--bg-primary);
  border: 2px solid var(--thistle);
  border-radius: 1.5rem;
  padding: 2.5rem;
}
.tab-active {
  padding: 1.25rem 3rem;
  border: 2px solid var(--thistle);
  border-bottom-color: var(--bg-primary);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  font-family: "Mochiy Pop P One", cursive;
  font-size: 14px;
  color: var(--zomp);
  background-color: var(--bg-primary);
  z-index: 20;
}
.tab-inactive {
  padding: 1.25rem 3rem;
  border: 2px solid transparent;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  font-family: "Mochiy Pop P One", cursive;
  font-size: 14px;
  color: var(--paynes-gray);
  background-color: rgba(152, 182, 177, 0.1);
  transition: all 0.2s;
}
.input-field {
  width: 100%;
  padding: 0.6rem;
  border: 2px solid var(--ash-gray);
  border-radius: 0.75rem;
  background-color: transparent;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus {
  border-color: var(--zomp);
}
.btn-primary {
  width: 100%;
  background-color: var(--zomp);
  color: white;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: bold;
  font-size: 11px;
  text-transform: uppercase;
  transition: opacity 0.2s;
}
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-outline {
  width: 100%;
  border: 2px solid var(--zomp);
  color: var(--zomp);
  padding: 0.6rem;
  border-radius: 0.75rem;
  font-weight: bold;
  font-size: 11px;
  text-transform: uppercase;
  background-color: transparent;
  transition: all 0.2s;
}
.btn-outline:hover {
  background-color: var(--zomp);
  color: white;
}
.btn-red {
  background-color: #ef4444;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: bold;
  font-size: 11px;
  text-transform: uppercase;
  transition: background-color 0.2s;
}
.btn-red:hover {
  background-color: #dc2626;
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
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
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--zomp);
  cursor: pointer;
  border: 2px solid white;
}
</style>
