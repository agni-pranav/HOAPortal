<script setup>
import { computed, ref } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import RowActionMenu from '../components/ui/RowActionMenu.vue'
import BaseTable from '../components/ui/BaseTable.vue'
import BaseToggle from '../components/ui/BaseToggle.vue'
import { createInitialCommittees } from '../mock/committeesData'
import {
  createInitialMeetings,
  meetingTypeOptions,
  normalizeMeeting,
  voteValueOptions
} from '../mock/mockMeetingsData'
import { createInitialUsers } from '../mock/mockUsersData'
import { createInitialRoles } from '../mock/rolesData'

const meetings = ref(createInitialMeetings())
const committees = ref(createInitialCommittees())
const users = ref(createInitialUsers())
const roles = ref(createInitialRoles())

const isMeetingModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isAttendeesModalOpen = ref(false)
const isMinutesModalOpen = ref(false)

const mode = ref('create')
const editingMeetingId = ref('')
const meetingPendingDelete = ref(null)

const detailMeetingId = ref('')

const attendeesMeetingId = ref('')
const attendeesDraftByUserId = ref({})

const minutesMeetingId = ref('')
const minutesDraft = ref('')
const decisionsDraft = ref([])

const meetingForm = ref(createBlankMeetingForm())
const selectedMeetingId = ref(meetings.value[0]?.id || '')

const meetingColumns = [
  { key: 'title', label: 'Title', width: '26%' },
  { key: 'type', label: 'Type', width: '10%' },
  { key: 'committeeLabel', label: 'Committee', width: '12%' },
  { key: 'scheduledLabel', label: 'Scheduled Date', width: '20%' },
  { key: 'visibility', label: 'Visibility', width: '10%' },
  { key: 'status', label: 'Status', width: '8%' },
  { key: 'attendeesCount', label: 'Attendees', width: '96px', align: 'right' },
  { key: 'actions', label: 'Actions', width: '88px', align: 'center' }
]

const roleNameById = computed(() => {
  const mapped = {}
  roles.value.forEach((role) => {
    mapped[role.id] = role.name
  })
  return mapped
})

const committeeNameById = computed(() => {
  const mapped = {}
  committees.value.forEach((committee) => {
    mapped[committee.id] = committee.name
  })
  return mapped
})

const userById = computed(() => {
  const mapped = {}
  users.value.forEach((user) => {
    mapped[user.id] = user
  })
  return mapped
})

const sortedUsers = computed(() =>
  [...users.value].sort((firstUser, secondUser) => firstUser.name.localeCompare(secondUser.name))
)

const sortedMeetings = computed(() =>
  [...meetings.value].sort(
    (firstMeeting, secondMeeting) => new Date(firstMeeting.scheduledAt) - new Date(secondMeeting.scheduledAt)
  )
)


const meetingRows = computed(() =>
  sortedMeetings.value.map((meeting) => ({
    ...meeting,
    committeeLabel: resolveCommitteeLabel(meeting),
    scheduledLabel: formatMeetingDate(meeting.scheduledAt),
    status: resolveMeetingLifecycleStatus(meeting.scheduledAt),
    attendeesCount: countPresentAttendees(meeting.attendees)
  }))
)

const selectedMeeting = computed(
  () => meetings.value.find((meeting) => meeting.id === selectedMeetingId.value) || meetings.value[0] || null
)

const canSaveMeeting = computed(() => {
  const hasTitle = meetingForm.value.title.trim().length > 0
  const hasDate = Boolean(toIsoDateTime(meetingForm.value.scheduledAtLocal))
  const hasCommittee = meetingForm.value.type === 'board' || Boolean(meetingForm.value.committeeId)

  return hasTitle && hasDate && hasCommittee
})

const meetingModalTitle = computed(() =>
  mode.value === 'edit' ? 'Edit Meeting' : 'Schedule Meeting'
)

const selectedDetailMeeting = computed(
  () => meetings.value.find((meeting) => meeting.id === detailMeetingId.value) || null
)

const selectedAttendeesMeeting = computed(
  () => meetings.value.find((meeting) => meeting.id === attendeesMeetingId.value) || null
)

const selectedMinutesMeeting = computed(
  () => meetings.value.find((meeting) => meeting.id === minutesMeetingId.value) || null
)

const detailModalTitle = computed(() =>
  selectedDetailMeeting.value
    ? `Meeting Details — ${selectedDetailMeeting.value.title}`
    : 'Meeting Details'
)

const attendeesModalTitle = computed(() =>
  selectedAttendeesMeeting.value
    ? `Manage Attendees — ${selectedAttendeesMeeting.value.title}`
    : 'Manage Attendees'
)

const minutesModalTitle = computed(() =>
  selectedMinutesMeeting.value
    ? `Minutes & Decisions — ${selectedMinutesMeeting.value.title}`
    : 'Minutes & Decisions'
)

const attendeesPresentCount = computed(() =>
  Object.values(attendeesDraftByUserId.value).filter((status) => status === 'present').length
)

const attendeesTotalCount = computed(() => Object.keys(attendeesDraftByUserId.value).length)

const attendeesAbsentCount = computed(() =>
  Math.max(attendeesTotalCount.value - attendeesPresentCount.value, 0)
)

