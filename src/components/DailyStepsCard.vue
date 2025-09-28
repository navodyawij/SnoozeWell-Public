<template>
  <div class="steps-clock-container">
    <v-card class="mx-auto" max-width="300" elevation="0">
      <v-card-item>
        <div class="steps-info-header">Daily Steps</div>
        <div class="steps-clock">
          <div class="progress-circle">
            <v-progress-circular
              :model-value="progressValue"
              :size="200"
              :width="28"
              color="#22c55e"
              class="progress-ring"
              background="#e5e7eb"
            >
              <!-- Centered icon and step count -->
              <div class="steps-display">
                <v-icon size="60" color="#22c55e">mdi-run-fast</v-icon>
              </div>
            </v-progress-circular>
          </div>
        </div>
        <div class="steps-value-container">
            <div class="steps-value">{{ steps }}</div>
            <div class="steps-label">steps</div>
        </div>
      </v-card-item>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'DailyStepsCard',
  props: {
    steps: {
      type: Number,
      required: true
    },
    goal: {
      type: Number,
      default: 10000
    }
  },
  computed: {
    progressValue() {
      return Math.min((this.steps / this.goal) * 100, 100);
    }
  }
}
</script>

<style scoped>
.steps-clock-container {
  padding: 0px;
}

.steps-clock {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-circle {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-ring {
  position: relative;
}

.steps-info-header {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16px;
}

.steps-display {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.steps-value-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    margin-top: 16px;
}

.steps-value {
  font-size: 42px;
  font-weight: 700;
  color: #22c55e;
  line-height: 1;
}

.steps-label {
  font-size: 16px;
  color: #757575;
  margin-top: -2px;
  font-weight: 500;
}
</style> 