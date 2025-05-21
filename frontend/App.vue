<template>
  <Layout :loading="loading">
    <template #left>
      <WidgetPanel04 title="湿地环境参数" />
      <WidgetPanel02 title="历史水位变化" />
      <WidgetPanel03 title="湿地植被覆盖率监测" />
    </template>

    <template #right>
      <WidgetPanel07
        v-show="current"
        :title="current + '详情'"
        :name="current"
      />
      <WidgetPanel06 v-show="!current" title="湿地监测总览" />
      <WidgetPanel01 title="污染检测" />
      <WidgetPanel05 title="湿地水质变化趋势" />
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
                alt="湿地地图"
                @load="onImageLoad"
                @error="handleImageError"
              />
              <div v-else class="loading-placeholder">
                <div class="loading-spinner"></div>
                <div class="loading-text">
                  {{ imageError || '图片加载中...' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="widget-panel suggestion-panel">
          <div class="panel-header">
            <span class="title">智能建议</span>
          </div>
          <div class="panel-content">
            <div class="suggestion-content">
              <p>
                区域一出现极度异常！建议立马加强区域一的水质监测与污染源调查，评估湿地退化的具体原因
              </p>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { Layout } from '@/layout'

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

const handleImageError = (e: Event) => {
  imageError.value = '图片加载失败'
  imageLoaded.value = false
  console.error('Image load error:', e)
}

const updateImage = async () => {
  try {
    imageLoaded.value = false
    imageError.value = ''
    const timestamp = new Date().getTime()
    const imageUrl = `https://n.sinaimg.cn/spider20221118/255/w1080h775/20221118/3231-ced7e70d51231e19a2a1ec33ad1a5a99.jpg?t=${timestamp}`

    // 预加载图片
    const img = new Image()
    img.onload = () => {
      currentImageUrl.value = imageUrl
      imageLoaded.value = true
      console.log('Image preloaded successfully')
    }
    img.onerror = (e) => {
      imageError.value = '图片加载失败'
      console.error('Image loading failed:', e)
    }
    img.src = imageUrl
  } catch (error) {
    console.error('Error updating image:', error)
    imageError.value = '更新图片时发生错误'
  }
}

const onImageLoad = () => {
  console.log('Image loaded in DOM')
}

onMounted(() => {
  setTimeout(() => {
    loading.value.isLoading = false
    loading.value.loaded = 100
  }, countDown() * 1000)

  // 初始化图片
  updateImage()

  // 设置定时器，每分钟更新一次图片
  imageUpdateInterval.value = window.setInterval(updateImage, 60000)
})

onUnmounted(() => {
  // 清理定时器
  if (imageUpdateInterval.value) {
    clearInterval(imageUpdateInterval.value)
  }
})

const countDown = () => Math.floor(Math.random() * 6)
</script>

<style lang="scss" scoped>
.middle-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
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
}
.map-container {
  width: 100%;
  height: 650px;
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
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
  color: #58d8ff;
  background: rgba(0, 0, 0, 30%);
  border-radius: 4px;
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
</style>
