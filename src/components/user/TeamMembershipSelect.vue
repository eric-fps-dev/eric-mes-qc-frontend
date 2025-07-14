<template>
  <!-- TeamMembershipSelect.vue – multi-select -->
  <el-tree-select
      v-model="internal"
      :data="treeWithFlags"
      multiple
      show-checkbox
      check-strictly
      default-expand-all
      :placeholder="t('userManagement.membershipTeamsPlaceholder')"
      @update:modelValue="$emit('update:modelValue', $event)"
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
import {computed} from "vue";
import {translate as t} from "@/utils/i18n";

const props = defineProps({
  modelValue: Array,
  tree: Array,
  role: Number,
  parentMap: Object
})

const emit = defineEmits(['update:modelValue'])

/* two-way binding wrapper ----------------------------------------- */
const internal = computed({
  get: () => props.modelValue,
  set: v  => emit('update:modelValue', v)
})

/* 👉 tree with .disabled filled in */
const treeWithFlags = computed(() =>
    markDisabled(props.tree, props.role, props.parentMap)
)

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
      case 1:                       // supervisor
      case 4: disabled = true; break
      case 3: disabled = depth !== 1
      ; break
      case 2: disabled = false;     break
    }

    // clone so we don’t mutate original
    const node = { ...n, disabled }

    if (n.children?.length)
      node.children = markDisabled(n.children, role, parentMap)

    return node
  })
}

</script>
