import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginWithCredentials } from '../api/auth'

const TOKEN_KEY = 'ticketera_token'
const USER_KEY = 'ticketera_user'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const user = ref(readStoredUser())
  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(credentials) {
    const session = await loginWithCredentials(credentials)
    token.value = session.token
    user.value = session.user
    localStorage.setItem(TOKEN_KEY, session.token)
    if (session.user) localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  }

  function updateUser(profile) {
    user.value = { ...user.value, ...profile }
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, isAuthenticated, login, updateUser, logout }
})
