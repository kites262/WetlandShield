<template>
  <LayoutPanel>
    <div class="container">
      <div class="panel-summary panel-summary--full">
        <span class="summary-chip">在线 6</span>
        <span class="summary-chip summary-chip--warn">预警 3</span>
        <span class="summary-text">采样更新时间: 00:01:42</span>
      </div>
      <div
        class="item"
        v-for="(item, index) in source"
        :key="index"
        :class="{ error: item.status }"
      >
        <div class="icon" :class="item.icon"></div>
        <div class="label">{{ item.label }}</div>
        <div class="value">{{ item.value }}</div>
        <div class="unit">{{ item.unit }}</div>
        <i class="alert fa-solid fa-triangle-exclamation"></i>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { LayoutPanel } from '@/layout'

const source = [
  {
    icon: 'fa-solid fa-water-rise',
    label: '断面水位',
    value: '3.26',
    unit: 'm',
    status: true,
  },
  {
    icon: 'fa-solid fa-seedling',
    label: '植被盖度',
    value: '68',
    unit: '%',
    status: false,
  },
  {
    icon: 'fa-solid fa-wind',
    label: '瞬时风速',
    value: '3.8',
    unit: 'm/s',
    status: false,
  },
  {
    icon: 'fa-solid fa-wave-square',
    label: '溶解氧',
    value: '7.6',
    unit: 'mg/L',
    status: false,
  },
  {
    icon: 'fa-solid fa-vial',
    label: '浊度',
    value: '18',
    unit: 'NTU',
    status: true,
  },
  {
    icon: 'fa-solid fa-temperature-half',
    label: '地表水温',
    value: '18.4',
    unit: '℃',
    status: false,
  },
  {
    icon: 'fa-solid fa-droplet',
    label: '相对湿度',
    value: '74',
    unit: '%',
    status: false,
  },
  {
    icon: 'fa-solid fa-water-arrow-down',
    label: '地下水埋深',
    value: '1.5',
    unit: 'm',
    status: true,
  },
  {
    icon: 'fa-solid fa-bolt',
    label: '导电率',
    value: '462',
    unit: 'μS/cm',
    status: true,
  },
]
</script>

<style lang="scss" scoped>
$emphasize-color: #74f7fd;
.container {
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto repeat(3, 1fr);
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  height: 100%;
  padding-top: 10px;

  $icon-size: 34px;
  .panel-summary {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .summary-chip {
    padding: 4px 8px;
    font-size: 11px;
    line-height: 1;
    color: rgba(255, 255, 255, 0.86);
    background: rgba(88, 216, 255, 0.12);
    border: 1px solid rgba(88, 216, 255, 0.28);
    border-radius: 999px;
  }
  .summary-chip--warn {
    color: #ffcf8a;
    background: rgba(255, 178, 76, 0.14);
    border-color: rgba(255, 178, 76, 0.36);
  }
  .summary-text {
    margin-left: auto;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.58);
  }
  .item {
    position: relative;
    box-sizing: border-box;
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    grid-template-columns: $icon-size minmax(0, 1fr);
    grid-column-gap: 12px;
    grid-row-gap: 6px;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 10px 12px;
    overflow: hidden;
    background-color: rgba(93, 101, 122, 20%);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    &.error {
      .icon {
        color: #ffb24c;
        border: 1px solid #ffb24c;
        border-radius: 50%;
      }
      .alert {
        color: rgba(255, 178, 76, 0.18);
      }
      .label,
      .value {
        color: #ffcf8a;
      }
    }
    .icon {
      position: relative;
      z-index: 1;
      display: flex;
      grid-row: 1 / 4;
      grid-column: 1;
      align-items: center;
      justify-content: center;
      justify-self: start;
      width: $icon-size;
      height: $icon-size;
      border: 1px solid #fff;
      border-radius: 50%;
    }
    .label {
      grid-column: 2;
      grid-row: 1;
      min-width: 0;
      align-self: end;
      justify-self: center;
      transform: translateY(-5px);
      font-size: 12px;
      line-height: 1;
      letter-spacing: 0.02em;
      color: rgba(255, 255, 255, 0.72);
      text-align: center;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 100%;
    }
    .value {
      grid-column: 2;
      grid-row: 2;
      min-width: 0;
      align-self: center;
      justify-self: center;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 20px;
      line-height: 1;
      color: #fff;
      white-space: nowrap;
      font-weight: bold;
      font-variant-numeric: tabular-nums;
    }
    .unit {
      grid-column: 2;
      grid-row: 3;
      min-width: 0;
      align-self: start;
      justify-self: center;
      transform: translateY(5px);
      font-size: 11px;
      line-height: 1;
      color: rgba(255, 255, 255, 0.72);
      white-space: nowrap;
    }
    .alert {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 70px;
      color: #ffffff09;
    }
  }
}

@media (max-width: 1480px) {
  .container {
    .item {
      padding: 8px 10px;
      grid-row-gap: 4px;
    }
  }
}
</style>
