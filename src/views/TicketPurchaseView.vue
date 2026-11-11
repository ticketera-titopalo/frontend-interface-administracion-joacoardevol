<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getConcertById, getConcertValue } from '../api/concerts'

const route = useRoute()
const concert = ref(null)
const loading = ref(true)
const error = ref('')
const quantity = ref(1)
const completed = ref(false)

const stock = computed(() => Number(getConcertValue(concert.value, 'availableStock', 'available_stock', 'stockAvailable', 'stock_available', 'stock') ?? 0))
const price = computed(() => Number(getConcertValue(concert.value, 'price', 'ticketPrice', 'ticket_price') ?? 0))
const total = computed(() => price.value * quantity.value)

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

async function loadConcert() {
  loading.value = true
  try {
    concert.value = await getConcertById(route.params.concertId)
  } catch (loadError) {
    error.value = loadError.response?.data?.message ?? loadError.message ?? 'No se pudo cargar el concierto.'
  } finally {
    loading.value = false
  }
}

function confirmPurchase() {
  completed.value = true
}

onMounted(loadConcert)
</script>

<template>
  <section class="purchase-page">
    <RouterLink class="back-link" :to="`/concerts/${route.params.concertId}`">← Volver al concierto</RouterLink>
    <div v-if="loading" class="purchase-card message">Cargando compra…</div>
    <div v-else-if="error" class="purchase-card message error" role="alert">{{ error }}</div>
    <article v-else-if="concert" class="purchase-card">
      <template v-if="completed">
        <div class="confirmation-icon">✓</div>
        <p class="eyebrow">DEMO</p>
        <h1>Compra simulada</h1>
        <p class="intro">Se reservaron {{ quantity }} entradas para {{ getConcertValue(concert, 'title', 'name') }}.</p>
        <RouterLink class="primary-button" to="/concerts">Volver a conciertos</RouterLink>
      </template>
      <template v-else>
        <p class="eyebrow">COMPRA DE ENTRADAS</p>
        <h1>{{ getConcertValue(concert, 'title', 'name') }}</h1>
        <p class="intro">{{ getConcertValue(concert, 'date', 'eventDate', 'event_date') ?? 'Fecha por confirmar' }} · {{ getConcertValue(concert, 'venue', 'location', 'place') ?? 'Lugar por confirmar' }}</p>
        <div class="purchase-summary">
          <div><span>Precio por entrada</span><strong>{{ formatPrice(price) }}</strong></div>
          <div><span>Disponibles</span><strong>{{ stock }}</strong></div>
        </div>
        <label for="quantity">Cantidad de entradas</label>
        <select id="quantity" v-model.number="quantity" :disabled="stock === 0">
          <option v-for="count in Math.min(stock, 6)" :key="count" :value="count">{{ count }}</option>
        </select>
        <div class="total-line"><span>Total</span><strong>{{ formatPrice(total) }}</strong></div>
        <p class="demo-note">Modo demostración: esta compra no genera un cobro real.</p>
        <button class="primary-button" type="button" :disabled="stock === 0" @click="confirmPurchase">{{ stock === 0 ? 'Sin stock disponible' : 'Confirmar compra simulada' }}</button>
      </template>
    </article>
  </section>
</template>

<style scoped>
.purchase-page { display: grid; gap: 1rem; max-width: 680px; }
.back-link { color: #5369c5; font-size: 0.78rem; font-weight: 600; text-decoration: none; }
.purchase-card { padding: 2rem; border: 1px solid #e7ebf2; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px #1c2b4508; }
.eyebrow { margin: 0 0 0.4rem; color: #6379d4; font-size: 0.63rem; font-weight: 700; letter-spacing: 0.11em; }
h1 { margin: 0; color: #1e293b; font-size: 1.55rem; font-weight: 650; letter-spacing: -0.04em; }
.intro { margin: 0.4rem 0 1.5rem; color: #7b8798; font-size: 0.82rem; }
.purchase-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-bottom: 1.4rem; }
.purchase-summary div { display: grid; gap: 0.35rem; padding: 0.9rem; border: 1px solid #edf0f4; border-radius: 6px; background: #fcfdff; }
.purchase-summary span, label { color: #8994a6; font-size: 0.7rem; }
.purchase-summary strong { color: #344158; font-size: 0.85rem; }
label { display: block; margin-bottom: 0.4rem; color: #39465b; font-weight: 600; }
select { width: 100%; height: 2.6rem; padding: 0 0.65rem; border: 1px solid #d8dee8; border-radius: 5px; color: #344158; background: white; font: inherit; font-size: 0.8rem; }
.total-line { display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #edf0f4; color: #647187; font-size: 0.82rem; }
.total-line strong { color: #26344e; font-size: 1rem; }
.demo-note { margin: 0.9rem 0 0; color: #806327; font-size: 0.72rem; }
.primary-button { display: inline-flex; min-height: 2.7rem; align-items: center; justify-content: center; margin-top: 1.1rem; padding: 0 1rem; border: 0; border-radius: 5px; color: #fff; background: #425fca; font: inherit; font-size: 0.78rem; font-weight: 600; text-decoration: none; cursor: pointer; }
.primary-button:hover:not(:disabled) { background: #344fae; }
.primary-button:disabled { opacity: 0.6; cursor: not-allowed; }
.message { display: grid; min-height: 180px; place-items: center; color: #78859a; font-size: 0.83rem; }.error { color: #a64b4b; }
.confirmation-icon { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; margin-bottom: 1rem; border-radius: 50%; color: #248267; background: #e6f6ef; font-size: 1.2rem; }
@media (max-width: 520px) { .purchase-card { padding: 1.3rem; } }
</style>
