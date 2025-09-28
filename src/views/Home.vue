<template>
  <div class="home-container">
    <header class="header">
      <img src="../assets/LogoWhite.png" alt="SnoozeWell Logo" class="logo" />
      <h1>SnoozeWell</h1>
    </header>
    <div class="content">
      <div class="content-card">
        <h2 class="title">Welcome Back{{ isLoading ? '...' : (userData.name ? ', ' + userData.name : '!') }} !</h2>
        <p class="description">Track your sleep patterns and improve your well-being</p>
      </div>

      <div class="content-card stats-card" @click="navigateToInsights">
        <div class="section-header">
          <h2>Your Health Stats</h2>
          <div class="view-more" @click="navigateToInsights">
            <span>View more</span>
            <span class="arrow">→</span>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">🌙</div>
            <div class="stat-value">{{ latestSleepHours }}h</div>
            <div class="stat-label">Sleep Time</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">❤️</div>
            <div class="stat-value">{{ latestHeartRate }} bpm</div>
            <div class="stat-label">Heart Rate</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon steps-icon">👣</div>
            <div class="stat-value">{{ latestSteps }}</div>
            <div class="stat-label">Steps</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">{{ latestCalories }}</div>
            <div class="stat-label">Calories</div>
          </div>
        </div>
      </div>

      <!-- Today's Recommendations Section -->
      <div class="content-card recommendations-card">
        <div class="section-header">
          <h2>Today's Recommendations</h2>
          <div class="view-more" @click="navigateToFitness">
            <span>View more</span>
            <span class="arrow">→</span>
          </div>
        </div>
        <div v-if="loading" class="loading-container">
          <p>Loading recommendations...</p>
        </div>
        <div v-else-if="error" class="error-container">
          <p>{{ error }}</p>
        </div>
        <div v-else class="recommendations-scroll">
          <div class="recommendations-grid">
            <div 
              v-for="(workout, index) in recommendations" 
              :key="index" 
              class="recommendation-item"
              @click="navigateToFitness"
            >
              <div class="recommendation-image">
                <img :src="workout.imageUrl || 'https://placehold.co/200x150'" :alt="workout.title">
                <div class="play-overlay">▶</div>
              </div>
              <div class="recommendation-info">
                <h3>{{ workout.title }}</h3>
                <div class="recommendation-meta">
                  <span>
                    <i class="time-icon">⏱</i>
                    {{ workout.durationMinutes }} Minutes
                  </span>
                  <span>
                    <i class="exercise-icon">💪</i>
                    {{ workout.exercises || 5 }} Exercises
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Relaxation Routines Section -->
      <div class="content-card relaxation-card">
        <div class="section-header">
          <h2>Relaxation Routines</h2>
          <div class="view-more" @click="navigateToRelaxation">
            <span>View more</span>
            <span class="arrow">→</span>
          </div>
        </div>
        <div v-if="relaxationLoading" class="loading-container">
          <p>Loading relaxation routines...</p>
        </div>
        <div v-else-if="relaxationError" class="error-container">
          <p>{{ relaxationError }}</p>
        </div>
        <div v-else class="recommendations-scroll">
          <div class="recommendations-grid">
            <!-- Yoga Routines -->
            <div 
              v-for="(routine, index) in yogaRoutines" 
              :key="`yoga-${index}`" 
              class="recommendation-item yoga-item"
              @click="navigateToRelaxation"
            >
              <div class="recommendation-image">
                <img :src="routine.imageUrl || 'https://placehold.co/200x150'" :alt="routine.title">
                <div class="play-overlay">▶</div>
              </div>
              <div class="recommendation-info">
                <h3>{{ routine.title }}</h3>
                <div class="recommendation-meta">
                  <span>
                    <i class="time-icon">⏱</i>
                    {{ routine.durationMinutes }} Minutes
                  </span>
                  <span>
                    <i class="level-icon">🎯</i>
                    {{ routine.level }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Meditation Routines -->
            <div 
              v-for="(routine, index) in meditationRoutines" 
              :key="`meditation-${index}`" 
              class="recommendation-item meditation-item"
              @click="navigateToRelaxation"
            >
              <div class="recommendation-image">
                <img :src="routine.imageUrl || 'https://placehold.co/200x150'" :alt="routine.title">
                <div class="play-overlay">▶</div>
              </div>
              <div class="recommendation-info">
                <h3>{{ routine.title }}</h3>
                <div class="recommendation-meta">
                  <span>
                    <i class="time-icon">⏱</i>
                    {{ routine.durationMinutes }} Minutes
                  </span>
                  <span>
                    <i class="type-icon">🧘</i>
                    {{ routine.level }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Sleep Tips -->
            <div 
              v-for="(tip, index) in sleepTips" 
              :key="`tip-${index}`" 
              class="recommendation-item sleep-item"
              @click="navigateToRelaxation"
            >
              <div class="recommendation-image">
                <img :src="tip.imageUrl || 'https://placehold.co/200x150'" :alt="tip.title">
                <div class="play-overlay">▶</div>
              </div>
              <div class="recommendation-info">
                <h3>{{ tip.title }}</h3>
                <div class="recommendation-meta">
                  <span>
                    <i class="time-icon">⏱</i>
                    {{ tip.durationMinutes }} Minutes
                  </span>
                  <span>
                    <i class="tips-icon">💡</i>
                    Quick Tips
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import healthData from '../data/mockHealthData.json';
import aiService from '../services/githubAiService';

const router = useRouter();
const user = ref(null);
const isLoading = ref(true);
const userData = ref({
  name: "",
});

// Fitness recommendations data
const recommendations = ref([]);
const loading = ref(false);
const error = ref(null);

// Relaxation routines data
const yogaRoutines = ref([]);
const meditationRoutines = ref([]);
const sleepTips = ref([]);
const relaxationLoading = ref(false);
const relaxationError = ref(null);

// Get latest health data
const latestSleepHours = ref(healthData.healthData[healthData.healthData.length - 1].sleepHours);
const latestHeartRate = ref(healthData.healthData[healthData.healthData.length - 1].heartRate.average);
const latestSteps = ref(healthData.healthData[healthData.healthData.length - 1].stepCount);
const latestCalories = ref(healthData.healthData[healthData.healthData.length - 1].caloriesBurned);

const navigateToInsights = () => {
  router.push('/insightsandtrends');
};

const navigateToFitness = () => {
  router.push('/fitnessplan');
};

const navigateToRelaxation = () => {
  router.push('/relaxationroutines');
};

const fetchRecommendations = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const user = getAuth().currentUser;
    if (!user) {
      const sampleData = aiService.getSampleRecommendations();
      recommendations.value = sampleData.fitnessRecommendations;
      return;
    }
    
    const savedRecommendations = await aiService.getSavedRecommendations();
    if (savedRecommendations && savedRecommendations.fitnessRecommendations) {
      recommendations.value = savedRecommendations.fitnessRecommendations;
    } else {
      const sampleData = aiService.getSampleRecommendations();
      recommendations.value = sampleData.fitnessRecommendations;
    }
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    error.value = 'Failed to load recommendations';
  } finally {
    loading.value = false;
  }
};

