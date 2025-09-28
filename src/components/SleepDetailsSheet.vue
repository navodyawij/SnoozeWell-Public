<template>
  <v-bottom-sheet
    v-model="isVisible"
    scrollable
  >
    <v-card class="bottom-sheet-content">
      <v-card-title class="bottom-sheet-header">
        <span>Sleep Details</span>
        <v-btn icon @click="closeSheet">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="bottom-sheet-body">
        <div class="detailed-sleep-info">
          <SleepClock :sleepHours="sleepHours" />
          <div class="sleep-stats">
            <h3>Sleep Statistics</h3>
            <p>Time to bed: 11:30 PM</p>
            <p>Wake up time: 7:30 AM</p>
            <p>Deep sleep: 2.5 hours</p>
            <p>Light sleep: 5.5 hours</p>
          </div>
          
          <!-- Sleep History Chart -->
          <div class="sleep-history">
            <h3>Sleep History</h3>
            <div class="chart-container">
              <Bar
                :data="chartData"
                :options="chartOptions"
              />
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot low">⬤</span>
                <span>Less than 4h: Low Quality</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot moderate">⬤</span>
                <span>4-6h: Moderate Quality</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot good">⬤</span>
                <span>6-8h: Good Quality</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot high">⬤</span>
                <span>More than 8h: High Quality</span>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import SleepClock from './SleepClock.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'SleepDetailsSheet',
  components: {
    SleepClock,
    Bar
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    sleepHours: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Hours of Sleep',
          data: [7.5, 3.8, 8.2, 5.0, 6.5, 9.0, 4.2],
          backgroundColor: context => {
            const value = context.raw;
            if (value < 4) return '#DC2626'; // Red for low quality
            if (value < 6) return '#F59E0B'; // Yellow for moderate quality
            if (value < 8) return '#059669'; // Green for good quality
            return '#1a73e8'; // Blue for high quality
          },
          borderRadius: 8,
        }]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const hours = context.parsed.y;
                let quality = '';
                if (hours < 4) quality = '(Low Quality)';
                else if (hours < 6) quality = '(Moderate Quality)';
                else if (hours < 8) quality = '(Good Quality)';
                else quality = '(High Quality)';
                return `${hours} hours ${quality}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 12,
            ticks: {
              stepSize: 2,
              callback: function(value) {
                return value + 'h';
              }
            },
            grid: {
              display: true,
              color: '#E5E7EB'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    }
  },
  computed: {
    isVisible: {
      get() {
        console.log('Getting isVisible:', this.modelValue);
        return this.modelValue;
      },
      set(value) {
        console.log('Setting isVisible:', value);
        this.$emit('update:modelValue', value);
      }
    }
  },
  methods: {
    closeSheet() {
      console.log('Closing sheet');
      this.isVisible = false;
    }
  },
  watch: {
    modelValue(newVal) {
      console.log('modelValue changed:', newVal);
    }
  }
}
</script>

<style scoped>
.bottom-sheet-content {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px;
}

.bottom-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.bottom-sheet-body {
  padding: 24px;
}

.detailed-sleep-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.sleep-stats {
  width: 100%;
  text-align: left;
}

.sleep-stats h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

.sleep-stats p {
  font-size: 16px;
  color: #4B5563;
  margin-bottom: 8px;
}

.sleep-history {
  width: 100%;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.sleep-history h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

.chart-container {
  height: 300px;
  width: 100%;
  margin-top: 16px;
}

.chart-legend {
  margin-top: 16px;
  padding: 16px;
  background: #F3F4F6;
  border-radius: 8px;
  font-size: 14px;
  color: #4B5563;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-dot {
  font-size: 16px;
  margin-right: 8px;
}

.legend-dot.low {
  color: #DC2626;
}

.legend-dot.moderate {
  color: #F59E0B;
}

.legend-dot.good {
  color: #059669;
}

.legend-dot.high {
  color: #1a73e8;
}

:deep(.v-bottom-sheet) {
  max-height: 80vh !important;
}

:deep(.v-bottom-sheet .v-card) {
  max-height: 80vh !important;
}
</style> 