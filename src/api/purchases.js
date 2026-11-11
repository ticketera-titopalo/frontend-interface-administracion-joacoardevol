import api from './index'
import { getConcertById, getConcertValue } from './concerts'

export class PurchaseError extends Error {
  constructor(message, type = 'general') {
    super(message)
    this.name = 'PurchaseError'
    this.type = type
  }
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
    const responseMessage = String(data?.message ?? data?.error ?? '')
    if (data?.stock_insufficient || data?.code === 'INSUFFICIENT_STOCK' || /insufficient stock|stock insuficiente|not enough stock/i.test(responseMessage)) {
      throw new PurchaseError(data.message ?? 'No hay suficientes entradas disponibles.', 'stock')
    }
    if (data?.success === false) throw new PurchaseError(data.message ?? 'No se pudo completar la compra.')
    return data?.purchase ?? data?.data ?? data
  } catch (error) {
    if (error instanceof PurchaseError) throw error
    const responseMessage = String(error.response?.data?.message ?? error.response?.data?.error ?? '')
    if (error.response?.status === 409 || error.response?.data?.code === 'INSUFFICIENT_STOCK' || /insufficient stock|stock insuficiente|not enough stock/i.test(responseMessage)) {
      throw new PurchaseError(error.response?.data?.message ?? 'No hay suficientes entradas disponibles.', 'stock')
    }
    throw new PurchaseError(error.response?.data?.message ?? 'No se pudo completar la compra.')
  }
}
