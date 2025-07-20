<template>
  <el-container v-loading="pdfLoading" :element-loading-text="translate('FormDataSummary.loadingText')" element-loading-background="rgba(0, 0, 0, 0.4)" class="qcsum-container">
    <splitpanes class="mes-split" style="height: 100%;" gutter-size="24" gutter-class="mes-gutter">
      <pane size="25" max-size="50" min-size="20" class="form-tree-pane">
        <FormTree @select-form="selectForm" @add-form="addForm" />
      </pane>

      <pane style="padding: 15px; max-height: 100vh; overflow-y: auto;">
        <template v-if="isMainDisplayed">
          <div v-if="selectedForm" class="form-header">
            <h1 style="width: 200px">{{ selectedForm.label }} {{ translate('FormDataSummary.summaryTitle') }}</h1>
            <el-date-picker
                style="width: 320px; margin-left: 150px; margin-right: 20px"
                v-model="dateRange"
                type="datetimerange"
                :shortcuts="shortcuts"
                :range-separator="translate('FormDataSummary.dateRangeSeparator')"
                :start-placeholder="translate('FormDataSummary.startPlaceholder')"
                :end-placeholder="translate('FormDataSummary.endPlaceholder')"
                @change="refreshChartData"
                :clearable="false"
            />
            <el-button type="success" style="margin-top: 0;" @click="exportChartReportToPdf">{{ translate('FormDataSummary.generatePdf') }}</el-button>
            <el-button
                type="primary"
                @click="qcRecordsDialogVisible = true"
                style="margin-top: 0"
            >
              {{ translate('FormDataSummary.viewRecords') }}
            </el-button>
          </div>

          <el-skeleton v-if="loadingCharts" :rows="6" animated />

          <div v-if="selectedForm && lineChartWidgets.length === 0 && pieChartWidgets.length === 0 && !loadingCharts" style="text-align: center; margin-top: 50px;">
            <el-empty :description="translate('FormDataSummary.noChartData')" />
          </div>

          <QcCharts
              v-else
              :lineChartWidgets="lineChartWidgets"
              :pieChartWidgets="pieChartWidgets"
          />
        </template>

        <template v-else>
          <div style="display: flex; justify-content: center; margin-top: 40vh; transform: translateY(-50%)">
            <el-empty
                :description="translate('FormDataSummary.emptyPlaceholder')"
                image-size="200"
            />
          </div>
        </template>
      </pane>
    </splitpanes>
    <!-- QC Records Dialog Component -->
    <QcRecordsDialog
        v-model:visible="qcRecordsDialogVisible"
        :selectedForm="selectedForm"
        :dateRange="dateRange"
    />

  </el-container>
</template>

<script>
import FormTree from '@/components/form-manager/FormTree.vue';
import {extractWidgetDataWithCounts, generateQcReport} from "@/services/qcReportingService";
import {translate} from "@/utils/i18n";
import QcCharts from "@/components/common/qc/QcCharts.vue";
import {provide, ref, watch} from "vue";
import {exportChartReportToPdf} from "@/utils/exportUtils";
import QcRecordsDialog from "@/components/common/QcRecordsDialog.vue";
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';

