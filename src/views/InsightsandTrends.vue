<template>
  <div class="page-container">
    <div class="header">
      <div class="header-content">
        <h1>Insights & Trends</h1>
        <button 
          v-if="!isFitbitConnected" 
          @click="connectFitbit" 
          class="fitbit-connect-btn"
        >
          Connect Fitbit
        </button>
        <button 
          v-else 
          @click="disconnectFitbit" 
          class="fitbit-connect-btn connected"
        >
          Connected
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your insights...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchInsights" class="retry-button">Try Again</button>
    </div>

    <!-- Main Content -->
    <main v-else class="content">
      <!-- Sleep Section -->
      <section 
        class="insights-section content-box clickable"
        @click="handleSleepClick"
      >
        <div class="section-header">
          <h2>Sleep Time</h2>
          <div class="view-details">
            <span>View Details</span>
            <v-icon>mdi-chevron-right</v-icon>
          </div>
        </div>
        <div class="insights-card">
          <SleepClock :sleepHours="latestSleepHours" />
        </div>
      </section>

      <!-- Heart Rate Section -->
      <section 
        class="insights-section content-box clickable"
        @click="handleHeartRateClick"
      >
        <div class="section-header">
          <h2>Heart Rate</h2>
          <div class="view-details">
            <span>View Details</span>
            <v-icon>mdi-chevron-right</v-icon>
          </div>
        </div>
        <div class="insights-card">
          <HeartRateCard :heartRate="latestHeartRate" />
        </div>
      </section>

      <!-- Steps Section -->
      <section class="insights-section content-box clickable" @click="handleStepsClick">
        <div class="section-header">
          <h2>Daily Steps</h2>
          <div class="view-details">
            <span>View Details</span>
            <v-icon>mdi-chevron-right</v-icon>
          </div>
        </div>
        <div class="insights-card">
          <DailyStepsCard :steps="latestSteps" :goal="10000" />
        </div>
      </section>

      <!-- Calories Burned Section -->
      <section class="insights-section content-box clickable" @click="handleCaloriesClick">
        <div class="section-header">
          <h2>Calories Burned</h2>
          <div class="view-details">
            <span>View Details</span>
            <v-icon>mdi-chevron-right</v-icon>
          </div>
        </div>
        <div class="insights-card">
          <CaloriesBurnedCard :calories="latestCalories" :goal="2500" />
        </div>
      </section>
    </main>

    <!-- Sleep Details Bottom Sheet -->
    <SleepDetailsSheet
      v-model="showSleepDetails"
      :sleep-hours="latestSleepHours"
    />

    <!-- Heart Rate Details Bottom Sheet -->
    <HeartRateDetailsSheet
      v-model="showHeartRateDetails"
      :heart-rate="latestHeartRate"
    />

    <!-- Steps Details Bottom Sheet -->
    <DailyStepsDetailsSheet
      v-model="showStepsDetails"
      :steps="latestSteps"
      :step-history="stepsHistory"
    />

    <!-- Calories Burned Details Bottom Sheet -->
    <CaloriesBurnedDetailsSheet
      v-model="showCaloriesDetails"
      :calories="latestCalories"
      :calories-history="caloriesHistory"
    />

    <!-- Add the consent dialog -->
    <FitbitConsentDialog
      v-model="showConsentDialog"
      @confirm="handleConsentConfirm"
      @cancel="handleConsentCancel"
    />
  </div>
</template>

<script>
import SleepClock from '../components/SleepClock.vue'
import SleepDetailsSheet from '../components/SleepDetailsSheet.vue'
import HeartRateCard from '../components/HeartRateCard.vue'
import HeartRateDetailsSheet from '../components/HeartRateDetailsSheet.vue'
import DailyStepsCard from '../components/DailyStepsCard.vue'
import DailyStepsDetailsSheet from '../components/DailyStepsDetailsSheet.vue'
import CaloriesBurnedCard from '../components/CaloriesBurnedCard.vue'
import CaloriesBurnedDetailsSheet from '../components/CaloriesBurnedDetailsSheet.vue'
import healthData from '../data/mockHealthData.json'
import { FitbitService } from '../services/fitbit/api'
import FitbitConsentDialog from '../components/FitbitConsentDialog.vue'

