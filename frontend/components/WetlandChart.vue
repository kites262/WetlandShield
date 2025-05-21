<template>
  <div class="widget-panel">
    <div class="panel-header">
      <span class="title">{{ title }}</span>
    </div>
    <div class="panel-content">
      <div class="wetland-chart-container" ref="container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useEcharts from '@/hooks/useEcharts'
import { ref, onMounted } from 'vue'

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
    data: ['区域A', '区域B', '区域C', '区域D', '区域E'],
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
      name: '水质指数',
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
      name: '污染指数',
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
      name: '水质指数',
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
      name: '污染指数',
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
            color: '#00FEA8'
          }, {
            offset: 1,
            color: 'rgba(0,254,168,0.3)'
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
.widget-panel {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 15px;
  background: rgba(0, 21, 41, 80%);
  border: 1px solid #0a2f5a;
  border-radius: 4px;
}
.panel-header {
  display: flex;
  align-items: center;
  height: 30px;
  margin-bottom: 10px;
  .title {
    font-size: 16px;
    font-weight: bold;
    color: #fff;
  }
}
.panel-content {
  height: calc(100% - 40px);
}
.wetland-chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
