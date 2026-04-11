<template>
  <div class="panel-summary">
    <span
      v-for="item in items"
      :key="item.label"
      class="summary-chip summary-chip--stack"
      :class="{ 'summary-chip--warn': item.warn }"
    >
      <span class="summary-chip-label">{{ item.label }}</span>
      <span class="summary-chip-value">{{ item.value }}</span>
    </span>
    <span v-if="note" class="summary-text">{{ note }}</span>
  </div>
</template>

<script setup lang="ts">
export interface SummaryItem {
  label: string
  value: string
  warn?: boolean
}

interface Props {
  items: SummaryItem[]
  note?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.panel-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;
  margin-bottom: 10px;
}

.summary-chip {
  padding: 4px 8px;
  font-size: 11px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(88, 216, 255, 0.12);
  border: 1px solid rgba(88, 216, 255, 0.24);
  border-radius: 999px;
}

.summary-chip--stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  line-height: 1.1;
  border-radius: 12px;
}

.summary-chip-label,
.summary-chip-value {
  display: block;
  white-space: nowrap;
}

.summary-chip--warn {
  color: #ffcf8a;
  background: rgba(255, 178, 76, 0.14);
  border-color: rgba(255, 178, 76, 0.34);
}

.summary-text {
  margin-left: auto;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.52);
  white-space: nowrap;
}

@media (max-width: 1480px) {
  .panel-summary {
    flex-wrap: wrap;
    min-height: auto;
  }

  .summary-text {
    width: 100%;
    margin-left: 0;
  }
}
</style>
