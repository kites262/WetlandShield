<template>
  <div class="layout-footer">
    <div class="item" :style="warningStyle" @click="warningHandle">
      {{ state.isWarning ? '警告' : '警告' }}
    </div>
    <div class="item" :style="decomposeStyle" @click="decomposeHandle">
      {{ !state.isDecompose ? '介入' : '介入' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, inject } from 'vue'

const state = reactive({
  isWarning: false,
  isDecompose: false,
  isDecomposeRuning: false,
})

const events = inject<any>('events')

const warningHandle = async () => {
  state.isWarning = !state.isWarning
  if (state.isWarning) {
    await events.startWarning()
  } else {
    await events.stopWarning()
  }
}

const decomposeHandle = async () => {
  if (state.isDecomposeRuning) return void 0
  state.isDecompose = !state.isDecompose
  state.isDecomposeRuning = true
  if (state.isDecompose) {
    await events.eqDecomposeAnimation()
    state.isDecomposeRuning = false
  } else {
    await events.eqComposeAnimation()
    state.isDecomposeRuning = false
  }
}

const warningStyle = computed(() => {
  const style: any = {}
  if (state.isDecompose) {
    style.cursor = 'pointer'
  } else {
    style.cursor = 'pointer'
  }

  if (state.isWarning) {
    style.color = '#66bb6a' /* 修改为环保绿色 */
  } else {
    style.color = '#fff'
  }
  return style
})

const decomposeStyle = computed(() => {
  const style: any = {}
  if (state.isDecomposeRuning) {
    style.cursor = 'not-allowed'
  } else {
    style.cursor = 'pointer'
  }

  if (state.isDecompose) {
    style.color = '#66bb6a' /* 修改为环保绿色 */
  } else {
    style.color = '#fff'
  }
  return style
})
</script>

<style lang="scss" scoped>
.layout-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  background-image: url('@/assets/images/footer_bg.png'); /* 修改为湿地主题背景图 */
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 170px;
    height: 50px;
    font-family: '微软雅黑', Arial, sans-serif; /* 更改为适合的中文字体 */
    color: #fff;
    cursor: pointer;
    background-image: url('@/assets/images/footer_item_bg.png'); /* 修改为湿地主题按钮背景图 */
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
}
</style>
