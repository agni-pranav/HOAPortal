export const committeeFrequencyOptions = ['Monthly', 'Quarterly', 'Annual', 'Custom']

const VISIBILITY_VALUES = ['public', 'board']
const DEFAULT_UPDATED_AT = '2026-02-12'

const seededCommittees = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Reviews budgets, reserve allocations, and major expenditure requests.',
    frequency: 'Monthly',
    visibility: 'board',
    memberIds: [
      'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4',
      'f2e73d53-39f3-4946-8ce0-1a4a7a18caec'
    ],
    updatedAt: '2026-02-12'
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Coordinates neighborhood events and annual community programs.',
    frequency: 'Quarterly',
    visibility: 'public',
    memberIds: [
      'f2e73d53-39f3-4946-8ce0-1a4a7a18caec',
      '4f8915e7-06b8-43b4-978a-1ebadf8336dd'
    ],
    updatedAt: '2026-02-10'
  },
  {
    id: 'architecture-review',
    name: 'Architecture Review',
    description: 'Evaluates exterior modification requests and design compliance.',
    frequency: 'Monthly',
    visibility: 'board',
    memberIds: [
      'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4',
      '7b847e0e-4ed4-4cb1-bb0f-72c81b3226c0'
    ],
    updatedAt: '2026-02-11'
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Tracks covenant compliance cases and policy enforcement status.',
    frequency: 'Annual',
    visibility: 'board',
    memberIds: ['5bb0f5f3-0898-47f9-94dd-5c4d37f2bbcb'],
    updatedAt: '2026-02-09'
  }
]

export function normalizeCommittee(inputCommittee = {}) {
  const normalizedFrequency = committeeFrequencyOptions.includes(inputCommittee.frequency)
    ? inputCommittee.frequency
    : committeeFrequencyOptions[0]

  const normalizedVisibility = VISIBILITY_VALUES.includes(inputCommittee.visibility)
    ? inputCommittee.visibility
    : 'board'

  const normalizedMemberIds = Array.isArray(inputCommittee.memberIds)
    ? [...new Set(inputCommittee.memberIds.filter((memberId) => typeof memberId === 'string' && memberId))]
    : []

  return {
    id: typeof inputCommittee.id === 'string' ? inputCommittee.id : '',
    name: typeof inputCommittee.name === 'string' ? inputCommittee.name.trim() : '',
    description: typeof inputCommittee.description === 'string' ? inputCommittee.description.trim() : '',
    frequency: normalizedFrequency,
    visibility: normalizedVisibility,
    memberIds: normalizedMemberIds,
    updatedAt:
      typeof inputCommittee.updatedAt === 'string' && inputCommittee.updatedAt
        ? inputCommittee.updatedAt
        : DEFAULT_UPDATED_AT
  }
}

export function createInitialCommittees() {
  return seededCommittees.map((committee) => normalizeCommittee(committee))
}

export const committees = seededCommittees.map((committee) => ({
  id: committee.id,
  name: committee.name
}))
