<template>
  <LayoutPanel>
    <div class="wrap">
      <div class="item-list" ref="container">
        <div
          class="item"
          v-for="{ name, status, time } in list"
          :class="{ error: status === 0 }"
        >
          <div class="item-circle"></div>
          <div class="item-name">{{ name }}</div>
          <div class="item-type">{{ status ? '正常' : '部件异常' }}</div>
          <div class="item-time">{{ time }}</div>
        </div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { LayoutPanel } from '@/layout'
import { ref, onMounted, onUnmounted } from 'vue'
import { Random } from 'mockjs'

const wetlandEquipments = [
  '水质监测仪',
  '湿地传感器',
  '水位控制阀',
  '水流监测器',
  '湿地气候传感器',
  '生态调节设备',
  '水质自动调节装置',
  '湿地植物生长监测仪',
]

const list = ref<any[]>(
  wetlandEquipments.map((eq) => ({
    name: eq,
    status: Random.pick([0, 1]),
    time: Random.date('MM/dd HH:mm:ss'),
  }))
)

const container = ref()

let timer: any
onMounted(() => {
  if (timer) window.clearInterval(timer)
  timer = setInterval(() => {
    if (!container.value) return
    try {
      container.value.classList.add('scroll')
      setTimeout(() => {
        if (!timer || !container.value) return
        try {
          container.value.classList.remove('scroll')
          list.value.push(list.value.shift())
        } catch (error) {
          console.error('Error updating scroll animation:', error)
        }
      }, 2000)
    } catch (error) {
      console.error('Error adding scroll animation:', error)
    }
  }, 3000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
@keyframes row-out {
  from {
    top: 0;
  }
  to {
    top: -36px;
  }
}
.wrap {
  height: 100%;
  overflow: hidden;
}
.item-list {
  display: flex;
  flex-direction: column;
  grid-gap: 8px;
  height: 670px;
  &.scroll {
    position: relative;
    animation: row-out 1s linear forwards;
    .row:first-child {
      opacity: 0;
      transition: opacity 1s;
    }
  }
  .item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 5px;
    font-size: 16px;
    background: linear-gradient(90deg, #74fabd22, transparent);
    &.error {
      background: linear-gradient(90deg, #e38d7022, transparent);
      .item-circle {
        background-color: #e38d70;
      }
    }
    .item-circle {
      position: absolute;
      left: 10px;
      width: 5px;
      height: 10px;
      background-color: #74fabd;
    }
    .item-name {
      width: 30%;
      padding-left: 15px;
    }
    .item-type {
      width: 30%;
    }
    .item-time {
      width: 60%;
      text-align: end;
    }
  }
}
</style>
