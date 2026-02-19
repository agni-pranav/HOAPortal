<script setup>
import { computed, ref } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseToggle from '../components/ui/BaseToggle.vue'
import { normalizeMeeting } from '../mock/mockMeetingsData'
import { useTenantStore } from '../state/tenantStore'
import { usePermission } from '../composables/usePermission'

const { currentCommunityData, currentUser } = useTenantStore()
const { canPerform, canView, isAdmin, isBoard } = usePermission()

const communityData = computed(() => currentCommunityData.value)
const meetings = computed(() => communityData.value?.meetings || [])
const committees = computed(() => communityData.value?.committees || [])
const users = computed(() => communityData.value?.users || [])
const events = computed(() => communityData.value?.events || [])
const metadata = computed(() => communityData.value?.metadata || {})
const meetingTypes = computed(() => metadata.value?.meetingTypes || [])
const eventTypes = computed(() => metadata.value?.eventTypes || [])

const calendarMonth = ref({ year: 2026, month: 1 })

const isMeetingModalOpen = ref(false)
const isAttendeesModalOpen = ref(false)
const isMinutesModalOpen = ref(false)
const isEventModalOpen = ref(false)
const isEventDeleteModalOpen = ref(false)

const meetingForm = ref({})
const eventForm = ref({})
const attendeesDraftByUserId = ref({})
const minutesDraft = ref('')

const meetingMode = ref('create')
const editingMeetingId = ref('')
const eventMode = ref('create')
const editingEventId = ref('')
const eventPendingDelete = ref(null)
const selectedMeetingId = ref('')

const sortedMeetings = computed(() =>
  [...meetings.value].sort(
    (firstMeeting, secondMeeting) =>
      new Date(firstMeeting.scheduledAt) - new Date(secondMeeting.scheduledAt)
  )
)

const visibleMeetings = computed(() => sortedMeetings.value.filter((meeting) => isMeetingVisible(meeting)))

const upcomingMeetings = computed(() => visibleMeetings.value.slice(0, 5))

const canCreateCalendar = computed(() => canPerform('calendar', 'create'))
const canEditCalendar = computed(() => canPerform('calendar', 'edit'))
const canDeleteCalendar = computed(() => canPerform('calendar', 'delete'))
const canCreateMeeting = computed(() => canPerform('meetings', 'create'))
const canEditMeeting = computed(() => canPerform('meetings', 'edit'))

const calendarDays = computed(() => buildCalendarDays(calendarMonth.value.year, calendarMonth.value.month))

const attendeesRows = computed(() =>
  users.value.map((user) => ({
    ...user,
    attendanceStatus: attendeesDraftByUserId.value[user.id] || 'absent'
  }))
)

const meetingTypeById = computed(() => {
  const mapped = {}
  meetingTypes.value.forEach((meetingType) => {
    if (meetingType?.id) {
      mapped[meetingType.id] = meetingType
    }
  })
  return mapped
})

const meetingById = computed(() => {
  const mapped = {}
  meetings.value.forEach((meeting) => {
    if (meeting?.id) {
      mapped[meeting.id] = meeting
    }
  })
  return mapped
})

const eventTypeById = computed(() => {
  const mapped = {}
  eventTypes.value.forEach((eventType) => {
    if (eventType?.id) {
      mapped[eventType.id] = eventType
    }
  })
  return mapped
})

const eventById = computed(() => {
  const mapped = {}
  events.value.forEach((event) => {
    if (event?.id) {
      mapped[event.id] = event
    }
  })
  return mapped
})

const meetingTypeOptions = computed(() =>
  meetingTypes.value
    .filter((meetingType) => meetingType?.active !== false)
    .map((meetingType) => ({
      id: meetingType.id,
      name: meetingType.name || 'Meeting Type',
      category: resolveMeetingTypeCategory(meetingType),
      allowedModes: Array.isArray(meetingType.allowedModes)
        ? meetingType.allowedModes
        : ['onsite', 'virtual', 'hybrid'],
      defaultMode: meetingType.defaultMode
    }))
)

const eventTypeOptions = computed(() =>
  eventTypes.value.filter((eventType) => eventType?.active !== false)
)

const eventModeOptions = ['onsite', 'virtual', 'hybrid']

