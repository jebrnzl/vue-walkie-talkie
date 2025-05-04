<script setup>
import UserProfile from './UserProfile.vue'
import ChatList from './ChatList.vue'
import { computed, ref, onMounted } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useRoute } from 'vue-router'

const user = useCurrentUser()
const isAuthenticated = computed(() => !!user.value)
const showAuthMessage = ref(false)
const route = useRoute()

onMounted(() => {
  // Check if user was redirected from a protected route
  showAuthMessage.value = route.query.protected === 'true'
})
</script>

<template>
  <div class="home">
    <section class="hero mb-3">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Welcome to Walkie Talkie</h1>
          <h2 class="subtitle">Connect and chat with people</h2>
        </div>
      </div>
    </section>

    <div v-if="showAuthMessage" class="notification is-warning">
      <button class="delete" @click="showAuthMessage = false"></button>
      Please sign in to access the chat room.
    </div>

    <div class="container">
      <div class="login-container" v-if="!isAuthenticated">
        <div class="login-card">
          <UserProfile />
        </div>
      </div>
      <div v-else class="chat-container">
        <ChatList />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  animation: fadeIn 0.5s ease;
}

.hero {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

.hero .title {
  color: var(--primary);
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
}

.hero .subtitle {
  color: var(--text-primary);
  text-align: center;
  opacity: 0.8;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.login-card:hover {
  border-color: var(--primary);
  box-shadow: 0 12px 28px rgba(255, 57, 225, 0.15);
}

.notification {
  background: var(--bg-input);
  color: var(--accent);
  border: 1px solid var(--accent);
  margin-bottom: 2rem;
}

.chat-container {
  padding: 1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
