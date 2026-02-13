<script setup>
import { computed, ref } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseToggle from '../components/ui/BaseToggle.vue'
import { createInitialCommittees } from '../mock/committeesData'
import { createInitialMeetings, meetingTypeOptions, normalizeMeeting } from '../mock/mockMeetingsData'
import { createInitialUsers } from '../mock/mockUsersData'

const meetings = ref(createInitialMeetings())
const committees = ref(createInitialCommittees())
const users = ref(createInitialUsers())

const calendarMonth = ref({ year: 2026, month: 1 })

const isMeetingModalOpen = ref(false)
const isAttendeesModalOpen = ref(false)
const isMinutesModalOpen = ref(false)

const meetingForm = ref(createBlankMeetingForm())
const attendeesDraftByUserId = ref({})
const minutesDraft = ref('')

const sortedMeetings = computed(() =>
  [...meetings.value].sort(
    (firstMeeting, secondMeeting) =>
      new Date(firstMeeting.scheduledAt) - new Date(secondMeeting.scheduledAt)
  )
)

const upcomingMeetings = computed(() => sortedMeetings.value.slice(0, 5))

const hoaEvents = ref([
  {
    id: 'event-annual-meeting',
    title: 'HOA Annual Meeting',
    scheduledAt: '2026-02-12T23:00:00.000Z',
    label: 'Event'
  },
  {
    id: 'event-pool-inspection',
    title: 'Pool Safety Inspection',
    scheduledAt: '2026-02-18T16:30:00.000Z',
    label: 'Event'
  },
  {
    id: 'event-landscape-walk',
    title: 'Landscape Walkthrough',
    scheduledAt: '2026-02-24T22:00:00.000Z',
    label: 'Event'
  },
  {
    id: 'event-social-night',
    title: 'Community Social Night',
    scheduledAt: '2026-03-07T01:00:00.000Z',
    label: 'Event'
  }
])

const calendarDays = computed(() => buildCalendarDays(calendarMonth.value.year, calendarMonth.value.month))

const attendeesRows = computed(() =>
  users.value.map((user) => ({
    ...user,
    attendanceStatus: attendeesDraftByUserId.value[user.id] || 'absent'
  }))
)

