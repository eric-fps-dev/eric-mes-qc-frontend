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
        <el-select
            v-model="activeChart"
            size="small"
            class="chart-select"
            placeholder="Select chart"
        >
          <el-option
              v-for="opt in chartOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
          >
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
              <span>{{ opt.label }}</span>
              <el-tag
                  :type="opt.subgroupRequired ? 'warning' : 'primary'"
                  size="small"
                  effect="plain"
              >
                {{ opt.subgroupRequired ? 'Subgroup' : 'Individual' }}
              </el-tag>
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
              <h2>{{ chartTitles[activeChart] }}</h2>
              <el-tag
                  :type="chartOptions.find(o => o.value === activeChart)?.subgroupRequired ? 'warning' : 'primary'"
                  effect="plain"
                  size="small"
              >
                {{ chartOptions.find(o => o.value === activeChart)?.subgroupRequired ? 'Subgroup' : 'Individual' }}
              </el-tag>
            </div>
            <p class="chart-desc">{{ chartDescriptions[activeChart] }}</p>
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

        <!-- Stats -->
        <div class="stats-section" v-if="currentStats">
          <div class="stats-header">
            <h3>Process Stats</h3>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <span class="label">Mean:</span>
              <span class="value">{{ currentStats.mean }}</span>
            </div>

            <div class="stat-item">
              <span class="label">Sigma:</span>
              <span class="value">{{ currentStats.sigma }}</span>
            </div>

            <div class="stat-item" v-if="currentStats.cp">
              <span class="label">Cp:</span>
              <span :class="['value', getCapColor(currentStats.cp)]">{{ currentStats.cp }}</span>
            </div>

            <div class="stat-item" v-if="currentStats.cpk">
              <span class="label">Cpk:</span>
              <span :class="['value', getCapColor(currentStats.cpk)]">{{ currentStats.cpk }}</span>
            </div>
          </div>
        </div>

      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

// --- Constants & Config ---
const activeChart = ref('imr');
let chartInstance = null;

const config = ref({
  mean: 80.0,
  stdDev: 2.0,
  n: 5,
  usl: 86.0,
  lsl: 74.0
});

// --- EWMA Defaults (single source of truth) ---
const EWMA_TARGET = 175;
const EWMA_LAMBDA = 0.2;
const EWMA_L = 3;

// --- Data Stores ---
const varData = ref([]); // { id, timestamp, values: [], mean, range, sigma, median }
const indData = ref([]); // { id, timestamp, value, mr, ewma, cp, cm }

// --- Metadata ---
const chartTitles = {
  'xbar-r': 'Fry Length Control - X-Bar R Chart',
  'xbar-s': 'Bag Weight Consistency - X-Bar Sigma Chart',
  'median-r': 'Oil Temp Median - Median and Range Chart',
  'imr': 'Hourly Acidity Check - I-MR Chart',
  'levey': 'Salt Analyzer Calibration - Levey-Jennings Chart',
  'ewma': 'Heater Drift Detection - EWMA Chart',
  'ma': 'Moisture Trend - MA Chart',
  'mamr': 'Potato Tonnage - MAMR Chart',
  'mams': 'Starch Content - MAMS Chart',
  'cusum': 'Slicer Blade Wear - CuSum Chart'
};

const chartDescriptions = {
  'xbar-r': 'Monitoring average fry length and consistency in 5-piece subgroups',
  'xbar-s': 'Tracking weight of 20-bag batches using Sigma for precision',
  'median-r': 'Tracking oil temperature stability, robust against sensor spikes',
  'imr': 'Individual pH measurements of oil taken hourly',
  'levey': 'Lab control chart for salt concentration analyzer',
  'ewma': 'Detecting subtle cooling trends in the fryer oil',
  'ma': '10-sample moving average of moisture content',
  'mamr': 'Hourly potato intake tracking',
  'mams': 'Wastewater starch levels',
  'cusum': 'Detecting micro-deviations in slicer thickness'
};