export default {
  name: 'InsightsandTrends',
  components: {
    SleepClock,
    SleepDetailsSheet,
    HeartRateCard,
    HeartRateDetailsSheet,
    DailyStepsCard,
    DailyStepsDetailsSheet,
    CaloriesBurnedCard,
    CaloriesBurnedDetailsSheet,
    FitbitConsentDialog
  },
  data() {
    return {
      loading: false,
      error: null,
      showSleepDetails: false,
      showHeartRateDetails: false,
      showStepsDetails: false,
      showCaloriesDetails: false,
      isFitbitConnected: false,
      fitbitTokens: null,
      fitbitData: null,
      showConsentDialog: false
    }
  },
  computed: {
    latestSleepHours() {
      if (this.isFitbitConnected && this.fitbitData) {
        return this.fitbitData.sleepHours
      }
      return healthData.healthData[healthData.healthData.length - 1].sleepHours
    },
    latestHeartRate() {
      if (this.isFitbitConnected && this.fitbitData) {
        return this.fitbitData.heartRate
      }
      return healthData.healthData[healthData.healthData.length - 1].heartRate
    },
    latestSteps() {
      if (this.isFitbitConnected && this.fitbitData) {
        return this.fitbitData.stepCount
      }
      return healthData.healthData[healthData.healthData.length - 1].stepCount
    },
    latestCalories() {
      if (this.isFitbitConnected && this.fitbitData) {
        return this.fitbitData.caloriesBurned
      }
      return healthData.healthData[healthData.healthData.length - 1].caloriesBurned
    },
    stepsHistory() {
      // Get the last 7 days' stepCount values
      return healthData.healthData.slice(-7).map(d => d.stepCount)
    },
    caloriesHistory() {
      return healthData.healthData.slice(-7).map(d => d.caloriesBurned)
    }
  },
  methods: {
    handleSleepClick() {
      console.log('Sleep section clicked');
      this.showSleepDetails = true;
    },
    handleHeartRateClick() {
      console.log('Heart rate section clicked');
      this.showHeartRateDetails = true;
    },
    handleStepsClick() {
      console.log('Steps section clicked');
      this.showStepsDetails = true;
    },
    handleCaloriesClick() {
      console.log('Calories section clicked');
      this.showCaloriesDetails = true;
    },
    async fetchInsights() {
      try {
        this.loading = true;
        this.error = null;
        // Add your insights fetching logic here
      } catch (err) {
        console.error('Error fetching insights:', err);
        this.error = 'Failed to load insights. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    connectFitbit() {
      this.showConsentDialog = true
    },
    handleConsentConfirm() {
      // Clear any existing state before starting new auth flow
      FitbitService.clearAuthState()
      window.location.href = FitbitService.getAuthUrl()
    },
    handleConsentCancel() {
      this.showConsentDialog = false
    },
    async handleAuthCallback(code, state) {
      const savedState = FitbitService.getStoredState()
      if (!savedState || state !== savedState) {
        this.error = 'Invalid authentication state. Please try again.'
        FitbitService.clearAuthState()
        return
      }

      try {
        const tokens = await FitbitService.exchangeCodeForToken(code)
        this.fitbitTokens = tokens
        localStorage.setItem('fitbit_tokens', JSON.stringify(tokens))
        this.isFitbitConnected = true
        await this.fetchFitbitData()
        // Clear the state after successful authentication
        FitbitService.clearAuthState()
      } catch (error) {
        console.error('Error during Fitbit authentication:', error)
        this.error = 'Failed to connect to Fitbit. Please try again.'
        FitbitService.clearAuthState()
      }
    },
    async fetchFitbitData() {
      if (!this.fitbitTokens) return

      try {
        const today = new Date().toISOString().split('T')[0]
        
        const [sleepData, heartRateData, stepsData] = await Promise.all([
          FitbitService.fetchSleepData(this.fitbitTokens.access_token, today),
          FitbitService.fetchHeartRateData(this.fitbitTokens.access_token, today),
          FitbitService.fetchStepsData(this.fitbitTokens.access_token, today)
        ])

        this.fitbitData = {
          sleepHours: FitbitService.processSleepData(sleepData),
          heartRate: FitbitService.processHeartRateData(heartRateData),
          stepCount: FitbitService.processStepsData(stepsData),
          caloriesBurned: FitbitService.processCaloriesData(stepsData)
        }
      } catch (error) {
        console.error('Error fetching Fitbit data:', error)
        this.error = 'Failed to fetch Fitbit data. Please try again.'
      }
    },
    disconnectFitbit() {
      this.isFitbitConnected = false
      this.fitbitTokens = null
      this.fitbitData = null
      localStorage.removeItem('fitbit_tokens')
      FitbitService.clearAuthState()
    }
  },
  mounted() {
    // Check for auth callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (code && state) {
      this.handleAuthCallback(code, state)
      // Clear the URL parameters after handling
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      // Check for existing tokens
      const savedTokens = localStorage.getItem('fitbit_tokens')
      if (savedTokens) {
        this.fitbitTokens = JSON.parse(savedTokens)
        this.isFitbitConnected = true
        this.fetchFitbitData()
      }
    }

    this.fetchInsights()
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #1E3A8A 0%, #1A1A1A 50%, #000000 100%);
  color: white;
  padding: 20px;
  padding-top: calc(84px + env(safe-area-inset-top, 0px));
  padding-left: calc(20px + env(safe-area-inset-left, 0px));
  padding-right: calc(20px + env(safe-area-inset-right, 0px));
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  padding-top: calc(30px + env(safe-area-inset-top, 0px));
  padding-left: calc(20px + env(safe-area-inset-left, 0px));
  padding-right: calc(20px + env(safe-area-inset-right, 0px));
}

.header-content {
  max-width: 1200px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.content {
  padding: 16px;
  margin-top: 50px;
  margin-bottom: 50px;
}

.content-box {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable:hover {
  transform: translateY(-2px);
}

.clickable:active {
  transform: translateY(0);
}

.insights-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-details {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1a73e8;
  font-size: 14px;
  font-weight: 500;
}

.view-details .v-icon {
  font-size: 18px;
}

.insights-section h2 {
  margin: 0;
  font-size: 25px;
  font-weight: 700;
  color: #333333;
}

.insights-card {
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 24px;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  margin-bottom: 16px;
}

.retry-button {
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
}

.retry-button:hover {
  background-color: #1557b0;
}

.fitbit-connect-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #00B0B9;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fitbit-connect-btn:hover {
  background: #009DA5;
  transform: translateY(-1px);
}

.fitbit-connect-btn.connected {
  background: #4CAF50;
}

.fitbit-connect-btn.connected:hover {
  background: #43A047;
}

.fitbit-connect-btn .v-icon {
  font-size: 20px;
}
</style>