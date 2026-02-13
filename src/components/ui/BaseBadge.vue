<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'neutral'
  },
  size: {
    type: String,
    default: 'md'
  }
})
</script>

<template>
  <span class="badge" :class="[`badge--${props.variant}`, `badge--${props.size}`]">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.badge--sm {
  padding: calc(var(--space-sm) * 0.3) calc(var(--space-md) * 0.48);
  font-size: 0.67rem;
}

.badge--md {
  padding: calc(var(--space-sm) * 0.6) calc(var(--space-md) * 0.78);
  font-size: 0.82rem;
}

.badge--neutral {
  background: var(--color-badge-neutral-bg);
  color: var(--color-badge-neutral-text);
}

.badge--info {
  background: var(--color-badge-info-bg);
  color: var(--color-badge-info-text);
}

.badge--success {
  background: var(--color-badge-success-bg);
  color: var(--color-badge-success-text);
}

.badge--warning {
  background: var(--color-badge-warning-bg);
  color: var(--color-badge-warning-text);
}

.badge--danger {
  background: var(--color-badge-danger-bg);
  color: var(--color-badge-danger-text);
}
</style>
