<template>
  <el-table
      v-loading="loading"
      :data="sortedAndPaginatedList"
      style="width: 100%"
      @sort-change="handleSortChange"
      :height="tableHeight"
      :empty-text="translate('common.noData')"
  >
    <el-table-column prop="id" :label="translate('orderManagement.Id')" width="100" sortable/>
    <el-table-column prop="name" :label="translate('orderManagement.name')" width="180" sortable show-overflow-tooltip/>
    <el-table-column prop="description" :label="translate('orderManagement.description')" width="180" sortable show-overflow-tooltip/>
    <el-table-column :label="translate('shiftManagement.startTime')" prop="start_time" width="180" sortable>
      <template #default="scope">
        <span>{{ formatTime(scope.row.start_time) }}</span>
      </template>
    </el-table-column>

    <el-table-column :label="translate('shiftManagement.endTime')" prop="end_time" width="180" sortable>
      <template #default="scope">
        <span>{{ formatTime(scope.row.end_time) }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="grace_minute" :label="translate('shiftManagement.graceTimeMinute')" width="230" sortable/>
    <el-table-column prop="created_at" :label="translate('orderManagement.createdAt')" width="180" sortable>
      <template #default="scope">
        <time-slot :value="scope.row.created_at"/>
      </template>
    </el-table-column>
    <el-table-column prop="created_by" :label="translate('orderManagement.createdBy')" width="180" sortable>
      <template #default="scope">
        <UserTagHoverForDetail :user="userMap[scope.row.created_by]"/>
      </template>
    </el-table-column>
    <el-table-column
        :label="translate('userManagement.table.actions')"
        align="right"
        header-align="right"
        width="180"
        fixed="right"
    >
      <template #default="scope">
        <el-button size="small" @click="$emit('edit-shift', scope.row)">
          {{ translate('orderManagement.edit') }}
        </el-button>
        <el-button type="danger" size="small" @click="$emit('delete-shift', scope.row.id)">
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
import { translate } from "@/utils/i18n";
import UserTagHoverForDetail from "@/components/dispatch/UserTagHoverForDetail.vue";

export default {
  components: { TimeSlot, UserTagHoverForDetail },
  emits: ['edit-shift', 'delete-shift'],
  props: {
    shifts: {
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
  watch: {
    shifts: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.originalList = JSON.parse(JSON.stringify(newVal));
        this.filteredList = [...this.originalList];
        this.currentPage = 1;
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
  data() {
    return {
      originalList: [],
      filteredList: [],
      sortSettings: { prop: '', order: '' },
      currentPage: 1,
      pageSize: 15,
      tableHeight: window.innerHeight - 50 - 100 - 20 - 20 - 10,
    };
  },
  methods: {
    translate,
    filterTable(input) {
      const searchText = input.toLowerCase();
      this.filteredList = this.originalList.filter(item => {
        return (
            (item.id && String(item.id).toLowerCase().includes(searchText)) ||
            (item.name && item.name.toLowerCase().includes(searchText)) ||
            (item.description && item.description.toLowerCase().includes(searchText)) ||
            (item.created_at && item.created_at.toString().toLowerCase().includes(searchText)) ||
            (item.created_by && item.created_by.toString().toLowerCase().includes(searchText)) ||
            (item.start_time && item.start_time.toString().toLowerCase().includes(searchText)) ||
            (item.end_time && item.end_time.toString().toLowerCase().includes(searchText)) ||
            (item.grace_minute && String(item.grace_minute).includes(searchText))
        );
      });
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
    },
    handlePageChange(newPage) {
      this.currentPage = newPage;
    },
    handleSortChange({ prop, order }) {
      this.sortSettings = { prop, order };
    },
    forceUpdateTable() {
      this.filteredList = [...this.filteredList];
    },
    updateTableHeight() {
      this.tableHeight = window.innerHeight - 50 - 100 - 20 - 20 - 10;
    },
    formatTime(time) {
      if (!time) return '-'; // Handle null or undefined values
      const date = new Date(`1970-01-01T${time}`);
      return date.toLocaleTimeString('en-US', {hour12: false}); // Format to HH:mm:ss
    },
  },
  computed: {
    sortedAndPaginatedList() {
      const sortedData = [...this.filteredList].sort((a, b) => {
        const { prop, order } = this.sortSettings;
        let valueA, valueB;

        if (!prop || !order) {
          valueA = a.updated_at ? new Date(a.updated_at) : new Date(a.created_at);
          valueB = b.updated_at ? new Date(b.updated_at) : new Date(b.created_at);
        } else {
          if (prop === "created_at" || prop === "updated_at") {
            valueA = a[prop] ? new Date(a[prop]) : new Date(0);
            valueB = b[prop] ? new Date(b[prop]) : new Date(0);
          } else {
            valueA = a[prop];
            valueB = b[prop];
          }
        }

        valueA = valueA ?? 0;
        valueB = valueB ?? 0;

        if (order === "ascending") return valueA - valueB;
        if (order === "descending") return valueB - valueA;

        const tieBreakerA = new Date(a.created_at);
        const tieBreakerB = new Date(b.created_at);
        return tieBreakerA - tieBreakerB;
      });

      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return sortedData.slice(start, end);
    }
  },
  mounted() {
    window.addEventListener("resize", this.updateTableHeight);
    this.updateTableHeight();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateTableHeight);
  }
};
</script>

<style scoped>
</style>
