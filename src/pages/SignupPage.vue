<template>
  <div class="max-w-md mx-auto p-6 bg-theme-primary shadow-xl rounded-2xl border-2 border-thistle">
    <h1 class="text-3xl font-display mb-6 text-theme-main text-center">
      REGISTRAZIONE
    </h1>

    <form v-if="!otpSent" @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 text-theme-main">
          Username*
        </label>
        <input
          v-model="form.username"
          type="text"
          required
          class="filter-input"
          :class="{ 'border-red-500': form.username.length > 0 && !usernameAvailability }" />
        
        <p v-if="form.username.length > 0 && !usernameAvailability" class="text-xs text-red-500 mt-1">
          questo username è già in uso.
        </p>
        <p v-else-if="form.username.length > 0 && usernameAvailability && isUsernameValid" class="text-xs text-zomp mt-1">
          username disponibile!
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-theme-main">
          Email*
        </label>
        <input
          v-model="form.email"
          type="email"
          required
          class="filter-input"
          placeholder="nome@dominio.it"
          :class="{ 'border-red-500': !isEmailValid && form.email.length > 0 }" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-theme-main">
          Password*
        </label>
        <input
          v-model="form.password"
          type="password"
          required
          class="filter-input"
          :class="{ 'border-red-500': !isPasswordValid && form.password.length > 0 }"
          @input="validatePassword" />

        <div v-if="!isPasswordValid && form.password.length > 0" class="mt-2 p-2 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300">
          <p class="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
            requisiti password:
          </p>
          <ul class="text-xs list-disc pl-5 space-y-0.5">
            <li :class="passwordRequirements.minLength ? 'text-zomp' : 'text-red-500'">almeno 8 caratteri.</li>
            <li :class="passwordRequirements.hasUpper ? 'text-zomp' : 'text-red-500'">maiuscola (a-z).</li>
            <li :class="passwordRequirements.hasLower ? 'text-zomp' : 'text-red-500'">minuscola (a-z).</li>
            <li :class="passwordRequirements.hasNumber ? 'text-zomp' : 'text-red-500'">numero (0-9).</li>
            <li :class="passwordRequirements.hasSpecial ? 'text-zomp' : 'text-red-500'">speciale (@$!%*?&).</li>
          </ul>
        </div>
      </div>

      <div class="space-y-2 text-theme-main">
        <div class="filter-checkbox-group items-center">
          <input v-model="form.acceptTerms" type="checkbox" required class="filter-checkbox" />
          <span class="text-sm">
            accetto i 
            <span @click="showTermsModal = true" class="text-zomp hover:underline font-bold cursor-pointer ml-1">
              termini e condizioni
            </span>*
          </span>
        </div>

        <div class="filter-checkbox-group items-center">
          <input v-model="form.acceptPrivacy" type="checkbox" required class="filter-checkbox" />
          <span class="text-sm">
            accetto il 
            <span @click="showPrivacyModal = true" class="text-zomp hover:underline font-bold cursor-pointer ml-1">
              trattamento dei dati
            </span>*
          </span>
        </div>

        <div class="filter-checkbox-group items-center">
          <input v-model="form.ofAge" type="checkbox" required class="filter-checkbox" />
          <span class="text-sm">dichiaro di essere maggiorenne* </span>
        </div>
      </div>

      <button type="submit" class="btn-modal-confirm w-full justify-center py-3" :disabled="isSubmittingDisabled">
        {{ isSendingOtp ? "invio in corso..." : "Registrati" }}
      </button>
    </form>

    <div v-else class="text-center p-4 bg-theme-primary rounded-2xl border-2 border-thistle">
      <h2 class="text-2xl font-display mb-4 text-theme-main uppercase">verifica email</h2>
      
      <div class="flex justify-center space-x-2 mb-6">
        <input
          v-for="(digit, index) in otpDigits"
          :key="index"
          :id="'otp-input-' + index"
          v-model="otpDigits[index]"
          class="otp-input"
          @input="handleOtpInput(index)"
          @keydown.backspace="handleBackspace(index, $event)" />
      </div>

      <button @click="handleOtpSubmit" :disabled="!isOtpComplete || isBlocked" class="btn-modal-confirm w-full justify-center py-3">
        verifica e continua
      </button>
      
      <div class="mt-4 flex justify-center space-x-4">
        <button @click="resendOtp" :disabled="isResending" class="text-sm text-theme-main hover:text-zomp underline">
          {{ isResending ? "invio..." : "invia di nuovo" }}
        </button>
        <button @click="resetToInitialForm" class="text-sm text-theme-main hover:text-zomp underline">
          indietro
        </button>
      </div>
    </div>

    <p v-if="!otpSent" class="mt-6 text-center text-sm text-theme-main">
      Hai già un account?
      <router-link to="/login" class="text-zomp hover:underline font-bold">
        Accedi
      </router-link>
    </p>

    <AppModal :is-open="showTermsModal" title="termini e condizioni" :content="termsContent" @close="showTermsModal = false" />
    <AppModal :is-open="showPrivacyModal" title="privacy" :content="privacyContent" @close="showPrivacyModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import AppModal from "@/components/AppModal.vue";
