<template>
  <el-container style="height: 100%;">
    <splitpanes
        class="mes-split"
        style="height: 100%;"
        gutter-size="24"
        gutter-class="mes-gutter"
    >
      <!-- 左侧栏：25% 宽度，最大50% -->
      <pane size="25" max-size="50" min-size="20" class="form-tree-pane">
        <FormTree
            @select-form="selectForm"
            @add-form="addForm"
            @is-deletion="handleDeletion"
        />
      </pane>

      <!-- 右侧主区：剩余空间 -->
      <pane style="padding: 10px">
        <FormDisplay
            v-if="selectedForm && selectedForm.nodeType !== 'folder'"
            :key="formKey"
            :currentForm="selectedForm"
            :usable="false"
            @updateIsDirty="isFormDirty = $event"
        />
        <div v-else class="empty-placeholder">
          <el-empty
              :description="translate('qualityFormManagement.emptyPlaceholder')"
              image-size="200"
          />
        </div>
      </pane>
    </splitpanes>
  </el-container>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import FormTree from '@/components/form-manager/FormTree.vue'
import FormDisplay from '@/components/form-manager/FormDisplay.vue'
import { translate, translateWithParams } from '@/utils/i18n'

export default {
  name: 'FormManagerLayout',
  components: { Splitpanes, Pane, FormTree, FormDisplay },
  data() {
    return {
      selectedForm: null,
      isFormDirty: false,
      formKey: 0
    }
  },
  methods: {
    translate,
    translateWithParams,
    selectForm(form) {
      if (this.isFormDirty) {
        this.$confirm(
            this.translate('qualityFormManagement.unsavedChangesMessage'),
            this.translate('qualityFormManagement.unsavedChangesTitle'),
            {
              confirmButtonText: this.translate('qualityFormManagement.switchButton'),
              cancelButtonText: this.translate('qualityFormManagement.cancelButton'),
              type: 'warning'
            }
        ).then(() => this._switchForm(form))
      } else {
        this._switchForm(form)
      }
    },
    _switchForm(form) {
      this.selectedForm = form
      this.isFormDirty = false
      this.formKey += 1
    },
    addForm() {
      this.selectedForm = {widgetList: [], formConfig: {}, qcFormTemplateId: null}
      this.formKey += 1
    },
    handleDeletion() {
      this.selectedForm = null
      this.formKey += 1
    }
  }
}
</script>

<style scoped>
.mes-split {
  height: 100%;
  display: flex;
  overflow: hidden;
}

.empty-placeholder {
  display: flex;
  justify-content: center;
  margin-top: 40vh;
  transform: translateY(-50%);
}

.form-tree-pane {
  border-right: 2px solid rgba(102, 102, 102, 0.2);
}

:deep(.splitpanes__splitter) {
  background-color: #ccc;
  position: relative;
}

:deep(.splitpanes__splitter)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  transition: opacity 0.4s;
  background-color: #466a9f55;
  opacity: 0;
  z-index: 1;
}

:deep(.splitpanes__splitter):hover::before {
  opacity: 1;
}

:deep(.splitpanes--vertical > .splitpanes__splitter)::before {
  left: -5px;
  right: -5px;
  height: 100%;
}
</style>
