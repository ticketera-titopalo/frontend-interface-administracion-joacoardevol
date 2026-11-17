import { describe, expect, it } from 'vitest'
import { getAvailableStock, getOccupancy, getSoldTickets } from '../../src/utils/concertMetrics'

describe('concert metrics', () => {
  it('reads sold and available counts across supported field names', () => {
    const concert = { tickets_sold: '12', stock_available: '8' }
    expect(getSoldTickets(concert)).toBe(12)
    expect(getAvailableStock(concert)).toBe(8)
  })

  it('calculates occupancy from sold tickets and capacity', () => {
    expect(getOccupancy({ ticketsSold: 30, capacity: 40 })).toBe(75)
    expect(getOccupancy({ ticketsSold: 0, capacity: 0 })).toBe(0)
  })

  it('uses reported occupancy and clamps it to the valid range', () => {
    expect(getOccupancy({ occupancy_percentage: 140 })).toBe(100)
    expect(getOccupancy({ occupancy: -5 })).toBe(0)
  })
})
