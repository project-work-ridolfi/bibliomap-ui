<template>
  <div
    class="relative w-full h-full min-h-[200px] bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-thistle shadow-inner">
    <div
      v-if="!lat || !lng"
      class="absolute inset-0 flex flex-col items-center justify-center text-paynes-gray/50 p-4 text-center">
      <i class="fa-solid fa-map-location-dot text-3xl mb-2"></i>
      <p class="text-xs font-bold tracking-widest">
        posizione non impostata
      </p>
    </div>
    <div ref="mapContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, shallowRef } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const props = defineProps({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  zoom: { type: Number, default: 14 },
  markerColor: { type: String, default: "#629677" },
});

const mapContainer = ref(null);
const map = shallowRef(null);
const marker = shallowRef(null);

const initMap = () => {
  if (!props.lat || !props.lng || !mapContainer.value) return;

  // evita inizializzazioni doppie
  if (map.value) {
    map.value.setCenter([props.lng, props.lat]);
    if (marker.value) marker.value.setLngLat([props.lng, props.lat]);
    return;
  }

  const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: `https://api.maptiler.com/maps/019a4997-dd19-75e4-bf35-d09baea3fb61/style.json?key=${mapTilerKey}`,
    center: [props.lng, props.lat],
    zoom: props.zoom,
    attributionControl: false,
    scrollZoom: false, // disabilitato per non disturbare lo scroll della pagina
  });

  marker.value = new maplibregl.Marker({ color: props.markerColor })
    .setLngLat([props.lng, props.lat])
    .addTo(map.value);
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map.value) map.value.remove();
});

// reagisce a cambi dinamici dei dati (es. caricamento asincrono nel parent)
watch(
  () => [props.lat, props.lng],
  () => {
    initMap();
  }
);
</script>
