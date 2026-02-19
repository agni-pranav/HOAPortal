import { computed, reactive } from 'vue'
import { createInitialCommittees } from '../mock/committeesData'
import { createInitialMeetings } from '../mock/mockMeetingsData'
import { createInitialUsers } from '../mock/mockUsersData'
import { createInitialRoles } from '../mock/rolesData'
import { createInitialMetadata } from '../mock/metadataData'
import { createInitialMotions } from '../mock/motionsData'

const communitySeeds = [
  {
    id: 'wedgewood',
    name: 'Wedgewood Cluster',
    alias: 'wedgewood',
    status: 'active',
    createdAt: '2025-11-18',
    adminName: 'Alicia Monroe',
    environment: 'Production'
  },
  {
    id: 'green-valley',
    name: 'Green Valley HOA',
    alias: 'green-valley',
    status: 'active',
    createdAt: '2026-01-12',
    adminName: 'Marcus Lee',
    environment: 'Production'
  },
  {
    id: 'lakeside',
    name: 'Lakeside Estates',
    alias: 'lakeside',
    status: 'suspended',
    createdAt: '2025-09-02',
    adminName: 'Priya Bhatt',
    environment: 'Staging'
  }
]

const defaultEvents = [
  {
    id: 'event-annual-meeting',
    title: 'HOA Annual Meeting',
    description: 'Annual meeting with board updates and community Q&A.',
    startDate: '2026-02-12T23:00:00.000Z',
    endDate: '2026-02-13T00:30:00.000Z',
    eventTypeId: 'event-community',
    mode: 'onsite',
    createdBy: 'Community Admin',
    createdAt: '2026-02-01'
  },
  {
    id: 'event-pool-inspection',
    title: 'Pool Safety Inspection',
    description: 'Safety walkthrough with vendor and board representatives.',
    startDate: '2026-02-18T16:30:00.000Z',
    endDate: '2026-02-18T17:30:00.000Z',
    eventTypeId: 'event-board',
    mode: 'onsite',
    createdBy: 'Community Admin',
    createdAt: '2026-02-02'
  },
  {
    id: 'event-landscape-walk',
    title: 'Landscape Walkthrough',
    description: 'Committee + vendor walkthrough of key landscape areas.',
    startDate: '2026-02-24T22:00:00.000Z',
    endDate: '2026-02-24T23:00:00.000Z',
    eventTypeId: 'event-board',
    mode: 'onsite',
    createdBy: 'Community Admin',
    createdAt: '2026-02-03'
  },
  {
    id: 'event-social-night',
    title: 'Community Social Night',
    description: 'Neighborhood social with committee hosts.',
    startDate: '2026-03-07T01:00:00.000Z',
    endDate: '2026-03-07T03:00:00.000Z',
    eventTypeId: 'event-community',
    mode: 'onsite',
    createdBy: 'Community Admin',
    createdAt: '2026-02-04'
  }
]

const defaultNewsletterFolders = [
  {
    id: 'feb-2026',
    name: 'February 2026',
    description: 'Annual meeting recap, reserve study highlights, and vendor updates.',
    documents: [
      'February 2026 Community Newsletter.pdf',
      'Reserve Study Summary - Feb 2026.pdf',
      'Vendor Timeline Snapshot.xlsx'
    ]
  },
  {
    id: 'jan-2026',
    name: 'January 2026',
    description: 'Budget kickoff, committee rosters, and community events calendar.',
    documents: [
      'January 2026 Community Newsletter.pdf',
      'Committee Directory - Jan 2026.pdf',
      'Events Calendar - Q1 2026.pdf'
    ]
  },
  {
    id: 'dec-2025',
    name: 'December 2025',
    description: 'Year-end wrap-up and holiday community highlights.',
    documents: ['December 2025 Newsletter.pdf', 'Year-End Financial Snapshot.pdf']
  }
]

const defaultRecentDocuments = [
  {
    id: 'doc-1',
    name: 'Board Summary - February 2026.pdf',
    meta: 'Uploaded Feb 12, 2026 · 1.8 MB'
  },
  {
    id: 'doc-2',
    name: 'Maintenance Plan Overview.docx',
    meta: 'Uploaded Feb 9, 2026 · 830 KB'
  },
  {
    id: 'doc-3',
    name: 'Committee Action Items.xlsx',
    meta: 'Uploaded Feb 3, 2026 · 410 KB'
  }
]

const cloneDeep = (value) => JSON.parse(JSON.stringify(value))

function createCommunityData() {
  return {
    committees: cloneDeep(createInitialCommittees()),
    meetings: cloneDeep(createInitialMeetings()),
    motions: cloneDeep(createInitialMotions()),
    users: cloneDeep(createInitialUsers()),
    roles: cloneDeep(createInitialRoles()),
    metadata: cloneDeep(createInitialMetadata()),
    events: cloneDeep(defaultEvents),
    newsletterFolders: cloneDeep(defaultNewsletterFolders),
    recentDocuments: cloneDeep(defaultRecentDocuments)
  }
}

