import axios from 'axios'

const TOKEN_KEY = 'ticketera_token'

function emitAppEvent(name, detail) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(name, { detail }))
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const serverMessage = error.response?.data?.message ?? error.response?.data?.error
    const messages = {
      401: serverMessage ?? 'Tu sesión expiró. Inicia sesión nuevamente.',
      403: serverMessage ?? 'No tienes permiso para realizar esta acción.',
      404: serverMessage ?? 'No se encontró el recurso solicitado.',
      500: serverMessage ?? 'Ocurrió un error en el servidor. Intenta más tarde.',
    }

    if (messages[status]) {
      emitAppEvent('ticketera:toast', { type: status === 401 ? 'warning' : 'error', message: messages[status] })
      if (status === 401 && localStorage.getItem(TOKEN_KEY)) {
        emitAppEvent('ticketera:session-expired')
      }
    } else if (!error.response) {
      emitAppEvent('ticketera:toast', { type: 'error', message: 'No se pudo conectar con el servidor.' })
    }

    return Promise.reject(error)
  },
)

export default api
