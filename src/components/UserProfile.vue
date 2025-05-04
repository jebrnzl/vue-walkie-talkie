<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { auth, db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import UserLogin from './UserLogin.vue'

const user = ref(null)

// Handle auth state changes
let unsubscribe
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser
    if (currentUser) {
      // Ensure user document exists and update last sign in time
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          {
            email: currentUser.email || 'anonymous',
            uid: currentUser.uid,
            lastSignIn: new Date(),
          },
          { merge: true },
        )
      } catch (error) {
        console.error('Error ensuring user document exists:', error)
      }
    }
  })
})

// Cleanup subscription when component unmounts
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <div class="user-profile">
    <slot name="user" :user="user">
      <div v-if="user" class="user-info">
        <div class="user-avatar">
          <span class="icon">
            <i class="fas fa-user"></i>
          </span>
        </div>
        <p class="user-email">{{ user.email || 'Anonymous' }}</p>
      </div>
      <div v-else>
        <UserLogin />
      </div>
    </slot>
  </div>
</template>

<style scoped>
.user-profile {
  width: 100%;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  color: var(--text-primary);
}

.user-avatar {
  width: 64px;
  height: 64px;
  background: var(--bg-input);
  border: 2px solid var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.user-avatar .icon {
  font-size: 1.5rem;
  color: var(--primary);
}

.user-email {
  font-size: 1.1rem;
  color: var(--text-primary);
  text-align: center;
}
</style>
