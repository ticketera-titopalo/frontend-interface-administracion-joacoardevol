<script setup>
import { computed, ref } from 'vue'
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
    error.value = loginError.response?.data?.message ?? loginError.message ?? 'No se pudo iniciar sesión.'
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

<style scoped>
.login-page { min-height: 100vh; display: grid; place-items: center; padding: 2rem; background: radial-gradient(ellipse at 50% 0%, #eef1fc 0, transparent 46%), #f6f8fb; }
.login-card { display: grid; gap: 0.72rem; width: min(100%, 27rem); padding: 2.4rem; border: 1px solid #e7ebf2; border-radius: 10px; background: #fff; box-shadow: 0 12px 40px #2436530d; }
h1, p { margin: 0; }
.login-brand { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 1.15rem; color: #26344e; font-size: 1.08rem; font-weight: 700; letter-spacing: -0.03em; }
.login-brand span { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: 7px; color: white; background: #526bd0; font-family: Georgia, serif; font-size: 1.45rem; line-height: 1; }
.login-caption { color: #667bd0; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.12em; }
h1 { margin-top: 0.05rem; color: #202c42; font-size: 1.55rem; font-weight: 650; letter-spacing: -0.04em; }
.login-intro { margin-bottom: 0.7rem; color: #7b8798; font-size: 0.82rem; line-height: 1.5; }
label { margin-top: 0.25rem; color: #39465b; font-size: 0.75rem; font-weight: 600; }
input, button { min-height: 2.8rem; padding: 0.65rem 0.8rem; font: inherit; font-size: 0.82rem; }
input { border: 1px solid #d8dee8; border-radius: 5px; outline: none; background: #fff; transition: border 140ms ease, box-shadow 140ms ease; }
input:focus { border-color: #6d82dc; box-shadow: 0 0 0 3px #526bd01a; }
button { margin-top: 0.55rem; border: 0; border-radius: 5px; color: #fff; background: #425fca; font-weight: 600; cursor: pointer; transition: background 140ms ease; }
button:hover:not(:disabled) { background: #344fae; }
button:disabled { opacity: 0.65; cursor: wait; }
.error-message { color: #b42318; font-size: 0.8rem; }
.field-error { margin-top: -0.55rem; color: #b42318; font-size: 0.68rem; }
.session-notice { padding: 0.6rem 0.7rem; border: 1px solid #f1e4c8; border-radius: 5px; color: #745c2c; background: #fffbf2; font-size: 0.74rem; }
.demo-notice { padding: 0.6rem 0.7rem; border: 1px solid #f1e4c8; border-radius: 5px; color: #745c2c; background: #fffbf2; font-size: 0.74rem; }
@media (max-width: 480px) { .login-page { padding: 1rem; } .login-card { padding: 1.6rem; } }
</style>
