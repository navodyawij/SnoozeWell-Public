import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { db, auth } from '../firebase/firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { findMatchingImage } from '../utils/imageUtils';

// Hard-coded token for development - replace with your token
const FALLBACK_TOKEN = "##############################"; 

/**
 * Service to handle GitHub AI model inference requests for fitness recommendations
 */
class GitHubAiService {
  constructor() {
    // Try to get token from environment variable with fallback to hard-coded token
    this.token = (import.meta.env && import.meta.env.VITE_GITHUB_TOKEN) || FALLBACK_TOKEN;
    
    if (!this.token) {
      console.warn('GitHub token is not available. GitHub AI model may not work correctly.');
    } else {
      console.log('GitHub token is configured.'); // Add this for debugging
    }
    
    this.endpoint = "https://models.github.ai/inference";
    this.model = "openai/gpt-4.1";
  }

  /**
   * Calculate age from date of birth
   * @param {string} dateOfBirth - The date of birth in YYYY-MM-DD format
   * @returns {number} The age in years
   */
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Get user profile data from Firebase
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfileData() {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('User not authenticated. Returning default profile data.');
        return this.getDefaultUserData();
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        return this.getDefaultUserData();
      }

      const userData = userDoc.data();
      
      // Calculate age from date of birth if available
      let age = null;
      if (userData.profile?.basic?.dateOfBirth) {
        age = this.calculateAge(userData.profile.basic.dateOfBirth);
      }

      // Get Fitbit data from mockHealthData.json
      const healthData = (await import('../data/mockHealthData.json')).healthData;
      const latestHealthData = healthData[healthData.length - 1];
      const weeklyAverage = {
        sleepHours: healthData.slice(-7).reduce((sum, d) => sum + d.sleepHours, 0) / 7,
        stepCount: healthData.slice(-7).reduce((sum, d) => sum + d.stepCount, 0) / 7,
        caloriesBurned: healthData.slice(-7).reduce((sum, d) => sum + d.caloriesBurned, 0) / 7,
        heartRate: {
          average: healthData.slice(-7).reduce((sum, d) => sum + d.heartRate.average, 0) / 7,
          min: Math.min(...healthData.slice(-7).map(d => d.heartRate.min)),
          max: Math.max(...healthData.slice(-7).map(d => d.heartRate.max))
        }
      };
      
