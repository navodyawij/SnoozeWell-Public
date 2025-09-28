# GitHub AI Model Integration for SnoozeWell

This document explains how the GitHub AI model integration works in the SnoozeWell application, providing personalized fitness and relaxation recommendations based on user data.

## Overview

The integration collects user data from Firebase, sends it to the GitHub AI model inference endpoint with specific prompts, and displays personalized recommendations in the FitnessPlan and RelaxationRoutines pages.

## Key Features

1. **User Data Collection**: Automatically aggregates user data from:
   - Basic profile (name, date of birth)
   - Profile setup (gender, weight, height)
   - Sleep questionnaire
   - Fitness questionnaire
   - Sleep environment questionnaire
   - Sleep schedule questionnaire
   - Sleep habits questionnaire
   - Stress management questionnaire

2. **Age Calculation**: Automatically calculates the user's age from their date of birth

3. **Personalized Recommendations**: Generates:
   - 5 personalized fitness activities
   - 6 relaxation routines (2 yoga, 2 meditation, 2 sleep tips)

4. **Data Storage**: Saves recommendations to Firebase for future use

## Implementation Details

### Files Structure

- `src/services/githubAiService.js`: Core service handling API communication
- `src/views/FitnessPlan.vue`: UI for fitness recommendations
- `src/views/RelaxationRoutines.vue`: UI for relaxation recommendations
- `.env`: Environment file for storing the GitHub token

### Dependencies

The integration requires these npm packages:
- `@azure-rest/ai-inference`
- `@azure/core-auth`
- `@azure/core-sse`

### Data Flow

1. User completes profile and questionnaires (stored in Firebase)
2. User visits FitnessPlan or RelaxationRoutines page
3. GitHub AI service collects relevant user data
4. Service sends structured data to GitHub AI model inference endpoint
5. API responds with personalized recommendations
6. Recommendations are saved to Firebase and displayed to the user

### API Request Format

The user data sent to the API is structured as follows:

```json
{
  "userProfile": {
    "name": "User Name",
    "age": 30,
    "gender": "female",
    "weight": "65",
    "height": "170"
  },
  "sleepData": {
    "averageSleepHours": "6-7",
    "sleepIssues": ["difficulty_falling_asleep", "waking_up_night"],
    "tracksSleep": true
  },
  "fitnessData": {
    "fitnessGoal": "lose_weight",
    "activityPreferences": ["walking", "yoga"],
    "followsRoutine": false
  },
  "sleepEnvironment": {...},
  "sleepSchedule": {...},
  "sleepHabits": {...},
  "stressManagement": {...}
}
```

### API Response Format

The response from the GitHub AI model should be a JSON object with this structure:

```json
{
  "fitnessRecommendations": [
    {
      "title": "Morning Walking Routine",
      "description": "A gentle morning walk to boost metabolism",
      "durationMinutes": 30,
      "caloriesBurn": 150,
      "imageUrl": "https://placehold.co/400x300"
    },
    // 4 more fitness recommendations...
  ],
  "relaxationRoutines": {
    "yoga": [
      {
        "title": "Bedtime Yoga Sequence",
        "description": "Gentle stretches to prepare your body for sleep",
        "durationMinutes": 15,
        "level": "Beginner",
        "imageUrl": "https://placehold.co/400x300"
      },
      // 1 more yoga routine...
    ],
    "meditation": [
      // 2 meditation routines...
    ],
    "sleepTips": [
      // 2 sleep tips...
    ]
  }
}
```

## Configuration

1. **GitHub Token**: Add your GitHub token to the `.env` file:
   ```
   VITE_GITHUB_TOKEN=your_github_token_here
   ```

2. **Firebase Configuration**: Ensure Firebase security rules allow:
   ```
   match /users/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```

## How to Set Up GitHub AI Model Integration

1. **Install Required Packages**:
   ```bash
   npm install @azure-rest/ai-inference @azure/core-auth @azure/core-sse
   ```

2. **Set GitHub Token**:
   ```bash
   # Windows
   set GITHUB_TOKEN=your-github-token-goes-here
   
   # macOS/Linux
   export GITHUB_TOKEN=your-github-token-goes-here
   ```

3. **Add Token to Environment Variables**:
   Create or update the `.env` file with:
   ```
   VITE_GITHUB_TOKEN=your-github-token-goes-here
   ```

## Troubleshooting

- If recommendations aren't loading, check browser console for errors
- Verify the GitHub token is correctly set in the .env file
- Ensure the user has completed the basic profile setup
- Check Firebase permissions allow writing to the recommendations field
- Make sure all required Azure packages are installed

## Advantages of GitHub AI Model

- Uses your GitHub token for authentication
- Can potentially offer lower costs compared to direct OpenAI API usage
- Seamless integration with GitHub ecosystem
- Same powerful GPT-4.1 model capabilities

## Usage Notes

Be aware that this integration uses GitHub's AI model inference endpoint. Consult GitHub's documentation for:
- Usage limits and quotas
- Rate limiting policies
- Token permissions and scopes required