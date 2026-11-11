<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getConcerts, getConcertValue } from '../api/concerts'

const concerts = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const page = ref(1)
const pageSize = 5
const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

const filteredConcerts = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('es')
  if (!query) return concerts.value
  return concerts.value.filter((concert) => {
    const title = getConcertValue(concert, 'title', 'name') ?? ''
    const artist = getConcertValue(concert, 'artist', 'performer', 'artistName', 'artist_name') ?? ''
    return `${title} ${artist}`.toLocaleLowerCase('es').includes(query)
  })
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredConcerts.value.length / pageSize)))
const visibleConcerts = computed(() => filteredConcerts.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const firstRow = computed(() => filteredConcerts.value.length ? (page.value - 1) * pageSize + 1 : 0)
const lastRow = computed(() => Math.min(page.value * pageSize, filteredConcerts.value.length))

function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  const amount = Number(value)
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
    : value
}

function stockFor(concert) {
  return getConcertValue(concert, 'availableStock', 'available_stock', 'stockAvailable', 'stock_available', 'stock')
}

async function loadConcerts() {
  loading.value = true
  error.value = ''
  try {
    concerts.value = await getConcerts()
  } catch (loadError) {
    error.value = loadError.response?.data?.message ?? 'No se pudo cargar el listado de conciertos.'
  } finally {
    loading.value = false
  }
}

function updateSearch() {
  page.value = 1
}

onMounted(loadConcerts)
</script>

<template>
  <section class="concerts-page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">GESTIÓN DE EVENTOS</p>
        <h1>Conciertos</h1>
        <p class="subtitle">Consulta los eventos, precios y disponibilidad de entradas.</p>
      </div>
      <span v-if="isDemo" class="demo-badge"><i></i> Datos de demostración</span>
    </div>

    <section class="list-card">
      <div class="list-toolbar">
        <div><h2>Todos los conciertos</h2><p>{{ concerts.length }} eventos registrados</p></div>
        <label class="search-box">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
          <input v-model="search" type="search" placeholder="Buscar concierto o artista" aria-label="Buscar concierto o artista" @input="updateSearch" />
        </label>
      </div>

      <div v-if="loading" class="message-state">Cargando conciertos…</div>
      <div v-else-if="error" class="message-state error-state" role="alert">
        <span>{{ error }}</span><button type="button" @click="loadConcerts">Reintentar</button>
      </div>
      <div v-else-if="filteredConcerts.length === 0" class="message-state">No hay conciertos que coincidan con la búsqueda.</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>CONCIERTO</th><th>ARTISTA</th><th>PRECIO</th><th>STOCK DISPONIBLE</th><th></th></tr></thead>
          <tbody>
            <tr v-for="(concert, index) in visibleConcerts" :key="getConcertValue(concert, 'id', '_id') ?? index">
              <td><div class="event-cell"><span class="event-mark">{{ String(getConcertValue(concert, 'title', 'name') ?? 'C').charAt(0).toUpperCase() }}</span><span><strong>{{ getConcertValue(concert, 'title', 'name') ?? 'Sin título' }}</strong><small>{{ getConcertValue(concert, 'date', 'eventDate', 'event_date') ?? 'Fecha por confirmar' }}</small></span></div></td>
              <td>{{ getConcertValue(concert, 'artist', 'performer', 'artistName', 'artist_name') ?? '—' }}</td>
              <td class="price">{{ formatPrice(getConcertValue(concert, 'price', 'ticketPrice', 'ticket_price')) }}</td>
              <td><span class="stock" :class="{ 'stock-empty': Number(stockFor(concert)) === 0 }"><i></i>{{ stockFor(concert) ?? '—' }} entradas</span></td>
              <td class="action-cell"><RouterLink class="detail-link" :to="`/concerts/${getConcertValue(concert, 'id', '_id')}`">Ver detalle <span aria-hidden="true">→</span></RouterLink></td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer v-if="!loading && !error && filteredConcerts.length" class="pagination">
        <span>Mostrando {{ firstRow }}–{{ lastRow }} de {{ filteredConcerts.length }} conciertos</span>
        <div class="page-controls">
          <button type="button" aria-label="Página anterior" :disabled="page === 1" @click="page--">‹</button>
          <span>Página {{ page }} de {{ pageCount }}</span>
          <button type="button" aria-label="Página siguiente" :disabled="page === pageCount" @click="page++">›</button>
        </div>
      </footer>
    </section>
  </section>
