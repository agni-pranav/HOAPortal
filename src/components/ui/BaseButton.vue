<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'md'
  },
  block: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <button
    :type="type"
    class="button"
    :class="[`button--${props.variant}`, `button--${props.size}`, { 'button--block': block }]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.button {
  border: none;
  border-radius: var(--radius-md);
  font: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--space-sm) * 0.9);
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
  font-weight: 600;
}

.button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.button:not(:disabled):active {
  transform: translateY(1px);
}

.button--sm {
  padding: calc(var(--space-sm) * 0.8) calc(var(--space-md) * 0.72);
  font-size: 0.77rem;
}

.button--md {
  padding: calc(var(--space-sm) * 1.14) calc(var(--space-md) * 0.88);
  font-size: 0.81rem;
}

.button--lg {
  padding: calc(var(--space-sm) * 1.44) var(--space-md);
  font-size: 0.9rem;
}

.button--block {
  width: 100%;
}

.button--primary {
  background: var(--color-accent);
  color: var(--color-text-on-accent);
}

.button--primary:hover:not(:disabled) {
  background: var(--color-accent-strong);
}

.button--secondary {
  background: var(--color-button-secondary-bg);
  color: var(--color-accent-strong);
}

.button--secondary:hover:not(:disabled) {
  background: var(--color-button-secondary-bg-hover);
}

.button--ghost {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
}

.button--ghost:hover:not(:disabled) {
  background: var(--color-button-ghost-bg-hover);
}

.button--danger {
  background: var(--color-button-danger-bg);
  color: var(--color-button-danger-text);
}

.button--danger:hover:not(:disabled) {
  background: var(--color-button-danger-bg-hover);
}
</style>
