<template>
  <div ref="chartContainer" class="chart"></div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "QcTrendChart",
  props: {
    chartTitle: { type: String, default: "QC Trend" },
    timeBucketedData: { type: Array, required: true }, // [{label, value, counts}]
    bucketLabels: { type: Array, required: true },     // X-axis labels
    bucketType: { type: String, default: "daily" },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.initChart();
    window.addEventListener("resize", this.handleResize);
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
    },

    updateChart() {
      if (!this.chart) return;

      const series = this.timeBucketedData.map(opt => ({
        name: opt.label,
        type: "line",
        data: opt.counts,
        symbol: "circle",
        symbolSize: 6,
        smooth: true,
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
          order: 'valueDesc'
        },
        legend: {
          bottom: 10,
          data: this.timeBucketedData.map(opt => opt.label),
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
          data: this.bucketLabels,
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
  },
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
