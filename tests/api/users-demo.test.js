import { describe, expect, it, vi } from 'vitest'

const { api } = vi.hoisted(() => ({ api: { get: vi.fn(), put: vi.fn(), post: vi.fn() } }))
vi.mock('../../src/api/index', () => ({ default: api }))

describe('demo users API', () => {
  it('provides defaults, persists profile updates, and accepts password changes', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true')
    vi.resetModules()
    const { getMyProfile, updateMyProfile, changeUserPassword } = await import('../../src/api/users')
    await expect(getMyProfile({ id: null, name: 'Eva' })).resolves.toMatchObject({ id: 'demo-user-1', name: 'Eva' })
    await expect(updateMyProfile({ name: 'Eva', phone: '123' })).resolves.toMatchObject({ name: 'Eva', phone: '123' })
    await expect(changeUserPassword({ current_password: 'old', new_password: 'new' })).resolves.toEqual({ success: true })
    expect(api.post).not.toHaveBeenCalled()
  })
})
