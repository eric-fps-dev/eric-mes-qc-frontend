<!--<template>-->
<!--  <el-form label-position="left" label-width="120px" class="task-details">-->
<!--    <div class="details-header">-->
<!--      &lt;!&ndash; Action Buttons &ndash;&gt;-->
<!--      <el-button-group>-->
<!--        <el-button-->
<!--            type="primary"-->
<!--            :disabled="false"-->
<!--            @click="showDevelopmentPopup"-->
<!--        >-->
<!--          {{ translate("TaskDetail.viewSubmissionLog") }}-->
<!--        </el-button>-->
<!--&lt;!&ndash;        <el-button&ndash;&gt;-->
<!--&lt;!&ndash;            type="info"&ndash;&gt;-->
<!--&lt;!&ndash;            :disabled="true"&ndash;&gt;-->
<!--&lt;!&ndash;            class="forbidden-button"&ndash;&gt;-->
<!--&lt;!&ndash;            @click="$emit('edit')"&ndash;&gt;-->
<!--&lt;!&ndash;        >&ndash;&gt;-->
<!--&lt;!&ndash;          编辑&ndash;&gt;-->
<!--&lt;!&ndash;        </el-button>&ndash;&gt;-->
<!--&lt;!&ndash;        <el-button&ndash;&gt;-->
<!--&lt;!&ndash;            type="info"&ndash;&gt;-->
<!--&lt;!&ndash;            :disabled="true"&ndash;&gt;-->
<!--&lt;!&ndash;            class="forbidden-button"&ndash;&gt;-->
<!--&lt;!&ndash;            @click="$emit('delete')"&ndash;&gt;-->
<!--&lt;!&ndash;        >&ndash;&gt;-->
<!--&lt;!&ndash;          删除&ndash;&gt;-->
<!--&lt;!&ndash;        </el-button>&ndash;&gt;-->
<!--      </el-button-group>-->

<!--    </div>-->

