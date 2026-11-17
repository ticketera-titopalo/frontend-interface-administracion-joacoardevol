import api from './index'
import { firstValue } from '../utils/apiResponse'

let demoProfile = null

function currentDemoProfile(authUser = {}) {
  if (demoProfile) return demoProfile
  const defaults = { id: 'demo-user-1', name: 'Administrador Demo', email: 'admin@ticketera.demo', phone: '', photo: '' }
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, authUser[key] ?? fallback]))
}

export async function getMyProfile(authUser) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return currentDemoProfile(authUser)
  const { data } = await api.get('/api/users/me')
  return firstValue(data, ['user', 'data'], data)
}

export async function updateMyProfile(profile) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    demoProfile = { ...currentDemoProfile(), ...profile }
    return demoProfile
  }
  const { data } = await api.put('/api/users/me', profile)
  return firstValue(data, ['user', 'data'], data)
}

export async function changeUserPassword({ current_password, new_password }) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return { success: true }
  const { data } = await api.post('/api/users/password', { current_password, new_password })
  return data
}
