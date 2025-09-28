<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft } from "lucide-vue-next";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "FitnessQuestionnaire",
  components: { ChevronLeft },
  setup() {
    const router = useRouter();
    const currentStep = ref(1);
    const totalSteps = 3;
    const isSubmitting = ref(false);
    
    // Firebase instances
    const db = getFirestore();
    const auth = getAuth();
    
    // Add mappings for text descriptions
    const fitnessGoalTexts = {
      'improve-sleep': 'Improve sleep quality',
      'increase-activity': 'Increase physical activity',
      'manage-weight': 'Manage weight',
      'build-strength': 'Build strength/flexibility'
    };
    
    const activityTexts = {
      'yoga': 'Yoga',
      'aerobic': 'Aerobic exercises',
      'strength': 'Strength training',
      'walking': 'Walking',
      'other': 'Other'
    };
    
    // Track selected answers
    const fitnessGoal = ref(null);
    const activityPreferences = ref([]);
    const followsRoutine = ref(null);
    
    const goBack = () => {
      router.go(-1);
    };
    
    const selectFitnessGoal = (goal) => {
      fitnessGoal.value = goal;
    };
    
    const toggleActivityPreference = (activity) => {
      if (activityPreferences.value.includes(activity)) {
        activityPreferences.value = activityPreferences.value.filter(item => item !== activity);
      } else {
        activityPreferences.value.push(activity);
      }
    };
    
    const selectFollowsRoutine = (value) => {
      followsRoutine.value = value;
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
        const fitnessData = {
          fitnessGoal: fitnessGoalTexts[fitnessGoal.value],
          activityPreferences: activityPreferences.value.map(code => activityTexts[code]),
          followsRoutine: followsRoutine.value ? 'Yes' : 'No',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          questionnaireType: 'initial',
          section: 'fitness-preferences'
        };
        
        // Save to user's document in Firestore under profile
        await setDoc(doc(db, "users", user.uid), {
          profile: {
            assessments: {
              fitness: fitnessData
            }
          }
        }, { merge: true });
        
        // Redirect to next page
        router.push("/auth/sleeppattern3");
        
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error saving your data. Please try again.");
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const goToNext = () => {
      // Basic validation
      if (!fitnessGoal.value) {
        alert("Please select your primary fitness goal.");
        return;
      }
      
      if (activityPreferences.value.length === 0) {
        alert("Please select at least one activity preference.");
        return;
      }
      
      if (followsRoutine.value === null) {
        alert("Please indicate whether you follow an exercise routine.");
        return;
      }
      
      // Save data to Firestore and proceed
      saveToFirestore();
    };

    const isFormValid = computed(() => {
      return fitnessGoal.value !== null && 
             activityPreferences.value.length > 0 && 
             followsRoutine.value !== null;
    });

    return {
      currentStep,
      totalSteps,
      fitnessGoal,
      activityPreferences,
      followsRoutine,
      isSubmitting,
      isFormValid,
      goBack,
      selectFitnessGoal,
      toggleActivityPreference,
      selectFollowsRoutine,
      goToNext
    };
  },
};
</script>

<template>
  <div class="questionnaire-container">
    <div class="header">
      <button class="back-button" @click="goBack">
        <ChevronLeft size="24" />
      </button>
      <div class="title-container">
        <h1 class="title">QUESTIONNAIRE</h1>
        <p class="subtitle">Fitness Preferences</p>
      </div>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="question-section">
        <h2 class="question">What is your primary fitness goal?</h2>
        
        <div class="options">
          <button 
            class="option-button" 
            :class="{ 'selected': fitnessGoal === 'improve-sleep' }"
            @click="selectFitnessGoal('improve-sleep')"
          >
            Improve sleep quality
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': fitnessGoal === 'increase-activity' }"
            @click="selectFitnessGoal('increase-activity')"
          >
            Increase physical activity
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': fitnessGoal === 'manage-weight' }"
            @click="selectFitnessGoal('manage-weight')"
          >
            Manage weight
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': fitnessGoal === 'build-strength' }"
            @click="selectFitnessGoal('build-strength')"
          >
            Build strength/flexibility
          </button>
        </div>
      </div>
      
      <div class="question-section">
        <h2 class="question">What types of activities do you prefer?</h2>
        
        <div class="options">
          <button 
            class="option-button activity-option" 
            :class="{ 'selected': activityPreferences.includes('yoga') }"
            @click="toggleActivityPreference('yoga')"
          >
            Yoga
          </button>
          
          <button 
            class="option-button activity-option" 
            :class="{ 'selected': activityPreferences.includes('aerobic') }"
            @click="toggleActivityPreference('aerobic')"
          >
            Aerobic exercises
          </button>
          
          <button 
            class="option-button activity-option" 
            :class="{ 'selected': activityPreferences.includes('strength') }"
            @click="toggleActivityPreference('strength')"
          >
            Strength training
          </button>
          
          <button 
            class="option-button activity-option" 
            :class="{ 'selected': activityPreferences.includes('walking') }"
            @click="toggleActivityPreference('walking')"
          >
            Walking
          </button>
          
          <button 
            class="option-button activity-option" 
            :class="{ 'selected': activityPreferences.includes('other') }"
            @click="toggleActivityPreference('other')"
          >
            Other
          </button>
        </div>
      </div>
      
      <div class="question-section">
        <h2 class="question">Do you currently follow any exercise routine?</h2>
        
        <div class="options yes-no">
          <button 
            class="option-button yes" 
            :class="{ 'selected': followsRoutine === true }"
            @click="selectFollowsRoutine(true)"
          >
            Yes
          </button>
          
          <button 
            class="option-button no" 
            :class="{ 'selected': followsRoutine === false }"
            @click="selectFollowsRoutine(false)"
          >
            No
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
            <div class="indicator active"></div>
            <div class="indicator"></div>
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
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.title-container {
  text-align: center;
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

.yes-no {
  flex-direction: row;
  gap: 16px;
  justify-content: center;
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

.activity-option {
  width: 100%;
  max-width: 280px;
}

.option-button.selected {
  background-color: #ffb800;
  color: #000;
}

.yes, .no {
  flex: 1;
  max-width: 120px;
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