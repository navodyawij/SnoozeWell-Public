<template>
  <div class="heart-rate-container">
    <v-card class="mx-auto" max-width="300" elevation="0">
      <v-card-item>
        <div class="heart-rate-header">Heart Rate</div>
        <div class="heart-rate-display">
          <div class="heart-rate-value">
            <span class="value">{{ heartRate.average }}</span>
            <span class="unit">bpm</span>
          </div>
          <div class="heart-rate-graph">
            <!-- Mini graph visualization -->
            <svg width="120" height="40" viewBox="0 0 120 40">
              <path
                :d="generateGraphPath"
                fill="none"
                stroke="#fe0000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <div class="heart-rate-stats">
          <div class="stat-item">
            <div class="stat-label">Min</div>
            <div class="stat-value">{{ heartRate.min }} bpm</div>
          </div>
          <div class="divider"></div>
          <div class="stat-item">
            <div class="stat-label">Max</div>
            <div class="stat-value">{{ heartRate.max }} bpm</div>
          </div>
        </div>
      </v-card-item>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'HeartRateCard',
  props: {
    heartRate: {
      type: Object,
      required: true,
      default: () => ({
        average: 0,
        min: 0,
        max: 0
      })
    }
  },
  computed: {
    generateGraphPath() {
      // Generate an ECG-like heartbeat pattern
      const width = 120;
      const height = 40;
      const midY = height / 2;
      
      // Create the heartbeat pattern
      let path = `M 0 ${midY}`; // Start at middle left
      
      // First flat line segment
      path += ` L 30 ${midY}`;
      
      // Down spike
      path += ` L 35 ${midY + 5}`;
      
      // Up spike (main peak)
      path += ` L 40 ${midY - 15}`;
      
      // Down spike
      path += ` L 45 ${midY + 10}`;
      
      // Up to midline
      path += ` L 50 ${midY - 5}`;
      
      // Back to baseline
      path += ` L 55 ${midY}`;
      
      // Continue with flat line
      path += ` L ${width} ${midY}`;
      
      return path;
    }
  }
}
</script>

<style scoped>
.heart-rate-container {
  padding: 16px;
}

.heart-rate-header {
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16px;
}

.heart-rate-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.heart-rate-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.heart-rate-value .value {
  font-size: 48px;
  font-weight: 700;
  color: #fe0000;
  line-height: 1;
}

.heart-rate-value .unit {
  font-size: 20px;
  color: #6B7280;
  margin-left: 4px;
}

.heart-rate-graph {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  padding-left: 16px;
}

.heart-rate-graph svg {
  overflow: visible;
}

.heart-rate-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16px;
  background: #F3F4F6;
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: #D1D5DB;
}
</style> 