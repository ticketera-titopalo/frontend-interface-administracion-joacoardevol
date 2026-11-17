import { beforeEach, describe, expect, it, vi } from 'vitest'

const { api } = vi.hoisted(() => ({ api: { get: vi.fn() } }))
vi.mock('../../src/api/index', () => ({ default: api }))

import { getConcertById, getConcerts } from '../../src/api/concerts'

describe('concerts API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_MODE', 'false')
    vi.clearAllMocks()
  })

  it('unwraps list and detail responses', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { items: [{ id: 1 }] } } })
    await expect(getConcerts()).resolves.toEqual([{ id: 1 }])
    api.get.mockResolvedValueOnce({ data: { concert: { id: 2 } } })
    await expect(getConcertById('a/b')).resolves.toEqual({ id: 2 })
    expect(api.get).toHaveBeenLastCalledWith('/api/concerts/a%2Fb')
  })

  it('serves demo concerts and reports unknown ids', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true')
    const concerts = await getConcerts()
    expect(concerts.length).toBeGreaterThan(0)
    await expect(getConcertById(1)).resolves.toMatchObject({ id: 1 })
    await expect(getConcertById('missing')).rejects.toThrow('No se encontró el concierto solicitado.')
  })
})
