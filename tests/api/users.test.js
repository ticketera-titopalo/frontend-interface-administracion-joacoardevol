import { beforeEach, describe, expect, it, vi } from 'vitest'

const { api } = vi.hoisted(() => ({ api: { get: vi.fn(), put: vi.fn(), post: vi.fn() } }))
vi.mock('../../src/api/index', () => ({ default: api }))

import { changeUserPassword, getMyProfile, updateMyProfile } from '../../src/api/users'

describe('users API', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_DEMO_MODE', 'false')
    vi.clearAllMocks()
  })

  it('unwraps the current profile response', async () => {
    api.get.mockResolvedValue({ data: { user: { id: 4, name: 'Ana' } } })
    await expect(getMyProfile()).resolves.toEqual({ id: 4, name: 'Ana' })
    expect(api.get).toHaveBeenCalledWith('/api/users/me')
  })

  it('updates profile data and submits password changes', async () => {
    const profile = { name: 'Ana' }
    api.put.mockResolvedValue({ data: { data: { id: 4, ...profile } } })
    await expect(updateMyProfile(profile)).resolves.toEqual({ id: 4, name: 'Ana' })
    api.post.mockResolvedValue({ data: { success: true } })
    await expect(changeUserPassword({ current_password: 'old', new_password: 'new-password' })).resolves.toEqual({ success: true })
  })
})