const eventTypeOptionsForForm = computed(() => {
  const activeTypes = eventTypeOptions.value
  const selectedId = eventForm.value.eventTypeId
  if (selectedId && !activeTypes.find((eventType) => eventType.id === selectedId)) {
    const inactiveType = eventTypes.value.find((eventType) => eventType.id === selectedId)
    return inactiveType ? [inactiveType, ...activeTypes] : activeTypes
  }
  return activeTypes
})

const selectedEventType = computed(
  () =>
    eventTypeById.value[eventForm.value.eventTypeId] ||
    eventTypeOptionsForForm.value[0] ||
    null
)

const selectedMeetingType = computed(() =>
  meetingTypeById.value[meetingForm.value.meetingTypeId] ||
  meetingTypes.value.find((meetingType) => meetingType?.active !== false) ||
  null
)

const meetingModeOptionsForForm = computed(() => {
  if (Array.isArray(selectedMeetingType.value?.allowedModes) && selectedMeetingType.value.allowedModes.length) {
    return selectedMeetingType.value.allowedModes
  }
  return ['onsite', 'virtual', 'hybrid']
})

const selectedMeeting = computed(
  () => meetings.value.find((meeting) => meeting.id === selectedMeetingId.value) || null
)

const selectedAttendanceSummary = computed(() =>
  getAttendanceSummary(selectedMeeting.value?.attendees || [])
)

const meetingModalTitle = computed(() =>
  meetingMode.value === 'edit' ? 'Edit Meeting' : 'Schedule Meeting'
)

if (!meetingForm.value || Object.keys(meetingForm.value).length === 0) {
  meetingForm.value = createBlankMeetingForm()
}

if (!eventForm.value || Object.keys(eventForm.value).length === 0) {
  eventForm.value = createBlankEventForm()
}

const canSaveMeeting = computed(() => {
  const hasTitle = meetingForm.value.title.trim().length > 0
  const hasDate = Boolean(toIsoDateTime(meetingForm.value.scheduledAtLocal))
  const hasMeetingType =
    Boolean(meetingForm.value.meetingTypeId) || meetingTypeOptions.value.length === 0
  const hasCommittee = meetingForm.value.type === 'board' || Boolean(meetingForm.value.committeeId)

  return hasTitle && hasDate && hasMeetingType && hasCommittee
})

function createBlankMeetingForm() {
  const defaultMeetingType = meetingTypeOptions.value[0] || null
  const defaultCategory = defaultMeetingType
    ? resolveMeetingTypeCategory(defaultMeetingType)
    : 'board'
  const defaultMode =
    defaultMeetingType?.defaultMode ||
    (Array.isArray(defaultMeetingType?.allowedModes) ? defaultMeetingType.allowedModes[0] : 'onsite')

  return {
    title: '',
    meetingTypeId: defaultMeetingType?.id || '',
    type: defaultCategory,
    committeeId: '',
    scheduledAtLocal: '',
    location: '',
    mode: defaultMode,
    visibility: 'board'
  }
}

function createBlankEventForm() {
  const defaultEventType = eventTypeOptions.value[0] || null
  const nowIso = new Date().toISOString()

  return {
    title: '',
    description: '',
    startDateLocal: toDateTimeLocal(nowIso),
    endDateLocal: '',
    eventTypeId: defaultEventType?.id || '',
    mode: eventModeOptions[0]
  }
}

function createMeetingId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `meeting-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

function createEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `event-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