const canSaveMeeting = computed(() => {
  const hasTitle = meetingForm.value.title.trim().length > 0
  const hasDate = Boolean(toIsoDateTime(meetingForm.value.scheduledAtLocal))
  const hasCommittee = meetingForm.value.type === 'board' || Boolean(meetingForm.value.committeeId)

  return hasTitle && hasDate && hasCommittee
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

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(
    parsed.getHours()
  )}:${pad(parsed.getMinutes())}`
}

function buildCalendarDays(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const startDay = firstOfMonth.getDay()
  const gridStartDate = new Date(year, month, 1 - startDay)
  const days = []

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(gridStartDate)
    date.setDate(gridStartDate.getDate() + index)

    const inMonth = date.getMonth() === month

    days.push({
      date,
      inMonth,
      label: date.getDate(),
      items: getCalendarItemsForDate(date)
    })
  }

  return days
}

function getCalendarItemsForDate(date) {
  const meetingItems = meetings.value
    .filter((meeting) => isSameDay(new Date(meeting.scheduledAt), date))
    .map((meeting) => ({
      id: meeting.id,
      kind: 'meeting',
      label: resolveMeetingTypeLabel(meeting.type),
      title: meeting.title,
      variant: resolveMeetingLifecycleVariant(resolveMeetingLifecycleStatus(meeting.scheduledAt))
    }))

  const eventItems = hoaEvents.value
    .filter((event) => isSameDay(new Date(event.scheduledAt), date))
    .map((event) => ({
      id: event.id,
      kind: 'event',
      label: event.label || 'Event',
      title: event.title,
      variant: 'warning'
    }))

  return [...meetingItems, ...eventItems]
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
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


function resolveMeetingTypeLabel(type) {
  return type === 'board' ? 'Board' : 'Committee'
}

function resolveVisibilityLabel(visibility) {
  return visibility === 'public' ? 'Public' : 'Board-only'
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
  if (meeting?.type === 'board') {
    return 'Board-wide'
  }

  if (!meeting?.committeeId) {
    return 'Unassigned'
  }

  return committees.value.find((committee) => committee.id === meeting.committeeId)?.name || 'Unknown'
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

function handleMeetingTypeChange(nextType) {
  meetingForm.value.type = nextType
  if (nextType === 'board') {
    meetingForm.value.committeeId = ''
  }
}

function openCreateMeetingModal() {
  meetingForm.value = createBlankMeetingForm()
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

  const nextMeeting = normalizeMeeting({
    id: createMeetingId(),
    attendees: [],
    minutes: '',
    decisions: [],
    createdAt: nowIso,
    ...payload
  })

  meetings.value = [nextMeeting, ...meetings.value]
  selectedMeetingId.value = nextMeeting.id
  closeMeetingModal()
}

function openAttendeesModalForMeeting(meeting) {
  if (!meeting) {
    return
  }

  selectedMeetingId.value = meeting.id

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

function closeAttendeesModal() {
  isAttendeesModalOpen.value = false
  attendeesDraftByUserId.value = {}
}

function setAttendeeStatus(userId, isPresent) {
  attendeesDraftByUserId.value = {
    ...attendeesDraftByUserId.value,
    [userId]: isPresent ? 'present' : 'absent'
  }
}

function saveAttendees() {
  if (!selectedMeeting.value) {
    return
  }

  const nextAttendees = users.value.map((user) => ({
    userId: user.id,
    status: attendeesDraftByUserId.value[user.id] === 'present' ? 'present' : 'absent'
  }))

  updateMeetingById(selectedMeeting.value.id, (meeting) => ({
    ...meeting,
    attendees: nextAttendees,
    updatedAt: new Date().toISOString()
  }))

  closeAttendeesModal()
}

function openMinutesModalForMeeting(meeting) {
  if (!meeting) {
    return
  }

  selectedMeetingId.value = meeting.id
  minutesDraft.value = meeting.minutes || ''
  isMinutesModalOpen.value = true
}

function closeMinutesModal() {
  isMinutesModalOpen.value = false
  minutesDraft.value = ''
}

function saveMinutes() {
  if (!selectedMeeting.value) {
    return
  }

  updateMeetingById(selectedMeeting.value.id, (meeting) => ({
    ...meeting,
    minutes: minutesDraft.value.trim(),
    updatedAt: new Date().toISOString()
  }))

  closeMinutesModal()
}
</script>

<template>
  <section class="calendar-view">
    <header class="calendar-view__header">
      <div>
        <h1>Calendar</h1>
        <p>Coordinate board meetings, committee sessions, and HOA events in one place.</p>
      </div>
      <BaseButton @click="openCreateMeetingModal">+ Create Meeting</BaseButton>
    </header>

    <div class="calendar-view__grid">
      <BaseCard class="calendar-card">
        <header class="calendar-card__header">
          <div>
            <h3>February 2026</h3>
            <p>Board meetings, committee check-ins, and community events.</p>
          </div>
          <div class="calendar-card__legend">
            <BaseBadge variant="info">Upcoming</BaseBadge>
            <BaseBadge variant="neutral">Completed</BaseBadge>
            <BaseBadge variant="warning">HOA Event</BaseBadge>
          </div>
        </header>

        <div class="calendar-card__weekdays">
          <span v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">
            {{ day }}
          </span>
        </div>

        <div class="calendar-card__grid">
          <article
            v-for="day in calendarDays"
            :key="day.date.toISOString()"
            class="calendar-card__day"
            :class="{ 'is-muted': !day.inMonth }"
          >
            <header>
              <span>{{ day.label }}</span>
            </header>
            <div class="calendar-card__events">
              <div
                v-for="item in day.items.slice(0, 3)"
                :key="item.id"
                class="calendar-card__event"
                :data-tooltip="item.title"
                tabindex="0"
              >
                <BaseBadge size="sm" :variant="item.variant">
                  {{ item.label }}
                </BaseBadge>
              </div>
              <small v-if="day.items.length > 3" class="calendar-card__more">
                +{{ day.items.length - 3 }} more
              </small>
            </div>
          </article>
        </div>
      </BaseCard>

      <BaseCard title="Upcoming Meetings" subtitle="Next scheduled governance sessions">
        <div class="meeting-list">
          <article v-for="meeting in upcomingMeetings" :key="meeting.id" class="meeting-list__item">
            <div>
              <div class="meeting-list__title">
                <h4>{{ meeting.title }}</h4>
                <BaseBadge size="sm" :variant="resolveMeetingLifecycleVariant(resolveMeetingLifecycleStatus(meeting.scheduledAt))">
                  {{ resolveMeetingLifecycleStatus(meeting.scheduledAt) }}
                </BaseBadge>
              </div>
              <p>
                {{ formatMeetingDate(meeting.scheduledAt) }} ·
                {{ resolveCommitteeLabel(meeting) }} ·
                {{ meeting.location || 'Location TBD' }}
              </p>
            </div>
            <div class="meeting-list__actions">
              <BaseButton size="sm" variant="secondary" @click="openAttendeesModalForMeeting(meeting)">
                Attendees
              </BaseButton>
              <BaseButton size="sm" variant="ghost" @click="openMinutesModalForMeeting(meeting)">
                Minutes
              </BaseButton>
            </div>
          </article>
        </div>
      </BaseCard>
    </div>

    <BaseModal
      v-model="isMeetingModalOpen"
      title="Schedule Meeting"
      description="Add a meeting to the HOA calendar."
    >
      <div class="meeting-form">
        <BaseInput v-model="meetingForm.title" label="Title" placeholder="Enter meeting title" />

        <label class="meeting-form__field">
          <span>Type</span>
          <select :value="meetingForm.type" @change="handleMeetingTypeChange($event.target.value)">
            <option value="board">Board</option>
            <option value="committee">Committee</option>
          </select>
        </label>

        <label v-if="meetingForm.type === 'committee'" class="meeting-form__field">
          <span>Committee</span>
          <select v-model="meetingForm.committeeId">
            <option value="">Select committee</option>
            <option v-for="committee in committees" :key="committee.id" :value="committee.id">
              {{ committee.name }}
            </option>
          </select>
        </label>

        <BaseInput v-model="meetingForm.scheduledAtLocal" type="datetime-local" label="Date & Time" />

        <BaseInput v-model="meetingForm.location" label="Location" placeholder="Enter location" />

        <div class="meeting-form__toggle-field">
          <span>Virtual Meeting</span>
          <div class="meeting-form__toggle-row">
            <small>On-site</small>
            <BaseToggle :model-value="meetingForm.isVirtual" @update:model-value="meetingForm.isVirtual = $event" />
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
      v-model="isAttendeesModalOpen"
      title="Capture Attendees"
      description="Mark attendees as present or absent."
    >
      <div class="attendees-modal">
        <div class="attendees-modal__summary">
          <BaseBadge variant="success">Present: {{ selectedAttendanceSummary.present }}</BaseBadge>
          <BaseBadge variant="danger">Absent: {{ selectedAttendanceSummary.absent }}</BaseBadge>
          <BaseBadge variant="neutral">Total: {{ selectedAttendanceSummary.total }}</BaseBadge>
        </div>

        <div class="attendees-list">
          <div v-for="participant in attendeesRows" :key="participant.id" class="attendees-list__item">
            <div>
              <p>{{ participant.name }}</p>
              <small>{{ participant.email }}</small>
            </div>
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

      <template #footer>
        <BaseButton variant="ghost" @click="closeAttendeesModal">Cancel</BaseButton>
        <BaseButton @click="saveAttendees">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isMinutesModalOpen"
      title="Minutes & Summary"
      description="Capture meeting notes and key outcomes."
    >
      <div class="minutes-modal">
        <BaseInput
          v-model="minutesDraft"
          type="textarea"
          :rows="6"
          label="Minutes / Summary"
          placeholder="Enter minutes, key decisions, and action items"
        />
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeMinutesModal">Cancel</BaseButton>
        <BaseButton @click="saveMinutes">Save</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.calendar-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.calendar-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.calendar-view__header h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 620;
}

.calendar-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.calendar-view__grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.calendar-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.calendar-card__header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 620;
  color: var(--color-text-primary);
}

.calendar-card__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.86rem;
}

.calendar-card__legend {
  display: inline-flex;
  gap: var(--space-xs);
}

.calendar-card__weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-xs);
  text-align: center;
  margin-bottom: var(--space-xs);
}

.calendar-card__weekdays span {
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
}

.calendar-card__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-xs);
}

.calendar-card__day {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  min-height: 96px;
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  background: var(--color-bg-panel);
}

.calendar-card__day.is-muted {
  opacity: 0.45;
}

.calendar-card__day header {
  display: flex;
  justify-content: flex-end;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.calendar-card__events {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-xs) * 0.7);
}

.calendar-card__event {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-xs) * 0.4);
  border: 1px solid var(--color-border-default);
  border-radius: 0.55rem;
  padding: calc(var(--space-xs) * 0.75);
  background: var(--color-bg-panel);
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.calendar-card__event:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-1px);
}

.calendar-card__event::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 6px);
  transform: translateX(-50%) translateY(6px);
  padding: calc(var(--space-xs) * 0.6) calc(var(--space-xs) * 0.8);
  border-radius: 0.45rem;
  background: var(--color-text-primary);
  color: var(--color-text-on-accent);
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 20;
}

.calendar-card__event:hover::after,
.calendar-card__event:focus::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.calendar-card__event small {
  font-size: 0.72rem;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.calendar-card__more {
  color: var(--color-text-secondary);
  font-size: 0.72rem;
}

.meeting-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.meeting-list__item {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  background: var(--color-bg-panel);
}

.meeting-list__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.meeting-list__title h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.meeting-list__item p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.meeting-list__actions {
  display: inline-flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.meeting-flow {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.meeting-flow__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.meeting-flow__field span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}

.meeting-flow__field select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.1) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
}

.meeting-flow__step {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.meeting-flow__step h4 {
  margin: calc(var(--space-xs) * 0.6) 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.meeting-flow__step p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  line-height: 1.4;
}

.meeting-flow__step small {
  color: var(--color-text-secondary);
  font-size: 0.72rem;
  font-weight: 600;
}

.meeting-flow__snapshot {
  margin-top: var(--space-md);
  border-top: 1px solid var(--color-border-default);
  padding-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.meeting-flow__snapshot h5 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.meeting-flow__snapshot p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.meeting-flow__meta {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.meeting-flow__attendance {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
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

.meeting-form__field select {
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
.meeting-flow__field select:focus {
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

.attendees-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.attendees-modal__summary {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.attendees-list {
  max-height: 48vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-right: var(--space-xs);
}

.attendees-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  background: var(--color-bg-panel);
}

.attendees-list__item p {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.86rem;
  font-weight: 560;
}

.attendees-list__item small {
  display: block;
  margin-top: calc(var(--space-xs) * 0.6);
  color: var(--color-text-secondary);
  font-size: 0.74rem;
}

.attendees-list__toggle {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--space-sm) * 0.8);
}

.attendees-list__toggle small {
  color: var(--color-text-secondary);
  font-size: 0.72rem;
}

.minutes-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

@media (max-width: 1100px) {
  .calendar-view__header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 880px) {
  .meeting-list__item,
  .meeting-flow__step {
    flex-direction: column;
    align-items: stretch;
  }

  .meeting-list__actions {
    flex-direction: row;
  }

  .calendar-card__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