const attendeesRows = computed(() =>
  sortedUsers.value.map((user) => ({
    ...user,
    attendanceStatus: attendeesDraftByUserId.value[user.id] || 'absent'
  }))
)

const detailAttendanceSummary = computed(() => getAttendanceSummary(selectedDetailMeeting.value?.attendees || []))
const selectedAttendanceSummary = computed(() =>
  getAttendanceSummary(selectedMeeting.value?.attendees || [])
)

const detailDecisions = computed(() => {
  if (!selectedDetailMeeting.value) {
    return []
  }

  return (selectedDetailMeeting.value.decisions || []).map((decision) => {
    const voteCounts = getVoteCountsFromVotes(decision.votes || [])
    const outcome = resolveVoteOutcome(voteCounts)

    return {
      id: decision.id,
      type: normalizeGovernanceActionType(decision.type),
      text: decision.text || 'Untitled decision',
      voteCounts,
      outcome
    }
  })
})

function createBlankMeetingForm() {
  return {
    title: '',
    type: meetingTypeOptions[0],
    committeeId: '',
    scheduledAtLocal: '',
    location: '',
    isVirtual: false,
    visibility: 'board'
  }
}

function createMeetingId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `meeting-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

function createDecisionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `decision-${crypto.randomUUID()}`
  }

  return `decision-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

function updateMeetingById(meetingId, updater) {
  meetings.value = meetings.value.map((meeting) =>
    meeting.id === meetingId ? normalizeMeeting(updater(meeting)) : meeting
  )
}

function toIsoDateTime(localDateTime) {
  if (!localDateTime) {
    return ''
  }

  const parsed = new Date(localDateTime)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toISOString()
}

function toDateTimeLocal(isoDateTime) {
  const parsed = new Date(isoDateTime)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  const pad = (value) => String(value).padStart(2, '0')

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}

