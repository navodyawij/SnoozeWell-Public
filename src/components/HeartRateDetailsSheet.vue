<template>
  <v-bottom-sheet
    v-model="isVisible"
    scrollable
  >
    <v-card class="bottom-sheet-content">
      <v-card-title class="bottom-sheet-header">
        <span>Heart Rate Details</span>
        <v-btn icon @click="closeSheet">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="bottom-sheet-body">
        <div class="detailed-heart-rate-info">
          <HeartRateCard :heartRate="heartRate" />
          <div class="heart-rate-stats">
            <h3>Heart Rate Statistics</h3>
            <p>Average: {{ heartRate.average }} bpm</p>
            <p>Minimum: {{ heartRate.min }} bpm</p>
            <p>Maximum: {{ heartRate.max }} bpm</p>
          </div>
          
          <!-- Heart Rate History Chart -->
          <div class="heart-rate-history">
            <h3>Heart Rate History</h3>
            <div class="chart-container">
              <Line
                :data="chartData"
                :options="chartOptions"
              />
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot normal">⬤</span>
                <span>60-100 bpm: Normal</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot elevated">⬤</span>
                <span>100-120 bpm: Elevated</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot high">⬤</span>
                <span>Above 120 bpm: High</span>
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
import HeartRateCard from './HeartRateCard.vue'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default {
  name: 'HeartRateDetailsSheet',
  components: {
    HeartRateCard,
    Line
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
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
  data() {
    return {
      chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Heart Rate (bpm)',
          data: [72, 75, 68, 80, 85, 78, 82],
          borderColor: '#fe0000',
          backgroundColor: '#fe0000',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#fe0000'
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
                return `${context.parsed.y} bpm`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 50,
            max: 150,
            ticks: {
              stepSize: 20,
              callback: function(value) {
                return value + ' bpm';
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
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
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

.detailed-heart-rate-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.heart-rate-stats {
  width: 100%;
  text-align: left;
}

.heart-rate-stats h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16px;
}

.heart-rate-stats p {
  font-size: 16px;
  color: #4B5563;
  margin-bottom: 8px;
}

.heart-rate-history {
  width: 100%;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.heart-rate-history h3 {
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

.legend-dot.normal {
  color: #059669;
}

.legend-dot.elevated {
  color: #F59E0B;
}

.legend-dot.high {
  color: #DC2626;
}

:deep(.v-bottom-sheet) {
  max-height: 80vh !important;
}

:deep(.v-bottom-sheet .v-card) {
  max-height: 80vh !important;
}
</style> 