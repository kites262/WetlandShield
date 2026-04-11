<template>
  <LayoutPanel :title="title">
    <div class="panel-content">
      <div class="panel-summary">
        <span class="summary-chip summary-chip--warn">高风险 2</span>
        <span class="summary-chip">中风险 1</span>
        <span class="summary-text">最新评估: 2分钟前</span>
      </div>
      <div class="wetland-chart-container" ref="container"></div>
    </div>
  </LayoutPanel>
</template>

<script setup lang="ts">
import useEcharts from '@/hooks/useEcharts'
import { ref, onMounted } from 'vue'
import { LayoutPanel } from '@/layout'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
})

const { container, setOption } = useEcharts()

const generateWetlandChartOptions = () => ({
  backgroundColor: 'transparent',
  legend: {
    show: true,
    right: 10,
    top: 0,
    textStyle: {
      color: '#fff',
      fontSize: 12
    },
    itemWidth: 15,
    itemHeight: 10,
    itemGap: 25
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(0,21,41,0.9)',
    borderColor: '#0a2f5a',
    textStyle: {
      color: '#fff',
    },
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    top: '15%',
    left: '3%',
    right: '4%',
    bottom: '8%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['上游来水口', '核心保育区', '北侧缓冲带', '南侧芦苇带', '出湖断面'],
    axisLine: {
      show: true,
      lineStyle: {
        color: '#0a2f5a'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#fff',
      fontSize: 12,
      margin: 15
    }
  },
  yAxis: [
    {
      type: 'value',
      name: '综合水质分',
      nameTextStyle: {
        color: '#fff',
        fontSize: 12,
        padding: [0, 30, 0, 0]
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#0a2f5a'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#fff',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(10,47,90,0.3)',
          type: 'dashed'
        }
      }
    },
    {
      type: 'value',
      name: '风险指数',
      nameTextStyle: {
        color: '#fff',
        fontSize: 12,
        padding: [0, 0, 0, 30]
      },
      position: 'right',
      axisLine: {
        show: true,
        lineStyle: {
          color: '#0a2f5a'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#fff',
        fontSize: 12
      },
      splitLine: {
        show: false
      }
    }
  ],
  series: [
    {
      name: '综合水质分',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: [320, 332, 301, 334, 390],
      itemStyle: {
        color: '#58D8FF'
      },
      lineStyle: {
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgba(88,216,255,0.3)'
          }, {
            offset: 1,
            color: 'rgba(88,216,255,0)'
          }]
        }
      }
    },
    {
      name: '风险指数',
      type: 'bar',
      yAxisIndex: 1,
      data: [220, 182, 191, 234, 290],
      barWidth: 20,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: '#ffb24c'
          }, {
            offset: 1,
            color: 'rgba(255,178,76,0.25)'
          }]
        },
        borderRadius: [4, 4, 0, 0]
      }
    }
  ]
})

onMounted(() => {
  setOption(generateWetlandChartOptions())
})
</script>

<style scoped lang="scss">
.panel-content {
  height: 100%;
}
.panel-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.summary-chip {
  padding: 4px 8px;
  font-size: 11px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.86);
  background: rgba(88, 216, 255, 0.12);
  border: 1px solid rgba(88, 216, 255, 0.28);
  border-radius: 999px;
}
.summary-chip--warn {
  color: #ffcf8a;
  background: rgba(255, 178, 76, 0.14);
  border-color: rgba(255, 178, 76, 0.36);
}
.summary-text {
  margin-left: auto;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.58);
}
.wetland-chart-container {
  width: 100%;
  height: calc(100% - 30px);
  min-height: 300px;
}
</style>
