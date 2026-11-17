<script setup>
import { computed, onMounted, ref } from 'vue'
import { errorMessage } from '../utils/apiResponse'
import { RouterLink, useRoute } from 'vue-router'
import { getConcertById, getConcertValue } from '../api/concerts'
import { emitPurchaseTickets, getTicketValue, getUserTickets, isTicketUsed, selectPurchaseTickets } from '../api/tickets'
import { useAuthStore } from '../store/auth'
import { getSessionUserId } from '../utils/session'

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

function currentUserId() {
  return getSessionUserId(auth.user, isDemo)
}

function readCachedTickets() {
  try {
    return JSON.parse(localStorage.getItem(cacheKey) ?? 'null')
  } catch {
    return null
  }
}

function shouldEmitTickets(emitted) {
  return route.query.emit === '1' && emitted === null
}

function setMissingTicketsMessage() {
  const noTickets = tickets.value.length === 0
  const emissionRequested = route.query.emit === '1'
  if (noTickets && emissionRequested) {
    ticketError.value = 'La compra fue confirmada, pero todavía no se encontraron tickets emitidos.'
  }
}

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
    let emitted = readCachedTickets()
    const userId = currentUserId()
    if (!userId) throw new Error('No se encontró el identificador del usuario para consultar sus tickets.')

    if (shouldEmitTickets(emitted)) {
      emitted = await emitPurchaseTickets(route.params.purchaseId, quantity.value, userId)
      localStorage.setItem(cacheKey, JSON.stringify(emitted))
    }

    const userTickets = await getUserTickets(userId)
    tickets.value = selectPurchaseTickets(userTickets, emitted, route.params.purchaseId)
    setMissingTicketsMessage()
  } catch (loadError) {
    ticketError.value = errorMessage(loadError, 'No se pudieron emitir o cargar los tickets.')
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

<style scoped src="./PurchaseSuccessView.css"></style>
