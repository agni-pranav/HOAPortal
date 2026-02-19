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
import { committeeFrequencyOptions, normalizeCommittee } from '../mock/committeesData'
import { useTenantStore } from '../state/tenantStore'
import { usePermission } from '../composables/usePermission'

const { currentCommunityData } = useTenantStore()
const { canView, canPerform } = usePermission()

const communityData = computed(() => currentCommunityData.value)
const committees = computed(() => communityData.value?.committees || [])
const users = computed(() => communityData.value?.users || [])
const roles = computed(() => communityData.value?.roles || [])

const isCommitteeModalOpen = ref(false)
const isMembersModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const mode = ref('create')
const editingCommitteeId = ref('')
const committeePendingDelete = ref(null)
const membersCommitteeId = ref('')

const committeeForm = ref(createBlankCommitteeForm())
const membersDraft = ref({})

const tableColumns = [
  { key: 'name', label: 'Name', width: '17%' },
  { key: 'description', label: 'Description', width: '30%' },
  { key: 'frequency', label: 'Frequency', width: '12%' },
  { key: 'visibility', label: 'Visibility', width: '12%' },
  { key: 'membersCount', label: 'Members', width: '8%', align: 'right' },
  { key: 'updatedAt', label: 'Updated', width: '11%' },
  { key: 'actions', label: 'Actions', width: '8%', align: 'center' }
]

const roleNameById = computed(() => {
  const mapped = {}
  roles.value.forEach((role) => {
    mapped[role.id] = role.name
  })
  return mapped
})

const committeeRows = computed(() =>
  [...committees.value]
    .filter((committee) => canView('committees', { committeeId: committee.id }))
    .sort((firstCommittee, secondCommittee) => firstCommittee.name.localeCompare(secondCommittee.name))
    .map((committee) => ({
      ...committee,
      membersCount: committee.memberIds.length
    }))
)

const sortedUsers = computed(() =>
  [...users.value].sort((firstUser, secondUser) => firstUser.name.localeCompare(secondUser.name))
)

const selectedMembersCommittee = computed(
  () => committees.value.find((committee) => committee.id === membersCommitteeId.value) || null
)

const membersModalTitle = computed(() =>
  selectedMembersCommittee.value
    ? `Manage Members — ${selectedMembersCommittee.value.name}`
    : 'Manage Members'
)

const committeeModalTitle = computed(() =>
  mode.value === 'edit' ? 'Edit Committee' : 'Create Committee'
)

const canSaveCommittee = computed(() => committeeForm.value.name.trim().length > 0)
const canCreateCommittees = computed(() => canPerform('committees', 'create'))
const canEditCommittees = computed(() => canPerform('committees', 'edit'))
const canDeleteCommittees = computed(() => canPerform('committees', 'delete'))
const canManageCommittees = computed(
  () => canCreateCommittees.value || canEditCommittees.value || canDeleteCommittees.value
)

const selectedMembersCount = computed(() =>
  Object.values(membersDraft.value).filter(Boolean).length
)

function createBlankCommitteeForm() {
  return {
    name: '',
    description: '',
    frequency: committeeFrequencyOptions[0],
    visibility: 'public'
  }
}

function createCommitteeId(seedName) {
  const normalizedSeed = seedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!normalizedSeed) {
    return `committee-${Date.now()}`
  }

  const existingIds = new Set(committees.value.map((committee) => committee.id))
  if (!existingIds.has(normalizedSeed)) {
    return normalizedSeed
  }

  return `${normalizedSeed}-${Date.now()}`
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function updateCommitteeById(committeeId, updater) {
  if (!communityData.value) {
    return
  }

  communityData.value.committees = communityData.value.committees.map((committee) =>
    committee.id === committeeId ? normalizeCommittee(updater(committee)) : committee
  )
}

function resolveRoleName(roleId) {
  if (!roleId) {
    return 'Unassigned'
  }

  return roleNameById.value[roleId] || 'Unknown Role'
}

function resolveVisibilityLabel(visibility) {
  return visibility === 'public' ? 'Public' : 'Board-only'
}

function resolveVisibilityVariant(visibility) {
  return visibility === 'public' ? 'success' : 'warning'
}

function resolveUserStatusVariant(status) {
  return status === 'Active' ? 'success' : 'neutral'
}

function openCreateCommitteeModal() {
  if (!canCreateCommittees.value) {
    return
  }

  mode.value = 'create'
  editingCommitteeId.value = ''
  committeeForm.value = createBlankCommitteeForm()
  isCommitteeModalOpen.value = true
}

