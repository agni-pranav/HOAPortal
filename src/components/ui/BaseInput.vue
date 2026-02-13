<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  rows: {
    type: Number,
    default: 4
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="input-field">
    <span v-if="label">{{ label }}</span>
    <textarea
      v-if="type === 'textarea'"
      :rows="rows"
      :placeholder="placeholder"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </label>
</template>

<style scoped>
.input-field {
  display: flex;
  flex-direction: column;
  gap: calc(var(--space-sm) * 0.7);
}

.input-field span {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 550;
}

.input-field input,
.input-field textarea {
  border: 1px solid var(--color-border-default);
  border-radius: 0.65rem;
  padding: calc(var(--space-sm) * 1.2) calc(var(--space-sm) * 1.4);
  font: inherit;
  font-size: 0.84rem;
  color: var(--color-text-primary);
  background: var(--color-bg-panel);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field textarea {
  resize: vertical;
}

.input-field input:focus,
.input-field textarea:focus {
  border-color: var(--color-input-focus-border);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
</style>
