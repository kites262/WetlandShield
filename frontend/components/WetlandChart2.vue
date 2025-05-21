<template>
  <LayoutPanel>
    <div class="container" ref="container"></div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { LayoutPanel } from '@/layout'
import { useEcharts } from '@/hooks'

// 获取 useEcharts 钩子，初始化容器和设置选项的方法
const { container, echarts, setOption } = useEcharts()

// 响应式数据，动态获取数据源
const sources = ref([
  [859, 571, 612, 906, 866, 984, 212, 931, 749, 993, 276, 477],
  [598, 539, 861, 375, 576, 383, 896, 430, 315, 755, 808, 630],
])

// 根据湿地监测数据生成图表配置选项
const generateOptions = (sources: any[][]) => {
  return {
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
      left: '1%',
      right: '6%',
      bottom: '0%',
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#fff',
        margin: 20,
      },
      data: [
        '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月',
      ],
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#c8c8c8',
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
        name: '2024',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          normal: {
            width: 2,
            color: 'rgba(0, 254, 169, 1)', // 湿地水位颜色
          },
        },
        itemStyle: {
          color: 'rgba(0, 254, 169, 0.5)',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(31, 218, 163, 0.4)', // 渐变颜色
            },
            {
              offset: 1,
              color: 'rgba(31, 218, 163, 0)',
            },
          ]),
        },
        data: sources[0], // 第一个数据源
      },
      {
        name: '2023',
        type: 'line',
        symbol: 'none',
        smooth: true,
        lineStyle: {
          normal: {
            width: 2,
            color: 'rgba(87, 153, 214, 1)', // 湿地污染指数颜色
          },
        },
        itemStyle: {
          color: 'rgba(87, 153, 214, 1)',
        },
        data: sources[1], // 第二个数据源
      },
    ],
  }
}

// 初始化图表，并设置默认选项
onMounted(() => {
  nextTick(() => {
    const options = generateOptions(sources.value)
    setOption(options)
  })
})

// 模拟动态更新数据
// 例如，在一段时间后更新数据
setTimeout(() => {
  sources.value = [
    [500, 450, 600, 400, 700, 800, 900, 600, 650, 300, 700, 1000],
    [250, 300, 400, 500, 300, 400, 200, 600, 500, 700, 800, 650],
  ]
  const options = generateOptions(sources.value)
  setOption(options) // 更新图表
}, 5000) // 5秒后更新数据
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
