<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function submitLogin() {
  error.value = ''
  submitting.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (loginError) {
    error.value = loginError.response?.data?.message ?? loginError.message ?? 'No se pudo iniciar sesión.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <form class="login-card" @submit.prevent="submitLogin">
      <h1>Iniciar sesión</h1>
      <p>Ingresa a la administración de Ticketera.</p>
      <label for="email">Correo electrónico</label>
      <input id="email" v-model.trim="email" type="email" autocomplete="username" required />
      <label for="password">Contraseña</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required />
      <p v-if="error" class="error-message" role="alert">{{ error }}</p>
      <button type="submit" :disabled="submitting">{{ submitting ? 'Ingresando…' : 'Ingresar' }}</button>
    </form>
  </main>
</template>

<style scoped>
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 2rem; background: #f4f6f8; }
.login-card { display: grid; gap: 0.8rem; width: min(100%, 24rem); padding: 2rem; border-radius: 12px; background: white; box-shadow: 0 8px 28px #172b4d18; }
h1, p { margin: 0; }
.login-card > p:first-of-type { margin-bottom: 0.6rem; color: #5b6472; }
label { font-weight: 600; }
input, button { min-height: 2.75rem; padding: 0.6rem 0.75rem; font: inherit; }
input { border: 1px solid #cbd2dc; border-radius: 6px; }
button { margin-top: 0.5rem; border: 0; border-radius: 6px; color: white; background: #3157a4; cursor: pointer; }
button:disabled { opacity: 0.65; cursor: wait; }
.error-message { color: #b42318; }
</style>
