import api from './index'

export async function loginWithCredentials(credentials) {
  const { data } = await api.post('/auth/login', credentials)
  const token = data.token ?? data.access_token
  if (!token) throw new Error('La respuesta de autenticación no contiene un token.')
  return { token, user: data.user ?? null }
}
