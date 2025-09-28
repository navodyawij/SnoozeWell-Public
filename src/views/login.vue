<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Mail, Lock, Mail as MailIcon } from "lucide-vue-next";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default {
  name: 'LoginScreen',
  components: {
    Mail,
    Lock,
    MailIcon
  },
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    const store = useStore();
    const errMsg = ref('');
    
    const checkOnboardingStatus = async (userId) => {
      try {
        console.log('Checking onboarding status for user:', userId);
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data from Firestore:', userData);
          
          // Check if user has completed all onboarding questionnaires
          const isComplete = 
            userData.profile?.basic && // Setup1
            userData.profile?.physical && // Setup2
            userData.profile?.assessments?.health?.conditions && // sleeppattern0
            userData.profile?.assessments?.sleep?.patterns && // sleeppattern1-5
            userData.profile?.assessments?.fitness &&
            userData.profile?.assessments?.routine &&
            userData.profile?.assessments?.environment &&
            userData.profile?.assessments?.device;
          
          console.log('Onboarding complete?', isComplete);
          return isComplete;
        }
        console.log('User document does not exist in Firestore');
        return false;
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        return false;
      }
    };

    const handleSuccessfulLogin = async (user) => {
      console.log('Handling successful login for user:', user.uid);
      const hasCompletedOnboarding = await checkOnboardingStatus(user.uid);
      if (hasCompletedOnboarding) {
        console.log('User has completed onboarding - redirecting to home');
        router.push('/home');
      } else {
        console.log('User needs to complete onboarding - redirecting to setup');
        router.push('/auth/setup1');
      }
    };

    const login = () => {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
          console.log("Successfully logged in!");
          return handleSuccessfulLogin(userCredential.user);
        })
        .catch((error) => {
          console.log(error.code);
          switch (error.code) {
            case "auth/invalid-email":
              errMsg.value = "Invalid email or password";
              break;
            case "auth/user-not-found":
              errMsg.value = "No account with that email was found";
              break;
            case "auth/wrong-password":
              errMsg.value = "Incorrect password";
              break;
            default:
              errMsg.value = "Email or password was incorrect";
              break;
          }
          alert(error.message);
        });
    };
    
    const forgotPassword = () => {
      router.push('/auth/forgot-password');
    };

    const continueWithGoogle = () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(getAuth(), provider)
        .then((result) => {
          console.log('Successfully logged in with Google');
          return handleSuccessfulLogin(result.user);
        })
        .catch((error) => {
          console.log(error.code);
          alert(error.message);
        });
    };

    const signUp = () => {
      router.push('/auth/signin');
    };

    return {
      email,
      password,
      login,
      forgotPassword,
      continueWithGoogle,
      signUp,
      errMsg
    };
  }
};
</script>









<template>
  <div class="login-container">
    <div class="content">
      <!-- Title -->
      <h2 class="title">Log into your<br/> SnoozeWell account</h2>
      <div class="form">
        <!-- To Fill Email -->
        <div class="input-group">
          <div class="icon">
            <Mail size="20" />
          </div>
          <input 
            type="email" 
            v-model="email" 
            placeholder="Email" 
            class="form-input"
          />
        </div>
        <!-- To Fill Password -->
        <div class="input-group">
          <div class="icon">
            <Lock size="20" />
          </div>
          <input 
            type="password" 
            v-model="password" 
            placeholder="Password" 
            class="form-input"
          />
        </div>
        <!-- Error Message -->
        <div class="error-message">
          <p v-if="errMsg">{{ errMsg }}</p>
        </div>
        <!-- Forgot Password -->
        <div class="forgot-password">
          <a @click="forgotPassword" class="forgot-link">Forgot Password?</a>
        </div>
        <!-- Login Button -->
        <button class="login-button" @click="login">Log in</button>
        <!-- Divider -->
        <div class="divider">
          <div class="line"></div>
          <div class="divider-text">OR</div>
          <div class="line"></div>
        </div>
        <!-- Continue with Google Button -->
        <button class="google-button" @click="continueWithGoogle">
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>
        <!-- Send to Sign Up -->
        <div class="signup-prompt">
          Don't have an account? <span class="link" @click="signUp">Sign up</span>
        </div>
      </div>
    </div>
  </div>
</template>













<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('../assets/Login.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
  flex-grow: 1;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 24px;
  text-align: center;
  margin-bottom: 40px;
  margin-top: 120px;
  font-weight: 500;
  color: #ffffff;
}

.form {
  width: 100%;
  max-width: 360px;
}

.input-group {
  display: flex;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 0 15px;
  margin-bottom: 16px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.icon {
  margin-right: 10px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #ffffff;
}

.form-input {
  flex-grow: 1;
  border: none;
  height: 100%;
  font-size: 16px;
  background: transparent;
  color: #ffffff;
  outline: none;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.error-message {
  text-align: center;
  font-size: 14px;
  color: #ff0000;
}

.forgot-password {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

.forgot-link {
  color: #ffffff;
  text-decoration: underline;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
}

.login-button {
  width: 100%;
  height: 60px;
  background-color: #e0e0e0;
  color: black;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 24px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  width: 100%;
}

.line {
  flex-grow: 1;
  height: 1px;
  background-color: #e0e0e0;
}

.divider-text {
  padding: 0 16px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.google-button {
  width: 100%;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 16px;
  border: none;
}

.google-button {
  background-color: #F6B910;
  color: white;
}

.google-button svg {
  margin-right: 8px;
}

.signup-prompt {
  text-align: center;
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 120px;
}

.link {
  color: #ffffff;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
}
</style>