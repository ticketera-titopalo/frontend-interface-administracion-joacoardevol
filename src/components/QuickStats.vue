<script setup>
defineProps({
  stats: { type: Array, required: true },
})
</script>

<template>
  <section class="stats-grid" aria-label="Estadísticas principales">
    <article v-for="stat in stats" :key="stat.label" class="stat-card">
      <div class="stat-topline">
        <span class="stat-icon" :class="`tone-${stat.tone}`" aria-hidden="true">
          <svg v-if="stat.icon === 'concerts'" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <svg v-else-if="stat.icon === 'users'" viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><path d="M3 21v-2a6 6 0 0 1 12 0v2m1-13a4 4 0 0 1 3 6m0 3a5 5 0 0 1 2 4"/></svg>
          <svg v-else viewBox="0 0 24 24"><path d="M4 6a2 2 0 0 0 0 4v4a2 2 0 0 0 0 4h16a2 2 0 0 0 0-4v-4a2 2 0 0 0 0-4Z"/><path d="M13 6v2m0 4v2m0 4v2"/></svg>
        </span>
        <span class="stat-period">{{ stat.period }}</span>
      </div>
      <p class="stat-label">{{ stat.label }}</p>
      <p class="stat-value">{{ stat.value }}</p>
      <p class="stat-note">{{ stat.note }}</p>
    </article>
  </section>
</template>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.stat-card { min-height: 163px; padding: 1.2rem 1.3rem; border: 1px solid #e7ebf2; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px #1c2b4508; }
.stat-topline { display: flex; align-items: center; justify-content: space-between; }
.stat-icon { display: grid; width: 2.3rem; height: 2.3rem; place-items: center; border-radius: 7px; }
.stat-icon svg { width: 1.15rem; height: 1.15rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.tone-indigo { color: #5369d4; background: #eef1ff; }
.tone-teal { color: #168878; background: #e8f6f2; }
.tone-amber { color: #ba791a; background: #fff5e5; }
.stat-period { color: #8b96a8; font-size: 0.7rem; }
.stat-label { margin: 1rem 0 0.1rem; color: #7a879b; font-size: 0.82rem; }
.stat-value { margin: 0; color: #1d2940; font-size: 1.8rem; font-weight: 650; letter-spacing: -0.045em; }
.stat-note { margin: 0.15rem 0 0; color: #8994a6; font-size: 0.72rem; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: 1fr; } }
</style>
