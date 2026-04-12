<template>
  <Layout :loading="loading">
    <template #left>
      <WidgetPanel04 title="近30日降水过程" />
      <WidgetPanel02 title="月度水位与生态补水" />
      <WidgetPanel03 title="年度植被覆盖率对比" />
    </template>

    <template #right>
      <WidgetPanel07
        v-show="current"
        :title="current + '指标详情'"
        :name="current"
      />
      <WidgetPanel06 v-show="!current" title="风险处置动态" />
      <WidgetPanel01 title="重点断面风险画像" />
      <WidgetPanel05 title="关键环境指标" />
    </template>

    <template #middle>
      <div class="middle-container">
        <div class="widget-panel map-panel">
          <div class="panel-content">
            <div class="map-container">
              <img
                v-if="imageLoaded"
                class="map-image"
                :src="currentImageUrl"
                alt="湿地区域遥感底图"
                @error="handleImageError"
              />
              <div v-else class="loading-placeholder">
                <div class="loading-spinner"></div>
                <div class="loading-text">
                  {{ imageError || '遥感底图加载中...' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="widget-panel suggestion-panel">
          <div class="panel-header">
            <span class="title">预警研判建议</span>
          </div>
          <div class="panel-content suggestion-body">
            <div
              class="suggestion-content"
              :class="{ 'suggestion-content--highlight': suggestionHighlight }"
            >
              <p>{{ suggestionText }}</p>
            </div>
            <form class="suggestion-form" @submit.prevent="submitSuggestionQuery">
              <input
                v-model="suggestionPrompt"
                class="suggestion-input"
                type="text"
                :disabled="suggestionLoading"
                placeholder="输入追问后回车，例如：请补充现场处置优先级和两小时内行动建议"
              />
              <button
                class="suggestion-submit"
                type="submit"
                :disabled="suggestionLoading || !suggestionPrompt.trim()"
              >
                {{ suggestionLoading ? '生成中...' : '生成建议' }}
              </button>
            </form>
            <div
              v-if="suggestionStatusText"
              class="suggestion-status"
              :class="{ 'suggestion-status--error': suggestionError }"
            >
              {{ suggestionStatusText }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import {
  WidgetPanel01,
  WidgetPanel02,
  WidgetPanel03,
  WidgetPanel04,
  WidgetPanel05,
  WidgetPanel06,
  WidgetPanel07,
} from '@/components'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Layout } from '@/layout'
import { requestWarningSuggestion } from '@/services/ai'

const current = ref('')
const loading = ref({
  total: 100,
  loaded: 0,
  isLoading: true,
})

const currentImageUrl = ref('')
const imageLoaded = ref(false)
const imageUpdateInterval = ref<number | null>(null)
const imageError = ref('')
const imageRequestToken = ref(0)
const presetSuggestion =
  '北侧入湖口近24小时氨氮、浊度与导电率呈同步抬升态势，结合上游补水闸站来水波动和岸线巡检记录，初步判断该断面存在短时外源输入叠加底泥扰动风险。建议立即对入湖口上游1公里范围开展溯源排查，临时将采样频次加密至2小时一次，同步核查闸门启闭日志、雨污混接点和沿线施工扰动情况；如连续两轮监测指标仍未回落，应启动现场快速采样与应急会商，提前落实拦截、分流和缓冲带巡检处置。 '
const suggestionText = ref(presetSuggestion)
const suggestionPrompt = ref('')
const suggestionLoading = ref(false)
const suggestionError = ref('')
const suggestionAbortController = ref<AbortController | null>(null)
const suggestionHighlight = ref(false)
let loadingTimer: number | null = null
let suggestionHighlightTimer: number | null = null

const getDashboardContext = () => {
  const selectedPanel = current.value ? `${current.value}指标详情` : '风险处置动态'

  return [
    '场景: 湿地生态监测大屏',
    '目标: 输出适合中部建议卡片展示的研判建议',
    `右侧联动区域: ${selectedPanel}`,
    '风格要求: 用语专业、行动明确、长度饱满、避免口语化',
  ]
}

const suggestionStatusText = computed(() => {
  if (suggestionError.value) {
    return suggestionError.value
  }

  if (suggestionLoading.value) {
    return 'AI 正在流式生成研判建议...'
  }

  return ''
})

const submitSuggestionQuery = async () => {
  const prompt = suggestionPrompt.value.trim()

  if (!prompt || suggestionLoading.value) {
    return
  }

  suggestionAbortController.value?.abort()

  const controller = new AbortController()
  suggestionAbortController.value = controller
  suggestionLoading.value = true
  suggestionError.value = ''
  const previousSuggestion = suggestionText.value
  let streamStarted = false

  try {
    const nextSuggestion = await requestWarningSuggestion(
      {
        userInput: prompt,
        presetSuggestion,
        currentSuggestion: suggestionText.value,
        panelTitle: '预警研判建议',
        dashboardContext: getDashboardContext(),
      },
      {
        signal: controller.signal,
        onStart: () => {
          streamStarted = true
          suggestionText.value = ''
        },
        onChunk: (nextText) => {
          suggestionText.value = nextText
        },
      }
    )

    suggestionText.value = nextSuggestion
    suggestionHighlight.value = false
    if (suggestionHighlightTimer) {
      window.clearTimeout(suggestionHighlightTimer)
    }
    requestAnimationFrame(() => {
      suggestionHighlight.value = true
      suggestionHighlightTimer = window.setTimeout(() => {
        suggestionHighlight.value = false
        suggestionHighlightTimer = null
      }, 1200)
    })
    suggestionPrompt.value = ''
  } catch (error) {
    if (controller.signal.aborted) {
      return
    }

    console.error('AI suggestion request failed:', error)
    if (!streamStarted) {
      suggestionText.value = previousSuggestion
    }
    suggestionError.value =
      error instanceof Error && error.message
        ? error.message
        : 'AI 建议生成失败，请检查接口地址、服务状态或返回格式。'
  } finally {
    if (suggestionAbortController.value === controller) {
      suggestionAbortController.value = null
    }
    suggestionLoading.value = false
  }
}

const handleImageError = (e: Event) => {
  imageError.value = '图片加载失败'
  imageLoaded.value = false
  console.error('Image load error:', e)
}

const updateImage = async () => {
  try {
    const hasCurrentImage = Boolean(currentImageUrl.value)
    if (!hasCurrentImage) {
      imageLoaded.value = false
    }

    imageError.value = ''
    imageRequestToken.value += 1
    const currentToken = imageRequestToken.value
    const timestamp = new Date().getTime()
    const imageUrl = `https://n.sinaimg.cn/spider20221118/255/w1080h775/20221118/3231-ced7e70d51231e19a2a1ec33ad1a5a99.jpg?t=${timestamp}`

    const img = new Image()
    img.onload = () => {
      if (currentToken !== imageRequestToken.value) {
        return
      }

      currentImageUrl.value = imageUrl
      imageLoaded.value = true
    }
    img.onerror = (e) => {
      if (currentToken !== imageRequestToken.value) {
        return
      }

      if (!hasCurrentImage) {
        imageError.value = '图片加载失败'
        imageLoaded.value = false
      }

      console.error('Image loading failed:', e)
    }
    img.src = imageUrl
  } catch (error) {
    console.error('Error updating image:', error)
    if (!currentImageUrl.value) {
      imageError.value = '更新图片时发生错误'
      imageLoaded.value = false
    }
  }
}

onMounted(() => {
  loadingTimer = window.setTimeout(() => {
    loading.value.isLoading = false
    loading.value.loaded = 100
  }, 1200)

  updateImage()

  imageUpdateInterval.value = window.setInterval(updateImage, 60000)
})

onUnmounted(() => {
  if (imageUpdateInterval.value) {
    clearInterval(imageUpdateInterval.value)
  }

  if (loadingTimer) {
    window.clearTimeout(loadingTimer)
    loadingTimer = null
  }

  suggestionAbortController.value?.abort()
  if (suggestionHighlightTimer) {
    window.clearTimeout(suggestionHighlightTimer)
    suggestionHighlightTimer = null
  }
})
</script>

<style lang="scss" scoped>
.middle-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 26px;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  padding: 18px 20px 8px;
}
.widget-panel {
  box-sizing: border-box;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  overflow: hidden;
  background: rgba(0, 21, 41, 80%);
  border: 1px solid #0a2f5a;
  border-radius: 8px;
  animation: panel-fade-up 680ms ease both;
}
.middle-container > .widget-panel:nth-child(2) {
  animation-delay: 0.12s;
}
.map-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.suggestion-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: clamp(280px, 30vh, 340px);
  min-height: 0;
}
.panel-header {
  display: flex;
  align-items: center;
  height: 40px;
  margin-bottom: 15px;
  .title {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
  }
}
.panel-content {
  flex: 1;
  min-height: 0;
}
.suggestion-body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 14px;
}
.map-container {
  width: 100%;
  height: clamp(280px, 52vh, 650px);
  margin: 0 auto;
  overflow: hidden;
  border-radius: 4px;
}
.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
.suggestion-content {
  flex: 1 1 auto;
  min-height: 0;
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
  color: #58d8ff;
  white-space: pre-line;
  overflow-y: auto;
  overflow-x: hidden;
  background: rgba(0, 0, 0, 30%);
  border-radius: 4px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid transparent;
  scrollbar-width: thin;
  scrollbar-color: rgba(88, 216, 255, 0.36) rgba(7, 18, 34, 0.22);
}
.suggestion-content::-webkit-scrollbar {
  width: 8px;
}
.suggestion-content::-webkit-scrollbar-track {
  background: rgba(7, 18, 34, 0.22);
  border-radius: 999px;
}
.suggestion-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(88, 216, 255, 0.46), rgba(48, 138, 214, 0.34));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 999px;
}
.suggestion-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(88, 216, 255, 0.62), rgba(48, 138, 214, 0.46));
}
.suggestion-content > p {
  margin: 0;
}
.suggestion-content--highlight {
  animation: suggestion-flash 1.2s ease;
}
.suggestion-form {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
}
.suggestion-input {
  flex: 1;
  height: 38px;
  padding: 0 14px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.92);
  background: rgba(8, 18, 34, 0.88);
  border: 1px solid rgba(88, 216, 255, 0.24);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &::placeholder {
    color: rgba(255, 255, 255, 0.36);
  }
  &:focus {
    border-color: rgba(88, 216, 255, 0.56);
    box-shadow: 0 0 0 3px rgba(88, 216, 255, 0.08);
  }
}
.suggestion-submit {
  flex: 0 0 auto;
  min-width: 104px;
  height: 38px;
  padding: 0 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  background: linear-gradient(135deg, rgba(31, 123, 194, 0.95), rgba(22, 87, 148, 0.95));
  border: none;
  border-radius: 4px;
  transition: opacity 0.2s ease, transform 0.2s ease;
  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
  &:not(:disabled):hover {
    transform: translateY(-1px);
  }
}
.suggestion-status {
  flex: 0 0 auto;
  min-height: 18px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.55);
}
.suggestion-status--error {
  color: #ffcf8a;
}
.loading-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 10%);
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  .loading-text {
    max-width: 80%;
    margin-top: 10px;
    font-size: 14px;
    color: #fff;
    text-align: center;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes panel-fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes suggestion-flash {
  0% {
    border-color: rgba(88, 216, 255, 0.52);
    box-shadow: 0 0 0 0 rgba(88, 216, 255, 0.24);
  }
  55% {
    border-color: rgba(88, 216, 255, 0.3);
    box-shadow: 0 0 0 10px rgba(88, 216, 255, 0);
  }
  100% {
    border-color: transparent;
    box-shadow: 0 0 0 0 rgba(88, 216, 255, 0);
  }
}

@media (max-width: 1280px) {
  .middle-container {
    height: auto;
    padding: 0;
    gap: 16px;
    align-items: stretch;
  }

  .widget-panel {
    max-width: none;
    padding: 16px;
  }

  .panel-header {
    height: auto;
    margin-bottom: 12px;
  }

  .suggestion-panel {
    height: 252px;
  }
}

@media (max-width: 900px) {
  .widget-panel {
    padding: 14px;
  }

  .suggestion-content {
    padding: 16px;
    font-size: 14px;
  }

  .suggestion-panel {
    height: 236px;
  }

  .suggestion-form {
    flex-direction: column;
  }

  .suggestion-submit,
  .suggestion-input {
    width: 100%;
  }
}
</style>
