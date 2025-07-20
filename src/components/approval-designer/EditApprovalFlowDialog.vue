<template>
  <el-dialog v-model="visibleDialog" :title="translate('EditApprovalFlowDialog.title')" width="35%" @close="handleClose">
    <ApprovalFlowSelector v-model:selectedFlow="selectedFlow" />

    <template #footer>
      <el-button @click="handleClose">{{ translate('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleConfirm">{{ translate('common.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {onMounted, ref, watch, watchEffect} from 'vue'
import ApprovalFlowSelector from './ApprovalFlowSelector.vue' // your existing selector
import { translate } from '@/utils/i18n'

const props = defineProps({
  visible: Boolean,
  templateId: [String, Number],
  initialApprovalType: String
})
const emit = defineEmits(['update:visible', 'update-success'])

const visibleDialog = ref(props.visible)
watch(() => props.visible, val => (visibleDialog.value = val))
watch(visibleDialog, val => emit('update:visible', val))

const selectedFlow = ref('')

watch(() => props.initialApprovalType, (newVal) => {
  selectedFlow.value = newVal
})

watch(() => props.visible, (val) => {
  if (val) {
    selectedFlow.value = props.initialApprovalType
  }
})

import { updateApprovalType } from '@/services/qcFormTemplateService'

const handleConfirm = async () => {
  try {
    await updateApprovalType(props.templateId, selectedFlow.value)
    emit('update-success', selectedFlow.value)
    visibleDialog.value = false
  } catch (err) {
    console.error(translate('EditApprovalFlowDialog.updateFailed'), err)
  }
}

const handleClose = () => {
  selectedFlow.value = props.initialApprovalType  // Reset on close
  visibleDialog.value = false
}

</script>
