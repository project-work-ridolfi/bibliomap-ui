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
            <p class="text-[9px] font-black opacity-40 tracking-widest mb-1 uppercase">
              {{ s.label }}
            </p>
            <p v-if="s.link" @click="router.push(s.link)" class="font-bold text-lg text-zomp truncate px-2 cursor-pointer hover:underline">
              {{ s.value }}
            </p>
            <p v-else class="font-bold text-lg text-zomp truncate px-2">
              {{ s.value }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              andamento scambi (mensile)
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasTrend"></canvas>
            </div>
          </div>

          <div class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              i tag più usati
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasTags"></canvas>
            </div>
          </div>

          <div v-if="filteredMostViewedBooks.length > 0" class="bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm">
            <p class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              libri più visitati
            </p>
            <div class="space-y-3">
              <div 
                v-for="(item, index) in filteredMostViewedBooks.slice(0, 3)" 
                :key="index"
                @click="router.push(`/books/${item.id}`)"
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp transition cursor-pointer group"
              >
                <span class="font-bold text-sm text-theme-main group-hover:text-zomp truncate flex-1 mr-4">
                  {{ index + 1 }}. {{ item.name }}
                </span>
                <span class="text-[10px] font-black uppercase opacity-60 shrink-0">
                  <i class="fa-solid fa-eye mr-1"></i> {{ item.views }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="filteredLibraries.length > 0" class="bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm text-theme-main">
            <p class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              {{ filteredLibraries.length > 1 ? 'le librerie più visitate' : 'visite libreria' }}
            </p>
            <div class="space-y-3">
              <div 
                v-for="(item, index) in filteredLibraries" 
                :key="index"
                @click="router.push(`/libraries/${item.id}`)"
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp transition cursor-pointer group"
              >
                <span class="font-bold text-sm group-hover:text-zomp truncate flex-1 mr-4">
                  {{ item.name }}
                </span>
                <span class="text-[10px] font-black uppercase opacity-60">
                  {{ item.views }} visite
                </span>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              i titoli più richiesti
            </p>
            <div class="space-y-3">
              <div 
                v-for="(label, index) in fullData.titlesRanking.labels" 
                :key="index"
                @click="router.push(`/books/${parseKey(label).id}`)"
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp hover:shadow-sm transition cursor-pointer group"
              >
                <div class="flex items-center gap-4">
                  <span class="font-display text-zomp text-lg opacity-50">{{ index + 1 }}.</span>
                  <span class="font-bold text-theme-main group-hover:text-zomp transition-colors">
                    {{ parseKey(label).name }}
                  </span>
                </div>
                <div class="text-[11px] font-black uppercase bg-thistle/30 px-3 py-1 rounded-full opacity-70">
                  {{ fullData.titlesRanking.data[index] }} {{ fullData.titlesRanking.data[index] == 1 ? "richiesta" : "richieste" }}
                </div>
              </div>
              <div v-if="fullData.titlesRanking.labels.length === 0" class="text-center py-4 italic opacity-50 text-sm">
                Nessun dato disponibile
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, onUnmounted, watch } from "vue";
import { apiClient } from "@/services/apiClient";
import Chart from "chart.js/auto";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps(["userId"]);
const isOpen = ref(false);
const isLoadingFull = ref(false);
const counters = reactive({ myBooksCount: 0, totalLoansIn: 0, totalLoansOut: 0 });
const fullData = ref(null);

let chartInstances = [];
const canvasTrend = ref(null);
const canvasTags = ref(null);

const simpleCards = computed(() => [
  { label: "libri totali", value: counters.myBooksCount, color: "text-theme-main" },
  { label: "richiesti", value: counters.totalLoansIn, color: "text-[var(--zomp)]" },
  { label: "prestati", value: counters.totalLoansOut, color: "text-[var(--paynes-gray)]" },
]);

const detailStats = computed(() => {
  if (!fullData.value) return [];
  const partnerRaw = fullData.value.topPartner || "nessuno";
  let partnerName = "nessuno";
  let partnerId = null;

  if (partnerRaw !== "nessuno" && partnerRaw.includes("_")) {
    const lastUnderscoreIndex = partnerRaw.lastIndexOf("_");
    partnerName = partnerRaw.substring(0, lastUnderscoreIndex);
    partnerId = partnerRaw.substring(lastUnderscoreIndex + 1);
  } else {
    partnerName = partnerRaw;
  }

  return [
    { label: "compagno di letture", value: partnerName, link: partnerId ? `/profile/${partnerId}` : null },
    { label: "tag più usato", value: fullData.value.topTag || "nessuno" },
    { label: "viaggio più lungo", value: `${fullData.value.maxDistance || 0} km` },
  ];
});

function parseKey(label) {
  if (!label) return { id: '', name: '' };
  const parts = label.split("_");
  const id = parts[0];
  const name = parts.slice(1).join("_") || id;
  return { id, name };
}

const filteredMostViewedBooks = computed(() => {
  if (!fullData.value?.mostViewedBooks?.labels) return [];
  return fullData.value.mostViewedBooks.labels
    .map((label, i) => ({ 
      ...parseKey(label), 
      views: fullData.value.mostViewedBooks.data[i] 
    }))
    .filter(item => item.views > 0)
    .sort((a, b) => b.views - a.views);
});

const filteredLibraries = computed(() => {
  if (!fullData.value?.mostVisitedLibraries?.labels) return [];
  return fullData.value.mostVisitedLibraries.labels
    .map((label, i) => ({ 
      ...parseKey(label), 
      views: fullData.value.mostVisitedLibraries.data[i] 
    }))
    .filter(item => item.views > 0)
    .sort((a, b) => b.views - a.views);
});

async function fetchCounters() {
  if (!props.userId) return;
  try {
    const res = await apiClient.get(`/stats/user/${props.userId}/counters`);
    Object.assign(counters, res);
  } catch (e) { console.error("Err counters:", e); }
}

async function toggleOpen() {
  isOpen.value = !isOpen.value;
  
  if (isOpen.value) {
    if (!fullData.value) {
      isLoadingFull.value = true;
      try {
        fullData.value = await apiClient.get(`/stats/user/${props.userId}/full`);
      } catch (e) {
        console.error("Errore download stats:", e);
      } finally {
        isLoadingFull.value = false;
      }
    }
    
    await nextTick();
    setTimeout(renderCharts, 100);
  }
}
function renderCharts() {
  chartInstances.forEach((c) => c.destroy());
  chartInstances = [];

  const commonOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { legend: { display: false } } 
  };

  if (canvasTrend.value && fullData.value?.loansTrend?.labels) {
    chartInstances.push(new Chart(canvasTrend.value, {
      type: "line",
      data: {
        labels: [...fullData.value.loansTrend.labels],
        datasets: [{
          data: [...fullData.value.loansTrend.data],
          borderColor: "#629677",
          backgroundColor: "rgba(98, 150, 119, 0.1)",
          fill: true,
          tension: 0.4,
        }],
      },
      options: { 
        ...commonOptions, 
        scales: { y: { ticks: { stepSize: 1, precision: 0 }, beginAtZero: true } } 
      }
    }));
  }

  if (canvasTags.value && fullData.value?.tags?.labels) {
    chartInstances.push(new Chart(canvasTags.value, {
      type: "doughnut",
      data: {
        labels: [...fullData.value.tags.labels],
        datasets: [{
          data: [...fullData.value.tags.data],
          backgroundColor: ["#629677", "#495D63", "#D19C97", "#98B6B1", "#E2D1C3"],
          borderWidth: 0,
          cutout: "70%",
        }],
      },
      options: { 
        ...commonOptions, 
        plugins: { 
          legend: { display: true, position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } 
        } 
      }
    }));
  }
}

onMounted(fetchCounters);
watch(() => props.userId, fetchCounters);
onUnmounted(() => chartInstances.forEach((c) => c.destroy()));
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
canvas { width: 100% !important; }
</style>