<template>
  <div class="debug-container">
    <h1>Debug Information</h1>
    
    <div class="debug-section">
      <h2>Environment Variables</h2>
      <pre>{{ envVars }}</pre>
    </div>
    
    <div class="debug-section">
      <h2>Test Token Access</h2>
      <button @click="testToken" class="debug-button">Test GitHub Token</button>
      <div v-if="testResult" class="test-result">
        <h3>Result:</h3>
        <pre>{{ testResult }}</pre>
      </div>
    </div>

    <div class="debug-section">
      <h2>Sample Recommendations</h2>
      <button @click="loadSampleData" class="debug-button">Load Sample Data</button>
      <div v-if="sampleData" class="sample-data">
        <h3>Fitness Recommendations:</h3>
        <pre>{{ JSON.stringify(sampleData.fitnessRecommendations[0], null, 2) }}</pre>
        
        <h3>Relaxation Routines:</h3>
        <pre>{{ JSON.stringify(sampleData.relaxationRoutines.yoga[0], null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import aiService from '../services/githubAiService';

export default {
  setup() {
    const envVars = reactive({});
    const testResult = ref('');
    const sampleData = ref(null);

    // Collect environment variables (safe ones only)
    onMounted(() => {
      // Get all environment variables with VITE_ prefix
      Object.keys(import.meta.env).forEach(key => {
        if (key.startsWith('VITE_')) {
          // Only show that it exists, not the actual value for security
          envVars[key] = key === 'VITE_GITHUB_TOKEN' 
            ? (import.meta.env[key] ? '✓ Set' : '✗ Not set') 
            : import.meta.env[key];
        }
      });
      
      // Add mode information
      envVars['MODE'] = import.meta.env.MODE;
      envVars['DEV'] = import.meta.env.DEV;
      envVars['PROD'] = import.meta.env.PROD;
    });

    // Test if token is accessible
    const testToken = async () => {
      try {
        const token = (import.meta.env && import.meta.env.VITE_GITHUB_TOKEN) || 'Not found';
        testResult.value = `Token status: ${token ? '✓ Token exists' : '✗ Token not found'}\n`;
        testResult.value += `Token length: ${token ? token.length : 0} characters\n`;
        
        // Try to get the first character and last 2 characters (for security)
        if (token && token.length > 3) {
          testResult.value += `Token preview: ${token.substring(0, 1)}...${token.substring(token.length - 2)}`;
        }
      } catch (error) {
        testResult.value = `Error accessing token: ${error.message}`;
      }
    };

    // Load sample data
    const loadSampleData = () => {
      sampleData.value = aiService.getSampleRecommendations();
    };

    return {
      envVars,
      testResult,
      testToken,
      sampleData,
      loadSampleData
    };
  }
}
</script>

<style scoped>
.debug-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.debug-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

h2 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #555;
}

pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow: auto;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}

.debug-button {
  background-color: #4A90E2;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 15px;
}

.debug-button:hover {
  background-color: #3A7BC8;
}

.test-result, .sample-data {
  margin-top: 15px;
}
</style> 