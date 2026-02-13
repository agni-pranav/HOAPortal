<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseIcon from './BaseIcon.vue'

const props = defineProps({
  actions: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: 'Row actions'
  }
})

const emit = defineEmits(['select'])

const isOpen = ref(false)
const rootRef = ref(null)

const gearIconPath =
  'M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6Zm7.4 6a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z'

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function selectAction(action) {
  if (action?.disabled) {
    return
  }

  emit('select', action?.key)
  closeMenu()
}

function handleOutsideClick(event) {
  if (!isOpen.value || !rootRef.value) {
    return
  }

  if (!rootRef.value.contains(event.target)) {
    closeMenu()
  }
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  window.addEventListener('mousedown', handleOutsideClick)
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleOutsideClick)
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div ref="rootRef" class="row-action-menu">
    <button
      type="button"
      class="row-action-menu__trigger"
      :aria-label="label"
      :aria-expanded="isOpen ? 'true' : 'false'"
      @click="toggleMenu"
    >
      <BaseIcon :path="gearIconPath" />
    </button>

    <div v-if="isOpen" class="row-action-menu__panel" role="menu">
      <button
        v-for="action in actions"
        :key="action.key"
        type="button"
        class="row-action-menu__item"
        :class="{
          'is-danger': action.variant === 'danger',
          'is-disabled': Boolean(action.disabled)
        }"
        :disabled="Boolean(action.disabled)"
        :title="action.title || ''"
        role="menuitem"
        @click="selectAction(action)"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.row-action-menu {
  position: relative;
  display: inline-flex;
}

.row-action-menu__trigger {
  width: calc(var(--space-md) * 2);
  height: calc(var(--space-md) * 2);
  border: 1px solid var(--color-border-action);
  border-radius: 999px;
  background: var(--color-bg-panel);
  color: var(--color-text-secondary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.row-action-menu__trigger:hover {
  border-color: var(--color-border-action-hover);
  background: var(--color-accent-soft);
  color: var(--color-text-primary);
}

.row-action-menu__trigger :deep(.icon) {
  width: calc(var(--space-md) * 1.15);
  height: calc(var(--space-md) * 1.15);
  stroke-width: 1.9;
}

.row-action-menu__panel {
  position: absolute;
  top: calc(100% + var(--space-xs));
  right: 0;
  min-width: calc(var(--space-2xl) * 1.7);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
  box-shadow: var(--shadow-card-hover);
  padding: var(--space-xs);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-xs) * 0.7);
}

.row-action-menu__item {
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  text-align: left;
  padding: calc(var(--space-sm) * 0.9) var(--space-sm);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.row-action-menu__item:hover:not(:disabled) {
  background: var(--color-bg-hover-soft);
}

.row-action-menu__item.is-danger {
  color: var(--color-button-danger-text);
}

.row-action-menu__item.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
