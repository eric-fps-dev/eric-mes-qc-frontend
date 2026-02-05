<template>
  <el-dialog
    :model-value="props.visible"
    :title="dialogTitle"
    width="85%"
    top="5vh"
    :destroy-on-close="true"
    @update:modelValue="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <!-- Toolbar (matches QcRecordsTable design) -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="localSearch"
          :placeholder="translate('FormDataSummary.recordTable.searchPlaceholder')"
          clearable
          style="width: 300px"
          @input="handleSearchInput"
        />
        <el-select
          v-model="selectedQcColumns"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
          filterable
          :placeholder="translate('FormDataSummary.recordTable.selectColumns')"
          :disabled="!headersReady"
          style="width: 260px; margin-left: 10px"
        >
          <el-option
            v-for="header in qcDetailHeaders"
            :key="`qc-col-${header}`"
            :label="header"
            :value="header"
          />
        </el-select>

        <el-button
          v-if="canExpandColumns"
          type="primary"
          plain
          style="margin-left: 10px; margin-top: 0px"
          @click="showAllColumns"
        >
          Show all columns
        </el-button>
        <el-button
          v-else-if="canCollapseColumns"
          type="primary"
          plain
          style="margin-left: 10px; margin-top: 0px"
          @click="showDefaultColumns"
        >
          Show fewer columns
        </el-button>

        <span v-if="isColumnProgressing" class="column-progress">
          Loading {{ columnsShown }}/{{ totalVisibleColumns }} columns...
        </span>
      </div>

      <div class="toolbar-right">
        <el-button type="success" @click="confirmAndExport" style="margin-top: 0px">
          {{ translate('FormDataSummary.recordTable.exportExcel') }}
        </el-button>

        <el-switch
          v-model="showAlerts"
          :active-text="translate('FormDataSummary.recordTable.showAlerts')"
          :inactive-text="translate('FormDataSummary.recordTable.hideAlerts')"
          class="ml-2 mr-2"
          size="large"
          inline-prompt
          style="--el-switch-off-color: #989898; --el-switch-on-color: #409EFF;"
        />

        <span class="filter-info">
          <span class="filter-label">{{ drilldownParams.fieldLabel }}</span>
          <span class="filter-separator">/</span>
          <span class="filter-value">{{ drilldownParams.optionLabel }}</span>
          <template v-if="drilldownParams.chartType === 'trend'">
            <span class="filter-separator">/</span>
            <span class="filter-value">{{ drilldownParams.bucketLabel }}</span>
          </template>
          <span class="filter-separator">-</span>
          <span class="filter-count">{{ recordsTotal }} {{ translate('ChartDrilldown.totalRecords') }}</span>
        </span>
      </div>
    </div>

    <!-- Records Table -->
    <el-table
      v-loading="loading"
      :data="records"
      :height="tableHeight"
      row-key="_id"
      border
      :empty-text="translate('common.noData')"
      style="width: 100%; white-space: nowrap;"
      :default-sort="{ prop: translate('FormDataSummary.detailDialog.submittedAt'), order: 'descending' }"
      @sort-change="handleSortChange"
    >
      <!-- System Info Group -->
      <el-table-column
        :label="translate('FormDataSummary.recordTable.groupSystemInfo')"
        label-class-name="group-header"
        class-name="section-border-right"
      >
        <el-table-column
          :prop="translate('FormDataSummary.detailDialog.submitter')"
          :label="translate('FormDataSummary.recordTable.submitter')"
          fixed="left"
          width="150"
        />
        <el-table-column
          :prop="translate('FormDataSummary.detailDialog.submittedAt')"
          :label="translate('FormDataSummary.recordTable.submittedAt')"
          fixed="left"
          width="180"
          sortable="custom"
        />
      </el-table-column>

      <!-- QC Details Group -->
      <el-table-column
        v-if="headersReady"
        :label="translate('FormDataSummary.recordTable.groupQcDetails')"
        label-class-name="group-header"
        class-name="section-border-right"
      >
        <el-table-column
          v-for="header in displayedQcDetailHeaders"
          :key="header"
          :prop="header"
          :label="header"
          :width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <!-- Check if value is an array of file/image URLs -->
            <template v-if="isFileUrlArray(row[header])">
              <div class="file-url-cell">
                <template v-for="(url, urlIdx) in row[header]" :key="urlIdx">
                  <!-- Image thumbnail -->
                  <el-image
                    v-if="isImageUrl(url)"
                    :src="url"
                    :preview-src-list="getImagePreviewList(row[header])"
                    :initial-index="getImagePreviewIndex(row[header], url)"
                    fit="cover"
                    class="thumbnail-image"
                    preview-teleported
                    lazy
                  />
                  <!-- File link -->
                  <a
                    v-else
                    :href="url"
                    target="_blank"
                    class="file-link"
                    :title="getFullFilenameFromUrl(url)"
                  >
                    <el-icon><Document /></el-icon>
                    <span class="file-name">{{ getFilenameFromUrl(url) }}</span>
                  </a>
                </template>
              </div>
            </template>
            <!-- Regular value display -->
            <span v-else :style="getAlertIcon(row, header) ? { fontWeight: 'bold' } : {}">
              {{ Array.isArray(row[header]) ? row[header].join(', ') : (row[header] ?? '-') }}
              <el-tooltip
                v-if="getAlertIcon(row, header)"
                :content="getAlertTooltip(row, header)"
                placement="top"
              >
                <el-icon :style="getAlertStyle(row, header)" size="18px">
                  <component :is="getAlertIcon(row, header)" />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
      </el-table-column>

      <!-- Basic Info Group -->
      <el-table-column
        :label="translate('FormDataSummary.recordTable.groupBasicInfo')"
        label-class-name="group-header"
        class-name="section-border-right"
      >
        <el-table-column prop="related_products" :label="translate('common.product')" width="150" />
        <el-table-column prop="related_batches" :label="translate('common.batch')" width="150" />
        <el-table-column prop="related_inspectors" :label="translate('common.inspector')" width="150" />
        <el-table-column prop="related_shifts" :label="translate('common.shift')" width="150" />
        <el-table-column prop="related_teams" :label="translate('common.team')" width="150" />
        <el-table-column prop="_id" :label="translate('FormDataSummary.recordTable.submissionId')" width="220">
          <template #default="{ row }">
            <span class="id-cell">{{ row._id }}</span>
          </template>
        </el-table-column>
      </el-table-column>

      <!-- Actions Column -->
      <el-table-column
        :label="translate('FormDataSummary.recordTable.actions')"
        width="180"
        fixed="right"
      >
        <template #default="{ row }">
          <el-link type="success" @click="viewDetails(row)">
            {{ translate('FormDataSummary.recordTable.view') }}
          </el-link>
          <el-link type="info" style="margin-left: 10px" disabled>
            {{ translate('common.table.editButton') }}
          </el-link>
          <el-link v-if="canDelete" type="danger" style="margin-left: 10px" @click="deleteRecord(row)">
            {{ translate('FormDataSummary.recordTable.delete') }}
          </el-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      v-if="recordsTotal > 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[15, 30, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="recordsTotal"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      style="margin-top: 12px; justify-content: flex-end;"
    />

    <!-- Detail Dialog -->
    <QcRecordDetailDialog
      v-if="detailDialogVisible"
      :visible="detailDialogVisible"
      :selectedForm="selectedForm"
      :groupedDetails="groupedDetails"
      :exceededInfo="exceededInfo"
      :basicInfo="basicInfo"
      :systemInfo="systemInfo"
      :eSignature="eSignature"
      @export="handleExportToPdf"
      @close="detailDialogVisible = false"
    />
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { debounce } from 'lodash';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { translate, translateWithParams } from '@/utils/i18n';
import { fetchChartDrilldownRecords, fetchAllDrilldownRecords } from '@/services/qcReportingService';
import { getMyDocument, deleteTaskSubmissionLog, getRawMongoDocument } from '@/services/qcTaskSubmissionLogsService';
import { getUserById } from '@/services/userService';
import { parseFormDocument, getOrderedHeadersFromTemplate } from '@/utils/formUtils';
import { fetchFormTemplate } from '@/services/qcFormTemplateService';
import { exportQcRecordsToExcel, exportSubmissionLogToPdf } from '@/utils/exportUtils';
import { useAlertHighlight } from '@/composables/useAlertHighlight';
import { Top, Bottom, WarningFilled, Document } from '@element-plus/icons-vue';
import QcRecordDetailDialog from '@/components/common/qc/QcRecordDetailDialog.vue';

