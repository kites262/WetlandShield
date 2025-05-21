<template>
  <LayoutPanel>
    <div class="container">
      <div class="item" v-for="item in list" :key="item.label">
        <div class="item-label">{{ item.label }}</div>
        <div class="item-value">{{ item.value }}{{ item.unit }}</div>
      </div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { LayoutPanel } from '@/layout'
import { computed } from 'vue'

interface PropsType {
  name: string
}

const props = defineProps<PropsType>()

const CONFIG: any = {
  湿地水位监测: [
    { label: '水位高度', value: 2.5, unit: '米' },
    { label: '水位变化速率', value: 0.1, unit: '米/小时' },
    { label: '水位警戒值', value: 3.0, unit: '米' },
    { label: '水位波动', value: 0.05, unit: '米' },
    { label: '水温', value: 18, unit: '摄氏度' },
    { label: '水质', value: '良好', unit: '' },
    { label: '溶解氧', value: 7.2, unit: '毫克/升' },
    { label: 'pH值', value: 7.5, unit: '' },
    { label: '氨氮浓度', value: 0.02, unit: '毫克/升' },
    { label: '总磷浓度', value: 0.05, unit: '毫克/升' },
    { label: '泥沙浓度', value: 0.5, unit: '克/升' },
    { label: '水流速度', value: 0.8, unit: '米/秒' },
    { label: '水位监测时间', value: 360, unit: '小时' },
  ],
  湿地生物监测: [
    { label: '鸟类数量', value: 120, unit: '只' },
    { label: '鱼类数量', value: 1500, unit: '条' },
    { label: '植物种类', value: 25, unit: '种' },
    { label: '湿地生态指数', value: 85, unit: '' },
    { label: '湿地生物多样性', value: '高', unit: '' },
    { label: '湿地植被覆盖率', value: 80, unit: '%' },
    { label: '湿地污染物总量', value: 5, unit: '吨' },
    { label: '湿地生物监测周期', value: 6, unit: '月' },
  ],
  气象监测: [
    { label: '空气温度', value: 25, unit: '摄氏度' },
    { label: '湿度', value: 60, unit: '%' },
    { label: '风速', value: 3.5, unit: '米/秒' },
    { label: '风向', value: '东南', unit: '' },
    { label: '气压', value: 1012, unit: '百帕' },
    { label: '降水量', value: 15, unit: '毫米' },
    { label: 'UV指数', value: 5, unit: '' },
    { label: '气象监测时间', value: 24, unit: '小时' },
  ],
  水质监测: [
    { label: '溶解氧', value: 6.8, unit: '毫克/升' },
    { label: '氨氮浓度', value: 0.03, unit: '毫克/升' },
    { label: '总氮浓度', value: 0.1, unit: '毫克/升' },
    { label: '水质等级', value: '良好', unit: '' },
    { label: 'COD浓度', value: 10, unit: '毫克/升' },
    { label: '总磷浓度', value: 0.04, unit: '毫克/升' },
    { label: 'pH值', value: 7.3, unit: '' },
  ]
}

const list = computed(() => {
  return CONFIG[props.name] || []
})
</script>

<style lang="scss" scoped>
.container {
  display: grid;
  grid-template-rows: repeat(4, 1fr);
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 10px;
  height: 100%;
  overflow: hidden;
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(93, 101, 122, 20%);
    .item-label {
      font-size: 12px;
    }
    .item-value {
      margin-top: 4px;
      font-size: 12px;
      color: #74f7fd;
    }
  }
}
</style>
