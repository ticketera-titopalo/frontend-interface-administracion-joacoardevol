import api from './index'
import { getConcertById, getConcertValue } from './concerts'
import { firstValue } from '../utils/apiResponse'

export class PurchaseError extends Error {
  constructor(message, type = 'general') {
    super(message)
    this.name = 'PurchaseError'
    this.type = type
  }
}

function isInsufficientStock(data = {}, message = '') {
  const stockMessage = /insufficient stock|stock insuficiente|not enough stock/i.test(message)
  return hasStockFlag(data) || hasStockCode(data) || stockMessage
}

function hasStockFlag(data) {
  return Boolean(data.stock_insufficient)
}

function hasStockCode(data) {
  return data.code === 'INSUFFICIENT_STOCK'
}

function purchaseFromResponse(data) {
  if (firstValue(data, ['success']) === false) throw new PurchaseError(firstValue(data, ['message'], 'No se pudo completar la compra.'))
  return firstValue(data, ['purchase', 'data'], data)
}

function normalizePurchaseError(error) {
  if (error instanceof PurchaseError) return error
  const data = firstValue(error, ['response.data'], {})
  const message = String(firstValue(data, ['message', 'error'], ''))
  const conflict = firstValue(error, ['response.status']) === 409
  if (isStockConflict(conflict, data, message)) return new PurchaseError(message || 'No hay suficientes entradas disponibles.', 'stock')
  return new PurchaseError(message || 'No se pudo completar la compra.')
}

function isStockConflict(conflict, data, message) {
  return conflict || isInsufficientStock(data, message)
}

async function createDemoPurchase({ concert_id, quantity, user_id }) {
  const concert = await getConcertById(concert_id)
  applyDemoSale(concert, quantity)
  return { id: `demo-${Date.now()}`, concert_id, quantity, user_id }
}

function applyDemoSale(concert, quantity) {
  const stock = getConcertStock(concert)
  ensureDemoStock(stock, quantity)
  concert.availableStock = stock - quantity
  concert.ticketsSold = getSoldCount(concert) + quantity
}

function getConcertStock(concert) {
  return Number(getConcertValue(concert, 'availableStock', 'available_stock', 'stockAvailable', 'stock_available', 'stock') ?? 0)
}

function getSoldCount(concert) {
  return Number(getConcertValue(concert, 'ticketsSold', 'tickets_sold', 'soldTickets', 'sold_tickets', 'sold') ?? 0)
}

function ensureDemoStock(stock, quantity) {
  if (quantity <= stock) return
  throw new PurchaseError('No hay suficientes entradas disponibles para esa cantidad.', 'stock')
}

async function createRemotePurchase(input) {
  try {
    const { data } = await api.post('/api/purchases', input)
    const message = firstValue(data, ['message', 'error'], '')
    if (isInsufficientStock(data, String(message))) throw new PurchaseError(message || 'No hay suficientes entradas disponibles.', 'stock')
    return purchaseFromResponse(data)
  } catch (error) {
    throw normalizePurchaseError(error)
  }
}

export function createPurchase(input) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return createDemoPurchase(input)
  return createRemotePurchase(input)
}
