<template>
  <div class="spc-dashboard-pro">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="logo-area">
          <el-icon class="logo-icon"><TrendCharts /></el-icon>
          <h1>SPC Analytics</h1>
        </div>
      </div>
      <div class="header-right">
        <el-tag type="success" class="status-badge" effect="dark">SYSTEM NORMAL</el-tag>
      </div>
    </div>

    <!-- Main Layout -->
    <el-container class="main-container">
      <!-- Sidebar Navigation -->
      <el-aside width="250px" class="sidebar">
        <el-menu
          :default-active="activeChart"
          class="el-menu-vertical"
          @select="handleMenuSelect"
          background-color="#1e293b"
          text-color="#94a3b8"
          active-text-color="#38bdf8"
        >
          <el-sub-menu index="variable">
            <template #title>
              <el-icon><DataLine /></el-icon>
              <span>Variable Charts</span>
            </template>
            <el-menu-item index="xbar-r">X-Bar R (Mean & Range)</el-menu-item>
            <el-menu-item index="xbar-s">X-Bar S (Mean & Sigma)</el-menu-item>
            <el-menu-item index="median-r">Median R</el-menu-item>
            <el-menu-item index="imr">I-MR (Individual)</el-menu-item>
            <el-menu-item index="levey">Levey-Jennings</el-menu-item>
            <el-menu-item index="ewma">EWMA</el-menu-item>
            <el-menu-item index="ma">Moving Average (MA)</el-menu-item>
            <el-menu-item index="mamr">MAMR</el-menu-item>
            <el-menu-item index="mams">MAMS</el-menu-item>
            <el-menu-item index="cusum">CuSum</el-menu-item>
          </el-sub-menu>
        </el-menu>

        <!-- Mini Stats in Sidebar -->
        <div class="sidebar-stats" v-if="currentStats">
          <h4>Process Stats (Length)</h4>
          <div class="stat-row">
            <span>Mean:</span> <span class="val">{{ currentStats.mean }}</span>
          </div>
           <div class="stat-row">
            <span>Sigma:</span> <span class="val">{{ currentStats.sigma }}</span>
          </div>
          <div class="stat-row" v-if="currentStats.cp">
            <span>Cp:</span> <span :class="getCapColor(currentStats.cp)">{{ currentStats.cp }}</span>
          </div>
          <div class="stat-row" v-if="currentStats.cpk">
            <span>Cpk:</span> <span :class="getCapColor(currentStats.cpk)">{{ currentStats.cpk }}</span>
          </div>
        </div>
      </el-aside>

      <!-- Main Content -->
      <el-main class="content-area">
        <div class="chart-card-container">
          <div class="chart-title-bar">
            <div class="title-row">
              <h2>{{ chartTitles[activeChart] }}</h2>
            </div>
            <p class="chart-desc">{{ chartDescriptions[activeChart] }}</p>
          </div>

          <div id="mainChart" class="main-chart-canvas"></div>
        </div>

        <!-- Data Table -->
        <div class="data-log-container">
          <h3>Data Log</h3>
          <el-table :data="tableData" style="width: 100%" height="250" size="small" stripe>
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="timestamp" label="Time" width="150" />
            <el-table-column prop="valueStr" label="Values / Counts" />
            <el-table-column prop="calc1" :label="tableLabels.col1" width="120" />
            <el-table-column prop="calc2" :label="tableLabels.col2" width="120" />
            <el-table-column label="Status" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'OOC' ? 'danger' : 'success'" size="small">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import { TrendCharts, DataLine } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

// --- Constants & Config ---
const activeChart = ref('xbar-r');
let chartInstance = null;

const config = ref({
  mean: 80.0,
  stdDev: 2.0,
  n: 5,
  usl: 86.0,
  lsl: 74.0
});

// --- Data Stores ---
// Variable Data (Subgroups)
const varData = ref([]); // { id, timestamp, values: [], mean, range, sigma, median, stdDev }
// Individual Data (Single points)
const indData = ref([]); // { id, timestamp, value, mr }

