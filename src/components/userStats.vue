<template>
  <div
    class="rounded-2xl shadow-md border border-[var(--thistle)] overflow-hidden bg-theme-primary transition-all duration-300">
    <div
      @click="toggleOpen"
      class="p-6 cursor-pointer hover:bg-[var(--bg-secondary)] transition flex justify-between items-center group">
      <div class="flex-grow grid grid-cols-3 gap-4 text-center mr-4">
        <div v-for="stat in simpleCards" :key="stat.label">
          <div class="text-2xl font-display" :class="stat.color">
            {{ stat.value }}
          </div>
          <div
            class="text-[10px] opacity-70 font-bold tracking-wider uppercase leading-tight">
            {{ stat.label }}
          </div>
        </div>
      </div>
      <i
        class="fa-solid fa-chevron-down transition-transform duration-300 text-zomp"
        :class="isOpen ? 'rotate-180' : ''"></i>
    </div>

    <div v-if="isOpen" class="px-6 pb-8 border-t border-thistle pt-8 space-y-8">
      <div v-if="isLoadingFull" class="text-center py-10">
        <i class="fa-solid fa-circle-notch fa-spin text-zomp text-2xl"></i>
      </div>

      <template v-else-if="fullData">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div
            v-for="s in detailStats"
            :key="s.label"
            class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-thistle text-center">
            <p
              class="text-[9px] font-black opacity-40 tracking-widest mb-1 uppercase">
              {{ s.label }}
            </p>
            <p class="font-bold text-lg text-zomp truncate px-2">
              {{ s.value }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div
            class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              andamento scambi (mensile)
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasTrend"></canvas>
            </div>
          </div>

          <div
            class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              i tuoi tag
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasTags"></canvas>
            </div>
          </div>

          <div
            class="md:col-span-2 bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              i tuoi titoli più richiesti
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasPareto"></canvas>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  nextTick,
  onUnmounted,
  watch,
} from "vue";
import { apiClient } from "@/services/apiClient";
import Chart from "chart.js/auto";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps(["userId"]);
const isOpen = ref(false);
const isLoadingFull = ref(false);
const counters = reactive({
  myBooksCount: 0,
  totalLoansIn: 0,
  totalLoansOut: 0,
});
const fullData = ref(null);

// Riferimenti Canvas
const canvasTrend = ref(null);
const canvasTags = ref(null);
const canvasPareto = ref(null);
let chartInstances = [];

const simpleCards = computed(() => [
  {
    label: "i tuoi libri",
    value: counters.myBooksCount,
    color: "text-theme-main",
  },
  {
    label: "richiesti",
    value: counters.totalLoansIn,
    color: "text-[var(--zomp)]",
  },
  {
    label: "prestati",
    value: counters.totalLoansOut,
    color: "text-[var(--paynes-gray)]",
  },
]);

const detailStats = computed(() => [
  {
    label: "compagno di letture",
    value: fullData.value?.topPartner || "nessuno",
  },
  { label: "tag più usato", value: fullData.value?.topTag || "nessuno" },
  {
    label: "viaggio più lungo",
    value: `${fullData.value?.maxDistance || 0} km`,
  },
]);

async function fetchCounters() {
  if (!props.userId) return;
  try {
    const res = await apiClient.get(`/stats/user/${props.userId}/counters`);
    counters.myBooksCount = res.myBooksCount || 0;
    counters.totalLoansIn = res.totalLoansIn || 0;
    counters.totalLoansOut = res.totalLoansOut || 0;
  } catch (e) {
    console.error("Errore counters utente:", e);
  }
}

async function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value && !fullData.value) {
    isLoadingFull.value = true;
    try {
      const res = await apiClient.get(`/stats/user/${props.userId}/full`);
      fullData.value = res;
      await nextTick();
      setTimeout(renderCharts, 100); // Leggero delay per stabilità rendering
    } finally {
      isLoadingFull.value = false;
    }
  }
}

