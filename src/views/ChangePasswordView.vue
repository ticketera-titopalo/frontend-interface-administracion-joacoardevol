<script setup>
import { computed, ref } from 'vue'
import { changeUserPassword } from '../api/users'

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const saving = ref(false)
const error = ref('')
const success = ref('')
const newPasswordError = computed(() => newPassword.value.length > 0 && newPassword.value.length < 8 ? 'Usa al menos 8 caracteres.' : '')
const confirmPasswordError = computed(() => confirmPassword.value && confirmPassword.value !== newPassword.value ? 'Las contraseñas no coinciden.' : '')

function passwordChangeError() {
  if (newPasswordError.value) return newPasswordError.value
  if (confirmPasswordError.value) return confirmPasswordError.value
  return confirmPassword.value ? '' : 'Confirma la nueva contraseña.'
}

async function submitPasswordChange() {
  error.value = ''
  success.value = ''
  const validationError = passwordChangeError()
  if (validationError) {
    error.value = validationError
    return
  }

  saving.value = true
  try {
    await changeUserPassword({ current_password: currentPassword.value, new_password: newPassword.value })
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    success.value = 'La contraseña se cambió correctamente.'
  } catch (changeError) {
    error.value = changeError.response?.data?.message ?? 'No se pudo cambiar la contraseña.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="password-page">
    <header class="page-heading"><p class="eyebrow">SEGURIDAD</p><h1>Cambiar contraseña</h1><p>Actualiza la contraseña de tu cuenta.</p></header>
    <form class="password-card" @submit.prevent="submitPasswordChange">
      <label for="current-password">Contraseña actual</label><input id="current-password" v-model="currentPassword" type="password" autocomplete="current-password" required />
      <label for="new-password">Nueva contraseña</label><input id="new-password" v-model="newPassword" type="password" autocomplete="new-password" minlength="8" required :aria-invalid="Boolean(newPasswordError)" @input="error = ''; success = ''" /><span v-if="newPasswordError" class="field-error">{{ newPasswordError }}</span>
      <label for="confirm-password">Confirmar nueva contraseña</label><input id="confirm-password" v-model="confirmPassword" type="password" autocomplete="new-password" minlength="8" required :aria-invalid="Boolean(confirmPasswordError)" @input="error = ''; success = ''" /><span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
      <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
      <p v-if="success" class="feedback success" role="status">{{ success }}</p>
      <button class="primary-button" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Actualizar contraseña' }}</button>
    </form>
  </section>
</template>

<style scoped>
.password-page { display: grid; gap: 1.3rem; max-width: 650px; }
.page-heading h1 { margin: 0; color: #1e293b; font-size: 1.7rem; font-weight: 650; letter-spacing: -0.04em; }.page-heading p:last-child { margin: 0.35rem 0 0; color: #7b8798; font-size: 0.83rem; }
.eyebrow { margin: 0 0 0.35rem; color: #6379d4; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.11em; }
.password-card { display: grid; gap: 0.65rem; padding: 1.5rem; border: 1px solid #e7ebf2; border-radius: 8px; background: white; box-shadow: 0 1px 3px #1c2b4508; }
label { margin-top: 0.25rem; color: #39465b; font-size: 0.74rem; font-weight: 600; }
input { min-height: 2.65rem; padding: 0.6rem 0.75rem; border: 1px solid #d8dee8; border-radius: 5px; outline: none; color: #344158; background: white; font: inherit; font-size: 0.8rem; }
input:focus { border-color: #6d82dc; box-shadow: 0 0 0 3px #526bd01a; }
input[aria-invalid="true"] { border-color: #c86c6c; }
.field-error { margin-top: -0.45rem; color: #b42318; font-size: 0.68rem; }
.primary-button { justify-self: start; min-height: 2.65rem; margin-top: 0.5rem; padding: 0 1rem; border: 0; border-radius: 5px; color: white; background: #425fca; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }.primary-button:disabled { opacity: 0.65; cursor: wait; }
.feedback { margin: 0; font-size: 0.75rem; }.error { color: #a64b4b; }.success { color: #218268; }
</style>
