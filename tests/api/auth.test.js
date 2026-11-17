import { beforeEach, describe, expect, it, vi } from 'vitest'

const { api } = vi.hoisted(() => ({ api: { post: vi.fn() } }))
vi.mock('../../src/api/index', () => ({ default: api }))

import { loginWithCredentials } from '../../src/api/auth'

describe('authentication API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_MODE', 'false')
    vi.clearAllMocks()
  })

  it('unwraps regular login tokens and rejects missing tokens', async () => {
    api.post.mockResolvedValueOnce({ data: { access_token: 'token', user: { id: 2 } } })
    await expect(loginWithCredentials({ email: 'ana@example.com' })).resolves.toEqual({ token: 'token', user: { id: 2 } })
    api.post.mockResolvedValueOnce({ data: {} })
    await expect(loginWithCredentials({ email: 'ana@example.com' })).rejects.toThrow('no contiene un token')
  })

  it('builds a demo user name from the email', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true')
    await expect(loginWithCredentials({ email: 'ana.perez@example.com' })).resolves.toMatchObject({
      user: { id: 'demo-user-1', name: 'ana perez' },
    })
  })
})