const fetchRelaxationRoutines = async () => {
  try {
    relaxationLoading.value = true;
    relaxationError.value = null;
    
    const user = getAuth().currentUser;
    if (!user) {
      const sampleData = aiService.getSampleRecommendations();
      const relaxationData = sampleData.relaxationRoutines;
      yogaRoutines.value = relaxationData.yoga || [];
      meditationRoutines.value = relaxationData.meditation || [];
      sleepTips.value = relaxationData.sleepTips || [];
      return;
    }
    
    const savedRecommendations = await aiService.getSavedRecommendations();
    if (savedRecommendations && savedRecommendations.relaxationRoutines) {
      const relaxationData = savedRecommendations.relaxationRoutines;
      yogaRoutines.value = relaxationData.yoga || [];
      meditationRoutines.value = relaxationData.meditation || [];
      sleepTips.value = relaxationData.sleepTips || [];
    } else {
      const sampleData = aiService.getSampleRecommendations();
      const relaxationData = sampleData.relaxationRoutines;
      yogaRoutines.value = relaxationData.yoga || [];
      meditationRoutines.value = relaxationData.meditation || [];
      sleepTips.value = relaxationData.sleepTips || [];
    }
  } catch (err) {
    console.error('Error fetching relaxation routines:', err);
    relaxationError.value = 'Failed to load relaxation routines';
  } finally {
    relaxationLoading.value = false;
  }
};

const fetchUserData = async (user) => {
  try {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.profile?.basic) {
        userData.value = {
          name: data.profile.basic.name,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const auth = getAuth();
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
    if (currentUser) {
      fetchUserData(currentUser);
    } else {
      isLoading.value = false;
    }
  });
  fetchRecommendations();
  fetchRelaxationRoutines();
});
</script>

<style scoped>
.home-container {
  padding: 20px;
  min-height: 100vh;
  color: white;
  background: linear-gradient(180deg, #58165d 0%, #1A1A1A 50%, #000000 100%);
  padding-top: calc(20px + env(safe-area-inset-top, 0px));
  padding-left: calc(20px + env(safe-area-inset-left, 0px));
  padding-right: calc(20px + env(safe-area-inset-right, 0px));
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  padding: 20px 20px;
  margin: -5px -5px -5px -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: calc(50px + env(safe-area-inset-top, 0px));
  padding-left: calc(20px + env(safe-area-inset-left, 0px));
  padding-right: calc(20px + env(safe-area-inset-right, 0px));
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.logo {
  width: 50px;
  height: auto;
  animation: fadeIn 0.5s ease-in;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 1;
  margin: 0 auto;
  width: 100%;
  margin-top: 100px;  
  margin-bottom: 100px;
}

.content-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border-radius: 16px;
  padding: 24px;
  color: white;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 16px;
}

.description {
  font-size: 16px;
  line-height: 1.5;
  opacity: 0.8;
}

.stats-card {
  padding: 20px;
  margin-top: 16px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
}

.stat-item {
  background: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: rgb(0, 0, 0);
}

.stat-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.437);
}

.view-more {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a73e8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.arrow {
  transition: transform 0.2s ease;
}

.content-card:hover .arrow {
  transform: translateX(4px);
}

.steps-icon {
  filter: saturate(0) invert(1);
}

.recommendations-card {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.recommendations-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px;
  margin: -4px;
  margin-bottom: 16px;
}

.recommendations-scroll::-webkit-scrollbar {
  display: none;
}

.recommendations-grid {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  width: max-content;
}

.recommendation-item {
  flex: 0 0 200px;
  background: #4A90E2;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.yoga-item {
  background: #03A791;
}

.meditation-item {
  background: #FF9A9A;
}

.sleep-item {
  background: #BDB395;
}

.recommendation-image {
  position: relative;
  width: 100%;
  height: 100px;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
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
}

.recommendation-info {
  padding: 8px;
}

.recommendation-info h3 {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommendation-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.loading-container,
.error-container {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.8);
}

/* Remove the old media query for recommendations-grid since we want horizontal scroll on all screen sizes */
@media (max-width: 600px) {
  .recommendation-item {
    flex: 0 0 160px;
  }

  .recommendation-image {
    height: 90px;
  }
}
</style>