<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'

const props = defineProps({
  users: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['login'])

const selectedUserId = ref(props.users[0]?.id || '')

watch(
  () => props.users,
  (nextUsers) => {
    if (!nextUsers.length) {
      selectedUserId.value = ''
      return
    }
    if (!nextUsers.find((user) => user.id === selectedUserId.value)) {
      selectedUserId.value = nextUsers[0].id
    }
  },
  { immediate: true }
)

const selectedUser = computed(
  () => props.users.find((user) => user.id === selectedUserId.value) || null
)

function handleLogin() {
  if (!selectedUserId.value) {
    return
  }
  emit('login', selectedUserId.value)
}
</script>

<template>
  <section class="login-view">
    <BaseCard class="login-card">
      <div class="login-card__header">
        <h1>HOA Portal</h1>
        <p>Select a user profile to continue.</p>
      </div>

      <label class="login-card__field">
        <span>User</span>
        <select v-model="selectedUserId">
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.label }}
          </option>
        </select>
      </label>

      <div v-if="selectedUser" class="login-card__meta">
        <span>{{ selectedUser.role === 'platform-admin' ? 'Platform Scope' : 'Community Scope' }}</span>
        <strong>{{ selectedUser.name }}</strong>
      </div>

      <BaseButton class="login-card__cta" @click="handleLogin">Continue</BaseButton>
    </BaseCard>
  </section>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: var(--color-bg-canvas);
}

.login-card {
  width: 100%;
  max-width: 520px;
  padding: var(--space-xl);
}

.login-card__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
}

.login-card__header h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 650;
  color: var(--color-text-primary);
}

.login-card__header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.login-card__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.login-card__field span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.login-card__field select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.7rem;
  padding: calc(var(--space-sm) * 1.15) var(--space-md);
  background: var(--color-bg-panel);
  font: inherit;
  color: var(--color-text-primary);
}

.login-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  border: 1px dashed var(--color-border-default);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.login-card__meta strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.login-card__cta {
  width: 100%;
}
</style>
