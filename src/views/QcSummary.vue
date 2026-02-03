<template>
  <div class="qc-summary-grid" v-loading="qcSummaryLoading">
    <!-- Header -->
    <div class="header-area" style="display: flex; justify-content: space-between; align-items: center;">
      <h2 style="display: flex; align-items: center; gap: 8px;">
        {{ translate('QcSummary.title') }}
        <el-button link type="info" @click="openTour = true" style="margin-bottom: 20px">
          <el-icon :size="20"><QuestionFilled /></el-icon>
        </el-button>
      </h2>
      <div style="display: flex; gap: 8px;">
        <!-- Weekly Report Subscription Settings -->
        <el-tooltip :content="translate('QcSummary.weeklyReportSettings')" placement="top">
          <el-button
              class="subscription-settings-button"
              type="info"
              @click="showSubscriptionDialog = true"
              circle
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
        <!-- Refresh Button -->
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

      <!-- 表单模板 -->
      <el-select v-model="filters.formTemplateId" :placeholder="translate('QcSummary.formTemplate')" filterable clearable style="width: 200px">
        <el-option
            v-for="item in formTemplateOptions"
            :key="item.id"
            :label="item.name"
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
          style="width: 220px"
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
      <el-card class="chart-box" id="chart-pass-rate">
        <a @click="scrollToSection('tablePassRate')" class="chart-title-link">{{ translate('QcSummary.batchPassRateTrend') }}</a>
        <v-chart :option="chartBatchPassRateTrend" :autoresize="true" style="height: 360px; width: 100%;" @click="handlePassRateTrendClick" />
      </el-card>
      <el-card class="chart-box">
        <a @click="scrollToSection('tableAbnormalTeam')" class="chart-title-link">{{ translate('QcSummary.teamAbnormalComparison') }}</a>
        <v-chart :option="chartTeamAbnormalComparison" :autoresize="true" style="height: 360px; width: 100%;" @click="handleTeamAbnormalClick" />
      </el-card>

      <!-- 第二行 -->
      <el-card class="chart-box">
        <a @click="scrollToSection('tableAbnormalField')" class="chart-title-link">{{ translate('QcSummary.abnormalTypeDistribution') }}</a>
        <v-chart :option="chartFieldAbnormalPie" :autoresize="true" style="height: 360px; width: 100%;" @click="handleAbnormalTypePieClick" />
      </el-card>
      <el-card class="chart-box">
        <a @click="scrollToSection('tableAbnormalBatch')" class="chart-title-link">{{ translate('QcSummary.abnormalBatchComparison') }}</a>
        <v-chart :option="chartProductAbnormalBatches" :autoresize="true" style="height: 360px; width: 100%;" @click="handleProductAbnormalClick" />
      </el-card>

      <!-- 第三行 -->
      <el-card class="chart-box">
        <a @click="scrollToSection('tableAbnormalHeatmap')" class="chart-title-link">{{ translate('QcSummary.productDateHeatmap') }}</a>
        <v-chart :option="chartHeatmapByProductDate" :autoresize="true" style="height: 360px; width: 100%;" @click="handleHeatmapClick" />
      </el-card>
      <el-card class="chart-box">
        <a @click="scrollToSection('tableInspectorCount')" class="chart-title-link">{{ translate('QcSummary.personnelInspectionCount') }}</a>
        <v-chart :option="chartInspectorFieldCount" :autoresize="true" style="height: 300px; width: 100%;" @click="handlePersonnelClick" />
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
        <el-table-column :label="translate('QcSummary.totalBatches')" prop="total_batches" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTablePassRateTotalClick(row)">{{ row.total_batches }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('QcSummary.abnormalBatches')" prop="abnormal_batches" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTablePassRateAbnormalClick(row)">{{ row.abnormal_batches }}</span>
          </template>
        </el-table-column>
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
        <el-table-column :label="translate('QcSummary.abnormalFields')" prop="abnormal_fields" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableTeamAbnormalClick(row)">{{ row.abnormal_fields }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('QcSummary.normalFields')" prop="normal_fields" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableTeamNormalClick(row)">{{ row.normal_fields }}</span>
          </template>
        </el-table-column>
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
        <el-table-column :label="translate('QcSummary.abnormalCount')" prop="abnormal_count" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableFieldAbnormalClick(row)">{{ row.abnormal_count }}</span>
          </template>
        </el-table-column>
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
        <el-table-column :label="translate('QcSummary.totalBatches')" prop="total_batches" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableProductTotalClick(row)">{{ row.total_batches }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('QcSummary.abnormalBatches')" prop="abnormal_batches" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableProductAbnormalClick(row)">{{ row.abnormal_batches }}</span>
          </template>
        </el-table-column>
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
        <el-table-column :label="translate('QcSummary.abnormalCount')" prop="abnormal_count" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableHeatmapAbnormalClick(row)">{{ row.abnormal_count }}</span>
          </template>
        </el-table-column>
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
        <el-table-column :label="translate('QcSummary.inspectionCount')" prop="inspection_count" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableInspectorTotalClick(row)">{{ row.inspection_count }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('QcSummary.normalCount')" prop="normal_count" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableInspectorNormalClick(row)">{{ row.normal_count }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('QcSummary.abnormalCount')" prop="abnormal_count" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableInspectorAbnormalClick(row)">{{ row.abnormal_count }}</span>
          </template>
        </el-table-column>
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
            <span class="clickable-count" @click="handleTableNormalClick(row.batch_code, row.normal_count)">{{ row.normal_count }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="translate('QcSummary.abnormalInspection')" prop="abnormal_count" sortable>
          <template #default="{ row }">
            <span class="clickable-count" @click="handleTableAbnormalClick(row.batch_code, row.abnormal_count)">{{ row.abnormal_count }}</span>
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

    <!-- Tour Guide -->
    <el-tour v-model="openTour" v-model:current="currentTourStep">
      <el-tour-step :title="translate('QcSummary.tour.introTitle')" :description="translate('QcSummary.tour.introDesc')" />
      <el-tour-step target=".filter-area" :title="translate('QcSummary.tour.filterTitle')" :description="translate('QcSummary.tour.filterDesc')" />
      <el-tour-step target="#chart-pass-rate" :title="translate('QcSummary.tour.chartTitle')" :description="translate('QcSummary.tour.chartDesc')" />
      <el-tour-step target=".charts-area .el-table" :title="translate('QcSummary.tour.tableTitle')" :description="translate('QcSummary.tour.tableDesc')" />
      <el-tour-step target=".header-area div[style*='display: flex']" :title="translate('QcSummary.tour.exportTitle')" :description="translate('QcSummary.tour.exportDesc')" />
    </el-tour>

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
          {{ formatClientTime(row.alert_time) }}
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="submissionDetailDialogVisible = false">{{ translate('common.close') }}</el-button>
    </template>
  </el-dialog>

  <!-- Chart Drill-Down Details Dialog -->
  <el-dialog
      v-model="drillDownDialogVisible"
      width="90%"
      :close-on-click-modal="false"
      destroy-on-close
      top="5vh"
  >
    <template #header>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="el-dialog__title">{{ drillDownDialogTitle }}</span>
        <span style="color: #909399; font-size: 14px; font-weight: normal;">
          ({{ translate('QcSummary.totalInspections') }}: {{ drillDownTotal }})
        </span>
      </div>
    </template>

    <!-- Contextual Summary Banner -->
    <div
      v-if="drillDownSummaryMessage"
      style="margin-bottom: 12px; padding: 10px 16px; background-color: #ecf5ff; border-left: 4px solid #409eff; color: #606266; font-size: 14px;"
      v-html="drillDownSummaryMessage"
    ></div>

    <!-- Advanced Filters -->
    <div style="margin-bottom: 16px; background-color: #f5f7fa; padding: 12px; border-radius: 4px;">
      <el-row :gutter="12">
        <el-col :span="4">
          <el-input v-model="drillDownFilters.form_template_name" :placeholder="translate('QcSummary.formTemplate')" clearable @keyup.enter="handleDrillDownFilter" />
        </el-col>
        <el-col :span="4">
          <el-input v-model="drillDownFilters.batch_code" :placeholder="translate('QcSummary.batchCode')" clearable @keyup.enter="handleDrillDownFilter" />
        </el-col>
        <el-col :span="4">
          <el-input v-model="drillDownFilters.inspector_name" :placeholder="translate('QcSummary.inspector')" clearable @keyup.enter="handleDrillDownFilter" />
        </el-col>
        <el-col :span="4">
          <el-input v-model="drillDownFilters.team_name" :placeholder="translate('QcSummary.team')" clearable @keyup.enter="handleDrillDownFilter" />
        </el-col>
        <el-col :span="4">
          <el-input v-model="drillDownFilters.product_name" :placeholder="translate('QcSummary.product')" clearable @keyup.enter="handleDrillDownFilter" />
        </el-col>
        <el-col :span="4">
           <el-input v-model="drillDownFilters.shift_name" :placeholder="translate('QcSummary.shift')" clearable @keyup.enter="handleDrillDownFilter" />
        </el-col>
      </el-row>
      <el-row :gutter="12" style="margin-top: 10px; align-items: center;">
        <el-col :span="4">
          <el-select v-model="drillDownFilters.status" :placeholder="translate('QcSummary.status')" clearable style="width: 100%">
            <el-option label="Normal" value="Normal" />
            <el-option label="Abnormal" value="Abnormal" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-input v-model="drillDownFilters.submission_id" :placeholder="translate('FormDataSummary.recordTable.submissionId')" clearable @keyup.enter="handleDrillDownFilter" />
        </el-col>
        <el-col :span="4">
            <el-input
              v-model="drillDownSearchKeyword"
              :placeholder="translate('QcSummary.searchKeyword')"
              clearable
              @keyup.enter="handleDrillDownFilter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-date-picker
              v-model="drillDownFilters.submission_time"
              type="daterange"
              unlink-panels
              :start-placeholder="translate('FormDataSummary.recordTable.timeRange')"
              :end-placeholder="translate('FormDataSummary.recordTable.timeRange')"
              @change="handleDrillDownFilter"
          />
        </el-col>
        <el-col :span="6" style="display: flex; gap: 5px; justify-content: flex-end; margin-bottom: 10px">
          <el-button type="primary" @click="handleDrillDownFilter">{{ translate('QcSummary.query') }}</el-button>
          <el-button @click="resetDrillDownFilters">{{ translate('QcSummary.reset') }}</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- Data Table -->
    <el-table
        :data="filteredDrillDownData"
        border
        stripe
        height="500"
        v-loading="loadingDrillDown"
        :empty-text="translate('common.noData')"
        @sort-change="handleDrillDownSortChange"
    >
      <!-- Submission Time -->
      <el-table-column
          prop="submission_time"
          :label="translate('QcSummary.submissionTime')"
          width="180"
          sortable="custom"
      >
        <template #default="{ row }">
          {{ formatClientTime(row.submission_time) }}
        </template>
      </el-table-column>

      <!-- Form Template -->
      <el-table-column
          prop="form_template_name"
          :label="translate('QcSummary.formTemplate')"
          min-width="150"
          sortable="custom"
      >
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

      <!-- Batch Code -->
      <el-table-column
          prop="batch_code"
          :label="translate('QcSummary.batchCode')"
          width="150"
          sortable="custom"
      />

      <!-- Status -->
      <el-table-column
          prop="has_abnormal"
          :label="translate('QcSummary.status')"
          width="100"
          sortable="custom"
      >
        <template #default="{ row }">
          <el-tag :type="row.has_abnormal ? 'warning' : 'success'">
            {{ row.has_abnormal ? translate('QcSummary.abnormal') : translate('QcSummary.normal') }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- Failed Fields Summary -->
      <el-table-column
          v-if="drillDownContext.filterParams?.has_abnormal !== false"
          prop="failed_fields_summary"
          :label="translate('QcSummary.failedFieldsSummary')"
          min-width="250"
          show-overflow-tooltip
      >
        <template #default="{ row }">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <div style="flex: 1;">
              <div
                  v-for="(field, index) in parseFailedFields(row.failed_fields_summary).slice(0, 3)"
                  :key="index"
                  style="margin-bottom: 4px; font-size: 13px; line-height: 1.5;"
              >
                <span style="font-weight: 600; color: #303133;">{{ field.fieldName }}:</span>
                <span :style="{color: row.has_abnormal ? '#F56C6C' : '#67C23A', marginLeft: '6px'}">{{ field.details }}</span>
              </div>
              <div v-if="parseFailedFields(row.failed_fields_summary).length > 3" style="font-size: 13px; color: #909399;">
                ...
              </div>
              <div v-if="parseFailedFields(row.failed_fields_summary).length === 0 && !row.has_abnormal" style="color: #67C23A; font-size: 12px;">
                {{ translate('QcSummary.allFieldsValid') || 'All fields valid' }}
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

      <!-- Abnormal Field Count -->
      <el-table-column
          prop="abnormal_field_count"
          :label="translate('QcSummary.failedFieldsCount')"
          width="200"
          align="center"
          sortable="custom"
      >
        <template #default="{ row }">
          <el-tag
              :type="row.abnormal_field_count > 0 ? 'danger' : 'success'"
              style="cursor: pointer;"
              @click="viewValidationDetailsPopup(row.submission_id, row.collection_name)"
          >
            {{ row.abnormal_field_count || 0 }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- Inspector -->
      <el-table-column
          prop="inspector_name"
          :label="translate('QcSummary.inspector')"
          width="180"
          sortable="custom"
      />

      <!-- Team -->
      <el-table-column
          prop="team_name"
          :label="translate('QcSummary.team')"
          width="120"
          sortable="custom"
      />

      <!-- Product -->
      <el-table-column
          prop="product_name"
          :label="translate('QcSummary.product')"
          width="150"
          sortable="custom"
      />

      <!-- Shift -->
      <el-table-column
          prop="shift_name"
          :label="translate('QcSummary.shift')"
          width="100"
          sortable="custom"
      />

      <!-- Submission ID -->
      <el-table-column
          prop="submission_id"
          :label="translate('FormDataSummary.recordTable.submissionId')"
          width="220"
          sortable="custom"
      />

      <!-- Actions -->
      <el-table-column
          :label="translate('QcSummary.actions')"
          width="160"
          fixed="right"
          align="center"
      >
        <template #default="{ row }">
          <el-button
              type="primary"
              size="small"
              link
              @click="viewSubmissionDetail(row.submission_id, row.qc_form_template_id, row.submission_time, row.collection_name)"
              :disabled="!row.submission_id"
              style="margin-bottom: 10px"
          >
            {{ translate('QcSummary.viewDetails') }}
          </el-button>
          <el-button
              v-if="canDelete"
              type="danger"
              size="small"
              link
              @click="deleteDrillDownRecord(row)"
              :disabled="!row.submission_id"
              style="margin-bottom: 10px"
          >
            {{ translate('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination & Footer -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
      <el-pagination
        v-model:current-page="drillDownPagination.page"
        v-model:page-size="drillDownPagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="drillDownTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleDrillDownSizeChange"
        @current-change="handleDrillDownPageChange"
        background
      />
      <div>
        <el-button type="primary" @click="exportDrillDownToExcel">
          <el-icon><Download /></el-icon>
          {{ translate('QcSummary.exportToExcel') }}
        </el-button>
        <el-button @click="drillDownDialogVisible = false">
          {{ translate('common.close') }}
        </el-button>
      </div>
    </div>
  </el-dialog>

  <DownloadProgress
      :visible="downloadingProgress.visible"
      :current="downloadingProgress.current"
      :total="downloadingProgress.total"
  />

  <!-- Weekly Report Subscription Dialog -->
  <WeeklyReportSubscriptionDialog v-model:visible="showSubscriptionDialog" />
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
import { RefreshRight, Download, Setting, Search, View, QuestionFilled } from '@element-plus/icons-vue'
import { useTransition } from '@vueuse/core'
import { convertDateRangeToUtc, formatClientTime } from '@/utils/time_utils';
import { translate } from '@/utils/i18n';

// Common fields API section
import { getAlActiveSuggestedProducts } from '@/services/production/suggestedProductService';
import { getAllActiveSuggestedBatches } from '@/services/production/suggestedBatchService';
import { getAllTeamTree } from '@/services/teamService';
import { getAllShifts } from '@/services/shiftService';
import { getAllActiveTemplates } from '@/services/qcFormTemplateService';

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
import { getAbnormalInspectionDetails, getSubmissionValidationDetails, getNormalInspectionDetails, getInspectionDetails } from '@/services/summary/qcSummaryService';
import { deleteTaskSubmissionLog } from "@/services/qcTaskSubmissionLogsService";
import { ElMessageBox, ElMessage } from "element-plus";
import { translateWithParams } from "@/utils/i18n";

// dialogs
import { useViewDetails } from '@/composables/useViewDetails'
import WeeklyReportSubscriptionDialog from '@/components/subscription/WeeklyReportSubscriptionDialog.vue'

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

// Weekly Report Subscription dialog
const showSubscriptionDialog = ref(false)

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

// Chart drill-down dialog state
const drillDownDialogVisible = ref(false)
const drillDownDialogTitle = ref('')
const drillDownData = ref([])
const drillDownTotal = ref(0)
const loadingDrillDown = ref(false)
const drillDownSearchKeyword = ref('') // Global keyword

// Pagination & Sorting state
const drillDownPagination = reactive({
  page: 1,
  size: 20
})
const drillDownSort = reactive({
  prop: 'submission_time',
  order: 'descending'
})

// Advanced Column Filters
const drillDownFilters = reactive({
  form_template_name: '',
  batch_code: '',
  inspector_name: '',
  team_name: '',
  product_name: '',
  shift_name: '',
  status: '', // 'Abnormal' or 'Normal'
  submission_time: [],
  submission_id: ''
})

const drillDownContext = ref({
  chartType: '',      // 'passRate', 'team', 'abnormalType', 'productBatch', 'heatmap', 'personnel', 'batch'
  filterParams: {},   // Dynamic params based on chart click
  entityName: '',     // e.g. "Drum", "Team A"
  chartValue: null    // The number shown in the chart (e.g. 14 batches)
})

/**
 * Computed message to explain the discrepancy between chart entity count and record count
 */
const drillDownSummaryMessage = computed(() => {
  const totalRecs = drillDownTotal.value;
  const { chartType, entityName, chartValue } = drillDownContext.value;

  if (!chartType) return '';

  const recordLabel = translate('QcSummary.records') || 'records';
  const inspectionsLabel = translate('QcSummary.totalInspections') || 'Total Inspections';

  switch (chartType) {
    case 'passRate':
      if (chartValue !== null) {
        return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('QcSummary.belongingTo')} <b>${chartValue}</b> ${translate('QcSummary.uniqueBatches')} ${translate('common.on')} <b>${entityName}</b>.`;
      }
      return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('common.on')} <b>${entityName}</b>.`;

    case 'team':
      return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('common.for')} ${translate('QcSummary.team')} <b>${entityName}</b>.`;

    case 'abnormalType':
      return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('QcSummary.withDefect')} <b>${entityName}</b>.`;

    case 'productBatch':
      if (chartValue !== null) {
        return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('QcSummary.belongingTo')} <b>${chartValue}</b> ${translate('QcSummary.uniqueBatches')} ${translate('common.of')} <b>${entityName}</b>.`;
      }
      return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('common.for')} <b>${entityName}</b>.`;

    case 'heatmap':
      return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('common.for')} <b>${entityName}</b> ${translate('common.on')} <b>${drillDownContext.value.filterParams.date}</b>.`;

    case 'personnel':
      return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('QcSummary.performedBy')} <b>${entityName}</b>.`;

    case 'batch':
      return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel} ${translate('QcSummary.belongingTo')} ${translate('QcSummary.batch')} <b>${entityName}</b>.`;

    default:
      return `${translate('QcSummary.showing')} <b>${totalRecs}</b> ${recordLabel}.`;
  }
});

// Filtered abnormal details based on search keyword
const filteredAbnormalDetails = computed(() => {
  if (!abnormalDetailsSearchKeyword.value) {
    return abnormalInspectionDetails.value
  }

  const keyword = abnormalDetailsSearchKeyword.value.toLowerCase()
  return abnormalInspectionDetails.value.filter(row => {
    const submissionTimeStr = formatClientTime(row.submission_time);

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

// Computed property - now just passes through data as filtering is backend-side
// Keeping the name for compatibility with template, but logic is simplified
const filteredDrillDownData = computed(() => {
  return drillDownData.value;
});

/**
 * Load drill-down data with context-specific filters + pagination/sorting/search
 * @param {Object} contextFilters - Chart-specific filter params (optional, defaults to current context)
 */
async function loadDrillDownData(contextFilters) {
  loadingDrillDown.value = true;

  // If contextFilters provided, it's a new drill-down opening, so reset pagination
  if (contextFilters) {
    drillDownPagination.page = 1;
    drillDownData.value = []; // Clear data only on new open

    // Reset filters
    drillDownSearchKeyword.value = '';
    Object.keys(drillDownFilters).forEach(key => {
      if (Array.isArray(drillDownFilters[key])) {
        drillDownFilters[key] = [];
      } else {
        drillDownFilters[key] = '';
      }
    });
  }

  try {
    // Trim string filters
    const trimmedKeyword = drillDownSearchKeyword.value ? drillDownSearchKeyword.value.trim() : null;
    const trimmedFilters = {};
    Object.keys(drillDownFilters).forEach(key => {
      const val = drillDownFilters[key];
      if (typeof val === 'string') {
        trimmedFilters[key] = val.trim() || null;
      } else {
        trimmedFilters[key] = val;
      }
    });

    // Merge global filters with context-specific filters
    const params = {
      ...buildFilterParams(),
      ...(contextFilters || drillDownContext.value.filterParams),
      // Pagination
      page: drillDownPagination.page,
      size: drillDownPagination.size,
      // Sorting
      sort_by: drillDownSort.prop,
      sort_order: drillDownSort.order,
      // Global Search
      keyword: trimmedKeyword,
      // Column Filters
      form_template_name_filter: trimmedFilters.form_template_name,
      batch_code_filter: trimmedFilters.batch_code,
      inspector_name_filter: trimmedFilters.inspector_name,
      team_name_filter: trimmedFilters.team_name,
      product_name_filter: trimmedFilters.product_name,
      shift_name_filter: trimmedFilters.shift_name,
      status_filter: trimmedFilters.status,
      submission_id_filter: trimmedFilters.submission_id
    };

    if (drillDownFilters.submission_time && drillDownFilters.submission_time.length === 2) {
      const [startUtc, endUtc] = convertDateRangeToUtc(drillDownFilters.submission_time);
      params.submission_start_time = startUtc;
      params.submission_end_time = endUtc;
    }

    const res = await getInspectionDetails(params);
    drillDownData.value = res.data.data || [];
    drillDownTotal.value = res.data.total || 0;
  } catch (error) {
    console.error('Failed to load drill-down data:', error);
    drillDownData.value = [];
    drillDownTotal.value = 0;
    ElMessage.error(translate('QcSummary.loadChartsFailed'));
  } finally {
    loadingDrillDown.value = false;
  }
}

// Handlers for Pagination
function handleDrillDownPageChange(newPage) {
  drillDownPagination.page = newPage;
  loadDrillDownData();
}

function handleDrillDownSizeChange(newSize) {
  drillDownPagination.size = newSize;
  drillDownPagination.page = 1; // Reset to first page
  loadDrillDownData();
}

// Handler for Sorting
function handleDrillDownSortChange({ prop, order }) {
  drillDownSort.prop = prop;
  drillDownSort.order = order;
  loadDrillDownData();
}

// Handler for Filter Search
function handleDrillDownFilter() {
  drillDownPagination.page = 1; // Reset to first page on filter
  loadDrillDownData();
}

// Handler for Filter Reset
function resetDrillDownFilters() {
  drillDownSearchKeyword.value = '';
  Object.keys(drillDownFilters).forEach(key => {
    if (Array.isArray(drillDownFilters[key])) {
      drillDownFilters[key] = [];
    } else {
      drillDownFilters[key] = '';
    }
  });
  drillDownPagination.page = 1;
  loadDrillDownData();
}

/**
 * Export drill-down data to Excel
 */
async function exportDrillDownToExcel() {
  try {
    loadingDrillDown.value = true;

    // Trim string filters
    const trimmedKeyword = drillDownSearchKeyword.value ? drillDownSearchKeyword.value.trim() : null;
    const trimmedFilters = {};
    Object.keys(drillDownFilters).forEach(key => {
      const val = drillDownFilters[key];
      if (typeof val === 'string') {
        trimmedFilters[key] = val.trim() || null;
      } else {
        trimmedFilters[key] = val;
      }
    });

    // Prepare params for full export (large size to get all)
    const downloadParams = {
      ...buildFilterParams(),
      ...(drillDownContext.value.filterParams),
      page: 1,
      size: 10000, // Export limit
      sort_by: drillDownSort.prop,
      sort_order: drillDownSort.order,
      keyword: trimmedKeyword,
      form_template_name_filter: trimmedFilters.form_template_name,
      batch_code_filter: trimmedFilters.batch_code,
      inspector_name_filter: trimmedFilters.inspector_name,
      team_name_filter: trimmedFilters.team_name,
      product_name_filter: trimmedFilters.product_name,
      shift_name_filter: trimmedFilters.shift_name,
      status_filter: trimmedFilters.status,
      submission_id_filter: trimmedFilters.submission_id
    };

    if (drillDownFilters.submission_time && drillDownFilters.submission_time.length === 2) {
      const [startUtc, endUtc] = convertDateRangeToUtc(drillDownFilters.submission_time);
      downloadParams.submission_start_time = startUtc;
      downloadParams.submission_end_time = endUtc;
    }

    const res = await getInspectionDetails(downloadParams);    const allData = res.data.data || [];

    const exportData = allData.map(row => {
      const parsedFields = parseFailedFields(row.failed_fields_summary);
      const formattedSummary = parsedFields.map(field =>
        `${field.fieldName}: ${field.details}`
      ).join('\n');

      return {
        ...row,
        submission_time: formatClientTime(row.submission_time),
        failed_fields_summary: formattedSummary || row.failed_fields_summary
      };
    });

    const columns = [
      { label: translate('QcSummary.submissionTime'), prop: 'submission_time' },
      { label: translate('QcSummary.formTemplate'), prop: 'form_template_name' },
      { label: translate('QcSummary.batchCode'), prop: 'batch_code' },
      { label: translate('QcSummary.status'), prop: 'has_abnormal' },
      { label: translate('QcSummary.failedFieldsSummary'), prop: 'failed_fields_summary' },
      { label: translate('QcSummary.failedFieldsCount'), prop: 'abnormal_field_count' },
      { label: translate('QcSummary.inspector'), prop: 'inspector_name' },
      { label: translate('QcSummary.team'), prop: 'team_name' },
      { label: translate('QcSummary.product'), prop: 'product_name' },
      { label: translate('QcSummary.shift'), prop: 'shift_name' },
      { label: translate('FormDataSummary.recordTable.submissionId'), prop: 'submission_id' }
    ];

    // Build filename with criteria
    const criteria = [];
    if (drillDownContext.value.chartType) criteria.push(drillDownContext.value.chartType);
    if (drillDownFilters.batch_code) criteria.push(drillDownFilters.batch_code);
    if (drillDownFilters.status) criteria.push(drillDownFilters.status);

    const criteriaStr = criteria.length > 0 ? `-${criteria.join('-')}` : '';
    const fileName = `drill-down${criteriaStr}-${new Date().toISOString().slice(0, 10)}.xlsx`;

    exportTableToExcel(exportData, columns, translate('QcSummary.drillDownDetails') || 'Drill Down Details', fileName);
  } catch (error) {
    console.error('Export failed:', error);
    ElMessage.error(translate('QcSummary.exportFailed'));
  } finally {
    loadingDrillDown.value = false;
  }
}

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
  submissionValidationDetails.value = [];
  submissionDetailDialogVisible.value = true;

  try {
    const res = await getSubmissionValidationDetails(submissionId, collectionName);
    submissionValidationDetails.value = res.data || [];
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

// Delete record from drill-down dialog
async function deleteDrillDownRecord(row) {
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

    // Refresh the drill-down data using stored context
    await loadDrillDownData(drillDownContext.value.filterParams);

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
  formTemplateId: null,
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
const formTemplateOptions = ref([]);
const teamOptions = ref([]);
const teamTreeData = ref([])
const selectedTeamId = ref()
const shifts = ref([]);
const personnelKpi = ref([])
const qcSummaryLoading = ref(false);
const chartDataReady = ref(false);
const loadingSummary = ref(false);
const downloadButtonEnabled = ref(false);

// Tour state
const openTour = ref(false)
const currentTourStep = ref(0)

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
    formTemplateId: null,
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
  const templateResp = await getAllActiveTemplates();

  productOptions.value = productResp.data || [];
  batchOptions.value = batchResp.data || [];
  formTemplateOptions.value = templateResp?.data?.data || templateResp?.data || [];
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
    batch_id: filters.value.batchId,
    form_template_id: filters.value.formTemplateId
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
      batch_id: filters.value.batchId,
      form_template_id: filters.value.formTemplateId
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
      form_template_id: filters.value.formTemplateId,
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

  // Find batch_id from table data
  const batchData = tableInspectionCountByBatch.value.find(b => b.batch_code === batchCode);
  const batchId = batchData ? batchData.batch_id : null;

    // Show details for both Normal and Abnormal
    if (seriesName === translate('QcSummary.abnormalInspection') || seriesName === translate('QcSummary.normalInspection')) {
      const isAbnormal = seriesName === translate('QcSummary.abnormalInspection');

      drillDownDialogTitle.value = `${translate('QcSummary.batch')} ${batchCode} - ${seriesName}`;
      drillDownContext.value = {
        chartType: 'batch',
        filterParams: {
          batch_code: batchCode,
          batch_id: batchId,
          has_abnormal: isAbnormal
        },
        entityName: batchCode,
        chartValue: params.value
      };

      loadDrillDownData({
        batch_code: batchCode,
        batch_id: batchId,
        has_abnormal: isAbnormal
      });
      drillDownDialogVisible.value = true;
    }
  }
// Chart 1: Batch Pass Rate Trend - Click handler
function handlePassRateTrendClick(params) {
  if (!params || !params.name) return;

  const date = params.name;  // X-axis label is the date

  drillDownDialogTitle.value = `${translate('QcSummary.allInspections')} - ${date}`;
  drillDownContext.value = {
    chartType: 'passRate',
    filterParams: { date: date },
    entityName: date,
    chartValue: null
  };

  loadDrillDownData({ date: date });
  drillDownDialogVisible.value = true;
}

// Chart 2: Team QC Item Abnormal Comparison - Click handler
function handleTeamAbnormalClick(params) {
  if (!params || !params.name) return;

  const teamName = params.name;
  const seriesName = params.seriesName;

  // Find team_id from the data
  const teamData = tableAbnormalByTeam.value.find(t => t.team_name === teamName);
  if (!teamData) return;

  const isAbnormal = seriesName === translate('QcSummary.abnormalCount');

  drillDownDialogTitle.value = `${teamName} - ${seriesName}`;
  drillDownContext.value = {
    chartType: 'team',
    filterParams: {
      filter_team_id: teamData.team_id,
      has_abnormal: isAbnormal
    },
    entityName: teamName,
    chartValue: params.value
  };

  loadDrillDownData({
    filter_team_id: teamData.team_id,
    has_abnormal: isAbnormal
  });
  drillDownDialogVisible.value = true;
}

// Chart 3: Abnormal Type Distribution (Pie) - Click handler
function handleAbnormalTypePieClick(params) {
  if (!params || !params.name) return;

  const fieldLabel = params.name;  // Pie slice name is the field label

  // Handle "Others" slice
  if (fieldLabel === 'Others') {
    drillDownDialogTitle.value = `${translate('QcSummary.abnormalInspections')} - ${fieldLabel}`;
    drillDownContext.value = {
      chartType: 'abnormalType',
      filterParams: { has_abnormal: true },
      entityName: fieldLabel,
      chartValue: params.value
    };
    loadDrillDownData({ has_abnormal: true });
    drillDownDialogVisible.value = true;
    return;
  }

  // Find field_key from the data
  const fieldData = tableAbnormalRatioByFieldGrouped.value.find(f => f.label === fieldLabel);
  if (!fieldData) return;

  drillDownDialogTitle.value = `${translate('QcSummary.abnormalInspections')} - ${fieldLabel}`;
  drillDownContext.value = {
    chartType: 'abnormalType',
    filterParams: {
      field_key: fieldData.key,
      has_abnormal: true
    },
    entityName: fieldLabel,
    chartValue: params.value
  };

  loadDrillDownData({
    field_key: fieldData.key,
    has_abnormal: true
  });
  drillDownDialogVisible.value = true;
}

// Chart 4: Abnormal Batch Comparison - Click handler
function handleProductAbnormalClick(params) {
  if (!params || !params.name) return;

  const productName = params.name;

  // Find product_id from the data
  const productData = tableAbnormalBatchesByProduct.value.find(p => p.product_name === productName);
  if (!productData) return;

  drillDownDialogTitle.value = `${translate('QcSummary.abnormalBatches')} - ${productName}`;
  drillDownContext.value = {
    chartType: 'productBatch',
    filterParams: {
      filter_product_id: productData.product_id,
      has_abnormal: true
    },
    entityName: productName,
    chartValue: params.value
  };

  loadDrillDownData({
    filter_product_id: productData.product_id,
    has_abnormal: true
  });
  drillDownDialogVisible.value = true;
}

// Chart 5: Product × Date Abnormal Heatmap - Click handler
function handleHeatmapClick(params) {
  if (!params || !params.value) return;

  // Heatmap params: value = [xIndex, yIndex, value]
  const dateIndex = params.value[0];
  const productIndex = params.value[1];
  const abnormalCount = params.value[2];

  if (abnormalCount === 0 || abnormalCount === undefined) return;  // No drill-down for zero values

  // Get date and product from axis data
  const dates = chartHeatmapByProductDate.value.xAxis.data;
  const products = chartHeatmapByProductDate.value.yAxis.data;

  const date = dates[dateIndex];
  const productName = products[productIndex];

  // Find product_id from the data
  const productData = tableAbnormalHeatmap.value.find(p => p.product_name === productName);
  if (!productData) return;

  drillDownDialogTitle.value = `${productName} - ${date} (${abnormalCount} ${translate('QcSummary.abnormal')})`;
  drillDownContext.value = {
    chartType: 'heatmap',
    filterParams: {
      filter_product_id: productData.product_id,
      date: date,
      has_abnormal: true
    },
    entityName: productName,
    chartValue: abnormalCount
  };

  loadDrillDownData({
    filter_product_id: productData.product_id,
    date: date,
    has_abnormal: true
  });
  drillDownDialogVisible.value = true;
}

// Chart 6: Personnel Inspection Count - Click handler
function handlePersonnelClick(params) {
  if (!params || !params.name) return;

  const inspectorName = params.name;
  const seriesName = params.seriesName;

  // Find inspector_id from the data
  const inspectorData = tableInspectionCountByPersonnel.value.find(i => i.inspector_name === inspectorName);
  if (!inspectorData) return;

  const isAbnormal = seriesName === translate('QcSummary.abnormalInspection');

  drillDownDialogTitle.value = `${inspectorName} - ${seriesName}`;
  drillDownContext.value = {
    chartType: 'personnel',
    filterParams: {
      inspector_id: inspectorData.inspector_id,
      has_abnormal: isAbnormal
    },
    entityName: inspectorName,
    chartValue: params.value
  };

  loadDrillDownData({
    inspector_id: inspectorData.inspector_id,
    has_abnormal: isAbnormal
  });
  drillDownDialogVisible.value = true;
}

// Table 1: Batch Pass Rate Trend - Click handlers
function handleTablePassRateTotalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${translate('QcSummary.allInspections')} - ${row.snapshot_date}`;
  drillDownContext.value = {
    chartType: 'passRate',
    filterParams: { date: row.snapshot_date },
    entityName: row.snapshot_date,
    chartValue: row.total_batches
  };
  loadDrillDownData({ date: row.snapshot_date });
  drillDownDialogVisible.value = true;
}

function handleTablePassRateAbnormalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${translate('QcSummary.abnormalInspections')} - ${row.snapshot_date}`;
  drillDownContext.value = {
    chartType: 'passRate',
    filterParams: { date: row.snapshot_date, has_abnormal: true },
    entityName: row.snapshot_date,
    chartValue: row.abnormal_batches
  };
  loadDrillDownData({ date: row.snapshot_date, has_abnormal: true });
  drillDownDialogVisible.value = true;
}

// Table 2: Team Abnormal Items - Click handlers
function handleTableTeamAbnormalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${row.team_name} - ${translate('QcSummary.abnormalCount')}`;
  drillDownContext.value = {
    chartType: 'team',
    filterParams: { team_id: row.team_id, has_abnormal: true },
    entityName: row.team_name,
    chartValue: row.abnormal_fields
  };
  loadDrillDownData({ team_id: row.team_id, has_abnormal: true });
  drillDownDialogVisible.value = true;
}

function handleTableTeamNormalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${row.team_name} - ${translate('QcSummary.normalCount')}`;
  drillDownContext.value = {
    chartType: 'team',
    filterParams: { team_id: row.team_id, has_abnormal: false },
    entityName: row.team_name,
    chartValue: row.normal_fields
  };
  loadDrillDownData({ team_id: row.team_id, has_abnormal: false });
  drillDownDialogVisible.value = true;
}

// Table 3: Abnormal Field Distribution - Click handler
function handleTableFieldAbnormalClick(row) {
  if (!row) return;

  if (row.label === 'Others') {
     drillDownDialogTitle.value = `${translate('QcSummary.abnormalInspections')} - ${row.label}`;
     drillDownContext.value = {
        chartType: 'abnormalType',
        filterParams: { has_abnormal: true },
        entityName: row.label,
        chartValue: row.abnormal_count
     };
     loadDrillDownData({ has_abnormal: true });
     drillDownDialogVisible.value = true;
     return;
  }

  drillDownDialogTitle.value = `${translate('QcSummary.abnormalInspections')} - ${row.label}`;
  drillDownContext.value = {
    chartType: 'abnormalType',
    filterParams: { field_key: row.key, has_abnormal: true },
    entityName: row.label,
    chartValue: row.abnormal_count
  };
  loadDrillDownData({ field_key: row.key, has_abnormal: true });
  drillDownDialogVisible.value = true;
}
// Table 4: Abnormal Batch Comparison - Click handlers
function handleTableProductTotalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${row.product_name} - ${translate('QcSummary.totalBatches')}`;
  drillDownContext.value = {
    chartType: 'productBatch',
    filterParams: { product_id: row.product_id },
    entityName: row.product_name,
    chartValue: row.total_batches
  };
  // Note: getInspectionDetails returns submissions (inspections), not batches directly.
  // But filtering by product_id will give all inspections for that product, which is what we want for drill-down.
  loadDrillDownData({ product_id: row.product_id });
  drillDownDialogVisible.value = true;
}

function handleTableProductAbnormalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${row.product_name} - ${translate('QcSummary.abnormalBatches')}`;
  drillDownContext.value = {
    chartType: 'productBatch',
    filterParams: { product_id: row.product_id, has_abnormal: true },
    entityName: row.product_name,
    chartValue: row.abnormal_batches
  };
  loadDrillDownData({ product_id: row.product_id, has_abnormal: true });
  drillDownDialogVisible.value = true;
}

// Table 5: Product × Date Abnormal Data - Click handler
function handleTableHeatmapAbnormalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${row.product_name} - ${row.snapshot_date} (${row.abnormal_count} ${translate('QcSummary.abnormal')})`;
  drillDownContext.value = {
    chartType: 'heatmap',
    filterParams: { product_id: row.product_id, date: row.snapshot_date, has_abnormal: true },
    entityName: row.product_name,
    chartValue: row.abnormal_count
  };
  loadDrillDownData({ product_id: row.product_id, date: row.snapshot_date, has_abnormal: true });
  drillDownDialogVisible.value = true;
}

// Table 6: Personnel Inspection Statistics - Click handlers
function handleTableInspectorTotalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${row.inspector_name} - ${translate('QcSummary.inspectionCount')}`;
  drillDownContext.value = {
    chartType: 'personnel',
    filterParams: { inspector_id: row.inspector_id },
    entityName: row.inspector_name,
    chartValue: row.inspection_count
  };
  loadDrillDownData({ inspector_id: row.inspector_id });
  drillDownDialogVisible.value = true;
}

function handleTableInspectorNormalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${row.inspector_name} - ${translate('QcSummary.normalCount')}`;
  drillDownContext.value = {
    chartType: 'personnel',
    filterParams: { inspector_id: row.inspector_id, has_abnormal: false },
    entityName: row.inspector_name,
    chartValue: row.normal_count
  };
  loadDrillDownData({ inspector_id: row.inspector_id, has_abnormal: false });
  drillDownDialogVisible.value = true;
}

function handleTableInspectorAbnormalClick(row) {
  if (!row) return;
  drillDownDialogTitle.value = `${row.inspector_name} - ${translate('QcSummary.abnormalCount')}`;
  drillDownContext.value = {
    chartType: 'personnel',
    filterParams: { inspector_id: row.inspector_id, has_abnormal: true },
    entityName: row.inspector_name,
    chartValue: row.abnormal_count
  };
  loadDrillDownData({ inspector_id: row.inspector_id, has_abnormal: true });
  drillDownDialogVisible.value = true;
}

// Handle table normal count click
function handleTableNormalClick(batchCode, count) {
  drillDownDialogTitle.value = `${translate('QcSummary.batch')} ${batchCode} - ${translate('QcSummary.normalInspection')}`;
  drillDownContext.value = {
    chartType: 'batch',
    filterParams: {
      batch_code: batchCode,
      has_abnormal: false
    },
    entityName: batchCode,
    chartValue: count
  };

  loadDrillDownData({
    batch_code: batchCode,
    has_abnormal: false
  });
  drillDownDialogVisible.value = true;
}

// Handle table abnormal count click
function handleTableAbnormalClick(batchCode, count) {
  drillDownDialogTitle.value = `${translate('QcSummary.batch')} ${batchCode} - ${translate('QcSummary.abnormalInspection')}`;
  drillDownContext.value = {
    chartType: 'batch',
    filterParams: {
      batch_code: batchCode,
      has_abnormal: true
    },
    entityName: batchCode,
    chartValue: count
  };

  loadDrillDownData({
    batch_code: batchCode,
    has_abnormal: true
  });
  drillDownDialogVisible.value = true;
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

  .refresh-button, .subscription-settings-button {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .refresh-button {
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
