<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getConcertById, getConcertValue } from '../api/concerts'
import { emitPurchaseTickets, getTicketValue, getUserTickets, isTicketUsed } from '../api/tickets'
import { useAuthStore } from '../store/auth'

const route = useRoute()
const auth = useAuthStore()
const concert = ref(null)
const tickets = ref([])
const loadingTickets = ref(true)
const ticketError = ref('')
const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'
const quantity = computed(() => Number(route.query.quantity ?? 1))
const price = computed(() => Number(getConcertValue(concert.value, 'price', 'ticketPrice', 'ticket_price') ?? 0))
const total = computed(() => price.value * quantity.value)

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

const cacheKey = `ticketera_purchase_tickets_${route.params.purchaseId}`

async function loadPurchaseDetails() {
  if (route.query.concertId) {
    try {
      concert.value = await getConcertById(route.query.concertId)
    } catch {
      // El resumen de la compra también se muestra si el detalle no vuelve a cargar.
    }
  }
}

async function loadTickets() {
  loadingTickets.value = true
  ticketError.value = ''
  try {
    let emitted = null
    try {
      emitted = JSON.parse(localStorage.getItem(cacheKey) ?? 'null')
    } catch {
      emitted = null
    }

    if (route.query.emit === '1' && emitted === null) {
      const userId = auth.user?.id ?? auth.user?._id ?? (isDemo ? 'demo-user-1' : null)
      emitted = await emitPurchaseTickets(route.params.purchaseId, quantity.value, userId)
      localStorage.setItem(cacheKey, JSON.stringify(emitted))
    }

    const userId = auth.user?.id ?? auth.user?._id ?? (isDemo ? 'demo-user-1' : null)
    if (!userId) throw new Error('No se encontró el identificador del usuario para consultar sus tickets.')
    const userTickets = await getUserTickets(userId)
    const purchaseTickets = userTickets.filter((ticket) => String(getTicketValue(ticket, 'purchase_id', 'purchaseId', 'purchase.id')) === String(route.params.purchaseId))
    tickets.value = purchaseTickets.length ? purchaseTickets : (emitted?.length ? emitted : userTickets)

    if (!tickets.value.length && route.query.emit === '1') {
      ticketError.value = 'La compra fue confirmada, pero todavía no se encontraron tickets emitidos.'
    }
  } catch (loadError) {
    ticketError.value = loadError.response?.data?.message ?? loadError.message ?? 'No se pudieron emitir o cargar los tickets.'
  } finally {
    loadingTickets.value = false
  }
}

onMounted(() => {
  loadPurchaseDetails()
  loadTickets()
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
      <section class="issued-section">
        <div class="issued-heading"><div><h2>Tickets generados</h2><p>Códigos únicos asociados a esta compra.</p></div><span v-if="isDemo" class="demo-label">DEMO</span></div>
        <p v-if="loadingTickets" class="ticket-message">Emitiendo y consultando tus tickets…</p>
        <p v-else-if="ticketError && !tickets.length" class="ticket-message ticket-error" role="alert">{{ ticketError }} <button type="button" @click="loadTickets">Reintentar</button></p>
        <p v-else-if="!tickets.length" class="ticket-message">No hay tickets disponibles para mostrar.</p>
        <div v-else class="issued-list">
          <article v-for="(ticket, index) in tickets" :key="getTicketValue(ticket, 'id', '_id', 'code', 'ticket_code') ?? index" class="issued-ticket">
            <div><span class="ticket-label">CÓDIGO</span><code>{{ getTicketValue(ticket, 'code', 'ticket_code', 'ticketCode', 'codigo') ?? 'Código pendiente' }}</code></div>
            <span class="ticket-status" :class="isTicketUsed(ticket) ? 'used' : 'valid'"><i></i>{{ isTicketUsed(ticket) ? 'Usado' : 'No usado' }}</span>
          </article>
        </div>
        <p v-if="ticketError && tickets.length" class="ticket-warning" role="status">{{ ticketError }}</p>
      </section>
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
.issued-section { margin-top: 1rem; border: 1px solid #edf0f4; border-radius: 6px; text-align: left; }
.issued-heading { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 0.9rem; border-bottom: 1px solid #edf0f4; }
.issued-heading h2 { margin: 0; color: #344158; font-size: 0.78rem; font-weight: 650; }.issued-heading p { margin: 0.2rem 0 0; color: #8994a6; font-size: 0.67rem; }
.demo-label { padding: 0.25rem 0.4rem; border-radius: 4px; color: #806327; background: #fff5df; font-size: 0.57rem; font-weight: 700; letter-spacing: 0.06em; }
.issued-list { display: grid; }.issued-ticket { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0.9rem; border-bottom: 1px solid #f0f2f6; }.issued-ticket:last-child { border-bottom: 0; }
.issued-ticket > div { display: grid; gap: 0.3rem; }.ticket-label { color: #8994a6; font-size: 0.57rem; font-weight: 700; letter-spacing: 0.07em; }
.issued-ticket code { color: #435aaf; font-size: 0.72rem; }
.ticket-status { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.65rem; white-space: nowrap; }.ticket-status i { width: 0.35rem; height: 0.35rem; border-radius: 50%; }.ticket-status.valid { color: #248267; }.ticket-status.valid i { background: #42ad8b; }.ticket-status.used { color: #778196; }.ticket-status.used i { background: #9aa4b3; }
.ticket-message { margin: 0; padding: 1rem; color: #78859a; font-size: 0.72rem; }.ticket-error { color: #a64b4b; }.ticket-message button { margin-left: 0.5rem; border: 0; color: #425fca; background: transparent; cursor: pointer; }.ticket-warning { margin: 0; padding: 0.5rem 0.9rem; color: #a16a23; font-size: 0.68rem; }
.primary-button { display: inline-flex; min-height: 2.7rem; align-items: center; justify-content: center; margin-top: 1.2rem; padding: 0 1rem; border-radius: 5px; color: #fff; background: #425fca; font-size: 0.78rem; font-weight: 600; text-decoration: none; }
.primary-button:hover { background: #344fae; }
@media (max-width: 520px) { .success-card { padding: 1.3rem; } h1 { font-size: 1.25rem; } }
</style>
