<script setup>
import { computed, ref } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import { useTenantStore } from '../state/tenantStore'
import { usePermission } from '../composables/usePermission'

const newsletterUploadInput = ref(null)
const documentUploadInput = ref(null)
const newsletterDraftFiles = ref([])
const documentDraftFiles = ref([])
const { currentCommunityData } = useTenantStore()
const { canPerform } = usePermission()

const newsletterFolders = computed(() => currentCommunityData.value?.newsletterFolders || [])
const recentDocuments = computed(() => currentCommunityData.value?.recentDocuments || [])

const canManageNewsletters = computed(
  () => canPerform('communications', 'create') || canPerform('communications', 'publish')
)

function openNewsletterPicker() {
  if (!canManageNewsletters.value) {
    return
  }

  newsletterUploadInput.value?.click()
}

function openDocumentPicker() {
  if (!canManageNewsletters.value) {
    return
  }

  documentUploadInput.value?.click()
}

function handleNewsletterFiles(event) {
  if (!canManageNewsletters.value) {
    return
  }

  const files = Array.from(event.target.files || [])
  newsletterDraftFiles.value = files
}

function handleDocumentFiles(event) {
  if (!canManageNewsletters.value) {
    return
  }

  const files = Array.from(event.target.files || [])
  documentDraftFiles.value = files
}

function handleDropNewsletter(event) {
  event.preventDefault()
  if (!canManageNewsletters.value) {
    return
  }
  const files = Array.from(event.dataTransfer?.files || [])
  newsletterDraftFiles.value = files
}

function handleDropDocument(event) {
  event.preventDefault()
  if (!canManageNewsletters.value) {
    return
  }
  const files = Array.from(event.dataTransfer?.files || [])
  documentDraftFiles.value = files
}
</script>

<template>
  <section class="newsletters-view">
    <header class="newsletters-view__header">
      <div>
        <h1>Newsletters</h1>
        <p>Organize monthly newsletters and distribute community documents.</p>
      </div>
      <div class="newsletters-view__actions">
        <BaseButton variant="secondary" :disabled="!canManageNewsletters" @click="openNewsletterPicker">
          Upload Newsletter
        </BaseButton>
        <BaseButton :disabled="!canManageNewsletters" @click="openDocumentPicker">
          Upload Document
        </BaseButton>
      </div>
    </header>

    <div class="newsletters-view__grid">
      <div class="newsletters-view__main">
        <BaseCard title="Newsletter Uploads" subtitle="Drag and drop files to add a new issue.">
          <div
            class="upload-placeholder"
            @dragover.prevent
            @drop="handleDropNewsletter"
          >
            <div>
              <h3>Drop newsletter files here</h3>
              <p>PDF or DOCX · Max 20MB</p>
            </div>
            <BaseButton variant="ghost" :disabled="!canManageNewsletters" @click="openNewsletterPicker">
              Select Files
            </BaseButton>
            <input
              ref="newsletterUploadInput"
              class="upload-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              :disabled="!canManageNewsletters"
              @change="handleNewsletterFiles"
            />
          </div>
          <div v-if="newsletterDraftFiles.length" class="upload-selected">
            <p>Selected files</p>
            <ul>
              <li v-for="file in newsletterDraftFiles" :key="file.name">{{ file.name }}</li>
            </ul>
          </div>
        </BaseCard>

        <BaseCard title="Archive Folders" subtitle="Monthly newsletter folders and companion documents.">
          <div class="folder-list">
            <article v-for="folder in newsletterFolders" :key="folder.id" class="folder-card">
              <div class="folder-card__header">
                <div>
                  <h4>{{ folder.name }}</h4>
                  <p>{{ folder.description }}</p>
                </div>
                <BaseBadge variant="neutral">{{ folder.documents.length }} files</BaseBadge>
              </div>
              <ul>
                <li v-for="document in folder.documents" :key="document">{{ document }}</li>
              </ul>
            </article>
          </div>
        </BaseCard>
      </div>

      <div class="newsletters-view__side">
        <BaseCard title="Document Uploads" subtitle="Post policies, minutes, and HOA forms.">
          <div
            class="upload-placeholder upload-placeholder--compact"
            @dragover.prevent
            @drop="handleDropDocument"
          >
            <div>
              <h3>Upload a document</h3>
              <p>PDF, XLSX, or DOCX · Max 25MB</p>
            </div>
            <BaseButton variant="secondary" :disabled="!canManageNewsletters" @click="openDocumentPicker">
              Browse Library
            </BaseButton>
            <input
              ref="documentUploadInput"
              class="upload-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xlsx"
              :disabled="!canManageNewsletters"
              @change="handleDocumentFiles"
            />
          </div>
          <div v-if="documentDraftFiles.length" class="upload-selected">
            <p>Selected files</p>
            <ul>
              <li v-for="file in documentDraftFiles" :key="file.name">{{ file.name }}</li>
            </ul>
          </div>
        </BaseCard>

        <BaseCard title="Recent Documents" subtitle="Latest files shared with residents.">
          <div class="recent-list">
            <article v-for="document in recentDocuments" :key="document.id" class="recent-list__item">
              <div>
                <h4>{{ document.name }}</h4>
                <p>{{ document.meta }}</p>
              </div>
              <BaseBadge variant="info">New</BaseBadge>
            </article>
          </div>
        </BaseCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.newsletters-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.newsletters-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.newsletters-view__header h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 620;
}

.newsletters-view__header p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.92rem;
}

.newsletters-view__actions {
  display: inline-flex;
  gap: var(--space-sm);
}

.newsletters-view__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--space-lg);
}

.newsletters-view__main,
.newsletters-view__side {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.upload-placeholder {
  border: 1px dashed var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  background: var(--color-bg-panel);
}

.upload-placeholder--compact {
  padding: var(--space-md);
}

.upload-placeholder h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.upload-placeholder p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.upload-input {
  display: none;
}

.upload-selected {
  margin-top: var(--space-sm);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
  background: var(--color-bg-panel);
}

.upload-selected p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
}

.upload-selected ul {
  margin: var(--space-xs) 0 0;
  padding-left: 1.05rem;
  color: var(--color-text-primary);
  font-size: 0.82rem;
}

.upload-selected li + li {
  margin-top: calc(var(--space-xs) * 0.7);
}

.folder-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.folder-card {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  background: var(--color-bg-panel);
}

.folder-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.folder-card h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.folder-card p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.folder-card ul {
  margin: var(--space-sm) 0 0;
  padding-left: 1.1rem;
  color: var(--color-text-primary);
  font-size: 0.82rem;
}

.folder-card li + li {
  margin-top: calc(var(--space-xs) * 0.7);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.recent-list__item {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  background: var(--color-bg-panel);
}

.recent-list__item h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.recent-list__item p {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.76rem;
}

@media (max-width: 1100px) {
  .newsletters-view__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .newsletters-view__header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 700px) {
  .upload-placeholder {
    flex-direction: column;
    align-items: flex-start;
  }

  .newsletters-view__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
