<template>
  <div
    class="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-2xl border-2 border-thistle space-y-6 relative">
    <button
      @click="handleBack"
      class="absolute top-4 left-4 text-paynes-gray hover:text-zomp transition-colors flex items-center gap-2 font-bold text-xs">
      <i class="fa-solid fa-arrow-left"></i> torna indietro
    </button>

    <div v-if="isFirstLibrary" class="space-y-4 text-center pt-4">
      <h1 class="text-3xl font-display text-paynes-gray">
        Crea la tua prima libreria
      </h1>
      <p class="text-paynes-gray">
        una libreria in bibliomap rappresenta una collezione fisica di libri in
        un luogo specifico.
      </p>
    </div>
    <div v-else class="text-center pt-4">
      <h1 class="text-3xl font-display text-paynes-gray">
        Aggiungi una Nuova Libreria
      </h1>
    </div>

    <hr class="border-thistle" />

    <div class="space-y-4">
      <div>
        <label
          for="libraryName"
          class="block text-sm font-medium text-paynes-gray"
          >nome libreria *</label
        >
        <input
          v-model="form.name"
          id="libraryName"
          type="text"
          required
          placeholder="es. scaffale in salotto"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium text-paynes-gray"
          >posizione</label
        >
        <p class="text-xs text-paynes-gray/70 mb-2">
          dove si trovano fisicamente questi libri?
        </p>
        <div class="grid grid-cols-2 gap-4">
          <button
            @click="form.location = 'user_default'"
            :class="
              form.location === 'user_default'
                ? 'bg-zomp text-white'
                : 'bg-tea-rose-red/20'
            "
            :disabled="userHasSkippedLocation"
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle disabled:opacity-50 disabled:cursor-not-allowed">
            usa la mia posizione
          </button>
          <button
            @click="form.location = 'new_location'"
            :class="
              form.location === 'new_location'
                ? 'bg-zomp text-white'
                : 'bg-tea-rose-red/20'
            "
            class="p-4 rounded-xl shadow-md transition duration-150 font-semibold border-2 border-thistle">
            nuova posizione
          </button>
        </div>

        <div
          v-if="form.location === 'new_location'"
          class="mt-4 space-y-4 p-4 border rounded-xl border-thistle bg-[var(--bg-secondary)] animate-fade-in">
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="libLocMode = 'geo'"
              :class="libLocMode === 'geo' ? 'bg-zomp text-white' : 'bg-white'"
              class="p-2 border rounded-lg text-xs font-bold transition">
              browser
            </button>
            <button
              @click="libLocMode = 'map'"
              :class="libLocMode === 'map' ? 'bg-zomp text-white' : 'bg-white'"
              class="p-2 border rounded-lg text-xs font-bold transition">
              mappa
            </button>
            <button
              @click="libLocMode = 'address'"
              :class="
                libLocMode === 'address' ? 'bg-zomp text-white' : 'bg-white'
              "
              class="p-2 border rounded-lg text-xs font-bold transition">
              indirizzo
            </button>
          </div>

          <div v-if="libLocMode === 'address'" class="space-y-2">
            <input
              v-model="form.streetName"
              type="text"
              placeholder="nome della via"
              class="w-full px-3 py-1 text-sm border rounded-lg outline-none" />
            <div class="flex gap-2">
              <input
                v-model="form.zipCode"
                type="text"
                placeholder="cap"
                class="w-1/2 px-3 py-1 text-sm border rounded-lg outline-none" />
              <input
                value="Roma"
                disabled
                class="w-1/2 px-3 py-1 text-sm border rounded-lg bg-gray-50 opacity-60" />
            </div>
          </div>

          <div v-else-if="libLocMode === 'map'" class="space-y-2">
            <div
              id="map-lib-container"
              class="h-48 w-full rounded-lg border border-thistle">
              <div id="map-lib" class="h-full w-full rounded-lg"></div>
            </div>
          </div>

          <div v-else-if="libLocMode === 'geo'" class="text-center space-y-2">
            <button
              @click="getLibGeolocation"
              :disabled="isLoadingLoc"
              class="text-xs bg-paynes-gray text-white px-4 py-2 rounded-lg">
              <i
                v-if="isLoadingLoc"
                class="fa-solid fa-spinner fa-spin mr-2"></i>
              {{ isLoadingLoc ? "ricerca..." : "ottieni posizione" }}
            </button>
            <p
              v-if="form.latitude"
              class="text-[10px] text-zomp font-bold animate-fade-in">
              posizione ottenuta: {{ form.latitude.toFixed(4) }},
              {{ form.longitude.toFixed(4) }}
            </p>
          </div>

          <p
            v-if="form.latitude"
            class="text-center text-[10px] text-zomp font-bold">
            posizione libreria impostata!
          </p>
        </div>

        <p
          v-if="userHasSkippedLocation && form.location === 'user_default'"
          class="text-xs text-red-700 font-semibold mt-2 text-center">
          devi specificare una nuova posizione per la libreria.
        </p>
      </div>

      <div>
        <label
          for="visibility"
          class="block text-sm font-medium mb-1 text-paynes-gray"
          >visibilità libreria</label
        >
        <select
          v-model="form.visibility"
          id="visibility"
          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-zomp focus:border-zomp outline-none">
          <option value="all">tutti</option>
          <option value="logged_in">solo gli utenti loggati</option>
          <option value="private">nessuno (solo io)</option>
        </select>
      </div>
    </div>

    <p
      v-if="errorMessage"
      class="text-sm text-red-700 font-medium mt-2 text-center">
      {{ errorMessage }}
    </p>

    <div class="flex justify-between space-x-4 pt-4">
      <button
        v-if="isFirstLibrary"
        @click="skip"
        class="w-1/2 bg-thistle text-paynes-gray py-3 rounded-lg hover:bg-ash-gray transition duration-150 font-bold text-lg">
        salta
      </button>
      <button
        @click="createLibrary"
        :disabled="!isFormValid"
        :class="isFirstLibrary ? 'w-1/2' : 'w-full'"
        class="bg-zomp text-white py-3 rounded-lg hover:bg-paynes-gray transition duration-150 disabled:opacity-50 font-bold text-lg">
        {{ isFirstLibrary ? "crea e aggiungi libri" : "crea libreria" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/stores/authStore";
import maplibregl from "maplibre-gl";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isFirstLibrary = computed(() => route.query.from === "setup");
const userHasSkippedLocation = computed(
  () => route.query.locationSkipped === "true"
);
const returnTo = computed(() => route.query.returnTo || "/");

const libLocMode = ref("geo");
const isLoadingLoc = ref(false);
const form = ref({
  name: "",
  location: "user_default",
  visibility: "all",
  latitude: null,
  longitude: null,
  streetName: "",
  zipCode: "",
});

const errorMessage = ref(null);
const map = ref(null);
const marker = ref(null);

const isFormValid = computed(() => {
  const nameSet = form.value.name.trim() !== "";
  if (form.value.location === "new_location") {
    return (
      nameSet &&
      (form.value.latitude !== null ||
        (form.value.streetName !== "" && form.value.zipCode !== ""))
    );
  }
  return nameSet && !userHasSkippedLocation.value;
});

const handleBack = () => {
  router.push(returnTo.value);
};

const initLibMap = async () => {
  await nextTick();
  const container = document.getElementById("map-lib");
  if (!container) return;

  if (map.value) {
    // resize per contenitore precedentemente nascosto
    setTimeout(() => {
      map.value.resize();
    }, 100);
    return;
  }

  const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
  map.value = new maplibregl.Map({
    container: "map-lib",
    style: `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerKey}`,
    center: [12.4963, 41.9029],
    zoom: 12,
  });

  marker.value = new maplibregl.Marker({ color: "#629677" })
    .setLngLat([12.4963, 41.9029])
    .addTo(map.value);

  map.value.on("click", (e) => {
    form.value.latitude = e.lngLat.lat;
    form.value.longitude = e.lngLat.lng;
    marker.value.setLngLat([e.lngLat.lng, e.lngLat.lat]);
  });
};

// watcher per inizializzazione mappa
watch(
  [libLocMode, () => form.value.location],
  async ([newMode, newLoc]) => {
    if (newMode === "map" && newLoc === "new_location") {
      await initLibMap();
    }
  },
  { immediate: true }
);

const getLibGeolocation = () => {
  isLoadingLoc.value = true;
  navigator.geolocation.getCurrentPosition(
    (p) => {
      form.value.latitude = p.coords.latitude;
      form.value.longitude = p.coords.longitude;
      isLoadingLoc.value = false;
    },
    () => {
      isLoadingLoc.value = false;
    }
  );
};

const createLibrary = async () => {
  errorMessage.value = null;
  if (
    form.value.location === "new_location" &&
    libLocMode.value === "address" &&
    !form.value.latitude
  ) {
    const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;
    const addr = `Via ${form.value.streetName}, ${form.value.zipCode} Roma`;
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          addr
        )}.json?key=${mapTilerKey}`
      );
      const data = await res.json();
      if (data.features?.length) {
        form.value.latitude = data.features[0].geometry.coordinates[1];
        form.value.longitude = data.features[0].geometry.coordinates[0];
      }
    } catch (e) {
      console.error(e);
    }
  }

  const payload = {
    name: form.value.name,
    locationType: form.value.location,
    visibility: form.value.visibility,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
  };

  try {
    const response = await apiClient.post("/libraries", payload);
    // propagazione ritorno alla pagina successiva
    router.push({
      path: "/add-book",
      query: {
        libraryId: response.libraryId,
        returnTo: returnTo.value,
        isSetup: isFirstLibrary.value ? "true" : "false",
      },
    });
  } catch (error) {
    errorMessage.value =
      error.body?.message || "errore durante la creazione della libreria";
  }
};

onMounted(async () => {
  if (isFirstLibrary.value) {
    form.value.name = "la mia prima libreria";
    const initialVisibility = route.query.visibility;
    if (["all", "logged_in", "private"].includes(initialVisibility))
      form.value.visibility = initialVisibility;
    if (userHasSkippedLocation.value) form.value.location = "new_location";
  }
});

const skip = () => {
  router.push("/");
};
</script>

<style scoped>
.font-display {
  font-family: "Mochiy Pop P One", cursive;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
