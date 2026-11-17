<script setup>
import { computed, ref } from 'vue'
import { errorMessage } from '../utils/apiResponse'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)
const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'
const emailTouched = ref(false)
const passwordTouched = ref(false)

function validateEmail(value) {
  if (!emailTouched.value) return ''
  if (!value) return 'Ingresa tu correo electrónico.'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Ingresa un correo electrónico válido.'
}

const emailError = computed(() => {
  return validateEmail(email.value)
})
const passwordError = computed(() => passwordTouched.value && !password.value ? 'Ingresa tu contraseña.' : '')
const canSubmit = computed(() => Boolean(email.value && password.value && !emailError.value))

async function submitLogin() {
  error.value = ''
  emailTouched.value = true
  passwordTouched.value = true
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect)
  } catch (loginError) {
    error.value = errorMessage(loginError, 'No se pudo iniciar sesión.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <form class="login-card" @submit.prevent="submitLogin">
      <div class="login-brand"><span>t</span> Ticketera</div>
      <p class="login-caption">PLATAFORMA DE GESTIÓN</p>
      <h1>Te damos la bienvenida</h1>
      <p class="login-intro">Inicia sesión para continuar al panel de administración.</p>
      <p v-if="route.query.expired" class="session-notice" role="status">Tu sesión expiró. Ingresa nuevamente para continuar.</p>
      <p v-if="demoMode" class="demo-notice">Modo demo: puedes usar cualquier correo y contraseña.</p>
      <label for="email">Correo electrónico</label>
      <input id="email" v-model.trim="email" type="email" autocomplete="username" required :aria-invalid="Boolean(emailError)" @input="emailTouched = true" @blur="emailTouched = true" />
      <span v-if="emailError" class="field-error">{{ emailError }}</span>
      <label for="password">Contraseña</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required :aria-invalid="Boolean(passwordError)" @input="passwordTouched = true" @blur="passwordTouched = true" />
      <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
      <p v-if="error" class="error-message" role="alert">{{ error }}</p>
      <button type="submit" :disabled="submitting || !canSubmit">{{ submitting ? 'Ingresando…' : 'Ingresar' }}</button>
    </form>
  </main>
</template>

<style scoped src="./LoginView.css"></style>
