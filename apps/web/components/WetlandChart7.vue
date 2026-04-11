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
  北侧补水闸站: [
    { label: '当前闸位', value: 35, unit: '%' },
    { label: '上游水位', value: 3.42, unit: '米' },
    { label: '下游水位', value: 3.18, unit: '米' },
    { label: '瞬时流量', value: 1.26, unit: 'm3/s' },
    { label: '累计补水量', value: 18.4, unit: '万m3' },
    { label: '启闭状态', value: '远程', unit: '' },
    { label: '最近动作', value: 14, unit: '分钟前' },
    { label: '供电状态', value: '正常', unit: '' },
  ],
  核心保育区样地: [
    { label: '植被盖度', value: 71, unit: '%' },
    { label: '优势群落', value: '芦苇', unit: '' },
    { label: '群落高度', value: 1.6, unit: '米' },
    { label: '土壤湿度', value: 29, unit: '%' },
    { label: '地表盐度', value: 0.18, unit: '%' },
    { label: '鸟类活动频次', value: 12, unit: '次/日' },
    { label: '人为干扰等级', value: '低', unit: '' },
    { label: '最近巡检', value: 6, unit: '小时前' },
  ],
  南岸气象站: [
    { label: '空气温度', value: 25.3, unit: '℃' },
    { label: '相对湿度', value: 74, unit: '%' },
    { label: '平均风速', value: 3.5, unit: '米/秒' },
    { label: '主导风向', value: '东南', unit: '' },
    { label: '本站气压', value: 1012, unit: 'hPa' },
    { label: '24h降雨量', value: 15, unit: '毫米' },
    { label: '太阳辐射', value: 486, unit: 'W/m2' },
    { label: '数据时效', value: 2, unit: '分钟' },
  ],
  出湖控制断面: [
    { label: '溶解氧', value: 6.8, unit: 'mg/L' },
    { label: '氨氮', value: 0.03, unit: 'mg/L' },
    { label: '总氮', value: 0.1, unit: 'mg/L' },
    { label: '高锰酸盐指数', value: 3.4, unit: 'mg/L' },
    { label: '总磷', value: 0.04, unit: 'mg/L' },
    { label: '浊度', value: 16, unit: 'NTU' },
    { label: 'pH', value: 7.3, unit: '' },
    { label: '站点评级', value: 'III类', unit: '' },
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
