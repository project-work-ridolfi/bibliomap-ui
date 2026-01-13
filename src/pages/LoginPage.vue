<template>
  <div
    class="max-w-md mx-auto p-6 bg-theme-primary shadow-xl rounded-2xl border-2 border-thistle">
    <h1
      class="text-3xl font-display text-center text-theme-main mb-6 uppercase">
      {{
        mode === "login"
          ? "Accedi"
          : mode === "forgot"
          ? "Recupero Password"
          : "Nuova Password"
      }}
    </h1>

    <!-- SEZIONE LOGIN -->
    <form
      v-if="mode === 'login'"
      @submit.prevent="handleSubmit"
      class="space-y-4">
      <!-- Campo email con validazione formato -->
      <div>
        <label
          for="email"
          class="block text-sm font-medium mb-1 text-theme-main"
          >Email*</label
        >
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="nome@dominio.it"
          aria-label="Inserisci la tua email"
          class="filter-input" />
        <p
          v-if="!isEmailValid && form.email.length > 0"
          class="text-xs text-red-500 mt-1"
          role="alert">
          Inserisci un formato email valido.
        </p>
      </div>

      <!-- Campo password con toggle visibilità -->
      <div>
        <label
          for="password"
          class="block text-sm font-medium mb-1 text-theme-main"
          >Password*</label
        >
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            placeholder="Inserisci la password"
            aria-label="Inserisci la tua password"
            class="filter-input pr-10" />

          <!-- Pulsante toggle visibilità password con aria-label -->
          <button
            type="button"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Nascondi password' : 'Mostra password'"
            class="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
            tabindex="-1">
            <!-- Icona occhio: password nascosta -->
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>

            <!-- Icona occhio barrato: password visibile -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.94 17.94A10.08 10.08 0 0 1 12 20c-7 0-11-8-11-8a18.3 18.3 0 0 1 5.06-5.94M9.88 9.88A3 3 0 0 1 14.12 14.12M1 1l22 22" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Messaggio errore credenziali -->
      <p
        v-if="loginError"
        class="text-sm text-red-600 font-bold text-center animate-pulse"
        role="alert">
        Credenziali errate. Riprova.
      </p>

      <!-- Link al recupero password -->
      <div class="text-right">
        <button
          type="button"
          @click="mode = 'forgot'"
          class="text-sm text-zomp hover:text-theme-main transition duration-150 underline">
          Password Dimenticata?
        </button>
      </div>

      <button
        type="submit"
        class="btn-modal-confirm w-full justify-center py-2 text-lg">
        Accedi
      </button>
    </form>

    <!-- SEZIONE RECUPERO PASSWORD (OTP) -->
    <div v-else-if="mode === 'forgot'" class="space-y-4">
      <!-- Step 1: Richiesta OTP -->
      <div v-if="!otpSent">
        <p class="text-sm text-theme-main mb-4">
          Inserisci la tua email per ricevere un codice di verifica.
        </p>
        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          aria-label="Inserisci la tua email per il recupero"
          class="filter-input mb-4" />
        <button
          @click="sendOtp"
          :disabled="!isEmailValid || isProcessing"
          class="btn-modal-confirm w-full justify-center py-2">
          {{ isProcessing ? "Invio in corso..." : "Invia OTP" }}
        </button>
        <button
          @click="mode = 'login'"
          class="w-full text-sm text-theme-main mt-2 underline">
          torna al login
        </button>
      </div>

      <!-- Step 2: Verifica OTP ricevuto -->
      <div v-else class="text-center">
        <p class="text-sm mb-4 text-theme-main">
          Inserisci il codice di 6 cifre inviato a <b>{{ form.email }}</b>
        </p>

        <div
          v-if="mockOtp"
          class="text-xs font-bold text-red-600 mb-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          MOCK OTP: {{ mockOtp }}
        </div>

        <div class="flex justify-center space-x-2 mb-6">
          <input
            v-for="(digit, index) in otpDigits"
            :key="index"
            :id="'otp-input-' + index"
            v-model="otpDigits[index]"
            type="text"
            maxlength="1"
            inputmode="numeric"
            :aria-label="`Cifra ${index + 1} del codice`"
            class="otp-input"
            @input="handleOtpInput(index)"
            @keydown.backspace="handleBackspace(index, $event)" />
        </div>

        <!-- Pulsante verifica OTP -->
        <button
          @click="verifyOtp"
          :disabled="!isOtpComplete || isProcessing"
          class="btn-modal-confirm w-full justify-center py-2">
          Verifica Codice
        </button>
        <button
          @click="otpSent = false"
          class="w-full text-sm text-theme-main mt-4 underline">
          Cambia email
        </button>
      </div>
    </div>

    <!-- SEZIONE RESET PASSWORD -->
    <div v-else-if="mode === 'reset'" class="space-y-4">
      <p class="text-sm text-theme-main mb-2 font-bold uppercase">
        Imposta la nuova password
      </p>
      
      <!-- Input nuova password con validazione real-time -->
      <input
        v-model="passwordForm.new"
        type="password"
        placeholder="Nuova Password"
        aria-label="Inserisci la nuova password"
        class="filter-input"
        @input="validatePassword" />

      <!-- Checklist dinamico requisiti password -->
      <div
        v-if="passwordForm.new"
        class="p-2 rounded-lg border transition-colors duration-300"
        :class="
          allRequirementsMet
            ? 'bg-zomp/10 border-zomp'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        "
        role="status"
        aria-live="polite">
        <ul class="text-[10px] space-y-1 font-bold uppercase">
          <li
            :class="passRequirements.minLength ? 'text-zomp' : 'text-red-500'">
            • almeno 8 caratteri
          </li>
          <li :class="passRequirements.hasUpper ? 'text-zomp' : 'text-red-500'">
            • una maiuscola
          </li>
          <li
            :class="passRequirements.hasNumber ? 'text-zomp' : 'text-red-500'">
            • un numero
          </li>
          <li
            :class="passRequirements.hasSpecial ? 'text-zomp' : 'text-red-500'">
            • un carattere speciale (@$!%*?&)
          </li>
        </ul>
      </div>

      <!-- Input conferma password -->
      <div>
        <input
          v-model="passwordForm.confirm"
          type="password"
          placeholder="Conferma Password"
          aria-label="Conferma la nuova password"
          class="filter-input"
          @input="validatePasswordMatch" />
        <!-- Visual feedback mismatch password -->
        <p
          v-if="passwordForm.confirm && !isPasswordMatching"
          class="text-xs text-red-500 mt-1"
          role="alert">
          Le password non corrispondono.
        </p>
      </div>

      <!-- Pulsante salva nuova password -->
      <button
        @click="handleFinalReset"
        :disabled="!isPasswordValid || isProcessing"
        class="btn-modal-confirm w-full justify-center py-2">
        {{ isProcessing ? "Salvataggio..." : "Salva Nuova Password" }}
      </button>
    </div>

    <!-- Link registrazione (solo in modalità login) -->
    <p v-if="mode === 'login'" class="mt-6 text-center text-sm text-theme-main">
      Non hai un account?
      <router-link
        to="/signup"
        class="text-zomp hover:underline font-semibold transition duration-150">
        Registrati
      </router-link>
    </p>

    <!-- Modale feedback generico errori/successo -->
    <AppModal
      :is-open="modal.isOpen"
      :title="modal.title"
      @close="modal.isOpen = false">
      <p class="text-center font-bold uppercase py-4 text-theme-main">
        {{ modal.message }}
      </p>
      <button
        @click="modal.isOpen = false"
        class="btn-modal-confirm w-full justify-center py-2 uppercase">
        Chiudi
      </button>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/apiClient";
