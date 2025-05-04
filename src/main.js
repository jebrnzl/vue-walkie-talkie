import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './firebase'
import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import Home from './components/HomePage.vue'
import ChatRoom from './components/ChatRoom.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/chat/:id',
    name: 'ChatRoom',
    component: ChatRoom,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach(async (to) => {
  // Skip for routes that don't require auth
  if (!to.meta.requiresAuth) {
    return true
  }

  // Wait for user authentication state
  const currentUser = await getCurrentUser()

  // If not authenticated, redirect to home with query parameter
  if (!currentUser) {
    return {
      name: 'Home',
      query: { protected: 'true' },
    }
  }
})

const app = createApp(App)
app.use(router)
app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})

app.mount('#app')
