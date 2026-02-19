<script setup>
import { computed, ref } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseTable from '../components/ui/BaseTable.vue'
import BaseToggle from '../components/ui/BaseToggle.vue'
import { useTenantStore } from '../state/tenantStore'
import { usePermission } from '../composables/usePermission'

const { currentCommunityData } = useTenantStore()
const { isAdmin } = usePermission()

const communityData = computed(() => currentCommunityData.value)
const metadata = computed(() => communityData.value?.metadata || {})

const activeTab = ref('committees')

const tabs = [
  { key: 'committees', label: 'Committees' },
  { key: 'meeting-types', label: 'Meeting Types' },
  { key: 'event-types', label: 'Event Types' },
  { key: 'board-titles', label: 'Board Titles' },
  { key: 'dashboard-config', label: 'Dashboard Configuration' },
  { key: 'audit-log', label: 'Audit Log' }
]

const committeeRows = computed(() => metadata.value?.committees || [])
const meetingTypeRows = computed(() => metadata.value?.meetingTypes || [])
const eventTypeRows = computed(() =>
  (metadata.value?.eventTypes || []).map((eventType) => ({
    ...eventType,
    color: eventType.color || eventType.colorTag || eventColorOptions[0]
  }))
)
const boardTitleRows = computed(() => metadata.value?.boardTitles || [])
const auditLogRows = computed(() => metadata.value?.auditLog || [])

const dashboardWidgets = computed(() => metadata.value?.dashboardConfig?.widgets || [])
const newsletterCount = computed(() => metadata.value?.dashboardConfig?.newsletterCount || 3)

const isCommitteeModalOpen = ref(false)
const isMeetingTypeModalOpen = ref(false)
const isEventTypeModalOpen = ref(false)
const isBoardTitleModalOpen = ref(false)

const committeeMode = ref('create')
const meetingTypeMode = ref('create')
const eventTypeMode = ref('create')
const boardTitleMode = ref('create')

const editingCommitteeId = ref('')
const editingMeetingTypeId = ref('')
const editingEventTypeId = ref('')
const editingBoardTitleId = ref('')

const meetingModeOptions = ['onsite', 'virtual', 'hybrid']
const meetingCategoryOptions = ['board', 'committee', 'custom']
const baseRoleOptions = ['Board', 'Member']
const eventColorOptions = ['Teal', 'Indigo', 'Slate', 'Emerald', 'Amber']

const committeeForm = ref(createCommitteeForm())
const meetingTypeForm = ref(createMeetingTypeForm())
const eventTypeForm = ref(createEventTypeForm())
const boardTitleForm = ref(createBoardTitleForm())
const dragWidgetId = ref('')

const committeesColumns = [
  { key: 'name', label: 'Committee Name', width: '20%' },
  { key: 'description', label: 'Description', width: '32%' },
  { key: 'active', label: 'Active', width: '10%' },
  { key: 'createdAt', label: 'Created', width: '12%' },
  { key: 'updatedAt', label: 'Last Modified', width: '12%' },
  { key: 'actions', label: 'Actions', width: '14%' }
]

const meetingTypesColumns = [
  { key: 'name', label: 'Meeting Type', width: '16%' },
  { key: 'category', label: 'Category', width: '10%' },
  { key: 'description', label: 'Description', width: '18%' },
  { key: 'allowedModes', label: 'Allowed Modes', width: '14%' },
  { key: 'defaultMode', label: 'Default Mode', width: '10%' },
  { key: 'enableVoting', label: 'Voting', width: '8%' },
  { key: 'enableMotions', label: 'Motions', width: '8%' },
  { key: 'active', label: 'Active', width: '6%' },
  { key: 'updatedAt', label: 'Last Modified', width: '6%' },
  { key: 'actions', label: 'Actions', width: '4%' }
]

const eventTypesColumns = [
  { key: 'name', label: 'Event Type', width: '20%' },
  { key: 'color', label: 'Color', width: '12%' },
  { key: 'description', label: 'Description', width: '30%' },
  { key: 'active', label: 'Active', width: '10%' },
  { key: 'updatedAt', label: 'Last Modified', width: '12%' },
  { key: 'actions', label: 'Actions', width: '16%' }
]

