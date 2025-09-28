<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default {
  name: "ProfileSetup",
  components: { ChevronLeft, ChevronRight },
  setup() {
    const router = useRouter();
    const currentStep = ref(2);
    const totalSteps = ref(3);
    const isSubmitting = ref(false);
    
    // Firebase instances
    const db = getFirestore();
    const auth = getAuth();
    
    // Profile data
    const gender = ref("");
    const weight = ref(47);
    const height = ref(184);
    
    // Drag handling state for weight
    const weightStartX = ref(0);
    const weightStartValue = ref(0);
    const isWeightDragging = ref(false);
    
    // Drag handling state for height
    const heightStartX = ref(0);
    const heightStartValue = ref(0);
    const isHeightDragging = ref(false);
    
    // Generate range of numbers for the slider
    const getVisibleRange = (current, total = 5) => {
      const range = [];
      const start = Math.max(current - Math.floor(total / 2), 1);
      for (let i = 0; i < total; i++) {
        const value = start + i;
        if (value >= 1) {
          range.push(value);
        }
      }
      return range;
    };
    
    const visibleWeights = computed(() => getVisibleRange(weight.value, 5));
    const visibleHeights = computed(() => getVisibleRange(height.value, 5));
    
    // Add form validation
    const isFormValid = computed(() => {
      return gender.value !== "" && 
             weight.value >= 1 && weight.value <= 200 &&
             height.value >= 1 && height.value <= 250;
    });
    
    const goBack = () => {
      router.go(-1);
    };
    
    const selectGender = (selected) => {
      gender.value = selected;
    };

    // Weight drag handlers
    const handleWeightDragStart = (event) => {
      isWeightDragging.value = true;
      weightStartX.value = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
      weightStartValue.value = weight.value;
      
      if (event.type.includes('mouse')) {
        document.addEventListener('mousemove', handleWeightDrag);
        document.addEventListener('mouseup', handleWeightDragEnd);
      }
    };
    
    const handleWeightDrag = (event) => {
      if (!isWeightDragging.value) return;
      
      const currentX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
      const deltaX = weightStartX.value - currentX;
      const sensitivity = 15;
      const valueChange = Math.round(deltaX / sensitivity);
      
      const newWeight = weightStartValue.value + valueChange;
      if (newWeight >= 1 && newWeight <= 200) {
        weight.value = newWeight;
      }
    };
    
    const handleWeightDragEnd = () => {
      isWeightDragging.value = false;
      document.removeEventListener('mousemove', handleWeightDrag);
      document.removeEventListener('mouseup', handleWeightDragEnd);
    };

    // Height drag handlers
    const handleHeightDragStart = (event) => {
      isHeightDragging.value = true;
      heightStartX.value = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
      heightStartValue.value = height.value;
      
      if (event.type.includes('mouse')) {
        document.addEventListener('mousemove', handleHeightDrag);
        document.addEventListener('mouseup', handleHeightDragEnd);
      }
    };
    
    const handleHeightDrag = (event) => {
      if (!isHeightDragging.value) return;
      
      const currentX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
      const deltaX = heightStartX.value - currentX;
      const sensitivity = 15;
      const valueChange = Math.round(deltaX / sensitivity);
      
      const newHeight = heightStartValue.value + valueChange;
      if (newHeight >= 1 && newHeight <= 250) {
        height.value = newHeight;
      }
    };
    
    const handleHeightDragEnd = () => {
      isHeightDragging.value = false;
      document.removeEventListener('mousemove', handleHeightDrag);
      document.removeEventListener('mouseup', handleHeightDragEnd);
    };
    
    const adjustWeight = (direction) => {
      if (direction === 'decrease' && weight.value > 1) {
        weight.value--;
      } else if (direction === 'increase' && weight.value < 200) {
        weight.value++;
      }
    };
    
    const adjustHeight = (direction) => {
      if (direction === 'decrease' && height.value > 1) {
        height.value--;
      } else if (direction === 'increase' && height.value < 250) {
        height.value++;
      }
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
        
        // Create the data object
        const physicalData = {
          gender: gender.value,
          weight: weight.value,
          height: height.value,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        // Save the physical profile data
        await setDoc(doc(db, "users", user.uid), {
          profile: {
            physical: physicalData
          }
        }, { merge: true });
        
        // Redirect to next page
        router.push("/auth/sleeppattern0");
        
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error saving your data. Please try again.");
      } finally {
        isSubmitting.value = false;
      }
    };
    
    const goToNext = () => {
      // Basic validation
      if (!gender.value) {
        alert("Please select your gender.");
        return;
      }
      
      if (!weight.value || weight.value < 1) {
        alert("Please set a valid weight.");
        return;
      }
      
      if (!height.value || height.value < 1) {
        alert("Please set a valid height.");
        return;
      }
      
      // Save data to Firestore and proceed
      saveToFirestore();
    };
    
    return {
      currentStep,
      totalSteps,
      gender,
      weight,
      height,
      visibleWeights,
      visibleHeights,
      isSubmitting,
      isFormValid,
      goBack,
      selectGender,
      adjustWeight,
      adjustHeight,
      handleWeightDragStart,
      handleWeightDrag,
      handleWeightDragEnd,
      handleHeightDragStart,
      handleHeightDrag,
      handleHeightDragEnd,
      goToNext
    };
  },
};
</script>