function updateMeetingById(meetingId, updater) {
  if (!communityData.value) {
    return
  }

  communityData.value.meetings = communityData.value.meetings.map((meeting) =>
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

function getEventStartDate(event) {
  return event?.startDate || event?.scheduledAt || ''
}

function getEventEndDate(event) {
  return event?.endDate || event?.startDate || event?.scheduledAt || ''
}

function isEventOnDate(event, date) {
  const startValue = getEventStartDate(event)
  if (!startValue) {
    return false
  }

  const start = new Date(startValue)
  const end = new Date(getEventEndDate(event) || startValue)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return false
  }

  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())

  return dayStart >= startDay && dayStart <= endDay
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

function isMeetingVisible(meeting) {
  if (!meeting) {
    return false
  }

  const meetingCategory = resolveMeetingCategory(meeting)
  const committeeId = meetingCategory === 'committee' ? meeting.committeeId : ''
  if (!canView('meetings', { committeeId })) {
    return false
  }

  if (!isAdmin.value && !isBoard.value && meeting.visibility === 'board') {
    return false
  }

  return true
}

function getCalendarItemsForDate(date) {
  const meetingItems = visibleMeetings.value
    .filter((meeting) => isSameDay(new Date(meeting.scheduledAt), date))
    .map((meeting) => ({
      id: meeting.id,
      kind: 'meeting',
      label: resolveMeetingTypeLabel(meeting),
      title: meeting.title,
      variant: resolveMeetingLifecycleVariant(resolveMeetingLifecycleStatus(meeting.scheduledAt))
    }))

  const eventItems = events.value
    .filter((event) => isEventOnDate(event, date))
    .map((event) => ({
      id: event.id,
      kind: 'event',
      eventId: event.id,
      label: resolveEventLabel(event),
      title: event.title,
      variant: resolveEventVariant(event)
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

function resolveMeetingTypeCategory(meetingType) {
  if (!meetingType) {
    return 'board'
  }

  if (meetingType.category === 'committee') {
    return 'committee'
  }

  if (meetingType.category === 'board') {
    return 'board'
  }

  const name = typeof meetingType.name === 'string' ? meetingType.name.toLowerCase() : ''
  return name.includes('committee') ? 'committee' : 'board'
}

function formatMeetingMode(mode) {
  if (mode === 'virtual') {
    return 'Virtual'
  }
  if (mode === 'hybrid') {
    return 'Hybrid'
  }
  return 'On-site'
}

function resolveMeetingTypeForMeeting(meeting) {
  if (!meeting) {
    return null
  }

  if (meeting.meetingTypeId && meetingTypeById.value[meeting.meetingTypeId]) {
    return meetingTypeById.value[meeting.meetingTypeId]
  }

  const fallbackCategory = meeting.type === 'committee' ? 'committee' : 'board'
  return meetingTypes.value.find((type) => resolveMeetingTypeCategory(type) === fallbackCategory) || meetingTypes.value[0] || null
}

function resolveMeetingCategory(meeting) {
  if (!meeting) {
    return 'board'
  }

  const meetingType = resolveMeetingTypeForMeeting(meeting)
  if (meetingType) {
    return resolveMeetingTypeCategory(meetingType)
  }

  return meeting.type === 'committee' ? 'committee' : 'board'
}

function resolveMeetingTypeLabel(meeting) {
  const meetingType = resolveMeetingTypeForMeeting(meeting)
  if (meetingType?.name) {
    return meetingType.name
  }

  return resolveMeetingCategory(meeting) === 'committee' ? 'Committee' : 'Board'
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
  if (resolveMeetingCategory(meeting) === 'board') {
    return 'Board-wide'
  }

  if (!meeting?.committeeId) {
    return 'Unassigned'
  }

  return committees.value.find((committee) => committee.id === meeting.committeeId)?.name || 'Unknown'
}

function resolveEventTypeForEvent(event) {
  if (!event) {
    return null
  }

  if (event.eventTypeId && eventTypeById.value[event.eventTypeId]) {
    return eventTypeById.value[event.eventTypeId]
  }

  const fallbackByName = eventTypes.value.find(
    (eventType) => eventType.name === event.label
  )

  return fallbackByName || eventTypes.value[0] || null
}

function resolveEventLabel(event) {
  const eventType = resolveEventTypeForEvent(event)
  return eventType?.name || 'Event'
}

function resolveEventVariant(event) {
  const eventType = resolveEventTypeForEvent(event)
  const colorValue =
    typeof eventType?.color === 'string'
      ? eventType.color.toLowerCase()
      : typeof eventType?.colorTag === 'string'
        ? eventType.colorTag.toLowerCase()
        : ''

  if (colorValue.includes('emerald') || colorValue.includes('teal')) {
    return 'success'
  }

  if (colorValue.includes('indigo')) {
    return 'info'
  }

  if (colorValue.includes('amber')) {
    return 'warning'
  }

  if (colorValue.includes('slate')) {
    return 'neutral'
  }

  return 'warning'
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

function handleMeetingTypeChange(nextMeetingTypeId) {
  const selectedType = meetingTypeById.value[nextMeetingTypeId] || meetingTypeOptions.value[0] || null
  const category = resolveMeetingTypeCategory(selectedType)
  const allowedModes = Array.isArray(selectedType?.allowedModes) && selectedType.allowedModes.length
    ? selectedType.allowedModes
    : ['onsite', 'virtual', 'hybrid']
  const defaultMode = selectedType?.defaultMode && allowedModes.includes(selectedType.defaultMode)
    ? selectedType.defaultMode
    : allowedModes[0]

  meetingForm.value.meetingTypeId = selectedType?.id || ''
  meetingForm.value.type = category
  meetingForm.value.mode = defaultMode

  if (category === 'board') {
    meetingForm.value.committeeId = ''
  }
}

function openCreateMeetingModal() {
  if (!canCreateMeeting.value) {
    return
  }

  meetingMode.value = 'create'
  editingMeetingId.value = ''
  meetingForm.value = createBlankMeetingForm()
  if (!meetingForm.value.meetingTypeId && meetingTypeOptions.value.length > 0) {
    handleMeetingTypeChange(meetingTypeOptions.value[0].id)
  }
  isMeetingModalOpen.value = true
}

function openEditMeetingModal(meeting) {
  if (!canEditMeeting.value || !meeting) {
    return
  }

  const meetingType = resolveMeetingTypeForMeeting(meeting)
  const meetingTypeId = meeting.meetingTypeId || meetingType?.id || ''
  const category = resolveMeetingTypeCategory(meetingType)
  const allowedModes = Array.isArray(meetingType?.allowedModes) && meetingType.allowedModes.length
    ? meetingType.allowedModes
    : ['onsite', 'virtual', 'hybrid']

  let nextMode = meeting.mode || (meeting.isVirtual ? 'virtual' : allowedModes[0])
  if (!allowedModes.includes(nextMode)) {
    nextMode = allowedModes[0]
  }

  meetingMode.value = 'edit'
  editingMeetingId.value = meeting.id
  meetingForm.value = {
    title: meeting.title || '',
    meetingTypeId,
    type: category,
    committeeId: category === 'committee' ? meeting.committeeId || '' : '',
    scheduledAtLocal: toDateTimeLocal(meeting.scheduledAt),
    location: meeting.location || '',
    mode: nextMode,
    visibility: meeting.visibility || 'board'
  }
  isMeetingModalOpen.value = true
}

function closeMeetingModal() {
  isMeetingModalOpen.value = false
  meetingMode.value = 'create'
  editingMeetingId.value = ''
}

function saveMeeting() {
  if (meetingMode.value === 'edit' && !canEditMeeting.value) {
    return
  }

  if (meetingMode.value !== 'edit' && !canCreateMeeting.value) {
    return
  }

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
    meetingTypeId: meetingForm.value.meetingTypeId,
    committeeId: meetingForm.value.type === 'committee' ? meetingForm.value.committeeId : null,
    scheduledAt: scheduledAtIso,
    location: meetingForm.value.location.trim(),
    mode: meetingForm.value.mode,
    isVirtual: meetingForm.value.mode !== 'onsite',
    visibility: meetingForm.value.visibility,
    updatedAt: nowIso
  }

  if (!communityData.value) {
    return
  }

  if (meetingMode.value === 'edit' && editingMeetingId.value) {
    updateMeetingById(editingMeetingId.value, (meeting) => ({
      ...meeting,
      ...payload
    }))
    selectedMeetingId.value = editingMeetingId.value
  } else {
    const nextMeeting = normalizeMeeting({
      id: createMeetingId(),
      attendees: [],
      minutes: '',
      decisions: [],
      createdAt: nowIso,
      ...payload
    })
    communityData.value.meetings = [nextMeeting, ...communityData.value.meetings]
    selectedMeetingId.value = nextMeeting.id
  }

  closeMeetingModal()
}

function openCreateEventModal() {
  if (!canCreateCalendar.value) {
    return
  }

  eventMode.value = 'create'
  editingEventId.value = ''
  eventForm.value = createBlankEventForm()
  isEventModalOpen.value = true
}

function openEditEventModal(event) {
  if (!canEditCalendar.value || !event) {
    return
  }

  eventMode.value = 'edit'
  editingEventId.value = event.id
  eventForm.value = {
    title: event.title || '',
    description: event.description || '',
    startDateLocal: toDateTimeLocal(getEventStartDate(event)),
    endDateLocal: event.endDate ? toDateTimeLocal(event.endDate) : '',
    eventTypeId: event.eventTypeId || eventTypeOptionsForForm.value[0]?.id || '',
    mode: event.mode || eventModeOptions[0]
  }
  isEventModalOpen.value = true
}

function closeEventModal() {
  isEventModalOpen.value = false
}

function saveEvent() {
  if (eventMode.value === 'edit' && !canEditCalendar.value) {
    return
  }

  if (eventMode.value !== 'edit' && !canCreateCalendar.value) {
    return
  }

  if (!eventForm.value.title.trim()) {
    return
  }

  const startDateIso = toIsoDateTime(eventForm.value.startDateLocal)
  if (!startDateIso) {
    return
  }

  const endDateIso = eventForm.value.endDateLocal ? toIsoDateTime(eventForm.value.endDateLocal) : ''
  const now = new Date().toISOString().slice(0, 10)

  const payload = {
    title: eventForm.value.title.trim(),
    description: eventForm.value.description.trim(),
    startDate: startDateIso,
    endDate: endDateIso || '',
    eventTypeId: eventForm.value.eventTypeId,
    mode: eventForm.value.mode
  }

  if (!communityData.value) {
    return
  }

  if (eventMode.value === 'edit') {
    communityData.value.events = communityData.value.events.map((event) =>
      event.id === editingEventId.value
        ? {
            ...event,
            ...payload
          }
        : event
    )
  } else {
    communityData.value.events = [
      {
        id: createEventId(),
        createdBy: currentUser.value?.name || 'Community Admin',
        createdAt: now,
        ...payload
      },
      ...communityData.value.events
    ]
  }

  closeEventModal()
  eventForm.value = createBlankEventForm()
}

function promptDeleteEvent() {
  if (!canDeleteCalendar.value || !communityData.value) {
    return
  }

  eventPendingDelete.value = communityData.value.events.find((event) => event.id === editingEventId.value) || null
  if (!eventPendingDelete.value) {
    return
  }

  isEventDeleteModalOpen.value = true
}

function deleteEvent() {
  if (!canDeleteCalendar.value || !communityData.value || !eventPendingDelete.value) {
    return
  }

  communityData.value.events = communityData.value.events.filter(
    (event) => event.id !== eventPendingDelete.value.id
  )
  eventPendingDelete.value = null
  isEventDeleteModalOpen.value = false
  closeEventModal()
}

function openAttendeesModalForMeeting(meeting) {
  if (!canEditMeeting.value) {
    return
  }

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
  if (!canEditMeeting.value) {
    return
  }

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
  if (!canEditMeeting.value) {
    return
  }

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
  if (!canEditMeeting.value) {
    return
  }

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

function handleCalendarItemClick(item) {
  if (!item) {
    return
  }

  if (item.kind === 'event') {
    openEditEventModal(eventById.value[item.eventId])
    return
  }

  if (item.kind === 'meeting') {
    openEditMeetingModal(meetingById.value[item.id])
  }
}
</script>

<template>
  <section class="calendar-view">
    <header class="calendar-view__header">
      <div>
        <h1>Calendar</h1>
        <p>Coordinate board meetings, committee sessions, and HOA events in one place.</p>
      </div>
      <div v-if="canCreateCalendar || canCreateMeeting" class="calendar-view__header-actions">
        <BaseButton v-if="canCreateCalendar" size="sm" variant="secondary" @click="openCreateEventModal">
          + Create Event
        </BaseButton>
        <BaseButton v-if="canCreateMeeting" size="sm" @click="openCreateMeetingModal">
          + Create Meeting
        </BaseButton>
      </div>
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
            <BaseBadge
              v-for="eventType in eventTypeOptions"
              :key="eventType.id"
              :variant="resolveEventVariant({ eventTypeId: eventType.id })"
            >
              {{ eventType.name }}
            </BaseBadge>
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
                :class="{
                  'is-readonly':
                    (item.kind === 'event' && !canEditCalendar) ||
                    (item.kind === 'meeting' && !canEditMeeting)
                }"
                tabindex="0"
                @click="handleCalendarItemClick(item)"
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
              <BaseButton
                size="sm"
                variant="secondary"
                :disabled="!canEditCalendar"
                @click="openAttendeesModalForMeeting(meeting)"
              >
                Attendees
              </BaseButton>
              <BaseButton
                size="sm"
                variant="ghost"
                :disabled="!canEditCalendar"
                @click="openMinutesModalForMeeting(meeting)"
              >
                Minutes
              </BaseButton>
            </div>
          </article>
        </div>
      </BaseCard>
    </div>

    <BaseModal
      v-model="isMeetingModalOpen"
      :title="meetingModalTitle"
      description="Add a meeting to the HOA calendar."
    >
      <div class="meeting-form">
        <BaseInput v-model="meetingForm.title" label="Title" placeholder="Enter meeting title" />

        <label class="meeting-form__field">
          <span>Meeting Type</span>
          <select :value="meetingForm.meetingTypeId" @change="handleMeetingTypeChange($event.target.value)">
            <option v-for="meetingType in meetingTypeOptions" :key="meetingType.id" :value="meetingType.id">
              {{ meetingType.name }}
            </option>
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

        <label class="meeting-form__field">
          <span>Mode</span>
          <select v-model="meetingForm.mode">
            <option v-for="mode in meetingModeOptionsForForm" :key="mode" :value="mode">
              {{ formatMeetingMode(mode) }}
            </option>
          </select>
        </label>

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
      v-model="isEventModalOpen"
      :title="eventMode === 'edit' ? 'Edit Event' : 'Create Event'"
      description="Create or update a calendar event."
    >
      <div class="event-form">
        <BaseInput v-model="eventForm.title" label="Title" placeholder="Enter event title" />
        <BaseInput
          v-model="eventForm.description"
          label="Description"
          type="textarea"
          :rows="3"
          placeholder="Describe the event"
        />
        <label class="event-form__field">
          <span>Event Type</span>
          <select v-model="eventForm.eventTypeId">
            <option v-for="eventType in eventTypeOptionsForForm" :key="eventType.id" :value="eventType.id">
              {{ eventType.name }}
            </option>
          </select>
        </label>
        <label class="event-form__field">
          <span>Mode</span>
          <select v-model="eventForm.mode">
            <option v-for="mode in eventModeOptions" :key="mode" :value="mode">
              {{ formatMeetingMode(mode) }}
            </option>
          </select>
        </label>
        <BaseInput v-model="eventForm.startDateLocal" type="datetime-local" label="Start Date & Time" />
        <BaseInput v-model="eventForm.endDateLocal" type="datetime-local" label="End Date & Time" />
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeEventModal">Cancel</BaseButton>
        <BaseButton
          v-if="eventMode === 'edit' && canDeleteCalendar"
          variant="danger"
          @click="promptDeleteEvent"
        >
          Delete
        </BaseButton>
        <BaseButton
          :disabled="!eventForm.title || !eventForm.startDateLocal || !eventForm.eventTypeId"
          @click="saveEvent"
        >
          Save
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isEventDeleteModalOpen"
      title="Delete Event"
      description="Are you sure you want to delete this event?"
    >
      <template #footer>
        <BaseButton variant="ghost" @click="isEventDeleteModalOpen = false">Cancel</BaseButton>
        <BaseButton variant="danger" @click="deleteEvent">Delete</BaseButton>
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

.calendar-view__header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: nowrap;
  margin-top: var(--space-xs);
}

.calendar-view__header-actions .button {
  padding: calc(var(--space-sm) * 0.7) calc(var(--space-md) * 0.85);
  font-size: 0.76rem;
  white-space: nowrap;
}

.calendar-view__header h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.42rem;
  font-weight: 620;
}

.calendar-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
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

.calendar-card__event.is-readonly {
  cursor: default;
}

.calendar-card__event.is-readonly:hover {
  border-color: var(--color-border-default);
  box-shadow: none;
  transform: none;
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

.event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.meeting-form__field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.7);
}

.event-form__field {
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

.event-form__field span {
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

.event-form__field select {
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

.event-form__field select:focus {
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
