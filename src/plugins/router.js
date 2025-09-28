import { createWebHistory, createRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

import MainLayout from '../layouts/MainLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

import SplashScreen from '../views/SplashScreen.vue'
import WelcomePage from '../views/WelcomePage.vue'
import Signin from '../views/Signin.vue'
import Login from '../views/login.vue'
import Setup1 from '../views/Setup1.vue'
import Setup2 from '../views/Setup2.vue'
import sleeppattern0 from '../views/sleeppattern0.vue'
import sleeppattern1 from '../views/sleeppattern1.vue'
import sleeppattern2 from '../views/sleeppattern2.vue'
import sleeppattern3 from '../views/sleeppattern3.vue'
import sleeppattern4 from '../views/sleeppattern4.vue'
import sleeppattern5 from '../views/sleeppattern5.vue'
import UserProfile from '../views/UserProfile.vue'
import Home from '../views/Home.vue'
import FitnessPlan from '../views/FitnessPlan.vue'
import RelaxationRoutines from '../views/RelaxationRoutines.vue'
import InsightsandTrends from '../views/InsightsandTrends.vue'
import DebugInfo from '../views/DebugInfo.vue'

const routes = [
  {
    path: '/',
    name: 'splash',
    component: SplashScreen
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { 
        path: 'home', 
        name: 'Home',
        component: Home 
      },
      {
        path: 'userprofile',
        name: 'UserProfile',
        component: UserProfile
      },
      {
        path: 'fitnessplan',
        name: 'FitnessPlan',
        component: FitnessPlan
      },
      {
        path: 'relaxationroutines',
        name: 'RelaxationRoutines',
        component: RelaxationRoutines
      },
      {
        path: 'insightsandtrends',
        name: 'InsightsandTrends',
        component: InsightsandTrends
      },
      {
        path: 'debug',
        name: 'DebugInfo',
        component: DebugInfo
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { 
        path: 'welcome',
        name: 'WelcomePage',
        component: WelcomePage 
      },
      { 
        path: 'signin', 
        name: 'Signin',
        component: Signin 
      },
      { 
        path: 'login', 
        name: 'Login',
        component: Login 
      },
      {
        path: 'setup1',
        name: 'Setup1',
        component: Setup1
      },
      { 
        path: 'setup2', 
        name: 'Setup2',
        component: Setup2
      },
      { 
        path: 'sleeppattern0', 
        name: 'sleeppattern0',
        component: sleeppattern0
      },
      { 
        path: 'sleeppattern1', 
        name: 'sleeppattern1',
        component: sleeppattern1
      },
      { 
        path: 'sleeppattern2', 
        name: 'sleeppattern2',
        component: sleeppattern2
      },
      { 
        path: 'sleeppattern3', 
        name: 'sleeppattern3',
        component: sleeppattern3
      },
      { 
        path: 'sleeppattern4', 
        name: 'sleeppattern4',
        component: sleeppattern4
      },
      { 
        path: 'sleeppattern5', 
        name: 'sleeppattern5',
        component: sleeppattern5
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const checkOnboardingStatus = async (userId) => {
  try {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return !!(
        userData.profile?.basic && // Setup1
        userData.profile?.physical && // Setup2
        userData.profile?.assessments?.health?.conditions && // sleeppattern0
        userData.profile?.assessments?.sleep?.patterns && // sleeppattern1-5
        userData.profile?.assessments?.fitness &&
        userData.profile?.assessments?.routine &&
        userData.profile?.assessments?.environment &&
        userData.profile?.assessments?.device
      );
    }
    return false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = auth.currentUser;

  // Always allow access to splash screen
  if (to.name === 'splash') {
    return next();
  }

  // For routes requiring authentication
  if (requiresAuth) {
    if (!isAuthenticated) {
      next('/auth/welcome');
    } else {
      // Check onboarding status before allowing access to main app routes
      const hasCompletedOnboarding = await checkOnboardingStatus(auth.currentUser.uid);
      if (!hasCompletedOnboarding && to.path !== '/auth/setup1') {
        next('/auth/setup1');
      } else {
        next();
      }
    }
  } else {
    // For non-auth routes (like /auth/*)
    if (isAuthenticated) {
      // If user is authenticated, check onboarding status before redirecting to home
      const hasCompletedOnboarding = await checkOnboardingStatus(auth.currentUser.uid);
      if (!hasCompletedOnboarding && !to.path.startsWith('/auth/setup') && !to.path.startsWith('/auth/sleeppattern')) {
        next('/auth/setup1');
      } else if (hasCompletedOnboarding && to.path.startsWith('/auth')) {
        next('/home');
      } else {
        next();
      }
    } else {
      next();
    }
  }
});

export default router