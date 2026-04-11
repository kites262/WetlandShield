import { nextTick, onMounted, onUnmounted, ref, type Ref } from 'vue'

interface UseVerticalMarqueeOptions<T> {
  source: T[]
  itemSelector?: string
  interval?: number
  duration?: number
}

interface UseVerticalMarqueeResult<T> {
  list: Ref<T[]>
  container: Ref<HTMLElement | undefined>
  offset: Ref<number>
  isResetting: Ref<boolean>
  updateShiftHeight: () => void
}

export function useVerticalMarquee<T>(
  options: UseVerticalMarqueeOptions<T>
): UseVerticalMarqueeResult<T> {
  const {
    source,
    itemSelector = '.item',
    interval = 3200,
    duration = 650,
  } = options

  const list = ref(source.slice() as T[]) as Ref<T[]>
  const container = ref<HTMLElement>()
  const shiftHeight = ref(0)
  const offset = ref(0)
  const isResetting = ref(false)

  const updateShiftHeight = () => {
    if (!container.value) return

    const firstItem = container.value.querySelector<HTMLElement>(itemSelector)
    if (!firstItem) return

    const styles = window.getComputedStyle(container.value)
    const gap = Number.parseFloat(styles.rowGap || styles.gap || '0')
    shiftHeight.value = firstItem.offsetHeight + gap
  }

  const runFrame = () => {
    if (!container.value || !shiftHeight.value || list.value.length === 0) {
      return
    }

    isResetting.value = false
    offset.value = shiftHeight.value

    if (scrollTimer) {
      window.clearTimeout(scrollTimer)
    }

    scrollTimer = window.setTimeout(() => {
      isResetting.value = true
      const firstItem = list.value.shift()

      if (firstItem) {
        list.value.push(firstItem)
      }

      offset.value = 0

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isResetting.value = false
          updateShiftHeight()
        })
      })
    }, duration)
  }

  let timer: number | null = null
  let scrollTimer: number | null = null

  onMounted(() => {
    nextTick(() => {
      updateShiftHeight()
      timer = window.setInterval(runFrame, interval)
    })

    window.addEventListener('resize', updateShiftHeight)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateShiftHeight)

    if (timer) {
      window.clearInterval(timer)
      timer = null
    }

    if (scrollTimer) {
      window.clearTimeout(scrollTimer)
      scrollTimer = null
    }
  })

  return {
    list,
    container,
    offset,
    isResetting,
    updateShiftHeight,
  }
}

export default useVerticalMarquee