// Helper functions for file/image display
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

const isFileUrlArray = (value) => {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(item =>
    typeof item === 'string' &&
    (item.startsWith('http://') || item.startsWith('https://') || item.includes('/files/'))
  );
};

const isImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const lowercaseUrl = url.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lowercaseUrl.includes(`.${ext}`));
};

const getFilenameFromUrl = (url) => {
  if (!url || typeof url !== 'string') return 'file';
  const parts = url.split('/');
  let filename = parts[parts.length - 1] || 'file';
  filename = filename.replace(/-\d{17}\./, '.');
  if (filename.length > 20) {
    const ext = filename.split('.').pop();
    filename = filename.substring(0, 15) + '...' + (ext ? '.' + ext : '');
  }
  return filename;
};

const getFullFilenameFromUrl = (url) => {
  if (!url || typeof url !== 'string') return 'file';
  const parts = url.split('/');
  let filename = parts[parts.length - 1] || 'file';
  filename = filename.replace(/-\d{17}\./, '.');
  return filename;
};

const getImagePreviewIndex = (urls, currentUrl) => {
  if (!urls || !Array.isArray(urls)) return 0;
  const imageUrls = urls.filter(u => isImageUrl(u));
  const idx = imageUrls.indexOf(currentUrl);
  return idx >= 0 ? idx : 0;
};

