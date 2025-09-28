import { FITBIT_CONFIG } from './config'

export class FitbitService {
  static generateRandomString(length) {
    const array = new Uint32Array(length)
    window.crypto.getRandomValues(array)
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('')
  }

  static getAuthUrl() {
    const state = this.generateRandomString(16)
    sessionStorage.setItem('fitbit_auth_state', state)
    
    const authUrl = new URL(FITBIT_CONFIG.authUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('client_id', FITBIT_CONFIG.clientId)
    authUrl.searchParams.append('redirect_uri', FITBIT_CONFIG.redirectUri)
    authUrl.searchParams.append('scope', FITBIT_CONFIG.scope)
    authUrl.searchParams.append('state', state)
    authUrl.searchParams.append('prompt', 'login')
    
    return authUrl.toString()
  }

  static async exchangeCodeForToken(code) {
    const response = await fetch(FITBIT_CONFIG.tokenUri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${FITBIT_CONFIG.clientId}:${FITBIT_CONFIG.clientSecret}`)
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: FITBIT_CONFIG.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get access token')
    }

    return response.json()
  }

  static async fetchSleepData(accessToken, date) {
    const response = await fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return response.json()
  }

  static async fetchHeartRateData(accessToken, date) {
    const response = await fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return response.json()
  }

  static async fetchStepsData(accessToken, date) {
    const response = await fetch(`https://api.fitbit.com/1/user/-/activities/steps/date/${date}/1d.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return response.json()
  }

  static processSleepData(sleepData) {
    return sleepData.sleep[0]?.minutesAsleep / 60 || 0
  }

  static processHeartRateData(heartRateData) {
    return heartRateData.activitiesHeart[0]?.value?.restingHeartRate || 0
  }

  static processStepsData(stepsData) {
    return stepsData.activitiesSteps[0]?.value || 0
  }

  static processCaloriesData(stepsData) {
    return stepsData.activitiesSteps[0]?.value * 0.04 || 0 // Rough estimate
  }

  static clearAuthState() {
    sessionStorage.removeItem('fitbit_auth_state')
  }

  static getStoredState() {
    return sessionStorage.getItem('fitbit_auth_state')
  }
} 