import { TokenManager } from './tokenManager'

export class FitbitSyncService {
  static async syncUserData() {
    const tokens = await TokenManager.refreshTokenIfNeeded()
    if (!tokens) {
      throw new Error('No valid tokens available')
    }

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    try {
      const [todayData, yesterdayData] = await Promise.all([
        this.fetchDailyData(tokens.access_token, today),
        this.fetchDailyData(tokens.access_token, yesterday)
      ])

      return {
        today: todayData,
        yesterday: yesterdayData,
        lastSync: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error syncing Fitbit data:', error)
      throw error
    }
  }

  static async fetchDailyData(accessToken, date) {
    const [sleep, heartRate, steps, calories] = await Promise.all([
      this.fetchSleepData(accessToken, date),
      this.fetchHeartRateData(accessToken, date),
      this.fetchStepsData(accessToken, date),
      this.fetchCaloriesData(accessToken, date)
    ])

    return {
      date,
      sleep,
      heartRate,
      steps,
      calories
    }
  }

  static async fetchSleepData(accessToken, date) {
    const response = await fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const data = await response.json()
    return {
      totalMinutes: data.sleep[0]?.minutesAsleep || 0,
      efficiency: data.sleep[0]?.efficiency || 0,
      stages: {
        deep: data.sleep[0]?.levels?.summary?.deep?.minutes || 0,
        light: data.sleep[0]?.levels?.summary?.light?.minutes || 0,
        rem: data.sleep[0]?.levels?.summary?.rem?.minutes || 0,
        wake: data.sleep[0]?.levels?.summary?.wake?.minutes || 0
      }
    }
  }

  static async fetchHeartRateData(accessToken, date) {
    const response = await fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const data = await response.json()
    return {
      resting: data.activitiesHeart[0]?.value?.restingHeartRate || 0,
      zones: data.activitiesHeart[0]?.value?.heartRateZones || []
    }
  }

  static async fetchStepsData(accessToken, date) {
    const response = await fetch(`https://api.fitbit.com/1/user/-/activities/steps/date/${date}/1d.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const data = await response.json()
    return {
      steps: data.activitiesSteps[0]?.value || 0,
      distance: data.activitiesSteps[0]?.value * 0.762 || 0 // Rough estimate in meters
    }
  }

  static async fetchCaloriesData(accessToken, date) {
    const response = await fetch(`https://api.fitbit.com/1/user/-/activities/calories/date/${date}/1d.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    const data = await response.json()
    return {
      calories: data.activitiesCalories[0]?.value || 0,
      bmr: data.activitiesCalories[0]?.value * 0.7 || 0 // Rough estimate of BMR
    }
  }
} 