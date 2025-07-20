<template>
  <el-dialog
      :model-value="props.visible"
      fullscreen
      :title="`${selectedForm?.label} - ${translate('FormDataSummary.detailDialog.titleSuffix')}`"
      @update:modelValue="$emit('update:visible', $event)"
  >
    <QcRecordsTable
        :records="localRecords"
        :headers="displayedHeaders"
        :search="search"
        v-model:dateRange="dateRange"
        :loading="localLoading"
        :tableHeight="tableHeight"
        :qcFormTemplateId="props.selectedForm.qcFormTemplateId"
        :current-page="currentBackendPage + 1"
        :page-size="backendPageSize"
        :sort="sortSpec"
        :total="recordsTotal"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @sort-change="handleSortChange"
        @search-change="handleSearchChange"
        @view-details="viewDetails"
        @delete="deleteRecord"
        @export-excel="exportRecordsToExcel"
        @edit-record="editQcSubmissionRecord"
        @force-refresh="handleForceRefresh"
    />

    <QcRecordDetailDialog
        v-if="dialogVisible"
        :visible="dialogVisible"
        :selectedForm="selectedForm"
        :groupedDetails="groupedDetails"
        :basicInfo="basicInfo"
        :systemInfo="systemInfo"
        :eSignature="eSignature"
        @export="exportSubmissionLogToPdf"
        @close="dialogVisible = false"
    />

<!--    <el-pagination-->
<!--        v-if="filteredRecords.length"-->
<!--        v-model:current-page="currentPage"-->
<!--        :page-size="pageSize"-->
<!--        :total="filteredRecords.length"-->
<!--        layout="total, prev, pager, next"-->
<!--    />-->

    <template #footer>
      <el-button type="primary" @click="$emit('update:visible', false)">
        {{ translate('FormDataSummary.recordTable.closeButton') }}
      </el-button>
    </template>
  </el-dialog>

</template>

<script setup>
import QcRecordsTable from "./qc/QcRecordsTable.vue";
import {translate, translateWithParams} from "@/utils/i18n";
import QcRecordDetailDialog from "@/components/common/qc/QcRecordDetailDialog.vue";
import {deleteTaskSubmissionLog, getMyDocument, getRawMongoDocument} from "@/services/qcTaskSubmissionLogsService";
import {getUserById} from "@/services/userService";
import {parseFormDocument} from "@/utils/formUtils";
import {computed, ref, watch, nextTick} from "vue";
import {exportQcRecordsToExcel, exportSubmissionLogToPdf} from "@/utils/exportUtils";
import {ElMessage, ElMessageBox} from "element-plus";
import {useQcRecordsDialog} from "@/composables/useQcRecordsDialog";
import {fetchFormTemplate} from "@/services/qcFormTemplateService";
import { fetchAllQcRecordsWithoutPagination } from '@/services/qcReportingService'

const {
  fetchRecordsData,
  recordsTotal,
  currentBackendPage,
  backendPageSize,
  sortSpec,
  search
} = useQcRecordsDialog();

const dialogVisible = ref(false);
const groupedDetails = ref({});
const basicInfo = ref({});
const systemInfo = ref({});
const eSignature = ref(null);
const localRecords = ref([]);
const localLoading = ref(false);
const tableHeight = ref(window.innerHeight - 220);
const headers = ref([]);

const props = defineProps({
  visible: Boolean,
  selectedForm: Object,
  dateRange: Array
});

const defaultStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0); // e.g. 2025-06-01 00:00:00
const defaultEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59); // e.g. 2025-06-30 23:59:59
const dateRange = ref(props.dateRange ?? [defaultStart, defaultEnd]);
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
  'approver_updated_at'
]

// Note: dateRange watching is now handled in the main watcher below

// Sync prop change to internal ref for the date range change (without triggering reload)
watch(() => props.dateRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    dateRange.value = newVal;
  }
}, { immediate: true });

// Reset the dateRange when the window closes
watch(() => props.visible, (visibleNow) => {
  if (!visibleNow && props.dateRange?.length === 2) {
    dateRange.value = [...props.dateRange]; // Reset dateRange to initial prop value
  }
});