      // Compile all user data into a structured format for the API
      return {
        userProfile: {
          age: age,
          gender: userData.profile?.physical?.gender || '',
          weight: userData.profile?.physical?.weight || '',
          height: userData.profile?.physical?.height || '',
        },
        healthData: {
          sleepDisorders: userData.profile?.assessments?.health?.conditions?.sleepDisorders || [],
          healthConditions: userData.profile?.assessments?.health?.conditions?.healthConditions || [],
          takingMedications: userData.profile?.assessments?.health?.conditions?.takingMedications || false,
        },
        sleepData: {
          averageSleepHours: userData.profile?.assessments?.sleep?.patterns?.sleepHours || '',
          sleepIssues: userData.profile?.assessments?.sleep?.patterns?.sleepIssues || [],
          tracksSleep: userData.profile?.assessments?.sleep?.patterns?.trackingSleep === 'Yes',
        },
        fitnessData: {
          fitnessGoal: userData.profile?.assessments?.fitness?.fitnessGoal || '',
          activityPreferences: userData.profile?.assessments?.fitness?.activityPreferences || [],
          followsRoutine: userData.profile?.assessments?.fitness?.followsRoutine === 'Yes',
        },
        routineData: {
          wakeUpTime: userData.profile?.assessments?.routine?.wakeUpTime || '',
          bedTime: userData.profile?.assessments?.routine?.bedTime || '',
          energyLevel: userData.profile?.assessments?.routine?.energyLevel || '',
        },
        environmentData: {
          sleepEnvironment: userData.profile?.assessments?.environment?.sleepEnvironment || '',
          consumesBeforeBed: userData.profile?.assessments?.environment?.consumesBeforeBed || '',
        },
        fitbitData: {
          latest: {
            sleepHours: latestHealthData.sleepHours,
            stepCount: latestHealthData.stepCount,
            caloriesBurned: latestHealthData.caloriesBurned,
            heartRate: latestHealthData.heartRate
          },
          weeklyAverage: weeklyAverage
        }
      };
    } catch (error) {
      console.error('Error fetching user profile data:', error);
      return this.getDefaultUserData();
    }
  }

  /**
   * Generate recommendations using GitHub AI model inference
   * @returns {Promise<Object>} Recommendations for fitness and relaxation
   */
  async generateRecommendations() {
    try {
      // Get user profile data
      const userData = await this.getUserProfileData();
      
      console.log('Using sample data instead of GitHub AI due to authentication issues');
      
      // Use sample data instead of making API call
      const sampleRecommendations = this.getSampleRecommendations();
      
      // Save sample recommendations to Firebase
      const user = auth.currentUser;
      if (user) {
        try {
          await this.saveRecommendationsToFirebase(sampleRecommendations);
          console.log('Successfully saved recommendations to Firebase');
        } catch (firebaseError) {
          console.error('Failed to save to Firebase:', firebaseError);
          // Don't throw here - we still want to return the recommendations
        }
      } else {
        console.warn('User not authenticated - skipping Firebase save');
      }
      
      return sampleRecommendations;

      /* The following code is disabled due to auth issues with GitHub AI
      // Verify token exists
      if (!this.token) {
        console.error('GitHub token is not available');
        throw new Error('GitHub token is not configured');
      }
      
      // Create the model client
      const client = ModelClient(
        this.endpoint,
        new AzureKeyCredential(this.token),
      );

      // Log the request for debugging
      console.log('Sending request to GitHub AI model with user data:', {
        ...userData,
        token: '[REDACTED]'
      });

      // Prepare the messages for the chat completion
      const messages = [
        {
          role: 'system',
          content: `You are a health and fitness expert specializing in sleep optimization and exercise recommendations.
          Analyze the user's profile and provide personalized recommendations based on their age, gender, 
          sleep patterns, fitness goals, preferences, Fitbit data, and health conditions.
          
          Pay special attention to:
          1. Any diagnosed sleep disorders (insomnia, sleep apnea, etc.)
          2. Existing health conditions (hypertension, diabetes, etc.)
          3. Whether they are taking medications that affect sleep/activity
          
          Consider the following Fitbit data when making recommendations:
          - Daily step count and weekly average
          - Daily calories burned and weekly average
          - Heart rate patterns (average, min, max)
          - Sleep duration and patterns
          
          Use this data to:
          1. Adjust exercise intensity based on current activity levels and health conditions
          2. Suggest activities that complement their current routine and are safe for their health conditions
          3. Consider their heart rate patterns and any cardiovascular conditions
          4. Align recommendations with their sleep schedule and any sleep disorders
          5. Take into account any medications that might affect exercise or sleep
          
          Respond ONLY with a valid JSON object that contains two sections:
          1. "fitnessRecommendations": An array of 5 fitness activities with title, description, durationMinutes, caloriesBurn, and imageUrl fields
          2. "relaxationRoutines": An object with 3 categories: "yoga", "meditation", and "sleepTips", each containing an array of 2 routines with title, description, durationMinutes, level, and imageUrl fields
          
          Consider the user's sleep issues, health conditions, fitness goals, and activity preferences when making recommendations.
          Make the recommendations as personalized and specific as possible based on the user's data.
          For all image URLs, use "https://placehold.co/400x300" as a placeholder.`
        },
        {
          role: 'user',
          content: JSON.stringify(userData)
        }
      ];

      // Make the API call
      const response = await client.path("/chat/completions").post({
        body: {
          messages: messages,
          temperature: 0.7,
          top_p: 1.0,
          model: this.model
        }
      });

      if (isUnexpected(response)) {
        console.error('Unexpected response from GitHub AI:', response.body);
        throw new Error('Unexpected response from GitHub AI model');
      }

      const recommendations = JSON.parse(response.body.choices[0].message.content);
      
      // Apply matching images to recommendations
      recommendations.fitnessRecommendations = recommendations.fitnessRecommendations.map(rec => ({
        ...rec,
        imageUrl: findMatchingImage(rec.title)
      }));

      recommendations.relaxationRoutines.yoga = recommendations.relaxationRoutines.yoga.map(rec => ({
        ...rec,
        imageUrl: findMatchingImage(rec.title)
      }));

      recommendations.relaxationRoutines.meditation = recommendations.relaxationRoutines.meditation.map(rec => ({
        ...rec,
        imageUrl: findMatchingImage(rec.title)
      }));

      recommendations.relaxationRoutines.sleepTips = recommendations.relaxationRoutines.sleepTips.map(rec => ({
        ...rec,
        imageUrl: findMatchingImage(rec.title)
      }));
      
      // Log successful generation
      console.log('Successfully generated recommendations');
      
      // Save recommendations to Firebase
      const user = auth.currentUser;
      if (user) {
        try {
          await this.saveRecommendationsToFirebase(recommendations);
          console.log('Successfully saved recommendations to Firebase');
        } catch (firebaseError) {
          console.error('Failed to save to Firebase:', firebaseError);
          // Don't throw here - we still want to return the recommendations
        }
      } else {
        console.warn('User not authenticated - skipping Firebase save');
      }
      
      return recommendations;
      */
    } catch (error) {
      console.error('Error in generateRecommendations:', error);
      
      // Check if user is authenticated before falling back to sample data
      const user = auth.currentUser;
      if (!user) {
        console.log('User not authenticated - returning sample data');
        return this.getSampleRecommendations();
      }
      
      // For authenticated users, return sample data instead of throwing error
      console.log('Error encountered - returning sample data instead');
      return this.getSampleRecommendations();
    }
  }

  /**
   * Save recommendations to Firebase
   * @param {Object} recommendations The recommendations to save
   * @returns {Promise<void>}
   */
  async saveRecommendationsToFirebase(recommendations) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data() || {};
      
      // Get existing recommendations to move to history
      const existingRecommendations = userData.recommendations || null;
      
      // Create a history array with only one item
      const recommendationHistory = [];
      
      // If there are existing recommendations, add them as the only history item
      if (existingRecommendations && existingRecommendations.timestamp) {
        recommendationHistory.push({
          fitnessRecommendations: existingRecommendations.fitnessRecommendations || [],
          relaxationRoutines: existingRecommendations.relaxationRoutines || {},
          movedToHistoryAt: new Date().toISOString()
        });
      }

      // Update the document with new recommendations and single item history
      await updateDoc(doc(db, 'users', user.uid), {
        recommendations: {
          fitnessRecommendations: recommendations.fitnessRecommendations || [],
          relaxationRoutines: recommendations.relaxationRoutines || {},
          timestamp: serverTimestamp()
        },
        recommendationHistory: recommendationHistory
      });
    } catch (error) {
      console.error('Error saving recommendations to Firebase:', error);
      throw error;
    }
  }

  /**
   * Format timestamp from ISO string to Date object
   * @param {string} isoString - ISO date string
   * @returns {Date}
   */
  formatTimestamp(isoString) {
    return new Date(isoString);
  }

  /**
   * Get previous recommendation from Firebase
   * @returns {Promise<Object|null>} Previous recommendation or null
   */
  async getRecommendationHistory() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return [];
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        return [];
      }

      const recommendationHistory = userDoc.data().recommendationHistory;
      if (!recommendationHistory || !recommendationHistory.length) {
        return [];
      }
      
      // Return the history array which should contain at most one item
      return recommendationHistory.map(item => ({
        ...item,
        movedToHistoryAt: this.formatTimestamp(item.movedToHistoryAt)
      }));
    } catch (error) {
      console.error('Error fetching recommendation history:', error);
      return [];
    }
  }

  /**
   * Fetch saved recommendations from Firebase
   * @returns {Promise<Object>} Saved recommendations
   */
  async getSavedRecommendations() {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('User not authenticated. Returning sample recommendations instead.');
        return this.getSampleRecommendations();
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || !userDoc.data().recommendations) {
        return this.getSampleRecommendations();
      }

      return userDoc.data().recommendations;
    } catch (error) {
      console.error('Error fetching saved recommendations:', error);
      return this.getSampleRecommendations();
    }
  }

  /**
   * Generate sample recommendations for testing and fallback
   * @returns {Object} Sample recommendations
   */
  getSampleRecommendations() {
    // Define arrays of possible options for randomization
    const fitnessActivities = [
      {
        title: "Morning Walking Routine",
        description: "A gentle 30-minute walk to start your day and boost your metabolism.",
        durationMinutes: 30,
        caloriesBurn: 150
      },
      {
        title: "Beginner Strength Training",
        description: "Basic strength exercises using your body weight to build muscle.",
        durationMinutes: 20,
        caloriesBurn: 180
      },
      {
        title: "Evening Stretch Routine",
        description: "Gentle stretching to improve flexibility and prepare for sleep.",
        durationMinutes: 15,
        caloriesBurn: 70
      },
      {
        title: "Light Cardio Session",
        description: "A mix of jumping jacks, high knees, and jogging in place to get your heart rate up.",
        durationMinutes: 25,
        caloriesBurn: 200
      },
      {
        title: "Balance Exercises",
        description: "Simple exercises to improve your balance and core strength.",
        durationMinutes: 15,
        caloriesBurn: 80
      },
      {
        title: "Swimming Workout",
        description: "Low-impact full body workout in the pool with varied strokes.",
        durationMinutes: 40,
        caloriesBurn: 250
      },
      {
        title: "Pilates Core Routine",
        description: "Focus on strengthening your core with controlled movements.",
        durationMinutes: 20,
        caloriesBurn: 120
      },
      {
        title: "Cycling Session",
        description: "Moderate-intensity cycling to improve cardiovascular health.",
        durationMinutes: 35,
        caloriesBurn: 280
      },
      {
        title: "Bodyweight Circuit",
        description: "A series of exercises performed in succession with minimal rest.",
        durationMinutes: 25,
        caloriesBurn: 220
      },
      {
        title: "Resistance Band Workout",
        description: "Full-body strength training using resistance bands.",
        durationMinutes: 20,
        caloriesBurn: 150
      }
    ];

    const yogaRoutines = [
      {
        title: "Bedtime Yoga Sequence",
        description: "Gentle yoga poses to help you unwind before bed.",
        durationMinutes: 15,
        level: "Beginner"
      },
      {
        title: "Morning Yoga Flow",
        description: "Energizing yoga sequence to start your day right.",
        durationMinutes: 20,
        level: "Beginner"
      },
      {
        title: "Yin Yoga for Sleep",
        description: "Slow-paced style of yoga with poses held for longer periods.",
        durationMinutes: 25,
        level: "All Levels"
      },
      {
        title: "Stress Relief Yoga",
        description: "Calming poses focused on releasing tension in the body.",
        durationMinutes: 18,
        level: "Beginner"
      },
      {
        title: "Gentle Neck & Shoulder Release",
        description: "Targeted poses to relieve tension in the upper body.",
        durationMinutes: 12,
        level: "All Levels"
      }
    ];

    const meditationRoutines = [
      {
        title: "Deep Sleep Meditation",
        description: "Guided meditation to help you fall into a deep, restful sleep.",
        durationMinutes: 10,
        level: "All Levels"
      },
      {
        title: "Mindful Breathing",
        description: "Focus on your breath to calm your mind and reduce stress.",
        durationMinutes: 5,
        level: "Beginner"
      },
      {
        title: "Body Scan Relaxation",
        description: "Progressively relax each part of your body to prepare for sleep.",
        durationMinutes: 15,
        level: "Beginner"
      },
      {
        title: "Gratitude Meditation",
        description: "Focus on things you're thankful for to promote positive thoughts.",
        durationMinutes: 8,
        level: "All Levels"
      },
      {
        title: "Anxiety Relief Meditation",
        description: "Calm anxious thoughts and find mental peace before bedtime.",
        durationMinutes: 12,
        level: "All Levels"
      }
    ];

    const sleepTips = [
      {
        title: "Evening Routine Guide",
        description: "Simple steps to create a relaxing evening routine for better sleep.",
        durationMinutes: 3,
        level: "Quick Tips"
      },
      {
        title: "Sleep Environment Setup",
        description: "How to optimize your bedroom for quality sleep.",
        durationMinutes: 4,
        level: "Quick Tips"
      },
      {
        title: "Digital Detox Before Bed",
        description: "How to reduce screen time to improve sleep quality.",
        durationMinutes: 3,
        level: "Quick Tips"
      },
      {
        title: "Optimal Sleep Schedule",
        description: "Tips for maintaining consistent sleep and wake times.",
        durationMinutes: 5,
        level: "Quick Tips"
      },
      {
        title: "Foods That Help Sleep",
        description: "Dietary choices that can improve your sleep quality.",
        durationMinutes: 4,
        level: "Quick Tips"
      }
    ];

    // Helper function to shuffle and pick random items from an array
    const getRandomItems = (array, count) => {
      // Shuffle array
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      // Get subset of items
      return shuffled.slice(0, count);
    };

    // Construct sample data with random selections
    const sampleData = {
      fitnessRecommendations: getRandomItems(fitnessActivities, 5),
      relaxationRoutines: {
        yoga: getRandomItems(yogaRoutines, 2),
        meditation: getRandomItems(meditationRoutines, 2),
        sleepTips: getRandomItems(sleepTips, 2)
      }
    };

    // Apply matching images to sample data
    sampleData.fitnessRecommendations = sampleData.fitnessRecommendations.map(rec => ({
      ...rec,
      imageUrl: findMatchingImage(rec.title)
    }));

    sampleData.relaxationRoutines.yoga = sampleData.relaxationRoutines.yoga.map(rec => ({
      ...rec,
      imageUrl: findMatchingImage(rec.title)
    }));

    sampleData.relaxationRoutines.meditation = sampleData.relaxationRoutines.meditation.map(rec => ({
      ...rec,
      imageUrl: findMatchingImage(rec.title)
    }));

    sampleData.relaxationRoutines.sleepTips = sampleData.relaxationRoutines.sleepTips.map(rec => ({
      ...rec,
      imageUrl: findMatchingImage(rec.title)
    }));

    return sampleData;
  }

  /**
   * Get default user data for demo purposes
   * @returns {Object} Default user data
   */
  getDefaultUserData() {
    return {
      userProfile: {
        name: 'Demo User',
        age: 30,
        gender: 'not specified',
        weight: '70',
        height: '170',
      },
      healthData: {
        sleepDisorders: [],
        healthConditions: [],
        takingMedications: false,
      },
      sleepData: {
        averageSleepHours: '6-7',
        sleepIssues: ['difficulty_falling_asleep', 'waking_up_night'],
        tracksSleep: false,
      },
      fitnessData: {
        fitnessGoal: 'improve_sleep',
        activityPreferences: ['walking', 'yoga'],
        followsRoutine: false,
      },
      sleepEnvironment: {},
      sleepSchedule: {},
      sleepHabits: {},
      stressManagement: {},
    };
  }

  /**
   * Clear previous recommendation
   * @returns {Promise<void>}
   */
  async clearRecommendationHistory() {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      await updateDoc(doc(db, 'users', user.uid), {
        previousRecommendation: null
      });
    } catch (error) {
      console.error('Error clearing previous recommendation:', error);
      throw error;
    }
  }
}

export default new GitHubAiService(); 