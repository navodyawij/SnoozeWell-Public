# 💤 SnoozeWell – AI-Powered Fitness & Sleep Wellness App

SnoozeWell is an AI-driven wellness application that provides **personalized fitness recommendations** and **relaxation routines** (Yoga, Meditation, and Sleep Tips) based on user data and real-time Fitbit insights.  
The project integrates **OpenAI GPT-4** with **Firebase**, **Fitbit Web API**, and a modern **Vue 3 + Vite** front-end to help individuals improve sleep quality and overall well-being.

---

## ✨ Features

- 🧠 **AI-Generated Recommendations** – Uses OpenAI GPT-4 to deliver customized workouts and relaxation routines.  
- ⌚ **Fitbit Web API Integration** – Retrieves real-time sleep, activity, and heart-rate data via OAuth 2.0.  
- 🔐 **Firebase Authentication** – Secure user sign-up and login.  
- ☁️ **Firestore Database** – Stores user profiles, preferences, and personalized plans.  
- 📊 **Interactive Analytics** – Visualized progress using Chart.js and Vue-ChartJS.  
- 🧘 **Relaxation Routines** – Yoga, Meditation, and Sleep Help tips tailored to user data.  
- 📱 **Cross-Platform Ready** – Built with Capacitor for potential Android deployment.  
- 💅 **Modern UI** – Developed with Vuetify, Lucide icons, and Material Design styling.

---

## 🛠️ Tech Stack

**Core Frameworks:** Vue 3 (Composition API), Vite, Vue Router, Vuex  
**UI / UX:** Vuetify, @mdi/font, Lucide-Vue-Next  
**Backend & Auth:** Firebase (Authentication + Firestore)  
**AI Integration:** OpenAI GPT-4 via `openai` SDK, Azure AI Inference SDK  
**APIs & Networking:** Fitbit Web API (OAuth 2.0), Axios  
**Charts & Visualization:** Chart.js, Vue-ChartJS  
**Cross-Platform Build:** Capacitor (Android Support)  
**Tooling:** Vite, Postman, Android Studio, GitHub

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/snoozewell.git
cd snoozewell
```
## 2. Install dependencies
```bash
npm install
```

## 3. Configure environment variables

Create a .env file in the root directory and add:
```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_OPENAI_API_KEY=your_key
VITE_FITBIT_CLIENT_ID=your_client_id
VITE_FITBIT_REDIRECT_URI=http://localhost:5173/fitbit/callback
```

(Do not share these keys publicly.)

## 4. Run the app locally
```bash
npm run dev
```

## 5. Build for production
```bash
npm run build
```

## 🧩 Project Structure
```bash
src/
├── assets/               # Static assets (exercise images, icons)
├── components/           # Reusable Vue components
├── views/                # Page views (Dashboard, Auth, Relaxation, etc.)
├── utils/                # Helper functions (AI prompts, Fitbit data fetch)
├── store/                # Vuex or composables for state management
└── main.js               # App entry point
```

## 🧠 AI & Data Flow Overview

User Onboarding → Questionnaire collects health and lifestyle data.
Fitbit Sync → Retrieves live sleep and activity data.
AI Processing → GPT-4 generates personalized recommendations.
Display Results → Fitness and relaxation routines shown with visuals.
Firestore Storage → Saves user preferences and AI outputs for future sessions.


## 🤝 Acknowledgements

[Fitbit Web API](https://dev.fitbit.com/build/reference/web-api/)
[Firebase](https://firebase.google.com/)
[OpenAI API](https://platform.openai.com/)
[Vue.js](https://vuejs.org/)
[Vuetify](https://vuetifyjs.com/)
[Chart.js](https://www.chartjs.org/)
[Capacitor](https://capacitorjs.com/)