function handlePageChange(newPage) {
  if (isLoading.value) {
    return;
  }

  currentBackendPage.value = newPage - 1; // Convert 1-based to 0-based
}

function handleSizeChange(newSize) {
  backendPageSize.value = newSize;
  currentBackendPage.value = 0; // Reset to first page
}

function handleSortChange(newSort) {
  sortSpec.value = newSort;
}

function handleSearchChange(newSearch) {
  search.value = newSearch;
}

defineEmits(["update:visible"])

async function loadTableData() {
  if (!props.selectedForm?.qcFormTemplateId || isLoading.value) return

  isLoading.value = true;
  localLoading.value = true;

  try {
    // fetchRecordsData now takes (templateId, dateRange, page, size, sort, search)
    const response = await fetchRecordsData(
        props.selectedForm.qcFormTemplateId,
        dateRange.value,
        currentBackendPage.value,
        backendPageSize.value,
        sortSpec.value,
        search.value
    )
    localRecords.value = response || []

    // Update headers immediately after loading data to prevent race condition
    if (response && response.length > 0) {
      await updateHeadersFrom(response)
    }
  } catch (error) {
    console.error("Error loading table data:", error);
  } finally {
    localLoading.value = false;
    isLoading.value = false;
  }
}

// Flag to prevent recursive loading
const isLoading = ref(false);

// Main watcher for pagination, sorting, and search (but NOT date range)
watch(
    [currentBackendPage, backendPageSize, sortSpec, search],
    async () => {
      if (isLoading.value) {
        return;
      }
      await loadTableData();
    },
    { immediate: false }
);

// Separate watcher for date range changes only
watch(
    dateRange,
    async (newRange, oldRange) => {
      // Only trigger if this is a real date range change (not initial setup)
      if (!oldRange || !newRange || isLoading.value) return;

      const rangeChanged = newRange[0]?.getTime() !== oldRange[0]?.getTime() ||
                          newRange[1]?.getTime() !== oldRange[1]?.getTime();

      if (rangeChanged) {
        currentBackendPage.value = 0; // Reset to first page on date change
        await loadTableData();
      }
    },
    { immediate: false }
);

// Watch headers to ensure they trigger table re-render
watch(headers, (newHeaders, oldHeaders) => {
  // Headers watcher for reactivity - no logging needed
}, { deep: true });

const displayedHeaders = computed(() => {
  return headers.value || [];
});

