import App from './App.vue'
import autofit from 'autofit.js'
import { createApp } from 'vue'
import 'animate.css'
import '@/assets/fonts/DincorosBlack/result.css'
import '@/assets/fonts/DouyuFont/result.css'
import '@/assets/fonts/SarasaMonoSC/result.css'
import '@/assets/fontawesome/css/all.css'

// 如果需要，可以在这里引入与湿地主题相关的全局样式

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