function formatMeetingDate(inputDateTime) {
  const parsed = new Date(inputDateTime)
  if (Number.isNaN(parsed.getTime())) {
    return 'Date pending'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(parsed)
}

function formatMeetingDateShort(inputDateTime) {
  const parsed = new Date(inputDateTime)
  if (Number.isNaN(parsed.getTime())) {
    return 'Date pending'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(parsed)
}

function countPresentAttendees(attendees) {
  if (!Array.isArray(attendees)) {
    return 0
  }

  return attendees.filter((attendee) => attendee.status === 'present').length
}

function getAttendanceSummary(attendees) {
  if (!Array.isArray(attendees)) {
    return {
      present: 0,
      absent: 0,
      total: 0
    }
  }

  const present = attendees.filter((attendee) => attendee.status === 'present').length
  const total = attendees.length
  const absent = Math.max(total - present, 0)

  return {
    present,
    absent,
    total
  }
}

function resolveMeetingTypeLabel(type) {
  return type === 'board' ? 'Board' : 'Committee'
}

function resolveMeetingTypeVariant(type) {
  return type === 'board' ? 'info' : 'warning'
}

function resolveVisibilityLabel(visibility) {
  return visibility === 'public' ? 'Public' : 'Board-only'
}

function resolveVisibilityVariant(visibility) {
  return visibility === 'public' ? 'success' : 'warning'
}

function resolveMeetingLifecycleStatus(scheduledAt) {
  const scheduledDate = new Date(scheduledAt)
  if (Number.isNaN(scheduledDate.getTime())) {
    return 'Upcoming'
  }

  return scheduledDate > new Date() ? 'Upcoming' : 'Completed'
}

function resolveMeetingLifecycleVariant(status) {
  return status === 'Upcoming' ? 'info' : 'neutral'
}

function resolveCommitteeLabel(meeting) {
  if (meeting.type === 'board') {
    return 'Board-wide'
  }

  if (!meeting.committeeId) {
    return 'Unassigned'
  }

  return committeeNameById.value[meeting.committeeId] || 'Unknown Committee'
}

function resolveRoleName(roleId) {
  if (!roleId) {
    return 'Unassigned'
  }

  return roleNameById.value[roleId] || 'Unknown Role'
}

function resolveUserStatusVariant(status) {
  return status === 'Active' ? 'success' : 'neutral'
}

function resolveAttendanceStatusVariant(status) {
  return status === 'present' ? 'success' : 'neutral'
}

function resolveAttendanceStatusLabel(status) {
  return status === 'present' ? 'Present' : 'Absent'
}

function normalizeGovernanceActionType(type) {
  return type === 'resolution' ? 'resolution' : 'recommendation'
}

function resolveGovernanceActionTypeLabel(type) {
  return normalizeGovernanceActionType(type) === 'resolution' ? 'Resolution' : 'Recommendation'
}

function resolveGovernanceActionTypeVariant(type) {
  return normalizeGovernanceActionType(type) === 'resolution' ? 'warning' : 'info'
}

function handleMeetingTypeChange(nextType) {
  meetingForm.value.type = nextType
  if (nextType === 'board') {
    meetingForm.value.committeeId = ''
  }
}

function openCreateMeetingModal() {
  mode.value = 'create'
  editingMeetingId.value = ''
  meetingForm.value = createBlankMeetingForm()
  isMeetingModalOpen.value = true
}

function openEditMeetingModal(meeting) {
  mode.value = 'edit'
  editingMeetingId.value = meeting.id
  meetingForm.value = {
    title: meeting.title,
    type: meeting.type,
    committeeId: meeting.committeeId || '',
    scheduledAtLocal: toDateTimeLocal(meeting.scheduledAt),
    location: meeting.location,
    isVirtual: meeting.isVirtual,
    visibility: meeting.visibility
  }
  isMeetingModalOpen.value = true
}

function closeMeetingModal() {
  isMeetingModalOpen.value = false
}

function saveMeeting() {
  if (!canSaveMeeting.value) {
    return
  }

  const scheduledAtIso = toIsoDateTime(meetingForm.value.scheduledAtLocal)
  if (!scheduledAtIso) {
    return
  }

  const nowIso = new Date().toISOString()
  const payload = {
    title: meetingForm.value.title.trim(),
    type: meetingForm.value.type,
    committeeId: meetingForm.value.type === 'committee' ? meetingForm.value.committeeId : null,
    scheduledAt: scheduledAtIso,
    location: meetingForm.value.location.trim(),
    isVirtual: meetingForm.value.isVirtual,
    visibility: meetingForm.value.visibility,
    updatedAt: nowIso
  }

  if (mode.value === 'edit') {
    updateMeetingById(editingMeetingId.value, (meeting) => ({
      ...meeting,
      ...payload
    }))
  } else {
    meetings.value = [
      normalizeMeeting({
        id: createMeetingId(),
        attendees: [],
        minutes: '',
        decisions: [],
        createdAt: nowIso,
        ...payload
      }),
      ...meetings.value
    ]
  }

  closeMeetingModal()
}

function promptDeleteMeeting(meeting) {
  meetingPendingDelete.value = meeting
  isDeleteModalOpen.value = true
}

function getMeetingActions() {
  return [
    { key: 'view', label: 'View' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete', variant: 'danger' }
  ]
}

function handleMeetingAction(actionKey, meeting) {
  if (actionKey === 'view') {
    openDetailModal(meeting)
    return
  }

  if (actionKey === 'edit') {
    openEditMeetingModal(meeting)
    return
  }

  if (actionKey === 'delete') {
    promptDeleteMeeting(meeting)
  }
}

function closeDeleteModal() {
  meetingPendingDelete.value = null
  isDeleteModalOpen.value = false
}

function confirmDeleteMeeting() {
  if (!meetingPendingDelete.value) {
    return
  }

  meetings.value = meetings.value.filter((meeting) => meeting.id !== meetingPendingDelete.value.id)

  if (detailMeetingId.value === meetingPendingDelete.value.id) {
    closeDetailModal()
  }

  closeDeleteModal()
}

function openDetailModal(meeting) {
  detailMeetingId.value = meeting.id
  isDetailModalOpen.value = true
}

function closeDetailModal() {
  isDetailModalOpen.value = false
  detailMeetingId.value = ''
}

function openAttendeesModal(meeting) {
  attendeesMeetingId.value = meeting.id

  const nextDraft = {}
  users.value.forEach((user) => {
    nextDraft[user.id] = 'absent'
  })

  if (Array.isArray(meeting.attendees)) {
    meeting.attendees.forEach((attendee) => {
      if (Object.prototype.hasOwnProperty.call(nextDraft, attendee.userId)) {
        nextDraft[attendee.userId] = attendee.status === 'present' ? 'present' : 'absent'
      }
    })
  }

  attendeesDraftByUserId.value = nextDraft
  isAttendeesModalOpen.value = true
}

function openAttendeesFromDetail() {
  if (!selectedDetailMeeting.value) {
    return
  }

  openAttendeesModal(selectedDetailMeeting.value)
}

function closeAttendeesModal() {
  isAttendeesModalOpen.value = false
  attendeesMeetingId.value = ''
  attendeesDraftByUserId.value = {}
}

function setAttendeeStatus(userId, isPresent) {
  attendeesDraftByUserId.value = {
    ...attendeesDraftByUserId.value,
    [userId]: isPresent ? 'present' : 'absent'
  }
}

function saveAttendees() {
  if (!attendeesMeetingId.value) {
    return
  }

  const nextAttendees = users.value.map((user) => ({
    userId: user.id,
    status: attendeesDraftByUserId.value[user.id] === 'present' ? 'present' : 'absent'
  }))

  updateMeetingById(attendeesMeetingId.value, (meeting) => ({
    ...meeting,
    attendees: nextAttendees,
    updatedAt: new Date().toISOString()
  }))

  closeAttendeesModal()
}

function openMinutesModal(meeting) {
  minutesMeetingId.value = meeting.id
  minutesDraft.value = meeting.minutes || ''

  decisionsDraft.value = (meeting.decisions || []).map((decision) => {
    const votesByUserId = {}

    users.value.forEach((user) => {
      votesByUserId[user.id] = 'abstain'
    })

    ;(decision.votes || []).forEach((vote) => {
      if (Object.prototype.hasOwnProperty.call(votesByUserId, vote.userId)) {
        votesByUserId[vote.userId] = vote.value
      }
    })

    return {
      id: decision.id,
      type: normalizeGovernanceActionType(decision.type),
      text: decision.text,
      votesByUserId
    }
  })

  isMinutesModalOpen.value = true
}

function openMinutesFromDetail() {
  if (!selectedDetailMeeting.value) {
    return
  }

  openMinutesModal(selectedDetailMeeting.value)
}

function closeMinutesModal() {
  isMinutesModalOpen.value = false
  minutesMeetingId.value = ''
  minutesDraft.value = ''
  decisionsDraft.value = []
}

function addDecision() {
  const votesByUserId = {}
  users.value.forEach((user) => {
    votesByUserId[user.id] = 'abstain'
  })

  decisionsDraft.value = [
    ...decisionsDraft.value,
    {
      id: createDecisionId(),
      type: 'recommendation',
      text: '',
      votesByUserId
    }
  ]
}

function removeDecision(decisionId) {
  decisionsDraft.value = decisionsDraft.value.filter((decision) => decision.id !== decisionId)
}

function setDecisionText(decisionId, nextText) {
  decisionsDraft.value = decisionsDraft.value.map((decision) =>
    decision.id === decisionId
      ? {
          ...decision,
          text: nextText
        }
      : decision
  )
}

function setDecisionType(decisionId, nextType) {
  decisionsDraft.value = decisionsDraft.value.map((decision) =>
    decision.id === decisionId
      ? {
          ...decision,
          type: normalizeGovernanceActionType(nextType)
        }
      : decision
  )
}

function setDecisionVote(decisionId, userId, nextValue) {
  decisionsDraft.value = decisionsDraft.value.map((decision) =>
    decision.id === decisionId
      ? {
          ...decision,
          votesByUserId: {
            ...decision.votesByUserId,
            [userId]: nextValue
          }
        }
      : decision
  )
}

function getDecisionVoteCounts(decision) {
  return Object.values(decision.votesByUserId || {}).reduce(
    (accumulator, voteValue) => {
      if (voteValue === 'yes' || voteValue === 'no' || voteValue === 'abstain') {
        accumulator[voteValue] += 1
      }
      return accumulator
    },
    { yes: 0, no: 0, abstain: 0 }
  )
}

function getVoteCountsFromVotes(votes) {
  return (Array.isArray(votes) ? votes : []).reduce(
    (accumulator, vote) => {
      if (vote?.value === 'yes' || vote?.value === 'no' || vote?.value === 'abstain') {
        accumulator[vote.value] += 1
      }
      return accumulator
    },
    { yes: 0, no: 0, abstain: 0 }
  )
}

function resolveVoteOutcome(voteCounts) {
  const totalVotes = (voteCounts?.yes || 0) + (voteCounts?.no || 0)

  if (totalVotes === 0) {
    return 'pending'
  }

  return (voteCounts?.yes || 0) > (voteCounts?.no || 0) ? 'approved' : 'rejected'
}

function resolveVoteOutcomeLabel(outcome) {
  if (outcome === 'approved') {
    return 'Approved'
  }

  if (outcome === 'rejected') {
    return 'Rejected'
  }

  return 'Pending'
}

function resolveVoteOutcomeVariant(outcome) {
  if (outcome === 'approved') {
    return 'success'
  }

  if (outcome === 'rejected') {
    return 'danger'
  }

  return 'warning'
}

function getDecisionOutcome(decision) {
  return resolveVoteOutcome(getDecisionVoteCounts(decision))
}

function saveMinutesAndDecisions() {
  if (!minutesMeetingId.value) {
    return
  }

  const normalizedDecisions = decisionsDraft.value
    .map((decision) => ({
      id: decision.id,
      type: normalizeGovernanceActionType(decision.type),
      text: decision.text.trim(),
      votes: Object.entries(decision.votesByUserId || {}).map(([userId, value]) => ({
        userId,
        value: voteValueOptions.includes(value) ? value : 'abstain'
      }))
    }))
    .filter((decision) => decision.text.length > 0)

  updateMeetingById(minutesMeetingId.value, (meeting) => ({
    ...meeting,
    minutes: minutesDraft.value.trim(),
    decisions: normalizedDecisions,
    updatedAt: new Date().toISOString()
  }))

  closeMinutesModal()
}
</script>

<template>
  <section class="meetings-view">
    <header class="meetings-view__header">
      <div>
        <h1>Meetings</h1>
        <p>Schedule and manage HOA meetings</p>
      </div>
      <BaseButton @click="openCreateMeetingModal">+ Schedule Meeting</BaseButton>
    </header>

    <BaseCard title="Meeting Workflow" subtitle="Create, capture attendance, and record minutes.">
      <div class="meeting-workflow">
        <label class="meeting-workflow__field">
          <span>Active meeting</span>
          <select v-model="selectedMeetingId">
            <option v-for="meeting in sortedMeetings" :key="meeting.id" :value="meeting.id">
              {{ meeting.title }} · {{ formatMeetingDateShort(meeting.scheduledAt) }}
            </option>
          </select>
        </label>

        <div class="meeting-workflow__steps">
          <article class="meeting-workflow__step">
            <div>
              <small>Step 1</small>
              <h4>Schedule meeting</h4>
              <p>Create board or committee sessions with locations and links.</p>
            </div>
            <BaseButton size="sm" @click="openCreateMeetingModal">Create</BaseButton>
          </article>

          <article class="meeting-workflow__step">
            <div>
              <small>Step 2</small>
              <h4>Capture attendees</h4>
              <p>Track attendance and quorum in real time.</p>
            </div>
            <BaseButton
              size="sm"
              variant="secondary"
              :disabled="!selectedMeeting"
              @click="openAttendeesModal(selectedMeeting)"
            >
              Manage
            </BaseButton>
          </article>

          <article class="meeting-workflow__step">
            <div>
              <small>Step 3</small>
              <h4>Minutes & summary</h4>
              <p>Record decisions, votes, and action items.</p>
            </div>
            <BaseButton
              size="sm"
              variant="ghost"
              :disabled="!selectedMeeting"
              @click="openMinutesModal(selectedMeeting)"
            >
              Add Notes
            </BaseButton>
          </article>
        </div>

        <div v-if="selectedMeeting" class="meeting-workflow__snapshot">
          <h5>Meeting snapshot</h5>
          <p>{{ selectedMeeting.title }}</p>
          <div class="meeting-workflow__meta">
            <BaseBadge size="sm" variant="neutral">{{ resolveMeetingTypeLabel(selectedMeeting.type) }}</BaseBadge>
            <BaseBadge size="sm" variant="neutral">{{ resolveVisibilityLabel(selectedMeeting.visibility) }}</BaseBadge>
            <BaseBadge size="sm" :variant="resolveMeetingLifecycleVariant(resolveMeetingLifecycleStatus(selectedMeeting.scheduledAt))">
              {{ resolveMeetingLifecycleStatus(selectedMeeting.scheduledAt) }}
            </BaseBadge>
          </div>
          <div class="meeting-workflow__attendance">
            <BaseBadge variant="success">Present: {{ selectedAttendanceSummary.present }}</BaseBadge>
            <BaseBadge variant="danger">Absent: {{ selectedAttendanceSummary.absent }}</BaseBadge>
            <BaseBadge variant="neutral">Total: {{ selectedAttendanceSummary.total }}</BaseBadge>
          </div>
        </div>
      </div>
    </BaseCard>

    <BaseCard>
      <BaseTable :columns="meetingColumns" :rows="meetingRows">
        <template #cell-title="{ value }">
          <span class="meetings-view__cell" :title="value">{{ value }}</span>
        </template>

        <template #cell-type="{ value }">
          <BaseBadge size="sm" variant="neutral" class="meetings-view__badge">
            {{ resolveMeetingTypeLabel(value) }}
          </BaseBadge>
        </template>

        <template #cell-committeeLabel="{ value }">
          <span class="meetings-view__cell" :title="value">{{ value }}</span>
        </template>

        <template #cell-scheduledLabel="{ value }">
          <span class="meetings-view__cell" :title="value">{{ value }}</span>
        </template>

        <template #cell-visibility="{ value }">
          <BaseBadge size="sm" variant="neutral" class="meetings-view__badge">
            {{ resolveVisibilityLabel(value) }}
          </BaseBadge>
        </template>

        <template #cell-status="{ value }">
          <BaseBadge size="sm" variant="neutral" class="meetings-view__badge">
            {{ value }}
          </BaseBadge>
        </template>

        <template #cell-attendeesCount="{ value }">
          <span class="meetings-view__numeric">{{ value }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="table-action-cell">
            <RowActionMenu
              :actions="getMeetingActions(row)"
              label="Meeting row actions"
              @select="handleMeetingAction($event, row)"
            />
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal
      v-model="isMeetingModalOpen"
      :title="meetingModalTitle"
      description="Create or update meeting details for board and committee sessions."
    >
      <div class="meeting-form">
        <BaseInput
          v-model="meetingForm.title"
          label="Title"
          placeholder="Enter meeting title"
        />

        <label class="meeting-form__field">
          <span>Type</span>
          <select
            :value="meetingForm.type"
            @change="handleMeetingTypeChange($event.target.value)"
          >
            <option value="board">Board</option>
            <option value="committee">Committee</option>
          </select>
        </label>

        <label
          v-if="meetingForm.type === 'committee'"
          class="meeting-form__field"
        >
          <span>Committee</span>
          <select v-model="meetingForm.committeeId">
            <option value="">Select committee</option>
            <option
              v-for="committee in committees"
              :key="committee.id"
              :value="committee.id"
            >
              {{ committee.name }}
            </option>
          </select>
        </label>

        <BaseInput
          v-model="meetingForm.scheduledAtLocal"
          type="datetime-local"
          label="Date & Time"
        />

        <BaseInput
          v-model="meetingForm.location"
          label="Location"
          placeholder="Enter location"
        />

        <div class="meeting-form__toggle-field">
          <span>Virtual Meeting</span>
          <div class="meeting-form__toggle-row">
            <small>On-site</small>
            <BaseToggle
              :model-value="meetingForm.isVirtual"
              @update:model-value="meetingForm.isVirtual = $event"
            />
            <small>Virtual</small>
          </div>
        </div>

        <div class="meeting-form__toggle-field">
          <span>Visibility</span>
          <div class="meeting-form__toggle-row">
            <small>Board-only</small>
            <BaseToggle
              :model-value="meetingForm.visibility === 'public'"
              @update:model-value="meetingForm.visibility = $event ? 'public' : 'board'"
            />
            <small>Public</small>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeMeetingModal">Cancel</BaseButton>
        <BaseButton :disabled="!canSaveMeeting" @click="saveMeeting">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isDetailModalOpen"
      :title="detailModalTitle"
      description="Review meeting metadata, attendance, and recorded decisions."
    >
      <div v-if="selectedDetailMeeting" class="meeting-detail">
        <section class="meeting-detail__section">
          <h4>Meeting Metadata</h4>

          <div class="meeting-detail__grid">
            <div>
              <small>Type</small>
              <p>
                <BaseBadge :variant="resolveMeetingTypeVariant(selectedDetailMeeting.type)">
                  {{ resolveMeetingTypeLabel(selectedDetailMeeting.type) }}
                </BaseBadge>
              </p>
            </div>
            <div>
              <small>Committee</small>
              <p>{{ resolveCommitteeLabel(selectedDetailMeeting) }}</p>
            </div>
            <div>
              <small>Scheduled</small>
              <p>{{ formatMeetingDate(selectedDetailMeeting.scheduledAt) }}</p>
            </div>
            <div>
              <small>Visibility</small>
              <p>
                <BaseBadge :variant="resolveVisibilityVariant(selectedDetailMeeting.visibility)">
                  {{ resolveVisibilityLabel(selectedDetailMeeting.visibility) }}
                </BaseBadge>
              </p>
            </div>
            <div>
              <small>Location</small>
              <p>{{ selectedDetailMeeting.location || 'Not specified' }}</p>
            </div>
            <div>
              <small>Virtual</small>
              <p>{{ selectedDetailMeeting.isVirtual ? 'Yes' : 'No' }}</p>
            </div>
          </div>
        </section>

        <section class="meeting-detail__section">
          <h4>Attendance Summary</h4>

          <div class="meeting-detail__summary">
            <BaseBadge variant="success">Present: {{ detailAttendanceSummary.present }}</BaseBadge>
            <BaseBadge variant="danger">Absent: {{ detailAttendanceSummary.absent }}</BaseBadge>
            <BaseBadge variant="neutral">Total: {{ detailAttendanceSummary.total }}</BaseBadge>
          </div>
        </section>

        <section class="meeting-detail__section">
          <h4>Minutes</h4>

          <div class="meeting-detail__minutes">
            <p>{{ selectedDetailMeeting.minutes || 'No minutes recorded yet.' }}</p>
          </div>
        </section>

        <section class="meeting-detail__section">
          <h4>Decisions</h4>

          <div v-if="detailDecisions.length === 0" class="meeting-detail__empty">
            No decisions recorded.
          </div>

          <div v-else class="meeting-detail__actions">
            <article
              v-for="action in detailDecisions"
              :key="action.id"
              class="meeting-detail__action-card"
            >
              <div class="meeting-detail__action-header">
                <BaseBadge size="sm" :variant="resolveGovernanceActionTypeVariant(action.type)">
                  {{ resolveGovernanceActionTypeLabel(action.type) }}
                </BaseBadge>
                <BaseBadge size="sm" :variant="resolveVoteOutcomeVariant(action.outcome)">
                  {{ resolveVoteOutcomeLabel(action.outcome) }}
                </BaseBadge>
              </div>

              <p class="meeting-detail__action-text">{{ action.text }}</p>

              <div class="meeting-detail__action-votes">
                <BaseBadge size="sm" variant="success">Yes: {{ action.voteCounts.yes }}</BaseBadge>
                <BaseBadge size="sm" variant="danger">No: {{ action.voteCounts.no }}</BaseBadge>
                <BaseBadge size="sm" variant="neutral">Abstain: {{ action.voteCounts.abstain }}</BaseBadge>
              </div>
            </article>
          </div>
        </section>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="openAttendeesFromDetail">Manage Attendees</BaseButton>
        <BaseButton variant="ghost" @click="openMinutesFromDetail">Minutes & Decisions</BaseButton>
        <BaseButton @click="closeDetailModal">Close</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isAttendeesModalOpen"
      :title="attendeesModalTitle"
      description="Mark users present or absent for this meeting."
    >
      <div class="attendees-modal">
        <header class="attendees-modal__header">
          <div class="attendees-modal__summary">
            <BaseBadge variant="success">Present: {{ attendeesPresentCount }}</BaseBadge>
            <BaseBadge variant="danger">Absent: {{ attendeesAbsentCount }}</BaseBadge>
            <BaseBadge variant="neutral">Total: {{ attendeesTotalCount }}</BaseBadge>
          </div>
        </header>

        <div class="attendees-list">
          <div
            v-for="participant in attendeesRows"
            :key="participant.id"
            class="attendees-list__item"
          >
            <div class="attendees-list__main">
              <div class="attendees-list__identity">
                <p>{{ participant.name }}</p>
                <small>{{ participant.email }}</small>
              </div>

              <div class="attendees-list__badges">
                <BaseBadge variant="info">
                  {{ resolveRoleName(participant.assignedRoleId) }}
                </BaseBadge>

                <BaseBadge :variant="resolveUserStatusVariant(participant.status)">
                  {{ participant.status }}
                </BaseBadge>
              </div>
            </div>

            <div class="attendees-list__controls">
              <BaseBadge
                size="sm"
                :variant="resolveAttendanceStatusVariant(participant.attendanceStatus)"
              >
                {{ resolveAttendanceStatusLabel(participant.attendanceStatus) }}
              </BaseBadge>

              <div class="attendees-list__toggle">
                <small>Absent</small>
                <BaseToggle
                  :model-value="participant.attendanceStatus === 'present'"
                  @update:model-value="setAttendeeStatus(participant.id, $event)"
                />
                <small>Present</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeAttendeesModal">Cancel</BaseButton>
        <BaseButton @click="saveAttendees">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isMinutesModalOpen"
      :title="minutesModalTitle"
      description="Capture minutes and voting outcomes for this meeting."
    >
      <div class="minutes-modal">
        <BaseInput
          v-model="minutesDraft"
          type="textarea"
          :rows="4"
          label="Minutes"
          placeholder="Enter meeting minutes"
        />

        <div class="minutes-modal__header-row">
          <h4>Decisions</h4>
          <BaseButton size="sm" variant="secondary" @click="addDecision">+ Add Decision</BaseButton>
        </div>

        <div v-if="decisionsDraft.length === 0" class="minutes-modal__empty">
          No decisions added yet.
        </div>

        <div v-else class="decision-list">
          <BaseCard
            v-for="decision in decisionsDraft"
            :key="decision.id"
            class="decision-card"
          >
            <header class="decision-card__header">
              <h5>Decision Item</h5>

              <div class="decision-card__header-actions">
                <BaseBadge size="sm" :variant="resolveGovernanceActionTypeVariant(decision.type)">
                  {{ resolveGovernanceActionTypeLabel(decision.type) }}
                </BaseBadge>
                <BaseBadge size="sm" :variant="resolveVoteOutcomeVariant(getDecisionOutcome(decision))">
                  {{ resolveVoteOutcomeLabel(getDecisionOutcome(decision)) }}
                </BaseBadge>
                <BaseButton size="sm" variant="danger" @click="removeDecision(decision.id)">Remove</BaseButton>
              </div>
            </header>

            <label class="decision-card__field">
              <span>Decision Type</span>
              <select
                :value="decision.type"
                @change="setDecisionType(decision.id, $event.target.value)"
              >
                <option value="recommendation">Recommendation</option>
                <option value="resolution">Resolution</option>
              </select>
            </label>

            <BaseInput
              :model-value="decision.text"
              label="Decision Text"
              placeholder="Enter decision details"
              @update:model-value="setDecisionText(decision.id, $event)"
            />

            <div class="decision-votes__header">
              <h6>Individual Votes</h6>
            </div>

            <div class="decision-votes">
              <div
                v-for="user in sortedUsers"
                :key="`${decision.id}-${user.id}`"
                class="decision-votes__row"
              >
                <span>{{ user.name }}</span>

                <select
                  :value="decision.votesByUserId[user.id]"
                  @change="setDecisionVote(decision.id, user.id, $event.target.value)"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="abstain">Abstain</option>
                </select>
              </div>
            </div>

            <div class="decision-summary">
              <span class="decision-summary__label">Vote Totals</span>

              <div class="decision-summary__badges">
                <BaseBadge variant="success">Yes: {{ getDecisionVoteCounts(decision).yes }}</BaseBadge>
                <BaseBadge variant="danger">No: {{ getDecisionVoteCounts(decision).no }}</BaseBadge>
                <BaseBadge variant="neutral">Abstain: {{ getDecisionVoteCounts(decision).abstain }}</BaseBadge>
                <BaseBadge :variant="resolveVoteOutcomeVariant(getDecisionOutcome(decision))">
                  Outcome: {{ resolveVoteOutcomeLabel(getDecisionOutcome(decision)) }}
                </BaseBadge>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeMinutesModal">Cancel</BaseButton>
        <BaseButton @click="saveMinutesAndDecisions">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isDeleteModalOpen"
      title="Delete Meeting"
      description="Are you sure you want to delete this meeting?"
    >
      <p class="delete-note">
        This action removes
        <strong>{{ meetingPendingDelete?.title || 'the selected meeting' }}</strong>
        from local mock data.
      </p>

      <template #footer>
        <BaseButton variant="ghost" @click="closeDeleteModal">Cancel</BaseButton>
        <BaseButton variant="danger" @click="confirmDeleteMeeting">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
:deep(.modal__panel) {
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

:deep(.modal__content) {
  overflow-y: auto;
}

.meetings-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.meetings-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.meetings-view__header h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.4rem;
  font-weight: 620;
}

.meetings-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.meetings-view__numeric {
  display: inline-flex;
  min-width: calc(var(--space-md) * 1.8);
  justify-content: flex-end;
}

.meetings-view__cell {
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.base-table) {
  width: 100%;
  min-width: 860px;
}

:deep(.base-table__header),
:deep(.base-table__row) {
  padding: calc(var(--space-sm) * 1.2) var(--space-md);
}

.meetings-view :deep(.base-table__row) {
  border-bottom: 1px solid var(--color-border-default);
}

.meetings-view :deep(.base-table__row:last-child) {
  border-bottom: none;
}

.meetings-view__badge {
  white-space: nowrap;
}

.table-action-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}


.meeting-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.meeting-form__field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.7);
}

.meeting-form__field span,
.meeting-form__toggle-field span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 550;
}

