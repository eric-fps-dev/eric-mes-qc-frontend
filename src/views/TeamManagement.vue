<!--<template>-->
<!--  &lt;!&ndash; Toolbar with Search Bar and Add Button &ndash;&gt;-->
<!--  <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">-->
<!--    <div style="display: flex; justify-content: space-between; align-items: center;">-->
<!--      <h2>{{ translate("teamManagement.title") }}</h2>-->
<!--      <el-input-->
<!--          v-model="searchQuery"-->
<!--          :placeholder="translate('common.searchPlaceholder')"-->
<!--          clearable-->
<!--          @input="filterTable"-->
<!--          style="width: 300px; margin-left: 20px"-->
<!--      >-->
<!--        <template #prefix>-->
<!--          <el-icon><Search /></el-icon>-->
<!--        </template>-->
<!--      </el-input>-->
<!--    </div>-->

<!--    <div style="display: flex; gap: 10px;">-->
<!--      &lt;!&ndash; Refresh Button &ndash;&gt;-->
<!--      <el-tooltip :content="translate('teamManagement.refreshTooltip')" placement="top">-->
<!--        <el-button-->
<!--            class="refresh-button"-->
<!--            type="primary"-->
<!--            circle-->
<!--            @click="fetchAllData"-->
<!--        >-->
<!--          <el-icon style="color: white;"><RefreshRight /></el-icon>-->
<!--        </el-button>-->
<!--      </el-tooltip>-->

<!--      &lt;!&ndash; Add Button &ndash;&gt;-->
<!--      <el-button type="primary" @click="showAddDialog">{{ translate("teamManagement.addButton") }}</el-button>-->
<!--    </div>-->
<!--  </div>-->

