<template>
  <div
    class="rounded-2xl shadow-md border border-[var(--thistle)] overflow-hidden bg-theme-primary transition-all duration-300">
    <div
      @click="toggleOpen"
      class="p-6 cursor-pointer hover:bg-[var(--bg-secondary)] transition flex justify-between items-center group">
      <div class="flex-grow grid grid-cols-3 gap-4 text-center mr-4">
        <div v-for="stat in simpleCards" :key="stat.label">
          <div class="text-2xl font-display text-theme-main">
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
      <div v-if="isLoading" class="text-center py-10">
        <i class="fa-solid fa-circle-notch fa-spin text-zomp text-2xl"></i>
      </div>

      <template v-else-if="fullData">
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div
            v-for="s in detailStats"
            :key="s.label"
            class="p-4 bg-[var(--bg-secondary)] rounded-xl border border-thistle text-center">
            <p
              class="text-[9px] font-black opacity-40 tracking-widest mb-1 uppercase">
              {{ s.label }}
            </p>
            <p
              v-if="s.link"
              @click="router.push(s.link)"
              class="font-bold text-lg text-zomp truncate px-2 cursor-pointer hover:underline">
              {{ s.value }}
            </p>
            <p v-else class="font-bold text-lg text-zomp truncate px-2">
              {{ s.value }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div
            class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 tracking-widest text-center">
              scambi conclusi (ultimi 6 mesi)
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasTrend"></canvas>
            </div>
          </div>
          <div
            class="bg-theme-primary p-5 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 tracking-widest text-center">
              richieste community per settimana
            </p>
            <div class="h-[200px]">
              <canvas ref="canvasWeekly"></canvas>
            </div>
          </div>

          <div
            v-if="filteredMostViewedBooks.length > 0"
            class="bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              i libri più visti
            </p>
            <div class="space-y-3">
              <div
                v-for="(item, index) in filteredMostViewedBooks.slice(0, 3)"
                :key="index"
                @click="router.push(`/books/${item.id}`)"
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp transition cursor-pointer group">
                <span
                  class="font-bold text-sm text-theme-main group-hover:text-zomp truncate flex-1 mr-4">
                  {{ index + 1 }}. {{ item.name }}
                </span>
                <span
                  class="text-[10px] font-black uppercase opacity-60 shrink-0">
                  <i class="fa-solid fa-eye mr-1"></i> {{ item.views }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="filteredLibraries.length > 0"
            class="bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm text-theme-main">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
              le librerie più visitate
            </p>
            <div class="space-y-3">
              <div
                v-for="(item, index) in filteredLibraries.slice(0, 3)"
                :key="index"
                @click="router.push(`/libraries/${item.id}`)"
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp transition cursor-pointer group">
                <span
                  class="font-bold text-sm group-hover:text-zomp truncate flex-1 mr-4"
                  >{{ item.name }}</span
                >
                <span class="text-[10px] font-black uppercase opacity-60"
                  >{{ item.views }} visite</span
                >
              </div>
            </div>
          </div>

          <div
            class="md:col-span-2 bg-theme-primary p-6 rounded-2xl border border-thistle shadow-sm">
            <p
              class="text-[10px] font-black uppercase opacity-50 mb-6 text-center tracking-widest">
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
                class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-transparent hover:border-zomp transition cursor-pointer group">
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
                  class="text-[11px] font-black uppercase bg-thistle/30 px-3 py-1 rounded-full opacity-70">
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

const router = useRouter();
const isOpen = ref(false);
const isLoading = ref(false);
const counters = reactive({ books: 0, copies: 0, loans: 0 });
const fullData = ref(null);

const canvasTrend = ref(null);
const canvasWeekly = ref(null);
let charts = [];

const simpleCards = computed(() => [
  { label: "titoli unici", value: counters.books },
  { label: "copie totali", value: counters.copies },
  { label: "scambi conclusi", value: counters.loans },
]);

const detailStats = computed(() => {
  if (!fullData.value) return [];
  return [
    {
      label: "top requester",
      value: fullData.value.topRequester || "nessuno",
      link: fullData.value.topRequesterId
        ? `/profile/${fullData.value.topRequesterId}`
        : null,
    },
    {
      label: "top loaner",
      value: fullData.value.topLoaner || "nessuno",
      link: fullData.value.topLoanerId
        ? `/profile/${fullData.value.topLoanerId}`
        : null,
    },
    { label: "genere top", value: fullData.value.topTag || "nessuno" },
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

async function fetchCounters() {
  try {
    const res = await apiClient.get("/stats/global/counters");
    Object.assign(counters, res);
  } catch (e) {
    console.error(e);
  }
}

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
          labels: fullData.value.weeklyRequests.labels, // Es: "29/12 - 04/01"
          datasets: [
            {
              data: dataValues,
              backgroundColor: barColors,
              borderRadius: 6,
            },
          ],
        },
        options: commonOptions, // commonOptions ha già il beginAtZero e il ticks stepSize
      })
    );
  }
}

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