.meeting-form__field select,
.decision-card__field select,
.decision-votes__row select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.2) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
  outline: none;
}

.meeting-form__field select:focus,
.decision-card__field select:focus,
.decision-votes__row select:focus {
  border-color: var(--color-input-focus-border);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.meeting-form__toggle-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.9);
}

.meeting-form__toggle-row {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--space-sm) * 1.2);
}

.meeting-form__toggle-row small {
  color: var(--color-text-secondary);
  font-size: 0.78rem;
}

.meeting-workflow {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.meeting-workflow__field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-xs) * 0.8);
}

.meeting-workflow__field span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}

.meeting-workflow__field select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.1) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
  outline: none;
}

.meeting-workflow__field select:focus {
  border-color: var(--color-input-focus-border);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.meeting-workflow__steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-sm);
}

.meeting-workflow__step {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.meeting-workflow__step h4 {
  margin: calc(var(--space-xs) * 0.6) 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.meeting-workflow__step p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  line-height: 1.4;
}

.meeting-workflow__step small {
  color: var(--color-text-secondary);
  font-size: 0.72rem;
  font-weight: 600;
}

.meeting-workflow__snapshot {
  border-top: 1px solid var(--color-border-default);
  padding-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.meeting-workflow__snapshot h5 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.meeting-workflow__snapshot p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.meeting-workflow__meta,
.meeting-workflow__attendance {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.meeting-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 62vh;
  overflow-y: auto;
  padding-right: var(--space-xs);
}

.meeting-detail__section {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
}

.meeting-detail__section h4 {
  margin: 0 0 var(--space-sm);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-weight: 620;
}

.meeting-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}

.meeting-detail__grid small,
.meeting-detail__minutes small {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.76rem;
  margin-bottom: calc(var(--space-xs) * 0.8);
}

.meeting-detail__grid p,
.meeting-detail__minutes p {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.88rem;
  line-height: 1.5;
}

.meeting-detail__summary {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.meeting-detail__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.meeting-detail__action-card {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
}

.meeting-detail__action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.meeting-detail__action-text {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-primary);
  font-size: 0.85rem;
  line-height: 1.5;
}

.meeting-detail__action-votes {
  margin-top: var(--space-xs);
  display: inline-flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.meeting-detail__empty {
  margin: 0;
  padding: var(--space-sm);
  border: 1px dashed var(--color-border-default);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.attendees-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.attendees-modal__summary {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.attendees-list {
  max-height: calc(var(--space-2xl) * 5.5);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-right: var(--space-xs);
}

.attendees-list__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  background: var(--color-bg-panel);
}

.attendees-list__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.attendees-list__identity {
  min-width: 0;
}

.attendees-list__identity p {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.88rem;
  font-weight: 560;
}

.attendees-list__identity small {
  display: block;
  margin-top: calc(var(--space-xs) * 0.8);
  color: var(--color-text-secondary);
  font-size: 0.76rem;
}

.attendees-list__badges {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-xs);
}

.attendees-list__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  border-top: 1px solid var(--color-border-default);
  padding-top: var(--space-sm);
}

.attendees-list__toggle {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--space-sm) * 0.8);
}

