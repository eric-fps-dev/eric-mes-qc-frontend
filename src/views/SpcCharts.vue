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
        <!-- Metric -->
        <el-select
            v-model="activeMetric"
            size="small"
            class="metric-select"
            placeholder="Select Metric"
            teleported
            placement="bottom-start"
            :popper-options="{ strategy: 'fixed' }"
        >
          <el-option
              v-for="(data, key) in metricsConfig"
              :key="key"
              :label="data.label"
              :value="key"
          />
        </el-select>

        <!-- Chart -->
        <el-select
            v-model="activeChart"
            size="small"
            class="chart-select"
            placeholder="Select Chart"
            teleported
            placement="bottom-start"
            :popper-options="{ strategy: 'fixed' }"
        >
          <el-option
              v-for="opt in availableChartOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
          >
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
              <span>{{ opt.label }}</span>
            </div>
          </el-option>
        </el-select>
      </div>

    </div>

    <el-container class="main-container">
      <el-main class="content-area">
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
          <div class="horizontal-scroll-wrapper">
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

              <div class="log-row" v-if="activeChart === 'ma' || activeChart === 'mamr' || activeChart === 'mams'">
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

<!--        &lt;!&ndash; Stats &ndash;&gt;-->
<!--        <div class="stats-section" v-if="currentStats">-->
<!--          <div class="stats-header">-->
<!--            <h3>Process Stats</h3>-->
<!--          </div>-->

<!--          <div class="stats-grid">-->
<!--            <div class="stat-item">-->
<!--              <span class="label">Mean:</span>-->
<!--              <span class="value">{{ currentStats.mean }}</span>-->
<!--            </div>-->

<!--            <div class="stat-item">-->
<!--              <span class="label">Sigma:</span>-->
<!--              <span class="value">{{ currentStats.sigma }}</span>-->
<!--            </div>-->

<!--            <div class="stat-item" v-if="currentStats.cp">-->
<!--              <span class="label">Cp:</span>-->
<!--              <span :class="['value', getCapColor(currentStats.cp)]">{{ currentStats.cp }}</span>-->
<!--            </div>-->

<!--            <div class="stat-item" v-if="currentStats.cpk">-->
<!--              <span class="label">Cpk:</span>-->
<!--              <span :class="['value', getCapColor(currentStats.cpk)]">{{ currentStats.cpk }}</span>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->

      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

// =========================
// 1) UI State
// =========================
const activeMetric = ref('fryLength');
const activeChart = ref('imr');
let chartInstance = null;

// =========================
// 2) Chart Catalog
// =========================
const allChartOptions = [
  { value: 'imr', label: 'I-MR', subgroupRequired: false, minN: 1 },
  { value: 'levey', label: 'Levey-Jennings', subgroupRequired: false, minN: 1 },
  { value: 'ewma', label: 'EWMA', subgroupRequired: false, minN: 1 },
  { value: 'ma', label: 'MA', subgroupRequired: false, minN: 1 },
  { value: 'cusum', label: 'CuSum', subgroupRequired: false, minN: 1 },

  // { value: 'xbar-r', label: 'X-Bar R', subgroupRequired: true, minN: 2 },
  // { value: 'xbar-s', label: 'X-Bar Sigma', subgroupRequired: true, minN: 2 },
  // { value: 'median-r', label: 'Median and Range', subgroupRequired: true, minN: 3 },
  // { value: 'mamr', label: 'MAMR', subgroupRequired: true, minN: 2 },
  // { value: 'mams', label: 'MAMS', subgroupRequired: true, minN: 2 }
];

