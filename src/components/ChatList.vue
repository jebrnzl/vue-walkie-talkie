<script setup>
import { ref, computed } from 'vue'
import { useCollection, useCurrentUser } from 'vuefire'
import { chatsRef } from '../firebase'
import { query, where, orderBy, serverTimestamp, addDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = useCurrentUser()
const currentUid = computed(() => user.value?.uid || '')

const chats = useCollection(
  computed(() =>
    query(
      chatsRef,
      where('members', 'array-contains', currentUid.value),
      orderBy('createdAt', 'desc'),
    ),
  ),
)

const newChatName = ref('')

const createNewChat = async () => {
  if (!newChatName.value.trim() || !user.value) return

  try {
    const docRef = await addDoc(chatsRef, {
      name: newChatName.value.trim(),
      createdAt: serverTimestamp(),
      owner: user.value.uid,
      members: [user.value.uid],
    })
    newChatName.value = ''
    // Navigate to the new chat
    router.push(`/chat/${docRef.id}`)
  } catch (error) {
    console.error('Error creating chat:', error)
  }
}

const openChat = (chatId) => {
  router.push(`/chat/${chatId}`)
}
</script>

<template>
  <div class="chat-list">
    <div class="card">
      <header class="card-header">
        <p class="card-header-title">Your Chats</p>
      </header>

      <div class="card-content">
        <div class="content">
          <div class="field has-addons">
            <div class="control is-expanded">
              <input
                class="input"
                type="text"
                v-model="newChatName"
                placeholder="Enter new chat name"
                @keyup.enter="createNewChat"
              />
            </div>
            <div class="control">
              <button
                class="button is-primary"
                @click="createNewChat"
                :disabled="!newChatName.trim()"
              >
                <span class="icon">
                  <i class="fas fa-plus"></i>
                </span>
                <span>Create Chat</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="chats.length === 0" class="has-text-centered has-text-grey-light my-6">
          <p>No chats yet. Create one to get started!</p>
        </div>

        <div class="chat-items">
          <div
            v-for="chat in chats"
            :key="chat.id"
            class="chat-item box mb-3 is-clickable"
            @click="openChat(chat.id)"
          >
            <div class="level">
              <div class="level-left">
                <div class="level-item">
                  <span class="icon">
                    <i class="fas fa-comments"></i>
                  </span>
                  <span class="ml-2">{{ chat.name }}</span>
                </div>
              </div>
              <div class="level-right">
                <div class="level-item">
                  <span class="tag" :class="{ 'is-primary': chat.owner === user.value?.uid }">
                    {{ chat.owner === user.value?.uid ? 'Owner' : 'Member' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list {
  animation: fadeIn 0.3s ease;
}

.chat-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.chat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.level-item .icon {
  margin-right: 0.5rem;
}
</style>
