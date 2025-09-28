<template>
  <div class="main-layout">
    <RouterView class="main-content" />
    <NavBar />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import NavBar from '../components/NavBar.vue';
</script>

<style scoped>
.main-layout {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.main-layout::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  padding-bottom: 72px; /* Add padding for the navbar */
  z-index: 1;
}
</style> 