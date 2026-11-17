import api from './index'
import { firstValue } from '../utils/apiResponse'

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
  const collections = ['', 'tickets', 'items', 'data', 'data.tickets']
    .map((path) => resolveTicketCollection(payload, path))
  const collection = collections.find(Array.isArray)
  if (collection) return collection
  return wrapSingleTicket(payload)
}

function resolveTicketCollection(payload, path) {
  return path ? firstValue(payload, [path]) : payload
}

function wrapSingleTicket(payload) {
  const ticket = firstValue(payload, ['ticket'])
  if (ticket && typeof ticket === 'object') return [ticket]
  return firstValue(payload, ['code', 'ticket_code', 'codigo']) ? [payload] : []
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
  return firstValue(ticket, keys)
}

export function isTicketUsed(ticket) {
  const used = getTicketValue(ticket, 'used', 'is_used', 'isUsed')
  return resolveTicketUsage(used, ticket)
}

function resolveTicketUsage(used, ticket) {
  if (isExplicitlyUsed(used)) return true
  if (isExplicitlyUnused(used)) return false
  return isUsedStatus(ticket)
}

function isExplicitlyUsed(value) {
  return [true, 1, '1', 'true'].includes(value)
}

function isExplicitlyUnused(value) {
  return [false, 0, '0', 'false'].includes(value)
}

function isUsedStatus(ticket) {
  const status = String(getTicketValue(ticket, 'status', 'estado') ?? '').toLocaleLowerCase()
  return USED_STATUSES.has(status)
}

export function selectPurchaseTickets(userTickets, emittedTickets, purchaseId) {
  const purchaseTickets = userTickets.filter((ticket) =>
    String(getTicketValue(ticket, 'purchase_id', 'purchaseId', 'purchase.id')) === String(purchaseId),
  )
  if (purchaseTickets.length > 0) return purchaseTickets
  if (emittedTickets?.length > 0) return emittedTickets
  return userTickets
}
