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

        <!-- EMPTY STATE: no metrics -->
        <div
            v-if="!spcDebugLoading && !spcDebugError && !hasMetrics"
            class="chart-card-container"
        >
          <el-empty
              :description="noMetricsMessage"
              image-size="160"
          />
        </div>

        <!-- ERROR -->
        <div
            v-else-if="!spcDebugLoading && spcDebugError"
            class="chart-card-container"
        >
          <el-alert :title="spcDebugError" type="error" show-icon />
        </div>

        <!-- LOADING -->
        <div
            v-else-if="spcDebugLoading"
            class="chart-card-container"
        >
          <el-skeleton :rows="6" animated />
        </div>

        <!-- NORMAL: metrics exist -->
        <!-- NORMAL: metrics exist -->
        <template v-else>

          <!-- ✅ NO DATA: selected metric has timeSeriesCount === 0 -->
          <div
              v-if="activeMetric && !hasTimeSeriesData"
              class="chart-card-container"
          >
            <el-empty
                description="No data available. Select a different metric or time range."
                image-size="160"
            />
          </div>

          <!-- ✅ HAS DATA: show chart + data logs -->
          <template v-else>
            <!-- Chart -->
            <div class="chart-card-container">
              <div class="chart-title-bar">
                <div class="title-row" style="display: flex; align-items: center; gap: 12px;">
                  <h2 style="margin: 0; line-height: 1;">
                    {{ dynamicDisplayHeader.title }}
                  </h2>
                  <el-tag
                      :type="allChartOptions.find(o => o.value === activeChart)?.subgroupRequired ? 'warning' : 'primary'"
                      size="small"
                  >
                    {{
                      allChartOptions.find(o => o.value === activeChart)?.subgroupRequired
                          ? 'Subgroup'
                          : 'Individual'
                    }}
                  </el-tag>
                </div>
                <p class="chart-desc">{{ dynamicDisplayHeader.desc }}</p>
              </div>

              <div ref="chartEl" class="main-chart-canvas"></div>
            </div>

            <!-- Data Table (ONLY when hasTimeSeriesData) -->
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
                    <div v-for="item in tableData" :key="'id-' + item.id" class="row-cell">
                      {{ item.id }}
                    </div>
                  </div>

                  <div class="log-row">
                    <div class="row-label">Time</div>
                    <div v-for="item in tableData" :key="'t-' + item.id" class="row-cell">
                      {{ item.timestamp }}
                    </div>
                  </div>

                  <div class="log-row">
                    <div class="row-label">Raw Value</div>
                    <div v-for="item in tableData" :key="'v-' + item.id" class="row-cell highlight">
                      {{ item.value }}
                    </div>
                  </div>

                  <div class="log-row" v-if="activeChart === 'ma'">
                    <div class="row-label">MA</div>
                    <div v-for="item in tableData" :key="'ma-' + item.id" class="row-cell">
                      {{ item.ma }}
                    </div>
                  </div>

                  <div class="log-row" v-if="activeChart === 'ewma'">
                    <div class="row-label">EWMA</div>
                    <div v-for="item in tableData" :key="'e-' + item.id" class="row-cell">
                      {{ item.ewma }}
                    </div>
                  </div>

                  <div class="log-row" v-if="activeChart === 'cusum'">
                    <div class="row-label">C+</div>
                    <div v-for="item in tableData" :key="'cp-' + item.id" class="row-cell">
                      {{ item.cp }}
                    </div>
                  </div>

                  <div class="log-row" v-if="activeChart === 'cusum'">
                    <div class="row-label">C-</div>
                    <div v-for="item in tableData" :key="'cm-' + item.id" class="row-cell">
                      {{ item.cm }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

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

const chartEl = ref(null);

const noMetricsMessage = "No metrics with defined limits were found for this form and date range";

// Convenience: API fields array
const fieldsFromApi = computed(() => spcDebugResponse.value?.data || []);
const hasMetrics = computed(() => Array.isArray(fieldsFromApi.value) && fieldsFromApi.value.length > 0);

// ✅ NEW: find the currently selected metric "field" object from API payload
const activeFieldFromApi = computed(() => {
  if (!activeMetric.value) return null;
  return (fieldsFromApi.value || []).find(f => f.fieldId === activeMetric.value) || null;
});

// ✅ NEW: if backend returns timeSeriesCount, use it to decide "no data"
const hasTimeSeriesData = computed(() => {
  const c = Number(activeFieldFromApi.value?.timeSeriesCount);
  // if timeSeriesCount is missing, fall back to checking timeSeries array length
  if (!Number.isFinite(c)) return (activeFieldFromApi.value?.timeSeries || []).length > 0;
  return c > 0;
});

let loadSeq = 0;

async function debugLoadSpc() {
  const seq = ++loadSeq;

  spcDebugLoading.value = true;
  spcDebugError.value = "";

  try {
    const end = dayjs(selectedEndDate.value, "YYYY-MM-DD").hour(23).minute(59).second(0);
    const start = end.subtract(6, "day").hour(0).minute(1).second(0);

    const res = await fetchSpcSeries({
      formTemplateId: formTemplateId.value,
      startDateTime: start.toDate(),
      endDateTime: end.toDate(),
    });

    if (seq !== loadSeq) return; // ✅ ignore stale response

    const payload = res?.data;
    if (String(payload?.status) !== "200") throw new Error(payload?.message || "SPC request failed");

    spcDebugResponse.value = payload;
    spcDebugError.value = "";

    // only set activeMetric if it’s empty or invalid (don’t fight user selection)
    const first = payload?.data?.[0]?.fieldId || null;
    const stillValid = payload?.data?.some(f => f.fieldId === activeMetric.value);
    if (!stillValid) activeMetric.value = first;

  } catch (err) {
    if (seq !== loadSeq) return;
    spcDebugResponse.value = null;
    spcDebugError.value = err?.message || "SPC request failed";
  } finally {
    if (seq === loadSeq) spcDebugLoading.value = false;
  }

  await nextTick();
  await new Promise(requestAnimationFrame); // ✅ ensures DOM is painted
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
  if (!chartEl.value) return;

  if (!hasMetrics.value || !activeMetric.value || !metricDef.value || !hasTimeSeriesData.value) {
    // don’t dispose aggressively; just clear to avoid flicker
    if (chartInstance) chartInstance.clear();
    return;
  }

  if (!chartInstance || chartInstance.getDom() !== chartEl.value) {
    if (chartInstance) chartInstance.dispose();
    chartInstance = echarts.init(chartEl.value);
  }

  const option = getChartOptions(activeChart.value);
  chartInstance.setOption(option, { notMerge: true });
  chartInstance.resize(); // ✅ important when container just appeared
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

function fmtNum(v, decimals = 2) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(decimals) : "-";
}

/**
 * Build right-side markLine entries with non-overlapping stacked labels.
 *
 * Rules:
 * - If BOTH spec limits exist (usl & lsl): order by numeric value high -> low (descending)
 * - Otherwise: fixed order USL, UCL, CL, LCL, LSL (skip missing)
 */
function buildStackedLimitLines({ usl, ucl, cl, lcl, lsl }, decimals = 2) {
  const items = [
    { key: "USL", y: usl, style: { color: "#ef4444", type: "dashed", width: 1 } },
    { key: "UCL", y: ucl, style: { color: "#ef4444", type: "dashed" } },
    { key: "CL",  y: cl,  style: { color: "#22c55e", type: "solid" } },
    { key: "LCL", y: lcl, style: { color: "#ef4444", type: "dashed" } },
    { key: "LSL", y: lsl, style: { color: "#ef4444", type: "dashed", width: 1 } },
  ].filter(it => it.y != null && Number.isFinite(Number(it.y)));

  // “metrics are given” => interpret as both spec limits exist
  const hasSpec = items.some(i => i.key === "USL") && items.some(i => i.key === "LSL");

  const ordered = hasSpec
      ? [...items].sort((a, b) => Number(b.y) - Number(a.y)) // high -> low
      : items; // already in fixed order

  // Stack vertically centered on the right edge.
  const step = 16;
  const startY = -Math.floor((ordered.length - 1) / 2) * step;

  return ordered.map((it, idx) => ({
    yAxis: Number(it.y),
    lineStyle: it.style,
    label: {
      show: true,
      position: "end",
      align: "left",
      verticalAlign: "middle",
      offset: [18, startY + idx * step], // <-- deterministic stack
      fontSize: 11,
      color: "#000000",
      backgroundColor: "rgba(255,255,255,0.90)",
      padding: [2, 6],
      borderRadius: 3,
      formatter: `${it.key}=${fmtNum(it.y, decimals)}`,
    },
  }));
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
          data: xPoints, // ✅ REQUIRED
          markLine: {
            symbol: ["none", "none"],
            silent: true,
            // important: don't hide overlap; we are stacking on purpose
            labelLayout: { hideOverlap: false },
            data: buildStackedLimitLines(
                {
                  usl,
                  ucl: uclX,
                  cl: clX,
                  lcl: lclX,
                  lsl,
                },
                2
            ),
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


<style scoped>
/* 1. Global Reset: Kill the grey and the "Card" feel */
.spc-dashboard-pro {
  background-color: #ffffff; /* pure white background */
  min-height: 100vh;
  color: #1f2937;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.main-container {
  background-color: #ffffff;
}

.content-area {
  padding: 0 40px 40px 40px; /* Generous breathing room */
  background-color: #ffffff;
}

/* 2. Seamless Header Style */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 24px 0px;
  background: #ffffff;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.header-right {
  display: flex;
  gap: 20px;
}

.field-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

/* 3. Remove Container Boxes */
.chart-card-container,
.data-log-container,
.debug-section-wrapper { /* Ensure you apply this to the debug div */
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin-bottom: 60px; /* Large gap between logical sections */
}

/* 4. Section Dividers (instead of cards) */
.data-log-container,
.debug-section-wrapper {
  border-top: 1px solid #f3f4f6 !important;
  padding-top: 40px !important;
}

/* 5. Typography */
h2, h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #111827;
}

.chart-desc {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* 6. Chart & Table Polish */
.main-chart-canvas {
  width: 100%;
  height: 500px;
  margin-top: 24px;
}

.horizontal-scroll-wrapper {
  overflow-x: auto;
  padding-bottom: 12px;
}

.data-grid-transposed {
  display: flex;
  flex-direction: column;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
}

.log-row {
  display: flex;
  border-bottom: 1px solid #f3f4f6;
}

.log-row:last-child {
  border-bottom: none;
}

.row-label {
  width: 120px;
  min-width: 120px;
  background-color: #f9fafb;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  border-right: 1px solid #f3f4f6;
}

.row-cell {
  padding: 10px 16px;
  min-width: 100px;
  font-size: 13px;
  text-align: center;
  border-right: 1px solid #f3f4f6;
}

.row-cell.highlight {
  font-weight: 600;
  color: #2563eb;
  background-color: #eff6ff;
}

/* Debug Pre-tag styling */
pre {
  border: none !important;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

/* Target the shared class you already have on the elements */
.header-control {
  width: 160px !important;
}

/* Specific fix for el-date-picker internal sizing */
:deep(.el-date-editor.el-input),
:deep(.el-date-editor.el-input__inner) {
  width: 100% !important;
  /* This prevents the date picker from defaulting to its 220px base */
}

/* Ensure labels don't cause misalignment if they vary in length */
.field-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 160px; /* Match the control width */
}

.field-label {
  font-size: 11px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-row {
  display: flex;
  align-items: center; /* Vertical centering */
  gap: 12px;
  margin-bottom: 8px; /* Space between title and description */
}

.title-row h2 {
  margin: 0;
  padding: 0;
  font-size: 1.25rem; /* Adjust to your preference */
  line-height: 1.2;    /* Normalizes height */
  display: flex;
  align-items: center;
}

/* If the tag still looks slightly higher/lower than the text baseline */
.title-row .el-tag {
  transform: translateY(1px); /* Micro-adjustment if needed */
}
</style>
