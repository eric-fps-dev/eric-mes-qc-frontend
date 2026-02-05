<template>
  <div class="qc-charts-container">
    <!-- Global Toggle for Categorical Charts & Chart Filter -->
    <div v-if="hasAnyWidgets" class="global-toggle-container">
      
      <!-- Chart Filter Dropdown -->
      <el-select
        v-model="selectedChartNames"
        multiple
        filterable
        clearable
        collapse-tags
        :placeholder="'Filter charts...'"
        style="width: 300px; margin-right: auto;"
      >
        <el-option
          v-for="opt in chartOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <span v-if="pieChartWidgets.length > 0" class="toggle-label">Categorical Chart View:</span>
      <el-switch
        v-if="pieChartWidgets.length > 0"
        v-model="globalShowAsTrend"
        active-text="Trend"
        inactive-text="Pie"
        :disabled="!hasAnyTrendData"
      />
    </div>

    <!-- Line Charts (numeric data - unchanged) -->
    <LazyChartWrapper
      v-for="(widget, index) in lineChartWidgets"
      v-show="isChartSelected(widget.name)"
      :key="`line-lazy-${widget.name}-${index}`"
      :forceRender="forceRender"
    >
      <LineChart
        :chart-title="widget.label"
        :xaxis-data="widget.xaxisData"
        :chart-data="widget.chartData"
        :ref="el => setLineChartRef(el, index)"
      />
    </LazyChartWrapper>

    <!-- Categorical Charts (pie or trend) -->
    <LazyChartWrapper
      v-for="(widget, index) in pieChartWidgets"
      v-show="isChartSelected(widget.name)"
      :key="`cat-lazy-${widget.name}-${index}`"
      :forceRender="forceRender"
    >
      <CategoricalChart
        :chart-title="widget.label"
        :chart-data="widget.chartData"
        :time-bucketed-data="widget.timeBucketedData"
        :bucket-labels="widget.bucketLabels"
        :bucket-type="widget.bucketType"
        :global-show-as-trend="globalShowAsTrend"
        :field-name="widget.name"
        :ref="el => setPieChartRef(el, index)"
        @drilldown="handleDrilldown($event, widget)"
      />
    </LazyChartWrapper>
  </div>
</template>

<script setup>
import { ref, inject, computed, defineEmits, watch, nextTick } from 'vue';
import LineChart from '@/components/charts/line001.vue';
import CategoricalChart from '@/components/charts/CategoricalChart.vue';
import LazyChartWrapper from './LazyChartWrapper.vue';

const props = defineProps({
  lineChartWidgets: { type: Array, default: () => [] },
  pieChartWidgets: { type: Array, default: () => [] },
  forceRender: { type: Boolean, default: false },
});

const emit = defineEmits(['drilldown']);

const lineChartRefs = inject('lineChartRefs');
const pieChartRefs = inject('pieChartRefs');

const globalShowAsTrend = ref(true);
const selectedChartNames = ref([]);

// Clear refs when widgets change to avoid calling resize on stale/disposed components
watch(() => props.lineChartWidgets, () => {
  if (lineChartRefs) lineChartRefs.length = 0;
}, { deep: false });

watch(() => props.pieChartWidgets, () => {
  if (pieChartRefs) pieChartRefs.length = 0;
}, { deep: false });

// Trigger resize when filter changes or trend toggle changes
watch([selectedChartNames, globalShowAsTrend], () => {
  nextTick(() => {
    resizeAllCharts();
  });
});

function resizeAllCharts() {
  if (lineChartRefs && lineChartRefs.length) {
    lineChartRefs.forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }
  if (pieChartRefs && pieChartRefs.length) {
    pieChartRefs.forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }
}

const hasAnyWidgets = computed(() => {
  return (props.lineChartWidgets && props.lineChartWidgets.length > 0) || 
         (props.pieChartWidgets && props.pieChartWidgets.length > 0);
});

const hasAnyTrendData = computed(() => {
  return props.pieChartWidgets?.some(
    w => w.timeBucketedData?.length > 0 && w.bucketLabels?.length > 0
  );
});

const chartOptions = computed(() => {
  const options = [];
  if (props.lineChartWidgets) {
    props.lineChartWidgets.forEach(w => options.push({ label: w.label, value: w.name }));
  }
  if (props.pieChartWidgets) {
    props.pieChartWidgets.forEach(w => options.push({ label: w.label, value: w.name }));
  }
  return options;
});

function isChartSelected(name) {
  if (selectedChartNames.value.length === 0) return true;
  return selectedChartNames.value.includes(name);
}

function setLineChartRef(el, index) {
  if (lineChartRefs) lineChartRefs[index] = el;
}

function setPieChartRef(el, index) {
  if (pieChartRefs) pieChartRefs[index] = el;
}

function handleDrilldown(payload, widget) {
  // Enrich the payload with widget label for display purposes
  emit('drilldown', {
    ...payload,
    fieldLabel: widget.label,
  });
}
</script>

<style scoped>
.qc-charts-container {
  width: 100%;
}

.global-toggle-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.toggle-label {
  font-size: 14px;
  color: #606266;
}
</style>