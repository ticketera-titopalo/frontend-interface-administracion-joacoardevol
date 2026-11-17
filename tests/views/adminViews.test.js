import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { route, router, auth, apiMocks } = vi.hoisted(() => ({
  route: { params: {}, query: {}, name: 'users', meta: { title: 'Usuarios', description: 'Cuentas', subject: 'los usuarios' } },
  router: { replace: vi.fn() },
  auth: { user: { id: 'user-1', name: 'Eva' }, isAuthenticated: true, login: vi.fn(), updateUser: vi.fn(), logout: vi.fn() },
  apiMocks: {
    getConcerts: vi.fn(), getConcertById: vi.fn(), getMyProfile: vi.fn(), updateMyProfile: vi.fn(),
    changeUserPassword: vi.fn(), createPurchase: vi.fn(), emitPurchaseTickets: vi.fn(), getUserTickets: vi.fn(),
  },
}))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, useRoute: () => route, useRouter: () => router }
})
vi.mock('../../src/store/auth', () => ({ useAuthStore: () => auth }))
vi.mock('../../src/api/concerts', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getConcerts: apiMocks.getConcerts, getConcertById: apiMocks.getConcertById }
})
vi.mock('../../src/api/users', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getMyProfile: apiMocks.getMyProfile, updateMyProfile: apiMocks.updateMyProfile, changeUserPassword: apiMocks.changeUserPassword }
})
vi.mock('../../src/api/purchases', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, createPurchase: apiMocks.createPurchase }
})
vi.mock('../../src/api/tickets', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, emitPurchaseTickets: apiMocks.emitPurchaseTickets, getUserTickets: apiMocks.getUserTickets }
})

import AboutView from '../../src/views/AboutView.vue'
import ChangePasswordView from '../../src/views/ChangePasswordView.vue'
import ConcertDetailView from '../../src/views/ConcertDetailView.vue'
import ConcertsView from '../../src/views/ConcertsView.vue'
import HomeView from '../../src/views/HomeView.vue'
import LoginView from '../../src/views/LoginView.vue'
import ProfileView from '../../src/views/ProfileView.vue'
import PurchaseSuccessView from '../../src/views/PurchaseSuccessView.vue'
import SectionView from '../../src/views/SectionView.vue'
import TicketPurchaseView from '../../src/views/TicketPurchaseView.vue'
import TicketsView from '../../src/views/TicketsView.vue'
import { PurchaseError } from '../../src/api/purchases'

const concertRows = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1, title: `Show ${index + 1}`, artist: index === 5 ? 'Band Six' : 'Band One',
  price: 1000, availableStock: index + 20, ticketsSold: 5, capacity: 10, date: '18 dic 2026', venue: 'Teatro',
}))

function mountView(component) {
  return mount(component, { global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } } })
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.stubEnv('VITE_DEMO_MODE', 'false')
  route.params = { id: '1', concertId: '1', purchaseId: '20' }
  route.query = {}
  route.name = 'users'
  route.meta = { title: 'Usuarios', description: 'Cuentas', subject: 'los usuarios' }
  auth.user = { id: 'user-1', name: 'Eva', email: 'eva@example.com' }
  auth.isAuthenticated = true
  apiMocks.getConcerts.mockResolvedValue(concertRows)
  apiMocks.getConcertById.mockResolvedValue(concertRows[0])
  apiMocks.getMyProfile.mockResolvedValue({ id: 'user-1', name: 'Eva', email: 'eva@example.com', phone: '123', photo: '' })
  apiMocks.updateMyProfile.mockImplementation(async (profile) => ({ id: 'user-1', ...profile }))
  apiMocks.changeUserPassword.mockResolvedValue({ success: true })
  apiMocks.createPurchase.mockResolvedValue({ id: 'purchase-20' })
  apiMocks.emitPurchaseTickets.mockResolvedValue([{ id: 'ticket-1', code: 'TK-1', purchase_id: '20', user_id: 'user-1' }])
  apiMocks.getUserTickets.mockResolvedValue([{ id: 'ticket-1', code: 'TK-1', purchase_id: '20', user_id: 'user-1' }])
  router.replace.mockResolvedValue(undefined)
})

