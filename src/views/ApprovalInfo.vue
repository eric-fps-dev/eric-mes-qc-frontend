<template>
  <!-- TODO: Add Pagination later -->
  <div>
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2>{{ translate('approvalInfo.pageTitle') }}</h2>
      <el-tooltip :content="translate('approvalInfo.tooltips.refresh')" placement="top">
        <el-button
            class="refresh-button"
            type="primary"
            circle
            @click="refreshAssignments"
        >
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <!-- Filter Area -->
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
      <el-select v-model="filters.state" :placeholder="translate('approvalInfo.filters.state')" clearable style="width: 180px">
        <el-option :label="translate('approvalStates.pendingLeader')" value="pending_leader" />
        <el-option :label="translate('approvalStates.pendingSupervisor')" value="pending_supervisor" />
        <el-option :label="translate('approvalStates.fullyApproved')" value="fully_approved" />
      </el-select>

      <el-select v-model="filters.approval_type" :placeholder="translate('approvalInfo.filters.approvalType')" clearable style="width: 300px">
        <el-option
            v-for="(label, value) in FLOW_TYPE_LABELS"
            :key="value"
            :label="typeof label === 'function' ? label() : label"
            :value="value"
        />
      </el-select>

      <el-input
          v-model="filters.template_name"
          :placeholder="translate('approvalInfo.filters.templateName')"
          clearable
          style="width: 200px; margin-bottom: 10px"
      />

      <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          :range-separator="translate('approvalInfo.filters.rangeSeparator')"
          :start-placeholder="translate('approvalInfo.filters.startDate')"
          :end-placeholder="translate('approvalInfo.filters.endDate')"
          style="width: 280px;"
      />

