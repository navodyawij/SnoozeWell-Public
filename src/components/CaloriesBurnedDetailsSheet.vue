<template>
  <v-bottom-sheet
    v-model="isVisible"
    scrollable
  >
    <v-card class="bottom-sheet-content">
      <v-card-title class="bottom-sheet-header">
        <span>Calories Burned Details</span>
        <v-btn icon @click="closeSheet">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="bottom-sheet-body">
        <div class="detailed-calories-info">
          <CaloriesBurnedCard :calories="calories" :goal="2500" />
          <div class="calories-stats">
            <h3>Calories Statistics</h3>
            <p>Today's Calories: {{ calories }}</p>
            <p>Weekly Average: {{ weeklyAverage }} calories</p>
            <p>Best Day: {{ bestDay.calories }} calories ({{ bestDay.label }})</p>
          </div>
          <!-- Calories History Chart -->
          <div class="calories-history">
            <h3>Calories History</h3>
            <div class="chart-container">
              <Line
                :data="chartData"
                :options="chartOptions"
              />
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot yellow">⬤</span>
                <span>Calories per day</span>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import CaloriesBurnedCard from './CaloriesBurnedCard.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default {
  name: 'CaloriesBurnedDetailsSheet',
  components: {
    CaloriesBurnedCard,
    Line
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    calories: {
      type: Number,
      required: true
    },
    caloriesHistory: {
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
      if (!this.caloriesHistory.length) return 0;
      return Math.round(this.caloriesHistory.reduce((a, b) => a + b, 0) / this.caloriesHistory.length);
    },
    bestDay() {
      if (!this.caloriesHistory.length) return { calories: 0, label: '' };
      const max = Math.max(...this.caloriesHistory);
      const idx = this.caloriesHistory.indexOf(max);
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return { calories: max, label: labels[idx] };
    },
    chartData() {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Calories',
          data: this.caloriesHistory,
          borderColor: '#fbbf24',
          backgroundColor: 'rgba(251,191,36,0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#fbbf24'
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
                return `${context.parsed.y} calories`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4000,
            ticks: {
              stepSize: 500,
              callback: function(value) {
                return value + ' cal';
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

.detailed-calories-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.calories-stats {
  width: 100%;
  text-align: left;
}

.calories-stats h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

.calories-stats p {
  font-size: 16px;
  color: #4B5563;
  margin-bottom: 8px;
}

.calories-history {
  width: 100%;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.calories-history h3 {
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

.legend-dot.yellow {
  color: #fbbf24;
}

:deep(.v-bottom-sheet) {
  max-height: 80vh !important;
}

:deep(.v-bottom-sheet .v-card) {
  max-height: 80vh !important;
}
</style> 