import { apiClient } from "@/services/apiClient";
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from "@/utils/legalTexts";
import { useAuthStore } from "@/stores/authStore";
import { validateEmailFormat } from "@/utils/helpers";

const authStore = useAuthStore();

const router = useRouter();

// ============================================================================
//                             STATO FORM PRINCIPALE
// ============================================================================

/**
 * Dati del form di registrazione (fase 1)
 */
const form = ref({
  username: "",
  email: "",
  password: "",
  acceptTerms: false,
  acceptPrivacy: false,
  ofAge: false,
});

// ============================================================================
//                          MODALI TERMINI E PRIVACY
// ============================================================================

const showTermsModal = ref(false);
const showPrivacyModal = ref(false);
const termsContent = TERMS_AND_CONDITIONS;
const privacyContent = PRIVACY_POLICY;

// ============================================================================
//          VALIDAZIONE USERNAME (con debounce e controllo disponibilità)
// ============================================================================

// Indica se l'username digitato è disponibile (non esiste nel database)
const usernameAvailability = ref(true);
// Indica se è in corso la verifica asincrona dell'username
const isCheckingUsername = ref(false);
// Stato finale di validità dell'username (disponibile e formato corretto)
const isUsernameValid = ref(false);
// Timer per debounce della validazione username (evita chiamate API ad ogni keystroke)
let usernameCheckTimeout = null;

/**
 * Watcher che attiva la validazione username con debounce di 500ms
 */
watch(
  () => form.value.username,
  (newUsername) => {
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    isCheckingUsername.value = true;

    usernameCheckTimeout = setTimeout(() => {
      validateUsername(newUsername);
      isCheckingUsername.value = false;
    }, 500);
  }
);

/**
 * Verifica la disponibilità dell'username tramite chiamata API
 * @param {string} username - Username da verificare
 */
async function validateUsername(username) {
  usernameAvailability.value = true;
  isUsernameValid.value = false;

  if (username.length === 0) {
    return;
  }

  try {
    const response = await apiClient.get(`/users/check-exists/${username}`);

    if (response && typeof response.exists === "boolean") {
      const isTaken = response.exists;
      usernameAvailability.value = !isTaken;
      isUsernameValid.value = !isTaken;
    } else {
      console.error("Risposta API malformata:", response);
      usernameAvailability.value = true;
      isUsernameValid.value = true;
    }
  } catch (error) {
    console.error("Errore durante la verifica username:", error);

    if (error.message.includes("500")) {
      console.error("Errore server - assumo username disponibile");
      usernameAvailability.value = true;
      isUsernameValid.value = true;
    } else {
      usernameAvailability.value = false;
      isUsernameValid.value = false;
    }
  }
}

// ============================================================================
//                  VALIDAZIONE EMAIL E PASSWORD (lato client)
// ============================================================================

