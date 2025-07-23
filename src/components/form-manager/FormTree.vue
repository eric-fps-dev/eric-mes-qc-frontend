<template>
  <div class="custom-tree-container">
    <div class="toolbar">
      <el-input
          v-model="filterText"
          style="width: 240px; margin-right: 10px;"
          :placeholder="translate('FormTree.searchPlaceholder')"
      />
      <el-button
          v-if="!props.accessByTeam"
          :type="isEditMode ? 'success' : 'primary'"
          @click="toggleEditMode"
          style="margin-top: 0"
      >
        {{ isEditMode ? translate('FormTree.cancelEdit') : translate('FormTree.edit') }}
      </el-button>
      <el-button v-if="isEditMode" type="primary" @click="showAppendPopup(null, $event)" style="margin-left: 10px; margin-top: 0">
        {{ translate('FormTree.addRoot') }}
      </el-button>
    </div>

    <!-- template：root-zone 事件统一加 .stop，阻断冒泡 -->
    <div
        v-if="isEditMode"
        class="drop-to-root-zone"
        @dragenter.stop="onDragEnterRootZone"
        @dragover.stop.prevent
        @dragleave.stop="onDragLeaveRootZone"
        @drop.stop.prevent="handleDropToRoot"
    >
    <el-text type="info" style="font-size: 13px;">
      {{ translate('FormTree.dragToRootZone') }}
    </el-text>
  </div>
    <el-scrollbar :height="scrollbarHeight">
      <el-tree
          ref="treeRef"
          style="max-width: 600px"
          :data="data"
          node-key="_id"
          default-expand-all
          :props="defaultProps"
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
          :empty-text="translate('FormTree.emptyTreeText')"
          :draggable="isEditMode"
          :allow-drop="allowDrop"
          @node-drop="handleDrop"
          @node-drag-start="handleDragStart"
      >
        <template #default="{ node, data }">
          <div class="custom-tree-node" @click="logNodeData(node, data)">
            <div class="node-content">
              <el-icon style="margin-right: 5px;">
                <Folder v-if="data.nodeType === 'folder'" />
                <Document v-else />
              </el-icon>
              <el-text style="max-width: 40vw;" truncated>
                {{ data.label }}
              </el-text>
              <el-text
                  v-if="showDraft(data)"
                  type="warning"
                  style="margin-left: 6px; font-size: 13px;"
              >
                ({{ translate('FormTree.draftIndicator') }})
              </el-text>
            </div>
            <div class="node-actions" v-if="isEditMode">
              <a v-if="data.nodeType === 'folder'" @click="showAppendPopup(data, $event)" style="color: #3f9dfd; cursor: pointer;">{{ translate('FormTree.add') }}
              </a>
              <a @click="showDeleteConfirmation(node, data, $event)" style="color: #fb8080; cursor: pointer; margin-left: 8px;">{{ translate('FormTree.delete') }}
              </a>
            </div>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>

    <el-alert
        v-if="error"
        title="Error"
        type="error"
        :description="error"
        show-icon
    />

    <!-- Delete Confirmation Dialog -->
    <el-dialog v-model="deleteDialogVisible" :title="translate('FormTree.delete')" width="30%">
      <span>{{ translate('FormTree.deleteConfirmContent') }} <strong>{{ nodeToDelete?.nodeData.label }}</strong>?</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">{{ translate('FormTree.cancel') }}</el-button>
          <el-button type="danger" @click="confirmDelete">{{ translate('FormTree.delete') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Append Node Dialog -->
    <el-dialog v-model="appendDialogVisible" :title="translateWithParams('FormTree.appendDialogTitle', { parent: parentDataToAppend?.label || 'Root' })"
               width="30%">
      <el-input v-model="newNodeLabel" :placeholder="translate('FormTree.namePlaceholder')" style="margin-bottom: 10px;" />
      <el-select v-model="newNodeType" :placeholder="translate('FormTree.typePlaceholder')">
        <el-option :label="translate('FormTree.type.folder')" value="folder" />
        <el-option :label="translate('FormTree.type.document')" value="document" :disabled="true"/>
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="appendDialogVisible = false">{{ translate('FormTree.cancel') }}</el-button>
          <el-button type="primary" @click="confirmAppend">{{ translate('FormTree.add') }}</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, defineEmits } from 'vue'
import {ElTree, ElAlert, ElButton, ElDialog, ElInput, ElMessage} from 'element-plus'
import { Folder, Document } from '@element-plus/icons-vue'
import {translate, translateWithParams} from "@/utils/i18n";
import {
  fetchFormNodes,
  addTopLevelNode,
  addChildNode,
  deleteNode,
} from '@/services/formNodeService.js';
import { defineProps } from 'vue';
import { getFormTreeByTeam } from '@/services/teamFormService';
import { loadFormDraftForUser } from '@/utils/formDraftStorage'
import { moveFormNode } from '@/services/formNodeService.js';
import { ElMessageBox } from 'element-plus'

interface Tree {
  _id: string
  label: string
  children?: Tree[]
}

const props = defineProps<{
  accessByTeam?: number;
  userId?: number;
}>();

const logNodeData = (node: any, data: any) => {
  console.log('Node:', node)
  console.log('Data:', data)
}

const filterText = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()
const data = ref<Tree[]>([])
const error = ref<string | null>(null)
const isEditMode = ref(false)

const deleteDialogVisible = ref(false)
const appendDialogVisible = ref(false)
const nodeToDelete = ref<{ node: any; nodeData: Tree } | null>(null)
const parentDataToAppend = ref<Tree | null>(null)
const newNodeLabel = ref('')
const newNodeType = ref('folder') // Default to folder
const emit = defineEmits(['select-form', 'is-deletion']);
const draggingNodeDataRef = ref(null)
const draggingToRootZone = ref(false)
const droppedToRoot = ref(false)
const onDragEnterRootZone = () => { draggingToRootZone.value = true }
const onDragLeaveRootZone = () => { draggingToRootZone.value = false }
const scrollbarHeight = ref('');

let isMsgBoxOpen = false
const _confirm = ElMessageBox.confirm

ElMessageBox.confirm = function (...args) {
  if (isMsgBoxOpen) {
    // 如果已有弹窗正在显示，就直接返回一个拒绝的 Promise
    return Promise.reject('已有确认框打开')
  }
  isMsgBoxOpen = true
  // 调用原始的 confirm
  const p = _confirm.apply(this, args)
  // 无论点“确定”还是“取消”，都要在 finally 把锁打开
  p.finally(() => {
    isMsgBoxOpen = false
  })
  return p
}

const updateScrollbarHeight = () => {
  const offset = isEditMode.value ? 125 : 70;
  scrollbarHeight.value = `${window.innerHeight - offset}px`;
};

watch(isEditMode, () => {
  updateScrollbarHeight();
});

onMounted(() => {
  window.addEventListener('resize', updateScrollbarHeight);
  updateScrollbarHeight(); // Initialize height
});

const defaultProps = {
  children: 'children',
  label: 'label',
}

const handleNodeClick = (nodeData) => {
  emit('select-form', nodeData); // Emit the full node data to the parent
};

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (isEditMode.value) {
    ElMessage.info(translate('FormTree.editModeMessage'))
  }
}

