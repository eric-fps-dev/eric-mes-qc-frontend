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
        <template v-if="teamId !== null">
          <FormTree
              ref="formTreeRef"
              :accessByTeam="teamId"
              :userId="store.getters.getUser.id"
              @select-form="selectForm"
              @add-form="addForm"
              @is-deletion="handleDeletion"
          />
        </template>
        <template v-else>
          <el-empty :description="translate('PendingTasks.noPendingTasks')" image-size="120" />
        </template>
      </pane>

      <pane style="padding: 10px">
        <FormDisplay
            v-if="selectedForm && selectedForm.nodeType !== 'folder'"
            :key="formKey"
            :currentForm="selectedForm"
            :usable="true"
            :accessByTeam="1"
            @updateIsDirty="isFormDirty = $event"
            @refreshFormTree="refreshTree"
        />

        <div v-else class="empty-placeholder">
          <el-empty
              :description="translate('PendingTasks.clickFormToView')"
              image-size="200"
          />
        </div>
      </pane>
    </splitpanes>
  </el-container>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import FormTree from '@/components/form-manager/FormTree.vue';
import FormDisplay from '@/components/form-manager/FormDisplay.vue';
import { getTeamByTeamLeadId } from "@/services/teamService";
import store from "@/store";
import { translate } from '@/utils/i18n';

export default {
  name: 'FormManagerSplitLayout',
  components: { Splitpanes, Pane, FormTree, FormDisplay },
  computed: {
    store() {
      return store;
    }
  },
  data() {
    return {
      selectedForm: null,
      teamId: null,
      isFormDirty: false,
      formKey: 0
    };
  },
  methods: {
    getTeamByTeamLeadId,
    translate,
    selectForm(form) {
      if (this.isFormDirty) {
        this.$confirm(
            translate('PendingTasks.unsavedChangesMessage'),
            translate('common.warning'),
            {
              confirmButtonText: translate('PendingTasks.switchButton'),
              cancelButtonText: translate('common.cancel'),
              type: 'warning',
            }
        ).then(() => {
          this.selectedForm = form;
          this.isFormDirty = false;
          this.formKey += 1;
        }).catch(() => {
          // User cancelled
        });
      } else {
        this.selectedForm = form;
        this.formKey += 1;
      }
    },
    addForm() {
      this.selectedForm = {
        widgetList: [],
        formConfig: {},
        qcFormTemplateId: null,
      };
      this.formKey += 1;
    },
    handleDeletion() {
      this.selectedForm = null;
      this.formKey += 1;
    },
    refreshTree() {
      this.$refs.formTreeRef?.reload?.();
    }
  },
  mounted: async function () {
    try {
      const response = await getTeamByTeamLeadId(this.$store.getters.getUser.id);
      this.teamId = response.data.data.id;
      console.log("teamId", this.teamId);
    } catch (err) {
      console.error("Failed to fetch team by lead ID:", err);
    }
  }
};
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
