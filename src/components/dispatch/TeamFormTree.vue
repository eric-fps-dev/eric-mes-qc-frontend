<template>
  <div class="search-container">
    <el-input
        v-model="filterText"
        :placeholder="translate('orderManagement.orderFormDialog.searchFormPlaceholder')"
        clearable
        style="margin-right: 10px; height: 32px; max-width: 395px"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    <el-button
        v-if="showOnlySelectedNode === false"
        type="warning"
        @click="clearFormSelection"
        style="height: 32px; width: 80px; line-height: normal; margin: 0"
    >
      {{ translate('orderManagement.orderFormDialog.uncheckAll') }}
    </el-button>
  </div>
  <div class="form-container">
      <el-tree
          ref="treeRef"
          class="qc-tree"
          :data="displayedTreeData"
          node-key="id"
          :props="defaultProps"
          :filter-node-method="filterNode"
          @check-change="handleCheckChange"
          @node-click="handleNodeClicked"
          :show-checkbox="!showOnlySelectedNode"
          :default-expand-all="props.expandAllNodes"
          :empty-text="translate('common.noData')"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node">
            <div :class="['node-content', {'disabled-dark': node.disabled}]">
              <el-icon>
                <Folder v-if="data.nodeType === 'folder'" />
                <Document v-else />
              </el-icon>
              <span class="node-label">{{ data.label }}</span>
            </div>
          </div>
        </template>
      </el-tree>
  </div>
</template>

<script lang="ts" setup>
import {defineEmits, onMounted, ref, watch} from 'vue'
import {ElButton, ElInput, ElTree} from 'element-plus'
import {Document, Folder, Search} from '@element-plus/icons-vue'
import {fetchFormNodes,} from '@/services/formNodeService.js';
import {translate} from "@/utils/i18n";

interface Tree {
  id: string;
  label: string;
  children?: Tree[];
  nodeType: string;
  qcFormTemplateId: string | null;
  disabled: boolean;
}

const props = withDefaults(defineProps<{
  selectedFormIds?: string[];
  allowedFormIds?: string[];
  restrictSelectionToAllowedOnly?: boolean;
  showOnlySelectedNode: boolean;
  expandAllNodes: boolean;
}>(), {
  selectedFormIds: () => [],
  allowedFormIds: () => [],
  restrictSelectionToAllowedOnly: false,
  showOnlySelectedNode: false,
  expandAllNodes: false,
});

const emit = defineEmits(['update-selected-forms','on-node-clicked']);
const filterText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()

// Store raw form tree data from backend
const rawTreeData = ref<Tree[]>([]);

// Data to display in el-tree
const displayedTreeData = ref<Tree[]>([])
const error = ref<string | null>(null)

const defaultProps = {
  children: 'children',
  label: 'label',
};

const fetchFormTreeData = async () => {
  try {
    const response = await fetchFormNodes();
    rawTreeData.value = response.data;
    applyAllowed();
  } catch (err) {
    console.log('Failed to load form tree data', err);
  }
};

// Filter tree by string input
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}

const handleCheckChange = () => {
  const checkedNodes = treeRef.value.getCheckedNodes(false, false);
  const selectedForms = checkedNodes
      .filter(node => node.nodeType === 'document')
      .map(node => ({
        id: node.id,
        label: node.label,
      }));
  emit('update-selected-forms', selectedForms);
};

const handleNodeClicked = (nodeData) => {
  if(nodeData.nodeType == 'document' && nodeData.id) {
    emit("on-node-clicked", nodeData.id);
  }
};

// Clears all selected nodes
const clearFormSelection= () => {
  // clear selectedFormIds
  treeRef.value.setCheckedKeys([]);
  emit('update-selected-forms', []);
};

// Utility to flatten tree recursively
function flattenTree(treeNode) {
  return [treeNode].concat(
      (treeNode.children || []).flatMap(flattenTree)
  );
}

function filterTreeBySelectedIds(tree: Tree[], selectedIds: string[]): Tree[] {
  const result: Tree[] = [];
  for (const node of tree) {
    if (node.children && node.children.length > 0) {
      const filteredChildren = filterTreeBySelectedIds(node.children, selectedIds);

      if (filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        });
      }
    } else {
      if (selectedIds.includes(node.id)) {
        result.push({ ...node });
      }
    }
  }

  return result;
}

function markDisabled(tree: Tree[]): Tree[] {
  const { allowedFormIds } = props          // keep it readable

  /** returns a deep-copied subtree where `.disabled`
   is set on every node (documents & folders) */
  const walk = (nodes: Tree[]): Tree[] => {

      return nodes.map(n => {
        const copy: Tree = { ...n }
        const isDoc   = copy.nodeType === 'document';
        const hasKids = Array.isArray(copy.children) && copy.children.length;

        // If node is a leaf node, it must be a form, and set disabled to false when the id is in the allowed id list
        if (!hasKids) {
          copy.disabled = isDoc ? !(allowedFormIds.includes(copy.id)) : true;
          return copy
        }

        /* ─────────────────────────────  folders  ── */
        copy.children = walk(copy.children);
        /* folder is disabled ⇢ all direct children are disabled */
        copy.disabled = copy.children.every(c => c.disabled);

        return copy
      })
  }

  return walk(tree)
}

function applyAllowed() {
  if (props.restrictSelectionToAllowedOnly) {
    displayedTreeData.value = markDisabled(rawTreeData.value);
  } else {
    displayedTreeData.value = rawTreeData.value;
  }
}

onMounted(async () => {
  await fetchFormTreeData();
  if (props.showOnlySelectedNode != true && treeRef.value) {
    const nodesToCheck = rawTreeData.value
        .flatMap(flattenTree) // Flatten the tree to find all nodes
        .filter(node => props.selectedFormIds.includes(node.id));

    const nodeKeys = nodesToCheck.map(node => node.id);
    treeRef.value.setCheckedKeys(nodeKeys);
  } else {
    displayedTreeData.value = filterTreeBySelectedIds(rawTreeData.value, props.selectedFormIds);
  }
});

watch(
    () => props.selectedFormIds,
    (newVal) => {
      if (treeRef.value) {
        treeRef.value.setCheckedKeys(newVal);
      }

      if (props.showOnlySelectedNode) {
        displayedTreeData.value = filterTreeBySelectedIds(rawTreeData.value, props.selectedFormIds);
      }
    },
    { immediate: true }
);

// Watch for changes in filterText and apply filtering to the tree
watch(filterText, (val) => {
  treeRef.value?.filter(val)
});

watch(
    () => props.allowedFormIds, (val) => {
      applyAllowed()
    },{immediate: true, deep: true}
)

</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.custom-tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.node-content {
  display: flex;
  align-items: center;
}

.node-label {
  margin-left: 8px; /* Add space between the icon and label */
}

.node-actions a {
  margin-left: 8px;
}

.form-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.search-container {
  display: flex;
  justify-content: flex-start; /* Align search box to the right */
  margin-bottom: 10px;
}

.qc-tree {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.disabled-dark {
  opacity: .45;
}
</style>
