<script setup>
import { ref } from 'vue'
import { auth, db } from '../firebase'
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

const email = ref('')
const password = ref('')
const error = ref('')
const activeTab = ref('signin')

const ensureUserDocument = async (user) => {
  if (!user) return
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        email: user.email || 'anonymous',
        uid: user.uid,
        createdAt: new Date(),
      },
      { merge: true },
    ) // merge: true will update existing doc or create new one
  } catch (e) {
    console.error('Error ensuring user document exists:', e)
  }
}

const handleSignIn = async () => {
  try {
    error.value = ''
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    await ensureUserDocument(userCredential.user)
  } catch (e) {
    error.value = e.message
  }
}

const handleSignUp = async () => {
  try {
    error.value = ''
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    await ensureUserDocument(userCredential.user)
  } catch (e) {
    error.value = e.message
  }
}

const handleAnonymousSignIn = async () => {
  try {
    error.value = ''
    const userCredential = await signInAnonymously(auth)
    await ensureUserDocument(userCredential.user)
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <div class="login-form">
    <div class="tabs-wrapper">
      <div class="tabs">
        <ul>
          <li :class="{ 'is-active': activeTab === 'signin' }">
            <a @click="activeTab = 'signin'" class="tab-link">
              <span class="icon"><i class="fas fa-sign-in-alt"></i></span>
              <span>Sign In</span>
            </a>
          </li>
          <li :class="{ 'is-active': activeTab === 'signup' }">
            <a @click="activeTab = 'signup'" class="tab-link">
              <span class="icon"><i class="fas fa-user-plus"></i></span>
              <span>Sign Up</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="error" class="notification is-danger">
      <button class="delete" @click="error = ''"></button>
      {{ error }}
    </div>

    <form v-if="activeTab === 'signin'" @submit.prevent="handleSignIn" class="auth-form">
      <div class="field">
        <div class="control has-icons-left">
          <input
            v-model="email"
            type="email"
            class="input"
            required
            placeholder="Enter your email"
          />
          <span class="icon is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>
      </div>

      <div class="field">
        <div class="control has-icons-left">
          <input
            v-model="password"
            type="password"
            class="input"
            required
            placeholder="Enter your password"
          />
          <span class="icon is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
      </div>

      <div class="field">
        <button type="submit" class="button is-primary is-fullwidth">
          <span class="icon">
            <i class="fas fa-sign-in-alt"></i>
          </span>
          <span>Sign In</span>
        </button>
      </div>
    </form>

    <form v-else @submit.prevent="handleSignUp" class="auth-form">
      <div class="field">
        <div class="control has-icons-left">
          <input
            v-model="email"
            type="email"
            class="input"
            required
            placeholder="Enter your email"
          />
          <span class="icon is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </div>
      </div>

      <div class="field">
        <div class="control has-icons-left">
          <input
            v-model="password"
            type="password"
            class="input"
            required
            placeholder="Enter your password"
          />
          <span class="icon is-left">
            <i class="fas fa-lock"></i>
          </span>
        </div>
      </div>

      <div class="field">
        <button type="submit" class="button is-primary is-fullwidth">
          <span class="icon">
            <i class="fas fa-user-plus"></i>
          </span>
          <span>Sign Up</span>
        </button>
      </div>
    </form>

    <div class="divider">or</div>

    <div class="guest-auth">
      <button @click="handleAnonymousSignIn" class="button is-ghost is-fullwidth">
        <span class="icon">
          <i class="fas fa-user-secret"></i>
        </span>
        <span>Continue as Guest</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-form {
  padding: 2rem;
}

.tabs-wrapper {
  margin-bottom: 2rem;
}

.tabs {
  margin-bottom: 0;
}

.tabs ul {
  border-bottom-color: var(--border);
  justify-content: center;
}

.tabs li {
  margin: 0 0.5rem;
}

.tabs li.is-active .tab-link {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-link {
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
}

.tab-link:hover {
  color: var(--text-primary);
}

.notification {
  background: var(--bg-input);
  color: var(--accent);
  border: 1px solid var(--accent);
}

.field {
  margin-bottom: 1.5rem;
}

.input {
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-primary);
  transition: all 0.3s ease;
  height: 3rem;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary-dark);
}

.input::placeholder {
  color: var(--text-secondary);
}

.button {
  height: 3rem;
  transition: all 0.3s ease;
}

.button.is-primary {
  background: var(--primary);
  border: none;
}

.button.is-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.button.is-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.button.is-ghost:hover {
  color: var(--text-primary);
  border-color: var(--primary);
  background: var(--bg-input);
}

.divider {
  text-align: center;
  margin: 2rem 0;
  position: relative;
  color: var(--text-secondary);
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background-color: var(--border);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.icon {
  margin-right: 0.5rem;
}

.icon.is-left {
  color: var(--text-secondary);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