// Indica se il formato email è valido
const isEmailValid = computed(() => {
  return validateEmailFormat(form.value.email);
});
// Indica se la password soddisfa tutti i requisiti
const isPasswordValid = ref(true);
// Dettaglio requisiti password per feedback visivo granulare
const passwordRequirements = ref({
  minLength: false,
  hasUpper: false,
  hasLower: false,
  hasNumber: false,
  hasSpecial: false,
});

/**
 * Valida la password controllando ogni requisito di sicurezza
 */
function validatePassword() {
  const p = form.value.password;

  passwordRequirements.value.minLength = p.length >= 8;
  passwordRequirements.value.hasUpper = /[A-Z]/.test(p);
  passwordRequirements.value.hasLower = /[a-z]/.test(p);
  passwordRequirements.value.hasNumber = /\d/.test(p);
  passwordRequirements.value.hasSpecial = /[@$!%*?&]/.test(p);

  const allValid =
    passwordRequirements.value.minLength &&
    passwordRequirements.value.hasUpper &&
    passwordRequirements.value.hasLower &&
    passwordRequirements.value.hasNumber &&
    passwordRequirements.value.hasSpecial;

  isPasswordValid.value = allValid || p.length === 0;
}

// ============================================================================
//                  STATO E VALIDAZIONE GENERALE FORM
// ============================================================================

// Indica se è in corso l'invio della richiesta OTP
const isSendingOtp = ref(false);

/**
 * Disabilita il pulsante submit se il form non è valido o è in corso una verifica
 */
const isSubmittingDisabled = computed(() => {
  return !isFormValid.value || isCheckingUsername.value || isSendingOtp.value;
});

/**
 * Il form è valido se tutti i campi rispettano le regole e le checkbox sono spuntate
 */
const isFormValid = computed(() => {
  return (
    form.value.username.length > 0 &&
    form.value.email.length > 0 &&
    form.value.password.length >= 8 &&
    isEmailValid.value &&
    isPasswordValid.value &&
    isUsernameValid.value &&
    form.value.acceptTerms &&
    form.value.acceptPrivacy &&
    form.value.ofAge
  );
});

// ============================================================================
//                               GESTIONE FASE OTP
// ============================================================================

// Array di 6 cifre per l'input OTP
const otpDigits = ref(["", "", "", "", "", ""]);
// Indica se la schermata OTP è visibile (fase 2 registrazione)
const otpSent = ref(false);
// OTP mock ricevuto dal backend in modalità debug
const mockOtp = ref(null);
// Indica se è presente un errore di verifica OTP
const otpError = ref(false);
// Messaggio di errore dinamico ricevuto dal backend
const otpErrorMessage = ref("");
// Numero di tentativi rimasti (sincronizzato con il backend)
const retryCount = ref(3);
// Numero massimo di tentativi consentiti
const maxRetries = 3;
// Indica se l'account è bloccato per troppi tentativi falliti
const isBlocked = ref(false);
// Indica se è in corso il reinvio del codice OTP
const isResending = ref(false);

// l'OTP è completo quando tutte e 6 le cifre sono inserite
const isOtpComplete = computed(() => {
  return otpDigits.value.every((digit) => digit.length === 1);
});

/**
 * Gestisce l'input di una singola cifra OTP e sposta il focus al campo successivo
 * @param {number} index - Indice del campo OTP corrente (0-5)
 */
async function handleOtpInput(index) {
  // Limita l'input a un solo carattere
  otpDigits.value[index] = otpDigits.value[index].slice(0, 1);

  // Sposta il focus al campo successivo se presente
  if (otpDigits.value[index] && index < otpDigits.value.length - 1) {
    await nextTick();
    const nextInput = document.getElementById(`otp-input-${index + 1}`);
    if (nextInput) {
      nextInput.focus();
    }
  }
}

/**
 * Gestisce il tasto Backspace per spostarsi al campo precedente
 * @param {number} index - Indice del campo OTP corrente (0-5)
 * @param {Event} event - Evento tastiera
 */
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

