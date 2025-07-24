<template>
  <div>
    <!-- ─────── Toolbar ─────── -->
    <div class="toolbar">
      <div class="toolbar__left">
        <h2>
          {{ t('userManagement.title') }}
        </h2>

        <el-input
            v-model="searchQuery"
            :placeholder="t('userManagement.searchPlaceholder')"
            clearable
            @input="filterTable"
            class="toolbar__search"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
      <div class="toolbar__right">
        <el-tooltip
            :content="t('userManagement.refreshTooltip')"
            placement="top"
        >
          <el-button
              circle
              class="refresh"
              @click="fetchUsersList"
          >
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </el-tooltip>

        <el-button type="primary" @click="openAdd">
          {{ t('userManagement.addButton') }}
        </el-button>
      </div>
    </div>

    <!-- ─────── Table ─────── -->
    <el-table
        v-loading="loading"
        :data="pagedUsers"
        :height="tableHeight"
        @sort-change="onSort"
        :empty-text="t('common.noDataAvailable')"
    >
      <el-table-column
          prop="id"
          width="100"
          :label="t('userManagement.table.id')"
          sortable="custom"
      />

      <el-table-column
          width="180"
          prop="name"
          :label="t('userManagement.table.name')"
          sortable="custom"
      >
        <template #default="{ row }">
          <el-popover
              trigger="hover"
              placement="top">
            <template #default>
              <p>{{ t('userManagement.table.name') }}: {{ row.name }}</p>
              <p>{{ t('userManagement.table.wecomId') }}: {{ row.wecom_id }}</p>
            </template>

            <template #reference><el-tag>{{ row.name }}</el-tag></template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column
          prop="username"
          width="180"
          :label="t('userManagement.table.username')"
          sortable="custom"
      />

      <el-table-column
          prop="teams"
          width="280"
          :label="t('userManagement.table.teams')"
      >
        <template #default="{ row }">
          <el-tag
              v-for="team in row.teams"
              :key="team.id"
              size="small"
              round
          >
            {{ team.team_name }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
          prop="wecom_id"
          width="180"
          :label="t('userManagement.table.wecomId')"
          sortable="custom"
      />

      <el-table-column
          prop="role.name"
          width="150"
          :label="t('userManagement.table.role')"
          sortable="custom"
      >
        <template #default="{ row }">
          <el-tag
              :type="row.role.el_tag_type || 'info'"
          >
            {{ row.role.name }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
          prop="status"
          width="140"
          :label="t('userManagement.table.status')"
          sortable="custom"
      >
        <template #header>
          <span>
            {{ t('userManagement.table.status') }}
            <el-tooltip
                :content="t('userManagement.table.statusTooltip')"
                placement="top"
            >
              <el-icon><QuestionFilled /></el-icon>
            </el-tooltip>
          </span>
        </template>
        <template #default="{ row }">
          <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusSwitch(row)"
          />
        </template>
      </el-table-column>

      <el-table-column
          prop="email"
          width="220"
          :label="t('userManagement.table.email')"
          sortable="custom"
      />
      <el-table-column
          prop="phone_number"
          width="180"
          :label="t('userManagement.table.phoneNumber')"
          sortable="custom"
      />

      <el-table-column
          fixed="right"
          width="180"
          :label="t('userManagement.table.actions')"
          align="right"
      >
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">
            {{ t('userManagement.edit') }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteUser(row)">
            {{ t('userManagement.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ─────── Pagination ─────── -->
    <el-pagination
        v-if="filteredUsers.length > 15"
        class="mt-2"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[15, 30, 45, 60]"
        layout="total, sizes, prev, pager, next"
        :total="filteredUsers.length"
        :hide-on-single-page="true"
    />

    <!-- ─────── Form Dialog (Add / Edit) ─────── -->
    <el-dialog
        v-model="dialog.visible"
        :title="dialog.isEdit ? t('userManagement.editDialog.title') : t('userManagement.addDialog.title')"
        width="50%"
        @closed="resetForm"
    >
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="140px"
      >
        <!-- name -->
        <el-form-item
            prop="name"
            :label="t('userManagement.table.name')"
        >
          <el-input v-model="form.name"/>
        </el-form-item>

        <!-- role -->
        <el-form-item prop="role" :label="t('userManagement.table.role')">
          <el-select
              v-model="form.role"
              :placeholder="t('userManagement.role.selectRolePlaceHolder')"
          >
            <el-option
                v-for="r in roles"
                :key="r.id"
                :value="r.id"
                :label="r.name"
            >
              <el-tag :type="r.el_tag_type">
                {{ r.name }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- ids / contact -->
        <el-form-item
            prop="wecomId"
            :label="t('userManagement.addDialog.wecomId')"
        >
          <el-input v-model="form.wecomId"/>
        </el-form-item>

        <el-form-item
            prop="email"
            :label="t('userManagement.addDialog.email')"
        >
          <el-input v-model="form.email"/>
        </el-form-item>

        <el-form-item
            prop="phone_number"
            :label="t('userManagement.addDialog.phoneNumber')"
        >
          <el-input v-model="form.phone_number"/>
        </el-form-item>

        <!-- team assignment selector  -->
        <el-form-item
            :label="t('userManagement.addDialog.assignedTeams')"
            prop="teamAssignment"
        >
          <team-assignment-selector
              :team-tree="teams"
              :parent-map="parentMap"
              v-model:assignment="form.teamAssignment"
              :role="form.role"
          />
        </el-form-item>

        <!-- status -->
        <el-form-item
            prop="status" :label="t('userManagement.addDialog.status')">
          <el-select v-model="form.status">
            <el-option :label="t('userManagement.status.active')"  :value="1" />
            <el-option :label="t('userManagement.status.inactive')" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item
            prop="username"
            :label="t('userManagement.addDialog.username')"
        >
          <el-input v-model="form.username"/>
        </el-form-item>

        <!-- password (only when creating or changePw checked) -->
        <template v-if="!dialog.isEdit">
          <el-form-item
              prop="password"
              :label="t('userManagement.addDialog.password')"
          >
            <el-input v-model="form.password" type="password" show-password />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item>
            <el-checkbox v-model="changePw">
              {{ t('userManagement.editDialog.changePassword') }}
            </el-checkbox>
          </el-form-item>

          <el-form-item
              v-if="changePw"
              prop="password"
              :label="t('userManagement.editDialog.newPassword')"
          >
            <el-input v-model="form.password" type="password" show-password />
          </el-form-item>

          <el-form-item
              v-if="changePw"
              prop="confirmPw"
              :label="t('userManagement.editDialog.confirmPassword')"
          >
            <el-input v-model="confirmPw" type="password" show-password />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dialog.visible = false">
          {{ t('userManagement.cancel') }}
        </el-button>

        <el-button type="primary" @click="submitUserForm">
          {{ t('userManagement.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Search, QuestionFilled, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TeamAssignmentSelector from '@/components/user/TeamAssignmentSelector.vue'
import {translate, translate as t, translateWithParams as tp} from '@/utils/i18n'
import { fetchUsers, addUser, updateUser, deleteUser } from '@/services/userService'
import { fetchRoles } from '@/services/roleService'
import { getAllTeamTree, getTeamByTeamLeadId } from '@/services/teamService'
import { assignUserToTeams, removeUserFromAllTeams } from '@/services/teamUserService'

/* ───────────────── state ───────────────── */
const loading = ref(false);
const users = ref([]);
const roles = ref([]);
const teams = ref([]);
const parentMap = reactive({});
const store = useStore();

const searchQuery = ref('');
const sortBy  = reactive({ prop:'', order:'' });
const page = ref(1);
const pageSize = ref(15);

/* single dialog control */
const dialog = reactive({ visible:false, isEdit:false });
const form = reactive(defaultForm());
const formRef = ref();
const changePw = ref(false);
const confirmPw = ref('');

/* computed */
const filteredUsers = computed(() => {
  const searchInput = searchQuery.value.trim().toLowerCase();

  if (!searchInput) {
    return users.value
  }

  return users.value.filter(u => {
    const basicMatch = [u.id, u.name, u.username, u.wecom_id, u.email, u.phone_number]
        .some(val => val && String(val).toLowerCase().includes(searchInput));

    const teamMatch = Array.isArray(u.teams) && u.teams.some(t => t.team_name?.toLowerCase().includes(searchInput));

    return basicMatch || teamMatch;
  });
})

const sortedUsers = computed(() => {
  if (!sortBy.prop) {
    return filteredUsers.value
  }

  return [...filteredUsers.value].sort((a, b) => {
    const v1 = getVal(a, sortBy.prop)
    const v2 = getVal(b, sortBy.prop)
    if (sortBy.order === 'ascending') {
      return v1 > v2 ? 1 : v1 < v2 ? -1 : 0
    }
    if (sortBy.order === 'descending') {
      return v1 < v2 ? 1 : v1 > v2 ? -1 : 0
    }

    return 0;
  });
});

const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return sortedUsers.value.slice(start, start + pageSize.value);
})

function onSort({prop, order}) {
  sortBy.prop = prop;
  sortBy.order = order;
  page.value = 1;
}

const tableHeight = ref(600);

/* ───────────────── lifecycle ───────────────── */
onMounted(()=>{
  window.addEventListener('resize', () => tableHeight.value = window.innerHeight - 180);
  tableHeight.value = window.innerHeight - 180;
  fetchData();
});

async function fetchData(){
  loading.value = true;
  await Promise.all([fetchUsersList(), fetchRolesList(), fetchTeams()]);
  loading.value = false;
}

/* ───────────────── api calls ───────────────── */
async function fetchUsersList(){
  const { data } = await fetchUsers();
  if (data.status === '200') {
    users.value = data.data;
  }
}

async function fetchRolesList(){
  const { data } = await fetchRoles();
  if (data.status === '200') {
    roles.value = data.data
  }
}

async function fetchTeams(){
  const { data } = await getAllTeamTree()
  if (data.status!=='200') {
    return
  }

  teams.value = toTreeOptions(data.data);
  buildParentMap(teams.value);
}

/* ───────────────── toolbar handlers ───────────────── */
function filterTable(){ page.value = 1 }

function openAdd(){
  dialog.isEdit = false;
  dialog.visible = true;
  Object.assign(form, defaultForm());
}

async function openEdit(row){
  dialog.isEdit = true;
  dialog.visible = true;
  Object.assign(form, defaultForm(), mapUserToForm(row));
  changePw.value = false;
  confirmPw.value = '';
  // leader team fetch
  const res = await getTeamByTeamLeadId(row.id);

  if (res.data.status === '200') {
    form.teamAssignment.leadership = [res.data.data.id]
  }
}

/* ───────────────── CRUD ───────────────── */
function submitUserForm(){
  formRef.value.validate(async valid => {
    if (!valid) {
      return
    }

    try{
      dialog.isEdit ? await updateExisting() : await createNew()
      dialog.visible = false;
      await fetchUsersList();
      ElMessage.success(t(dialog.isEdit ? 'userManagement.messages.userUpdatedSuccess' : 'userManagement.messages.userAddedSuccess'))
    }catch(e){
      console.error(e)
      ElMessage.error(t('common.error'))
    }
  })
}

async function createNew(){
  const encryptedPw = btoa(form.password);
  const payload = buildPayload(encryptedPw);
  const { data } = await addUser(payload);
  if (form.teamAssignment.membership.length) {
    await assignUserToTeams(data.data.id, form.teamAssignment.membership);
  }
}

async function updateExisting(){
  const payload = buildPayload(changePw.value ? btoa(form.password) : undefined);
  await updateUser(form.id, payload);
  await removeUserFromAllTeams(form.id);
  if (form.teamAssignment.membership.length)
    await assignUserToTeams(form.id, form.teamAssignment.membership)
}

function handleDeleteUser(row){
  ElMessageBox.confirm(tp('userManagement.messages.deletionConfirmation',{name:row.name}), t('userManagement.messages.deletionTitle'),{type:'warning'})
      .then(async() => {
        await deleteUser(row.id);
        await fetchUsersList();
        ElMessage.success(t('userManagement.messages.userDeletedSuccess'));
      })
}

async function handleStatusSwitch(row){
  const currentUserId = store.getters.getUser.id;

  // is deactivating self?
  if (row.id === currentUserId && row.status === 0) {
    try {
      // confirmation prompt
     await ElMessageBox.confirm(
         t('userManagement.messages.selfDeactivationWarning'),
         t('userManagement.messages.selfDeactivationWarning'),
         {
           confirmButtonText: t('userManagement.confirm'),
           cancelButtonText: t('userManagement.delete'),
           type: "warning",
         }
     ).then(async () => {
       // proceed with deactivation by updating user
       const res = updateUserStatus(row.id, row.status);

       if (res === '200'){
         ElMessage.success(t('userManagement.messages.selfDeactivationSuccess'));
       }

     }).catch(() => {
       ElMessage.info(t('userManagement.operationCancelled'));
     })
    } catch (error) {
      console.error("注销用户有误:", error);
      ElMessage.error(t('userManagement.messages.deactivationFailed'));
    }
  } else {
    // Regular status change logic for other users
    try {
      const res = updateUserStatus(row.id, row.status);
    } catch (error) {
      console.error("激活状态更新有误", error);
      ElMessage.error(t('userManagement.messages.statusUpdatedFailed'));
    }
  }

  await fetchUsersList();
}

async function updateUserStatus(userId, statusData) {
  const response = await updateUser(userId, {status: statusData});

  if (response.data.status === '200'){
    ElMessage.success(t('userManagement.messages.statusUpdatedSuccess'));
  }

  return response?.data?.status;
}

/* ───────────────── helpers ───────────────── */
function defaultForm() {
  return {
    id: null,
    name: '',
    role: '',
    wecomId: '',
    username: '',
    email: '',
    phone_number: '',
    status: 1,
    password: '',
    teamAssignment: {
      membership: [],
      leadership: [],
    }
  }
}

function mapUserToForm(u) {
  return {
    id: u.id,
    name: u.name,
    role: u.role.id,
    wecomId: u.wecom_id,
    username: u.username,
    email: u.email,
    phone_number: u.phone_number,
    status: u.status,
    teamAssignment: {
      membership: u.teams?.map(t=>t.id)||[],
      leadership: []
    }
  }
}

function buildPayload(pw) {
  const p = {
        name:form.name,
        role:{id:form.role},
        wecom_id:form.wecomId,
        username:form.username,
        email:form.email,
        phone_number:form.phone_number,
        status:form.status
      };

  if (pw) {
    p.password = pw;
  }

  return p;
}

function resetForm() {
  formRef.value?.resetFields();
  Object.assign(form, defaultForm());
}

function toTreeOptions(list){
  return list.map(n=>({ ...n, value:n.id, label:n.name, children:n.children?toTreeOptions(n.children):[] }))
}

function buildParentMap(nodes,pid=null){
  nodes.forEach(n=>{ parentMap[n.id]=pid; if(n.children) buildParentMap(n.children,n.id) })
}

function getVal(obj, path){ return path.split('.').reduce((o,k)=>o?.[k], obj) }

/* ───────────────── rules ───────────────── */
const rules = {
  name:[{required:true,message:t('userManagement.validation.nameRequired'),trigger:'blur'}],
  role:[{required:true,message:t('userManagement.validation.roleRequired'),trigger:'change'}],
  wecomId:[{required:true,message:t('userManagement.validation.wecomIdRequired'),trigger:'blur'}],
  username:[{ required:true, message:t('userManagement.validation.usernameRequired'), trigger:'blur' }],
  password:[{ required:()=>!dialog.isEdit||changePw.value, message:t('userManagement.validation.passwordRequired'), trigger:'blur' }],
  status: [{ required: true, message: t('userManagement.validation.statusRequired'), trigger: 'change' }],
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
}
</script>

<style scoped>
.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.toolbar__left{display:flex;align-items:center}
.toolbar__search{width:300px;margin-left:20px}
.toolbar__right{display:flex;gap:10px}
.refresh{background:#80cfff;border-color:#80cfff}
.refresh:hover{background:#66b5ff;border-color:#66b5ff;transform:rotate(360deg);transition:.3s}
.mt-2{margin-top:10px}
</style>
