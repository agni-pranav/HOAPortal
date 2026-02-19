<script setup>
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'

defineProps({
  navigationItems: {
    type: Array,
    required: true
  },
  activeView: {
    type: String,
    required: true
  },
  activeTitle: {
    type: String,
    required: true
  }
})

defineEmits(['navigate', 'coming-soon'])
</script>

<template>
  <div class="app-layout">
    <AppSidebar
      :navigation-items="navigationItems"
      :active-view="activeView"
      @navigate="$emit('navigate', $event)"
      @coming-soon="$emit('coming-soon', $event)"
    />
    <div class="app-main">
      <AppTopbar :title="activeTitle" />
      <main class="app-content">
        <div class="app-content-container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-canvas);
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.app-content {
  width: 100%;
}

.app-content-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-xl);
}

@media (max-width: 880px) {
  .app-layout {
    flex-direction: column;
  }

  .app-content-container {
    padding: var(--space-md);
  }
}
</style>