const imagePreviewCache = new WeakMap();
const getImagePreviewList = (urls) => {
  if (!Array.isArray(urls)) return [];
  if (imagePreviewCache.has(urls)) return imagePreviewCache.get(urls);
  const list = urls.filter(u => isImageUrl(u));
  imagePreviewCache.set(urls, list);
  return list;
};

const props = defineProps({
  visible: Boolean,
  selectedForm: Object,
  dateRange: Array,
  drilldownParams: {
    type: Object,
    default: () => ({
      chartType: 'pie',
      fieldName: '',
      fieldLabel: '',
      optionLabel: '',
      optionValue: null,
      bucketStart: null,
      bucketEnd: null,
      bucketLabel: '',
    })
  }
});

const emit = defineEmits(['update:visible', 'refreshCharts']);

// Store for permission check
const store = useStore();
const canDelete = computed(() => {
  const roleId = store.getters.getUser?.role?.id;
  // Allow Supervisor(1) and Manager(4)
  return [1, 4].includes(roleId);
});

// Alert highlighting
const showAlerts = ref(true);
const { getAlertStyle, getAlertIcon, getAlertTooltip } = useAlertHighlight(showAlerts);

// State
const loading = ref(false);
const records = ref([]);
const recordsTotal = ref(0);
const currentPage = ref(1);
const pageSize = ref(15);
const sortSpec = ref('created_at,desc');
const localSearch = ref('');
const headers = ref([]);
const headersReady = ref(false);
const formTemplateJson = ref(null);
const COLUMN_BATCH_SIZE = 30;
const MAX_DEFAULT_COLUMNS = 20;
const selectedQcColumns = ref([]);
const autoLimitedColumns = ref(false);
const visibleHeaderCount = ref(0);
let columnLoadToken = 0;
const tableHeight = ref(window.innerHeight - 300);

// Detail dialog state
const detailDialogVisible = ref(false);
const groupedDetails = ref({});
const exceededInfo = ref({});
const basicInfo = ref({});
const systemInfo = ref({});
const eSignature = ref(null);

const EXCLUDED_FIELDS = [
  '_id',
  'created_by',
  'e-signature',
  translate('FormDataSummary.detailDialog.submittedAt'),
  translate('FormDataSummary.detailDialog.submitter'),
  'exceeded_info',
  'approval_info',
  'version',
  'version_group_id',
  'approver_updated_at',
  'related_products',
  'related_batches',
  'related_inspectors',
  'related_shifts',
  'related_teams'
];

const dialogTitle = computed(() => {
  return `${props.selectedForm?.label || ''} - ${translate('ChartDrilldown.drilldownRecords')}`;
});

const systemHeaderLabels = computed(() => ([
  translate('FormDataSummary.detailDialog.submitter'),
  translate('FormDataSummary.detailDialog.submittedAt'),
  'Submitter',
  'Submitted At',
  '提交人'
]))