const boardTitlesColumns = [
  { key: 'name', label: 'Title', width: '30%' },
  { key: 'baseRole', label: 'Maps To', width: '20%' },
  { key: 'updatedAt', label: 'Last Modified', width: '20%' },
  { key: 'actions', label: 'Actions', width: '20%' }
]

const auditLogColumns = [
  { key: 'metadataType', label: 'Metadata Type', width: '22%' },
  { key: 'itemName', label: 'Item Name', width: '28%' },
  { key: 'changeType', label: 'Change Type', width: '18%' },
  { key: 'changedBy', label: 'Changed By', width: '16%' },
  { key: 'date', label: 'Date', width: '16%' }
]

function ensureAdmin() {
  return isAdmin.value
}

function formatMeetingCategory(category) {
  if (category === 'committee') {
    return 'Committee'
  }
  if (category === 'custom') {
    return 'Custom'
  }
  return 'Board'
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

function createCommitteeForm() {
  return {
    name: '',
    description: '',
    active: true
  }
}

function createMeetingTypeForm() {
  return {
    name: '',
    description: '',
    category: meetingCategoryOptions[0],
    allowedModes: [...meetingModeOptions],
    defaultMode: meetingModeOptions[0],
    enableVoting: false,
    enableMotions: false,
    active: true
  }
}

function createEventTypeForm() {
  return {
    name: '',
    color: eventColorOptions[0],
    description: '',
    active: true
  }
}

function createBoardTitleForm() {
  return {
    name: '',
    baseRole: baseRoleOptions[0]
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function appendAuditLog(entry) {
  if (!communityData.value) {
    return
  }

  const nextEntry = {
    id: createId('audit'),
    changedBy: 'Community Admin',
    date: getToday(),
    ...entry
  }

  const currentLog = communityData.value.metadata.auditLog || []
  communityData.value.metadata.auditLog = [nextEntry, ...currentLog]
}

function updateCommunityCommitteesFromMetadata() {
  if (!communityData.value) {
    return
  }

  const metadataCommittees = communityData.value.metadata.committees || []
  communityData.value.committees = communityData.value.committees.map((committee) => {
    const match = metadataCommittees.find((item) => item.id === committee.id)
    if (!match) {
      return committee
    }

    return {
      ...committee,
      name: match.name,
      description: match.description,
      updatedAt: match.updatedAt
    }
  })
}

function openCommitteeModal(modeValue, committee) {
  if (!ensureAdmin()) {
    return
  }

  committeeMode.value = modeValue
  editingCommitteeId.value = committee?.id || ''
  committeeForm.value = committee
    ? { name: committee.name, description: committee.description, active: committee.active }
    : createCommitteeForm()
  isCommitteeModalOpen.value = true
}

function saveCommittee() {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  const payload = {
    name: committeeForm.value.name.trim(),
    description: committeeForm.value.description.trim(),
    active: Boolean(committeeForm.value.active)
  }

  if (!payload.name) {
    return
  }

  const now = getToday()

  if (committeeMode.value === 'edit') {
    communityData.value.metadata.committees = committeeRows.value.map((committee) =>
      committee.id === editingCommitteeId.value
        ? { ...committee, ...payload, updatedAt: now }
        : committee
    )
    appendAuditLog({
      metadataType: 'Committee',
      itemName: payload.name,
      changeType: 'Edited'
    })
  } else {
    communityData.value.metadata.committees = [
      {
        id: createId('committee'),
        createdAt: now,
        updatedAt: now,
        ...payload
      },
      ...committeeRows.value
    ]
    appendAuditLog({
      metadataType: 'Committee',
      itemName: payload.name,
      changeType: 'Created'
    })
  }

  updateCommunityCommitteesFromMetadata()
  isCommitteeModalOpen.value = false
}

function archiveCommittee(committee) {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  communityData.value.metadata.committees = committeeRows.value.map((item) =>
    item.id === committee.id ? { ...item, active: false, updatedAt: getToday() } : item
  )
  appendAuditLog({
    metadataType: 'Committee',
    itemName: committee.name,
    changeType: 'Archived'
  })
  updateCommunityCommitteesFromMetadata()
}

function openMeetingTypeModal(modeValue, meetingType) {
  if (!ensureAdmin()) {
    return
  }

  meetingTypeMode.value = modeValue
  editingMeetingTypeId.value = meetingType?.id || ''
  meetingTypeForm.value = meetingType
    ? {
        name: meetingType.name,
        description: meetingType.description,
        category: meetingType.category || meetingCategoryOptions[0],
        allowedModes: Array.isArray(meetingType.allowedModes) && meetingType.allowedModes.length
          ? [...meetingType.allowedModes]
          : [...meetingModeOptions],
        defaultMode: meetingType.defaultMode || meetingType.allowedModes?.[0] || meetingModeOptions[0],
        enableVoting: meetingType.enableVoting,
        enableMotions: meetingType.enableMotions,
        active: meetingType.active !== false
      }
    : createMeetingTypeForm()
  isMeetingTypeModalOpen.value = true
}

function toggleMeetingMode(modeKey, nextValue) {
  if (!Array.isArray(meetingTypeForm.value.allowedModes)) {
    meetingTypeForm.value.allowedModes = []
  }

  const current = meetingTypeForm.value.allowedModes
  if (nextValue) {
    if (!current.includes(modeKey)) {
      meetingTypeForm.value.allowedModes = [...current, modeKey]
    }
  } else {
    meetingTypeForm.value.allowedModes = current.filter((mode) => mode !== modeKey)
  }

  if (!meetingTypeForm.value.allowedModes.includes(meetingTypeForm.value.defaultMode)) {
    meetingTypeForm.value.defaultMode = meetingTypeForm.value.allowedModes[0] || meetingModeOptions[0]
  }
}

function saveMeetingType() {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  const sanitizedAllowedModes =
    Array.isArray(meetingTypeForm.value.allowedModes) && meetingTypeForm.value.allowedModes.length
      ? meetingTypeForm.value.allowedModes.filter((mode) => meetingModeOptions.includes(mode))
      : [meetingModeOptions[0]]

  const payload = {
    name: meetingTypeForm.value.name.trim(),
    description: meetingTypeForm.value.description.trim(),
    category: meetingTypeForm.value.category,
    allowedModes: sanitizedAllowedModes,
    defaultMode: sanitizedAllowedModes.includes(meetingTypeForm.value.defaultMode)
      ? meetingTypeForm.value.defaultMode
      : sanitizedAllowedModes[0],
    enableVoting: Boolean(meetingTypeForm.value.enableVoting),
    enableMotions: Boolean(meetingTypeForm.value.enableMotions),
    active: Boolean(meetingTypeForm.value.active)
  }

  if (!payload.name) {
    return
  }

  const now = getToday()

  if (meetingTypeMode.value === 'edit') {
    communityData.value.metadata.meetingTypes = meetingTypeRows.value.map((item) =>
      item.id === editingMeetingTypeId.value ? { ...item, ...payload, updatedAt: now } : item
    )
    appendAuditLog({
      metadataType: 'Meeting Type',
      itemName: payload.name,
      changeType: 'Edited'
    })
  } else {
    communityData.value.metadata.meetingTypes = [
      {
        id: createId('meeting-type'),
        createdAt: now,
        updatedAt: now,
        ...payload
      },
      ...meetingTypeRows.value
    ]
    appendAuditLog({
      metadataType: 'Meeting Type',
      itemName: payload.name,
      changeType: 'Created'
    })
  }

  isMeetingTypeModalOpen.value = false
}

function openEventTypeModal(modeValue, eventType) {
  if (!ensureAdmin()) {
    return
  }

  eventTypeMode.value = modeValue
  editingEventTypeId.value = eventType?.id || ''
  eventTypeForm.value = eventType
    ? {
        name: eventType.name,
        description: eventType.description,
        color: eventType.color || eventType.colorTag || eventColorOptions[0],
        active: eventType.active
      }
    : createEventTypeForm()
  isEventTypeModalOpen.value = true
}

function saveEventType() {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  const payload = {
    name: eventTypeForm.value.name.trim(),
    description: eventTypeForm.value.description.trim(),
    color: eventTypeForm.value.color,
    active: Boolean(eventTypeForm.value.active)
  }

  if (!payload.name) {
    return
  }

  const now = getToday()

  if (eventTypeMode.value === 'edit') {
    communityData.value.metadata.eventTypes = eventTypeRows.value.map((item) =>
      item.id === editingEventTypeId.value ? { ...item, ...payload, updatedAt: now } : item
    )
    appendAuditLog({
      metadataType: 'Event Type',
      itemName: payload.name,
      changeType: 'Edited'
    })
  } else {
    communityData.value.metadata.eventTypes = [
      {
        id: createId('event-type'),
        createdAt: now,
        updatedAt: now,
        ...payload
      },
      ...eventTypeRows.value
    ]
    appendAuditLog({
      metadataType: 'Event Type',
      itemName: payload.name,
      changeType: 'Created'
    })
  }

  isEventTypeModalOpen.value = false
}

function openBoardTitleModal(modeValue, title) {
  if (!ensureAdmin()) {
    return
  }

  boardTitleMode.value = modeValue
  editingBoardTitleId.value = title?.id || ''
  boardTitleForm.value = title
    ? { name: title.name, baseRole: title.baseRole }
    : createBoardTitleForm()
  isBoardTitleModalOpen.value = true
}

function saveBoardTitle() {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  const payload = {
    name: boardTitleForm.value.name.trim(),
    baseRole: boardTitleForm.value.baseRole
  }

  if (!payload.name) {
    return
  }

  const now = getToday()

  if (boardTitleMode.value === 'edit') {
    communityData.value.metadata.boardTitles = boardTitleRows.value.map((item) =>
      item.id === editingBoardTitleId.value ? { ...item, ...payload, updatedAt: now } : item
    )
    appendAuditLog({
      metadataType: 'Board Title',
      itemName: payload.name,
      changeType: 'Edited'
    })
  } else {
    communityData.value.metadata.boardTitles = [
      {
        id: createId('board-title'),
        createdAt: now,
        updatedAt: now,
        ...payload
      },
      ...boardTitleRows.value
    ]
    appendAuditLog({
      metadataType: 'Board Title',
      itemName: payload.name,
      changeType: 'Created'
    })
  }

  isBoardTitleModalOpen.value = false
}

function archiveEventType(eventType) {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  communityData.value.metadata.eventTypes = eventTypeRows.value.map((item) =>
    item.id === eventType.id ? { ...item, active: false, updatedAt: getToday() } : item
  )
  appendAuditLog({
    metadataType: 'Event Type',
    itemName: eventType.name,
    changeType: 'Archived'
  })
}

function archiveBoardTitle(title) {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  communityData.value.metadata.boardTitles = boardTitleRows.value.map((item) =>
    item.id === title.id ? { ...item, updatedAt: getToday() } : item
  )
  appendAuditLog({
    metadataType: 'Board Title',
    itemName: title.name,
    changeType: 'Archived'
  })
}

function updateDashboardWidget(widgetId, nextEnabled) {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  const widgets = dashboardWidgets.value.map((widget) =>
    widget.id === widgetId ? { ...widget, enabled: nextEnabled } : widget
  )
  communityData.value.metadata.dashboardConfig.widgets = widgets
  appendAuditLog({
    metadataType: 'Dashboard Widget',
    itemName: widgetId,
    changeType: 'Edited'
  })
}

function moveWidget(widgetId, direction) {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  const widgets = [...dashboardWidgets.value]
  const index = widgets.findIndex((widget) => widget.id === widgetId)
  if (index < 0) {
    return
  }

  const nextIndex = direction === 'up' ? index - 1 : index + 1
  if (nextIndex < 0 || nextIndex >= widgets.length) {
    return
  }

  const [moved] = widgets.splice(index, 1)
  widgets.splice(nextIndex, 0, moved)
  communityData.value.metadata.dashboardConfig.widgets = widgets
  appendAuditLog({
    metadataType: 'Dashboard Widget',
    itemName: moved.name,
    changeType: 'Edited'
  })
}

function handleWidgetDragStart(widgetId) {
  if (!ensureAdmin()) {
    return
  }

  dragWidgetId.value = widgetId
}

function handleWidgetDragOver(event) {
  event.preventDefault()
}

function handleWidgetDrop(targetId) {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  const sourceId = dragWidgetId.value
  if (!sourceId || sourceId === targetId) {
    dragWidgetId.value = ''
    return
  }

  const widgets = [...dashboardWidgets.value]
  const sourceIndex = widgets.findIndex((widget) => widget.id === sourceId)
  const targetIndex = widgets.findIndex((widget) => widget.id === targetId)

  if (sourceIndex < 0 || targetIndex < 0) {
    dragWidgetId.value = ''
    return
  }

  const [moved] = widgets.splice(sourceIndex, 1)
  widgets.splice(targetIndex, 0, moved)
  communityData.value.metadata.dashboardConfig.widgets = widgets
  appendAuditLog({
    metadataType: 'Dashboard Widget',
    itemName: moved.name,
    changeType: 'Edited'
  })

  dragWidgetId.value = ''
}

function handleWidgetDragEnd() {
  dragWidgetId.value = ''
}

function updateNewsletterCount(nextCount) {
  if (!ensureAdmin() || !communityData.value) {
    return
  }

  const countValue = Number(nextCount)
  if (Number.isNaN(countValue)) {
    return
  }

  communityData.value.metadata.dashboardConfig.newsletterCount = Math.max(1, countValue)
  appendAuditLog({
    metadataType: 'Dashboard Configuration',
    itemName: 'Newsletter Count',
    changeType: 'Edited'
  })
}
</script>

<template>
  <section class="metadata-view">
    <header class="metadata-view__header">
      <div>
        <h1>Metadata Setup</h1>
        <p>Configure governance metadata for this community.</p>
      </div>
      <BaseBadge variant="info">Admin Only</BaseBadge>
    </header>

    <div class="metadata-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="metadata-tabs__item"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <BaseCard v-if="activeTab === 'committees'">
      <header class="metadata-card__header">
        <div>
          <h3>Committees</h3>
          <p>Manage committee metadata and lifecycle status.</p>
        </div>
        <BaseButton size="sm" @click="openCommitteeModal('create')">+ Create Committee</BaseButton>
      </header>

      <BaseTable :columns="committeesColumns" :rows="committeeRows" style="--table-min-width: 980px;">
        <template #cell-active="{ value }">
          <BaseBadge :variant="value ? 'success' : 'neutral'">
            {{ value ? 'Active' : 'Archived' }}
          </BaseBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="metadata-actions">
            <BaseButton size="sm" variant="secondary" @click="openCommitteeModal('edit', row)">
              Edit
            </BaseButton>
            <BaseButton size="sm" variant="ghost" @click="archiveCommittee(row)">
              Archive
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseCard v-else-if="activeTab === 'meeting-types'">
      <header class="metadata-card__header">
        <div>
          <h3>Meeting Types</h3>
          <p>Configure meeting modes and voting/motion controls.</p>
        </div>
        <BaseButton size="sm" @click="openMeetingTypeModal('create')">+ Add Meeting Type</BaseButton>
      </header>

      <BaseTable :columns="meetingTypesColumns" :rows="meetingTypeRows" style="--table-min-width: 1280px;">
        <template #cell-category="{ value }">
          <span>{{ formatMeetingCategory(value) }}</span>
        </template>
        <template #cell-allowedModes="{ value }">
          <span>{{ (value || []).map(formatMeetingMode).join(', ') }}</span>
        </template>
        <template #cell-defaultMode="{ value }">
          <span>{{ formatMeetingMode(value) }}</span>
        </template>
        <template #cell-enableVoting="{ value }">
          <BaseBadge :variant="value ? 'success' : 'neutral'">{{ value ? 'Enabled' : 'Disabled' }}</BaseBadge>
        </template>
        <template #cell-enableMotions="{ value }">
          <BaseBadge :variant="value ? 'success' : 'neutral'">{{ value ? 'Enabled' : 'Disabled' }}</BaseBadge>
        </template>
        <template #cell-active="{ value }">
          <BaseBadge :variant="value ? 'success' : 'neutral'">{{ value ? 'Active' : 'Inactive' }}</BaseBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="metadata-actions">
            <BaseButton size="sm" variant="secondary" @click="openMeetingTypeModal('edit', row)">
              Edit
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseCard v-else-if="activeTab === 'event-types'">
      <header class="metadata-card__header">
        <div>
          <h3>Event Types</h3>
          <p>Define event categories and calendar tags.</p>
        </div>
        <BaseButton size="sm" @click="openEventTypeModal('create')">+ Add Event Type</BaseButton>
      </header>

      <BaseTable :columns="eventTypesColumns" :rows="eventTypeRows" style="--table-min-width: 1040px;">
        <template #cell-active="{ value }">
          <BaseBadge :variant="value ? 'success' : 'neutral'">{{ value ? 'Active' : 'Inactive' }}</BaseBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="metadata-actions">
            <BaseButton size="sm" variant="secondary" @click="openEventTypeModal('edit', row)">
              Edit
            </BaseButton>
            <BaseButton size="sm" variant="ghost" @click="archiveEventType(row)">
              Archive
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseCard v-else-if="activeTab === 'board-titles'">
      <header class="metadata-card__header">
        <div>
          <h3>Board Titles</h3>
          <p>Titles are labels mapped to base roles.</p>
        </div>
        <BaseButton size="sm" @click="openBoardTitleModal('create')">+ Add Title</BaseButton>
      </header>

      <BaseTable :columns="boardTitlesColumns" :rows="boardTitleRows" style="--table-min-width: 820px;">
        <template #cell-actions="{ row }">
          <div class="metadata-actions">
            <BaseButton size="sm" variant="secondary" @click="openBoardTitleModal('edit', row)">
              Edit
            </BaseButton>
            <BaseButton size="sm" variant="ghost" @click="archiveBoardTitle(row)">
              Archive
            </BaseButton>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseCard v-else-if="activeTab === 'dashboard-config'">
      <header class="metadata-card__header">
        <div>
          <h3>Dashboard Configuration</h3>
          <p>Enable widgets and control display order.</p>
        </div>
      </header>

      <div class="dashboard-config">
        <div class="dashboard-config__list">
          <div
            v-for="(widget, index) in dashboardWidgets"
            :key="widget.id"
            class="dashboard-config__item"
            :class="{ 'is-dragging': widget.id === dragWidgetId }"
            draggable="true"
            @dragstart="handleWidgetDragStart(widget.id)"
            @dragover="handleWidgetDragOver"
            @drop="handleWidgetDrop(widget.id)"
            @dragend="handleWidgetDragEnd"
          >
            <div>
              <h4>{{ widget.name }}</h4>
              <p>Widget ID: {{ widget.id }}</p>
            </div>
            <div class="dashboard-config__controls">
              <BaseToggle
                :model-value="widget.enabled"
                @update:model-value="updateDashboardWidget(widget.id, $event)"
              />
              <div class="dashboard-config__order">
                <BaseButton size="sm" variant="ghost" :disabled="index === 0" @click="moveWidget(widget.id, 'up')">
                  Up
                </BaseButton>
                <BaseButton
                  size="sm"
                  variant="ghost"
                  :disabled="index === dashboardWidgets.length - 1"
                  @click="moveWidget(widget.id, 'down')"
                >
                  Down
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <label class="dashboard-config__field">
          <span>Number of newsletters displayed</span>
          <input
            type="number"
            min="1"
            :value="newsletterCount"
            @input="updateNewsletterCount($event.target.value)"
          />
        </label>
      </div>
    </BaseCard>

    <BaseCard v-else>
      <header class="metadata-card__header">
        <div>
          <h3>Audit Log</h3>
          <p>Recent metadata changes for governance review.</p>
        </div>
      </header>

      <BaseTable :columns="auditLogColumns" :rows="auditLogRows" style="--table-min-width: 1040px;" />
    </BaseCard>

    <BaseModal
      v-model="isCommitteeModalOpen"
      title="Committee"
      description="Create or update committee metadata."
    >
      <div class="metadata-form">
        <BaseInput v-model="committeeForm.name" label="Committee Name" placeholder="Enter committee name" />
        <BaseInput
          v-model="committeeForm.description"
          label="Description"
          type="textarea"
          :rows="3"
          placeholder="Describe committee purpose"
        />
        <div class="metadata-form__toggle">
          <span>Active</span>
          <BaseToggle :model-value="committeeForm.active" @update:model-value="committeeForm.active = $event" />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="isCommitteeModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="saveCommittee">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isMeetingTypeModalOpen"
      title="Meeting Type"
      description="Configure meeting types and voting behavior."
    >
      <div class="metadata-form">
        <BaseInput v-model="meetingTypeForm.name" label="Name" placeholder="Enter meeting type" />
        <BaseInput
          v-model="meetingTypeForm.description"
          label="Description"
          type="textarea"
          :rows="3"
          placeholder="Describe meeting type"
        />
        <label class="metadata-form__field">
          <span>Category</span>
          <select v-model="meetingTypeForm.category">
            <option
              v-for="category in meetingCategoryOptions"
              :key="category"
              :value="category"
            >
              {{ formatMeetingCategory(category) }}
            </option>
          </select>
        </label>
        <div class="metadata-form__field">
          <span>Allowed Modes</span>
          <div class="metadata-form__toggles">
            <label v-for="mode in meetingModeOptions" :key="mode" class="metadata-form__toggle">
              <span>{{ formatMeetingMode(mode) }}</span>
              <BaseToggle
                :model-value="meetingTypeForm.allowedModes.includes(mode)"
                @update:model-value="toggleMeetingMode(mode, $event)"
              />
            </label>
          </div>
        </div>
        <label class="metadata-form__field">
          <span>Default Mode</span>
          <select v-model="meetingTypeForm.defaultMode">
            <option
              v-for="mode in meetingTypeForm.allowedModes"
              :key="mode"
              :value="mode"
            >
              {{ formatMeetingMode(mode) }}
            </option>
          </select>
        </label>
        <div class="metadata-form__toggle">
          <span>Enable Voting</span>
          <BaseToggle
            :model-value="meetingTypeForm.enableVoting"
            @update:model-value="meetingTypeForm.enableVoting = $event"
          />
        </div>
        <div class="metadata-form__toggle">
          <span>Enable Motions</span>
          <BaseToggle
            :model-value="meetingTypeForm.enableMotions"
            @update:model-value="meetingTypeForm.enableMotions = $event"
          />
        </div>
        <div class="metadata-form__toggle">
          <span>Active</span>
          <BaseToggle
            :model-value="meetingTypeForm.active"
            @update:model-value="meetingTypeForm.active = $event"
          />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="isMeetingTypeModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="saveMeetingType">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isEventTypeModalOpen"
      title="Event Type"
      description="Create or update calendar event categories."
    >
      <div class="metadata-form">
        <BaseInput v-model="eventTypeForm.name" label="Event Type Name" placeholder="Enter event type name" />
        <BaseInput
          v-model="eventTypeForm.description"
          label="Description"
          type="textarea"
          :rows="3"
          placeholder="Describe event usage"
        />
        <label class="metadata-form__field">
          <span>Color</span>
          <select v-model="eventTypeForm.color">
            <option v-for="color in eventColorOptions" :key="color" :value="color">{{ color }}</option>
          </select>
        </label>
        <div class="metadata-form__toggle">
          <span>Active</span>
          <BaseToggle :model-value="eventTypeForm.active" @update:model-value="eventTypeForm.active = $event" />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="isEventTypeModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="saveEventType">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isBoardTitleModalOpen"
      title="Board Title"
      description="Assign titles without changing permission logic."
    >
      <div class="metadata-form">
        <BaseInput v-model="boardTitleForm.name" label="Title Name" placeholder="Enter board title" />
        <label class="metadata-form__field">
          <span>Maps To Base Role</span>
          <select v-model="boardTitleForm.baseRole">
            <option v-for="baseRole in baseRoleOptions" :key="baseRole" :value="baseRole">{{ baseRole }}</option>
          </select>
        </label>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="isBoardTitleModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="saveBoardTitle">Save</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.metadata-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.metadata-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.metadata-view__header h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.35rem;
  font-weight: 620;
}

.metadata-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.metadata-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.metadata-tabs__item {
  border: 1px solid var(--color-border-default);
  border-radius: 999px;
  background: var(--color-bg-panel);
  color: var(--color-text-secondary);
  padding: calc(var(--space-sm) * 0.9) var(--space-md);
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.metadata-tabs__item.is-active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-text-primary);
}

.metadata-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.metadata-card__header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 620;
}

.metadata-card__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.84rem;
}

.metadata-actions {
  display: inline-flex;
  gap: var(--space-sm);
  align-items: center;
}

.metadata-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.metadata-form__field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.7);
}

.metadata-form__toggles {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.metadata-form__field span,
.metadata-form__toggle span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 550;
}

.metadata-form__field select,
.dashboard-config__field input {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.2) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
  outline: none;
}

.metadata-form__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.dashboard-config {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.dashboard-config__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dashboard-config__item {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.dashboard-config__item.is-dragging {
  opacity: 0.7;
}

.dashboard-config__item h4 {
  margin: 0;
  font-size: 0.92rem;
  color: var(--color-text-primary);
}

.dashboard-config__item p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.dashboard-config__controls {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.dashboard-config__order {
  display: inline-flex;
  gap: var(--space-xs);
}

.dashboard-config__field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.6);
  max-width: 18rem;
}
</style>
