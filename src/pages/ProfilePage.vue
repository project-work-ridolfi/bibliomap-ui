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
        <VueFeather type="loader" animation="spin" class="mb-4"></VueFeather>
        caricamento...
      </div>

      <div
        v-else-if="activeTab === 'settings'"
        class="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
        <div class="space-y-8">
          <div class="space-y-4">
            <h3
              class="font-display text-xs uppercase text-zomp tracking-widest">
              credenziali
            </h3>
            <div class="space-y-4">
              <div>
                <label
                  class="block text-[10px] font-bold uppercase mb-1 opacity-60"
                  >username</label
                >
                <input
                  v-model="profileData.username"
                  type="text"
                  class="input-field"
                  :class="{
                    'border-red-500':
                      profileData.username.length > 0 && !usernameAvailability,
                  }"
                  placeholder="nuovo username" />
                <p
                  v-if="
                    profileData.username.length > 0 &&
                    !usernameAvailability &&
                    isUsernameModified
                  "
                  class="text-[10px] text-red-500 mt-1 font-bold uppercase">
                  username occupato
                </p>
                <p
                  v-else-if="
                    isUsernameModified &&
                    usernameAvailability &&
                    isUsernameValid
                  "
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
                      :class="{
                        'border-red-500':
                          !isPasswordValid && passwordForm.new.length > 0,
                      }"
                      @input="validatePassword" />
                    <div
                      v-if="!isPasswordValid && passwordForm.new.length > 0"
                      class="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
                      <ul class="text-[9px] space-y-1 font-bold uppercase">
                        <li
                          :class="
                            passwordRequirements.minLength
                              ? 'text-zomp'
                              : 'text-red-500'
                          ">
                          • almeno otto caratteri
                        </li>
                        <li
                          :class="
                            passwordRequirements.hasUpper
                              ? 'text-zomp'
                              : 'text-red-500'
                          ">
                          • una maiuscola
                        </li>
                        <li
                          :class="
                            passwordRequirements.hasNumber
                              ? 'text-zomp'
                              : 'text-red-500'
                          ">
                          • un numero
                        </li>
                        <li
                          :class="
                            passwordRequirements.hasSpecial
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
                  <p
                    v-if="passwordError"
                    class="text-[10px] text-red-500 font-bold uppercase p-2 bg-red-50 border border-red-100 rounded">
                    {{ passwordError }}
                  </p>
                  <div class="flex gap-2">
                    <button
                      @click="updatePassword"
                      :disabled="!isPasswordValid || !passwordForm.new"
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
              documenti e dati
            </h3>
            <div
              class="flex items-center justify-between p-3 border border-thistle rounded-xl">
              <span
                @click="openLegal('privacy')"
                class="text-xs font-bold uppercase underline cursor-pointer decoration-zomp"
                >privacy policy</span
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
                >termini e condizioni</span
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

        <div class="space-y-8">
          <div class="space-y-4">
            <h3
              class="font-display text-xs uppercase text-zomp tracking-widest">
              privacy mappa
            </h3>
            <div class="space-y-4">
              <select
                v-model="profileData.visibility"
                class="input-field font-bold text-[11px]">
                <option value="all">pubblico</option>
                <option value="logged-in">utenti registrati</option>
                <option value="private">privato</option>
              </select>

              <div>
                <div
                  class="flex justify-between text-[10px] font-bold uppercase mb-2">
                  <span>raggio sfocatura</span
                  ><span>{{ profileData.blurRadius }} metri</span>
                </div>
                <input
                  v-model.number="profileData.blurRadius"
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  class="w-full accent-zomp" />
              </div>
              <button
                @click="updatePrivacy"
                :disabled="!isPrivacyModified"
                class="btn-primary uppercase">
                salva privacy
              </button>
            </div>
          </div>

          <div class="pt-6 border-t border-thistle space-y-4">
            <h3
              class="font-display text-xs uppercase text-zomp tracking-widest">
              la tua posizione
            </h3>
            <div
              class="relative rounded-xl overflow-hidden border-2 border-thistle h-32 bg-ash-gray/10">
              <div id="mini-map" class="h-full w-full"></div>
            </div>
            <button
              @click="router.push('/set-location')"
              class="w-full btn-outline uppercase flex items-center justify-center">
              <VueFeather type="map-pin" size="14" class="mr-2"></VueFeather>
              cambia posizione
            </button>
          </div>

          <div class="flex justify-end pt-4">
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
            richieste ricevute
          </h3>
          <div
            v-if="incomingLoans.length === 0"
            class="text-center py-16 italic text-ash-gray text-sm border border-dashed border-thistle rounded-2xl">
            nessuna richiesta ricevuta
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
            richieste effettuate
          </h3>
          <div
            v-if="myRequests.length === 0"
            class="text-center py-10 italic text-ash-gray text-sm">
            non hai effettuato richieste
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
              <p
                class="text-[10px] font-bold uppercase opacity-50 italic font-bold">
                proprietario id: {{ loan.ownerId }}
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
        <p class="text-paynes-gray text-sm uppercase font-bold">
          {{ uiModal.message }}
        </p>
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
      <div class="p-4 text-center space-y-6">
        <p class="text-paynes-gray text-sm uppercase font-bold">
          attenzione operazione irreversibile
        </p>
        <div class="flex gap-4">
          <button
            @click="handleDelete"
            class="flex-1 btn-red py-3 uppercase font-bold">
            conferma
          </button>
          <button
            @click="confirmDelete = false"
            class="flex-1 btn-outline py-3 uppercase font-bold">
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
import { ref, onMounted, computed, watch, nextTick } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/authStore"
import { apiClient } from "@/services/apiClient"
import AppModal from "@/components/AppModal.vue"
import maplibregl from "maplibre-gl"
import { downloadAsPDF } from "@/utils/pdfGenerator"
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from "@/utils/legalTexts"

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref("settings")
const confirmDelete = ref(false)
const uiModal = ref({ open: false, title: "", message: "" })
const legalModal = ref({ open: false, title: "", content: "" })