export default {
  components: {QcRecordsDialog, QcCharts, FormTree, Splitpanes, Pane },
  setup() {
    const lineChartRefs = [];
    const pieChartRefs = [];
    provide("lineChartRefs", lineChartRefs);
    provide("pieChartRefs", pieChartRefs);

    return {
      lineChartRefs,
      pieChartRefs
    };
  },
  data() {
    return {
      tableHeight: window.innerHeight - 220,
      pdfLoading: false,
      isMainDisplayed: false,
      dateRange: [this.getStartOfMonth(), this.getEndOfMonth()], // Default to current month
      loadingCharts: false,
      qcRecordsDialogVisible: false,
      shortcuts: [
        {
          text: translate('FormDataSummary.shortcuts.thisWeek'),
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - start.getDay() + 1);
            return [start, end];
          },
        },
        {
          text: translate('FormDataSummary.shortcuts.thisMonth'),
          value: () => [this.getStartOfMonth(), this.getEndOfMonth()],
        },
        {
          text: translate('FormDataSummary.shortcuts.lastMonth'),
          value: () => {
            const start = new Date(this.getStartOfMonth());
            start.setMonth(start.getMonth() - 1);
            const end = new Date(this.getEndOfMonth());
            end.setMonth(end.getMonth() - 1);
            return [start, end];
          },
        },
        {
          text: translate('FormDataSummary.shortcuts.lastThreeMonths'),
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 3);
            return [start, end];
          },
        },
      ],
      selectedForm: null,
      pieChartWidgets: [],
      lineChartWidgets: [],
      columnHeaders: []
    };
  },
  mounted() {
    window.addEventListener('resize', this.updateTableHeight);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateTableHeight); // Remove resize listener
  },
  updateTableHeight() {
    this.tableHeight = window.innerHeight - 200;
  },
  watch: {
    qcRecordsDialogVisible(newVal) {
      // Refresh chart data when dialog opens or closes
      this.refreshChartData();
    }
  },
  methods: {
    translate,
    async exportChartReportToPdf() {
      this.pdfLoading = true;
      await exportChartReportToPdf({
        lineChartWidgets: this.lineChartWidgets,
        pieChartWidgets: this.pieChartWidgets,
        lineChartRefs: this.lineChartRefs,
        pieChartRefs: this.pieChartRefs,
        selectedForm: this.selectedForm,
        dateRange: this.dateRange,
        translate,
        formatDate: this.formatDate,
        generateQcReport,
        $message: this.$message,
        $nextTick: this.$nextTick
      });
      this.pdfLoading = false;
    },
    formatDate(date) { // convert to the client local time also to the YYYY-MM-DD HH:MM:SS string in 24 hours
      if (!date) return "";
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
          `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    },
    async refreshChartData() {
      if (!this.selectedForm || !this.dateRange || this.dateRange.length !== 2) return;

      const formTemplateId = this.selectedForm.qcFormTemplateId;
      const startDateTime = this.formatDate(this.dateRange[0]);
      const endDateTime = this.formatDate(this.dateRange[1]);
      // console log the dates here
      // log formTemplateId
      console.log("📋 Form Template ID:", formTemplateId)
      console.log("📅 Start Date:", startDateTime);
      console.log("📅 End Date:", endDateTime);

      // Reset the arrays before fetching new data
      this.pieChartWidgets = [];
      this.lineChartWidgets = [];

      await this.fetchChartData(formTemplateId, startDateTime, endDateTime);
    },
    getStartOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    },
    getEndOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    },
    async selectForm(form) {
      this.selectedForm = form;
      this.isMainDisplayed = this.selectedForm.nodeType !== "folder";

      if (this.selectedForm?.qcFormTemplateId && this.dateRange?.length === 2) {
        await this.refreshChartData(); // ✅ This will use selectedForm + dateRange
      }
    },
    async fetchChartData(formTemplateId, startDateTime, endDateTime) {
      this.loadingCharts = true; // Start loading indicator

      try {
        // Call extractWidgetDataWithCounts with formTemplateId
        const countResponse = await extractWidgetDataWithCounts(formTemplateId, startDateTime, endDateTime);

        // Function to convert UTC timestamp to client local time
        const convertToLocalTime = (utcDateTime) => {
          const utcDate = new Date(utcDateTime + "Z"); // Ensure it's treated as UTC
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          return utcDate.toLocaleString("zh-CN", { timeZone: userTimezone, hour12: false });
        };

        // Process PieChart widgets (for option-based items)
        this.pieChartWidgets = countResponse.data
            .filter(widget => widget.optionItems.length > 0) // Only include widgets with options
            .map(widget => ({
              name: widget.name,
              label: widget.label,
              chartData: widget.optionItems.map(option => ({
                name: option.label,
                value: option.count
              }))
            }));

        // Process LineChart widgets (for number-type items)
        this.lineChartWidgets = countResponse.data
            .filter(widget => widget.type === "number") // Filter out only number fields
            .map(widget => ({
              name: widget.name,
              label: widget.label,
              chartData: widget.chartData, // Directly use extracted numerical data
              xaxisData: widget.xaxisData.map(convertToLocalTime) // Convert x-axis timestamps to local time
            }));

      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        this.loadingCharts = false; // Stop loading indicator
      }
    },
  }
};
</script>

<style scoped>

.form-header {
    display: flex;
    justify-content: space-between; /* Left and Right Alignment */
    align-items: center; /* Vertically Center */
  }

  .chart-card {
    margin: 20px 0;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .chart-card.hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .el-table {
    overflow-x: auto;
    display: block;
    max-width: 100%;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .group-header .cell {
    font-weight: bold !important;
    font-size: 16px; /* Adjust the size as needed */
    text-align: center;
  }

  .mes-split {
    height: 100%;
    display: flex;
    overflow: hidden;
  }

  .form-tree-pane {
    border-right: 2px solid rgba(102, 102, 102, 0.2);
  }

  .empty-placeholder {
    display: flex;
    justify-content: center;
    margin-top: 40vh;
    transform: translateY(-50%);
  }

  :deep(.splitpanes__splitter) {
    background-color: #ccc;
    position: relative;
  }

  :deep(.splitpanes__splitter)::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    transition: opacity 0.4s;
    background-color: #466a9f55;
    opacity: 0;
    z-index: 1;
  }

  :deep(.splitpanes__splitter):hover::before {
    opacity: 1;
  }

  :deep(.splitpanes--vertical > .splitpanes__splitter)::before {
    left: -5px;
    right: -5px;
    height: 100%;
  }


</style>
