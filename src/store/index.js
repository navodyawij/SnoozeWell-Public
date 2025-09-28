import { createStore } from 'vuex'

export default createStore({
  state: {
    currentStep: 1,
    totalSteps: 5,
    onboardingData: {
      sleepDisorderType: '',
      sleepHoursAvg: 0,
      exerciseFrequency: '',
      preferredExerciseTime: '',
      exerciseIntensity: ''
    },
    isLoading: false,
    error: null
  },
  
  getters: {
    progress: state => Math.round((state.currentStep / state.totalSteps) * 100),
    isFirstStep: state => state.currentStep === 1,
    isLastStep: state => state.currentStep === state.totalSteps,
    currentStepData: state => {
      const stepMapping = {
        1: 'sleepDisorderType',
        2: 'sleepHoursAvg',
        3: 'exerciseFrequency',
        4: 'preferredExerciseTime',
        5: 'exerciseIntensity'
      };
      
      const field = stepMapping[state.currentStep];
      return state.onboardingData[field];
    }
  },
  
  mutations: {
    nextStep(state) {
      if (state.currentStep < state.totalSteps) {
        state.currentStep++;
      }
    },
    
    prevStep(state) {
      if (state.currentStep > 1) {
        state.currentStep--;
      }
    },
    
    setStepData(state, { field, value }) {
      state.onboardingData[field] = value;
    },
    
    setLoading(state, isLoading) {
      state.isLoading = isLoading;
    },
    
    setError(state, error) {
      state.error = error;
    },
    
    resetOnboarding(state) {
      state.currentStep = 1;
      state.onboardingData = {
        sleepDisorderType: '',
        sleepHoursAvg: 0,
        exerciseFrequency: '',
        preferredExerciseTime: '',
        exerciseIntensity: ''
      };
    },
    
    setOnboardingData(state, data) {
      state.onboardingData = { ...data };
    }
  },
  
  actions: {
    async saveOnboardingData({ state, commit }) {
      try {
        commit('setLoading', true);
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Just log the data to console instead of saving to Firebase
        console.log('Onboarding data saved:', state.onboardingData);
        
        commit('setLoading', false);
        return true;
      } catch (error) {
        commit('setError', error.message);
        commit('setLoading', false);
        return false;
      }
    }
  }
})