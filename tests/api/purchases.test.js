import { beforeEach, describe, expect, it, vi } from 'vitest'

const { api } = vi.hoisted(() => ({ api: { post: vi.fn() } }))
vi.mock('../../src/api/index', () => ({ default: api }))
vi.mock('../../src/api/concerts', () => ({ getConcertById: vi.fn(), getConcertValue: vi.fn() }))

import { createPurchase, PurchaseError } from '../../src/api/purchases'
import { getConcertById, getConcertValue } from '../../src/api/concerts'

describe('purchases API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_MODE', 'false')
    vi.clearAllMocks()
  })

  it('sends purchase data and unwraps the purchase response', async () => {
    const input = { concert_id: 2, quantity: 3, user_id: 8 }
    api.post.mockResolvedValue({ data: { success: true, purchase: { id: 99 } } })
    await expect(createPurchase(input)).resolves.toEqual({ id: 99 })
    expect(api.post).toHaveBeenCalledWith('/api/purchases', input)
  })

  it('normalizes stock conflicts from response data and HTTP status', async () => {
    api.post.mockResolvedValue({ data: { code: 'INSUFFICIENT_STOCK' } })
    await expect(createPurchase({})).rejects.toMatchObject({ type: 'stock' })
    api.post.mockRejectedValue({ response: { status: 409, data: { message: 'Conflicto' } } })
    await expect(createPurchase({})).rejects.toMatchObject({ type: 'stock', message: 'Conflicto' })
  })

  it('surfaces unsuccessful payloads as purchase errors', async () => {
    api.post.mockResolvedValue({ data: { success: false, message: 'Rechazada' } })
    await expect(createPurchase({})).rejects.toBeInstanceOf(PurchaseError)
    await expect(createPurchase({})).rejects.toMatchObject({ type: 'general', message: 'Rechazada' })
  })

  it('updates demo stock and rejects quantities above the available stock', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true')
    const concert = { id: 5 }
    getConcertById.mockResolvedValue(concert)
    getConcertValue.mockImplementation((_concert, ...keys) => keys.includes('availableStock') ? 4 : 6)
    await expect(createPurchase({ concert_id: 5, quantity: 2, user_id: 8 })).resolves.toMatchObject({ quantity: 2 })
    expect(concert).toMatchObject({ availableStock: 2, ticketsSold: 8 })
    await expect(createPurchase({ concert_id: 5, quantity: 5, user_id: 8 })).rejects.toMatchObject({ type: 'stock' })
  })
})
