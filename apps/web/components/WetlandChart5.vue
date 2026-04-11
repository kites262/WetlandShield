<template>
  <LayoutPanel>
    <div class="wrap">
      <div class="panel-summary">
        <span class="summary-chip summary-chip--warn">待核查 3</span>
        <span class="summary-chip">已闭环 5</span>
        <span class="summary-text">最近处置: 00:02:18</span>
      </div>
      <div class="list-viewport">
        <div
          class="item-list"
          ref="container"
          :class="{ 'no-transition': isResetting }"
          :style="{ transform: `translateY(-${offset}px)` }"
        >
          <div
            class="item"
            v-for="{ name, status, level, time } in list"
            :key="`${name}-${time}`"
            :class="{ error: status === 0 }"
          >
            <div class="item-circle"></div>
            <div class="item-name">{{ name }}</div>
            <div class="item-angle">{{ level }}</div>
            <div class="item-type">{{ status ? '已闭环' : '待核查' }}</div>
            <div class="item-time">{{ time }}</div>
          </div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { LayoutPanel } from '@/layout'
import { useVerticalMarquee } from '@/hooks/useVerticalMarquee'

const events = [
  ['北侧缓冲带水位偏低', 'III级', 0],
  ['上游来水口氨氮升高', 'II级', 0],
  ['南岸样地盖度回落', 'IV级', 1],
  ['出湖断面浊度波动', 'III级', 1],
  ['鸟类栖息区人流干扰', 'IV级', 1],
  ['补水闸站启闭记录异常', 'II级', 0],
  ['地下水井A传输延迟', 'IV级', 1],
  ['核心保育区巡检已完成', '提示', 1],
]

const { list, container, offset, isResetting } = useVerticalMarquee({
  source: events.map(([name, level, status]) => ({
    name,
    level,
    status,
    time: new Date().toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  })),
})
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow: hidden;
}
.panel-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  min-height: 24px;
  overflow: hidden;
}
.summary-chip {
  flex: 0 0 auto;
  min-width: 68px;
  padding: 4px 8px;
  font-size: 11px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(88, 216, 255, 0.12);
  border: 1px solid rgba(88, 216, 255, 0.28);
  border-radius: 999px;
  text-align: center;
  white-space: nowrap;
}
.summary-chip--warn {
  color: #ffcf8a;
  background: rgba(255, 178, 76, 0.14);
  border-color: rgba(255, 178, 76, 0.36);
}
.summary-text {
  margin-left: auto;
  white-space: nowrap;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.58);
}
.list-viewport {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 650ms ease;
  will-change: transform;
  &.no-transition {
    transition: none;
  }
  .item {
    position: relative;
    display: grid;
    grid-template-columns: 6px minmax(0, 1.8fr) 56px 72px 104px;
    column-gap: 10px;
    align-items: center;
    padding: 6px 8px;
    font-size: 15px;
    background: linear-gradient(90deg, rgba(88, 216, 255, 0.14), transparent);
    border-left: 2px solid rgba(88, 216, 255, 0.3);
    &.error {
      background: linear-gradient(90deg, rgba(255, 178, 76, 0.18), transparent);
      border-left-color: rgba(255, 178, 76, 0.7);
      .item-circle {
        background-color: #ffb24c;
      }
    }
    .item-circle {
      width: 5px;
      height: 10px;
      background-color: #58d8ff;
    }
    .item-name {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-angle {
      text-align: center;
      color: rgba(255, 255, 255, 0.82);
    }
    .item-type {
      text-align: center;
      color: rgba(255, 255, 255, 0.72);
      white-space: nowrap;
    }
    .item-time {
      white-space: nowrap;
      color: rgba(255, 255, 255, 0.6);
      text-align: end;
    }
  }
}
</style>
