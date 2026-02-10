<!--<template>-->
<!--  <el-container style="display: flex; flex-direction: column; height: max-content; max-width: 100%; max-height: 100vh; overflow-y: hidden;">-->
<!--    &lt;!&ndash; Top Section &ndash;&gt;-->
<!--    <div style="display: flex; justify-content: space-between; align-items: center;">-->
<!--      <div style="display: flex; align-items: center;">-->
<!--        &lt;!&ndash; Title Label &ndash;&gt;-->
<!--        <h2>{{ translate('orderManagement.title') }}</h2>-->
<!--        &lt;!&ndash; Search Box &ndash;&gt;-->
<!--        <el-input-->
<!--            v-model="searchInput"-->
<!--            :placeholder="translate('orderManagement.searchPlaceholder')"-->
<!--            clearable-->
<!--            style="width: 300px; margin-left: 20px"-->
<!--        >-->
<!--          <template #prefix>-->
<!--              <el-icon>-->
<!--                <Search />-->
<!--              </el-icon>-->
<!--          </template>-->
<!--        </el-input>-->
<!--      </div>-->
<!--      <div style="display: flex; gap: 10px;">-->
<!--        &lt;!&ndash; Refresh Button &ndash;&gt;-->
<!--        <el-tooltip :content="translate('orderManagement.refreshList')" placement="top">-->
<!--          <el-button-->
<!--              class="refresh-button"-->
<!--              type="primary"-->
<!--              circle-->
<!--              @click="handleRefreshButton"-->
<!--          >-->
<!--            <el-icon style="color: white;">-->
<!--              <RefreshRight />-->
<!--            </el-icon>-->
<!--          </el-button>-->
<!--        </el-tooltip>-->

<!--        &lt;!&ndash; New QC Order Button &ndash;&gt;-->
<!--        <el-button type="primary" @click="handleNewQcOrderButtonClick">-->
<!--          {{ translate('orderManagement.addButton') }}-->
<!--        </el-button>-->

<!--        &lt;!&ndash; View All Tasks Button &ndash;&gt;-->
<!--        <el-button type="info" @click="openViewDispatchedTestsDialog">-->
<!--          {{ translate('orderManagement.viewDispatchedTaskButton') }}-->
<!--        </el-button>-->

<!--        &lt;!&ndash; Delete Button &ndash;&gt;-->
<!--        <el-button-->
<!--            v-if="selectedRows.length > 0"-->
<!--            type="danger"-->
<!--            @click="confirmDeleteSelectedRows"-->
<!--        >-->
<!--          {{ translate('orderManagement.delete') }}-->
<!--        </el-button>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; QC Order Table &ndash;&gt;-->
<!--    <el-main style="padding: 0; margin-top: 20px;">-->
<!--      <QcOrderList-->
<!--          :qc-order-list="qcOrders"-->
<!--          :form-map="formMap"-->
<!--          :user-map="userMap"-->
<!--          :search-input="searchInput"-->
<!--          :loading="loading"-->
<!--          @order-clicked="handleOrderClicked"-->
<!--          @selection-change="updateSelectedRows"-->

<!--      />-->
<!--    </el-main>-->

<!--    &lt;!&ndash; Dialog (QC Order Detail/Dispatch Configurator(Qc Order Form/Quick Dispatch Form)) &ndash;&gt;-->
<!--    <el-dialog-->
<!--        :title="dialogTitle"-->
<!--        v-model="isDetailsDialogVisible"-->
<!--        width="80%"-->
<!--        top="5vh"-->
<!--        :close-on-click-modal="false"-->
<!--        @close="closeAndResetDetailsDialog"-->
<!--        style="max-width: 1200px; max-height: 90vh;"-->
<!--    >-->
<!--      <template v-if="isDetailsDialogVisible && !isEditMode && currentOrder">-->
<!--        <qc-order-details-->
<!--            :currentOrder="currentOrder"-->
<!--            :user-map="userMap"-->
<!--            :form-map="formMap"-->
<!--            @on-edit="handleEditQcOrder"-->
<!--            @on-delete="handleDeleteQcOrder"-->
<!--            @refresh-order="refreshCurrentOrder(currentOrder.id)"-->
<!--        />-->
<!--      </template>-->

