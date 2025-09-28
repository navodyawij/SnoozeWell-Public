<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft } from "lucide-vue-next";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "DailyRoutineQuestionnaire",
  components: { ChevronLeft },
  setup() {
    const router = useRouter();
    const wakeUpTime = ref(null);
    const bedTime = ref(null);
    const energyLevel = ref(null);
    const isSubmitting = ref(false);
    const db = getFirestore();
    const auth = getAuth();

    // Add mapping for energy level descriptions
    const energyLevelTexts = {
      'Low': 'Low energy throughout the day',
      'Moderate': 'Moderate energy levels',
      'High': 'High energy throughout the day'
    };

    const isFormValid = computed(() => {
      return wakeUpTime.value !== null && 
             bedTime.value !== null && 
             energyLevel.value !== null;
    });

    const goBack = () => {
      router.go(-1);
    };

    const selectWakeUpTime = (time) => {
      wakeUpTime.value = time;
    };

    const selectBedTime = (time) => {
      bedTime.value = time;
    };

    const selectEnergyLevel = (level) => {
      energyLevel.value = level;
    };

    const saveToFirestore = async () => {
      try {
        isSubmitting.value = true;
        
        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
          console.error("No user logged in");
          alert("Please log in to save your data");
          router.push("/auth/login");
          return;
        }
        
        // Create the data object with full text descriptions
        const routineData = {
          wakeUpTime: wakeUpTime.value,
          bedTime: bedTime.value,
          energyLevel: energyLevel.value,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          questionnaireType: 'initial',
          section: 'daily-routine'
        };
        
        // Save to user's document in Firestore under profile
        await setDoc(doc(db, "users", user.uid), {
          profile: {
            assessments: {
              routine: routineData
            }
          }
        }, { merge: true });
        
        // Redirect to next page
        router.push("/auth/sleeppattern4");
        
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error saving your data. Please try again.");
      } finally {
        isSubmitting.value = false;
      }
    };

    const goToNext = () => {
      // Basic validation
      if (!wakeUpTime.value) {
        alert("Please select your typical wake-up time.");
        return;
      }
      
      if (!bedTime.value) {
        alert("Please select your typical bed time.");
        return;
      }
      
      if (!energyLevel.value) {
        alert("Please select your energy level.");
        return;
      }
      
      // Save data to Firestore and proceed
      saveToFirestore();
    };

    return {
      wakeUpTime,
      bedTime,
      energyLevel,
      isSubmitting,
      isFormValid,
      goBack,
      selectWakeUpTime,
      selectBedTime,
      selectEnergyLevel,
      goToNext,
    };
  },
};
</script>

<template>
  <div class="questionnaire-container">
    <div class="header">
      <button class="back-button" type="button" @click.stop="goBack">
        <ChevronLeft size="24" />
      </button>
      <div class="title-container">
        <h1 class="title">QUESTIONNAIRE</h1>
        <p class="subtitle">Daily Routine</p>
      </div>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="question-section">
        <h2 class="question">What time do you typically wake up?</h2>
        <div class="options">
          <button 
            v-for="time in ['4:00 AM - 5:00 AM', '5:00 AM - 6:00 AM', '6:00 AM - 8:00 AM', '7:00 AM - 10:00 AM']"
            :key="time" 
            class="option-button" 
            :class="{ 'selected': wakeUpTime === time }"
            @click="selectWakeUpTime(time)"
          >
            {{ time }}
          </button>
        </div>
      </div>

      <div class="question-section">
        <h2 class="question">What time do you usually go to bed?</h2>
        <div class="options">
          <button 
            v-for="time in ['9:00 - 11:00 PM', '11:00 - 12:00 PM', '12:00 - 1:00 AM', '1:00 - 2:00 AM']"
            :key="time" 
            class="option-button" 
            :class="{ 'selected': bedTime === time }"
            @click="selectBedTime(time)"
          >
            {{ time }}
          </button>
        </div>
      </div>

      <div class="question-section">
        <h2 class="question">How would you describe your daily energy levels?</h2>
        <div class="options">
          <button 
            v-for="level in ['Low', 'Moderate', 'High']"
            :key="level" 
            class="option-button" 
            :class="{ 'selected': energyLevel === level }"
            @click="selectEnergyLevel(level)"
          >
            {{ level }}
          </button>
        </div>
      </div>
    </div>

    <div class="pagination">
        <div class="components">
          <div class="indicators">
            <div class="indicator"></div>
            <div class="indicator"></div>
            <div class="indicator"></div>
            <div class="indicator"></div>
            <div class="indicator"></div>
            <div class="indicator active"></div>
            <div class="indicator"></div>
            <div class="indicator"></div>
          </div>
          
          <button 
            class="next-button" 
            @click="goToNext"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting ? 'SAVING...' : 'NEXT' }}
          </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.questionnaire-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-image: url('../assets/ProfileSetup.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.questionnaire-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  padding-top: calc(40px + env(safe-area-inset-top, 0px));
  font-size: 20px;
  font-weight: 300;
  color: #fff;
  position: fixed;
  top: env(safe-area-inset-top, 0);
  left: 0;
  right: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 32px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  position: relative;
  z-index: 11;
  margin: -32px;
}

.title-container {
  flex: 1;
  text-align: center;
  margin: 0 -40px;
}

.title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  color: #fff;
}

.subtitle {
  font-size: 14px;
  color: #fff;
  margin: 4px 0 0 0;
}

.placeholder {
  width: 40px;
}

.content {
  flex: 1;
  position: fixed;
  top: calc(110px + env(safe-area-inset-top, 0));
  bottom: 100px;
  left: 0;
  right: 0;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

/* WebKit scrollbar styles */
.content::-webkit-scrollbar {
  width: 6px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  border: transparent;
}

.content > div {
  max-width: 360px;
  margin: 0 auto;
  width: 100%;
  padding-bottom: env(safe-area-inset-bottom, 20px);
}

.question-section {
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.question {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  line-height: 1.4;
  color: #fff;
  text-align: center;
  max-width: 280px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.option-button {
  padding: 16px;
  border-radius: 50px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: background-color 0.2s;
  width: 100%;
  max-width: 280px;
  backdrop-filter: blur(5px);
}

.option-button.selected {
  background-color: #ffb800;
  color: #000;
}

.pagination {
  width: 100%;
  padding: 24px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  z-index: 10;
  padding-bottom: calc(32px + env(safe-area-inset-bottom, 0px));
}

.components {
  width: 100%;
  max-width: 360px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.indicators {
  display: flex;
  gap: 15px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
}

.indicator.active {
  background-color: #ffb800;
}

.next-button {
  background-color: rgba(255, 255, 255, 0.3);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
}

.next-button:not(:disabled) {
  background-color: #ffb800;
  color: #000;
}

.next-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
