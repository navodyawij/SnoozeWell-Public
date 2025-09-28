// Debug environment variables
console.log('Fitbit Config:', {
  clientId: import.meta.env.VITE_FITBIT_CLIENT_ID,
  redirectUri: import.meta.env.VITE_FITBIT_REDIRECT_URI
})

export const FITBIT_CONFIG = {
  clientId: '########', // Hardcoding temporarily for testing
  clientSecret: '#########################', // Hardcoding temporarily for testing
  redirectUri: 'http://localhost:5173/', // Hardcoding temporarily for testing
  authUri: 'https://www.fitbit.com/oauth2/authorize',
  tokenUri: 'https://api.fitbit.com/oauth2/token',
  scope: 'sleep heartrate activity profile',
  requestedData: {
    sleep: {
      name: 'Sleep Data',
      description: 'Access to your sleep patterns and duration'
    },
    heartrate: {
      name: 'Heart Rate',
      description: 'Access to your heart rate data'
    },
    activity: {
      name: 'Activity Data',
      description: 'Access to your steps and calories burned'
    },
    profile: {
      name: 'Basic Profile',
      description: 'Access to your basic profile information'
    }
  }
} 