<!--      <template v-else-if="isDetailsDialogVisible && isEditMode">-->
<!--&lt;!&ndash;        <div style="max-height: 80vh; overflow-y: hidden; padding: 10px;">&ndash;&gt;-->
<!--        <div style="max-height: 80vh; padding: 10px;">-->
<!--          <dispatch-configurator-->
<!--              :current-order="currentOrder"-->
<!--              :is-edit-mode="isEditMode"-->
<!--              :form-map="formMap"-->
<!--              :user-map="userMap"-->
<!--              :team-map="teamMap"-->
<!--              @on-submit="handleOrderSubmit"-->
<!--              @on-cancel="closeAndResetDetailsDialog"-->
<!--          />-->
<!--        </div>-->
<!--      </template>-->
<!--    </el-dialog>-->

<!--    &lt;!&ndash; Dispatched Tasks Dialog &ndash;&gt;-->
<!--    <el-dialog-->
<!--        :title="translate('orderManagement.orderDetailDialog.dispatchedTasksDivider')"-->
<!--        top="5vh"-->
<!--        v-model="isDispatchedTestsDialogVisible"-->
<!--        width="70%"-->
<!--        @close="closeViewDispatchedTestsDialog"-->
<!--    >-->
<!--      <DispatchedTasksList-->
<!--          :form-map="formMap"-->
<!--          :user-map="userMap"-->
<!--          :team-map="teamMap"-->
<!--          :show-search-box="true"-->
<!--      />-->
<!--    </el-dialog>-->
<!--  </el-container>-->
<!--</template>-->

<!--<script>-->

<!--import {-->
<!--  getAllQcOrders,-->
<!--  deleteQcOrder,-->
<!--  createQcOrder,-->
<!--  updateQcOrder,-->
<!--  getQcOrderById,-->
<!--  updateQcOrderStates-->
<!--} from "@/services/qcOrderService";-->
<!--import { Search, RefreshRight } from "@element-plus/icons-vue";-->
<!--import QcOrderList from "@/components/dispatch/QcOrderList.vue";-->
<!--import QcOrderDetails from "@/components/dispatch/QcOrderDetails.vue";-->
<!--import DispatchConfigurator from "@/components/dispatch/DispatchConfigurator.vue";-->
<!--import {fetchFormNodes} from "@/services/formNodeService";-->
<!--import {generateFormMap} from "@/utils/dispatch-utils";-->
<!--import {fetchUsers} from "@/services/userService";-->
<!--import DispatchedTasksList from "@/components/dispatch/DispatchedTaskList.vue";-->
<!--import {getAllTeamTree} from "@/services/teamService";-->
<!--import {getUsersForTeam} from "@/services/teamUserService";-->
<!--import {getFormIdsForTeam} from "@/services/teamFormService";-->
<!--import {translate} from "@/utils/i18n";-->

