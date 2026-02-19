<script setup>
import { computed } from 'vue'
import BaseBadge from '../ui/BaseBadge.vue'
import BaseIcon from '../ui/BaseIcon.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import { useTenantStore } from '../../state/tenantStore'

const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  }
})

const {
  state,
  activeCommunity,
  viewModeLabel,
  toggleRole,
  setActiveCommunity,
  setSaasAdmin
} = useTenantStore()

const communitySelection = computed({
  get: () => state.activeCommunityId,
  set: (value) => setActiveCommunity(value)
})

const isSaasAdminView = computed({
  get: () => state.isSaasAdmin,
  set: (value) => setSaasAdmin(value)
})

const roleCheckboxes = [
  { key: 'Board', label: 'Board Member View' },
  { key: 'Member', label: 'Member View' }
]

const showRoleSimulator = computed(() => !state.isSaasAdmin)
const isPlatformView = computed(() => state.isSaasAdmin)
const displayTitle = computed(() =>
  state.isSaasAdmin ? 'SaaS Platform Administration' : props.title
)
</script>

<template>
  <header class="topbar" :class="{ 'topbar--platform': isPlatformView }">
    <div class="topbar__left">
      <div class="topbar__heading">
        <div class="topbar__title-row">
          <BaseIcon
            v-if="isPlatformView"
            class="topbar__platform-icon"
            path="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 0v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15"
          />
          <h1 class="topbar__title">{{ displayTitle }}</h1>
          <BaseBadge v-if="isPlatformView" size="sm" class="topbar__platform-badge">
            Super Admin Mode
          </BaseBadge>
        </div>
        <p v-if="isPlatformView" class="topbar__subtitle">Managing Community Instances</p>
        <div v-else class="topbar__context">
          <span>Community:</span>
          <strong>{{ activeCommunity?.name || 'Community' }}</strong>
          <span class="topbar__divider">•</span>
          <span>View Mode:</span>
          <BaseBadge variant="info" size="sm">{{ viewModeLabel }}</BaseBadge>
        </div>
        <div v-if="isPlatformView" class="topbar__platform-scope">
          <span>Platform Scope</span>
        </div>
      </div>

      <div class="topbar__switchers">
        <label class="topbar__field">
          <span>Community</span>
          <select v-model="communitySelection">
            <option v-for="community in state.communities" :key="community.id" :value="community.id">
              {{ community.name }}
            </option>
          </select>
        </label>

        <label class="topbar__toggle">
          <span>SaaS Super Admin</span>
          <BaseToggle :model-value="isSaasAdminView" @update:model-value="isSaasAdminView = $event" />
        </label>

        <div v-if="showRoleSimulator" class="topbar__roles">
          <span>Role Simulation</span>
          <div class="topbar__role-options">
            <label v-for="role in roleCheckboxes" :key="role.key" class="topbar__role-option">
              <input
                type="checkbox"
                :checked="state.activeRoles.includes(role.key)"
                @change="toggleRole(role.key)"
              />
              <span>{{ role.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="topbar__profile-wrap">
      <button type="button" class="topbar__icon-button" aria-label="Notifications">
        <BaseIcon path="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
      </button>
      <div class="topbar__identity">
        <p class="topbar__name">John Smith</p>
        <BaseBadge variant="info" size="md">{{ viewModeLabel }}</BaseBadge>
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
  min-height: 5.85rem;
  border-bottom: 1px solid var(--color-border-default);
  background: var(--color-bg-panel);
  padding: var(--space-md) var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar__left {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
}

.topbar__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.topbar__heading {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-xs) * 0.7);
}

.topbar__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.topbar__platform-icon {
  width: 1.35rem;
  height: 1.35rem;
  color: var(--color-platform-accent);
}

.topbar__platform-badge {
  background: var(--color-platform-accent-soft);
  color: var(--color-platform-accent-strong);
}

.topbar__subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.topbar__context {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: calc(var(--space-xs) * 0.8);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.topbar__context strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.topbar__divider {
  color: var(--color-border-default);
}

.topbar__platform-scope {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: calc(var(--space-xs) * 0.7) var(--space-sm);
  border-radius: 999px;
  border: 1px solid var(--color-platform-accent-soft);
  color: var(--color-platform-accent);
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.topbar__switchers {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
}

.topbar__field {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: calc(var(--space-sm) * 0.55) var(--space-sm);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
}

.topbar__field span {
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.topbar__field select {
  border: none;
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.topbar__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
}

.topbar__roles {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: calc(var(--space-sm) * 0.45) var(--space-sm);
  border: 1px dashed var(--color-border-default);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
}

.topbar__role-options {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.topbar__role-option {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.85rem;
  color: var(--color-text-primary);
}

.topbar__role-option span {
  white-space: nowrap;
}

.topbar__role-option input {
  width: var(--space-md);
  height: var(--space-md);
}

.topbar--platform {
  border-bottom-color: var(--color-platform-accent-soft);
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
  margin-left: 0.5rem;
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
  gap: var(--space-sm);
  flex-shrink: 0;
}

.topbar__identity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: calc(var(--space-xs) * 0.6);
  min-width: 0;
  text-align: right;
}

.topbar__name {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(1.1rem, 0.95rem + 0.35vw, 1.35rem);
  font-weight: 560;
  white-space: nowrap;
  line-height: 1.1;
}

.topbar__identity :deep(.badge) {
  margin-top: 0;
  white-space: nowrap;
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

.topbar__left {
  gap: var(--space-md);
}

.topbar__switchers {
  flex-direction: column;
  align-items: flex-start;
}

.topbar__roles {
  width: 100%;
  justify-content: space-between;
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