// Fetch data from the backend
const fetchFormTreeData = async () => {
  try {
    const response = props.accessByTeam !== undefined
        ? await getFormTreeByTeam(props.accessByTeam)
        : await fetchFormNodes();

    data.value = props.accessByTeam !== undefined
        ? response.data.data
        : response.data;

  } catch (err) {
    error.value = err.response?.data?.message || translate('FormTree.loadFailed');
  }
};

const reload = async () => {
  await fetchFormTreeData()
  if (filterText.value) {
    treeRef.value?.filter(filterText.value)
  }
}
defineExpose({ reload });

onMounted(fetchFormTreeData)

// Watch for changes in filterText and apply filtering to the tree
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

// Filter function for tree nodes
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}

// Show the delete confirmation dialog
const showDeleteConfirmation = (node: any, nodeData: Tree, event) => {
  event.stopPropagation()
  nodeToDelete.value = { node, nodeData }
  deleteDialogVisible.value = true
}

// Confirm deletion of the node
const confirmDelete = async () => {
  if (!nodeToDelete.value) return;
  const { node, nodeData } = nodeToDelete.value;
  try {
    await deleteNode(nodeData.id);
    emit('is-deletion');
    const parent = node.parent;
    const children = parent.data.children || parent.data;
    const index = children.findIndex((d) => d.id === nodeData.id);
    children.splice(index, 1);
    data.value = [...data.value];
    deleteDialogVisible.value = false;
    ElMessage.success(translate('FormTree.deleteSuccess'))
  } catch (err) {
    error.value = err.response?.data?.message || translate('FormTree.deleteFailed');
    deleteDialogVisible.value = false;
  }
};

// Show the append dialog
const showAppendPopup = (parentData: Tree | null, event) => {
  event.stopPropagation();
  parentDataToAppend.value = parentData
  newNodeLabel.value = ''
  appendDialogVisible.value = true
}

// Confirm appending a new child node
const confirmAppend = async () => {
  // no empty string allowed
  if (!newNodeLabel.value.trim()) {
    ElMessage.warning(translate('FormTree.nameRequired'));
    return;
  }

  // check for duplicate names
  const isDuplicate = (parentDataToAppend.value ? parentDataToAppend.value.children : data.value)
      ?.some(node => node.label === newNodeLabel.value);

  // 深度搜索整个树结构，检查是否有重复 label
  const deepSearchDuplicate = (nodes, label) => {
    for (const node of nodes) {
      if (node.label === label) return true;
      if (node.children && deepSearchDuplicate(node.children, label)) return true;
    }
    return false;
  };

  // 使用深度搜索检查整个树
  const hasDuplicate = isDuplicate || deepSearchDuplicate(data.value, newNodeLabel.value);

  if (hasDuplicate) {
    ElMessageBox.confirm(
        translate('FormTree.duplicateWarningMessage'),
        translate('FormTree.duplicateWarningTitle'),
        {
          confirmButtonText: translate('FormTree.duplicateContinue'),
          cancelButtonText: translate('FormTree.duplicateCancel'),
          type: 'warning'
        }
    )
    return;
  }

  await proceedWithNodeCreation();
};

