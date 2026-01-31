<template>
  <div ref="chartContainer" class="chart"></div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "QcPieChart",
  props: {
    chartTitle: { type: String, default: "QC Pie" },
    chartData: { type: Array, required: true },
    hasTrendData: { type: Boolean, default: false },
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
    chartData: { deep: true, handler: 'updateChart' },
    hasTrendData: { handler: 'updateChart' },
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

      const option = {
        title: { text: this.chartTitle, left: "center" },
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: { top: "10%", orient: "vertical", left: "left" },
        toolbox: {
          show: true,
          right: 20,
          feature: {
            myToggle: {
              show: this.hasTrendData,
              title: "Show Trend",
              icon: "path://M4,4 L4,20 M4,20 L20,20 M6,16 L10,10 L14,14 L18,8",
              onclick: () => this.$emit('toggle-mode'),
            },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        series: [{
          name: "Distribution",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
          label: { show: false, position: "center" },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: "bold" }
          },
          labelLine: { show: false },
          data: this.chartData,
        }],
      };

      this.chart.setOption(option, true);
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
