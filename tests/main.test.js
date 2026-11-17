import { describe, expect, it, vi } from 'vitest'

const { app, createApp, pinia, createPinia } = vi.hoisted(() => {
  const app = { use: vi.fn(), mount: vi.fn() }
  app.use.mockReturnValue(app)
  const pinia = { name: 'pinia' }
  return { app, createApp: vi.fn(() => app), pinia, createPinia: vi.fn(() => pinia) }
})

vi.mock('vue', async (importOriginal) => ({ ...(await importOriginal()), createApp }))
vi.mock('pinia', () => ({ createPinia }))
vi.mock('../src/App.vue', () => ({ default: { name: 'AppStub' } }))
vi.mock('../src/router', () => ({ default: { name: 'RouterStub' } }))

import { createApp as importedCreateApp } from 'vue'
import { createPinia as importedCreatePinia } from 'pinia'

describe('application bootstrap', () => {
  it('installs Pinia and the router before mounting the root app', async () => {
    await import('../src/main.js')
    expect(importedCreateApp).toBe(createApp)
    expect(importedCreatePinia).toBe(createPinia)
    expect(createApp).toHaveBeenCalledOnce()
    expect(createPinia).toHaveBeenCalledOnce()
    expect(app.use).toHaveBeenNthCalledWith(1, pinia)
    expect(app.use).toHaveBeenNthCalledWith(2, { name: 'RouterStub' })
    expect(app.mount).toHaveBeenCalledWith('#app')
  })
})
