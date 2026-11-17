<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { errorMessage } from '../utils/apiResponse'
import { RouterLink, useRoute } from 'vue-router'
import { getConcertById, getConcertValue } from '../api/concerts'
import { getAvailableStock, getOccupancy, getSoldTickets } from '../utils/concertMetrics'

const route = useRoute()
const concert = ref(null)
const loading = ref(true)
const error = ref('')
const soldTickets = computed(() => getSoldTickets(concert.value))
const availableStock = computed(() => getAvailableStock(concert.value))
const occupancy = computed(() => getOccupancy(concert.value))

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
    error.value = errorMessage(loadError, 'No se pudo cargar el concierto.')
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

<style scoped src="./ConcertDetailView.css"></style>
