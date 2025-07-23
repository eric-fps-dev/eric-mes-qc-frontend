<template>
  <el-table
      ref="qcOrderTable"
      :data="paginatedQcOrderList"
      style="width: 100%;"
      @selection-change="onSelectionChange"
      @sort-change="handleSortChange"
      :default-sort="{ prop: 'id', order: 'descending' }"
      :height = "tableHeight"
      v-loading="loading"
      :empty-text="translate('common.noData')"
  >
    <!-- Row Selection -->
    <el-table-column
        type="selection"
        width="55">
    </el-table-column>

    <!-- QC Order Name -->
    <el-table-column
        prop="name"
        :label="translate('orderManagement.orderDetailDialog.orderName')"
        width="200"
        sortable
    >
      <template #default="scope">
          <span class="truncate-text clickable-name" @click="clickedNameColumn(scope.row)">
            {{ scope.row.name }}
          </span>
      </template>
    </el-table-column>

    <!-- Order ID -->
    <el-table-column
        prop="id"
        :label="translate('orderManagement.orderId')"
        width="110"
        sortable
    >
    </el-table-column>

    <!-- Order State -->
    <el-table-column
        prop="state"
        :label="translate('orderManagement.orderTable.state')"
        width="230"
        sortable
    >
      <template #default="scope">
        <el-tag :type="getQcOrderStateTagData(scope.row.state).type" size="small" >
          {{ getQcOrderStateTagData(scope.row.state).label }}
        </el-tag>
      </template>
    </el-table-column>

    <!-- Assigned User -->
    <el-table-column
        prop="assignedUsersCount"
        :label="translate('orderManagement.orderTable.associatedUsers')"
        width="200"
    >
      <template #default="scope">
        <div class="tags">
          <UserTagHoverForDetail
            v-for="(userId, index) in getAssignedUsers(scope.row).slice(0,3)"
            :key="userId"
            :user="userMap[userId]"
          />
          <el-tag v-if="getAssignedUsers(scope.row).length > 3" type="info" size="small">
            +{{ getAssignedUsers(scope.row).length - 3 }}
          </el-tag>
        </div>
      </template>
    </el-table-column>

    <!-- Assigned Form -->
    <el-table-column
        prop="assignedFormsCount"
        :label="translate('orderManagement.orderTable.associatedForms')"
        width="200"
    >
      <template #default="scope">
        <div>
          <el-tag
              v-for="(form, index) in getAssignedForms(scope.row).slice(0, 3)"
              :key="form.id"
              type="success"
              size="small"
              effect="light"
              class="tab-container"
          >
            {{ form.name }}
          </el-tag>
          <el-tag v-if="getAssignedForms(scope.row).length > 3" type="info" size="small">
            +{{ getAssignedForms(scope.row).length - 3 }}
          </el-tag>
        </div>
      </template>
    </el-table-column>

    <el-table-column
        prop="dispatch_ids"
        :label="translate('orderManagement.dispatchPlanId')"
        width="200"
    >
      <template #default="scope">
        <div v-if="scope.row.dispatches.length > 0">
          <el-tag
              v-for="dispatch in scope.row.dispatches"
              :key="dispatch.id"
              type="info"
              size="small"
              style=" margin-right: 4px; margin-bottom: 4px;"
          >
            {{ dispatch.id }}
          </el-tag>
        </div>
        <span v-else>-</span> <!-- Show dash when no dispatches -->
      </template>
    </el-table-column>

    <!-- Dispatch Count -->
    <el-table-column
        prop="dispatches.length"
        :label="translate('orderManagement.orderTable.planCount')"
        width="140"
        sortable
    >
      <template #default="scope">
        {{ scope.row.dispatches.length }}
      </template>
    </el-table-column>

    <!-- Created At -->
    <el-table-column
        prop="created_at"
        :label="translate('orderManagement.createdAt')"
        width="180"
        sortable
    >
      <template #default="scope">
        <time-slot :value="scope.row.created_at" />
      </template>
    </el-table-column>

    <!-- Created By -->
    <el-table-column
        prop="created_by"
        :label="translate('orderManagement.createdBy')"
        width="180"
        sortable
    >
      <template #default="scope">
        <UserTagHoverForDetail :user="userMap[scope.row.created_by]"/>
      </template>
    </el-table-column>
  </el-table>

  <!-- Pagination -->
  <el-pagination
      v-if="filteredQcOrders.length > 0"
      style="margin-top: 16px; text-align: right;"
      background
      layout="total, sizes, prev, pager, next"
      :total="filteredQcOrders.length"
      :page-sizes="[15, 30, 45, 60]"
      :page-size="pageSize"
      :current-page="currentPage"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      :height="tableHeight"
  />
