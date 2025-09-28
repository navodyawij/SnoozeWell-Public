<template>
  <div class="page-container">
    <div class="header">
      <div class="header-content">
        <h1>Relaxation Routines</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your personalized relaxation routines...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchRecommendations" class="retry-button">Try Again</button>
    </div>

    <!-- Scrollable Content -->
    <main v-else class="content">
      <div v-if="!hasRecommendations" class="no-recommendations">
        <p>No relaxation routines available. Click the button below to generate personalized recommendations.</p>
        <button @click="fetchRecommendations" class="generate-button">Generate Recommendations</button>
      </div>

      <!-- Current Recommendations -->
      <div v-else>
        <!-- Section Header -->
        <div class="section-header content-box">
          <h2>Today's Relaxation Routines</h2>
          <button @click="handleRefreshClick" class="refresh-button">
            Refresh Recommendations
          </button>
        </div>

        <!-- Yoga Section -->
        <section v-if="yogaRoutines.length > 0" class="routine-section content-box">
          <h2>Yoga Routines</h2>
          <div class="routine-list">
            <div 
              v-for="(routine, index) in yogaRoutines" 
              :key="`yoga-${index}`" 
              class="routine-card yoga-card"
            >
              <div class="routine-info">
                <h3>{{ routine.title }}</h3>
                <p class="routine-description">{{ routine.description }}</p>
                <div class="routine-details">
                  <span class="detail">
                    <i class="time-icon">⏱</i>
                    {{ remainingTimes.has(`yoga-${index}`) ? formatTime(remainingTimes.get(`yoga-${index}`)) : `${routine.durationMinutes} Minutes` }}
                  </span>
                  <span class="detail">
                    <i class="level-icon">🎯</i>
                    {{ routine.level }}
                  </span>
                </div>
              </div>
              <div class="routine-image">
                <img :src="routine.imageUrl || 'https://placehold.co/200x150'" :alt="routine.title">
                <div 
                  class="play-button"
                  :class="{ 'active': activeTimers.has(`yoga-${index}`) }"
                  @click="startTimer(`yoga-${index}`, routine.durationMinutes)"
                >
                  {{ activeTimers.has(`yoga-${index}`) ? '⏸' : '▶' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Meditation Section -->
        <section v-if="meditationRoutines.length > 0" class="routine-section content-box">
          <h2>Meditation</h2>
          <div class="routine-list">
            <div 
              v-for="(routine, index) in meditationRoutines" 
              :key="`meditation-${index}`" 
              class="routine-card meditation-card"
            >
              <div class="routine-info">
                <h3>{{ routine.title }}</h3>
                <p class="routine-description">{{ routine.description }}</p>
                <div class="routine-details">
                  <span class="detail">
                    <i class="time-icon">⏱</i>
                    {{ remainingTimes.has(`meditation-${index}`) ? formatTime(remainingTimes.get(`meditation-${index}`)) : `${routine.durationMinutes} Minutes` }}
                  </span>
                  <span class="detail">
                    <i class="type-icon">🧘</i>
                    {{ routine.level }}
                  </span>
                </div>
              </div>
              <div class="routine-image">
                <img :src="routine.imageUrl || 'https://placehold.co/200x150'" :alt="routine.title">
                <div 
                  class="play-button"
                  :class="{ 'active': activeTimers.has(`meditation-${index}`) }"
                  @click="startTimer(`meditation-${index}`, routine.durationMinutes)"
                >
                  {{ activeTimers.has(`meditation-${index}`) ? '⏸' : '▶' }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Sleep Tips Section -->
        <section v-if="sleepTips.length > 0" class="routine-section content-box">
          <h2>Sleep Tips</h2>
          <div class="routine-list">
            <div 
              v-for="(tip, index) in sleepTips" 
              :key="`tip-${index}`" 
              class="routine-card sleep-card"
            >
              <div class="routine-info">
                <h3>{{ tip.title }}</h3>
                <p class="routine-description">{{ tip.description }}</p>
                <div class="routine-details">
                  <span class="detail">
                    <i class="time-icon">⏱</i>
                    {{ remainingTimes.has(`tip-${index}`) ? formatTime(remainingTimes.get(`tip-${index}`)) : `${tip.durationMinutes} Minutes` }}
                  </span>
                  <span class="detail">
                    <i class="tips-icon">💡</i>
                    Quick Tips
                  </span>
                </div>
              </div>
              <div class="routine-image">
                <img :src="tip.imageUrl || 'https://placehold.co/200x150'" :alt="tip.title">
                <div 
                  class="play-button"
                  :class="{ 'active': activeTimers.has(`tip-${index}`) }"
                  @click="startTimer(`tip-${index}`, tip.durationMinutes)"
                >
                  {{ activeTimers.has(`tip-${index}`) ? '⏸' : '▶' }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Show More Button -->
      <div v-if="recommendationHistory.length > 0" class="show-more-section">
        <button @click="toggleHistory" class="show-more-button">
          {{ showHistory ? 'Hide Previous Recommendations' : 'Tap to See Previous Recommendations' }}
        </button>
      </div>

      <!-- Historical Recommendations Section -->
      <div v-if="showHistory && recommendationHistory.length > 0" class="history-section">
        <h2>Previous Recommendations</h2>
        <div v-for="(historyItem, historyIndex) in recommendationHistory" :key="historyIndex" class="history-item">
          <h3 class="history-date">{{ formatDate(historyItem.movedToHistoryAt) }}</h3>
          
          <!-- Historical Yoga Section -->
          <section v-if="historyItem.relaxationRoutines?.yoga?.length" class="routine-section content-box">
            <h3>Yoga Routines</h3>
            <div class="routine-list">
              <div 
                v-for="(routine, index) in historyItem.relaxationRoutines.yoga" 
                :key="`history-yoga-${historyIndex}-${index}`" 
                class="routine-card yoga-card history-card"
              >
                <div class="routine-info">
                  <h3>{{ routine.title }}</h3>
                  <p class="routine-description">{{ routine.description }}</p>
                  <div class="routine-details">
                    <span class="detail">
                      <i class="time-icon">⏱</i>
                      {{ routine.durationMinutes }} Minutes
                    </span>
                    <span class="detail">
                      <i class="level-icon">🎯</i>
                      {{ routine.level }}
                    </span>
                  </div>
                </div>
                <div class="routine-image">
                  <img :src="routine.imageUrl || 'https://placehold.co/200x150'" :alt="routine.title">
                  <div class="play-button">▶</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Historical Meditation Section -->
          <section v-if="historyItem.relaxationRoutines?.meditation?.length" class="routine-section content-box">
            <h3>Meditation</h3>
            <div class="routine-list">
              <div 
                v-for="(routine, index) in historyItem.relaxationRoutines.meditation" 
                :key="`history-meditation-${historyIndex}-${index}`" 
                class="routine-card meditation-card history-card"
              >
                <div class="routine-info">
                  <h3>{{ routine.title }}</h3>
                  <p class="routine-description">{{ routine.description }}</p>
                  <div class="routine-details">
                    <span class="detail">
                      <i class="time-icon">⏱</i>
                      {{ routine.durationMinutes }} Minutes
                    </span>
                    <span class="detail">
                      <i class="type-icon">🧘</i>
                      {{ routine.level }}
                    </span>
                  </div>
                </div>
                <div class="routine-image">
                  <img :src="routine.imageUrl || 'https://placehold.co/200x150'" :alt="routine.title">
                  <div class="play-button">▶</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Historical Sleep Tips Section -->
          <section v-if="historyItem.relaxationRoutines?.sleepTips?.length" class="routine-section content-box">
            <h3>Sleep Tips</h3>
            <div class="routine-list">
              <div 
                v-for="(tip, index) in historyItem.relaxationRoutines.sleepTips" 
                :key="`history-tip-${historyIndex}-${index}`" 
                class="routine-card sleep-card history-card"
              >
                <div class="routine-info">
                  <h3>{{ tip.title }}</h3>
                  <p class="routine-description">{{ tip.description }}</p>
                  <div class="routine-details">
                    <span class="detail">
                      <i class="time-icon">⏱</i>
                      {{ tip.durationMinutes }} Minutes
                    </span>
                    <span class="detail">
                      <i class="tips-icon">💡</i>
                      Quick Tips
                    </span>
                  </div>
                </div>
                <div class="routine-image">
                  <img :src="tip.imageUrl || 'https://placehold.co/200x150'" :alt="tip.title">
                  <div class="play-button">▶</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import aiService from '../services/githubAiService';
import { auth } from '../firebase/firebase';

export default {
  setup() {
    const yogaRoutines = ref([]);
    const meditationRoutines = ref([]);
    const sleepTips = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const recommendations = ref([]);
    const recommendationHistory = ref([]);
    const showHistory = ref(false);
    const activeTimers = ref(new Map()); // Track active timers
    const remainingTimes = ref(new Map()); // Track remaining times

    const hasRecommendations = computed(() => {
      return yogaRoutines.value.length > 0 || 
             meditationRoutines.value.length > 0 || 
             sleepTips.value.length > 0;
    });

    const formatTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const startTimer = (routineId, duration) => {
      if (activeTimers.value.has(routineId)) {
        // Stop timer if already running
        clearInterval(activeTimers.value.get(routineId));
        activeTimers.value.delete(routineId);
        remainingTimes.value.delete(routineId);
        return;
      }

      // Convert duration from minutes to seconds
      let remainingSeconds = duration * 60;
      remainingTimes.value.set(routineId, remainingSeconds);

      const timerId = setInterval(() => {
        remainingSeconds--;
        remainingTimes.value.set(routineId, remainingSeconds);

        if (remainingSeconds <= 0) {
          clearInterval(timerId);
          activeTimers.value.delete(routineId);
          remainingTimes.value.delete(routineId);
        }
      }, 1000);

      activeTimers.value.set(routineId, timerId);
    };

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
          recommendations.value = sampleData.relaxationRoutines;
        } else {
          // Try to get saved recommendations first
          const savedRecommendations = await aiService.getSavedRecommendations();
          
          // Get recommendation history
          recommendationHistory.value = await aiService.getRecommendationHistory();
          
          // Check if we should generate new recommendations
          const shouldGenerateNew = forceRefresh || 
            !savedRecommendations || 
            !savedRecommendations.relaxationRoutines ||
            !savedRecommendations.timestamp ||
            (Date.now() - savedRecommendations.timestamp.toMillis() > 24 * 60 * 60 * 1000);
          
          if (!shouldGenerateNew) {
            recommendations.value = savedRecommendations.relaxationRoutines;
          } else {
            const newRecommendations = await aiService.generateRecommendations();
            recommendations.value = newRecommendations.relaxationRoutines;
          }
        }

        if (recommendations.value) {
          yogaRoutines.value = recommendations.value.yoga || [];
          meditationRoutines.value = recommendations.value.meditation || [];
          sleepTips.value = recommendations.value.sleepTips || [];
        }
      } catch (err) {
        console.error('Error in fetchRecommendations:', err);
        
        if (err.message === 'GitHub token is not configured') {
          error.value = 'GitHub AI service is not properly configured. Please contact support.';
        } else {
          error.value = 'Failed to load recommendations. Please try again later.';
        }
        
        if (!recommendations.value) {
          const sampleData = aiService.getSampleRecommendations();
          recommendations.value = sampleData.relaxationRoutines;
          yogaRoutines.value = recommendations.value.yoga || [];
          meditationRoutines.value = recommendations.value.meditation || [];
          sleepTips.value = recommendations.value.sleepTips || [];
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

    return {
      yogaRoutines,
      meditationRoutines,
      sleepTips,
      loading,
      error,
      hasRecommendations,
      recommendationHistory,
      showHistory,
      fetchRecommendations,
      handleRefreshClick,
      formatDate,
      toggleHistory,
      startTimer,
      formatTime,
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
  background: linear-gradient(180deg, #993366 0%, #1A1A1A 50%, #000000 100%);
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
  padding: 24px 0px;
  margin-top: 10px;
}

.content-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.routine-section {
  margin-bottom: 24px;
}

.routine-section h2 {
  font-size: 20px;
  font-weight: 500;
  color: white;
  margin-bottom: 16px;
}

.routine-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.routine-card {
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  color: white;
  overflow: hidden;
}

.yoga-card {
  background: #03A791;
}

.meditation-card {
  background: #FF9A9A;
}

.sleep-card {
  background: #BDB395;
}

.routine-info {
  flex: 1;
}

.routine-info h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.routine-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.4;
}

.routine-details {
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

.routine-image {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
}

.routine-image img {
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
  color: white;
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
  margin-bottom: 70px;
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

.history-section {
  margin-top: 40px;
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
  opacity: 0.8;
}

.history-section .routine-section {
  margin-bottom: 16px;
}

.history-section h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
}
</style> 