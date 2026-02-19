import { computed } from 'vue'
import { useTenantStore } from '../state/tenantStore'

const adminOnlyModules = new Set(['roles-permissions', 'metadata', 'settings', 'user-management'])

const moduleAliases = {
  motions: 'motionsVoting',
  newsletters: 'communications',
  documents: 'documents',
  'drb-submissions': 'documents',
  'complaints-requests': 'communications',
  'user-management': 'userManagement',
  settings: 'settings',
  committees: 'committees',
  meetings: 'meetings',
  calendar: 'calendar',
  vendors: 'vendors',
  dashboard: 'dashboard'
}

function normalizeRoleName(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function resolveBaseRoleType(role) {
  if (!role) {
    return ''
  }
  if (role.baseRoleType) {
    return role.baseRoleType
  }
  const normalizedName = normalizeRoleName(role.name)
  if (normalizedName.includes('member')) {
    return 'Member'
  }
  return 'Board'
}

function resolvePermissionModuleKey(moduleKey) {
  if (!moduleKey) {
    return ''
  }
  return moduleAliases[moduleKey] || moduleKey
}

function getEffectivePermission(role, moduleKey, actionKey, committeeId) {
  if (!role || !role.permissions) {
    return false
  }

  const resolvedModuleKey = resolvePermissionModuleKey(moduleKey)
  const globalValue = Boolean(role.permissions.global?.[resolvedModuleKey]?.[actionKey])
  if (!committeeId) {
    return globalValue
  }

  const scopedValue = role.permissions.scoped?.[committeeId]?.[resolvedModuleKey]?.[actionKey]
  return typeof scopedValue === 'boolean' ? scopedValue : globalValue
}

export function usePermission() {
  const {
    state,
    currentCommunityData,
    currentUserCommitteeIds,
    isCommunityAdmin,
    isBoard,
    isMember
  } = useTenantStore()

  const roles = computed(() => currentCommunityData.value?.roles || [])

  const boardRole = computed(
    () =>
      roles.value.find(
        (role) => role.isSystem && resolveBaseRoleType(role) === 'Board'
      ) || roles.value.find((role) => normalizeRoleName(role.name) === 'board member') || null
  )

  const memberRole = computed(
    () =>
      roles.value.find(
        (role) => role.isSystem && resolveBaseRoleType(role) === 'Member'
      ) ||
      roles.value.find((role) => normalizeRoleName(role.name).includes('member')) ||
      null
  )

  const isAdmin = computed(() => isCommunityAdmin.value)

  function canView(moduleKey, options = {}) {
    if (state.isSaasAdmin) {
      return false
    }

    if (isAdmin.value) {
      return true
    }

    if (adminOnlyModules.has(moduleKey)) {
      return false
    }

    const resolvedModuleKey = resolvePermissionModuleKey(moduleKey)
    const committeeId = options.committeeId

    if (committeeId && !currentUserCommitteeIds.value.includes(committeeId)) {
      return false
    }

    if (
      (moduleKey === 'committees' || moduleKey === 'meetings') &&
      !isBoard.value &&
      currentUserCommitteeIds.value.length === 0
    ) {
      return false
    }

    const boardAllowed = isBoard.value
      ? getEffectivePermission(boardRole.value, resolvedModuleKey, 'view', committeeId)
      : false
    const memberAllowed = isMember.value
      ? getEffectivePermission(memberRole.value, resolvedModuleKey, 'view', committeeId)
      : false

    return boardAllowed || memberAllowed
  }

  function canPerform(moduleKey, actionKey, options = {}) {
    if (state.isSaasAdmin) {
      return false
    }

    if (isAdmin.value) {
      return true
    }

    if (adminOnlyModules.has(moduleKey)) {
      return false
    }

    const resolvedModuleKey = resolvePermissionModuleKey(moduleKey)
    const committeeId = options.committeeId

    if (committeeId && !currentUserCommitteeIds.value.includes(committeeId)) {
      return false
    }

    const boardAllowed = isBoard.value
      ? getEffectivePermission(boardRole.value, resolvedModuleKey, actionKey, committeeId)
      : false
    const memberAllowed = isMember.value
      ? getEffectivePermission(memberRole.value, resolvedModuleKey, actionKey, committeeId)
      : false

    return boardAllowed || memberAllowed
  }

  return {
    canView,
    canPerform,
    isAdmin,
    isBoard,
    isMember
  }
}
