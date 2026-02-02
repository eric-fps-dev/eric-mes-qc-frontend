<template>
  <el-container
      v-loading="pdfLoading"
      :element-loading-text="translate('FormDataSummary.loadingText')"
      element-loading-background="rgba(0, 0, 0, 0.4)"
      class="qcsum-container"
  >
    <splitpanes class="mes-split" style="height: 100%;" gutter-size="24" gutter-class="mes-gutter">
      <!-- LEFT: shared form selection -->
      <pane size="25" max-size="50" min-size="20" class="form-tree-pane">
        <FormTree @select-form="selectForm" @add-form="addForm" />
      </pane>

      <!-- RIGHT: tabs -->
      <pane style="padding: 15px; max-height: 100vh; overflow-y: auto;">
        <template v-if="isMainDisplayed">
          <el-tabs v-model="activeTab" class="right-tabs">
            <!-- TAB 1: Summary (existing content) -->
            <el-tab-pane :label="translate('FormDataSummary.summaryTitle')" name="summary">
              <div v-if="selectedForm" class="form-header">
                <h1>
                  {{ selectedForm.label }} {{ translate('FormDataSummary.summaryTitle') }}
                </h1>

                <el-date-picker
                    style="width: 400px; margin-left: 60px; margin-right: 20px"
                    v-model="dateRange"
                    type="datetimerange"
                    :shortcuts="shortcuts"
                    :range-separator="translate('FormDataSummary.dateRangeSeparator')"
                    :start-placeholder="translate('FormDataSummary.startPlaceholder')"
                    :end-placeholder="translate('FormDataSummary.endPlaceholder')"
                    @change="refreshChartData"
                    :clearable="false"
                />

                <el-button type="success" style="margin-top: 0;" @click="exportChartReportToPdf">
                  {{ translate('FormDataSummary.generatePdf') }}
                </el-button>

                <el-button
                    type="primary"
                    @click="qcRecordsDialogVisible = true"
                    style="margin-top: 0"
                >
                  {{ translate('FormDataSummary.viewRecords') }}
                </el-button>
              </div>

              <el-skeleton v-if="loadingCharts" :rows="6" animated />

              <div
                  v-else-if="selectedForm && !hasChartData"
                  style="text-align: center; margin-top: 50px;"
              >
                <el-empty :description="translate('FormDataSummary.noChartData')" />
              </div>

              <QcCharts
                  v-else-if="selectedForm && hasChartData"
                  :lineChartWidgets="lineChartWidgets"
                  :pieChartWidgets="pieChartWidgets"
                  @drilldown="handleChartDrilldown"
              />
            </el-tab-pane>

            <!-- ✅ Only show SPC tab if there are metrics for TODAY -->
            <el-tab-pane v-if="showSpcTab" label="SPC Charts" name="spc">
              <SpcCharts
                  v-if="activeTab === 'spc' && selectedForm"
                  :selectedForm="selectedForm"
                  :dateRange="dateRange"
                  :key="spcKey"
              />
              <div v-else-if="!selectedForm" style="display:flex; justify-content:center; margin-top: 30px;">
                <el-empty :description="translate('FormDataSummary.emptyPlaceholder')" image-size="160" />
              </div>
            </el-tab-pane>
          </el-tabs>
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

    <!-- Chart Drill-Down Dialog -->
    <ChartDrilldownDialog
        v-model:visible="drilldownDialogVisible"
        :selectedForm="selectedForm"
        :dateRange="dateRange"
        :drilldownParams="drilldownParams"
        @refreshCharts="refreshChartData"
    />
  </el-container>
</template>

<script>
import FormTree from "@/components/form-manager/FormTree.vue";
import { extractWidgetDataWithCounts, generateQcReport } from "@/services/qcReportingService";
import { translate } from "@/utils/i18n";
import QcCharts from "@/components/common/qc/QcCharts.vue";
import { provide } from "vue";
import { exportChartReportToPdf } from "@/utils/exportUtils";
import QcRecordsDialog from "@/components/common/QcRecordsDialog.vue";
import ChartDrilldownDialog from "@/components/common/qc/ChartDrilldownDialog.vue";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";

// ✅ SPC
import SpcCharts from "@/views/SpcCharts.vue";
import { fetchSpcSeries } from "@/services/spcService";

