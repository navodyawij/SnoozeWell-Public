<script setup>
import { RouterLink } from 'vue-router';
import { Home, Dumbbell, Moon, LineChart, User } from 'lucide-vue-next';
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/home" class="nav-item" exact-active-class="router-link-active">
      <Home size="24" />
      <span>Home</span>
    </RouterLink>
    
    <RouterLink to="/fitnessplan" class="nav-item">
      <Dumbbell size="24" />
      <span>Fitness</span>
    </RouterLink>
    
    <RouterLink to="/relaxationroutines" class="nav-item">
      <Moon size="24" />
      <span>Relax</span>
    </RouterLink>
    
    <RouterLink to="/insightsandtrends" class="nav-item">
      <LineChart size="24" />
      <span>Insights</span>
    </RouterLink>
    
    <RouterLink to="/userprofile" class="nav-item">
      <User size="24" />
      <span>Profile</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  padding: 8px 0;
  z-index: 1000;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 4px 0;
  transition: color 0.3s;
}

.nav-item span {
  font-size: 12px;
  margin-top: 4px;
}

.nav-item.router-link-active {
  color: #FFB800;
}

.nav-item:hover {
  color: #FFB800;
}
</style>
