import { FITBIT_CONFIG } from './config'

export class TokenManager {
  static TOKEN_KEY = 'fitbit_tokens'
  static REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds

  static getTokens() {
    const tokens = localStorage.getItem(this.TOKEN_KEY)
    return tokens ? JSON.parse(tokens) : null
  }

  static setTokens(tokens) {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens))
  }

  static clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY)
  }

  static async refreshTokenIfNeeded() {
    const tokens = this.getTokens()
    if (!tokens) return null

    const expiresAt = tokens.expires_at
    const now = Date.now()

    // If token expires in less than 5 minutes, refresh it
    if (expiresAt - now < this.REFRESH_THRESHOLD) {
      try {
        const response = await fetch(FITBIT_CONFIG.tokenUri, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(`${FITBIT_CONFIG.clientId}:${FITBIT_CONFIG.clientSecret}`)
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokens.refresh_token
          })
        })

        if (!response.ok) {
          throw new Error('Failed to refresh token')
        }

        const newTokens = await response.json()
        // Add expires_at to the tokens object
        newTokens.expires_at = Date.now() + (newTokens.expires_in * 1000)
        this.setTokens(newTokens)
        return newTokens
      } catch (error) {
        console.error('Error refreshing token:', error)
        this.clearTokens()
        return null
      }
    }

    return tokens
  }

  static isTokenValid() {
    const tokens = this.getTokens()
    if (!tokens) return false

    const expiresAt = tokens.expires_at
    const now = Date.now()

    return expiresAt > now
  }
} 