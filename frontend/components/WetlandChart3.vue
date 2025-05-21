<template>
  <LayoutPanel>
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { LayoutPanel } from '@/layout'
import { nextTick, onMounted, ref } from 'vue'
import { useEcharts } from '@/hooks'
import * as echarts from 'echarts/core'

const { container, chart, setOption } = useEcharts()

// 生成图表选项配置
const generateOptions = () => ({
  legend: {
    show: true,
    right: 0,
    textStyle: {
      color: '#fff',
    },
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#000',
    borderColor: '#333',
    textStyle: {
      color: '#fff',
    },
  },
  grid: {
    left: '4%',
    right: '4%',
    bottom: '0%',
    top: '10%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#fff',
      margin: 10,
    },
    data: [...Array(30).keys()], // X轴数据
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#fff',
    },
    splitLine: {
      lineStyle: {
        color: '#c8c8c830',
        type: 'dashed',
      },
    },
  },
  series: [
    {
      smooth: true,
      showSymbol: false,
      data: Array.from({ length: 30 }).map(
        () => Math.floor(Math.random() * 90) + 10
      ), // 随机生成数据
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 254, 169, 1)' },
          { offset: 1, color: 'rgba(65, 138, 255, 0.2)' },
        ]),
      },
    },
  ],
})

// 在图表容器中设置图表选项
onMounted(() => {
  nextTick(() => {
    const options = generateOptions()
    setOption(options)
  })
})

// 监听窗口大小变化，自动调整图表大小
window.addEventListener('resize', () => {
  chart.value?.resize()
})
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
