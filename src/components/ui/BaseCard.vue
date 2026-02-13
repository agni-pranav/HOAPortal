<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  padded: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <section class="card" :class="{ 'is-hoverable': hoverable, 'is-compact': !padded }">
    <header v-if="title || subtitle || $slots.header" class="card__header">
      <slot name="header">
        <div>
          <h3 v-if="title">{{ title }}</h3>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
      </slot>
    </header>

    <div class="card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.card {
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-lg);
}

.card.is-compact {
  padding: 0;
}

.card.is-hoverable {
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.card.is-hoverable:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
}

.card__header {
  margin-bottom: calc(var(--space-md) * 0.95);
}

.card__header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 620;
}

.card__header p {
  margin: calc(var(--space-sm) * 0.64) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.86rem;
}

.card__body {
  min-width: 0;
}
</style>
