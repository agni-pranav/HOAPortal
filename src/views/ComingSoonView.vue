<script setup>
import BaseCard from '../components/ui/BaseCard.vue'

defineProps({
  sectionName: {
    type: String,
    default: 'Module'
  }
})
</script>

<template>
  <BaseCard class="coming-soon">
    <p class="coming-soon__kicker">Planned Module</p>
    <h3>{{ sectionName }}</h3>
    <p>
      This area is intentionally left as a visual placeholder in phase 1. We can now implement
      the full flow for {{ sectionName.toLowerCase() }} in the next phase.
    </p>
    <span class="coming-soon__status">Coming soon</span>
  </BaseCard>
</template>

<style scoped>
.coming-soon {
  max-width: 42rem;
}

.coming-soon__kicker {
  margin: 0;
  font-size: 0.74rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.coming-soon h3 {
  margin: calc(var(--space-sm) * 0.9) 0 0;
  font-size: 1.25rem;
  color: var(--color-text-primary);
}

.coming-soon p {
  margin: calc(var(--space-sm) * 1.2) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.coming-soon__status {
  margin-top: var(--space-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--space-sm) * 0.5) var(--space-md);
  border-radius: 999px;
  background: var(--color-badge-neutral-bg);
  color: var(--color-badge-neutral-text);
  font-size: 0.82rem;
  font-weight: 600;
}
</style>
