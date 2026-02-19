export const motionStatusOptions = ['open', 'passed', 'failed']
export const motionVoteOptions = ['yes', 'no', 'abstain']

const DEFAULT_UPDATED_AT = '2026-02-12'

function getVoteCounts(votes) {
  return (Array.isArray(votes) ? votes : []).reduce(
    (accumulator, vote) => {
      if (vote?.vote === 'yes' || vote?.vote === 'no' || vote?.vote === 'abstain') {
        accumulator[vote.vote] += 1
      }
      return accumulator
    },
    { yes: 0, no: 0, abstain: 0 }
  )
}

function resolveOutcomeFromCounts(counts) {
  if (!counts) {
    return 'pending'
  }
  if ((counts.yes || 0) > (counts.no || 0)) {
    return 'passed'
  }
  if ((counts.yes || 0) === 0 && (counts.no || 0) === 0 && (counts.abstain || 0) === 0) {
    return 'pending'
  }
  return 'failed'
}

function normalizeVotes(inputVotes = []) {
  if (!Array.isArray(inputVotes)) {
    return []
  }

  const votesByMember = new Map()

  inputVotes.forEach((vote) => {
    const memberId = typeof vote?.memberId === 'string' ? vote.memberId : ''
    if (!memberId) {
      return
    }

    const value = motionVoteOptions.includes(vote?.vote) ? vote.vote : 'abstain'
    votesByMember.set(memberId, { memberId, vote: value })
  })

  return [...votesByMember.values()]
}

export function normalizeMotion(inputMotion = {}) {
  const votes = normalizeVotes(inputMotion.votes)
  const voteCounts = getVoteCounts(votes)
  const derivedOutcome = resolveOutcomeFromCounts(voteCounts)
  const status = motionStatusOptions.includes(inputMotion.status) ? inputMotion.status : 'open'

  return {
    id: typeof inputMotion.id === 'string' ? inputMotion.id : '',
    meetingId: typeof inputMotion.meetingId === 'string' ? inputMotion.meetingId : '',
    title: typeof inputMotion.title === 'string' ? inputMotion.title.trim() : '',
    description: typeof inputMotion.description === 'string' ? inputMotion.description.trim() : '',
    createdBy: typeof inputMotion.createdBy === 'string' ? inputMotion.createdBy : 'Community Admin',
    status,
    votes,
    resultSummary: {
      yes: voteCounts.yes,
      no: voteCounts.no,
      abstain: voteCounts.abstain,
      outcome: status === 'open' ? 'pending' : derivedOutcome
    },
    updatedAt:
      typeof inputMotion.updatedAt === 'string' && inputMotion.updatedAt
        ? inputMotion.updatedAt
        : DEFAULT_UPDATED_AT
  }
}

const seededMotions = [
  {
    id: 'motion-1',
    meetingId: 'b0d269ee-17cb-4789-b50d-804f81389ac4',
    title: 'Approve Q2 reserve transfer',
    description: 'Authorize the $25,000 reserve transfer for Q2 vendor planning.',
    createdBy: 'Alicia Monroe',
    status: 'passed',
    votes: [
      { memberId: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4', vote: 'yes' },
      { memberId: 'f2e73d53-39f3-4946-8ce0-1a4a7a18caec', vote: 'yes' },
      { memberId: '7b847e0e-4ed4-4cb1-bb0f-72c81b3226c0', vote: 'abstain' },
      { memberId: '4f8915e7-06b8-43b4-978a-1ebadf8336dd', vote: 'yes' }
    ],
    updatedAt: '2026-02-11'
  },
  {
    id: 'motion-2',
    meetingId: 'a4af250c-ea7e-4c26-9988-7802a7c88044',
    title: 'Recommend FY2026 dues adjustment',
    description: 'Recommend a 3% annual dues adjustment for FY2026.',
    createdBy: 'Finance Committee',
    status: 'open',
    votes: [
      { memberId: 'a7dc26d7-8f7d-4f4a-a316-7c53e7c7e5d4', vote: 'yes' },
      { memberId: 'f2e73d53-39f3-4946-8ce0-1a4a7a18caec', vote: 'yes' },
      { memberId: '5bb0f5f3-0898-47f9-94dd-5c4d37f2bbcb', vote: 'abstain' }
    ],
    updatedAt: '2026-02-12'
  }
]

export function createInitialMotions() {
  return seededMotions.map((motion) => normalizeMotion(motion))
}
