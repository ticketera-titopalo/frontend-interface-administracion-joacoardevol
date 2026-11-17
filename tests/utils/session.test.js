import { describe, expect, it } from 'vitest'
import { getSessionUserId } from '../../src/utils/session'

describe('getSessionUserId', () => {
  it('prefers the current id and supports legacy ids', () => {
    expect(getSessionUserId({ id: 7, _id: 'legacy' })).toBe(7)
    expect(getSessionUserId({ _id: 'legacy' })).toBe('legacy')
  })

  it('uses the demo identity only when demo mode is enabled', () => {
    expect(getSessionUserId(null)).toBeNull()
    expect(getSessionUserId(null, true)).toBe('demo-user-1')
  })
})
