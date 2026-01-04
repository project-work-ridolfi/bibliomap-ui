<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black/50 z-40 transition-opacity"
      aria-hidden="true"></div>
  </Transition>

  <Transition name="slide">
    <aside
      v-if="isOpen"
      class="fixed top-0 left-0 h-full w-72 bg-theme-primary shadow-2xl z-50 overflow-y-auto border-r border-thistle transition-colors duration-300"
      role="navigation">
      <div
        class="flex items-center justify-between p-6 border-b border-thistle">
        <h2 class="sidebar-title">MENU</h2>
        <button
          @click="emit('close')"
          class="sidebar-close-btn"
          aria-label="chiudi menu">
          <VueFeather type="x" size="20"></VueFeather>
        </button>
      </div>

      <nav class="p-4 flex flex-col gap-2">
        <div v-for="item in menuItems" :key="item.label">
          <router-link
            v-if="!item.children"
            :to="item.path"
            @click="emit('close')"
            class="nav-link"
            active-class="nav-link-active">
            <VueFeather
              :type="item.icon"
              size="20"
              class="nav-icon"></VueFeather>
            <span class="font-medium">{{ item.label }}</span>
          </router-link>

          <div v-else class="flex flex-col">
            <button
              @click="isLibrariesExpanded = !isLibrariesExpanded"
              class="nav-link w-full justify-between"
              :class="{ 'opacity-100': isLibrariesExpanded }">
              <div class="flex items-center gap-4">
                <VueFeather
                  :type="item.icon"
                  size="20"
                  class="nav-icon"></VueFeather>
                <span class="font-medium">{{ item.label }}</span>
              </div>
              <VueFeather
                type="chevron-down"
                size="16"
                class="transition-transform duration-300"
                :class="{ 'rotate-180': isLibrariesExpanded }">
              </VueFeather>
            </button>

            <div
              v-if="isLibrariesExpanded"
              class="flex flex-col pl-10 gap-1 mt-1 animate-fade-in">
              <router-link
                v-for="lib in userLibraries"
                :key="lib.id"
                :to="`/libraries/${lib.id}`"
                @click="emit('close')"
                class="sub-nav-link">
                {{ lib.name }}
              </router-link>
              <router-link
                to="/libraries"
                @click="emit('close')"
                class="sub-nav-link italic opacity-70">
                <i class="fa-solid fa-gear"></i>
                <span class="ml-2"><strong>Gestisci tutte</strong></span>
              </router-link>
            </div>
          </div>
        </div>
      </nav>

      <div
        v-if="authStore.isAuthenticated"
        class="absolute bottom-0 left-0 right-0 p-6 border-t border-thistle bg-theme-primary">
        <button @click="handleLogout" class="logout-btn">
          <VueFeather type="log-out" size="20"></VueFeather>
          <span class="font-bold tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/services/apiClient";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const router = useRouter();
const authStore = useAuthStore();

const userLibraries = ref([]);
const isLibrariesExpanded = ref(false);

// recupera le librerie dell utente dal backend
async function fetchLibraries() {
  if (!authStore.isAuthenticated) return;
  try {
    const response = await apiClient.get("/users/me/libraries");
    userLibraries.value = response.libraries || [];
  } catch (error) {
    console.error("errore recupero librerie sidebar");
  }
}

// osserva l apertura della sidebar per aggiornare i dati
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      fetchLibraries();
    }
  }
);

// mappatura rotte per menu
const menuItems = computed(() => {
  const items = [{ path: "/", label: "Trova libri", icon: "map" }];

  if (authStore.isAuthenticated) {
    items.push(
      { path: "/dashboard", label: "Dashboard", icon: "grid" },
      { path: "/stats", label: "Statistiche", icon: "bar-chart-2" },
      { label: "Librerie", icon: "book-open", children: true },
      { path: "/add-book", label: "Aggiungi libro", icon: "plus-circle" },
      { path: "/profile/" + authStore.userId, label: "Profilo", icon: "user" }
    );
  } else {
    items.push(
      { path: "/stats", label: "Statistiche", icon: "bar-chart-2" },
      { path: "/signup", label: "Registrati", icon: "user-plus" },
      { path: "/login", label: "Accedi", icon: "log-in" }
    );
  }
  return items;
});

// gestione logout
async function handleLogout() {
  await authStore.logout();
  emit("close");
  router.push("/");
}
</script>

<style scoped>
.sidebar-title {
  font-family: "Shadows Into Light Two", bold;
  font-size: 1.25rem;
  letter-spacing: 0.05em;
  color: var(--paynes-gray);
}

.sidebar-close-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ash-gray);
  color: var(--paynes-gray);
  background: transparent;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  border-radius: 0.75rem;
  color: var(--paynes-gray);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-icon {
  color: var(--zomp);
}

/* link per i sotto-elementi della tendina */
.sub-nav-link {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  color: var(--paynes-gray);
  opacity: 0.9;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.sub-nav-link:hover {
  background-color: rgba(152, 182, 177, 0.1);
  color: var(--zomp);
}

.nav-link:hover {
  background-color: rgba(152, 182, 177, 0.2);
}

.nav-link-active {
  background-color: var(--zomp) !important;
  color: white !important;
}

.nav-link-active .nav-icon {
  color: white !important;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  border: 2px solid #ef4444;
  color: #ef4444;
  background: transparent;
}

.logout-btn:hover {
  background-color: #ef4444;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
