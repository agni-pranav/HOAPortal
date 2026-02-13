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
      <button type="button" class="topbar__icon-button topbar__icon-button--logout" aria-label="Logout">
        <BaseIcon
          path="M1 1L8 1V2L2 2L2 13H8V14H1L1 1ZM10.8536 4.14645L14.1932 7.48614L10.8674 11.0891L10.1326 10.4109L12.358 8L4 8V7L12.2929 7L10.1464 4.85355L10.8536 4.14645Z"
        />
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

.topbar__icon-button--logout {
  width: 2.6rem;
  height: 2.6rem;
  background: transparent;
  margin-top: 0.75rem;
  margin-left: 0.5rem
}

.topbar__icon-button--logout:hover {
  color: var(--color-button-danger-text);
  background: color-mix(in srgb, var(--color-button-danger-bg) 18%, transparent);
}

.topbar__icon-button--logout:focus-visible {
  outline: 2px solid var(--color-button-danger-bg);
  outline-offset: 2px;
}

.topbar__icon-button :deep(.icon) {
  width: 1.3rem;
  height: 1.3rem;
  stroke-width: 1.85;
}

.topbar__icon-button--logout :deep(.icon) {
  width: 1.75rem;
  height: 1.75rem;
  stroke-width: 1.7;
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
