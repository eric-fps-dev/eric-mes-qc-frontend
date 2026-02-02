<template>
  <div ref="chartContainer" class="chart"></div>
</template>

<script>
import * as echarts from "echarts";
import { formatDate } from "@/utils/task-center/dateFormatUtils";
import { toRaw } from "vue";

export default {
  name: "QcTrendChart",
  props: {
    chartTitle: { type: String, default: "QC Trend" },
    timeBucketedData: { type: Array, required: true }, // [{label, value, counts}]
    bucketLabels: { type: Array, required: true },     // X-axis labels
    bucketType: { type: String, default: "daily" },
    // Field name for drill-down identification
    fieldName: { type: String, default: "" },
    // Map of option label to option value for drill-down
    optionLabelToValueMap: { type: Object, default: () => ({}) },
  },
  emits: ['toggle-mode', 'drilldown'],
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.initChart();
    window.addEventListener("resize", this.handleResize);
    // Workaround: Trigger restore to fix legend interaction crash
    setTimeout(() => {
      this.chart?.dispatchAction({ type: 'restore' });
    }, 500);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    this.chart?.dispose();
  },
  watch: {
    timeBucketedData: { deep: true, handler: 'updateChart' },
    bucketLabels: { deep: true, handler: 'updateChart' },
  },
  methods: {
    handleResize() {
      this.chart?.resize();
    },

    getChartImage() {
        return this.chart ? this.chart.getDataURL({type: "png", pixelRatio: 2}) : "";
    },

    initChart() {
      this.chart = echarts.init(this.$refs.chartContainer);
      this.updateChart();

      // Add click handler for drill-down on data points
      this.chart.on('click', 'series.line', (params) => {
        const seriesName = params.seriesName; // Option label
        const dataIndex = params.dataIndex;   // Index in bucketLabels
        const bucketLabel = this.bucketLabels[dataIndex];
        const optionValue = this.optionLabelToValueMap[seriesName];

        // Calculate bucket start and end times
        const bucketStart = bucketLabel;
        const bucketEnd = this.calculateBucketEnd(bucketLabel);

        this.$emit('drilldown', {
          chartType: 'trend',
          fieldName: this.fieldName,
          optionLabel: seriesName,
          optionValue,
          bucketStart,
          bucketEnd,
          bucketLabel: this.formatAxisDate(bucketLabel),
          count: params.value,
        });
      });
    },

    calculateBucketEnd(bucketStart) {
      const date = new Date(bucketStart);
      if (isNaN(date.getTime())) return bucketStart;

      switch (this.bucketType) {
        case 'hourly':
          date.setHours(date.getHours() + 1);
          break;
        case 'daily':
          date.setDate(date.getDate() + 1);
          break;
        case 'weekly':
          date.setDate(date.getDate() + 7);
          break;
        default:
          date.setDate(date.getDate() + 1);
      }
      return date.toISOString();
    },

    updateChart() {
      if (!this.chart) return;

      const rawBucketedData = toRaw(this.timeBucketedData) || [];
      const rawBucketLabels = toRaw(this.bucketLabels) || [];

      const series = rawBucketedData.map(opt => ({
        name: opt.label,
        type: "line",
        data: toRaw(opt.counts),
        symbol: "circle",
        symbolSize: 8,
        smooth: true,
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
          symbolSize: 12,
        },
        cursor: 'pointer',
      }));

      const option = {
        title: { text: `${this.chartTitle} - Trend`, left: "center" },
        tooltip: {
          show: true,
          trigger: "axis",
          axisPointer: { type: "line" },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          textStyle: { color: '#333' },
          borderWidth: 1,
          borderColor: '#ccc',
          confine: true,
          order: 'valueDesc',
          formatter: (params) => {
            if (!Array.isArray(params) || params.length === 0) return "";
            const axisValue = params[0]?.axisValue ?? params[0]?.name;
            const formattedTime = this.formatAxisDate(axisValue);
            const lines = [formattedTime];
            params.forEach((p) => {
              const value = p.value ?? "-";
              lines.push(`${p.marker} ${p.seriesName}: ${value}`);
            });
            return lines.join("<br/>");
          },
        },
        legend: {
          bottom: 10,
          data: rawBucketedData.map(opt => opt.label),
        },
        toolbox: {
          show: true,
          right: 20,
          feature: {
            myToggle: {
              show: true,
              title: "Show Pie",
              icon: "path://M12,2 A10,10 0 1,1 2,12 L12,12 Z M12,12 L12,2 A10,10 0 0,1 22,12 Z",
              onclick: () => this.$emit('toggle-mode'),
            },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
        xAxis: {
          type: "category",
          data: rawBucketLabels,
          boundaryGap: false,
          axisLabel: {
            rotate: this.bucketType === "hourly" ? 45 : 0,
            formatter: (value) => {
                try {
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return value;
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');

                    if (this.bucketType === 'hourly') {
                        const h = String(date.getHours()).padStart(2, '0');
                        const min = String(date.getMinutes()).padStart(2, '0');
                        return `${m}-${d} ${h}:${min}`;
                    }
                    return `${m}-${d}`;
                } catch (e) {
                    return value;
                }
            }
          },
        },
        yAxis: { type: "value", name: "Count", minInterval: 1 },
        series,
      };

      this.chart.setOption(option, true); // true = notMerge (clean update)
    },
    formatAxisDate(value) {
      if (!value) return "";
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return String(value);
      return formatDate(parsed.toISOString());
    },
  },
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