function formatClientTime(utcDateTime) {
  if (!utcDateTime) return "-";
  const utcDate = new Date(utcDateTime + "Z"); // Ensure UTC interpretation
  return utcDate.toLocaleString("zh-CN", {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).replace(/\//g, "-");
}

async function openDetailsDialog(row) {
  try {
    const submittedAtKey = translate('FormDataSummary.detailDialog.submittedAt');
    const createdAt = new Date(row[submittedAtKey]);
    const yearMonth = createdAt.getFullYear().toString() + (createdAt.getMonth() + 1).toString().padStart(2, "0");
    const collectionName = `form_template_${props.selectedForm.qcFormTemplateId}_${yearMonth}`;
    const response = await getMyDocument(row._id, props.selectedForm.qcFormTemplateId, row.created_by, collectionName);
    const rawData = response.data;

    basicInfo.value = {
      [translate('FormDataSummary.detailDialog.relatedProducts')]: rawData.uncategorized.related_products,
      [translate('FormDataSummary.detailDialog.relatedBatches')]: rawData.uncategorized.related_batches,
      [translate('FormDataSummary.detailDialog.qcPersonnel')]: rawData.uncategorized.related_inspectors,
      [translate('FormDataSummary.detailDialog.belongingShift')]: rawData.uncategorized.related_shifts,
      [translate('FormDataSummary.detailDialog.belongingTeam')]: rawData.uncategorized.related_teams
    };

    systemInfo.value = {
      [translate('FormDataSummary.detailDialog.submissionId')]: row._id,
      [translate('FormDataSummary.detailDialog.submittedAt')]: new Date(rawData.created_at).toLocaleString("zh-CN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false
      }),
      [translate('FormDataSummary.detailDialog.submitter')]: await getUserById(rawData.created_by).then(res => res.data?.data?.name || "-")
    };

    const { groupedDetails: grouped, eSignature: signature } = parseFormDocument(rawData);
    groupedDetails.value = grouped;
    eSignature.value = signature;
    dialogVisible.value = true;
  } catch (err) {
    console.error("Error in openDetailsDialog:", err);
  }
}

async function deleteRecord(row) {
  try {
    await ElMessageBox.confirm(
        translateWithParams("FormDataSummary.recordTable.deleteConfirmMessage", { id: row._id }),
        translate("FormDataSummary.recordTable.deleteConfirmTitle"),
        {
          confirmButtonText: translate("common.confirm"),
          cancelButtonText: translate("common.cancel"),
          type: "warning"
        }
    );
    const submittedAtKey = translate('FormDataSummary.detailDialog.submittedAt');
    await deleteTaskSubmissionLog(row._id, props.selectedForm.qcFormTemplateId, row[submittedAtKey]);
    ElMessage.success(translate("FormDataSummary.recordTable.deleteSuccess"));

    // Refresh records after successful deletion
    if (props.selectedForm?.qcFormTemplateId && props.dateRange?.length === 2) {
      localLoading.value = true;
      const result = await fetchRecordsData(props.selectedForm.qcFormTemplateId, props.dateRange);
      localRecords.value = result.map(item => ({
        ...item,
        related_products: item.related_products || item.uncategorized?.related_products || "-",
        related_batches: item.related_batches || item.uncategorized?.related_batches || "-",
        related_inspectors: item.related_inspectors || item.uncategorized?.related_inspectors || "-",
        related_shifts: item.related_shifts || item.uncategorized?.related_shifts || "-",
        related_teams: item.related_teams || item.uncategorized?.related_teams || "-"
      }));
      localLoading.value = false;
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error(translate("FormDataSummary.recordTable.deleteFailed") + ":", error);
      ElMessage.error(translate("FormDataSummary.recordTable.deleteFailed"));
    }
  }
}

async function viewDetails(row) {
  try {
    // 1. Build MongoDB collection name
    const submittedAtKey = translate('FormDataSummary.detailDialog.submittedAt');
    const createdAt = new Date(formatClientTime(row[submittedAtKey]));
    const yearMonth = createdAt.getFullYear().toString() + (createdAt.getMonth() + 1).toString().padStart(2, "0");
    const inputCollectionName = `form_template_${props.selectedForm.qcFormTemplateId}_${yearMonth}`;

    // 2. Fetch form document
    const response = await getMyDocument(row._id, props.selectedForm.qcFormTemplateId, row.created_by, inputCollectionName);
    const rawData = response.data;

    // 3. Store meta info
    let selectedDetails = { ...rawData, submissionId: row._id };

    // 4. Resolve system fields
    systemInfo.value = {
      [translate('FormDataSummary.detailDialog.submissionId')]: selectedDetails.submissionId,
      [translate('FormDataSummary.detailDialog.submittedAt')]: new Date(selectedDetails.created_at).toLocaleString("zh-CN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false
      }),
      [translate('FormDataSummary.detailDialog.submitter')]: await getUserById(selectedDetails.created_by).then(res => res.data?.data?.name || "-")
    };

    // Add a basicInfo field includes the 5 fields: related products, batches, inspectors, shifts, teams
    basicInfo.value = {
      [translate('FormDataSummary.detailDialog.relatedProducts')]: selectedDetails.uncategorized.related_products,
      [translate('FormDataSummary.detailDialog.relatedBatches')]: selectedDetails.uncategorized.related_batches,
      [translate('FormDataSummary.detailDialog.qcPersonnel')]: selectedDetails.uncategorized.related_inspectors,
      [translate('FormDataSummary.detailDialog.belongingShift')]: selectedDetails.uncategorized.related_shifts,
      [translate('FormDataSummary.detailDialog.belongingTeam')]: selectedDetails.uncategorized.related_teams,
    };

    // // add dummy data first
    // this.basicInfo = {
    //   涉及产品: '土豆条, 红薯球',        // dummy product names
    //   涉及批次: 'BATCH20240401, BATCH20240402',   // dummy batch codes
    //   质检人员: '张三, 李四, 王五',              // dummy inspector names
    //   所属班次: 'A班, B班'                       // dummy shifts
    // };

    // 5. Parse document
    const { groupedDetails: grouped, eSignature: signature } = parseFormDocument(selectedDetails);

    // 5.1 Remove all "related_" fields from 'uncategorized'
    if (grouped.uncategorized) {
      for (const key of Object.keys(grouped.uncategorized)) {
        if (key.startsWith("related_")) {
          delete grouped.uncategorized[key];
        }
        if (key === "approver_updated_at") {
          delete grouped.uncategorized[key];
        }
      }
    }

    groupedDetails.value = grouped;
    eSignature.value = signature;

    // 6. Open dialog
    dialogVisible.value = true;

  } catch (err) {
    console.error("Error fetching document details:", err);
  }
}

