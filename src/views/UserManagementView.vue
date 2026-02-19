<script setup>
import { computed, ref } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import RowActionMenu from '../components/ui/RowActionMenu.vue'
import BaseTable from '../components/ui/BaseTable.vue'
import { useTenantStore } from '../state/tenantStore'
import { usePermission } from '../composables/usePermission'

const { currentCommunityData } = useTenantStore()
const { canPerform } = usePermission()

const communityData = computed(() => currentCommunityData.value)
const users = computed(() => communityData.value?.users || [])
const availableRoles = computed(() => communityData.value?.roles || [])

const isRoleModalOpen = ref(false)
const selectedUserId = ref('')
const selectedRoleId = ref('')

const roleTableColumns = [
  { key: 'name', label: 'Name', width: '20%' },
  { key: 'email', label: 'Email', width: '27%' },
  { key: 'assignedRoleId', label: 'Role', width: '17%' },
  { key: 'status', label: 'Status', width: '12%' },
  { key: 'actions', label: 'Actions', width: '10%', align: 'center' }
]

const sortedUsers = computed(() =>
  [...users.value].sort((firstUser, secondUser) => firstUser.name.localeCompare(secondUser.name))
)

const roleNameById = computed(() => {
  const mapped = {}
  availableRoles.value.forEach((role) => {
    mapped[role.id] = role.name
  })
  return mapped
})

const selectedUser = computed(
  () => users.value.find((user) => user.id === selectedUserId.value) || null
)

const roleModalTitle = computed(() =>
  selectedUser.value ? `Change Role — ${selectedUser.value.name}` : 'Change Role'
)

const canManageUsers = computed(
  () => canPerform('user-management', 'edit') || canPerform('user-management', 'create')
)

function updateUserById(userId, updater) {
  if (!communityData.value) {
    return
  }

  communityData.value.users = communityData.value.users.map((user) =>
    user.id === userId ? updater(user) : user
  )
}

function resolveRoleName(roleId) {
  if (!roleId) {
    return 'Unassigned'
  }

  return roleNameById.value[roleId] || 'Unknown Role'
}

function openChangeRoleModal(user) {
  if (!canManageUsers.value) {
    return
  }

  selectedUserId.value = user.id
  selectedRoleId.value = user.assignedRoleId || ''
  isRoleModalOpen.value = true
}

function closeChangeRoleModal() {
  selectedUserId.value = ''
  selectedRoleId.value = ''
  isRoleModalOpen.value = false
}

function saveRoleAssignment() {
  if (!canManageUsers.value) {
    return
  }

  if (!selectedUserId.value) {
    return
  }

  updateUserById(selectedUserId.value, (user) => ({
    ...user,
    assignedRoleId: selectedRoleId.value || null
  }))

  closeChangeRoleModal()
}

function removeRole(userId) {
  if (!canManageUsers.value) {
    return
  }

  updateUserById(userId, (user) => ({
    ...user,
    assignedRoleId: null
  }))
}

function setUserActiveState(userId, nextIsActive) {
  if (!canManageUsers.value) {
    return
  }

  updateUserById(userId, (user) => ({
    ...user,
    status: nextIsActive ? 'Active' : 'Inactive'
  }))
}

function getUserActions(user) {
  return [
    { key: 'change-role', label: 'Change Role' },
    { key: 'remove-role', label: 'Remove Role', disabled: !user.assignedRoleId },
    {
      key: user.status === 'Active' ? 'deactivate' : 'activate',
      label: user.status === 'Active' ? 'Deactivate' : 'Activate'
    }
  ]
}

function handleUserAction(actionKey, user) {
  if (actionKey === 'change-role') {
    openChangeRoleModal(user)
    return
  }

  if (actionKey === 'remove-role') {
    removeRole(user.id)
    return
  }

  if (actionKey === 'activate') {
    setUserActiveState(user.id, true)
    return
  }

  if (actionKey === 'deactivate') {
    setUserActiveState(user.id, false)
  }
}
</script>

<template>
  <section class="user-management-view">
    <header class="user-management-view__header">
      <div>
        <h1>User Management</h1>
        <p>Assign roles and manage access</p>
      </div>
    </header>

    <BaseCard>
      <BaseTable :columns="roleTableColumns" :rows="sortedUsers">
        <template #cell-assignedRoleId="{ value }">
          <BaseBadge :variant="value ? 'info' : 'neutral'">
            {{ resolveRoleName(value) }}
          </BaseBadge>
        </template>

        <template #cell-status="{ row }">
          <BaseBadge :variant="row.status === 'Active' ? 'success' : 'neutral'">
            {{ row.status }}
          </BaseBadge>
        </template>

        <template #cell-actions="{ row }">
          <div v-if="canManageUsers" class="table-action-cell">
            <RowActionMenu
              :actions="getUserActions(row)"
              label="User row actions"
              @select="handleUserAction($event, row)"
            />
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal
      v-model="isRoleModalOpen"
      :title="roleModalTitle"
      description="Select a role to update this user's assignment."
    >
      <label class="role-picker">
        <span>Role</span>
        <select v-model="selectedRoleId">
          <option value="">Unassigned</option>
          <option v-for="role in availableRoles" :key="role.id" :value="role.id">
            {{ role.name }}
          </option>
        </select>
      </label>

      <template #footer>
        <BaseButton variant="ghost" @click="closeChangeRoleModal">Cancel</BaseButton>
        <BaseButton @click="saveRoleAssignment">Save</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.user-management-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.user-management-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.user-management-view__header h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.4rem;
  font-weight: 620;
}

.user-management-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.table-action-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.role-picker {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.7);
}

.role-picker span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 550;
}

.role-picker select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.2) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
  outline: none;
}

.role-picker select:focus {
  border-color: var(--color-input-focus-border);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

@media (max-width: 980px) {
  .user-management-view__header {
    flex-direction: column;
    align-items: stretch;
  }

}
</style>