</template>

<script>
import {formatDate, getQcOrderStateTagData} from "@/utils/dispatch-utils";
import TimeSlot from "@/components/dispatch/TimeSlot.vue";
import {translate} from "@/utils/i18n";
import UserTagHoverForDetail from "@/components/dispatch/UserTagHoverForDetail.vue";

export default {
  emits: ["order-clicked", "selection-change"],
  components: {
    UserTagHoverForDetail,
    TimeSlot,
  },
  data() {
    return {
      originalQcOrders: [],
      filteredQcOrders: [],
      sortSettings: {prop: '', order: ''}, // store sorting column and order
      currentPage: 1,
      pageSize: 15,
      tableHeight: window.innerHeight - 50 - 100 - 20 - 20 - 10,
    }
  },
  props: {
    qcOrderList: {
      type: Array,
      required: true,
    },
    userMap:{
      type: Object,
      required: true,
    },
    formMap:{
      type: Object,
      required: true,
    },
    searchInput: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    }
  },
  methods: {
    translate,
    getQcOrderStateTagData,
    clickedNameColumn(row) {
      this.$emit("order-clicked", row);
    },
    onSelectionChange(selected) {
      this.$emit("selection-change", selected);
    },
    formatDate(date) {
      return formatDate(date);
    },
    getAssignedUsers(order) {
      if (!order.dispatches || !this.userMap) {
        return [];
      }

      return [...new Set(order.dispatches.flatMap(dispatch => dispatch.user_ids || []))]
    },
    getUniqueUserIds(o) {
      if (!o || !Array.isArray(o.dispatches)) return [];

      const uniqueUserIds = new Set();

      for (const dispatch of o.dispatches) {
        if (Array.isArray(dispatch.user_ids)) {
          for (const userId of dispatch.user_ids) {
            uniqueUserIds.add(userId);
          }
        }
      }

      return Array.from(uniqueUserIds);
    },
    getUniqueFormIds(order) {
      const uniqueFormIds = new Set();

      if (order.dispatches) {
        for (const dispatch of order.dispatches) {
          if (dispatch.form_ids) {
            for (const formId of dispatch.form_ids) {
              uniqueFormIds.add(formId);
            }
          }
        }
      }

      return Array.from(uniqueFormIds);
    },

    getAssignedForms(order) {
      if (!order.dispatches) return [];
      // Get unique form IDs from all dispatches
      const formIds = [...new Set(order.dispatches.flatMap(dispatch => dispatch.form_ids || []))];
      // Map IDs to form objects with name
      return formIds.map(id => ({id, name: this.formMap[id]})).filter(form => form.name);
    },
    filterTable(input) {
      const searchText = input.toLowerCase();
      this.filteredQcOrders = this.originalQcOrders.filter((item) => {
        // Convert state to text label for searching
        const stateText = getQcOrderStateTagData(item.state)?.label?.toLowerCase() || "";

        // Get assigned usernames as a single string
        const assignedUsers = this.getAssignedUsers(item)
            .map(userId => this.userMap[userId]?.name.toLowerCase())
            .join(" ");

        // Get assigned form names as a single string
        const assignedForms = this.getAssignedForms(item)
            .map(form => form.name.toLowerCase())
            .join(" ");

        // Get dispatch IDs as a single string
        const dispatchIds = (item.dispatches || [])
            .map(dispatch => String(dispatch.id))  // Ensure it's a string
            .join(" ");


        return (
            (item.id && String(item.id).toLowerCase().includes(searchText)) ||
            (item.name && item.name.toLowerCase().includes(searchText)) ||
            (item.dispatches && item.dispatches.length.toString().toLowerCase().includes(searchText)) ||
            (item.created_at && item.created_at.toString().toLowerCase().includes(searchText)) ||
            (item.created_by && item.created_by.toString().toLowerCase().includes(searchText)) ||
            (dispatchIds.includes(searchText)) ||
            (stateText.includes(searchText)) || // Search QC Order State
            (assignedUsers.includes(searchText)) || // Search Assigned Users
            (assignedForms.includes(searchText)) // Search Assigned Forms
        );
      });
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.currentPage = 1; // Reset to the first page on size change
    },
    handlePageChange(newPage) {
      this.currentPage = newPage;
    },
    handleSortChange({prop, order}) {
      this.sortSettings = { prop, order };
    },
    updateTableHeight() {
      this.tableHeight = window.innerHeight - 50 - 100 - 20 - 20 - 10;
    },
  },
  computed: {
    paginatedQcOrderList() {
      // Sort the filtered data before applying pagination
      const sortedData = [...this.filteredQcOrders].sort((a, b) => {
        const { prop, order } = this.sortSettings;
        let valueA, valueB;

        if (!prop || !order) {
          // Default sort by `updated_at` (or `created_at` if `updated_at` is null)
          valueA = a.updated_at ? new Date(a.updated_at) : new Date(a.created_at);
          valueB = b.updated_at ? new Date(b.updated_at) : new Date(b.created_at);
        } else {
          switch (prop) {
            case "created_at":
            case "updated_at":
              valueA = a[prop] ? new Date(a[prop]) : new Date(0);
              valueB = b[prop] ? new Date(b[prop]) : new Date(0);
              break;

            case "dispatches.length":
              valueA = a.dispatches.length;
              valueB = b.dispatches.length;
              break;

            case "dispatch_ids":
              valueA = a.dispatches.length;
              valueB = b.dispatches.length;

              if (valueA === valueB) {
                // Extract and sort dispatch IDs
                const dispatchA = (a.dispatches.map(d => d.id) || []).sort((x, y) => x - y);
                const dispatchB = (b.dispatches.map(d => d.id) || []).sort((x, y) => x - y);

                for (let i = 0; i < Math.min(dispatchA.length, dispatchB.length); i++) {
                  if (dispatchA[i] !== dispatchB[i]) {
                    return order === "ascending" ? dispatchA[i] - dispatchB[i] : dispatchB[i] - dispatchA[i];
                  }
                }

                // If all compared elements are equal, compare length
                return order === "ascending" ? dispatchA.length - dispatchB.length : dispatchB.length - dispatchA.length;
              }
              break;

            case "assignedUsersCount":
              valueA = this.getUniqueUserIds(a).length;
              valueB = this.getUniqueUserIds(b).length;

              break;

            case "assignedFormsCount":
              valueA = this.getUniqueFormIds(a).length;
              valueB = this.getUniqueFormIds(b).length;
              break;

            default:
              valueA = a[prop];
              valueB = b[prop];
          }
        }

        // Convert null/undefined values to 0 for consistent sorting
        valueA = valueA ?? 0;
        valueB = valueB ?? 0;

        if (valueA !== valueB) {
          return order === "ascending" ? valueA - valueB : valueB - valueA;
        }

        // If values are identical, tie-break using `created_at`
        const tieBreakerA = new Date(a.created_at);
        const tieBreakerB = new Date(b.created_at);
        return tieBreakerA - tieBreakerB;
      });


      // Apply pagination after sorting
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return sortedData.slice(start, end);
    }
  },
  watch: {
    // Watch for changes in the qcOrderList prop
    qcOrderList: {
      immediate: true,
      deep: true,
      handler(newList) {
        // Load original orders from prop
        this.originalQcOrders = JSON.parse(JSON.stringify(newList));
        this.filteredQcOrders = [...this.originalQcOrders]; // Copy to filtered list
      }
    },
    // Reapply filtering when searchInput changes
    searchInput: {
      immediate: true,
      handler(val) {
        this.filterTable(val);
      }
    }
  },
  mounted() {
    window.addEventListener("resize", this.updateTableHeight);
    this.updateTableHeight();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateTableHeight);
  },
};
</script>

<style scoped>
.clickable-name {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

.clickable-name:hover {
  text-decoration: none;
}

.tab-container {
  margin-right: 8px;
}

.truncate-text {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

.tags {
  gap: 10px;
  display: flex;
  flex-wrap: wrap;
}
</style>