<!--export default {-->
<!--  components: {-->
<!--    DispatchedTasksList,-->
<!--    DispatchConfigurator,-->
<!--    QcOrderList,-->
<!--    QcOrderDetails,-->
<!--    Search,-->
<!--    RefreshRight,-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      isDetailsDialogVisible: false,-->
<!--      isDispatchedTestsDialogVisible: false,-->
<!--      isEditMode: false,-->
<!--      currentOrder: null,-->
<!--      selectedRows: [],-->
<!--      searchInput: "",-->
<!--      formMap: [],-->
<!--      userMap: {},-->
<!--      teamMap: {},-->
<!--      qcOrders: [],-->
<!--      loading: false,-->
<!--    };-->
<!--  },-->
<!--  computed: {-->
<!--    dialogTitle() {-->
<!--      if (this.isEditMode) {-->
<!--        return this.currentOrder ? translate('orderManagement.editOrder') : translate('orderManagement.addOrder');-->
<!--      }-->
<!--      return this.currentOrder ? translate('orderManagement.orderDetail') : translate('orderManagement.addOrder');-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    translate,-->
<!--    async loadAllQcOrders() {-->
<!--      try {-->
<!--        const response = await getAllQcOrders();-->
<!--        if (response && response.status === 200) {-->
<!--          this.qcOrders = response.data.data;-->
<!--        } else {-->
<!--          this.qcOrders = [];-->
<!--        }-->
<!--      } catch (error) {-->
<!--        this.$message.error(translate('orderManagement.messages.errorLoadingOrderList'));-->
<!--      }-->
<!--    },-->
<!--    handleNewQcOrderButtonClick() {-->
<!--      this.currentOrder = null;-->
<!--      this.isEditMode = true;-->
<!--      this.isDetailsDialogVisible = true;-->
<!--    },-->
<!--    handleOrderClicked(order) {-->
<!--      this.currentOrder = { ...order };-->
<!--      this.isEditMode = false;-->
<!--      this.isDetailsDialogVisible = true;-->
<!--    },-->
<!--    async handleOrderSubmit(order) {-->
<!--      console.log('handleOrderSubmit')-->
<!--      try {-->
<!--        let response = null;-->
<!--        if (this.currentOrder && this.currentOrder.id != null) {-->
<!--          response = await updateQcOrder(this.currentOrder.id, order);-->
<!--          if (response && response.status === 200) {-->
<!--            this.$message.success(translate('orderManagement.messages.orderUpdatedSuccess'));-->
<!--          }-->
<!--        } else {-->
<!--          response = await createQcOrder(order);-->
<!--          if (response && response.status === 200) {-->
<!--            this.$message.success(translate('orderManagement.messages.orderAddedSuccess'));-->
<!--          }-->
<!--        }-->
<!--          await this.loadAllQcOrders();-->
<!--          this.closeAndResetDetailsDialog();-->
<!--      } catch (error) {-->
<!--        this.$message.error(translate('orderManagement.messages.errorHandlingOrderSubmission'));-->
<!--      }-->
<!--    },-->
<!--    confirmDeleteSelectedRows() {-->
<!--      if (this.selectedRows.length === 0) {-->
<!--        this.$message.warning(translate('orderManagement.messages.selectAtLeastOneOrderToDelete'));-->
<!--        return;-->
<!--      }-->
<!--      this.$confirm(translate('orderManagement.messages.deleteConfirmation'),-->
<!--          translate('orderManagement.messages.messageTitle'),-->
<!--          {-->
<!--            confirmButtonText: translate('orderManagement.confirm'),-->
<!--            cancelButtonText: translate('orderManagement.cancel'),-->
<!--            type: "warning",-->
<!--          })-->
<!--          .then(async () => {-->
<!--            const userId = this.$store.getters.getUser.id;-->
<!--            const idsToDelete = this.selectedRows.map((row) => row.id);-->
<!--            await Promise.all(idsToDelete.map((id) => deleteQcOrder(id, userId)));-->
<!--            this.$message.success(translate('orderManagement.messages.orderDeletedSuccess'));-->
<!--            await this.loadAllQcOrders();-->
<!--            this.selectedRows = [];-->
<!--          })-->

<!--    },-->
<!--    closeAndResetDetailsDialog() {-->
<!--      console.log('closeAndResetDetailsDialog')-->
<!--      this.currentOrder = null;-->
<!--      this.isEditMode = false;-->
<!--      this.isDetailsDialogVisible = false;-->
<!--    },-->
<!--    updateSelectedRows(selected) {-->
<!--      this.selectedRows = selected;-->
<!--    },-->
<!--    handleEditQcOrder() {-->
<!--      console.log('handleEditQcOrder');-->
<!--      if (this.currentOrder && this.currentOrder.id != null) {-->
<!--        this.isEditMode = true;-->
<!--        console.log('set edit mode to true')-->
<!--      }-->
<!--    },-->
<!--    async handleDeleteQcOrder() {-->
<!--      try {-->
<!--        console.log('handleDeleteQcOrder');-->
<!--        const response = await deleteQcOrder(this.currentOrder.id, this.$store.getters.getUser.id);-->
<!--        if (response && response.status === 200) {-->
<!--          this.$message.success(translate('orderManagement.messages.orderDeletedSuccess'));-->
<!--          await this.loadAllQcOrders();-->
<!--          this.isDetailsDialogVisible = false;-->
<!--        }-->
<!--      } catch (e) {-->
<!--        console.log("Delete action canceled or failed.");-->
<!--      }-->
<!--    },-->
<!--    async refreshCurrentOrder(id) {-->
<!--      if (!id) return;-->

<!--      try {-->
<!--        const response = await getQcOrderById(id);-->
<!--        const updatedOrder = response.data?.data;-->
<!--        if (updatedOrder) {-->
<!--          this.currentOrder = { ...updatedOrder };-->
<!--          console.log("set current order to updated order");-->
<!--        }-->
<!--        await this.loadAllData();-->
<!--        console.log("loaded all data.");-->

<!--      } catch (error) {-->
<!--        console.error("Failed to refresh current order:", error);-->
<!--        this.$message.error(translate('orderManagement.messages.errorLoadingAllData'));-->
<!--      }-->
<!--    },-->
<!--    filterAndSortList(list, filterFn, sortFields) {-->
<!--      const filtered = list.filter(filterFn);-->
<!--      return filtered.sort((a, b) => {-->
<!--        const dateA = sortFields-->
<!--            .map((field) => new Date(a[field]))-->
<!--            .find((date) => !isNaN(date));-->
<!--        const dateB = sortFields-->
<!--            .map((field) => new Date(b[field]))-->
<!--            .find((date) => !isNaN(date));-->
<!--        return dateB - dateA;-->
<!--      });-->
<!--    },-->
<!--    async loadAllData() {-->
<!--      this.loading = true;-->
<!--      try {-->
<!--        await Promise.all([-->
<!--          updateQcOrderStates(),-->
<!--          this.loadAllQcOrders(),-->
<!--          this.loadFormNodes(),-->
<!--          this.loadUserMap(),-->
<!--          this.loadTeamMap(),-->
<!--        ]);-->

<!--      } catch (error) {-->
<!--        console.error("Failed to load data during polling:", error);-->
<!--      } finally {-->
<!--        this.loading = false;-->
<!--      }-->
<!--    },-->
<!--    async loadFormNodes() {-->
<!--      try {-->
<!--        const response = await fetchFormNodes();-->
<!--        const updatedFormMap = generateFormMap(response.data);-->

<!--        if (JSON.stringify(this.formMap) !== JSON.stringify(updatedFormMap)) {-->
<!--          this.formMap = updatedFormMap;-->
<!--        }-->
<!--      } catch (error) {-->
<!--        this.$message.error(translate('orderManagement.messages.errorLoadingFormTree'));-->
<!--      }-->
<!--    },-->
<!--    async loadUserMap() {-->
<!--      try {-->
<!--        const response = await fetchUsers();-->
<!--        const updatedUserMap = response.data.data.content.reduce((map, user) => {-->
<!--          map[user.id] = user;-->
<!--          return map;-->
<!--        }, {});-->

<!--        if (JSON.stringify(this.userMap) !== JSON.stringify(updatedUserMap)) {-->
<!--          this.userMap = updatedUserMap;-->
<!--        }-->
<!--      } catch (error) {-->
<!--        this.$message.error(translate('orderManagement.messages.errorLoadingUsersData'));-->
<!--      }-->
<!--    },-->
<!--    async loadTeamMap() {-->
<!--      try {-->
<!--        const response = await getAllTeamTree();-->
<!--        const teams = response.data?.data || [];-->

<!--        const updatedTeamMap = {};-->

<!--        for (const team of teams) {-->
<!--          const teamId = team.id;-->

<!--          // Fetch associated form_ids-->
<!--          const formResponse = await getFormIdsForTeam(teamId);-->
<!--          const formIds = formResponse.status === 200 ? formResponse.data.data : [];-->

<!--          // Fetch associated user_ids-->
<!--          const userResponse = await getUsersForTeam(teamId);-->
<!--          const userIds = userResponse.status === 200 ? userResponse.data.data.map(user => user.id) : [];-->

<!--          // Add to team object-->
<!--          updatedTeamMap[teamId] = {-->
<!--            ...team,-->
<!--            form_ids: formIds,-->
<!--            user_ids: userIds,-->
<!--          };-->
<!--        }-->

<!--        if (JSON.stringify(this.teamMap) !== JSON.stringify(updatedTeamMap)) {-->
<!--          this.teamMap = updatedTeamMap;-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Failed to load Team Map:", error);-->
<!--        this.$message.error(translate('orderManagement.messages.errorLoadingTeamData'));-->
<!--      }-->
<!--    },-->
<!--    openViewDispatchedTestsDialog() {-->
<!--      this.isDispatchedTestsDialogVisible = true;-->
<!--    },-->
<!--    closeViewDispatchedTestsDialog() {-->
<!--      this.isDispatchedTestsDialogVisible = false;-->
<!--    },-->
<!--    async handleRefreshButton() {-->
<!--      this.searchQuery = "";-->
<!--      await this.loadAllData()-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    this.loadAllData();-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.refresh-button {-->
<!--  background-color: #80cfff; /* Slightly lighter shade of primary color */-->
<!--  border-color: #80cfff; /* Match lighter background */-->
<!--}-->

<!--.refresh-button:hover {-->
<!--  background-color: #66b5ff; /* Slightly darker hover effect */-->
<!--  border-color: #66b5ff;-->
<!--  transform: rotate(360deg); /* Rotate on hover */-->
<!--  transition: transform 0.3s ease-in-out, background-color 0.2s ease; /* Smooth animation */-->
<!--}-->

<!--.refresh-button el-icon {-->
<!--  color: white; /* Darker primary-like color for the refresh icon */-->
<!--}-->

<!--</style>-->