const chartOptions = computed(() => ([
  { value: 'imr', label: 'I-MR', subgroupRequired: false, minN: 1 },
  { value: 'levey', label: 'Levey-Jennings', subgroupRequired: false, minN: 1 },
  { value: 'ewma', label: 'EWMA', subgroupRequired: false, minN: 1 },
  { value: 'ma', label: 'MA', subgroupRequired: false, minN: 1 },
  { value: 'cusum', label: 'CuSum', subgroupRequired: false, minN: 1 },

  { value: 'xbar-r', label: 'X-Bar R', subgroupRequired: true, minN: 2 },
  { value: 'xbar-s', label: 'X-Bar Sigma', subgroupRequired: true, minN: 2 },
  { value: 'median-r', label: 'Median and Range', subgroupRequired: true, minN: 3 },
  { value: 'mamr', label: 'MAMR', subgroupRequired: true, minN: 2 },
  { value: 'mams', label: 'MAMS', subgroupRequired: true, minN: 2 }
]));

// --- Computed Table Data ---
const tableLabels = computed(() => {
  if (activeChart.value.includes('xbar')) return { col1: 'Mean', col2: 'Range/Sigma' };
  if (activeChart.value.includes('imr')) return { col1: 'Value', col2: 'Moving Range' };
  return { col1: 'Metric 1', col2: 'Metric 2' };
});

const tableData = computed(() => {
  const isInd = ['imr', 'levey', 'cusum', 'ewma', 'ma'].includes(activeChart.value);
  const source = isInd ? indData.value : varData.value;
  const windowSize = 10;

  // 1. Get the last 50 points
  const lastPoints = [...source].slice(-50).sort((a, b) => a.id - b.id);

  // 2. Map and calculate MA for the display
  return lastPoints.map((d, index, array) => {
    const displayValue = d.value != null ? d.value : d.mean;

    // Calculate MA for this specific point based on the visible array
    const start = Math.max(0, index - windowSize + 1);
    const subset = array.slice(start, index + 1);
    const sum = subset.reduce((acc, curr) => acc + (curr.value != null ? curr.value : curr.mean), 0);
    const ma = sum / subset.length;

    return {
      id: d.id,
      timestamp: d.timestamp,
      value: displayValue.toFixed(2),
      ewma: d.ewma ? d.ewma.toFixed(2) : '-',
      ma: ma.toFixed(2),

      // ✅ add these
      cp: (d.cp != null) ? Number(d.cp).toFixed(2) : '-',
      cm: (d.cm != null) ? Number(d.cm).toFixed(2) : '-',

      statusLabel: d.statusLabel || 'OK',
      statusType: d.statusType || 'success'
    };

  });
});

const currentStats = computed(() => {
  if (varData.value.length < 2) return null;
  const data = varData.value.slice(-30);
  const allVals = data.flatMap(d => d.values);

  const rBar = data.reduce((a, b) => a + Number(b.range), 0) / data.length;
  const d2 = 2.326; // n=5
  const sigmaEstNum = rBar / d2;
  const mean = (allVals.reduce((a, b) => a + b, 0) / allVals.length).toFixed(2);
  const sigmaEst = sigmaEstNum.toFixed(2);

  const cp = ((config.value.usl - config.value.lsl) / (6 * sigmaEstNum)).toFixed(2);
  const cpu = (config.value.usl - Number(mean)) / (3 * sigmaEstNum);
  const cpl = (Number(mean) - config.value.lsl) / (3 * sigmaEstNum);
  const cpk = Math.min(cpu, cpl).toFixed(2);

  return { mean, sigma: sigmaEst, cp, cpk };
});

// --- Watchers ---
watch(activeChart, () => nextTick(renderChart));

// --- Life Cycle ---
onMounted(() => {
  seedData();
  nextTick(renderChart);
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
});

function resizeChart() {
  if (chartInstance) chartInstance.resize();
}

// --- Data Generation ---
function seedData() {
  for (let i = 30; i > 0; i--) {
    generateStep(false, i);
  }
}

