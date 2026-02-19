<script setup>
import { computed, ref } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseToggle from '../components/ui/BaseToggle.vue'
import BaseTable from '../components/ui/BaseTable.vue'
import RowActionMenu from '../components/ui/RowActionMenu.vue'
import { useTenantStore } from '../state/tenantStore'

const {
  state,
  updateCommunityById,
  addCommunity,
  removeCommunity,
  switchToCommunity
} = useTenantStore()

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isResetAdminModalOpen = ref(false)

const viewMode = ref('grid')
const editingCommunityId = ref('')
const communityPendingDelete = ref(null)
const resetAdminCommunityId = ref('')

const communityForm = ref({
  name: '',
  alias: '',
  status: 'active',
  adminName: '',
  environment: 'Production'
})

const adminOptions = [
  'Alicia Monroe',
  'Marcus Lee',
  'Priya Bhatt',
  'Kevin Brown',
  'Ana Reynolds'
]

const tableColumns = [
  { key: 'name', label: 'Community', width: '20%' },
  { key: 'alias', label: 'Alias', width: '12%' },
  { key: 'status', label: 'Status', width: '12%' },
  { key: 'environment', label: 'Env', width: '10%' },
  { key: 'adminName', label: 'Super Admin', width: '18%' },
  { key: 'userCount', label: 'Users', width: '10%', align: 'right' },
  { key: 'createdAt', label: 'Created', width: '12%' },
  { key: 'actions', label: 'Actions', width: '8%', align: 'center' }
]

const communityRows = computed(() =>
  state.communities.map((community) => ({
    ...community,
    userCount: state.communityData[community.id]?.users?.length || 0
  }))
)

const totalUsers = computed(() =>
  state.communities.reduce((total, community) => {
    return total + (state.communityData[community.id]?.users?.length || 0)
  }, 0)
)

const activeCommunitiesCount = computed(() =>
  state.communities.filter((community) => community.status === 'active').length
)

const suspendedCommunitiesCount = computed(() =>
  state.communities.filter((community) => community.status === 'suspended').length
)

const inactiveCommunitiesCount = computed(() =>
  state.communities.filter((community) => community.status === 'inactive').length
)

const recentlyCreatedCount = computed(() => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)

  return state.communities.filter((community) => new Date(community.createdAt) >= cutoff).length
})

const summaryCards = computed(() => [
  {
    label: 'Total Communities',
    value: state.communities.length,
    hint: 'All onboarded clusters'
  },
  {
    label: 'Active Communities',
    value: activeCommunitiesCount.value,
    hint: 'Operational communities'
  },
  {
    label: 'Suspended Communities',
    value: suspendedCommunitiesCount.value,
    hint: 'Requires admin action'
  },
  {
    label: 'Total Users',
    value: totalUsers.value,
    hint: 'Across all communities'
  },
  {
    label: 'Recently Created',
    value: recentlyCreatedCount.value,
    hint: 'Past 30 days'
  }
])

const selectedCommunity = computed(
  () => state.communities.find((community) => community.id === editingCommunityId.value) || null
)

const deleteCommunityName = computed(() => communityPendingDelete.value?.name || 'this community')

function openCreateCommunityModal() {
  communityForm.value = {
    name: '',
    alias: '',
    status: 'active',
    adminName: adminOptions[0],
    environment: 'Production'
  }
  isCreateModalOpen.value = true
}

function openEditCommunityModal(community) {
  editingCommunityId.value = community.id
  communityForm.value = {
    name: community.name,
    alias: community.alias,
    status: community.status,
    adminName: community.adminName,
    environment: community.environment
  }
  isEditModalOpen.value = true
}

function closeEditCommunityModal() {
  editingCommunityId.value = ''
  isEditModalOpen.value = false
}

function saveCommunity() {
  if (!communityForm.value.name.trim()) {
    return
  }

  updateCommunityById(editingCommunityId.value, (community) => ({
    ...community,
    name: communityForm.value.name.trim(),
    alias: communityForm.value.alias.trim() || community.alias,
    status: communityForm.value.status,
    adminName: communityForm.value.adminName,
    environment: communityForm.value.environment
  }))

  closeEditCommunityModal()
}

function createCommunity() {
  if (!communityForm.value.name.trim()) {
    return
  }

  addCommunity({
    name: communityForm.value.name.trim(),
    alias: communityForm.value.alias.trim(),
    status: communityForm.value.status,
    adminName: communityForm.value.adminName,
    environment: communityForm.value.environment
  })

  isCreateModalOpen.value = false
}

function promptDeleteCommunity(community) {
  communityPendingDelete.value = community
  isDeleteModalOpen.value = true
}

