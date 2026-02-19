export const baseRoleTypeOptions = ['Board', 'Member']

export const permissionActions = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'vote', label: 'Vote' },
  { key: 'publish', label: 'Publish' }
]

export const permissionModules = [
  { key: 'dashboard', label: 'Dashboard', actions: ['view'] },
  { key: 'committees', label: 'Committees', actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'meetings', label: 'Meetings', actions: ['view', 'create', 'edit', 'delete', 'approve', 'vote'] },
  {
    key: 'boardMeetings',
    label: 'Board Meetings',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'vote']
  },
  {
    key: 'motionsVoting',
    label: 'Motions / Voting',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'vote']
  },
  {
    key: 'documents',
    label: 'Documents',
    actions: ['view', 'create', 'edit', 'delete', 'publish']
  },
  { key: 'vendors', label: 'Vendors', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
  {
    key: 'calendar',
    label: 'Calendar',
    actions: ['view', 'create', 'edit', 'delete', 'publish']
  },
  {
    key: 'communications',
    label: 'Communications',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'publish']
  },
  {
    key: 'userManagement',
    label: 'User Management',
    actions: ['view', 'create', 'edit', 'delete', 'approve']
  },
  { key: 'settings', label: 'Settings', actions: ['view', 'edit', 'approve'] }
]

const boardMemberGlobal = {
  committees: { view: true, create: true, edit: true, delete: true },
  meetings: { view: true, create: true, edit: true, delete: true, approve: true, vote: true },
  boardMeetings: { view: true, create: true, edit: true, delete: true, approve: true, vote: true },
  motionsVoting: { view: true, create: true, edit: true, delete: true, approve: true, vote: true },
  documents: { view: true, create: true, edit: true, delete: true, publish: true },
  vendors: { view: true, create: true, edit: true, delete: true, approve: true },
  calendar: { view: true, create: true, edit: true, delete: true, publish: true },
  communications: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    approve: true,
    publish: true
  },
  userManagement: { view: true, create: true, edit: true, delete: true, approve: true },
  settings: { view: true, edit: true, approve: true }
}

const homeownerGlobal = {
  committees: { view: false, create: false, edit: false, delete: false },
  meetings: { view: true, create: false, edit: false, delete: false, approve: false, vote: false },
  boardMeetings: {
    view: false,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    vote: false
  },
  motionsVoting: {
    view: false,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    vote: false
  },
  documents: { view: true, create: false, edit: false, delete: false, publish: false },
  vendors: { view: false, create: false, edit: false, delete: false, approve: false },
  calendar: { view: true, create: false, edit: false, delete: false, publish: false },
  communications: {
    view: true,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    publish: false
  },
  userManagement: { view: false, create: false, edit: false, delete: false, approve: false },
  settings: { view: false, edit: false, approve: false }
}

const seededRoles = [
  {
    id: '84e9b4f4-34f5-458c-b9b3-e8a6c22d1891',
    name: 'Board Member',
    description: 'Full governance access',
    baseRoleType: 'Board',
    isSystem: true,
    memberCount: 4,
    updatedAt: '2026-02-12',
    history: [
      {
        changedAt: '2026-02-12',
        changedBy: 'System',
        changeSummary: 'Seeded system role'
      }
    ],
    permissions: {
      global: boardMemberGlobal,
      scoped: {}
    }
  },
  {
    id: 'ba35f296-f0cf-4602-af83-ea1e9ec8da07',
    name: 'Member (Homeowner)',
    description: 'Resident portal access and request submission',
    baseRoleType: 'Member',
    isSystem: true,
    memberCount: 132,
    updatedAt: '2026-02-08',
    history: [
      {
        changedAt: '2026-02-08',
        changedBy: 'System',
        changeSummary: 'Seeded system role'
      }
    ],
    permissions: {
      global: homeownerGlobal,
      scoped: {}
    }
  }
]

export function createDefaultPermissions(options = {}) {
  const { dashboardViewEnabled = true } = options
  const globalPermissions = {}

  permissionModules.forEach((module) => {
    globalPermissions[module.key] = {}
    module.actions.forEach((actionKey) => {
      globalPermissions[module.key][actionKey] = false
    })
  })

  if (dashboardViewEnabled && globalPermissions.dashboard?.view !== undefined) {
    globalPermissions.dashboard.view = true
  }

  return globalPermissions
}

export function createScopedPermissions(inputScoped = {}) {
  const scopedPermissions = {}

  if (!inputScoped || typeof inputScoped !== 'object') {
    return scopedPermissions
  }

  Object.entries(inputScoped).forEach(([committeeId, committeePermissions]) => {
    if (!committeeId) {
      return
    }

    scopedPermissions[committeeId] = {}

    if (!committeePermissions || typeof committeePermissions !== 'object') {
      return
    }

    permissionModules.forEach((module) => {
      const sourceModulePermissions = committeePermissions[module.key]
      if (!sourceModulePermissions || typeof sourceModulePermissions !== 'object') {
        return
      }

      const normalizedModulePermissions = {}

      module.actions.forEach((actionKey) => {
        if (typeof sourceModulePermissions[actionKey] === 'boolean') {
          normalizedModulePermissions[actionKey] = sourceModulePermissions[actionKey]
        }
      })

      if (Object.keys(normalizedModulePermissions).length > 0) {
        scopedPermissions[committeeId][module.key] = normalizedModulePermissions
      }
    })
  })

  return scopedPermissions
}

export function normalizePermissions(inputPermissions = {}, options = {}) {
  const normalizedGlobal = createDefaultPermissions({
    dashboardViewEnabled: options.dashboardViewEnabled ?? true
  })

  const hasStructuredShape =
    inputPermissions &&
    typeof inputPermissions === 'object' &&
    (Object.prototype.hasOwnProperty.call(inputPermissions, 'global') ||
      Object.prototype.hasOwnProperty.call(inputPermissions, 'scoped'))

  const sourceGlobal = hasStructuredShape ? inputPermissions.global || {} : inputPermissions
  const sourceScoped = hasStructuredShape ? inputPermissions.scoped || {} : {}

  permissionModules.forEach((module) => {
    const sourceModulePermissions = sourceGlobal?.[module.key]
    if (!sourceModulePermissions || typeof sourceModulePermissions !== 'object') {
      return
    }

    module.actions.forEach((actionKey) => {
      if (typeof sourceModulePermissions[actionKey] === 'boolean') {
        normalizedGlobal[module.key][actionKey] = sourceModulePermissions[actionKey]
      }
    })
  })

  return {
    global: normalizedGlobal,
    scoped: createScopedPermissions(sourceScoped)
  }
}

export function createInitialRoles() {
  return seededRoles.map((role) => {
    const normalizedName = role.name === 'Homeowner' ? 'Member (Homeowner)' : role.name
    const normalizedBaseRoleType =
      role.baseRoleType || (normalizedName === 'Member (Homeowner)' ? 'Member' : 'Board')

    return {
      ...role,
      name: normalizedName,
      baseRoleType: normalizedBaseRoleType,
      history: Array.isArray(role.history) ? role.history : [],
      permissions: normalizePermissions(role.permissions)
    }
  })
}
