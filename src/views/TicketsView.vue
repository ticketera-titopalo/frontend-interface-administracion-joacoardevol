<script setup>
import { computed, onMounted, ref } from 'vue'
import { getTicketValue, getUserTickets, isTicketUsed } from '../api/tickets'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const tickets = ref([])
const loading = ref(true)
const error = ref('')
const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'
const issuedCount = computed(() => tickets.value.length)

async function loadTickets() {
  loading.value = true
  error.value = ''
  try {
    const userId = auth.user?.id ?? auth.user?._id ?? (isDemo ? 'demo-user-1' : null)
    if (!userId) throw new Error('No se encontró el identificador de usuario de la sesión.')
    tickets.value = await getUserTickets(userId)
  } catch (loadError) {
    error.value = loadError.response?.data?.message ?? loadError.message ?? 'No se pudieron cargar tus tickets.'
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

<style scoped>
.tickets-page { display: grid; gap: 1.5rem; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.eyebrow { margin: 0 0 0.35rem; color: #6379d4; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.11em; }
h1 { margin: 0; color: #1e293b; font-size: 1.75rem; font-weight: 650; letter-spacing: -0.045em; }
.page-heading p:last-child { margin: 0.35rem 0 0; color: #7b8798; font-size: 0.85rem; }
.count-badge { padding: 0.45rem 0.7rem; border: 1px solid #e3e8f0; border-radius: 5px; color: #596579; background: white; font-size: 0.72rem; }
.tickets-card { overflow: hidden; border: 1px solid #e7ebf2; border-radius: 8px; background: white; box-shadow: 0 1px 3px #1c2b4508; }
.card-heading { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.3rem; }
.card-heading h2 { margin: 0; color: #28354b; font-size: 0.9rem; font-weight: 650; }.card-heading p { margin: 0.25rem 0 0; color: #8a95a6; font-size: 0.73rem; }
.demo-label { padding: 0.25rem 0.45rem; border-radius: 4px; color: #806327; background: #fff5df; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.07em; }
.table-wrap { overflow-x: auto; } table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
th { padding: 0.72rem 1.3rem; border-top: 1px solid #edf0f4; border-bottom: 1px solid #edf0f4; color: #8a95a6; background: #fafbfd; font-size: 0.61rem; font-weight: 700; letter-spacing: 0.06em; }
td { padding: 0.85rem 1.3rem; border-bottom: 1px solid #f0f2f6; color: #596579; font-size: 0.75rem; } tbody tr:last-child td { border-bottom: 0; }
code { padding: 0.3rem 0.45rem; border: 1px solid #e8ebf3; border-radius: 4px; color: #435aaf; background: #f7f8fc; font-size: 0.7rem; }
.status { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; }.status i { width: 0.38rem; height: 0.38rem; border-radius: 50%; }.valid { color: #248267; }.valid i { background: #42ad8b; }.used { color: #778196; }.used i { background: #9aa4b3; }
.message-state { display: grid; min-height: 160px; place-content: center; gap: 0.75rem; color: #78859a; font-size: 0.82rem; text-align: center; }.error { color: #a64b4b; }.message-state button { justify-self: center; padding: 0.4rem 0.7rem; border: 1px solid #d9e0ee; border-radius: 5px; color: #425fca; background: #fff; cursor: pointer; }
@media (max-width: 600px) { .page-heading { align-items: start; flex-direction: column; } }
</style>
