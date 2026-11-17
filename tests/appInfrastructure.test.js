import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const { loginWithCredentials } = vi.hoisted(() => ({ loginWithCredentials: vi.fn() }))
vi.mock('../src/api/auth', () => ({ loginWithCredentials }))

import App from '../src/App.vue'
import ToastContainer from '../src/components/ToastContainer.vue'
import router from '../src/router'
import { useAuthStore } from '../src/store/auth'
import { useCounterStore } from '../src/store/counter'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  setActivePinia(createPinia())
})

describe('Pinia stores and route protection', () => {
  it('persists login, merges profile updates, and clears a session on logout', async () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    loginWithCredentials.mockResolvedValue({ token: 'token-1', user: { id: 1, name: 'Eva' } })
    await auth.login({ email: 'eva@example.com', password: 'secret' })
    expect(auth.isAuthenticated).toBe(true)
    expect(JSON.parse(localStorage.getItem('ticketera_user'))).toMatchObject({ id: 1 })
    auth.updateUser({ phone: '123' })
    expect(auth.user).toMatchObject({ name: 'Eva', phone: '123' })
    auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('ticketera_user')).toBeNull()
  })

  it('handles malformed stored user data and increments the counter', () => {
    localStorage.setItem('ticketera_user', '{bad json')
    const auth = useAuthStore()
    expect(auth.user).toBeNull()
    const counter = useCounterStore()
    counter.increment()
    expect(counter.doubleCount).toBe(2)
  })

  it('redirects unauthenticated users and keeps authenticated guests out of login', async () => {
    const auth = useAuthStore()
    auth.logout()
    await router.push('/tickets')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/tickets')
    auth.token = 'active-token'
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('home')
    await router.push('/not-found')
    expect(router.currentRoute.value.name).toBeUndefined()
  })
})

describe('root app and notifications', () => {
  it('renders navigation for signed-in users and handles logout and expired sessions', async () => {
    const auth = useAuthStore()
    auth.token = 'active-token'
    auth.user = { id: 1, name: 'Eva', photo: 'https://example.com/eva.png' }
    await router.push('/')
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.find('img.user-photo').exists()).toBe(true)
    window.dispatchEvent(new Event('ticketera:session-expired'))
    await flushPromises()
    expect(auth.isAuthenticated).toBe(false)
    expect(router.currentRoute.value.name).toBe('login')
    wrapper.unmount()
  })

  it('renders public content while signed out and displays/dismisses toast events', async () => {
    const wrapper = mount(App, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.find('.sidebar').exists()).toBe(false)
    const toast = mount(ToastContainer)
    window.dispatchEvent(new CustomEvent('ticketera:toast', { detail: { type: 'error', message: 'Falló' } }))
    await flushPromises()
    expect(toast.text()).toContain('Falló')
    await toast.get('button').trigger('click')
    expect(toast.find('.toast').exists()).toBe(false)
    toast.unmount()
    wrapper.unmount()
  })
})
