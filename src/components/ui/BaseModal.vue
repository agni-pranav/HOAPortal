<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed(() => props.modelValue)

function closeModal() {
  emit('update:modelValue', false)
}

function handleEscape(event) {
  if (event.key === 'Escape' && isOpen.value) {
    closeModal()
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      window.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal" @mousedown.self="closeModal">
        <div class="modal__panel">
          <header class="modal__header">
            <div>
              <h3>{{ title }}</h3>
              <p v-if="description">{{ description }}</p>
            </div>
            <BaseButton variant="ghost" size="sm" @click="closeModal">Close</BaseButton>
          </header>

          <div class="modal__content">
            <slot />
          </div>

          <footer class="modal__footer">
            <slot name="footer">
              <BaseButton variant="ghost" @click="closeModal">Cancel</BaseButton>
              <BaseButton @click="closeModal">Save Draft</BaseButton>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: var(--color-overlay-scrim);
  display: grid;
  place-items: center;
  z-index: 60;
  padding: var(--space-md);
}

.modal__panel {
  width: min(560px, 100%);
  border-radius: var(--radius-xl);
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border-default);
  box-shadow: var(--shadow-modal);
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-md) var(--space-md) calc(var(--space-md) * 0.85);
  border-bottom: 1px solid var(--color-border-default);
  gap: var(--space-md);
}

.modal__header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-primary);
}

.modal__header p {
  margin: calc(var(--space-sm) * 0.6) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.modal__content {
  padding: var(--space-md);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: calc(var(--space-md) * 0.8) var(--space-md) var(--space-md);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
