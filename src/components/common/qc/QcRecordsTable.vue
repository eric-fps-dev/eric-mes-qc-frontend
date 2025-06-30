<template>
  <div>
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <el-input
          v-model="localSearch"
          :placeholder="translate('FormDataSummary.recordTable.searchPlaceholder')"
          @input="emit('search-change', localSearch.trim())"
          clearable
          style="width: 300px; margin-right: 500px"
      />

      <el-button v-if="!props.fromApprovalPage" type="success" style="margin-right: 10px; margin-bottom: 10px" @click="confirmAndExport">
        {{ translate('FormDataSummary.recordTable.exportExcel') }}
      </el-button>

      <el-switch
          v-model="showAlerts"
          active-text="显示告警"
          inactive-text="隐藏告警"
          class="ml-2 mr-2"
          size="large"
          inline-prompt
          style="--el-switch-off-color: #989898; --el-switch-on-color: #409EFF; margin-right: 10px"
      />

      <el-date-picker
          v-if="!props.fromApprovalPage"
          v-model="localDateRange"
          type="datetimerange"
          :shortcuts="shortcuts"
          :range-separator="translate('FormDataSummary.dateRangeSeparator')"
          :start-placeholder="translate('FormDataSummary.startPlaceholder')"
          :end-placeholder="translate('FormDataSummary.endPlaceholder')"
          @change="handleDateRangeChange"
          :clearable="false"
      />
    </div>

    <!-- 表格 -->
    <el-table
        :data="displayedRecords"
        :height="tableHeight"
        row-key="_id"
        lazy
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        :load="load"
        :row-class-name="getRowClass"
        @expand-change="toggleRowHighlight"
        empty-text="暂无数据"
        style="width: 100%; white-space: nowrap;"
        v-loading="loading"
        @sort-change="handleSortChange"
    >
      <el-table-column :label="translate('FormDataSummary.recordTable.groupSystemInfo')" label-class-name="group-header" fixed class-name="section-border-right">
        <el-table-column
            v-if="props.fromApprovalPage"
            prop="版本类型"
            label="版本"
            width="110"
        >
          <template #default="scope">
            <span :style="{
              fontWeight: 'bold',
              color: scope.row._id === latestRecordId ? '#1677ff' : '#606266'
            }">
              {{ scope.row._id === latestRecordId ? '当前版本' : '历史版本' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="提交人" :label="translate('FormDataSummary.recordTable.submitter')" fixed="left" width="150" />
        <el-table-column prop="提交时间" :label="translate('FormDataSummary.recordTable.submittedAt')" fixed="left" width="180" sortable="custom" />
      </el-table-column>

      <el-table-column :label="translate('FormDataSummary.recordTable.groupQcDetails')" label-class-name="group-header" class-name="section-border-right">
        <el-table-column
              v-for="(header, index) in headers"
              :key="index"
              :label="header"
              :prop="header"
              :width="150"
          >
          <template #default="scope">
            <span :style="showAlerts && getAlertIcon(scope.row, header) ? { fontWeight: 'bold' } : {}">
              {{ Array.isArray(scope.row[header]) ? scope.row[header].join(', ') : scope.row[header] }}
              <el-tooltip
                  v-if="showAlerts && getAlertIcon(scope.row, header)"
                  :content="getAlertTooltip(scope.row, header)"
                  placement="top"
              >
                <el-icon :style="getAlertStyle(scope.row, header)" size="18px">
                  <component :is="getAlertIcon(scope.row, header)" />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
        </el-table-column>
      </el-table-column>

      <!-- 表单基础信息字段组 -->
      <el-table-column :label="translate('FormDataSummary.recordTable.groupBasicInfo')" label-class-name="group-header" class-name="section-border-right">
        <el-table-column prop="related_products" label="涉及产品" width="150" />
        <el-table-column prop="related_batches" label="涉及批次" width="150" />
        <el-table-column prop="related_inspectors" label="质检人员" width="150" />
        <el-table-column prop="related_shifts" label="所属班次" width="150" />
        <el-table-column prop="related_teams" label="所属班组" width="150" />
        <el-table-column prop="_id" :label="translate('FormDataSummary.recordTable.submissionId')" fixed="left" width="220" />
      </el-table-column>

      <el-table-column :label="translate('FormDataSummary.recordTable.actions')" fixed="right" :width="props.fromApprovalPage ? 100 : 180">
        <template #default="scope">
          <el-link type="success" @click="$emit('view-details', scope.row)">
            {{ translate('FormDataSummary.recordTable.view') }}
          </el-link>
          <!-- 仅当为顶层版本才显示 编辑 和 删除 -->
          <template v-if="!props.fromApprovalPage && (!scope.row.version_group_id || scope.row.hasChildren)">
            <el-link type="primary" style="margin-left: 10px" @click="$emit('edit-record', scope.row)">
              {{ translate('common.table.editButton') }}
            </el-link>
            <el-link v-if="false" type="danger" style="margin-left: 10px" @click="() => {
                  $emit('delete', scope.row)
                  emit('update:dateRange', [...localDateRange.value]) // 刷新页面
                }">
              {{ translate('FormDataSummary.recordTable.delete') }}
            </el-link>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-if="filteredRecords.length > 0"
        v-model:currentPage="props.currentPage"
        :page-size="props.pageSize"
        :page-sizes="[15, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="props.total"
        @current-change="handlePageChange"
        :current-page="currentPage"
        @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
  import {ref, computed, watch, onMounted, onBeforeUnmount} from 'vue'
  import { translate } from '@/utils/i18n'
  import { useAlertHighlight } from '@/composables/useAlertHighlight'
  import { useQcRecordsDialog } from '@/composables/useQcRecordsDialog'
  import {ElMessageBox} from "element-plus";

  const { loadVersionGroupRecords } = useQcRecordsDialog()

  const latestRecordId = computed(() => {
    if (!props.fromApprovalPage || !props.records?.length) return null
    return [...props.records]
        .sort((a, b) => new Date(b['提交时间']) - new Date(a['提交时间']))[0]?._id
  })

  const props = defineProps({
    records: Array,
    headers: Array,
    currentPage: { type: Number, required: true },
    pageSize:    { type: Number, required: true },
    sort:        { type: String, default: null },
    search:      { type: String, default: '' },
    total:       { type: Number, required: true },
    dateRange: Array,
    loading: Boolean,
    tableHeight: Number,
    qcFormTemplateId: Number,
    fromApprovalPage: Boolean,
  })

  const emit = defineEmits([
    'view-details',
    'delete',
    'edit-record',
    'export-excel',
    'update:dateRange',
    'page-change',
    'size-change',
    'search-change',
    'sort-change'
  ])

  const localSearch = ref(props.search)
  watch(() => props.search, v => localSearch.value = v)
  const localDateRange = ref(props.dateRange || [])
  const currentPage = ref(1)
  const pageSize = ref(15)
  const handleSortChange = ({ prop, order }) => {
    const direction = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : null
    const backendProp = prop === '提交时间' ? 'created_at' : prop
    emit('sort-change', direction ? `${backendProp},${direction}` : null)
  }
  const showAlerts = ref(true)
  const expandedRows = ref(new Set())
  const { getAlertStyle, getAlertIcon, getAlertTooltip } = useAlertHighlight(showAlerts)

  const shortcuts = [
    {
      text: translate('FormDataSummary.shortcuts.thisWeek'),
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - start.getDay() + 1)
        return [start, end]
      }
    },
    {
      text: translate('FormDataSummary.shortcuts.thisMonth'),
      value: () => {
        const now = new Date()
        return [new Date(now.getFullYear(), now.getMonth(), 1), new Date()]
      }
    },
    {
      text: translate('FormDataSummary.shortcuts.lastMonth'),
      value: () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)
        return [start, end]
      }
    },
    {
      text: translate('FormDataSummary.shortcuts.lastThreeMonths'),
      value: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 3);
        return [start, end];
      },
    },
  ]

  const handleDateRangeChange = () => {
    emit('update:dateRange', localDateRange.value)
  }

  const filteredRecords = computed(() => {
    if (!localSearch.value.trim()) return props.records

    return sanitizedRecords.value.filter(record =>
        Object.values(record).some(val =>
            String(val ?? '').toLowerCase().includes(localSearch.value.toLowerCase())
        )
    )
  })

  const sanitizedRecords = computed(() => {
    return props.records.map(r => {
      const clone = JSON.parse(JSON.stringify(r)) // Deep clone to break reference
      delete clone.children
      delete clone.hasChildren
      return clone
    })
  })

  const displayedRecords = computed(() => {
    const allChildIds = new Set(
        sanitizedRecords.value.flatMap(record => record.children?.map(child => child._id) || [])
    )

    const refreshKey = Date.now() // Changes on every compute

    return props.records.map(record => {
      const clone = { ...record, _refreshKey: refreshKey }
      if (record.version_group_id && !allChildIds.has(record._id)) {
        clone.hasChildren = true
      }
      return clone
    })
  })


  watch(() => props.search, (val) => localSearch.value = val)
  watch(
      () => props.dateRange,
      (val) => {
        localDateRange.value = Array.isArray(val) ? [...val] : []
      },
      { immediate: true, deep: true }
  )

  watch(localDateRange, (newVal, oldVal) => {
    console.log("📆 Date range changed from", oldVal, "to", newVal)
  })

  const handlePageChange = (page) => {
    currentPage.value = page
    emit('page-change', page)
  }

  const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1
    emit('size-change', newSize)
  }

  watch(() => props.currentPage, (newVal) => {
    currentPage.value = newVal; // sync from parent
  });

  const load = async (row, treeNode, resolve) => {
    if (!row.version_group_id) return resolve([])
    if (!props.qcFormTemplateId) return resolve([])

    const children = await loadVersionGroupRecords(props.qcFormTemplateId, row.version_group_id)
    const filtered = children.filter(c => c.version !== row.version)

    // 强制剥离 children / hasChildren 字段，防止显示箭头
    const cleaned = filtered.map(child => {
      const cleanChild = JSON.parse(JSON.stringify(child)) // Deep clone to wipe ghosts
      delete cleanChild.children
      delete cleanChild.hasChildren
      return cleanChild
    })

    // 添加子项 ID 到 expandedRows（用于高亮）
    cleaned.forEach(child => expandedRows.value.add(child._id))

    resolve(cleaned)

    // Remove non-expanded expand icons to fix the element plus bug
    setTimeout(() => {
      document.querySelectorAll('.el-table__expand-icon').forEach(icon => {
        const indent = icon.previousElementSibling
        if (indent && indent.classList.contains('el-table__indent')) {
          icon.style.opacity = '0'
          icon.style.pointerEvents = 'none'
        }
      })
    }, 10)
  }

  // css

  const toggleRowHighlight = (row, expanded) => {
    if (expanded) {
      expandedRows.value.add(row._id)
      if (row.children) {
        row.children.forEach(child => expandedRows.value.add(child._id))
      }
    } else {
      expandedRows.value.delete(row._id)
      if (row.children) {
        row.children.forEach(child => expandedRows.value.delete(child._id))
      }
    }
  }

  const getRowClass = ({ row, rowIndex }) => {
    let classes = []

    // 当前展开行高亮
    if (expandedRows.value.has(row._id)) {
      classes.push('expanded-highlight')
    }

    // 如果来自审批页面，首行添加主色背景
    if (props.fromApprovalPage && row._id === latestRecordId.value) {
      classes.push('primary-version-row')
    }

    return classes.join(' ')
  }

  const formatDateTime = (date) => {
    const d = new Date(date)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
  }

  const formatSort = (sortStr) => {
    if (!sortStr) return '无排序';
    const [field, direction] = sortStr.split(',');
    const directionZh = direction === 'asc' ? '升序' : direction === 'desc' ? '降序' : '';
    const fieldZh = field === 'created_at' ? '提交时间' : field;
    return `${fieldZh}（${directionZh}）`;
  };

  const confirmAndExport = async () => {
    const htmlMessage = `
      <div>
        <p><strong>筛选关键词</strong>: ${localSearch.value || '无'}</p>
        <p><strong>时间范围:</strong> ${formatDateTime(localDateRange.value[0])} - ${formatDateTime(localDateRange.value[1])}</p>
        <p><strong>排序字段:</strong> ${formatSort(props.sort)}</p>
        <br/>
        <p>是否继续导出？</p>
      </div>
    `

    const { value } = await ElMessageBox.confirm(
        htmlMessage,
        '导出确认',
        {
          dangerouslyUseHTMLString: true, // required for <br/> to work
          customClass: 'export-confirm-box',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    ).catch(() => ({ value: false }));

    if (value !== false) {
      emit('export-excel');
    }
  };

  onMounted(() => {
    window.refreshQcRecordsTableAfterEditRecord = () => {
      console.log("🔄 refreshing from child edit window");
      emit('update:dateRange', [...localDateRange.value]) // ⬅️ 触发刷新
    }
  })

  onBeforeUnmount(() => {
    delete window.refreshQcRecordsTableAfterEditRecord
  })

  watch(localSearch, (val) => {
    emit('search-change', val.trim())
  })

</script>

<style scoped>
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  ::v-deep(.section-border-right .el-table__cell) {
    border-right: 2px solid #333 !important;
  }

  ::v-deep(.el-table__body-wrapper .expanded-highlight td),
  ::v-deep(.el-table__body-wrapper .expanded-highlight td),
  ::v-deep(.el-table__fixed .el-table__row.expanded-highlight td),
  ::v-deep(.el-table__fixed-left .el-table__row.expanded-highlight td),
  ::v-deep(.el-table__fixed-right .el-table__row.expanded-highlight td) {
    background-color: #e0f3ff !important;
    box-shadow:
      inset 0 -0.5px 0 rgba(128, 128, 128, 0.91),  /* bottom */
      inset -0.5px 0 0 rgba(128, 128, 128, 0.91);  /* left */
  }

  ::v-deep(.el-table__row.primary-version-row td) {
    background-color: #def0fb !important;
  }

  ::v-deep(.export-confirm-box) {
    width: 600px !important;
  }
</style>
