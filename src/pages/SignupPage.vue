<template>
  <div class="max-w-md mx-auto p-6 bg-theme-primary shadow-xl rounded-2xl border-2 border-thistle">
    <h1 class="text-3xl font-display mb-6 text-paynes-gray text-center">REGISTRAZIONE</h1>
    
    <form v-if="!otpSent" @submit.prevent="handleSubmit" class="space-y-4">
      
     <div>
        <label for="username" class="block text-sm font-medium mb-1 text-paynes-gray">
          Username *
        </label>
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp transition duration-150"
          :class="{'border-red-500': form.username.length > 0 && !usernameAvailability}"
        />
        
        <p v-if="form.username.length > 0 && !usernameAvailability" class="text-xs text-red-500 mt-1">
            Questo username è già in uso.
        </p>
        <p v-else-if="form.username.length > 0 && usernameAvailability && isUsernameValid" class="text-xs text-zomp mt-1">
            Username disponibile!
        </p>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium mb-1 text-paynes-gray">
          Email *
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp transition duration-150"
          :class="{'border-red-500': !isEmailValid && form.email.length > 0}"
          @input="validateEmail"
        />
        <p v-if="!isEmailValid && form.email.length > 0" class="text-xs text-red-500 mt-1">
          Inserisci un'email valida (es. nome@dominio.it).
        </p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium mb-1 text-paynes-gray">
          Password *
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          minlength="8"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp transition duration-150"
          :class="{'border-red-500': !isPasswordValid && form.password.length > 0}"
          @input="validatePassword"
        />
        
        <div v-if="!isPasswordValid && form.password.length > 0" class="mt-2 p-2 rounded-lg bg-red-100 dark:bg-red-900 border border-red-300">
            <p class="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">
                La password non soddisfa i requisiti minimi:
            </p>
            <ul class="text-xs list-disc pl-5 space-y-0.5">
                <li :class="passwordRequirements.minLength ? 'text-zomp dark:text-tea-rose-red' : 'text-red-500 dark:text-red-300'">
                    Almeno 8 caratteri.
                </li>
                <li :class="passwordRequirements.hasUpper ? 'text-zomp dark:text-tea-rose-red' : 'text-red-500 dark:text-red-300'">
                    Almeno una lettera Maiuscola (A-Z).
                </li>
                <li :class="passwordRequirements.hasLower ? 'text-zomp dark:text-tea-rose-red' : 'text-red-500 dark:text-red-300'">
                    Almeno una lettera minuscola (a-z).
                </li>
                <li :class="passwordRequirements.hasNumber ? 'text-zomp dark:text-tea-rose-red' : 'text-red-500 dark:text-red-300'">
                    Almeno un numero (0-9).
                </li>
                <li :class="passwordRequirements.hasSpecial ? 'text-zomp dark:text-tea-rose-red' : 'text-red-500 dark:text-red-300'">
                    Almeno un carattere speciale (@$!%*?&).
                </li>
            </ul>
        </div>
      </div>


      <div class="space-y-2 text-paynes-gray">
          
        <label class="flex items-start">
          <input
            v-model="form.acceptTerms"
            type="checkbox"
            required
            class="mt-1 mr-2 form-checkbox text-zomp rounded border-ash-gray focus:ring-zomp"
          />
          <span class="text-sm">
            Accetto i 
            <a @click.stop.prevent="showTermsModal = true" class="text-zomp hover:underline font-semibold transition duration-150 cursor-pointer">termini e condizioni</a> *
          </span>
        </label>

        <label class="flex items-start">
          <input
            v-model="form.acceptPrivacy"
            type="checkbox"
            required
            class="mt-1 mr-2 form-checkbox text-zomp rounded border-ash-gray focus:ring-zomp"
          />
          <span class="text-sm">
            Accetto il 
            <a @click.stop.prevent="showPrivacyModal = true" class="text-zomp hover:underline font-semibold transition duration-150 cursor-pointer">trattamento dei dati personali</a> *
          </span>
        </label>
      </div>

     <button
        type="submit"
        class="w-full bg-zomp text-white py-2 rounded-lg hover:bg-paynes-gray transition duration-150"
        :disabled="isSubmittingDisabled" >
        Registrati
      </button>
    </form>

    <div v-else class="text-center p-4 bg-tea-rose-red/20 rounded-lg border-2 border-tea-rose-red">
        <p class="text-paynes-gray text-lg mb-4">
            Abbiamo inviato un codice di attivazione all'indirizzo email <b>{{ form.email }}</b>.
        </p>

        <div v-if="otpError" class="p-2 mb-4 text-sm font-semibold text-red-700 bg-red-200 rounded-lg">
            Codice non valido. Riprova. Hai 3 tentativi rimanenti.
        </div>
        
        <p class="text-sm font-bold text-red-600 mb-6 p-2 bg-theme-primary rounded">
            👉 MOCK: Il codice OTP da inserire è: {{ mockOtp }} 👈
        </p>
        
        <div class="flex justify-center space-x-2 mb-6">
            <input
                v-for="(digit, index) in otpDigits"
                :key="index"
                :id="'otp-input-' + index"
                v-model="otpDigits[index]"
                type="text"
                maxlength="1"
                inputmode="numeric"
                pattern="[0-9]"
                class="otp-input"
                @input="handleOtpInput(index)"
                @keydown.backspace="handleBackspace(index, $event)"
                @paste.prevent
            />
        </div>
        
        <button
            @click="handleOtpSubmit"
            :disabled="!isOtpComplete"
            class="w-full bg-zomp text-white py-2 rounded-lg hover:bg-paynes-gray transition duration-150 disabled:opacity-50"
        >
            Verifica e Continua
        </button>

        <div class="flex justify-center space-x-4 mt-4">
            <button 
                @click="resendOtp" 
                class="text-sm text-paynes-gray hover:text-zomp underline"
            >
                Invia di nuovo Codice
            </button>

            <button 
                @click="otpSent = false" 
                class="text-sm text-paynes-gray hover:text-zomp underline"
            >
                Torna alla registrazione
            </button>
        </div>
    </div>

    <p class="mt-6 text-center text-sm text-paynes-gray">
      Hai già un account?
      <router-link to="/login" class="text-zomp hover:text-paynes-gray font-semibold transition duration-150">
        Accedi
      </router-link>
    </p>
  </div>
  
  <AppModal 
      :is-open="showTermsModal"
      title="Termini e Condizioni"
      :content="termsContent"
      @close="showTermsModal = false"
  />

  <AppModal 
      :is-open="showPrivacyModal"
      title="Informativa sulla Privacy"
      :content="privacyContent"
      @close="showPrivacyModal = false"
  />

