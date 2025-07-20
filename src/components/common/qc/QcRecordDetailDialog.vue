<template>
  <el-dialog
      :model-value="visible"
      @update:modelValue="onClose"
      width="50%"
      @close="onClose"
  >
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 20px">{{ selectedForm?.label }} - {{ translate('FormDataSummary.detailDialog.titleSuffix') }}</span>
        <el-switch
            v-model="showAlerts"
            :active-text="translate('FormDataSummary.recordTable.showAlerts')"
            :inactive-text="translate('FormDataSummary.recordTable.hideAlerts')"
            inline-prompt
            size="large"
            style="--el-switch-off-color: #989898; --el-switch-on-color: #409EFF;"
        />
      </div>
    </template>
    <el-scrollbar max-height="500px">
      <!-- Render uncategorized -->
      <template v-if="displayableUncategorizedEntries.length > 0">
      <el-descriptions
          :title="translate('FormDataSummary.recordTable.groupUncategorized')"
          border
          style="margin-top: 10px; margin-bottom: 10px"
          :column="1"
          :label-width="descriptionLabelWidth"
      >
        <el-descriptions-item
            v-for="([key, value]) in displayableUncategorizedEntries"
            :key="key"
            :label="key"
        >
          {{ Array.isArray(value) ? value.join(', ') : (value === 0 ? 0 : (value || " - ")) }}
        </el-descriptions-item>
      </el-descriptions>
      </template>

      <!-- Render other grouped sections -->
      <template v-for="(fields, category) in groupedDetails" :key="category">
        <div v-if="category !== 'uncategorized' && category !== 'exceeded_info'">
          <el-descriptions
              :title="category"
              border
              style="margin-top: 10px; margin-bottom: 10px"
              :column="showAlerts ? 2 : 1"
              :label-width="descriptionLabelWidth"
          >
            <template v-for="(value, key) in fields" :key="key">
              <el-descriptions-item :label="key">
                <span>
                  {{ Array.isArray(value) ? value.join(', ') : (value === 0 ? 0 : (value || " - ")) }}
                  <el-icon
                      v-if="showAlerts && getAlertIcon(groupedDetails, key)"
                      style="margin-left: 4px;"
                      :style="getAlertStyle(groupedDetails, key)"
                  >
                    <component :is="getAlertIcon(groupedDetails, key)" />
                  </el-icon>
                </span>
              </el-descriptions-item>
              <el-descriptions-item
                  v-if="showAlerts"
                  :label="translate('FormDataSummary.detailDialog.validRange')"
                  :key="key + '-range'"
              >
                {{ getAlertTooltip(groupedDetails, key, { removePrefix: true }) }}
              </el-descriptions-item>
            </template>
          </el-descriptions>
        </div>
      </template>

      <el-descriptions
          :title="translate('FormDataSummary.recordTable.groupBasicInfo')"
          :column="1"
          border
          style="margin-top: 10px"
          :label-width="descriptionLabelWidth"
      >
        <el-descriptions-item :label="translate('FormDataSummary.detailDialog.relatedProducts')">{{ basicInfo.relatedProducts || " - " }}</el-descriptions-item>
        <el-descriptions-item :label="translate('FormDataSummary.detailDialog.relatedBatches')">{{ basicInfo.relatedBatches || " - " }}</el-descriptions-item>
        <el-descriptions-item :label="translate('FormDataSummary.detailDialog.qcPersonnel')">{{ basicInfo.qcPersonnel || " - " }}</el-descriptions-item>
        <el-descriptions-item :label="translate('FormDataSummary.detailDialog.belongingShift')">{{ basicInfo.belongingShift || " - " }}</el-descriptions-item>
        <el-descriptions-item :label="translate('FormDataSummary.detailDialog.belongingTeam')">{{ basicInfo.belongingTeam || " - " }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions
          :title="translate('FormDataSummary.recordTable.groupSystemInfo')"
          :column="1"
          border
          style="margin-top: 10px"
          :label-width="descriptionLabelWidth"
      >
        <el-descriptions-item :label="translate('FormDataSummary.detailDialog.submitter')">{{ systemInfo.submitter || " - " }}</el-descriptions-item>
        <el-descriptions-item :label="translate('FormDataSummary.detailDialog.submittedAt')">{{ systemInfo.submissionTime || " - " }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="eSignature && eSignature.startsWith('data:image')" style="margin-top: 20px;">
        <h3>{{ translate('FormDataSummary.detailDialog.signatureTitle') }}</h3>
        <img :src="eSignature" alt="e-signature" style="width: 300px; height: auto;" />
      </div>
    </el-scrollbar>

    <template #footer>
      <el-button v-if="!props.fromApprovalPage"
                 type="info"
                 @click="onClose"
      >
        {{ translate('FormDataSummary.detailDialog.cancelButton') }}
      </el-button>
      <el-button
          v-if="!props.fromApprovalPage"
          type="primary"
          @click="exportSubmissionLogToPdf"
      >
        {{ translate('FormDataSummary.detailDialog.exportButton') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { translate } from '@/utils/i18n'
  import {computed, ref} from 'vue'
  import { useAlertHighlight } from '@/composables/useAlertHighlight'

  const showAlerts = ref(false)
  const descriptionLabelWidth = '200px'
  const rangeLabelWidth = '60px'
  const { getAlertIcon, getAlertStyle, getAlertTooltip } = useAlertHighlight(showAlerts)

  const props = defineProps({
    visible: {
      type: Boolean, required: true
    },
    selectedForm: Object,
    groupedDetails: Object,
    basicInfo: Object,
    systemInfo: Object,
    eSignature: String,
    fromApprovalPage: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['close', 'export'])

  function onClose() {
    emit('close')
  }
  function exportSubmissionLogToPdf() {
    emit('export', {
      formLabel: props.selectedForm?.label || "-",
      groupedDetails: props.groupedDetails,
      basicInfo: props.basicInfo,
      systemInfo: props.systemInfo,
      eSignature: props.eSignature,
      translate
    });
  }

  const displayableUncategorizedEntries = computed(() => {
    const excludedKeys = ['e-signature', 'exceeded_info', 'approval_info', 'version_group_id', 'version']
    if (!props.groupedDetails?.uncategorized) return []
    return Object.entries(props.groupedDetails.uncategorized).filter(
        ([k, _]) => !excludedKeys.includes(k)
    )
  })

</script>

<style scoped>
</style>