<!--      <el-button type="primary" @click="applyFilters" style="margin-top: 0;">Search</el-button>-->
<!--      <el-button type="primary" @click="exportToExcel(table.assignments)">{{ translate('approvalInfo.buttons.exportExcel') }}</el-button>-->
<!--      <el-button type="success" @click="exportToPDF(table.assignments)">{{ translate('approvalInfo.buttons.exportPdf') }}</el-button>-->
      <el-button @click="resetFilters" style="margin-top: 0; margin-left: 0" type="warning">{{ translate('approvalInfo.buttons.reset') }}</el-button>
    </div>

    <!-- Table -->
    <el-table
        class="table-area"
        v-loading="table.loading"
        :data="table.assignments"
        :height="tableHeight"
        style="width: 100%;"
        @sort-change="handleSortChange"
        :empty-text="translate('approvalInfo.table.emptyText')"
        border
    >
      <el-table-column :label="translate('approvalInfo.table.id')" prop="id" width="100" sortable="custom" />

      <el-table-column :label="translate('approvalInfo.table.templateName')" prop="qc_form_template_name" width="300">
        <template #default="scope">
          <el-link
              type="primary"
              :underline="false"
              :href="getFormDisplayUrl(scope.row.qc_form_template_id)"
              target="_blank"
          >
            {{ scope.row.qc_form_template_name }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column :label="translate('approvalInfo.table.approvalFlow')" prop="approval_type" min-width="400">
        <template #default="scope">
          <el-steps :space="120" direction="horizontal">
            <el-step
                v-for="(step, idx) in getSteps(scope.row)"
                :key="idx"
                :title="step.title"
                :status="step.status"
            />
          </el-steps>
        </template>
      </el-table-column>

      <el-table-column :label="translate('approvalInfo.table.currentState')" prop="state" width="180">
        <template #default="scope">
          <el-tag :type="APPROVAL_STATE_TAG_TYPES[scope.row.state] || 'info'">
            {{ (typeof APPROVAL_STATE_LABELS[scope.row.state] === 'function' ? APPROVAL_STATE_LABELS[scope.row.state]() : APPROVAL_STATE_LABELS[scope.row.state]) || scope.row.state }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="translate('approvalInfo.table.createdTime')" prop="created_at" width="180" sortable="custom">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column :label="translate('approvalInfo.table.actions')" fixed="right" width="150">
        <template #default="scope">
          <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
            <el-button
                size="small"
                type="primary"
                @click="viewDetails(scope.row)"
            >
              {{ translate('approvalInfo.buttons.view') }}
            </el-button>
            <!--          <el-button-->
            <!--              size="small"-->
            <!--              type="success"-->
            <!--              :disabled="shouldDisableApprove(scope.row)"-->
            <!--              @click="viewDetails(scope.row)"-->
            <!--              style="margin-top: 0"-->
            <!--          >-->
            <!--            Approve-->
            <!--          </el-button>-->
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
        class="pager-area"
        style="margin-top: 10px;"
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50]"
        background
    />

    <ApprovalDetailDialog
        v-if="showApprovalDetailDialog"
        v-model:visible="showApprovalDetailDialog"
        :submission-id="selectedSubmissionId"
        :qc-form-template-name="selectedQcFormTemplateName"
        :qc-form-template-id="selectedQcFormTemplateId"
        :collection-name="selectedCollectionName"
        :records="table.assignments"
        :approval-type="selectedApprovalType"
        :approval-state="selectedApprovalState"
        :can-approve="!shouldDisableApprove({ state: selectedApprovalState })"
        @approved="refreshAssignments"
    />

  </div>
</template>

<script>
import { getPaginatedApprovalAssignments } from '@/services/approval/approvalService';
import { formatDate } from '@/utils/task-center/dateFormatUtils';
import {FLOW_TYPE_LABELS} from "@/utils/constants/flowTypes";
import { getStepsFromState } from '@/utils/helpers/approvalStepHelper';
import { RefreshRight } from '@element-plus/icons-vue'
import { useStore } from 'vuex'
import ApprovalDetailDialog from '@/components/approval-designer/ApprovalDetailDialog.vue'
import { debounce } from 'lodash';
import { useApprovalExport } from '@/composables/useApprovalExport'
import { translate, translateWithParams } from '@/utils/i18n';

import {
  APPROVAL_STATE_LABELS,
  APPROVAL_STATE_TAG_TYPES
} from '@/utils/constants/approvalStates';

export default {
  name: 'ApprovalAssignmentsPage',
  setup() {
    const store = useStore();
    const permissionCodes = store.getters.getUserPermission || []
    const { exportToExcel, exportToPDF } = useApprovalExport();

    return {
      permissionCodes,
      exportToExcel,
      exportToPDF
    };
  },
  computed: {
    APPROVAL_STATE_TAG_TYPES() {
      return APPROVAL_STATE_TAG_TYPES
    },
    APPROVAL_STATE_LABELS() {
      return APPROVAL_STATE_LABELS
    },
    FLOW_TYPE_LABELS() {
      return FLOW_TYPE_LABELS
    }
  },
  components: {
    ApprovalDetailDialog,
    RefreshRight
  },
  data() {
    return {
      userPermissionCodes: [],
      table: {
        assignments: [],
        loading: false
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      filters: {
        state: '',
        approval_type: '',
        template_name: '',
        dateRange: []
      },
      tableHeight: window.innerHeight - 180,
      showApprovalDetailDialog: false,
      selectedSubmissionId: null,
      selectedCollectionName: null,
      selectedQcFormTemplateName: '',
      selectedQcFormTemplateId: '',
      selectedApprovalType: '',
      selectedApprovalState: '',

      // sorting
      sortBy: 'createdAt',
      sortDirection: 'desc',
    };
  },
  methods: {
    getFormDisplayUrl(id) {
      const routeData = this.$router.resolve({
        name: 'FormDisplay',
        params: { qcFormTemplateId: id },
        query: { usable: 'false', switchDisplayed: 'false' }
      });
      return routeData.href;
    },
    translate,
    translateWithParams,
    formatDate,
    async fetchAssignments(page = 0, size = 10) {
      this.table.loading = true;
      try {
        const params = {
          page,
          size,
          sortBy: this.sortBy,
          sortDirection: this.sortDirection
        };

        if (this.filters.state) {
          params.state = this.filters.state;
        }
        if (this.filters.approval_type) {
          params.approvalType = this.filters.approval_type;
        }
        if (this.filters.template_name) {
          params.templateName = this.filters.template_name;
        }
        if (Array.isArray(this.filters.dateRange) && this.filters.dateRange.length === 2) {
          params.startDate = this.filters.dateRange[0];
          params.endDate = this.filters.dateRange[1];
        }

        const response = await getPaginatedApprovalAssignments(params);
        const data = response.data.data;
        this.table.assignments = data.content;
        this.pagination.total = data.totalElements;
      } catch (error) {
        console.error(this.translate('approvalInfo.messages.fetchError'), error);
        this.$message.error(this.translate('approvalInfo.messages.loadError'));
      } finally {
        this.table.loading = false;
      }
    },
    refreshAssignments() {
      this.fetchAssignments(this.pagination.currentPage - 1, this.pagination.pageSize);
    },
    getSteps(row) {
      return getStepsFromState(row.approval_type, row.state);
    },
    getCollectionNameFromRow(row) {
      const createdAt = new Date(row.created_at);
      const year = createdAt.getFullYear();
      const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
      return `form_template_${row.qc_form_template_id}_${year}${month}`;
    },
    applyFilters() {
      this.fetchAssignments(0, this.pagination.pageSize); // Reload from first page
    },
    resetFilters() {
      this.filters = {
        state: '',
        approval_type: '',
        template_name: '',
        dateRange: []
      };
      this.fetchAssignments(0, this.pagination.pageSize);
    },
    handlePageChange(newPage) {
      this.pagination.currentPage = newPage;
      this.fetchAssignments(newPage - 1, this.pagination.pageSize); // Note: page starts from 0
    },
    handleSizeChange(newSize) {
      this.pagination.pageSize = newSize;
      this.fetchAssignments(this.pagination.currentPage - 1, newSize);
    },
    handleSortChange({ prop, order }) {
      const backendFieldMap = {
        created_at: 'createdAt',
        id: 'id' // add others here if needed
      };

      this.sortBy = backendFieldMap[prop] || prop;
      this.sortDirection = order === 'ascending' ? 'asc' : 'desc';
      this.fetchAssignments(this.pagination.currentPage - 1, this.pagination.pageSize);
    },
    viewDetails(row) {
      this.selectedSubmissionId = row.submission_id || row.id;
      this.selectedCollectionName = this.getCollectionNameFromRow(row);
      this.selectedQcFormTemplateName = row.qc_form_template_name;
      this.selectedQcFormTemplateId = row.qc_form_template_id;
      this.selectedApprovalType = row.approval_type;
      this.selectedApprovalState = row.state;
      this.showApprovalDetailDialog = true;
    },
    updateTableHeight() {
      this.tableHeight = window.innerHeight - 200;
    },
    shouldDisableApprove(row) {
      const { isManager } = this.getApprovalCaps()
      if (isManager) return false

      const requiredPermByState = {
        pending_leader: 'qc:approval-center:submit-leader-approval',
        pending_supervisor: 'qc:approval-center:submit-supervisor-approval'
      }

      const requiredPerm = requiredPermByState[row.state]
      if (!requiredPerm) return false // unknown state → don’t disable by this rule

      return !(this.userPermissionCodes || []).includes(requiredPerm)
    },
    debouncedApplyFilters: debounce(function () {
      this.table.loading = true;
      this.applyFilters();
      setTimeout(() => {
        this.table.loading = false;
      }, 500);
    }, 300),
    getApprovalCaps() {
      const perms = new Set(this.userPermissionCodes || [])

      const canLeaderApprove = perms.has('qc:approval-center:submit-leader-approval')
      const canSupervisorApprove = perms.has('qc:approval-center:submit-supervisor-approval')

      return {
        canLeaderApprove,
        canSupervisorApprove,
        isManager: canLeaderApprove && canSupervisorApprove
      }
    }
  },
  watch: {
    'filters.state': {
      handler: 'debouncedApplyFilters'
    },
    'filters.approval_type': {
      handler: 'debouncedApplyFilters'
    },
    'filters.template_name': {
      handler: 'debouncedApplyFilters'
    },
    'filters.dateRange': {
      handler: 'debouncedApplyFilters',
      deep: true
    }
  },
  mounted() {
    this.userPermissionCodes = this.permissionCodes

    const { isManager, canLeaderApprove, canSupervisorApprove } = this.getApprovalCaps()

    // Manager sees all → do not preload a specific state
    if (!isManager) {
      if (canSupervisorApprove) {
        this.filters.state = 'pending_supervisor'
      } else if (canLeaderApprove) {
        this.filters.state = 'pending_leader'
      }
    }

    // Auto apply filters
    this.fetchAssignments()
    window.addEventListener('resize', this.updateTableHeight)
    this.updateTableHeight()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateTableHeight);
  }
};
</script>

<style scoped>
  .refresh-button {
    background-color: #80cfff;
    border-color: #80cfff;
  }

  .refresh-button:hover {
    background-color: #66b5ff;
    border-color: #66b5ff;
    transform: rotate(360deg);
    transition: transform 0.3s ease-in-out, background-color 0.2s ease;
  }
</style>
