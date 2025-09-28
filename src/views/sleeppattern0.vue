<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft } from "lucide-vue-next";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "HealthQuestionnaire",
  components: { ChevronLeft },
  setup() {
    const router = useRouter();
    const currentStep = ref(1);
    const totalSteps = 3;
    const isSubmitting = ref(false);
    
    // Firebase instances
    const db = getFirestore();
    const auth = getAuth();
    
    // Track selected answers
    const sleepDisorders = ref([]);
    const healthConditions = ref([]);
    const takingMedications = ref(null);
    
    // Add a mapping of sleep disorders to their full text descriptions
    const sleepDisorderTexts = {
      'insomnia': 'Insomnia',
      'sleep-apnoea': 'Sleep Apnoea',
      'restless-legs': 'Restless Legs Syndrome',
      'other': 'Other',
      'none': 'None'
    };

    // Add a mapping of health conditions to their full text descriptions
    const healthConditionTexts = {
      'hypertension': 'Hypertension',
      'diabetes': 'Diabetes',
      'obesity': 'Obesity',
      'heart-conditions': 'Heart conditions',
      'none': 'None'
    };
    
    const isFormValid = computed(() => {
      return sleepDisorders.value.length > 0 && 
             healthConditions.value.length > 0 && 
             takingMedications.value !== null;
    });
    
    const goBack = () => {
      router.go(-1);
    };
    
    const toggleSleepDisorder = (disorder) => {
      if (disorder === 'none') {
        sleepDisorders.value = ['none'];
      } else {
        sleepDisorders.value = sleepDisorders.value.filter(item => item !== 'none');
        if (sleepDisorders.value.includes(disorder)) {
          sleepDisorders.value = sleepDisorders.value.filter(item => item !== disorder);
        } else {
          sleepDisorders.value.push(disorder);
        }
      }
    };
    
    const toggleHealthCondition = (condition) => {
      if (condition === 'none') {
        healthConditions.value = ['none'];
      } else {
        healthConditions.value = healthConditions.value.filter(item => item !== 'none');
        if (healthConditions.value.includes(condition)) {
          healthConditions.value = healthConditions.value.filter(item => item !== condition);
        } else {
          healthConditions.value.push(condition);
        }
      }
    };
    
    const selectMedications = (value) => {
      takingMedications.value = value;
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
        const healthData = {
          sleepDisorders: sleepDisorders.value.map(code => sleepDisorderTexts[code]),
          healthConditions: healthConditions.value.map(code => healthConditionTexts[code]),
          takingMedications: takingMedications.value ? 'Yes' : 'No',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          questionnaireType: 'initial',
          section: 'health-assessment'
        };
        
        // Save to user's document in Firestore under profile/assessments/health
        await setDoc(doc(db, "users", user.uid), {
          profile: {
            assessments: {
              health: {
                conditions: healthData
              }
            }
          }
        }, { merge: true });
        
        // Redirect to next page
        router.push("/auth/sleeppattern1");
        
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error saving your data. Please try again.");
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const goToNext = () => {
      // Basic validation
      if (sleepDisorders.value.length === 0) {
        alert("Please select at least one option for sleep disorders.");
        return;
      }
      
      if (healthConditions.value.length === 0) {
        alert("Please select at least one option for health conditions.");
        return;
      }
      
      if (takingMedications.value === null) {
        alert("Please indicate whether you are taking medications.");
        return;
      }
      
      // Save data to Firestore and proceed
      saveToFirestore();
    };
    
    return {
      currentStep,
      totalSteps,
      sleepDisorders,
      healthConditions,
      takingMedications,
      isSubmitting,
      isFormValid,
      goBack,
      toggleSleepDisorder,
      toggleHealthCondition,
      selectMedications,
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
        <p class="subtitle">Health-Related Questions</p>
      </div>
      <div class="placeholder"></div>
    </div>

    <div class="content">
      <div class="question-section">
        <h2 class="question">Do you have any diagnosed sleep disorders?</h2>
        
        <div class="options">
          <button 
            class="option-button" 
            :class="{ 'selected': sleepDisorders.includes('insomnia') }"
            @click="toggleSleepDisorder('insomnia')"
          >
            Insomnia
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': sleepDisorders.includes('sleep-apnoea') }"
            @click="toggleSleepDisorder('sleep-apnoea')"
          >
            Sleep Apnoea
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': sleepDisorders.includes('restless-legs') }"
            @click="toggleSleepDisorder('restless-legs')"
          >
            Restless Legs Syndrome
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': sleepDisorders.includes('other') }"
            @click="toggleSleepDisorder('other')"
          >
            Other
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': sleepDisorders.includes('none') }"
            @click="toggleSleepDisorder('none')"
          >
            None
          </button>
        </div>
      </div>
      
      <div class="question-section">
        <h2 class="question">Do you have any of the following health conditions?</h2>
        
        <div class="options">
          <button 
            class="option-button" 
            :class="{ 'selected': healthConditions.includes('hypertension') }"
            @click="toggleHealthCondition('hypertension')"
          >
            Hypertension
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': healthConditions.includes('diabetes') }"
            @click="toggleHealthCondition('diabetes')"
          >
            Diabetes
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': healthConditions.includes('obesity') }"
            @click="toggleHealthCondition('obesity')"
          >
            Obesity
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': healthConditions.includes('heart-conditions') }"
            @click="toggleHealthCondition('heart-conditions')"
          >
            Heart conditions
          </button>
          
          <button 
            class="option-button" 
            :class="{ 'selected': healthConditions.includes('none') }"
            @click="toggleHealthCondition('none')"
          >
            None
          </button>
        </div>
      </div>
      
      <div class="question-section">
        <h2 class="question">Are you currently taking any medications that may affect your sleep or physical activity?</h2>
        
        <div class="options yes-no">
          <button 
            class="option-button yes" 
            :class="{ 'selected': takingMedications === true }"
            @click="selectMedications(true)"
          >
            Yes
          </button>
          
          <button 
            class="option-button no" 
            :class="{ 'selected': takingMedications === false }"
            @click="selectMedications(false)"
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
          <div class="indicator active"></div>
          <div class="indicator"></div>
          <div class="indicator"></div>
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