function openEditCommitteeModal(committee) {
  if (!canEditCommittees.value) {
    return
  }

  mode.value = 'edit'
  editingCommitteeId.value = committee.id
  committeeForm.value = {
    name: committee.name,
    description: committee.description,
    frequency: committee.frequency,
    visibility: committee.visibility
  }
  isCommitteeModalOpen.value = true
}

function closeCommitteeModal() {
  isCommitteeModalOpen.value = false
}

function saveCommittee() {
  if (mode.value === 'edit' && !canEditCommittees.value) {
    return
  }

  if (mode.value !== 'edit' && !canCreateCommittees.value) {
    return
  }

  if (!canSaveCommittee.value) {
    return
  }

  const payload = {
    name: committeeForm.value.name.trim(),
    description: committeeForm.value.description.trim(),
    frequency: committeeForm.value.frequency,
    visibility: committeeForm.value.visibility,
    updatedAt: getTodayDate()
  }

  if (mode.value === 'edit') {
    updateCommitteeById(editingCommitteeId.value, (committee) => ({
      ...committee,
      ...payload
    }))
  } else {
    if (!communityData.value) {
      return
    }

    communityData.value.committees = [
      normalizeCommittee({
        id: createCommitteeId(payload.name),
        ...payload,
        memberIds: []
      }),
      ...communityData.value.committees
    ]
  }

  closeCommitteeModal()
}

function openMembersModal(committee) {
  if (!canEditCommittees.value) {
    return
  }

  membersCommitteeId.value = committee.id

  const nextDraft = {}
  users.value.forEach((user) => {
    nextDraft[user.id] = committee.memberIds.includes(user.id)
  })

  membersDraft.value = structuredClone(nextDraft)
  isMembersModalOpen.value = true
}

function closeMembersModal() {
  isMembersModalOpen.value = false
  membersCommitteeId.value = ''
  membersDraft.value = {}
}

function setMemberSelection(userId, isSelected) {
  membersDraft.value = {
    ...membersDraft.value,
    [userId]: isSelected
  }
}

function saveMembers() {
  if (!canEditCommittees.value) {
    return
  }

  if (!membersCommitteeId.value) {
    return
  }

  const nextMemberIds = Object.entries(membersDraft.value)
    .filter(([, isSelected]) => Boolean(isSelected))
    .map(([userId]) => userId)

  updateCommitteeById(membersCommitteeId.value, (committee) => ({
    ...committee,
    memberIds: nextMemberIds,
    updatedAt: getTodayDate()
  }))

  closeMembersModal()
}

function promptDeleteCommittee(committee) {
  if (!canDeleteCommittees.value) {
    return
  }

  committeePendingDelete.value = committee
  isDeleteModalOpen.value = true
}

function getCommitteeActions() {
  const actions = []

  if (canEditCommittees.value) {
    actions.push({ key: 'edit', label: 'Edit' })
    actions.push({ key: 'members', label: 'Manage Members' })
  }

  if (canDeleteCommittees.value) {
    actions.push({ key: 'delete', label: 'Delete', variant: 'danger' })
  }

  return actions
}

function handleCommitteeAction(actionKey, committee) {
  if (actionKey === 'edit') {
    if (canEditCommittees.value) {
      openEditCommitteeModal(committee)
    }
    return
  }

  if (actionKey === 'members') {
    if (canEditCommittees.value) {
      openMembersModal(committee)
    }
    return
  }

  if (actionKey === 'delete') {
    if (canDeleteCommittees.value) {
      promptDeleteCommittee(committee)
    }
  }
}

function closeDeleteModal() {
  committeePendingDelete.value = null
  isDeleteModalOpen.value = false
}

function confirmDeleteCommittee() {
  if (!committeePendingDelete.value) {
    return
  }

  if (!canDeleteCommittees.value) {
    return
  }

  if (!communityData.value) {
    return
  }

  communityData.value.committees = communityData.value.committees.filter(
    (committee) => committee.id !== committeePendingDelete.value.id
  )
  closeDeleteModal()
}
</script>

