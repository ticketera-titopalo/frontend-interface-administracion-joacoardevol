<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const toasts = ref([])
const timers = new Map()
let nextId = 0

function dismiss(id) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
  clearTimeout(timers.get(id))
  timers.delete(id)
}

function addToast(event) {
  const { type = 'info', message = '' } = event.detail ?? {}
  const id = ++nextId
  toasts.value.push({ id, type, message })
  timers.set(id, setTimeout(() => dismiss(id), 5000))
}

onMounted(() => window.addEventListener('ticketera:toast', addToast))
onBeforeUnmount(() => {
  window.removeEventListener('ticketera:toast', addToast)
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-relevant="additions">
    <TransitionGroup name="toast">
      <article v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.type}`" role="status">
        <span class="toast-mark" aria-hidden="true">{{ toast.type === 'error' ? '!' : 'i' }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button type="button" aria-label="Cerrar notificación" @click="dismiss(toast.id)">×</button>
      </article>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-region { position: fixed; right: 1.25rem; bottom: 1.25rem; z-index: 50; display: grid; width: min(25rem, calc(100vw - 2rem)); gap: 0.6rem; }
.toast { display: flex; align-items: center; gap: 0.7rem; padding: 0.8rem 0.9rem; border: 1px solid #e5e9f0; border-radius: 7px; background: #fff; box-shadow: 0 8px 28px #172b4d20; }
.toast-error { border-left: 3px solid #c65050; }.toast-warning { border-left: 3px solid #d39b34; }.toast-info { border-left: 3px solid #526bd0; }
.toast-mark { display: grid; width: 1.25rem; height: 1.25rem; flex: 0 0 auto; place-items: center; border-radius: 50%; color: #a94444; background: #fbeeee; font-size: 0.75rem; font-weight: 700; }.toast-warning .toast-mark { color: #89641e; background: #fff5df; }.toast-info .toast-mark { color: #405ab9; background: #eef1ff; }
.toast-message { flex: 1; color: #3f4b5f; font-size: 0.76rem; line-height: 1.45; }
button { padding: 0; border: 0; color: #8994a6; background: transparent; font-size: 1.1rem; cursor: pointer; }
.toast-enter-active, .toast-leave-active, .toast-move { transition: all 180ms ease; }.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }.toast-leave-active { position: absolute; right: 0; left: 0; }
</style>
