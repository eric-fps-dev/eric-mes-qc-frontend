<template>
  <div>
    <!-- Toolbar with Search Bar and Add Button -->
    <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2>{{ translate('userManagement.title') }}</h2>
        <el-input
            v-model="searchQuery"
            :placeholder="translate('userManagement.searchPlaceholder')"
            clearable
            @input="filterTable"
            style="width: 300px; margin-left: 20px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div style="display: flex; gap: 10px;">
        <!-- Refresh Button -->
        <el-tooltip :content="translate('userManagement.refreshTooltip')" placement="top">
          <el-button
              class="refresh-button"
              type="primary"
              circle
              @click="fetchData"
          >
            <el-icon style="color: white;"><RefreshRight /></el-icon>
          </el-button>
        </el-tooltip>

        <!-- Add Button -->
        <el-button
            type="primary"
            @click="showAddDialog"
        >
          {{ translate('userManagement.addButton') }}
        </el-button>
      </div>
    </div>

    <!-- Table -->
    <div class="tableContainer" style="overflow-x: auto; max-width: 100%;">
      <el-table
          v-loading="loading"
          :data="paginatedUsers"
          :height="tableHeight"
          style="width: 100%"
          @sort-change="handleSortChange"
          :empty-text="translate('common.noData')"
      >
        <el-table-column :label="translate('userManagement.table.id')" width="100" prop="id" sortable>
          <template #default="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="translate('userManagement.table.name')" prop="name" width="180" sortable>
          <template #default="scope">
            <el-popover trigger="hover" placement="top">
              <template #default>
                <p>{{ translate('userManagement.table.name') }}: {{ scope.row.name }}</p>
