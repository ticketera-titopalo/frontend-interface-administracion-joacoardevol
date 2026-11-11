<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getConcertById, getConcertValue } from '../api/concerts'

const route = useRoute()
const concert = ref(null)
const loading = ref(true)
const error = ref('')
const soldTickets = computed(() => Number(getConcertValue(concert.value, 'ticketsSold', 'tickets_sold', 'soldTickets', 'sold_tickets', 'sold') ?? 0))
const availableStock = computed(() => Number(getConcertValue(concert.value, 'availableStock', 'available_stock', 'stockAvailable', 'stock_available', 'stock') ?? 0))
const occupancy = computed(() => {
  const supplied = getConcertValue(concert.value, 'occupancyPercentage', 'occupancy_percentage', 'occupancy')
  if (supplied !== null) return Math.max(0, Math.min(100, Number(supplied)))
  const capacity = Number(getConcertValue(concert.value, 'capacity', 'totalStock', 'total_stock') ?? soldTickets.value + availableStock.value)
  return capacity > 0 ? Math.max(0, Math.min(100, Math.round((soldTickets.value / capacity) * 100))) : 0
})

function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  const amount = Number(value)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
    : value
}

async function loadConcert() {
  loading.value = true
  error.value = ''
  try {
    concert.value = await getConcertById(route.params.id)
  } catch (loadError) {
    error.value = loadError.response?.data?.message ?? loadError.message ?? 'No se pudo cargar el concierto.'
  } finally {
    loading.value = false
  }
}

onMounted(loadConcert)
watch(() => route.params.id, loadConcert)
</script>

<template>
  <section class="detail-page">
    <RouterLink class="back-link" to="/concerts">← Volver a conciertos</RouterLink>
    <div v-if="loading" class="detail-card message">Cargando detalle…</div>
    <div v-else-if="error" class="detail-card message error" role="alert">{{ error }}</div>
    <article v-else-if="concert" class="detail-card">
      <div class="detail-banner"><span>DETALLE DEL EVENTO</span><span class="event-mark">{{ String(getConcertValue(concert, 'title', 'name') ?? 'C').charAt(0).toUpperCase() }}</span></div>
      <div class="detail-body">
        <p class="eyebrow">CONCIERTO</p>
        <h1>{{ getConcertValue(concert, 'title', 'name') ?? 'Sin título' }}</h1>
        <p class="artist">{{ getConcertValue(concert, 'artist', 'performer', 'artistName', 'artist_name') ?? 'Artista por confirmar' }}</p>
        <p class="description">{{ getConcertValue(concert, 'description', 'summary') ?? 'No hay una descripción disponible para este concierto.' }}</p>
        <dl class="detail-grid">
          <div><dt>Precio</dt><dd>{{ formatPrice(getConcertValue(concert, 'price', 'ticketPrice', 'ticket_price')) }}</dd></div>
          <div><dt>Stock disponible</dt><dd>{{ availableStock }} entradas</dd></div>
          <div><dt>Fecha</dt><dd>{{ getConcertValue(concert, 'date', 'eventDate', 'event_date') ?? 'Por confirmar' }}</dd></div>
          <div><dt>Lugar</dt><dd>{{ getConcertValue(concert, 'venue', 'location', 'place') ?? 'Por confirmar' }}</dd></div>
        </dl>
        <section class="attendance-card" aria-label="Ventas y ocupación">
          <div class="attendance-heading"><div><h2>Entradas vendidas</h2><p>{{ soldTickets.toLocaleString('es-AR') }} entradas</p></div><strong>{{ occupancy }}%</strong></div>
          <div class="progress-track" role="progressbar" :aria-valuenow="occupancy" aria-valuemin="0" aria-valuemax="100" :aria-label="`Ocupación ${occupancy}%`"><span :style="{ width: `${occupancy}%` }"></span></div>
          <p class="occupancy-caption">Ocupación de la capacidad disponible</p>
        </section>
        <RouterLink class="buy-button" :to="{ name: 'ticket-purchase', params: { concertId: route.params.id } }">
          Comprar entradas <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </article>
  </section>
</template>

<style scoped>
.detail-page { display: grid; gap: 1.1rem; }
.back-link { color: #5369c5; font-size: 0.78rem; font-weight: 600; text-decoration: none; }
.back-link:hover { color: #344da9; }
.detail-card { overflow: hidden; border: 1px solid #e7ebf2; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px #1c2b4508; }
.detail-banner { display: flex; min-height: 132px; align-items: center; justify-content: space-between; padding: 1.5rem 2rem; color: #dfe5ff; background: linear-gradient(110deg, #263b61, #344c78); font-size: 0.66rem; font-weight: 700; letter-spacing: 0.13em; }
.event-mark { display: grid; width: 3.5rem; height: 3.5rem; place-items: center; border: 1px solid #ffffff40; border-radius: 10px; color: #fff; background: #ffffff12; font-size: 1.4rem; }
.detail-body { padding: 1.8rem 2rem 2rem; }
.eyebrow { margin: 0 0 0.3rem; color: #6379d4; font-size: 0.63rem; font-weight: 700; letter-spacing: 0.1em; }
h1 { margin: 0; color: #1e293b; font-size: 1.7rem; font-weight: 650; letter-spacing: -0.04em; }
.artist { margin: 0.35rem 0 1.6rem; color: #7b8798; font-size: 0.88rem; }
.description { max-width: 48rem; margin: -0.65rem 0 1.5rem; color: #667386; font-size: 0.83rem; line-height: 1.7; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 0; }
.detail-grid div { padding: 1rem; border: 1px solid #edf0f4; border-radius: 6px; background: #fcfdff; }
dt { margin-bottom: 0.35rem; color: #8994a6; font-size: 0.68rem; }
dd { margin: 0; color: #344158; font-size: 0.88rem; font-weight: 600; }
.attendance-card { margin-top: 1.2rem; padding: 1.1rem 1.2rem; border: 1px solid #edf0f4; border-radius: 6px; background: #fcfdff; }
.attendance-heading { display: flex; align-items: center; justify-content: space-between; }
.attendance-heading h2 { margin: 0; color: #344158; font-size: 0.78rem; font-weight: 650; }
.attendance-heading p { margin: 0.2rem 0 0; color: #8994a6; font-size: 0.7rem; }
.attendance-heading > strong { color: #4e65c6; font-size: 1.05rem; font-weight: 700; }
.progress-track { height: 7px; margin-top: 0.85rem; overflow: hidden; border-radius: 9px; background: #e9edf5; }
.progress-track span { display: block; height: 100%; border-radius: inherit; background: #5a72d5; transition: width 200ms ease; }
.occupancy-caption { margin: 0.45rem 0 0; color: #929dad; font-size: 0.66rem; }
.buy-button { display: inline-flex; min-height: 2.7rem; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1.2rem; padding: 0 1rem; border-radius: 5px; color: #fff; background: #425fca; font-size: 0.78rem; font-weight: 600; text-decoration: none; transition: background 140ms ease; }
.buy-button:hover { background: #344fae; }
.message { display: grid; min-height: 180px; place-items: center; padding: 2rem; color: #78859a; font-size: 0.83rem; }
.error { color: #a64b4b; }
@media (max-width: 600px) { .detail-banner { min-height: 100px; padding: 1rem; }.detail-body { padding: 1.3rem 1rem; }.detail-grid { grid-template-columns: 1fr; } }
</style>
