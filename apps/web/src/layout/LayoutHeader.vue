<template>
  <div class="layout-header">
    <div class="header-midden">
      <div class="cn">湿地生态监测预警平台</div>
      <div class="en">Wetland Ecological Monitoring and Early Warning Platform</div>
    </div>
    <div class="header-left">
      <i class="fa-regular fa-envelope"></i>
      <div
        class="message"
        content="【系统播报】当前已接入12个监测点、3类遥感图层与8类水文气象指标，最近一次数据同步完成于2分钟前。"
      ></div>
    </div>
    <div class="header-right">
      <span>{{ state.time }}</span>
      <span>{{ state.date }}</span>
      <span>{{ state.week }}</span>
      <span>现场 25°C</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const state = reactive({
  time: '--:--:--',
  date: '--/--/--',
  week: '--',
})

const updateState = () => {
  const today = dayjs()
  state.time = today.format('HH:mm:ss')
  state.date = today.format('MM/DD/YYYY')
  state.week = today.format('dddd')
}

let interval: number | null = null

onMounted(() => {
  updateState()
  interval = window.setInterval(updateState, 1000)
})

onUnmounted(() => {
  if (interval) {
    window.clearInterval(interval)
    interval = null
  }
})
</script>

<style lang="scss" scoped>
@mixin font-color() {
  background: linear-gradient(0deg, #b9cfff 0%, #fff 99%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes text-roll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes light-go {
  from {
    left: 500px;
  }
  to {
    left: 1100px;
    opacity: 0;
  }
}
.layout-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  background-image: url(@/assets/images/title_bg.png); /* 修改为湿地主题背景图 */
  background-repeat: no-repeat;
  background-position: center top;
  background-size: 100% 100%;
  &::after {
    position: absolute;
    bottom: -55px;
    left: 500px;
    width: 100%;
    width: 500px;
    height: 100px;
    content: '';
    background-image: url(@/assets/images/light_bg.png); /* 修改为生态主题光效背景 */
    background-repeat: no-repeat;
    background-size: contain;
    animation: light-go 3s ease-in-out infinite forwards;
  }
  .header-midden {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    overflow-x: hidden;
    font-family: '微软雅黑', Arial, sans-serif; /* 使用适合中文的字体 */
    color: #fff;
    .cn {
      font-size: 30px;
      @include font-color;
    }
    .en {
      position: relative;
      font-size: 10px;
      @include font-color;
    }
  }
  .header-left {
    position: absolute;
    top: 12px;
    left: 30px;
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 34px;
    padding: 0;
    font-size: 18px;
    color: rgba(239, 248, 255, 0.96);
    i {
      position: relative;
      top: -1px;
      color: #294763;
      text-shadow: 0 1px 0 rgba(232, 245, 255, 0.28);
    }
    .message {
      display: flex;
      width: 400px;
      overflow: hidden;
      font-size: 15px;
      &::after {
        width: auto;
        text-wrap: nowrap;
        content: attr(content);
        animation: text-roll 20s linear infinite;
        color: #294763;
        text-shadow:
          0 1px 0 rgba(236, 247, 255, 0.32),
          0 1px 8px rgba(102, 170, 218, 0.08);
      }
    }
  }
  .header-right {
    position: absolute;
    top: 12px;
    right: 30px;
    display: flex;
    gap: 18px;
    align-items: center;
    min-height: 34px;
    padding: 0;
    font-size: 16px;
    color: rgba(243, 249, 255, 0.96);
    span {
      position: relative;
      display: flex;
      align-items: center;
      top: -1px;
      color: #294763;
      text-shadow:
        0 1px 0 rgba(236, 247, 255, 0.32),
        0 1px 8px rgba(102, 170, 218, 0.08);
      &:not(:last-child)::after {
        position: absolute;
        right: -9px;
        width: 2px;
        height: 10px;
        content: '';
        background-color: rgba(49, 82, 112, 0.28);
      }
    }
  }
}
</style>
