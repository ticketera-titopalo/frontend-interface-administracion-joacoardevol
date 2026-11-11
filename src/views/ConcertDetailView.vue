<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getConcertById, getConcertValue } from '../api/concerts'

const route = useRoute()
const concert = ref(null)
const loading = ref(true)
const error = ref('')

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
        <dl class="detail-grid">
          <div><dt>Precio</dt><dd>{{ formatPrice(getConcertValue(concert, 'price', 'ticketPrice', 'ticket_price')) }}</dd></div>
          <div><dt>Stock disponible</dt><dd>{{ getConcertValue(concert, 'availableStock', 'available_stock', 'stockAvailable', 'stock_available', 'stock') ?? '—' }} entradas</dd></div>
          <div><dt>Fecha</dt><dd>{{ getConcertValue(concert, 'date', 'eventDate', 'event_date') ?? 'Por confirmar' }}</dd></div>
          <div><dt>Lugar</dt><dd>{{ getConcertValue(concert, 'venue', 'location', 'place') ?? 'Por confirmar' }}</dd></div>
        </dl>
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
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 0; }
.detail-grid div { padding: 1rem; border: 1px solid #edf0f4; border-radius: 6px; background: #fcfdff; }
dt { margin-bottom: 0.35rem; color: #8994a6; font-size: 0.68rem; }
dd { margin: 0; color: #344158; font-size: 0.88rem; font-weight: 600; }
.message { display: grid; min-height: 180px; place-items: center; padding: 2rem; color: #78859a; font-size: 0.83rem; }
.error { color: #a64b4b; }
@media (max-width: 600px) { .detail-banner { min-height: 100px; padding: 1rem; }.detail-body { padding: 1.3rem 1rem; }.detail-grid { grid-template-columns: 1fr; } }
</style>
