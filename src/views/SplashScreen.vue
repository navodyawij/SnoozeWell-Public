<template>
  <div class="splash-container">
    <div class="splash-content">
      <img src="../assets/Logo.png" alt="SnoozeWell Logo" class="logo" />
      <img src="../assets/MainText.png" alt="SnoozeWell" class="app-title" />
      <p class="slogan">SLEEP BETTER. MOVE STRONGER.<br> LIVE HAPPIER.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

onMounted(() => {
  // Add delay before checking auth and redirecting
  setTimeout(() => {
    if (auth.currentUser) {
      router.replace('/home');
    } else {
      router.replace('/auth/welcome');
    }
  }, 3000); // 3 second delay
});
</script>

<style scoped>
.splash-container {
  min-height: 100vh;
  width: 100vw;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 200px;
  height: auto;
  margin-bottom: 16px;
  animation: fadeIn 0.5s ease-in;
}

.app-title {
  width: 300px;
  height: auto;
  animation: fadeIn 0.5s ease-in 0.2s both;
}

.slogan {
  color: #FFB800;
  font-size: 1rem;
  font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-align: center;
  animation: fadeIn 0.5s ease-in 0.4s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 