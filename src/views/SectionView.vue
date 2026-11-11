<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const sampleRows = {
  concerts: [
    { name: 'Noche de Rock', detail: 'Estadio Central · 18 dic 2026', status: 'Publicado' },
    { name: 'Festival de Verano', detail: 'Parque Norte · 10 ene 2027', status: 'Publicado' },
    { name: 'Jazz en Vivo', detail: 'Teatro del Lago · 24 ene 2027', status: 'Borrador' },
  ],
  users: [
    { name: 'Lucía Fernández', detail: 'lucia.fernandez@email.com', status: 'Activo' },
    { name: 'Mateo González', detail: 'mateo.g@email.com', status: 'Activo' },
    { name: 'Sofía Ramírez', detail: 'sofia.r@email.com', status: 'Activo' },
  ],
  tickets: [
    { name: 'TK-1048 · Noche de Rock', detail: 'Lucía Fernández · General', status: 'Pagado' },
    { name: 'TK-1047 · Festival de Verano', detail: 'Mateo González · VIP', status: 'Pagado' },
    { name: 'TK-1046 · Jazz en Vivo', detail: 'Sofía Ramírez · General', status: 'Pendiente' },
  ],
}

const rows = sampleRows[route.name] ?? []
</script>

<template>
  <section class="section-page">
    <p class="eyebrow">GESTIÓN</p>
    <h1>{{ route.meta.title }}</h1>
    <p>{{ route.meta.description }}</p>
    <section class="records-card">
      <div class="records-heading"><strong>{{ route.meta.title }} recientes</strong><span>Datos de demostración</span></div>
      <article v-for="row in rows" :key="row.name" class="record-row">
        <div><strong>{{ row.name }}</strong><span>{{ row.detail }}</span></div>
        <span class="status">{{ row.status }}</span>
      </article>
    </section>
  </section>
</template>

<style scoped>
.section-page { display: grid; gap: 0.65rem; }
.eyebrow { margin: 0; color: #7586cf; font-size: 0.67rem; font-weight: 700; letter-spacing: 0.12em; }
h1 { margin: 0; color: #1d2940; font-size: 1.8rem; }
p { margin: 0; color: #78859a; }
.records-card { margin-top: 1rem; overflow: hidden; border: 1px solid #e7ebf2; border-radius: 10px; background: #fff; }
.records-heading { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid #edf0f5; color: #344158; }
.records-heading span { color: #8b96a8; font-size: 0.72rem; }
.record-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid #f0f2f6; }
.record-row:last-child { border-bottom: 0; }
.record-row div { display: grid; gap: 0.2rem; }
.record-row strong { color: #344158; font-size: 0.85rem; font-weight: 600; }
.record-row div span { color: #8994a6; font-size: 0.76rem; }
.status { padding: 0.25rem 0.55rem; border-radius: 99px; color: #18785f; background: #e6f6ef; font-size: 0.7rem; }
</style>