<!--  &lt;!&ndash; Table &ndash;&gt;-->
<!--  <div class="tableContainer" style="overflow-x: auto; max-width: 100%;">-->
<!--    <el-table-->
<!--        style="width: 100%"-->
<!--        @sort-change="handleSortChange"-->
<!--        row-key="id"-->
<!--        v-loading="loadingTeam"-->
<!--        :height="tableHeight"-->
<!--        :data="paginatedTeams"-->
<!--        :tree-props="{children : 'children'}"-->
<!--        :expand-row-keys="expandedKeys"-->
<!--        :empty-text="translate('common.noDataAvailable')"-->
<!--        :indent="0"-->
<!--        :cell-style="indentCellStyle"-->
<!--    >-->
<!--      <el-table-column label="ID" width="100" prop="id" sortable>-->
<!--        <template #default="scope">-->
<!--          <span>{{ scope.row.id }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--      <el-table-column :label="translate('teamManagement.table.name')" prop="name" width="180" sortable show-overflow-tooltip>-->
<!--        <template #default="{ row }">-->
<!--          <span :style="{ paddingLeft: `${(row.level - 1) * 16}px` }">-->
<!--            {{ row.name }}-->
<!--          </span>-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--      <el-table-column :label="translate('teamManagement.table.type')" prop="type" width="100" sortable>-->
<!--        <template #default="scope">-->
<!--          <el-tag type="info" round size="small">-->
<!--            {{ scope.row.type || " - " }}-->
<!--          </el-tag>-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--      <el-table-column :label="translate('teamManagement.table.leader')" prop="leader_id" width="150" sortable>-->
<!--        <template #default="scope">-->
<!--          <span>{{ scope.row.leader?.name || " - " }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--      <el-table-column :label="translate('teamManagement.memberCount')" width="150" prop="memberCount" sortable>-->
<!--        <template #default="scope">-->
<!--          {{ scope.row.memberCount }}-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--      <el-table-column :label="translate('teamManagement.associatedFormCount')" width="150" prop="associatedFormCount" sortable>-->
<!--        <template #default="scope">-->
<!--          {{ scope.row.associatedFormCount }}-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--      <el-table-column :label="translate('teamManagement.table.description')" prop="description" width="300" sortable>-->
<!--        <template #default="scope">-->
<!--          <span>{{ scope.row.description }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--&lt;!&ndash;        <el-table-column label="Created By" prop="created_by" width="180" sortable>&ndash;&gt;-->
<!--&lt;!&ndash;          <template #default="scope">&ndash;&gt;-->
<!--&lt;!&ndash;            <span>{{ scope.row.created_by }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;          </template>&ndash;&gt;-->
<!--&lt;!&ndash;        </el-table-column>&ndash;&gt;-->

<!--      <el-table-column :label="translate('teamManagement.table.createdAt')" prop="created_at" width="180" sortable>-->
<!--        <template #default="scope">-->
<!--          <span>{{ formatDate(scope.row.created_at) }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--&lt;!&ndash;        <el-table-column label="Updated By" prop="updated_by" width="180" sortable>&ndash;&gt;-->
<!--&lt;!&ndash;          <template #default="scope">&ndash;&gt;-->
<!--&lt;!&ndash;            <span>{{ scope.row.updated_by }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;          </template>&ndash;&gt;-->
<!--&lt;!&ndash;        </el-table-column>&ndash;&gt;-->

<!--      <el-table-column :label="translate('teamManagement.table.updatedAt')" prop="updated_at" width="180" sortable>-->
<!--        <template #default="scope">-->
<!--          <span>{{ scope.row.updated_at ? formatDate(scope.row.updated_at) : '-' }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->

<!--      <el-table-column :label="translate('teamManagement.table.actions')" align="right" header-align="right" width="280" fixed="right">-->
<!--        <template #default="scope">-->
<!--          <el-button size="small" type="success" @click="openTeamInfoDialog(scope.row)">{{ translate('teamManagement.table.viewTeam') }}</el-button>-->
<!--          <el-button size="small" type="primary" @click="showAddDialog(scope.row)">{{ translate('common.new') }}</el-button>-->
<!--          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">{{ translate('teamManagement.edit') }}</el-button>-->
<!--          <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">{{ translate('teamManagement.delete') }}</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--    </el-table>-->
<!--  </div>-->

<!--  <el-pagination-->
<!--      v-if="filteredData.length > 15"-->
<!--      style="margin-top: 10px"-->
<!--      @size-change="handleSizeChange"-->
<!--      @current-change="handleCurrentChange"-->
<!--      :current-page="currentPage"-->
<!--      :page-size="pageSize"-->
<!--      :page-sizes="[15, 30, 45, 60]"-->
<!--      layout="total, sizes, prev, pager, next"-->
<!--      :total="filteredData.length"-->
<!--      :hide-on-single-page="true"-->
<!--  />-->

<!--  &lt;!&ndash; Team Info Dialog &ndash;&gt;-->
<!--  <el-dialog-->
<!--      v-model="teamDetailDialogVisible"-->
<!--      :title="`${selectedTeamName}`"-->
<!--      width="800"-->
<!--      top="10vh"-->
<!--      @close="clearTeamDialogSearch"-->
<!--  >-->
<!--    <el-tabs>-->
<!--      <el-tab-pane :label="translate('teamManagement.membersTab')">-->
<!--        &lt;!&ndash; Filter Bar &ndash;&gt;-->
<!--        <el-input-->
<!--            v-model="searchUserQuery"-->
<!--            :placeholder="translate('orderManagement.orderFormDialog.searchUserPlaceholder')"-->
<!--            clearable-->
<!--            @input="filterTeamUsers"-->
<!--            style="margin-bottom: 10px; width: 300px;"-->
<!--        >-->
<!--          <template #prefix>-->
<!--            <el-icon><Search /></el-icon>-->
<!--          </template>-->
<!--        </el-input>-->

<!--        &lt;!&ndash; Table with Sorting &ndash;&gt;-->
<!--        <el-table-->
<!--            v-loading="loadingTeamDetails"-->
<!--            :data="paginatedTeamUsers"-->
<!--            @sort-change="handleUserSortChange"-->
<!--            :empty-text="translate('common.noDataAvailable')"-->
<!--        >-->
<!--          <el-table-column prop="id" :label="translate('userManagement.table.id')" width="100" sortable />-->

<!--          <el-table-column-->
<!--              prop="name"-->
<!--              :label="translate('userManagement.table.name')"-->
<!--              width="180"-->
<!--              sortable-->
<!--          >-->
<!--            <template #default="{ row }">-->
<!--              {{ row.name }}-->

<!--              <el-tag-->
<!--                  v-if="row.isLeader"-->
<!--                  style="margin-left: 4px;"-->
<!--                  hit-->
<!--                  effect="dark"-->
<!--                  round-->
<!--              >-->
<!--                {{ translate('teamManagement.table.leader') }}-->
<!--              </el-tag>-->
<!--            </template>-->
<!--          </el-table-column>-->

<!--          <el-table-column prop="role" :label="translate('userManagement.table.role')" width="150" sortable>-->
<!--            <template #default="scope">-->
<!--              <el-tag :type="scope.row.role?.el_tag_type || 'info'">-->
<!--                {{ scope.row.role?.name || translate('userManagement.role.unknown') }}-->
<!--              </el-tag>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--&lt;!&ndash;          <el-table-column prop="wecom_id" :label="translate('userManagement.table.wecomId')" width="180" sortable />&ndash;&gt;-->
<!--          <el-table-column prop="status" :label="translate('userManagement.table.status')">-->
<!--            <template #default="scope">-->
<!--              <el-switch-->
<!--                v-model="scope.row.activation_status"-->
<!--                :active-value="1"-->
<!--                :inactive-value="0"-->
<!--                disabled-->
<!--              />-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column prop="username" :label="translate('userManagement.table.username')" width="180" sortable />-->
<!--          <el-table-column prop="email" :label="translate('userManagement.table.email')" width="220" sortable />-->
<!--          <el-table-column prop="phone_number" :label="translate('userManagement.table.phoneNumber')" width="180" sortable>-->
<!--            <template #default="scope">-->
<!--              <span>{{ scope.row.phone_number || '-' }}</span>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--        </el-table>-->

<!--        &lt;!&ndash; Pagination &ndash;&gt;-->
<!--        <el-pagination-->
<!--            style="margin-top: 10px"-->
<!--            @size-change="handleUserSizeChange"-->
<!--            @current-change="handleUserPageChange"-->
<!--            :current-page="userCurrentPage"-->
<!--            :page-size="userPageSize"-->
<!--            :page-sizes="[10, 20, 30, 50]"-->
<!--            layout="total, sizes, prev, pager, next"-->
<!--            :total="filteredTeamUsers.length"-->
<!--            :hide-on-single-page="true"-->
<!--        />-->
<!--      </el-tab-pane>-->

<!--      <el-tab-pane :label="translate('teamManagement.formsTab')">-->
<!--        <div class="popup-container">-->
<!--          <div style="margin-bottom: 10px;">-->
<!--            <el-text>-->
<!--              {{ translate('teamManagement.totalCount') }} : {{ teamForms.length }}-->
<!--            </el-text>-->
<!--          </div>-->

<!--          <team-form-tree-->
<!--              :restrict-selection-to-allowed-only="false"-->
<!--              :selectedFormIds="teamForms"-->
<!--              :showOnlySelectedNode="true"-->
<!--              :expand-all-nodes="false"-->
<!--              @on-node-clicked="handleFormNodeClicked"-->
<!--          >-->
<!--          </team-form-tree>-->
<!--        </div>-->
<!--      </el-tab-pane>-->
<!--    </el-tabs>-->
<!--  </el-dialog>-->

<!--  &lt;!&ndash; Add Team Dialog &ndash;&gt;-->
<!--  <el-dialog-->
<!--      :title="translate('teamManagement.addDialog.title')"-->
<!--      v-model="addDialogVisible"-->
<!--      width="50%"-->
<!--      @keyup.enter.native="validateAndAddTeam"-->
<!--      align-center-->
<!--  >-->
<!--    <div class="popup-container">-->
<!--      <el-form ref="addTeamForm" :model="newTeam" :rules="rules" label-width="140px">-->
<!--        <el-row>-->
<!--          <el-col :span="12">-->
<!--            <el-form-item :label="translate('teamManagement.addDialog.name')" prop="name">-->
<!--              <el-input v-model="newTeam.name" />-->
<!--            </el-form-item>-->
<!--          </el-col>-->

<!--          <el-col :span="12">-->
<!--            <el-form-item :label="translate('teamManagement.addDialog.type')" prop="type">-->
<!--              <el-input v-model="newTeam.type" />-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--        </el-row>-->

<!--        <el-row>-->
<!--          <el-col :span="12" align="center">-->
<!--            <el-form-item>-->
<!--              <el-text style="padding-right: 10px;">-->
<!--                {{ translate('teamManagement.isSubTeam') }}-->
<!--              </el-text>-->

<!--              <el-switch-->
<!--                  v-model="isSubTeam"-->
<!--                  @change="handleIsSubTeam"-->
<!--              />-->
<!--            </el-form-item>-->
<!--          </el-col>-->

<!--          <el-col :span="12">-->
<!--            <el-form-item-->
<!--                :label="translate('teamManagement.parentTeam')"-->
<!--                v-if="this.isSubTeam"-->
<!--                required-->
<!--                prop="parent_id"-->
<!--            >-->
<!--              <el-tree-select-->
<!--                  v-model="newTeam.parent_id"-->
<!--                  :data="parentTeamOptions(newTeam.id)"-->
<!--                  :placeholder="translate('teamManagement.addDialog.selectParentTeamPlaceholder')"-->
<!--                  check-strictly-->
<!--                  @change="clearLeaderMemberFormSeleciton('create')"-->
<!--              >-->
<!--              </el-tree-select>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--        </el-row>-->

<!--        <el-row>-->
<!--          <el-col :span="12">-->
<!--            <el-form-item prop="leader_id">-->
<!--              <template #label>-->
<!--                <span>{{ translate('teamManagement.addDialog.leader')}}</span>-->
<!--              </template>-->

<!--              <el-select-->
<!--                  v-model="newTeam.leader_id"-->
<!--                  filterable-->
<!--                  clearable-->
<!--                  :placeholder="translate('teamManagement.addDialog.selectLeaderPlaceholder')"-->
<!--                  @visible-change="open => { if (open) previousLeaderSelectionId = newTeam.leader_id }"-->
<!--                  @change="(newVal)=>handleNewLeaderSelection(newTeam, newUser.selectedUsers, newVal)"-->
<!--                  :no-data-text="translate('common.noDataAvailable')"-->
<!--                  :no-match-text="translate('common.noDataAvailable')"-->
<!--              >-->
<!--                <el-option-->
<!--                    v-for="user in teamLeaderOptions"-->
<!--                    :key="user.id"-->
<!--                    :label="user.name"-->
<!--                    :value="user.id"-->
<!--                    :disabled="user.disabled"-->
<!--                >-->
<!--                  <span style="float:left">{{ user.name }}</span>-->
<!--                  <span-->
<!--                      style="-->
<!--                      float: right;-->
<!--                      color: var(&#45;&#45;el-text-color-secondary);-->
<!--                      font-size: 13px;"-->
<!--                  >-->
<!--                  {{ getRole(user.role_id).name }}-->
<!--                 <span v-if="user.team_name">-->
<!--                   - {{ user.team_name }} ({{user.team_id}})-->
<!--                 </span>-->
<!--              </span>-->
<!--                </el-option>-->
<!--              </el-select>-->

<!--              <el-text type="info">-->
<!--                <el-icon>-->
<!--                  <InfoFilled />-->
<!--                </el-icon>-->
<!--                {{ leaderLabelSuffix.replace(/[()]/g, '') }}-->
<!--              </el-text>-->
<!--            </el-form-item>-->
<!--          </el-col>-->

<!--          <el-col :span="12">-->
<!--            <el-form-item-->
<!--                :label="translate('teamManagement.addDialog.members')"-->
<!--                prop="selectedUsers"-->
<!--            >-->
<!--              <el-select-->
<!--                  v-model="newUser.selectedUsers"-->
<!--                  multiple-->
<!--                  filterable-->
<!--                  :placeholder="translate('teamManagement.addDialog.selectMembersPlaceholder')"-->
<!--                  :no-data-text="translate('common.noDataAvailable')"-->
<!--                  :no-match-text="translate('common.noDataAvailable')"-->
<!--                  collapse-tags-->
<!--                  collapse-tags-tooltip-->
<!--                  :max-collapse-tags="3"-->
<!--              >-->
<!--                <el-option-->
<!--                    v-for="user in teamMemberOptions"-->
<!--                    :key="user.id"-->
<!--                    :label="user.name"-->
<!--                    :value="user.id"-->
<!--                    :disabled="user.id === newTeam.leader_id"-->
<!--                >-->
<!--                  <span style="float:left">{{ user.name }}</span>-->
<!--                  <span-->
<!--                      style="-->
<!--                      float: right;-->
<!--                      color: var(&#45;&#45;el-text-color-secondary);-->
<!--                      font-size: 13px;-->
<!--                      padding-right: 10px;-->
<!--                      "-->
<!--                  >-->
<!--                    {{ getRole(user.role_id).name }}-->
<!--                  </span>-->
<!--                </el-option>-->
<!--              </el-select>-->

<!--              <span v-if="newTeam.parent_id == null">-->
<!--                <el-text type="info">-->
<!--                  <el-icon>-->
<!--                    <InfoFilled />-->
<!--                  </el-icon>-->
<!--                  {{ translate('teamManagement.rootTeamLimitedMemberOptionsHint') }}-->
<!--                </el-text>-->
<!--              </span>-->

<!--              <span v-if="newTeam.parent_id != null">-->
<!--                <el-text type="info">-->
<!--                  <el-icon>-->
<!--                    <InfoFilled />-->
<!--                  </el-icon>-->
<!--                  {{ translate('teamManagement.nonRootTeamLimitedMemberOptionsHint') }}-->
<!--                </el-text>-->
<!--              </span>-->
<!--            </el-form-item>-->

<!--          </el-col>-->
<!--        </el-row>-->

<!--        <el-row justify="space-between" :gutter=20>-->
<!--          <el-col :span="14">-->
<!--            <el-form-item :label="translate('teamManagement.addDialog.forms')" prop="selectedForms">-->
<!--              <team-form-tree-->
<!--                  :showOnlySelectedNode="false"-->
<!--                  :expand-all-nodes="false"-->
<!--                  :restrict-selection-to-allowed-only="newTeam.parent_id !== null"-->
<!--                  :allowed-form-ids="parentFormIds"-->
<!--                  @update-selected-forms="(formIds)=> newForm.selectedForms = formIds.map(f => f.id)"-->
<!--                  @on-node-clicked="handleFormNodeClicked"-->
<!--              >-->
<!--              </team-form-tree>-->

<!--              <span v-if="newTeam.parent_id != null">-->
<!--                <el-text type="info">-->
<!--                  <el-icon>-->
<!--                    <InfoFilled />-->
<!--                  </el-icon>-->

<!--                  {{ translate('teamManagement.limitedFormOptionsHint') }}-->
<!--                </el-text>-->
<!--              </span>-->
<!--            </el-form-item>-->
<!--          </el-col>-->

<!--          <el-col :span="10" style="background: #f9f9f9; border-color: #f9f9f9; border-width: 1px; border-radius: 5px;">-->
<!--            <div style="margin-bottom: 10px; margin-top: 5px;">-->
<!--              <el-text>-->
<!--                {{ translate('teamManagement.formSelectionPreview') }} - {{ translate('teamManagement.totalCount') }} : {{ newForm.selectedForms.length }}-->
<!--              </el-text>-->
<!--            </div>-->

<!--            <div style="margin-bottom: 10px">-->
<!--              <team-form-tree-->
<!--                  :restrict-selection-to-allowed-only="false"-->
<!--                  :selectedFormIds="newForm.selectedForms"-->
<!--                  :showOnlySelectedNode="true"-->
<!--                  :expand-all-nodes="true"-->
<!--                  @on-node-clicked="handleFormNodeClicked"-->
<!--              >-->
<!--              </team-form-tree>-->
<!--            </div>-->
<!--          </el-col>-->
<!--        </el-row>-->

<!--        <el-form-item :label="translate('teamManagement.addDialog.description')" prop="description">-->
<!--          <el-input type="textarea" v-model="newTeam.description" />-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </div>-->

<!--    <template #footer>-->
<!--      <div class="popup-container">-->
<!--        <el-button @click="addDialogVisible = false">{{ translate('teamManagement.addDialog.cancelButton') }}</el-button>-->
<!--        <el-button type="primary" @click="validateAndAddTeam">{{ translate('teamManagement.addDialog.confirmButton') }}</el-button>-->
<!--      </div>-->
<!--    </template>-->
<!--  </el-dialog>-->

<!--  &lt;!&ndash; Edit Team Dialog &ndash;&gt;-->
<!--  <el-dialog-->
<!--      :title="translate('teamManagement.editDialog.title')"-->
<!--      v-model="editDialogVisible"-->
<!--      width="50%"-->
<!--      @close="closeEditDialog"-->
<!--      @keyup.enter.native="handleEditConfirm"-->
<!--      align-center-->
<!--  >-->
<!--    <div class="popup-container">-->
<!--      <el-form ref="editTeamForm" :model="editTeam" :rules="rules" label-width="140px">-->
<!--        <el-row>-->
<!--          <el-col :span="12">-->
<!--            <el-form-item :label="translate('teamManagement.editDialog.name')" prop="name">-->
<!--              <el-input v-model="editTeam.name" />-->
<!--            </el-form-item>-->
<!--          </el-col>-->

<!--          <el-col :span="12">-->
<!--            <el-form-item :label="translate('teamManagement.editDialog.type')" prop="type">-->
<!--              <el-input v-model="editTeam.type" />-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--        </el-row>-->

<!--        <el-row>-->
<!--          <el-col :span="12" align="center">-->
<!--            <el-form-item>-->
<!--              <el-text style="padding-right: 10px;">-->
<!--              {{ translate('teamManagement.isSubTeam') }}-->
<!--              </el-text>-->

<!--              <el-switch-->
<!--                  v-model="isSubTeam"-->
<!--                  @change="handleIsSubTeam"-->
<!--              />-->
<!--            </el-form-item>-->
<!--          </el-col>-->

<!--          <el-col :span="12">-->
<!--            <el-form-item-->
<!--                :label="translate('teamManagement.parentTeam')"-->
<!--                v-if="this.isSubTeam"-->
<!--                required-->
<!--                prop="parent_id"-->
<!--            >-->
<!--              <el-tree-select-->
<!--                  v-model="editTeam.parent_id"-->
<!--                  :data="parentTeamOptions(editTeam.id)"-->
<!--                  check-strictly-->
<!--                  :placeholder="translate('teamManagement.editDialog.selectParentTeamPlaceholder')"-->
<!--                  @change="clearLeaderMemberFormSeleciton('edit')"-->
<!--              />-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--        </el-row>-->

<!--        <el-row>-->
<!--          <el-col :span="12">-->
<!--            <el-form-item prop="leader_id">-->
<!--              <template #label>-->
<!--                <span>{{ translate('teamManagement.editDialog.leader')}}</span>-->
<!--              </template>-->

<!--              <el-select-->
<!--                  v-model="editTeam.leader_id"-->
<!--                  filterable-->
<!--                  clearable-->
<!--                  :placeholder="translate('teamManagement.editDialog.selectLeaderPlaceholder')"-->
<!--                  @visible-change="open => { if (open) previousLeaderSelectionId = editTeam.leader_id }"-->
<!--                  @change="(newVal)=>handleNewLeaderSelection(editTeam, editUser.assignedUsers ,newVal)"-->
<!--                  :no-data-text="translate('common.noDataAvailable')"-->
<!--                  :no-match-text="translate('common.noDataAvailable')"-->
<!--              >-->
<!--                <el-option-->
<!--                    v-for="user in teamLeaderOptions"-->
<!--                    :key="user.id"-->
<!--                    :label="user.name"-->
<!--                    :value="user.id"-->
<!--                    :disabled="user.disabled"-->
<!--                >-->
<!--                  <span style="float:left">{{ user.name }}</span>-->
<!--                  <span-->
<!--                      style="-->
<!--                      float: right;-->
<!--                      color: var(&#45;&#45;el-text-color-secondary);-->
<!--                      font-size: 13px;-->
<!--                   "-->
<!--                  >-->
<!--                    {{ getRole(user.role_id).name }}-->

<!--                    &lt;!&ndash; team name, if this user is currently a leader &ndash;&gt;-->
<!--                    <span v-if="user.team_name">-->
<!--                      - {{ user.team_name }} ({{user.team_id}})-->
<!--                    </span>-->
<!--                  </span>-->
<!--                </el-option>-->
<!--              </el-select>-->

<!--              <el-text type="info" v-if="this.depth">-->
<!--                <el-icon>-->
<!--                  <InfoFilled />-->
<!--                </el-icon>-->

<!--                {{ leaderLabelSuffix.replace(/[()]/g, '') }}-->
<!--              </el-text>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--          <el-col :span="12">-->
<!--            <el-form-item-->
<!--                :label="translate('teamManagement.editDialog.members')"-->
<!--                prop="assignedUsers"-->
<!--            >-->
<!--              <el-select-->
<!--                  v-model="editUser.assignedUsers"-->
<!--                  multiple-->
<!--                  filterable-->
<!--                  :placeholder="translate('teamManagement.editDialog.selectMembersPlaceholder')"-->
<!--                  :no-data-text="translate('common.noDataAvailable')"-->
<!--                  :no-match-text="translate('common.noDataAvailable')"-->
<!--                  collapse-tags-->
<!--                  collapse-tags-tooltip-->
<!--                  :max-collapse-tags="3"-->
<!--              >-->
<!--                <el-option-->
<!--                    v-for="user in teamMemberOptions"-->
<!--                    :key="user.id"-->
<!--                    :label="user.name"-->
<!--                    :value="user.id"-->
<!--                    :disabled="user.id === editTeam.leader_id"-->
<!--                >-->
<!--                  <span style="float:left">{{ user.name }}</span>-->
<!--                  <span-->
<!--                      style="-->
<!--                      float: right;-->
<!--                      color: var(&#45;&#45;el-text-color-secondary);-->
<!--                      font-size: 13px;-->
<!--                      padding-right: 10px;-->
<!--                      "-->
<!--                  >-->
<!--                    {{ getRole(user.role_id).name }}-->
<!--                  </span>-->
<!--                </el-option>-->
<!--              </el-select>-->

<!--              <span v-if="editTeam.parent_id == null">-->
<!--                <el-text type="info">-->
<!--                  <el-icon>-->
<!--                    <InfoFilled />-->
<!--                  </el-icon>-->
<!--                  {{ translate('teamManagement.rootTeamLimitedMemberOptionsHint') }}-->
<!--                </el-text>-->
<!--              </span>-->

<!--              <span v-if="editTeam.parent_id != null">-->
<!--                <el-text type="info">-->
<!--                  <el-icon>-->
<!--                    <InfoFilled />-->
<!--                  </el-icon>-->

<!--                  {{ translate('teamManagement.nonRootTeamLimitedMemberOptionsHint') }}-->
<!--                </el-text>-->
<!--              </span>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--        </el-row>-->

<!--        <el-row justify="space-between" :gutter=20>-->
<!--          <el-col :span="14">-->
<!--            <el-form-item :label="translate('teamManagement.editDialog.forms')">-->
<!--              <team-form-tree-->
<!--                  :restrict-selection-to-allowed-only="editTeam.parent_id != null"-->
<!--                  :selectedFormIds="editForm.assignedForms"-->
<!--                  :showOnlySelectedNode="false"-->
<!--                  :expand-all-nodes="false"-->
<!--                  :allowed-form-ids="parentFormIds"-->
<!--                  @update-selected-forms="(formIds)=> editForm.assignedForms = formIds.map(f => f.id)"-->
<!--                  @on-node-clicked="handleFormNodeClicked"-->
<!--              >-->
<!--              </team-form-tree>-->

<!--              <span v-if="editTeam.parent_id != null">-->
<!--                <el-text type="info">-->
<!--                  <el-icon>-->
<!--                    <InfoFilled />-->
<!--                  </el-icon>-->

<!--                  {{ translate('teamManagement.limitedFormOptionsHint') }}-->
<!--                </el-text>-->
<!--              </span>-->
<!--            </el-form-item>-->
<!--          </el-col>-->

<!--          <el-col :span="10"  style="background: #f9f9f9; border-color: #f9f9f9; border-width: 1px; border-radius: 5px;">-->
<!--            <div style="margin-bottom: 10px; margin-top: 5px;">-->
<!--              <el-text>-->
<!--                {{ translate('teamManagement.formSelectionPreview') }} - {{ translate('teamManagement.totalCount') }} : {{ editForm.assignedForms.length }}-->
<!--              </el-text>-->
<!--            </div>-->

<!--            <div style="margin-bottom: 10px">-->
<!--              <team-form-tree-->
<!--                  :restrict-selection-to-allowed-only="false"-->
<!--                  :selectedFormIds="editForm.assignedForms"-->
<!--                  :showOnlySelectedNode="true"-->
<!--                  :expand-all-nodes="true"-->
<!--                  @on-node-clicked="handleFormNodeClicked"-->
<!--              >-->
<!--              </team-form-tree>-->
<!--            </div>-->
<!--          </el-col>-->
<!--        </el-row>-->

<!--        <el-form-item :label="translate('teamManagement.editDialog.description')" prop="description">-->
<!--          <el-input type="textarea" v-model="editTeam.description" />-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--    </div>-->

<!--    <template #footer>-->
<!--      <div class="popup-container">-->
<!--        <el-button @click="editDialogVisible = false">{{ translate('teamManagement.editDialog.cancelButton') }}</el-button>-->
<!--        <el-button type="primary" @click="handleEditConfirm">{{ translate('teamManagement.editDialog.confirmButton') }}</el-button>-->
<!--      </div>-->
<!--    </template>-->
<!--  </el-dialog>-->
<!--</template>-->

<!--<script>-->
<!--import {Search, Plus, QuestionFilled, RefreshRight, InfoFilled, StarFilled} from "@element-plus/icons-vue";-->
<!--import { removeTeamFromAllUsers } from '@/services/teamUserService';-->
<!--import dayjs from 'dayjs';-->
<!--import utc from 'dayjs/plugin/utc';-->
<!--import timezone from 'dayjs/plugin/timezone';-->
<!--import {-->
<!--  getAllTeamTree,-->
<!--  createTeam,-->
<!--  updateTeam,-->
<!--  softDeleteTeam,-->
<!--  getTeamDepth,-->
<!--  getTeamById-->
<!--} from "@/services/teamService.js";-->
<!--import { formatDate} from "@/utils/task-center/dateFormatUtils";-->
<!--import { fetchUsers} from "@/services/userService";-->
<!--import { getUsersForTeam} from "@/services/teamUserService";-->
<!--import { translate, translateWithParams } from "@/utils/i18n";-->
<!--import { getFormIdsForTeam } from "@/services/teamFormService";-->
<!--import TeamFormTree from "@/components/dispatch/TeamFormTree.vue";-->
<!--import { openFormPreviewWindow } from "@/utils/dispatch-utils";-->
<!--import { getCurrentLeaders } from "@/services/teamService";-->
<!--import { fetchRoles } from "@/services/roleService";-->
<!--import { ElLoading } from 'element-plus';-->

<!--dayjs.extend(utc);-->
<!--dayjs.extend(timezone);-->

<!--export default {-->
<!--  name: "TeamManagement",-->
<!--  components: {-->
<!--    StarFilled,-->
<!--    InfoFilled,-->
<!--    TeamFormTree,-->
<!--    Search,-->
<!--    Plus,-->
<!--    QuestionFilled,-->
<!--    RefreshRight,-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      tableHeight: window.innerHeight - 50 - 100 - 20 - 20 - 10,-->
<!--      loadingTeam: false,-->
<!--      loadingTeamDetails: false, // Loading state for the user list-->
<!--      searchQuery: "", // Search input value-->
<!--      searchUserQuery: "", // Search input value for team detail user table-->
<!--      currentPage: 1, // Current page number-->
<!--      pageSize: 15, // Number of items per page-->
<!--      userCurrentPage: 1, // Current page for team detail user table-->
<!--      userPageSize: 10, // Page size for team detail user table-->
<!--      isSubTeam: false,-->
<!--      depth: 1, // Depth of the team to populate related options for create/edite dialog-->
<!--      filteredTeamUsers: [], // Filtered users for pagination-->
<!--      sortSettings: { prop: "", order: "" },-->
<!--      userSortSettings: { prop: "", order: "" }, // Sort settings for team detail user table-->
<!--      tableData: [], // Original data-->
<!--      teamOptions: [], // Dropdown options for all teams (used for selecting parent team)-->
<!--      filteredData: [], // Filtered data for display-->
<!--      userOptions: [], // Dropdown options for all users-->
<!--      teamLeaderOptions: [], // Leader options for create/edit team-->
<!--      teamMemberOptions: [],   // Member options for create/edit team-->
<!--      currentLeaders: {}, // Map that stores all current leader objects-->
<!--      rolesMap: {}, // Stores all roles data-->
<!--      parentFormIds: [], // Stores forms from parent team-->
<!--      addDialogVisible: false, // Add dialog visibility-->
<!--      editDialogVisible: false, // Edit dialog visibility-->
<!--      teamDetailDialogVisible: false, // Controls the visibility of the table dialog-->
<!--      teamUsers: [], // Stores users assigned to the team-->
<!--      teamForms: [], // Stores forms assigned to the team-->
<!--      selectedTeamName: "", // store the selected team for showing users-->
<!--      expandedKeys: [],-->
<!--      processing: false,-->
<!--      newTeam: {-->
<!--        name: "",-->
<!--        type: "",-->
<!--        leader_id: null,-->
<!--        start_time: "", // Formatted value for the backend-->
<!--        end_time: "",-->
<!--        description: "",-->
<!--        status: 1, // Default null-->
<!--        parent_id: null,-->
<!--      },-->
<!--      newUser: { // representing add new members-->
<!--        selectedUsers: [],-->
<!--      },-->
<!--      newForm: {-->
<!--        selectedForms: [],-->
<!--      },-->
<!--      editTeam: {-->
<!--        id: null,-->
<!--        name: "",-->
<!--        type: "",-->
<!--        leader_id: null,-->
<!--        start_time: "",-->
<!--        end_time: "",-->
<!--        description: "",-->
<!--        status: 1,-->
<!--        parent_id: null,-->
<!--      },-->
<!--      editUser: { // representing edit members-->
<!--        assignedUsers: []-->
<!--      },-->
<!--      editForm: {-->
<!--        assignedForms: [],-->
<!--      },-->
<!--      previousLeaderSelectionId: null, // Remember old leader selection to clear up that user in member's list-->
<!--      originalLeaderId: null, // Reflect actual original id of the team before editing-->
<!--      rules: {-->
<!--        name: [{ required: true, message: translate("teamManagement.validation.nameRequired"), trigger: "blur" }],-->
<!--        type: [{ required: false, message: translate("teamManagement.validation.typeRequired"), trigger: "blur" }],-->
<!--        leader_id: [{ required: false, message: translate("teamManagement.validation.leaderRequired"), trigger: "blur" }],-->
<!--        parent_id: [{ required: true, message: translate("teamManagement.validation.parentTeamRequired"), trigger: "blur" }],-->
<!--      },-->
<!--    };-->
<!--  },-->
<!--  created() {-->
<!--    this.fetchAllData();-->
<!--  },-->
<!--  computed: {-->
<!--    paginatedTeamUsers() {-->
<!--      const sortedData = [...this.filteredTeamUsers].sort((a, b) => {-->
<!--        const { prop, order } = this.userSortSettings;-->
<!--        if (!prop || !order) return 0;-->
<!--        const valueA = a[prop];-->
<!--        const valueB = b[prop];-->
<!--        return order === "ascending" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);-->
<!--      });-->

<!--      const start = (this.userCurrentPage - 1) * this.userPageSize;-->
<!--      return sortedData.slice(start, start + this.userPageSize);-->
<!--    },-->
<!--    paginatedTeams() {-->
<!--      const sortedData = [...this.filteredData].sort((a, b) => {-->
<!--        const { prop, order } = this.sortSettings;-->
<!--        if (!prop || !order) return 0;-->

<!--        const valueA = a[prop];-->
<!--        const valueB = b[prop];-->

<!--        if (order === "ascending") return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;-->
<!--        if (order === "descending") return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;-->
<!--        return 0;-->
<!--      });-->

<!--      const start = (this.currentPage - 1) * this.pageSize;-->
<!--      const end = start + this.pageSize;-->
<!--      return sortedData.slice(start, end);-->
<!--    },-->
<!--    leaderLabelSuffix() {-->
<!--      const depth = this.depth;-->

<!--      if (depth === 1) {-->
<!--        return translate('teamManagement.depth1RoleAllowed');-->
<!--      } else {-->
<!--        return translate('teamManagement.depth2RoleAllowed');-->
<!--      }-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    window.addEventListener("resize", this.updateTableHeight);-->
<!--  },-->
<!--  updateTableHeight() {-->
<!--    this.tableHeight = window.innerHeight - 50 - 100 - 20 - 20 - 10;-->
<!--  },-->
<!--  beforeUnmount() {-->
<!--    window.removeEventListener("resize", this.updateTableHeight);-->
<!--  },-->
<!--  methods: {-->
<!--    getTeamDepth,-->
<!--    translate,-->
<!--    filterTeamUsers() {-->
<!--      const searchText = this.searchUserQuery.toLowerCase();-->
<!--      this.filteredTeamUsers = this.teamUsers.filter(user =>-->
<!--          Object.values(user).some(value => String(value).toLowerCase().includes(searchText))-->
<!--      );-->
<!--    },-->
<!--    handleUserSizeChange(size) {-->
<!--      this.userPageSize = size;-->
<!--    },-->
<!--    handleUserPageChange(page) {-->
<!--      this.userCurrentPage = page;-->
<!--    },-->
<!--    handleUserSortChange({ prop, order }) {-->
<!--      this.userSortSettings = { prop, order };-->
<!--    },-->
<!--    formatDate,-->
<!--    toOffsetTime(rawTime) {-->
<!--      if (!rawTime) return null;-->

<!--      try {-->
<!--        const validOffsetTimePattern = /^\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;-->
<!--        const validRawTimePattern = /^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \([\w\s]+\)$/;-->

<!--        // If already in the desired format, return it directly-->
<!--        if (validOffsetTimePattern.test(rawTime)) {-->
<!--          return rawTime;-->
<!--        }-->

<!--        // If in raw valid format, parse and retain timezone-->
<!--        if (validRawTimePattern.test(rawTime)) {-->
<!--          const date = dayjs(rawTime).tz(dayjs.tz.guess()); // Parse with user's local timezone-->
<!--          return date.format("HH:mm:ssZ");-->
<!--        }-->

<!--        // If ISO 8601 format, convert to desired offset time-->
<!--        if (dayjs(rawTime, dayjs.ISO_8601, true).isValid()) {-->
<!--          const date = dayjs(rawTime);-->
<!--          return date.format("HH:mm:ssZ");-->
<!--        }-->

<!--        console.error(`Unsupported time format: ${rawTime}`);-->
<!--        return null;-->
<!--      } catch (error) {-->
<!--        console.error(`Error formatting time: ${rawTime}`, error);-->
<!--        return null;-->
<!--      }-->
<!--    },-->
<!--    formatTime(time) {-->
<!--      if (!time) return '-'; // Handle null or undefined values-->
<!--      const date = new Date(`1970-01-01T${time}`);-->
<!--      return date.toLocaleTimeString('en-US', {hour12: false}); // Format to HH:mm:ss-->
<!--    },-->
<!--    async openTeamInfoDialog(team) {-->
<!--      this.teamDetailDialogVisible = true;-->
<!--      this.loadingTeamDetails = true;-->
<!--      this.selectedTeamName = team.name;-->

<!--      try {-->
<!--        let response = await getUsersForTeam(team.id);-->
<!--        if (response.data.status === "200") {-->
<!--          const teamLeadId = team.leader?.id;-->

<!--          // Mark the leader user with isLeader-->
<!--          this.teamUsers = response.data.data.map(u => ({...u, isLeader: u.id === teamLeadId}));-->
<!--          this.filteredTeamUsers = this.teamUsers;-->
<!--        } else {-->
<!--          this.teamUsers = [];-->
<!--          this.filteredTeamUsers = [];-->
<!--        }-->

<!--        // Load forms of this team-->
<!--        response = await getFormIdsForTeam(team.id);-->
<!--        if (response.data.status === "200") {-->
<!--          this.teamForms = [...response.data.data];-->
<!--        } else {-->
<!--          this.teamForms = [];-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Error fetching team association", error);-->
<!--        this.teamUsers = [];-->
<!--        this.filteredTeamUsers = [];-->
<!--        this.teamForms = [];-->
<!--      } finally {-->
<!--        this.loadingTeamDetails = false;-->
<!--      }-->
<!--    },-->
<!--    async handleFormNodeClicked(formTemplateId) {-->
<!--      await openFormPreviewWindow(formTemplateId, this)-->
<!--    },-->
<!--    closeEditDialog() {-->
<!--      // Reset the editTeam object to prevent data conflicts-->
<!--      this.editTeam = {-->
<!--        id: null,-->
<!--        name: "",-->
<!--        type: "",-->
<!--        leader_id: null,-->
<!--        start_time: null,-->
<!--        end_time: null,-->
<!--        description: "",-->
<!--        status: null,-->
<!--        parent_id: null,-->
<!--      };-->

<!--      this.editDialogVisible = false; // Close the dialog-->
<!--    },-->
<!--    async fetchAllData() {-->
<!--      await this.fetchTeamData();-->
<!--      await this.fetchCurrentLeaders();-->
<!--      await this.fetchUserOptions();-->
<!--      await this.fetchRoles();-->
<!--    },-->
<!--    async fetchUserOptions() {-->
<!--      try {-->
<!--        const response = await fetchUsers();-->
<!--        if (response.data.data && response.data.status === "200") {-->
<!--          // Store all users for general use-->
<!--          this.userOptions = response.data.data.content-->
<!--              .map(user => ({-->
<!--                id: user.id,-->
<!--                name: user.name,-->
<!--                role_id: user.role?.id,-->
<!--              }));-->

<!--        } else {-->
<!--          this.userOptions = [];-->
<!--          this.teamLeaderOptions = []; // Ensure empty state-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Error fetching user options:", error);-->
<!--        this.userOptions = [];-->
<!--        this.teamLeaderOptions = [];-->
<!--      }-->
<!--    },-->
<!--    async fetchCurrentLeaders() {-->
<!--      try {-->
<!--        const response = await getCurrentLeaders();-->
<!--        const map = new Map();-->

<!--        if (response.data.status === "200") {-->
<!--          response.data.data.forEach(leaderObj => {-->
<!--            map.set(leaderObj.user_id, leaderObj);-->
<!--          });-->
<!--          this.currentLeaders = map;-->
<!--        } else {-->
<!--          this.currentLeaders = {};-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error("Error fetching current leader IDs:", error);-->
<!--        this.currentLeaders = {};-->
<!--      }-->
<!--    },-->
<!--    async fetchTeamData() {-->
<!--      try {-->
<!--        this.loadingTeam = true;-->
<!--        const response = await getAllTeamTree(); // API call-->
<!--        if (response.data.status === '200') {-->
<!--          this.tableData = response.data.data || []; // Assign data-->
<!--          this.filteredData = [...this.tableData]; // Initialize filtered data-->
<!--          this.teamOptions = this.toTeamOptions(this.tableData)-->
<!--          // this.expandedKeys = this.expandAllKeys(this.tableData);-->
<!--        } else {-->
<!--          this.tableData = [];-->
<!--          this.filteredData = [];-->
<!--          this.teamOptions = [];-->
<!--        }-->
<!--      } catch (error) {-->
<!--        console.error('Error fetching team data:', error);-->
<!--        this.tableData = [];-->
<!--        this.filteredData = [];-->
<!--      } finally {-->
<!--        this.loadingTeam = false;-->
<!--      }-->
<!--    },-->
<!--    filterTable() {-->
<!--      const searchText = this.searchQuery.toLowerCase();-->
<!--      this.filteredData = this.tableData.filter((item) =>-->
<!--          (item.id && String(item.id).toLowerCase().includes(searchText)) || // 过滤 ID-->
<!--          (item.leader?.name && item.leader.name.toLowerCase().includes(searchText)) || // 过滤 负责人名字-->
<!--          (item.name && item.name.toLowerCase().includes(searchText)) || // 过滤 班次名称-->
<!--          (item.type && item.type.toLowerCase().includes(searchText)) || // 过滤 班次类型-->
<!--          (item.start_time && this.formatTime(item.start_time).includes(searchText)) || // 过滤 开始时间-->
<!--          (item.end_time && this.formatTime(item.end_time).includes(searchText)) || // 过滤 结束时间-->
<!--          (item.description && item.description.toLowerCase().includes(searchText)) // 过滤 描述-->
<!--      );-->
<!--    },-->
<!--    handleSortChange({prop, order}) {-->
<!--      this.sortSettings = {prop, order};-->
<!--    },-->
<!--    handleSizeChange(size) {-->
<!--      this.pageSize = size;-->
<!--    },-->
<!--    handleCurrentChange(page) {-->
<!--      this.currentPage = page;-->
<!--    },-->
<!--    async validateAndAddTeam() {-->
<!--      if (this.processing) return;-->
<!--      this.processing = true;-->

<!--      const loader = ElLoading.service({-->
<!--        lock: true,-->
<!--        text: this.translate('common.processing'),-->
<!--        background: 'rgba(255, 255 ,255, 0.35)',-->
<!--      });-->

<!--      this.$refs.addTeamForm.validate(async (valid) => {-->
<!--        if (!valid) {-->
<!--          loader.close();-->
<!--          this.processing = false;-->
<!--          return;-->
<!--        }-->

<!--        try {-->
<!--          // Avoid modifying reactive properties repeatedly-->
<!--          const startTime = this.toOffsetTime(this.newTeam.start_time);-->
<!--          const endTime = this.toOffsetTime(this.newTeam.end_time);-->

<!--          const payload = { ...this.newTeam,-->
<!--            start_time: startTime,-->
<!--            end_time: endTime,-->
<!--            created_by: this.$store.getters.getUser.id,-->
<!--            member_ids: this.newUser.selectedUsers,-->
<!--            form_ids: this.newForm.selectedForms,-->
<!--          };-->

<!--          const response = await createTeam(payload);-->

<!--          this.resetNewTeamForm();-->
<!--          // Force reset after successful addition-->
<!--          this.addDialogVisible = false;-->
<!--          await this.fetchTeamData();-->
<!--          await this.fetchCurrentLeaders();-->
<!--          this.$message.success(translate('teamManagement.messages.teamAddedSuccess'));-->
<!--        } catch (error) {-->
<!--          console.error("Error adding team:", error);-->
<!--          this.$message.error(translate('teamManagement.messages.teamAddedFailed'));-->
<!--        } finally {-->
<!--          loader.close();-->
<!--          this.processing = false;-->
<!--        }-->
<!--      });-->
<!--    },-->
<!--    async handleEditConfirm() {-->
<!--      if (this.processing) return;-->
<!--      this.processing = true;-->

<!--      const loader = ElLoading.service({-->
<!--        lock: true,-->
<!--        text: this.translate('common.processing'),-->
<!--        background: 'rgba(255, 255 ,255, 0.35)',-->
<!--      });-->

<!--      this.$refs.editTeamForm.validate(async (valid) => {-->
<!--        if (!valid) {-->
<!--          loader.close();-->
<!--          this.processing = false;-->
<!--          return;-->
<!--        }-->

<!--        try {-->
<!--          const payload = {...this.editTeam};-->
<!--          payload.start_time = this.toOffsetTime(payload.start_time);-->
<!--          payload.end_time = this.toOffsetTime(payload.end_time);-->
<!--          payload.updated_by = this.$store.getters.getUser.id;-->
<!--          payload.member_ids = this.editUser.assignedUsers;-->
<!--          payload.form_ids = this.editForm.assignedForms;-->

<!--          await updateTeam(payload.id, payload);-->

<!--          this.editDialogVisible = false;-->
<!--          await this.fetchTeamData();-->
<!--          await this.fetchCurrentLeaders();-->
<!--          this.$message.success(translate('teamManagement.messages.teamEditedSuccess'));-->
<!--        } catch (error) {-->
<!--          console.error("Error updating team:", error);-->
<!--          this.$message.error(translate('teamManagement.messages.teamEditedFailed'));-->
<!--        } finally {-->
<!--          loader.close();-->
<!--          this.processing = false;-->
<!--        }-->
<!--      });-->
<!--    },-->
<!--    async handleDelete(index, row) {-->
<!--      try {-->
<!--        this.$confirm(-->
<!--            translateWithParams('teamManagement.messages.deletionConfirmation', {name: row.name}),-->
<!--            translate('userManagement.messages.deletionTitle'),-->
<!--            {-->
<!--              confirmButtonText: translate('userManagement.confirm'),-->
<!--              cancelButtonText: translate('userManagement.cancel'),-->
<!--              type: 'warning',-->
<!--            }-->
<!--        ).then(async () => {-->
<!--          await softDeleteTeam(row.id, this.$store.getters.getUser.id);-->
<!--          await this.fetchTeamData();-->
<!--          await this.fetchCurrentLeaders();-->
<!--          this.$message.success(translate('teamManagement.messages.teamDeletedSuccess'));-->
<!--        }).catch(() => {-->
<!--          this.$message.info(translate('teamManagement.messages.teamDeletionCancelled'));-->
<!--        });-->
<!--      } catch (error) {-->
<!--        console.error('Error deleting team:', error);-->
<!--        this.$message.error(translate('teamManagement.messages.teamDeletionFailed'));-->
<!--      }-->
<!--    },-->
<!--    async handleEdit(index, row) {-->
<!--      this.editDialogVisible = false;-->

<!--      // Gather all async data in parallel-->
<!--      const [userRes, formRes] = await Promise.all([-->
<!--        getUsersForTeam(row.id),-->
<!--        getFormIdsForTeam(row.id),-->
<!--      ]);-->

<!--      this.editTeam = {-->
<!--        id: row.id ?? null,-->
<!--        name: row.name ?? "",-->
<!--        type: row.type ?? "",-->
<!--        leader_id: row.leader?.id ?? null,-->
<!--        start_time: row.start_time ? new Date(`1970-01-01T${row.start_time}`) : null,-->
<!--        end_time: row.end_time ? new Date(`1970-01-01T${row.end_time}`) : null,-->
<!--        description: row.description ?? "",-->
<!--        status: row.status,-->
<!--        parent_id: row.parent_id,-->
<!--      };-->

<!--      this.isSubTeam = this.editTeam.parent_id != null;-->
<!--      this.editUser.assignedUsers = userRes.data.data.map(u => u.id);-->
<!--      this.editForm.assignedForms = [...formRes.data.data];-->
<!--      this.syncMembersWithLeader(this.editUser.assignedUsers, this.editTeam.leader_id, null);-->
<!--      this.previousLeaderSelectionId = this.editTeam.leader_id;-->
<!--      this.originalLeaderId = this.editTeam.leader_id;-->
<!--      this.editDialogVisible = true;-->

<!--      await this.$nextTick();-->

<!--      if (this.$refs.editTeamForm) {-->
<!--        this.$refs.editTeamForm.clearValidate();-->
<!--      }-->
<!--    },-->
<!--    async showAddDialog(row = null) {-->
<!--      const oldParentId = this.newTeam.parent_id;-->
<!--      this.addDialogVisible = true;-->
<!--      this.originalLeaderId = null;-->

<!--      if (row.id) {-->
<!--        if (this.newTeam.parent_id !== row.id) {-->
<!--          this.clearLeaderMemberFormSeleciton('create');-->
<!--          this.newTeam.parent_id = row.id;-->
<!--        }-->

<!--        this.isSubTeam = true;-->
<!--      } else {-->
<!--        this.newTeam.parent_id = null;-->
<!--        this.isSubTeam = false;-->
<!--      }-->

<!--      // Rebuild leader/member/form options when parent id changed to same value within same tick.-->
<!--      // This case does not get capture by the watcher, however leader options, member options, form options could be-->
<!--      // dirty due to access by both create/edit team form-->
<!--      if (oldParentId === this.newTeam.parent_id) {-->
<!--        await this.onParentChanged(this.newTeam.parent_id, null, 'create');-->
<!--      }-->

<!--      // Ensure form is ready before clearing validate-->
<!--      await this.$nextTick();-->

<!--      if (this.$refs.addTeamForm){-->
<!--        this.$refs.addTeamForm.clearValidate();-->
<!--      }-->
<!--    },-->
<!--    resetNewTeamForm() {-->
<!--      if (this.$refs.addTeamForm){-->
<!--        this.$refs.addTeamForm.clearValidate();-->
<!--      }-->

<!--      this.newTeam = {-->
<!--        name: "",-->
<!--        type: "",-->
<!--        leader_id: null,-->
<!--        start_time: null,-->
<!--        end_time: null, // Ensure end_time is reset to null-->
<!--        description: "", // Ensure description is reset to empty string-->
<!--        status: 1,-->
<!--        parent_id: null,-->
<!--      };-->

<!--      // Reset users and forms-->
<!--      this.newUser.selectedUsers = [];-->
<!--      this.newForm.selectedForms = [];-->
<!--    },-->
<!--    toTeamOptions(nodes) {-->
<!--      return nodes.map(({ id, name, children }) => ({-->
<!--        value: id,            // keep as string if your component expects it-->
<!--        label: name,-->
<!--        ...(children && children.length-->
<!--            ? { children: this.toTeamOptions(children) }   // recurse-->
<!--            : {})-->
<!--      }));-->
<!--    },-->
<!--    // Prevent selecting itself or child team of itself as its parent team-->
<!--    markSelfAndDescDisabled(nodes, selfId){-->
<!--      return nodes.map((n) => {-->
<!--        const isSelf = n.value === selfId;-->

<!--        // Shallow clone + disabled flag-->
<!--        const clone = { ...n, disabled: isSelf };-->

<!--        // Recurse into children-->
<!--        if (n.children && n.children.length) {-->
<!--          clone.children = this.markSelfAndDescDisabled(n.children, selfId);-->

<!--          // Also disable all descendants of self-->
<!--          if (isSelf) {-->
<!--            clone.children = clone.children.map((c) => ({-->
<!--              ...c,-->
<!--              disabled: true-->
<!--            }));-->
<!--          }-->
<!--        }-->
<!--        return clone;-->
<!--      });-->
<!--    },-->
<!--    parentTeamOptions(id) {-->
<!--      return this.markSelfAndDescDisabled(this.teamOptions, id);-->
<!--    },-->
<!--    // Reload leader/member/form options whenever parent_id changes. Works for both add & edit dialog.-->
<!--    async onParentChanged(newParentId, oldParentId, type) {-->
<!--      let leaderId = null;-->

<!--      if (type === 'create') {-->
<!--        leaderId = this.newTeam.leader_id;-->
<!--      } else {-->
<!--        leaderId = this.editTeam.leader_id-->
<!--      }-->

<!--      const allowedRoleIdByDepthForMember = { 1: [2, 3], 2: [2]};-->
<!--      this.parentFormIds = [];-->

<!--      // If parent id is null, allow manager/supervisor role to be chosen as leader, and all user to be chosen as member-->
<!--      if (!newParentId) {-->
<!--        this.depth = 1;-->
<!--        this.buildLeaderOptions(this.depth);-->
<!--        const allowed = allowedRoleIdByDepthForMember[this.depth] ?? [2,3];-->

<!--        // Limit root team member options to only users with role lower than leader, keep leader user option that is not editable-->
<!--        this.teamMemberOptions = this.userOptions.filter(u => (allowed.includes(u.role_id)-->
<!--            || (leaderId != null && u.id === leaderId)));-->
<!--        return;-->
<!--      }-->

<!--      // Otherwise if team has a parent, build  leader/form/member options based on it-->
<!--      this.depth = 2; // Root depth starts from 1-->
<!--      let parentLeaderId = null;-->

<!--      try {-->
<!--        const { data } = await getTeamById(newParentId);-->
<!--        if (data.status === '200') {-->
<!--          parentLeaderId = data.data.leader?.id ?? null;-->
<!--        }-->
<!--      } catch (err) {-->
<!--        parentLeaderId = null;-->
<!--      }-->

<!--      try {-->
<!--        const { data } = await getTeamDepth(newParentId);-->
<!--        if (data.status === '200'){-->
<!--          this.depth = data.data + 1;-->
<!--        }-->
<!--      } catch (err) {-->
<!--        console.error('getTeamDepth failed', err);-->
<!--      }-->

<!--      this.buildLeaderOptions(this.depth, parentLeaderId);-->

<!--      // Prevent choosing parent team's leader user as a member-->
<!--      try {-->
<!--        const { data } = await getUsersForTeam(newParentId);-->
<!--        const allowed = allowedRoleIdByDepthForMember[this.depth] ?? [2];-->

<!--        // Limit non-root teams member options to: not leader in parent teams and has allowed role or equal to leader-->
<!--        if (data.status === '200') {-->
<!--          this.teamMemberOptions = data.data-->
<!--              .filter(u => (u.id !== parentLeaderId && allowed.includes(u.role?.id))-->
<!--                  || (leaderId != null && u.id === leaderId))-->
<!--              .map(u => ({-->
<!--                role_id: u.role?.id,-->
<!--                ...u-->
<!--              }));-->
<!--        }-->
<!--      } catch (err) {-->
<!--        console.error('Failed to retrieve member ids for team.', err);-->
<!--      }-->

<!--      // Fetch parent team's form for disabling form-->
<!--      try {-->
<!--        const { data } = await getFormIdsForTeam(newParentId);-->
<!--        if (data.status === '200') {-->
<!--          this.parentFormIds = data.data;-->
<!--        }-->
<!--      } catch (err) {-->
<!--        console.error('Failed to retrieve form ids for team.', err);-->
<!--      }-->
<!--    },-->
<!--    // Helper that fills team leader options according to depth-->
<!--    buildLeaderOptions(depth, reservedLeaderId = null) {-->
<!--      // depth 1 team allow leader of manager/supervisor user, otherwise allow supervisor role user.-->
<!--      const allowedRoleIdByDepthForLeader = { 1: [1, 4], 2: [3]};-->
<!--      const allowed = allowedRoleIdByDepthForLeader[depth] ?? [3];-->

<!--      this.teamLeaderOptions = this.userOptions.filter(u => allowed.includes(u.role_id))-->
<!--          .map(u => ({-->
<!--            id: u.id,-->
<!--            name: u.name,-->
<!--            role_id: u.role_id,-->
<!--            disabled: u.id === reservedLeaderId,-->
<!--            team_name: this.currentLeaders.get(u.id) ? this.currentLeaders.get(u.id).team_name : null,-->
<!--            team_id: this.currentLeaders.get(u.id) ? this.currentLeaders.get(u.id).team_id : null,-->
<!--          }));-->
<!--    },-->
<!--    async fetchRoles() {-->
<!--      try {-->
<!--        const { data } = await fetchRoles();-->
<!--        if (data.status === '200') {-->
<!--          this.rolesMap = Object.fromEntries(-->
<!--              data.data.map(r => [r.id, r])-->
<!--          );-->
<!--        }-->
<!--      } catch (e) {-->
<!--        console.error('role list fetch failed', e);-->
<!--        this.rolesMap = {};-->
<!--      }-->
<!--    },-->
<!--    /* helper for template */-->
<!--    getRole(roleId) { return this.rolesMap[roleId] || {}; },-->
<!--    expandAllKeys(list) {-->
<!--      return list.flatMap(n => [-->
<!--        String(n.id),-->
<!--        ...(Array.isArray(n.children) ? this.expandAllKeys(n.children) : [])-->
<!--      ])-->
<!--    },-->
<!--    indentCellStyle({ row /* , column, rowIndex, columnIndex */ }) {-->
<!--      const depth = (row.level || 1) - 1;            // root (level 1) → 0 px-->
<!--      return { paddingLeft: `${depth * 10}px` };     // same 16 px Element-Plus uses-->
<!--    },-->
<!--    handleIsSubTeam() {-->
<!--      // Clears team form's parent id when isSubTeam is toggled to false-->
<!--      if (this.isSubTeam === false) {-->
<!--        if (this.newTeam.parent_id != null) {-->
<!--          this.newTeam.parent_id = null;-->
<!--        }-->

<!--        if (this.editTeam.parent_id != null) {-->
<!--          this.editTeam.parent_id = null;-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    syncMembersWithLeader(membersArr, newLeaderSelectionId, oldLeaderSelectionId){-->
<!--      const set = new Set(membersArr);-->
<!--      const memberOptions = this.teamMemberOptions;-->

<!--      if (oldLeaderSelectionId) {-->
<!--        set.delete(oldLeaderSelectionId);-->

<!--        // Remove previous leader from the member options-->
<!--        const optionIndex = memberOptions.findIndex(u => u.id === oldLeaderSelectionId);-->

<!--        if (optionIndex !== -1) {-->
<!--          memberOptions.splice(optionIndex, 1);-->
<!--        }-->
<!--      }-->

<!--      if (!newLeaderSelectionId) {-->
<!--        membersArr.splice(0, membersArr.length, ...set);-->
<!--        return;-->
<!--      }-->

<!--      set.add(newLeaderSelectionId);-->
<!--      membersArr.splice(0, membersArr.length, ...set);-->

<!--      // Add leader to the member options-->
<!--      if (!memberOptions.some(u => u.id === newLeaderSelectionId)) {-->
<!--        const user = this.userOptions.find(u => u.id === newLeaderSelectionId);-->

<!--        if (user) {-->
<!--          memberOptions.push({-->
<!--            id: user.id,-->
<!--            name: user.name,-->
<!--            role_id: user.role?.id,-->
<!--          });-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    async handleNewLeaderSelection(teamObj, members, newVal) {-->
<!--      // previousLeader id is use for sync member list, this changes as dropdown selection changes-->
<!--      // original leader id is used for displaying when a swapping happens-->

<!--      const oldVal = this.previousLeaderSelectionId ?? null;-->

<!--      if (newVal === oldVal) { // unchanged-->
<!--        return;-->
<!--      }-->

<!--      if (!newVal) {  // leader cleared-->
<!--        this.syncMembersWithLeader(members, newVal, oldVal);-->
<!--        this.previousLeaderSelectionId = null;-->
<!--        return;-->
<!--      }-->

<!--      const hasOriginalLeader   = this.originalLeaderId != null;-->
<!--      const allUsers = this.userOptions;-->
<!--      const userById = id => allUsers.find(u => u.id === id);-->
<!--      const newLeader = userById(newVal) ?? null;-->

<!--      // !! convert all including false, empty string, 0, undefined, and null to false-->
<!--      const isNewValCurrentLead = !!(newLeader && this.currentLeaders.get(newLeader.id));-->
<!--      const isNewValSameAsOriginal = (this.originalLeaderId === newVal);-->

<!--      // Skip confirmation if new selection is not a current leader or same as original leader-->
<!--      if (!isNewValCurrentLead || isNewValSameAsOriginal) {-->
<!--        this.syncMembersWithLeader(members, newVal, oldVal);-->
<!--        this.previousLeaderSelectionId = newVal;-->
<!--        return;-->
<!--      }-->

<!--      const oldLeader = userById(this.originalLeaderId);-->
<!--      let otherTeamName = 'none';-->

<!--      // New leader can be null, and it may not be a existing leader-->
<!--      if (newLeader && this.currentLeaders.get(newLeader.id)) {-->
<!--        otherTeamName = this.currentLeaders.get(newLeader.id).team_name;-->
<!--      }-->

<!--      await this.$confirm(-->
<!--          translateWithParams('teamManagement.messages.leaderSwapMessage',-->
<!--              {-->
<!--                targetLeader: oldLeader?.name ?? translate('common.none'),-->
<!--                otherTeamName: otherTeamName,-->
<!--                otherTeamLeader: newLeader.name,-->
<!--              }),-->
<!--          this.translate('teamManagement.leaderSwapWarning'),-->
<!--          {-->
<!--            confirmButtonText: this.translate('common.confirm'),-->
<!--            cancelButtonText:  this.translate('common.cancel'),-->
<!--            type: 'warning',-->
<!--          }).then(()=> { // user confirmed-->
<!--            this.syncMembersWithLeader(members, newVal, oldVal);-->
<!--            this.previousLeaderSelectionId = newVal;-->
<!--          }).catch(()=> { // user cancelled – revert selection-->
<!--            this.syncMembersWithLeader(members, null, oldVal);-->
<!--            teamObj.leader_id = this.originalLeaderId;-->
<!--          });-->
<!--    },-->
<!--    clearTeamDialogSearch() {-->
<!--      this.searchUserQuery = "";-->
<!--    },-->
<!--    clearLeaderMemberFormSeleciton(type) {-->
<!--      if (type === 'edit') {-->
<!--        this.editTeam.leader_id = null;-->
<!--        this.editUser.assignedUsers = [];-->
<!--        this.editForm.assignedForms = [];-->
<!--      } else {-->
<!--        this.newTeam.leader_id = null;-->
<!--        this.newUser.selectedUsers = [];-->
<!--        this.newForm.selectedForms = [];-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  watch: {-->
<!--    'newTeam.parent_id': {-->
<!--      immediate: true,-->
<!--      async handler(newId, oldId) {-->
<!--        if (newId !== oldId) {-->
<!--          await this.onParentChanged(newId, oldId, 'create');-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    'editTeam.parent_id': {-->
<!--      immediate: true,-->
<!--      async handler(newId, oldId) {-->
<!--        if (newId !== oldId) {-->
<!--          await this.onParentChanged(newId, oldId, 'edit');-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.popup-container {-->
<!--  padding-right: 40px;-->
<!--}-->

<!--.refresh-button {-->
<!--  background-color: #80cfff;-->
<!--  border-color: #80cfff;-->
<!--}-->

<!--.refresh-button:hover {-->
<!--  background-color: #66b5ff;-->
<!--  border-color: #66b5ff;-->
<!--  transform: rotate(360deg);-->
<!--  transition: transform 0.3s ease-in-out, background-color 0.2s ease;-->
<!--}-->

<!--/* Make the outer container span the full height of the viewport */-->
<!--:host {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  height: 100vh; /* Full viewport height */-->
<!--}-->

<!--/* Set the table container to use the remaining height */-->
<!--.tableContainer {-->
<!--  flex-grow: 1; /* Fill available space */-->
<!--  overflow-y: auto; /* Enable vertical scrolling */-->
<!--  max-height: calc(100vh - 160px); /* Adjust for header/footer heights */-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--}-->
<!--</style>-->
