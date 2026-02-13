<script setup>
import { computed } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import { createInitialCommittees } from '../mock/committeesData'
import { createInitialMeetings } from '../mock/mockMeetingsData'

const committees = createInitialCommittees()
const meetings = createInitialMeetings()

const quickGovernanceActions = [
  {
    id: 'schedule-meeting',
    label: 'Schedule Meeting',
    hint: 'Plan a board or committee session'
  },
  {
    id: 'upload-newsletter',
    label: 'Upload Newsletter',
    hint: 'Publish a community governance update'
  },
  {
    id: 'create-committee',
    label: 'Create Committee',
    hint: 'Create a new committee structure'
  }
]

const temporaryDocuments = [
  {
    id: 'doc-budget-2026',
    title: 'Q1 Budget Review Packet',
    committee: 'Finance',
    date: '2026-02-11',
    visibility: 'board'
  },
  {
    id: 'doc-events-calendar',
    title: 'Spring Event Calendar',
    committee: 'Events',
    date: '2026-02-08',
    visibility: 'public'
  },
  {
    id: 'doc-design-requests',
    title: 'Architecture Request Guidelines',
    committee: 'Architecture Review',
    date: '2026-02-06',
    visibility: 'board'
  },
  {
    id: 'doc-policy-update',
    title: 'Compliance Policy Bulletin',
    committee: 'Compliance',
    date: '2026-02-03',
    visibility: 'board'
  }
]

const committeeNameById = committees.reduce((accumulator, committee) => {
  accumulator[committee.id] = committee.name
  return accumulator
}, {})

const upcomingMeetings = computed(() => {
  const now = new Date()

  return meetings
    .filter((meeting) => {
      const scheduledDate = parseDate(meeting.scheduledAt)
      return scheduledDate && scheduledDate >= now
    })
    .sort((firstMeeting, secondMeeting) => new Date(firstMeeting.scheduledAt) - new Date(secondMeeting.scheduledAt))
    .slice(0, 5)
    .map((meeting) => ({
      ...meeting,
      dateLabel: formatDateTime(meeting.scheduledAt),
      committeeLabel: resolveCommitteeLabel(meeting)
    }))
})

const upcomingMeetingsCountIn30Days = computed(() => {
  const now = new Date()
  const inThirtyDays = new Date(now)
  inThirtyDays.setDate(now.getDate() + 30)

  return meetings.filter((meeting) => {
    const scheduledDate = parseDate(meeting.scheduledAt)
    return scheduledDate && scheduledDate >= now && scheduledDate <= inThirtyDays
  }).length
})

const recentDecisions = computed(() =>
  meetings
    .flatMap((meeting) =>
      (meeting.decisions || []).map((decision) => {
        const voteCounts = (decision.votes || []).reduce(
          (accumulator, vote) => {
            if (vote.value === 'yes' || vote.value === 'no' || vote.value === 'abstain') {
              accumulator[vote.value] += 1
            }
            return accumulator
          },
          { yes: 0, no: 0, abstain: 0 }
        )

        return {
          id: `${meeting.id}-${decision.id}`,
          text: decision.text,
          meetingTitle: meeting.title,
          scheduledAt: meeting.scheduledAt,
          voteCounts
        }
      })
    )
    .sort((firstDecision, secondDecision) => new Date(secondDecision.scheduledAt) - new Date(firstDecision.scheduledAt))
    .slice(0, 5)
)

const openDecisionsCount = computed(() =>
  meetings.reduce((accumulator, meeting) => accumulator + (meeting.decisions?.length || 0), 0)
)

const boardOnlyDocumentsCount = computed(() =>
  temporaryDocuments.filter((document) => document.visibility === 'board').length
)

const recentDocuments = computed(() =>
  [...temporaryDocuments]
    .sort((firstDocument, secondDocument) => new Date(secondDocument.date) - new Date(firstDocument.date))
    .map((document) => ({
      ...document,
      dateLabel: formatDate(document.date)
    }))
)

const governanceSummaryItems = computed(() => [
  {
    label: 'Total Committees',
    value: committees.length,
    hint: 'Active governance groups'
  },
  {
    label: 'Upcoming Meetings',
    value: upcomingMeetingsCountIn30Days.value,
    hint: 'Scheduled in the next 30 days'
  },
  {
    label: 'Open Decisions',
    value: openDecisionsCount.value,
    hint: 'Decision items under oversight'
  },
  {
    label: 'Board-only Documents',
    value: boardOnlyDocumentsCount.value,
    hint: 'Restricted governance records'
  }
])

