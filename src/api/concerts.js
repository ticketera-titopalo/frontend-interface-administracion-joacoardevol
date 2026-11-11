import api from './index'

const demoConcerts = [
  { id: 1, title: 'Noche de Rock', artist: 'Los Satélites', description: 'Una noche para disfrutar los clásicos del rock nacional en vivo, con invitados especiales y una puesta de luces inmersiva.', price: 18500, availableStock: 142, ticketsSold: 358, capacity: 500, date: '18 dic 2026', venue: 'Estadio Central' },
  { id: 2, title: 'Festival de Verano', artist: 'Artistas invitados', description: 'Un festival al aire libre con música en vivo, gastronomía local y actividades durante toda la jornada.', price: 42000, availableStock: 86, ticketsSold: 414, capacity: 500, date: '10 ene 2027', venue: 'Parque Norte' },
  { id: 3, title: 'Jazz en Vivo', artist: 'Trío del Lago', description: 'Una presentación íntima de jazz contemporáneo en un entorno único junto al lago.', price: 15000, availableStock: 54, ticketsSold: 126, capacity: 180, date: '24 ene 2027', venue: 'Teatro del Lago' },
  { id: 4, title: 'Noche Sinfónica', artist: 'Orquesta Ciudad', description: 'La Orquesta Ciudad interpreta grandes obras del repertorio sinfónico en el Auditorio Municipal.', price: 22000, availableStock: 210, ticketsSold: 290, capacity: 500, date: '7 feb 2027', venue: 'Auditorio Municipal' },
  { id: 5, title: 'Indie al Parque', artist: 'Las Nubes', description: 'Una tarde de música independiente con bandas emergentes y propuestas locales.', price: 12500, availableStock: 38, ticketsSold: 162, capacity: 200, date: '21 feb 2027', venue: 'Parque Norte' },
  { id: 6, title: 'Cumbia de Verano', artist: 'La Banda del Sur', description: 'El cierre de temporada para bailar toda la noche con los éxitos de La Banda del Sur.', price: 16000, availableStock: 0, ticketsSold: 400, capacity: 400, date: '5 mar 2027', venue: 'Estadio Central' },
  { id: 7, title: 'Acústico de Otoño', artist: 'María del Valle', description: 'Un concierto acústico cercano para descubrir las canciones de María del Valle.', price: 19500, availableStock: 97, ticketsSold: 103, capacity: 200, date: '18 mar 2027', venue: 'Teatro del Lago' },
]

function unwrapConcerts(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.concerts)) return payload.concerts
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.concerts)) return payload.data.concerts
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  return []
}

export async function getConcerts() {
  if (import.meta.env.VITE_DEMO_MODE === 'true') return demoConcerts
  const { data } = await api.get('/api/concerts')
  return unwrapConcerts(data)
}

export async function getConcertById(id) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const concert = demoConcerts.find((item) => String(item.id) === String(id))
    if (!concert) throw new Error('No se encontró el concierto solicitado.')
    return concert
  }

  const { data } = await api.get(`/api/concerts/${encodeURIComponent(id)}`)
  return data?.concert ?? data?.data ?? data
}

export function getConcertValue(concert, ...keys) {
  for (const key of keys) {
    const value = key.split('.').reduce((current, part) => current?.[part], concert)
    if (value !== undefined && value !== null && value !== '') return value
  }
  return null
}
