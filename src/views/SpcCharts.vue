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
                  :type="opt.subgroupRequired ? 'warning' : 'info'"
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
                  :type="chartOptions.find(o => o.value === activeChart)?.subgroupRequired ? 'warning' : 'info'"
                  effect="dark"
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
          <h3>Data Points</h3>
          <el-table :data="tableData" style="width: 100%" height="250" size="small" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="timestamp" label="Time" width="150" />
            <el-table-column prop="valueStr" label="Values / Counts" />
            <el-table-column prop="calc1" :label="tableLabels.col1" width="120" />
            <el-table-column prop="calc2" :label="tableLabels.col2" width="120" />
            <el-table-column label="Status" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'OOC' ? 'danger' : 'success'" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Stats -->
        <div class="stats-section" v-if="currentStats">
          <div class="stats-header">
            <h3>Process Stats (Length)</h3>
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

// --- Data Stores ---
const varData = ref([]); // { id, timestamp, values: [], mean, range, sigma, median }
const indData = ref([]); // { id, timestamp, value, mr, ewma, cp, cm }

// --- Metadata ---
const chartTitles = {
  'xbar-r': 'Fry Length Control (X-Bar R)',
  'xbar-s': 'Bag Weight Consistency (X-Bar Sigma)',
  'median-r': 'Oil Temp Median (Median Rrange)',
  'imr': 'Hourly Acidity Check (I-MR)',
  'levey': 'Salt Analyzer Calibration (Levey-Jennings)',
  'ewma': 'Heater Drift Detection (EWMA)',
  'ma': 'Moisture Trend (MA)',
  'mamr': 'Potato Tonnage (MAMR)',
  'mams': 'Starch Content (MAMS)',
  'cusum': 'Slicer Blade Wear (CuSum)'
};

const chartDescriptions = {
  'xbar-r': 'Monitoring average fry length and consistency in 5-piece subgroups.',
  'xbar-s': 'Tracking weight of 20-bag batches using Sigma for precision.',
  'median-r': 'Tracking oil temperature stability, robust against sensor spikes.',
  'imr': 'Individual pH measurements of oil taken hourly.',
  'levey': 'Lab control chart for salt concentration analyzer.',
  'ewma': 'Detecting subtle cooling trends in the fryer oil.',
  'ma': '10-sample moving average of moisture content.',
  'mamr': 'Hourly potato intake tracking.',
  'mams': 'Wastewater starch levels.',
  'cusum': 'Detecting micro-deviations in slicer thickness.'
};

