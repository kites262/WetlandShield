<template>
  <LayoutPanel>
    <div class="container">
      <ChartSummaryBar :items="summaryItems" note="近6个月生态补水保持稳定" />
      <div class="chart-container" ref="container"></div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import { LayoutPanel } from '@/layout'
import { useEcharts } from '@/hooks'
import ChartSummaryBar from '@/components/ChartSummaryBar.vue'

const { container, echarts, setOption } = useEcharts()

const MONTHS = ['07月', '08月', '09月', '10月', '11月', '12月']
const WATER_LEVELS = [3.06, 3.1, 3.08, 3.15, 3.14, 3.18]
const REPLENISHMENT = [12.8, 15.6, 11.9, 18.4, 17.2, 20.6]
const CURRENT_INDEX = MONTHS.length - 1
const summaryItems = [
  { label: '本月均位', value: '3.18m' },
  { label: '补水总量', value: '20.6万m3' },
  { label: '环比变化', value: '+0.04m', warn: true },
]

const generateOptions = () => ({
  legend: {
    top: 0,
    right: 0,
    itemWidth: 14,
    itemHeight: 8,
    textStyle: {
      color: 'rgba(255, 255, 255, 0.72)',
      fontSize: 11,
    },
    data: ['生态补水量', '平均水位'],
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(4, 12, 24, 0.94)',
    borderColor: 'rgba(88, 216, 255, 0.2)',
    borderWidth: 1,
    textStyle: {
      color: '#fff',
      fontSize: 12,
    },
    extraCssText: 'box-shadow: 0 10px 30px rgba(0, 0, 0, 0.24);',
    formatter(params: any[]) {
      const month = params[0]?.axisValue || ''
      const replenishment = params.find((item) => item.seriesName === '生态补水量')
      const waterLevel = params.find((item) => item.seriesName === '平均水位')

      return [
        `<div style="margin-bottom:6px;color:rgba(255,255,255,0.7);">${month}</div>`,
        `<div>${replenishment?.marker || ''}生态补水量：${replenishment?.value ?? '--'} 万m3</div>`,
        `<div>${waterLevel?.marker || ''}平均水位：${waterLevel?.value ?? '--'} m</div>`,
      ].join('')
    },
  },
  grid: {
    left: '4%',
    right: '6%',
    bottom: '2%',
    top: '24%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: MONTHS,
    axisLine: {
      lineStyle: {
        color: 'rgba(125, 168, 202, 0.18)',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.72)',
      margin: 12,
    },
  },
  yAxis: [
    {
      type: 'value',
      name: '万m3',
      min: 0,
      max: 24,
      interval: 6,
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.46)',
        padding: [0, 24, 0, 0],
        fontSize: 11,
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.56)',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(125, 168, 202, 0.12)',
          type: 'dashed',
        },
      },
    },
    {
      type: 'value',
      name: 'm',
      min: 2.9,
      max: 3.3,
      interval: 0.1,
      position: 'right',
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.46)',
        padding: [0, 0, 0, 24],
        fontSize: 11,
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.56)',
        fontSize: 11,
        formatter: '{value}',
      },
      splitLine: {
        show: false,
      },
    },
  ],
  series: [
    {
      name: '生态补水量',
      type: 'bar',
      barWidth: 16,
      data: REPLENISHMENT.map((value, index) => ({
        value,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color:
            index === CURRENT_INDEX
              ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#7de3ff' },
                  { offset: 1, color: 'rgba(57, 132, 214, 0.28)' },
                ])
              : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(48, 128, 206, 0.9)' },
                  { offset: 1, color: 'rgba(48, 128, 206, 0.18)' },
                ]),
          shadowColor:
            index === CURRENT_INDEX ? 'rgba(88, 216, 255, 0.28)' : 'transparent',
          shadowBlur: index === CURRENT_INDEX ? 14 : 0,
        },
      })),
      emphasis: {
        focus: 'series',
      },
      markPoint: {
        symbol: 'roundRect',
        symbolSize: [48, 22],
        symbolOffset: [0, -10],
        itemStyle: {
          color: 'rgba(255, 178, 76, 0.16)',
          borderColor: 'rgba(255, 178, 76, 0.42)',
          borderWidth: 1,
        },
        label: {
          color: '#ffcf8a',
          fontSize: 11,
          formatter: '本月',
        },
        data: [{ coord: [MONTHS[CURRENT_INDEX], REPLENISHMENT[CURRENT_INDEX]] }],
      },
    },
    {
      name: '平均水位',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: WATER_LEVELS,
      itemStyle: {
        color: '#5df6da',
        borderColor: 'rgba(6, 30, 39, 0.92)',
        borderWidth: 2,
      },
      lineStyle: {
        width: 3,
        color: '#5df6da',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(93, 246, 218, 0.18)' },
          { offset: 1, color: 'rgba(93, 246, 218, 0)' },
        ]),
      },
      markPoint: {
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#ffffff',
        },
        label: {
          show: true,
          position: 'top',
          distance: 8,
          color: '#8ff8e6',
          fontSize: 11,
          formatter: ({ value }: { value: number }) => `${value}m`,
        },
        data: [{ coord: [MONTHS[CURRENT_INDEX], WATER_LEVELS[CURRENT_INDEX]], value: WATER_LEVELS[CURRENT_INDEX] }],
      },
    },
  ],
  animationDuration: 900,
  animationEasing: 'cubicOut',
})

onMounted(() => {
  nextTick(() => {
    setOption(generateOptions())
  })
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chart-container {
  flex: 1;
  min-height: 0;
}
</style>