import { validateEmailFormat } from "@/utils/helpers";
import AppModal from "@/components/AppModal.vue";

const router = useRouter();
const authStore = useAuthStore();

// Stato principale della pagina: login | forgot | reset
const mode = ref("login");
const isProcessing = ref(false);
const loginError = ref(false);

// Modale per messaggi di feedback generico
const modal = reactive({
  isOpen: false,
  title: "",
  message: "",
});

// Helper per mostrare modale con messaggio
const showMessage = (title, message) => {
  modal.title = title;
  modal.message = message;
  modal.isOpen = true;
};

// Dati form login e recupero password
const form = ref({ email: "", password: "" });
const otpSent = ref(false);
const otpDigits = ref(["", "", "", "", "", ""]);
const mockOtp = ref(null);
const validatedOtp = ref("");
const showPassword = ref(false);

// Dati e validazioni reset password
const passwordForm = reactive({ new: "", confirm: "" });
const passRequirements = reactive({
  minLength: false,
  hasUpper: false,
  hasNumber: false,
  hasSpecial: false,
});

// Validazione email con helper
const isEmailValid = computed(() => validateEmailFormat(form.value.email));

// Validazione OTP completo (6 cifre)
const isOtpComplete = computed(() =>
  otpDigits.value.every((d) => d.length === 1)
);