<!--                <p>{{ translate('userManagement.table.wecomId') }}: {{ scope.row.wecom_id }}</p>-->
              </template>
              <template #reference>
                <el-tag size="default">{{ scope.row.name }}</el-tag>
              </template>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column :label="translate('userManagement.table.username')" prop="username" width="180" sortable>
          <template #default="scope">
            <span>{{ scope.row.username ?? '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="translate('userManagement.table.teams')" prop="teams" width="280">
          <template #default="scope">
            <div>
              <el-tag
                  v-for="(team, index) in scope.row.teams"
                  :key="index"
                  size="small"
                  style="margin-right: 5px;"
                  round
                  :effect="scope.row.leadership_teams?.includes(team.id) ? 'dark' : 'light'"
              >
                <el-popover trigger="hover" placement="top">
                  <template #default>
                    <p>ID: {{ team.id }}</p>
                    <p>{{ translate('userManagement.table.teams') }}: {{ team.team_name }}</p>
                    <p>{{ translate('userManagement.table.leader') }}: {{ team.leader_name }}</p>
                  </template>
                  <template #reference>
                    {{ team.team_name }}
                  </template>
                </el-popover>
              </el-tag>
            </div>
          </template>
        </el-table-column>

<!--        <el-table-column :label="translate('userManagement.table.wecomId')" prop="wecom_id" width="180" sortable>-->
<!--          <template #default="scope">-->
<!--            <span>{{ scope.row.wecom_id }}</span>-->
<!--          </template>-->
<!--        </el-table-column>-->

        <el-table-column :label="translate('userManagement.table.role')" prop="role.name" width="150" sortable>
          <template #default="scope">
            <el-tag
                :type="scope.row.role.el_tag_type || 'info'"
                size="default"
                style="font-weight:bold"
            >
              {{ scope.row.role.name }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
            :label="translate('userManagement.table.status')" prop="activation_status" width="140" sortable
        >
          <template #header>
            <span>
              {{ translate('userManagement.table.status') }}
              <el-tooltip :content="translate('userManagement.table.statusTooltip')" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
            </template>
            <template #default="scope">
              <el-switch
                  v-model="scope.row.activation_status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleActivationStatusChange(scope.row.id, scope.row.activation_status)"
              />
          </template>
        </el-table-column>

        <el-table-column :label="translate('userManagement.table.email')" prop="email" width="220px" sortable>
          <template #default="scope">
            <span>{{ scope.row.email ?? '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="translate('userManagement.table.phoneNumber')" prop="phone_number" width="180px" sortable >
          <template #default="scope">
            <span>{{ scope.row.phone_number ?? '-' }}</span>
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
<!--            <el-button size="small" class="custom-assign-button" @click="">-->
<!--              Assign-->
<!--            </el-button>-->
            <el-button
                size="small"
                @click="handleEdit(scope.$index, scope.row)"
            >
              {{ translate("userManagement.edit") }}
            </el-button>
            <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
            >
              {{ translate("userManagement.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
        v-if="filteredData.length > 15"
        style="margin-top: 10px"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[15, 30, 45, 60]"
        layout="total, sizes, prev, pager, next"
        :total="filteredData.length"
        :hide-on-single-page="true"
    >
      <!-- Translate the Total -->
      <template #total>
        {{ translate('pagination.total', { total: filteredData.length }) }}
      </template>

      <!-- Translate the /page -->
      <template #sizes>
        <span>{{ translate('pagination.perPage') }}</span>
        <el-select v-model="pageSize" placeholder="Select">
          <el-option
              v-for="size in [15, 30, 45, 60]"
              :key="size"
              :label="`${size} ${translate('pagination.perPage')}`"
              :value="size"
          />
        </el-select>
      </template>
    </el-pagination>


    <!-- Add User Dialog -->
    <el-dialog
        :title="translate('userManagement.addDialog.title')"
        v-model="addDialogVisible"
        width="50%"
        @keyup.enter.native="validateAndAddUser"
    >
      <div class="popup-container">
        <el-form ref="addUserForm" :model="newUser" :rules="rules" label-width="140px">
          <el-form-item :label="translate('userManagement.table.name')" prop="name">
            <el-input
                v-model="newUser.name"
            />
          </el-form-item>

          <el-form-item :label="translate('userManagement.table.role')" prop="role">
            <el-select
                v-model="newUser.role"
                :placeholder="translate('userManagement.role.selectRolePlaceHolder')"
            >
              <el-option
                  v-for="role in rolesOptions"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
              >
                <el-tag :type="role.el_tag_type">{{ role.name }}</el-tag>
              </el-option>
            </el-select>
          </el-form-item>

<!--          <el-form-item :label="translate('userManagement.addDialog.wecomId')" prop="wecomId">-->
<!--            <el-input-->
<!--                v-model="newUser.wecomId"-->
<!--            />-->
<!--          </el-form-item>-->

          <el-form-item :label="translate('userManagement.addDialog.email')" prop="email">
            <el-input
                v-model="newUser.email"
            />
          </el-form-item>

          <el-form-item :label="translate('userManagement.addDialog.phoneNumber')" prop="phone_number">
            <el-input
                v-model="newUser.phone_number"
            />
          </el-form-item>

          <el-form-item
              :label="t('userManagement.membershipTeams')"
          >
            <team-membership-select
                v-model="newUser.membershipTeams"
                :tree="teamsOptions"
                :parent-map="teamsParentMap"
                :role="newUser.role"
                id="um-add-memberships"
            />
          </el-form-item>

          <el-form-item
            :label="t('userManagement.leadershipTeams')"
          >
            <team-leadership-select
                v-model="newUser.leadershipTeams"
                :tree="teamsOptions"
                :parent-map="teamsParentMap"
                :role="newUser.role"
            />
          </el-form-item>

          <el-form-item :label="translate('userManagement.addDialog.status')" prop="activation_status">
            <el-select
                v-model="newUser.activation_status"
                :placeholder="translate('userManagement.addDialog.status')"
            >
              <el-option
                  :label="translate('userManagement.status.active')"
                  :value="1"
              />
              <el-option
                  :label="translate('userManagement.status.inactive')"
                  :value="0"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="translate('userManagement.addDialog.username')" prop="username">
            <el-input
                v-model="newUser.username"
            />
          </el-form-item>

          <el-form-item :label="translate('userManagement.addDialog.password')" prop="password">
            <el-input
                v-model="newUser.password"
                type="password"
                show-password
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="popup-container">
          <el-button
              @click="addDialogVisible = false"
          >
            {{ translate('userManagement.cancel') }}
          </el-button>
          <el-button
              type="primary"
              @click="validateAndAddUser"
          >
            {{ translate('userManagement.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Edit User Dialog -->
    <el-dialog :title="translate('userManagement.editDialog.title')" v-model="editDialogVisible" width="50%" @keyup.enter.native="handleEditConfirm">
      <div class="popup-container">
        <el-form ref="editUserForm" :model="editUser" :rules="rules" label-width="140px">
          <el-form-item :label="translate('userManagement.editDialog.name')" prop="name">
            <el-input v-model="editUser.name" />
          </el-form-item>

          <el-form-item :label="translate('userManagement.editDialog.role')" prop="role">
            <el-select v-model="editUser.role" :placeholder="translate('userManagement.role.selectRolePlaceHolder')">
              <el-option
                  v-for="role in rolesOptions"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
              >
                <el-tag :type="role.el_tag_type">{{ role.name }}</el-tag>
              </el-option>
            </el-select>
          </el-form-item>

<!--          <el-form-item :label="translate('userManagement.editDialog.wecomId')" prop="wecomId">-->
<!--            <el-input v-model="editUser.wecomId" />-->
<!--          </el-form-item>-->

          <el-form-item :label="translate('userManagement.editDialog.username')" prop="username">
            <el-input v-model="editUser.username" />
          </el-form-item>

          <el-form-item :label="translate('userManagement.editDialog.email')" prop="email">
            <el-input v-model="editUser.email" />
          </el-form-item>

          <el-form-item :label="translate('userManagement.editDialog.phoneNumber')" prop="phone_number">
            <el-input v-model="editUser.phone_number" />
          </el-form-item>

          <el-form-item
              :label="t('userManagement.membershipTeams')"
          >
            <team-membership-select
                v-model="editUser.membershipTeams"
                :tree="teamsOptions"
                :parent-map="teamsParentMap"
                :role="editUser.role"
            />
          </el-form-item>

          <el-form-item
              :label="t('userManagement.leadershipTeams')"
          >
            <team-leadership-select
                v-model="editUser.leadershipTeams"
                :tree="teamsOptions"
                :parent-map="teamsParentMap"
                :role="editUser.role"
            />
          </el-form-item>

          <el-form-item :label="translate('userManagement.editDialog.status')" prop="activation_status">
            <el-select v-model="editUser.activation_status" :placeholder="translate('userManagement.editDialog.status')">
              <el-option :label="translate('userManagement.status.active')" :value="1" />
              <el-option :label="translate('userManagement.status.inactive')" :value="0" />
            </el-select>
          </el-form-item>

          <!-- Change Password Checkbox -->
          <el-form-item>
            <el-checkbox v-model="changePassword">{{ translate('userManagement.editDialog.changePassword') }}</el-checkbox>
          </el-form-item>

          <!-- Password Fields -->
          <el-form-item v-if="changePassword" :label="translate('userManagement.editDialog.newPassword')" prop="newPassword">
            <el-input v-model="newPassword" type="password" show-password />
          </el-form-item>

          <el-form-item v-if="changePassword" :label="translate('userManagement.editDialog.confirmPassword')" prop="confirmPassword">
            <el-input v-model="confirmPassword" type="password" show-password />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="popup-container">
          <el-button @click="editDialogVisible = false">{{ translate('userManagement.editDialog.cancelButton') }}</el-button>
          <el-button type="primary" @click="handleEditConfirm">{{ translate('userManagement.editDialog.confirmButton') }}</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { Search, Plus, QuestionFilled, RefreshRight } from '@element-plus/icons-vue';
import {translate as t, translate, translateWithParams} from "@/utils/i18n";
import {
  fetchUsers,
  addUser,
  updateUser,
  softDeleteUser,
} from '@/services/userService.js';
import {
  getAllTeamTree,
  setTeamLeader,
  clearTeamLeader,
  getTeamByTeamLeadId,
  removeOrphanLeadership
} from "@/services/teamService";
import {assignUserToTeams, removeUserFromAllTeams} from "@/services/teamUserService";
import {fetchRoles} from "@/services/roleService";
import TeamMembershipSelect from "@/components/user/TeamMembershipSelect.vue";
import TeamLeadershipSelect from "@/components/user/TeamLeadershipSelect.vue";

export default {
  name: 'UserManagement',
  components: {
    QuestionFilled,
    Search,
    Plus,
    RefreshRight,
    TeamMembershipSelect,
    TeamLeadershipSelect,
  },
  data() {
    return {
      teamsOptions: [],
      teamsParentMap: {},
      tableData: [], // Original data
      loading: false, // Loading state for the table
      filteredData: [], // Filtered data for display
      currentPage: 1, // Current page number
      pageSize: 15, // Number of items per page
      rolesOptions: [], // Stores roles fetched from backend
      searchQuery: '', // Search input value
      addDialogVisible: false, // Controls the visibility of the add user dialog
      editDialogVisible: false, // Controls the visibility of the edit user dialog
      sortSettings: { prop: '', order: '' }, // store sorting column and order
      newUser: {
        name: '',
        role: '',
        wecomId: '',
        username: '',
        email: '',
        phone_number: '',
        activation_status: 1, // Default to Active
        password: '',
        membershipTeams: [],
        leadershipTeams: [],
        teamAssignment: null,
      },
      editUser: {
        id: null,
        name: '',
        role: '',
        wecomId: '',
        username: '',
        email: '',
        phone_number: '',
        activation_status: null,
        membershipTeams: [], // Array to hold selected teams
        leadershipTeams: [],
        teamAssignment: null,
      },
      changePassword: false, // Checkbox state for edit dialog
      newPassword: '', // New password input
      confirmPassword: '', // Confirm password input
      rules: {
        name: [{ required: true, message: translate('userManagement.validation.nameRequired'), trigger: 'blur' }],
        role: [{ required: true, message: translate('userManagement.validation.roleRequired'), trigger: 'change' }],
        wecomId: [{ required: false, message: translate('userManagement.validation.wecomIdRequired'), trigger: 'blur' }],
        activation_status: [{ required: true, message: translate('userManagement.validation.statusRequired'), trigger: 'change' }],
        username: [
          { required: true, message: translate('userManagement.validation.usernameRequired'), trigger: 'blur' },
          { min: 4, message: translate('userManagement.validation.usernameMinLength'), trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!value) return callback();

              // Get the list excluding the current user's username
              const existingNames = this.tableData
                  .filter(user => user.id !== (this.editUser.id || this.newUser.id)) // Exclude self
                  .map(user => user.username.toLowerCase());

              if (existingNames.includes(value.toLowerCase())) {
                return callback(new Error(translate('userManagement.validation.usernameExists')));
              }
              callback();
            },
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: translate('userManagement.validation.passwordRequired'), trigger: 'blur' },
          { min: 4, message: translate('userManagement.validation.passwordMinLength'), trigger: 'blur' },
        ],
        phone_number: [
          {
            required: true,
            message: translate('userManagement.validation.phoneNumberRequired'),
            trigger: 'blur'
          },
          {
            pattern: /^\+?[1-9]\d{1,14}$/,
            message: translate('userManagement.validation.phoneNumberFormat'),
            trigger: 'blur'
          }
        ]
        // newPassword: [
        //   {
        //     validator: (rule, value, callback) => {
        //       console.log('Validating newPassword:', value);
        //       if (this.changePassword && (!value || value.length < 4)) {
        //         callback(new Error('Password must be at least 4 characters'));
        //       } else {
        //         callback();
        //       }
        //     },
        //     trigger: 'blur',
        //   },
        // ],
        // confirmPassword: [
        //   {
        //     validator: (rule, value, callback) => {
        //       console.log('Validating confirmPassword:', value, 'Against:', this.newPassword);
        //       if (this.changePassword && value !== this.newPassword) {
        //         callback(new Error('Passwords must match'));
        //       } else {
        //         callback();
        //       }
        //     },
        //     trigger: 'blur',
        //   },
        // ],
      },
      tableHeight: window.innerHeight - 50 - 100 - 20 - 20 - 10,
    };
  },
  watch: {
    "newUser.role": {
      handler(newRoleId, oldRoleId) {
        if (newRoleId === oldRoleId) return               // user didn’t change it

        if (!this.editDialogVisible) return

        this.newUser.membershipTeams = []
        this.newUser.leadershipTeams = []
      },
    },
    "editUser.role": {
      handler(newRoleId, oldRoleId) {
        if (newRoleId === oldRoleId) return               // user didn’t change it

        if (!this.editDialogVisible) return

        this.editUser.membershipTeams = []
        this.editUser.leadershipTeams = []
      },
    },
  },
  created() {
    this.fetchUserData();
    this.fetchTeamOptions();
    this.fetchRoles();
  },
  computed: {
    existingUsernames() {
      return this.tableData
          .filter(user => user.id !== (this.editUser.id || this.newUser.id)) // Exclude self
          .map(user => user.username.toLowerCase());
    },
    paginatedUsers() {
      // Apply sorting first
      const sortedData = [...this.filteredData].sort((a, b) => {
        const { prop, order } = this.sortSettings;
        if (!prop || !order) return 0; // No sorting applied

        const getValue = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj); // dynamically traverse nested properties so that role.name works
        const valueA = getValue(a, prop);
        const valueB = getValue(b, prop);

        if (order === 'ascending') return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        if (order === 'descending') return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        return 0;
      });

      // Then apply pagination
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
  methods: {
    t,
    translate,
    handleSortChange({ prop, order }) {
      // Update the sorting settings
      this.sortSettings = { prop, order };
    },
    updateTableHeight() {
      this.tableHeight = window.innerHeight - 50 - 100 - 20 - 20 - 10;
    },
    async fetchData(){
     await this.fetchUserData();
     await this.fetchRoles();
     await this.fetchTeamOptions();
    },
    async fetchRoles() {
      try {
        const response = await fetchRoles();
        if (response.data.status === '200') {
          this.rolesOptions = response.data.data.map(role => ({
            id: role.id,
            name: role.name,
            el_tag_type: role.el_tag_type || 'info'
          }));
        }
        console.log('Roles fetched:', this.rolesOptions)
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    },
    async fetchUserData() {
      this.loading = true;
      try {
        const response = await fetchUsers();
        if (response.data.status === '200') {
          const sortedData = response.data.data.sort((a, b) => a.id - b.id); // Sort by ID
          this.tableData = sortedData;

          if (this.searchQuery.trim()) {
            this.filterTable();
          } else {
            this.filteredData = sortedData;
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchTeamOptions() {
      try {
        const { data } = await getAllTeamTree();

        if (data.status !== '200') {
          this.teamsOptions = [];
          return;
        }

        /** Recursively copy node → add value/label → skip nodes with status = 0 */
        const toOptionNode = (team) => {
          // Allow status 0 teams for now
          // if (team.status === 0) return null;

          const children =
              Array.isArray(team.children)
                  ? team.children.map(toOptionNode).filter(Boolean) // remove nulls
                  : [];

          return {
            ...team,
            value: team.id,
            label: team.name,
            disabled: false,
            children,
          };
        };

        this.teamsOptions = data.data
            .map(toOptionNode)
            .filter(Boolean);    // strip any nulls that bubbled up

        this.buildParentMap(this.teamsOptions);
      } catch (err) {
        console.error('Error fetching teams:', err);
        this.teamsOptions = [];
      }
    },
    buildParentMap(nodes, pid = null){
      nodes.forEach(n => {
        this.teamsParentMap[n.id] = pid;
        if(n.children) {
          this.buildParentMap(n.children,n.id)
        }
      });
    },
    async handleActivationStatusChange(userId, newActivationStatus) {
      const currentUserId = this.$store.getters.getUser.id;

      // Check if deactivating self
      if (userId === currentUserId && newActivationStatus === 0) {
        try {
          await this.$confirm(
              translate('userManagement.messages.selfDeactivationWarning'),
              translate('common.warning'),
              {
                confirmButtonText: translate('userManagement.confirm'),
                cancelButtonText: translate('userManagement.cancel'),
                type: "warning",
              }
          )
              .then(async () => {
                // Proceed with deactivation
                const payload = { activation_status: newActivationStatus };
                await updateUser(userId, payload);
                this.$message.success(translate('userManagement.messages.selfDeactivationSuccess'));
                // Handle logout or session cleanup here
              })
              .catch(() => {
                this.$message.info(translate('userManagement.operationCancelled'));
                this.fetchUserData(); // Refresh the table data
              });
        } catch (error) {
          console.error("注销用户有误:", error);
          this.$message.error(translate('userManagement.messages.deactivationFailed'));
        }
        return;
      }

      // Regular status change logic for other users
      try {
        const payload = { activation_status: newActivationStatus };
        await updateUser(userId, payload);
        this.$message.success(translate('userManagement.messages.statusUpdatedSuccess'));
        await this.fetchUserData(); // Refresh the table data
      } catch (error) {
        console.error("激活状态更新有误", error);
        this.$message.error(translate('userManagement.messages.statusUpdatedFailed'));
      }
    },
    getRoleName(roleId) {
      if (roleId === 1) {
        return translate("userManagement.role.admin");
      }
      if (roleId === 2) {
        return translate("userManagement.role.qcWorker");
      }
      return translate("userManagement.role.unknown");
    },
    validateAndAddUser() {
      this.$refs.addUserForm.validate(async (valid) => {
        if (valid) {
          await this.performAddUser(); // Call the actual method to add the user
        } else {
          this.$message.error(translate("userManagement.messages.pleaseCorrectErrors"));
        }
      });
    },
    async performAddUser() {
      try {
        const roleId = this.editUser.role; // Now role is stored as ID directly
        const encryptedPassword = btoa(this.newUser.password);
        const payload = {
          name: this.newUser.name,
          role: {
            id: this.newUser.role
          },
          wecom_id: this.newUser.wecomId,
          username: this.newUser.username,
          email: this.newUser.email ?? '',
          phone_number: this.newUser.phone_number ?? '',
          status: 1,
          activation_status: this.newUser.activation_status ?? 1,
          password: encryptedPassword,
        };

        const addUserResponse = await addUser(payload);

        // Handle membership team assignments by assigning the created user as members to the selected teams
        const createdUserId = addUserResponse.data.data.id;
        if (this.newUser.membershipTeams && this.newUser.membershipTeams.length > 0) {
          await assignUserToTeams(createdUserId, this.newUser.membershipTeams);
        }

        if (this.newUser.leadershipTeams.length) {
          await setTeamLeader(this.newUser.leadershipTeams[0], createdUserId)
        }

        this.addDialogVisible = false;
        await this.fetchData();
        this.$message.success(translate('userManagement.messages.userAddedSuccess'));
      } catch (error) {
        console.error('Error adding user:', error);
        this.$message.error(translate('userManagement.messages.userAddedSuccess'));
      }
    },
    async handleEditConfirm() {
      this.$refs.editUserForm.validate(async (valid) => {
        if (valid) {
          try {
            const payload = {
              name: this.editUser.name,
              role: {
                id: this.editUser.role // this role is actually role id, nado
              },
              wecom_id: this.editUser.wecomId,
              username: this.editUser.username,
              email: this.editUser.email,
              phone_number: this.editUser.phone_number,
              activation_status: this.editUser.activation_status,
            };

            // Include password if changePassword is checked, in the future integrate to the same validation check
            if (this.changePassword) {
              if (!this.newPassword || this.newPassword !== this.confirmPassword || this.newPassword.length < 4) {
                this.$message.error(translate('userManagement.messages.passwordNotMatchOrFewerCharacters'));
                return;
              }
              payload.password = btoa(this.newPassword);
            }

            await updateUser(this.editUser.id, payload);

            // Handle membership/leadership assignment
            try {
              // Remove the user from all current teams
              await removeUserFromAllTeams(this.editUser.id);

              // Add user as members to these teams
              if (this.editUser.membershipTeams && this.editUser.membershipTeams.length > 0) {
                await assignUserToTeams(this.editUser.id, this.editUser.membershipTeams);
              }

              // ---  Leadership Association -------------------------------------------------
              const prevTeamId = this.editUser.originalLeaderTeamId           // may be null
              const newTeamId  = this.editUser.leadershipTeams[0] ?? null     // may be null

              // user cleared the field, remove leadership on the previous team
              if (prevTeamId && !newTeamId) {
                await clearTeamLeader(prevTeamId)
              }

              // user switched from leader on team A to leader on team B
              if (prevTeamId && newTeamId && prevTeamId !== newTeamId) {
                await clearTeamLeader(prevTeamId)
                await setTeamLeader(newTeamId, this.editUser.id)
              }

              // user picked a leader for the first time
              if (!prevTeamId && newTeamId) {
                await setTeamLeader(newTeamId, this.editUser.id)
              }

              // check if associated leadership is no longer valid (missing membership in parent team etc.)
              await removeOrphanLeadership(this.editUser.id);

              this.$message.success(translate('userManagement.messages.teamsUpdatedSuccess'));
            } catch (teamError) {
              console.error("Error updating teams:", teamError);
              this.$message.error(translate('userManagement.messages.teamsUpdateFailed'));
            }

            this.editDialogVisible = false;
            await this.fetchData();
            this.$message.success(translate('userManagement.messages.userUpdatedSuccess'));
          } catch (error) {
            console.error("Error editing user:", error);
            this.$message.error(translate('userManagement.messages.userUpdatedFailed'));
          }
        } else {
          this.$message.error(translate('userManagement.messages.pleaseCorrectErrors'));
        }
      });
    },
    async handleEdit(index, row) {
      this.editUser.id = row.id;
      this.editUser.name = row.name;
      this.editUser.role = row.role.id;
      this.editUser.wecomId = row.wecom_id;
      this.editUser.username = row.username;
      this.editUser.email = row.email;
      this.editUser.phone_number = row.phone_number;
      this.editUser.activation_status = row.activation_status;
      this.editUser.leadershipTeams = row.leadership_teams ?? [];
      // Expect only one id in leadership_teams for now
      this.editUser.originalLeaderTeamId = row.leadership_teams?.[0] ?? null

      // remove user id that are already in leadership teams
      this.editUser.membershipTeams = row.teams.map(team => team.id).filter(id => !(row.leadership_teams ?? []).includes(id));

      this.changePassword = false; // Reset checkbox
      this.newPassword = ''; // Reset password fields
      this.confirmPassword = '';

      await this.$nextTick();
      this.editDialogVisible = true;
    },
    async handleDelete(index, row) {
      const currentUserId = this.$store.getters.getUser.id; // Get logged-in user ID

      // Check if the user is deleting/deactivating themselves
      if (row.id === currentUserId) {
        try {
          // Show self-deletion confirmation dialog
          await this.$confirm(
              translate('userManagement.messages.selfDeletionWarning'),
              translate('userManagement.messages.deletionTitle'),
              {
                confirmButtonText: translate('userManagement.confirm'),
                cancelButtonText: translate('userManagement.cancel'),
                type: "warning",
              }
          )
              .then(async () => {
                // If confirmed, call delete API
                await softDeleteUser(row.id);
                this.$message.success(translate('userManagement.messages.yourAccountIsDeletedAndUnableToLogin'));
                await this.fetchUserData(); // Refresh the table data
                // handle logout or session cleanup: optional for now, give the user chance to wrap up
              })
              .catch(() => {
                this.$message.info(translate('userManagement.operationCancelled'));
                this.fetchUserData(); // Refresh the table data
              });
        } catch (error) {
          console.error("Error deleting user:", error);
          this.$message.error(translate('userManagement.deletionFailed'));
        }
        return;
      }

      // Regular deletion for other users
      try {
          this.$confirm(
              translateWithParams('userManagement.messages.deletionConfirmation', { name: row.name }),
              translate('userManagement.messages.deletionTitle'),
              {
                confirmButtonText: translate('userManagement.confirm'),
                cancelButtonText: translate('userManagement.cancel'),
                type: 'warning',
              }
          )
            .then(async () => {
              // If confirmed, call delete API
              await softDeleteUser(row.id);
              await removeUserFromAllTeams(row.id);
              this.$message.success(translate('userManagement.messages.userDeletedSuccess'));
              await this.fetchUserData(); // Refresh the table data
            })
            .catch(() => {
              this.$message.info(translate('userManagement.operationCancelled'));
            });
      } catch (error) {
        console.error("Error deleting user:", error);
        this.$message.error(translate('userManagement.messages.userDeletedFailed'));
      }
    },
    showAddDialog() {
      this.addDialogVisible = true;
      this.resetNewUserForm();
    },
    resetNewUserForm() {
      this.newUser.name = '';
      this.newUser.role = '';
      this.newUser.wecomId = '';
      this.newUser.username = '';
      this.newUser.password = '';
      this.newUser.email = '';
      this.newUser.phone_number = '';
      this.newUser.activation_status = 1;
      this.newUser.membershipTeams = [];
      this.newUser.leadershipTeams = [];
    },
    filterTable() {
      const searchText = this.searchQuery.toLowerCase();
      this.filteredData = this.tableData.filter((item) => {
        return (
            (item.id && String(item.id).toLowerCase().includes(searchText)) || // 过滤 ID
            (item.name && item.name.toLowerCase().includes(searchText)) || // 过滤 名称
            (item.username && item.username.toLowerCase().includes(searchText)) || // 过滤 用户名
            (item.wecom_id && item.wecom_id.toLowerCase().includes(searchText)) || // 过滤 企业微信 ID
            (item.email && item.email.toLowerCase().includes(searchText)) || // 过滤 Email
            (item.phone_number && item.phone_number.toLowerCase().includes(searchText)) || // 过滤 电话号码
            (item.role_id && this.getRoleName(item.role_id).toLowerCase().includes(searchText)) || // 过滤 角色
            (item.activation_status !== undefined && (item.activation_status === 1 ? "已激活" : "未激活").includes(searchText)) || // 过滤 状态 TODO: remove hardcoded filtering
            (item.teams && item.teams.some(team => team.team_name.toLowerCase().includes(searchText))) // 过滤 所属班组
        );
      });

      this.currentPage = 1;
    },
    handleSizeChange(size) {
      this.pageSize = size;
    },
    handleCurrentChange(page) {
      this.currentPage = page;
    },
  },
};
</script>

<style scoped>
  .popup-container {
    padding-right: 40px;
  }

  .refresh-button {
    background-color: #80cfff; /* Slightly lighter shade of primary color */
    border-color: #80cfff; /* Match lighter background */
  }

  .refresh-button:hover {
    background-color: #66b5ff; /* Slightly darker hover effect */
    border-color: #66b5ff;
    transform: rotate(360deg); /* Rotate on hover */
    transition: transform 0.3s ease-in-out, background-color 0.2s ease; /* Smooth animation */
  }

  .refresh-button el-icon {
    color: white; /* Darker primary-like color for the refresh icon */
  }

  .tableContainer {
    display: flex;
    flex-direction: column;
    overflow-x: auto;
    max-width: 100%;
    white-space: nowrap;
  }

  .custom-assign-button {
    background-color: rgba(0, 133, 164, 0.66);
    color: white;
    border-color: rgba(0, 133, 164, 0.88);
  }

  .custom-assign-button:hover {
    background-color: rgba(0, 111, 134, 0.33); /* Slightly darker shade for hover */
    border-color: rgba(0, 111, 134, 0.33);
  }
</style>
