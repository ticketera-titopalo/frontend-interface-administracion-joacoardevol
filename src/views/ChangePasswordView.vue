<script setup>
import { computed, ref } from 'vue'
import { errorMessage } from '../utils/apiResponse'
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
    error.value = errorMessage(changeError, 'No se pudo cambiar la contraseña.')
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

<style scoped src="./ChangePasswordView.css"></style>