async function editQcSubmissionRecord(row) {
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
    const rawData = response.data;

    // Get form structure
    const templateRes = await fetchFormTemplate(props.selectedForm.qcFormTemplateId);
    if (templateRes.status !== 200 || !templateRes.data?.data?.form_template_json) {
      ElMessage.error(translate("FormDataSummary.messages.cannotLoadFormStructure"));
      return;
    }

    const formTemplateJson = templateRes.data.data.form_template_json;

    // Construct URL and open new tab
    const url = `/form-edit?templateId=${props.selectedForm.qcFormTemplateId}&submissionId=${row._id}&createdAt=${formattedCreatedAt}`;
    window.open(url, '_blank');
  } catch (err) {
    console.error('❌ Failed to fetch raw document for editing:', err);
    ElMessage.error(translate("FormDataSummary.messages.loadOriginalDataFailed"));
  }
}

async function exportRecordsToExcel() {
  if (!recordsTotal.value) {
    ElMessage.warning(translate("FormDataSummary.messages.noExcelData"));
    return;
  }

  console.log("total records")
  console.log(recordsTotal.value)

  localLoading.value = true;
  try {
    // Call backend API to get all matching records
    const resp = await fetchAllQcRecordsWithoutPagination(
        props.selectedForm.qcFormTemplateId,
        formatClientTime(dateRange.value[0]),
        formatClientTime(dateRange.value[1]),
        search.value,
        sortSpec.value
    );

    // Use the complete data for export
    exportQcRecordsToExcel({
      records: resp.data,
      label: props.selectedForm.label,
      translate
    });
    ElMessage.success(translate("FormDataSummary.messages.exportExcelSuccess"));
  } catch (err) {
    console.error(translate("FormDataSummary.messages.exportFailed") + ":", err);
    ElMessage.error(translate("FormDataSummary.messages.exportFailed"));
  } finally {
    localLoading.value = false;
  }
}

// handleDateRangeChange function removed - now handled by watchers

async function updateHeadersFrom(records) {
  if (!records || !Array.isArray(records) || records.length === 0) {
    if (headers.value.length > 0) {
      headers.value = []
    }
    return
  }

  try {
    let fields = Object.keys(records[0])
    fields = fields.filter(key => !EXCLUDED_FIELDS.includes(key))
    fields = fields.filter(key => !key.startsWith('related_'))
    fields.push('_id')

    // Only update headers if they actually changed
    const currentHeaders = headers.value;
    const headersChanged = currentHeaders.length !== fields.length ||
                          !currentHeaders.every((header, index) => header === fields[index]);

    if (headersChanged) {
      headers.value = [...fields] // Create new array to ensure reactivity

      // Force DOM update to ensure table columns render
      await nextTick()
    }
  } catch (error) {
    console.error("Error updating headers:", error);
    headers.value = []
  }
}

function handleForceRefresh() {
  // Force a complete data reload
  loadTableData();
}

watch(() => props.visible, async (val) => {
  if (val && props.selectedForm && props.dateRange?.length === 2) {
    // Reset pagination state when dialog opens
    currentBackendPage.value = 0;
    // Set the date range from props
    dateRange.value = [...props.dateRange];
    // Trigger initial data load
    await loadTableData();
  }
});
</script>
