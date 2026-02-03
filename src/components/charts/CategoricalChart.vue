<template>
  <div class="categorical-chart-wrapper">
    <QcTrendChart
      v-if="effectiveShowAsTrend && hasTrendData"
      ref="trendChart"
      :chart-title="chartTitle"
      :time-bucketed-data="timeBucketedData"
      :bucket-labels="bucketLabels"
      :bucket-type="bucketType"
      :field-name="fieldName"
      :option-label-to-value-map="optionLabelToValueMap"
      @toggle-mode="toggleChartMode"
      @drilldown="handleDrilldown"
    />
    <QcPieChart
      v-else
      ref="pieChart"
      :chart-title="chartTitle"
      :chart-data="chartData"
      :has-trend-data="hasTrendData"
      :field-name="fieldName"
      :option-label-to-value-map="optionLabelToValueMap"
      @toggle-mode="toggleChartMode"
      @drilldown="handleDrilldown"
    />
  </div>
</template>

<script>
import QcTrendChart from './QcTrendChart.vue';
import QcPieChart from './QcPieChart.vue';

export default {
  name: "CategoricalChart",
  components: {
    QcTrendChart,
    QcPieChart
  },
  props: {
    chartTitle: { type: String, default: "QC Categorical" },
    chartData: { type: Array, required: true },           // Pie data
    timeBucketedData: { type: Array, default: () => [] }, // Trend data
    bucketLabels: { type: Array, default: () => [] },     // Trend labels
    bucketType: { type: String, default: "daily" },
    globalShowAsTrend: { type: Boolean, default: false },
    // Field name (widget name) for drill-down identification
    fieldName: { type: String, default: "" },
  },
  emits: ['drilldown'],
  data() {
    return {
      localShowAsTrend: null, // null = follow global
    };
  },
  computed: {
    effectiveShowAsTrend() {
      return this.localShowAsTrend !== null
        ? this.localShowAsTrend
        : this.globalShowAsTrend;
    },
    hasTrendData() {
      return this.timeBucketedData?.length > 0 && this.bucketLabels?.length > 0;
    },
    // Build map from option label to option value for drill-down
    optionLabelToValueMap() {
      const map = {};
      if (this.timeBucketedData?.length > 0) {
        this.timeBucketedData.forEach(item => {
          map[item.label] = item.value;
        });
      }
      return map;
    }
  },
  watch: {
    // If global toggle changes, reset local override to follow it
    // (Optional: depending on desired UX. If user manually toggled, maybe keep it?
    //  But typically global switch should reset all to be consistent.)
    globalShowAsTrend() {
      this.localShowAsTrend = null;
    }
  },
  methods: {
    toggleChartMode() {
      if (this.localShowAsTrend === null) {
        this.localShowAsTrend = !this.globalShowAsTrend;
      } else {
        this.localShowAsTrend = !this.localShowAsTrend;
      }
    },

    // Expose getChartImage for PDF export
    getChartImage() {
      // Delegate to the currently active child component
      if (this.effectiveShowAsTrend && this.hasTrendData && this.$refs.trendChart) {
        return this.$refs.trendChart.getChartImage();
      } else if (this.$refs.pieChart) {
        return this.$refs.pieChart.getChartImage();
      }
      return "";
    },

    // Handle drilldown events from child chart components
    handleDrilldown(payload) {
      this.$emit('drilldown', payload);
    }
  },
};
</script>

<style scoped>
.categorical-chart-wrapper {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 30px;
}
</style>
