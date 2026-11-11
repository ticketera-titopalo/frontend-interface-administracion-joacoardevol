import api from './index'

export async function loginWithCredentials(credentials) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const name = credentials.email.split('@')[0].replace(/[._-]/g, ' ')
    return {
      token: 'ticketera-demo-token',
      user: { name: name || 'Administrador', email: credentials.email },
    }
  }

  const { data } = await api.post('/auth/login', credentials)
  const token = data.token ?? data.access_token
  if (!token) throw new Error('La respuesta de autenticación no contiene un token.')
  return { token, user: data.user ?? null }
}