function renderCharts() {
  chartInstances.forEach((c) => c.destroy());
  chartInstances = [];

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  // 1. TREND (Line) - Invertito per ordine cronologico
  if (canvasTrend.value) {
    const labels = [...fullData.value.loansTrend.labels];
    const data = [...fullData.value.loansTrend.data];

    chartInstances.push(
      new Chart(canvasTrend.value, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              data,
              borderColor: "#629677",
              backgroundColor: "rgba(98, 150, 119, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          ...commonOptions,
          scales: {
            y: { ticks: { stepSize: 1, precision: 0 }, beginAtZero: true },
          },
        },
      })
    );
  }

  // 2. TAGS (Doughnut) - Sostituisce il settimanale
  if (canvasTags.value) {
    chartInstances.push(
      new Chart(canvasTags.value, {
        type: "doughnut",
        data: {
          labels: fullData.value.weeklyRequests.labels, // Inviati dal BE come 'tags' chartData
          datasets: [
            {
              data: fullData.value.weeklyRequests.data,
              backgroundColor: [
                "#629677",
                "#495D63",
                "#D19C97",
                "#98B6B1",
                "#E2D1C3",
              ],
              borderWidth: 0,
              cutout: "70%",
            },
          ],
        },
        options: {
          ...commonOptions,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: { boxWidth: 10, font: { size: 10 } },
            },
          },
        },
      })
    );
  }

  // 3. PARETO (Bar)
  if (canvasPareto.value) {
    const labelsRaw = fullData.value.paretoBooks.labels;

    const displayLabels = labelsRaw.map((label) => {
      const parts = label.split(":");
      const title = parts[1] || parts[0];
      return title.length > 15 ? title.substring(0, 15) + "..." : title;
    });

    chartInstances.push(
      new Chart(canvasPareto.value, {
        type: "bar",
        data: {
          labels: displayLabels,
          datasets: [
            {
              data: fullData.value.paretoBooks.data,
              backgroundColor: "#629677",
              borderRadius: 4,
            },
          ],
        },
        options: {
          ...commonOptions,
          // Cambia il cursore quando passi sopra una barra o un'etichetta
          onHover: (event, chartElement) => {
            event.native.target.style.cursor = chartElement[0]
              ? "pointer"
              : "default";
          },
          scales: {
            ...commonOptions.scales,
            x: {
              ticks: {
                color: "#629677", // Colore che richiama i link del tema (Zomp)
                font: {
                  weight: "bold",
                  size: 11,
                },
                // Funzione per gestire il click specifico sulle etichette (labels)
                // Nota: Chart.js nativamente gestisce meglio il click sull'area,
                // ma con onClick generale copriamo tutto.
              },
            },
          },
          onClick: (evt, elements) => {
            // 1. Click sulle barre
            if (elements.length > 0) {
              const index = elements[0].index;
              const copyId = labelsRaw[index].split(":")[0];
              router.push(`/books/${copyId}`);
            }
            // 2. Controllo click sulle etichette dell'asse X
            else {
              const chart = chartInstances.find(
                (c) => c.canvas === canvasPareto.value
              );
              const helpers = Chart.helpers;
              const canvasPosition = helpers.getRelativePosition(evt, chart);

              // Verifichiamo se il click è avvenuto nell'area delle scale X
              if (canvasPosition.y > chart.chartArea.bottom) {
                const index = chart.scales.x.getValueForPixel(canvasPosition.x);
                if (index >= 0 && labelsRaw[index]) {
                  const copyId = labelsRaw[index].split(":")[0];
                  router.push(`/books/${copyId}`);
                }
              }
            }
          },
        },
      })
    );
  }
}
onMounted(fetchCounters);
watch(() => props.userId, fetchCounters);
onUnmounted(() => chartInstances.forEach((c) => c.destroy()));
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
canvas {
  width: 100% !important;
}
</style>
