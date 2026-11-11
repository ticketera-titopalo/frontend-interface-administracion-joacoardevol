import api from './index'

let demoProfile = null

function currentDemoProfile(authUser = {}) {
  return demoProfile ?? {
    id: authUser.id ?? 'demo-user-1',
    name: authUser.name ?? 'Administrador Demo',
    email: authUser.email ?? 'admin@ticketera.demo',
    phone: authUser.phone ?? '',
    photo: authUser.photo ?? '',
  }
}

export async function getMyProfile(authUser) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return currentDemoProfile(authUser)
  const { data } = await api.get('/api/users/me')
  return data?.user ?? data?.data ?? data
}

export async function updateMyProfile(profile) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    demoProfile = { ...currentDemoProfile(), ...profile }
    return demoProfile
  }
  const { data } = await api.put('/api/users/me', profile)
  return data?.user ?? data?.data ?? data
}

export async function changeUserPassword({ current_password, new_password }) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return { success: true }
  const { data } = await api.post('/api/users/password', { current_password, new_password })
  return data
}
