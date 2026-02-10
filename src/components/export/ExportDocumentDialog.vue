<template>
  <el-dialog v-model="visible" :title="translate('ExportDocumentDialog.title')" width="400px" @close="resetFilters">
    <div class="filter-fields">
      <!-- Date Range -->
      <div style="position: relative;">
        <span style="position: absolute; top: 2px; left: -10px; color: red;">*</span>
        <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            unlink-panels
            :start-placeholder="translate('ExportDocumentDialog.dateRange.startPlaceholder')"
            :end-placeholder="translate('ExportDocumentDialog.dateRange.endPlaceholder')"
            :shortcuts="shortcuts"
            style="width: 94.5%;"
            :clearable="false"
        />
      </div>

      <!-- Team -->
      <div style="position: relative;">
        <span style="position: absolute; top: 2px; left: -10px; color: red;">*</span>
        <el-tree-select
            v-model="filters.teamId"
            :data="teamTreeData"
            :placeholder="translate('ExportDocumentDialog.team.placeholder')"
            filterable
            check-strictly
            style="width: 100%;"
        />
      </div>

      <el-select v-model="filters.shiftId" :placeholder="translate('ExportDocumentDialog.shift.placeholder')" filterable clearable>
        <el-option v-for="shift in shifts" :key="shift.id" :label="shift.name" :value="shift.id" />
      </el-select>

      <el-select v-model="filters.productId" :placeholder="translate('ExportDocumentDialog.product.placeholder')" filterable clearable>
        <el-option v-for="item in productOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>

      <el-select v-model="filters.batchId" :placeholder="translate('ExportDocumentDialog.batch.placeholder')" filterable clearable>
        <el-option v-for="item in batchOptions" :key="item.id" :label="item.code" :value="item.id" />
      </el-select>

      <div class="button-row">
        <el-button
            type="primary"
            :disabled="!filters.teamId || filters.dateRange.length !== 2"
            @click="handleDocumentExport"
        >
          {{ translate('ExportDocumentDialog.buttons.export') }}
        </el-button>
        <el-button @click="visible = false">{{ translate('ExportDocumentDialog.buttons.cancel') }}</el-button>
      </div>
    </div>
  </el-dialog>

  <DownloadProgress
      :visible="downloadingProgress.visible"
      :current="downloadingProgress.current"
      :total="downloadingProgress.total"
  />
</template>

