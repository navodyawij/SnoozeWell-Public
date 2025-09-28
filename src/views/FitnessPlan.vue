<template>
  <div class="page-container">
    <div class="header">
      <div class="header-content">
        <h1>Fitness Plan</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your personalized fitness plan...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchRecommendations" class="retry-button">Try Again</button>
    </div>

    <!-- Scrollable Content -->
    <main v-else class="content">
      <!-- Recommended Workouts Section -->
      <section class="workout-section">
        <div class="section-header content-box">
          <h2>Recommended Workout for Today</h2>
          <button v-if="recommendations.length > 0" @click="handleRefreshClick" class="refresh-button">
            Refresh Recommendations
          </button>
        </div>

        <div v-if="recommendations.length === 0" class="no-recommendations content-box">
          <p>No recommendations available. Click the button below to generate personalized recommendations.</p>
          <button @click="fetchRecommendations" class="generate-button">Generate Recommendations</button>
        </div>
        
        <div v-else class="content-box">
          <div class="workout-list">
            <!-- Dynamically render workout cards from the API data -->
            <div 
              v-for="(workout, index) in recommendations" 
              :key="index" 
              class="workout-card"
            >
              <div class="workout-info">
                <h3>{{ workout.title }}</h3>
                <p class="workout-description">{{ workout.description }}</p>
                <div class="workout-details">
                  <span class="detail">
                    <i class="time-icon">⏱</i>
                    {{ remainingTimes.has(`workout-${index}`) ? formatTime(remainingTimes.get(`workout-${index}`)) : `${workout.durationMinutes} Minutes` }}
                  </span>
                  <span class="detail">
                    <i class="calorie-icon">🔥</i>
                    {{ workout.caloriesBurn }} Kcal
                  </span>
                </div>
              </div>
              <div class="workout-image">
                <img :src="workout.imageUrl || 'https://placehold.co/200x150'" :alt="workout.title">
                <div 
                  class="play-button"
                  :class="{ 'active': activeTimers.has(`workout-${index}`) }"
                  @click="startTimer(`workout-${index}`, workout.durationMinutes)"
                >
                  {{ activeTimers.has(`workout-${index}`) ? '⏸' : '▶' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Show More Button -->
      <div v-if="recommendationHistory.length > 0" class="show-more-section">
        <button @click="toggleHistory" class="show-more-button">
          {{ showHistory ? 'Hide Previous Recommendations' : 'Tap to See Previous Recommendations' }}
        </button>
      </div>

      <!-- Historical Recommendations Section -->
      <section v-if="showHistory && recommendationHistory.length > 0" class="workout-section history-section">
        <div class="section-header content-box">
          <h2>Previous Recommendations</h2>
        </div>
        <div v-for="(historyItem, historyIndex) in recommendationHistory" :key="historyIndex" class="history-item content-box">
          <h3 class="history-date">{{ formatDate(historyItem.movedToHistoryAt) }}</h3>
          <div class="workout-list">
            <div 
              v-for="(workout, index) in historyItem.fitnessRecommendations" 
              :key="`history-${historyIndex}-${index}`" 
              class="workout-card history-card"
            >
              <div class="workout-info">
                <h3>{{ workout.title }}</h3>
                <p class="workout-description">{{ workout.description }}</p>
                <div class="workout-details">
                  <span class="detail">
                    <i class="time-icon">⏱</i>
                    {{ workout.durationMinutes }} Minutes
                  </span>
                  <span class="detail">
                    <i class="calorie-icon">🔥</i>
                    {{ workout.caloriesBurn }} Kcal
                  </span>
                </div>
              </div>
              <div class="workout-image">
                <img :src="workout.imageUrl || 'https://placehold.co/200x150'" :alt="workout.title">
                <div class="play-button">▶</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import aiService from '../services/githubAiService';
import { auth } from '../firebase/firebase';

export default {
  setup() {
    const recommendations = ref([]);
    const recommendationHistory = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const showHistory = ref(false);
    const activeTimers = ref(new Map()); // Track active timers
    const remainingTimes = ref(new Map()); // Track remaining times

    const hasRecommendations = computed(() => {
      return recommendations.value.length > 0;
    });

    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    };

    const toggleHistory = () => {
      showHistory.value = !showHistory.value;
    };

    const fetchRecommendations = async (forceRefresh = false) => {
      try {
        loading.value = true;
        error.value = null;
        showHistory.value = false; // Hide history when fetching new recommendations
        
        // Check authentication state
        const user = auth.currentUser;
        if (!user) {
          console.log('User not authenticated - using sample data');
          const sampleData = aiService.getSampleRecommendations();
          recommendations.value = sampleData.fitnessRecommendations;
          return;
        }
        
        // Try to get saved recommendations first
        const savedRecommendations = await aiService.getSavedRecommendations();
        
        // Get recommendation history
        recommendationHistory.value = await aiService.getRecommendationHistory();
        
        // Check if we should generate new recommendations
        const shouldGenerateNew = forceRefresh || 
          !savedRecommendations || 
          !savedRecommendations.fitnessRecommendations ||
          !savedRecommendations.timestamp ||
          // Check if recommendations are older than 24 hours
          (Date.now() - savedRecommendations.timestamp.toMillis() > 24 * 60 * 60 * 1000);
        
        if (!shouldGenerateNew) {
          console.log('Using saved recommendations from Firebase');
          recommendations.value = savedRecommendations.fitnessRecommendations;
        } else {
          console.log('Generating new recommendations');
          // Generate new recommendations
          const newRecommendations = await aiService.generateRecommendations();
          recommendations.value = newRecommendations.fitnessRecommendations;
        }
      } catch (err) {
        console.error('Error in fetchRecommendations:', err);
        
        if (err.message === 'GitHub token is not configured') {
          error.value = 'GitHub AI service is not properly configured. Please contact support.';
        } else {
          error.value = 'Failed to load recommendations. Please try again later.';
        }
        
        // Only use sample data if we have no existing recommendations
        if (recommendations.value.length === 0) {
          console.log('Using sample data as fallback');
          const sampleData = aiService.getSampleRecommendations();
          recommendations.value = sampleData.fitnessRecommendations;
        }
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await fetchRecommendations(false);
    });

    const handleRefreshClick = () => {
      fetchRecommendations(true);
    };

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const startTimer = (workoutId, duration) => {
      if (activeTimers.value.has(workoutId)) {
        // Stop timer if already running
        clearInterval(activeTimers.value.get(workoutId));
        activeTimers.value.delete(workoutId);
        remainingTimes.value.delete(workoutId);
        return;
      }

      // Convert duration from minutes to seconds
      let remainingSeconds = duration * 60;
      remainingTimes.value.set(workoutId, remainingSeconds);

      const timerId = setInterval(() => {
        remainingSeconds--;
        remainingTimes.value.set(workoutId, remainingSeconds);

        if (remainingSeconds <= 0) {
          clearInterval(timerId);
          activeTimers.value.delete(workoutId);
          remainingTimes.value.delete(workoutId);
        }
      }, 1000);

      activeTimers.value.set(workoutId, timerId);
    };

    return {
      recommendations,
      recommendationHistory,
      loading,
      error,
      showHistory,
      fetchRecommendations,
      handleRefreshClick,
      formatDate,
      toggleHistory,
      formatTime,
      startTimer,
      activeTimers,
      remainingTimes
    };
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #1B4D3E, #1A1A1A 50%, #000000 100%);
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

.workout-section {
  margin-bottom: 24px;
  margin-top: 30px;
}

.workout-section h2 {
  font-size: 20px;
  font-weight: 500;
  color: white;
  margin-bottom: 16px;
}

.workout-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workout-card {
  background: #4A90E2;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  color: white;
  overflow: hidden;
}

.workout-card.inactive {
  background: #9E9E9E;
}

.workout-info {
  flex: 1;
}

.workout-info h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.workout-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.4;
}

.workout-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.workout-image {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
}

.workout-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A90E2;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-button.active {
  background: #4A90E2;
  color: white;
}

.play-button:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.inactive .play-button {
  color: #9E9E9E;
}

.loading-container,
.error-container,
.no-recommendations {
  text-align: center;
  padding: 24px;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner {
  margin-bottom: 16px;
}

.retry-button,
.generate-button {
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
}

.retry-button:hover,
.generate-button:hover {
  background-color: #1557b0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
}

.refresh-button {
  background-color: #ffb700;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #ffc83e;
}

.show-more-section {
  display: flex;
  justify-content: center;
}

.show-more-button {
  background-color: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  margin-bottom: 70px;
}

.show-more-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.history-section {
  margin-top: 40px;
  opacity: 0.8;
}

.history-date {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: inline-block;
}

.history-item {
  margin-bottom: 32px;
}

.history-card {
  background: rgba(74, 144, 226, 0.7);
}

.content-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
}

.workout-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workout-card {
  background: #4A90E2;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  color: white;
  overflow: hidden;
}

.history-card {
  background: rgba(74, 144, 226, 0.7);
}

.history-date {
  color: #fff;
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.history-section {
  margin-top: 20px;
}

.history-item {
  margin-bottom: 20px;
}

.show-more-section {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.show-more-button {
  background-color: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
  padding: 12px 24px;
  border-radius: 24px;
  font-weight: 500;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.show-more-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: white;
}

.refresh-button {
  background-color: #ffb700;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.refresh-button:hover {
  background-color: #ffc83e;
}
</style> 