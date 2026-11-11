<script setup>
import QuickStats from '../components/QuickStats.vue'

const stats = [
  { label: 'Conciertos activos', value: '24', note: 'Eventos publicados', period: 'En la plataforma', icon: 'concerts', tone: 'indigo' },
  { label: 'Usuarios registrados', value: '1.248', note: 'Cuentas en la plataforma', period: 'Total de usuarios', icon: 'users', tone: 'teal' },
  { label: 'Tickets vendidos', value: '3.842', note: 'Ventas acumuladas', period: 'Total de ventas', icon: 'tickets', tone: 'amber' },
]

const recentSales = [
  { id: 'TK-1048', event: 'Noche de Rock', customer: 'Lucía Fernández', type: 'General', amount: '$ 18.500', initials: 'LF', color: 'violet' },
  { id: 'TK-1047', event: 'Festival de Verano', customer: 'Mateo González', type: 'VIP', amount: '$ 42.000', initials: 'MG', color: 'blue' },
  { id: 'TK-1046', event: 'Jazz en Vivo', customer: 'Sofía Ramírez', type: 'General', amount: '$ 15.000', initials: 'SR', color: 'rose' },
]
</script>

<template>
  <section class="dashboard">
    <div class="page-heading">
      <div>
        <p class="eyebrow">RESUMEN GENERAL</p>
        <h1>Dashboard</h1>
        <p class="subtitle">Bienvenido al panel de administración de Ticketera.</p>
      </div>
      <span class="demo-badge"><span></span> Entorno de demostración</span>
    </div>

    <QuickStats :stats="stats" />

    <section class="content-card">
      <div class="section-heading">
        <div><h2>Ventas recientes</h2><p>Últimos tickets registrados en la plataforma</p></div>
        <RouterLink to="/tickets">Ver todos <span aria-hidden="true">→</span></RouterLink>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>CLIENTE</th><th>EVENTO</th><th>TIPO</th><th>IMPORTE</th><th>ESTADO</th></tr></thead>
          <tbody>
            <tr v-for="sale in recentSales" :key="sale.id">
              <td><div class="customer"><span class="customer-avatar" :class="sale.color">{{ sale.initials }}</span><span><strong>{{ sale.customer }}</strong><small>{{ sale.id }}</small></span></div></td>
              <td>{{ sale.event }}</td><td>{{ sale.type }}</td><td class="amount">{{ sale.amount }}</td><td><span class="paid-status"><i></i>Pagado</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>

<style scoped>
.dashboard { display: grid; gap: 1.55rem; }
.page-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 0.1rem; }
.eyebrow { margin: 0 0 0.35rem; color: #6379d4; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.11em; }
h1 { margin: 0; color: #1e293b; font-size: 1.75rem; font-weight: 650; letter-spacing: -0.045em; }
.subtitle { margin: 0.35rem 0 0; color: #7b8798; font-size: 0.85rem; }
.demo-badge { display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.4rem 0.65rem; border: 1px solid #f0dfb7; border-radius: 5px; color: #806327; background: #fffaf0; font-size: 0.68rem; font-weight: 600; }
.demo-badge span { width: 0.4rem; height: 0.4rem; border-radius: 50%; background: #d4a43e; }
.content-card { overflow: hidden; border: 1px solid #e7ebf2; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px #1c2b4508; }
.section-heading { display: flex; align-items: center; justify-content: space-between; padding: 1.15rem 1.3rem; }
.section-heading h2 { margin: 0; color: #28354b; font-size: 0.9rem; font-weight: 650; }
.section-heading p { margin: 0.25rem 0 0; color: #8a95a6; font-size: 0.73rem; }
.section-heading a { color: #4d65c9; font-size: 0.75rem; font-weight: 600; text-decoration: none; }
.section-heading a:hover { color: #334da9; }
.section-heading a span { margin-left: 0.2rem; font-size: 1rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; white-space: nowrap; }
th { padding: 0.7rem 1.3rem; border-top: 1px solid #edf0f4; border-bottom: 1px solid #edf0f4; color: #8a95a6; background: #fafbfd; font-size: 0.61rem; font-weight: 700; letter-spacing: 0.06em; }
td { padding: 0.8rem 1.3rem; border-bottom: 1px solid #f0f2f6; color: #596579; font-size: 0.75rem; }
tbody tr:last-child td { border-bottom: 0; }
.customer { display: flex; align-items: center; gap: 0.65rem; }
.customer-avatar { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 50%; font-size: 0.62rem; font-weight: 700; }
.violet { color: #6852ae; background: #f0ebfb; }.blue { color: #4167a5; background: #eaf1fb; }.rose { color: #a45c6f; background: #faedf0; }
.customer span:last-child { display: grid; gap: 0.15rem; }
.customer strong { color: #344158; font-size: 0.73rem; font-weight: 600; }
.customer small { color: #9aa4b3; font-size: 0.65rem; }
.amount { color: #344158; font-weight: 600; }
.paid-status { display: inline-flex; align-items: center; gap: 0.35rem; color: #268267; font-size: 0.7rem; }
.paid-status i { width: 0.36rem; height: 0.36rem; border-radius: 50%; background: #42ad8b; }
@media (max-width: 600px) { .page-heading { align-items: start; flex-direction: column; } .demo-badge { order: -1; } }
</style>
