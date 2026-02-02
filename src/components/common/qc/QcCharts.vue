<template>
  <div class="qc-charts-container">
    <!-- Global Toggle for Categorical Charts -->
    <div v-if="pieChartWidgets.length > 0" class="global-toggle-container">
      <span class="toggle-label">Categorical Chart View:</span>
      <el-switch
        v-model="globalShowAsTrend"
        active-text="Trend"
        inactive-text="Pie"
        :disabled="!hasAnyTrendData"
      />
    </div>

    <!-- Line Charts (numeric data - unchanged) -->
    <LineChart
      v-for="(widget, index) in lineChartWidgets"
      :key="`line-${widget.name}-${index}`"
      :chart-title="widget.label"
      :xaxis-data="widget.xaxisData"
      :chart-data="widget.chartData"
      :ref="el => setLineChartRef(el, index)"
    />

    <!-- Categorical Charts (pie or trend) -->
    <CategoricalChart
      v-for="(widget, index) in pieChartWidgets"
      :key="`cat-${widget.name}-${index}`"
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
  </div>
</template>

<script setup>
import { ref, inject, computed, defineEmits } from 'vue';
import LineChart from '@/components/charts/line001.vue';
import CategoricalChart from '@/components/charts/CategoricalChart.vue';

const props = defineProps({
  lineChartWidgets: { type: Array, default: () => [] },
  pieChartWidgets: { type: Array, default: () => [] },
});

const emit = defineEmits(['drilldown']);

const lineChartRefs = inject('lineChartRefs');
const pieChartRefs = inject('pieChartRefs');

const globalShowAsTrend = ref(true);

const hasAnyTrendData = computed(() => {
  return props.pieChartWidgets?.some(
    w => w.timeBucketedData?.length > 0 && w.bucketLabels?.length > 0
  );
});

function setLineChartRef(el, index) {
  if (el) lineChartRefs[index] = el;
}

function setPieChartRef(el, index) {
  if (el) pieChartRefs[index] = el;
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