export default {
  components: {
    QcRecordsDialog,
    QcCharts,
    FormTree,
    Splitpanes,
    Pane,
    SpcCharts,
    ChartDrilldownDialog,
  },

  setup() {
    const lineChartRefs = [];
    const pieChartRefs = [];
    provide("lineChartRefs", lineChartRefs);
    provide("pieChartRefs", pieChartRefs);

    return { lineChartRefs, pieChartRefs };
  },

  data() {
    return {
      /* ---------------- Tabs ---------------- */
      activeTab: "summary",
      spcKey: 0,

      /* ✅ Gate SPC tab */
      showSpcTab: false,

      /* ---------------- Layout ---------------- */
      tableHeight: window.innerHeight - 220,

      /* ---------------- State ---------------- */
      pdfLoading: false,
      isMainDisplayed: false,
      loadingCharts: false,
      qcRecordsDialogVisible: false,
      drilldownDialogVisible: false,
      drilldownParams: {
        chartType: 'pie',
        fieldName: '',
        fieldLabel: '',
        optionLabel: '',
        optionValue: null,
        bucketStart: null,
        bucketEnd: null,
        bucketLabel: '',
      },

      /* ---------------- Date ---------------- */
      dateRange: [this.getStartOfMonth(), this.getEndOfMonth()],

      shortcuts: [
        {
          text: translate("FormDataSummary.shortcuts.today"),
          value: () => [this.getStartOfToday(), this.getEndOfToday()],
        },
        {
          text: translate("FormDataSummary.shortcuts.thisWeek"),
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - start.getDay() + 1);
            return [start, end];
          },
        },
        {
          text: translate("FormDataSummary.shortcuts.thisMonth"),
          value: () => [this.getStartOfMonth(), this.getEndOfMonth()],
        },
        {
          text: translate("FormDataSummary.shortcuts.lastMonth"),
          value: () => {
            const start = new Date(this.getStartOfMonth());
            start.setMonth(start.getMonth() - 1);
            const end = new Date(this.getEndOfMonth());
            end.setMonth(end.getMonth() - 1);
            return [start, end];
          },
        },
        {
          text: translate("FormDataSummary.shortcuts.lastThreeMonths"),
          value: () => {
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 3);
            return [start, end];
          },
        },
      ],

      /* ---------------- Data ---------------- */
      selectedForm: null,
      pieChartWidgets: [],
      lineChartWidgets: [],
      columnHeaders: [],
    };
  },

  mounted() {
    window.addEventListener("resize", this.updateTableHeight);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateTableHeight);
  },

  watch: {
    /* Refresh QC charts when dialog closes */
    qcRecordsDialogVisible() {
      this.refreshChartData();
    },

    /* SPC remount when switching into SPC tab */
    activeTab(val) {
      if (val === "spc") this.spcKey++;
    },
  },

  computed: {
    hasChartData() {
      // Check if any pie widget has non-zero data
      const hasPieData = this.pieChartWidgets.some(w =>
          w.chartData && w.chartData.some(d => d.value > 0)
      );

      // Check if any line widget has non-zero data
      // chartData for line widgets is an array of numbers
      const hasLineData = this.lineChartWidgets.some(w =>
          w.chartData && w.chartData.some(val => val > 0)
      );

      return hasPieData || hasLineData;
    }
  },

  methods: {
    translate,

    updateTableHeight() {
      this.tableHeight = window.innerHeight - 200;
    },

    /* ---------------- Export PDF ---------------- */
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
        $nextTick: this.$nextTick,
      });
      this.pdfLoading = false;
    },

    /* ---------------- Utils ---------------- */
    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return (
          `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-` +
          `${String(d.getUTCDate()).padStart(2, "0")} ` +
          `${String(d.getUTCHours()).padStart(2, "0")}:` +
          `${String(d.getUTCMinutes()).padStart(2, "0")}:` +
          `${String(d.getUTCSeconds()).padStart(2, "0")}`
      );
    },

    getStartOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    },

    getEndOfMonth() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    },

    /* ✅ ISO with offset: YYYY-MM-DDTHH:mm:ss±HH:mm */
    formatIsoWithOffset(date) {
      const pad = (n) => String(n).padStart(2, "0");
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      const hh = pad(date.getHours());
      const mm = pad(date.getMinutes());
      const ss = pad(date.getSeconds());

      const offMin = -date.getTimezoneOffset();
      const sign = offMin >= 0 ? "+" : "-";
      const offH = pad(Math.floor(Math.abs(offMin) / 60));
      const offM = pad(Math.abs(offMin) % 60);

      return `${y}-${m}-${d}T${hh}:${mm}:${ss}${sign}${offH}:${offM}`;
    },

    getStartOfToday() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    },

    getEndOfToday() {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    },

    /* ✅ GATE SPC TAB: call backend with TODAY; if data==[] => hide tab */
    async checkSpcAvailableForToday() {
      this.showSpcTab = false;

      const formTemplateId = this.selectedForm?.qcFormTemplateId;
      if (!formTemplateId || this.selectedForm?.nodeType === "folder") return;

      try {
        const start = this.getStartOfToday();
        const end = this.getEndOfToday();

        const res = await fetchSpcSeries({
          formTemplateId,
          startDateTime: this.formatIsoWithOffset(start),
          endDateTime: this.formatIsoWithOffset(end),
        });

        const payload = res?.data;

        this.showSpcTab =
            String(payload?.status) === "200" &&
            Array.isArray(payload?.data) &&
            payload.data.length > 0;

        if (!this.showSpcTab && this.activeTab === "spc") {
          this.activeTab = "summary";
        }
      } catch (err) {
        this.showSpcTab = false;
        if (this.activeTab === "spc") this.activeTab = "summary";
      }
    },

    /* ---------------- Selection ---------------- */
    async selectForm(form) {
      this.selectedForm = form;
      this.isMainDisplayed = this.selectedForm?.nodeType !== "folder";

      // always reset to Summary on new form
      this.activeTab = "summary";

      // ✅ decide whether SPC tab should exist (today only)
      await this.checkSpcAvailableForToday();

      if (this.selectedForm?.qcFormTemplateId && this.dateRange?.length === 2) {
        await this.refreshChartData();
      }
    },

    /* ---------------- QC Charts ---------------- */
    async refreshChartData() {
      if (!this.selectedForm || this.dateRange.length !== 2) return;

      const formTemplateId = this.selectedForm.qcFormTemplateId;
      const startDateTime = this.formatDate(this.dateRange[0]);
      const endDateTime = this.formatDate(this.dateRange[1]);

      console.log("📋 Form Template ID:", formTemplateId);
      console.log("📅 Start Date:", startDateTime);
      console.log("📅 End Date:", endDateTime);

      this.pieChartWidgets = [];
      this.lineChartWidgets = [];

      await this.fetchChartData(formTemplateId, startDateTime, endDateTime);
    },

    /* ---------------- Chart Drill-Down ---------------- */
    handleChartDrilldown(payload) {
      console.log('Chart drill-down triggered:', payload);

      this.drilldownParams = {
        chartType: payload.chartType,
        fieldName: payload.fieldName,
        fieldLabel: payload.fieldLabel || payload.fieldName,
        optionLabel: payload.optionLabel,
        optionValue: payload.optionValue,
        bucketStart: payload.bucketStart || null,
        bucketEnd: payload.bucketEnd || null,
        bucketLabel: payload.bucketLabel || '',
      };

      this.drilldownDialogVisible = true;
    },

    async fetchChartData(formTemplateId, startDateTime, endDateTime) {
      this.loadingCharts = true;

      try {
        const countResponse = await extractWidgetDataWithCounts(
            formTemplateId,
            startDateTime,
            endDateTime
        );

        const convertToLocalTime = (utcDateTime) => {
          const utcDate = new Date(utcDateTime + "Z");
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          return utcDate.toLocaleString("zh-CN", { timeZone: tz, hour12: false });
        };

        this.pieChartWidgets = countResponse.data
            .filter((w) => w.optionItems.length > 0)
            .map((w) => ({
              name: w.name,
              label: w.label,
              chartData: w.optionItems.map((o) => ({
                name: o.label,
                value: o.count,
              })),
              timeBucketedData: w.timeBucketedData || [],
              bucketLabels: w.bucketLabels || [],
              bucketType: w.bucketType || "daily",
            }));

        this.lineChartWidgets = countResponse.data
            .filter((w) => w.type === "number" && w.chartData && w.xaxisData)
            .map((w) => ({
              name: w.name,
              label: w.label,
              chartData: w.chartData,
              xaxisData: w.xaxisData.map(convertToLocalTime),
            }));
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        this.loadingCharts = false;
      }
    },
  },
};
</script>

<style scoped>
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mes-split {
  height: 100%;
  display: flex;
  overflow: hidden;
}

.form-tree-pane {
  border-right: 2px solid rgba(102, 102, 102, 0.2);
}

:deep(.splitpanes__splitter) {
  background-color: #ccc;
  position: relative;
}

:deep(.splitpanes__splitter)::before {
  content: "";
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

/* Tabs: keep content clean in the scrollable right pane */
.right-tabs {
  width: 100%;
}
.form-header h1 {
  font-size: 24px;
  font-weight: 700;
  padding: 24px 0px;
  margin: 0;
  color: #111827;
  line-height: 1.2;
}
</style>
