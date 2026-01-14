<template>
  <!-- Card container principale -->
  <div
    class="rounded-2xl shadow-md border border-[var(--thistle)] overflow-hidden bg-theme-primary transition-all duration-300">
    <!-- Header cliccabile per aprire/chiudere i dettagli -->
    <div
      @click="toggleOpen"
      class="p-6 cursor-pointer hover:bg-[var(--bg-secondary)] transition flex justify-between items-center group"
      aria-label="Apri/Chiudi dettagli statistiche">
      <div class="flex-grow grid grid-cols-3 gap-4 text-center mr-4">
        <!-- Card statistiche sintetiche -->
        <div v-for="stat in simpleCards" :key="stat.label">
          <div class="text-2xl font-display text-theme-main">
            {{ stat.value }}
          </div>
          <div
            class="text-[10px] opacity-70 font-bold tracking-wider leading-tight">
            {{ stat.label }}
          </div>
        </div>
      </div>
      <!-- Icona freccia che ruota quando aperto -->
      <i
        class="fa-solid fa-chevron-down transition-transform duration-300 text-zomp"
        :class="isOpen ? 'rotate-180' : ''"
        aria-label="Indicatore apertura dettagli"></i>
    </div>

    <!-- Contenuto dettagliato visibile solo se isOpen -->
    <div v-if="isOpen" class="px-6 pb-8 border-t border-thistle pt-8 space-y-8">
      <!-- Loader durante il caricamento -->
      <div
        v-if="isLoading"
        class="text-center py-10"
        aria-label="Caricamento in corso">
        <i class="fa-solid fa-circle-notch fa-spin text-zomp text-2xl"></i>
      </div>

      <!-- Dati completi se presenti -->
      <template v-else-if="fullData">
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <!-- Statistiche dettagliate -->
          <div
            v-for="s in detailStats"
            :key="s.label"
            class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-thistle text-center">
            <p class="text-[9px] font-black opacity-40 tracking-widest mb-1">
              {{ s.label }}
            </p>
            <p
              v-if="s.link"
              @click="router.push(s.link)"
              class="font-bold text-lg text-zomp truncate px-2 cursor-pointer hover:underline"
              :aria-label="`Vai al profilo di ${s.value}`">
              {{ s.value }}
            </p>
            <p v-else class="font-bold text-lg text-zomp truncate px-2">
              {{ s.value }}
            </p>
          </div>
        </div>

        <!-- Grafici trend e richieste settimanali -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div
            class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm"
            aria-label="Grafico scambi conclusi ultimi 6 mesi">
            <p
              class="text-[10px] font-black opacity-50 mb-6 tracking-widest text-center">
              scambi conclusi (ultimi 6 mesi)
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasTrend"></canvas>
            </div>
          </div>
          <div
            class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm"
            aria-label="Grafico richieste community per settimana">
            <p
              class="text-[10px] font-black opacity-50 mb-6 tracking-widest text-center">
              richieste community per settimana
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasWeekly"></canvas>
            </div>
          </div>

          <!-- Libri più visti -->
          <div
            v-if="filteredMostViewedBooks.length > 0"
            class="bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm"
            aria-label="I libri più visti">
            <p
              class="text-[10px] font-black opacity-50 mb-6 text-center tracking-widest">
              i libri più visti
            </p>
            <div class="space-y-3">
              <div
                v-for="(item, index) in filteredMostViewedBooks.slice(0, 3)"
                :key="index"
                @click="router.push(`/books/${item.id}`)"
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp transition cursor-pointer group"
                :aria-label="`Libro ${item.name}, viste ${item.views}`">
                <span
                  class="font-bold text-sm text-theme-main group-hover:text-zomp truncate flex-1 mr-4">
                  {{ index + 1 }}. {{ item.name }}
                </span>
                <span class="text-[10px] font-black opacity-60 shrink-0">
                  <i class="fa-solid fa-eye mr-1"></i> {{ item.views }}
                </span>
              </div>
            </div>
          </div>

          <!-- Librerie più visitate -->
          <div
            v-if="filteredLibraries.length > 0"
            class="bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm text-theme-main"
            aria-label="Le librerie più visitate">
            <p
              class="text-[10px] font-black opacity-50 mb-6 text-center tracking-widest">
              le librerie più visitate
            </p>
            <div class="space-y-3">
              <div
                v-for="(item, index) in filteredLibraries.slice(0, 3)"
                :key="index"
                @click="router.push(`/libraries/${item.id}`)"
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp transition cursor-pointer group"
                :aria-label="`Libreria ${item.name}, visite ${item.views}`">
                <span
                  class="font-bold text-sm group-hover:text-zomp truncate flex-1 mr-4"
                  >{{ item.name }}</span
                >
                <span class="text-[10px] font-black opacity-60"
                  >{{ item.views }} visite</span
                >
              </div>
            </div>
          </div>

          <!-- Top 5 titoli più prestati -->
          <div
            class="md:col-span-2 bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm"
            aria-label="Top 5 titoli più prestati">
            <p
              class="text-[10px] font-black opacity-50 mb-6 text-center tracking-widest">
              top 5 titoli più prestati
            </p>
            <div class="space-y-3">
              <div
                v-for="(label, index) in fullData.paretoBooks.labels.slice(
                  0,
                  5
                )"
                :key="index"
                @click="router.push(`/books/${parseKey(label).id}`)"
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp transition cursor-pointer group"
                :aria-label="`Libro ${parseKey(label).name}, scambi ${
                  fullData.paretoBooks.data[index]
                }`">
                <div class="flex items-center gap-4">
                  <span class="font-display text-zomp text-lg opacity-50"
                    >{{ index + 1 }}.</span
                  >
                  <span
                    class="font-bold text-theme-main group-hover:text-zomp transition-colors"
                    >{{ parseKey(label).name }}</span
                  >
                </div>
                <div
                  class="text-[11px] font-black bg-thistle/30 px-3 py-1 rounded-full opacity-70">
                  {{ fullData.paretoBooks.data[index] }} scambi
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, onUnmounted } from "vue";
import { apiClient } from "@/services/apiClient";
import Chart from "chart.js/auto";
import { useRouter } from "vue-router";

// Router per navigazione
const router = useRouter();

// Stato card aperta/chiusa
const isOpen = ref(false);

// Stato caricamento dati
const isLoading = ref(false);

// Contatori sintetici
const counters = reactive({ books: 0, copies: 0, loans: 0 });

// Dati completi
const fullData = ref(null);

// Riferimenti canvas per grafici
const canvasTrend = ref(null);
const canvasWeekly = ref(null);
let charts = [];

// Card sintetiche
const simpleCards = computed(() => [
  { label: "titoli unici", value: counters.books },
  { label: "copie totali", value: counters.copies },
  { label: "scambi conclusi", value: counters.loans },
]);

// Statistiche dettagliate
const detailStats = computed(() => {
  if (!fullData.value) return [];
  return [
  {
      label: "lettore più attivo",
      value: fullData.value.topRequester || "nessuno",
      link: fullData.value.topRequesterId
        ? `/profile/${fullData.value.topRequesterId}`
        : null,
    },
    {
      label: "chi condivide di più", 
      value: fullData.value.topLoaner || "nessuno",
      link: fullData.value.topLoanerId
        ? `/profile/${fullData.value.topLoanerId}`
        : null,
    },
    { label: "tag più diffuso", value: fullData.value.topTag || "nessuno" },
    { label: "viaggio record", value: `${fullData.value.maxDistance || 0} km` },
  ];
});

// Helper parsing chiavi "id_nome"
function parseKey(label) {
  if (!label) return { id: "", name: "" };
  const parts = label.split("_");
  const id = parts[0];
  const name = parts.slice(1).join("_") || id;
  return { id, name };
}

// Liste filtrate e ordinate
const filteredMostViewedBooks = computed(() => {
  if (!fullData.value?.mostViewedBooks?.labels) return [];
  return fullData.value.mostViewedBooks.labels
    .map((label, i) => ({
      ...parseKey(label),
      views: fullData.value.mostViewedBooks.data[i],
    }))
    .filter((item) => item.views > 0)
    .sort((a, b) => b.views - a.views);
});

const filteredLibraries = computed(() => {
  if (!fullData.value?.mostVisitedLibraries?.labels) return [];
  return fullData.value.mostVisitedLibraries.labels
    .map((label, i) => ({
      ...parseKey(label),
      views: fullData.value.mostVisitedLibraries.data[i],
    }))
    .filter((item) => item.views > 0)
    .sort((a, b) => b.views - a.views);
});

// Fetch contatori globali
async function fetchCounters() {
  try {
    const res = await apiClient.get("/stats/global/counters");
    Object.assign(counters, res);
  } catch (e) {
    console.error(e);
  }
}

// Toggle apertura/chiusura card
async function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    if (!fullData.value) {
      isLoading.value = true;
      try {
        fullData.value = await apiClient.get("/stats/global/full");
      } catch (e) {
        console.error(e);
      } finally {
        isLoading.value = false;
      }
    }
    await nextTick();
    setTimeout(renderGlobalCharts, 100);
  }
}

// Render grafici
function renderGlobalCharts() {
  charts.forEach((c) => c.destroy());
  charts = [];
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { stepSize: 1, precision: 0 }, beginAtZero: true } },
  };

  if (canvasTrend.value && fullData.value?.loansTrend) {
    charts.push(
      new Chart(canvasTrend.value, {
        type: "line",
        data: {
          labels: [...fullData.value.loansTrend.labels],
          datasets: [
            {
              data: [...fullData.value.loansTrend.data],
              borderColor: "#629677",
              backgroundColor: "rgba(98, 150, 119, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: commonOptions,
      })
    );
  }

  if (canvasWeekly.value && fullData.value?.weeklyRequests) {
    const dataValues = fullData.value.weeklyRequests.data;

    // Genera un array di colori alternati (Zomp e Paynes Gray)
    const barColors = dataValues.map((_, i) =>
      i % 2 === 0 ? "#629677" : "#495D63"
    );

    charts.push(
      new Chart(canvasWeekly.value, {
        type: "bar",
        data: {
          labels: fullData.value.weeklyRequests.labels,
          datasets: [
            {
              data: dataValues,
              backgroundColor: barColors,
              borderRadius: 6,
              barPercentage: 0.6,
              categoryPercentage: 0.8, // garantisce larghezza uniforme
            },
          ],
        },
        options: {
          ...commonOptions,
          scales: {
            x: {
              offset: true, // crea spazio a inizio/fine del grafico
            },
            y: {
              ticks: {
                stepSize: 1,
                precision: 0,
              },
              maxTicksLimit: 6, // limita i numeri a circa 6
              beginAtZero: true,
            },
          },
        },
      })
    );
  }
}

// Lifecycle
onMounted(fetchCounters);
onUnmounted(() => charts.forEach((c) => c.destroy()));
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