/**
 * Gestisce la visualizzazione dell'errore OTP basandosi sui dati ricevuti dal backend
 * @param {Object} errorDetails - Dettagli errore dal backend (retriesRemaining, isBlocked, message)
 */
function handleOtpError(errorDetails) {
  // Aggiorna lo stato con i valori ricevuti dal backend
  retryCount.value = Math.max(0, errorDetails.retriesRemaining || 0);
  isBlocked.value = errorDetails.isBlocked || retryCount.value === 0;
  otpError.value = true;

  console.warn(
    `Tentativi rimasti: ${retryCount.value}. Bloccato: ${isBlocked.value}`
  );
}

/**
 * Resetta lo stato di errore OTP e pulisce i campi di input
 */
function resetOtpError() {
  otpError.value = false;
  otpErrorMessage.value = "";
  otpDigits.value = ["", "", "", "", "", ""];
}

/**
 * Torna alla schermata di registrazione iniziale
 */
function resetToInitialForm() {
  otpSent.value = false;
  resetOtpError();
  retryCount.value = maxRetries;
  isBlocked.value = false;
  mockOtp.value = null;
}

// ============================================================================
//                   INVIO FORM INIZIALE E RICHIESTA OTP
// ============================================================================

/**
 * Gestisce l'invio del form iniziale e la richiesta di generazione OTP
 */
async function handleSubmit() {
  if (!isFormValid.value || isSendingOtp.value) {
    alert("Compilare tutti i campi correttamente e accettare i termini.");
    return;
  }

  isSendingOtp.value = true;
  console.log("Tentativo di invio OTP per:", form.value.email);

  try {
    const payload = {
      email: form.value.email,
      username: form.value.username,
    };

    const response = await apiClient.post("/auth/register-init", payload);

    // Verifica se il backend ha restituito un OTP mock (modalità debug)
    if (response && response.mockOtp && response.mockOtp !== null) {
      mockOtp.value = response.mockOtp;
      console.log("Mock OTP ricevuto dal backend:", mockOtp.value);
    } else {
      mockOtp.value = null;
    }

    // Passa alla schermata di verifica OTP
    otpSent.value = true;
  } catch (error) {
    let errorMessage = "Impossibile completare la richiesta.";

    if (error.message.includes("API Error 409")) {
      errorMessage = "Email già registrata.";
    } else if (error.message.includes("API Error 500")) {
      errorMessage = "Errore interno del server durante l'invio email.";
    }

    alert(`Errore durante l'avvio della registrazione: ${errorMessage}`);
    console.error("Errore Backend in handleSubmit:", error);
  } finally {
    isSendingOtp.value = false;
  }
}

/**
 * Reinvia il codice OTP (chiama nuovamente register-init)
 */
async function resendOtp() {
  if (isBlocked.value || isResending.value) {
    return;
  }

  isResending.value = true;
  resetOtpError();

  try {
    const payload = {
      email: form.value.email,
      username: form.value.username,
    };

    const response = await apiClient.post("/auth/register-init", payload);

    if (
      response &&
      response.mockOtp &&
      response.mockOtp !== "null" &&
      response.mockOtp !== null
    ) {
      mockOtp.value = response.mockOtp;
      console.log("Nuovo Mock OTP ricevuto dal backend:", mockOtp.value);
    } else {
      mockOtp.value = null;
    }

    // Reset completo dello stato OTP
    retryCount.value = maxRetries;
    isBlocked.value = false;

    await nextTick();
    const firstInput = document.getElementById("otp-input-0");
    if (firstInput) {
      firstInput.focus();
    }
  } catch (error) {
    let errorMessage = "Impossibile inviare un nuovo codice.";

    if (error.message.includes("API Error 500")) {
      errorMessage = "Errore interno: Impossibile inviare l'email di verifica.";
    }

    alert(`Errore di reinvio: ${errorMessage}`);
    console.error("Errore Backend in resendOtp:", error);
  } finally {
    isResending.value = false;
  }
}

