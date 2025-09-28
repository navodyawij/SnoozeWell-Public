import { createApp } from 'vue'
import './style.css'
import router from './plugins/router'
import App from './App.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import './firebase/firebase'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

const app = createApp(App)
app.use(router)
app.use(vuetify)

// Handle Firebase authentication state
const auth = getAuth()

// Simple navigation guard for authenticated routes (optional)
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const currentUser = auth.currentUser

  if (requiresAuth && !currentUser) {
    next('/login')
  } else {
    next()
  }
})

// Wait for Firebase Auth to initialize before mounting the app
let appMounted = false

onAuthStateChanged(auth, () => {
  if (!appMounted) {
    // Mount the app once auth is initialized
    app.mount('#app')
    appMounted = true
  }
})
