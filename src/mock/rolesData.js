export const roleScopeOptions = ['Board', 'Committee', 'Homeowner', 'Custom']

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

const committeeLeadGlobal = {
  committees: { view: true, create: true, edit: true, delete: false },
  meetings: { view: true, create: true, edit: true, delete: false, approve: true, vote: true },
  boardMeetings: { view: true, create: false, edit: false, delete: false, approve: false, vote: true },
  motionsVoting: { view: true, create: true, edit: true, delete: false, approve: true, vote: true },
  documents: { view: true, create: true, edit: true, delete: false, publish: false },
  vendors: { view: true, create: false, edit: false, delete: false, approve: false },
  calendar: { view: true, create: true, edit: true, delete: false, publish: false },
  communications: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    approve: false,
    publish: false
  },
  userManagement: { view: true, create: false, edit: false, delete: false, approve: false },
  settings: { view: false, edit: false, approve: false }
}

const homeownerGlobal = {
  committees: { view: true, create: false, edit: false, delete: false },
  meetings: { view: true, create: false, edit: false, delete: false, approve: false, vote: true },
  boardMeetings: {
    view: true,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    vote: false
  },
  motionsVoting: {
    view: true,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    vote: true
  },
  documents: { view: true, create: false, edit: false, delete: false, publish: false },
  vendors: { view: true, create: false, edit: false, delete: false, approve: false },
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

const propertyManagerGlobal = {
  committees: { view: true, create: false, edit: true, delete: false },
  meetings: { view: true, create: true, edit: true, delete: false, approve: true, vote: false },
  boardMeetings: {
    view: true,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    vote: false
  },
  motionsVoting: {
    view: true,
    create: false,
    edit: false,
    delete: false,
    approve: false,
    vote: false
  },
  documents: { view: true, create: true, edit: true, delete: false, publish: true },
  vendors: { view: true, create: true, edit: true, delete: false, approve: true },
  calendar: { view: true, create: true, edit: true, delete: false, publish: true },
  communications: {
    view: true,
    create: true,
    edit: true,
    delete: false,
    approve: true,
    publish: true
  },
  userManagement: { view: false, create: false, edit: false, delete: false, approve: false },
  settings: { view: false, edit: false, approve: false }
}

const seededRoles = [
  {
    id: '84e9b4f4-34f5-458c-b9b3-e8a6c22d1891',
    name: 'Board Member',
    description: 'Full governance access',
    scope: 'Board',
    isSystem: true,
    memberCount: 4,
    updatedAt: '2026-02-12',
    permissions: {
      global: boardMemberGlobal,
      scoped: {}
    }
  },
  {
    id: 'c4d8bbf3-f87e-4f57-a820-8ee58af17450',
    name: 'Committee Lead',
    description: 'Owns committee agendas and decisions',
    scope: 'Committee',
    isSystem: false,
    memberCount: 7,
    updatedAt: '2026-02-10',
    permissions: {
      global: committeeLeadGlobal,
      scoped: {}
    }
  },
  {
    id: 'ba35f296-f0cf-4602-af83-ea1e9ec8da07',
    name: 'Homeowner',
    description: 'Resident portal access and request submission',
    scope: 'Homeowner',
    isSystem: true,
    memberCount: 132,
    updatedAt: '2026-02-08',
    permissions: {
      global: homeownerGlobal,
      scoped: {}
    }
  },
  {
    id: '48f729b8-44c8-42f6-9935-3f7f4f247f05',
    name: 'Property Manager',
    description: 'Operational oversight for vendors and maintenance',
    scope: 'Custom',
    isSystem: false,
    memberCount: 2,
    updatedAt: '2026-02-11',
    permissions: {
      global: propertyManagerGlobal,
      scoped: {
        finance: {
          documents: { publish: false },
          vendors: { approve: false }
        }
      }
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
  return seededRoles.map((role) => ({
    ...role,
    permissions: normalizePermissions(role.permissions)
  }))
}
