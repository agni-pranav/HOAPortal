<script setup>
import { computed, ref } from 'vue'
import AppShell from './components/layout/AppShell.vue'
import DashboardView from './views/DashboardView.vue'
import ComingSoonView from './views/ComingSoonView.vue'
import RolesPermissionsView from './views/RolesPermissionsView.vue'
import UserManagementView from './views/UserManagementView.vue'
import MeetingsView from './views/MeetingsView.vue'
import CommitteesView from './views/CommitteesView.vue'
import { navigationItems } from './mock/navigationData'

const activeView = ref('dashboard')

const activeNavigationItem = computed(() =>
  navigationItems.find((item) => item.id === activeView.value)
)

function handleNavigate(itemId) {
  activeView.value = itemId
}
</script>

<template>
  <AppShell
    :navigation-items="navigationItems"
    :active-view="activeView"
    :active-title="activeNavigationItem?.label || 'Dashboard'"
    @navigate="handleNavigate"
  >
    <DashboardView v-if="activeView === 'dashboard'" />
    <MeetingsView v-else-if="activeView === 'meetings'" />
    <CommitteesView v-else-if="activeView === 'committees'" />
    <UserManagementView v-else-if="activeView === 'user-management'" />
    <RolesPermissionsView v-else-if="activeView === 'roles-permissions'" />
    <ComingSoonView v-else :section-name="activeNavigationItem?.label || 'Module'" />
  </AppShell>
</template>
