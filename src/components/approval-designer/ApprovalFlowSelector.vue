<template>
  <div class="approval-flow-selector">
    <el-form label-position="left" inline>
      <el-form-item :label="translate('approvalInfo.filters.approvalType')" style="margin-bottom: 12px; margin-right: 20px">
        <el-select v-model="selectedFlow" :placeholder="translate('approvalInfo.filters.approvalType')" @change="onFlowChange" style="width: 300px">
          <el-option
              v-for="(label, value) in FLOW_TYPE_LABELS"
              :key="value"
              :label="typeof label === 'function' ? label() : label"
              :value="value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <el-steps style="max-width: 600px; margin-top: 20px" align-center :active="100">
      <el-step
          v-for="(step, index) in displayedSteps"
          :key="index"
          :title="step.title"
          :description="step.description"
          :status="step.title === translate('approvalDetail.steps.archive') ? 'success' : ''"
      />
    </el-steps>
  </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import { translate } from '@/utils/i18n'
import { FLOW_TYPE_LABELS } from '@/utils/constants/flowTypes'

const props = defineProps({
  selectedFlow: String
})
const selectedFlow = ref(props.selectedFlow || 'flow_4')
const emit = defineEmits(['update:selectedFlow'])

watch(() => props.selectedFlow, (val) => {
  selectedFlow.value = val
})

const flowMap = {
  flow_1: [
    { title: translate('approvalDetail.roles.submitter'), description: translate('approvalDetail.steps.submitter') },
    { title: translate('approvalDetail.steps.archive'), description: translate('approvalDetail.steps.archive') },
  ],
  flow_2: [
    { title: translate('approvalDetail.roles.submitter'), description: translate('approvalDetail.steps.submitter') },
    { title: translate('approvalDetail.roles.leader'), description: translate('approvalDetail.steps.leaderSign') },
    { title: translate('approvalDetail.steps.archive'), description: translate('approvalDetail.steps.archive') },
  ],
  flow_3: [
    { title: translate('approvalDetail.roles.submitter'), description: translate('approvalDetail.steps.submitter') },
    { title: translate('approvalDetail.roles.supervisor'), description: translate('approvalDetail.steps.supervisorSign') },
    { title: translate('approvalDetail.steps.archive'), description: translate('approvalDetail.steps.archive') },
  ],
  flow_4: [
    { title: translate('approvalDetail.roles.submitter'), description: translate('approvalDetail.steps.submitter') },
    { title: translate('approvalDetail.roles.leader'), description: translate('approvalDetail.steps.leaderSign') },
    { title: translate('approvalDetail.roles.supervisor'), description: translate('approvalDetail.steps.supervisorSign') },
    { title: translate('approvalDetail.steps.archive'), description: translate('approvalDetail.steps.archive') },
  ],
}

const displayedSteps = computed(() => {
  return flowMap[selectedFlow.value] || []
})

function onFlowChange(value) {
  emit('update:selectedFlow', value)
}
</script>

<style scoped>
.approval-flow-selector {
  padding: 20px;
}
</style>
