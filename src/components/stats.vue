<template>
  <div class="space-y-8 animate-slide-down">
    
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="p-4 bg-white rounded-xl border border-thistle text-center shadow-sm">
        <p class="text-[9px] uppercase font-black opacity-40 tracking-widest mb-1">titoli bibliomap</p>
        <p class="font-bold text-lg text-[var(--paynes-gray)]">{{ totalSummary.books }}</p>
      </div>
      <div class="p-4 bg-white rounded-xl border border-thistle text-center shadow-sm">
        <p class="text-[9px] uppercase font-black opacity-40 tracking-widest mb-1">copie totali</p>
        <p class="font-bold text-lg text-[var(--paynes-gray)]">{{ totalSummary.copies }}</p>
      </div>

      <div v-for="s in personalStats" :key="s.label" class="p-4 bg-white rounded-xl border border-thistle text-center shadow-sm">
        <p class="text-[9px] uppercase font-black opacity-40 tracking-widest mb-1 lowercase">{{ s.label }}</p>
        <p class="font-bold text-lg text-[var(--zomp)]">{{ s.value }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-5 rounded-2xl shadow-sm border border-thistle">
        <p class="text-xs font-bold uppercase opacity-50 mb-6 lowercase">andamento prestiti</p>
        <canvas ref="lineChartCanvas"></canvas>
      </div>

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-thistle">
        <p class="text-xs font-bold uppercase opacity-50 mb-6 lowercase">richieste per settimana</p>
        <canvas ref="requestsChartCanvas"></canvas>
      </div>

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-thistle">
        <p class="text-xs font-bold uppercase opacity-50 mb-6 lowercase">titoli piu prestati (pareto)</p>
        <canvas ref="paretoChartCanvas"></canvas>
      </div>

      <div class="bg-white p-5 rounded-2xl shadow-sm border border-thistle">
        <p class="text-xs font-bold uppercase opacity-50 mb-6 lowercase">utenti che chiedono di piu</p>
        <canvas ref="usersChartCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { apiClient } from '@/services/apiClient'
import Chart from 'chart.js/auto'

const props = defineProps(['userId'])

// riferimenti canvas
const lineChartCanvas = ref(null)
const requestsChartCanvas = ref(null)
const paretoChartCanvas = ref(null)
const usersChartCanvas = ref(null)

const totalSummary = reactive({
  books: 0,
  copies: 0
})

const personalStats = reactive([
  { label: 'tag piu cercato', value: '-' },
  { label: 'viaggio piu lungo', value: '0 km' },
  { label: 'partner abituale', value: '-' }
])

let chartInstances = []

const createChart = (el, config) => {
  const chart = new Chart(el, config)
  chartInstances.push(chart)
  return chart
}

onMounted(async () => {
  try {
    const [totalRes, statsRes] = await Promise.all([
      apiClient.get('/stats/total'),
      apiClient.get(`/stats/user/${props.userId}`)
    ])

    // mappatura dai conteggi globali
    totalSummary.books = totalRes.books
    totalSummary.copies = totalRes.copies

    // mappatura dal record UserStatsDTO
    personalStats[0].value = statsRes.topTag || 'nessuno'
    personalStats[1].value = `${statsRes.maxDistance || 0} km`
    personalStats[2].value = statsRes.topPartner || 'nessuno'

    // 1. grafico linee: andamento prestiti (loansTrend)
    if (lineChartCanvas.value) {
      createChart(lineChartCanvas.value, {
        type: 'line',
        data: {
          labels: statsRes.loansTrend.labels,
          datasets: [{
            label: 'scambi mensili',
            data: statsRes.loansTrend.data,
            borderColor: '#629677',
            backgroundColor: 'rgba(98, 150, 119, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { responsive: true }
      })
    }

    // 2. grafico barre: richieste settimanali (weeklyRequests)
    if (requestsChartCanvas.value) {
      createChart(requestsChartCanvas.value, {
        type: 'bar',
        data: {
          labels: statsRes.weeklyRequests.labels,
          datasets: [{
            data: statsRes.weeklyRequests.data,
            backgroundColor: '#D19C97'
          }]
        },
        options: { 
          responsive: true,
          plugins: { legend: { display: false } }
        }
      })
    }

    // 3. grafico pareto: titoli (paretoBooks)
    if (paretoChartCanvas.value) {
      createChart(paretoChartCanvas.value, {
        type: 'bar',
        data: {
          labels: statsRes.paretoBooks.labels,
          datasets: [{
            label: 'numero prestiti',
            data: statsRes.paretoBooks.data,
            backgroundColor: '#629677'
          }]
        },
        options: { responsive: true }
      })
    }

    // 4. grafico utenti: barre orizzontali (topRequesters)
    if (usersChartCanvas.value) {
      createChart(usersChartCanvas.value, {
        type: 'bar',
        data: {
          labels: statsRes.topRequesters.labels,
          datasets: [{
            data: statsRes.topRequesters.data,
            backgroundColor: '#98B6B1'
          }]
        },
        options: { 
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { display: false } }
        }
      })
    }
  } catch (e) {
    console.error("errore caricamento statistiche dashboard")
  }
})

onUnmounted(() => {
  chartInstances.forEach(chart => chart.destroy())
})
</script>

<style scoped>
canvas {
  max-height: 250px;
  width: 100% !important;
}
</style>