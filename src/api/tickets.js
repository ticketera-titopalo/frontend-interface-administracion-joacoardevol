import api from './index'

const DEMO_TICKETS_KEY = 'ticketera_demo_tickets'
const USED_STATUSES = new Set(['used', 'usado', 'utilizado'])

function readDemoTickets() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_TICKETS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function unwrapTickets(payload) {
  const collections = [payload, payload?.tickets, payload?.items, payload?.data, payload?.data?.tickets]
  const collection = collections.find(Array.isArray)
  if (collection) return collection

  if (payload?.ticket && typeof payload.ticket === 'object') return [payload.ticket]
  return payload?.code || payload?.ticket_code || payload?.codigo ? [payload] : []
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
  if ([true, 1, '1', 'true'].includes(used)) return true
  if ([false, 0, '0', 'false'].includes(used)) return false
  const status = String(getTicketValue(ticket, 'status', 'estado') ?? '').toLocaleLowerCase()
  return USED_STATUSES.has(status)
}
