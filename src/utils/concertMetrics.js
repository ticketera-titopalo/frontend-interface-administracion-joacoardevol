import { getConcertValue } from '../api/concerts'

const SOLD_KEYS = ['ticketsSold', 'tickets_sold', 'soldTickets', 'sold_tickets', 'sold']
const STOCK_KEYS = ['availableStock', 'available_stock', 'stockAvailable', 'stock_available', 'stock']

function boundedPercentage(value) {
  return Math.max(0, Math.min(100, value))
}

export function getSoldTickets(concert) {
  return Number(getConcertValue(concert, ...SOLD_KEYS) ?? 0)
}

export function getAvailableStock(concert) {
  return Number(getConcertValue(concert, ...STOCK_KEYS) ?? 0)
}

export function getOccupancy(concert) {
  const reported = getConcertValue(concert, 'occupancyPercentage', 'occupancy_percentage', 'occupancy')
  if (reported !== null) return boundedPercentage(Number(reported))

  const sold = getSoldTickets(concert)
  const stock = getAvailableStock(concert)
  const capacity = Number(getConcertValue(concert, 'capacity', 'totalStock', 'total_stock') ?? sold + stock)
  if (capacity <= 0) return 0
  return boundedPercentage(Math.round((sold / capacity) * 100))
}
