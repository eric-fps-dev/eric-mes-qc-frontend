<template>
  <div class="spc-dashboard-pro">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="logo-area">
          <h1>SPC Charts</h1>
        </div>
      </div>

      <div class="header-right">
        <div class="field-stack">
          <label class="field-label">Last 7 Days Until</label>
          <el-date-picker
              v-model="selectedEndDate"
              type="date"
              size="small"
              class="header-control"
              placeholder="End date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :clearable="false"
              teleported
              :disabled="spcDebugLoading"
          />
        </div>

        <div class="field-stack">
          <label class="field-label">Select Metric</label>
          <el-select
              v-model="activeMetric"
              size="small"
              class="header-control"
              placeholder="Select Metric"
              teleported
              :disabled="spcDebugLoading || !hasMetrics"
              clearable
          >
            <el-option
                v-for="opt in metricOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
            />
          </el-select>
        </div>

        <div class="field-stack">
          <label class="field-label">Select Chart Type</label>
          <el-select
              v-model="activeChart"
              size="small"
              class="header-control"
              placeholder="Select Chart"
              teleported
              :disabled="spcDebugLoading || !hasMetrics || !activeMetric"
          >
            <el-option
                v-for="opt in availableChartOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
            />
          </el-select>
        </div>
      </div>
    </div>

    <el-container class="main-container">
      <el-main class="content-area">

        <!-- EMPTY STATE (no metrics returned from API) -->
        <div v-if="!spcDebugLoading && !spcDebugError && !hasMetrics" class="chart-card-container">
          <el-empty
              :description="noMetricsMessage"
              image-size="160"
          />
        </div>

        <!-- ERROR -->
        <div v-else-if="!spcDebugLoading && spcDebugError" class="chart-card-container">
          <el-alert :title="spcDebugError" type="error" show-icon />
        </div>

        <!-- LOADING -->
        <div v-else-if="spcDebugLoading" class="chart-card-container">
          <el-skeleton :rows="6" animated />
        </div>

        <!-- NORMAL: has metrics -->
        <template v-else>
          <div class="chart-card-container">
            <div class="chart-title-bar">
              <div class="title-row" style="display:flex; align-items:center; gap:12px;">
                <h2>{{ dynamicDisplayHeader.title }}</h2>
                <el-tag
                    :type="allChartOptions.find(o => o.value === activeChart)?.subgroupRequired ? 'warning' : 'primary'"
                    size="small"
                >
                  {{ allChartOptions.find(o => o.value === activeChart)?.subgroupRequired ? 'Subgroup' : 'Individual' }}
                </el-tag>
              </div>
              <p class="chart-desc">{{ dynamicDisplayHeader.desc }}</p>
            </div>

            <div id="mainChart" class="main-chart-canvas"></div>
          </div>

          <!-- Data Table -->
          <div class="data-log-container">
            <h3>Data Logs</h3>

            <div v-if="!activeMetric" style="padding: 8px 0;">
              <el-empty description="Select a metric to view data logs." image-size="120" />
            </div>

            <div v-else-if="tableData.length === 0" style="padding: 8px 0;">
              <el-empty description="No data during this time range." image-size="120" />
            </div>

            <div v-else class="horizontal-scroll-wrapper">
              <div class="data-grid-transposed">
                <div class="log-row">
                  <div class="row-label">Data Point</div>
                  <div v-for="item in tableData" :key="'id-'+item.id" class="row-cell">
                    {{ item.id }}
                  </div>
                </div>

                <div class="log-row">
                  <div class="row-label">Time</div>
                  <div v-for="item in tableData" :key="'t-'+item.id" class="row-cell">
                    {{ item.timestamp }}
                  </div>
                </div>

                <div class="log-row">
                  <div class="row-label">Raw Value</div>
                  <div v-for="item in tableData" :key="'v-'+item.id" class="row-cell highlight">
                    {{ item.value }}
                  </div>
                </div>

                <div class="log-row" v-if="activeChart === 'ma'">
                  <div class="row-label">MA</div>
                  <div v-for="item in tableData" :key="'ma-'+item.id" class="row-cell">
                    {{ item.ma }}
                  </div>
                </div>

                <div class="log-row" v-if="activeChart === 'ewma'">
                  <div class="row-label">EWMA</div>
                  <div v-for="item in tableData" :key="'e-'+item.id" class="row-cell">
                    {{ item.ewma }}
                  </div>
                </div>

                <div class="log-row" v-if="activeChart === 'cusum'">
                  <div class="row-label">C+</div>
                  <div v-for="item in tableData" :key="'cp-'+item.id" class="row-cell">
                    {{ item.cp }}
                  </div>
                </div>

                <div class="log-row" v-if="activeChart === 'cusum'">
                  <div class="row-label">C-</div>
                  <div v-for="item in tableData" :key="'cm-'+item.id" class="row-cell">
                    {{ item.cm }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== SPC API DEBUG OUTPUT ===== -->
          <div style="margin-top: 24px;">
            <h3>SPC API Debug</h3>

            <div v-if="spcDebugLoading">Loading SPC data…</div>

            <div v-else-if="spcDebugError" style="color: #ef4444;">
              {{ spcDebugError }}
            </div>

            <pre
                v-else
                style="
                max-height: 320px;
                overflow: auto;
                background: #0b1020;
                color: #e5e7eb;
                padding: 12px;
                border-radius: 8px;
                font-size: 12px;
              "
            >{{ JSON.stringify(spcDebugResponse, null, 2) }}</pre>
          </div>
        </template>

      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import * as echarts from "echarts";
import dayjs from "dayjs";
import { fetchSpcSeries } from "@/services/spcService";

// =========================
// Props
// =========================
const props = defineProps({
  selectedForm: { type: Object, required: true },
  dateRange: { type: Array, required: true }, // not used here
});

const formTemplateId = computed(() => props.selectedForm?.qcFormTemplateId);

// =========================
// UI State
// =========================
const selectedEndDate = ref(dayjs().format("YYYY-MM-DD"));
const activeMetric = ref(null);
const activeChart = ref("imr");

let chartInstance = null;

// =========================
// API State
// =========================
const spcDebugResponse = ref(null);
const spcDebugError = ref("");
const spcDebugLoading = ref(false);

const noMetricsMessage = "No metrics with defined limits were found for this form and date range";

// Convenience: API fields array
const fieldsFromApi = computed(() => spcDebugResponse.value?.data || []);
const hasMetrics = computed(() => Array.isArray(fieldsFromApi.value) && fieldsFromApi.value.length > 0);

// =========================
// Load from backend
// =========================
async function debugLoadSpc() {
  if (!formTemplateId.value) {
    spcDebugResponse.value = null;
    spcDebugError.value = "";
    activeMetric.value = null;
    clearChart();
    return;
  }

  spcDebugLoading.value = true;
  spcDebugError.value = "";

  try {
    const end = dayjs(selectedEndDate.value, "YYYY-MM-DD").endOf("day");
    const start = end.subtract(7, "day").startOf("day");

    const res = await fetchSpcSeries({
      formTemplateId: formTemplateId.value,
      startDateTime: start.format("YYYY-MM-DDTHH:mm:ssZ"),
      endDateTime: end.format("YYYY-MM-DDTHH:mm:ssZ"),
    });

    const payload = res?.data;

    if (String(payload?.status) !== "200") {
      spcDebugResponse.value = null;
      spcDebugError.value = payload?.message || "SPC request failed";
      activeMetric.value = null;
      return;
    }

    spcDebugResponse.value = payload;
    spcDebugError.value = "";

    // select first metric (or null if none)
    activeMetric.value = payload?.data?.[0]?.fieldId || null;
  } catch (err) {
    spcDebugResponse.value = null;
    spcDebugError.value = err?.response?.data?.message || err?.message || "SPC request failed";
    activeMetric.value = null;
  } finally {
    spcDebugLoading.value = false;
  }

  // wait until loading flag flips, so #mainChart exists
  await nextTick();

  if (!hasMetrics.value || !activeMetric.value) {
    clearChart();
    return;
  }

  // sometimes one tick isn't enough when switching v-if branches
  await nextTick();
  renderChart();
}

// reload API when end date changes
watch(selectedEndDate, async () => {
  await debugLoadSpc();
});

// reload API when switching form
watch(
    () => formTemplateId.value,
    async () => {
      await debugLoadSpc();
    },
    { immediate: true }
);

// =========================
// Chart Catalog
// =========================
const allChartOptions = [
  { value: "imr", label: "I-MR", subgroupRequired: false, minN: 1 },
  { value: "levey", label: "Levey-Jennings", subgroupRequired: false, minN: 1 },
  { value: "ewma", label: "EWMA", subgroupRequired: false, minN: 1 },
  { value: "ma", label: "MA", subgroupRequired: false, minN: 1 },
  { value: "cusum", label: "CuSum", subgroupRequired: false, minN: 1 },
];

const chartTypeDescriptions = {
  imr: "Tracks individual values and moving range",
  levey: "Shows values vs the mean using standard deviation bands",
  ewma: "Smooths data to detect small or gradual process shifts",
  ma: "Highlights trends by averaging the most recent points",
  cusum: "Detects persistent shifts by accumulating deviations from target",
};

// =========================
// Dynamic metrics (NO FALLBACK)
// =========================
const metricsConfig = computed(() => {
  const fields = fieldsFromApi.value;
  const cfg = {};

  for (const f of fields) {
    const lsl = Number(f?.limits?.lowLimit);
    const usl = Number(f?.limits?.maxLimit);
    const hasLimits = Number.isFinite(lsl) && Number.isFinite(usl);

    const target = hasLimits ? (lsl + usl) / 2 : 0;

    cfg[f.fieldId] = {
      label: f.fieldName || f.fieldId,
      allowedCharts: ["imr", "levey", "ewma", "ma", "cusum"],
      target,
      usl: hasLimits ? usl : null,
      lsl: hasLimits ? lsl : null,
      indRaw: (f.timeSeries || []).map((p) => ({
        timestamp: dayjs(p.timestamp).local().format("YYYY-MM-DD HH:mm:ss"),
        value: Number(p.value),
      })),
    };
  }

  return cfg;
});

const metricOptions = computed(() =>
    Object.entries(metricsConfig.value).map(([key, def]) => ({
      value: key,
      label: def.label,
    }))
);

// keep activeMetric valid when API changes
watch(
    () => metricsConfig.value,
    async (cfg) => {
      const keys = Object.keys(cfg || {});
      if (!keys.length) {
        activeMetric.value = null;
        clearChart();
        return;
      }

      if (!activeMetric.value || !cfg[activeMetric.value]) {
        activeMetric.value = keys[0];
      }

      const allowed = cfg[activeMetric.value]?.allowedCharts || [];
      if (allowed.length && !allowed.includes(activeChart.value)) {
        activeChart.value = allowed[0];
      }

      await nextTick();
      renderChart();
    },
    { immediate: true }
);

const metricDef = computed(() => (activeMetric.value ? metricsConfig.value[activeMetric.value] : null));

const dynamicDisplayHeader = computed(() => {
  const m = metricDef.value || { label: "" };
  const c = allChartOptions.find((opt) => opt.value === activeChart.value);

  return {
    title: `${m.label} - ${c?.label || ""}`,
    desc: chartTypeDescriptions[activeChart.value] || "",
  };
});

const availableChartOptions = computed(() => {
  const allowed = metricDef.value?.allowedCharts || [];
  return allChartOptions.filter((opt) => allowed.includes(opt.value));
});

// =========================
// Build computed series
// =========================
const indRaw = computed(() => metricDef.value?.indRaw || []);
const indData = computed(() => buildIndDataFromRaw(indRaw.value || [], metricDef.value));

watch(activeMetric, async () => {
  await nextTick();
  renderChart();
});
watch(activeChart, async () => {
  await nextTick();
  renderChart();
});

// =========================
// Table
// =========================
const tableData = computed(() => {
  if (!activeMetric.value) return [];
  const source = indData.value || [];
  if (!source.length) return [];

  const windowSize = 10;
  const allPoints = [...source].map((d, idx) => ({ ...d, id: idx + 1 }));

  return allPoints.map((d, index, array) => {
    const start = Math.max(0, index - windowSize + 1);
    const subset = array.slice(start, index + 1);
    const sum = subset.reduce((acc, curr) => acc + (curr.value ?? 0), 0);
    const ma = subset.length ? sum / subset.length : null;

    return {
      id: d.id,
      timestamp: d.timestamp,
      value: Number.isFinite(d.value) ? Number(d.value).toFixed(2) : "-",
      ewma: Number.isFinite(d.ewma) ? Number(d.ewma).toFixed(2) : "-",
      ma: Number.isFinite(ma) ? Number(ma).toFixed(2) : "-",
      cp: Number.isFinite(d.cp) ? Number(d.cp).toFixed(2) : "-",
      cm: Number.isFinite(d.cm) ? Number(d.cm).toFixed(2) : "-",
    };
  });
});

// =========================
// Lifecycle
// =========================
onMounted(() => {
  window.addEventListener("resize", resizeChart);
});
onUnmounted(() => {
  window.removeEventListener("resize", resizeChart);
  disposeChart();
});

function resizeChart() {
  if (chartInstance) chartInstance.resize();
}

// =========================
// Chart render / clear
// =========================
function renderChart() {
  if (!hasMetrics.value || !activeMetric.value || !metricDef.value) {
    clearChart();
    return;
  }

  const dom = document.getElementById("mainChart");
  if (!dom) return;

  if (!chartInstance) chartInstance = echarts.init(dom);

  const option = getChartOptions(activeChart.value);
  chartInstance.setOption(option, { notMerge: true });
}

function clearChart() {
  const dom = document.getElementById("mainChart");
  if (!dom) return;

  if (!chartInstance) chartInstance = echarts.init(dom);
  chartInstance.clear();
}

function disposeChart() {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
}

// =========================
// Helpers
// =========================
const COLOR_BAD = "#ef4444";

function asPoint(v, isBad) {
  if (v == null || Number.isNaN(v)) return v;
  return isBad
      ? { value: v, itemStyle: { color: COLOR_BAD }, emphasis: { itemStyle: { color: COLOR_BAD } } }
      : { value: v };
}

function toNum(v) {
  if (v && typeof v === "object" && "value" in v) return Number(v.value);
  return Number(v);
}

function niceBounds(values = [], padRatio = 0.07, desiredTicks = 6) {
  const nums = values.map(toNum).filter((v) => Number.isFinite(v));
  if (!nums.length) return { min: null, max: null, interval: null };

  let min = Math.min(...nums);
  let max = Math.max(...nums);

  if (min === max) {
    const bump = Math.abs(min) * 0.03 + 1;
    min -= bump;
    max += bump;
  } else {
    const pad = (max - min) * padRatio;
    min -= pad;
    max += pad;
  }

  const span = max - min;
  const rough = span / Math.max(2, desiredTicks);

  const pow10 = Math.pow(10, Math.floor(Math.log10(rough)));
  const steps = [1, 2, 2.5, 5, 10].map((m) => m * pow10);
  const interval = steps.reduce((best, c) => (Math.abs(c - rough) < Math.abs(best - rough) ? c : best), steps[0]);

  const minNice = Math.floor(min / interval) * interval;
  const maxNice = Math.ceil(max / interval) * interval;

  return { min: minNice, max: maxNice, interval };
}

function mergeAxis(base = {}, extra = {}) {
  const a = { ...base, ...extra };
  a.axisLabel = { ...(base.axisLabel || {}), ...(extra.axisLabel || {}) };
  a.splitLine = { ...(base.splitLine || {}), ...(extra.splitLine || {}) };
  return a;
}

const Y_AXIS_BASE = {
  scale: true,
  axisLabel: { margin: 6 },
  splitLine: { show: false },
};

function applyDynamicY(option, y0, y1) {
  if (Array.isArray(option.yAxis)) {
    option.yAxis[0] = mergeAxis(Y_AXIS_BASE, option.yAxis[0] || {});
    if (y0?.min != null) option.yAxis[0] = { ...option.yAxis[0], ...y0 };

    if (option.yAxis[1]) {
      option.yAxis[1] = mergeAxis(Y_AXIS_BASE, option.yAxis[1] || {});
      if (y1?.min != null) option.yAxis[1] = { ...option.yAxis[1], ...y1 };
    }
  } else {
    option.yAxis = mergeAxis(Y_AXIS_BASE, option.yAxis || {});
    if (y0?.min != null) option.yAxis = { ...option.yAxis, ...y0 };
  }
  return option;
}

function addZoom(option, xAxisCount = 1) {
  option.dataZoom = [
    {
      type: "slider",
      xAxisIndex: [...Array(xAxisCount).keys()],
      height: 24,
      bottom: 8,
      start: 0,
      end: 100,
    },
  ];

  if (option.grid) {
    option.grid = Array.isArray(option.grid) ? option.grid.map((g) => ({ ...g, bottom: 45 })) : { ...option.grid, bottom: 45 };
  }

  return option;
}

function addRightSpacer(option, xAxisCount = 1, padCats = 2) {
  if (!padCats || padCats <= 0) return option;

  const xs = Array.isArray(option.xAxis) ? option.xAxis : [option.xAxis].filter(Boolean);
  for (let i = 0; i < Math.min(xAxisCount, xs.length); i++) {
    if (xs[i] && Array.isArray(xs[i].data)) {
      xs[i] = { ...xs[i], data: [...xs[i].data, ...Array(padCats).fill("")] };
    }
  }
  option.xAxis = Array.isArray(option.xAxis) ? xs : xs[0];

  const padNulls = Array(padCats).fill(null);
  option.series = (option.series || []).map((s) => {
    if (!s || !Array.isArray(s.data) || s.data.length === 0) return s;
    return { ...s, data: [...s.data, ...padNulls] };
  });

  return option;
}

function ladderBlockLabel(ucl, cl, lcl, decimals = 2) {
  const fmt = (v) => (Number.isFinite(Number(v)) ? Number(v).toFixed(decimals) : "-");

  return {
    show: true,
    position: "end",
    offset: [12, 0],
    align: "left",
    verticalAlign: "middle",
    color: "#000000",
    fontSize: 11,
    lineHeight: 16,
    backgroundColor: "rgba(255,255,255,0.90)",
    padding: [4, 6],
    borderRadius: 4,
    formatter: () => `UCL= ${fmt(ucl)}\nCL= ${fmt(cl)}\nLCL= ${fmt(lcl)}`,
  };
}

function ensureYAxis(y) {
  return y && Number.isFinite(y.min) && Number.isFinite(y.max) ? y : { min: 0, max: 1 };
}

// ---- NEW: force markLines + y-axis for EWMA/MA even when no points
function safeNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function fallbackLinesFromMetric(m) {
  const cl = safeNumber(m?.target) ?? 0;
  const u = safeNumber(m?.usl);
  const l = safeNumber(m?.lsl);
  return { ucl: u ?? cl + 1, cl, lcl: l ?? cl - 1 };
}

// =========================
// Build point stats
// =========================
function buildIndDataFromRaw(indRaw = [], m) {
  const target = Number(m?.target ?? 0);

  const pts = (indRaw || []).map((row, idx) => ({
    id: idx + 1,
    timestamp: row.timestamp,
    value: Number(row.value),
  }));

  for (let i = 0; i < pts.length; i++) {
    pts[i].mr = i === 0 ? null : Math.abs(pts[i].value - pts[i - 1].value);
  }

  const mrs = pts.map((p) => p.mr).filter((v) => v != null);
  const mrBar = mrs.length ? mrs.reduce((a, b) => a + b, 0) / mrs.length : 0;
  const sigmaEst = mrBar / 1.128;

  const lambda = 0.2;
  const L = 3;

  for (let i = 0; i < pts.length; i++) {
    const prev = i === 0 ? target : pts[i - 1].ewma ?? target;
    pts[i].ewma = lambda * pts[i].value + (1 - lambda) * prev;

    const t = i + 1;
    const sigmaZt = sigmaEst * Math.sqrt((lambda / (2 - lambda)) * (1 - Math.pow(1 - lambda, 2 * t)));

    pts[i].ucl = target + L * sigmaZt;
    pts[i].lcl = target - L * sigmaZt;
    pts[i].cl = target;
  }

  const k = 0.5 * sigmaEst;
  let cpPrev = 0;
  let cmPrev = 0;

  for (let i = 0; i < pts.length; i++) {
    const x = pts[i].value;
    const cp = Math.max(0, x - (target + k) + cpPrev);
    const cm = Math.max(0, (target - k) - x + cmPrev);
    pts[i].sigmaEst = sigmaEst;
    pts[i].k = k;
    pts[i].cp = cp;
    pts[i].cm = cm;
    cpPrev = cp;
    cmPrev = cm;
  }

  return pts;
}

// =========================
// Chart Options
// =========================
function getChartOptions(type) {
  const titleStyle = { fontSize: 15 };

  const commonTooltip = {
    trigger: "axis",
    axisPointer: { show: false },
    formatter: (params) => {
      if (!params?.length) return "";
      let res = `${params[0].name}<br/>`;
      params.forEach((p) => {
        const rawV = p.data && typeof p.data === "object" && "value" in p.data ? p.data.value : p.value;
        const val = rawV == null || isNaN(rawV) ? "-" : Number(rawV).toFixed(2);
        res += `${p.marker} ${p.seriesName}: <b>${val}</b><br/>`;
      });
      return res;
    },
  };

  const gridSingle = { top: 55, left: 52, right: 95, bottom: 55, containLabel: true };
  const gridDual = [
    { top: 55, left: 52, right: 95, height: "35%", containLabel: true },
    { top: "55%", left: 52, right: 95, height: "35%", containLabel: true },
  ];

  const dataInd = indData.value || [];
  const labelsInd = dataInd.map((d) => d.id);

  // ===== I-MR =====
// ===== I-MR =====
  if (type === "imr") {
    const valsNums = dataInd.map((d) => d.value);
    const mrsPlotNums = dataInd.map((d) => d.mr);
    const mrsCalc = mrsPlotNums.filter((v) => v != null);

    const xBar = valsNums.reduce((a, b) => a + b, 0) / (valsNums.length || 1);
    const mrBar = mrsCalc.length ? mrsCalc.reduce((a, b) => a + b, 0) / mrsCalc.length : 0;

    const E2 = 2.66;
    const uclX = xBar + E2 * mrBar;
    const clX = xBar;
    const lclX = xBar - E2 * mrBar;

    const uclMR = 3.267 * mrBar;
    const clMR = mrBar;
    const lclMR = 0;

    // ✅ user-designed spec limits (LSL/USL)
    const usl = safeNumber(metricDef.value?.usl);
    const lsl = safeNumber(metricDef.value?.lsl);

    // out-of-control highlighting (control limits only)
    const xPoints = dataInd.map((d) => asPoint(d.value, d.value > uclX || d.value < lclX));
    const mrPoints = dataInd.map((d) => asPoint(d.mr, d.mr != null && d.mr > uclMR));

    const opt = {
      title: [
        { text: "Individual (I)", left: "center", textStyle: titleStyle },
        { text: "Moving Range (MR)", top: "50%", left: "center", textStyle: titleStyle },
      ],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{ data: labelsInd }, { data: labelsInd, gridIndex: 1 }],
      yAxis: [{}, { gridIndex: 1 }],
      series: [
        {
          name: "X",
          type: "line",
          symbol: "circle",
          symbolSize: 6,
          data: xPoints,
          markLine: {
            symbol: ["none", "none"],
            silent: true,
            label: { show: false },
            data: [
              // ---- Control limits (SPC) ----
              { yAxis: uclX, lineStyle: { color: "#ef4444", type: "dashed" }, label: { show: false } },
              {
                yAxis: clX,
                lineStyle: { color: "#22c55e", type: "solid" },
                label: ladderBlockLabel(uclX, clX, lclX),
              },
              { yAxis: lclX, lineStyle: { color: "#ef4444", type: "dashed" }, label: { show: false } },

              // ---- Spec limits (User-defined) ----
              ...(usl != null
                  ? [
                    {
                      yAxis: usl,
                      lineStyle: { color: "#ef4444", type: "dashed", width: 1 },
                      label: {
                        show: true,
                        position: "end",
                        offset: [12, -6],
                        formatter: `USL=${usl}`,
                      },
                    },
                  ]
                  : []),
              ...(lsl != null
                  ? [
                    {
                      yAxis: lsl,
                      lineStyle: { color: "#ef4444", type: "dashed", width: 1 },
                      label: {
                        show: true,
                        position: "end",
                        offset: [12, 6],
                        formatter: `LSL=${lsl}`,
                      },
                    },
                  ]
                  : []),
            ],
          },
        },
        {
          name: "MR",
          type: "line",
          symbol: "circle",
          symbolSize: 6,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: mrPoints,
          markLine: {
            symbol: ["none", "none"],
            silent: true,
            label: { show: false },
            data: [
              { yAxis: uclMR, lineStyle: { color: "#ef4444", type: "dashed" }, label: { show: false } },
              {
                yAxis: clMR,
                lineStyle: { color: "#22c55e", type: "solid" },
                label: ladderBlockLabel(uclMR, clMR, lclMR),
              },
              { yAxis: lclMR, lineStyle: { color: "#ef4444", type: "dashed" }, label: { show: false } },
            ],
          },
        },
      ],
    };

    // ✅ include spec limits so y-axis always covers them
    const yTop = ensureYAxis(
        niceBounds(
            [...valsNums, uclX, clX, lclX, usl, lsl].filter((v) => Number.isFinite(v)),
            0.15
        )
    );
    const yBot = ensureYAxis(niceBounds([...mrsCalc, uclMR, clMR, lclMR], 0.15));

    return addZoom(addRightSpacer(applyDynamicY(opt, yTop, yBot), 2, 3), 2);
  }


  // ===== Levey-Jennings =====
  if (type === "levey") {
    const vals = dataInd.map((d) => d.value);
    const n = vals.length;

    const mean = vals.reduce((a, b) => a + b, 0) / (n || 1);
    const stdDev = n > 1 ? Math.sqrt(vals.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (n - 1)) : 0;

    const ljPoints = dataInd.map((d) => {
      const v = d.value;
      if (v == null || Number.isNaN(v)) return v;

      const z = stdDev === 0 ? 0 : (v - mean) / stdDev;
      if (Math.abs(z) >= 3) return { value: v, itemStyle: { color: "#ef4444" } };
      if (Math.abs(z) >= 2) return { value: v, itemStyle: { color: "#f59e0b" } };
      return { value: v };
    });

    const opt = {
      title: { text: "Levey-Jennings", left: "center", textStyle: titleStyle },
      tooltip: commonTooltip,
      grid: gridSingle,
      xAxis: { data: labelsInd, boundaryGap: false },
      yAxis: {},
      series: [
        {
          type: "line",
          data: ljPoints,
          symbol: "circle",
          symbolSize: 6,
          markLine: {
            symbol: ["none", "none"],
            silent: true,
            labelLayout: { hideOverlap: false },
            label: {
              show: true,
              position: "end",
              align: "left",
              verticalAlign: "middle",
              fontSize: 11,
              color: "#000000",
              backgroundColor: "rgba(255,255,255,0.85)",
              padding: [2, 6],
              borderRadius: 3,
            },
            data: [
              { yAxis: mean + 3 * stdDev, lineStyle: { color: "#ef4444", type: "dashed" }, label: { offset: [12, -48], formatter: `+3s=${(mean + 3 * stdDev).toFixed(2)}` } },
              { yAxis: mean + 2 * stdDev, lineStyle: { color: "#f59e0b", type: "dashed" }, label: { offset: [12, -32], formatter: `+2s=${(mean + 2 * stdDev).toFixed(2)}` } },
              { yAxis: mean + 1 * stdDev, lineStyle: { color: "#22c55e", type: "dashed" }, label: { offset: [12, -16], formatter: `+1s=${(mean + 1 * stdDev).toFixed(2)}` } },
              { yAxis: mean, lineStyle: { color: "#22c55e", width: 2, type: "solid" }, label: { offset: [12, 0], formatter: `Mean=${mean.toFixed(2)}` } },
              { yAxis: mean - 1 * stdDev, lineStyle: { color: "#22c55e", type: "dashed" }, label: { offset: [12, 16], formatter: `-1s=${(mean - 1 * stdDev).toFixed(2)}` } },
              { yAxis: mean - 2 * stdDev, lineStyle: { color: "#f59e0b", type: "dashed" }, label: { offset: [12, 32], formatter: `-2s=${(mean - 2 * stdDev).toFixed(2)}` } },
              { yAxis: mean - 3 * stdDev, lineStyle: { color: "#ef4444", type: "dashed" }, label: { offset: [12, 48], formatter: `-3s=${(mean - 3 * stdDev).toFixed(2)}` } },
            ],
          },
        },
      ],
    };

    const y = ensureYAxis(niceBounds([...vals, mean + 4 * stdDev, mean - 4 * stdDev], 0.06));
    return addZoom(addRightSpacer(applyDynamicY(opt, y), 1, 2), 1);
  }

  // ===== EWMA (always show marker lines + y axis, even if no points) =====
// ===== EWMA =====
  if (type === "ewma") {
    const labels = labelsInd.length ? labelsInd : [0]; // keep an x-axis so chart frame renders

    const ewmaVals = dataInd.map(d => d.ewma);
    const uclArr   = dataInd.map(d => d.ucl);
    const lclArr   = dataInd.map(d => d.lcl);
    const clArr    = dataInd.map(d => d.cl);

    const last = uclArr.length - 1;

    // ✅ if no data => all marker lines at 0
    const uLast = last >= 0 ? uclArr[last] : 0;
    const cLast = last >= 0 ? clArr[last]  : 0;
    const lLast = last >= 0 ? lclArr[last] : 0;

    const opt = {
      title: { text: "EWMA", left: "center", textStyle: titleStyle },
      tooltip: commonTooltip,
      grid: gridSingle,
      xAxis: { data: labels },
      yAxis: {},
      series: [
        {
          name: "EWMA",
          type: "line",
          data: labelsInd.length ? ewmaVals : [null], // keep series present but empty
          symbol: "circle",
          symbolSize: 6,
          markLine: {
            symbol: ["none", "none"],
            silent: true,
            label: { show: false },
            data: [
              { yAxis: uLast, lineStyle: { color: "#ef4444", type: "dashed" }, label: { show: false } },
              { yAxis: cLast, lineStyle: { color: "#22c55e", type: "solid" },  label: ladderBlockLabel(uLast, cLast, lLast) },
              { yAxis: lLast, lineStyle: { color: "#ef4444", type: "dashed" }, label: { show: false } },
            ],
          },
        },
        { name: "UCL", type: "line", data: labelsInd.length ? uclArr : [uLast], symbol: "none", lineStyle: { type: "dashed", width: 1, color: "#ef4444" } },
        { name: "CL",  type: "line", data: labelsInd.length ? clArr  : [cLast], symbol: "none", lineStyle: { type: "solid",  width: 1, color: "#22c55e" } },
        { name: "LCL", type: "line", data: labelsInd.length ? lclArr : [lLast], symbol: "none", lineStyle: { type: "dashed", width: 1, color: "#ef4444" } },
      ],
    };

    // ✅ always have a y-axis range (even if empty -> {0..1})
    const y = ensureYAxis(niceBounds([...ewmaVals, ...uclArr, ...lclArr, uLast, cLast, lLast], 0.15));
    return addZoom(addRightSpacer(applyDynamicY(opt, y), 1, 3), 1);
  }


  // ===== MA (always show marker lines + y axis, even if no points) =====
// ===== MA =====
  if (type === "ma") {
    const labels = labelsInd.length ? labelsInd : [0]; // keep x-axis

    const window = 10;
    const raw = dataInd.map(d => d.value);

    const maVals = raw.map((_, i) => {
      const start = Math.max(0, i - window + 1);
      const sub = raw.slice(start, i + 1);
      return sub.reduce((a, b) => a + b, 0) / sub.length;
    });

    const n = raw.length;
    const clVal = n ? raw.reduce((a, b) => a + b, 0) / n : 0; // ✅ if no data -> 0
    const sigma =
        n > 1 ? Math.sqrt(raw.reduce((acc, x) => acc + Math.pow(x - clVal, 2), 0) / (n - 1)) : 0;

    const ucl = [];
    const lcl = [];
    const clArr = [];

    for (let i = 0; i < labelsInd.length; i++) {
      const wEff = Math.min(window, i + 1);
      const halfWidth = 3 * (sigma / Math.sqrt(wEff || 1));
      clArr.push(clVal);
      ucl.push(clVal + halfWidth);
      lcl.push(clVal - halfWidth);
    }

    const last = labelsInd.length - 1;

    // ✅ if no data => marker lines at 0
    const uLast = last >= 0 ? ucl[last]   : 0;
    const cLast = last >= 0 ? clArr[last] : 0;
    const lLast = last >= 0 ? lcl[last]   : 0;

    const opt = {
      title: { text: "MA", left: "center", textStyle: titleStyle },
      tooltip: commonTooltip,
      grid: gridSingle,
      xAxis: { data: labels },
      yAxis: {},
      series: [
        {
          name: "MA",
          type: "line",
          data: labelsInd.length ? maVals : [null],
          symbol: "circle",
          symbolSize: 6,
          markLine: {
            symbol: ["none", "none"],
            silent: true,
            label: { show: false },
            data: [
              { yAxis: uLast, lineStyle: { color: "#ef4444", type: "dashed" }, label: { show: false } },
              { yAxis: cLast, lineStyle: { color: "#22c55e", type: "solid" },  label: ladderBlockLabel(uLast, cLast, lLast) },
              { yAxis: lLast, lineStyle: { color: "#ef4444", type: "dashed" }, label: { show: false } },
            ],
          },
        },
        { name: "UCL", type: "line", data: labelsInd.length ? ucl   : [uLast], symbol: "none", tooltip: { show: false }, lineStyle: { type: "dashed", width: 1, color: "#ef4444" } },
        { name: "CL",  type: "line", data: labelsInd.length ? clArr : [cLast], symbol: "none", tooltip: { show: false }, lineStyle: { type: "solid",  width: 1, color: "#22c55e" } },
        { name: "LCL", type: "line", data: labelsInd.length ? lcl   : [lLast], symbol: "none", tooltip: { show: false }, lineStyle: { type: "dashed", width: 1, color: "#ef4444" } },
      ],
    };

    const y = ensureYAxis(niceBounds([...raw, ...maVals, ...ucl, ...lcl, ...clArr, uLast, cLast, lLast], 0.09));
    return addZoom(addRightSpacer(applyDynamicY(opt, y), 1, 2), 1);
  }


  // ===== CuSum =====
  if (type === "cusum") {
    const cpNums = dataInd.map((d) => d.cp);
    const cmNums = dataInd.map((d) => d.cm);

    const lastSigma = dataInd.length ? dataInd[dataInd.length - 1].sigmaEst ?? 0 : 0;
    const h = 5.0 * lastSigma;

    const opt = {
      title: { text: "CuSum", left: "center", textStyle: titleStyle },
      tooltip: commonTooltip,
      legend: { data: ["C+", "C-"], top: "30px" },
      grid: gridSingle,
      xAxis: { data: labelsInd },
      yAxis: {},
      series: [
        { name: "C+", type: "line", data: cpNums, symbol: "circle", symbolSize: 5 },
        { name: "C-", type: "line", data: cmNums, symbol: "circle", symbolSize: 5 },
        {
          name: "h",
          type: "line",
          data: [],
          showSymbol: false,
          tooltip: { show: false },
          markLine: {
            symbol: ["none", "none"],
            silent: true,
            label: {
              show: true,
              position: "end",
              offset: [12, 0],
              align: "left",
              verticalAlign: "middle",
              backgroundColor: "rgba(255,255,255,0.85)",
              padding: [2, 6],
              borderRadius: 3,
              fontSize: 11,
              color: "#000000",
              formatter: () => `h=${h.toFixed(2)}`,
            },
            data: [{ yAxis: h }],
          },
        },
      ],
    };

    const y = ensureYAxis(niceBounds([...cpNums, ...cmNums, h, 0], 0.08));
    return addZoom(addRightSpacer(applyDynamicY(opt, y), 1, 2), 1);
  }

  return {};
}
</script>


