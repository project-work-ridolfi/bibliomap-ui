<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow-xl rounded-2xl border-2 border-thistle">
    <h1 class="text-3xl font-display text-center text-paynes-gray mb-6 uppercase">
      {{ mode === 'login' ? 'Accedi' : mode === 'forgot' ? 'Recupero Password' : 'Nuova Password' }}
    </h1>

    <form v-if="mode === 'login'" @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium mb-1 text-paynes-gray">Email *</label>
        <input id="email" v-model="form.email" type="text" required placeholder="nome@dominio.it"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp transition duration-150" />
        <p v-if="!isEmailValid && form.email.length > 0" class="text-xs text-red-500 mt-1">
          Inserisci un formato email valido.
        </p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium mb-1 text-paynes-gray">Password *</label>
        <input id="password" v-model="form.password" type="password" required
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp transition duration-150" />
      </div>

      <p v-if="loginError" class="text-sm text-red-600 font-bold text-center animate-pulse">
        Credenziali errate. Riprova.
      </p>
      
      <div class="text-right">
        <button type="button" @click="mode = 'forgot'" class="text-sm text-zomp hover:text-paynes-gray transition duration-150 underline">
          Password Dimenticata?
        </button>
      </div>

      <button type="submit" class="w-full bg-zomp text-white py-2 rounded-lg hover:bg-paynes-gray transition duration-150 font-bold text-lg">
        Accedi
      </button>
    </form>

    <div v-else-if="mode === 'forgot'" class="space-y-4">
      <div v-if="!otpSent">
        <p class="text-sm text-paynes-gray mb-4">Inserisci la tua email per ricevere un codice di verifica.</p>
        <input v-model="form.email" type="email" placeholder="Email" class="w-full px-3 py-2 border rounded-lg mb-4" />
        <button @click="sendOtp" :disabled="!isEmailValid || isProcessing"
          class="w-full bg-zomp text-white py-2 rounded-lg font-bold disabled:opacity-50">
          {{ isProcessing ? 'Invio in corso...' : 'Invia OTP' }}
        </button>
        <button @click="mode = 'login'" class="w-full text-sm text-paynes-gray mt-2 underline">Torna al login</button>
      </div>

      <div v-else class="text-center">
        <p class="text-sm mb-4 text-paynes-gray">Inserisci il codice di 6 cifre inviato a <b>{{ form.email }}</b></p>
        
        <div v-if="mockOtp" class="text-xs font-bold text-red-600 mb-4 p-2 bg-red-50 border border-red-200 rounded">
          MOCK OTP: {{ mockOtp }}
        </div>

        <div class="flex justify-center space-x-2 mb-6">
          <input v-for="(digit, index) in otpDigits" :key="index" :id="'otp-input-' + index"
            v-model="otpDigits[index]" type="text" maxlength="1" inputmode="numeric"
            class="otp-input" @input="handleOtpInput(index)" @keydown.backspace="handleBackspace(index, $event)" />
        </div>

        <button @click="verifyOtp" :disabled="!isOtpComplete || isProcessing"
          class="w-full bg-zomp text-white py-2 rounded-lg font-bold">
          Verifica Codice
        </button>
        <button @click="otpSent = false" class="w-full text-sm text-paynes-gray mt-4 underline">Cambia email</button>
      </div>
    </div>

    <div v-else-if="mode === 'reset'" class="space-y-4">
      <p class="text-sm text-paynes-gray mb-2 font-bold uppercase">Imposta la nuova password</p>
      <input v-model="passwordForm.new" type="password" placeholder="Nuova Password" class="w-full px-3 py-2 border rounded-lg" @input="validatePassword" />
      
      <div v-if="passwordForm.new" class="p-2 rounded-lg bg-red-50 border border-red-200">
        <ul class="text-[10px] space-y-1 font-bold uppercase">
          <li :class="passRequirements.minLength ? 'text-zomp' : 'text-red-500'">• almeno 8 caratteri</li>
          <li :class="passRequirements.hasUpper ? 'text-zomp' : 'text-red-500'">• una maiuscola</li>
          <li :class="passRequirements.hasNumber ? 'text-zomp' : 'text-red-500'">• un numero</li>
          <li :class="passRequirements.hasSpecial ? 'text-zomp' : 'text-red-500'">• un carattere speciale</li>
        </ul>
      </div>

      <input v-model="passwordForm.confirm" type="password" placeholder="Conferma Password" class="w-full px-3 py-2 border rounded-lg" />
      
      <button @click="handleFinalReset" :disabled="!isPasswordValid || isProcessing"
        class="w-full bg-zomp text-white py-2 rounded-lg font-bold">
        {{ isProcessing ? 'Salvataggio...' : 'Salva Nuova Password' }}
      </button>
    </div>

    <p v-if="mode === 'login'" class="mt-6 text-center text-sm text-paynes-gray">
      Non hai un account?
      <router-link to="/signup" class="text-zomp hover:text-paynes-gray font-semibold transition duration-150">Registrati</router-link>
    </p>

    <AppModal 
      :is-open="modal.isOpen" 
      :title="modal.title" 
      @close="modal.isOpen = false"
    >
      <p class="text-center font-bold uppercase py-4">{{ modal.message }}</p>
      <button @click="modal.isOpen = false" class="w-full bg-zomp text-white py-2 rounded-lg font-bold mt-4 uppercase">Chiudi</button>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/services/apiClient'
