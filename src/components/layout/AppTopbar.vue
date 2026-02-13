<script setup>
import BaseBadge from '../ui/BaseBadge.vue'
import BaseIcon from '../ui/BaseIcon.vue'

defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  }
})
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <h1 class="topbar__title">{{ title }}</h1>
    </div>

    <div class="topbar__profile-wrap">
      <button type="button" class="topbar__icon-button" aria-label="Notifications">
        <BaseIcon path="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
      </button>
      <div class="topbar__identity">
        <p class="topbar__name">John Smith</p>
        <BaseBadge variant="info" size="md">Board Member</BaseBadge>
      </div>
      <div class="topbar__avatar" aria-hidden="true">JS</div>
      <button type="button" class="topbar__icon-button" aria-label="Logout">
        <BaseIcon path="M10 17l5-5-5-5M15 12H4M20 4h-5a2 2 0 0 0-2 2" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: 5.85rem;
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-bg-panel);
  padding: 0 var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar__left {
  min-width: 0;
}

.topbar__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.topbar__icon-button {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--color-icon-muted);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.topbar__icon-button:hover {
  color: var(--color-text-nav);
  background: var(--color-bg-hover-subtle);
}

.topbar__icon-button :deep(.icon) {
  width: 1.3rem;
  height: 1.3rem;
  stroke-width: 1.85;
}

.topbar__profile-wrap {
  display: flex;
  align-items: center;
  gap: calc(var(--space-md) * 0.9);
}

.topbar__identity {
  text-align: right;
}

.topbar__name {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(1.1rem, 0.95rem + 0.35vw, 1.35rem);
  font-weight: 560;
}

.topbar__identity :deep(.badge) {
  margin-top: calc(var(--space-sm) * 0.56);
}

.topbar__avatar {
  width: 3.45rem;
  height: 3.45rem;
  border-radius: 50%;
  background: var(--color-danger);
  color: var(--color-text-on-accent);
  display: grid;
  place-items: center;
  font-size: 1.38rem;
  font-weight: 620;
}

@media (max-width: 980px) {
.topbar {
  height: auto;
  padding: calc(var(--space-md) * 0.75) var(--space-md);
}

.topbar__title {
  font-size: 1.125rem;
}

.topbar__name {
  font-size: 1rem;
}

  .topbar__avatar {
    width: 2.7rem;
    height: 2.7rem;
    font-size: 1rem;
  }
}
</style>
