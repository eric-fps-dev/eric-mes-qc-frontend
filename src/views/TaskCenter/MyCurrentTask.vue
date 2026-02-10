<!--<template>-->
<!--  <el-container>-->
<!--    <el-header class="header">-->
<!--      <div style="display: flex; justify-content: space-between; align-items: center;">-->
<!--        <h2>今日任务</h2>-->
<!--        <el-input-->
<!--            v-model="formFilter"-->
<!--            placeholder="搜索任务表单名称"-->
<!--            clearable-->
<!--            style="width: 300px;"-->
<!--            @input="applyFilter"-->
<!--        >-->
<!--          <template #prefix>-->
<!--            <el-icon><Search /></el-icon>-->
<!--          </template>-->
<!--        </el-input>-->
<!--      </div>-->
<!--    </el-header>-->
<!--    <el-main>-->
<!--      <el-table-->
<!--          :data="paginatedTasks"-->
<!--          border-->
<!--          style="width: 100%"-->
<!--          :default-sort="{ prop: 'dispatch_time', order: 'descending' }"-->
<!--      >-->
<!--        &lt;!&ndash; Task Form &ndash;&gt;-->
<!--        <el-table-column prop="qc_form_tree_node_id" label="任务表单" width="300">-->
<!--          <template #default="scope">-->
<!--            <span-->
<!--                class="clickable-form-name"-->
<!--                @click="handleFormNameClick(scope.row.qc_form_tree_node_id)"-->
<!--            >-->
<!--              {{ getFormNameById(scope.row.qc_form_tree_node_id) || '未知表单' }}-->
<!--            </span>-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; Task State &ndash;&gt;-->
<!--        <el-table-column prop="dispatched_task_state_id" label="任务状态" width="120" sortable>-->
<!--          <template #default="scope">-->
<!--            <el-tag :type="stateTagType(scope.row.dispatched_task_state_id)">-->
<!--              {{ stateName(scope.row.dispatched_task_state_id) }}-->
<!--            </el-tag>-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; Task Name &ndash;&gt;-->
<!--        <el-table-column prop="name" label="任务名称" width="200">-->
<!--          <template #default="scope">-->
<!--            {{ scope.row.name || '未命名任务' }}-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; Remaining Time &ndash;&gt;-->
<!--        <el-table-column label="剩余时间" width="200">-->
<!--          <template #default="scope">-->
<!--            <el-tag style="font-weight: bold" :type="remainingTimeTag(scope.row.due_date)">-->
<!--              {{ calculateRemainingTime(scope.row.due_date) }}-->
<!--            </el-tag>-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; Due Date &ndash;&gt;-->
<!--        <el-table-column prop="due_date" label="到期时间" width="200" sortable>-->
<!--          <template #default="scope">-->
<!--            {{ formatDate(scope.row.due_date) }}-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; Description &ndash;&gt;-->
<!--        <el-table-column prop="description" label="任务描述" width="400">-->
<!--          <template #default="scope">-->
<!--            {{ scope.row.description || '-' }}-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; Notes &ndash;&gt;-->
<!--        <el-table-column prop="notes" label="备注" width="400">-->
<!--          <template #default="scope">-->
<!--            {{ scope.row.notes || '-' }}-->
<!--          </template>-->
<!--        </el-table-column>-->

<!--        &lt;!&ndash; Operations &ndash;&gt;-->
<!--        <el-table-column fixed="right" label="操作" min-width="120">-->
<!--          <template #default="scope">-->
<!--            <el-button link type="primary" size="small" @click="showDetails(scope.row)">-->
<!--              Detail-->
<!--            </el-button>-->
<!--            <el-button link type="info" size="small" @click="editTask(scope.row)">-->
<!--              Edit-->
<!--            </el-button>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--      </el-table>-->