const proceedWithNodeCreation = async () => {
  try {
    let newNode = {
      label: newNodeLabel.value,
      nodeType: newNodeType.value,
      children: newNodeType.value === 'folder' ? [] : undefined,
      qcFormTemplateId: newNodeType.value === 'document' ? '' : undefined,
    };

    let response;

    if (!parentDataToAppend.value) {
      response = await addTopLevelNode(newNode); // Add root-level node
    } else {
      response = await addChildNode(newNode, parentDataToAppend.value.id); // Add child node
    }

    const createdNode = response.data;

    if (!parentDataToAppend.value) {
      data.value.push(createdNode);
    } else {
      if (!parentDataToAppend.value.children) {
        parentDataToAppend.value.children = [];
      }
      parentDataToAppend.value.children.push(createdNode);
    }

    data.value = [...data.value];
    appendDialogVisible.value = false;
    ElMessage.success(translate('FormTree.addSuccess'))
  } catch (err) {
    error.value = err.response?.data?.message || translate('FormTree.addFailed')
    appendDialogVisible.value = false;
  }
};

const showDraft = (data) => {
  if (props.accessByTeam === undefined || !props.userId || data.nodeType === 'folder') return false;

  const formId = data.qcFormTemplateId;
  if (!formId) return false;

  const draft = loadFormDraftForUser(props.userId, formId);
  return !!draft;
};

const allowDrop = (draggingNode, dropNode, type) => {
  if (draggingToRootZone.value) return false          // 彻底禁用
  return dropNode && dropNode.data.nodeType === 'folder' && type === 'inner'
}

const getColoredLabel = (nodeData: { label: string; nodeType?: string; data?: { nodeType: string } }) => {
  const name = nodeData.label
  // 如果 nodeData.nodeType 不存在，就去取 nodeData.data.nodeType
  const type = nodeData.nodeType ?? nodeData.data?.nodeType
  const isForm = type === 'document'
  const label = isForm
      ? `${name}（${translate('FormTree.qcForm')}）`
      : `${name}（${translate('FormTree.folder')}）`
  const color = isForm
      ? 'var(--el-color-primary)'
      : 'var(--el-color-warning)'
  return `<span style="color: ${color}">${label}</span>`
}

const handleDrop = async (draggingNode, dropNode, dropType) => {
  if (draggingToRootZone.value) {
    // This drop will be handled by `handleDropToRoot`
    draggingToRootZone.value = false;
    return;
  }
  if (dropType !== 'inner') return; // only allow moving into folders

  const draggedLabel = getColoredLabel(draggingNode)
  const dropLabel = getColoredLabel(dropNode)

  try {
    await ElMessageBox.confirm(
        translateWithParams('FormTree.moveConfirmMessage', { source: draggedLabel, target: dropLabel }),
        translate('FormTree.moveConfirmTitle'),
        {
          confirmButtonText: translate('FormTree.confirmButton'),
          cancelButtonText: translate('common.cancel'),
          type: 'warning',
          dangerouslyUseHTMLString: true,
        }
    )

    // User confirmed: proceed to move
    await moveFormNode(draggingNode.data.id, dropNode.data.id)
    ElMessage.success(translate('FormTree.nodeMoved'))
    await reload()
  } catch (e) {
    // User clicked cancel or closed dialog — do nothing
    console.log(translate('FormTree.userCancelledMove'))
    await reload()
  }
}

const handleDragStart = (node, event) => {
  draggingNodeDataRef.value = node.data
}

const handleDropToRoot = async (event: DragEvent) => {
  event.stopPropagation()
  draggingToRootZone.value = false; // Reset after drop
  const draggingNodeData = draggingNodeDataRef.value;
  if (!draggingNodeData) return;

  try {
    await ElMessageBox.confirm(
        translateWithParams('FormTree.moveToRootConfirmMessage', { source: getColoredLabel(draggingNodeData) }),
        translate('FormTree.moveConfirmTitle'),
        {
          confirmButtonText: translate('FormTree.confirmButton'),
          cancelButtonText: translate('common.cancel'),
          type: 'warning',
          dangerouslyUseHTMLString: true,
        }
    )

    await moveFormNode(draggingNodeData.id, 'root');
    droppedToRoot.value = true;
    ElMessage.success(translate('FormTree.setAsTopLevel'));
    await reload();
  } catch (e) {
    console.log(translate('FormTree.userCancelledSetTopLevel'));
    await reload();
  }
};

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

.drop-to-root-zone {
  border: 2px dashed var(--el-color-info);
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  margin-bottom: 16px; /* increase spacing from the tree */
  margin-right: 10px;
  cursor: move;
  height: 20px; /* was 20px */
  background-color: rgba(240, 248, 255, 0.6); /* light hint background */
}

.drop-to-root-zone.dragging-over {
  background-color: #ecf5ff;
  border-color: var(--el-color-primary);
}

</style>