function confirmDeleteCommunity() {
  if (!communityPendingDelete.value) {
    return
  }

  removeCommunity(communityPendingDelete.value.id)
  communityPendingDelete.value = null
  isDeleteModalOpen.value = false
}

function openResetAdminModal(community) {
  resetAdminCommunityId.value = community.id
  communityForm.value.adminName = community.adminName
  isResetAdminModalOpen.value = true
}

function confirmResetAdmin() {
  if (!resetAdminCommunityId.value) {
    return
  }

  updateCommunityById(resetAdminCommunityId.value, (community) => ({
    ...community,
    adminName: communityForm.value.adminName
  }))

  resetAdminCommunityId.value = ''
  isResetAdminModalOpen.value = false
}

function toggleCommunityStatus(community) {
  updateCommunityById(community.id, (current) => ({
    ...current,
    status: current.status === 'active' ? 'suspended' : 'active'
  }))
}

function handleViewCommunity(community) {
  if (community.status !== 'active') {
    return
  }

  switchToCommunity(community.id)
}

function resolveStatusVariant(status) {
  if (status === 'active') {
    return 'success'
  }
  if (status === 'suspended') {
    return 'warning'
  }
  return 'neutral'
}

function resolveStatusLabel(status) {
  if (status === 'active') {
    return 'Active'
  }
  if (status === 'suspended') {
    return 'Suspended'
  }
  return 'Inactive'
}

function getCommunityActions(community) {
  return [
    {
      key: 'view',
      label: 'View Community',
      disabled: community.status !== 'active',
      title: community.status !== 'active' ? 'Community is not active' : ''
    },
    { key: 'edit', label: 'Edit Details' },
    {
      key: 'toggle-status',
      label: community.status === 'active' ? 'Suspend' : 'Activate'
    },
    { key: 'reset-admin', label: 'Reset Super Admin' },
    { key: 'delete', label: 'Delete Community', variant: 'danger' }
  ]
}

function handleCommunityAction(actionKey, community) {
  if (actionKey === 'view') {
    handleViewCommunity(community)
    return
  }
  if (actionKey === 'edit') {
    openEditCommunityModal(community)
    return
  }
  if (actionKey === 'toggle-status') {
    toggleCommunityStatus(community)
    return
  }
  if (actionKey === 'reset-admin') {
    openResetAdminModal(community)
    return
  }
  if (actionKey === 'delete') {
    promptDeleteCommunity(community)
  }
}
</script>

