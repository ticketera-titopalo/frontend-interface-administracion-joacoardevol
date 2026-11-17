export function readPath(source, path) {
  let value = source
  for (const key of path.split('.')) {
    if (value == null) return undefined
    value = value[key]
  }
  return value
}

export function firstValue(source, paths, fallback = null) {
  for (const path of paths) {
    const value = readPath(source, path)
    if (value !== undefined && value !== null && value !== '') return value
  }
  return fallback
}

export function errorMessage(error, fallback) {
  return firstValue(error, ['response.data.message', 'response.data.error', 'message'], fallback)
}
