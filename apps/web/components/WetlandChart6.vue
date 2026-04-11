<template>
  <LayoutPanel>
    <div class="wrap">
      <div class="list-viewport">
        <div
          class="item-list"
          ref="container"
          :class="{ 'no-transition': isResetting }"
          :style="{ transform: `translateY(-${offset}px)` }"
        >
          <div
            class="item"
            v-for="{ id, name, status, time } in list"
            :key="id"
            :class="{ error: status === 0 }"
          >
            <div class="item-circle"></div>
            <div class="item-name">{{ name }}</div>
            <div class="item-type">{{ status ? '在线' : '离线' }}</div>
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

interface EquipmentItem {
  id: string
  name: string
  status: 0 | 1
  time: string
}

const source: EquipmentItem[] = [
  { id: 'wl-01', name: '1号水位计', status: 1, time: '04/11 09:14:07' },
  { id: 'wl-02', name: '2号多参数水质仪', status: 1, time: '04/11 09:13:52' },
  { id: 'wl-03', name: '北岸雨量站', status: 0, time: '04/11 09:08:31' },
  { id: 'wl-04', name: '南岸气象站', status: 1, time: '04/11 09:14:10' },
  { id: 'wl-05', name: '入湖口流速仪', status: 1, time: '04/11 09:13:45' },
  { id: 'wl-06', name: '出湖断面视频杆', status: 1, time: '04/11 09:14:01' },
  { id: 'wl-07', name: '地下水观测井A', status: 0, time: '04/11 09:06:18' },
  { id: 'wl-08', name: '生态补水闸控柜', status: 1, time: '04/11 09:13:27' },
]

const { list, container, offset, isResetting } =
  useVerticalMarquee<EquipmentItem>({
    source,
  })
</script>

<style lang="scss" scoped>
.wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
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
