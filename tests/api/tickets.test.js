import { beforeEach, describe, expect, it, vi } from 'vitest'

const { api } = vi.hoisted(() => ({ api: { get: vi.fn(), post: vi.fn() } }))
vi.mock('../../src/api/index', () => ({ default: api }))

import { getUserTickets, isTicketUsed, selectPurchaseTickets } from '../../src/api/tickets'

describe('tickets API and helpers', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_MODE', 'false')
    vi.clearAllMocks()
  })

  it('unwraps supported ticket response shapes', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { tickets: [{ id: 1 }] } } })
    await expect(getUserTickets('u/1')).resolves.toEqual([{ id: 1 }])
    expect(api.get).toHaveBeenCalledWith('/api/tickets/usuario/u%2F1')
  })

  it('accepts a single ticket response and returns empty for unknown payloads', async () => {
    api.get.mockResolvedValueOnce({ data: { ticket: { code: 'TK-1' } } })
    await expect(getUserTickets('u1')).resolves.toEqual([{ code: 'TK-1' }])
    api.get.mockResolvedValueOnce({ data: { message: 'Sin tickets' } })
    await expect(getUserTickets('u1')).resolves.toEqual([])
  })

  it('recognizes boolean and localized used states', () => {
    expect(isTicketUsed({ used: 'true' })).toBe(true)
    expect(isTicketUsed({ status: 'utilizado' })).toBe(true)
    expect(isTicketUsed({ used: false, status: 'valid' })).toBe(false)
  })

  it('prefers tickets for the purchase, then emitted tickets, then all user tickets', () => {
    const all = [{ id: 1, purchase_id: 10 }, { id: 2, purchase_id: 11 }]
    expect(selectPurchaseTickets(all, [{ id: 3 }], 10)).toEqual([all[0]])
    expect(selectPurchaseTickets(all, [{ id: 3 }], 12)).toEqual([{ id: 3 }])
    expect(selectPurchaseTickets(all, [], 12)).toBe(all)
  })
})
