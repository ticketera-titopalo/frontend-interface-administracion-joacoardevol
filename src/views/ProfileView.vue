<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getMyProfile, updateMyProfile } from '../api/users'
import { useAuthStore } from '../store/auth'

const auth = useAuthStore()
const profile = reactive({ name: '', email: '', phone: '', photo: '' })
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

async function loadProfile() {
  loading.value = true
  error.value = ''
  try {
    const user = await getMyProfile(auth.user)
    Object.assign(profile, {
      ...user,
      name: user.name ?? user.full_name ?? '',
      phone: user.phone ?? user.phone_number ?? '',
      photo: user.photo ?? user.avatar_url ?? user.profile_image ?? '',
    })
    auth.updateUser({ ...user, name: profile.name, photo: profile.photo })
  } catch (loadError) {
    error.value = loadError.response?.data?.message ?? 'No se pudo cargar el perfil.'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const updated = await updateMyProfile({ ...profile })
    Object.assign(profile, updated)
    auth.updateUser(updated)
    success.value = 'Los datos del perfil se guardaron correctamente.'
  } catch (saveError) {
    error.value = saveError.response?.data?.message ?? 'No se pudo guardar el perfil.'
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
      <label for="name">Nombre</label><input id="name" v-model.trim="profile.name" autocomplete="name" required />
      <label for="email">Correo electrónico</label><input id="email" v-model.trim="profile.email" type="email" autocomplete="email" required />
      <label for="phone">Teléfono</label><input id="phone" v-model.trim="profile.phone" type="tel" autocomplete="tel" />
      <label for="photo">URL de foto de perfil</label><input id="photo" v-model.trim="profile.photo" type="url" placeholder="https://…" />
      <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
      <p v-if="success" class="feedback success" role="status">{{ success }}</p>
      <button class="primary-button" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar cambios' }}</button>
    </form>
    <div v-else class="profile-card loading">Cargando perfil…</div>
    <p v-if="error && loading" class="feedback error" role="alert">{{ error }}</p>
  </section>
</template>

<style scoped>
.profile-page { display: grid; gap: 1.3rem; max-width: 760px; }
.page-heading h1 { margin: 0; color: #1e293b; font-size: 1.7rem; font-weight: 650; letter-spacing: -0.04em; }
.page-heading p:last-child { margin: 0.35rem 0 0; color: #7b8798; font-size: 0.83rem; }
.eyebrow { margin: 0 0 0.35rem; color: #6379d4; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.11em; }
.profile-card { display: grid; gap: 0.65rem; padding: 1.5rem; border: 1px solid #e7ebf2; border-radius: 8px; background: white; box-shadow: 0 1px 3px #1c2b4508; }
.profile-identity { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.5rem; padding-bottom: 1rem; border-bottom: 1px solid #edf0f4; }
.profile-identity > span, .profile-identity img { display: grid; width: 3rem; height: 3rem; place-items: center; border: 2px solid #edf0ff; border-radius: 50%; color: #455fcb; background: #e9edff; font-size: 1.05rem; font-weight: 700; object-fit: cover; }
.profile-identity div { display: grid; gap: 0.15rem; }.profile-identity strong { color: #344158; font-size: 0.85rem; }.profile-identity small { color: #8994a6; font-size: 0.72rem; }
label { margin-top: 0.25rem; color: #39465b; font-size: 0.74rem; font-weight: 600; }
input { min-height: 2.65rem; padding: 0.6rem 0.75rem; border: 1px solid #d8dee8; border-radius: 5px; outline: none; color: #344158; background: white; font: inherit; font-size: 0.8rem; }
input:focus { border-color: #6d82dc; box-shadow: 0 0 0 3px #526bd01a; }
.primary-button { justify-self: start; min-height: 2.65rem; margin-top: 0.5rem; padding: 0 1rem; border: 0; border-radius: 5px; color: white; background: #425fca; font: inherit; font-size: 0.78rem; font-weight: 600; cursor: pointer; }.primary-button:disabled { opacity: 0.65; cursor: wait; }
.feedback { margin: 0; font-size: 0.75rem; }.error { color: #a64b4b; }.success { color: #218268; }.loading { min-height: 180px; place-items: center; color: #78859a; }
</style>
