import { describe, expect, it } from 'vitest'
import { errorMessage, firstValue, readPath } from '../../src/utils/apiResponse'

describe('apiResponse helpers', () => {
  it('reads nested paths and safely stops at missing values', () => {
    expect(readPath({ data: { user: { id: 12 } } }, 'data.user.id')).toBe(12)
    expect(readPath({ data: null }, 'data.user.id')).toBeUndefined()
  })

  it('returns the first non-empty value or its fallback', () => {
    expect(firstValue({ name: '', full_name: 'Ana' }, ['name', 'full_name'])).toBe('Ana')
    expect(firstValue({}, ['name'], 'Invitado')).toBe('Invitado')
  })

  it('extracts API messages before generic errors', () => {
    expect(errorMessage({ response: { data: { message: 'Sin stock' } }, message: 'Error' }, 'Fallo')).toBe('Sin stock')
    expect(errorMessage(new Error('Conexión caída'), 'Fallo')).toBe('Conexión caída')
  })
})