<!--      &lt;!&ndash; Pagination &ndash;&gt;-->
<!--      <el-pagination-->
<!--          style="margin-top: 10px"-->
<!--          @size-change="handleSizeChange"-->
<!--          @current-change="handleCurrentChange"-->
<!--          :current-page="currentPage"-->
<!--          :page-size="pageSize"-->
<!--          :page-sizes="[15, 30, 45, 60]"-->
<!--          layout="total, sizes, prev, pager, next"-->
<!--          :total="dispatchedTasks.length"-->
<!--          :hide-on-single-page="true"-->
<!--      />-->

<!--      &lt;!&ndash; Popup for Details &ndash;&gt;-->
<!--      <el-dialog-->
<!--          title="任务详情"-->
<!--          v-model="isDetailsDialogVisible"-->
<!--          width="50%"-->
<!--          @close="closeDetailsDialog"-->
<!--      >-->
<!--        <TaskDetail-->
<!--            v-if="currentTask"-->
<!--            :task="currentTask"-->
<!--            :form-map="formMap"-->
<!--            :personnel-map="personnelMap"-->
<!--            @edit="editTask(currentTask)"-->
<!--            @delete="deleteTask(currentTask)"-->
<!--        />-->

<!--      </el-dialog>-->
<!--    </el-main>-->
<!--  </el-container>-->
<!--</template>-->

<!--<script>-->
<!--import dayjs from "dayjs";-->
<!--import {fetchFormNodes, fetchFormNodesById} from "@/services/formNodeService";-->
<!--import {fetchUsers} from "@/services/userService";-->
<!--import TaskDetail from "@/components/task-center/TaskDetail.vue";-->
<!--import {Search} from "@element-plus/icons-vue";-->
<!--import * as qcFormTemplateService from "@/services/qcFormTemplateService";-->
<!--import * as formNodeService from "@/services/formNodeService";-->
<!--import {fetchTodayTasks} from "@/services/taskCenterService";-->

