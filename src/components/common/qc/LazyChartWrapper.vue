<template>
  <div ref="container" :style="{ minHeight: shouldRender ? 'auto' : height + 'px' }">
    <slot v-if="shouldRender"></slot>
    <div v-else :style="{ height: height + 'px', padding: '20px', boxSizing: 'border-box' }">
      <el-skeleton :rows="8" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

const props = defineProps({
  height: { type: Number, default: 450 },
  forceRender: { type: Boolean, default: false }
});

const container = ref(null);
const isIntersecting = ref(false);
let observer = null;

const shouldRender = computed(() => props.forceRender || isIntersecting.value);

onMounted(() => {
  if (props.forceRender) {
    isIntersecting.value = true;
    return;
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      isIntersecting.value = true;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
    }
  }, { 
    rootMargin: '300px', // Start loading when within 300px of viewport
    threshold: 0.01 
  });

  if (container.value) {
    observer.observe(container.value);
  }
});

// If forceRender becomes true later (e.g. starting export)
watch(() => props.forceRender, (newVal) => {
  if (newVal) {
    isIntersecting.value = true;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
/* Optional: fade in transition when chart appears */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
