<script setup>
defineProps({
  path: {
    type: String,
    required: true
  }
})
</script>

<template>
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path :d="path" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<style scoped>
.icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}
</style>
