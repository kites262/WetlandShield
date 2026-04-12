<template>
  <div class="app-loading" v-if="loading.isLoading">
    <img class="app-loading-icon" src="@/assets/images/spin.svg" alt="" />
    <!-- 修改加载提示文字 -->
    <div class="app-loading-title">正在加载湿地监测数据</div>
    <div class="app-loading-subtitle">
      初次加载数据可能需要较长时间, 请耐心等待
    </div>
  </div>
</template>
<script setup lang="ts">
interface PropsType {
  loading: {
    isLoading: boolean // 执行状态
  }
}
const props = defineProps<PropsType>()
</script>
<style lang="scss" scoped>
.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  /* 修改背景色为自然色调，如绿色 */
  background-color: #2e8b57;
}
.app-loading-title {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}
.app-loading-subtitle {
  margin-top: 10px;
  font-size: 12px;
  color: #fff;
}
</style>
