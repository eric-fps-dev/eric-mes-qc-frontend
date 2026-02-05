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
          <!-- Display images for image URL arrays -->
          <template v-if="isImageUrlArray(value)">
            <div class="image-preview-container">
              <el-image
                v-for="(url, idx) in value.filter(u => isImageUrl(u))"
                :key="idx"
                :src="url"
                :preview-src-list="value.filter(u => isImageUrl(u))"
                :initial-index="idx"
                fit="cover"
                class="detail-thumbnail"
                preview-teleported
              />
              <template v-for="(url, idx) in value.filter(u => !isImageUrl(u))" :key="'file-'+idx">
                <a :href="url" target="_blank" class="file-link" :title="getFilenameFromUrl(url)">
                  <el-icon><Document /></el-icon>
                  {{ getFilenameFromUrl(url) }}
                </a>
              </template>
            </div>
          </template>
          <!-- Display file links for non-image URL arrays -->
          <template v-else-if="isFileUrlArray(value)">
            <div class="file-list-container">
              <a v-for="(url, idx) in value" :key="idx" :href="url" target="_blank" class="file-link" :title="getFilenameFromUrl(url)">
                <el-icon><Document /></el-icon>
                {{ getFilenameFromUrl(url) }}
              </a>
            </div>
          </template>
          <!-- Default display for other values -->
          <template v-else>
            <span>
              {{ Array.isArray(value) ? value.join(', ') : (value === 0 ? 0 : (value || " - ")) }}
              <el-icon
                  v-if="showAlerts && getIcon(key)"
                  style="margin-left: 4px;"
                  :style="getStyle(key)"
              >
                <component :is="getIcon(key)" />
              </el-icon>
            </span>
          </template>
        </el-descriptions-item>
        <el-descriptions-item
            v-if="showAlerts"
            :label="translate('FormDataSummary.detailDialog.validRange')"
            :key="key + '-range'"
        >
          {{ getTooltip(key, { removePrefix: true }) }}
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
                <!-- Display images for image URL arrays -->
                <template v-if="isImageUrlArray(value)">
                  <div class="image-preview-container">
                    <el-image
                      v-for="(url, idx) in value.filter(u => isImageUrl(u))"
                      :key="idx"
                      :src="url"
                      :preview-src-list="value.filter(u => isImageUrl(u))"
                      :initial-index="idx"
                      fit="cover"
                      class="detail-thumbnail"
                      preview-teleported
                    />
                    <template v-for="(url, idx) in value.filter(u => !isImageUrl(u))" :key="'file-'+idx">
                      <a :href="url" target="_blank" class="file-link" :title="getFilenameFromUrl(url)">
                        <el-icon><Document /></el-icon>
                        {{ getFilenameFromUrl(url) }}
                      </a>
                    </template>
                  </div>
                </template>
                <!-- Display file links for non-image URL arrays -->
                <template v-else-if="isFileUrlArray(value)">
                  <div class="file-list-container">
                    <a v-for="(url, idx) in value" :key="idx" :href="url" target="_blank" class="file-link" :title="getFilenameFromUrl(url)">
                      <el-icon><Document /></el-icon>
                      {{ getFilenameFromUrl(url) }}
                    </a>
                  </div>
                </template>
                <!-- Default display for other values -->
                <template v-else>
                  <span>
                    {{ Array.isArray(value) ? value.join(', ') : (value === 0 ? 0 : (value || " - ")) }}
                    <el-icon
                        v-if="showAlerts && getIcon(key)"
                        style="margin-left: 4px;"
                        :style="getStyle(key)"
                    >
                      <component :is="getIcon(key)" />
                    </el-icon>
                  </span>
                </template>
              </el-descriptions-item>
              <el-descriptions-item
                  v-if="showAlerts"
                  :label="translate('FormDataSummary.detailDialog.validRange')"
                  :key="key + '-range'"
              >
                {{ getTooltip(key, { removePrefix: true }) }}
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
  import { Document } from '@element-plus/icons-vue'

  // Helper functions for detecting image/file URLs
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif', 'heic', 'heif']

  function isUrl(str) {
    if (typeof str !== 'string') return false
    return str.startsWith('http://') || str.startsWith('https://') || str.includes('/files/')
  }

  function isImageUrl(url) {
    if (!isUrl(url)) return false
    const lowerUrl = url.toLowerCase()
    return imageExtensions.some(ext => lowerUrl.includes(`.${ext}`))
  }

  function isFileUrlArray(value) {
    if (!Array.isArray(value) || value.length === 0) return false
    return value.every(item => isUrl(item))
  }

  function isImageUrlArray(value) {
    if (!isFileUrlArray(value)) return false
    return value.some(item => isImageUrl(item))
  }

  function getFilenameFromUrl(url) {
    if (!url) return ''
    try {
      const parts = url.split('/')
      return decodeURIComponent(parts[parts.length - 1])
    } catch (e) {
      return url
    }
  }

  const props = defineProps({
    visible: {
      type: Boolean, required: true
    },
    selectedForm: Object,
    groupedDetails: Object,
    exceededInfo: Object,
    basicInfo: Object,
    systemInfo: Object,
    eSignature: String,
    fromApprovalPage: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['close', 'export'])

  const showAlerts = ref(false)
  const descriptionLabelWidth = '200px'
  const rangeLabelWidth = '60px'
  const { getAlertIcon, getAlertStyle, getAlertTooltip } = useAlertHighlight(showAlerts)

  // Wrapper for useAlertHighlight that uses the exceededInfo prop
  const getIcon = (key) => {
    return getAlertIcon({ exceeded_info: props.exceededInfo }, key)
  }
  const getStyle = (key) => {
    return getAlertStyle({ exceeded_info: props.exceededInfo }, key)
  }
  const getTooltip = (key, options) => {
    return getAlertTooltip({ exceeded_info: props.exceededInfo }, key, options)
  }

  // Helper functions for detecting image/file URLs

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
.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.detail-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
}

.detail-thumbnail:hover {
  border-color: #409eff;
}

.file-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #409eff;
  text-decoration: none;
  font-size: 12px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-link:hover {
  background: #ecf5ff;
}
</style>