<template>
  <section class="committees-view">
    <header class="committees-view__header">
      <div>
        <h1>Committees</h1>
        <p>Manage HOA committees and membership</p>
      </div>
      <BaseButton :disabled="!canCreateCommittees" @click="openCreateCommitteeModal">
        + Create Committee
      </BaseButton>
    </header>

    <BaseCard>
      <BaseTable :columns="tableColumns" :rows="committeeRows">
        <template #cell-visibility="{ value }">
          <BaseBadge :variant="resolveVisibilityVariant(value)">
            {{ resolveVisibilityLabel(value) }}
          </BaseBadge>
        </template>

        <template #cell-membersCount="{ value }">
          <span class="committees-view__numeric">{{ value }}</span>
        </template>

        <template #cell-actions="{ row }">
          <div v-if="canManageCommittees" class="table-action-cell">
            <RowActionMenu
              :actions="getCommitteeActions(row)"
              label="Committee row actions"
              @select="handleCommitteeAction($event, row)"
            />
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <BaseModal
      v-model="isCommitteeModalOpen"
      :title="committeeModalTitle"
      description="Create or update committee metadata for this HOA instance."
    >
      <div class="committee-form">
        <BaseInput
          v-model="committeeForm.name"
          label="Committee Name"
          placeholder="Enter committee name"
        />

        <BaseInput
          v-model="committeeForm.description"
          type="textarea"
          :rows="4"
          label="Description"
          placeholder="Describe committee scope"
        />

        <label class="committee-form__field">
          <span>Meeting Frequency</span>
          <select v-model="committeeForm.frequency">
            <option v-for="frequency in committeeFrequencyOptions" :key="frequency" :value="frequency">
              {{ frequency }}
            </option>
          </select>
        </label>

        <div class="committee-form__visibility">
          <span>Visibility</span>
          <div class="committee-form__toggle">
            <small>Board-only</small>
            <BaseToggle
              :model-value="committeeForm.visibility === 'public'"
              @update:model-value="committeeForm.visibility = $event ? 'public' : 'board'"
            />
            <small>Public</small>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeCommitteeModal">Cancel</BaseButton>
        <BaseButton :disabled="!canSaveCommittee" @click="saveCommittee">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isMembersModalOpen"
      :title="membersModalTitle"
      description="Assign or remove users from this committee."
    >
      <div class="members-modal-content">
        <header class="members-modal-content__header">
          <p>{{ selectedMembersCount }} members selected</p>
        </header>

        <div class="members-list">
          <label
            v-for="user in sortedUsers"
            :key="user.id"
            class="members-list__item"
          >
            <input
              type="checkbox"
              :checked="Boolean(membersDraft[user.id])"
              @change="setMemberSelection(user.id, $event.target.checked)"
            >

            <div class="members-list__identity">
              <p>{{ user.name }}</p>
              <small>{{ user.email }}</small>
            </div>

            <BaseBadge variant="info">
              {{ resolveRoleName(user.assignedRoleId) }}
            </BaseBadge>

            <BaseBadge :variant="resolveUserStatusVariant(user.status)">
              {{ user.status }}
            </BaseBadge>
          </label>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeMembersModal">Cancel</BaseButton>
        <BaseButton @click="saveMembers">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isDeleteModalOpen"
      title="Delete Committee"
      description="Are you sure you want to delete this committee?"
    >
      <p class="delete-note">
        This action removes
        <strong>{{ committeePendingDelete?.name || 'the selected committee' }}</strong>
        from local mock data.
      </p>

      <template #footer>
        <BaseButton variant="ghost" @click="closeDeleteModal">Cancel</BaseButton>
        <BaseButton variant="danger" @click="confirmDeleteCommittee">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.committees-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.committees-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.committees-view__header h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.4rem;
  font-weight: 620;
}

.committees-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.committees-view__numeric {
  display: inline-flex;
  min-width: calc(var(--space-md) * 1.8);
  justify-content: flex-end;
}

.table-action-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.committee-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.committee-form__field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.7);
}

.committee-form__field span,
.committee-form__visibility span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 550;
}

.committee-form__field select {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.2) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
  outline: none;
}

.committee-form__field select:focus {
  border-color: var(--color-input-focus-border);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.committee-form__visibility {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.9);
}

.committee-form__toggle {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--space-sm) * 1.2);
}

.committee-form__toggle small {
  color: var(--color-text-secondary);
  font-size: 0.78rem;
}

.members-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.members-modal-content__header {
  margin: 0;
}

.members-modal-content__header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.members-list {
  max-height: calc(var(--space-2xl) * 5.5);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.75);
  padding-right: var(--space-xs);
}

.members-list__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: var(--space-sm);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: calc(var(--space-sm) * 1.1);
  background: var(--color-bg-panel);
}

.members-list__item input[type='checkbox'] {
  margin: 0;
  width: 1rem;
  height: 1rem;
}

.members-list__identity {
  min-width: 0;
}

.members-list__identity p {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.88rem;
  font-weight: 560;
}

.members-list__identity small {
  display: block;
  margin-top: calc(var(--space-xs) * 0.8);
  color: var(--color-text-secondary);
  font-size: 0.76rem;
}

.delete-note {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
}

@media (max-width: 980px) {
  .committees-view__header {
    flex-direction: column;
    align-items: stretch;
  }

  .members-list__item {
    grid-template-columns: auto minmax(0, 1fr);
  }
}
</style>
