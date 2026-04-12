<template>
  <LayoutPanel>
    <div class="container">
      <ChartSummaryBar
        :items="summaryItems"
        note="核心保育区植被恢复保持在目标线以上"
      />
      <div class="chart-container" ref="container"></div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from 'vue'
import { LayoutPanel } from '@/layout'
import { useEcharts } from '@/composables'
import ChartSummaryBar from '@/components/ChartSummaryBar.vue'

const { container, echarts, setOption } = useEcharts()

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const CURRENT_YEAR = [51.2, 52.4, 54.1, 56.8, 59.7, 61.9, 63.5, 64.6, 65.8, 66.9, 67.6, 68.4]
const LAST_YEAR = [48.6, 49.3, 50.8, 52.1, 54.2, 56.7, 58.1, 59.4, 60.8, 62.0, 62.7, 64.2]
const TARGET = 65
const CURRENT_INDEX = MONTHS.length - 1
const summaryItems = [
  { label: '本年覆盖率', value: '68.4%' },
  { label: '年度目标', value: '65.0%' },
  { label: '同比变化', value: '+4.2pct', warn: true },
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
    data: ['本年度覆盖率', '上年度覆盖率', '年度目标线'],
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
      const current = params.find((item) => item.seriesName === '本年度覆盖率')
      const previous = params.find((item) => item.seriesName === '上年度覆盖率')

      return [
        `<div style="margin-bottom:6px;color:rgba(255,255,255,0.7);">${month}</div>`,
        `<div>${current?.marker || ''}本年度覆盖率：${current?.value ?? '--'}%</div>`,
        `<div>${previous?.marker || ''}上年度覆盖率：${previous?.value ?? '--'}%</div>`,
        `<div style="margin-top:4px;color:rgba(255,255,255,0.58);">同比变化：${(((current?.value ?? 0) - (previous?.value ?? 0))).toFixed(1)}pct</div>`,
      ].join('')
    },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '2%',
    top: '24%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
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
      margin: 14,
    },
  },
  yAxis: {
    type: 'value',
    min: 45,
    max: 75,
    interval: 5,
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.56)',
      fontSize: 11,
      formatter: '{value}%',
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(125, 168, 202, 0.12)',
        type: 'dashed',
      },
    },
  },
  series: [
    {
      name: '本年度覆盖率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: CURRENT_YEAR,
      lineStyle: {
        width: 3,
        color: '#56efb7',
      },
      itemStyle: {
        color: '#56efb7',
        borderColor: 'rgba(7, 28, 30, 0.92)',
        borderWidth: 2,
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(86, 239, 183, 0.28)' },
          { offset: 1, color: 'rgba(86, 239, 183, 0)' },
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
          color: '#9ff6d2',
          fontSize: 11,
          formatter: ({ value }: { value: number }) => `${value}%`,
        },
        data: [{ coord: [MONTHS[CURRENT_INDEX], CURRENT_YEAR[CURRENT_INDEX]], value: CURRENT_YEAR[CURRENT_INDEX] }],
      },
      markLine: {
        symbol: 'none',
        lineStyle: {
          color: 'rgba(255, 178, 76, 0.7)',
          width: 1,
          type: 'dashed',
        },
        label: {
          color: '#ffcf8a',
          fontSize: 11,
          formatter: '目标线 65%',
        },
        data: [{ yAxis: TARGET }],
      },
    },
    {
      name: '上年度覆盖率',
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: LAST_YEAR,
      lineStyle: {
        width: 2,
        color: 'rgba(106, 162, 218, 0.92)',
      },
      itemStyle: {
        color: 'rgba(106, 162, 218, 0.92)',
      },
    },
    {
      name: '年度目标线',
      type: 'line',
      data: MONTHS.map(() => TARGET),
      lineStyle: {
        width: 0,
      },
      symbol: 'none',
      tooltip: {
        show: false,
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
