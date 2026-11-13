import api from './index'
import { getConcertById, getConcertValue } from './concerts'

export class PurchaseError extends Error {
  constructor(message, type = 'general') {
    super(message)
    this.name = 'PurchaseError'
    this.type = type
  }
}

function isInsufficientStock(data = {}, message = '') {
  const stockMessage = /insufficient stock|stock insuficiente|not enough stock/i.test(message)
  return Boolean(data.stock_insufficient) || data.code === 'INSUFFICIENT_STOCK' || stockMessage
}

function purchaseFromResponse(data) {
  if (data?.success === false) {
    throw new PurchaseError(data.message ?? 'No se pudo completar la compra.')
  }
  return data?.purchase ?? data?.data ?? data
}

function normalizePurchaseError(error) {
  if (error instanceof PurchaseError) return error

  const data = error.response?.data ?? {}
  const message = String(data.message ?? data.error ?? '')
  if (error.response?.status === 409 || isInsufficientStock(data, message)) {
    return new PurchaseError(data.message ?? 'No hay suficientes entradas disponibles.', 'stock')
  }
  return new PurchaseError(data.message ?? 'No se pudo completar la compra.')
}

export async function createPurchase({ concert_id, quantity, user_id }) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const concert = await getConcertById(concert_id)
    const stock = Number(getConcertValue(concert, 'availableStock', 'available_stock', 'stockAvailable', 'stock_available', 'stock') ?? 0)

    if (quantity > stock) {
      throw new PurchaseError('No hay suficientes entradas disponibles para esa cantidad.', 'stock')
    }

    concert.availableStock = stock - quantity
    concert.ticketsSold = Number(getConcertValue(concert, 'ticketsSold', 'tickets_sold', 'soldTickets', 'sold_tickets', 'sold') ?? 0) + quantity
    return { id: `demo-${Date.now()}`, concert_id, quantity, user_id }
  }

  try {
    const { data } = await api.post('/api/purchases', { concert_id, quantity, user_id })
    if (isInsufficientStock(data, String(data?.message ?? data?.error ?? ''))) {
      throw new PurchaseError(data.message ?? 'No hay suficientes entradas disponibles.', 'stock')
    }
    return purchaseFromResponse(data)
  } catch (error) {
    throw normalizePurchaseError(error)
  }
}
