<script setup>
import { computed, ref, watch } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import RowActionMenu from '../components/ui/RowActionMenu.vue'
import BaseTable from '../components/ui/BaseTable.vue'
import BaseToggle from '../components/ui/BaseToggle.vue'
import {
  createDefaultPermissions,
  createScopedPermissions,
  normalizePermissions,
  permissionActions,
  permissionModules,
  baseRoleTypeOptions
} from '../mock/rolesData'
import { useTenantStore } from '../state/tenantStore'

const { currentCommunityData, isCommunityAdmin } = useTenantStore()

const communityData = computed(() => currentCommunityData.value)
const roles = computed(() => communityData.value?.roles || [])
const committees = computed(() => communityData.value?.committees || [])

const canManageRoles = computed(() => isCommunityAdmin.value)

const isRoleModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isPermissionsModalOpen = ref(false)
const isCommitteeOverrideModalOpen = ref(false)
const isHistoryModalOpen = ref(false)

const mode = ref('create')
const editingRoleId = ref('')
const rolePendingDelete = ref(null)
const historyRole = ref(null)

const permissionsRoleId = ref('')
const permissionsRoleName = ref('')
const permissionsDraft = ref(normalizePermissions())

const roleForm = ref({
  name: '',
  description: '',
  baseRoleType: baseRoleTypeOptions[0]
})
const selectedSummaryRoleId = ref(roles.value[0]?.id || '')
const roleFormError = ref('')

const restrictedRoleNames = [
  'president',
  'vice president',
  'treasurer',
  'secretary',
  'member-at-large',
  'member at large'
]

const editingRole = computed(() => roles.value.find((role) => role.id === editingRoleId.value) || null)
const isEditingSystemRole = computed(
  () => mode.value === 'edit' && Boolean(editingRole.value?.isSystem)
)

watch(
  roles,
  (nextRoles) => {
    if (!nextRoles.find((role) => role.id === selectedSummaryRoleId.value)) {
      selectedSummaryRoleId.value = nextRoles[0]?.id || ''
    }
  },
  { immediate: true }
)

const moduleActionsByKey = permissionModules.reduce((accumulator, module) => {
  accumulator[module.key] = new Set(module.actions)
  return accumulator
}, {})

const tableColumns = [
  { key: 'name', label: 'Role Name', width: '20%' },
  { key: 'description', label: 'Description', width: '28%' },
  { key: 'baseRoleType', label: 'Base Role Type', width: '14%' },
  { key: 'memberCount', label: 'Members Assigned', width: '12%', align: 'right' },
  { key: 'updatedAt', label: 'Last Modified', width: '12%' },
  { key: 'actions', label: 'Actions', width: '8%', align: 'center' }
]
const effectiveSummaryColumns = [
  { key: 'module', label: 'Module', width: '48%' },
  { key: 'allowed', label: 'Allowed Actions', width: '26%' },
  { key: 'status', label: 'Access Status', width: '26%' }
]
const historyColumns = [
  { key: 'changedAt', label: 'Changed At', width: '20%' },
  { key: 'changedBy', label: 'Changed By', width: '22%' },
  { key: 'changeSummary', label: 'Change Summary', width: '58%' }
]

const sortedRoles = computed(() =>
  [...roles.value].sort((firstRole, secondRole) => firstRole.name.localeCompare(secondRole.name))
)

const roleModalTitle = computed(() => (mode.value === 'edit' ? 'Edit Role' : 'Create Role'))

const permissionsModalTitle = computed(() => `Manage Permissions — ${permissionsRoleName.value}`)

const historyModalTitle = computed(() =>
  historyRole.value ? `Role History — ${historyRole.value.name}` : 'Role History'
)

