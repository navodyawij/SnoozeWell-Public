<script>
import { ref } from "vue";
import { useRouter } from "vue-router"; 

export default {
  name: "WelcomeScreen",
  setup() {
    const router = useRouter();
    
    const signinnext = () => {
      router.push("/auth/signin");
    };
    
    return {
      signinnext
    };
  },
};
</script>

<template>
  <div class="welcome-container">
    <div class="content">
      <div class="welcome-text">
        <h1 class="title">Welcome to SnoozeWell!</h1>
        <p class="description">
          Let's personalize your experience to help you sleep better and stay active.
        </p>
      </div>
      
      <button class="start-button" @click="signinnext">
        Let's Snooze
      </button>
    </div>
  </div>
</template>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-image: url('../assets/WelcomeImage.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding: 20px;
  position: relative;
}

.welcome-container::before {
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
  max-width: 400px;
  text-align: center;
  z-index: 1; /* Place content above the overlay */
}

.welcome-text {
  margin-bottom: 48px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: white;
}

.description {
  font-size: 18px;
  font-weight: 400;
  color: white;
  line-height: 1.5;
  margin: 0;
}

.start-button {
  background-color: #ffc107;
  color: #000;
  border: none;
  border-radius: 50px;
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  max-width: 225px;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>