// ============================================================================
//              VERIFICA OTP E COMPLETAMENTO REGISTRAZIONE
// ============================================================================

/**
 * Invia il codice OTP per la verifica al backend
 */
async function handleOtpSubmit() {
  if (isBlocked.value) {
    alert("Account bloccato. Richiedi un nuovo codice.");
    return;
  }

  const inputOtpString = otpDigits.value.join("");

  const payload = {
    email: form.value.email,
    otp: inputOtpString,
  };

  try {
    // Se la verifica ha successo, il backend risponde con 204 No Content
    await apiClient.post("/auth/register-verify", payload);

    console.log("Verifica OTP riuscita.");
    // Procede con la registrazione finale
    await completeRegistration();
  } catch (error) {
    // Il backend risponde con 403 Forbidden in caso di OTP errato
    if (error.status === 403) {
      try {
        const errorData = JSON.parse(error.message);
        handleOtpError(errorData);
      } catch (e) {
        console.error("Errore durante la lettura dei dettagli OTP 403:", e);
        handleOtpError({
          message: "Codice OTP non valido o scaduto. Riprova.",
          retriesRemaining: Math.max(0, retryCount.value - 1),
          isBlocked: retryCount.value <= 1,
        });
      }
    } else if (error.status === 401) {
      console.error(
        "Verifica OTP fallita per errore 401: Controllare la configurazione apiClient."
      );
      alert("Errore di autenticazione inatteso.");
    } else {
      alert("Errore di sistema durante la verifica OTP.");
      console.error("Verifica OTP fallita per errore API:", error);
    }
  }
}

/**
 * Completa la registrazione inviando i dati finali al backend che effettua il login automatico
 */
async function completeRegistration() {
  console.log("Completamento registrazione per:", form.value.email);

  const payload = {
    username: form.value.username,
    email: form.value.email,
    password: form.value.password,
    acceptTerms: form.value.acceptTerms,
    acceptPrivacy: form.value.acceptPrivacy,
  };

  try {
    // La risposta dal BE contiene { userId, message } e imposta il Cookie SESSION_ID
    const response = await apiClient.post("/auth/register", payload);

    console.log("Registrazione finale riuscita:", response);

    // Verifica la presenza dell'ID utente (unico dato atteso nel corpo)
    if (response && response.userId) {
      // L'autenticazione è avvenuta con successo (Cookie SESSION_ID impostato dal BE)
      authStore.setAuth(response.userId); // Chiama setAuth con il solo ID
      console.log(
        "Utente creato e accesso automatico riuscito (tramite Session ID)."
      );

      await nextTick();
      // Naviga alla pagina di configurazione della posizione
      router.push("/set-location");
    } else {
      // BE risponde 201 ma non manda l'ID utente nel corpo
      throw new Error("ID utente mancante nella risposta del server.");
    }
  } catch (error) {
    // gestione degli errori API 409 o 500
    let errorMessage = "Errore durante la creazione finale dell'utente.";

    // Se error ha un messaggio API specifico (es. API Error 409), usalo
    if (error.message && error.message.includes("API Error")) {
      errorMessage = `Errore API: ${error.message}`;
    }

    alert(`Errore: ${errorMessage}`);
    console.error("Errore registrazione finale:", error);
  }
}

/**
 * Reindirizza alla home page
 */
function goHome() {
  router.push("/");
}
</script>

<style scoped>
.otp-input {
  /* Stili base per desktop e tablet */
  width: 50px;
  min-width: 40px;
  max-width: 50px;

  aspect-ratio: 1 / 1; /* Garantisce che siano quadrati */

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

/* Ottimizzazione per schermi piccoli (mobile) */
@media (max-width: 640px) {
  .otp-input {
    /* Riduzione dimensionale su mobile */
    width: 13vw;
    min-width: 38px;
    max-width: 45px;
    font-size: 1.2rem;
  }
}
</style>
