<template>
  <LayoutLoading v-if="loading.isLoading" :loading="loading" />
  <div class="layout" v-else>
    <LayoutHeader />
    <LayoutFooter v-show="!loading.isLoading" />
    <div class="layout-main">
      <div class="main-left">
        <slot name="left" />
      </div>
      <div class="main-right">
        <slot name="right" />
      </div>
      <div class="main-middle" ref="container">
        <slot name="middle" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LayoutHeader from '@/layout/LayoutHeader.vue'
import LayoutFooter from '@/layout/LayoutFooter.vue'
import LayoutLoading from '@/layout/LayoutLoading.vue'

interface PropsType {
  loading: {
    total: number // 全部
    loaded: number // 已加载
    isLoading: boolean // 执行状态
  }
}
defineProps<PropsType>()
</script>

<style lang="scss" scoped>
.layout {
  width: 100%;
  height: 100%;
  font-family: '微软雅黑', Arial, sans-serif; /* 更改为合适的字体 */
  background-color: #e0f7fa; /* 适合湿地和环保主题的背景色 */
  .layout-main {
    --side-width: 460px;
    --layout-gap: 20px;
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 80px);
    padding: 10px;
    overflow: hidden;
    background-color: #00695c; /* 更加环保和自然的颜色 */
    background-image: url('@/assets/images/page_bg.png'); /* 修改为湿地相关的背景图 */
    background-repeat: repeat;
    .main-left {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 999;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: repeat(3, calc((100% - 40px) / 3));
      grid-gap: 20px;
      width: var(--side-width);
      height: calc(100% - 20px);
    }
    .main-right {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 999;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: repeat(3, calc((100% - 40px) / 3));
      grid-gap: 20px;
      width: var(--side-width);
      height: calc(100% - 20px);
    }
    .main-middle {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      padding: 0 calc(var(--side-width) + var(--layout-gap)) 60px;
      box-sizing: border-box;
      &::before {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 99;
        width: 100%;
        height: 100%;
        pointer-events: none;
        content: '';
        background-image: radial-gradient(
          circle,
          transparent 30%,
          rgba(0, 0, 0, 30%) 70%
        ); /* 修改透明度以适应湿地主题 */
      }
    }
  }
}

@media (max-width: 1680px) {
  .layout {
    .layout-main {
      --side-width: 400px;
    }
  }
}

@media (max-width: 1480px) {
  .layout {
    .layout-main {
      --side-width: 340px;
      --layout-gap: 16px;
    }
  }
}

@media (max-width: 1280px) {
  .layout {
    .layout-main {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      height: calc(100% - 80px);
      padding: 16px 16px 96px;
      overflow-y: auto;

      .main-middle,
      .main-left,
      .main-right {
        position: relative;
        top: auto;
        right: auto;
        left: auto;
        width: 100%;
        height: auto;
      }

      .main-middle {
        order: 1;
        min-height: auto;
        padding: 0;
      }

      .main-left,
      .main-right {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-template-rows: none;
      }

      .main-left {
        order: 2;
      }

      .main-right {
        order: 3;
      }

      .main-left > *,
      .main-right > * {
        min-height: 260px;
      }
    }
  }
}

@media (max-width: 900px) {
  .layout {
    .layout-main {
      .main-left,
      .main-right {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
