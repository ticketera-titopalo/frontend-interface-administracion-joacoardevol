<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from './store/auth'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.replace('/login')
}
</script>

<template>
  <div v-if="auth.isAuthenticated" class="admin-layout">
    <aside class="sidebar">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">t</span>
        <span>Ticketera<span class="brand-subtitle">ADMINISTRACIÓN</span></span>
      </RouterLink>

      <p class="nav-label">MENÚ PRINCIPAL</p>
      <nav class="side-nav" aria-label="Navegación principal">
        <RouterLink to="/" exact-active-class="active"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="13" width="7" height="8" rx="1.5"/></svg>Dashboard</RouterLink>
        <RouterLink to="/concerts" active-class="active"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>Conciertos</RouterLink>
        <RouterLink to="/users" active-class="active"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 4.5a4 4 0 0 1 0 7.5m2 3a5 5 0 0 1 3 4.5V21"/></svg>Usuarios</RouterLink>
        <RouterLink to="/tickets" active-class="active"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6a2 2 0 0 0 0 4v4a2 2 0 0 0 0 4h16a2 2 0 0 0 0-4v-4a2 2 0 0 0 0-4Z"/><path d="M13 6v2m0 4v2m0 4v2"/></svg>Tickets</RouterLink>
      </nav>

      <button class="logout-button" type="button" @click="logout"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>Cerrar sesión</button>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <div class="topbar-context"><span class="context-label">ESPACIO DE TRABAJO</span><strong>Panel de administración</strong></div>
        <details class="user-menu">
          <summary class="account">
            <img v-if="auth.user?.photo || auth.user?.avatar || auth.user?.avatar_url || auth.user?.profile_image" class="avatar user-photo" :src="auth.user.photo ?? auth.user.avatar ?? auth.user.avatar_url ?? auth.user.profile_image" alt="Foto de perfil" />
            <span v-else class="avatar">{{ (auth.user?.name ?? auth.user?.email ?? 'A').charAt(0).toUpperCase() }}</span>
            <span class="account-name">{{ auth.user?.name ?? 'Administrador' }}<small>Mi cuenta</small></span>
            <span class="menu-chevron" aria-hidden="true">⌄</span>
          </summary>
          <nav class="user-dropdown" aria-label="Menú de usuario">
            <RouterLink to="/perfil">Mi perfil</RouterLink>
            <RouterLink to="/cambiar-password">Cambiar contraseña</RouterLink>
          </nav>
        </details>
      </header>
      <main class="page-content"><RouterView /></main>
    </div>
  </div>
  <RouterView v-else />
</template>

<style>
:root { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #172033; background: #f6f8fb; font-synthesis: none; text-rendering: optimizeLegibility; -webkit-font-smoothing: antialiased; }
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
button, a { font: inherit; }
.admin-layout { min-height: 100vh; display: flex; background: #f6f8fb; }
.sidebar { position: fixed; inset: 0 auto 0 0; z-index: 2; display: flex; flex-direction: column; width: 252px; padding: 1.65rem 1rem 1rem; color: #cad3e2; background: #17243b; }
.brand { display: flex; align-items: center; gap: 0.8rem; padding: 0.2rem 0.75rem 2.6rem; color: #fff; font-size: 1.08rem; font-weight: 650; letter-spacing: -0.02em; text-decoration: none; }
.brand-mark { display: grid; width: 2.3rem; height: 2.3rem; place-items: center; border-radius: 8px; color: #fff; background: #5572e8; font-family: Georgia, serif; font-size: 1.65rem; font-weight: 700; line-height: 1; }
.brand-subtitle { display: block; margin-top: 0.18rem; color: #8e9db5; font-size: 0.56rem; font-weight: 600; letter-spacing: 0.14em; }
.nav-label { margin: 0 0 0.65rem; padding: 0 0.75rem; color: #8190a8; font-size: 0.63rem; font-weight: 700; letter-spacing: 0.11em; }
.side-nav { display: grid; gap: 0.25rem; }
.side-nav a, .logout-button { display: flex; align-items: center; gap: 0.8rem; min-height: 2.65rem; padding: 0 0.8rem; border: 0; border-radius: 6px; color: #b5c0d2; background: transparent; text-align: left; text-decoration: none; font-size: 0.84rem; transition: color 140ms ease, background 140ms ease; cursor: pointer; }
.side-nav svg, .logout-button svg { width: 1.1rem; height: 1.1rem; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.side-nav a:hover, .side-nav a.active { color: #fff; background: #263653; }
.side-nav a.active { box-shadow: inset 2px 0 #8396ff; }
.side-nav a.active svg { color: #9eacff; }
.logout-button { margin-top: auto; }
.logout-button:hover { color: white; background: #263653; }
.workspace { width: calc(100% - 252px); min-height: 100vh; margin-left: 252px; }
.topbar { display: flex; height: 70px; align-items: center; justify-content: space-between; padding: 0 2.65rem; border-bottom: 1px solid #e9edf3; background: #fff; }
.topbar-context { display: grid; gap: 0.08rem; }
.context-label { color: #8b96a8; font-size: 0.59rem; font-weight: 700; letter-spacing: 0.12em; }
.topbar-context strong { color: #344158; font-size: 0.78rem; font-weight: 600; }
.account { display: flex; align-items: center; gap: 0.65rem; color: #344158; }
.avatar { display: grid; width: 2.2rem; height: 2.2rem; place-items: center; border: 2px solid #edf0ff; border-radius: 50%; color: #455fcb; background: #e9edff; font-size: 0.78rem; font-weight: 700; }
.account-name { display: grid; gap: 0.1rem; font-size: 0.76rem; font-weight: 600; }
.account-name small { color: #909bad; font-size: 0.65rem; font-weight: 400; }
.user-menu { position: relative; }
.user-menu summary { list-style: none; cursor: pointer; }
.user-menu summary::-webkit-details-marker { display: none; }
.user-menu summary:focus-visible { outline: 2px solid #7387dc; outline-offset: 4px; border-radius: 4px; }
.user-photo { object-fit: cover; }
.menu-chevron { margin-left: 0.1rem; color: #8994a6; font-size: 0.9rem; }
.user-dropdown { position: absolute; top: calc(100% + 0.65rem); right: 0; z-index: 5; display: grid; min-width: 190px; padding: 0.35rem; border: 1px solid #e5e9f0; border-radius: 7px; background: white; box-shadow: 0 10px 30px #1827431c; }
.user-dropdown a { padding: 0.65rem 0.7rem; border-radius: 4px; color: #475469; font-size: 0.76rem; text-decoration: none; }
.user-dropdown a:hover, .user-dropdown a.router-link-active { color: #425fca; background: #f1f3fc; }
.page-content { max-width: 1500px; margin: 0 auto; padding: 2.3rem 2.65rem; }
@media (max-width: 760px) { .sidebar { width: 68px; align-items: center; padding: 1.2rem 0.45rem 0.8rem; } .brand { padding: 0 0 2rem; } .brand > span:last-child, .nav-label, .side-nav a { font-size: 0; } .side-nav { width: 100%; } .side-nav a, .logout-button { justify-content: center; width: 100%; padding: 0; font-size: 0; } .side-nav svg, .logout-button svg { width: 1.2rem; height: 1.2rem; } .workspace { width: calc(100% - 68px); margin-left: 68px; } .topbar { height: 62px; padding: 0 1rem; } .page-content { padding: 1.5rem 1rem; } }
</style>