// =========================
// 3) Metrics Config
// =========================
const metricsConfig = {
  fryLength: {
    label: 'Fry Length',
    desc: 'Monitoring average length and consistency of French fries.',
    allowedCharts: ['xbar-r', 'xbar-s', 'median-r', 'imr', 'levey', 'ewma', 'ma', 'cusum'],
    target: 80.0,
    usl: 86.0,
    lsl: 74.0,
    subgroupN: 5,

    indRaw: [
      { timestamp: '08:00:00', value: 80.00 },
      { timestamp: '09:00:00', value: 80.05 },
      { timestamp: '10:00:00', value: 79.95 },
      { timestamp: '11:00:00', value: 80.10 },
      { timestamp: '12:00:00', value: 80.00 },
      { timestamp: '13:00:00', value: 80.08 },
      { timestamp: '14:00:00', value: 79.98 },
      { timestamp: '15:00:00', value: 80.04 },
      { timestamp: '16:00:00', value: 80.02 },
      { timestamp: '17:00:00', value: 81.40 },
      { timestamp: '18:00:00', value: 81.65 },
      { timestamp: '19:00:00', value: 81.55 }
    ],

    varRaw: [
      { timestamp: '08:00:00', values: [79.2, 80.1, 79.9, 80.4, 79.7] },
      { timestamp: '10:00:00', values: [80.0, 80.6, 79.8, 80.9, 80.2] },
      { timestamp: '12:00:00', values: [79.5, 79.8, 80.1, 79.9, 80.0] },
      { timestamp: '14:00:00', values: [80.7, 81.1, 80.9, 80.6, 81.0] },
      { timestamp: '16:00:00', values: [79.9, 80.2, 80.1, 80.4, 80.0] }
    ]
  },

  oilTemp: {
    label: 'Oil Temperature',
    desc: 'Tracking stability of fryer oil temperature.',
    allowedCharts: ['xbar-r', 'median-r', 'imr', 'ewma', 'ma', 'cusum', 'levey'],
    target: 175.0,
    usl: 180.0,
    lsl: 170.0,
    subgroupN: 3,
    indRaw: [
      { timestamp: '08:00:00', value: 174.6 },
      { timestamp: '09:00:00', value: 175.2 },
      { timestamp: '10:00:00', value: 176.0 },
      { timestamp: '11:00:00', value: 175.5 },
      { timestamp: '12:00:00', value: 175.1 },
      { timestamp: '13:00:00', value: 174.8 },
      { timestamp: '14:00:00', value: 175.7 },
      { timestamp: '15:00:00', value: 176.3 }
    ],
    varRaw: [
      { timestamp: '08:00:00', values: [174.6, 175.1, 175.0] },
      { timestamp: '10:00:00', values: [175.8, 176.0, 175.6] },
      { timestamp: '12:00:00', values: [174.9, 175.1, 175.3] },
      { timestamp: '14:00:00', values: [175.6, 175.9, 176.1] }
    ]
  },

  bagWeight: {
    label: 'Bag Weight',
    desc: 'Ensuring bag weights meet labeling requirements.',
    allowedCharts: ['xbar-s', 'imr', 'ewma', 'ma', 'cusum', 'levey'],
    target: 500.0,
    usl: 510.0,
    lsl: 490.0,
    subgroupN: 10,
    indRaw: [
      { timestamp: '08:00:00', value: 498.9 },
      { timestamp: '09:00:00', value: 501.2 },
      { timestamp: '10:00:00', value: 499.6 },
      { timestamp: '11:00:00', value: 503.1 },
      { timestamp: '12:00:00', value: 500.8 },
      { timestamp: '13:00:00', value: 499.9 },
      { timestamp: '14:00:00', value: 502.0 }
    ],
    varRaw: [
      { timestamp: '08:00:00', values: [498,501,502,497,500,499,503,498,501,500] },
      { timestamp: '10:00:00', values: [499,500,503,498,501,502,497,499,500,501] },
      { timestamp: '12:00:00', values: [501,502,500,499,503,501,498,500,499,502] }
    ]
  }
};

// =========================
// 4) Derived runtime config
// =========================
const metricDef = computed(() => metricsConfig[activeMetric.value]);

const dynamicDisplayHeader = computed(() => {
  const m = metricDef.value;
  const c = allChartOptions.find(opt => opt.value === activeChart.value);
  return { title: `${m.label} - ${c?.label || ''}`, desc: m.desc };
});

const availableChartOptions = computed(() => {
  const allowed = metricDef.value.allowedCharts;
  return allChartOptions.filter(opt => allowed.includes(opt.value));
});

// =========================
// 5) Hardcoded RAW -> computed stores
// =========================
const varData = computed(() => buildVarDataFromRaw(metricDef.value.varRaw));
const indData = computed(() => buildIndDataFromRaw(metricDef.value.indRaw, metricDef.value));

watch(activeMetric, (newVal) => {
  const allowed = metricsConfig[newVal].allowedCharts;
  if (!allowed.includes(activeChart.value)) activeChart.value = allowed[0];
  nextTick(renderChart);
});
watch(activeChart, () => nextTick(renderChart));

// =========================
// 6) Data Log Table
// =========================
const tableData = computed(() => {
  const isInd = ['imr', 'levey', 'cusum', 'ewma', 'ma'].includes(activeChart.value);
  const source = isInd ? indData.value : varData.value;
  const windowSize = 10;

  const lastPoints = [...source].slice(-50).map((d, idx) => ({ ...d, id: idx + 1 }));

  return lastPoints.map((d, index, array) => {
    const displayValue = d.value != null ? d.value : d.mean;

    const start = Math.max(0, index - windowSize + 1);
    const subset = array.slice(start, index + 1);
    const sum = subset.reduce((acc, curr) => acc + (curr.value != null ? curr.value : curr.mean), 0);
    const ma = sum / subset.length;

    return {
      id: d.id,
      timestamp: d.timestamp,
      value: Number(displayValue).toFixed(2),
      ewma: d.ewma != null ? Number(d.ewma).toFixed(2) : '-',
      ma: Number.isFinite(ma) ? ma.toFixed(2) : '-',
      cp: d.cp != null ? Number(d.cp).toFixed(2) : '-',
      cm: d.cm != null ? Number(d.cm).toFixed(2) : '-',
      statusLabel: d.statusLabel || 'OK',
      statusType: d.statusType || 'success'
    };
  });
});