describe('static pages and sections', () => {
  it('renders the dashboard, about page, and route-specific records', () => {
    expect(mountView(HomeView).text()).toContain('Dashboard')
    expect(mountView(AboutView).text()).toContain('about page')
    expect(mountView(SectionView).text()).toContain('Lucía Fernández')
    route.name = 'unknown'
    expect(mountView(SectionView).findAll('.record-row')).toHaveLength(0)
  })

  it('renders quick stats and the welcome content with their required props and slots', async () => {
    const { default: QuickStats } = await import('../../src/components/QuickStats.vue')
    const { default: HelloWorld } = await import('../../src/components/HelloWorld.vue')
    const { default: WelcomeItem } = await import('../../src/components/WelcomeItem.vue')
    const { default: TheWelcome } = await import('../../src/components/TheWelcome.vue')
    expect(mount(QuickStats, { props: { stats: [{ label: 'Eventos', value: 2, icon: 'concerts' }, { label: 'Usuarios', value: 3, icon: 'users' }, { label: 'Tickets', value: 4, icon: 'tickets' }] } }).text()).toContain('Eventos')
    expect(mount(HelloWorld, { props: { msg: 'Hola' } }).text()).toContain('Hola')
    expect(mount(WelcomeItem, { slots: { heading: 'Título', default: 'Contenido' } }).text()).toContain('Contenido')
    expect(mount(TheWelcome).findAll('.item')).toHaveLength(5)
  })
})

describe('concert views', () => {
  it('loads, searches, paginates, and displays an empty search result', async () => {
    const wrapper = mountView(ConcertsView)
    await flushPromises()
    expect(wrapper.findAll('tbody tr')).toHaveLength(5)
    await wrapper.get('[aria-label="Página siguiente"]').trigger('click')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    await wrapper.get('input[type="search"]').setValue('Band Six')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    await wrapper.get('input[type="search"]').setValue('missing')
    expect(wrapper.text()).toContain('No hay conciertos que coincidan')
  })

  it('shows concert data and handles a failed detail request', async () => {
    const wrapper = mountView(ConcertDetailView)
    await flushPromises()
    expect(wrapper.text()).toContain('Show 1')
    expect(wrapper.text()).toContain('50%')
    apiMocks.getConcertById.mockRejectedValueOnce(new Error('Offline'))
    const failed = mountView(ConcertDetailView)
    await flushPromises()
    expect(failed.text()).toContain('Offline')
  })
})