.attendees-list__toggle small {
  color: var(--color-text-secondary);
  font-size: 0.74rem;
}

.minutes-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 62vh;
  overflow-y: auto;
  padding-right: var(--space-xs);
}

.minutes-modal__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.minutes-modal__header-row h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-weight: 620;
}

.minutes-modal__empty {
  margin: 0;
  padding: var(--space-sm);
  border: 1px dashed var(--color-border-default);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.decision-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: none;
  overflow: visible;
  padding-right: 0;
}

.decision-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.decision-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-sm);
}

.decision-card__header h5 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.88rem;
  font-weight: 620;
}

.decision-card__header-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
  justify-content: flex-end;
}

.decision-card__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.decision-card__field span {
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  font-weight: 650;
  line-height: 1.4;
}

.decision-card :deep(.input-field) {
  gap: var(--space-sm);
}

.decision-card :deep(.input-field span) {
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  font-weight: 650;
  line-height: 1.4;
}

.decision-votes__header {
  margin-top: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border-default);
}

.decision-votes__header h6 {
  margin: 0 0 var(--space-sm);
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  font-weight: 650;
}

.decision-votes {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
}

.decision-votes__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: calc(var(--space-sm) * 0.65);
  padding: calc(var(--space-xs) * 0.9) 0;
  border-bottom: 1px solid var(--color-border-default);
}

