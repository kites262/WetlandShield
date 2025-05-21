import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import * as echarts from 'echarts/core'
import { isElement } from 'lodash-es'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
} from 'echarts/components'
import { UniversalTransition, LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
])

/**
 * 用法如下
 * - 函数执行后导出`container`、`setOption`、`resize`方法
 * - 将`container`通过`ref`绑定到模板容器中
 * - 获取数据后通过`setOption`设置图表数据
 * - 如果需要重新渲染图表，调用`resize`方法
 */
export function useEcharts() {
  let cache = {}
  const container = ref()
  const chart = shallowRef()

  const resize = () => {
    if (chart.value) {
      chart.value.resize()
    }
  }
  
  const clear = () => {
    if (chart.value) {
      chart.value.clear()
    }
  }

  // 初始化图表
  const boostrap = (theme = 'dark') => {
    if (chart.value) {
      chart.value.dispose()
    }
    if (isElement(container.value)) {
      chart.value = echarts.init(container.value, theme)
      // 设置动画
      chart.value.setOption({
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicInOut'
      })
    } else {
      console.warn('容器还未初始化')
    }
  }

  // 设置图表的选项和数据
  const setOption = (option: any) => {
    cache = option
    if (!chart.value) {
      boostrap()
    }
    chart.value?.setOption(option)
  }

  // 清理图表
  const clearData = () => {
    cache = {}
    clear()
  }

  // 在组件卸载时清理
  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    if (chart.value) {
      chart.value.dispose()
    }
  })

  // 在组件挂载时初始化
  onMounted(() => {
    boostrap()
    window.addEventListener('resize', resize)
  })

  return { container, chart, setOption, resize, clearData, echarts }
}

export default useEcharts
