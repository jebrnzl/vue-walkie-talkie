<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const user = useCurrentUser()
const isMenuActive = ref(false)

const handleSignOut = async () => {
  try {
    await signOut(auth)
    router.push('/')
    isMenuActive.value = false
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const toggleMenu = () => {
  isMenuActive.value = !isMenuActive.value
}
</script>

<template>
  <div class="app-container">
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <h1 class="is-size-4 has-text-weight-bold">
            <span class="icon is-medium mr-2">
              <i class="fas fa-comments"></i>
            </span>
            Walkie Talkie
          </h1>
        </router-link>

        <a
          role="button"
          class="navbar-burger"
          :class="{ 'is-active': isMenuActive }"
          aria-label="menu"
          aria-expanded="false"
          @click="toggleMenu"
          v-if="user"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" :class="{ 'is-active': isMenuActive }">
        <div class="navbar-end">
          <div v-if="user" class="navbar-item">
            <router-link
              v-if="route.name === 'ChatRoom'"
              to="/"
              class="navbar-link has-text-white mr-4"
              @click="isMenuActive = false"
            >
              <span class="icon">
                <i class="fas fa-arrow-left"></i>
              </span>
              <span>Back to Chats</span>
            </router-link>

            <a @click="handleSignOut" class="navbar-link has-text-white">
              <span class="icon">
                <i class="fas fa-sign-out-alt"></i>
              </span>
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      </div>
    </nav>

    <main class="section">
      <div class="container">
        <router-view></router-view>
      </div>
    </main>

    <footer class="footer">
      <div class="content has-text-centered">
        <p>© 2025 Walkie Talkie. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.navbar {
  background: var(--primary);
  padding: 0.75rem 1.5rem;
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  padding: 0.25rem 0;
}

.navbar-brand .navbar-item {
  color: white;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
}

.navbar-brand .navbar-item:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.navbar-brand .icon {
  font-size: 1.4em;
  color: rgba(255, 255, 255, 0.95);
}

.navbar-menu {
  margin-right: 1rem;
}

.navbar-link {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1rem;
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 0 0.25rem;
  /* Remove default arrow styles */
  background: none;
}

.navbar-link::after {
  display: none !important;
}

.navbar-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: white !important;
  text-decoration: none;
  transform: translateY(-1px);
}

.navbar-link .icon {
  margin-right: 0.5rem;
  opacity: 0.9;
}

.footer {
  margin-top: auto;
  padding: 2rem;
  background-color: var(--background-alt);
  border-top: 1px solid var(--border);
}

.navbar-burger {
  color: white;
  border: none;
}

.navbar-burger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar-menu.is-active {
  position: absolute;
  width: 100%;
  top: 100%;
  left: 0;
  background: var(--primary-solid);
  padding: 0.5rem;
  box-shadow: var(--shadow-md);
}

.navbar-menu.is-active .navbar-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
}

.navbar-menu.is-active .navbar-link {
  width: 100%;
  margin: 0.25rem 0;
  justify-content: center;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.5rem 1rem;
  }

  .navbar-menu {
    display: none;
  }

  .navbar-menu.is-active {
    display: block;
  }

  .navbar-link {
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
  }

  .mr-4 {
    margin-right: 0 !important;
    margin-bottom: 0.5rem;
  }
}
</style>