</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppModal from '@/components/AppModal.vue' 
import { apiClient } from '@/services/apiClient'
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from '@/utils/legalTexts'

const router = useRouter()

// --- STATO DEL FORM PRINCIPALE ---

const form = ref({
  username: '',
  email: '',
  password: '',
  acceptTerms: false,
  acceptPrivacy: false
})

// --- GESTIONE DEI DATI STATICI E MODALI ---

const showTermsModal = ref(false)
const showPrivacyModal = ref(false)
const termsContent = TERMS_AND_CONDITIONS
const privacyContent = PRIVACY_POLICY

// --- VALIDAZIONE USERNAME ---

const usernameAvailability = ref(true); // true se l'username digitato è libero
const isCheckingUsername = ref(false); // Stato di caricamento/debounce
const isUsernameValid = ref(false); // Stato finale di validità per il form

let usernameCheckTimeout = null;

watch(() => form.value.username, (newUsername) => {
    // Implementa il debounce (ritardo) per non chiamare la validazione ad ogni keystroke
    if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
    }
    
    // Blocca il form e mostra lo stato di attesa durante il debounce
    isCheckingUsername.value = true; 
    
    usernameCheckTimeout = setTimeout(() => {
        validateUsername(newUsername);
        isCheckingUsername.value = false; 
    }, 500);
});


async function validateUsername(username) {
    usernameAvailability.value = true;
    isUsernameValid.value = false;

    if (username.length === 0) {
        return;
    }
    
    try {
        const response = await apiClient.get(`/users/check-exists/${username}`);
        
        const isTaken = response; 
        
        usernameAvailability.value = !isTaken; // True se NON è preso
        isUsernameValid.value = !isTaken;

    } catch (error) {
        console.error('Errore durante la verifica username:', error);
        usernameAvailability.value = false;
        isUsernameValid.value = false;
    }
}

// --- VALIDAZIONE FRONT-END (Email e Password) ---

const isEmailValid = ref(true)
const isPasswordValid = ref(true)

const passwordRequirements = ref({
    minLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false,
});


function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isEmailValid.value = emailRegex.test(form.value.email) || form.value.email.length === 0;
}