<script setup>
  import {ref, reactive, onMounted, watch} from 'vue'
  import { getAllTeamTree } from '@/services/teamService'
  import { getAllShifts } from '@/services/shiftService'
  import { getAlActiveSuggestedProducts } from '@/services/production/suggestedProductService'
  import { getAllActiveSuggestedBatches } from '@/services/production/suggestedBatchService'
  import { getDocumentList, downloadPdfReport } from '@/services/summary/qcSummaryService'
  import { exportDocumentsToExcelZip, exportDocumentsToZip } from '@/utils/bulkExportUtil'
  import { convertDateRangeToUtc } from '@/utils/time_utils'
  import { ElMessage } from 'element-plus'
  import { translate } from '@/utils/i18n'
  import DownloadProgress from "@/components/export/DownloadProgress.vue";
  const downloadingProgress = reactive({ visible: false, total: 0, current: 0 });
  const teamTreeData = ref([]);

  const props = defineProps({
    visible: Boolean,
    defaultTeamId: Number,
    defaultShiftId: Number,
    defaultDateRange: Array
  })
  const emit = defineEmits(['update:visible'])

  const visible = ref(props.visible)
  watch(() => props.visible, val => (visible.value = val))
  watch(visible, val => emit('update:visible', val))

  const filters = ref({
    productId: null,
    batchId: null,
    teamId: props.defaultTeamId ?? null,
    shiftId: props.defaultShiftId ?? null,
    dateRange: props.defaultDateRange ?? [],
  })

  const teamOptions = ref([])
  const shifts = ref([])
  const productOptions = ref([])
  const batchOptions = ref([])

  const shortcuts = [
    { text: translate('ExportDocumentDialog.shortcuts.today'), value: [new Date(), new Date()] },
    { text: translate('ExportDocumentDialog.shortcuts.last7Days'), value: [new Date(Date.now() - 6 * 86400000), new Date()] },
    { text: translate('ExportDocumentDialog.shortcuts.thisMonth'), value: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()] }
  ]

  function resetFilters() {
    filters.value = { productId: null, batchId: null, teamId: null, shiftId: null, dateRange: [] }
  }

  function onProgress(current, total) {
    downloadingProgress.current = current;
    downloadingProgress.total = total;
    downloadingProgress.visible = true;
  }

  function transformTeamTreeToTreeSelectFormat(teams) {
    return teams.map(team => ({
      value: team.id,
      label: team.name,
      children: (team.children || []).map(child => ({
        value: child.id,
        label: child.name
      }))
    }));
  }

  async function handleDocumentExport() {
    downloadingProgress.visible = true;
    downloadingProgress.total = 0;
    downloadingProgress.current = 0;
    const [startDateUtc, endDateUtc] = convertDateRangeToUtc(filters.value.dateRange);

    try {
      const res = await getDocumentList({
        start_date: startDateUtc,
        end_date: endDateUtc,
        team_id: filters.value.teamId,
        shift_id: filters.value.shiftId,
        product_id: filters.value.productId,
        batch_id: filters.value.batchId
      });

      // Set total to document count + 1 (for the summary PDF)
      const docs = res.data.data;
      downloadingProgress.total = docs.length + 1;
      downloadingProgress.current = 0;
      downloadingProgress.visible = true;

      await exportDocumentsToZip(docs, translate, onProgress);         // PDF
      await exportDocumentsToExcelZip(docs, translate, onProgress);    // Excel

      // Export AI summary report
      await downloadPdfReport({
        start_date: startDateUtc,
        end_date: endDateUtc,
        team_id: filters.value.teamId,
        shift_id: filters.value.shiftId,
        product_id: filters.value.productId,
        batch_id: filters.value.batchId
      });

      // update the current
      downloadingProgress.current = downloadingProgress.total;
      downloadingProgress.visible = false;
    } catch (err) {
      console.error(translate('ExportDocumentDialog.messages.exportFailedConsole'), err);
      downloadingProgress.visible = false;
    }
  }

  async function handleExport() {
    const [startDateUtc, endDateUtc] = convertDateRangeToUtc(filters.value.dateRange)

    try {
      const res = await getDocumentList({
        start_date: startDateUtc,
        end_date: endDateUtc,
        team_id: filters.value.teamId,
        shift_id: filters.value.shiftId,
        product_id: filters.value.productId,
        batch_id: filters.value.batchId
      })

      const docs = res.data.data
      const total = docs.length + 1

      await exportDocumentsToZip(docs, translate, onProgress)
      await exportDocumentsToExcelZip(docs, translate, onProgress)
      await downloadPdfReport({
        start_date: startDateUtc,
        end_date: endDateUtc,
        team_id: filters.value.teamId,
        shift_id: filters.value.shiftId,
        product_id: filters.value.productId,
        batch_id: filters.value.batchId
      })

      ElMessage.success(translate('ExportDocumentDialog.messages.exportSuccess'))
      visible.value = false
    } catch (e) {
      console.error(e)
      ElMessage.error(translate('ExportDocumentDialog.messages.exportFailed'))
    }
  }

  async function loadFilters() {
    const [teamsRes, shiftsRes, productsRes, batchesRes] = await Promise.all([
      getAllTeamTree(),
      getAllShifts(),
      getAlActiveSuggestedProducts(),
      getAllActiveSuggestedBatches()
    ])

    teamTreeData.value = transformTeamTreeToTreeSelectFormat(teamsRes.data.data || []);
    shifts.value = shiftsRes.data?.data?.content
    productOptions.value = productsRes.data
    batchOptions.value = batchesRes.data
  }


  onMounted(() => {
    loadFilters()
  })
</script>

<style scoped>
.filter-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 10px;
}
.button-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
</style>
