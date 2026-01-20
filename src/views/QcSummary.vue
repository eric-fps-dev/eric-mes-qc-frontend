<template>
  <div class="qc-summary-grid" v-loading="qcSummaryLoading">
    <!-- Header -->
    <div class="header-area" style="display: flex; justify-content: space-between; align-items: center;">
      <h2>{{ translate('QcSummary.title') }}</h2>
      <div>
        <el-tooltip :content="translate('QcSummary.refresh')" placement="top">
          <el-button
              class="refresh-button"
              type="primary"
              @click="loadSummary"
              circle
          >
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-area">
<!--      <el-select v-model="filters.formId" placeholder="表单类型" style="width: 150px">-->
<!--        <el-option label="原料检测" value="form1" />-->
<!--        <el-option label="成品检测" value="form2" />-->
<!--      </el-select>-->

      <!-- 班组 Flat -->
<!--      <el-select v-model="filters.teamId" placeholder="选择班组" filterable clearable style="width: 120px">-->
<!--        <el-option-->
<!--            v-for="team in teamOptions"-->
<!--            :key="team.id"-->
<!--            :label="team.name"-->
<!--            :value="team.id"-->
<!--        />-->
<!--      </el-select>-->

      <!-- 班组 Hierarchy -->
      <el-tree-select
          v-model="selectedTeamId"
          :placeholder="translate('QcSummary.selectTeam')"
          :data="teamTreeData"
          :render-after-expand="false"
          style="width: 240px"
          clearable
      />

      <!-- 班次 -->
      <el-select v-model="filters.shiftId" :placeholder="translate('QcSummary.selectShift')" filterable clearable style="width: 100px">
        <el-option
            v-for="shift in shifts"
            :key="shift.id"
            :label="shift.name"
            :value="shift.id"
        />
      </el-select>

      <!-- 产品 -->
      <el-select v-model="filters.productId" :placeholder="translate('QcSummary.selectProduct')" filterable clearable style="width: 200px">
        <el-option
            v-for="item in productOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        />
      </el-select>

      <!-- 批次号 -->
      <el-select v-model="filters.batchId" :placeholder="translate('QcSummary.selectBatch')" filterable clearable style="width: 150px">
        <el-option
            v-for="item in batchOptions"
            :key="item.id"
            :label="item.code"
            :value="item.id"
        />
      </el-select>

      <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          unlink-panels
          :start-placeholder="translate('QcSummary.startDate')"
          :end-placeholder="translate('QcSummary.endDate')"
          :shortcuts="shortcuts"
          :teleported="false"
          @blur="() => { }"
          style="width: 280px"
      />

      <el-radio-group v-model="filters.summaryType">
        <el-radio-button label="daily">{{ translate('QcSummary.daily') }}</el-radio-button>
        <el-radio-button label="weekly">{{ translate('QcSummary.weekly') }}</el-radio-button>
        <el-radio-button label="monthly">{{ translate('QcSummary.monthly') }}</el-radio-button>
      </el-radio-group>

      <el-button type="primary" style="margin-top: 0" @click="loadSummary">{{ translate('QcSummary.query') }}</el-button>
      <el-button type="warning" style="margin-top: 0; margin-left: 0" @click="resetFilters">{{ translate('QcSummary.reset') }}</el-button>
    </div>

    <!-- Summary Cards -->
    <div class="card-area">
      <el-card class="summary-card">
        <el-statistic :title="translate('QcSummary.totalBatches')" :value="animatedInt.total_batches" />
      </el-card>
      <el-card class="summary-card">
        <el-statistic :title="translate('QcSummary.abnormalBatches')" :value="animatedInt.abnormal_batches" />
      </el-card>
      <el-card :class="['summary-card', sourceSummary.batch_pass_rate < 0.8 ? 'danger-card' : '', sourceSummary.batch_pass_rate === 1 ? 'success-card' : '']">
      <el-statistic
            :title="translate('QcSummary.batchPassRate')"
            :value="(sourceSummary.batch_pass_rate * 100).toFixed(1)"
      />
      </el-card>
      <el-card class="summary-card clickable-card" @click="scrollToSection('kpi-section')">
        <el-statistic :title="translate('QcSummary.totalPersonnel')" :value="animatedInt.total_personnel" />
      </el-card>
      <el-card class="summary-card">
        <el-statistic :title="translate('QcSummary.totalItems')" :value="animatedInt.total_items" />
      </el-card>
      <el-card class="summary-card">
        <el-statistic :title="translate('QcSummary.abnormalItems')" :value="animatedInt.abnormal_items" />
      </el-card>
      <el-card :class="['summary-card', sourceSummary.item_pass_rate < 0.8 ? 'danger-card' : '', sourceSummary.item_pass_rate === 1 ? 'success-card' : '']">
        <el-statistic
            :title="translate('QcSummary.itemPassRate')"
            :value="(sourceSummary.item_pass_rate * 100).toFixed(1)"
        />
      </el-card>
    </div>

    <!-- Charts -->
    <div class="charts-area">
      <!-- 第一行 -->
      <el-card class="chart-box">
        <a @click="scrollToSection('tablePassRate')" class="chart-title-link">{{ translate('QcSummary.batchPassRateTrend') }}</a>
        <v-chart :option="chartBatchPassRateTrend" :autoresize="true" style="height: 360px; width: 100%;" />
      </el-card>
      <el-card class="chart-box">
        <a @click="scrollToSection('tableAbnormalTeam')" class="chart-title-link">{{ translate('QcSummary.teamAbnormalComparison') }}</a>
        <v-chart :option="chartTeamAbnormalComparison" :autoresize="true" style="height: 360px; width: 100%;" />
      </el-card>

      <!-- 第二行 -->
      <el-card class="chart-box">
        <a @click="scrollToSection('tableAbnormalField')" class="chart-title-link">{{ translate('QcSummary.abnormalTypeDistribution') }}</a>
        <v-chart :option="chartFieldAbnormalPie" :autoresize="true" style="height: 360px; width: 100%;" />
      </el-card>
      <el-card class="chart-box">
        <a @click="scrollToSection('tableAbnormalBatch')" class="chart-title-link">{{ translate('QcSummary.abnormalBatchComparison') }}</a>
        <v-chart :option="chartProductAbnormalBatches" :autoresize="true" style="height: 360px; width: 100%;" />
      </el-card>

      <!-- 第三行 -->
      <el-card class="chart-box">
        <a @click="scrollToSection('tableAbnormalHeatmap')" class="chart-title-link">{{ translate('QcSummary.productDateHeatmap') }}</a>
        <v-chart :option="chartHeatmapByProductDate" :autoresize="true" style="height: 360px; width: 100%;" />
      </el-card>
      <el-card class="chart-box">
        <a @click="scrollToSection('tableInspectorCount')" class="chart-title-link">{{ translate('QcSummary.personnelInspectionCount') }}</a>
        <v-chart :option="chartInspectorFieldCount" :autoresize="true" style="height: 300px; width: 100%;" />
      </el-card>

      <!-- Batch Inspection Count Chart (Full Width) -->
      <el-card class="chart-box chart-box-wide">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <a @click="scrollToSection('tableBatchCount')" class="chart-title-link">{{ translate('QcSummary.batchInspectionCount') }}</a>
            <el-select
                v-model="batchChartSearchKeyword"
                :placeholder="translate('QcSummary.searchBatchCode')"
                filterable
                clearable
                style="width: 250px"
            >
              <el-option
                  v-for="item in batchOptions"
                  :key="item.id"
                  :label="item.code"
                  :value="item.code"
              />
            </el-select>
          </div>
        </template>
        <v-chart ref="batchInspectionChartRef" :option="chartBatchInspectionCount" :autoresize="true" style="height: 600px; width: 100%;" @click="handleBatchChartClick" />
      </el-card>
    </div>

    <!-- 表格：批次合格率趋势 -->
    <el-card id="tablePassRate" class="chart-box">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 {{ translate('QcSummary.batchPassRateTrend') }}</span>
          <el-tooltip :content="translate('QcSummary.exportToExcel')" placement="top">
            <el-icon style="cursor: pointer;" @click="exportPassRateToExcel"><Download /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-table
          :data="paged(tablePassRateByDay, paginationPassRate)"
          size="large"
          border
          height="440"
          scrollbar-always-on
          :row-class-name="getSummaryRowClass"
          :empty-text="translate('common.noData')"
      >
        <el-table-column :label="translate('QcSummary.date')" prop="snapshot_date" sortable />
        <el-table-column :label="translate('QcSummary.totalBatches')" prop="total_batches" sortable />
        <el-table-column :label="translate('QcSummary.abnormalBatches')" prop="abnormal_batches" sortable />
        <el-table-column
            :label="translate('QcSummary.passRate')"
        >
          <template #default="{ row }">{{ (row.pass_rate * 100).toFixed(2) }}%</template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:current-page="paginationPassRate.page"
          :page-size="paginationPassRate.size"
          layout="prev, pager, next"
          :total="tablePassRateByDay.length"
          small
          background
          style="margin-top: 10px"
      />
    </el-card>

    <!-- 表格：班组异常检测项数 -->
    <el-card id="tableAbnormalTeam" class="chart-box">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 {{ translate('QcSummary.teamAbnormalItems') }}</span>
          <el-tooltip :content="translate('QcSummary.exportToExcel')" placement="top">
            <el-icon style="cursor: pointer;" @click="exportAbnormalTeamToExcel"><Download /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-table
          :data="paged(tableAbnormalByTeam, paginationTeam)"
          size="large"
          border
          height="440"
          scrollbar-always-on
          :row-class-name="getSummaryRowClass"
          :empty-text="translate('common.noData')"
      >
        <el-table-column :label="translate('QcSummary.team')" prop="team_name" sortable />
        <el-table-column :label="translate('QcSummary.abnormalFields')" prop="abnormal_fields" sortable />
        <el-table-column :label="translate('QcSummary.normalFields')" prop="normal_fields" sortable />
        <el-table-column
            :label="translate('QcSummary.passRate')"
        >
          <template #default="{ row }">{{ (row.pass_rate * 100).toFixed(2) }}%</template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:current-page="paginationTeam.page"
          :page-size="paginationTeam.size"
          layout="prev, pager, next"
          :total="tableAbnormalByTeam.length"
          small
          background
          style="margin-top: 10px"
      />
    </el-card>

    <!-- 表格：异常检测项分布 -->
    <el-card id="tableAbnormalField" class="chart-box">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 {{ translate('QcSummary.abnormalFieldDistribution') }}</span>
          <el-tooltip :content="translate('QcSummary.exportToExcel')" placement="top">
            <el-icon style="cursor: pointer;" @click="exportAbnormalFieldToExcel"><Download /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-table :data="paged(tableAbnormalRatioByFieldGrouped, paginationField)" size="large" border  height="440" :empty-text="translate('common.noData')" scrollbar-always-on>
        <el-table-column :label="translate('QcSummary.inspectionItem')" prop="label" sortable />
        <el-table-column :label="translate('QcSummary.abnormalCount')" prop="abnormal_count" sortable />
      </el-table>
      <el-pagination
          v-model:current-page="paginationField.page"
          :page-size="paginationField.size"
          layout="prev, pager, next"
          :total="tableAbnormalRatioByFieldGrouped.length"
          small
          background
          style="margin-top: 10px"
      />
    </el-card>

    <!-- 表格：异常批次数对比 -->
    <el-card id="tableAbnormalBatch" class="chart-box">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 {{ translate('QcSummary.abnormalBatchComparison') }}</span>
          <el-tooltip :content="translate('QcSummary.exportToExcel')" placement="top">
            <el-icon style="cursor: pointer;" @click="exportAbnormalProductToExcel"><Download /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-table
          :data="paged(tableAbnormalBatchesByProduct, paginationProduct)"
          size="large"
          border
          height="440"
          scrollbar-always-on
          :row-class-name="getSummaryRowClass"
          :empty-text="translate('common.noData')"
      >
        <el-table-column :label="translate('QcSummary.productName')" prop="product_name" sortable />
        <el-table-column :label="translate('QcSummary.totalBatches')" prop="total_batches" sortable />
        <el-table-column :label="translate('QcSummary.abnormalBatches')" prop="abnormal_batches" sortable />
        <el-table-column
            :label="translate('QcSummary.abnormalRate')"
            sortable
        >
          <template #default="{ row }">{{ (row.abnormal_ratio * 100).toFixed(2) }}%</template>
        </el-table-column>

      </el-table>
      <el-pagination
          v-model:current-page="paginationProduct.page"
          :page-size="paginationProduct.size"
          layout="prev, pager, next"
          :total="tableAbnormalBatchesByProduct.length"
          small
          background
          style="margin-top: 10px"
      />
    </el-card>

    <!-- 表格：产品 × 日期异常热力数据 -->
    <el-card id="tableAbnormalHeatmap" class="chart-box">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 {{ translate('QcSummary.productDateAbnormalData') }}</span>
          <el-tooltip :content="translate('QcSummary.exportToExcel')" placement="top">
            <el-icon style="cursor: pointer;" @click="exportAbnormalHeatmapToExcel"><Download /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-table :data="paged(tableAbnormalHeatmap, paginationHeatmap)" size="large" border  height="440" :empty-text="translate('common.noData')" scrollbar-always-on>
        <el-table-column :label="translate('QcSummary.date')" prop="snapshot_date" sortable />
        <el-table-column :label="translate('QcSummary.product')" prop="product_name" sortable />
        <el-table-column :label="translate('QcSummary.abnormalCount')" prop="abnormal_count" sortable />
      </el-table>
      <el-pagination
          v-model:current-page="paginationHeatmap.page"
          :page-size="paginationHeatmap.size"
          layout="prev, pager, next"
          :total="tableAbnormalHeatmap.length"
          small
          background
          style="margin-top: 10px"
      />
    </el-card>

    <!-- 表格：检验员检测项质检统计 -->
    <el-card id="tableInspectorCount" class="chart-box">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 {{ translate('QcSummary.personnelInspectionStatistics') }}</span>
          <el-tooltip :content="translate('QcSummary.exportToExcel')" placement="top">
            <el-icon style="cursor: pointer;" @click="exportInspectorCountToExcel"><Download /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-table
          :data="paged(tableInspectionCountByPersonnel, paginationInspector)"
          size="large"
          border
          height="440"
          scrollbar-always-on
          :row-class-name="getSummaryRowClass"
          :empty-text="translate('common.noData')"
      >
        <el-table-column :label="translate('QcSummary.inspector')" prop="inspector_name" sortable />
        <el-table-column :label="translate('QcSummary.inspectionCount')" prop="inspection_count" sortable />
        <el-table-column :label="translate('QcSummary.normalCount')" prop="normal_count" sortable />
        <el-table-column :label="translate('QcSummary.abnormalCount')" prop="abnormal_count" sortable />
        <el-table-column
            :label="translate('QcSummary.passRate')"
            sortable
        >
          <template #default="{ row }">{{ (row.pass_rate * 100).toFixed(2) }}%</template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:current-page="paginationInspector.page"
          :page-size="paginationInspector.size"
          layout="prev, pager, next"
          :total="tableInspectionCountByPersonnel.length"
          small
          background
          style="margin-top: 10px"
      />
    </el-card>

    <!-- 表格：批次质检统计 -->
    <el-card id="tableBatchCount" class="chart-box">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 {{ translate('QcSummary.batchInspectionCount') }}</span>
          <div style="display: flex; gap: 10px; align-items: center;">
            <el-select
                v-model="batchTableFilter"
                :placeholder="translate('QcSummary.searchBatchCode')"
                filterable
                clearable
                style="width: 250px"
            >
              <el-option
                  v-for="item in batchOptions"
                  :key="item.id"
                  :label="item.code"
                  :value="item.code"
              />
            </el-select>
            <el-tooltip :content="translate('QcSummary.exportToExcel')" placement="top">
              <el-icon style="cursor: pointer;" @click="exportBatchCountToExcel"><Download /></el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
      <el-table
          :data="paged(filteredBatchTableData, paginationBatch)"
          size="large"
          border
          height="440"
          scrollbar-always-on
          :row-class-name="getSummaryRowClass"
          :empty-text="translate('common.noData')"
      >
        <el-table-column :label="translate('QcSummary.batchCode')" prop="batch_code" width="180" sortable />
        <el-table-column :label="translate('QcSummary.totalInspections')" prop="inspection_count" sortable />
        <el-table-column :label="translate('QcSummary.normalInspection')" prop="normal_count" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableNormalClick(row.batch_code)">{{ row.normal_count }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('QcSummary.abnormalInspection')" prop="abnormal_count" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableAbnormalClick(row.batch_code)">{{ row.abnormal_count }}</span>
          </template>
        </el-table-column>
        <el-table-column
            :label="translate('QcSummary.passRate')"
            sortable
        >
          <template #default="{ row }">
            <span :class="{'pass-rate-low': row.pass_rate < 0.95}">{{ (row.pass_rate * 100).toFixed(2) }}%</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          v-model:current-page="paginationBatch.page"
          :page-size="paginationBatch.size"
          layout="prev, pager, next"
          :total="filteredBatchTableData.length"
          small
          background
          style="margin-top: 10px"
      />
    </el-card>

    <!-- 表格：复检记录列表 -->
    <el-card id="tableRetestRecords" class="chart-box">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📊 {{ translate('QcSummary.retestList') }}</span>
          <el-tooltip :content="translate('QcSummary.exportToExcel')" placement="top">
            <el-icon style="cursor: pointer;" @click="exportRetestRecordsToExcel"><Download /></el-icon>
          </el-tooltip>
        </div>
      </template>
      <el-table
          :data="paged(tableRetestRecords, paginationRetest)"
          size="large"
          border
          height="440"
          scrollbar-always-on
          :empty-text="translate('common.noData')"
      >
        <el-table-column :label="translate('QcSummary.qcForm')" width="200">
          <template #default="scope">
            <el-link
                type="primary"
                :underline="false"
                v-if="scope.row.qc_form_template_id"
                :href="getFormDisplayUrl(scope.row.qc_form_template_id)"
                target="_blank"
            >
              {{ scope.row.qc_form_template_name || '-' }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('QcSummary.approver')" prop="approver_name" :width="100" />
        <el-table-column :label="translate('QcSummary.comments')" prop="comments" :width="240" />
        <el-table-column :label="translate('QcSummary.product')" prop="related_products" :width="200" />
        <el-table-column :label="translate('QcSummary.batch')" prop="related_batches" :width="250" />
        <el-table-column :label="translate('QcSummary.team')" prop="related_teams" :width="100" />
        <el-table-column :label="translate('QcSummary.personnel')" prop="related_inspectors" :width="250" />
        <el-table-column :label="translate('QcSummary.shift')" prop="related_shifts" :width="100" />
        <el-table-column :label="translate('QcSummary.actions')" fixed="right" :width="100">
          <template #default="scope">
            <el-link type="primary" @click="viewDetails(scope.row)">
              {{ translate('QcSummary.view') }}
            </el-link>
          </template>
        </el-table-column>

      </el-table>
      <el-pagination
          v-model:current-page="paginationRetest.page"
          :page-size="paginationRetest.size"
          layout="prev, pager, next"
          :total="tableRetestRecords.length"
          small
          background
          style="margin-top: 10px"
      />
    </el-card>

    <!-- KPI Cards -->
    <div id="kpi-section" v-if="personnelKpi.length">
      <h3 style="margin-bottom: 10px">{{ translate('QcSummary.qcPersonnelStatistics') }}</h3>
      <div
          v-for="(row, idx) in groupedKpiRows"
          :key="'kpi-row-' + idx"
          class="kpi-area"
      >
        <el-card
            v-for="person in row"
            :key="person.inspector_id"
            class="kpi-card"
        >
          👤 {{ person.inspector_name }}：
          <span
              :class="{
        'danger-person': person.abnormal_rate > 0.5,
        'success-person': person.abnormal_rate === 0
      }"
          >
            {{ translate('QcSummary.abnormalRateLabel') }} {{
                      typeof person.abnormal_rate === 'number'
                          ? (person.abnormal_rate * 100).toFixed(1) + '%'
                          : '0.0%'
                    }}
          </span>，
          {{ translate('QcSummary.inspectionFieldsLabel') }} {{ person.total_items_checked }}，
          {{ translate('QcSummary.totalFormsLabel') }} {{ person.forms_submitted }} {{ translate('QcSummary.formsUnit') }}
        </el-card>

      </div>
    </div>

    <div v-if="downloadButtonEnabled" class="floating-download custom-download hoverable-icon">
      <el-tooltip :content="translate('QcSummary.exportReport')" placement="left">
        <el-icon style="font-size: 30px;" @click="handleDocumentExport">
          <Download />
        </el-icon>
      </el-tooltip>
    </div>

    <el-backtop
        :right="60"
        :bottom="270"
        target=".content"
        style="z-index: 999;"
    >
      <div class="custom-backtop hoverable-icon">
        ⮝
      </div>
    </el-backtop>

    <div
        class="custom-backtop hoverable-icon"
        style="position: fixed; right: 60px; bottom: 170px; z-index: 999; cursor: pointer;"
        @click="loadSummary"
    >
      <el-icon><RefreshRight /></el-icon>
    </div>

  </div>

  <QcRecordDetailDialog
      :visible="dialogVisible"
      :selected-form="{ label: currentFormTemplateName }"
      :grouped-details="groupedDetails"
      :basic-info="basicInfo"
      :system-info="systemInfo"
      :e-signature="eSignature"
      :from-approval-page="true"
      @close="dialogVisible = false"
  />

  <!-- Abnormal Inspection Details Dialog -->
  <el-dialog
      v-model="abnormalDetailsDialogVisible"
      :title="`${isAbnormalView ? translate('QcSummary.abnormalInspections') : translate('QcSummary.normalInspections')} - ${translate('QcSummary.batch')} ${selectedBatchCode}`"
      width="80%"
      :close-on-click-modal="false"
  >
    <!-- Search Filter -->
    <div style="margin-bottom: 12px;">
      <el-input
          v-model="abnormalDetailsSearchKeyword"
          :placeholder="translate('QcSummary.searchKeyword')"
          clearable
          style="width: 300px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-table
        :data="filteredAbnormalDetails"
        border
        size="large"
        height="500"
        v-loading="loadingAbnormalDetails"
        :empty-text="translate('common.noData')"
    >
      <el-table-column :label="translate('QcSummary.submissionTime')" prop="submission_time" width="200" sortable>
        <template #default="{ row }">
          {{ row.submission_time ? new Date(row.submission_time).toLocaleString('zh-CN', { hour12: false }) : '-' }}
        </template>
      </el-table-column>
      <el-table-column :label="translate('QcSummary.formTemplate')" prop="form_template_name" width="250">
        <template #default="{ row }">
          <el-link
              v-if="row.qc_form_template_id"
              type="primary"
              :underline="false"
              :href="getFormDisplayUrl(row.qc_form_template_id)"
              target="_blank"
          >
            {{ row.form_template_name }}
          </el-link>
          <span v-else>{{ row.form_template_name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="isAbnormalView ? translate('QcSummary.failedFieldsSummary') : translate('QcSummary.validFieldsSummary')" prop="failed_fields_summary" min-width="350">
        <template #default="{ row }">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
              <div
                  v-for="(field, index) in parseFailedFields(row.failed_fields_summary)"
                  :key="index"
                  style="margin-bottom: 4px; font-size: 13px; line-height: 1.5;"
              >
                <span style="font-weight: 600; color: #303133;">{{ field.fieldName }}:</span>
                <span :style="{color: isAbnormalView ? '#F56C6C' : '#67C23A', marginLeft: '6px'}">{{ field.details }}</span>
              </div>
              <div v-if="parseFailedFields(row.failed_fields_summary).length === 0 && !isAbnormalView" style="color: #909399; font-size: 12px;">
                 No details available
              </div>
            </div>
            <el-icon
                v-if="row.submission_id"
                style="cursor: pointer; font-size: 18px; color: #409EFF; flex-shrink: 0; margin-top: 4px;"
                @click="viewValidationDetailsPopup(row.submission_id, row.collection_name)"
            >
              <View />
            </el-icon>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="isAbnormalView ? translate('QcSummary.failedFieldsCount') : translate('QcSummary.validFieldsCount')" prop="abnormal_field_count" width="120" align="center">
        <template #default="{ row }">
          <el-tag
              :type="isAbnormalView ? 'danger' : 'success'"
              style="cursor: pointer;"
              @click="viewValidationDetailsPopup(row.submission_id, row.collection_name)"
          >
            {{ isAbnormalView ? row.abnormal_field_count : row.normal_field_count }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="translate('QcSummary.inspector')" prop="inspector_name" width="120" />
      <el-table-column :label="translate('QcSummary.shift')" prop="shift_name" width="100" />
      <el-table-column :label="translate('QcSummary.team')" prop="team_name" width="200" />
      <el-table-column :label="translate('QcSummary.product')" prop="product_name" width="150" />
      <el-table-column :label="translate('FormDataSummary.recordTable.submissionId')" prop="submission_id" width="220" />
      <el-table-column :label="translate('QcSummary.actions')" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              link
              @click="viewSubmissionDetail(row.submission_id, row.qc_form_template_id, row.submission_time, row.collection_name)"
              :disabled="!row.submission_id"
          >
            {{ translate('QcSummary.viewDetails') }}
          </el-button>
          <el-button
              v-if="canDelete"
              type="danger"
              size="small"
              link
              @click="deleteSubmissionRecord(row)"
              :disabled="!row.submission_id"
          >
            {{ translate('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button type="primary" @click="exportAbnormalDetailsToExcel">{{ translate('QcSummary.exportToExcel') }}</el-button>
      <el-button @click="abnormalDetailsDialogVisible = false">{{ translate('common.close') }}</el-button>
    </template>
  </el-dialog>

  <!-- Submission Validation Details Dialog (Drill-down from Abnormal Inspections) -->
  <el-dialog
      v-model="submissionDetailDialogVisible"
      :title="`${translate('QcSummary.validationDetails')} - ${selectedSubmissionId}`"
      width="75%"
      :close-on-click-modal="false"
  >
    <el-table
        :data="submissionValidationDetails"
        border
        size="large"
        height="500"
        v-loading="loadingSubmissionDetails"
        :empty-text="translate('common.noData')"
    >
      <el-table-column :label="translate('alarmRecords.table.inspectionItem')" prop="field_label" width="200" />
      <el-table-column :label="translate('QcSummary.fieldType')" prop="field_type" width="150" align="center">
        <template #default="{ row }">
          <el-tag :type="row.field_type === 'number' ? 'info' : 'warning'" size="small">
            {{ row.field_type === 'number' ? translate('QcSummary.numeric') : translate('QcSummary.option') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="translate('alarmRecords.table.inspectionValue')" prop="submitted_value" width="220" align="center">
        <template #default="{ row }">
          <template v-if="row.field_type === 'number'">
            <span>{{ row.submitted_value }}</span>
            <el-icon
                v-if="typeof row.submitted_value === 'number' && typeof row.lower_control_limit === 'number' && row.submitted_value < row.lower_control_limit"
                style="color: #2c4cb3; margin-left: 4px;"
            >
              <ArrowDownBold />
            </el-icon>
            <el-icon
                v-else-if="typeof row.submitted_value === 'number' && typeof row.upper_control_limit === 'number' && row.submitted_value > row.upper_control_limit"
                style="color: #f46666; margin-left: 4px;"
            >
              <ArrowUpBold />
            </el-icon>
          </template>
          <template v-else>
            {{ Array.isArray(row.submitted_value) ? (row.submitted_value.join(', ') || '-') : ((row.submitted_value && row.submitted_value !== 'N/A') ? row.submitted_value : ((row.input_option_labels || []).join(', ') || '-')) }}
          </template>
        </template>
      </el-table-column>
      <el-table-column :label="translate('alarmRecords.table.standardRange')" width="300">
        <template #default="{ row }">
          <span v-if="row.field_type === 'number'">
            {{ row.lower_control_limit }} - {{ row.upper_control_limit }}
          </span>
          <span v-else>
            {{ (row.all_option_labels || []).join(', ') || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="translate('QcSummary.validationResult')" width="280">
        <template #default="{ row }">
            <el-tag :type="row.validation_result === 'Valid' ? 'success' : 'danger'">
              {{ row.validation_result === 'Valid' ? 'Valid' : translate('QcSummary.invalid') }}
            </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="translate('QcSummary.alertTime')" prop="alert_time" width="250">
        <template #default="{ row }">
          {{ row.alert_time ? new Date(row.alert_time).toLocaleString('zh-CN', { hour12: false }) : '-' }}
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="submissionDetailDialogVisible = false">{{ translate('common.close') }}</el-button>
    </template>
  </el-dialog>

  <DownloadProgress
      :visible="downloadingProgress.visible"
      :current="downloadingProgress.current"
      :total="downloadingProgress.total"
  />
</template>

<script setup>
import {
  getPersonnelKPI,
  getDocumentList,
  downloadPdfReport,
  triggerManualSnapshot
} from '@/services/summary/qcSummaryService'
import {exportDocumentsToExcelZip, exportDocumentsToZip} from '@/utils/bulkExportUtil'
import { computed, nextTick, onMounted, reactive, ref, toRef} from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { watch } from 'vue';
import VChart from 'vue-echarts';
import * as echarts from 'echarts/core';
import {Download, RefreshRight, Search, ArrowDownBold, ArrowUpBold, View} from "@element-plus/icons-vue";
import { useTransition } from '@vueuse/core'
import { convertDateRangeToUtc } from '@/utils/time_utils';
import { translate } from '@/utils/i18n';

// Common fields API section
import { getAlActiveSuggestedProducts } from '@/services/production/suggestedProductService';
import { getAllActiveSuggestedBatches } from '@/services/production/suggestedBatchService';
import { getAllTeamTree } from '@/services/teamService';
import { getAllShifts } from '@/services/shiftService';

// Summary API section
import {
  getAbnormalHeatmap,
  getAbnormalRatioByField,
  getCardStats,
  getPassRateByDay
} from '@/services/summary/qcSummaryService'
import { getAbnormalByTeam } from '@/services/summary/qcSummaryService';
import { getAbnormalRatioByFieldGrouped } from '@/services/summary/qcSummaryService';
import { getAbnormalBatchesByProduct } from '@/services/summary/qcSummaryService';
import { getInspectionCountByPersonnel } from '@/services/summary/qcSummaryService';
import { getInspectionCountByBatch } from '@/services/summary/qcSummaryService';
import { getRetestRecords } from '@/services/summary/qcSummaryService';
import { getAbnormalInspectionDetails, getSubmissionValidationDetails, getNormalInspectionDetails } from '@/services/summary/qcSummaryService';
import { deleteTaskSubmissionLog } from "@/services/qcTaskSubmissionLogsService";
import { ElMessageBox, ElMessage } from "element-plus";
import { translateWithParams } from "@/utils/i18n";

// dialogs
import { useViewDetails } from '@/composables/useViewDetails'

const router = useRouter();
const store = useStore();

const canDelete = computed(() => {
  const roleId = store.getters.getUser?.role?.id;
  // Allow Supervisor(1) and Manager(4).
  return [1, 4].includes(roleId);
});

function getFormDisplayUrl(id) {
  const routeData = router.resolve({
    name: 'FormDisplay',
    params: { qcFormTemplateId: id },
    query: { usable: 'false', switchDisplayed: 'false' }
  });
  return routeData.href;
}

// view details
const basicInfo = ref({})
const systemInfo = ref({})
const groupedDetails = ref({})
const eSignature = ref(null)
const dialogVisible = ref(false)
const currentFormTemplateName = ref('')
const { viewDetailsFromRetest } = useViewDetails(basicInfo, systemInfo, groupedDetails, eSignature, dialogVisible)

// Abnormal inspection details dialog
const abnormalDetailsDialogVisible = ref(false)
const isAbnormalView = ref(true)
const abnormalInspectionDetails = ref([])
const loadingAbnormalDetails = ref(false)
const selectedBatchCode = ref('')
const batchInspectionChartRef = ref(null)
const abnormalDetailsSearchKeyword = ref('')

// Batch chart search
const batchChartSearchKeyword = ref('')

// Submission validation details dialog (NEW)
const submissionDetailDialogVisible = ref(false)
const submissionValidationDetails = ref([])
const loadingSubmissionDetails = ref(false)
const selectedSubmissionId = ref('')

// Filtered abnormal details based on search keyword
const filteredAbnormalDetails = computed(() => {
  if (!abnormalDetailsSearchKeyword.value) {
    return abnormalInspectionDetails.value
  }

  const keyword = abnormalDetailsSearchKeyword.value.toLowerCase()
  return abnormalInspectionDetails.value.filter(row => {
    const submissionTimeStr = row.submission_time ? new Date(row.submission_time).toLocaleString('zh-CN', { hour12: false }) : '';
    
    return (
      (row.form_template_name && row.form_template_name.toLowerCase().includes(keyword)) ||
      (row.inspector_name && row.inspector_name.toLowerCase().includes(keyword)) ||
      (row.team_name && row.team_name.toLowerCase().includes(keyword)) ||
      (row.product_name && row.product_name.toLowerCase().includes(keyword)) ||
      (row.shift_name && row.shift_name.toLowerCase().includes(keyword)) ||
      (row.submission_id && row.submission_id.toLowerCase().includes(keyword)) ||
      (row.failed_fields_summary && row.failed_fields_summary.toLowerCase().includes(keyword)) ||
      (String(row.abnormal_field_count ?? '').includes(keyword)) ||
      (submissionTimeStr && submissionTimeStr.toLowerCase().includes(keyword))
    )
  })
})

// Parse failed fields summary into structured format
function parseFailedFields(summary) {
  if (!summary || summary === 'No alert details available' || summary === 'N/A' || summary === '-') {
    return [];
  }

  // Split by " | " to get individual field failures
  const fieldParts = summary.split(' | ').filter(part => part.trim());

  return fieldParts.map(part => {
    // Extract field name (everything before the first colon)
    const colonIndex = part.indexOf(':');
    if (colonIndex === -1) {
      return {
        fieldName: part.trim(),
        details: ''
      };
    }

    const fieldName = part.substring(0, colonIndex).trim();
    let details = part.substring(colonIndex + 1).trim();

    // Remove "Invalid: " prefix if present
    details = details.replace(/^Invalid:\s*/i, '');

    // Format numeric limit violations more clearly
    const limitMatch = details.match(/^([\d.]+)\s*\(limit:\s*([\d.]+)-([\d.]+)\)$/);
    if (limitMatch) {
      const [, value, lower, upper] = limitMatch;
      details = `Value: ${value} (Limit: ${lower}-${upper})`;
    }

    return {
      fieldName,
      details
    };
  });
}

// View validation details in popup (for eye icon and failed count)
async function viewValidationDetailsPopup(submissionId, collectionName) {
  if (!submissionId) return;

  selectedSubmissionId.value = submissionId;
  loadingSubmissionDetails.value = true;

  try {
    const res = await getSubmissionValidationDetails(submissionId, collectionName);
    submissionValidationDetails.value = res.data || [];
    submissionDetailDialogVisible.value = true;
  } catch (error) {
    console.error('Failed to load submission validation details:', error);
    submissionValidationDetails.value = [];
  } finally {
    loadingSubmissionDetails.value = false;
  }
}

// View submission in read-only form (opens in new tab with highlighted invalid fields)
function viewSubmissionDetail(submissionId, templateId, submissionTime, collectionName) {
  if (!submissionId || !templateId || !submissionTime) {
    console.error('Missing required parameters for form view');
    return;
  }

  const query = {
    templateId,
    submissionId,
    createdAt: submissionTime,
    highlight: 'true'
  };

  if (collectionName) {
    query.collectionName = collectionName;
  }

  const routeData = router.resolve({
    path: '/form-view',
    query
  });

  // Open in new tab
  window.open(routeData.href, '_blank');
}

async function deleteSubmissionRecord(row) {
  try {
    await ElMessageBox.confirm(
        translateWithParams("FormDataSummary.recordTable.deleteConfirmMessage", { id: row.submission_id }),
        translate("FormDataSummary.recordTable.deleteConfirmTitle"),
        {
          confirmButtonText: translate("common.confirm"),
          cancelButtonText: translate("common.cancel"),
          type: "warning"
        }
    );

    // Call deletion API
    await deleteTaskSubmissionLog(row.submission_id, row.qc_form_template_id, row.submission_time);

    ElMessage.success(translate("FormDataSummary.recordTable.deleteSuccess"));

    // Refresh the abnormal details table
    await loadAbnormalInspectionDetails(selectedBatchCode.value, isAbnormalView.value);

    // Refresh the main charts and summary cards
    await loadSummary();

  } catch (error) {
    if (error !== "cancel") {
      console.error(translate("FormDataSummary.recordTable.deleteFailed") + ":", error);
      ElMessage.error(translate("FormDataSummary.recordTable.deleteFailed"));
    }
  }
}

// Export Feature
import * as XLSX from 'xlsx';
import QcRecordDetailDialog from "@/components/common/qc/QcRecordDetailDialog.vue";
import DownloadProgress from "@/components/export/DownloadProgress.vue";

const filters = ref({
  productId: null,
  batchId: null,
  teamId: null,
  shiftId: null,
  dateRange: [],
  summaryType: 'weekly'
});

// Chart Images
const chartImages = reactive({
  pass_rate: '',
  abnormal_by_team: '',
  abnormal_ratio: '',
  abnormal_batches_by_product: '',
  kpi_by_inspector: ''
});

const productOptions = ref([]);
const batchOptions = ref([]);
const teamOptions = ref([]);
const teamTreeData = ref([])
const selectedTeamId = ref()
const shifts = ref([]);
const personnelKpi = ref([])
const qcSummaryLoading = ref(false);
const chartDataReady = ref(false);
const loadingSummary = ref(false);
const downloadButtonEnabled = ref(false);
const downloadingProgress = reactive({ visible: false, total: 0, current: 0 });
const groupedKpiRows = computed(() => {
  const rows = []
  for (let i = 0; i < personnelKpi.value.length; i += 2) {
    rows.push(personnelKpi.value.slice(i, i + 2))
  }
  return rows
})

const shortcuts = [
  { text: translate('QcSummary.today'), value: [new Date(), new Date()] },
  { text: translate('QcSummary.last7Days'), value: [new Date(Date.now() - 6 * 86400000), new Date()] },
  { text: translate('QcSummary.thisMonth'), value: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()] }
];

const sourceSummary = ref({
  total_batches: 0,
  abnormal_batches: 0,
  batch_pass_rate: 1,
  total_personnel: 0,
  total_items: 0,
  abnormal_items: 0,
  item_pass_rate: 1
})

// Apply transition
const animated = {
  total_batches: useTransition(toRef(sourceSummary.value, 'total_batches')),
  abnormal_batches: useTransition(toRef(sourceSummary.value, 'abnormal_batches')),
  batch_pass_rate: useTransition(toRef(sourceSummary.value, 'batch_pass_rate')),
  total_personnel: useTransition(toRef(sourceSummary.value, 'total_personnel')),
  total_items: useTransition(toRef(sourceSummary.value, 'total_items')),
  abnormal_items: useTransition(toRef(sourceSummary.value, 'abnormal_items')),
  item_pass_rate: useTransition(toRef(sourceSummary.value, 'item_pass_rate')),
}

// Round integers only
const animatedInt = {
  total_batches: computed(() => Math.round(animated.total_batches.value)),
  abnormal_batches: computed(() => Math.round(animated.abnormal_batches.value)),
  total_personnel: computed(() => Math.round(animated.total_personnel.value)),
  total_items: computed(() => Math.round(animated.total_items.value)),
  abnormal_items: computed(() => Math.round(animated.abnormal_items.value)),
}

// Leave rate fields as decimals
const animatedFloat = {
  batch_pass_rate: computed(() => {
    const val = animated.batch_pass_rate.value
    return typeof val === 'number' && !isNaN(val) ? val : 0
  }),
  item_pass_rate: computed(() => {
    const val = animated.item_pass_rate.value
    return typeof val === 'number' && !isNaN(val) ? val : 0
  }),
}

// column names and export section
const columnsPassRate = [
  { label: translate('QcSummary.date'), prop: 'snapshot_date' },
  { label: translate('QcSummary.totalBatches'), prop: 'total_batches' },
  { label: translate('QcSummary.abnormalBatches'), prop: 'abnormal_batches' },
  { label: translate('QcSummary.passRate'), prop: 'pass_rate' }
];

function exportPassRateToExcel() {
  exportTableToExcel(tablePassRateByDay.value, columnsPassRate, translate('QcSummary.batchPassRateTrend'), translate('QcSummary.batchPassRateTrend') + '.xlsx');
}

const columnsAbnormalTeam = [
  { label: translate('QcSummary.team'), prop: 'team_name' },
  { label: translate('QcSummary.abnormalFields'), prop: 'abnormal_fields' },
  { label: translate('QcSummary.normalFields'), prop: 'normal_fields' },
  { label: translate('QcSummary.passRate'), prop: 'pass_rate' }
];

function exportAbnormalTeamToExcel() {
  exportTableToExcel(tableAbnormalByTeam.value, columnsAbnormalTeam, translate('QcSummary.teamAbnormalItems'), translate('QcSummary.teamAbnormalItems') + '.xlsx');
}

const columnsAbnormalField = [
  { label: translate('QcSummary.inspectionItem'), prop: 'label' },
  { label: translate('QcSummary.abnormalCount'), prop: 'abnormal_count' }
];

function exportAbnormalFieldToExcel() {
  exportTableToExcel(tableAbnormalRatioByFieldGrouped.value, columnsAbnormalField, translate('QcSummary.abnormalFieldDistribution'), translate('QcSummary.abnormalFieldDistribution') + '.xlsx');
}

const columnsAbnormalProduct = [
  { label: translate('QcSummary.productName'), prop: 'product_name' },
  { label: translate('QcSummary.totalBatches'), prop: 'total_batches' },
  { label: translate('QcSummary.abnormalBatches'), prop: 'abnormal_batches' },
  { label: translate('QcSummary.abnormalRate'), prop: 'abnormal_ratio' }
];

function exportAbnormalProductToExcel() {
  exportTableToExcel(tableAbnormalBatchesByProduct.value, columnsAbnormalProduct, translate('QcSummary.abnormalBatchComparison'), translate('QcSummary.abnormalBatchComparison') + '.xlsx');
}

const columnsAbnormalHeatmap = [
  { label: translate('QcSummary.date'), prop: 'snapshot_date' },
  { label: translate('QcSummary.product'), prop: 'product_name' },
  { label: translate('QcSummary.abnormalCount'), prop: 'abnormal_count' }
];

function exportAbnormalHeatmapToExcel() {
  exportTableToExcel(tableAbnormalHeatmap.value, columnsAbnormalHeatmap, translate('QcSummary.productDateAbnormalData'), translate('QcSummary.productDateAbnormalData') + '.xlsx');
}

const columnsInspectorCount = [
  { label: translate('QcSummary.inspector'), prop: 'inspector_name' },
  { label: translate('QcSummary.inspectionCount'), prop: 'inspection_count' },
  { label: translate('QcSummary.normalCount'), prop: 'normal_count' },
  { label: translate('QcSummary.abnormalCount'), prop: 'abnormal_count' },
  { label: translate('QcSummary.passRate'), prop: 'pass_rate' }
];

function exportInspectorCountToExcel() {
  exportTableToExcel(tableInspectionCountByPersonnel.value, columnsInspectorCount, translate('QcSummary.personnelInspectionStatistics'), translate('QcSummary.personnelInspectionStatistics') + '.xlsx');
}

const columnsBatchCount = [
  { label: translate('QcSummary.batchCode'), prop: 'batch_code' },
  { label: translate('QcSummary.totalInspections'), prop: 'inspection_count' },
  { label: translate('QcSummary.normalCount'), prop: 'normal_count' },
  { label: translate('QcSummary.abnormalCount'), prop: 'abnormal_count' },
  { label: translate('QcSummary.passRate'), prop: 'pass_rate' }
];

function exportBatchCountToExcel() {
  exportTableToExcel(filteredBatchTableData.value, columnsBatchCount, translate('QcSummary.batchInspectionCount'), translate('QcSummary.batchInspectionCount') + '.xlsx');
}

const columnsRetestRecords = [
  { label: translate('QcSummary.formName'), prop: 'qc_form_template_name' },
  { label: translate('QcSummary.approver'), prop: 'approver_name' },
  { label: translate('QcSummary.comments'), prop: 'comments' },
  { label: translate('QcSummary.product'), prop: 'related_products' },
  { label: translate('QcSummary.batch'), prop: 'related_batches' },
  { label: translate('QcSummary.team'), prop: 'related_teams' },
  { label: translate('QcSummary.personnel'), prop: 'related_inspectors' },
  { label: translate('QcSummary.shift'), prop: 'related_shifts' }
]

function exportRetestRecordsToExcel() {
  exportTableToExcel(tableRetestRecords.value, columnsRetestRecords, translate('QcSummary.retestList'), translate('QcSummary.retestList') + '.xlsx');
}

// download progress
function onProgress(current, total) {
  downloadingProgress.current = current;
  downloadingProgress.total = total;
  downloadingProgress.visible = true;
}

// charts section
const chartBatchPassRateTrend = ref({
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    name: translate('QcSummary.date'),
    data: []
  },
  yAxis: {
    type: 'value',
    name: translate('QcSummary.passRate'),
    nameTextStyle: {
      padding: [0, 20, 0, 0]
    },
    axisLabel: { formatter: '{value}%' }
  },
  series: [{ name: translate('QcSummary.passRate'), type: 'line', data: [] }]
});

const chartTeamAbnormalComparison = ref({
  tooltip: { trigger: 'axis' },
  legend: { top: 10 },
  xAxis: {
    type: 'category',
    name: translate('QcSummary.team'),
    nameTextStyle: {},
    data: [],
    axisLabel: {
      interval: 0, // Ensure all labels are displayed
      formatter: function (value) {
        return value.length > 5 ? value.slice(0, 5) + '…' : value;
      },
      overflow: 'breakAll', // Ensure labels are not hidden
      width: 60,             // Fixed width to trigger clipping behavior
      ellipsis: true,        // ECharts v5+ support (ignore if ineffective)
    }
  },
  yAxis: {
    name: translate('QcSummary.abnormalCount'),
    nameTextStyle: {
      padding: [0, 20, 0, 0]
    },
    type: 'value'
  },
  series: []
});

const chartFieldAbnormalPie = ref({
  tooltip: { trigger: 'item' },
  legend: {
    top: 'bottom',
    left: 'center',
    show: false
  },
  series: [{
    type: 'pie',
    radius: '60%',
    data: []
  }]
});

const chartProductAbnormalBatches = ref({
  tooltip: {},
  xAxis: {
    type: 'category',
    name: translate('QcSummary.product'),
    nameTextStyle: {
      padding: [10, 50, 0, 0]
    },
    data: [],
    axisLabel: {
      interval: 0,              // display all the labels
      rotate: 30,               // rotate clockwise 30°
      formatter: value => value.length > 7 ? value.slice(0, 7) + '…' : value  // cut too-long text
    }
  },
  yAxis: {
    type: 'value',
    name: translate('QcSummary.batchCount'),
    nameTextStyle: {
      padding: [0, 20, 0, 0]
    }
  },
  series: [{
    type: 'bar',
    data: [],
    itemStyle: { color: '#E6A23C' }
  }]
});

const chartHeatmapByProductDate = ref({
  tooltip: {},
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'category', data: [] },
  visualMap: { min: 0, max: 10, calculable: true, orient: 'horizontal', left: 'center' },
  series: [{ type: 'heatmap', data: [], label: { show: true } }]
});

const chartInspectorFieldCount = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    name: translate('QcSummary.quantity')
  },
  yAxis: {
    type: 'category',
    data: [],
    name: translate('QcSummary.qcPersonnel')
  },
  series: [
    {
      name: translate('QcSummary.normalInspection'),
      type: 'bar',
      stack: 'total',
      label: { show: true },
      emphasis: { focus: 'series' },
      itemStyle: { color: '#409EFF' },
      data: []
    },
    {
      name: translate('QcSummary.abnormalInspection'),
      type: 'bar',
      stack: 'total',
      label: { show: true },
      emphasis: { focus: 'series' },
      itemStyle: { color: '#F56C6C' },
      data: []
    }
  ]
});

// Batch Inspection Count Chart
const chartBatchInspectionCount = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '10%',
    bottom: '3%',
    containLabel: true
  },
  dataZoom: [
    {
      type: 'slider',
      yAxisIndex: 0,
      show: true,
      right: '2%',
      width: 20,
      start: 0,
      end: 100,
      handleSize: '80%',
      showDetail: false
    },
    {
      type: 'inside',
      yAxisIndex: 0
    }
  ],
  xAxis: {
    type: 'value',
    name: translate('QcSummary.quantity')
  },
  yAxis: {
    type: 'category',
    data: [],
    name: translate('QcSummary.batchNo')
  },
  series: [
    {
      name: translate('QcSummary.normalInspection'),
      type: 'bar',
      stack: 'total',
      label: { show: true },
      emphasis: { focus: 'series' },
      itemStyle: { color: '#67C23A' },
      data: []
    },
    {
      name: translate('QcSummary.abnormalInspection'),
      type: 'bar',
      stack: 'total',
      label: { show: true },
      emphasis: { focus: 'series' },
      itemStyle: { color: '#E6A23C' },
      data: []
    }
  ]
});

// table section
const tablePassRateByDay = ref([]);
const tableAbnormalByTeam = ref([]);
const tableAbnormalRatioByFieldGrouped = ref([]);
const tableAbnormalBatchesByProduct = ref([]);
const tableAbnormalHeatmap = ref([]);
const tableInspectionCountByPersonnel = ref([]);
const tableInspectionCountByBatch = ref([]);
const tableRetestRecords = ref([]);

// Batch table filter
const batchTableFilter = ref('');

// Filtered batch table data
const filteredBatchTableData = computed(() => {
  if (!batchTableFilter.value) {
    return tableInspectionCountByBatch.value;
  }
  return tableInspectionCountByBatch.value.filter(item =>
      item.batch_code === batchTableFilter.value
  );
});

// pagination
const paginationPassRate = ref({ page: 1, size: 10 });
const paginationTeam = ref({ page: 1, size: 10 });
const paginationField = ref({ page: 1, size: 10 });
const paginationProduct = ref({ page: 1, size: 10 });
const paginationHeatmap = ref({ page: 1, size: 10 });
const paginationInspector = ref({ page: 1, size: 10 });
const paginationBatch = ref({ page: 1, size: 10 });
const paginationRetest = ref({ page: 1, size: 10 });

function paged(source, { page, size }) {
  const start = (page - 1) * size;
  return source.slice(start, start + size);
}

function setDateRangeBySummaryType(type) {
  const today = new Date();
  if (type === 'daily') {
    filters.value.dateRange = [today, today];
  } else if (type === 'weekly') {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    filters.value.dateRange = [startOfWeek, today];
  } else if (type === 'monthly') {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    filters.value.dateRange = [startOfMonth, today];
  }
}

function exportTableToExcel(data, columns, sheetName, fileName) {
  const exportData = data.map(item => {
    const row = {};
    columns.forEach(col => {
      row[col.label] = item[col.prop];
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
}

function getSummaryRowClass({ row }) {
  if (row.pass_rate !== undefined) {
    if (row.pass_rate === 1.0) {
      return 'success-row'
    }
    if (row.pass_rate < 0.8) {
      return 'warning-row'
    }
  }

  if (row.abnormal_ratio !== undefined && row.abnormal_ratio > 0.8) {
    return 'warning-row'
  }

  return ''
}


function resetFilters() {
  filters.value = {
    productId: null,
    batchId: null,
    teamId: null,
    shiftId: null,
    dateRange: [], // Clear first
    summaryType: 'weekly'
  }

  selectedTeamId.value = null

  // Force trigger date range update logic
  setTimeout(() => {
    setDateRangeBySummaryType(filters.value.summaryType)
    nextTick(() => {
      loadSummary()
    })
  }, 0)
}


function scrollToKpiSection() {
  const el = document.getElementById("kpi-section")
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

// Load dropdown data: products, batches, teams
const fetchCommonFieldOptions = async () => {
  const productResp = await getAlActiveSuggestedProducts();
  const batchResp = await getAllActiveSuggestedBatches();
  const teamResp = await getAllTeamTree();

  productOptions.value = productResp.data || [];
  batchOptions.value = batchResp.data || [];
  // teamOptions.value = teamResp.data.data || [];
  teamTreeData.value = transformTeamTreeToTreeSelectFormat(teamResp.data.data || [])
  console.log('✅ team tree raw =', teamResp.data.data)
};

// Load shift data (not needed for QC personnel page for now)
const fetchQcUsersAndShifts = async () => {
  const shiftResp = await getAllShifts();
  shifts.value = shiftResp.data.data || [];
};

async function loadSummary() {
  qcSummaryLoading.value = true;
  chartDataReady.value = false;
  downloadButtonEnabled.value = false;

  const params = buildFilterParams();

  try {
    // Step 1: trigger manual snapshot insertion (Mongo + retest)
    await triggerManualSnapshot()
        .then(() => {
          console.log("Manual snapshot triggered successfully");
        })
        .catch((err) => {
          console.warn("⚠Manual snapshot trigger failed", err);
        });

    // Step 2: continue loading charts regardless of snapshot trigger result
    await Promise.all([
      fetchSummaryCards(params),
      loadBatchPassRateTrend(params),
      loadTeamAbnormalComparison(params),
      loadFieldAbnormal(params),
      loadProductBatchesAbnormal(params),
      loadProductDate(params),
      loadInspectorFieldCount(params),
      loadBatchInspectionCount(params),
      loadPersonnelKpi(params),
      loadRetestRecords(params)
    ]);

    await extractAllChartImages();
    chartDataReady.value = true;

  } catch (e) {
    console.error(translate('QcSummary.loadChartsFailed') + ':', e);
  } finally {
    qcSummaryLoading.value = false;
  }
}

async function loadPersonnelKpi(params) {
  const res = await getPersonnelKPI(params)
  personnelKpi.value = res.data
}

async function fetchSummaryCards() {
  loadingSummary.value = true;
  const params = buildFilterParams();
  const res = await getCardStats(params);
  if (res?.data?.length) {
    Object.assign(sourceSummary.value, res.data[0])
  }
  loadingSummary.value = false;
}

function buildFilterParams() {
  const [startDateUtc, endDateUtc] = convertDateRangeToUtc(filters.value.dateRange);

  return {
    start_date: startDateUtc,
    end_date: endDateUtc,
    team_id: selectedTeamId.value,
    shift_id: filters.value.shiftId,
    product_id: filters.value.productId,
    batch_id: filters.value.batchId
  };
}
async function loadBatchPassRateTrend(params) {
  const res = await getPassRateByDay(params);
  chartBatchPassRateTrend.value.xAxis.data = res.data.map(item => item.snapshot_date);
  chartBatchPassRateTrend.value.series[0].data = res.data.map(item =>
      (item.pass_rate * 100).toFixed(2)
  );
  tablePassRateByDay.value = res.data;
}

async function loadTeamAbnormalComparison(params) {
  const res = await getAbnormalByTeam(params);
  const data = res.data;
  chartTeamAbnormalComparison.value.xAxis.data = data.map(d => d.team_name);
  chartTeamAbnormalComparison.value.series = [
    {
      name: translate('QcSummary.normalCount'),
      type: 'bar',
      stack: 'total',
      data: data.map(d => d.normal_fields),
      itemStyle: { color: '#5470c6' }
    },
    {
      name: translate('QcSummary.abnormalCount'),
      type: 'bar',
      stack: 'total',
      data: data.map(d => d.abnormal_fields),
      itemStyle: { color: '#F56C6C' }
    }
  ];
  tableAbnormalByTeam.value = data;
}

async function loadFieldAbnormal(params) {
  // Table uses original data (no merging)
  const tableData = await getAbnormalRatioByField(params);
  tableAbnormalRatioByFieldGrouped.value = tableData.data;

  // Chart uses grouped data (merged as "Others")
  const chartData = await getAbnormalRatioByFieldGrouped(params);
  chartFieldAbnormalPie.value.series[0].data = chartData.data.map(item => ({
    name: item.label,
    value: item.abnormal_count
  }));
}

async function loadProductBatchesAbnormal(params) {
  const res = await getAbnormalBatchesByProduct(params);
  const data = res.data.slice(0, 5); // TODO: Read 5 items for now
  chartProductAbnormalBatches.value.xAxis.data = data.map(item => item.product_name);
  chartProductAbnormalBatches.value.series[0].data = data.map(item => item.abnormal_batches);
  tableAbnormalBatchesByProduct.value = res.data;
}

async function loadProductDate(params) {
  const res = await getAbnormalHeatmap(params);
  const raw = res.data;

  if (!raw || raw.length === 0) {
    chartHeatmapByProductDate.value.xAxis.data = [];
    chartHeatmapByProductDate.value.yAxis.data = [];
    chartHeatmapByProductDate.value.series[0].data = [];
    chartHeatmapByProductDate.value.visualMap.max = 10;
    tableAbnormalHeatmap.value = [];
    return;
  }

  // Step: Get top 10 products by total abnormal count
  const productCounts = new Map();
  raw.forEach(item => {
    const name = item.product_name?.trim();
    productCounts.set(name, (productCounts.get(name) || 0) + item.abnormal_count);
  });

  const topProducts = [...productCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

  // Step: Filter raw to only include top 10 products
  const filteredRaw = raw.filter(item =>
      topProducts.includes(item.product_name?.trim())
  );

  const xDates = [...new Set(filteredRaw.map(item => item.snapshot_date))];
  const yProducts = topProducts; // already sorted

  chartHeatmapByProductDate.value.xAxis.data = xDates;
  chartHeatmapByProductDate.value.yAxis.data = yProducts;

  const data = raw.map(item => [
    xDates.indexOf(item.snapshot_date),
    yProducts.indexOf(item.product_name),
    item.abnormal_count
  ]);

  chartHeatmapByProductDate.value.series[0].data = data;

  const max = Math.max(...raw.map(item => item.abnormal_count));
  chartHeatmapByProductDate.value.visualMap.max = max || 10;

  tableAbnormalHeatmap.value = res.data;
}

async function loadInspectorFieldCount(params) {
  const res = await getInspectionCountByPersonnel(params);
  const topN = res.data.slice(0, 7);

  chartInspectorFieldCount.value.yAxis.data = topN.map(item => item.inspector_name);
  chartInspectorFieldCount.value.series[0].data = topN.map(item => item.normal_count);
  chartInspectorFieldCount.value.series[1].data = topN.map(item => item.abnormal_count);

  tableInspectionCountByPersonnel.value = res.data;
}

async function loadBatchInspectionCount(params) {
  const res = await getInspectionCountByBatch(params);

  // Sort by abnormal_count descending (batches with more abnormal inspections first)
  const sortedData = [...res.data].sort((a, b) => b.abnormal_count - a.abnormal_count);

  // Store all data for table
  tableInspectionCountByBatch.value = sortedData;

  // Update chart with all sorted data (filtering will be handled by watcher)
  updateBatchInspectionChart(sortedData);
}

// Helper function to update batch inspection chart
function updateBatchInspectionChart(data) {
  chartBatchInspectionCount.value.yAxis.data = data.map(item => item.batch_code);
  chartBatchInspectionCount.value.series[0].data = data.map(item => item.normal_count);
  chartBatchInspectionCount.value.series[1].data = data.map(item => item.abnormal_count);

  // Adjust dataZoom based on data length
  if (data.length > 20) {
    // Show only first 20 items initially
    const endPercent = Math.min(100, (20 / data.length) * 100);
    chartBatchInspectionCount.value.dataZoom[0].end = endPercent;
  } else {
    // Show all if less than 20
    chartBatchInspectionCount.value.dataZoom[0].end = 100;
  }
}

async function loadRetestRecords(params) {
  const res = await getRetestRecords(params);
  tableRetestRecords.value = res.data;
}

function scrollToSection(refName) {
  const el = document.getElementById(refName);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function viewDetails(row) {
    await viewDetailsFromRetest(row);
    currentFormTemplateName.value = row.qc_form_template_name;
    dialogVisible.value = true;
}

async function handleDocumentExport() {
  downloadingProgress.visible = true;
  downloadingProgress.total = 0;
  downloadingProgress.current = 0;
  const [startDateUtc, endDateUtc] = convertDateRangeToUtc(filters.value.dateRange);

  try {
    const res = await getDocumentList({
      start_date: startDateUtc,
      end_date: endDateUtc,
      team_id: selectedTeamId.value,
      shift_id: filters.value.shiftId,
      product_id: filters.value.productId,
      batch_id: filters.value.batchId
    });

    // Set total to document count + 1 (for the summary PDF)
    const docs = res.data.data;
    downloadingProgress.total = docs.length + 1;
    downloadingProgress.current = 0;
    downloadingProgress.visible = true;

    await exportDocumentsToZip(docs, translate, onProgress);         // PDF
    await exportDocumentsToExcelZip(docs, translate, onProgress);    // Excel

    // Export AI summary report
    await downloadPdfReport({
      start_date: startDateUtc,
      end_date: endDateUtc,
      team_id: selectedTeamId.value,
      shift_id: filters.value.shiftId,
      product_id: filters.value.productId,
      batch_id: filters.value.batchId,
      charts: chartImages
    });

    // update the current
    downloadingProgress.current = downloadingProgress.total;
    downloadingProgress.visible = false;
  } catch (err) {
    console.error("❌ " + translate('QcSummary.exportFailed'), err);
    downloadingProgress.visible = false;
  }
}

async function extractAllChartImages() {
  await nextTick();
  setTimeout(() => {
    const charts = document.querySelectorAll('.echarts');

    charts.forEach((el, index) => {
      const instance = echarts.getInstanceByDom(el);
      if (instance) {
        const base64 = instance.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff'
        });

        // Map known keys in order
        const chartKeys = [
          'pass_rate',
          'abnormal_by_team',
          'abnormal_ratio',
          'abnormal_batches_by_product',
          'product_date_heatmap',
          'kpi_by_inspector'
        ];

        if (index < chartKeys.length) { // TODO: hardcoded now for skipping the heatmap but should find them by the id or title
          chartImages[chartKeys[index]] = base64;
        }
      }
    });

    console.log("✅ chartImages ready to send to backend:", chartImages);
    downloadButtonEnabled.value = true
  }, 2000); // short delay to ensure canvas is painted
}

function transformTeamTreeToTreeSelectFormat(teams) {
  return teams.map(team => ({
    value: team.id,
    label: team.name,
    children: (team.children || []).map(child => ({
      value: child.id,
      label: child.name
    }))
  }))
}

// Handle batch chart click
function handleBatchChartClick(params) {
  if (!params || !params.name) return;

  const batchCode = params.name;
  const seriesName = params.seriesName;

  // Show details for both Normal and Abnormal
  if (seriesName === translate('QcSummary.abnormalInspection') || seriesName === translate('QcSummary.normalInspection')) {
    const isAbnormal = seriesName === translate('QcSummary.abnormalInspection');
    isAbnormalView.value = isAbnormal;
    selectedBatchCode.value = batchCode;
    abnormalDetailsSearchKeyword.value = ''; // Clear search keyword
    loadAbnormalInspectionDetails(batchCode, isAbnormal);
    abnormalDetailsDialogVisible.value = true;
  }
}

// Handle table normal count click
function handleTableNormalClick(batchCode) {
  isAbnormalView.value = false;
  selectedBatchCode.value = batchCode;
  abnormalDetailsSearchKeyword.value = '';
  loadAbnormalInspectionDetails(batchCode, false);
  abnormalDetailsDialogVisible.value = true;
}

// Handle table abnormal count click
function handleTableAbnormalClick(batchCode) {
  isAbnormalView.value = true;
  selectedBatchCode.value = batchCode;
  abnormalDetailsSearchKeyword.value = '';
  loadAbnormalInspectionDetails(batchCode, true);
  abnormalDetailsDialogVisible.value = true;
}

// Load abnormal inspection details for a specific batch
async function loadAbnormalInspectionDetails(batchCode, hasAbnormal = true) {
  loadingAbnormalDetails.value = true;
  const params = buildFilterParams();
  params.batch_code = batchCode;

  try {
    let res;
    if (hasAbnormal) {
      params.has_abnormal = true;
      res = await getAbnormalInspectionDetails(params);
      abnormalInspectionDetails.value = res.data || [];
    } else {
      res = await getNormalInspectionDetails(params);
      const data = res.data || [];
      // Map valid_fields_summary to failed_fields_summary for template compatibility
      abnormalInspectionDetails.value = data.map(item => ({
        ...item,
        failed_fields_summary: item.valid_fields_summary || item.failed_fields_summary
      }));
    }
  } catch (error) {
    console.error('Failed to load inspection details:', error);
    abnormalInspectionDetails.value = [];
  } finally {
    loadingAbnormalDetails.value = false;
  }
}

// Export abnormal details to Excel
function exportAbnormalDetailsToExcel() {
  // Format data for export - clean up failed fields summary
  const exportData = filteredAbnormalDetails.value.map(row => {
    const parsedFields = parseFailedFields(row.failed_fields_summary);
    const formattedSummary = parsedFields.map(field =>
      `${field.fieldName}: ${field.details}`
    ).join('\n');

    return {
      ...row,
      failed_fields_summary: formattedSummary || row.failed_fields_summary
    };
  });

  const columns = [
    { label: translate('QcSummary.submissionTime'), prop: 'submission_time' },
    { label: translate('QcSummary.formTemplate'), prop: 'form_template_name' },
    { label: translate('QcSummary.failedFieldsSummary'), prop: 'failed_fields_summary' },
    { label: translate('QcSummary.inspector'), prop: 'inspector_name' },
    { label: translate('QcSummary.shift'), prop: 'shift_name' },
    { label: translate('QcSummary.team'), prop: 'team_name' },
    { label: translate('QcSummary.product'), prop: 'product_name' },
    { label: translate('QcSummary.failedFieldsCount'), prop: 'abnormal_field_count' }
  ];

  const fileName = `${translate('QcSummary.abnormalInspections')}_${selectedBatchCode.value}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  exportTableToExcel(exportData, columns, translate('QcSummary.abnormalInspections'), fileName);
}

watch(() => filters.value.summaryType, (newType) => {
  setDateRangeBySummaryType(newType);
});

// Watch batch chart search keyword to filter chart data
watch(batchChartSearchKeyword, (keyword) => {
  if (!keyword) {
    // Show all batches when search is cleared
    updateBatchInspectionChart(tableInspectionCountByBatch.value);
  } else {
    // Filter batches by keyword
    const filtered = tableInspectionCountByBatch.value.filter(batch =>
      batch.batch_code.toLowerCase().includes(keyword.toLowerCase())
    );
    updateBatchInspectionChart(filtered);
  }
});

onMounted(() => {
  fetchCommonFieldOptions(); // Load products, batches, teams
  fetchQcUsersAndShifts();  // Load shifts etc.
  setDateRangeBySummaryType(filters.value.summaryType); // Initialize date range
  nextTick(() => {
    loadSummary();
  });
});

</script>

<style scoped>
  .qc-summary-grid {
    display: grid;
    grid-template-rows: auto auto auto auto auto auto auto;
    gap: 10px;
    padding: 5px;
  }

  .header-area { display: flex; justify-content: space-between; align-items: center; }

  .filter-area {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .card-area, .kpi-area {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }

  .summary-card, .kpi-card { text-align: center; font-weight: bold; }

  .charts-area {
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* ✅ Explicit 2 columns */
    gap: 20px;
  }

  .chart-box-wide {
    grid-column: span 2; /* ✅ Full width across 2 columns */
  }

  .pass-rate-low {
    color: #F56C6C;
    font-weight: bold;
  }

  @media (max-width: 900px) {
    .charts-area {
      grid-template-columns: 1fr; /* ✅ Single column stacking on small screens */
    }

    .chart-box-wide {
      grid-column: span 1; /* ✅ Single column on mobile */
    }
  }

  .danger-card {
    background-color: var(--el-color-danger-light-9);
  }

  .success-card {
    background-color: var(--el-color-success-light-9);
  }

  .chart-box {
  }

  .export-area { display: flex; gap: 10px; justify-content: flex-end; }

  .refresh-button {
    width: 40px;
    height: 40px;
    font-size: 20px;
    background-color: #80cfff;
    border-color: #80cfff;
  }

  .refresh-button:hover {
    background-color: #66b5ff;
    border-color: #66b5ff;
    transform: rotate(360deg);
    transition: transform 0.3s ease-in-out, background-color 0.2s ease;
  }

  .export-button {
    background-color: var(--el-color-success);
    border-color: var(--el-color-success);
    color: white;
    size: 20px;
  }

  .export-button:hover {
    background-color: var(--el-color-success-dark-2);
    border-color: var(--el-color-success-dark-2);
    transform: scale(1.1);
    transition: transform 0.2s ease, background-color 0.2s ease;
  }

  .chart-title-link {
    cursor: pointer;
    color: black;
    transition: color 0.2s;
  }

  .chart-title-link:hover {
    color: #66b1ff;
  }

  :deep(.warning-row) {
    background-color: var(--el-color-warning-light-9) !important;
    color: #c0392b;
  }

  :deep(.success-row) {
    background-color: var(--el-color-success-light-9) !important;
    color: #1d7a44;
  }

  :deep(.danger-person) {
    color: #c0392b;
  }
  :deep(.success-person) {
    color: #36a363;
  }

  :deep(.el-statistic__head) {
    font-size: 13px;
    color: #333;
  }

  .clickable-card {
    cursor: pointer;
    transition: box-shadow 0.3s ease, transform 0.2s ease;
  }

  .clickable-card:hover {
    box-shadow: 0 0 12px rgba(64, 158, 255, 0.4);
    transform: translateY(-3px);
  }

  .export-float-button {
    position: fixed;
    right: 60px;
    bottom: 140px; /* Slightly higher than el-backtop */
    background-color: var(--el-color-success);
    border-color: var(--el-color-success);
    color: white;
    z-index: 1000;
    box-shadow: 0 0 10px rgba(0,0,0,0.15);
    transition: transform 0.2s ease, background-color 0.2s ease;
  }

  .export-float-button:hover {
    background-color: var(--el-color-success-dark-2);
    border-color: var(--el-color-success-dark-2);
    transform: scale(1.1);
  }

  .custom-backtop {
    width: 55px !important;
    height: 55px !important;
    background-color: #409EFF;
    color: white;
    font-size: 30px;
    border-radius: 50% !important;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .custom-download {
    width: 55px !important;
    height: 55px !important;
    background-color: #67C23A;
    color: white;
    font-size: 30px;
    border-radius: 50% !important;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .el-backtop {
    width: 55px;
  }

  .floating-download {
    position: fixed;
    right: 60px;
    bottom: 80px;
    z-index: 999;
    cursor: pointer;
  }

  .hoverable-icon {
    transition: transform 0.3s, color 0.3s;
  }

  .hoverable-icon:hover {
    transform: scale(1.2);
  }

  .clickable-count {
    cursor: pointer;
    color: #409EFF;
    font-weight: 500;
    transition: color 0.2s ease, transform 0.2s ease;
    display: inline-block;
  }

  .clickable-count:hover {
    color: #66b1ff;
    transform: scale(1.1);
    text-decoration: underline;
  }
</style>
