<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getConcertById, getConcertValue } from '../api/concerts'

const route = useRoute()
const concert = ref(null)
const quantity = computed(() => Number(route.query.quantity ?? 1))
const price = computed(() => Number(getConcertValue(concert.value, 'price', 'ticketPrice', 'ticket_price') ?? 0))
const total = computed(() => price.value * quantity.value)

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

onMounted(async () => {
  if (route.query.concertId) {
    try {
      concert.value = await getConcertById(route.query.concertId)
    } catch {
      // La compra ya fue confirmada; el resumen sigue siendo válido si el detalle del concierto no carga.
    }
  }
})
</script>

<template>
  <section class="success-page">
    <article class="success-card">
      <span class="success-icon" aria-hidden="true">✓</span>
      <p class="eyebrow">COMPRA CONFIRMADA</p>
      <h1>¡Listo! Tus entradas están reservadas.</h1>
      <p class="intro">La compra se completó correctamente.</p>
      <dl class="purchase-details">
        <div><dt>Número de compra</dt><dd>{{ route.params.purchaseId }}</dd></div>
        <div v-if="concert"><dt>Concierto</dt><dd>{{ getConcertValue(concert, 'title', 'name') }}</dd></div>
        <div><dt>Cantidad</dt><dd>{{ quantity }} {{ quantity === 1 ? 'entrada' : 'entradas' }}</dd></div>
        <div v-if="concert"><dt>Total</dt><dd>{{ formatPrice(total) }}</dd></div>
      </dl>
      <RouterLink class="primary-button" to="/concerts">Volver a conciertos</RouterLink>
    </article>
  </section>
</template>

<style scoped>
.success-page { display: grid; max-width: 680px; place-items: start stretch; }
.success-card { padding: 2.2rem; border: 1px solid #e7ebf2; border-radius: 8px; background: #fff; text-align: center; box-shadow: 0 1px 3px #1c2b4508; }
.success-icon { display: grid; width: 3rem; height: 3rem; place-items: center; margin: 0 auto 1.1rem; border-radius: 50%; color: #218268; background: #e6f6ef; font-size: 1.35rem; font-weight: 700; }
.eyebrow { margin: 0 0 0.35rem; color: #28836c; font-size: 0.63rem; font-weight: 700; letter-spacing: 0.11em; }
h1 { margin: 0; color: #1e293b; font-size: 1.45rem; font-weight: 650; letter-spacing: -0.04em; }
.intro { margin: 0.45rem 0 1.5rem; color: #7b8798; font-size: 0.82rem; }
.purchase-details { display: grid; gap: 0.65rem; margin: 0; padding: 1rem; border: 1px solid #edf0f4; border-radius: 6px; background: #fcfdff; text-align: left; }
.purchase-details div { display: flex; justify-content: space-between; gap: 1rem; }
dt { color: #8994a6; font-size: 0.72rem; } dd { margin: 0; color: #344158; font-size: 0.74rem; font-weight: 600; text-align: right; }
.primary-button { display: inline-flex; min-height: 2.7rem; align-items: center; justify-content: center; margin-top: 1.2rem; padding: 0 1rem; border-radius: 5px; color: #fff; background: #425fca; font-size: 0.78rem; font-weight: 600; text-decoration: none; }
.primary-button:hover { background: #344fae; }
@media (max-width: 520px) { .success-card { padding: 1.3rem; } h1 { font-size: 1.25rem; } }
</style>
