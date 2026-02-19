<script setup>
defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  rows: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width || 'auto', textAlign: column.align || 'left' }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="row.id || rowIndex">
          <td
            v-for="column in columns"
            :key="column.key"
            :style="{ textAlign: column.align || 'left' }"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
  overflow-y: visible;
  position: relative;
  scrollbar-gutter: stable;
}

.table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
  min-width: var(--table-min-width, 520px);
  table-layout: auto;
}

.table th,
.table td {
  padding: calc(var(--space-sm) * 1.4) calc(var(--space-sm) * 1.2);
  border-bottom: 1px solid var(--color-border-default);
  font-size: 0.79rem;
  white-space: nowrap;
}

.table th {
  font-weight: 620;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.72rem;
}

.table td {
  color: var(--color-text-primary);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

</style>