function generateStep(isLiveStep, secondsAgo = 0) {
  const id = varData.value.length + 1;
  const time = dayjs().subtract(secondsAgo, 'minute').format('HH:mm:ss');

  // --- 1. Variable Subgroup Generation (X-Bar/R/S Charts) ---
  const vals = [];
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  const currentMean = config.value.mean + (Math.sin(id / 10) * 0.5);

  for (let j = 0; j < config.value.n; j++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const val = currentMean + (z * config.value.stdDev);
    vals.push(val);
    sum += val;
    if (val < min) min = val;
    if (val > max) max = val;
  }

  const mean = sum / config.value.n;
  const range = max - min;
  const meanDiffs = vals.map(v => Math.pow(v - mean, 2));
  const variance = meanDiffs.reduce((a, b) => a + b, 0) / (config.value.n - 1);
  const sigmaSub = Math.sqrt(variance);
  const sorted = [...vals].sort((a, b) => a - b);
  const median = sorted[Math.floor(config.value.n / 2)];

  varData.value.push({ id, timestamp: time, values: vals, mean, range, sigma: sigmaSub, median });

  // --- 2. Individual Data Generation (I-MR / EWMA / CuSum) ---
  const tempBase = EWMA_TARGET;
  const tempNoise = (Math.random() - 0.5) * 2;
  const indVal = tempBase + tempNoise + (Math.sin(id / 20) * 2);

  // Moving Range (MR)
  const prevPoint = indData.value.length > 0 ? indData.value[indData.value.length - 1] : null;
  const mr = prevPoint ? Math.abs(indVal - prevPoint.value) : null;

  // EWMA Calculation
  const prevEwma = prevPoint ? (prevPoint.ewma ?? EWMA_TARGET) : EWMA_TARGET;
  const ewma = (EWMA_LAMBDA * indVal) + ((1 - EWMA_LAMBDA) * prevEwma);

  // --- 3. Sigma Estimation & Control Limits (for WECO Rules) ---
  // We estimate sigma from the average Moving Range (mrBar / d2)
  const allMrs = indData.value.map(d => d.mr).filter(v => v != null);
  if (mr !== null) allMrs.push(mr);
/// --- 3. Sigma Estimation ---
  const mrBar = allMrs.length ? (allMrs.reduce((a, b) => a + b, 0) / allMrs.length) : 0;
  const sigmaEst = mrBar / 1.128;

// Get current point index (t)
  const t = indData.value.length + 1;

// --- Calculate exact boundaries for THIS specific point ---
  const sigmaZt = sigmaEst * Math.sqrt(
      (EWMA_LAMBDA / (2 - EWMA_LAMBDA)) * (1 - Math.pow(1 - EWMA_LAMBDA, 2 * t))
  );

  const currentUcl = EWMA_TARGET + (EWMA_L * sigmaZt);
  const currentLcl = EWMA_TARGET - (EWMA_L * sigmaZt);

// --- 4. WECO Status Check ---
// Now we check if ewma is strictly between the currentUcl and currentLcl
  const status = getWecoStatus(ewma, currentUcl, currentLcl, EWMA_TARGET, indData.value);

  // --- 5. CuSum helper fields ---
  const target = EWMA_TARGET;
  const k = 0.5 * sigmaEst;     // ignore zone
  const prevCp = prevPoint ? (prevPoint.cp ?? 0) : 0;
  const prevCm = prevPoint ? (prevPoint.cm ?? 0) : 0;
  const cp = Math.max(0, indVal - (target + k) + prevCp);
  const cm = Math.max(0, (target - k) - indVal + prevCm);

  // --- 6. Final Push ---
  indData.value.push({
    id,
    timestamp: time,
    value: indVal,
    mr,
    ewma,
    sigmaEst,
    k,
    cp,
    cm,
    statusLabel: status.label,
    statusType: status.type
  });

  // Keep buffer manageable
  if (varData.value.length > 100) varData.value.shift();
  if (indData.value.length > 100) indData.value.shift();

  if (isLiveStep) renderChart();
}

// --- Rendering Logic ---
function renderChart() {
  const dom = document.getElementById('mainChart');
  if (!dom) return;

  if (!chartInstance) chartInstance = echarts.init(dom);

  const options = getChartOptions(activeChart.value);
  chartInstance.setOption(options, { notMerge: true });
}