function validatePassword() {
    const p = form.value.password;
    
    passwordRequirements.value.minLength = p.length >= 8;
    passwordRequirements.value.hasUpper = /[A-Z]/.test(p);
    passwordRequirements.value.hasLower = /[a-z]/.test(p);
    passwordRequirements.value.hasNumber = /\d/.test(p);
    passwordRequirements.value.hasSpecial = /[@$!%*?&]/.test(p);

    const allValid = passwordRequirements.value.minLength &&
                     passwordRequirements.value.hasUpper &&
                     passwordRequirements.value.hasLower &&
                     passwordRequirements.value.hasNumber &&
                     passwordRequirements.value.hasSpecial;
                     
    isPasswordValid.value = allValid || p.length === 0;
}


// --- STATO GENERALE DEL FORM ---

const isSubmittingDisabled = computed(() => {
    // Disabilita se il form non è valido O se è in corso la verifica dell'username (debounce)
    return !isFormValid.value || isCheckingUsername.value;
});

const isFormValid = computed(() => {
    // Il form è valido solo se tutti i campi sono validi (incluso il check univocità) e le checkbox sono spuntate
    return form.value.username.length > 0 &&
           form.value.email.length > 0 &&
           form.value.password.length >= 8 &&
           isEmailValid.value &&
           isPasswordValid.value &&
           isUsernameValid.value &&
           form.value.acceptTerms && 
           form.value.acceptPrivacy; 
})


// --- GESTIONE OTP E ATTIVAZIONE ACCOUNT ---

const otpDigits = ref(['', '', '', '', '', '']) 
const otpSent = ref(false) 
const mockOtp = ref(null) 
const otpError = ref(false); 

const isOtpComplete = computed(() => {
    return otpDigits.value.every(digit => digit.length === 1);
})

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

async function handleOtpInput(index) {
    otpDigits.value[index] = otpDigits.value[index].slice(0, 1);

    if (otpDigits.value[index] && index < otpDigits.value.length - 1) {
        await nextTick();
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

async function handleBackspace(index, event) {
    if (!otpDigits.value[index] && index > 0) {
        event.preventDefault(); 
        
        await nextTick();
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        if (prevInput) {
            prevInput.focus();
            prevInput.select();
        }
    }
}

function handleOtpError() {
    // Mostra l'errore per 5s e resetta i campi OTP
    otpError.value = true;
    setTimeout(() => {
        otpError.value = false;
        otpDigits.value = ['', '', '', '', '', ''];
    }, 5000); 
}

async function resendOtp() {
    // Simula la rigenerazione e l'invio di un nuovo codice
    mockOtp.value = generateOtp();
    
    otpDigits.value = ['', '', '', '', '', ''];
    otpError.value = false;
    
    await nextTick();
    const firstInput = document.getElementById('otp-input-0');
    if (firstInput) {
        firstInput.focus();
    }
    
    alert('Nuovo codice inviato all\'email (controlla il MOCK)');
}

async function handleSubmit() {
    // Invia i dati al BE (Mock)
    if (!isFormValid.value) {
        alert('Per favore, compila tutti i campi correttamente e accetta i termini.');
        return;
    }
    
    console.log('Tentativo di registrazione e invio OTP per:', form.value.email)
    
    try {
        // Logica mock
        mockOtp.value = generateOtp();
        otpSent.value = true;
    } catch (error) {
        alert('Errore durante la registrazione/invio OTP: ' + error.message)
    }
}

async function handleOtpSubmit() {
    // Verifica il codice inserito
    const inputOtpString = otpDigits.value.join('');

    if (inputOtpString === mockOtp.value) {
        // Successo: reindirizza alla pagina di impostazione posizione
        router.push('/set-location');
    } else {
        // Errore: mostra feedback in linea
        handleOtpError();
    }
}
</script>

<style scoped>
.otp-input {
    width: 12vw; 
    max-width: 50px; 
    min-width: 30px; 
    
    aspect-ratio: 1 / 1; 
    
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
    border: 2px solid var(--ash-gray);
    border-radius: 8px;
    background-color: var(--bg-primary); 
    color: var(--text-primary);
    transition: all 0.15s ease;
}
.otp-input:focus {
    outline: none;
    border-color: var(--zomp);
    box-shadow: 0 0 0 2px var(--zomp);
}

@media (max-width: 640px) {
    .otp-input {
        width: 13vw; 
        font-size: 1.2rem;
    }
}
</style>