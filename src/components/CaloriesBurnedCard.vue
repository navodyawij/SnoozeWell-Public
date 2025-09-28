<template>
  <div class="calories-gauge-container">
    <v-card class="mx-auto" max-width="100%" elevation="0">
      <v-card-item>
        <div class="gauge-svg-wrapper">
          <svg :width="svgWidth" :height="svgHeight" preserveAspectRatio="xMidYMid meet" :viewBox="`-40 -40 ${svgWidth + 80} ${svgHeight + 80}`">
            <g v-for="n in segmentCount" :key="n">
              <path
                :d="segmentPath(n - 1)"
                :fill="'none'"
                :stroke="n <= filledSegments ? '#fbbf24' : '#fde68a'"
                :stroke-width="segmentWidth"
                stroke-linecap= "butt"
              />
            </g>
          </svg>
          <div class="gauge-center-content">
            <v-icon size="28" color="#fbbf24">mdi-fire</v-icon>
            <div class="calories-value">{{ calories }}</div>
            <div class="calories-label">kcal</div>
          </div>
        </div>
      </v-card-item>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'CaloriesBurnedCard',
  props: {
    calories: {
      type: Number,
      required: true
    },
    goal: {
      type: Number,
      default: 2500
    }
  },
  data() {
    return {
      segmentCount: 24,
      segmentWidth: 48,
      radius: 180,
      svgWidth: 320,
      svgHeight: 200
    }
  },
  computed: {
    filledSegments() {
      return Math.round(Math.min(this.calories / this.goal, 1) * this.segmentCount);
    }
  },
  methods: {
    segmentPath(idx) {
      const anglePer = 180 / this.segmentCount;
      const startAngle = 180 + idx * anglePer;
      const endAngle = startAngle + anglePer * 0.8;
      const r = this.radius;
      const cx = this.svgWidth / 2;
      const cy = this.svgHeight;
      const toRad = a => (a * Math.PI) / 180;
      
      const isLastFilledSegment = idx === this.filledSegments - 1;
      
      if (isLastFilledSegment) {
        const adjustedEndAngle = endAngle + 2;
        const x1 = cx + r * Math.cos(toRad(adjustedEndAngle));
        const y1 = cy + r * Math.sin(toRad(adjustedEndAngle));
        const x2 = cx + r * Math.cos(toRad(startAngle));
        const y2 = cy + r * Math.sin(toRad(startAngle));
        return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
      } else {
        const x1 = cx + r * Math.cos(toRad(startAngle));
        const y1 = cy + r * Math.sin(toRad(startAngle));
        const x2 = cx + r * Math.cos(toRad(endAngle));
        const y2 = cy + r * Math.sin(toRad(endAngle));
        return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
      }
    }
  }
}
</script>

<style scoped>
.calories-gauge-container {
  padding: 0px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}
.gauge-svg-wrapper {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
svg {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}
.gauge-center-content {
  position: absolute;
  left: 50%;
  top: 65%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.calories-value {
  font-size: 38px;
  font-weight: 700;
  color: #222;
  margin-top: 2px;
}
.calories-label {
  font-size: 18px;
  color: #888;
  margin-top: -2px;
  font-weight: 500;
}

@media (max-width: 600px) {
  .gauge-svg-wrapper {
    transform: scale(0.9);
    transform-origin: center center;
  }
}
</style>