<template>
  <section class="platform-view">
    <header class="platform-view__header">
      <div>
        <h1>SaaS Platform Administration</h1>
        <div class="platform-view__badge-row">
          <BaseBadge class="platform-view__badge">Super Admin Mode</BaseBadge>
          <span>Managing Community Instances</span>
        </div>
      </div>
      <BaseButton @click="openCreateCommunityModal">+ Create Community</BaseButton>
    </header>

    <div class="platform-summary">
      <BaseCard v-for="card in summaryCards" :key="card.label" class="platform-summary__card">
        <p class="platform-summary__label">{{ card.label }}</p>
        <h3>{{ card.value }}</h3>
        <span>{{ card.hint }}</span>
      </BaseCard>
    </div>

    <BaseCard class="communities-panel">
      <header class="communities-panel__header">
        <div>
          <h2>Communities</h2>
          <p>Manage access, status, and community-level admins.</p>
        </div>
        <div class="communities-panel__controls">
          <span>Table View</span>
          <BaseToggle :model-value="viewMode === 'table'" @update:model-value="viewMode = $event ? 'table' : 'grid'" />
        </div>
      </header>

      <div v-if="viewMode === 'grid'" class="community-grid">
        <BaseCard v-for="community in communityRows" :key="community.id" class="community-card">
          <div class="community-card__header">
            <div>
              <h3>{{ community.name }}</h3>
              <p>{{ community.alias }}</p>
            </div>
            <BaseBadge :variant="resolveStatusVariant(community.status)">
              {{ resolveStatusLabel(community.status) }}
            </BaseBadge>
          </div>

          <div class="community-card__details">
            <div>
              <span>Super Admin</span>
              <p>{{ community.adminName }}</p>
            </div>
            <div>
              <span>Users</span>
              <p>{{ community.userCount }}</p>
            </div>
            <div>
              <span>Environment</span>
              <p>{{ community.environment }}</p>
            </div>
            <div>
              <span>Created</span>
              <p>{{ community.createdAt }}</p>
            </div>
          </div>

          <div class="community-card__actions">
            <BaseButton
              size="sm"
              variant="secondary"
              :disabled="community.status !== 'active'"
              @click="handleViewCommunity(community)"
            >
              View Community
            </BaseButton>
            <RowActionMenu
              :actions="getCommunityActions(community)"
              label="Community actions"
              @select="handleCommunityAction($event, community)"
            />
          </div>
        </BaseCard>
      </div>

      <div v-else>
        <BaseTable :columns="tableColumns" :rows="communityRows">
          <template #cell-status="{ value }">
            <BaseBadge :variant="resolveStatusVariant(value)">{{ resolveStatusLabel(value) }}</BaseBadge>
          </template>
          <template #cell-actions="{ row }">
            <div class="table-action-cell">
              <RowActionMenu
                :actions="getCommunityActions(row)"
                label="Community actions"
                @select="handleCommunityAction($event, row)"
              />
            </div>
          </template>
        </BaseTable>
      </div>
    </BaseCard>

    <BaseModal
      v-model="isCreateModalOpen"
      title="Create Community"
      description="Provision a new community instance."
    >
      <div class="community-form">
        <BaseInput v-model="communityForm.name" label="Community Name" placeholder="Enter name" />
        <BaseInput v-model="communityForm.alias" label="Alias / Identifier" placeholder="Alias" />
        <label class="community-form__field">
          <span>Status</span>
          <select v-model="communityForm.status">
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label class="community-form__field">
          <span>Super Admin</span>
          <select v-model="communityForm.adminName">
            <option v-for="admin in adminOptions" :key="admin" :value="admin">{{ admin }}</option>
          </select>
        </label>
        <label class="community-form__field">
          <span>Environment</span>
          <select v-model="communityForm.environment">
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
          </select>
        </label>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="isCreateModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="createCommunity">Create</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isEditModalOpen"
      title="Edit Community Details"
      description="Update community metadata and status."
    >
      <div class="community-form">
        <BaseInput v-model="communityForm.name" label="Community Name" placeholder="Enter name" />
        <BaseInput v-model="communityForm.alias" label="Alias / Identifier" placeholder="Alias" />
        <label class="community-form__field">
          <span>Status</span>
          <select v-model="communityForm.status">
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label class="community-form__field">
          <span>Super Admin</span>
          <select v-model="communityForm.adminName">
            <option v-for="admin in adminOptions" :key="admin" :value="admin">{{ admin }}</option>
          </select>
        </label>
        <label class="community-form__field">
          <span>Environment</span>
          <select v-model="communityForm.environment">
            <option value="Production">Production</option>
            <option value="Staging">Staging</option>
          </select>
        </label>
      </div>

      <template #footer>
        <BaseButton variant="ghost" @click="closeEditCommunityModal">Cancel</BaseButton>
        <BaseButton @click="saveCommunity">Save</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isResetAdminModalOpen"
      title="Reset Community Super Admin"
      description="Assign a new community-level administrator."
    >
      <label class="community-form__field">
        <span>Super Admin</span>
        <select v-model="communityForm.adminName">
          <option v-for="admin in adminOptions" :key="admin" :value="admin">{{ admin }}</option>
        </select>
      </label>

      <template #footer>
        <BaseButton variant="ghost" @click="isResetAdminModalOpen = false">Cancel</BaseButton>
        <BaseButton @click="confirmResetAdmin">Update</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      v-model="isDeleteModalOpen"
      title="Delete Community"
      description="This action permanently removes the community instance."
    >
      <p class="delete-note">
        Are you sure you want to delete <strong>{{ deleteCommunityName }}</strong>?
      </p>

      <template #footer>
        <BaseButton variant="ghost" @click="isDeleteModalOpen = false">Cancel</BaseButton>
        <BaseButton variant="danger" @click="confirmDeleteCommunity">Delete</BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style scoped>
.platform-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.platform-view__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  align-items: flex-start;
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-platform-accent-soft);
}

.platform-view__header h1 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.platform-view__badge-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.platform-view__badge {
  background: var(--color-platform-accent-soft);
  color: var(--color-platform-accent-strong);
}

.platform-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-md);
}

.platform-summary__card {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  border-top: 2px solid var(--color-platform-accent-soft);
}

.platform-summary__label {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
}

.platform-summary__card h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.platform-summary__card span {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.communities-panel__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  align-items: flex-start;
  margin-bottom: var(--space-lg);
}

.communities-panel__header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 650;
}

.communities-panel__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
}

.communities-panel__controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--space-md);
}

.community-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.community-card__header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  align-items: flex-start;
}

.community-card__header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.community-card__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.community-card__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}

.community-card__details span {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}

.community-card__details p {
  margin: var(--space-xs) 0 0;
  font-weight: 600;
}

.community-card__actions {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
  align-items: center;
}

.community-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.community-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.community-form__field select {
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-panel);
  color: var(--color-text-primary);
}

.delete-note {
  margin: 0;
  color: var(--color-text-secondary);
}
</style>
