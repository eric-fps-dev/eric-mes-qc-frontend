<template>
  <transition name="fade">
    <div v-if="props.visible" class="download-progress-container">
      <el-card class="progress-card" shadow="hover">
        <div class="progress-title">{{ titleText }}</div>
        <el-progress
            :percentage="percentage"
            status="success"
            :text-inside="true"
            :stroke-width="18"
        ></el-progress>
<!--        <div v-if="props.current >= props.total" class="progress-done">导出完成！</div>-->
      </el-card>
    </div>
  </transition>
</template>

<script setup>
import {computed, reactive, ref, watch} from 'vue'
import {translate} from "@/utils/i18n";
const titleText = ref(translate('QcSummary.exportingText') + '...')
const props = defineProps({
  visible: Boolean,
  current: Number,
  total: Number
})

const percentage = computed(() => {
  if (!props.total) return 0
  return Math.min(100, Math.round((props.current / props.total) * 100))
})

watch(() => [props.current, props.total], ([cur, tot]) => {
  if (cur < tot) {
    titleText.value = translate('QcSummary.exportingText')  + ` ${cur}/${tot}`
  } else if (cur === tot && cur !== 0) {
    setTimeout(() => {
      titleText.value = translate('QcSummary.aiGenerationText')
    }, 500)
  }
}, { immediate: true })

</script>

<style scoped>
.download-progress-container {
  position: fixed;
  bottom: 30px;
  left: 57%;
  transform: translateX(-50%);
  z-index: 9999;
}

.progress-card {
  width: 260px;
  padding: 14px;
  background-color: rgba(128, 128, 128, 0.6);
  color: white;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
}

.progress-title {
  margin-bottom: 10px;
  font-weight: bold;
}

.progress-done {
  margin-top: 10px;
  color: rgba(103, 194, 58, 0.7);
  font-weight: bold;
  text-align: center;
}
</style>