// =========================
// 7) Lifecycle
// =========================
onMounted(() => {
  nextTick(renderChart);
  window.addEventListener('resize', resizeChart);
});
onUnmounted(() => window.removeEventListener('resize', resizeChart));
function resizeChart() { if (chartInstance) chartInstance.resize(); }

// =========================
// 8) Build helpers
// =========================
function buildVarDataFromRaw(varRaw = []) {
  return (varRaw || []).map((row, idx) => {
    const vals = Array.isArray(row.values) ? row.values.map(Number) : [];
    const n = vals.length || 1;

    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const min = vals.length ? Math.min(...vals) : mean;
    const max = vals.length ? Math.max(...vals) : mean;
    const range = vals.length ? (max - min) : 0;

    let sigma = 0;
    if (vals.length > 1) {
      const ss = vals.reduce((a, x) => a + Math.pow(x - mean, 2), 0);
      sigma = Math.sqrt(ss / (vals.length - 1));
    }

    const sorted = [...vals].sort((a, b) => a - b);
    const median = sorted.length
        ? (sorted.length % 2 === 1
            ? sorted[(sorted.length - 1) / 2]
            : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
        : mean;

    return {
      id: idx + 1,
      timestamp: row.timestamp || dayjs().subtract((varRaw.length - 1 - idx), 'hour').format('HH:mm:ss'),
      values: vals,
      mean,
      range,
      sigma,
      median
    };
  });
}

function buildIndDataFromRaw(indRaw = [], m) {
  const target = Number(m?.target ?? 0);

  const pts = (indRaw || []).map((row, idx) => ({
    id: idx + 1,
    timestamp: row.timestamp || dayjs().subtract((indRaw.length - 1 - idx), 'hour').format('HH:mm:ss'),
    value: Number(row.value)
  }));

  for (let i = 0; i < pts.length; i++) {
    pts[i].mr = (i === 0) ? null : Math.abs(pts[i].value - pts[i - 1].value);
  }

  const mrs = pts.map(p => p.mr).filter(v => v != null);
  const mrBar = mrs.length ? (mrs.reduce((a, b) => a + b, 0) / mrs.length) : 0;
  const sigmaEst = mrBar / 1.128;

  const lambda = 0.2;
  const L = 3;

  for (let i = 0; i < pts.length; i++) {
    const prev = (i === 0) ? target : (pts[i - 1].ewma ?? target);
    pts[i].ewma = (lambda * pts[i].value) + ((1 - lambda) * prev);

    const t = i + 1;
    const sigmaZt = sigmaEst * Math.sqrt((lambda / (2 - lambda)) * (1 - Math.pow(1 - lambda, 2 * t)));
    pts[i].ucl = target + (L * sigmaZt);
    pts[i].lcl = target - (L * sigmaZt);
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

  for (let i = 0; i < pts.length; i++) {
    const hist = pts.slice(0, i);
    const status = getWecoStatus(pts[i].ewma, pts[i].ucl, pts[i].lcl, target, hist);
    pts[i].statusLabel = status.label;
    pts[i].statusType = status.type;
  }

  return pts;
}

// =========================
// 8.4) Point coloring helpers (NEW)
// =========================
const COLOR_BAD = '#ef4444';

function isOutOfControlPoint(d) {
  return d?.statusType === 'danger' || d?.statusLabel === 'Out of Limit';
}

function asPoint(v, isBad) {
  if (v == null || Number.isNaN(v)) return v;
  return isBad
      ? { value: v, itemStyle: { color: COLOR_BAD }, emphasis: { itemStyle: { color: COLOR_BAD } } }
      : { value: v };
}

function seriesPointsFromInd(dataInd, pickValueFn) {
  return dataInd.map(d => asPoint(pickValueFn(d), isOutOfControlPoint(d)));
}

function toNum(v) {
  // handles ECharts data objects {value, itemStyle...}
  if (v && typeof v === 'object' && 'value' in v) return Number(v.value);
  return Number(v);
}

// =========================
// 8.5) Dynamic Y helpers (UPDATED to support point objects)
// =========================
function niceBounds(values = [], padRatio = 0.15, desiredTicks = 6) {
  const nums = values.map(toNum).filter(v => Number.isFinite(v));
  if (!nums.length) return { min: null, max: null, interval: null };

  let min = Math.min(...nums);
  let max = Math.max(...nums);

  if (min === max) {
    const bump = Math.abs(min) * 0.05 + 1;
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
  const steps = [1, 2, 2.5, 5, 10].map(m => m * pow10);
  const interval = steps.reduce((best, c) => (Math.abs(c - rough) < Math.abs(best - rough) ? c : best), steps[0]);

  const minNice = Math.floor(min / interval) * interval;
  const maxNice = Math.ceil(max / interval) * interval;

  return { min: minNice, max: maxNice, interval };
}

function applyDynamicY(option, y0, y1) {
  if (Array.isArray(option.yAxis)) {
    if (y0?.min != null) option.yAxis[0] = { ...option.yAxis[0], ...y0 };
    if (option.yAxis[1] && y1?.min != null) option.yAxis[1] = { ...option.yAxis[1], ...y1 };
  } else {
    if (y0?.min != null) option.yAxis = { ...option.yAxis, ...y0 };
  }
  return option;
}

// =========================
// 9) Rendering Logic
// =========================
function renderChart() {
  const dom = document.getElementById('mainChart');
  if (!dom) return;

  if (!chartInstance) chartInstance = echarts.init(dom);

  const options = getChartOptions(activeChart.value);
  chartInstance.setOption(options, { notMerge: true });
}

// =========================
// 10) Chart Options (RED dots when Out of Limit)
// =========================
function getChartOptions(type) {
  const titleStyle = { fontSize: 15 };

  const commonTooltip = {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
    formatter: (params) => {
      let res = `${params[0].name}<br/>`;
      params.forEach(p => {
        const rawV = (p.data && typeof p.data === 'object' && 'value' in p.data) ? p.data.value : p.value;
        const val = (rawV == null || isNaN(rawV)) ? '-' : Number(rawV).toFixed(2);
        res += `${p.marker} ${p.seriesName}: <b>${val}</b><br/>`;
      });
      return res;
    }
  };

  const gridDual = [{ top: '10%', height: '35%' }, { top: '55%', height: '35%' }];

  const A2 = 0.577; const D3 = 0; const D4 = 2.114;
  const A3 = 1.427; const B3 = 0; const B4 = 2.089;

  const dataVar = varData.value.slice(-30);
  const dataInd = indData.value.slice(-30);
  const labelsVar = dataVar.map(d => d.id);

  if (type === 'xbar-r') {
    const xbars = dataVar.map(d => d.mean);
    const ranges = dataVar.map(d => d.range);
    const xbb = xbars.reduce((a, b) => a + b, 0) / (xbars.length || 1);
    const rb = ranges.reduce((a, b) => a + b, 0) / (ranges.length || 1);

    const uclX = xbb + A2 * rb;
    const clX = xbb;
    const lclX = xbb - A2 * rb;

    const uclR = D4 * rb;
    const clR = rb;
    const lclR = D3 * rb;

    const opt = {
      title: [
        { text: 'Avg', left: 'center', textStyle: titleStyle },
        { text: 'Range', top: '50%', left: 'center', textStyle: titleStyle }
      ],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{ data: labelsVar }, { data: labelsVar, gridIndex: 1 }],
      yAxis: [{}, { gridIndex: 1 }],
      series: [
        { name: 'Mean', type: 'line', data: xbars, markLine: statsLine(uclX, clX, lclX, 'Mean') },
        { name: 'Range', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: ranges, markLine: statsLine(uclR, clR, lclR, 'Range') }
      ]
    };

    const yTop = niceBounds([...xbars, uclX, clX, lclX], 0.15);
    const yBot = niceBounds([...ranges, uclR, clR, lclR, 0], 0.15);

    return applyDynamicY(opt, yTop, yBot);
  }

  if (type === 'xbar-s') {
    const xbars = dataVar.map(d => d.mean);
    const sigmas = dataVar.map(d => d.sigma);
    const xbb = xbars.reduce((a, b) => a + b, 0) / (xbars.length || 1);
    const sb = sigmas.reduce((a, b) => a + b, 0) / (sigmas.length || 1);

    const uclX = xbb + A3 * sb;
    const clX = xbb;
    const lclX = xbb - A3 * sb;

    const uclS = B4 * sb;
    const clS = sb;
    const lclS = B3 * sb;

    const opt = {
      title: [
        { text: 'Avg', left: 'center', textStyle: titleStyle },
        { text: 'Sigma', top: '50%', left: 'center', textStyle: titleStyle }
      ],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{ data: labelsVar }, { data: labelsVar, gridIndex: 1 }],
      yAxis: [{}, { gridIndex: 1 }],
      series: [
        { name: 'Mean', type: 'line', data: xbars, markLine: statsLine(uclX, clX, lclX, 'Mean') },
        { name: 'Sigma', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: sigmas, markLine: statsLine(uclS, clS, lclS, 'Sigma') }
      ]
    };

    const yTop = niceBounds([...xbars, uclX, clX, lclX], 0.15);
    const yBot = niceBounds([...sigmas, uclS, clS, lclS, 0], 0.15);

    return applyDynamicY(opt, yTop, yBot);
  }

  if (type === 'median-r') {
    const medians = dataVar.map(d => d.median);
    const ranges = dataVar.map(d => d.range);
    const A2Tilde = 0.691;

    const mb = medians.reduce((a, b) => a + b, 0) / (medians.length || 1);
    const rb = ranges.reduce((a, b) => a + b, 0) / (ranges.length || 1);

    const uclM = mb + A2Tilde * rb;
    const clM = mb;
    const lclM = mb - A2Tilde * rb;

    const uclR = D4 * rb;
    const clR = rb;
    const lclR = D3 * rb;

    const opt = {
      title: [
        { text: 'Median', left: 'center', textStyle: titleStyle },
        { text: 'Range', top: '50%', left: 'center', textStyle: titleStyle }
      ],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{ data: labelsVar }, { data: labelsVar, gridIndex: 1 }],
      yAxis: [{}, { gridIndex: 1 }],
      series: [
        { name: 'Median', type: 'line', data: medians, markLine: statsLine(uclM, clM, lclM, 'Median') },
        { name: 'Range', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: ranges, markLine: statsLine(uclR, clR, lclR, 'Range') }
      ]
    };

    const yTop = niceBounds([...medians, uclM, clM, lclM], 0.15);
    const yBot = niceBounds([...ranges, uclR, clR, lclR, 0], 0.15);

    return applyDynamicY(opt, yTop, yBot);
  }

  // ===== I-MR (RED DOTS for Out of Limit) =====
  if (type === 'imr') {
    const labelsInd = dataInd.map(d => d.id);

    const valsNums = dataInd.map(d => d.value);
    const mrsPlotNums = dataInd.map(d => d.mr);
    const mrsCalc = mrsPlotNums.filter(v => v != null);

    const xBar = valsNums.reduce((a, b) => a + b, 0) / (valsNums.length || 1);
    const mrBar = mrsCalc.length ? (mrsCalc.reduce((a, b) => a + b, 0) / mrsCalc.length) : 0;

    const E2 = 2.66;
    const uclX = xBar + E2 * mrBar;
    const clX = xBar;
    const lclX = xBar - E2 * mrBar;

    const uclMR = 3.267 * mrBar;
    const clMR = mrBar;
    const lclMR = 0;

    const xPoints = dataInd.map(d => asPoint(d.value, d.value > uclX || d.value < lclX));
    const mrPoints = dataInd.map(d => asPoint(d.mr, d.mr != null && d.mr > uclMR));

    const opt = {
      title: [
        { text: 'Individual (I)', left: 'center', textStyle: titleStyle },
        { text: 'Moving Range (MR)', top: '50%', left: 'center', textStyle: titleStyle }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params) =>
            params.map(p => {
              const rawV = (p.data && typeof p.data === 'object' && 'value' in p.data) ? p.data.value : p.value;
              const v = (rawV == null || Number.isNaN(rawV)) ? '' : Number(rawV).toFixed(2);
              return `${p.marker} ${p.seriesName}: ${v}`;
            }).join('<br/>')
      },
      grid: gridDual,
      xAxis: [{ data: labelsInd }, { data: labelsInd, gridIndex: 1 }],
      yAxis: [{}, { gridIndex: 1, name: 'Moving Range', nameLocation: 'middle', nameGap: 45 }],
      series: [
        { name: 'X',  type: 'line', symbol: 'circle', symbolSize: 6, data: xPoints,  markLine: statsLineLabel(uclX, clX, lclX, 'X') },
        { name: 'MR', type: 'line', symbol: 'circle', symbolSize: 6, xAxisIndex: 1, yAxisIndex: 1, data: mrPoints, markLine: statsLineLabel(uclMR, clMR, lclMR, 'MR') }
      ]
    };

    const yTop = niceBounds([...valsNums, uclX, clX, lclX], 0.15);
    const yBot = niceBounds([...mrsCalc, uclMR, clMR, lclMR], 0.15);

    return applyDynamicY(opt, yTop, yBot);
  }

  // ===== Levey (RED DOTS for Out of Limit) =====
  if (type === 'levey') {
    const vals = dataInd.map(d => d.value);
    const n = vals.length;

    const mean = vals.reduce((a, b) => a + b, 0) / (n || 1);
    const stdDev = n > 1
        ? Math.sqrt(vals.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (n - 1))
        : 0;

    const ljPoints = dataInd.map(d => {
      const v = d.value;
      if (v == null || Number.isNaN(v)) return v;

      const z = stdDev === 0 ? 0 : (v - mean) / stdDev;

      if (Math.abs(z) >= 3) {
        return { value: v, itemStyle: { color: '#ef4444' }, emphasis: { itemStyle: { color: '#ef4444' } } };
      }
      if (Math.abs(z) >= 2) {
        return { value: v, itemStyle: { color: '#f59e0b' }, emphasis: { itemStyle: { color: '#f59e0b' } } };
      }
      return { value: v };
    });


    const opt = {
      title: { text: 'Levey-Jennings', left: 'center', textStyle: titleStyle },
      tooltip: commonTooltip,
      xAxis: { data: dataInd.map(d => d.id), boundaryGap: false },
      yAxis: { splitLine: { show: false } },
      series: [{
        type: 'line',
        data: ljPoints,
        symbol: 'circle',
        symbolSize: 6,
        markLine: {
          symbol: ['none', 'none'],
          label: { position: 'end', fontSize: 10, fontWeight: 'bold' },
          data: [
            { yAxis: mean, lineStyle: { color: '#22c55e', width: 2, type: 'solid' }, label: { formatter: 'Mean' } },
            { yAxis: mean + stdDev, lineStyle: { color: '#22c55e', type: 'dashed' }, label: { formatter: '+1s' } },
            { yAxis: mean - stdDev, lineStyle: { color: '#22c55e', type: 'dashed' }, label: { formatter: '-1s' } },
            { yAxis: mean + 2 * stdDev, lineStyle: { color: '#f59e0b', type: 'dashed' }, label: { formatter: '+2s' } },
            { yAxis: mean - 2 * stdDev, lineStyle: { color: '#f59e0b', type: 'dashed' }, label: { formatter: '-2s' } },
            { yAxis: mean + 3 * stdDev, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: '+3s' } },
            { yAxis: mean - 3 * stdDev, lineStyle: { color: '#ef4444', type: 'dashed' }, label: { formatter: '-3s' } }
          ]
        }
      }]
    };

    const y = niceBounds([...vals, mean + 4 * stdDev, mean - 4 * stdDev], 0.08);
    return applyDynamicY(opt, y);
  }

  // ===== EWMA (RED DOTS for Out of Limit) =====
  if (type === 'ewma') {
    const labelsInd = dataInd.map(d => d.id);
    const ewmaVals = dataInd.map(d => d.ewma);
    const ewmaPoints = seriesPointsFromInd(dataInd, d => d.ewma);

    const ucl = dataInd.map(d => d.ucl);
    const lcl = dataInd.map(d => d.lcl);
    const cl = dataInd.map(d => d.cl);

    const endLabelCommon = {
      show: true,
      fontWeight: 'normal',
      backgroundColor: 'rgba(255,255,255,0.85)',
      padding: [2, 6],
      borderRadius: 3,
      color: '#000000'
    };

    const opt = {
      title: { text: 'EWMA', left: 'center', textStyle: titleStyle },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params) => {
          const p = params.find(item => item.seriesName === 'EWMA');
          if (!p) return '';
          const rawV = (p.data && typeof p.data === 'object' && 'value' in p.data) ? p.data.value : p.value;
          const val = (rawV == null || isNaN(rawV)) ? '-' : Number(rawV).toFixed(2);
          return `${p.name}<br/>${p.marker} ${p.seriesName}: <b>${val}</b>`;
        }
      },
      xAxis: { data: labelsInd },
      yAxis: {},
      series: [
        { name: 'EWMA', type: 'line', data: ewmaPoints, symbol: 'circle', symbolSize: 6 },
        { name: 'UCL', type: 'line', data: ucl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'dashed', width: 1 }, endLabel: { ...endLabelCommon, formatter: 'UCL' } },
        { name: 'CL', type: 'line', data: cl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'solid', width: 1 }, endLabel: { ...endLabelCommon, formatter: () => 'X\u0304' } },
        { name: 'LCL', type: 'line', data: lcl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'dashed', width: 1 }, endLabel: { ...endLabelCommon, formatter: 'LCL' } }
      ]
    };

    const y = niceBounds([...ewmaVals, ...ucl, ...lcl, ...cl], 0.15);
    return applyDynamicY(opt, y);
  }

  // ===== MA (RED DOTS for Out of Limit) =====
  if (type === 'ma') {
    const window = 10;

    const labels = dataInd.map(d => d.id);
    const raw = dataInd.map(d => d.value);

    const maVals = raw.map((_, i) => {
      const start = Math.max(0, i - window + 1);
      const sub = raw.slice(start, i + 1);
      return sub.reduce((a, b) => a + b, 0) / sub.length;
    });

    const maPoints = dataInd.map((d, i) => asPoint(maVals[i], isOutOfControlPoint(d)));

    const n = raw.length;
    const cl = raw.reduce((a, b) => a + b, 0) / (n || 1);
    const sigma = n > 1 ? Math.sqrt(raw.reduce((acc, x) => acc + Math.pow(x - cl, 2), 0) / (n - 1)) : 0;

    const ucl = [];
    const lcl = [];
    const clArr = [];

    for (let i = 0; i < labels.length; i++) {
      const wEff = Math.min(window, i + 1);
      const halfWidth = 3 * (sigma / Math.sqrt(wEff || 1));
      clArr.push(cl);
      ucl.push(cl + halfWidth);
      lcl.push(cl - halfWidth);
    }

    const opt = {
      title: { text: 'MA', left: 'center', textStyle: titleStyle },
      tooltip: commonTooltip,
      xAxis: { data: labels },
      yAxis: {},
      series: [
        { name: 'MA', type: 'line', data: maPoints, symbol: 'circle', symbolSize: 6 },
        { name: 'UCL', type: 'line', data: ucl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'dashed', width: 1 } },
        { name: 'CL', type: 'line', data: clArr, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'solid', width: 1 } },
        { name: 'LCL', type: 'line', data: lcl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'dashed', width: 1 } }
      ]
    };

    const y = niceBounds([...raw, ...maVals, ...ucl, ...lcl, ...clArr], 0.18);
    return applyDynamicY(opt, y);
  }

  if (type === 'mamr' || type === 'mams') {
    const window = 10;
    const labels = dataVar.map(d => d.id);
    const raw = dataVar.map(d => d.mean);

    const maVals = raw.map((_, i) => {
      const start = Math.max(0, i - window + 1);
      const sub = raw.slice(start, i + 1);
      return sub.reduce((a, b) => a + b, 0) / sub.length;
    });

    const meanRaw = raw.reduce((a, b) => a + b, 0) / (raw.length || 1);
    const ss = raw.reduce((a, x) => a + Math.pow(x - meanRaw, 2), 0);
    const sigmaEst = raw.length > 1 ? Math.sqrt(ss / (raw.length - 1)) : 0;

    const ucl = [];
    const lcl = [];
    const clArr = [];

    for (let i = 0; i < labels.length; i++) {
      const wEff = Math.min(window, i + 1);
      const halfWidth = 3 * (sigmaEst / Math.sqrt(wEff || 1));
      clArr.push(meanRaw);
      ucl.push(meanRaw + halfWidth);
      lcl.push(meanRaw - halfWidth);
    }

    const opt = {
      title: { text: type.toUpperCase(), left: 'center', textStyle: titleStyle },
      tooltip: commonTooltip,
      xAxis: { data: labels },
      yAxis: {},
      series: [
        { name: 'Raw', type: 'line', data: raw, symbol: 'circle', symbolSize: 5, lineStyle: { opacity: 0.35 } },
        { name: `MA(${window})`, type: 'line', data: maVals, symbol: 'none' },
        { name: 'UCL', type: 'line', data: ucl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'dashed', width: 1 } },
        { name: 'CL', type: 'line', data: clArr, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'solid', width: 1 } },
        { name: 'LCL', type: 'line', data: lcl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'dashed', width: 1 } }
      ]
    };

    const y = niceBounds([...raw, ...maVals, ...ucl, ...lcl, ...clArr], 0.18);
    return applyDynamicY(opt, y);
  }

  // ===== CuSum (RED DOTS for Out of Limit) =====
  if (type === 'cusum') {
    const labels = dataInd.map(d => d.id);

    const cpNums = dataInd.map(d => d.cp);
    const cmNums = dataInd.map(d => d.cm);

    const cpPoints = dataInd.map(d => asPoint(d.cp, isOutOfControlPoint(d)));
    const cmPoints = dataInd.map(d => asPoint(d.cm, isOutOfControlPoint(d)));

    const lastSigma = dataInd.length ? (dataInd[dataInd.length - 1].sigmaEst ?? 0) : 0;
    const h = 5.0 * lastSigma;

    const opt = {
      title: { text: 'CuSum', left: 'center', textStyle: titleStyle },
      tooltip: {
        trigger: 'axis',
        axisPointer: { show: false },
        formatter: (params) => {
          const keep = params.filter(p => p.seriesName === 'C+' || p.seriesName === 'C-');
          if (!keep.length) return '';
          let res = `${keep[0].name}<br/>`;
          keep.forEach(p => {
            const rawV = (p.value && typeof p.value === 'object' && 'value' in p.value) ? p.value.value : p.value;
            const v = (rawV == null || isNaN(rawV)) ? '-' : Number(rawV).toFixed(2);
            res += `${p.marker} ${p.seriesName}: <b>${v}</b><br/>`;
          });
          return res;
        }
      },
      legend: { data: ['C+', 'C-'], top: '30px' },
      xAxis: { data: labels },
      yAxis: {},
      series: [
        { name: 'C+', type: 'line', data: cpPoints, symbol: 'circle', symbolSize: 5 },
        { name: 'C-', type: 'line', data: cmPoints, symbol: 'circle', symbolSize: 5 },
        {
          name: 'h',
          type: 'line',
          data: [],
          showSymbol: false,
          tooltip: { show: false },
          markLine: { symbol: ['none', 'none'], data: [{ yAxis: h, label: { formatter: 'h' } }] }
        }
      ]
    };

    const y = niceBounds([...cpNums, ...cmNums, h, 0], 0.12);
    return applyDynamicY(opt, y);
  }

  return {};
}