import { validateEmailFormat } from '@/utils/helpers'
import AppModal from '@/components/AppModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// STATO PAGINA
const mode = ref('login') // login, forgot, reset
const isProcessing = ref(false)
const loginError = ref(false)

// STATO MODALE (MODIFICA 1)
const modal = reactive({
  isOpen: false,
  title: '',
  message: ''
})

function showMessage(title, message) {
  modal.title = title
  modal.message = message
  modal.isOpen = true
}

// LOGIN & FORGOT Dati
const form = ref({ email: '', password: '' })
const otpSent = ref(false)
const otpDigits = ref(["", "", "", "", "", ""])
const mockOtp = ref(null)
const validatedOtp = ref('') // Salviamo l'otp validato per inviarlo al reset

// RESET Password Dati
const passwordForm = reactive({ new: "", confirm: "" })
const passRequirements = reactive({ minLength: false, hasUpper: false, hasNumber: false, hasSpecial: false })

// VALIDAZIONI
const isEmailValid = computed(() => validateEmailFormat(form.value.email))
const isOtpComplete = computed(() => otpDigits.value.every(d => d.length === 1))

function validatePassword() {
  const p = passwordForm.new
  passRequirements.minLength = p.length >= 8
  passRequirements.hasUpper = /[A-Z]/.test(p)
  passRequirements.hasNumber = /\d/.test(p)
  passRequirements.hasSpecial = /[@$!%*?&]/.test(p)
}

const isPasswordValid = computed(() => 
  Object.values(passRequirements).every(v => v) && 
  passwordForm.new === passwordForm.confirm && 
  passwordForm.new !== ""
)

// AZIONI LOGIN
async function handleSubmit() {
  loginError.value = false
  try {
    await authStore.login({ email: form.value.email, password: form.value.password })
    router.push('/')
  } catch (error) {
    // MODIFICA 2: Gestione visiva errore credenziali (INVALID_CREDENTIALS)
    if (error.status === 401 || (error.message && error.message.includes('INVALID_CREDENTIALS'))) {
      loginError.value = true
    } else {
      showMessage('Errore Tecnico', error.message || 'Errore durante il login.')
    }
  }
}

// AZIONI RECUPERO (Richiesta 2)
async function sendOtp() {
  isProcessing.value = true
  try {
    const res = await apiClient.post('/auth/password-reset-init', { email: form.value.email })
    if (res.mockOtp) mockOtp.value = res.mockOtp
    otpSent.value = true
  } catch (e) {
    showMessage('Errore', "Errore nell'invio del codice. Verifica l'email.")
  } finally {
    isProcessing.value = false
  }
}

async function verifyOtp() {
  isProcessing.value = true
  const otpCode = otpDigits.value.join("")
  try {
    await apiClient.post('/auth/password-reset-verify', { email: form.value.email, otp: otpCode })
    validatedOtp.value = otpCode // Conserviamo il codice
    mode.value = 'reset' // Passiamo alla fase di cambio pass
  } catch (e) {
    showMessage('Errore', "Codice errato o scaduto.")
  } finally {
    isProcessing.value = false
  }
}

async function handleFinalReset() {
  isProcessing.value = true
  try {
    // Richiesta 2b: Invio OTP invece della vecchia password + flag fromOtp
    await apiClient.put(`/auth/password-reset-complete`, { 
      email: form.value.email,
      otp: validatedOtp.value, 
      new: passwordForm.new,
      fromOtp: true 
    })
    
    // MODIFICA 3: Login automatico post-reset e reindirizzamento
    await authStore.login({ 
      email: form.value.email, 
      password: passwordForm.new 
    })
    
    router.push('/')
  } catch (e) {
    showMessage('Errore Reset', e.message || "Errore durante il salvataggio della password.")
  } finally {
    isProcessing.value = false
  }
}

// GESTIONE INPUT OTP (Stessa logica della registrazione)
async function handleOtpInput(index) {
  otpDigits.value[index] = otpDigits.value[index].slice(0, 1)
  if (otpDigits.value[index] && index < otpDigits.value.length - 1) {
    await nextTick()
    document.getElementById(`otp-input-${index + 1}`)?.focus()
  }
}
function handleBackspace(index, event) {
  if (!otpDigits.value[index] && index > 0) {
    event.preventDefault()
    const prev = document.getElementById(`otp-input-${index - 1}`)
    if (prev) { prev.focus(); prev.select(); }
  }
}
</script>

<style scoped>
.otp-input {
  width: 45px;
  height: 45px;
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  border: 2px solid var(--thistle);
  border-radius: 8px;
  outline: none;
}
.otp-input:focus {
  border-color: var(--zomp);
  box-shadow: 0 0 0 2px rgba(98, 150, 119, 0.2);
}
.btn-primary { background: var(--zomp); color: white; transition: 0.2s; }
.btn-primary:hover { background: var(--paynes-gray); }
</style>