const qcDetailHeaders = computed(() => {
  return headers.value.filter(h =>
    !systemHeaderLabels.value.includes(h) && h !== '_id'
  )
})

const visibleQcDetailHeaders = computed(() => {
  if (selectedQcColumns.value.length === 0) {
    return qcDetailHeaders.value
  }
  const selectedSet = new Set(selectedQcColumns.value)
  return qcDetailHeaders.value.filter(h => selectedSet.has(h))
})

const totalVisibleColumns = computed(() => visibleQcDetailHeaders.value.length);
const columnsShown = computed(() => Math.min(visibleHeaderCount.value, totalVisibleColumns.value));
const isColumnProgressing = computed(() => headersReady.value && columnsShown.value < totalVisibleColumns.value);

const displayedQcDetailHeaders = computed(() => {
  if (!headersReady.value) return [];
  if (!visibleHeaderCount.value || visibleHeaderCount.value >= totalVisibleColumns.value) {
    return visibleQcDetailHeaders.value;
  }
  return visibleQcDetailHeaders.value.slice(0, visibleHeaderCount.value);
});

const canExpandColumns = computed(() => {
  return headersReady.value && qcDetailHeaders.value.length > MAX_DEFAULT_COLUMNS &&
    visibleQcDetailHeaders.value.length < qcDetailHeaders.value.length;
});

const canCollapseColumns = computed(() => {
  return headersReady.value && qcDetailHeaders.value.length > MAX_DEFAULT_COLUMNS &&
    visibleQcDetailHeaders.value.length === qcDetailHeaders.value.length;
});

const showAllColumns = () => {
  selectedQcColumns.value = [...qcDetailHeaders.value];
  autoLimitedColumns.value = false;
};

const showDefaultColumns = () => {
  if (qcDetailHeaders.value.length > MAX_DEFAULT_COLUMNS) {
    selectedQcColumns.value = qcDetailHeaders.value.slice(0, MAX_DEFAULT_COLUMNS);
    autoLimitedColumns.value = true;
  }
};

const scheduleColumnBatch = (fn) => {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(fn, { timeout: 120 });
  } else {
    setTimeout(fn, 0);
  }
};

const startColumnBatching = () => {
  const total = totalVisibleColumns.value;
  if (!headersReady.value || total === 0) {
    visibleHeaderCount.value = 0;
    return;
  }

  const token = ++columnLoadToken;
  visibleHeaderCount.value = Math.min(COLUMN_BATCH_SIZE, total);

  const step = () => {
    if (token !== columnLoadToken) return;
    if (visibleHeaderCount.value >= total) return;
    visibleHeaderCount.value = Math.min(visibleHeaderCount.value + COLUMN_BATCH_SIZE, total);
    if (visibleHeaderCount.value < total) {
      scheduleColumnBatch(step);
    }
  };

  if (visibleHeaderCount.value < total) {
    scheduleColumnBatch(step);
  }
};

