<script setup>
import { computed, onMounted, ref } from 'vue'
import { errorMessage } from '../utils/apiResponse'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { getConcertById, getConcertValue } from '../api/concerts'
import { createPurchase, PurchaseError } from '../api/purchases'
import { useAuthStore } from '../store/auth'
import { getSessionUserId } from '../utils/session'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const concert = ref(null)
const loading = ref(true)
const error = ref('')
const quantity = ref(1)
const purchaseError = ref('')
const submitting = ref(false)
const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'

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
    error.value = errorMessage(loadError, 'No se pudo cargar el concierto.')
  } finally {
    loading.value = false
  }
}

function validatePurchase() {
  if (quantity.value < 1 || quantity.value > stock.value) return `Stock insuficiente. Quedan ${stock.value} entradas disponibles.`
  return getSessionUserId(auth.user) ? '' : 'No se encontró el usuario de la sesión. Vuelve a iniciar sesión.'
}

function purchaseFailureMessage(failure) {
  if (failure instanceof PurchaseError && failure.type === 'stock') {
    return 'Stock insuficiente. Actualiza la página para consultar la disponibilidad actual.'
  }
  return errorMessage(failure, 'No se pudo completar la compra.')
}

function buildPurchaseInput(userId) {
  const concertId = getConcertValue(concert.value, 'id', '_id') || route.params.concertId
  return { concert_id: concertId, quantity: quantity.value, user_id: userId }
}

function purchaseSuccessLocation(purchase) {
  const purchaseId = getConcertValue(purchase, 'id', '_id', 'purchase_id', 'purchaseId') || 'confirmada'
  return { name: 'purchase-success', params: { purchaseId }, query: { concertId: route.params.concertId, quantity: String(quantity.value), emit: '1' } }
}
async function confirmPurchase() {
  purchaseError.value = ''
  const validationError = validatePurchase()
  if (validationError) {
    purchaseError.value = validationError
    return
  }
  const userId = getSessionUserId(auth.user)

  submitting.value = true
  try {
    const purchase = await createPurchase(buildPurchaseInput(userId))
    await router.replace(purchaseSuccessLocation(purchase))
  } catch (purchaseFailure) {
    purchaseError.value = purchaseFailureMessage(purchaseFailure)
  } finally {
    submitting.value = false
  }
}

onMounted(loadConcert)
</script>

<template>
  <section class="purchase-page">
    <RouterLink class="back-link" :to="`/concerts/${route.params.concertId}`">← Volver al concierto</RouterLink>
    <div v-if="loading" class="purchase-card message">Cargando compra…</div>
    <div v-else-if="error" class="purchase-card message error" role="alert">{{ error }}</div>
    <article v-else-if="concert" class="purchase-card">
      <p class="eyebrow">COMPRA DE ENTRADAS</p>
      <h1>{{ getConcertValue(concert, 'title', 'name') }}</h1>
      <p class="intro">{{ getConcertValue(concert, 'date', 'eventDate', 'event_date') ?? 'Fecha por confirmar' }} · {{ getConcertValue(concert, 'venue', 'location', 'place') ?? 'Lugar por confirmar' }}</p>
      <div class="purchase-summary">
        <div><span>Precio por entrada</span><strong>{{ formatPrice(price) }}</strong></div>
        <div><span>Disponibles</span><strong>{{ stock }}</strong></div>
      </div>
      <label for="quantity">Cantidad de entradas</label>
      <select id="quantity" v-model.number="quantity" :disabled="stock === 0 || submitting">
        <option v-for="count in Math.min(stock, 6)" :key="count" :value="count">{{ count }}</option>
      </select>
      <div class="total-line"><span>Total</span><strong>{{ formatPrice(total) }}</strong></div>
      <p v-if="demoMode" class="demo-note">Modo demostración: esta compra actualiza el stock local, sin generar un cobro real.</p>
      <p v-if="purchaseError" class="purchase-error" role="alert">{{ purchaseError }}</p>
      <button class="primary-button" type="button" :disabled="stock === 0 || submitting" @click="confirmPurchase">
        {{ stock === 0 ? 'Sin stock disponible' : submitting ? 'Procesando compra…' : 'Confirmar compra' }}
      </button>
    </article>
  </section>
</template>

<style scoped src="./TicketPurchaseView.css"></style>
