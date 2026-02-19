<script setup>
import { computed } from 'vue'
import BaseIcon from '../ui/BaseIcon.vue'
import { useTenantStore } from '../../state/tenantStore'

const { activeCommunity, state } = useTenantStore()

const brandTitle = computed(() =>
  state.isSaasAdmin ? 'SaaS Platform' : activeCommunity.value?.name || 'Community'
)

defineProps({
  navigationItems: {
    type: Array,
    required: true
  },
  activeView: {
    type: String,
    required: true
  }
})

defineEmits(['navigate', 'coming-soon'])
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <h1>{{ brandTitle }}</h1>
      <p>HOA Management</p>
    </div>

    <nav class="sidebar__nav" aria-label="Main navigation">
      <button
        v-for="item in navigationItems"
        :key="item.id"
        type="button"
        class="sidebar__nav-item"
        :class="{ 'is-active': activeView === item.id, 'is-disabled': item.disabled }"
        :aria-disabled="item.disabled"
        @click="item.disabled ? $emit('coming-soon', item) : $emit('navigate', item.id)"
      >
        <BaseIcon :path="item.icon" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  border-right: 1px solid var(--color-border-default);
  background: var(--color-bg-sidebar);
  display: flex;
  flex-direction: column;
}

.sidebar__brand {
  padding: calc(var(--space-md) * 1.8) calc(var(--space-md) * 1.9) calc(var(--space-md) * 1.55);
  border-bottom: 1px solid var(--color-border-default);
}

.sidebar__brand h1 {
  margin: 0;
  font-size: clamp(1.75rem, 1.05rem + 1.3vw, 2.15rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  font-weight: 700;
}

.sidebar__brand p {
  margin: calc(var(--space-sm) * 0.76) 0 0;
  color: var(--color-text-secondary);
  font-size: 1.08rem;
  font-weight: 500;
}

.sidebar__nav {
  padding: 0;
  overflow-y: auto;
}

.sidebar__nav-item {
  width: 100%;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--color-text-nav);
  display: flex;
  align-items: center;
  gap: calc(var(--space-md) * 0.95);
  text-align: left;
  padding: var(--space-md) calc(var(--space-md) * 1.9);
  font: inherit;
  cursor: pointer;
  border-right: 3px solid transparent;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.sidebar__nav-item :deep(.icon) {
  width: 1.36rem;
  height: 1.36rem;
  stroke-width: 1.8;
}

.sidebar__nav-item span {
  font-size: 1.06rem;
  font-weight: 560;
  white-space: nowrap;
}

.sidebar__nav-item:hover {
  background: var(--color-bg-hover-soft);
  color: var(--color-text-nav-hover);
}

.sidebar__nav-item.is-active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  border-right-color: var(--color-accent);
}

.sidebar__nav-item.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sidebar__nav-item.is-disabled:hover {
  background: transparent;
  color: var(--color-text-nav);
}

@media (max-width: 980px) {
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border-default);
  }

  .sidebar__brand {
    padding: var(--space-md);
  }

  .sidebar__brand h1 {
    font-size: 1.35rem;
  }

  .sidebar__brand p {
    font-size: 0.9rem;
  }

  .sidebar__nav {
    display: flex;
    overflow-x: auto;
  }

  .sidebar__nav-item {
    width: auto;
    border-right: none;
    border-bottom: 3px solid transparent;
    padding: calc(var(--space-md) * 0.85) var(--space-md);
  }

  .sidebar__nav-item.is-active {
    border-right-color: transparent;
    border-bottom-color: var(--color-accent);
  }
}
</style>