function getChartOptions(type) {
  const titleStyle = { fontSize: 15 };

  const commonTooltip = {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
    formatter: (params) => {
      let res = `${params[0].name}<br/>`;
      params.forEach(p => {
        const val = (p.value == null || isNaN(p.value)) ? '-' : Number(p.value).toFixed(2);
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
    const xbb = xbars.reduce((a, b) => a + b, 0) / xbars.length;
    const rb = ranges.reduce((a, b) => a + b, 0) / ranges.length;

    return {
      title: [
        { text: 'Avg Length', left: 'center', textStyle: titleStyle },
        { text: 'Range', top: '50%', left: 'center', textStyle: titleStyle }
      ],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{ data: labelsVar }, { data: labelsVar, gridIndex: 1 }],
      yAxis: [{ min: 70, max: 90 }, { gridIndex: 1 }],
      series: [
        { name: 'Mean', type: 'line', data: xbars, markLine: statsLine(xbb + A2 * rb, xbb, xbb - A2 * rb) },
        { name: 'Range', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: ranges, markLine: statsLine(D4 * rb, rb, D3 * rb) }
      ]
    };
  }

  if (type === 'xbar-s') {
    const xbars = dataVar.map(d => d.mean);
    const sigmas = dataVar.map(d => d.sigma);
    const xbb = xbars.reduce((a, b) => a + b, 0) / xbars.length;
    const sb = sigmas.reduce((a, b) => a + b, 0) / sigmas.length;

    return {
      title: [
        { text: 'Avg Weight', left: 'center', textStyle: titleStyle },
        { text: 'Sigma', top: '50%', left: 'center', textStyle: titleStyle }
      ],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{ data: labelsVar }, { data: labelsVar, gridIndex: 1 }],
      yAxis: [{}, { gridIndex: 1 }],
      series: [
        { name: 'Mean', type: 'line', data: xbars, markLine: statsLine(xbb + A3 * sb, xbb, xbb - A3 * sb) },
        { name: 'Sigma', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: sigmas, markLine: statsLine(B4 * sb, sb, B3 * sb) }
      ]
    };
  }

  if (type === 'median-r') {
    const medians = dataVar.map(d => d.median);
    const ranges = dataVar.map(d => d.range);
    const A2Tilde = 0.691;
    const mb = medians.reduce((a, b) => a + b, 0) / medians.length;
    const rb = ranges.reduce((a, b) => a + b, 0) / ranges.length;

    return {
      title: [
        { text: 'Median Temp', left: 'center', textStyle: titleStyle },
        { text: 'Range', top: '50%', left: 'center', textStyle: titleStyle }
      ],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{ data: labelsVar }, { data: labelsVar, gridIndex: 1 }],
      yAxis: [{}, { gridIndex: 1 }],
      series: [
        { name: 'Median', type: 'line', data: medians, markLine: statsLine(mb + A2Tilde * rb, mb, mb - A2Tilde * rb) },
        { name: 'Range', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: ranges, markLine: statsLine(D4 * rb, rb, D3 * rb) }
      ]
    };
  }

  if (type === 'imr') {
    const labelsInd = dataInd.map(d => d.id);

    const vals = dataInd.map(d => d.value);
    const mrsPlot = dataInd.map(d => d.mr);
    const mrsCalc = mrsPlot.filter(v => v != null);

    const xBar = vals.reduce((a, b) => a + b, 0) / vals.length;
    const mrBar = mrsCalc.length ? (mrsCalc.reduce((a, b) => a + b, 0) / mrsCalc.length) : 0;

    const E2 = 2.66;

    return {
      title: [
        { text: 'Individual (I)', left: 'center', textStyle: titleStyle },
        { text: 'Moving Range (MR)', top: '50%', left: 'center', textStyle: titleStyle }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params) => {
          return params
              .map(p => {
                const v = (p.value == null || Number.isNaN(p.value)) ? '' : Number(p.value).toFixed(2);
                return `${p.marker} ${p.seriesName}: ${v}`;
              })
              .join('<br/>');
        }
      },
      grid: gridDual,
      xAxis: [{ data: labelsInd }, { data: labelsInd, gridIndex: 1 }],
      yAxis: [
        { min: 170, max: 180 },
        { gridIndex: 1, name: 'Moving Range', nameLocation: 'middle', nameGap: 45 }
      ],
      series: [
        { name: 'X', type: 'line', symbol: 'circle', symbolSize: 6,data: vals, markLine: statsLineLabel(xBar + E2 * mrBar, xBar, xBar - E2 * mrBar, 'X') },
        { name: 'MR', type: 'line', symbol: 'circle', symbolSize: 6,xAxisIndex: 1, yAxisIndex: 1, data: mrsPlot, markLine: statsLineLabel(3.267 * mrBar, mrBar, 0, 'MR') }
      ]
    };
  }

  if (type === 'levey') {
    const vals = dataInd.map(d => d.value);
    const n = vals.length;

    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const stdDev = Math.sqrt(vals.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (n - 1));

    return {
      title: { text: 'Levey-Jennings', left: 'center', textStyle: titleStyle },
      tooltip: commonTooltip,
      xAxis: { data: dataInd.map(d => d.id), boundaryGap: false },
      yAxis: {
        max: (mean + 4 * stdDev).toFixed(2),
        min: (mean - 4 * stdDev).toFixed(2),
        splitLine: { show: false }
      },
      series: [{
        type: 'line',
        data: vals,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#3b82f6', width: 2 },
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
  }

  if (type === 'ewma') {
    const labelsInd = dataInd.map(d => d.id);
    const ewmaVals = dataInd.map(d => d.ewma);

    const mrs = dataInd.map(d => d.mr).filter(v => v != null);
    const mrBar = mrs.length ? (mrs.reduce((a, b) => a + b, 0) / mrs.length) : 0;
    const sigma = mrBar / 1.128;

    const ucl = []; const lcl = []; const cl = [];

    for (let i = 0; i < labelsInd.length; i++) {
      const t = i + 1;
      const sigmaZt = sigma * Math.sqrt(
          (EWMA_LAMBDA / (2 - EWMA_LAMBDA)) * (1 - Math.pow(1 - EWMA_LAMBDA, 2 * t))
      );
      cl.push(EWMA_TARGET);
      ucl.push(EWMA_TARGET + EWMA_L * sigmaZt);
      lcl.push(EWMA_TARGET - EWMA_L * sigmaZt);
    }

    const endLabelCommon = {
      show: true,
      fontWeight: 'normal',
      backgroundColor: 'rgba(255,255,255,0.85)',
      padding: [2, 6],
      borderRadius: 3,
      color: '#000000'
    };

    return {
      title: { text: 'EWMA', left: 'center', textStyle: titleStyle },
      // Global tooltip logic to show ONLY the first series (EWMA)
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params) => {
          // Find only the EWMA series in the params array
          const p = params.find(item => item.seriesName === 'EWMA');
          if (!p) return '';
          const val = (p.value == null || isNaN(p.value)) ? '-' : Number(p.value).toFixed(2);
          return `${p.name}<br/>${p.marker} ${p.seriesName}: <b>${val}</b>`;
        }
      },
      xAxis: { data: labelsInd },
      yAxis: { min: 170, max: 180 },
      series: [
        {
          name: 'EWMA',
          type: 'line',
          data: ewmaVals,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: (params) => {
              const point = dataInd[params.dataIndex];
              return point?.statusType === 'danger' ? '#ef4444' : '#3b82f6';
            }
          }
        },
        {
          name: 'UCL',
          type: 'line',
          data: ucl,
          symbol: 'none',
          tooltip: { show: false }, // Explicitly hide from tooltip
          lineStyle: { type: 'dashed', color: '#ef4444', width: 1 },
          endLabel: { ...endLabelCommon, formatter: 'UCL' }
        },
        {
          name: 'CL',
          type: 'line',
          data: cl,
          symbol: 'none',
          tooltip: { show: false }, // Explicitly hide from tooltip
          lineStyle: { type: 'solid', color: '#22c55e', width: 1 },
          endLabel: { ...endLabelCommon, formatter: () => 'X\u0304' } // X with upper line
        },
        {
          name: 'LCL',
          type: 'line',
          data: lcl,
          symbol: 'none',
          tooltip: { show: false }, // Explicitly hide from tooltip
          lineStyle: { type: 'dashed', color: '#ef4444', width: 1 },
          endLabel: { ...endLabelCommon, formatter: 'LCL' }
        }
      ]
    };
  }


  if (type === 'ma') {
    const window = 10;

    const labels = dataInd.map(d => d.id);
    const raw = dataInd.map(d => d.value);

    // Moving Average (truncated startup)
    const maVals = raw.map((_, i) => {
      const start = Math.max(0, i - window + 1);
      const sub = raw.slice(start, i + 1);
      return sub.reduce((a, b) => a + b, 0) / sub.length;
    });

    // --- FIX #1: sigma from RAW data (sample stdev), not MRbar/1.128 ---
    const n = raw.length;
    const cl = raw.reduce((a, b) => a + b, 0) / (n || 1);

    const sigma =
        n > 1
            ? Math.sqrt(raw.reduce((acc, x) => acc + Math.pow(x - cl, 2), 0) / (n - 1))
            : 0;

    // Variable limits at startup: mu ± 3*sigma/sqrt(wEff)
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

    const allY = [...raw, ...maVals, ...ucl, ...lcl].filter(v => v != null);
    const yMin = Math.min(...allY);
    const yMax = Math.max(...allY);
    const pad = (yMax - yMin) * 0.50;

// ✅ snap to nice integer bounds
    const yMinNice = Math.floor(yMin - pad);
    const yMaxNice = Math.ceil(yMax + pad);
    const endLabelCommon = {
      show: true,
      fontWeight: 'normal',
      backgroundColor: 'rgba(255,255,255,0.85)',
      padding: [2, 6],
      borderRadius: 3,
      color: '#000000'
    };

    return {
      title: { text: 'MA', left: 'center', textStyle: titleStyle },
      tooltip: commonTooltip,
      xAxis: { data: labels },
      yAxis: {
        min: yMinNice,
        max: yMaxNice,
        interval: 2
      },


      series: [
        // MA line only (no fill)
        {
          name: `MA`,
          type: 'line',
          data: maVals,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 2 },

          // FIX: color points based on MA vs (variable) limits
          itemStyle: {
            color: (params) => {
              const i = params.dataIndex;
              const v = maVals[i];
              const hi = ucl[i];
              const lo = lcl[i];
              if (v == null || hi == null || lo == null) return '#3b82f6';
              return (v > hi || v < lo) ? '#ef4444' : '#3b82f6';
            }
          }
        },

        // UCL (red dashed) with end label
        {
          name: 'UCL',
          type: 'line',
          data: ucl,
          symbol: 'none',
          tooltip: { show: false },
          lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
          endLabel: { ...endLabelCommon, formatter: 'UCL' }
        },

        // CL (green solid) with end label
        {
          name: 'CL',
          type: 'line',
          data: clArr,
          symbol: 'none',
          tooltip: { show: false },
          lineStyle: { color: '#22c55e', type: 'solid', width: 1 },
          endLabel: { ...endLabelCommon, formatter: () => 'X\u0304' } // X̄
        },

        // LCL (red dashed) with end label
        {
          name: 'LCL',
          type: 'line',
          data: lcl,
          symbol: 'none',
          tooltip: { show: false },
          lineStyle: { color: '#ef4444', type: 'dashed', width: 1 },
          endLabel: { ...endLabelCommon, formatter: 'LCL' }
        }
      ]
    };
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

    // simple sigma estimate from stdev of subgroup means (ok for demo; can refine later)
    const meanRaw = raw.reduce((a, b) => a + b, 0) / (raw.length || 1);
    const ss = raw.reduce((a, x) => a + Math.pow(x - meanRaw, 2), 0);
    const sigmaEst = raw.length > 1 ? Math.sqrt(ss / (raw.length - 1)) : 0;

    const cl = meanRaw;

    const ucl = [];
    const lcl = [];
    const clArr = [];

    for (let i = 0; i < labels.length; i++) {
      const wEff = Math.min(window, i + 1);
      const halfWidth = 3 * (sigmaEst / Math.sqrt(wEff || 1));
      clArr.push(cl);
      ucl.push(cl + halfWidth);
      lcl.push(cl - halfWidth);
    }

    return {
      title: { text: type.toUpperCase(), left: 'center', textStyle: titleStyle }, // MAMR / MAMS
      tooltip: commonTooltip,
      xAxis: { data: labels },
      yAxis: {},
      series: [
        { name: 'Raw', type: 'line', data: raw, symbol: 'circle', symbolSize: 5, lineStyle: { opacity: 0.35 } },
        { name: `MA(${window})`, type: 'line', data: maVals, symbol: 'none' },
        { name: 'UCL', type: 'line', data: ucl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'dashed', width: 1 } },
        { name: 'CL',  type: 'line', data: clArr, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'solid', width: 1 } },
        { name: 'LCL', type: 'line', data: lcl, symbol: 'none', tooltip: { show: false }, lineStyle: { type: 'dashed', width: 1 } }
      ]
    };
  }



  if (type === 'cusum') {
    const labels = dataInd.map(d => d.id);
    const cp = dataInd.map(d => d.cp);
    const cm = dataInd.map(d => d.cm);

    // use latest sigma estimate for the decision interval
    const lastSigma = dataInd.length ? (dataInd[dataInd.length - 1].sigmaEst ?? 0) : 0;

    const k = 0.5 * lastSigma;     // ignore zone (0.5σ)
    const h = 5.0 * lastSigma;     // decision interval (5σ)

    return {
      title: { text: 'CuSum', left: 'center', textStyle: titleStyle },
      tooltip: {
        trigger: 'axis',
        axisPointer: { show: false },
        formatter: (params) => {
          const keep = params.filter(p => p.seriesName === 'C+' || p.seriesName === 'C-');
          if (!keep.length) return '';

          let res = `${keep[0].name}<br/>`;
          keep.forEach(p => {
            const v = (p.value == null || isNaN(p.value)) ? '-' : Number(p.value).toFixed(2);
            res += `${p.marker} ${p.seriesName}: <b>${v}</b><br/>`;
          });
          return res;
        }
      },
      legend: { data: ['C+', 'C-'], top: '30px' },
      xAxis: { data: labels },
      yAxis: { min: 0 }, // CUSUM is non-negative in this tabular form
      series: [
        { name: 'C+', type: 'line', data: cp, symbol: 'circle', symbolSize: 5},
        { name: 'C-', type: 'line', data: cm, symbol: 'circle', symbolSize: 5 },
        {
          name: 'h',
          type: 'line',
          data: [],
          showSymbol: false,
          tooltip: { show: false },
          markLine: {
            symbol: ['none', 'none'],
            data: [{
              yAxis: h,
              label: { formatter: 'h' },
              lineStyle: { color: 'red' }
            }]
          }
        }
      ]
    };
  }


  return {};
}

