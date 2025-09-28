<template>
  <div class="setup-container">
    <div class="content">
      <div class="header-section">
        <h1 class="title">Let's<br>Set Up<br>Your<br>Profile</h1>
      </div>

      <div class="form-section">
        <div class="form-group">
          <label class="form-label">Name</label>
          <div class="input-container">
            <input 
              type="text" 
              v-model="name" 
              class="text-input"
              placeholder="Enter your name"
            />
            <span class="input-arrow">›</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Date of Birth</label>
          <div class="input-container">
            <input 
              type="date" 
              v-model="dateOfBirth"
              class="date-input"
              :max="maxDate"
            />
            <span class="calendar-icon">
              <Calendar size="20" color="#ffffff" />
            </span>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="indicators">
          <div class="indicator active"></div>
          <div class="indicator"></div>
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

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Calendar } from "lucide-vue-next";

export default {
  name: "ProfileSetup",
  components: {
    Calendar
  },
  setup() {
    const router = useRouter();
    const name = ref("");
    const dateOfBirth = ref("");
    const isSubmitting = ref(false);
    
    // Firebase instances
    const db = getFirestore();
    const auth = getAuth();

    // Calculate max date (must be at least 13 years old)
    const maxDate = computed(() => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 13);
      return date.toISOString().split('T')[0];
    });

    // Form validation
    const isFormValid = computed(() => {
      return name.value.trim() !== "" && dateOfBirth.value !== "";
    });

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
        const profileData = {
          name: name.value.trim(),
          dateOfBirth: dateOfBirth.value,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        // Save the profile data
        await setDoc(doc(db, "users", user.uid), {
          profile: {
            basic: profileData
          }
        }, { merge: true });
        
        router.push("/auth/setup2");
        
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Error saving your data. Please try again.");
      } finally {
        isSubmitting.value = false;
      }
    };

    const goToNext = () => {
      if (!name.value.trim()) {
        alert("Please enter your name.");
        return;
      }
      
      if (!dateOfBirth.value) {
        alert("Please enter your date of birth.");
        return;
      }
      
      // Save data to Firestore and proceed
      saveToFirestore();
    };

    return {
      name,
      dateOfBirth,
      maxDate,
      isFormValid,
      isSubmitting,
      goToNext
    };
  }
};
</script>

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

.header-section {
  position: relative;
  margin-top: 24px;
  margin-bottom: 40px;
  width: 100%;
  max-width: 360px;
  padding: 0 20px;
  margin-left: auto;
  margin-right: auto;
}

.title {
  font-size: clamp(32px, 20vw, 40px);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  padding-top: 20px;
  z-index: 2;
  position: relative;
  color: #ffffff;
  text-align: left;
}

.form-section {
  flex: 1;
  margin-top: 40px;
  width: 100%;
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 24px;
  width: 100%;
}

.form-label {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  display: block;
}

.input-container {
  position: relative;
  width: 100%;
}

.text-input,
.date-input {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  backdrop-filter: blur(5px);
  box-sizing: border-box;
}

.text-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.input-arrow,
.calendar-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffff;
  font-size: 20px;
}

.footer {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding: 24px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  margin-bottom: env(safe-area-inset-bottom, 20px);
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
  background-color: #ffb800;
  color: #000;
  border: none;
  border-radius: 50px;
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
}

.next-button:disabled {
  background-color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}

/* Hide default date picker icon and styling */
input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
}

input[type="date"] {
  position: relative;
}

/* For date input placeholder color */
input[type="date"]:invalid {
  color: rgba(255, 255, 255, 0.7);
}
</style>