// --- Metadata ---
const chartTitles = {
  'xbar-r': 'Fry Length Control (X-Bar R)',
  'xbar-s': 'Bag Weight Consistency (X-Bar S)',
  'median-r': 'Oil Temp Median (Median R)',
  'imr': 'Hourly Acidity Check (I-MR)',
  'levey': 'Salt Analyzer Calibration (Levey-Jennings)',
  'ewma': 'Heater Drift Detection (EWMA)',
  'ma': 'Moisture Trend (Moving Avg)',
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

// --- Computed Table Data ---
const tableLabels = computed(() => {
  if (activeChart.value.includes('xbar')) return { col1: 'Mean', col2: 'Range/Sigma' };
  if (activeChart.value.includes('imr')) return { col1: 'Value', col2: 'Moving Range' };
  return { col1: 'Metric 1', col2: 'Metric 2' };
});

const tableData = computed(() => {
  let source = [];
  if (['imr', 'levey', 'cusum', 'ewma'].includes(activeChart.value)) {
    source = indData.value;
  } else {
    source = varData.value;
  }

  return [...source].reverse().slice(0, 50).map(d => ({
    id: d.id,
    timestamp: d.timestamp,
    valueStr: d.values ? `[${d.values.map(v=>v.toFixed(2)).join(', ')}]` : d.value?.toFixed(3),
    calc1: d.mean || d.value,
    calc2: d.range || d.sigma || d.mr,
    status: 'OK' // Mock status for now
  }));
});

const currentStats = computed(() => {
  if (varData.value.length < 2) return null;
  const data = varData.value.slice(-30);
  const allVals = data.flatMap(d => d.values);
  const mean = (allVals.reduce((a,b)=>a+b,0) / allVals.length).toFixed(3);

  const rBar = data.reduce((a,b) => a + parseFloat(b.range), 0) / data.length;
  const d2 = 2.326; // n=5
  const sigmaEst = (rBar / d2).toFixed(3);

  const cp = ((config.value.usl - config.value.lsl) / (6 * sigmaEst)).toFixed(2);
  const cpu = (config.value.usl - mean) / (3 * sigmaEst);
  const cpl = (mean - config.value.lsl) / (3 * sigmaEst);
  const cpk = Math.min(cpu, cpl).toFixed(2);

  return { mean, sigma: sigmaEst, cp, cpk };
});

// --- Watchers ---
watch(activeChart, () => {
  nextTick(renderChart);
});

// --- Life Cycle ---
onMounted(() => {
  // Seed Data
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
  for(let i=0; i<30; i++) {
    generateStep(false); // historical
  }
}

function generateStep(isLiveStep) {
  const id = varData.value.length + 1;
  const time = dayjs().format('HH:mm:ss');

  // 1. Variable Subgroup Generation (Fry Lengths)
  const vals = [];
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  // Add some randomness/drift
  const currentMean = config.value.mean + (Math.sin(id/10) * 0.5);

  for(let j=0; j<config.value.n; j++) {
    // Box-Muller
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const val = currentMean + (z * config.value.stdDev);
    vals.push(val);
    sum += val;
    if(val < min) min = val;
    if(val > max) max = val;
  }

  // Stats for Variable
  const mean = sum / config.value.n;
  const range = max - min;
  // Sigma (Sample Std Dev)
  const meanDiffs = vals.map(v => Math.pow(v - mean, 2));
  const variance = meanDiffs.reduce((a,b)=>a+b,0) / (config.value.n - 1);
  const sigma = Math.sqrt(variance);
  // Median
  const sorted = [...vals].sort((a,b)=>a-b);
  const median = sorted[Math.floor(config.value.n/2)];

  varData.value.push({ id, timestamp: time, values: vals, mean, range, sigma, median });

  // 2. Individual Data (Temperature)
  // Base 175, Drift + Noise
  const tempBase = 175;
  const tempNoise = (Math.random() - 0.5) * 2;
  const indVal = tempBase + tempNoise + (Math.sin(id/20)*2); // Slow drift
  const prevInd = indData.value.length > 0 ? indData.value[indData.value.length-1].value : indVal;
  const mr = Math.abs(indVal - prevInd);

  // EWMA Calcs (Lambda = 0.2)
  const lambda = 0.2;
  const prevEwma = indData.value.length > 0 ? (indData.value[indData.value.length-1].ewma || tempBase) : tempBase;
  const ewma = (lambda * indVal) + ((1-lambda) * prevEwma);

  // CuSum Calcs (Target = 175, k = 0.5)
  const target = 175;
  const k = 0.5 * 1.0;
  const prevCp = indData.value.length > 0 ? (indData.value[indData.value.length-1].cp || 0) : 0;
  const prevCm = indData.value.length > 0 ? (indData.value[indData.value.length-1].cm || 0) : 0;
  const cp = Math.max(0, indVal - (target + k) + prevCp); // C+
  const cm = Math.max(0, (target - k) - indVal + prevCm); // C-

  indData.value.push({ id, timestamp: time, value: indVal, mr, ewma, cp, cm });

  // Trim Arrays
  if (varData.value.length > 100) varData.value.shift();
  if (indData.value.length > 100) indData.value.shift();

  if (isLiveStep) {
    renderChart();
  }
}

// --- Rendering Logic ---
function handleMenuSelect(index) {
  activeChart.value = index;
  // Watcher triggers renderChart
}

function renderChart() {
  const dom = document.getElementById('mainChart');
  if (!dom) return;

  if (!chartInstance) {
    chartInstance = echarts.init(dom);
  }

  const options = getChartOptions(activeChart.value);
  chartInstance.setOption(options, { notMerge: true }); // Clean redraw
}

function getChartOptions(type) {
  const commonTooltip = { trigger: 'axis', axisPointer: { type: 'cross' } };
  const gridDual = [{ top: '10%', height: '35%' }, { top: '55%', height: '35%' }];
  const gridSingle = { top: '10%', bottom: '10%' };

  // Constants (n=5)
  const A2 = 0.577; const D3 = 0; const D4 = 2.114;
  const A3 = 1.427; const B3 = 0; const B4 = 2.089; // For S chart

  const dataVar = varData.value.slice(-30); // Show last 30
  const dataInd = indData.value.slice(-30);
  const labels = dataVar.map(d => d.id);

  // --- Chart Implementations ---

  // 1. X-Bar R
  if (type === 'xbar-r') {
    const xbars = dataVar.map(d => d.mean);
    const ranges = dataVar.map(d => d.range);
    const xbb = xbars.reduce((a,b)=>a+b,0)/xbars.length;
    const rb = ranges.reduce((a,b)=>a+b,0)/ranges.length;

    return {
      title: [{text:'Avg Length (mm)', left:'center'}, {text:'Range (mm)', top:'50%', left:'center'}],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{data: labels}, {data: labels, gridIndex: 1}],
      yAxis: [{min: 70, max: 90}, {gridIndex: 1}],
      series: [
        { name: 'Mean', type: 'line', data: xbars, markLine: statsLine(xbb + A2*rb, xbb, xbb - A2*rb) },
        { name: 'Range', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: ranges, markLine: statsLine(D4*rb, rb, D3*rb) }
      ]
    };
  }

  // 2. X-Bar S
  if (type === 'xbar-s') {
    const xbars = dataVar.map(d => d.mean);
    const sigmas = dataVar.map(d => d.sigma);
    const xbb = xbars.reduce((a,b)=>a+b,0)/xbars.length;
    const sb = sigmas.reduce((a,b)=>a+b,0)/sigmas.length;

    return {
      title: [{text:'Avg Weight (g)', left:'center'}, {text:'Sigma (g)', top:'50%', left:'center'}],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{data: labels}, {data: labels, gridIndex: 1}],
      yAxis: [{}, {gridIndex: 1}],
      series: [
        { name: 'Mean', type: 'line', data: xbars, markLine: statsLine(xbb + A3*sb, xbb, xbb - A3*sb) },
        { name: 'Sigma', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: sigmas, markLine: statsLine(B4*sb, sb, B3*sb) }
      ]
    };
  }

  // 3. Median R
  if (type === 'median-r') {
    const medians = dataVar.map(d => d.median);
    const ranges = dataVar.map(d => d.range);
    // A2 tilde for Median (n=5) is approx 0.691
    const A2Tilde = 0.691;
    const mb = medians.reduce((a,b)=>a+b,0)/medians.length; // Average Median
    const rb = ranges.reduce((a,b)=>a+b,0)/ranges.length;

    return {
      title: [{text:'Median Temp (°C)', left:'center'}, {text:'Range', top:'50%', left:'center'}],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{data: labels}, {data: labels, gridIndex: 1}],
      yAxis: [{}, {gridIndex: 1}],
      series: [
        { name: 'Median', type: 'line', data: medians, markLine: statsLine(mb + A2Tilde*rb, mb, mb - A2Tilde*rb) },
        { name: 'Range', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: ranges, markLine: statsLine(D4*rb, rb, D3*rb) }
      ]
    };
  }

  // 4. I-MR
  if (type === 'imr') {
    const vals = dataInd.map(d => d.value);
    const mrs = dataInd.map(d => d.mr);
    const vb = vals.reduce((a,b)=>a+b,0)/vals.length;
    const mrb = mrs.reduce((a,b)=>a+b,0)/mrs.length;
    const E2 = 2.66; // n=2 (comparing 2 points)

    return {
      title: [{text:'pH Value', left:'center'}, {text:'Moving Range', top:'50%', left:'center'}],
      tooltip: commonTooltip,
      grid: gridDual,
      xAxis: [{data: labels}, {data: labels, gridIndex: 1}],
      yAxis: [{min: 170, max: 180}, {gridIndex: 1}],
      series: [
        { name: 'Value', type: 'line', data: vals, markLine: statsLine(vb + E2*mrb, vb, vb - E2*mrb) },
        { name: 'MR', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: mrs, markLine: statsLine(3.267*mrb, mrb, 0) }
      ]
    };
  }

  // 5. Levey-Jennings
  if (type === 'levey') {
    const vals = dataInd.map(d => d.value);
    const mean = 175; // Target
    const sd = 1.0;

    return {
      title: { text: 'Salt Analyzer Check', left: 'center' },
      tooltip: commonTooltip,
      xAxis: { data: labels },
      yAxis: { max: mean + 4*sd, min: mean - 4*sd },
      series: [{
        type: 'line', data: vals,
        markLine: {
          data: [
            { yAxis: mean, lineStyle: { color: 'green' } },
            { yAxis: mean + 1*sd, lineStyle: { type: 'dashed', color: '#bbb' }, label: { formatter: '+1s'} },
            { yAxis: mean - 1*sd, lineStyle: { type: 'dashed', color: '#bbb' }, label: { formatter: '-1s'} },
            { yAxis: mean + 2*sd, lineStyle: { type: 'dashed', color: 'orange' }, label: { formatter: '+2s'} },
            { yAxis: mean - 2*sd, lineStyle: { type: 'dashed', color: 'orange' }, label: { formatter: '-2s'} },
            { yAxis: mean + 3*sd, lineStyle: { type: 'solid', color: 'red' }, label: { formatter: '+3s'} },
            { yAxis: mean - 3*sd, lineStyle: { type: 'solid', color: 'red' }, label: { formatter: '-3s'} },
          ]
        }
      }]
    };
  }

  // 6. EWMA
  if (type === 'ewma') {
     const ewmaVals = dataInd.map(d => d.ewma);
     const target = 175;
     const lambda = 0.2;
     const sigmaEwma = 1.0 * Math.sqrt(lambda / (2-lambda));

     return {
       title: { text: 'Heater Temp EWMA', left: 'center' },
       tooltip: commonTooltip,
       xAxis: { data: labels },
       yAxis: { min: 170, max: 180 },
       series: [{
         type: 'line', data: ewmaVals,
         markLine: statsLine(target + 3*sigmaEwma, target, target - 3*sigmaEwma)
       }]
     };
  }

  // 7, 8, 9 MA Family
  if (type === 'ma' || type === 'mamr' || type === 'mams') {
      const maVals = [];
      const window = 3;
      const vals = dataVar.map(d => d.mean);
      for(let i=0; i<vals.length; i++) {
          let sub = vals.slice(Math.max(0, i-window+1), i+1);
          maVals.push(sub.reduce((a,b)=>a+b,0)/sub.length);
      }
      return {
        title: { text: 'Moisture Moving Avg', left: 'center' },
        tooltip: commonTooltip,
        xAxis: { data: labels },
        yAxis: { min: 70, max: 90 },
        series: [{ type: 'line', data: maVals, areaStyle: { opacity: 0.1 } }]
      };
  }

  // 10. CuSum
  if (type === 'cusum') {
    const cp = dataInd.map(d => d.cp);
    const cm = dataInd.map(d => d.cm);
    const h = 5 * 1.0;

    return {
      title: { text: 'Slicer Thickness CuSum', left: 'center' },
      tooltip: commonTooltip,
      legend: { data: ['C+', 'C-'], top: '30px' },
      xAxis: { data: labels },
      yAxis: {},
      series: [
        { name: 'C+', type: 'line', data: cp, itemStyle: { color: 'blue' } },
        { name: 'C-', type: 'line', data: cm, itemStyle: { color: 'orange' } },
        { type: 'line', markLine: { data: [{ yAxis: h, label: {formatter: 'h'}, lineStyle: { color: 'red' } }] } }
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
      { yAxis: cl, label: { formatter: 'CL' }, lineStyle: { color: 'green', type: 'solid' } },
      { yAxis: lcl, label: { formatter: 'LCL' }, lineStyle: { color: 'red', type: 'dashed' } }
    ]
  };
}

