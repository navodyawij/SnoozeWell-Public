<template>
  <div class="sleep-clock-container">
    <v-card class="mx-auto" max-width="300" elevation="0">
      <v-card-item>
        <div class="sleep-info-header">Last Night's Sleep</div>
        <div class="sleep-clock">
          <div class="progress-circle">
            <!-- Inner clock face with markings -->
            <div class="clock-face">
              <!-- Numbers -->
              <div class="clock-number number-12">12</div>
              <div class="clock-number number-3">3</div>
              <div class="clock-number number-6">6</div>
              <div class="clock-number number-9">9</div>
              
              <!-- Hour and Minute Ticks -->
              <template v-for="n in 60" :key="n">
                <div 
                  :class="['tick', n % 5 === 0 ? 'hour-tick' : 'minute-tick']"
                  :style="{ transform: 'rotate(' + (n * 6) + 'deg)' }"
                ></div>
              </template>
            </div>

            <!-- Progress ring with icons -->
            <v-progress-circular
              :model-value="progressValue"
              :size="200"
              :width="28"
              color="#1a73e8"
              class="progress-ring"
            >
              <!-- Icons -->
              <div 
                class="icon-container moon-icon"
                :style="moonIconStyle"
              >
                <div class="icon-background">
                  <v-icon icon="mdi-weather-night" color="#1a73e8" size="16" />
                </div>
              </div>
              <div 
                class="icon-container clock-icon"
                :style="clockIconStyle"
              >
                <div class="icon-background">
                  <v-icon icon="mdi-clock-outline" color="#1a73e8" size="16" />
                </div>
              </div>
              
              <!-- Centered time display -->
              <div class="time-display">
                <div class="time-value">{{ Math.floor(sleepHours) }}hr</div>
                <div class="time-unit">{{ sleepMinutes }} min</div>
              </div>
            </v-progress-circular>
          </div>
        </div>
        <div class="sleep-quality-info">
          <div class="quality-label">Sleep Quality:</div>
          <div :class="['quality-value', qualityColorClass]">
            {{ sleepQuality }}
          </div>
        </div>
      </v-card-item>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'SleepClock',
  props: {
    sleepHours: {
      type: Number,
      required: true
    }
  },
  computed: {
    sleepMinutes() {
      return Math.round((this.sleepHours % 1) * 60);
    },
    progressValue() {
      return (this.sleepHours / 12) * 100;
    },
    moonIconStyle() {
      const angle = -90;
      const radius = 86;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      return {
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        top: '50%',
        left: '50%',
        position: 'absolute'
      };
    },
    clockIconStyle() {
      const angle = (this.sleepHours / 12) * 360 - 90;
      const radius = 86;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;
      return {
        transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
        top: '50%',
        left: '50%',
        position: 'absolute'
      };
    },
    sleepQuality() {
      if (this.sleepHours < 4) {
        return 'Low';
      } else if (this.sleepHours < 6) {
        return 'Moderate';
      } else if (this.sleepHours < 8) {
        return 'Good';
      } else {
        return 'High';
      }
    },
    qualityColorClass() {
      if (this.sleepHours < 4) {
        return 'quality-low';
      } else if (this.sleepHours < 6) {
        return 'quality-moderate';
      } else if (this.sleepHours < 8) {
        return 'quality-good';
      } else {
        return 'quality-high';
      }
    }
  }
}
</script>

<style scoped>
.sleep-clock-container {
  padding: 0px;
}

.sleep-clock {
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

/* Clock face styling */
.clock-face {
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
}

.clock-number {
  position: absolute;
  font-size: 10px;
  color: #000000;
  font-weight: 500;
}

.number-12 {
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.number-3 {
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.number-6 {
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.number-9 {
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.tick {
  position: absolute;
  left: 50%;
  top: 0;
  transform-origin: 50% 70px;
}

.hour-tick {
  width: 1px;
  height: 6px;
  background: #000000;
}

.minute-tick {
  width: 1px;
  height: 3px;
  background: #E0E0E0;
}

/* Time display styling */
.time-display {
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

.time-value {
  font-size: 42px;
  font-weight: 700;
  color: #424242;
  line-height: 1;
}

.time-unit {
  font-size: 16px;
  color: #757575;
  margin-top: -2px;
}

.icon-container {
  width: 20px;
  height: 20px;
}

.icon-background {
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Override Vuetify's default progress circular colors */
:deep(.v-progress-circular__overlay) {
  stroke: #1a73e8 !important;
  stroke-linecap: round !important;
}

:deep(.v-progress-circular__underlay) {
  stroke: #EEEEEE !important;
}

.sleep-info-header {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16px;
}

.sleep-quality-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.quality-label {
  font-size: 16px;
  color: #333333;
}

.quality-value {
  font-weight: 600;
  font-size: 16px;
}

.quality-low {
  color: #DC2626;
}

.quality-moderate {
  color: #F59E0B;
}

.quality-good {
  color: #059669;
}

.quality-high {
  color: #1a73e8;
}
</style> 