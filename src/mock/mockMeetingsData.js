export const meetingTypeOptions = ['board', 'committee']
export const meetingVisibilityOptions = ['public', 'board']
export const attendeeStatusOptions = ['present', 'absent']
export const voteValueOptions = ['yes', 'no', 'abstain']
export const meetingModeOptions = ['onsite', 'virtual', 'hybrid']

const DEFAULT_SCHEDULED_AT = '2026-02-25T18:00:00.000Z'
const DEFAULT_CREATED_AT = '2026-02-01T16:00:00.000Z'
const DEFAULT_UPDATED_AT = '2026-02-12T16:00:00.000Z'

const seededMeetings = [
  {
    id: 'b0d269ee-17cb-4789-b50d-804f81389ac4',
    title: 'February Board Governance Session',
    type: 'board',
    meetingTypeId: 'meeting-board',
    committeeId: null,
    scheduledAt: '2026-02-20T23:00:00.000Z',
    location: 'Clubhouse Board Room',
    mode: 'onsite',
    isVirtual: false,
    visibility: 'board',
    attendees: [
      { userId: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4', status: 'present' },
      { userId: 'f2e73d53-39f3-4946-8ce0-1a4a7a18caec', status: 'present' },
      { userId: '7b847e0e-4ed4-4cb1-bb0f-72c81b3226c0', status: 'absent' },
      { userId: '4f8915e7-06b8-43b4-978a-1ebadf8336dd', status: 'present' }
    ],
    minutes:
      'Reviewed annual reserve policy and approved timeline for vendor evaluation package.',
    decisions: [
      {
        id: 'decision-board-budget',
        text: 'Approve Q2 reserve transfer of $25,000.',
        votes: [
          { userId: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4', value: 'yes' },
          { userId: 'f2e73d53-39f3-4946-8ce0-1a4a7a18caec', value: 'yes' },
          { userId: '7b847e0e-4ed4-4cb1-bb0f-72c81b3226c0', value: 'abstain' },
          { userId: '4f8915e7-06b8-43b4-978a-1ebadf8336dd', value: 'yes' }
        ]
      }
    ],
    createdAt: '2026-01-31T19:00:00.000Z',
    updatedAt: '2026-02-11T21:30:00.000Z'
  },
  {
    id: 'a4af250c-ea7e-4c26-9988-7802a7c88044',
    title: 'Finance Committee Forecast Review',
    type: 'committee',
    meetingTypeId: 'meeting-committee',
    committeeId: 'finance',
    scheduledAt: '2026-03-05T00:30:00.000Z',
    location: 'Virtual (Zoom)',
    mode: 'virtual',
    isVirtual: true,
    visibility: 'board',
    attendees: [
      { userId: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4', status: 'present' },
      { userId: 'f2e73d53-39f3-4946-8ce0-1a4a7a18caec', status: 'present' },
      { userId: '5bb0f5f3-0898-47f9-94dd-5c4d37f2bbcb', status: 'absent' }
    ],
    minutes: 'Outlined reserve assumptions and reviewed delinquency trend for Q1.',
    decisions: [
      {
        id: 'decision-finance-dues',
        text: 'Recommend a 3% annual dues adjustment for FY2026.',
        votes: [
          { userId: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4', value: 'yes' },
          { userId: 'f2e73d53-39f3-4946-8ce0-1a4a7a18caec', value: 'yes' },
          { userId: '5bb0f5f3-0898-47f9-94dd-5c4d37f2bbcb', value: 'abstain' }
        ]
      }
    ],
    createdAt: '2026-02-02T17:15:00.000Z',
    updatedAt: '2026-02-12T15:00:00.000Z'
  },
  {
    id: '40f178a0-9b2b-46c7-96a0-b95b84b5a9de',
    title: 'Events Committee Spring Kickoff',
    type: 'committee',
    meetingTypeId: 'meeting-committee',
    committeeId: 'events',
    scheduledAt: '2026-03-10T23:30:00.000Z',
    location: 'Community Clubhouse',
    mode: 'onsite',
    isVirtual: false,
    visibility: 'public',
    attendees: [
      { userId: 'f2e73d53-39f3-4946-8ce0-1a4a7a18caec', status: 'present' },
      { userId: '4f8915e7-06b8-43b4-978a-1ebadf8336dd', status: 'present' },
      { userId: '5bb0f5f3-0898-47f9-94dd-5c4d37f2bbcb', status: 'present' }
    ],
    minutes: 'Defined event calendar owners and volunteer recruitment targets.',
    decisions: [],
    createdAt: '2026-02-05T13:40:00.000Z',
    updatedAt: '2026-02-09T10:25:00.000Z'
  },
  {
    id: '6bc3f56f-00f2-4bbb-a56f-cd763a57d1d7',
    title: 'Compliance Review and Policy Escalations',
    type: 'committee',
    meetingTypeId: 'meeting-committee',
    committeeId: 'compliance',
    scheduledAt: '2026-03-14T15:00:00.000Z',
    location: 'Operations Office',
    mode: 'onsite',
    isVirtual: false,
    visibility: 'board',
    attendees: [
      { userId: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4', status: 'present' },
      { userId: '7b847e0e-4ed4-4cb1-bb0f-72c81b3226c0', status: 'absent' },
      { userId: '5bb0f5f3-0898-47f9-94dd-5c4d37f2bbcb', status: 'present' }
    ],
    minutes: 'Reviewed outstanding notices and aligned next-step enforcement process.',
    decisions: [
      {
        id: 'decision-compliance-notice',
        text: 'Issue second notice for unresolved landscape variance.',
        votes: [
          { userId: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4', value: 'yes' },
          { userId: '7b847e0e-4ed4-4cb1-bb0f-72c81b3226c0', value: 'no' },
          { userId: '5bb0f5f3-0898-47f9-94dd-5c4d37f2bbcb', value: 'yes' }
        ]
      }
    ],
    createdAt: '2026-02-06T14:10:00.000Z',
    updatedAt: '2026-02-10T12:40:00.000Z'
  }
]

function normalizeDateTime(inputValue, fallbackValue) {
  if (typeof inputValue !== 'string' || !inputValue) {
    return fallbackValue
  }

  const parsed = new Date(inputValue)
  return Number.isNaN(parsed.getTime()) ? fallbackValue : parsed.toISOString()
}

function normalizeAttendees(inputAttendees = []) {
  if (!Array.isArray(inputAttendees)) {
    return []
  }

  const attendeesByUserId = new Map()

  inputAttendees.forEach((attendee) => {
    const userId = typeof attendee?.userId === 'string' ? attendee.userId : ''
    if (!userId) {
      return
    }

    const status = attendeeStatusOptions.includes(attendee?.status) ? attendee.status : 'absent'
    attendeesByUserId.set(userId, { userId, status })
  })

  return [...attendeesByUserId.values()]
}

function normalizeVotes(inputVotes = []) {
  if (!Array.isArray(inputVotes)) {
    return []
  }

  const votesByUserId = new Map()

  inputVotes.forEach((vote) => {
    const userId = typeof vote?.userId === 'string' ? vote.userId : ''
    if (!userId) {
      return
    }

    const value = voteValueOptions.includes(vote?.value) ? vote.value : 'abstain'
    votesByUserId.set(userId, { userId, value })
  })

  return [...votesByUserId.values()]
}

function normalizeDecisions(inputDecisions = []) {
  if (!Array.isArray(inputDecisions)) {
    return []
  }

  return inputDecisions
    .map((decision, index) => ({
      id:
        typeof decision?.id === 'string' && decision.id
          ? decision.id
          : `decision-${Date.now()}-${index}`,
      text: typeof decision?.text === 'string' ? decision.text.trim() : '',
      votes: normalizeVotes(decision?.votes)
    }))
    .filter((decision) => decision.text || decision.votes.length > 0)
}

export function normalizeMeeting(inputMeeting = {}) {
  const normalizedType = meetingTypeOptions.includes(inputMeeting.type) ? inputMeeting.type : 'board'
  const normalizedVisibility = meetingVisibilityOptions.includes(inputMeeting.visibility)
    ? inputMeeting.visibility
    : 'board'
  const normalizedMode = meetingModeOptions.includes(inputMeeting.mode)
    ? inputMeeting.mode
    : inputMeeting.isVirtual
      ? 'virtual'
      : 'onsite'
  const normalizedMeetingTypeId =
    typeof inputMeeting.meetingTypeId === 'string' && inputMeeting.meetingTypeId
      ? inputMeeting.meetingTypeId
      : normalizedType === 'committee'
        ? 'meeting-committee'
        : 'meeting-board'

  const normalizedCommitteeId =
    normalizedType === 'committee' && typeof inputMeeting.committeeId === 'string' && inputMeeting.committeeId
      ? inputMeeting.committeeId
      : null

  return {
    id: typeof inputMeeting.id === 'string' ? inputMeeting.id : '',
    title: typeof inputMeeting.title === 'string' ? inputMeeting.title.trim() : '',
    type: normalizedType,
    meetingTypeId: normalizedMeetingTypeId,
    committeeId: normalizedCommitteeId,
    scheduledAt: normalizeDateTime(inputMeeting.scheduledAt, DEFAULT_SCHEDULED_AT),
    location: typeof inputMeeting.location === 'string' ? inputMeeting.location.trim() : '',
    mode: normalizedMode,
    isVirtual: normalizedMode !== 'onsite',
    visibility: normalizedVisibility,
    attendees: normalizeAttendees(inputMeeting.attendees),
    minutes: typeof inputMeeting.minutes === 'string' ? inputMeeting.minutes.trim() : '',
    decisions: normalizeDecisions(inputMeeting.decisions),
    createdAt: normalizeDateTime(inputMeeting.createdAt, DEFAULT_CREATED_AT),
    updatedAt: normalizeDateTime(inputMeeting.updatedAt, DEFAULT_UPDATED_AT)
  }
}

export function createInitialMeetings() {
  return seededMeetings.map((meeting) => normalizeMeeting(meeting))
}
