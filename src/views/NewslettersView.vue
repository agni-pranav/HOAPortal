<script setup>
import { ref } from 'vue'
import BaseBadge from '../components/ui/BaseBadge.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'

const newsletterUploadInput = ref(null)
const documentUploadInput = ref(null)
const newsletterDraftFiles = ref([])
const documentDraftFiles = ref([])

const newsletterFolders = [
  {
    id: 'feb-2026',
    name: 'February 2026',
    description: 'Annual meeting recap, reserve study highlights, and vendor updates.',
    documents: [
      'February 2026 Community Newsletter.pdf',
      'Reserve Study Summary - Feb 2026.pdf',
      'Vendor Timeline Snapshot.xlsx'
    ]
  },
  {
    id: 'jan-2026',
    name: 'January 2026',
    description: 'Budget kickoff, committee rosters, and community events calendar.',
    documents: [
      'January 2026 Community Newsletter.pdf',
      'Committee Directory - Jan 2026.pdf',
      'Events Calendar - Q1 2026.pdf'
    ]
  },
  {
    id: 'dec-2025',
    name: 'December 2025',
    description: 'Year-end wrap-up and holiday community highlights.',
    documents: ['December 2025 Newsletter.pdf', 'Year-End Financial Snapshot.pdf']
  }
]

const recentDocuments = [
  {
    id: 'doc-1',
    name: 'Board Summary - February 2026.pdf',
    meta: 'Uploaded Feb 12, 2026 · 1.8 MB'
  },
  {
    id: 'doc-2',
    name: 'Maintenance Plan Overview.docx',
    meta: 'Uploaded Feb 9, 2026 · 830 KB'
  },
  {
    id: 'doc-3',
    name: 'Committee Action Items.xlsx',
    meta: 'Uploaded Feb 3, 2026 · 410 KB'
  }
]

function openNewsletterPicker() {
  newsletterUploadInput.value?.click()
}

function openDocumentPicker() {
  documentUploadInput.value?.click()
}

function handleNewsletterFiles(event) {
  const files = Array.from(event.target.files || [])
  newsletterDraftFiles.value = files
}

function handleDocumentFiles(event) {
  const files = Array.from(event.target.files || [])
  documentDraftFiles.value = files
}

function handleDropNewsletter(event) {
  event.preventDefault()
  const files = Array.from(event.dataTransfer?.files || [])
  newsletterDraftFiles.value = files
}

function handleDropDocument(event) {
  event.preventDefault()
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
        <BaseButton variant="secondary" @click="openNewsletterPicker">
          Upload Newsletter
        </BaseButton>
        <BaseButton @click="openDocumentPicker">Upload Document</BaseButton>
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
            <BaseButton variant="ghost" @click="openNewsletterPicker">
              Select Files
            </BaseButton>
            <input
              ref="newsletterUploadInput"
              class="upload-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
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
            <BaseButton variant="secondary" @click="openDocumentPicker">
              Browse Library
            </BaseButton>
            <input
              ref="documentUploadInput"
              class="upload-input"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xlsx"
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