// =========================
// 11) Existing helpers (unchanged)
// =========================
function statsLineLabel(ucl, center, lcl, centerText) {
  const getSymbol = (txt) => {
    if (txt === 'X') return 'X\u0305';
    if (txt === 'MR') return 'MR\u0305';
    if (txt === 'X\u0304' || txt === 'Mean') return '\u0304\u0304X';
    return txt;
  };

  const mk = (y, text, type, isCenter = false) => ({
    yAxis: y,
    lineStyle: {
      type,
      color: isCenter ? '#22c55e' : '#ef4444',
      opacity: 0.8,
      width: isCenter ? 2 : 1
    },
    label: {
      show: true,
      position: 'end',
      distance: 10,
      backgroundColor: 'rgba(255,255,255,0.8)',
      padding: [2, 4],
      borderRadius: 2,
      fontSize: 12,
      fontWeight: 'normal',
      color: '#000000',
      formatter: isCenter ? getSymbol(text) : text
    }
  });

  return {
    symbol: 'none',
    data: [
      mk(ucl, 'UCL', 'dashed'),
      mk(center, centerText, 'solid', true),
      mk(lcl, 'LCL', 'dashed')
    ]
  };
}

function statsLine(ucl, cl, lcl, centerSymbol = 'CL') {
  const getSymbol = (txt) => {
    if (txt === 'Mean') return '\u0304\u0304X';
    if (txt === 'Sigma') return '\u03C3\u0305';
    if (txt === 'Range') return 'R\u0305';
    if (txt === 'Median') return '\u1E40';
    return txt;
  };

  return {
    symbol: 'none',
    data: [
      { yAxis: ucl, label: { formatter: 'UCL', position: 'end', fontWeight: 'normal' }, lineStyle: { color: '#ef4444', type: 'dashed' } },
      { yAxis: cl,  label: { formatter: getSymbol(centerSymbol), position: 'end', fontWeight: 'normal' }, lineStyle: { color: '#22c55e', type: 'solid', width: 1 } },
      { yAxis: lcl, label: { formatter: 'LCL', position: 'end', fontWeight: 'normal' }, lineStyle: { color: '#ef4444', type: 'dashed' } }
    ]
  };
}