const state = reactive({
  isSaasAdmin: false,
  activeCommunityId: communitySeeds[0]?.id || '',
  activeRoles: [],
  currentUserId: '',
  communities: [...communitySeeds],
  communityData: communitySeeds.reduce((accumulator, community) => {
    accumulator[community.id] = createCommunityData()
    return accumulator
  }, {})
})

state.currentUserId =
  state.communityData[state.activeCommunityId]?.users?.[0]?.id || ''

const activeCommunity = computed(() =>
  state.communities.find((community) => community.id === state.activeCommunityId) || state.communities[0] || null
)

const currentCommunityData = computed(() => state.communityData[state.activeCommunityId])

const currentUser = computed(() => {
  const users = currentCommunityData.value?.users || []
  if (state.currentUserId) {
    return users.find((user) => user.id === state.currentUserId) || users[0] || null
  }
  return users[0] || null
})

const currentUserCommitteeIds = computed(() => {
  const committees = currentCommunityData.value?.committees || []
  const userId = currentUser.value?.id
  if (!userId) {
    return []
  }
  return committees
    .filter((committee) => Array.isArray(committee.memberIds) && committee.memberIds.includes(userId))
    .map((committee) => committee.id)
})

const isBoard = computed(() => state.activeRoles.includes('Board'))
const isMember = computed(() => state.activeRoles.includes('Member'))

const isCommunityAdmin = computed(() => !state.isSaasAdmin && state.activeRoles.length === 0)

const viewModeLabel = computed(() => {
  if (state.isSaasAdmin) {
    return 'SaaS Super Admin'
  }
  if (isCommunityAdmin.value) {
    return 'Community Admin'
  }
  if (isBoard.value && isMember.value) {
    return 'Board + Member'
  }
  if (isBoard.value) {
    return 'Board Member'
  }
  if (isMember.value) {
    return 'Member'
  }
  return 'Community Admin'
})

function resetRoleSimulation() {
  state.activeRoles = []
}

function toggleRole(role) {
  if (!role || state.isSaasAdmin) {
    return
  }

  if (state.activeRoles.includes(role)) {
    state.activeRoles = state.activeRoles.filter((item) => item !== role)
  } else {
    state.activeRoles = [...state.activeRoles, role]
  }
}

function setActiveCommunity(nextCommunityId) {
  if (!nextCommunityId || nextCommunityId === state.activeCommunityId) {
    return
  }

  state.activeCommunityId = nextCommunityId
  resetRoleSimulation()
  state.currentUserId = state.communityData[nextCommunityId]?.users?.[0]?.id || ''
}

function setSaasAdmin(nextValue) {
  state.isSaasAdmin = Boolean(nextValue)
  resetRoleSimulation()
}

function updateCommunityById(communityId, updater) {
  state.communities = state.communities.map((community) =>
    community.id === communityId ? updater(community) : community
  )
}

function addCommunity(payload) {
  const normalizedId =
    payload.alias ||
    payload.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const baseId = normalizedId || `community-${Date.now()}`
  const existingIds = new Set(state.communities.map((community) => community.id))
  let communityId = baseId
  if (existingIds.has(communityId)) {
    communityId = `${baseId}-${Date.now()}`
  }

  const newCommunity = {
    id: communityId,
    name: payload.name,
    alias: payload.alias || communityId,
    status: payload.status || 'active',
    createdAt: payload.createdAt || new Date().toISOString().slice(0, 10),
    adminName: payload.adminName || 'Unassigned',
    environment: payload.environment || 'Production'
  }

  state.communities = [newCommunity, ...state.communities]
  state.communityData[communityId] = createCommunityData()
}

function removeCommunity(communityId) {
  state.communities = state.communities.filter((community) => community.id !== communityId)
  if (state.communityData[communityId]) {
    delete state.communityData[communityId]
  }

  if (state.activeCommunityId === communityId) {
    state.activeCommunityId = state.communities[0]?.id || ''
  }
}

function switchToCommunity(communityId) {
  setSaasAdmin(false)
  setActiveCommunity(communityId)
}

export function useTenantStore() {
  return {
    state,
    activeCommunity,
    currentCommunityData,
    currentUser,
    currentUserCommitteeIds,
    isBoard,
    isMember,
    isCommunityAdmin,
    viewModeLabel,
    toggleRole,
    setActiveCommunity,
    setSaasAdmin,
    resetRoleSimulation,
    updateCommunityById,
    addCommunity,
    removeCommunity,
    switchToCommunity
  }
}