describe('account forms', () => {
  it('validates password confirmation and completes a password change', async () => {
    const wrapper = mountView(ChangePasswordView)
    await wrapper.get('#current-password').setValue('old-password')
    await wrapper.get('#new-password').setValue('short')
    await wrapper.get('#confirm-password').setValue('different')
    expect(wrapper.text()).toContain('Usa al menos 8 caracteres.')
    expect(wrapper.text()).toContain('Las contraseñas no coinciden.')
    await wrapper.get('#new-password').setValue('long-password')
    await wrapper.get('#confirm-password').setValue('long-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(apiMocks.changeUserPassword).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('se cambió correctamente')
  })

  it('reports password API errors and missing confirmation', async () => {
    apiMocks.changeUserPassword.mockRejectedValueOnce(new Error('Servicio caído'))
    const wrapper = mountView(ChangePasswordView)
    await wrapper.get('#current-password').setValue('current')
    await wrapper.get('#new-password').setValue('long-password')
    await wrapper.get('#confirm-password').setValue('long-password')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Servicio caído')
    await wrapper.get('#confirm-password').setValue('')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Confirma la nueva contraseña.')
  })

  it('validates login fields, handles login errors, and follows redirects', async () => {
    const wrapper = mountView(LoginView)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Ingresa tu correo electrónico.')
    await wrapper.get('input[type="email"]').setValue('eva@example.com')
    await wrapper.get('input[type="password"]').setValue('secret-pass')
    auth.login.mockRejectedValueOnce(new Error('Credenciales inválidas'))
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Credenciales inválidas')
    auth.login.mockResolvedValueOnce(undefined)
    route.query.redirect = '/tickets'
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(router.replace).toHaveBeenCalledWith('/tickets')
  })

  it('loads a profile, validates fields, and saves a valid profile', async () => {
    const wrapper = mountView(ProfileView)
    await flushPromises()
    expect(wrapper.get('#name').element.value).toBe('Eva')
    await wrapper.get('#name').setValue('')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('El nombre es obligatorio.')
    await wrapper.get('#name').setValue('Eva Perez')
    await wrapper.get('#photo').setValue('invalid-url')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Ingresa una URL que comience')
    await wrapper.get('#photo').setValue('https://example.com/avatar.png')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(apiMocks.updateMyProfile).toHaveBeenCalledOnce()
    expect(auth.updateUser).toHaveBeenCalled()
    expect(wrapper.text()).toContain('se guardaron correctamente')
  })
})

describe('ticket flows', () => {
  it('validates and completes a ticket purchase', async () => {
    const wrapper = mountView(TicketPurchaseView)
    await flushPromises()
    await wrapper.get('#quantity').setValue('2')
    await wrapper.get('button.primary-button').trigger('click')
    await flushPromises()
    expect(apiMocks.createPurchase).toHaveBeenCalledWith({ concert_id: 1, quantity: 2, user_id: 'user-1' })
    expect(router.replace).toHaveBeenCalledWith(expect.objectContaining({ name: 'purchase-success' }))
  })

  it('shows missing-user and stock-purchase errors', async () => {
    auth.user = null
    const noUser = mountView(TicketPurchaseView)
    await flushPromises()
    await noUser.get('button.primary-button').trigger('click')
    expect(noUser.text()).toContain('No se encontró el usuario de la sesión')
    auth.user = { id: 'user-1' }
    apiMocks.createPurchase.mockRejectedValueOnce(new PurchaseError('Sin stock', 'stock'))
    const stockError = mountView(TicketPurchaseView)
    await flushPromises()
    await stockError.get('button.primary-button').trigger('click')
    await flushPromises()
    expect(stockError.text()).toContain('Actualiza la página')
  })

  it('loads and retries ticket lists', async () => {
    const wrapper = mountView(TicketsView)
    await flushPromises()
    expect(wrapper.text()).toContain('TK-1')
    apiMocks.getUserTickets.mockRejectedValueOnce(new Error('No disponible'))
    const failed = mountView(TicketsView)
    await flushPromises()
    expect(failed.text()).toContain('No disponible')
    apiMocks.getUserTickets.mockResolvedValueOnce([])
    await failed.get('button').trigger('click')
    await flushPromises()
    expect(failed.text()).toContain('Todavía no tienes tickets')
  })

  it('loads a purchase summary, emits tickets, and handles an empty issuance', async () => {
    route.query = { concertId: '1', quantity: '1', emit: '1' }
    const wrapper = mountView(PurchaseSuccessView)
    await flushPromises()
    expect(apiMocks.emitPurchaseTickets).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain('COMPRA CONFIRMADA')
    apiMocks.emitPurchaseTickets.mockResolvedValueOnce([])
    apiMocks.getUserTickets.mockResolvedValueOnce([])
    localStorage.clear()
    route.query = { emit: '1' }
    const empty = mountView(PurchaseSuccessView)
    await flushPromises()
    expect(empty.text()).toContain('todavía no se encontraron tickets')
  })
})