<style lang="scss" scoped>
/* --- Main Layout --- */
.spc-dashboard-pro {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8fafc;
}

/* --- Header Section --- */
.dashboard-header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  z-index: 10;

  .header-left .logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
    h1 {
      font-size: 20px;
    }
  }

  .header-right {
    display: flex;
    align-items: flex-end;
    gap: 20px;
  }
}

.field-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-label {
  font-size: 11px;
}
.header-control {
  width: 170px !important;
}
:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__wrapper) {
  width: 100% !important;
}

/* --- Container & Content --- */
.main-container {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.content-area {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* --- Shared Card Style --- */
.chart-card-container,
.data-log-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #f1f5f9;
}

/* --- Chart Section --- */
.chart-card-container {
  flex: none;
  display: flex;
  flex-direction: column;

  .chart-title-bar {
    margin-bottom: 15px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;

    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;

      h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }
    }

    .chart-desc {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
  }

  .main-chart-canvas {
    width: 100%;
    min-height: 520px;
  }
}

/* --- Transposed Data Log (Horizontal Scroll) --- */
.data-log-container {
  h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }
}

.horizontal-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;

  &::-webkit-scrollbar {
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #f8fafc;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
    border: 3px solid #f8fafc;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}

.data-grid-transposed {
  display: flex;
  flex-direction: column;
  min-width: max-content;

  .log-row {
    display: flex;
    border-bottom: 1px solid #f1f5f9;
    &:last-child {
      border-bottom: none;
    }

    .row-label {
      width: 100px;
      min-width: 100px;
      background: #f8fafc;
      padding: 10px 14px;
      font-weight: 600;
      font-size: 11px;
      color: #64748b;
      position: sticky;
      left: 0;
      z-index: 2;
      border-right: 2px solid #e2e8f0;
    }

    .row-cell {
      width: 90px;
      min-width: 90px;
      padding: 10px;
      text-align: center;
      font-size: 13px;
      color: #1e293b;
      border-right: 1px solid #f1f5f9;
    }
  }
}
</style>