function getCapColor(val) {
  return val > 1.33 ? 'text-success' : (val > 1 ? 'text-warning' : 'text-danger');
}
</script>

<style lang="scss" scoped>
.spc-dashboard-pro {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.dashboard-header {
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
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
}

.main-container {
  flex: 1;
  overflow: hidden;
}

.sidebar {
  background-color: #1e293b;
  display: flex;
  flex-direction: column;

  .el-menu-vertical {
    border-right: none;
    flex: 1;
  }

  .sidebar-stats {
    padding: 20px;
    background-color: #0f172a;
    color: #e2e8f0;
    border-top: 1px solid #334155;

    h4 { margin: 0 0 15px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }

    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;

      .val { font-weight: bold; font-family: monospace; }
    }
  }
}

.content-area {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  flex: 2;
  display: flex;
  flex-direction: column;

  .chart-title-bar {
    margin-bottom: 15px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 10px;

    .title-row {
      display: flex;
      align-items: center;
      gap: 10px;

      h2 { margin: 0; font-size: 18px; color: #1e293b; }
    }

    .chart-desc { margin: 5px 0 0 0; font-size: 13px; color: #64748b; }
  }

  .main-chart-canvas {
    flex: 1;
    min-height: 400px;
    width: 100%;
  }
}

.data-log-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  flex: 1;

  h3 { margin: 0 0 15px 0; font-size: 16px; color: #1e293b; }
}

.text-success { color: #22c55e; }
.text-warning { color: #f59e0b; }
.text-danger { color: #ef4444; }
</style>
