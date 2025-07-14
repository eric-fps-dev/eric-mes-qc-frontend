<template>
  <!-- TeamLeadershipSelect.vue – multi=FALSE but same API -->
  <el-tree-select
      v-model="local"
      :data="treeWithFlags"
      show-checkbox
      :multiple="false"
      check-strictly
      default-expand-all
      :placeholder="t('userManagement.leadershipTeamsPlaceholder')"
      @update:modelValue="$emit('update:modelValue', local?[local]:[])"
  >
    <!-- add leader name in option -->
    <template #default="{ data }">
      <span>{{ data.label }}</span>
      <span style="float:right;color:#999;font-size:12px">
          {{ data.leader ? `组长: ${data.leader.name}` : '' }}
        </span>
    </template>
  </el-tree-select>
</template>

<script setup>
import {computed, ref, watch} from 'vue'
import {translate as t} from "@/utils/i18n";

const props = defineProps({ modelValue:Array, tree:Array, role: Number, parentMap: Object })
const emit  = defineEmits(['update:modelValue'])
const local = ref(props.modelValue[0] ?? null)

/* 👉 tree with .disabled filled in */
const treeWithFlags = computed(() =>
    markDisabled(props.tree, props.role, props.parentMap)
)
watch(() => props.modelValue,(v) => local.value = v[0] ?? null)

/** util – runs once whenever role OR the tree changes */
function markDisabled(nodes, role, parentMap) {
  return nodes.map(n => {
    const depth = (() => {
      let d = 1, p = parentMap[n.id]
      while (p) { d++; p = parentMap[p] }
      return d
    })()

    // decide once
    let disabled
    switch (role) {
      case 1: disabled = depth !== 1; break        // only tier-1
      case 3: disabled = depth < 2;  break         // tier-2+
      default: disabled = true;     break          // roles 2 & 4
    }

    // clone so we don’t mutate original
    const node = { ...n, disabled }

    if (n.children?.length)
      node.children = markDisabled(n.children, role, parentMap)

    return node
  })
}
</script>
