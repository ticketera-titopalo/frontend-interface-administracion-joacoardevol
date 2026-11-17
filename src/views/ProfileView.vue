<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { errorMessage, firstValue } from '../utils/apiResponse'
import { getMyProfile, updateMyProfile } from '../api/users'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const profile = reactive({ name: '', email: '', phone: '', photo: '' })
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')
const touched = reactive({ name: false, email: false, photo: false })

function normalizeProfile(user) {
  return {
    ...user,
    name: firstValue(user, ['name', 'full_name'], ''),
    phone: firstValue(user, ['phone', 'phone_number'], ''),
    photo: firstValue(user, ['photo', 'avatar_url', 'profile_image'], ''),
  }
}

function validateName(name) {
  const value = name.trim()
  if (!value) return 'El nombre es obligatorio.'
  return value.length < 2 ? 'Ingresa al menos 2 caracteres.' : ''
}

function validateEmail(email) {
  const value = email.trim()
  if (!value) return 'El correo es obligatorio.'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Ingresa un correo válido.'
}

function validatePhoto(photo) {
  if (!photo || /^https?:\/\//i.test(photo)) return ''
  return 'Ingresa una URL que comience con http:// o https://.'
}

const fieldErrors = computed(() => ({
  name: validateName(profile.name),
  email: validateEmail(profile.email),
  photo: validatePhoto(profile.photo),
}))

async function loadProfile() {
  loading.value = true
  error.value = ''
  try {
    const user = await getMyProfile(auth.user)
    Object.assign(profile, normalizeProfile(user))
    auth.updateUser({ ...user, name: profile.name, photo: profile.photo })
  } catch (loadError) {
    error.value = errorMessage(loadError, 'No se pudo cargar el perfil.')
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  Object.keys(touched).forEach((key) => { touched[key] = true })
  if (Object.values(fieldErrors.value).some(Boolean)) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const updated = await updateMyProfile({ ...profile })
    Object.assign(profile, updated)
    auth.updateUser(updated)
    success.value = 'Los datos del perfil se guardaron correctamente.'
  } catch (saveError) {
    error.value = errorMessage(saveError, 'No se pudo guardar el perfil.')
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <section class="profile-page">
    <header class="page-heading"><div><p class="eyebrow">CUENTA</p><h1>Mi perfil</h1><p>Administra tu información personal.</p></div></header>
    <form v-if="!loading" class="profile-card" @submit.prevent="saveProfile">
      <div class="profile-identity">
        <img v-if="profile.photo" :src="profile.photo" alt="Foto de perfil" />
        <span v-else>{{ (profile.name || profile.email || 'U').charAt(0).toUpperCase() }}</span>
        <div><strong>{{ profile.name || 'Usuario' }}</strong><small>{{ profile.email }}</small></div>
      </div>
      <label for="name">Nombre</label><input id="name" v-model.trim="profile.name" autocomplete="name" required :aria-invalid="touched.name && Boolean(fieldErrors.name)" @input="touched.name = true" /><span v-if="touched.name && fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span>
      <label for="email">Correo electrónico</label><input id="email" v-model.trim="profile.email" type="email" autocomplete="email" required :aria-invalid="touched.email && Boolean(fieldErrors.email)" @input="touched.email = true" /><span v-if="touched.email && fieldErrors.email" class="field-error">{{ fieldErrors.email }}</span>
      <label for="phone">Teléfono</label><input id="phone" v-model.trim="profile.phone" type="tel" autocomplete="tel" />
      <label for="photo">URL de foto de perfil</label><input id="photo" v-model.trim="profile.photo" type="url" placeholder="https://…" :aria-invalid="touched.photo && Boolean(fieldErrors.photo)" @input="touched.photo = true" /><span v-if="touched.photo && fieldErrors.photo" class="field-error">{{ fieldErrors.photo }}</span>
      <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
      <p v-if="success" class="feedback success" role="status">{{ success }}</p>
      <button class="primary-button" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar cambios' }}</button>
    </form>
    <div v-else class="profile-card loading">Cargando perfil…</div>
    <p v-if="error && loading" class="feedback error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped src="./ProfileView.css"></style>
