<template>
  <div class="auth-layout">
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background-color: white;
}
</style> 