import { beforeEach, describe, expect, it, vi } from 'vitest'

const { api } = vi.hoisted(() => ({ api: { get: vi.fn(), post: vi.fn() } }))
vi.mock('../../src/api/index', () => ({ default: api }))

import { emitPurchaseTickets, getUserTickets } from '../../src/api/tickets'

describe('demo tickets storage', () => {
  let storage

  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_MODE', 'true')
    storage = { value: null, getItem: vi.fn(() => storage.value), setItem: vi.fn((_key, value) => { storage.value = value }) }
    vi.stubGlobal('localStorage', storage)
    vi.clearAllMocks()
  })

  it('filters saved tickets by user and emits generated tickets', async () => {
    storage.value = JSON.stringify([{ id: 1, user_id: 'u1' }, { id: 2, user_id: 'u2' }])
    await expect(getUserTickets('u1')).resolves.toEqual([{ id: 1, user_id: 'u1' }])
    const emitted = await emitPurchaseTickets('p1', 2, 'u1')
    expect(emitted).toHaveLength(2)
    expect(emitted[0]).toMatchObject({ purchase_id: 'p1', user_id: 'u1', used: false })
    expect(storage.setItem).toHaveBeenCalledOnce()
    expect(JSON.parse(storage.value)).toHaveLength(4)
  })
})
