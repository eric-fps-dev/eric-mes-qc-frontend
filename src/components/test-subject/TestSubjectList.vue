<template>
  <el-table
      v-loading="loading"
      :data="sortedAndPaginatedList"
      style="width: 100%"
      @sort-change="handleSortChange"
      :default-sort="{ prop: 'id', order: 'descending' }"
      :height="tableHeight"
      :empty-text="translate('common.noData')"
  >
    <el-table-column prop="id" :label="translate('orderManagement.Id')" width="80" sortable/>
    <el-table-column prop="name" :label="translate('orderManagement.name')" width="200" sortable show-overflow-tooltip/>
    <el-table-column prop="description" :label="translate('orderManagement.description')" sortable show-overflow-tooltip/>
    <el-table-column prop="created_at" :label="translate('orderManagement.createdAt')" width="180" sortable>
      <template #default="scope">
        <time-slot :value="scope.row.created_at" />
      </template>
    </el-table-column>
    <el-table-column prop="created_by" :label="translate('orderManagement.createdBy')" width="180" sortable>
      <template #default="scope">
        <UserTagHoverForDetail :user="userMap[scope.row.created_by]"/>
      </template>
    </el-table-column>
    <el-table-column
        :label="translate('orderManagement.dispatchedTaskTable.actions')"
        align="right"
        header-align="right"
        width="180"
        fixed="right"
    >
      <template #default="scope">
        <el-button size="small" @click="$emit('edit-test-subject', scope.row)">
          {{ translate('orderManagement.edit') }}
        </el-button>
        <el-button size="small" type="danger" @click="$emit('delete-test-subject', scope.row.id)">
          {{ translate('orderManagement.delete') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- Pagination -->
  <el-pagination
      v-if="filteredList.length > 15"
      background
      style="margin-top: 10px;"
      layout="total, sizes, prev, pager, next"
      :total="filteredList.length"
      :page-size="pageSize"
      :page-sizes="[15, 30, 45, 60]"
      :current-page="currentPage"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      :hide-on-single-page="true"
  />
</template>

<script>
import TimeSlot from "@/components/dispatch/TimeSlot.vue";
import {translate} from "@/utils/i18n";
import UserTagHoverForDetail from "@/components/dispatch/UserTagHoverForDetail.vue";

export default {
  components: {UserTagHoverForDetail, TimeSlot},
  emits: ['edit-test-subject', 'delete-test-subject'],
  props: {
    testSubjects: {
      type: Array,
      required: true,
    },
    searchInput: {
      type: String,
      required: true,
    },
    userMap: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      required: false,
    }
  },
  watch : {
    testSubjects: {
      immediate: true,
      deep: true,
      handler(newVal) {
        // Load original orders from prop
        this.originalList = JSON.parse(JSON.stringify(newVal));
        this.filteredList = [...this.originalList]; // Copy to filtered list

        this.sortSettings = { prop: "id", order: "descending" }; // Ensure sorting order is maintained
        this.currentPage = 1; // Reset pagination to first page
        this.$nextTick(() => {
          this.forceUpdateTable();
        });
      }
    },
    searchInput: {
      immediate: true,
      handler(val) {
        this.filterTable(val);
      }
    }
  },
  data(){
    return {
      originalList: [],
      filteredList: [],
      sortSettings: {prop: '', order: ''}, // store sorting column and order
      currentPage: 1,
      pageSize: 15,
      tableHeight: window.innerHeight - 50 - 100 - 20 - 20 - 10,
    }
  },
  methods: {
    translate,
    filterTable(input) {
      const searchText = input.toLowerCase();
      this.filteredList = this.originalList.filter((item) => {

        return (
            (item.id && String(item.id).toLowerCase().includes(searchText)) ||
            (item.name && item.name.toLowerCase().includes(searchText)) ||
            (item.description && item.description.toLowerCase().includes(searchText)) ||
            (item.created_at && item.created_at.toString().toLowerCase().includes(searchText)) ||
            (item.created_by && item.created_by.toString().toLowerCase().includes(searchText))
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
    forceUpdateTable() {
      // Force Vue to recompute the list by modifying `filteredList`
      this.filteredList = [...this.filteredList]; // Creates a new reference
    },
    updateTableHeight() {
      this.tableHeight = window.innerHeight - 50 - 100 - 20 - 20 - 10;
    },
  },
  computed: {
    sortedAndPaginatedList() {
      // Sorting from columns
      const sortedData = [...this.filteredList].sort((a, b) => {
        const {prop, order} = this.sortSettings;
        let valueA, valueB;

        if (!prop || !order) {
          // if sort setting does not exist, default sort in descending by row's updated_at or if updated_at is null use created_at field
          valueA = a.updated_at ? new Date(a.updated_at) : new Date(a.created_at);
          valueB = b.updated_at ? new Date(b.updated_at) : new Date(b.created_at);
        } else {
          // Extract values based on the column being sorted
          if (prop === "created_at" || prop === "updated_at") {
            valueA = a[prop] ? new Date(a[prop]) : new Date(0);
            valueB = b[prop] ? new Date(b[prop]) : new Date(0);
          } else {
            valueA = a[prop];
            valueB = b[prop];
          }
        }

        // Convert undefined or null values to 0 for sorting consistency
        valueA = valueA ?? 0;
        valueB = valueB ?? 0;

        // Fix sorting order logic
        if (order === "ascending") return valueA - valueB;
        if (order === "descending") return valueB - valueA;  // Fix for incorrect descending order

        // Tie-breaker: Use created_at for consistent sorting
        const tieBreakerA = new Date(a.created_at);
        const tieBreakerB = new Date(b.created_at);
        return tieBreakerA - tieBreakerB;
      });

      // Pagination
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return sortedData.slice(start, end);
    },
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
</style>