const chartOptions = computed(() => ([
  { value: 'imr', label: 'I-MR (Individual)', subgroupRequired: false, minN: 1 },
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
  const isInd = ['imr', 'levey', 'cusum', 'ewma'].includes(activeChart.value);
  const source = isInd ? indData.value : varData.value;

  const fmt2 = (x) => (x == null || Number.isNaN(Number(x)) ? '' : Number(x).toFixed(2));

  return [...source]
      .slice(0, 50)                 // keep first 50 in ascending order (oldest -> newest)
      .sort((a, b) => a.id - b.id)  // make sure ascending by id
      .map(d => ({
        id: d.id,
        timestamp: d.timestamp,

        valueStr: d.values
            ? `[${d.values.map(v => fmt2(v)).join(', ')}]`
            : fmt2(d.value),

        calc1: fmt2(d.mean ?? d.value),
        calc2: fmt2(d.range ?? d.sigma ?? d.mr),

        status: 'OK'
      }));
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
  for (let i = 0; i < 30; i++) generateStep(false);
}

function generateStep(isLiveStep) {
  const id = varData.value.length + 1;
  const time = dayjs().format('HH:mm:ss');

  // Variable subgroup
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
  const sigma = Math.sqrt(variance);

  const sorted = [...vals].sort((a, b) => a - b);
  const median = sorted[Math.floor(config.value.n / 2)];

  varData.value.push({ id, timestamp: time, values: vals, mean, range, sigma, median });

  // Individual data (IMR)
  const tempBase = 175;
  const tempNoise = (Math.random() - 0.5) * 2;
  const indVal = tempBase + tempNoise + (Math.sin(id / 20) * 2);

  // ✅ MR should be null on the first point (not 0)
  const prev = indData.value.length > 0 ? indData.value[indData.value.length - 1].value : null;
  const mr = prev == null ? null : Math.abs(indVal - prev);

  const lambda = 0.2;
  const prevEwma = indData.value.length > 0 ? (indData.value[indData.value.length - 1].ewma ?? tempBase) : tempBase;
  const ewma = (lambda * indVal) + ((1 - lambda) * prevEwma);

  // CuSum helper fields
  const target = 175;
  const k = 0.5 * 1.0;
  const prevCp = indData.value.length > 0 ? (indData.value[indData.value.length - 1].cp ?? 0) : 0;
  const prevCm = indData.value.length > 0 ? (indData.value[indData.value.length - 1].cm ?? 0) : 0;
  const cp = Math.max(0, indVal - (target + k) + prevCp);
  const cm = Math.max(0, (target - k) - indVal + prevCm);

  indData.value.push({ id, timestamp: time, value: indVal, mr, ewma, cp, cm });

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
  const commonTooltip = { trigger: 'axis', axisPointer: { type: 'cross' } };
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
      title: [{ text: 'Avg Length (mm)', left: 'center' }, { text: 'Range (mm)', top: '50%', left: 'center' }],
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
      title: [{ text: 'Avg Weight (g)', left: 'center' }, { text: 'Sigma (g)', top: '50%', left: 'center' }],
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
      title: [{ text: 'Median Temp (°C)', left: 'center' }, { text: 'Range', top: '50%', left: 'center' }],
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

  // ✅ IMR (correct MR + correct x-axis + correct MR-bar calc)
  if (type === 'imr') {
    const labelsInd = dataInd.map(d => d.id);

    const vals = dataInd.map(d => d.value);

    const mrsPlot = dataInd.map(d => d.mr);         // keep null for first point
    const mrsCalc = mrsPlot.filter(v => v != null); // for MR-bar & limits only

    const vb = vals.reduce((a, b) => a + b, 0) / vals.length;
    const mrb = mrsCalc.reduce((a, b) => a + b, 0) / mrsCalc.length;

    const E2 = 2.66;

    return {
      title: [{ text: 'Individual (I)', left: 'center' }, { text: 'Moving Range (MR)', top: '50%', left: 'center' }],
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params) => {
          return params
              .map(p => {
                const val =
                    p.value == null || Number.isNaN(p.value)
                        ? ''
                        : Number(p.value).toFixed(2);

                return `${p.marker} ${p.seriesName}: ${val}`;
              })
              .join('<br/>');
        }
      },
      grid: gridDual,
      xAxis: [{ data: labelsInd }, { data: labelsInd, gridIndex: 1 }],
      yAxis: [{ min: 170, max: 180 }, { gridIndex: 1 }],
      series: [
        { name: 'Value', type: 'line', data: vals, markLine: statsLine(vb + E2 * mrb, vb, vb - E2 * mrb) },
        { name: 'MR', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: mrsPlot, markLine: statsLine(3.267 * mrb, mrb, 0) }
      ]
    };
  }

  if (type === 'levey') {
    const vals = dataInd.map(d => d.value);
    const mean = 175;
    const sd = 1.0;

    return {
      title: { text: 'Salt Analyzer Check', left: 'center' },
      tooltip: commonTooltip,
      xAxis: { data: dataInd.map(d => d.id) },
      yAxis: { max: mean + 4 * sd, min: mean - 4 * sd },
      series: [{
        type: 'line',
        data: vals,
        markLine: {
          data: [
            { yAxis: mean, lineStyle: { color: 'green' } },
            { yAxis: mean + 1 * sd, lineStyle: { type: 'dashed', color: '#bbb' }, label: { formatter: '+1s' } },
            { yAxis: mean - 1 * sd, lineStyle: { type: 'dashed', color: '#bbb' }, label: { formatter: '-1s' } },
            { yAxis: mean + 2 * sd, lineStyle: { type: 'dashed', color: 'orange' }, label: { formatter: '+2s' } },
            { yAxis: mean - 2 * sd, lineStyle: { type: 'dashed', color: 'orange' }, label: { formatter: '-2s' } },
            { yAxis: mean + 3 * sd, lineStyle: { type: 'solid', color: 'red' }, label: { formatter: '+3s' } },
            { yAxis: mean - 3 * sd, lineStyle: { type: 'solid', color: 'red' }, label: { formatter: '-3s' } }
          ]
        }
      }]
    };
  }

  if (type === 'ewma') {
    const ewmaVals = dataInd.map(d => d.ewma);
    const target = 175;
    const lambda = 0.2;
    const sigmaEwma = 1.0 * Math.sqrt(lambda / (2 - lambda));

    return {
      title: { text: 'Heater Temp EWMA', left: 'center' },
      tooltip: commonTooltip,
      xAxis: { data: dataInd.map(d => d.id) },
      yAxis: { min: 170, max: 180 },
      series: [{
        type: 'line',
        data: ewmaVals,
        markLine: statsLine(target + 3 * sigmaEwma, target, target - 3 * sigmaEwma)
      }]
    };
  }

  if (type === 'ma' || type === 'mamr' || type === 'mams') {
    const maVals = [];
    const window = 3;
    const vals = dataVar.map(d => d.mean);
    for (let i = 0; i < vals.length; i++) {
      const sub = vals.slice(Math.max(0, i - window + 1), i + 1);
      maVals.push(sub.reduce((a, b) => a + b, 0) / sub.length);
    }

    return {
      title: { text: 'Moisture Moving Avg', left: 'center' },
      tooltip: commonTooltip,
      xAxis: { data: labelsVar },
      yAxis: { min: 70, max: 90 },
      series: [{ type: 'line', data: maVals, areaStyle: { opacity: 0.1 } }]
    };
  }

  if (type === 'cusum') {
    const cp = dataInd.map(d => d.cp);
    const cm = dataInd.map(d => d.cm);
    const h = 5 * 1.0;

    return {
      title: { text: 'Slicer Thickness CuSum', left: 'center' },
      tooltip: commonTooltip,
      legend: { data: ['C+', 'C-'], top: '30px' },
      xAxis: { data: dataInd.map(d => d.id) },
      yAxis: {},
      series: [
        { name: 'C+', type: 'line', data: cp },
        { name: 'C-', type: 'line', data: cm },
        { type: 'line', markLine: { data: [{ yAxis: h, label: { formatter: 'h' }, lineStyle: { color: 'red' } }] } }
      ]
    };
  }

  return {};
}

