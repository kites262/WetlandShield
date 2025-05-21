<template>
  <LayoutPanel>
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import { LayoutPanel } from '@/layout'
import { useEcharts } from '@/hooks'

// 获取 useEcharts 钩子，初始化容器和设置选项的方法
const { container, echarts, setOption } = useEcharts()

// 根据湿地监测数据需求生成图表配置选项
const generateOptions = () => {
  return {
    legend: {
      show: true,
      right: 0,
      textStyle: {
        color: '#fff',
      },
      // 修改图例名称为湿地监测相关
      data: ['湿地水位', '湿地污染指数']
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
      top: '20%',
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
      // 如果按月份统计，可以保留；否则根据实际监测点名称修改
      data: ['08月', '09月', '10月', '11月', '12月'],
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
        name: '湿地水位',
        type: 'bar',
        emphasis: { focus: 'series' },
        data: [320, 332, 301, 334, 390], // 这里替换为实际湿地水位数据
        barWidth: 20,
        barGap: '20%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 139, 34, 1)' },
            { offset: 1, color: 'rgba(34, 139, 34, 0.1)' },
          ]),
        },
      },
      {
        name: '湿地污染指数',
        type: 'bar',
        emphasis: { focus: 'series' },
        data: [220, 182, 191, 234, 290], // 这里替换为实际湿地污染指数数据
        barWidth: 20,
        barGap: '20%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(70, 130, 180, 1)' },
            { offset: 1, color: 'rgba(70, 130, 180, 0.1)' },
          ]),
        },
      },
    ],
  }
}

// 在组件挂载后，初始化图表并设置配置选项
onMounted(() => {
  nextTick(() => {
    const options = generateOptions()
    setOption(options)
  })
})
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