</template>

<style scoped>
.concerts-page { display: grid; gap: 1.5rem; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.eyebrow { margin: 0 0 0.35rem; color: #6379d4; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.11em; }
h1 { margin: 0; color: #1e293b; font-size: 1.75rem; font-weight: 650; letter-spacing: -0.045em; }
.subtitle { margin: 0.35rem 0 0; color: #7b8798; font-size: 0.85rem; }
.demo-badge { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.4rem 0.65rem; border: 1px solid #f0dfb7; border-radius: 5px; color: #806327; background: #fffaf0; font-size: 0.68rem; font-weight: 600; }
.demo-badge i { width: 0.4rem; height: 0.4rem; border-radius: 50%; background: #d4a43e; }
.list-card { overflow: hidden; border: 1px solid #e7ebf2; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px #1c2b4508; }
.list-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.1rem 1.3rem; }
.list-toolbar h2 { margin: 0; color: #28354b; font-size: 0.9rem; font-weight: 650; }
.list-toolbar p { margin: 0.25rem 0 0; color: #8a95a6; font-size: 0.73rem; }
.search-box { display: flex; width: min(100%, 17rem); height: 2.35rem; align-items: center; gap: 0.5rem; padding: 0 0.65rem; border: 1px solid #dfe4ec; border-radius: 5px; color: #8995a7; }
.search-box:focus-within { border-color: #8192d9; box-shadow: 0 0 0 3px #526bd012; }
.search-box svg { width: 1rem; height: 1rem; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.7; }
.search-box input { width: 100%; border: 0; outline: 0; color: #344158; background: transparent; font: inherit; font-size: 0.73rem; }
.search-box input::placeholder { color: #9aa4b3; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
th { padding: 0.72rem 1.3rem; border-top: 1px solid #edf0f4; border-bottom: 1px solid #edf0f4; color: #8a95a6; background: #fafbfd; font-size: 0.61rem; font-weight: 700; letter-spacing: 0.06em; }
td { padding: 0.82rem 1.3rem; border-bottom: 1px solid #f0f2f6; color: #596579; font-size: 0.75rem; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #fcfdff; }
.event-cell { display: flex; align-items: center; gap: 0.65rem; }
.event-mark { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 6px; color: #5268c6; background: #edf0ff; font-size: 0.8rem; font-weight: 700; }
.event-cell span:last-child { display: grid; gap: 0.15rem; }
.event-cell strong { color: #344158; font-size: 0.75rem; font-weight: 600; }
.event-cell small { color: #9aa4b3; font-size: 0.65rem; }
.price { color: #344158; font-weight: 600; }
.stock { display: inline-flex; align-items: center; gap: 0.38rem; color: #29836c; font-size: 0.7rem; }
.stock i { width: 0.38rem; height: 0.38rem; border-radius: 50%; background: #40ab89; }
.stock-empty { color: #a45c62; }.stock-empty i { background: #d77d82; }
.detail-link { color: #4d65c9; font-size: 0.72rem; font-weight: 600; text-decoration: none; }
.detail-link:hover { color: #334da9; }.detail-link span { margin-left: 0.15rem; font-size: 0.95rem; }
.action-cell { text-align: right; }
.pagination { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.8rem 1.3rem; border-top: 1px solid #edf0f4; color: #8994a6; font-size: 0.7rem; }
.page-controls { display: flex; align-items: center; gap: 0.65rem; }
.page-controls button { display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border: 1px solid #dfe4ec; border-radius: 4px; color: #596579; background: white; font-size: 1.1rem; line-height: 1; cursor: pointer; }
.page-controls button:disabled { color: #c1c8d3; background: #fafbfd; cursor: not-allowed; }
.message-state { display: grid; min-height: 180px; place-content: center; gap: 0.9rem; padding: 2rem; color: #78859a; font-size: 0.83rem; text-align: center; }
.error-state { color: #a64b4b; }
.error-state button { justify-self: center; padding: 0.45rem 0.8rem; border: 1px solid #d9e0ee; border-radius: 5px; color: #425fca; background: #fff; cursor: pointer; }
@media (max-width: 650px) { .page-heading { align-items: start; flex-direction: column; }.list-toolbar { align-items: stretch; flex-direction: column; }.search-box { width: 100%; }.pagination { align-items: start; flex-direction: column; }.page-controls { align-self: flex-end; } }
</style>
