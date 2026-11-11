import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginWithCredentials } from '../api/auth'

const TOKEN_KEY = 'ticketera_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const user = ref(null)
  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(credentials) {
    const session = await loginWithCredentials(credentials)
    token.value = session.token
    user.value = session.user
    localStorage.setItem(TOKEN_KEY, session.token)
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  return { token, user, isAuthenticated, login, logout }
})