function parseDate(dateInput) {
  const parsedDate = new Date(dateInput)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function formatDateTime(dateInput) {
  const parsedDate = parseDate(dateInput)
  if (!parsedDate) {
    return 'Date pending'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(parsedDate)
}

function formatDate(dateInput) {
  const parsedDate = parseDate(dateInput)
  if (!parsedDate) {
    return 'Date pending'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(parsedDate)
}

function resolveCommitteeLabel(meeting) {
  if (meeting.type === 'board') {
    return 'Board-wide'
  }

  if (!meeting.committeeId) {
    return 'Unassigned Committee'
  }

  return committeeNameById[meeting.committeeId] || 'Committee'
}

function resolveMeetingTypeLabel(type) {
  return type === 'board' ? 'Board' : 'Committee'
}

function resolveMeetingTypeVariant(type) {
  return type === 'board' ? 'warning' : 'info'
}

function resolveVisibilityLabel(visibility) {
  return visibility === 'public' ? 'Public' : 'Board-only'
}

function resolveVisibilityVariant(visibility) {
  return visibility === 'public' ? 'success' : 'warning'
}
</script>

<template>
  <section class="dashboard-view">
    <header class="dashboard-hero">
      <h1>Governance Overview</h1>
      <p>Board &amp; Committee Activity across meetings, decisions, and records.</p>
    </header>

    <BaseCard class="summary-card">
      <header class="section-header">
        <h2>Governance Summary</h2>
        <p>Core governance indicators for the current operating cycle.</p>
      </header>

      <div class="summary-grid">
        <article v-for="item in governanceSummaryItems" :key="item.label" class="summary-item">
          <p class="summary-item__label">{{ item.label }}</p>
          <p class="summary-item__value">{{ item.value }}</p>
          <p class="summary-item__hint">{{ item.hint }}</p>
        </article>
      </div>
    </BaseCard>

    <section class="dashboard-main-grid">
      <BaseCard class="panel-card">
        <header class="section-header">
          <h2>Upcoming Meetings</h2>
          <p>Next 5 scheduled sessions with governance visibility.</p>
        </header>

        <ul class="panel-list panel-list--meetings">
          <li v-for="meeting in upcomingMeetings" :key="meeting.id" class="panel-list__item">
            <div class="panel-list__content">
              <p class="panel-list__title">{{ meeting.title }}</p>
              <p class="panel-list__meta">{{ meeting.dateLabel }} • {{ meeting.committeeLabel }}</p>
            </div>

            <div class="panel-list__badges">
              <BaseBadge size="sm" :variant="resolveMeetingTypeVariant(meeting.type)">
                {{ resolveMeetingTypeLabel(meeting.type) }}
              </BaseBadge>
              <BaseBadge size="sm" :variant="resolveVisibilityVariant(meeting.visibility)">
                {{ resolveVisibilityLabel(meeting.visibility) }}
              </BaseBadge>
            </div>
          </li>

          <li v-if="upcomingMeetings.length === 0" class="panel-list__empty">
            No upcoming meetings are scheduled.
          </li>
        </ul>
      </BaseCard>

      <BaseCard class="panel-card">
        <header class="section-header">
          <h2>Decision Oversight</h2>
          <p>Recent decisions with recorded vote totals.</p>
        </header>

        <ul class="panel-list panel-list--decisions">
          <li v-for="decision in recentDecisions" :key="decision.id" class="panel-list__item panel-list__item--stacked">
            <div class="decision-item">
              <p class="panel-list__title">{{ decision.text }}</p>
              <p class="panel-list__meta">{{ decision.meetingTitle }}</p>

              <div class="decision-votes">
                <BaseBadge size="sm" variant="success">Yes {{ decision.voteCounts.yes }}</BaseBadge>
                <BaseBadge size="sm" variant="danger">No {{ decision.voteCounts.no }}</BaseBadge>
                <BaseBadge size="sm" variant="neutral">Abstain {{ decision.voteCounts.abstain }}</BaseBadge>
              </div>
            </div>
          </li>

          <li v-if="recentDecisions.length === 0" class="panel-list__empty">
            No decisions have been recorded yet.
          </li>
        </ul>
      </BaseCard>

      <BaseCard class="panel-card panel-card--full">
        <header class="section-header">
          <h2>Document Transparency</h2>
          <p>Recent governance records and committee visibility scope.</p>
        </header>

        <ul class="panel-list panel-list--documents">
          <li v-for="document in recentDocuments" :key="document.id" class="panel-list__item">
            <div class="panel-list__content">
              <p class="panel-list__title">{{ document.title }}</p>
              <p class="panel-list__meta">{{ document.committee }} • {{ document.dateLabel }}</p>
            </div>

            <BaseBadge size="sm" :variant="resolveVisibilityVariant(document.visibility)">
              {{ resolveVisibilityLabel(document.visibility) }}
            </BaseBadge>
          </li>
        </ul>
      </BaseCard>
    </section>

    <BaseCard class="quick-actions-card">
      <header class="section-header">
        <h2>Quick Governance Actions</h2>
        <p>Common next steps for board and committee operations.</p>
      </header>

      <div class="quick-actions-grid">
        <BaseButton
          v-for="action in quickGovernanceActions"
          :key="action.id"
          variant="secondary"
          size="lg"
          block
          class="quick-action-button"
        >
          <span>{{ action.label }}</span>
          <small>{{ action.hint }}</small>
        </BaseButton>
      </div>
    </BaseCard>
  </section>
</template>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.dashboard-hero {
  border-bottom: 1px solid var(--color-border-default);
  padding-bottom: var(--space-md);
  margin-bottom: var(--space-xl);
}

.dashboard-hero h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.45rem;
  font-weight: 680;
}

.dashboard-hero p {
  margin: var(--space-sm) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  font-weight: 500;
}

.section-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.05rem;
  font-weight: 600;
}

.section-header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  line-height: 1.45;
}