const canSaveRole = computed(() => roleForm.value.name.trim().length > 0)
const selectedSummaryRole = computed(() => {
  if (selectedSummaryRoleId.value) {
    const selectedRole = roles.value.find((role) => role.id === selectedSummaryRoleId.value)
    if (selectedRole) {
      return selectedRole
    }
  }

  return sortedRoles.value[0] || null
})
const effectiveSummaryRows = computed(() => {
  const selectedRoleGlobalPermissions = selectedSummaryRole.value?.permissions?.global || {}

  return permissionModules.map((module) => {
    const allowedCount = module.actions.reduce((count, actionKey) => {
      return selectedRoleGlobalPermissions[module.key]?.[actionKey] ? count + 1 : count
    }, 0)

    return {
      id: module.key,
      module: module.label,
      allowed: `${allowedCount}/${module.actions.length}`,
      hasAccess: allowedCount > 0
    }
  })
})
const historyRows = computed(() => {
  const history = historyRole.value?.history || []
  return history.map((entry, index) => ({
    id: `${historyRole.value?.id || 'role'}-${index}`,
    ...entry
  }))
})

const committeeMap = computed(() => {
  const mapped = {}
  committees.value.forEach((committee) => {
    mapped[committee.id] = committee
  })
  return mapped
})

const scopedOverrideCommittees = computed(() =>
  Object.keys(permissionsDraft.value.scoped)
    .map((committeeId) => {
      const committee = committeeMap.value[committeeId]
      return {
        id: committeeId,
        name: committee ? committee.name : committeeId
      }
    })
    .sort((firstCommittee, secondCommittee) =>
      firstCommittee.name.localeCompare(secondCommittee.name)
    )
)

const availableCommitteeOptions = computed(() =>
  committees.value.filter(
    (committee) => !Object.prototype.hasOwnProperty.call(permissionsDraft.value.scoped, committee.id)
  )
)

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeRoleName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function isRestrictedRoleName(value) {
  if (!value) {
    return false
  }

  return restrictedRoleNames.includes(normalizeRoleName(value))
}

function resolveBaseRoleType(role) {
  if (!role) {
    return baseRoleTypeOptions[0]
  }

  if (role.baseRoleType) {
    return role.baseRoleType
  }

  if (role.scope === 'Homeowner') {
    return 'Member'
  }

  if (role.scope === 'Board') {
    return 'Board'
  }

  if (role.name?.toLowerCase().includes('member')) {
    return 'Member'
  }

  return baseRoleTypeOptions[0]
}

function buildHistoryEntry(changeSummary) {
  const changedBy = isCommunityAdmin.value ? 'Community Admin' : 'Board Member'

  return {
    changedAt: getTodayDate(),
    changedBy,
    changeSummary
  }
}

function appendHistory(existingHistory, summary) {
  const history = Array.isArray(existingHistory) ? [...existingHistory] : []
  history.unshift(buildHistoryEntry(summary))
  return history
}

