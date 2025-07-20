<template>
  <el-dialog
      :model-value="visible"
      @update:modelValue="emit('update:visible', $event)"
      fullscreen
      :title="qcFormTemplateName + ' - ' + translate('approvalDetail.dialog.titleSuffix') + ': '"
      @close="handleClose"
  >
    <div class="approval-detail-dialog">

      <!-- ▶ Approval Progress el-steps -->
      <section class="section-block">
        <h3>{{ translate('approvalDetail.dialog.sections.approvalFlow') }}</h3>
        <el-steps :space="200" direction="horizontal">
          <el-step
              v-for="(step, idx) in getSteps()"
              :key="idx"
              :title="step.title"
              :status="step.status"
          />
        </el-steps>
      </section>

      <!-- ▶ Current Form Content (readonly) -->
      <section class="section-block">
        <h3>{{ translate('approvalDetail.dialog.sections.qcRecords') }}</h3>
        <QcRecordsTable
            :records="versionRecords"
            :headers="versionHeaders"
            :loading="versionTableLoading"
            :tableHeight="computedTableHeight"
            @latest-submission-id="latestSubmissionId"
            @view-details="viewDetails"
            :qcFormTemplateId="parseInt(collectionName.split('_')[2])"
            search=""
            :dateRange="[]"
            :fromApprovalPage="true"
            @export-excel="exportToExcel"
        />
      </section>

      <!-- ▶ Approval Records -->
      <section class="section-block">
        <h3>{{ translate('approvalDetail.dialog.sections.approvalRecords') }}</h3>
        <el-table :data="filteredApprovalRecords" border style="width: 100%">
          <el-table-column prop="user_name" :label="translate('approvalDetail.table.approver')" width="150" />

          <el-table-column :label="translate('approvalDetail.table.role')" width="120">
            <template #default="scope">
              <el-tag
                  :type="{
                    'submitter': 'success',
                    'leader': 'primary',
                    'supervisor': 'warning'
                  }[scope.row.role]"
              >
                {{
                  {
                    'submitter': translate('approvalDetail.roles.submitter'),
                    'leader': translate('approvalDetail.roles.leader'),
                    'supervisor': translate('approvalDetail.roles.supervisor')
                  }[scope.row.role] || scope.row.role
                }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column :label="translate('approvalDetail.table.approvalStatus')" width="180">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'completed' ? 'success' : 'info'">
                {{
                  {
                    'completed': translate('approvalDetail.status.completed'),
                    'pending': translate('approvalDetail.status.pending'),
                    'not_started': translate('approvalDetail.status.notStarted')
                  }[scope.row.status] || scope.row.status
                }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column :label="translate('approvalDetail.table.approvalTime')" width="200">
            <template #default="scope">
              {{ formatDate(scope.row.timestamp) }}
            </template>
          </el-table-column>

          <el-table-column prop="comments" :label="translate('approvalDetail.table.comments')" />

          <el-table-column :label="translate('approvalDetail.table.needRetest')" width="180">
            <template #default="scope">
              <el-tag :type="scope.row.suggest_retest ? 'danger' : 'info'">
                {{ scope.row.suggest_retest ? translate('approvalDetail.retest.yes') : translate('approvalDetail.retest.no') }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column :label="translate('approvalDetail.table.signature')" width="180">
            <template #default="scope">
              <el-image
                  v-if="scope.row['e-signature']"
                  :src="scope.row['e-signature']"
                  :preview-src-list="[scope.row['e-signature']]"
                  :preview-teleported="true"
                  fit="contain"
                  style="max-height: 40px; max-width: 100%;"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <!-- ▶ Need Retest -->
      <section class="section-block">
        <h3>{{ translate('approvalDetail.dialog.sections.retestQuestion') }}</h3>
        <el-switch
            v-model="suggestRetest"
            :active-text="translate('approvalDetail.retest.yes')"
            :inactive-text="translate('approvalDetail.retest.no')"
            size="large"
            inline-prompt
        />
      </section>

      <!-- ▶ Approval Comments -->
      <section class="section-block">
        <h3>{{ translate('approvalDetail.dialog.sections.approvalComments') }}</h3>
        <el-input
            type="textarea"
            v-model="comment"
            :placeholder="translate('approvalDetail.placeholders.comments')"
            :rows="4"
        />
      </section>

      <!-- ▶ Export Functions -->
      <section class="section-block">
        <h3>{{ translate('approvalDetail.dialog.sections.export') }}</h3>
        <el-button type="success" @click="exportApprovalAndRecordsToExcel(versionRecords, filteredApprovalRecords, qcFormTemplateName)">
          {{ translate('approvalInfo.buttons.exportExcel') }}
        </el-button>
        <el-button type="primary" @click="handleExportPdf">
          {{ translate('approvalInfo.buttons.exportPdf') }}
        </el-button>
      </section>

    </div>

    <template #footer>
      <el-button @click="handleClose">{{ translate('approvalInfo.buttons.close') }}</el-button>
      <el-button
          type="primary"
          :disabled="!props.canApprove || props.approvalState === 'fully_approved'"
          @click="handleApprove"
      >
        {{ translate('approvalInfo.buttons.submit') }}
      </el-button>
    </template>
  </el-dialog>

  <QcRecordDetailDialog
      v-if="dialogVisible"
      :visible="dialogVisible"
      :selectedForm="{
        label: selectedSubmissionRow?.value?.label || translate('approvalDetail.dialog.titleSuffix'),
        qcFormTemplateId: parseInt(collectionName.split('_')[2])
      }"
      :groupedDetails="groupedDetails"
      :basicInfo="basicInfo"
      :systemInfo="systemInfo"
      :eSignature="eSignature"
      :alertInfo="alertInfo"
      :showAlerts="false"
      @export="exportToPdf"
      @close="dialogVisible = false"
      :from-approval-page="true"
  />

  <SignaturePadComponent
      v-if="showSignaturePad"
      :visible="showSignaturePad"
      @save="handleSignatureSaveAndApprove"
      @close="handleSignatureClose"
  />

</template>

<script setup>
import { submitApprovalAction } from '@/services/approval/approvalService';
import { useStore } from 'vuex';
import {ref, defineProps, watch, computed} from 'vue'
import QcRecordsTable from '@/components/common/qc/QcRecordsTable.vue'
import { getVersionHistory } from '@/services/approval/approvalService'
import {formatDate} from "@/utils/task-center/dateFormatUtils";
import QcRecordDetailDialog from '@/components/common/qc/QcRecordDetailDialog.vue'
import { getUserById } from '@/services/userService'
import { parseFormDocument } from '@/utils/formUtils'
import {getMyDocument} from "@/services/qcTaskSubmissionLogsService";
import SignaturePadComponent from '@/components/form-manager/SignaturePad.vue';
import { getApprovalInfo } from '@/services/approval/approvalService';
import { getStepsFromState } from '@/utils/helpers/approvalStepHelper';
import { useApprovalDetailExport } from '@/composables/useApprovalDetailExport'
import {ElMessage} from "element-plus";
import { translate, translateWithParams } from '@/utils/i18n';
const { exportApprovalAndRecordsToExcel, exportApprovalAndRecordsToPdf } = useApprovalDetailExport()

const props = defineProps({
  visible: Boolean,
  submissionId: String,
  qcFormTemplateName: String,
  collectionName: String,
  qcFormTemplateId: Number | String,
  records: {
    type: Array,
    default: () => []
  },
  approvalType: String,
  approvalState: String,
  canApprove: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible'])

const computedTableHeight = computed(() => {
  const rowCount = versionRecords.value.length
  const rowHeight = 150
  const maxHeight = 1000
  return Math.min(rowCount * rowHeight + 100, maxHeight)
})

const versionTableLoading = ref(false)
const versionRecords = ref([])
const versionHeaders = ref([])
const comment = ref('')

// view details:
const dialogVisible = ref(false)
const groupedDetails = ref({})
const basicInfo = ref({})
const systemInfo = ref({})
const eSignature = ref(null)
const selectedSubmissionRow = ref(null)

// Alert
const alertInfo = ref({});
const showAlerts = ref(true);

// Retest
const suggestRetest = ref(false);

// Signature
const showSignaturePad = ref(false);

// Approval History
const approvalRecords = ref([])
const filteredApprovalRecords = computed(() =>
    approvalRecords.value.filter((r) =>
        r.role !== 'submitter' &&
        r.role !== 'archive' &&
        r.status === 'completed'
    )
);

// approval action
const store = useStore();
const user = store.getters.getUser;
const approverId = user?.id;

// Determine approver role string based on user's role ID
const approverRole = computed(() => {
  if (user?.role?.id === 1) return 'supervisor';
  if (user?.role?.id === 3) return 'leader';
  if (user?.role?.id === 4) {
    return props.approvalState === 'pending_leader' ? 'leader' : 'supervisor';
  }
  return null;
});

const handleClose = () => {
  emit('update:visible', false)
}

const handleApprove = () => {
  showSignaturePad.value = true;
}

const exportToPdf = () => {
  console.log('Exporting PDF')
}

// signature handler

function handleSignatureClose() {
  showSignaturePad.value = false;
}

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

async function viewDetails(row) {
  try {
    // 1. Fetch form document
    const res = await getMyDocument(row._id, props.qcFormTemplateId, row.created_by, props.collectionName);
    const rawData = res.data;

    // 2. Store meta info
    let selectedDetails = { ...rawData, submissionId: row._id };

    // 3. Resolve system fields
    systemInfo.value = {
      [translate('FormDataSummary.detailDialog.submissionId')]: selectedDetails.submissionId,
      [translate('FormDataSummary.detailDialog.submittedAt')]: new Date(selectedDetails.created_at).toLocaleString("zh-CN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false
      }),
      [translate('FormDataSummary.detailDialog.submitter')]: await getUserById(selectedDetails.created_by).then(res => res.data?.data?.name || "-")
    };

    // TODO: add a basicInfo field includes the 4 fields: related products, batches, inspectors, shifts
    basicInfo.value = {
      [translate('common.product')]: selectedDetails.uncategorized.related_products,
      [translate('common.batch')]: selectedDetails.uncategorized.related_batches,
      [translate('common.inspector')]: selectedDetails.uncategorized.related_inspectors,
      [translate('common.shift')]: selectedDetails.uncategorized.related_shifts,
      [translate('common.team')]: selectedDetails.uncategorized.related_teams
    };

    // // add dummy data first
    // this.basicInfo = {
    //   涉及产品: '土豆条, 红薯球',        // dummy product names
    //   涉及批次: 'BATCH20240401, BATCH20240402',   // dummy batch codes
    //   质检人员: '张三, 李四, 王五',              // dummy inspector names
    //   所属班次: 'A班, B班'                       // dummy shifts
    // };

    // 4. Parse document
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

async function handleSignatureSaveAndApprove(signatureData) {
  try {
    await submitApprovalAction({
      submissionId: props.submissionId,
      collectionName: props.collectionName,
      approverId,
      role: approverRole.value,
      comment: comment.value,
      suggestRetest: suggestRetest.value,
      eSignature: signatureData
    });

    showSignaturePad.value = false;
    ElMessage.success(translate('approvalInfo.messages.approvalSuccess'));
    emit('update:visible', false); // Close the dialog
    emit('approved');              // Notify parent to refresh table
  } catch (err) {
    console.error('❌ ' + translate('approvalInfo.messages.approvalError') + ':', err);
    ElMessage.error(translate('approvalInfo.messages.approvalError'));
  }
}


async function generatePdfVersionData() {
  const allVersionData = [];

  for (const row of versionRecords.value) {
    const submissionId = row._id;
    const createdBy = row.created_by;
    const createdAt = row[translate('FormDataSummary.detailDialog.submittedAt')];
    const formTemplateId = props.qcFormTemplateId;
    const collectionName = props.collectionName;

    // Step 1: Get original document
    const res = await getMyDocument(submissionId, formTemplateId, createdBy, collectionName);
    const rawData = res.data;

    // Step 2: Parse fields
    const { groupedDetails, eSignature } = parseFormDocument(rawData);
    if (eSignature) {
      groupedDetails['e-signature'] = eSignature;
    }

    // Step 3: Remove related_* fields from groupedDetails (keep only in basicInfo)
    if (groupedDetails.uncategorized) {
      for (const key of Object.keys(groupedDetails.uncategorized)) {
        if (key.startsWith("related_")) {
          delete groupedDetails.uncategorized[key];
        }
      }
    }

    const singleBasicInfo = {
      [translate('common.product')]: rawData.uncategorized?.related_products,
      [translate('common.batch')]: rawData.uncategorized?.related_batches,
      [translate('common.inspector')]: rawData.uncategorized?.related_inspectors,
      [translate('common.shift')]: rawData.uncategorized?.related_shifts,
      [translate('common.team')]: rawData.uncategorized?.related_teams,
    };

    const singleSystemInfo = {
      [translate('FormDataSummary.detailDialog.submissionId')]: submissionId,
      [translate('FormDataSummary.detailDialog.submittedAt')]: createdAt,
      [translate('FormDataSummary.detailDialog.submitter')]: await getUserById(rawData.created_by).then(res => res.data?.data?.name || "-")
    };

    const approvalInfo = rawData.uncategorized?.approval_info || [];

    allVersionData.push({
      groupedDetails,
      basicInfo: singleBasicInfo,
      systemInfo: singleSystemInfo,
      approvalInfo
    });
  }

  return allVersionData;
}

async function handleExportPdf() {
  const versionData = await generatePdfVersionData();
  await exportApprovalAndRecordsToPdf(versionData, filteredApprovalRecords.value, props.qcFormTemplateName);
}


function getSteps() {
  return getStepsFromState(props.approvalType, props.approvalState)
}

watch(() => props.submissionId, async (newId) => {
  if (!newId || !props.collectionName) return
  try {
    const res = await getApprovalInfo(newId, props.collectionName)
    approvalRecords.value = res.data.data || []
  } catch (err) {
    console.error(translate('approvalInfo.messages.fetchError'), err)
    approvalRecords.value = []
  }
}, { immediate: true })

watch(() => props.submissionId, async (newId) => {
  if (!newId) return
  versionTableLoading.value = true
  try {
    // 👇 Extract formTemplateId from collectionName (e.g. form_template_9_202405)
    const collectionName = props.collectionName
    const formTemplateId = parseInt(collectionName.split('_')[2])

    const response = await getVersionHistory(newId, collectionName)

    // for not showing the child relationships for this
    versionRecords.value = await Promise.all((response.data.data || []).map(async record => {
      const { version_group_id, created_at, ...rest } = record
      const submitterName = await getUserById(record.created_by).then(res => res.data?.data?.name || "-")
      return {
        ...rest,
        [translate('FormDataSummary.detailDialog.submittedAt')]: formatDate(created_at),
        [translate('FormDataSummary.detailDialog.submitter')]: submitterName
      }
    }))

    // this is the place to modify the data for this part
    if (versionRecords.value.length > 0) {
      const rawKeys = Object.keys(versionRecords.value[0])
      const excludedKeys = [
        '_id', 'created_by', 'created_at', 'e-signature', 'version',
        'approval_info', 'exceeded_info', 'version_group_id', 'approver_updated_at'
      ]
      const filteredKeys = rawKeys.filter(k =>
          !excludedKeys.includes(k) &&
          !k.startsWith('related_')
      )
      versionHeaders.value = filteredKeys
    }

  } catch (err) {
    console.error('🛑 Error loading version history:', err)
  } finally {
    versionTableLoading.value = false
  }
}, { immediate: true })

</script>

<style scoped>
.approval-detail-dialog {
  padding: 20px;
}

.section-block {
  margin-bottom: 30px;
}

.form-readonly,
.history-table {
  background-color: #f9f9f9;
  padding: 20px;
  border: 1px dashed #ccc;
}
</style>