.summary-card .section-header {
  margin-bottom: var(--space-md);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-md);
}

.summary-item {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  background: var(--color-bg-panel);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.summary-item:hover {
  background: var(--color-bg-hover-soft);
  border-color: var(--color-border-strong);
}

.summary-item__label {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.76rem;
  font-weight: 600;
}

.summary-item__value {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 2.05rem;
  font-weight: 700;
  line-height: 1;
}

.summary-item__hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.74rem;
  line-height: 1.4;
}

.dashboard-main-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-xl);
}

.panel-card {
  min-height: calc(var(--space-2xl) * 2.5);
}

.panel-card .section-header {
  margin-bottom: var(--space-md);
}

.panel-card--full {
  grid-column: 1 / -1;
}

.panel-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.panel-list__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-default);
}

.panel-list__item:last-child {
  border-bottom: none;
}

.panel-list__item--stacked {
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  border-bottom: none;
}

.panel-list__content {
  min-width: 0;
}

.panel-list__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.4;
}

.panel-list__meta {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.76rem;
  line-height: 1.4;
}

.panel-list__badges {
  display: inline-flex;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: calc(var(--space-xs) * 1.2);
  align-self: flex-start;
  white-space: nowrap;
}

.panel-list--meetings .panel-list__item {
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
}

.panel-list--meetings .panel-list__item:hover {
  background: var(--color-bg-hover-soft);
}

.panel-list--documents .panel-list__item {
  gap: var(--space-lg);
}

.panel-list--decisions {
  gap: var(--space-sm);
}

.decision-item {
  width: 100%;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.panel-list--decisions .panel-list__item:last-child .decision-item {
  margin-bottom: 0;
}

.decision-votes {
  margin-top: var(--space-sm);
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: nowrap;
}

.panel-list__empty {
  margin: 0;
  padding: var(--space-md) 0;
  color: var(--color-text-secondary);
  font-size: 0.84rem;
}

.quick-actions-card {
  padding-top: var(--space-xl);
  padding-bottom: var(--space-xl);
}

.quick-actions-card .section-header {
  margin-bottom: var(--space-md);
}

.quick-actions-grid {
  margin-top: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-md);
}

.quick-action-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  text-align: left;
  min-height: calc(var(--space-2xl) * 1.35);
  border: 1px solid var(--color-border-default);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.quick-action-button:hover {
  border-color: var(--color-border-action-hover);
  background: var(--color-bg-action-hover);
}

.quick-action-button small {
  font-size: 0.74rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

@media (max-width: 1080px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-main-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .panel-card--full {
    grid-column: auto;
  }
}

@media (max-width: 720px) {
  .summary-grid,
  .quick-actions-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .panel-list__item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