const profileData = ref({ username: "", visibility: "all", blurRadius: 0 })
const initialData = ref({ username: "", visibility: "all", blurRadius: 0 })

// stato password
const isChangingPassword = ref(false)
const passwordForm = ref({ old: "", new: "", confirm: "" })
const passwordError = ref("")
const isPasswordValid = ref(false)
const passwordRequirements = ref({
  minLength: false,
  hasUpper: false,
  hasNumber: false,
  hasSpecial: false,
})

// stato username
const usernameAvailability = ref(true)
const isCheckingUsername = ref(false)
const isUsernameValid = computed(
  () => profileData.value.username.length >= 3 && usernameAvailability.value
)
let usernameCheckTimeout = null

// stato prestiti
const incomingLoans = ref([])
const allUserLoans = ref([])

// variabili mappa
const mapTilerApiKey = import.meta.env.VITE_MAPTILER_KEY
let mapInstance = null

// computed logic
const myRequests = computed(() =>
  allUserLoans.value.filter((l) => l.requesterId === authStore.user?.id)
)
const isUsernameModified = computed(
  () => profileData.value.username !== initialData.value.username
)
const isPrivacyModified = computed(
  () =>
    profileData.value.visibility !== initialData.value.visibility ||
    parseInt(profileData.value.blurRadius) !==
      parseInt(initialData.value.blurRadius)
)

const showMsg = (title, message) => {
  uiModal.value = { open: true, title, message }
}

// validazione password
function validatePassword() {
  const p = passwordForm.value.new
  passwordRequirements.value.minLength = p.length >= 8
  passwordRequirements.value.hasUpper = /[A-Z]/.test(p)
  passwordRequirements.value.hasNumber = /\d/.test(p)
  passwordRequirements.value.hasSpecial = /[@$!%*?&]/.test(p)
  isPasswordValid.value = Object.values(passwordRequirements.value).every(
    (v) => v
  )
}

function cancelPasswordChange() {
  isChangingPassword.value = false
  passwordForm.value = { old: "", new: "", confirm: "" }
  passwordError.value = ""
}

// salvataggio password
async function updatePassword() {
  passwordError.value = ""
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordError.value = "le password non coincidono"
    return
  }
  try {
    await apiClient.put(`/users/${authStore.user.id}/password`, {
      old: passwordForm.value.old,
      new: passwordForm.value.new,
    })
    isChangingPassword.value = false
    passwordForm.value = { old: "", new: "", confirm: "" }
    showMsg("successo", "password aggiornata correttamente")
  } catch (e) {
    passwordError.value =
      e.response?.data?.message || "password attuale errata"
  }
}

// disponibilità username
watch(
  () => profileData.value.username,
  (newVal) => {
    if (!isUsernameModified.value) {
      usernameAvailability.value = true
      return
    }
    if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout)
    isCheckingUsername.value = true
    usernameCheckTimeout = setTimeout(async () => {
      try {
        const res = await apiClient.get(`/users/check-exists/${newVal}`)
        usernameAvailability.value = !res.exists
      } catch (e) {
        usernameAvailability.value = true
      } finally {
        isCheckingUsername.value = false
      }
    }, 500)
  }
)