// Validazione password nuova e conferma coincidono
const isPasswordMatching = computed(
  () => passwordForm.new === passwordForm.confirm
);

// Valida password in tempo reale contro tutti i requisiti
const validatePassword = () => {
  const p = passwordForm.new;
  passRequirements.minLength = p.length >= 8;
  passRequirements.hasUpper = /[A-Z]/.test(p);
  passRequirements.hasNumber = /\d/.test(p);
  passRequirements.hasSpecial = /[@$!%*?&]/.test(p);
};

// Helper per validare match password al cambio conferma
const validatePasswordMatch = () => {
  // Trigger reactivity su isPasswordMatching
};

// Tutti i requisiti password soddisfatti
const allRequirementsMet = computed(() =>
  Object.values(passRequirements).every((v) => v)
);

// Password valida: requisiti ok + match + non vuota
const isPasswordValid = computed(
  () =>
    allRequirementsMet.value &&
    isPasswordMatching.value &&
    passwordForm.new !== ""
);

// Gestisce submit form login con catch credenziali errate
const handleSubmit = async () => {
  loginError.value = false;
  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password,
    });
    router.push("/");
  } catch (error) {
    if (
      error.status === 401 ||
      (error.message && error.message.includes("INVALID_CREDENTIALS"))
    ) {
      loginError.value = true;
    } else {
      showMessage(
        "Errore Tecnico",
        error.message || "Errore durante il login."
      );
    }
  }
};

// Invia OTP all'email (controlli e rate-limit in BE)
const sendOtp = async () => {
  isProcessing.value = true;
  try {
    const res = await apiClient.post("/auth/password-reset-init", {
      email: form.value.email,
    });
    if (res.mockOtp) mockOtp.value = res.mockOtp;
    otpSent.value = true;
  } catch (e) {
    showMessage("Errore", "Errore nell'invio del codice. Verifica l'email.");
  } finally {
    isProcessing.value = false;
  }
};

// Verifica OTP inserito (controlli e tentativi in BE)
const verifyOtp = async () => {
  isProcessing.value = true;
  const otpCode = otpDigits.value.join("");
  try {
    await apiClient.post("/auth/password-reset-verify", {
      email: form.value.email,
      otp: otpCode,
    });
    validatedOtp.value = otpCode;
    mode.value = "reset";
  } catch (e) {
    showMessage("Errore", "Codice errato o scaduto.");
  } finally {
    isProcessing.value = false;
  }
};

// Salva nuova password e auto-login con credenziali aggiornate
const handleFinalReset = async () => {
  isProcessing.value = true;
  try {
    await apiClient.put(`/auth/password-reset-complete`, {
      email: form.value.email,
      otp: validatedOtp.value,
      new: passwordForm.new,
      fromOtp: true,
    });

    await authStore.login({
      email: form.value.email,
      password: passwordForm.new,
    });

    router.push("/");
  } catch (e) {
    showMessage(
      "Errore Reset",
      e.message || "Errore durante il salvataggio della password."
    );
  } finally {
    isProcessing.value = false;
  }
};

// Gestisce input singolo digit OTP e auto-focus al prossimo campo
const handleOtpInput = async (index) => {
  otpDigits.value[index] = otpDigits.value[index].slice(0, 1);
  if (otpDigits.value[index] && index < otpDigits.value.length - 1) {
    await nextTick();
    document.getElementById(`otp-input-${index + 1}`)?.focus();
  }
};

// Gestisce backspace negli input OTP con navigazione al campo precedente
const handleBackspace = (index, event) => {
  if (!otpDigits.value[index] && index > 0) {
    event.preventDefault();
    const prev = document.getElementById(`otp-input-${index - 1}`);
    if (prev) {
      prev.focus();
      prev.select();
    }
  }
};
</script>

<style scoped>
/* Stile input singolo digit OTP con focus ring */
.otp-input {
  width: 45px;
  height: 45px;
  text-align: center;
  font-size: 1.25rem;
  font-weight: bold;
  border: 2px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-main);
  border-radius: 8px;
  outline: none;
  transition: all 0.15s;
}

.otp-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px var(--accent-color);
}
</style>