function createRoleId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `role-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

function updateRoleById(roleId, updater) {
  if (!communityData.value) {
    return
  }

  communityData.value.roles = communityData.value.roles.map((role) =>
    role.id === roleId ? updater(role) : role
  )
}

function patchGlobalPermissions(updater) {
  permissionsDraft.value = {
    ...permissionsDraft.value,
    global: updater(permissionsDraft.value.global)
  }
}

function patchScopedCommitteePermissions(committeeId, updater) {
  const currentScopedPermissions = permissionsDraft.value.scoped[committeeId] || {}

  permissionsDraft.value = {
    ...permissionsDraft.value,
    scoped: {
      ...permissionsDraft.value.scoped,
      [committeeId]: updater(currentScopedPermissions)
    }
  }
}

function resetRoleForm() {
  roleForm.value = {
    name: '',
    description: '',
    baseRoleType: baseRoleTypeOptions[0]
  }
  roleFormError.value = ''
}

function openCreateRoleModal() {
  if (!canManageRoles.value) {
    return
  }

  mode.value = 'create'
  editingRoleId.value = ''
  resetRoleForm()
  isRoleModalOpen.value = true
}

function openEditRoleModal(role) {
  if (!canManageRoles.value) {
    return
  }

  mode.value = 'edit'
  editingRoleId.value = role.id
  roleForm.value = {
    name: role.name,
    description: role.description,
    baseRoleType: resolveBaseRoleType(role)
  }
  roleFormError.value = ''
  isRoleModalOpen.value = true
}

function closeRoleModal() {
  isRoleModalOpen.value = false
  roleFormError.value = ''
}

function saveRole() {
  if (!canManageRoles.value) {
    return
  }

  if (!canSaveRole.value) {
    roleFormError.value = 'Role name is required.'
    return
  }

  if (!isEditingSystemRole.value && isRestrictedRoleName(roleForm.value.name)) {
    roleFormError.value = 'Titles are not roles. Use board titles in metadata instead.'
    return
  }

  roleFormError.value = ''

  const payload = {
    name: roleForm.value.name.trim(),
    description: roleForm.value.description.trim(),
    baseRoleType: roleForm.value.baseRoleType,
    updatedAt: getTodayDate()
  }

  if (mode.value === 'edit') {
    const lockedName = editingRole.value?.isSystem ? editingRole.value.name : payload.name
    const lockedBaseRoleType = editingRole.value?.isSystem
      ? resolveBaseRoleType(editingRole.value)
      : payload.baseRoleType

    updateRoleById(editingRoleId.value, (role) => ({
      ...role,
      ...payload,
      name: lockedName,
      baseRoleType: lockedBaseRoleType,
      history: appendHistory(role.history, 'Role details updated')
    }))
  } else {
    if (!communityData.value) {
      return
    }

    communityData.value.roles = [
      {
        id: createRoleId(),
        memberCount: 0,
        isSystem: false,
        permissions: {
          global: createDefaultPermissions({ dashboardViewEnabled: true }),
          scoped: createScopedPermissions()
        },
        history: appendHistory([], 'Role created'),
        ...payload
      },
      ...communityData.value.roles
    ]
  }

  closeRoleModal()
}

function duplicateRole(role) {
  if (!canManageRoles.value) {
    return
  }

  if (!communityData.value) {
    return
  }

  communityData.value.roles = [
    {
      ...role,
      id: createRoleId(),
      name: `${role.name} (Copy)`,
      isSystem: false,
      updatedAt: getTodayDate(),
      permissions: normalizePermissions(role.permissions),
      history: appendHistory([], `Role duplicated from ${role.name}`),
      baseRoleType: resolveBaseRoleType(role)
    },
    ...communityData.value.roles
  ]
}

function promptDeleteRole(role) {
  if (!canManageRoles.value) {
    return
  }

  if (role.isSystem) {
    return
  }

  rolePendingDelete.value = role
  isDeleteModalOpen.value = true
}

function getRoleActions(role) {
  return [
    { key: 'edit', label: 'Edit' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'history', label: 'View History' },
    { key: 'duplicate', label: 'Duplicate' },
    {
      key: 'delete',
      label: 'Delete',
      variant: 'danger',
      disabled: role.isSystem,
      title: role.isSystem ? 'System roles cannot be deleted.' : ''
    }
  ]
}

function handleRoleAction(actionKey, role) {
  if (actionKey === 'edit') {
    openEditRoleModal(role)
    return
  }

  if (actionKey === 'permissions') {
    openPermissionsModal(role)
    return
  }

  if (actionKey === 'duplicate') {
    duplicateRole(role)
    return
  }

  if (actionKey === 'history') {
    openHistoryModal(role)
    return
  }

  if (actionKey === 'delete') {
    promptDeleteRole(role)
  }
}

function closeDeleteModal() {
  rolePendingDelete.value = null
  isDeleteModalOpen.value = false
}

function confirmDeleteRole() {
  if (!rolePendingDelete.value) {
    return
  }

  if (!communityData.value) {
    return
  }

  communityData.value.roles = communityData.value.roles.filter(
    (role) => role.id !== rolePendingDelete.value.id
  )
  closeDeleteModal()
}

function openPermissionsModal(role) {
  if (!canManageRoles.value) {
    return
  }

  permissionsRoleId.value = role.id
  permissionsRoleName.value = role.name
  permissionsDraft.value = normalizePermissions(role.permissions)
  isPermissionsModalOpen.value = true
}

function closePermissionsModal() {
  isPermissionsModalOpen.value = false
  isCommitteeOverrideModalOpen.value = false
  permissionsRoleId.value = ''
  permissionsRoleName.value = ''
  permissionsDraft.value = normalizePermissions()
}

function savePermissions() {
  if (!canManageRoles.value) {
    return
  }

  if (!permissionsRoleId.value) {
    return
  }

  const normalizedPermissions = normalizePermissions(permissionsDraft.value)

  updateRoleById(permissionsRoleId.value, (role) => ({
    ...role,
    permissions: normalizedPermissions,
    updatedAt: getTodayDate(),
    history: appendHistory(role.history, 'Permissions updated')
  }))

  closePermissionsModal()
}

function openHistoryModal(role) {
  historyRole.value = role
  isHistoryModalOpen.value = true
}

function closeHistoryModal() {
  historyRole.value = null
  isHistoryModalOpen.value = false
}

function isActionSupported(moduleKey, actionKey) {
  return moduleActionsByKey[moduleKey]?.has(actionKey) ?? false
}

function getPermissionValue(scopeKey, moduleKey, actionKey) {
  const globalValue = Boolean(permissionsDraft.value.global[moduleKey]?.[actionKey])

  if (scopeKey === 'global') {
    return globalValue
  }

  const scopedValue = permissionsDraft.value.scoped[scopeKey]?.[moduleKey]?.[actionKey]
  return typeof scopedValue === 'boolean' ? scopedValue : globalValue
}

function hasScopedOverrideValue(committeeId, moduleKey, actionKey) {
  return typeof permissionsDraft.value.scoped[committeeId]?.[moduleKey]?.[actionKey] === 'boolean'
}

function setPermissionValue(scopeKey, moduleKey, actionKey, nextValue) {
  if (!isActionSupported(moduleKey, actionKey)) {
    return
  }

  if (scopeKey === 'global') {
    patchGlobalPermissions((currentGlobal) => ({
      ...currentGlobal,
      [moduleKey]: {
        ...currentGlobal[moduleKey],
        [actionKey]: nextValue
      }
    }))
    return
  }

  patchScopedCommitteePermissions(scopeKey, (currentScopedCommittee) => ({
    ...currentScopedCommittee,
    [moduleKey]: {
      ...currentScopedCommittee[moduleKey],
      [actionKey]: nextValue
    }
  }))
}

function isModuleAllSelected(scopeKey, moduleKey) {
  const module = permissionModules.find((candidate) => candidate.key === moduleKey)
  if (!module) {
    return false
  }

  return module.actions.every((actionKey) => getPermissionValue(scopeKey, moduleKey, actionKey))
}

function setModuleAll(scopeKey, moduleKey, nextValue) {
  const module = permissionModules.find((candidate) => candidate.key === moduleKey)
  if (!module) {
    return
  }

  if (scopeKey === 'global') {
    patchGlobalPermissions((currentGlobal) => {
      const nextGlobal = {
        ...currentGlobal,
        [moduleKey]: {
          ...currentGlobal[moduleKey]
        }
      }

      module.actions.forEach((actionKey) => {
        nextGlobal[moduleKey][actionKey] = nextValue
      })

      return nextGlobal
    })
    return
  }

  patchScopedCommitteePermissions(scopeKey, (currentScopedCommittee) => {
    const nextScopedCommittee = {
      ...currentScopedCommittee,
      [moduleKey]: {
        ...currentScopedCommittee[moduleKey]
      }
    }

    module.actions.forEach((actionKey) => {
      nextScopedCommittee[moduleKey][actionKey] = nextValue
    })

    return nextScopedCommittee
  })
}

function getModulesForAction(actionKey) {
  return permissionModules.filter((module) => module.actions.includes(actionKey))
}

function isActionAllSelected(scopeKey, actionKey) {
  const modules = getModulesForAction(actionKey)
  if (modules.length === 0) {
    return false
  }

  return modules.every((module) => getPermissionValue(scopeKey, module.key, actionKey))
}

function setActionAll(scopeKey, actionKey, nextValue) {
  const modules = getModulesForAction(actionKey)
  if (modules.length === 0) {
    return
  }

  if (scopeKey === 'global') {
    patchGlobalPermissions((currentGlobal) => {
      const nextGlobal = { ...currentGlobal }

      modules.forEach((module) => {
        nextGlobal[module.key] = {
          ...nextGlobal[module.key],
          [actionKey]: nextValue
        }
      })

      return nextGlobal
    })
    return
  }

  patchScopedCommitteePermissions(scopeKey, (currentScopedCommittee) => {
    const nextScopedCommittee = { ...currentScopedCommittee }

    modules.forEach((module) => {
      nextScopedCommittee[module.key] = {
        ...nextScopedCommittee[module.key],
        [actionKey]: nextValue
      }
    })

    return nextScopedCommittee
  })
}

function openAddCommitteeOverrideModal() {

  isCommitteeOverrideModalOpen.value = true
}

function closeAddCommitteeOverrideModal() {
  isCommitteeOverrideModalOpen.value = false
}

function addCommitteeOverride(committeeId) {

  if (!committeeId) {
    return
  }

  if (Object.prototype.hasOwnProperty.call(permissionsDraft.value.scoped, committeeId)) {
    return
  }

  permissionsDraft.value = {
    ...permissionsDraft.value,
    scoped: createScopedPermissions({
      ...permissionsDraft.value.scoped,
      [committeeId]: {}
    })
  }

  closeAddCommitteeOverrideModal()
}

function removeCommitteeOverride(committeeId) {

  if (!Object.prototype.hasOwnProperty.call(permissionsDraft.value.scoped, committeeId)) {
    return
  }

  const nextScopedPermissions = { ...permissionsDraft.value.scoped }
  delete nextScopedPermissions[committeeId]

  permissionsDraft.value = {
    ...permissionsDraft.value,
    scoped: nextScopedPermissions
  }
}
</script>

<template>
  <section class="roles-view">
    <header class="roles-view__header">
      <div>
        <h1>Roles &amp; Permissions</h1>
        <p>Board-Controlled Roles &amp; Permissions</p>
      </div>
      <BaseButton :disabled="!canManageRoles" @click="openCreateRoleModal">
        Create Role
      </BaseButton>
    </header>

    <div class="roles-view__banner">
      Board Members control role definitions. Members may also serve on committees with scoped
      permissions.
    </div>

    <BaseCard>
      <BaseTable
        :columns="tableColumns"
        :rows="sortedRoles"
        style="--table-min-width: 1080px;"
      >
        <template #cell-name="{ row }">
          <div class="role-name-cell">
            <span>{{ row.name }}</span>
            <BaseBadge
              v-if="row.isSystem"
              variant="neutral"
            >
              System Role
            </BaseBadge>
          </div>
        </template>

        <template #cell-baseRoleType="{ row }">
          <span>{{ resolveBaseRoleType(row) }}</span>
        </template>

        <template #cell-memberCount="{ value }">
          <span class="roles-view__numeric">{{ value }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div v-if="canManageRoles" class="table-action-cell">
            <RowActionMenu
              :actions="getRoleActions(row)"
              label="Role row actions"
              @select="handleRoleAction($event, row)"
            />
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseCard>
      <header class="effective-summary__header">
        <div>
          <h3>Effective Permissions Summary</h3>
          <p>Global permission snapshot for the selected role</p>
        </div>

        <label class="effective-summary__role-select">
          <span>Role</span>
          <select v-model="selectedSummaryRoleId">
            <option v-for="role in sortedRoles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </label>
      </header>

      <BaseTable :columns="effectiveSummaryColumns" :rows="effectiveSummaryRows">
        <template #cell-status="{ row }">
          <div class="effective-summary__status">
            <span class="effective-summary__dot" :class="{ 'is-enabled': row.hasAccess }" />
            <span>{{ row.hasAccess ? 'Enabled' : 'No Access' }}</span>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal
      v-model="isRoleModalOpen"
      :title="roleModalTitle"
      description="Create or update a role definition for this HOA instance."
    >
      <div class="role-form">
        <div class="role-form__locked" :class="{ 'is-disabled': isEditingSystemRole }">
          <BaseInput
            v-model="roleForm.name"
            label="Role Name"
            placeholder="Enter role name"
          />
        </div>
        <BaseInput
          v-model="roleForm.description"
          type="textarea"
          :rows="4"
          label="Description"
          placeholder="Describe role responsibilities"
        />

        <label class="role-form__field">
          <span>Base Role Type</span>
          <select v-model="roleForm.baseRoleType" :disabled="isEditingSystemRole">
            <option v-for="baseType in baseRoleTypeOptions" :key="baseType" :value="baseType">
              {{ baseType }}
            </option>
          </select>
        </label>

        <p v-if="isEditingSystemRole" class="role-form__note">
          System roles have locked names and base types.
        </p>

        <p v-if="roleFormError" class="role-form__error">{{ roleFormError }}</p>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeRoleModal">Cancel</BaseButton>
        <BaseButton :disabled="!canSaveRole" @click="saveRole">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isPermissionsModalOpen"
      :title="permissionsModalTitle"
      description="Configure role-level module permissions for this HOA instance."
    >
      <div class="permissions-modal-content">
        <section class="permissions-section">
          <h3>Global Permissions</h3>

          <div class="permissions-matrix-wrap">
            <table class="permissions-matrix">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>
                    <div class="permissions-matrix__header-cell">
                      <span>Select All (Module)</span>
                    </div>
                  </th>
                  <th v-for="action in permissionActions" :key="`global-${action.key}`">
                    <div class="permissions-matrix__header-cell">
                      <span>{{ action.label }}</span>
                      <BaseToggle
                        :model-value="isActionAllSelected('global', action.key)"
                        @update:model-value="setActionAll('global', action.key, $event)"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="module in permissionModules" :key="`global-${module.key}`">
                  <th class="permissions-matrix__module-label" scope="row">{{ module.label }}</th>
                  <td class="permissions-matrix__toggle-cell">
                    <BaseToggle
                      :model-value="isModuleAllSelected('global', module.key)"
                      @update:model-value="setModuleAll('global', module.key, $event)"
                    />
                  </td>
                  <td
                    v-for="action in permissionActions"
                    :key="`global-${module.key}-${action.key}`"
                    class="permissions-matrix__toggle-cell"
                  >
                    <BaseToggle
                      v-if="isActionSupported(module.key, action.key)"
                      :model-value="getPermissionValue('global', module.key, action.key)"
                      @update:model-value="setPermissionValue('global', module.key, action.key, $event)"
                    />
                    <span v-else class="permissions-matrix__not-applicable">N/A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="committee-overrides">
          <div class="committee-overrides__header">
            <h3>Committee Overrides</h3>
            <BaseButton
              size="sm"
              variant="secondary"
              @click="openAddCommitteeOverrideModal"
            >
              + Add Committee Override
            </BaseButton>
          </div>

          <p v-if="scopedOverrideCommittees.length === 0" class="committee-overrides__empty">
            No committee overrides configured. Global permissions are currently applied to all
            committees.
          </p>

          <div v-else class="committee-overrides__list">
            <BaseCard
              v-for="committee in scopedOverrideCommittees"
              :key="committee.id"
              class="committee-override-card"
            >
              <header class="committee-override-card__header">
                <div>
                  <h4>{{ committee.name }}</h4>
                  <p>Scoped overrides fallback to global permissions when unset.</p>
                </div>
                <BaseButton
                  size="sm"
                  variant="danger"
                  @click="removeCommitteeOverride(committee.id)"
                >
                  Remove Override
                </BaseButton>
              </header>

              <div class="permissions-matrix-wrap">
                <table class="permissions-matrix">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>
                        <div class="permissions-matrix__header-cell">
                          <span>Select All (Module)</span>
                        </div>
                      </th>
                      <th
                        v-for="action in permissionActions"
                        :key="`${committee.id}-${action.key}`"
                      >
                        <div class="permissions-matrix__header-cell">
                          <span>{{ action.label }}</span>
                          <BaseToggle
                            :model-value="isActionAllSelected(committee.id, action.key)"
                            @update:model-value="setActionAll(committee.id, action.key, $event)"
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="module in permissionModules"
                      :key="`${committee.id}-${module.key}`"
                    >
                      <th class="permissions-matrix__module-label" scope="row">{{ module.label }}</th>
                      <td class="permissions-matrix__toggle-cell">
                        <BaseToggle
                          :model-value="isModuleAllSelected(committee.id, module.key)"
                          @update:model-value="setModuleAll(committee.id, module.key, $event)"
                        />
                      </td>
                      <td
                        v-for="action in permissionActions"
                        :key="`${committee.id}-${module.key}-${action.key}`"
                        class="permissions-matrix__toggle-cell"
                      >
                        <div
                          v-if="isActionSupported(module.key, action.key)"
                          class="permissions-matrix__cell-content"
                        >
                          <BaseToggle
                            :model-value="getPermissionValue(committee.id, module.key, action.key)"
                            @update:model-value="setPermissionValue(committee.id, module.key, action.key, $event)"
                          />
                          <span
                            v-if="!hasScopedOverrideValue(committee.id, module.key, action.key)"
                            class="permissions-matrix__inherited"
                          >
                            Inherited
                          </span>
                        </div>
                        <span v-else class="permissions-matrix__not-applicable">N/A</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </BaseCard>
          </div>
        </section>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closePermissionsModal">Cancel</BaseButton>
        <BaseButton @click="savePermissions">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isCommitteeOverrideModalOpen"
      title="Add Committee Override"
      description="Select a committee to add scoped permission overrides."
    >
      <div class="committee-picker">
        <p v-if="availableCommitteeOptions.length === 0" class="committee-picker__empty">
          All available committees already have overrides.
        </p>

        <div v-else class="committee-picker__list">
          <button
            v-for="committee in availableCommitteeOptions"
            :key="committee.id"
            type="button"
            class="committee-picker__item"
            @click="addCommitteeOverride(committee.id)"
          >
            <span>{{ committee.name }}</span>
            <small>{{ committee.id }}</small>
          </button>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeAddCommitteeOverrideModal">Cancel</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isDeleteModalOpen"
      title="Delete Role"
      description="Are you sure you want to delete this role?"
    >
      <p class="delete-note">
        This action removes <strong>{{ rolePendingDelete?.name || 'the selected role' }}</strong> from
        the local mock state.
      </p>

      <template #footer>
        <BaseButton variant="ghost" @click="closeDeleteModal">Cancel</BaseButton>
        <BaseButton variant="danger" @click="confirmDeleteRole">Delete</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isHistoryModalOpen"
      :title="historyModalTitle"
      description="Review recent role changes for governance tracking."
    >
      <div class="history-modal">
        <BaseTable :columns="historyColumns" :rows="historyRows">
          <template #cell-changeSummary="{ value }">
            <span class="history-modal__summary">{{ value }}</span>
          </template>
        </BaseTable>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeHistoryModal">Close</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.roles-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.roles-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.roles-view__header h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.4rem;
  font-weight: 620;
}

.roles-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.roles-view__banner {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-bg-panel);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  padding: var(--space-md);
}

.roles-view__numeric {
  display: inline-flex;
  min-width: calc(var(--space-md) * 2);
  justify-content: flex-end;
}

.role-name-cell {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.table-action-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.effective-summary__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.effective-summary__header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 620;
}

.effective-summary__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.84rem;
}

.effective-summary__role-select {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.7);
  min-width: calc(var(--space-2xl) * 2.1);
}

.effective-summary__role-select span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 550;
}

.effective-summary__role-select select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.1) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
  outline: none;
}

.effective-summary__role-select select:focus {
  border-color: var(--color-input-focus-border);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.effective-summary__status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-primary);
}

.effective-summary__dot {
  width: calc(var(--space-sm) * 1.2);
  height: calc(var(--space-sm) * 1.2);
  border-radius: 999px;
  background: var(--color-border-default);
}

.effective-summary__dot.is-enabled {
  background: var(--color-success);
}

.role-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.role-form__locked.is-disabled {
  pointer-events: none;
  opacity: 0.7;
}

.role-form__field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.7);
}

.role-form__field span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 550;
}

.role-form__field select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.2) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
  outline: none;
}

.role-form__field select:focus {
  border-color: var(--color-input-focus-border);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.role-form__note {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.role-form__error {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.82rem;
  font-weight: 600;
}

.permissions-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  max-height: calc(var(--space-2xl) * 8);
  overflow: auto;
  padding-right: var(--space-xs);
}

.permissions-section,
.committee-overrides {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.permissions-section h3,
.committee-overrides h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 620;
}

.permissions-matrix-wrap {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  max-height: calc(var(--space-2xl) * 5);
  overflow: auto;
}

.permissions-matrix {
  width: 100%;
  border-collapse: collapse;
  min-width: 920px;
}

.permissions-matrix th,
.permissions-matrix td {
  border-bottom: 1px solid var(--color-border-default);
  padding: calc(var(--space-sm) * 1.2);
  text-align: center;
}

.permissions-matrix thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-bg-panel);
}

.permissions-matrix th {
  color: var(--color-text-secondary);
  font-size: 0.73rem;
  font-weight: 620;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.permissions-matrix__header-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.permissions-matrix__module-label {
  text-align: left;
  color: var(--color-text-primary);
  font-size: 0.83rem;
  letter-spacing: 0;
  text-transform: none;
  white-space: nowrap;
}

.permissions-matrix__toggle-cell {
  min-width: calc(var(--space-md) * 4);
}

.permissions-matrix__toggle-cell :deep(.toggle) {
  justify-content: center;
}

.permissions-matrix__cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.permissions-matrix__not-applicable,
.permissions-matrix__inherited {
  color: var(--color-text-secondary);
  font-size: 0.72rem;
}

.permissions-matrix tbody tr:last-child td,
.permissions-matrix tbody tr:last-child th {
  border-bottom: none;
}

.committee-overrides__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
}

.committee-overrides__empty {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.committee-overrides__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.committee-override-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.committee-override-card__header h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.92rem;
  font-weight: 620;
}

.committee-override-card__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.committee-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.committee-picker__empty {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.committee-picker__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.committee-picker__item {
  width: 100%;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
  text-align: left;
  cursor: pointer;
  padding: var(--space-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.committee-picker__item:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.committee-picker__item small {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.delete-note {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.45;
}

.delete-note strong {
  color: var(--color-text-primary);
}

.history-modal {
  max-height: calc(var(--space-2xl) * 6);
  overflow: auto;
}

.history-modal__summary {
  color: var(--color-text-primary);
}

@media (max-width: 980px) {
  .roles-view__header {
    flex-direction: column;
    align-items: stretch;
  }

  .effective-summary__header,
  .committee-overrides__header,
  .committee-override-card__header {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .effective-summary__role-select {
    min-width: 100%;
  }
}
</style>