<!--export default {-->
<!--  components: {-->
<!--    TaskDetail,-->
<!--    Search-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      dispatchedTasks: [],-->
<!--      formMap: {},-->
<!--      personnelMap: {},-->
<!--      isDetailsDialogVisible: false,-->
<!--      currentTask: null,-->
<!--      currentPage: 1,-->
<!--      pageSize: 15,-->
<!--      formFilter: "",-->
<!--      filteredTasks: [],-->
<!--      pollingInterval: null-->
<!--    };-->
<!--  },-->
<!--  computed: {-->
<!--    paginatedTasks() {-->
<!--      const start = (this.currentPage - 1) * this.pageSize;-->
<!--      const end = start + this.pageSize;-->
<!--      return this.filteredTasks.slice(start, end);-->
<!--    },-->
<!--  },-->
<!--  methods: {-->
<!--    async fetchDispatchedTasks() {-->
<!--      try {-->
<!--        const userId = this.$store.getters.getUser.id; // Get the logged-in user's ID from Vuex-->
<!--        console.log("userId here is " + userId)-->
<!--        const response = await fetchTodayTasks(userId); // Use the userId dynamically-->
<!--        this.dispatchedTasks = response.data.data;-->
<!--        this.filteredTasks = this.dispatchedTasks; // Initialize filteredTasks-->
<!--      } catch (error) {-->
<!--        console.error("Error fetching dispatched tasks:", error);-->
<!--        this.$message.error("无法加载我的任务，请重试。");-->
<!--      }-->
<!--    },-->
<!--    startPolling() {-->
<!--      this.pollingInterval = setInterval(() => {-->
<!--        this.fetchDispatchedTasks();-->
<!--      }, 10000); // Poll every 10 seconds, set up websocket later-->
<!--    },-->
<!--    stopPolling() {-->
<!--      if (this.pollingInterval) {-->
<!--        clearInterval(this.pollingInterval);-->
<!--        this.pollingInterval = null;-->
<!--      }-->
<!--    },-->
<!--    async applyFilter() {-->
<!--      if (this.formFilter.trim() === "") {-->
<!--        this.filteredTasks = this.dispatchedTasks; // Reset to all tasks if filter is empty-->
<!--      } else {-->
<!--        this.filteredTasks = this.dispatchedTasks.filter((task) =>-->
<!--            this.getFormNameById(task.qc_form_tree_node_id).includes(this.formFilter)-->
<!--        );-->
<!--      }-->
<!--    },-->
<!--    async fetchFormMap() {-->
<!--      try {-->
<!--        const response = await fetchFormNodes();-->

<!--        // Recursive function to process all nodes-->
<!--        const processNodes = (nodes, map) => {-->
<!--          nodes.forEach((node) => {-->
<!--            // Add the current node to the map-->
<!--            map[node.id] = node.label;-->

<!--            // If the node has children, process them recursively-->
<!--            if (node.children && node.children.length > 0) {-->
<!--              processNodes(node.children, map);-->
<!--            }-->
<!--          });-->
<!--        };-->

<!--        // Initialize the map and process the top-level nodes-->
<!--        const formMap = {};-->
<!--        processNodes(response.data, formMap);-->

<!--        // Assign the result to the component's formMap-->
<!--        this.formMap = formMap;-->

<!--      } catch (error) {-->
<!--        console.error("Error fetching form nodes:", error);-->
<!--        this.$message.error("无法加载表单信息，请重试。");-->
<!--      }-->
<!--    },-->
<!--    async fetchPersonnelMap() {-->
<!--      try {-->
<!--        const response = await fetchUsers();-->
<!--        this.personnelMap = response.data.data.content.reduce((map, person) => {-->
<!--          map[person.id] = person;-->
<!--          return map;-->
<!--        }, {});-->
<!--      } catch (error) {-->
<!--        console.error("Error fetching personnel data:", error);-->
<!--        this.$message.error("无法加载人员信息，请重试。");-->
<!--      }-->
<!--    },-->
<!--    async handleFormNameClick(nodeId) {-->
<!--      console.log("Redirecting to form display with nodeId:", nodeId);-->

<!--      try {-->
<!--        // Fetch the qc form template id asynchronously-->
<!--        const response = await formNodeService.fetchFormNodesById(nodeId);-->
<!--        const qcFormTemplateId = response.data?.qcFormTemplateId;-->

<!--        if (!qcFormTemplateId) {-->
<!--          console.error("Failed to fetch qcFormTemplateId for nodeId:", nodeId);-->
<!--          this.$message.error("无法加载表单模板，请重试。");-->
<!--          return;-->
<!--        }-->

<!--        // Construct the URL for the route-->
<!--        const newTabUrl = this.$router.resolve({-->
<!--          name: 'FormDisplay',-->
<!--          params: {-->
<!--            qcFormTemplateId: qcFormTemplateId,-->
<!--          },-->
<!--        }).href;-->

<!--        // Open the URL in a new tab-->
<!--        window.open(newTabUrl, '_blank');-->
<!--      } catch (error) {-->
<!--        console.error("Error fetching qcFormTemplateId for nodeId:", nodeId, error);-->
<!--        this.$message.error("加载表单模板时出错，请稍后重试。");-->
<!--      }-->
<!--    },-->
<!--    formatDate(dateString) {-->
<!--      return dateString ? dayjs(dateString).format("YYYY-MM-DD HH:mm:ss") : "-";-->
<!--    },-->
<!--    stateTagType(stateId) {-->
<!--      const stateMap = {-->
<!--        1: 'warning',  // Pending-->
<!--        2: 'primary',  // In Progress-->
<!--        3: 'success',  // Completed-->
<!--        4: 'info',     // Canceled-->
<!--        5: 'danger',   // Overdue-->
<!--      };-->
<!--      return stateMap[stateId] || 'info'; // Default to 'info' if stateId is undefined-->
<!--    },-->
<!--    stateName(stateId) {-->
<!--      const stateMap = {-->
<!--        1: 'Pending',-->
<!--        2: 'In Progress',-->
<!--        3: 'Completed',-->
<!--        4: 'Canceled',-->
<!--        5: 'Overdue',-->
<!--      };-->
<!--      return stateMap[stateId] || 'Unknown'; // Default to 'Unknown' if stateId is undefined-->
<!--    },-->
<!--    calculateRemainingTime(dueDate) {-->
<!--      if (!dueDate) return "-";-->

<!--      const now = dayjs();-->
<!--      const due = dayjs(dueDate);-->
<!--      const diffInMinutes = due.diff(now, 'minute');-->

<!--      if (diffInMinutes <= 0) return "已过期";-->

<!--      const days = Math.floor(diffInMinutes / (60 * 24));-->
<!--      const hours = Math.floor((diffInMinutes % (60 * 24)) / 60);-->
<!--      const minutes = diffInMinutes % 60;-->

<!--      if (days > 0) {-->
<!--        return `${days} 天 ${hours} 小时 ${minutes} 分钟`;-->
<!--      } else if (hours > 0) {-->
<!--        return `${hours} 小时 ${minutes} 分钟`;-->
<!--      } else {-->
<!--        return `${minutes} 分钟`;-->
<!--      }-->
<!--    },-->
<!--    remainingTimeTag(dueDate) {-->
<!--      if (!dueDate) return "info";-->

<!--      const now = dayjs();-->
<!--      const due = dayjs(dueDate);-->
<!--      const diffInMinutes = due.diff(now, 'minute');-->

<!--      if (diffInMinutes > 24 * 60) {-->
<!--        return "info";-->
<!--      } else if (diffInMinutes > 60) {-->
<!--        return "primary";-->
<!--      } else if (diffInMinutes > 30) {-->
<!--        return "warning";-->
<!--      } else {-->
<!--        return "danger";-->
<!--      }-->
<!--    },-->
<!--    getFormNameById(formId) {-->
<!--      return this.formMap[formId] || "未知表单";-->
<!--    },-->
<!--    getUserById(personnelId) {-->
<!--      return this.personnelMap[personnelId] || null;-->
<!--    },-->
<!--    showDetails(row) {-->
<!--      console.log("Selected Task Row:", row);-->
<!--      this.currentTask = row;-->
<!--      this.isDetailsDialogVisible = true;-->
<!--    },-->
<!--    editTask(row) {-->
<!--      // Placeholder for edit functionality-->
<!--      console.log("Edit task:", row);-->
<!--    },-->
<!--    closeDetailsDialog() {-->
<!--      this.isDetailsDialogVisible = false;-->
<!--      this.currentTask = null;-->
<!--    },-->
<!--    handleSizeChange(size) {-->
<!--      this.pageSize = size;-->
<!--    },-->
<!--    handleCurrentChange(page) {-->
<!--      this.currentPage = page;-->
<!--    },-->
<!--  },-->
<!--  async mounted() {-->
<!--    await Promise.all([-->
<!--      this.fetchDispatchedTasks(),-->
<!--      this.fetchFormMap(),-->
<!--      this.fetchPersonnelMap(),-->
<!--    ]);-->
<!--    this.startPolling(); // Start polling after mounting-->
<!--  },-->
<!--  beforeUnmount() {-->
<!--    this.stopPolling();-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.header {-->
<!--  padding-bottom: 10px;-->
<!--  border-bottom: 1px solid #dcdcdc;-->
<!--}-->

<!--.clickable-form-name {-->
<!--  color: #409eff;-->
<!--  cursor: pointer;-->
<!--  text-decoration: underline;-->
<!--}-->

<!--.clickable-form-name:hover {-->
<!--  color: #66b1ff;-->
<!--}-->
<!--</style>-->