.decision-votes__row:last-child {
  border-bottom: none;
}

.decision-votes__row span {
  color: var(--color-text-primary);
  font-size: 0.8rem;
}

.decision-card__field select,
.decision-votes__row select {
  padding: calc(var(--space-sm) * 0.9) calc(var(--space-sm) * 1.1);
  font-size: 0.8rem;
}

.decision-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border-default);
}

.decision-summary__label {
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  font-weight: 650;
}

.decision-summary__badges {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.delete-note {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
}

@media (max-width: 980px) {
  .meetings-view__header {
    flex-direction: column;
    align-items: stretch;
  }


  .meeting-detail__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .attendees-list__item {
    padding: var(--space-sm);
  }

  .attendees-list__main {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .attendees-list__badges {
    justify-content: flex-start;
  }

  .attendees-list__toggle {
    justify-content: flex-start;
  }

  .attendees-list__controls {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .decision-votes__row {
    grid-template-columns: minmax(0, 1fr);
    border-bottom: 1px solid var(--color-border-default);
  }

  .decision-votes__row:last-child {
    border-bottom: none;
  }

  .decision-votes {
    grid-template-columns: minmax(0, 1fr);
  }

  .meeting-workflow__steps {
    grid-template-columns: minmax(0, 1fr);
  }

  .meeting-workflow__step {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
