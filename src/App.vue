<script setup>
import { computed, ref, watch } from 'vue'
import AppShell from './components/layout/AppShell.vue'
import DashboardView from './views/DashboardView.vue'
import ComingSoonView from './views/ComingSoonView.vue'
import RolesPermissionsView from './views/RolesPermissionsView.vue'
import UserManagementView from './views/UserManagementView.vue'
import MeetingsView from './views/MeetingsView.vue'
import MotionsView from './views/MotionsView.vue'
import CalendarView from './views/CalendarView.vue'
import NewslettersView from './views/NewslettersView.vue'
import CommitteesView from './views/CommitteesView.vue'
import PlatformAdminView from './views/PlatformAdminView.vue'
import MetadataView from './views/MetadataView.vue'
import BaseButton from './components/ui/BaseButton.vue'
import BaseModal from './components/ui/BaseModal.vue'
import { navigationItems, platformNavigationItems } from './mock/navigationData'
import { useTenantStore } from './state/tenantStore'
import { usePermission } from './composables/usePermission'

const activeView = ref('dashboard')
const { state } = useTenantStore()
const { canView, isAdmin } = usePermission()
const isComingSoonOpen = ref(false)
const comingSoonLabel = ref('Module')

const navModuleMap = {
  dashboard: 'dashboard',
  meetings: 'meetings',
  calendar: 'calendar',
  motions: 'motions',
  vendors: 'vendors',
  'drb-submissions': 'drb-submissions',
  committees: 'committees',
  projects: 'projects',
  newsletters: 'newsletters',
  documents: 'documents',
  'complaints-requests': 'complaints-requests',
  'user-management': 'user-management',
  'roles-permissions': 'roles-permissions',
  settings: 'settings',
  metadata: 'metadata'
}
const visibleNavigationItems = computed(() => {
  if (state.isSaasAdmin) {
    return platformNavigationItems
  }

  return navigationItems.filter((item) => canView(navModuleMap[item.id] || item.id))
})

const activeNavigationItem = computed(() =>
  visibleNavigationItems.value.find((item) => item.id === activeView.value)
)

watch(
  visibleNavigationItems,
  (nextItems) => {
    if (!nextItems.find((item) => item.id === activeView.value)) {
      activeView.value = state.isSaasAdmin ? 'platform-communities' : 'dashboard'
    }
  },
  { immediate: true }
)

watch(
  () => state.isSaasAdmin,
  (isPlatform) => {
    activeView.value = isPlatform ? 'platform-communities' : 'dashboard'
  }
)

watch(
  () => activeView.value,
  (nextView) => {
    if (state.isSaasAdmin) {
      return
    }

    if (!canView(navModuleMap[nextView] || nextView)) {
      activeView.value = 'dashboard'
    }
  }
)

function handleNavigate(itemId) {
  if (state.isSaasAdmin) {
    activeView.value = itemId
    return
  }

  if (canView(navModuleMap[itemId] || itemId)) {
    activeView.value = itemId
    return
  }

  activeView.value = isAdmin.value ? 'dashboard' : 'dashboard'
}

function handleComingSoon(item) {
  comingSoonLabel.value = item?.label || 'Module'
  isComingSoonOpen.value = true
}
</script>

<template>
  <AppShell
    :navigation-items="visibleNavigationItems"
    :active-view="activeView"
    :active-title="activeNavigationItem?.label || 'Dashboard'"
    @navigate="handleNavigate"
    @coming-soon="handleComingSoon"
  >
    <PlatformAdminView v-if="activeView === 'platform-communities'" />
    <DashboardView v-else-if="activeView === 'dashboard'" />
    <CalendarView v-else-if="activeView === 'calendar'" />
    <MeetingsView v-else-if="activeView === 'meetings'" />
    <MotionsView v-else-if="activeView === 'motions'" />
    <NewslettersView v-else-if="activeView === 'newsletters'" />
    <CommitteesView v-else-if="activeView === 'committees'" />
    <MetadataView v-else-if="activeView === 'metadata'" />
    <UserManagementView v-else-if="activeView === 'user-management'" />
    <RolesPermissionsView v-else-if="activeView === 'roles-permissions'" />
    <ComingSoonView v-else :section-name="activeNavigationItem?.label || 'Module'" />
  </AppShell>

  <BaseModal
    v-model="isComingSoonOpen"
    :title="`${comingSoonLabel} — Coming Soon`"
    description="This module is planned and will be available in a future update."
  >
    <template #footer>
      <BaseButton @click="isComingSoonOpen = false">Close</BaseButton>
    </template>
  </BaseModal>
</template>