<template>
  <div class="setup-container">
    <div class="content">
      <button class="back-button" @click="goBack">
      <ChevronLeft size="24" color="#ffffff" />
      </button>
    
      <div class="profile-form">
      <div class="form-group">
        <label class="form-label">Gender</label>
        <div class="option-buttons">
          <button 
            class="option-button" 
            :class="{ 'selected': gender === 'Man' }"
            @click="selectGender('Man')"
          >
            Man
          </button>
          <button 
            class="option-button" 
            :class="{ 'selected': gender === 'Women' }"
            @click="selectGender('Women')"
          >
            Women
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Weight, kg</label>
        <div class="number-selector"
             @mousedown="handleWeightDragStart($event)"
             @touchstart="handleWeightDragStart($event)"
             @touchmove="handleWeightDrag($event)"
             @touchend="handleWeightDragEnd"
             @touchcancel="handleWeightDragEnd">
          <button class="selector-button" @click="adjustWeight('decrease')">
            <ChevronLeft size="20" />
          </button>
          
          <div class="number-slider">
            <div class="number-track">
              <template v-for="option in visibleWeights" :key="'weight-'+option">
                <span 
                  class="number-option" 
                  :class="{ 
                    'selected': weight === option,
                    'adjacent': Math.abs(weight - option) === 1,
                    'nearby': Math.abs(weight - option) === 2
                  }"
                >
                  {{ option }}
                </span>
              </template>
            </div>
          </div>
          
          <button class="selector-button" @click="adjustWeight('increase')">
            <ChevronRight size="20" />
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Height, cm</label>
        <div class="number-selector"
             @mousedown="handleHeightDragStart($event)"
             @touchstart="handleHeightDragStart($event)"
             @touchmove="handleHeightDrag($event)"
             @touchend="handleHeightDragEnd"
             @touchcancel="handleHeightDragEnd">
          <button class="selector-button" @click="adjustHeight('decrease')">
            <ChevronLeft size="20" />
          </button>
          
          <div class="number-slider">
            <div class="number-track">
              <template v-for="option in visibleHeights" :key="'height-'+option">
                <span 
                  class="number-option" 
                  :class="{ 
                    'selected': height === option,
                    'adjacent': Math.abs(height - option) === 1,
                    'nearby': Math.abs(height - option) === 2
                  }"
                >
                  {{ option }}
                </span>
              </template>
            </div>
          </div>
          
          <button class="selector-button" @click="adjustHeight('increase')">
            <ChevronRight size="20" />
          </button>
        </div>
      </div>
      </div>
    
      <div class="footer">
      <div class="indicators">
        <div class="indicator"></div>
        <div class="indicator active"></div>
        <div class="indicator"></div>
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
.setup-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 100vw;
  background-image: url('../assets/ProfileSetup.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.setup-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
  justify-content: center;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.back-button {
  position: absolute;
  top: calc(20px + env(safe-area-inset-top, 16px));
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10;
  padding: 32px 8px;
  color: #ffffff;
}

.profile-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  justify-content: center;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 24px;
  width: 100%;
  padding: 0;
}

.form-label {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
  display: block;
}

.option-buttons {
  display: flex;
  gap: 12px;
}

.option-button {
  flex: 1;
  padding: 12px 16px;
  border-radius: 50px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transition: background-color 0.2s;
  backdrop-filter: blur(5px);
}

.option-button.selected {
  background-color: #ffb800;
  color: #000;
}

.number-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 0 10px;
  margin-top: 10px;
  cursor: grab;
  user-select: none;
  backdrop-filter: blur(5px);
}

.number-selector:active {
  cursor: grabbing;
}

.selector-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  z-index: 2;
  color: #ffffff;
  transition: color 0.2s;
}

.selector-button:hover {
  color: #ffffff;
  opacity: 0.8;
}

.number-slider {
  flex: 1;
  position: relative;
  height: 100%;
  overflow: hidden;
  margin: 0 10px;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 20%,
    black 80%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 20%,
    black 80%,
    transparent 100%
  );
}

.number-track {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  touch-action: pan-x;
  user-select: none;
}

.number-option {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;
  padding: 0 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  opacity: 0.5;
  white-space: nowrap;
}

.number-option.selected {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  transform: scale(1);
  opacity: 1;
}

.number-option.adjacent {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  transform: scale(0.9);
  opacity: 0.8;
}

.number-option.nearby {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  transform: scale(0.8);
  opacity: 0.6;
}

.footer {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding: 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  margin-bottom: env(safe-area-inset-bottom, 20px);
  position: relative;
  z-index: 1;
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
  color: #000;
  border: none;
  border-radius: 50px;
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
}

.next-button:not(:disabled) {
  background-color: #ffb800;
  cursor: pointer;
}

.next-button:disabled {
  cursor: not-allowed;
}
</style>