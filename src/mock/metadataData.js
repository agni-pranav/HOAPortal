const DEFAULT_CHANGED_BY = 'Community Admin'
const DEFAULT_DATE = '2026-02-12'

const committeeSeed = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Oversees budgeting, reserves, and major financial approvals.',
    active: true,
    createdAt: '2026-02-01',
    updatedAt: '2026-02-12'
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Plans community events, outreach, and volunteer programs.',
    active: true,
    createdAt: '2026-01-22',
    updatedAt: '2026-02-08'
  },
  {
    id: 'architecture-review',
    name: 'Architecture Review',
    description: 'Reviews exterior modification requests and design standards.',
    active: true,
    createdAt: '2026-01-25',
    updatedAt: '2026-02-05'
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Tracks covenant enforcement and compliance case oversight.',
    active: true,
    createdAt: '2026-01-28',
    updatedAt: '2026-02-06'
  }
]

const meetingTypeSeed = [
  {
    id: 'meeting-board',
    name: 'Board Meeting',
    description: 'Formal board governance sessions.',
    category: 'board',
    allowedModes: ['onsite', 'virtual', 'hybrid'],
    defaultMode: 'onsite',
    enableVoting: true,
    enableMotions: true,
    active: true,
    createdAt: '2026-01-10',
    updatedAt: '2026-02-10'
  },
  {
    id: 'meeting-committee',
    name: 'Committee Meeting',
    description: 'Committee working sessions and reporting.',
    category: 'committee',
    allowedModes: ['virtual', 'onsite'],
    defaultMode: 'virtual',
    enableVoting: false,
    enableMotions: false,
    active: true,
    createdAt: '2026-01-12',
    updatedAt: '2026-02-08'
  }
]

const eventTypeSeed = [
  {
    id: 'event-community',
    name: 'Community Event',
    color: 'Teal',
    description: 'General HOA community events.',
    active: true,
    createdAt: '2026-01-18',
    updatedAt: '2026-02-01'
  },
  {
    id: 'event-board',
    name: 'Board Session',
    color: 'Indigo',
    description: 'Board-only sessions and briefings.',
    active: true,
    createdAt: '2026-01-20',
    updatedAt: '2026-02-03'
  }
]

const boardTitleSeed = [
  {
    id: 'title-president',
    name: 'President',
    baseRole: 'Board',
    createdAt: '2026-01-05',
    updatedAt: '2026-02-02'
  },
  {
    id: 'title-vice-president',
    name: 'Vice President',
    baseRole: 'Board',
    createdAt: '2026-01-05',
    updatedAt: '2026-02-02'
  },
  {
    id: 'title-treasurer',
    name: 'Treasurer',
    baseRole: 'Board',
    createdAt: '2026-01-05',
    updatedAt: '2026-02-02'
  },
  {
    id: 'title-secretary',
    name: 'Secretary',
    baseRole: 'Board',
    createdAt: '2026-01-05',
    updatedAt: '2026-02-02'
  },
  {
    id: 'title-member-at-large',
    name: 'Member-at-Large',
    baseRole: 'Board',
    createdAt: '2026-01-05',
    updatedAt: '2026-02-02'
  }
]

const dashboardWidgetSeed = [
  { id: 'widget-upcoming-meetings', name: 'Upcoming Meetings', enabled: true },
  { id: 'widget-events', name: 'Events', enabled: true },
  { id: 'widget-dues', name: 'Dues', enabled: true },
  { id: 'widget-special-assessments', name: 'Special Assessments', enabled: false },
  { id: 'widget-newsletters', name: 'Newsletters', enabled: true }
]

const auditLogSeed = [
  {
    id: 'audit-1',
    metadataType: 'Committee',
    itemName: 'Finance Committee',
    changeType: 'Created',
    changedBy: DEFAULT_CHANGED_BY,
    date: '2026-02-01'
  },
  {
    id: 'audit-2',
    metadataType: 'Meeting Type',
    itemName: 'Board Meeting',
    changeType: 'Edited',
    changedBy: DEFAULT_CHANGED_BY,
    date: '2026-02-10'
  }
]

export function createInitialMetadata() {
  return {
    committees: committeeSeed.map((committee) => ({ ...committee })),
    meetingTypes: meetingTypeSeed.map((type) => ({ ...type })),
    eventTypes: eventTypeSeed.map((type) => ({ ...type })),
    boardTitles: boardTitleSeed.map((title) => ({ ...title })),
    dashboardConfig: {
      widgets: dashboardWidgetSeed.map((widget) => ({ ...widget })),
      newsletterCount: 3
    },
    auditLog: auditLogSeed.map((entry) => ({ ...entry }))
  }
}
