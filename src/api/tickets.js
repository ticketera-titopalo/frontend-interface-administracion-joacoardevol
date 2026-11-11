import api from './index'

const DEMO_TICKETS_KEY = 'ticketera_demo_tickets'

function readDemoTickets() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_TICKETS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function unwrapTickets(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.tickets)) return payload.tickets
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.tickets)) return payload.data.tickets
  if (payload?.ticket && typeof payload.ticket === 'object') return [payload.ticket]
  if (payload?.code || payload?.ticket_code || payload?.codigo) return [payload]
  return []
}

export async function emitPurchaseTickets(purchaseId, quantity = 1, userId = 'demo-user-1') {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const tickets = readDemoTickets()
    const generated = Array.from({ length: quantity }, (_, index) => ({
      id: `demo-ticket-${Date.now()}-${index}`,
      code: `TK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      purchase_id: purchaseId,
      user_id: userId,
      used: false,
    }))
    localStorage.setItem(DEMO_TICKETS_KEY, JSON.stringify([...tickets, ...generated]))
    return generated
  }

  const { data } = await api.post('/api/purchases/emitir', { purchase_id: purchaseId })
  return unwrapTickets(data)
}

export async function getUserTickets(userId) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    return readDemoTickets().filter((ticket) => String(ticket.user_id) === String(userId))
  }

  const { data } = await api.get(`/api/tickets/usuario/${encodeURIComponent(userId)}`)
  return unwrapTickets(data)
}

export function getTicketValue(ticket, ...keys) {
  for (const key of keys) {
    const value = key.split('.').reduce((current, part) => current?.[part], ticket)
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}

export function isTicketUsed(ticket) {
  const used = getTicketValue(ticket, 'used', 'is_used', 'isUsed')
  if (used === true || used === 1 || used === '1' || used === 'true') return true
  if (used === false || used === 0 || used === '0' || used === 'false') return false
  const status = String(getTicketValue(ticket, 'status', 'estado') ?? '').toLocaleLowerCase()
  return ['used', 'usado', 'utilizado'].includes(status)
}