/**
 * FIXED: Ensures MR and X both use mathematical overlines for center lines.
 */
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
      color: '#000000', // Set to black
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

/**
 * Ensures standard charts also use professional mathematical notation.
 */
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
      {
        yAxis: ucl,
        label: { formatter: 'UCL', position: 'end', fontWeight: 'normal' },
        lineStyle: { color: '#ef4444', type: 'dashed' }
      },
      {
        yAxis: cl,
        label: { formatter: getSymbol(centerSymbol), position: 'end', fontWeight: 'normal' },
        lineStyle: { color: '#22c55e', type: 'solid', width: 1 }
      },
      {
        yAxis: lcl,
        label: { formatter: 'LCL', position: 'end', fontWeight: 'normal' },
        lineStyle: { color: '#ef4444', type: 'dashed' }
      }
    ]
  };
}

// Rule Engine for SPC Alarms
function getWecoStatus(val, ucl, lcl, cl, history) {
// If it's the first point, we don't have enough history for a real limit check
  if (history.length === 0) return { label: 'OK', type: 'success' };

  if (val > ucl || val < lcl) {
    return { label: 'Out of Limit', type: 'danger' };
  }

  // Rule 2: Shift Detection (8 consecutive points on one side of center)
  const lastEight = history.slice(-8).map(d => d.ewma);
  if (lastEight.length === 8) {
    const allAbove = lastEight.every(v => v > cl);
    const allBelow = lastEight.every(v => v < cl);
    if (allAbove || allBelow) {
      return { label: 'Process Shift', type: 'warning' };
    }
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
  height: 100vh;
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