async function handleUpdateUsername() {
  try {
    await apiClient.put(`/users/${authStore.user.id}/username`, {
      username: profileData.value.username,
    })
    await authStore.fetchCurrentUser()
    initialData.value.username = profileData.value.username
    showMsg("successo", "username salvato")
  } catch (e) {
    showMsg("errore", "username non disponibile")
  }
}

// inizializzazione mappa
async function initMiniMap() {
  const user = authStore.user
  if (!user || !user.latitude || !user.longitude) return
  await nextTick()
  const container = document.getElementById("mini-map")
  if (!container) return
  if (mapInstance) mapInstance.remove()
  try {
    mapInstance = new maplibregl.Map({
      container: "mini-map",
      style: `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerApiKey}`,
      center: [user.longitude, user.latitude],
      zoom: 13,
      interactive: false,
    })
    new maplibregl.Marker({ color: "#629677" })
      .setLngLat([user.longitude, user.latitude])
      .addTo(mapInstance)
    mapInstance.on("load", () => mapInstance.resize())
  } catch (e) {
    console.error("mappa errore", e)
  }
}

// salvataggio privacy
async function updatePrivacy() {
  const payload = {}
  if (profileData.value.visibility !== initialData.value.visibility)
    payload.visibility = profileData.value.visibility
  if (
    parseInt(profileData.value.blurRadius) !==
    parseInt(initialData.value.blurRadius)
  )
    payload.blurRadius = parseInt(profileData.value.blurRadius)
  try {
    await apiClient.put(`/users/${authStore.user.id}/privacy`, payload)
    await authStore.fetchCurrentUser()
    initialData.value.visibility = profileData.value.visibility
    initialData.value.blurRadius = profileData.value.blurRadius
    showMsg("privacy", "impostazioni salvate")
  } catch (e) {
    showMsg("errore", "impossibile salvare")
  }
}

// logica legali
function openLegal(t) {
  legalModal.value = {
    open: true,
    title: t === "terms" ? "termini e condizioni" : "privacy policy",
    content: t === "terms" ? TERMS_AND_CONDITIONS : PRIVACY_POLICY,
  }
}

function downloadPDF(t) {
  const content = t === "terms" ? TERMS_AND_CONDITIONS : PRIVACY_POLICY
  const title = t === "terms" ? "bibliomap_termini" : "bibliomap_privacy"
  downloadAsPDF(content, title)
}

// sincronizzazione store
const sync = () => {
  if (authStore.user) {
    profileData.value = {
      username: authStore.user.username,
      visibility: authStore.user.visibility || "all",
      blurRadius: authStore.user.blurRadius || 0,
    }
    console.log("SYNC PROFILE DATA:", profileData.value)
    initialData.value = { ...profileData.value }
    if (activeTab.value === "settings") initMiniMap()
  }
}

onMounted(async () => {
  if (authStore.userId && !authStore.user) await authStore.fetchCurrentUser()
  sync()
  await fetchLoans()
})

watch(
  () => activeTab.value,
  (tab) => {
    if (tab === "settings") initMiniMap()
  }
)

// gestione prestiti
async function fetchLoans() {
  try {
    const inc = await apiClient.get("/loan/requests/incoming")
    incomingLoans.value = Array.isArray(inc) ? inc : []
    const all = await apiClient.get("/loan/all")
    allUserLoans.value = Array.isArray(all) ? all : []
  } catch (e) {}
}

async function manageLoan(id, action) {
  try {
    await apiClient.patch(`/loan/${id}/status`, { action })
    await fetchLoans()
  } catch (e) {}
}

async function handleExportRequest() {
  try {
    const res = await apiClient.get("/users/export")
    showMsg("export", res.message)
  } catch (e) {
    showMsg("errore", "richiesta fallita")
  }
}

async function handleDelete() {
  try {
    await apiClient.delete(`/users/me`)
    authStore.logout()
    window.location.href = "/"
  } catch (e) {
    confirmDelete.value = false
    showMsg(
      "errore",
      e.response?.status === 409 ? "hai prestiti attivi" : "errore eliminazione"
    )
  }
}

const formatDate = (d) => (d ? new Date(d).toLocaleDateString("it-IT") : "")
const statusLabel = (s) =>
  ({
    PENDING: "in attesa",
    ACCEPTED: "accettata",
    ON_LOAN: "in corso",
    RETURNED: "restituito",
    REJECTED: "rifiutata",
  }[s] || s)
const statusColor = (s) =>
  ({
    PENDING: "bg-ash-gray/20 text-ash-gray",
    ACCEPTED: "bg-zomp/20 text-zomp",
    ON_LOAN: "bg-paynes-gray/20 text-paynes-gray",
    RETURNED: "bg-zomp/20 text-zomp",
  }[s] || "bg-red-500/20 text-red-500")
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
