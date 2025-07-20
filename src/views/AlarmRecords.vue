<template>
  <div class="alert-page-grid">
    <!-- Header -->
    <div class="header-area" style="display: flex; justify-content: space-between">
      <h2 style="margin-bottom: 20px;">{{ translate('alarmRecords.pageTitle') }}</h2>
      <el-button style="margin-top: 20px; margin-right: 5px" @click="openSettingsDialog" circle>
        <el-icon :class="{ rotate: autoRefresh.statusKey === 1 }" :size="30" style="display: flex; align-items: center; justify-content: center;">
          <Setting />
        </el-icon>
      </el-button>
    </div>

    <!-- Filters -->
    <div class="filter-area">
      <div style="gap: 20px; display: flex; justify-content: space-around">
        <el-select v-model="filtersToSend.riskLevelId" :placeholder="translate('alarmRecords.filters.riskLevel')" clearable filterable style="width: 150px;">
          <el-option v-for="item in filterOptions.riskLevelOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <el-select v-model="filtersToSend.alertStatusId" :placeholder="translate('alarmRecords.filters.alertStatus')" clearable filterable style="width: 150px;">
          <el-option v-for="item in filterOptions.alertStatusOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>

        <el-select v-model="filtersToSend.suggestedProductId" :placeholder="translate('alarmRecords.filters.productName')" clearable filterable  style="width: 150px;">
          <el-option v-for="item in filterOptions.suggestedProductOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-select v-model="filtersToSend.suggestedBatchId" :placeholder="translate('alarmRecords.filters.batchNumber')" clearable filterable  style="width: 150px;">
          <el-option v-for="item in filterOptions.suggestedBatchOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-date-picker
            v-model="selectedDateRange"
            type="datetimerange"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :start-placeholder="translate('alarmRecords.filters.startDate')"
            :end-placeholder="translate('alarmRecords.filters.endDate')"
            style="width: 350px;"
            @change="onDateChange"
        />

      </div>
      <div>

      </div>
      <div style="gap: 20px; display: flex; justify-content: space-around">
        <el-input
            v-model="filtersToSend.generalSearch"
            :placeholder="translate('alarmRecords.filters.searchPlaceholder')"
            clearable
            style="width: 200px; align-items: center;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="warning" @click="resetFilters" style="margin: 0px;">{{ translate('alarmRecords.buttons.reset') }}</el-button>
