<script setup>
import { computed, ref, watch } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseTable from '../components/ui/BaseTable.vue'
import RowActionMenu from '../components/ui/RowActionMenu.vue'
import { normalizeMotion, motionVoteOptions } from '../mock/motionsData'
import { useTenantStore } from '../state/tenantStore'
import { usePermission } from '../composables/usePermission'

const { currentCommunityData, currentUser } = useTenantStore()
const { canView, canPerform } = usePermission()

const communityData = computed(() => currentCommunityData.value)
const motions = computed(() => communityData.value?.motions || [])
const meetings = computed(() => communityData.value?.meetings || [])
const users = computed(() => communityData.value?.users || [])

const canViewMotions = computed(() => canView('motions'))
const canCreateMotion = computed(() => canPerform('motions', 'create'))
const canEditMotion = computed(() => canPerform('motions', 'edit'))
const canDeleteMotion = computed(() => canPerform('motions', 'delete'))
const canVoteOnMotions = computed(() => canPerform('meetings', 'vote'))

const isMotionModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isVoteModalOpen = ref(false)

const mode = ref('create')
const editingMotionId = ref('')
const motionPendingDelete = ref(null)
const detailMotionId = ref('')
const voteMotionId = ref('')

const motionForm = ref(createBlankMotionForm())
const votesDraftByMemberId = ref({})

const meetingById = computed(() => {
  const mapped = {}
  meetings.value.forEach((meeting) => {
    mapped[meeting.id] = meeting
  })
  return mapped
})

const motionRows = computed(() =>
  motions.value.map((motion) => ({
    ...motion,
    meetingTitle: meetingById.value[motion.meetingId]?.title || 'Unassigned Meeting',
    summary: formatMotionSummary(motion)
  }))
)

const sortedUsers = computed(() =>
  [...users.value].sort((a, b) => a.name.localeCompare(b.name))
)

const motionColumns = [
  { key: 'title', label: 'Motion Title', width: '24%' },
  { key: 'meetingTitle', label: 'Meeting', width: '22%' },
  { key: 'status', label: 'Status', width: '12%' },
  { key: 'summary', label: 'Result Summary', width: '30%' },
  { key: 'actions', label: 'Actions', width: '12%' }
]

const voteColumns = [
  { key: 'member', label: 'Member', width: '60%' },
  { key: 'vote', label: 'Vote', width: '40%' }
]

const selectedDetailMotion = computed(
  () => motions.value.find((motion) => motion.id === detailMotionId.value) || null
)

const selectedVoteMotion = computed(
  () => motions.value.find((motion) => motion.id === voteMotionId.value) || null
)

const detailVoteRows = computed(() => {
  const voteMap = {}
  if (selectedDetailMotion.value?.votes) {
    selectedDetailMotion.value.votes.forEach((vote) => {
      if (vote?.memberId) {
        voteMap[vote.memberId] = vote.vote
      }
    })
  }

  return sortedUsers.value.map((user) => ({
    id: user.id,
    member: user.name,
    vote: voteMap[user.id] || 'abstain'
  }))
})

watch(
  motions,
  () => {
    if (!motions.value.find((motion) => motion.id === detailMotionId.value)) {
      detailMotionId.value = ''
    }
  },
  { immediate: true }
)

function createBlankMotionForm() {
  return {
    meetingId: meetings.value[0]?.id || '',
    title: '',
    description: ''
  }
}

function createMotionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `motion-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

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

function resolveOutcome(counts) {
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

function formatMotionSummary(motion) {
  if (!motion) {
    return 'No results'
  }

  if (motion.status === 'open') {
    return 'Voting open'
  }

  const counts = motion.resultSummary || getVoteCounts(motion.votes)
  return `The motion ${motion.status} with ${counts.yes || 0} yes and ${counts.no || 0} no votes.`
}

function resolveStatusVariant(status) {
  if (status === 'passed') {
    return 'success'
  }
  if (status === 'failed') {
    return 'danger'
  }
  return 'warning'
}

function updateMotionById(motionId, updater) {
  if (!communityData.value) {
    return
  }

  communityData.value.motions = communityData.value.motions.map((motion) =>
    motion.id === motionId ? normalizeMotion(updater(motion)) : motion
  )
}

function openCreateMotionModal() {
  if (!canCreateMotion.value) {
    return
  }

  mode.value = 'create'
  editingMotionId.value = ''
  motionForm.value = createBlankMotionForm()
  isMotionModalOpen.value = true
}

function openEditMotionModal(motion) {
  if (!canEditMotion.value) {
    return
  }

  mode.value = 'edit'
  editingMotionId.value = motion.id
  motionForm.value = {
    meetingId: motion.meetingId || meetings.value[0]?.id || '',
    title: motion.title,
    description: motion.description
  }
  isMotionModalOpen.value = true
}

function closeMotionModal() {
  isMotionModalOpen.value = false
}

function saveMotion() {
  if (mode.value === 'edit' && !canEditMotion.value) {
    return
  }
  if (mode.value !== 'edit' && !canCreateMotion.value) {
    return
  }

  if (!motionForm.value.title.trim()) {
    return
  }

  const now = new Date().toISOString().slice(0, 10)
  const payload = {
    meetingId: motionForm.value.meetingId,
    title: motionForm.value.title.trim(),
    description: motionForm.value.description.trim(),
    updatedAt: now
  }

  if (!communityData.value) {
    return
  }

  if (mode.value === 'edit') {
    updateMotionById(editingMotionId.value, (motion) => ({
      ...motion,
      ...payload
    }))
  } else {
    communityData.value.motions = [
      normalizeMotion({
        id: createMotionId(),
        createdBy: currentUser.value?.name || 'Community Admin',
        status: 'open',
        votes: [],
        resultSummary: { yes: 0, no: 0, abstain: 0, outcome: 'pending' },
        ...payload
      }),
      ...communityData.value.motions
    ]
  }

  closeMotionModal()
}

function promptDeleteMotion(motion) {
  if (!canDeleteMotion.value) {
    return
  }

  motionPendingDelete.value = motion
  isDeleteModalOpen.value = true
}

function deleteMotion() {
  if (!canDeleteMotion.value || !communityData.value) {
    return
  }

  communityData.value.motions = communityData.value.motions.filter(
    (motion) => motion.id !== motionPendingDelete.value?.id
  )
  motionPendingDelete.value = null
  isDeleteModalOpen.value = false
}

function openDetailModal(motion) {
  detailMotionId.value = motion.id
  isDetailModalOpen.value = true
}

function closeDetailModal() {
  isDetailModalOpen.value = false
}

function openVoteModal(motion) {
  if (!canVoteOnMotions.value) {
    return
  }

  voteMotionId.value = motion.id
  const votesByMember = {}
  motion.votes.forEach((vote) => {
    votesByMember[vote.memberId] = vote.vote
  })
  sortedUsers.value.forEach((user) => {
    if (!votesByMember[user.id]) {
      votesByMember[user.id] = 'abstain'
    }
  })
  votesDraftByMemberId.value = votesByMember
  isVoteModalOpen.value = true
}

function closeVoteModal() {
  isVoteModalOpen.value = false
}

function saveVotes() {
  if (!canVoteOnMotions.value) {
    return
  }

  const nextVotes = Object.entries(votesDraftByMemberId.value).map(([memberId, vote]) => ({
    memberId,
    vote: motionVoteOptions.includes(vote) ? vote : 'abstain'
  }))

  updateMotionById(voteMotionId.value, (motion) => ({
    ...motion,
    votes: nextVotes
  }))

  closeVoteModal()
}

function closeVoting() {
  if (!canVoteOnMotions.value) {
    return
  }

  const nextVotes = Object.entries(votesDraftByMemberId.value).map(([memberId, vote]) => ({
    memberId,
    vote: motionVoteOptions.includes(vote) ? vote : 'abstain'
  }))
  const counts = getVoteCounts(nextVotes)
  const outcome = resolveOutcome(counts)
  const status = outcome === 'passed' ? 'passed' : 'failed'

  updateMotionById(voteMotionId.value, (motion) => ({
    ...motion,
    votes: nextVotes,
    status,
    resultSummary: {
      yes: counts.yes,
      no: counts.no,
      abstain: counts.abstain,
      outcome
    }
  }))

  closeVoteModal()
}

function getMotionActions(motion) {
  const actions = [{ key: 'view', label: 'View' }]

  if (canEditMotion.value) {
    actions.push({ key: 'edit', label: 'Edit' })
  }

  if (canVoteOnMotions.value && motion.status === 'open') {
    actions.push({ key: 'vote', label: 'Vote' })
    actions.push({ key: 'close', label: 'Close Voting' })
  }

  if (canDeleteMotion.value) {
    actions.push({ key: 'delete', label: 'Delete', variant: 'danger' })
  }

  return actions
}

function handleMotionAction(actionKey, motion) {
  if (actionKey === 'view') {
    openDetailModal(motion)
    return
  }

  if (actionKey === 'edit') {
    openEditMotionModal(motion)
    return
  }

  if (actionKey === 'vote') {
    openVoteModal(motion)
    return
  }

  if (actionKey === 'close') {
    openVoteModal(motion)
    return
  }

  if (actionKey === 'delete') {
    promptDeleteMotion(motion)
  }
}
</script>

<template>
  <section class="motions-view" v-if="canViewMotions">
    <header class="motions-view__header">
      <div>
        <h1>Motions</h1>
        <p>Track governance motions and voting outcomes.</p>
      </div>
      <BaseButton :disabled="!canCreateMotion" @click="openCreateMotionModal">Create Motion</BaseButton>
    </header>

    <BaseCard>
      <BaseTable :columns="motionColumns" :rows="motionRows" style="--table-min-width: 1040px;">
        <template #cell-status="{ value }">
          <BaseBadge size="sm" :variant="resolveStatusVariant(value)">{{ value }}</BaseBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="table-action-cell">
            <RowActionMenu
              :actions="getMotionActions(row)"
              label="Motion row actions"
              @select="handleMotionAction($event, row)"
            />
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal
      v-model="isMotionModalOpen"
      :title="mode === 'edit' ? 'Edit Motion' : 'Create Motion'"
      description="Create or update a governance motion."
    >
      <div class="motion-form">
        <label class="motion-form__field">
          <span>Meeting</span>
          <select v-model="motionForm.meetingId">
            <option v-for="meeting in meetings" :key="meeting.id" :value="meeting.id">
              {{ meeting.title }}
            </option>
          </select>
        </label>
        <BaseInput v-model="motionForm.title" label="Title" placeholder="Enter motion title" />
        <BaseInput
          v-model="motionForm.description"
          type="textarea"
          :rows="3"
          label="Description"
          placeholder="Describe the motion details"
        />
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="closeMotionModal">Cancel</BaseButton>
        <BaseButton :disabled="!motionForm.title.trim()" @click="saveMotion">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isDetailModalOpen"
      title="Motion Details"
      description="Review voting results and member participation."
    >
      <div v-if="selectedDetailMotion" class="motion-detail">
        <div class="motion-detail__header">
          <div>
            <h4>{{ selectedDetailMotion.title }}</h4>
            <p>{{ selectedDetailMotion.description }}</p>
          </div>
          <BaseBadge size="sm" :variant="resolveStatusVariant(selectedDetailMotion.status)">
            {{ selectedDetailMotion.status }}
          </BaseBadge>
        </div>

        <div class="motion-detail__summary">
          <p>{{ formatMotionSummary(selectedDetailMotion) }}</p>
          <div class="motion-detail__badges">
            <BaseBadge variant="success">Yes: {{ selectedDetailMotion.resultSummary?.yes || 0 }}</BaseBadge>
            <BaseBadge variant="danger">No: {{ selectedDetailMotion.resultSummary?.no || 0 }}</BaseBadge>
            <BaseBadge variant="neutral">Abstain: {{ selectedDetailMotion.resultSummary?.abstain || 0 }}</BaseBadge>
          </div>
        </div>

        <BaseTable :columns="voteColumns" :rows="detailVoteRows" style="--table-min-width: 600px;" />
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeDetailModal">Close</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isVoteModalOpen"
      title="Record Votes"
      description="Capture member votes and close voting when ready."
    >
      <div class="motion-votes">
        <div v-for="member in sortedUsers" :key="member.id" class="motion-votes__row">
          <span>{{ member.name }}</span>
          <select v-model="votesDraftByMemberId[member.id]">
            <option v-for="option in motionVoteOptions" :key="option" :value="option">
              {{ option.toUpperCase() }}
            </option>
          </select>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="closeVoteModal">Cancel</BaseButton>
        <BaseButton variant="secondary" :disabled="!canVoteOnMotions" @click="saveVotes">Save</BaseButton>
        <BaseButton :disabled="!canVoteOnMotions" @click="closeVoting">Close Voting</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isDeleteModalOpen"
      title="Delete Motion"
      description="Are you sure you want to delete this motion?"
    >
      <template #footer>
        <BaseButton variant="ghost" @click="isDeleteModalOpen = false">Cancel</BaseButton>
        <BaseButton variant="danger" @click="deleteMotion">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.motions-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.motions-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.motions-view__header h1 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 650;
}

.motions-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
}

.motion-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.motion-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.motion-form__field span {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.motion-form__field select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.2) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
}

.motion-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.motion-detail__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
}

.motion-detail__header h4 {
  margin: 0;
  font-size: 1.1rem;
}

.motion-detail__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
}

.motion-detail__summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.motion-detail__summary p {
  margin: 0;
  color: var(--color-text-secondary);
}

.motion-detail__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.motion-votes {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.motion-votes__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.motion-votes__row select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.1) calc(var(--space-sm) * 1.3);
  font: inherit;
  font-size: 0.85rem;
  background: var(--color-bg-panel);
}
</style>