function getWecoStatus(val, ucl, lcl, cl, history) {
  if (history.length === 0) return { label: 'OK', type: 'success' };
  if (val > ucl || val < lcl) return { label: 'Out of Limit', type: 'danger' };

  const lastEight = history.slice(-8).map(d => d.ewma);
  if (lastEight.length === 8) {
    const allAbove = lastEight.every(v => v > cl);
    const allBelow = lastEight.every(v => v < cl);
    if (allAbove || allBelow) return { label: 'Process Shift', type: 'warning' };
  }
  return { label: 'OK', type: 'success' };
}

function getCapColor(val) {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return num > 1.33 ? 'text-success' : (num > 1 ? 'text-warning' : 'text-danger');
}
</script>




<style lang="scss" scoped>
/* --- Main Layout --- */
.spc-dashboard-pro {
  height: 100%;
  min-height: 0; /* important for flex children inside panes */
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f8fafc;
}

/* --- Header Section --- */
.dashboard-header {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
    align-items: center;
    gap: 12px;
  }
}

.chart-select {
  width: 260px;
}

/* --- Container & Content --- */
.main-container {
  flex: 1;
  overflow: hidden;
  min-height: 0; /* important */
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
.data-log-container,
.stats-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
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
    min-height: 420px;
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

  /* Custom Scrollbar */
  &::-webkit-scrollbar { height: 10px; }
  &::-webkit-scrollbar-track { background: #f8fafc; }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
    border: 3px solid #f8fafc;
  }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
}

.data-grid-transposed {
  display: flex;
  flex-direction: column;
  min-width: max-content;

  .log-row {
    display: flex;
    border-bottom: 1px solid #f1f5f9;

    &:last-child { border-bottom: none; }

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

      &.bold { font-weight: 700; }
      &.highlight {
      }
    }
  }
}

/* --- Stats Grid --- */
.stats-section {
  .stats-header h3 {
    margin: 0 0 15px 0;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    transition: transform 0.2s;

    &:hover { transform: translateY(-2px); }

    .label { color: #64748b; font-size: 12px; font-weight: 500; }
    .value {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 15px;
      color: #0f172a;
    }
  }
}

/* --- Utility Colors --- */
.text-success { color: #10b981; }
.text-warning { color: #f59e0b; }
.text-danger { color: #ef4444; }

/* Element Plus Overrides for plain tags */
:deep(.el-tag--primary.is-plain) {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}

:deep(.el-tag--warning.is-plain) {
  background-color: #fffbeb;
  border-color: #fde68a;
  color: #d97706;
}
</style>
