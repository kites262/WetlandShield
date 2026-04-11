<template>
  <div class="layout-panel" :style="panelStyle">
    <div class="panel-header">
      <div class="panel-header-title">{{ title }}</div>
    </div>
    <div class="panel-body">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface PropsType {
  title?: string | number
  enterDelay?: string | number
}
const props = defineProps<PropsType>()

const resolveDelay = (title?: string | number) => {
  const seed = String(title ?? 'layout-panel')
  const delaySteps = [0, 60, 120, 180]
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  return `${delaySteps[hash % delaySteps.length]}ms`
}

const normalizeDelay = (value: string | number) =>
  typeof value === 'number' ? `${value}ms` : value

const panelStyle = computed(() => ({
  '--panel-enter-delay':
    props.enterDelay !== undefined
      ? normalizeDelay(props.enterDelay)
      : resolveDelay(props.title),
}))
</script>
<style lang="scss" scoped>
.layout-panel {
  position: relative;
  height: 100%;
  color: #fff;
  background-image: url('@/assets/images/panel_body_bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  opacity: 0;
  transform: translateY(14px);
  animation: panel-enter 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--panel-enter-delay, 0ms);
  .panel-header {
    position: relative;
    display: flex;
    align-items: center;
    height: 65px;
    overflow: hidden;
    font-family: DouyuFont;
    background-image: url('@/assets/images/panel_title_bg.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    &::after {
      position: absolute;
      inset: 0 auto 0 0;
      width: 140px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.16),
        transparent
      );
      transform: translateX(-160%);
      animation: panel-header-sheen 1.1s ease-out both;
      animation-delay: calc(var(--panel-enter-delay, 0ms) + 160ms);
    }
    .panel-header-title {
      position: relative;
      top: -12px;
      left: 70px;
      font-size: 15px;
    }
  }
  .panel-body {
    box-sizing: border-box;

    // height: 220px;
    height: calc(100% - 65px);
    padding: 0 10px 10px;
    overflow: hidden;
  }
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes panel-header-sheen {
  from {
    transform: translateX(-160%);
  }
  to {
    transform: translateX(320%);
  }
}
</style>
