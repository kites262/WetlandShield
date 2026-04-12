<template>
  <LayoutPanel>
    <div class="container">
      <div class="rainfall-overview">
        <div class="overview-item">
          <div class="overview-label">30日累计降水</div>
          <div class="overview-value">186<span>mm</span></div>
          <div class="overview-note">较常年同期偏多 12%</div>
        </div>
        <div class="overview-item overview-item--emphasis">
          <div class="overview-label">峰值过程</div>
          <div class="overview-value">42<span>mm</span></div>
          <div class="overview-note">发生于 04-06，短时强降水</div>
        </div>
        <div class="overview-item">
          <div class="overview-label">连续降水日</div>
          <div class="overview-value">4<span>天</span></div>
          <div class="overview-note">当前过程仍在回落阶段</div>
        </div>
      </div>
      <div class="chart-container" ref="container"></div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { nextTick, onMounted } from 'vue'
import { LayoutPanel } from '@/layout'
import { useEcharts } from '@/composables'

const { container, echarts, setOption } = useEcharts()

const DAILY_RAINFALL = [
  2, 0, 0, 5, 12, 26, 42, 18, 6, 0,
  0, 3, 8, 14, 0, 0, 7, 19, 24, 11,
  4, 0, 0, 9, 13, 0, 0, 5, 7, 11,
]

const DATE_LABELS = Array.from({ length: 30 }, (_, index) =>
  dayjs().subtract(29 - index, 'day').format('MM-DD')
)

const ACCUMULATED_7D = DAILY_RAINFALL.map((_, index) => {
  const start = Math.max(0, index - 6)
  const total = DAILY_RAINFALL.slice(start, index + 1).reduce((sum, value) => sum + value, 0)
  return Number(total.toFixed(1))
})

const PEAK_INDEX = DAILY_RAINFALL.findIndex((value) => value === Math.max(...DAILY_RAINFALL))
const PEAK_VALUE = DAILY_RAINFALL[PEAK_INDEX]
const EVENT_WINDOWS = [
  [DATE_LABELS[4], DATE_LABELS[8]],
  [DATE_LABELS[17], DATE_LABELS[20]],
]

const generateOptions = () => ({
  legend: {
    top: -2,
    right: 0,
    itemWidth: 12,
    itemHeight: 8,
    textStyle: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 11,
    },
    data: ['日降水量', '7日累计'],
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 12, 22, 0.94)',
    borderColor: 'rgba(130, 207, 255, 0.2)',
    borderWidth: 1,
    textStyle: {
      color: '#fff',
      fontSize: 12,
    },
    extraCssText: 'box-shadow: 0 10px 30px rgba(0, 0, 0, 0.24);',
    formatter(params: any[]) {
      const day = params[0]?.axisValue || ''
      const rainfall = params.find((item) => item.seriesName === '日降水量')
      const rolling = params.find((item) => item.seriesName === '7日累计')

      return [
        `<div style="margin-bottom:6px;color:rgba(255,255,255,0.72);">${day}</div>`,
        `<div>${rainfall?.marker || ''}日降水量：${rainfall?.value ?? '--'} mm</div>`,
        `<div>${rolling?.marker || ''}7日累计：${rolling?.value ?? '--'} mm</div>`,
      ].join('')
    },
  },
  grid: {
    left: '4%',
    right: '6%',
    bottom: '4%',
    top: '24%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: DATE_LABELS,
    axisLine: {
      lineStyle: {
        color: 'rgba(125, 168, 202, 0.16)',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.62)',
      fontSize: 10,
      margin: 12,
      interval: 4,
    },
  },
  yAxis: [
    {
      type: 'value',
      name: 'mm',
      min: 0,
      max: 50,
      interval: 10,
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.42)',
        padding: [0, 22, 0, 0],
        fontSize: 11,
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.56)',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(125, 168, 202, 0.1)',
          type: 'dashed',
        },
      },
    },
    {
      type: 'value',
      name: 'mm',
      min: 0,
      max: 120,
      interval: 30,
      position: 'right',
      nameTextStyle: {
        color: 'rgba(255, 255, 255, 0.42)',
        padding: [22, 0, 0, 22],
        fontSize: 11,
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.56)',
        fontSize: 11,
      },
      splitLine: {
        show: false,
      },
    },
  ],
  series: [
    {
      name: '日降水量',
      type: 'bar',
      barWidth: 10,
      z: 2,
      data: DAILY_RAINFALL.map((value, index) => ({
        value,
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          color:
            index === PEAK_INDEX
              ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#ffd37e' },
                  { offset: 1, color: 'rgba(255, 159, 67, 0.35)' },
                ])
              : value >= 20
                ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#89d6ff' },
                    { offset: 1, color: 'rgba(70, 130, 210, 0.28)' },
                  ])
                : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(111, 204, 255, 0.78)' },
                    { offset: 1, color: 'rgba(60, 100, 184, 0.18)' },
                  ]),
        },
      })),
      markPoint: {
        symbol: 'roundRect',
        symbolSize: [58, 24],
        symbolOffset: [0, -12],
        itemStyle: {
          color: 'rgba(255, 186, 98, 0.14)',
          borderColor: 'rgba(255, 186, 98, 0.4)',
          borderWidth: 1,
        },
        label: {
          color: '#ffd79c',
          fontSize: 11,
          formatter: '峰值 42mm',
        },
        data: [{ coord: [DATE_LABELS[PEAK_INDEX], PEAK_VALUE] }],
      },
      markArea: {
        silent: true,
        itemStyle: {
          color: 'rgba(88, 216, 255, 0.06)',
        },
        data: EVENT_WINDOWS.map(([start, end]) => [
          { xAxis: start },
          { xAxis: end },
        ]),
      },
    },
    {
      name: '7日累计',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      showSymbol: false,
      z: 3,
      data: ACCUMULATED_7D,
      lineStyle: {
        width: 2,
        color: '#5ef0cf',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(94, 240, 207, 0.18)' },
          { offset: 1, color: 'rgba(94, 240, 207, 0)' },
        ]),
      },
    },
  ],
  animationDuration: 1000,
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

.rainfall-overview {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.overview-item {
  padding: 8px 10px;
  background:
    linear-gradient(180deg, rgba(109, 186, 255, 0.1), rgba(109, 186, 255, 0.02)),
    rgba(9, 22, 38, 0.72);
  border: 1px solid rgba(130, 207, 255, 0.16);
  border-radius: 10px;
}

.overview-item--emphasis {
  background:
    linear-gradient(180deg, rgba(255, 186, 98, 0.16), rgba(255, 186, 98, 0.03)),
    rgba(16, 22, 32, 0.76);
  border-color: rgba(255, 186, 98, 0.22);
}

.overview-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.58);
}

.overview-value {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1;
  font-weight: 700;
  color: #f7fbff;
  font-variant-numeric: tabular-nums;
}

.overview-value span {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.62);
}

.overview-note {
  margin-top: 6px;
  font-size: 11px;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.5);
}

.chart-container {
  flex: 1;
  min-height: 0;
}

@media (max-width: 1480px) {
  .rainfall-overview {
    grid-template-columns: 1fr;
  }
}
</style>
