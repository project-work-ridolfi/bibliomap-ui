<template>
  <div class="rounded-2xl shadow-md border border-[var(--thistle)] overflow-hidden bg-theme-primary transition-all duration-300">
    <div @click="toggleOpen" class="p-6 cursor-pointer hover:bg-[var(--bg-secondary)] transition flex justify-between items-center group">
      <div class="flex-grow grid grid-cols-3 gap-4 text-center mr-4">
        <div v-for="stat in simpleCards" :key="stat.label">
          <div class="text-2xl font-display text-theme-main">{{ stat.value }}</div>
          <div class="text-[10px] opacity-70 font-bold tracking-wider uppercase leading-tight">{{ stat.label }}</div>
        </div>
      </div>
      <i class="fa-solid fa-chevron-down transition-transform duration-300 text-zomp" :class="isOpen ? 'rotate-180' : ''"></i>
    </div>

    <div v-if="isOpen" class="px-6 pb-8 border-t border-thistle pt-8 space-y-8">
      <div v-if="isLoading" class="text-center py-10">
        <i class="fa-solid fa-circle-notch fa-spin text-zomp text-2xl"></i>
      </div>
      
      <template v-else-if="fullData">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div v-for="s in detailStats" :key="s.label" class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-thistle text-center">
            <p class="text-[9px] font-black opacity-40 tracking-widest mb-1 uppercase">{{ s.label }}</p>
            <p class="font-bold text-lg text-zomp truncate px-2">{{ s.value }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p class="text-[10px] font-black uppercase opacity-50 mb-6 tracking-widest text-center">scambi totali (ultimi 6 mesi)</p>
            <canvas ref="canvasTrend"></canvas>
          </div>
          <div class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p class="text-[10px] font-black uppercase opacity-50 mb-6 tracking-widest text-center">richieste community per settimana</p>
            <canvas ref="canvasWeekly"></canvas>
          </div>
          <div class="md:col-span-2 bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p class="text-[10px] font-black uppercase opacity-50 mb-6 tracking-widest text-center">top 5 titoli più prestati</p>
            <canvas ref="canvasPareto"></canvas>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, onUnmounted } from 'vue';
import { apiClient } from '@/services/apiClient';
import Chart from 'chart.js/auto';
import { useRouter } from "vue-router";

const router = useRouter();
const isOpen = ref(false);
const isLoading = ref(false);
const counters = reactive({ books: 0, copies: 0, loans: 0 });
const fullData = ref(null);

const canvasTrend = ref(null);
const canvasWeekly = ref(null);
const canvasPareto = ref(null);
let charts = [];

const simpleCards = computed(() => [
  { label: 'titoli unici', value: counters.books },
  { label: 'copie totali', value: counters.copies },
  { label: 'scambi conclusi', value: counters.loans }
]);

const detailStats = computed(() => [
  { label: 'top requester', value: fullData.value?.topRequester || 'nessuno' },
  { label: 'top loaner', value: fullData.value?.topLoaner || 'nessuno' },
  { label: 'genere top', value: fullData.value?.topTag || 'nessuno' },
  { label: 'viaggio record', value: `${fullData.value?.maxDistance || 0} km` }
]);

async function fetchCounters() {
  try {
    const res = await apiClient.get('/stats/global/counters');
    counters.books = res.books || 0;
    counters.copies = res.copies || 0;
    counters.loans = res.loans || 0;
  } catch (e) { console.error(e); }
}

async function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value && !fullData.value) {
    isLoading.value = true;
    try {
      const res = await apiClient.get('/stats/global/full');
      fullData.value = res;
      await nextTick();
      setTimeout(renderGlobalCharts, 50);
    } finally { isLoading.value = false; }
  }
}

function renderGlobalCharts() {
  charts.forEach(c => c.destroy());
  charts = [];

  const options = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { ticks: { stepSize: 1, precision: 0 }, beginAtZero: true } }
  };

  if (canvasTrend.value) {
    charts.push(new Chart(canvasTrend.value, {
      type: 'line',
      data: {
        labels: fullData.value.loansTrend.labels,
        datasets: [{ data: fullData.value.loansTrend.data, borderColor: '#629677', backgroundColor: 'rgba(98,150,119,0.1)', fill: true, tension: 0.4 }]
      },
      options
    }));
  }

  if (canvasWeekly.value) {
    charts.push(new Chart(canvasWeekly.value, {
      type: 'bar',
      data: {
        labels: fullData.value.weeklyRequests.labels.map(l => l.replace('null', 'corrente')),
        datasets: [{ data: fullData.value.weeklyRequests.data, backgroundColor: '#495D63', borderRadius: 4 }]
      },
      options
    }));
  }

  if (canvasPareto.value) {
    const labelsRaw = fullData.value.paretoBooks.labels;

    const displayLabels = labelsRaw.map((label) => {
      const parts = label.split(":");
      const title = parts[1] || parts[0];
      return title.length > 15 ? title.substring(0, 15) + "..." : title;
    });

    charts.push(
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
          ...options,
          // Cambia il cursore quando passi sopra una barra o un'etichetta
          onHover: (event, chartElement) => {
            event.native.target.style.cursor = chartElement[0]
              ? "pointer"
              : "default";
          },
          scales: {
            ...options.scales,
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
onUnmounted(() => charts.forEach(c => c.destroy()));
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
canvas { max-height: 200px; width: 100% !important; }
</style>