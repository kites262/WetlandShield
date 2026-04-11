import App from './App.vue'
import autofit from 'autofit.js'
import { createApp } from 'vue'
import '@/assets/fonts/DouyuFont/panel-title.css'
import '@/assets/fontawesome/css/icons.css'

// 仅引入当前页面实际使用的本地字体/图标子集。
// 后续新增素材前，请先将静态资源文件下载到 assets 并提交入库，再更新引用。

const boostrap = async () => {
  const app = createApp(App)
  app.mount('#app')

  // 如果湿地平台需要特殊的屏幕尺寸适配，可调整这里的配置
  const ScreenSize = {
    big: [2560, 1440],
    normal: [1920, 1080],
    small: [1280, 720],
  }['normal']

  autofit.init({
    el: '#app',
    dw: ScreenSize[0],
    dh: ScreenSize[1],
    resize: true,
    // 根据需要添加忽略的元素类名
    // ignore: ['.main-middle', '.css2d-renderer', 'webgl-renderer'],
  })
}

boostrap()
