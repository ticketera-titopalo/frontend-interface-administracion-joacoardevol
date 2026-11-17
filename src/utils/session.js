function hasIdentifier(value) {
  return value !== undefined && value !== null
}

function hasUserId(user) {
  return Boolean(user) && hasIdentifier(user.id)
}

function hasLegacyUserId(user) {
  return Boolean(user) && hasIdentifier(user._id)
}

export function getSessionUserId(user, demoMode = false) {
  if (hasUserId(user)) return user.id
  if (hasLegacyUserId(user)) return user._id
  if (demoMode) return 'demo-user-1'
  return null
}
