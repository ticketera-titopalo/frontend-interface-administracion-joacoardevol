<script setup>
import { computed, onMounted, ref } from 'vue'
import { errorMessage } from '../utils/apiResponse'
import { getTicketValue, getUserTickets, isTicketUsed } from '../api/tickets'
import { useAuthStore } from '../store/auth'
import { getSessionUserId } from '../utils/session'

const auth = useAuthStore()
const tickets = ref([])
const loading = ref(true)
const error = ref('')
const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'
const issuedCount = computed(() => tickets.value.length)

function currentUserId() {
  return getSessionUserId(auth.user, isDemo)
}

function missingUserError() {
  return new Error('No se encontró el identificador de usuario de la sesión.')
}

async function loadTickets() {
  loading.value = true
  error.value = ''
  try {
    const userId = currentUserId()
    if (!userId) throw missingUserError()
    tickets.value = await getUserTickets(userId)
  } catch (loadError) {
    error.value = errorMessage(loadError, 'No se pudieron cargar tus tickets.')
  } finally {
    loading.value = false
  }
}

onMounted(loadTickets)
</script>

<template>
  <section class="tickets-page">
    <header class="page-heading">
      <div><p class="eyebrow">MI CUENTA</p><h1>Mis tickets</h1><p>Consulta tus entradas y su estado de uso.</p></div>
      <span class="count-badge">{{ issuedCount }} {{ issuedCount === 1 ? 'ticket' : 'tickets' }}</span>
    </header>
    <section class="tickets-card">
      <div class="card-heading"><div><h2>Entradas emitidas</h2><p>Los códigos son únicos y corresponden a tu cuenta.</p></div><span v-if="isDemo" class="demo-label">DEMO</span></div>
      <div v-if="loading" class="message-state">Cargando tickets…</div>
      <div v-else-if="error" class="message-state error" role="alert">{{ error }} <button type="button" @click="loadTickets">Reintentar</button></div>
      <div v-else-if="tickets.length === 0" class="message-state">Todavía no tienes tickets emitidos.</div>
      <div v-else class="table-wrap">
        <table>
          <thead><tr><th>CÓDIGO</th><th>EVENTO</th><th>FECHA</th><th>ESTADO</th></tr></thead>
          <tbody>
            <tr v-for="(ticket, index) in tickets" :key="getTicketValue(ticket, 'id', '_id', 'code', 'codigo') ?? index">
              <td><code>{{ getTicketValue(ticket, 'code', 'ticket_code', 'ticketCode', 'codigo') ?? 'Código pendiente' }}</code></td>
              <td>{{ getTicketValue(ticket, 'concert.title', 'concert_name', 'concertName', 'event.title', 'event_name') ?? 'Concierto' }}</td>
              <td>{{ getTicketValue(ticket, 'created_at', 'createdAt', 'issued_at') ?? '—' }}</td>
              <td><span class="status" :class="isTicketUsed(ticket) ? 'used' : 'valid'"><i></i>{{ isTicketUsed(ticket) ? 'Usado' : 'No usado' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<style scoped src="./TicketsView.css"></style>
