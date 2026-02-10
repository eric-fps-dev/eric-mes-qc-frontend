<!--<script>-->
<!--import { fetchUsers } from "@/services/userService";-->
<!--import { insertDispatchedTasks } from "@/services/taskCenterService";-->
<!--import {Delete} from "@element-plus/icons-vue";-->

<!--export default {-->
<!--  name: "QuickDispatch",-->
<!--  computed: {-->
<!--    Delete() {-->
<!--      return Delete-->
<!--    }-->
<!--  },-->
<!--  props: {-->
<!--    qcFormTreeNodeId: {-->
<!--      type: String,-->
<!--      required: true, // Ensure the parameter is passed from the parent-->
<!--    }-->
<!--  },-->
<!--  emits: ["dispatch"],-->
<!--  data() {-->
<!--    return {-->
<!--      taskName: "",-->
<!--      taskDescription: "",-->
<!--      selectedPersonnel: [], // Stores selected personnel IDs-->
<!--      selectedTimes: [],-->
<!--      personnelOptions: [], // Initially empty, so no default users-->
<!--      isLoadingPersonnel: false, // Add loading state-->
<!--      dateTimeSelections: []-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    async loadPersonnelOptions() {-->
<!--      if (this.isLoadingPersonnel) return;-->

<!--      // Clear old options and show loading state-->
<!--      this.personnelOptions = [];-->
<!--      this.isLoadingPersonnel = true;-->

<!--      try {-->
<!--        const response = await fetchUsers();-->
<!--        this.personnelOptions = response.data.data.content.map((user) => ({-->
<!--          value: user.id,-->
<!--          label: user.name,-->
<!--        }));-->
<!--      } catch (error) {-->
<!--        console.error("Error fetching users:", error);-->
<!--        this.$message.error("Unable to load users.");-->
<!--      } finally {-->
<!--        this.isLoadingPersonnel = false;-->
<!--      }-->
<!--    },-->
<!--    addDateTime() {-->
<!--      this.dateTimeSelections.push({ dispatch_time: "", due_date: ""});-->
<!--    },-->
<!--    removeDateTime(index) {-->
<!--      this.dateTimeSelections.splice(index, 1);-->
<!--    },-->
<!--    resetFields() {-->
<!--      // Clear all fields-->
<!--      this.taskName = "";-->
<!--      this.taskDescription = "";-->
<!--      this.selectedPersonnel = [];-->
<!--      this.dateTimeSelections = [];-->
<!--    },-->
<!--    async handleDispatch() {-->
<!--      console.log("Dispatching task:", this.taskName, this.taskDescription, this.selectedPersonnel, this.dateTimeSelections)-->
<!--      if (!this.taskName) {-->
<!--        this.$message.error("Cannot be empty!");-->
<!--        return;-->
<!--      }-->
<!--      if (!this.taskDescription) {-->
<!--        this.$message.error("Cannot be empty!");-->
<!--        return;-->
<!--      }-->
<!--      if (!this.selectedPersonnel.length) {-->
<!--        this.$message.error("Please choose users.");-->
<!--        return;-->
<!--      }-->
<!--      if (!this.dateTimeSelections.length) {-->
<!--        this.$message.error("Please set the time.");-->
<!--        return;-->
<!--      }-->

<!--      const currentTimestamp = new Date().toISOString(); // Format as `yyyy-MM-ddTHH:mm:ss.sssZ`-->

<!--      const tasks = this.dateTimeSelections.map(selection => ({-->
<!--        created_at: currentTimestamp, // Current timestamp in ISO format-->
<!--        created_by: this.$store.getters.getUser.id, // User ID from Vuex store-->
<!--        status: 1, // Set status to 1-->
<!--        qc_form_tree_node_id: this.qcFormTreeNodeId, // Passed-in prop-->
<!--        name: this.taskName, // Name from form-->
<!--        description: this.taskDescription, // Description from form-->
<!--        dispatch_time: new Date(selection[0]).toISOString(),-->
<!--        due_date: new Date(selection[1]).toISOString(),-->
<!--        dispatched_task_state_id: 1, // Set state ID to 1-->
<!--      }));-->

<!--      console.log("Dispatching task:", tasks);-->
<!--      console.log("Personnel Array: ", this.selectedPersonnel)-->

<!--      try {-->
<!--        // Call the API-->
<!--        for (let task of tasks) {-->
<!--          await insertDispatchedTasks(task, this.selectedPersonnel); // Call API for each task-->
<!--        }-->
<!--        this.$message.success("Task dispatched");-->
<!--        this.$emit("dispatch", tasks); // Emit success event-->
<!--        this.resetFields(); // Clear fields after successful dispatch-->
<!--        this.$emit("close"); // Emit close event to close the dialog-->
<!--      } catch (error) {-->
<!--        console.error("Error dispatching task:", error);-->
<!--        this.$message.error("Failed to dispatch");-->
<!--      }-->

<!--      this.$emit("dispatch", tasks);-->
<!--    },-->
<!--  },-->
<!--  async mounted() {-->
<!--    await this.loadPersonnelOptions(); // Fetch personnel on mount-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<template>-->
<!--  <el-form label-width="120px">-->
<!--    &lt;!&ndash; Task Name &ndash;&gt;-->
<!--    <el-form-item label="Task name" required>-->
<!--      <el-input v-model="taskName" placeholder="Please enter task name"></el-input>-->
<!--    </el-form-item>-->

<!--    &lt;!&ndash; Select Personnel &ndash;&gt;-->
<!--    <el-form-item label="Assignee" required>-->
<!--      <el-select-->
<!--          v-model="selectedPersonnel"-->
<!--          filterable-->
<!--          multiple-->
<!--          placeholder="Please choose assignees..."-->
<!--          :loading="isLoadingPersonnel"-->
<!--          @focus="loadPersonnelOptions"-->
<!--      >-->
<!--        <el-option v-if="isLoadingPersonnel" disabled label="Loading..." />-->
<!--        <el-option-->
<!--            v-for="option in personnelOptions"-->
<!--            :key="option.value"-->
<!--            :label="option.label"-->
<!--            :value="option.value"-->
<!--        />-->
<!--      </el-select>-->
<!--    </el-form-item>-->

<!--    <el-form-item label="Time Ranges" required>-->
<!--      <div v-for="(item, index) in dateTimeSelections" :key="index" style="display: flex; align-items: center; gap: 10px;">-->
<!--&lt;!&ndash;        &lt;!&ndash; Date Picker &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;        <el-date-picker&ndash;&gt;-->
<!--&lt;!&ndash;            v-model="item.date"&ndash;&gt;-->
<!--&lt;!&ndash;            type="date"&ndash;&gt;-->
<!--&lt;!&ndash;            placeholder="选择日期"&ndash;&gt;-->
<!--&lt;!&ndash;            style="flex: 1;"&ndash;&gt;-->
<!--&lt;!&ndash;        ></el-date-picker>&ndash;&gt;-->

<!--&lt;!&ndash;        &lt;!&ndash; Time Picker &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;        <el-time-picker&ndash;&gt;-->
<!--&lt;!&ndash;            v-model="item.time"&ndash;&gt;-->
<!--&lt;!&ndash;            placeholder="选择时间"&ndash;&gt;-->
<!--&lt;!&ndash;            style="flex: 1;"&ndash;&gt;-->
<!--&lt;!&ndash;        ></el-time-picker>&ndash;&gt;-->

<!--        <el-date-picker-->
<!--            v-model="dateTimeSelections[index]"-->
<!--            type="datetimerange"-->
<!--            range-separator="To"-->
<!--            start-placeholder="QC task start date"-->
<!--            end-placeholder="QC task due date"-->
<!--            style="flex: 1;"-->
<!--        />-->
<!--        &lt;!&ndash; Remove Button &ndash;&gt;-->
<!--        <el-button-->
<!--            :icon="Delete"-->
<!--            type="danger"-->
<!--            plain-->
<!--            circle-->
<!--            @click="removeDateTime(index)"-->
<!--        ></el-button>-->
<!--      </div>-->

<!--      &lt;!&ndash; Add New Date-Time Row &ndash;&gt;-->
<!--      <el-button type="primary" plain icon="el-icon-plus" circle @click="addDateTime" style="margin-left: 5px">-->
<!--      </el-button>-->
<!--    </el-form-item>-->

<!--    <el-form-item label="Description" required>-->
<!--      <el-input-->
<!--          v-model="taskDescription"-->
<!--          type="textarea"-->
<!--          placeholder="Please input descriptions.."-->
<!--          rows="4"-->
<!--      ></el-input>-->
<!--    </el-form-item>-->

<!--    &lt;!&ndash; Actions &ndash;&gt;-->
<!--    <el-form-item>-->
<!--      <el-button type="primary" @click="handleDispatch">Dispatch Task</el-button>-->
<!--    </el-form-item>-->

<!--  </el-form>-->

<!--</template>-->

<!--<style scoped>-->
<!--</style>-->