watch(qcDetailHeaders, (newHeaders) => {
  if (!newHeaders.length) {
    selectedQcColumns.value = [];
    autoLimitedColumns.value = false;
    return;
  }

  if (selectedQcColumns.value.length === 0) {
    if (newHeaders.length > MAX_DEFAULT_COLUMNS) {
      selectedQcColumns.value = newHeaders.slice(0, MAX_DEFAULT_COLUMNS);
      autoLimitedColumns.value = true;
    }
  } else if (autoLimitedColumns.value) {
    selectedQcColumns.value = newHeaders.slice(0, MAX_DEFAULT_COLUMNS);
  } else {
    selectedQcColumns.value = selectedQcColumns.value.filter(h => newHeaders.includes(h));
  }
})

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return (
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-` +
    `${String(d.getDate()).padStart(2, '0')} ` +
    `${String(d.getHours()).padStart(2, '0')}:` +
    `${String(d.getMinutes()).padStart(2, '0')}:` +
    `${String(d.getSeconds()).padStart(2, '0')}`
  );
}

function formatClientTime(utcDateTime) {
  if (!utcDateTime) return '-';
  const utcDate = new Date(utcDateTime + 'Z');
  return utcDate.toLocaleString('zh-CN', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
}

// Debounced search
const debouncedLoadRecords = debounce(() => {
  currentPage.value = 1;
  loadDrilldownRecords();
}, 500);

function handleSearchInput() {
  debouncedLoadRecords();
}

watch([visibleQcDetailHeaders, headersReady], () => {
  startColumnBatching();
}, { immediate: true });

async function loadDrilldownRecords() {
  if (!props.selectedForm?.qcFormTemplateId || !props.dateRange?.length) return;

  loading.value = true;
  headersReady.value = false;
  try {
    const response = await fetchChartDrilldownRecords({
      formTemplateId: props.selectedForm.qcFormTemplateId,
      fieldName: props.drilldownParams.fieldName,
      optionValue: props.drilldownParams.optionValue,
      startDateTime: formatDate(props.dateRange[0]),
      endDateTime: formatDate(props.dateRange[1]),
      bucketStart: props.drilldownParams.bucketStart,
      bucketEnd: props.drilldownParams.bucketEnd,
      page: currentPage.value - 1,
      size: pageSize.value,
      sort: sortSpec.value,
      search: localSearch.value.trim(),
    });

    const { content = [], totalElements = 0 } = response.data || {};

    // Process records to format dates and map labels
    records.value = content.map((r) => {
      const record = { ...r };

      // Flatten basic info fields
      record.related_products = record.related_products || record.uncategorized?.related_products || "-";
      record.related_batches = record.related_batches || record.uncategorized?.related_batches || "-";
      record.related_inspectors = record.related_inspectors || record.uncategorized?.related_inspectors || "-";
      record.related_shifts = record.related_shifts || record.uncategorized?.related_shifts || "-";
      record.related_teams = record.related_teams || record.uncategorized?.related_teams || "-";

      // Ensure exceeded_info keys match current headers (labels)
      // This is necessary because useAlertHighlight expects row.exceeded_info[field]
      if (record.exceeded_info) {
        const mappedExceededInfo = {};
        for (const [key, value] of Object.entries(record.exceeded_info)) {
          // If key is already a label that exists in the record, keep it
          // Otherwise, it might be a raw field name that needs remapping (though backend should have done it)
          mappedExceededInfo[key] = value;
        }
        record.exceeded_info = mappedExceededInfo;
      }

      // Format created_at to localized submission time
      if (record.created_at) {
        record[translate('FormDataSummary.detailDialog.submittedAt')] = new Date(record.created_at).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(/\//g, '-');
        delete record.created_at;
      }

      // Map backend submitter key to localized key
      const backendSubmitterKey = '提交人';
      const frontendSubmitterKey = translate('FormDataSummary.detailDialog.submitter');
      if (record[backendSubmitterKey]) {
        record[frontendSubmitterKey] = record[backendSubmitterKey];
        if (backendSubmitterKey !== frontendSubmitterKey) {
          delete record[backendSubmitterKey];
        }
      }

      return record;
    });

    recordsTotal.value = totalElements;

    // Fetch form template if not cached (for ordered headers)
    if (!formTemplateJson.value && props.selectedForm?.qcFormTemplateId) {
      try {
        const templateRes = await fetchFormTemplate(props.selectedForm.qcFormTemplateId);
        if (templateRes.status === 200 && templateRes.data?.data?.form_template_json) {
          formTemplateJson.value = JSON.parse(templateRes.data.data.form_template_json);
        }
      } catch (err) {
        console.warn('Failed to fetch form template for ordered headers:', err);
      }
    }

    // Update headers from first record
    if (content.length > 0) {
      updateHeaders(records.value);
    } else {
      headers.value = [];
      headersReady.value = true;
    }
  } catch (err) {
    console.error('Error loading drilldown records:', err);
    headersReady.value = true;
  } finally {
    loading.value = false;
  }
}

function updateHeaders(data) {
  if (!data || data.length === 0) {
    headers.value = [];
    headersReady.value = true;
    return;
  }

  // Get all fields from records
  let recordFields = Object.keys(data[0]);
  recordFields = recordFields.filter(key => !EXCLUDED_FIELDS.includes(key));
  recordFields = recordFields.filter(key => !key.startsWith('related_'));

  const applyHeaders = (finalFields) => {
    headers.value = finalFields;
    headersReady.value = true;
  };

  // Apply fast, unordered headers first
  applyHeaders(recordFields);

  // Defer ordered header extraction (heavy) until idle
  if (formTemplateJson.value) {
    const schedule = (fn) => {
      if (typeof window !== 'undefined' && window.requestIdleCallback) {
        window.requestIdleCallback(fn, { timeout: 120 });
      } else {
        setTimeout(fn, 0);
      }
    };

    schedule(() => {
      let orderedFields = [];
      orderedFields = getOrderedHeadersFromTemplate(formTemplateJson.value, { useLabels: true });
      if (orderedFields.length > 0) {
        const recordFieldSet = new Set(recordFields);
        const finalFields = orderedFields.filter(field => recordFieldSet.has(field));
        recordFields.forEach(field => {
          if (!finalFields.includes(field)) {
            finalFields.push(field);
          }
        });
        applyHeaders(finalFields);
      }
    });
  }
}

function handlePageChange(page) {
  currentPage.value = page;
  loadDrilldownRecords();
}

function handleSizeChange(size) {
  pageSize.value = size;
  currentPage.value = 1;
  loadDrilldownRecords();
}

function handleSortChange({ prop, order }) {
  if (!prop || !order) {
    sortSpec.value = 'created_at,desc';
  } else {
    const direction = order === 'ascending' ? 'asc' : 'desc';
    const submittedAtKey = translate('FormDataSummary.detailDialog.submittedAt');
    const backendProp = prop === submittedAtKey ? 'created_at' : prop;
    sortSpec.value = `${backendProp},${direction}`;
  }
  loadDrilldownRecords();
}

async function handleExportToPdf(exportData) {
  try {
    await exportSubmissionLogToPdf(exportData);
    ElMessage.success(translate('common.exportSuccess') || 'Export successful');
  } catch (error) {
    console.error('Export to PDF failed:', error);
    ElMessage.error(translate('common.exportFailed') || 'Export failed');
  }
}

async function viewDetails(row) {
  try {
    const submittedAtKey = translate('FormDataSummary.detailDialog.submittedAt');
    const createdAt = new Date(row[submittedAtKey]);
    const yearMonth = createdAt.getFullYear().toString() + (createdAt.getMonth() + 1).toString().padStart(2, '0');
    const collectionName = `form_template_${props.selectedForm.qcFormTemplateId}_${yearMonth}`;

    const response = await getMyDocument(row._id, props.selectedForm.qcFormTemplateId, row.created_by, collectionName);
    const rawData = response.data;

    systemInfo.value = {
      submissionId: row._id,
      submissionTime: new Date(rawData.created_at).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      submitter: await getUserById(rawData.created_by).then(res => res.data?.data?.name || '-')
    };

    basicInfo.value = {
      relatedProducts: rawData.uncategorized?.related_products,
      relatedBatches: rawData.uncategorized?.related_batches,
      qcPersonnel: rawData.uncategorized?.related_inspectors,
      belongingShift: rawData.uncategorized?.related_shifts,
      belongingTeam: rawData.uncategorized?.related_teams,
    };

    const { groupedDetails: grouped, eSignature: signature } = parseFormDocument(rawData);
    exceededInfo.value = rawData.exceeded_info || {};

    // Remove related_ fields from uncategorized
    if (grouped.uncategorized) {
      for (const key of Object.keys(grouped.uncategorized)) {
        if (key.startsWith('related_') || key === 'approver_updated_at') {
          delete grouped.uncategorized[key];
        }
      }
    }

    groupedDetails.value = grouped;
    eSignature.value = signature;
    detailDialogVisible.value = true;
  } catch (err) {
    console.error('Error fetching document details:', err);
  }
}

async function editRecord(row) {
  try {
    const submittedAtKey = translate('FormDataSummary.detailDialog.submittedAt');
    const createdAt = new Date(row[submittedAtKey]);
    const formattedCreatedAt = createdAt.toISOString();

    // Get original Mongo data
    const response = await getRawMongoDocument(
      row._id,
      props.selectedForm.qcFormTemplateId,
      formattedCreatedAt
    );

    // Get form structure
    const templateRes = await fetchFormTemplate(props.selectedForm.qcFormTemplateId);
    if (templateRes.status !== 200 || !templateRes.data?.data?.form_template_json) {
      ElMessage.error(translate('FormDataSummary.messages.cannotLoadFormStructure'));
      return;
    }

    // Construct URL and open new tab
    const url = `/qc/form-edit?templateId=${props.selectedForm.qcFormTemplateId}&submissionId=${row._id}&createdAt=${formattedCreatedAt}`;
    window.open(url, '_blank');
  } catch (err) {
    console.error('Failed to fetch raw document for editing:', err);
    ElMessage.error(translate('FormDataSummary.messages.loadOriginalDataFailed'));
  }
}

async function deleteRecord(row) {
  try {
    await ElMessageBox.confirm(
      translateWithParams('FormDataSummary.recordTable.deleteConfirmMessage', { id: row._id }),
      translate('FormDataSummary.recordTable.deleteConfirmTitle'),
      {
        confirmButtonText: translate('common.confirm'),
        cancelButtonText: translate('common.cancel'),
        type: 'warning'
      }
    );

    const submittedAtKey = translate('FormDataSummary.detailDialog.submittedAt');
    await deleteTaskSubmissionLog(row._id, props.selectedForm.qcFormTemplateId, row[submittedAtKey]);
    ElMessage.success(translate('FormDataSummary.recordTable.deleteSuccess'));

    // Refresh records after successful deletion
    await loadDrilldownRecords();
    emit('refreshCharts');
  } catch (error) {
    if (error !== 'cancel') {
      console.error(translate('FormDataSummary.recordTable.deleteFailed') + ':', error);
      ElMessage.error(translate('FormDataSummary.recordTable.deleteFailed'));
    }
  }
}

function handleClose() {
  // Reset state when closing
  records.value = [];
  recordsTotal.value = 0;
  currentPage.value = 1;
  sortSpec.value = 'created_at,desc';
  localSearch.value = '';
  headers.value = [];
  headersReady.value = false;
  visibleHeaderCount.value = 0;
  formTemplateJson.value = null; // Reset cached template
}

// Export to Excel
const formatDateTime = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const formatSort = (sortStr) => {
  if (!sortStr) return translate('common.noSort') || 'No Sort';
  const [field, direction] = sortStr.split(',');
  const directionText = direction === 'asc' ? (translate('common.ascending') || 'Ascending') : direction === 'desc' ? (translate('common.descending') || 'Descending') : '';
  const fieldText = field === 'created_at' ? translate('FormDataSummary.detailDialog.submittedAt') : field;
  return `${fieldText} (${directionText})`;
};

async function confirmAndExport() {
  if (!recordsTotal.value) {
    ElMessage.warning(translate('FormDataSummary.messages.noExcelData'));
    return;
  }

  const htmlMessage = `
    <div style="font-size: 16px; line-height: 1.6;">
      <p style="margin-bottom: 8px;"><strong>${translate('ChartDrilldown.field')}</strong>: ${props.drilldownParams.fieldLabel}</p>
      <p style="margin-bottom: 8px;"><strong>${translate('ChartDrilldown.value')}</strong>: ${props.drilldownParams.optionLabel}</p>
      ${props.drilldownParams.chartType === 'trend' ? `<p style="margin-bottom: 8px;"><strong>${translate('ChartDrilldown.timeBucket')}</strong>: ${props.drilldownParams.bucketLabel}</p>` : ''}
      <p style="margin-bottom: 8px;"><strong>${translate('FormDataSummary.recordTable.filterKeyword')}</strong>: ${localSearch.value || translate('common.none')}</p>
      <p style="margin-bottom: 8px;"><strong>${translate('FormDataSummary.recordTable.timeRange')}:</strong> ${formatDateTime(props.dateRange[0])} - ${formatDateTime(props.dateRange[1])}</p>
      <p style="margin-bottom: 8px;"><strong>${translate('FormDataSummary.recordTable.sortField')}:</strong> ${formatSort(sortSpec.value)}</p>
      <br/>
      <p style="font-size: 18px; font-weight: bold; color: #E6A23C;">${translate('FormDataSummary.recordTable.confirmExport')}</p>
    </div>
  `;

  try {
    await ElMessageBox.confirm(
      htmlMessage,
      translate('FormDataSummary.recordTable.exportConfirmTitle'),
      {
        dangerouslyUseHTMLString: true,
        customClass: 'export-confirm-box',
        confirmButtonText: translate('common.confirm'),
        cancelButtonText: translate('common.cancel'),
        type: 'warning',
      }
    );

    await exportRecordsToExcel();
  } catch {
    // User cancelled - do nothing
  }
}

async function exportRecordsToExcel() {
  loading.value = true;
  try {
    // Fetch all records without pagination
    const response = await fetchAllDrilldownRecords({
      formTemplateId: props.selectedForm.qcFormTemplateId,
      fieldName: props.drilldownParams.fieldName,
      optionValue: props.drilldownParams.optionValue,
      startDateTime: formatDate(props.dateRange[0]),
      endDateTime: formatDate(props.dateRange[1]),
      bucketStart: props.drilldownParams.bucketStart,
      bucketEnd: props.drilldownParams.bucketEnd,
      sort: sortSpec.value,
      search: localSearch.value.trim(),
    });

    const { content = [] } = response.data || {};

    // Process records to flatten basic info fields before export
    const processedContent = content.map(r => ({
      ...r,
      related_products: r.related_products || r.uncategorized?.related_products || "-",
      related_batches: r.related_batches || r.uncategorized?.related_batches || "-",
      related_inspectors: r.related_inspectors || r.uncategorized?.related_inspectors || "-",
      related_shifts: r.related_shifts || r.uncategorized?.related_shifts || "-",
      related_teams: r.related_teams || r.uncategorized?.related_teams || "-"
    }));

    // Get ordered headers for export
    let orderedHeaders = null;
    if (formTemplateJson.value) {
      orderedHeaders = getOrderedHeadersFromTemplate(formTemplateJson.value, { useLabels: true });
    }

    // Export using the existing utility
    exportQcRecordsToExcel({
      records: processedContent,
      label: `${props.selectedForm?.label} - ${props.drilldownParams.fieldLabel} - ${props.drilldownParams.optionLabel}`,
      translate,
      orderedHeaders
    });

    ElMessage.success(translate('FormDataSummary.messages.exportExcelSuccess'));
  } catch (err) {
    console.error(translate('FormDataSummary.messages.exportFailed') + ':', err);
    ElMessage.error(translate('FormDataSummary.messages.exportFailed'));
  } finally {
    loading.value = false;
  }
}

// Refresh mechanism for post-edit refresh
function refreshDialogAndCharts() {
  loadDrilldownRecords();
  emit('refreshCharts');
}

// Lifecycle hooks for window refresh function
onMounted(() => {
  window.refreshDrilldownDialogAfterEditRecord = () => {
    refreshDialogAndCharts();
  };
});

onBeforeUnmount(() => {
  delete window.refreshDrilldownDialogAfterEditRecord;
});

// Watch for dialog open to load data
watch(() => props.visible, (val) => {
  if (val && props.selectedForm && props.dateRange?.length === 2) {
    currentPage.value = 1;
    sortSpec.value = 'created_at,desc';
    localSearch.value = '';
    headers.value = [];
    headersReady.value = false;
    loading.value = true;
    nextTick().then(() => {
      requestAnimationFrame(async () => {
        await loadDrilldownRecords();
      });
    });
  }
});
</script>

<style>
.export-confirm-box {
  width: 600px !important;
}
.export-confirm-box .el-message-box__message {
  padding-left: 10px;
}
</style>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-info {
  font-size: 14px;
  color: #606266;
}

.filter-label {
  color: #909399;
}

.filter-separator {
  margin: 0 6px;
  color: #dcdfe6;
}

.filter-value {
  color: #303133;
  font-weight: 500;
}

.filter-count {
  color: #409eff;
  font-weight: 500;
}

.column-progress {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

.id-cell {
  font-family: monospace;
  font-size: 12px;
  color: #909399;
}

::v-deep(.section-border-right .el-table__cell) {
  border-right: 2px solid #333 !important;
}

::v-deep(.group-header) {
  font-weight: bold !important;
  font-size: 14px !important;
  color: #303133 !important;
  background-color: #f5f7fa !important;
}

/* File/Image URL display styles */
.file-url-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.thumbnail-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  object-fit: cover;
  border: 1px solid #dcdfe6;
}

.thumbnail-image:hover {
  border-color: #409eff;
}

.file-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
  text-decoration: none;
  max-width: 120px;
}

.file-link:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  text-decoration: none;
}

.file-link .file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