<!--        <el-button type="success" @click="exportTable" style="margin: 0px;">{{ translate('alarmRecords.buttons.export') }}</el-button> &lt;!&ndash; 修改这行 &ndash;&gt;-->
        <el-button type="primary" @click="fetchAlertRecords" style="margin: 0px;">{{ translate('alarmRecords.buttons.refresh') }}</el-button>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-area">
      <el-card>
        <div>{{ translate('alarmRecords.charts.statusStatistics') }}</div>
        <v-chart :option="statusPieOption" autoresize style="height: 140px;" />
      </el-card>
      <el-card>
        <div>{{ translate('alarmRecords.charts.riskLevelStatistics') }}</div>
        <v-chart :option="riskPieOption" autoresize style="height: 140px;" />
      </el-card>
      <el-card>
        <div>{{ translate('alarmRecords.charts.topAlarmProducts') }}</div>
        <v-chart :option="productBarOption" autoresize style="height: 140px;" />
      </el-card>
      <el-card>
        <div>{{ translate('alarmRecords.charts.topInspectionItems') }}</div>
        <v-chart :option="inspectionBarOption" autoresize style="height: 140px;" />
      </el-card>

    </div>

    <!-- Alert Records Table -->
    <el-table
        class="table-area"
        v-loading="table.loading"
        :data="paginatedAlerts"
        style="width: 100%; flex: 1 1 auto;"
        @sort-change="handleSortChange"
        :allow-drag-last-column="true"
        :row-class-name="renderRows"
        :empty-text="translate('alarmRecords.table.emptyText')"
        border
    >
      <el-table-column :label="translate('alarmRecords.table.alertCode')" prop="alert_code" width="190" fixed="left">
        <template #default="scope">
          <span>{{ scope.row.alert_code }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.alertTime')" prop="alertTime" width="180" sortable="custom" fixed="left">
        <template #default="scope">
          <span>{{ formatDate(scope.row.alert_time) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.productName')" width="150">
        <template #default="scope">
          <el-tooltip
              effect="dark"
              :content="scope.row.product_names.join(', ')"
              placement="top"
          >
            <el-tag v-html="scope.row.product_display"/>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.batchNumber')" width="160">
        <template #default="scope">
          <el-tooltip effect="dark" :content="scope.row.batch_codes?.join(', ')" placement="top">
            <el-tag v-html="scope.row.batch_display" type="success" />
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.inspectionItem')" width="180">
        <template #default="scope">
          <div>{{ scope.row.inspection_item?.label || '-' }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.inspectionValue')" prop="inspectionValue" width="180" sortable="custom">
        <template #default="scope">
          <!-- 如果是数字类型 -->
          <template v-if="scope.row.alert_type === 'number'">
            <span>{{ scope.row.inspection_value }}</span>
            <el-icon
                v-if="typeof scope.row.inspection_value === 'number' && typeof scope.row.lower_control_limit === 'number' && scope.row.inspection_value < scope.row.lower_control_limit"
                style="color: #2c4cb3; margin-left: 4px;"
            >
              <arrow-down-bold />
            </el-icon>
            <el-icon
                v-else-if="typeof scope.row.inspection_value === 'number' && typeof scope.row.upper_control_limit === 'number' && scope.row.inspection_value > scope.row.upper_control_limit"
                style="color: #f46666; margin-left: 4px;"
            >
              <arrow-up-bold />
            </el-icon>
          </template>

          <!-- 如果是选项类型 -->
          <template v-else-if="scope.row.alert_type === 'options'">
            <span>{{ (scope.row.invalid_option_items_labels || []).join(', ') }}</span>
          </template>

          <!-- 其他 fallback -->
          <template v-else>
            <span>-</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.standardRange')" width="300">
        <template #default="scope">
          {{ scope.row.control_range }}
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.qcForm')" width="180">
        <template #default="scope">
          <el-link
              type="primary"
              :underline="false"
              v-if="scope.row.qc_form_template?.id"
              :href="`/form-display/${scope.row.qc_form_template.id}?usable=false&switchDisplayed=false`"
              target="_blank"
          >
            {{ scope.row.form_display }}
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>

<!--      <el-table-column label="超限情况" prop="exceed_status" width="120">-->
<!--        <template #default="scope">-->
<!--          <el-tag :type="scope.row.exceed_status === '超标' ? 'danger' : 'success'">-->
<!--            {{ scope.row.exceed_status }}-->
<!--          </el-tag>-->
<!--        </template>-->
<!--      </el-table-column>-->

      <el-table-column :label="translate('alarmRecords.table.rpn')" prop="rpn" width="120" sortable="custom">
        <template #header>
          <span>{{ translate('alarmRecords.table.rpn') }}</span>
          <el-tooltip :content="translate('alarmRecords.tooltips.rpnTooltip')" placement="top">
            <el-icon style="cursor: pointer; margin-left: 5px;" @click.stop="dialogs.showRpnDialog = true">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </template>
        <template #default="scope">
          <el-input
              v-if="scope.row.isEditing"
              v-model="scope.row.rpn"
              size="small"
              style="width: 80px;"
          />
          <span v-else>{{ scope.row.rpn }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.riskLevel')" prop="risk_level" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.risk_level.id === 3 ? 'danger' : scope.row.risk_level.id === 2 ? 'warning' : 'info'">
            {{ scope.row.risk_level.name }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.inspector')" width="160">
        <template #default="scope">
          <el-tooltip effect="dark" :content="scope.row.inspector_names?.join(', ')" placement="top">
            <el-tag type="warning">{{ scope.row.inspector_names?.[0] || '-' }}<span v-if="scope.row.inspector_names?.length > 1"> +{{ scope.row.inspector_names.length - 1 }}</span></el-tag>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.reviewer')" width="160">
        <template #default="scope">
          <el-tooltip effect="dark" :content="scope.row.reviewer_names?.join(', ')" placement="top">
            <el-tag type="danger">{{ scope.row.reviewer_names?.[0] || '-' }}<span v-if="scope.row.reviewer_names?.length > 1"> +{{ scope.row.reviewer_names.length - 1 }}</span></el-tag>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.status')" prop="status" width="120">
        <template #header>
          <span>{{ translate('alarmRecords.table.status') }}</span>
          <el-tooltip :content="translate('alarmRecords.tooltips.statusTooltip')" placement="top">
            <el-icon style="cursor: pointer; margin-left: 5px;" @click.stop="dialogs.showRpnDialog = true">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </template>
        <template #default="scope">
          <el-tag :type="scope.row.alert_status.id === 1 ? 'warning' : 'success'">
            {{ scope.row.alert_status.name }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="translate('alarmRecords.table.actions')" fixed="right" width="200" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" @click="viewDetails(scope.row)">{{ translate('alarmRecords.buttons.view') }}</el-button>
          <el-button
              size="small"
              :type="scope.row.isEditing ? 'success' : 'plain'"
              @click="toggleEdit(scope.row)"
          >
            {{ scope.row.isEditing ? translate('alarmRecords.buttons.save') : translate('alarmRecords.buttons.edit') }}
          </el-button>
          <el-button v-if="false" size="small" type="danger" @click="deleteRecord(scope.row)">{{ translate('alarmRecords.buttons.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination component -->
    <el-pagination
        :current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        background
    />
  </div>

  <el-dialog :title="translate('alarmRecords.dialogs.rpnDialog.title')" v-model="dialogs.showRpnDialog" width="600px">
    <p><strong>{{ translate('alarmRecords.dialogs.rpnDialog.formula') }}</strong></p>
    <ul>
      <li><strong>{{ translate('alarmRecords.dialogs.rpnDialog.severityDesc') }}</strong></li>
      <li><strong>{{ translate('alarmRecords.dialogs.rpnDialog.occurrenceDesc') }}</strong></li>
      <li><strong>{{ translate('alarmRecords.dialogs.rpnDialog.detectionDesc') }}</strong></li>
    </ul>
    <p><strong>{{ translate('alarmRecords.dialogs.rpnDialog.riskLevels') }}</strong></p>
    <ul>
      <li>{{ translate('alarmRecords.dialogs.rpnDialog.highRisk') }}</li>
      <li>{{ translate('alarmRecords.dialogs.rpnDialog.mediumRisk') }}</li>
      <li>{{ translate('alarmRecords.dialogs.rpnDialog.lowRisk') }}</li>
    </ul>
    <p><strong>{{ translate('alarmRecords.dialogs.rpnDialog.initialValue') }}</strong></p>
  </el-dialog>

  <el-dialog :title="translate('alarmRecords.dialogs.settingsDialog.title')" v-model="dialogs.showSettingsDialog" width="450px" @close="resetSettings">
    <el-form label-width="200px" style="padding-top: 20px">
      <el-form-item :label="translate('alarmRecords.dialogs.settingsDialog.currentRefreshStatus')">
        <el-tag :type="autoRefresh.statusSetting[autoRefresh.statusKey][1]">{{ translate('alarmRecords.autoRefresh.status.' + autoRefresh.statusSetting[autoRefresh.statusKey][2]) }}</el-tag>
      </el-form-item>
      <el-form-item :label="translate('alarmRecords.dialogs.settingsDialog.enableAutoRefresh')">
        <el-switch v-model="autoRefresh.enabled" />
      </el-form-item>
      <el-form-item :label="translate('alarmRecords.dialogs.settingsDialog.autoRefreshInterval')">
        <el-input-number
            v-model="autoRefresh.interval"
            :min="autoRefresh.min"
            :max="autoRefresh.max"
            :disabled="!autoRefresh.enabled"
        />
        <div style="color: rgba(255,0,0,0.5);">
          {{ translateWithParams('alarmRecords.dialogs.settingsDialog.intervalRange', { min: autoRefresh.min, max: autoRefresh.max }) }}
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogs.showSettingsDialog = false">{{ translate('alarmRecords.dialogs.settingsDialog.closeButton') }}</el-button>
      <el-button type="primary" @click="applyAlarmSetting">{{ translate('alarmRecords.dialogs.settingsDialog.applyButton') }}</el-button>
    </template>
  </el-dialog>

  <QcRecordDetailDialogRefactored
      :visible="dialogs.showDetailDialog"
      :submission-id="selectedDetail.submissionId"
      :qc-form-template-id="selectedDetail.formTemplateId"
      :created-at="selectedDetail.createdAt"
      :danger-label="selectedDetail.inspectionItemLabel"
      @close="dialogs.showDetailDialog = false"
  />

</template>

<script>
import Mock from 'mockjs';
import { use } from "echarts/core";
import { PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import VChart from "vue-echarts";
import {ArrowDownBold, ArrowUpBold, QuestionFilled, Search, Setting} from "@element-plus/icons-vue";
// import { getAllAlarmRiskLevels } from '@/mockServices/definitions/alarmRiskLevelDefinitionService';
// import { getAllAlarmStatuses } from '@/mockServices/definitions/alarmStatusDefinitionService';
// import { getAllAlerts } from '@/mockServices/alert/alertService';
import {deleteAlertRecord, getPaginatedAlertRecords, updateAlertRecord} from "@/services/alarmRecordService";
import {convertToUtcRange, formatDate} from "@/utils/task-center/dateFormatUtils"; // 替换 alert mock 调用
import { getAlertSummary } from "@/services/alarmRecordService";
import {getAlActiveSuggestedProducts} from "@/services/production/suggestedProductService";
import {getAllActiveSuggestedBatches} from "@/services/production/suggestedBatchService";
import { getRiskLevels, getAlertStatuses } from "@/services/alarmRecordService";
import {debounce} from "lodash";
import QcRecordDetailDialogRefactored from "@/components/common/qc/QcRecordDetailDialogRefactored.vue";
import { translate, translateWithParams } from "@/utils/i18n";

use([PieChart, CanvasRenderer]);

export default {
  name: 'AlertRecordsTable',
  components: {QcRecordDetailDialogRefactored, ArrowUpBold, ArrowDownBold, Setting, QuestionFilled, Search, VChart },
  data() {
    return {
      // 表格数据
      table: {
        alertRecords: [],
        loading: false,
        indexesForEdit: {}
      },

      // 分页和排序
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
        sortSettings: { prop: '', order: '' }
      },

      selectedDateRange: [],

      // 过滤条件
      filtersToSend: {
        alertStatusId: '',
        riskLevelId: '',
        suggestedProductId: null,
        suggestedBatchId: null,
        generalSearch: '',
        dateRange: '', // "2025-12-01T00:00:00.000Z,2025-12-31T23:59:59.999Z"
      },

      filterOptions: {
        suggestedProductOptions: [],
        suggestedBatchOptions: [],
        riskLevelOptions: [],
        alertStatusOptions: []
      },

      // 弹窗控制
      dialogs: {
        showRpnDialog: false,
        showSettingsDialog: false,
        showDetailDialog: false
      },

      // 自动刷新设置
      autoRefresh: {
        enabled: true,
        interval: 60,
        timer: null,
        min: 10,
        max: 3600,
        enabledTemp: false,
        intervalTemp: 60,
        statusKey: 1,
        statusSetting: {
          1: ['正常', 'success', 'normal'],
          2: ['已停止', 'info', 'stopped'],
          3: ['编辑中被停止', 'warning', 'pausedByEdit']
        }
      },

      // data for charts
      summaryStats: {
        alertStatusCounts: {},
        riskLevelCounts: {},
        productCounts: {},
        inspectionItemCounts: {}
      },

      // for view detail dialogs:
      selectedDetail: {
        submissionId: '',
        formTemplateId: null,
        createdAt: '',
        inspectionItemLabel: ''
      }
    };
  },
  computed: {
    pausedByEdit() {
      return Object.values(this.table.indexesForEdit).some(list => list.length > 0);
    },
    productBarOption() {
      const sorted = Object.entries(this.summaryStats.productCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      return {
        tooltip: {},
        grid: { top: 20, bottom: 20, left: 50, right: 20 },
        xAxis: {
          type: 'category',
          data: sorted.map(item => item[0]),
          axisLabel: {
            formatter: value => value.length > 6 ? value.slice(0, 6) + '..' : value
          }
        },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', barWidth: 30, data: sorted.map(item => item[1]) }]
      };
    },
    inspectionBarOption() {
      const sorted = Object.entries(this.summaryStats.inspectionItemCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      return {
        tooltip: {},
        grid: { top: 20, bottom: 20, left: 50, right: 20 },
        xAxis: {
          type: 'category',
          data: sorted.map(item => item[0]),
          axisLabel: {
            formatter: value => value.length > 6 ? value.slice(0, 6) + '..' : value
          }
        },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', barWidth: 30, data: sorted.map(item => item[1]) }]
      };
    },
    paginatedAlerts() {
      return this.table.alertRecords;
    },
    statusPieOption() {
      return {
        tooltip: { trigger: 'item' },
        legend: { top: 'center', left: 'right', orient: 'vertical' },
        series: [{
          type: 'pie',
          radius: '70%',
          data: Object.entries(this.summaryStats.alertStatusCounts).map(([name, value]) => ({ name, value })),
          label: { show: false },
          labelLine: { show: false }
        }]
      };
    },

    riskPieOption() {
      return {
        tooltip: { trigger: 'item' },
        legend: { top: 'center', left: 'right', orient: 'vertical' },
        color: ['#f46666', '#f1c07c', '#9ef476'],
        series: [{
          type: 'pie',
          radius: '70%',
          data: Object.entries(this.summaryStats.riskLevelCounts).map(([name, value]) => ({ name, value })),
          label: { show: false },
          labelLine: { show: false }
        }]
      };
    }
  },

  watch: {
    'autoRefresh.enabled'(newVal) {
      this.updateRefreshStatus();
    },
    'table.indexesForEdit': {
      handler() {
        this.updateRefreshStatus();
      },
      deep: true
    },
    filtersToSend: {
      handler: debounce(function () {
        this.pagination.currentPage = 1;
        this.fetchPaginatedAlerts(0, this.pagination.pageSize);
      }, 300),
      deep: true
    },
    'pagination.sortSettings': {
      handler() {
        this.fetchPaginatedAlerts(this.pagination.currentPage - 1, this.pagination.pageSize);
      },
      deep: true
    },
  },
  methods: {
    translate,
    translateWithParams,
    formatDate,
    fetchAlertRecords() {
      this.fetchPaginatedAlerts(this.pagination.currentPage - 1, this.pagination.pageSize);
      this.fetchAlertSummary();
    },
    onDateChange(val) {
      this.selectedDateRange = val;

      if (val && val.length === 2) {
        const utcStart = new Date(val[0]).toISOString();
        const utcEnd = new Date(val[1]).toISOString();
        this.filtersToSend.dateRange = `${utcStart},${utcEnd}`;
      } else {
        this.filtersToSend.dateRange = '';
      }
    },
    resetFilters() {
      // 清除筛选项
      this.filtersToSend = {
        alertStatusId: '',
        riskLevelId: '',
        suggestedProductId: null,
        suggestedBatchId: null,
        generalSearch: '',
        dateRange: ''
      };

      // 清除日期选择器显示
      this.selectedDateRange = [];

      // 清除排序设置
      this.pagination.sortSettings = { prop: '', order: '' };

      // 重置分页页码为第一页
      this.pagination.currentPage = 1;

      // 重新拉取数据
      this.fetchPaginatedAlerts(0, this.pagination.pageSize);
    },
    async fetchSuggestedProducts() {
      try {
        const res = await getAlActiveSuggestedProducts();
        this.filterOptions.suggestedProductOptions = (res.data || []).map(p => ({
          label: p.name,
          value: p.id
        }));
      } catch (e) {
        console.error("❌ " + this.translate('alarmRecords.messages.fetchProductsFailed'), e);
      }
    },
    async fetchSuggestedBatches() {
      try {
        const res = await getAllActiveSuggestedBatches();
        this.filterOptions.suggestedBatchOptions = (res.data || []).map(b => ({
          label: b.code,
          value: b.id
        }));
      } catch (e) {
        console.error("❌ " + this.translate('alarmRecords.messages.fetchBatchesFailed'), e);
      }
    },
    async fetchAlertSummary() {
      try {
        const res = await getAlertSummary();
        this.summaryStats = res.data;
      } catch (error) {
        console.error("❌ " + this.translate('alarmRecords.messages.fetchStatsFailed'), error);
        this.$message.error(this.translate('alarmRecords.messages.fetchStatsFailed'));
      }
    },
    async fetchPaginatedAlerts(page = 0, size = 10) {
      this.table.loading = true;


      // Dynamically eliminate the empty values to not sending to the backend
      const requestBody = {
        page,
        size
      };

      const filteredFilters = {};
      Object.entries(this.filtersToSend).forEach(([key, value]) => {
        if (value !== null && value !== '' && value !== undefined) {
          if (key === 'generalSearch') {
            filteredFilters[key] = value.trim();
          } else {
            filteredFilters[key] = value;
          }
        }
      });
      if (Object.keys(filteredFilters).length > 0) {
        requestBody.filters = filteredFilters;
      }

      const sortSettings = this.pagination.sortSettings;
      if (sortSettings.prop && sortSettings.order) {
        requestBody.sort = {
          prop: sortSettings.prop,
          order: sortSettings.order
        };
      }

      try {
        const response = await getPaginatedAlertRecords(requestBody);

        this.table.alertRecords = (response.data.content || []).map(alert => {
          const productNames = alert.products?.map(p => p.name) || [];
          const batchCodes = alert.batches?.map(b => b.code) || [];
          const inspectorNames = (alert.inspectors || []).map(i => i.name);
          const reviewerNames = (alert.reviewers || []).map(r => r.name);

          return {
            ...alert,
            product_names: productNames,
            batch_codes: batchCodes,

            product_display: (productNames[0] || '-') + (productNames.length > 1 ? ` +${productNames.length - 1}` : ''),
            batch_display: (batchCodes[0] || '-') + (batchCodes.length > 1 ? ` +${batchCodes.length - 1}` : ''),

            inspector_names: inspectorNames,
            reviewer_names: reviewerNames,

            form_display: alert.qc_form_template?.name || '-'
          };
        });

        this.pagination.total = response.data.totalElements || 0;
      } catch (error) {
        console.error("❌ " + this.translate('alarmRecords.messages.fetchRecordsFailed') + ":", error);
        this.$message.error(this.translate('alarmRecords.messages.fetchRecordsFailed'));
      } finally {
        this.table.loading = false;
      }
    },
    // fetchAlarmRiskLevels() {
    //   getAllAlarmRiskLevels().then(response => {
    //     this.filters.riskLevelOptions = response.data || [];
    //     console.log("this filters riskLevelOptions: ")
    //     console.log(this.filters.riskLevelOptions)
    //   });
    // },
    // fetchAlarmStatuses() {
    //   getAllAlarmStatuses().then(response => {
    //     this.filters.statusOptions = response.data || [];
    //   });
    // },
    deleteRecord(row) {
      this.$confirm(this.translate('alarmRecords.messages.deleteConfirm'), this.translate('common.warn'), {
        confirmButtonText: this.translate('common.confirm'),
        cancelButtonText: this.translate('common.cancel'),
        type: 'warning'
      }).then(async () => {
        try {
          const userId = this.$store.getters.getUser.id;
          await deleteAlertRecord(row.id, userId);
          this.$message.success(this.translate('alarmRecords.messages.deleteSuccess'));
          await this.fetchPaginatedAlerts(this.pagination.currentPage - 1, this.pagination.pageSize);
        } catch (error) {
          console.error(this.translate('alarmRecords.messages.deleteFailed'), error);
          this.$message.error(this.translate('alarmRecords.messages.deleteFailed'));
        }
      }).catch(() => {
        // 用户取消删除
      });
    },
    openSettingsDialog() {
      this.autoRefresh.enabledTemp = this.autoRefresh.enabled;
      this.autoRefresh.intervalTemp = this.autoRefresh.interval;
      this.dialogs.showSettingsDialog = true;
    },
    resetSettings() {
      this.autoRefresh.enabled = this.autoRefresh.enabledTemp;
      this.autoRefresh.interval = this.autoRefresh.intervalTemp;
    },
    exportTable() {
      console.log('导出假数据：', this.filteredOptions);  // 模拟导出，后续可加 CSV/PDF
    },
    renderRows({ row, rowIndex }) {
      const currentPage = this.pagination.currentPage;
      const editIndexes = this.table.indexesForEdit[currentPage] || [];
      if (editIndexes.includes(rowIndex)) {
        return 'warning-row';
      }
      return '';
    },
    updateRefreshStatus() {
      const hasEdit = Object.values(this.table.indexesForEdit).some(list => list.length > 0);
      if (hasEdit) {
        this.autoRefresh.statusKey = 3;
      } else if (!this.autoRefresh.enabled) {
        this.autoRefresh.statusKey = 2;
      } else {
        this.autoRefresh.statusKey = 1;
      }
    },
    async toggleEdit(row) {
      const index = this.paginatedAlerts.indexOf(row);
      const currentPage = this.pagination.currentPage;

      if (!this.table.indexesForEdit[currentPage]) {
        this.table.indexesForEdit[currentPage] = [];
      }

      this.autoRefresh.pausedByEdit = Object.values(this.table.indexesForEdit).some(list => list.length > 0);

      if (!row.isEditing) {
        row.isEditing = true;
        this.table.indexesForEdit[currentPage].push(index);
      } else {
        row.isEditing = false;

        try {
          const updatedBy = this.$store.getters.getUser.id;
          await updateAlertRecord({ id: row.id, rpn: row.rpn, updatedBy });
          this.$message.success(this.translate('alarmRecords.messages.saveAndUpdateSuccess'));

          const rpn = row.rpn;
          if (rpn >= 200) {
            row.risk_level = { id: 3, name: this.translate('common.riskLevels.high') || "高风险" };
          } else if (rpn >= 100) {
            row.risk_level = { id: 2, name: this.translate('common.riskLevels.medium') || "中风险" };
          } else {
            row.risk_level = { id: 1, name: this.translate('common.riskLevels.low') || "低风险" };
          }
          if (rpn < 30) {
            row.alert_status = { id: 2, name: this.translate('common.status.closed') || "已关闭" };
          } else {
            row.alert_status = { id: 1, name: this.translate('common.status.processing') || "处理中" };
          }
        } catch (error) {
          this.$message.error(this.translate('alarmRecords.messages.updateFailed'));
          console.error("❌ " + this.translate('alarmRecords.messages.updateFailed'), error);
        }

        await this.fetchAlertSummary(); // Refresh all chart data after risk level change

        const idx = this.table.indexesForEdit[currentPage].indexOf(index);
        if (idx !== -1) this.table.indexesForEdit[currentPage].splice(idx, 1);

        const oldRpn = row.rpn;
        const rpn = Number(row.rpn);
        const statusChange = rpn < 30 ? this.translate('alarmRecords.messages.statusAutoChanged') : '';
        this.$message({
          type: 'success',
          dangerouslyUseHTMLString: true,
          message: this.translateWithParams('alarmRecords.messages.rpnUpdated', { oldRpn, newRpn: rpn, statusChange })
        });
      }

      // 判断所有页 indexesForEdit 是否为空
      const isEditing = Object.values(this.table.indexesForEdit).some(arr => arr.length > 0);

      if (isEditing && this.autoRefresh.enabled && this.autoRefresh.timer) {  // 编辑中暂停刷新
        clearInterval(this.autoRefresh.timer);
        this.autoRefresh.timer = null;
        this.$message.warning(this.translate('alarmRecords.messages.autoRefreshPaused'));
      } else if (!isEditing && this.autoRefresh.enabled && !this.autoRefresh.timer) {  // 无编辑恢复刷新
        this.autoRefresh.timer = setInterval(() => {
          this.fetchAlertRecords();
        }, this.autoRefresh.interval * 1000);
        this.$message.success(this.translate('alarmRecords.messages.autoRefreshResumed'));
      }
    },
    handleSortChange({ prop, order }) {
      if (!prop || !order) return;
      this.pagination.sortSettings = { prop, order };
      this.fetchPaginatedAlerts(this.pagination.currentPage - 1, this.pagination.pageSize);
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.fetchPaginatedAlerts(this.pagination.currentPage - 1, size);
    },
    handleCurrentChange(page) {
      this.pagination.currentPage = page;
      this.fetchPaginatedAlerts(page - 1, this.pagination.pageSize);
    },
    handlePageChange(newPage) {
      this.pagination.currentPage = newPage;
      this.fetchPaginatedAlerts(newPage - 1, this.pagination.pageSize);
    },
    viewDetails(row) {
      this.selectedDetail.submissionId = row.submission_id;
      this.selectedDetail.formTemplateId = row.qc_form_template?.id;
      this.selectedDetail.createdAt = row.created_at;
      this.selectedDetail.inspectionItemLabel = row.inspection_item?.label || '';
      this.dialogs.showDetailDialog = true;
    },
    applyAlarmSetting() {
      this.autoRefresh.enabledTemp = this.autoRefresh.enabled;
      this.autoRefresh.intervalTemp = this.autoRefresh.interval;

      clearInterval(this.autoRefresh.timer);
      if (this.autoRefresh.enabled) {
        this.autoRefresh.timer = setInterval(() => {
          this.fetchAlertRecords();
        }, this.autoRefresh.interval * 1000);
      }
      this.autoRefresh.pausedByEdit = false;
      this.dialogs.showSettingsDialog = false;
      this.$message.success(
          this.autoRefresh.enabled
              ? this.translateWithParams('alarmRecords.messages.autoRefreshEnabled', { interval: this.autoRefresh.interval })
              : this.translate('alarmRecords.messages.autoRefreshDisabled')
      );
    }
  },
  mounted() {
    this.pagination.sortSettings = { prop: 'alertTime', order: 'descending' }; // 强制设定初始排序
    this.fetchPaginatedAlerts(); // 默认加载第一页
    this.fetchAlertSummary();
    this.fetchSuggestedProducts();
    this.fetchSuggestedBatches();

    getRiskLevels().then(res => {
      this.filterOptions.riskLevelOptions = res.data;
    });

    getAlertStatuses().then(res => {
      this.filterOptions.alertStatusOptions = res.data;
    });

    if (this.autoRefresh.enabled) {
      this.autoRefresh.timer = setInterval(() => {
        this.fetchPaginatedAlerts(this.pagination.currentPage - 1, this.pagination.pageSize);
      }, this.autoRefresh.interval * 1000);
    }

    this.updateRefreshStatus();
  },
  beforeUnmount() {
    clearInterval(this.autoRefresh.timer);
  }
};
</script>

<style scoped>

.tableContainer {
  overflow-x: auto;
  max-width: 100%;
}

::v-deep(.warning-row) {
  background-color: var(--el-color-warning-light-9) !important;
}

.rotate {
  animation: spin 2s linear infinite;
  color: #409EFF;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.alert-page-grid { /* 整个页面的 Grid 容器 */
  display: grid;
  grid-template-rows: auto auto auto 1fr auto; /* 5行：header, filter, charts, table, pager */
  grid-template-areas:
    "header"
    "filter"
    "charts"
    "table"
    "pager";
  height: calc(100vh - 20px); /* 占满整个视口高度 */
  gap: 10px; /* 区域间隔 */
}

/* 每个区域的 grid-area 绑定 */
.header-area { grid-area: header; }
.filter-area {
  grid-area: filter;
  display: grid; /* 改成 grid */
  grid-template-columns: 3fr 1fr 1fr; /* 左侧筛选项占3份，右侧按钮占1份 */
  align-items: center; /* 垂直居中 */
  gap: 20px; /* 左右区域间距 */
}
.charts-area {
  grid-area: charts;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 自动换行，每个最小300px，最大1fr */
  gap: 20px; /* 卡片间距 */
}
.table-area {
  grid-area: table;
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.pager-area { grid-area: pager; }


</style>