function statsLine(ucl, cl, lcl) {
  return {
    symbol: 'none',
    data: [
      { yAxis: ucl, label: { formatter: 'UCL' }, lineStyle: { color: 'red', type: 'dashed' } },
      { yAxis: cl,  label: { formatter: 'CL' },  lineStyle: { color: 'green', type: 'solid' } },
      { yAxis: lcl, label: { formatter: 'LCL' }, lineStyle: { color: 'red', type: 'dashed' } }
    ]
  };
}

function getCapColor(val) {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return num > 1.33 ? 'text-success' : (num > 1 ? 'text-warning' : 'text-danger');
}
</script>

<style lang="scss" scoped>
.spc-dashboard-pro {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.dashboard-header {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .logo-area {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #0f172a;

      .logo-icon { font-size: 24px; color: #3b82f6; }
      h1 { font-size: 20px; font-weight: 700; margin: 0; }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.chart-select { width: 240px; }

.main-container { flex: 1; overflow: hidden; }

.content-area {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card-container,
.data-log-container,
.stats-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.chart-card-container {
  flex: 2;
  display: flex;
  flex-direction: column;

  .chart-title-bar {
    margin-bottom: 15px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 10px;

    .title-row h2 {
      margin: 0;
      font-size: 18px;
      color: #1e293b;
    }

    .chart-desc {
      margin: 5px 0 0 0;
      font-size: 13px;
      color: #64748b;
    }
  }

  .main-chart-canvas {
    flex: 1;
    min-height: 400px;
    width: 100%;
  }
}

.data-log-container {
  flex: 1;

  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #1e293b;
  }
}

.stats-section {
  .stats-header h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #1e293b;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(140px, 1fr));
    gap: 12px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;

    .label { color: #64748b; font-size: 13px; }
    .value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-weight: 700;
      color: #0f172a;
    }
  }
}

.text-success { color: #22c55e; }
.text-warning { color: #f59e0b; }
.text-danger { color: #ef4444; }
</style>
