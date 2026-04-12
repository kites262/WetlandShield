<template>
  <div class="layout-footer">
    <button
      type="button"
      class="item"
      :class="{ 'item--active': confirmActive }"
      @click="openConfirmModal"
    >
      确认异常
    </button>
    <button
      type="button"
      class="item"
      :class="{
        'item--active': actionActive,
        'item--pending': actionPending,
      }"
      @click="openActionModal"
    >
      记录处理
    </button>

    <Teleport to="body">
      <div
        v-if="confirmOpen"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        @click.self="confirmOpen = false"
      >
        <div class="modal">
          <h3 id="confirm-title" class="modal-title">确认异常</h3>
          <p class="modal-desc">
            人工确认当前监测区域存在异常，系统将记录确认人、区域与时间。
          </p>
          <label class="field">
            <span class="field-label">区域</span>
            <input
              v-model="confirmForm.region"
              type="text"
              class="field-input"
              placeholder="例如：北侧入湖口"
              autocomplete="off"
            />
          </label>
          <label class="field">
            <span class="field-label">确认人</span>
            <input
              v-model="confirmForm.confirmer"
              type="text"
              class="field-input"
              placeholder="请输入姓名或工号"
              autocomplete="name"
            />
          </label>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="confirmOpen = false">
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="confirmSubmitting"
              @click="submitConfirm"
            >
              提交确认
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="actionOpen"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-title"
        @click.self="actionOpen = false"
      >
        <div class="modal">
          <h3 id="action-title" class="modal-title">记录处理</h3>
          <p class="modal-desc">请填写已采取的措施，系统将保存记录与时间。</p>
          <label class="field field-block">
            <span class="field-label">已采取的措施</span>
            <textarea
              v-model="actionForm.measures"
              class="field-textarea"
              rows="5"
              placeholder="例如：加密采样、通知管护单位、设置警示标识…"
            />
          </label>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="actionOpen = false">
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="actionSubmitting"
              @click="submitAction"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import {
  createActionRecord,
  createConfirmAbnormal,
  fetchCurrentRecords,
} from '@/services/records'
import type { RecordsSnapshot } from '@/types/records'

const confirmOpen = ref(false)
const actionOpen = ref(false)
const confirmSubmitting = ref(false)
const actionSubmitting = ref(false)
const recordsSnapshot = ref<RecordsSnapshot | null>(null)

const confirmForm = reactive({
  region: '北侧入湖口',
  confirmer: '',
})

const actionForm = reactive({
  measures: '',
})

const confirmActive = computed(() => recordsSnapshot.value?.status.abnormalConfirmed ?? false)
const actionPending = computed(() => recordsSnapshot.value?.status.pendingAction ?? false)
const actionActive = computed(() => {
  const status = recordsSnapshot.value?.status
  return Boolean(status?.actionRecorded && !status.pendingAction)
})

const readErrorMessage = (error: unknown) =>
  error instanceof Error && error.message
    ? error.message
    : '请求失败，请检查后端服务是否正常运行。'

const syncRecordsSnapshot = async () => {
  try {
    recordsSnapshot.value = await fetchCurrentRecords()
  } catch (error) {
    console.error('Failed to fetch current records:', error)
  }
}

const openConfirmModal = () => {
  confirmForm.region =
    recordsSnapshot.value?.status.currentRegion ||
    confirmForm.region.trim() ||
    '北侧入湖口'
  confirmForm.confirmer = ''
  confirmOpen.value = true
}

const openActionModal = () => {
  actionForm.measures = ''
  actionOpen.value = true
}

const submitConfirm = async () => {
  const confirmer = confirmForm.confirmer.trim()

  if (!confirmer) {
    window.alert('请填写确认人')
    return
  }

  confirmSubmitting.value = true

  try {
    const region = confirmForm.region.trim() || '北侧入湖口'
    const result = await createConfirmAbnormal({
      region,
      confirmer,
    })

    recordsSnapshot.value = result.snapshot
    confirmOpen.value = false
    window.alert(
      `已记录异常确认：${region} · ${confirmer} · ${new Date(result.record.time).toLocaleString(
        'zh-CN'
      )}`
    )
  } catch (error) {
    window.alert(readErrorMessage(error))
  } finally {
    confirmSubmitting.value = false
  }
}

const submitAction = async () => {
  const measures = actionForm.measures.trim()

  if (!measures) {
    window.alert('请填写已采取的措施')
    return
  }

  actionSubmitting.value = true

  try {
    const result = await createActionRecord({ measures })

    recordsSnapshot.value = result.snapshot
    actionOpen.value = false
    window.alert(`已保存处理记录 · ${new Date(result.record.time).toLocaleString('zh-CN')}`)
  } catch (error) {
    window.alert(readErrorMessage(error))
  } finally {
    actionSubmitting.value = false
  }
}

onMounted(() => {
  void syncRecordsSnapshot()
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
  gap: 12px;
  width: 100%;
  height: 78px;
  background-image: url('@/assets/images/footer_bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 156px;
  height: 42px;
  padding: 0;
  font-size: 15px;
  font-family: '微软雅黑', Arial, sans-serif;
  line-height: 1;
  color: #fff;
  cursor: pointer;
  background-color: transparent;
  background-image: url('@/assets/images/footer_item_bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: none;
  transition: filter 0.2s ease, transform 0.2s ease;
}

.item:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.item--active {
  color: #72d18c;
}

.item--pending {
  color: #ffcf8a;
}
</style>

<style lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
}

.modal {
  box-sizing: border-box;
  width: 100%;
  max-width: 420px;
  padding: 20px 22px;
  background: rgba(0, 21, 41, 0.96);
  border: 1px solid #0a2f5a;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
}

.modal-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.modal-desc {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
}

.field {
  display: block;
  margin-bottom: 12px;
}

.field-block {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.field-input,
.field-textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  color: #fff;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #0a2f5a;
  border-radius: 4px;
  outline: none;
}

.field-input:focus,
.field-textarea:focus {
  border-color: rgba(88, 216, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(88, 216, 255, 0.08);
}

.field-textarea {
  min-height: 100px;
  line-height: 1.45;
  resize: vertical;
}

.field-input::placeholder,
.field-textarea::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn {
  padding: 8px 18px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: filter 0.2s ease, transform 0.2s ease;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn:hover {
  filter: brightness(1.05);
}

.btn-ghost {
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.btn-primary {
  color: #001529;
  background: #58d8ff;
}
</style>
