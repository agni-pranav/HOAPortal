<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="toggle">
    <span v-if="label">{{ label }}</span>
    <button
      type="button"
      role="switch"
      class="toggle__switch"
      :class="{ 'is-on': modelValue }"
      :aria-checked="modelValue"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span class="toggle__thumb" />
    </button>
  </label>
</template>

<style scoped>
.toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--space-sm) * 1.6);
  font-size: 0.8rem;
  color: var(--color-text-primary);
}

.toggle__switch {
  width: 2.55rem;
  height: 1.45rem;
  border: none;
  border-radius: 2rem;
  background: var(--color-toggle-bg);
  padding: calc(var(--space-sm) * 0.2);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.toggle__switch.is-on {
  background: var(--color-toggle-bg-on);
}

.toggle__thumb {
  display: block;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: var(--color-bg-panel);
  transition: transform 0.2s ease;
}

.toggle__switch.is-on .toggle__thumb {
  transform: translateX(1.1rem);
}
</style>
