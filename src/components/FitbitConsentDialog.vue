<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">
        Connect to Fitbit
      </v-card-title>

      <v-card-text>
        <p class="mb-4">
          To provide you with personalized insights, we need access to the following data from your Fitbit account:
        </p>

        <v-list>
          <v-list-item v-for="(data, key) in requestedData" :key="key">
            <template v-slot:prepend>
              <v-icon :icon="getIcon(key)" color="primary"></v-icon>
            </template>
            <v-list-item-title>{{ data.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ data.description }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-alert
          type="info"
          class="mt-4"
          variant="tonal"
        >
          Your data will be used to provide personalized insights and recommendations for better sleep and fitness.
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="onCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="onConfirm"
        >
          Connect Fitbit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { FITBIT_CONFIG } from '../services/fitbit/config'

export default {
  name: 'FitbitConsentDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      requestedData: FITBIT_CONFIG.requestedData
    }
  },
  computed: {
    show: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    getIcon(key) {
      const icons = {
        sleep: 'mdi-sleep',
        heartrate: 'mdi-heart-pulse',
        activity: 'mdi-run',
        profile: 'mdi-account'
      }
      return icons[key] || 'mdi-information'
    },
    onConfirm() {
      this.$emit('confirm')
      this.show = false
    },
    onCancel() {
      this.$emit('cancel')
      this.show = false
    }
  }
}
</script>

<style scoped>
.v-list-item {
  min-height: 64px;
}
</style> 