<!--    <el-form-item :label="translate('TaskDetail.taskName')">-->
<!--      {{ task.name || translate('TaskDetail.unnamedTask') }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.description')">-->
<!--      {{ task.description || translate('TaskDetail.noDescription') }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.dispatchPlanId')">-->
<!--      {{ task.dispatch_id || "N/A" }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.formName')">-->
<!--      {{ getFormNameById(task.qc_form_tree_node_id) }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.formId')">-->
<!--      {{ task.qc_form_tree_node_id }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.assignee')">-->
<!--      {{ getUserById(task.user_id)?.name || "N/A" }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.dispatchTime')">-->
<!--      {{ formatDate(task.dispatch_time) }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.taskStatus')">-->
<!--      <el-tag :type="stateTagType(task.dispatched_task_state_id)">-->
<!--        {{ stateName(task.dispatched_task_state_id) }}-->
<!--      </el-tag>-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.notes')">-->
<!--      {{ task.notes || "-" }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.createdAt')">-->
<!--      {{ formatDate(task.created_at) }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.createdBy')">-->
<!--      {{ task.created_by || "N/A" }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.updatedAt')">-->
<!--      {{ formatDate(task.updated_at) }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.updatedBy')">-->
<!--      {{ task.updated_by || "N/A" }}-->
<!--    </el-form-item>-->

<!--    <el-form-item :label="translate('TaskDetail.dueDate')">-->
<!--      {{ formatDate(task.due_date) }}-->
<!--    </el-form-item>-->

<!--&lt;!&ndash;    <el-form-item label="是否逾期">&ndash;&gt;-->
<!--&lt;!&ndash;      <el-tag :type="task.is_overdue ? 'danger' : 'success'">&ndash;&gt;-->
<!--&lt;!&ndash;        {{ task.is_overdue ? "是" : "否" }}&ndash;&gt;-->
<!--&lt;!&ndash;      </el-tag>&ndash;&gt;-->
<!--&lt;!&ndash;    </el-form-item>&ndash;&gt;-->

<!--    <el-form-item :label="translate('TaskDetail.finishTime')">-->
<!--      {{ formatDate(task.finished_at) || translate("TaskDetail.notFinished") }}-->
<!--    </el-form-item>-->

<!--    &lt;!&ndash; Additional dispatch details: Test Subjects &ndash;&gt;-->
<!--    <el-form-item :label="translate('TaskDetail.testSubject')" v-if="dispatch && dispatch.testSubjectDetails && dispatch.testSubjectDetails.length">-->
<!--      <div class="tags">-->
<!--        <el-tag v-for="testSubject in dispatch.testSubjectDetails"-->
<!--                :key="testSubject.id"-->
<!--                type="info"-->
<!--                size="small">-->
<!--          <el-popover effect="light" trigger="hover" placement="top" width="auto">-->
<!--            <template #default>-->
<!--              <div>{{ translate('TaskDetail.popover.id') }}: {{ testSubject.id }}</div>-->
<!--              <div v-if="testSubject.description">{{ translate('TaskDetail.popover.description') }}: {{ testSubject.description }}</div>-->
<!--              <div v-if="testSubject.status">{{ translate('TaskDetail.popover.status') }}: {{ testSubject.status }}</div>-->
<!--              <div v-if="testSubject.created_by">{{ translate('TaskDetail.popover.createdBy') }}: {{ testSubject.created_by }}</div>-->
<!--              <div v-if="testSubject.created_at">{{ translate('TaskDetail.popover.createdAt') }}: {{ formatDate(testSubject.created_at) }}</div>-->
<!--              <div v-if="testSubject.updated_by">{{ translate('TaskDetail.popover.updatedBy') }}: {{ testSubject.updated_by }}</div>-->
<!--              <div v-if="testSubject.updated_at">{{ translate('TaskDetail.popover.updatedAt') }}: {{ formatDate(testSubject.updated_at) }}</div>-->
<!--            </template>-->
<!--            <template #reference>-->
<!--              {{ testSubject.name }}-->
<!--            </template>-->
<!--          </el-popover>-->
<!--        </el-tag>-->
<!--      </div>-->
<!--    </el-form-item>-->

<!--    &lt;!&ndash; Additional dispatch details: Sampling Locations &ndash;&gt;-->
<!--    <el-form-item :label="translate('TaskDetail.samplingLocation')" v-if="dispatch && dispatch.samplingLocationDetails && dispatch.samplingLocationDetails.length">-->
<!--      <div class="tags">-->
<!--        <el-tag v-for="samplingLocation in dispatch.samplingLocationDetails"-->
<!--                :key="samplingLocation.id"-->
<!--                type="info"-->
<!--                size="small"-->
<!--                effect="light">-->
<!--          <el-popover effect="light" trigger="hover" placement="top" width="auto">-->
<!--            <template #default>-->
<!--              <div>{{ translate('TaskDetail.popover.id') }}: {{ samplingLocation.id }}</div>-->
<!--              <div v-if="samplingLocation.description">{{ translate('TaskDetail.popover.description') }}: {{ samplingLocation.description }}</div>-->
<!--              <div v-if="samplingLocation.status">{{ translate('TaskDetail.popover.status') }}: {{ samplingLocation.status }}</div>-->
<!--              <div v-if="samplingLocation.created_by">{{ translate('TaskDetail.popover.createdBy') }}: {{ samplingLocation.created_by }}</div>-->
<!--              <div v-if="samplingLocation.created_at">{{ translate('TaskDetail.popover.createdAt') }}: {{ formatDate(samplingLocation.created_at) }}</div>-->
<!--              <div v-if="samplingLocation.updated_by">{{ translate('TaskDetail.popover.updatedBy') }}: {{ samplingLocation.updated_by }}</div>-->
<!--              <div v-if="samplingLocation.updated_at">{{ translate('TaskDetail.popover.updatedAt') }}: {{ formatDate(samplingLocation.updated_at) }}</div>-->
<!--            </template>-->
<!--            <template #reference>-->
<!--              {{ samplingLocation.name }}-->
<!--            </template>-->
<!--          </el-popover>-->
<!--        </el-tag>-->
<!--      </div>-->
<!--    </el-form-item>-->

<!--    &lt;!&ndash; Additional dispatch details: Instruments &ndash;&gt;-->
<!--    <el-form-item :label="translate('TaskDetail.instrument')" v-if="dispatch && dispatch.instrumentDetails && dispatch.instrumentDetails.length">-->
<!--      <div class="tags">-->
<!--        <el-tag v-for="instrument in dispatch.instrumentDetails"-->
<!--                :key="instrument.id"-->
<!--                type="info"-->
<!--                size="small"-->
<!--                effect="light">-->
<!--          <el-popover effect="light" trigger="hover" placement="top" width="auto">-->
<!--            <template #default>-->
<!--              <div>{{ translate('TaskDetail.popover.id') }}: {{ instrument.id }}</div>-->
<!--              <div v-if="instrument.description">{{ translate('TaskDetail.popover.description') }}: {{ instrument.description }}</div>-->
<!--              <div v-if="instrument.model_number">{{ translate('TaskDetail.popover.modelNumber') }}: {{ instrument.model_number }}</div>-->
<!--              <div v-if="instrument.manufacturer">{{ translate('TaskDetail.popover.manufacturer') }}: {{ instrument.manufacturer }}</div>-->
<!--              <div v-if="instrument.type">{{ translate('TaskDetail.popover.type') }}: {{ instrument.type }}</div>-->
<!--              <div v-if="instrument.status">{{ translate('TaskDetail.popover.status') }}: {{ instrument.status }}</div>-->
<!--              <div v-if="instrument.created_by">{{ translate('TaskDetail.popover.createdBy') }}: {{ instrument.created_by }}</div>-->
<!--              <div v-if="instrument.created_at">{{ translate('TaskDetail.popover.createdAt') }}: {{ formatDate(instrument.created_at) }}</div>-->
<!--              <div v-if="instrument.updated_by">{{ translate('TaskDetail.popover.updatedBy') }}: {{ instrument.updated_by }}</div>-->
<!--              <div v-if="instrument.updated_at">{{ translate('TaskDetail.popover.updatedAt') }}: {{ formatDate(instrument.updated_at) }}</div>-->
<!--            </template>-->
<!--            <template #reference>-->
<!--              {{ instrument.name }}-->
<!--            </template>-->
<!--          </el-popover>-->
<!--        </el-tag>-->
<!--      </div>-->
<!--    </el-form-item>-->
<!--  </el-form>-->
<!--</template>-->

<!--<script>-->
<!--import dayjs from "dayjs";-->
<!--import {getDispatchByDispatchedTaskId} from "@/services/dispatchService";-->
<!--import {getTestSubjectById} from "@/services/testSubjectService";-->
<!--import {getSamplingLocationById} from "@/services/samplingLocationService";-->
<!--import {getInstrumentById} from "@/services/instrumentService";-->
<!--import {translate} from "@/utils/i18n";-->

<!--export default {-->
<!--  props: {-->
<!--    task: {-->
<!--      type: Object,-->
<!--      required: true,-->
<!--    },-->
<!--    formMap: {-->
<!--      type: Object,-->
<!--      required: true,-->
<!--    },-->
<!--    personnelMap: {-->
<!--      type: Object,-->
<!--      required: true,-->
<!--    },-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      dispatch: null, // This will hold the dispatch data along with its additional details.-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    translate,-->
<!--    getFormNameById(formId) {-->
<!--      return this.formMap[formId] || "N/A";-->
<!--    },-->
<!--    getUserById(personnelId) {-->
<!--      return this.personnelMap[personnelId] || null;-->
<!--    },-->
<!--    formatDate(dateString) {-->
<!--      return dateString ? dayjs(dateString).format("YYYY-MM-DD HH:mm:ss") : "-";-->
<!--    },-->
<!--    showDevelopmentPopup() {-->
<!--      const url = this.$router.resolve({-->
<!--        name: 'TaskLog',-->
<!--        params: {-->
<!--          createdBy: this.$store.getters.getUser.id, // the record created by myself-->
<!--          dispatchedTaskId: this.task.id, // Replace with actual `dispatchedTaskId`-->
<!--          taskName: this.getFormNameById(this.task.qc_form_tree_node_id)-->
<!--        },-->
<!--      }).href;-->
<!--      console.log("taskName is " + this.getFormNameById(this.task.qc_form_tree_node_id))-->
<!--      // Open the URL in a new tab-->
<!--      window.open(url, '_blank');-->
<!--    },-->
<!--    stateTagType(stateId) {-->
<!--      const stateMap = {-->
<!--        1: "warning", // Pending-->
<!--        2: "primary", // In Progress-->
<!--        3: "success", // Completed-->
<!--        4: "info",    // Canceled-->
<!--        5: "danger",  // Overdue-->
<!--      };-->
<!--      return stateMap[stateId] || "info";-->
<!--    },-->
<!--    stateName(stateId) {-->
<!--      const stateMap = {-->
<!--        1: translate('TaskDetail.status.1'),-->
<!--        2: translate('TaskDetail.status.2'),-->
<!--        3: translate('TaskDetail.status.3'),-->
<!--        4: translate('TaskDetail.status.4'),-->
<!--        5: translate('TaskDetail.status.5'),-->
<!--      };-->
<!--      return stateMap[stateId] || "Unknown";-->
<!--    },-->
<!--    // Helper function to fetch details for given IDs-->
<!--    async fetchDetails(ids, fetchFunction) {-->
<!--      const details = [];-->
<!--      for (const id of ids || []) {-->
<!--        try {-->
<!--          const response = await fetchFunction(id);-->
<!--          if (response?.data?.data) {-->
<!--            details.push(response.data.data);-->
<!--          }-->
<!--        } catch (e) {-->
<!--          console.error(`Failed to fetch detail for ID: ${id}`, e);-->
<!--        }-->
<!--      }-->
<!--      return details;-->
<!--    },-->
<!--    // Fetch the dispatch information and its associated detail arrays-->
<!--    async fetchDispatchDetails() {-->
<!--      try {-->
<!--        const response = await getDispatchByDispatchedTaskId(this.task.id);-->
<!--        if (response?.data?.data) {-->
<!--          const dispatchData = response.data.data;-->
<!--          // Populate additional details using the helper function:-->
<!--          dispatchData.testSubjectDetails = await this.fetchDetails(dispatchData.test_subject_ids, getTestSubjectById);-->
<!--          dispatchData.samplingLocationDetails = await this.fetchDetails(dispatchData.sampling_location_ids, getSamplingLocationById);-->
<!--          dispatchData.instrumentDetails = await this.fetchDetails(dispatchData.instrument_ids, getInstrumentById);-->
<!--          this.dispatch = dispatchData;-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Failed to fetch dispatch details", error);-->
<!--      }-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    if (this.task.dispatch_id) {-->
<!--      this.fetchDispatchDetails();-->
<!--    }-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.task-details {-->
<!--  padding: 10px;-->
<!--}-->

<!--.details-header {-->
<!--  display: flex;-->
<!--  justify-content: flex-end;-->
<!--}-->

<!--.tags {-->
<!--  display: flex;-->
<!--  flex-wrap: wrap;-->
<!--  gap: 8px;-->
<!--}-->

<!--.forbidden-button {-->
<!--  cursor: not-allowed !important; /* Show forbidden cursor */-->
<!--  pointer-events: none; /* Prevent any interaction */-->
<!--}-->
<!--</style>-->
