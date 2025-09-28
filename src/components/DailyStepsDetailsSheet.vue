<template>
  <v-bottom-sheet
    v-model="isVisible"
    scrollable
  >
    <v-card class="bottom-sheet-content">
      <v-card-title class="bottom-sheet-header">
        <span>Steps Details</span>
        <v-btn icon @click="closeSheet">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="bottom-sheet-body">
        <div class="detailed-steps-info">
          <DailyStepsCard :steps="steps" :goal="10000" />
          <div class="steps-stats">
            <h3>Steps Statistics</h3>
            <p>Today's Steps: {{ steps }}</p>
            <p>Weekly Average: {{ weeklyAverage }} steps</p>
            <p>Best Day: {{ bestDay.steps }} steps ({{ bestDay.label }})</p>
          </div>
          <!-- Steps History Chart -->
          <div class="steps-history">
            <h3>Steps History</h3>
            <div class="chart-container">
              <Bar
                :data="chartData"
                :options="chartOptions"
              />
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot green">⬤</span>
                <span>Steps per day</span>
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
import DailyStepsCard from './DailyStepsCard.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'DailyStepsDetailsSheet',
  components: {
    DailyStepsCard,
    Bar
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    steps: {
      type: Number,
      required: true
    },
    stepHistory: {
      type: Array,
      required: true
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    weeklyAverage() {
      if (!this.stepHistory.length) return 0;
      return Math.round(this.stepHistory.reduce((a, b) => a + b, 0) / this.stepHistory.length);
    },
    bestDay() {
      if (!this.stepHistory.length) return { steps: 0, label: '' };
      const max = Math.max(...this.stepHistory);
      const idx = this.stepHistory.indexOf(max);
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return { steps: max, label: labels[idx] };
    },
    chartData() {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Steps',
          data: this.stepHistory,
          backgroundColor: '#22c55e',
          borderRadius: 8,
        }]
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} steps`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 20000,
            ticks: {
              stepSize: 4000,
              callback: function(value) {
                return value + ' steps';
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
      };
    }
  },
  methods: {
    closeSheet() {
      this.isVisible = false;
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

.detailed-steps-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.steps-stats {
  width: 100%;
  text-align: left;
}

.steps-stats h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

.steps-stats p {
  font-size: 16px;
  color: #4B5563;
  margin-bottom: 8px;
}

.steps-history {
  width: 100%;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.steps-history h3 {
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

.legend-dot.green {
  color: #22c55e;
}

:deep(.v-bottom-sheet) {
  max-height: 80vh !important;
}

:deep(.v-bottom-sheet .v-card) {
  max-height: 80vh !important;
}
</style> 