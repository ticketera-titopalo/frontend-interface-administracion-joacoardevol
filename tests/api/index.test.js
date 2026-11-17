import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requestUse, responseUse, create, api } = vi.hoisted(() => {
  const requestUse = vi.fn()
  const responseUse = vi.fn()
  const create = vi.fn(() => api)
  const api = { interceptors: { request: { use: requestUse }, response: { use: responseUse } } }
  return { requestUse, responseUse, create, api }
})
vi.mock('axios', () => ({ default: { create } }))

import client from '../../src/api/index'
const requestHandler = requestUse.mock.calls[0][0]
const [successHandler, rejectHandler] = responseUse.mock.calls[0]

describe('configured HTTP client', () => {
  const dispatchEvent = vi.fn()
  const storage = { getItem: vi.fn(() => null) }

  beforeEach(() => {
    vi.stubGlobal('window', { dispatchEvent })
    vi.stubGlobal('CustomEvent', class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail } })
    vi.stubGlobal('localStorage', storage)
    dispatchEvent.mockClear()
    storage.getItem.mockReset().mockReturnValue(null)
  })

  it('creates the Axios client and attaches a saved bearer token', () => {
    expect(client).toBe(api)
    expect(client).toBe(api)
    storage.getItem.mockReturnValueOnce('abc')
    const config = { headers: {} }
    expect(requestHandler(config)).toEqual({ headers: { Authorization: 'Bearer abc' } })
    expect(requestHandler({ headers: {} })).toEqual({ headers: {} })
  })

  it('emits session-expired events for 401 and connection messages for network failures', async () => {
    storage.getItem.mockReturnValue('abc')
    const unauthorized = { response: { status: 401, data: { message: 'Expiró' } } }
    await expect(rejectHandler(unauthorized)).rejects.toBe(unauthorized)
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'ticketera:session-expired' }))
    dispatchEvent.mockClear()
    const networkError = new Error('offline')
    await expect(rejectHandler(networkError)).rejects.toBe(networkError)
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'ticketera:toast' }))
  })

  it('passes successful responses and reports server failures', async () => {
    const response = { data: [] }
    expect(successHandler(response)).toBe(response)
    const forbidden = { response: { status: 403, data: { error: 'Denied' } } }
    await expect(rejectHandler(forbidden)).rejects.toBe(forbidden)
    expect(dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'ticketera:toast' }))
  })
})
