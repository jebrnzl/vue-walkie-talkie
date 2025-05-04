<script setup>
import { useDocument, useCurrentUser, useCollection } from 'vuefire'
import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  arrayUnion,
  getDocs,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = useCurrentUser()
const newMessage = ref('')
const newMemberEmail = ref('')
const addMemberError = ref('')

const chatDoc = useDocument(
  computed(() => (route.params.id ? doc(db, 'chats', route.params.id) : null)),
)

const messagesRef = computed(() =>
  route.params.id ? collection(db, 'chats', route.params.id, 'messages') : null,
)

const messages = useCollection(
  computed(() =>
    messagesRef.value ? query(messagesRef.value, orderBy('createdAt', 'asc')) : null,
  ),
)

const isOwner = computed(() => chatDoc.value?.owner === user.value?.uid)

const addMember = async () => {
  if (!newMemberEmail.value.trim() || !isOwner.value) return

  try {
    addMemberError.value = ''

    // Query the users collection to find the user by email
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', newMemberEmail.value.trim()))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      addMemberError.value = 'User not found'
      return
    }

    const newMemberId = querySnapshot.docs[0].id

    // Check if user is already a member
    if (chatDoc.value.members?.includes(newMemberId)) {
      addMemberError.value = 'User is already a member'
      return
    }

    // Add the user to the members array
    await updateDoc(doc(db, 'chats', route.params.id), {
      members: arrayUnion(newMemberId),
    })

    newMemberEmail.value = ''
  } catch (error) {
    console.error('Error adding member:', error)
    addMemberError.value = 'Error adding member'
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !user.value) return

  try {
    await addDoc(messagesRef.value, {
      text: newMessage.value.trim(),
      createdAt: serverTimestamp(),
      userId: user.value.uid,
      userEmail: user.value.email || 'Anonymous',
    })
    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return new Intl.DateTimeFormat('default', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date)
}
</script>

<template>
  <div class="chat-room" v-if="chatDoc">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">
          {{ chatDoc.name }}
          <span class="tag is-primary is-light ml-2" v-if="isOwner">Owner</span>
        </p>
      </header>

      <div v-if="isOwner" class="card-content">
        <div class="content">
          <form @submit.prevent="addMember" class="mb-4">
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  v-model="newMemberEmail"
                  type="email"
                  class="input"
                  placeholder="Add member by email"
                  required
                />
              </div>
              <div class="control">
                <button type="submit" class="button is-info" :disabled="!newMemberEmail.trim()">
                  <span class="icon">
                    <i class="fas fa-user-plus"></i>
                  </span>
                  <span>Add Member</span>
                </button>
              </div>
            </div>
            <p v-if="addMemberError" class="help is-danger">{{ addMemberError }}</p>
          </form>
        </div>
      </div>

      <div class="card-content">
        <div class="messages-container">
          <div v-if="messages.length === 0" class="has-text-centered has-text-grey-light my-6">
            <p>No messages yet. Start the conversation!</p>
          </div>

          <div v-else class="messages">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-item mb-3"
              :class="{ 'is-own': message.userId === user?.uid }"
            >
              <div class="message-bubble">
                <p class="message-text">{{ message.text }}</p>
                <p class="message-meta">
                  <small>{{ message.userEmail }} • {{ formatDate(message.createdAt) }}</small>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="message-input mt-4">
          <form @submit.prevent="sendMessage">
            <div class="field has-addons">
              <div class="control is-expanded">
                <input
                  v-model="newMessage"
                  class="input"
                  type="text"
                  placeholder="Type a message..."
                  required
                />
              </div>
              <div class="control">
                <button type="submit" class="button is-primary" :disabled="!newMessage.trim()">
                  <span class="icon">
                    <i class="fas fa-paper-plane"></i>
                  </span>
                  <span>Send</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="has-text-centered my-6">
    <p class="has-text-grey">Loading chat...</p>
  </div>
</template>

<style scoped>
.chat-room {
  animation: fadeIn 0.3s ease;
}

.messages-container {
  max-height: 60vh;
  overflow-y: auto;
  padding: 1rem 0;
}

.message-item {
  display: flex;
  margin-bottom: 1rem;
}

.message-item.is-own {
  flex-direction: row-reverse;
}

.message-bubble {
  background: #f5f5f5;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  max-width: 70%;
}

.message-item.is-own .message-bubble {
  background: #ebfffc;
}

.message-text {
  margin-bottom: 0.25rem;
}

.message-meta {
  font-size: 0.8rem;
  color: #666;
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
