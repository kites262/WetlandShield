<template>
  <div class="wetland-label" @click="onClick">{{ name }}</div>
</template>

<script setup lang="ts">
interface PropsType {
  name: string
}
const props = defineProps<PropsType>()
const emit = defineEmits<{
  (event: 'clicked', name: string): void
}>()

const onClick = () => {
  // 例如点击后触发自定义事件
  emit('clicked', props.name)
}
</script>

<style lang="scss" scoped>
.wetland-label {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 30px;
  font-weight: bolder;
  color: #fff;
  pointer-events: all;
  cursor: pointer;

  /* 修改背景色为更符合湿地主题的色调，比如深蓝色或绿色半透明 */
  background-color: rgba(34, 139, 34, 50%);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 100px;
}
</style>
