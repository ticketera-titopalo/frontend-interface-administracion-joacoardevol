import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../store/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/concerts',
      name: 'concerts',
      component: () => import('../views/ConcertsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/concerts/:id',
      name: 'concert-detail',
      component: () => import('../views/ConcertDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/SectionView.vue'),
      meta: { requiresAuth: true, title: 'Usuarios', description: 'Consulta las cuentas registradas.', subject: 'los usuarios' },
    },
    {
      path: '/tickets/purchase/:concertId',
      name: 'ticket-purchase',
      component: () => import('../views/TicketPurchaseView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: () => import('../views/SectionView.vue'),
      meta: { requiresAuth: true, title: 'Tickets', description: 'Revisa las ventas de tickets.', subject: 'los tickets' },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'home' }
})

export default router
