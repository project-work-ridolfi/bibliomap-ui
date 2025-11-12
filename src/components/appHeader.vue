<template>
  <header
    class="bg-theme-primary sticky top-0 z-40 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between h-auto">
        <div class="flex items-center space-x-3">
          <button
            @click="emit('toggle-sidebar')"
            class="header-icon"
            aria-label="Apri menu laterale"
            title="Menu">
            <VueFeather type="menu" size="24"></VueFeather>
          </button>
        </div>

        <router-link to="/" class="header-center-title">
          <h1 class="header-title-main">BIBLIOMAP</h1>
          <p class="header-subtitle-main">Trova libri vicini a te!</p>
        </router-link>

        <div class="flex items-center space-x-3">
          <button
            @click="toggleTheme"
            class="header-icon"
            :aria-label="
              isDarkTheme ? 'Passa a Modalità Giorno' : 'Passa a Modalità Notte'
            "
            title="Cambia Tema">
            <VueFeather
              :type="isDarkTheme ? 'sun' : 'moon'"
              size="24"></VueFeather>
          </button>

          <router-link
            v-if="!authStore.isAuthenticated"
            to="/profile"
            class="header-icon"
            aria-label="Vai al profilo utente"
            title="Profilo">
            <VueFeather type="user" size="24"></VueFeather>
          </router-link>

          <router-link
            v-else
            to="/login"
            class="hidden lg:block text-sm font-medium text-theme-link hover:text-theme-link py-2 px-3 rounded-lg border-2 border-ash-gray transition duration-150"
            aria-label="Accedi o Registrati"
            title="Accedi">
            Accedi
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useAuthStore } from "@/stores/authStore"

const authStore = useAuthStore()
const emit = defineEmits(["toggle-sidebar"])
const isDarkTheme = ref(false)

const applyTheme = (isDark) => {
  isDarkTheme.value = isDark
  document.documentElement.classList.toggle("dark", isDark)
  localStorage.setItem("theme", isDark ? "dark" : "light")
};

const toggleTheme = () => {
  applyTheme(!isDarkTheme.value)
};

onMounted(() => {
  const savedTheme = localStorage.getItem("theme")
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    applyTheme(true)
  } else {
    applyTheme(false)
  }
})
</script>

<style scoped>
/* Icona standard: usata per Hamburger e Toggle Tema */
.header-icon {
  border: 2px solid var(--ash-gray);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;

  /* Colore Icona TEMA CHIARO: Paynes Gray */
  color: var(--paynes-gray);

  background-color: var(--bg-primary, white);
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Quando html ha la classe 'dark', cambia il colore delle icone a Rosa */
html.dark .header-icon {
  color: var(--tea-rose-red);
}

/* Contenitore centrale del Titolo/Sottotitolo */
.header-center-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  line-height: 1;
  position: static;
  transform: none;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
  padding: 0 10px;
}

/* Titolo Principale (BIBLIOMAP) TODO */
.header-title-main {
  font-family: "Mochiy Pop P One", cursive;
  font-size: min(3.5em, 5vw);
  color: var(--paynes-gray);
  margin: 0;
  line-height: 1;
  transition: color 0.3s ease;
}

/* Sottotitolo */
.header-subtitle-main {
  font-family: var(--font-body, "Quicksand", sans-serif);
  font-size: min(0.9em, 3vw);
  color: var(--paynes-gray);
  margin: 0;
  margin-top: 5px;
  transition: color 0.3s ease;
}

/* Icona Libro Aperto */
.header-icon-secondary {
  /* Stile simile a header-icon ma senza l'interazione del pulsante */
  background-color: var(--bg-primary, white);
  border: 2px solid var(--ash-gray);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--zomp); /* Colore primario */
  font-size: 1.2em;
}
/* Tema Notte: l'icona secondaria diventa rosa */
html.dark .header-icon-secondary {
  color: var(--tea-rose-red);
  background-color: var(--bg-primary);
}

/* Responsività per evitare sovrapposizioni su schermi piccoli */
@media (max-width: 768px) {
  .header-center-title {
    position: static;
    transform: none;
    text-align: center;
    flex-basis: 100px;
  }

  .header-title-main {
    font-size: min(2em, 8vw);
  }
}
@media (max-width: 500px) {
  .header-center-title {
    flex-basis: auto;
  }
  .header-title-main {
    font-size: min(1.8em, 7vw);
  }
}

.header-icon i,
.book-avatar i {
  font-family: "Font Awesome 6 Free";
  font-weight: 900; /* Per le icone solid */
  font-style: normal; /* Assicurati che non sia in corsivo */
  line-height: 1; /* Allinea bene l'icona nel cerchio */
  display: inline-block;
}
</style>
