<!--<template>-->
<!--  <div :class="['sidebar', { 'collapsed': isCollapsed }]">-->
<!--    <el-menu-->
<!--        :default-active="activeMenu"-->
<!--        class="el-menu-vertical-demo"-->
<!--        background-color="#466a9f"-->
<!--        text-color="#fff"-->
<!--        active-text-color="#ffd04b"-->
<!--        router-->
<!--        :collapse="isCollapsed"-->
<!--        @select="handleMenuSelect"-->
<!--    >-->
<!--      &lt;!&ndash; FPS Logo Section &ndash;&gt;-->
<!--      <div-->
<!--          :style="{-->
<!--              display: 'flex',-->
<!--              justifyContent: 'center',-->
<!--              alignItems: 'center',-->
<!--              height: '90px', // 保证上下留白-->
<!--              width: isCollapsed ? '64px' : '240px',-->
<!--              backgroundColor: 'transparent',-->
<!--              transition: 'width 0.2s ease'-->
<!--            }"-->
<!--      >-->
<!--        <div style="width: 100%; text-align: center">-->
<!--          <img-->
<!--              v-if="!isCollapsed"-->
<!--              src="@/assets/fps_logo_medium_white.png"-->
<!--              alt="FPS Logo"-->
<!--              style="height: 200px; padding-top: 30px; max-width: 100%; object-fit: contain"-->
<!--          />-->
<!--          <img-->
<!--              v-else-->
<!--              src="@/assets/fps-logo.png"-->
<!--              alt="FPS Logo (Collapsed)"-->
<!--              style="height: 40px; max-width: 100%; object-fit: contain"-->
<!--          />-->
<!--        </div>-->
<!--      </div>-->
<!--      <el-scrollbar>-->
<!--        <div class="menu-container">-->
<!--          &lt;!&ndash; 顶部菜单栏，添加可折叠按钮 &ndash;&gt;-->
<!--          <el-menu-item index="portal:/e2e-overview">-->
<!--            <el-icon><HomeFilled /></el-icon>-->
<!--            <template v-if="!isCollapsed" #title>Overview</template>-->

<!--            <el-tooltip-->
<!--                :content="translate('navigationMenu.collapse')"-->
<!--                placement="right"-->
<!--                :hide-after="0"-->
<!--            >-->
<!--              <el-icon v-if="!isCollapsed" class="collapse-icon" @click="toggleCollapse($event)">-->
<!--                <DArrowLeft />-->
<!--              </el-icon>-->
<!--            </el-tooltip>-->
<!--          </el-menu-item>-->

<!--          <el-sub-menu index="production">-->
<!--            <template #title>-->
<!--              <el-icon><Setting /></el-icon>-->
<!--              <span v-if="!isCollapsed">Production</span>-->
<!--            </template>-->

<!--            <el-menu-item index="portal:/production/view">-->
<!--              <el-icon><DataAnalysis /></el-icon>-->
<!--              <span>Overview</span>-->
<!--            </el-menu-item>-->
<!--          </el-sub-menu>-->

<!--          <el-sub-menu index="qc">-->
<!--            <template #title>-->
<!--              <el-icon><Collection /></el-icon>-->
<!--              <span v-if="!isCollapsed">Quality Control</span>-->
<!--            </template>-->

<!--            &lt;!&ndash; Existing Admin menus (same logic as before) &ndash;&gt;-->
<!--            <template v-if="[1, 4].includes(user.role.id)">-->
<!--              <el-sub-menu index="qc-quality">-->
<!--                <template #title>-->
<!--                  <el-icon><List /></el-icon>-->
<!--                  <span>{{ translate('navigationMenu.qualityManagement') }}</span>-->
<!--                </template>-->
<!--                <el-menu-item index="/quality-form-management">-->
<!--                  <el-icon><Document /></el-icon>-->
<!--                  <span>{{ translate('navigationMenu.formManagement') }}</span>-->
<!--                </el-menu-item>-->
<!--                <el-menu-item index="/form-designer">-->
<!--                  <el-icon><Edit /></el-icon>-->
<!--                  <span>{{ translate('navigationMenu.formDesigner') }}</span>-->
<!--                </el-menu-item>-->
<!--              </el-sub-menu>-->

<!--              <el-sub-menu index="qc-summary">-->
<!--                <template #title>-->
<!--                  <el-icon><DataAnalysis /></el-icon>-->
<!--                  <span>{{ translate('navigationMenu.dataSummary') }}</span>-->
<!--                </template>-->
<!--                <el-menu-item index="/form-data-summary">-->
<!--                  <el-icon><Document /></el-icon>-->
<!--                  <span>{{ translate('navigationMenu.formAnalysis') }}</span>-->
<!--                </el-menu-item>-->
<!--                <el-menu-item index="/alarm-records">-->
<!--                  <el-icon><WarningFilled /></el-icon>-->
<!--                  <span>{{ translate('navigationMenu.alarmRecords') }}</span>-->
<!--                </el-menu-item>-->
<!--                <el-menu-item index="/qc-summary">-->
<!--                  <el-icon><Document /></el-icon>-->
<!--                  <span>{{ translate('navigationMenu.QcSummary') }}</span>-->
<!--                </el-menu-item>-->
<!--              </el-sub-menu>-->
<!--            </template>-->

<!--            &lt;!&ndash; Existing Task Center menu (everyone sees it) &ndash;&gt;-->
<!--            <el-sub-menu index="qc-task-center">-->
<!--              <template #title>-->
<!--                <el-icon><Collection /></el-icon>-->
<!--                <span>{{ translate('navigationMenu.taskCenter') }}</span>-->
<!--              </template>-->
<!--              <el-menu-item index="/pending-tasks">-->
<!--                <el-icon><Document /></el-icon>-->
<!--                <span>{{ translate('navigationMenu.pendingTasks') }}</span>-->
<!--              </el-menu-item>-->
<!--              <el-menu-item index="/approval-info">-->
<!--                <el-icon><Edit /></el-icon>-->
<!--                <span>{{ translate('navigationMenu.approvalCenter')}}</span>-->
<!--              </el-menu-item>-->
<!--            </el-sub-menu>-->
<!--          </el-sub-menu>-->

<!--          &lt;!&ndash; ✅ Maintenance tab (cross-app links) &ndash;&gt;-->
<!--          <el-sub-menu index="maintenance">-->
<!--            <template #title>-->
<!--              <el-icon><Setting /></el-icon>-->
<!--              <span v-if="!isCollapsed">Maintenance</span>-->
<!--            </template>-->

<!--            &lt;!&ndash; Dashboard &ndash;&gt;-->
<!--            <el-menu-item index="portal:/maintenance/dashboard">-->
<!--              <el-icon><DataAnalysis /></el-icon>-->
<!--              <span>Dashboard</span>-->
<!--            </el-menu-item>-->

<!--            &lt;!&ndash; Equipment &ndash;&gt;-->
<!--            <el-menu-item index="portal:/maintenance/equipment/list">-->
<!--              <el-icon><TakeawayBox /></el-icon>-->
<!--              <span>Equipment</span>-->
<!--            </el-menu-item>-->

<!--            &lt;!&ndash; Work Orders &ndash;&gt;-->
<!--            <el-menu-item index="portal:/maintenance/work-orders/table">-->
<!--              <el-icon><Document /></el-icon>-->
<!--              <span>Work Orders</span>-->
<!--            </el-menu-item>-->

<!--            &lt;!&ndash; Task Library (3 sub buttons) &ndash;&gt;-->
<!--            <el-sub-menu index="maintenance-task-library">-->
<!--              <template #title>-->
<!--                <el-icon><List /></el-icon>-->
<!--                <span>Task Library</span>-->
<!--              </template>-->
<!--              <el-menu-item index="portal:/maintenance/task-library/tasks">-->
<!--                <span>Tasks</span>-->
<!--              </el-menu-item>-->
<!--              <el-menu-item index="portal:/maintenance/task-library/standards">-->
<!--                <span>Standards</span>-->
<!--              </el-menu-item>-->
<!--              <el-menu-item index="portal:/maintenance/task-library/designer">-->
<!--                <span>Designer</span>-->
<!--              </el-menu-item>-->
<!--            </el-sub-menu>-->

<!--            <el-menu-item index="portal:/maintenance/requests/list">-->
<!--              <el-icon><Document /></el-icon>-->
<!--              <span>Requests</span>-->
<!--            </el-menu-item>-->

<!--            <el-sub-menu index="maintenance-resources">-->
<!--              <template #title>-->
<!--                <el-icon><Files /></el-icon>-->
<!--                <span>Resources</span>-->
<!--              </template>-->
<!--              <el-menu-item index="portal:/maintenance/resources/parts">-->
<!--                <span>Parts</span>-->
<!--              </el-menu-item>-->
<!--              <el-menu-item index="portal:/maintenance/resources/tools">-->
<!--                <span>Resources</span>-->
<!--              </el-menu-item>-->
<!--            </el-sub-menu>-->

<!--            <el-menu-item index="portal:/maintenance/vendors-locations">-->
<!--              <el-icon><Document /></el-icon>-->
<!--              <span>Vendors & Locations</span>-->
<!--            </el-menu-item>-->

<!--            <el-menu-item index="portal:/maintenance/hubspot">-->
<!--              <el-icon><Document /></el-icon>-->
<!--              <span>Hubspot</span>-->
<!--            </el-menu-item>-->
<!--          </el-sub-menu>-->

<!--          <el-sub-menu index="administration">-->
<!--            <template #title>-->
<!--              <el-icon><User /></el-icon>-->
<!--              <span v-if="!isCollapsed">Administration</span>-->
<!--            </template>-->

<!--            &lt;!&ndash; User Management &ndash;&gt;-->
<!--            <el-menu-item index="portal:/administration/user-management">-->
<!--              <el-icon><User /></el-icon>-->
<!--              <span>User</span>-->
<!--            </el-menu-item>-->

<!--            &lt;!&ndash; Work Group Management &ndash;&gt;-->
<!--            <el-menu-item index="portal:/administration/work-group-management">-->
<!--              <el-icon><User /></el-icon>-->
<!--              <span>Work Group</span>-->
<!--            </el-menu-item>-->

<!--            &lt;!&ndash; Shift Management &ndash;&gt;-->
<!--            <el-menu-item index="portal:/administration/shift-management">-->
<!--              <el-icon><User /></el-icon>-->
<!--              <span>Shift</span>-->
<!--            </el-menu-item>-->

<!--            &lt;!&ndash; Role Management &ndash;&gt;-->
<!--            <el-menu-item index="portal:/administration/role-management">-->
<!--              <el-icon><User /></el-icon>-->
<!--              <span>Role</span>-->
<!--            </el-menu-item>-->

<!--            &lt;!&ndash; Approval Management &ndash;&gt;-->
<!--            <el-menu-item index="portal:/administration/approval-management">-->
<!--              <el-icon><User /></el-icon>-->
<!--              <span>Approval</span>-->
<!--            </el-menu-item>-->
<!--          </el-sub-menu>-->

<!--&lt;!&ndash;          &lt;!&ndash; 仅管理员可见的菜单 &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;          <template v-if="[1, 4].includes(user.role.id)">&ndash;&gt;-->
<!--&lt;!&ndash;            <el-sub-menu index="2">&ndash;&gt;-->
<!--&lt;!&ndash;              <template #title>&ndash;&gt;-->
<!--&lt;!&ndash;                <el-icon><List /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                <span v-if="!isCollapsed">{{ translate('navigationMenu.qualityManagement') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </template>&ndash;&gt;-->
<!--&lt;!&ndash;              <el-menu-item index="/quality-form-management">&ndash;&gt;-->
<!--&lt;!&ndash;                <el-icon><Document /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                <span >{{ translate('navigationMenu.formManagement') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;              <el-menu-item index="/form-designer">&ndash;&gt;-->
<!--&lt;!&ndash;                <el-icon><Edit /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                <span>{{ translate('navigationMenu.formDesigner') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-menu-item index="/form-access-calendar">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <el-icon><Calendar /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <span>{{ translate('navigationMenu.formAccessCalendar') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-menu-item index="/task-assignment">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <el-icon><Files /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <span>{{ translate('navigationMenu.dispatchManagement') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-menu-item index="/instrument-management">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <el-icon><TakeawayBox /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <span>{{ translate('navigationMenu.instrumentManagement') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-menu-item index="/test-subject-management">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <el-icon><Collection /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <span>{{ translate('navigationMenu.testSubjectManagement') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-menu-item index="/sampling-location-management">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <el-icon><Location /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;                <span>{{ translate('navigationMenu.samplingLocationManagement') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;            </el-sub-menu>&ndash;&gt;-->

<!--&lt;!&ndash;            <el-sub-menu index="3">&ndash;&gt;-->
<!--&lt;!&ndash;              <template #title>&ndash;&gt;-->
<!--&lt;!&ndash;                <el-icon><DataAnalysis /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                <span v-if="!isCollapsed">{{ translate('navigationMenu.dataSummary') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </template>&ndash;&gt;-->
<!--&lt;!&ndash;              <el-menu-item index="/form-data-summary">&ndash;&gt;-->
<!--&lt;!&ndash;                <el-icon><Document /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                <span>{{ translate('navigationMenu.formAnalysis') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;              <el-menu-item index="/alarm-records">&ndash;&gt;-->
<!--&lt;!&ndash;                <el-icon><WarningFilled /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                <span>{{ translate('navigationMenu.alarmRecords') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;              <el-menu-item index="/qc-summary">&ndash;&gt;-->
<!--&lt;!&ndash;                <el-icon><Document /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;                <span>{{ translate('navigationMenu.QcSummary') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;              </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;            </el-sub-menu>&ndash;&gt;-->
<!--&lt;!&ndash;          </template>&ndash;&gt;-->

<!--&lt;!&ndash;          &lt;!&ndash; 任务中心 (所有角色可见) &ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;          <el-sub-menu index="4">&ndash;&gt;-->
<!--&lt;!&ndash;            <template #title>&ndash;&gt;-->
<!--&lt;!&ndash;              <el-icon><Collection /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;              <span v-if="!isCollapsed">{{ translate('navigationMenu.taskCenter') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;            </template>&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            <el-menu-item index="/task-center-dashboard">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-icon><DataAnalysis /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <span>{{ translate('navigationMenu.taskDashboard') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;            <el-menu-item index="/pending-tasks">&ndash;&gt;-->
<!--&lt;!&ndash;              <el-icon><Document /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;              <span>{{ translate('navigationMenu.pendingTasks') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;            </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;            <el-menu-item index="/approval-info">&ndash;&gt;-->
<!--&lt;!&ndash;              <el-icon><Edit /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;              <span>{{ translate('navigationMenu.approvalCenter')}}</span>&ndash;&gt;-->
<!--&lt;!&ndash;            </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            <el-menu-item index="/current-tasks">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-icon><Document /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <span>{{ translate('navigationMenu.todayTasks') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            <el-menu-item index="/future-tasks">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-icon><List /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <span>{{ translate('navigationMenu.futureTasks') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            <el-menu-item index="/history-tasks">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-icon><Files /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <span>{{ translate('navigationMenu.historyTasks') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            <el-menu-item index="/overdue-tasks">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <el-icon><Warning /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;              <span>{{ translate('navigationMenu.overdueTasks') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;&lt;!&ndash;            </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;    &lt;!&ndash;        <el-menu-item index="/task-calendar">&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;    &lt;!&ndash;          <el-icon><Calendar /></el-icon>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;    &lt;!&ndash;          <span>{{ translate('navigationMenu.taskCalendar') }}</span>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;    &lt;!&ndash;        </el-menu-item>&ndash;&gt;&ndash;&gt;-->
<!--&lt;!&ndash;          </el-sub-menu>&ndash;&gt;-->

<!--&lt;!&ndash;          <el-sub-menu index="5">&ndash;&gt;-->
<!--&lt;!&ndash;            <template #title>&ndash;&gt;-->
<!--&lt;!&ndash;              <el-icon><User /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;              <span v-if="!isCollapsed">{{ translate('navigationMenu.systemManagement') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;            </template>&ndash;&gt;-->
<!--&lt;!&ndash;            <el-menu-item index="/user-management">&ndash;&gt;-->
<!--&lt;!&ndash;              <el-icon><User /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;              <span>{{ translate('navigationMenu.userManagement') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;            </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;            <el-menu-item index="/team-management">&ndash;&gt;-->
<!--&lt;!&ndash;              <el-icon><User /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;              <span>{{ translate('navigationMenu.teamManagement') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;            </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;            <el-menu-item index="/shift-management">&ndash;&gt;-->
<!--&lt;!&ndash;              <el-icon><User /></el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;              <span>{{ translate('navigationMenu.shiftManagement') }}</span>&ndash;&gt;-->
<!--&lt;!&ndash;            </el-menu-item>&ndash;&gt;-->
<!--&lt;!&ndash;          </el-sub-menu>&ndash;&gt;-->
<!--        </div>-->
<!--      </el-scrollbar>-->

<!--      &lt;!&ndash; 用户信息显示在 Navbar 底部 &ndash;&gt;-->
<!--      <div v-if="!isCollapsed" class="user-info">-->
<!--        <el-divider />-->
<!--        <div class="user-details">-->
<!--&lt;!&ndash;          <el-tooltip content="Edit User" placement="top">&ndash;&gt;-->
<!--&lt;!&ndash;            <el-icon class="edit-icon-wrapper" @click="openEditDialog" :size="20">&ndash;&gt;-->
<!--&lt;!&ndash;              <Edit />&ndash;&gt;-->
<!--&lt;!&ndash;            </el-icon>&ndash;&gt;-->
<!--&lt;!&ndash;          </el-tooltip>&ndash;&gt;-->
<!--          <el-icon size="20px"><User /></el-icon>-->
<!--          <span class="username">{{ user.name }}</span>-->
<!--        </div>-->
<!--        <div class="user-role">{{ roleName }}</div>-->

<!--        &lt;!&ndash; Logout Button with Tooltip and Hover Effect &ndash;&gt;-->
<!--        <el-tooltip :content="translate('navigationMenu.logout')" placement="top">-->
<!--          <el-icon class="logout-icon" @click="handleLogout">-->
<!--            <SwitchButton />-->
<!--          </el-icon>-->
<!--        </el-tooltip>-->
<!--      </div>-->

<!--    </el-menu>-->

<!--    <el-tooltip-->
<!--      :content="translate('navigationMenu.expand')"-->
<!--      placement="right"-->
<!--      :hide-after="0"-->
<!--      :disabled="!showExpandButton"-->
<!--    >-->
<!--      <el-button-->
<!--          class="expand-button"-->
<!--          v-if="showExpandButton"-->
<!--          @click="toggleCollapse"-->
<!--      >-->
<!--        <el-icon><DArrowRight /></el-icon>-->
<!--      </el-button>-->
<!--    </el-tooltip>-->

<!--  </div>-->

<!--  &lt;!&ndash; 编辑用户信息弹窗 &ndash;&gt;-->
<!--  <el-dialog :title="translate('userManagement.editDialog.title')" v-model="editDialogVisible" width="50%">-->
<!--    <div class="popup-container">-->
<!--      <el-form ref="editUserForm" :model="editUser" :rules="rules" label-width="140px">-->
<!--        <el-form-item :label="translate('userManagement.editDialog.name')" prop="name">-->
<!--          <el-input v-model="editUser.name" />-->
<!--        </el-form-item>-->

<!--        <el-form-item v-if = "[1, 4].includes(user.role.id)" :label="translate('userManagement.editDialog.role')" prop="role">-->
<!--          <el-select v-model="editUser.role.id">-->
<!--            <el-option :label="translate('userManagement.role.admin')" :value="translate('userManagement.role.admin')" />-->
<!--            <el-option :label="translate('userManagement.role.qcWorker')" :value="translate('userManagement.role.qcWorker')" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->

<!--        <el-form-item :label="translate('userManagement.editDialog.wecomId')" prop="wecomId">-->
<!--          <el-input v-model="editUser.wecomId" />-->
<!--        </el-form-item>-->

<!--        <el-form-item :label="translate('userManagement.editDialog.username')" prop="username">-->
<!--          <el-input v-model="editUser.username" />-->
<!--        </el-form-item>-->

<!--        <el-form-item :label="translate('userManagement.editDialog.email')" prop="email">-->
<!--          <el-input v-model="editUser.email" />-->
<!--        </el-form-item>-->

<!--        <el-form-item :label="translate('userManagement.editDialog.phoneNumber')" prop="phone_number">-->
<!--          <el-input v-model="editUser.phone_number" />-->
<!--        </el-form-item>-->

<!--        &lt;!&ndash; ✅ Hide Status Selection if the user is not 管理员 &ndash;&gt;-->
<!--        <el-form-item v-if="user.role.id !== 2" :label="translate('userManagement.editDialog.status')" prop="status">-->
<!--          <el-select v-model="editUser.status">-->
<!--            <el-option :label="translate('userManagement.status.active')" :value="1" />-->
<!--            <el-option :label="translate('userManagement.status.inactive')" :value="0" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->

<!--        <el-form-item>-->
<!--          <el-checkbox v-model="changePassword">{{ translate('userManagement.editDialog.changePassword') }}</el-checkbox>-->
<!--        </el-form-item>-->

<!--        <el-form-item v-if="changePassword" :label="translate('userManagement.editDialog.newPassword')" prop="newPassword">-->
<!--          <el-input v-model="newPassword" type="password" show-password />-->
<!--        </el-form-item>-->

<!--        <el-form-item v-if="changePassword" :label="translate('userManagement.editDialog.confirmPassword')" prop="confirmPassword">-->
<!--          <el-input v-model="confirmPassword" type="password" show-password />-->
<!--        </el-form-item>-->

<!--      </el-form>-->
<!--    </div>-->

<!--    <template #footer>-->
<!--      <div class="popup-container">-->
<!--        <el-button @click="editDialogVisible = false">{{ translate('userManagement.editDialog.cancelButton') }}</el-button>-->
<!--        <el-button type="primary" @click="handleEditConfirm">{{ translate('userManagement.editDialog.confirmButton') }}</el-button>-->
<!--      </div>-->
<!--    </template>-->
<!--  </el-dialog>-->
<!--</template>-->

<!--<script>-->
<!--import {-->
<!--  HomeFilled,-->
<!--  Setting,-->
<!--  User,-->
<!--  List,-->
<!--  Document,-->
<!--  Edit,-->
<!--  Files,-->
<!--  DataAnalysis,-->
<!--  Collection,-->
<!--  SwitchButton,-->
<!--  Calendar, Warning, Location, TakeawayBox, DArrowLeft, DArrowRight, WarningFilled-->
<!--} from '@element-plus/icons-vue';-->
<!--import { mapGetters, mapActions } from 'vuex';-->
<!--import { translate } from "@/utils/i18n";-->
<!--// import { getUserById, updateUser } from '@/services/userService.js';-->
<!--import { gotoCognitoLogin } from "@/utils/cognito";-->
<!--import {goToPortal} from "@/utils/portalNavigation";-->

<!--export default {-->
<!--  components: {-->
<!--    WarningFilled,-->
<!--    DArrowRight,-->
<!--    DArrowLeft,-->
<!--    TakeawayBox,-->
<!--    Location,-->
<!--    Warning,-->
<!--    Calendar,-->
<!--    HomeFilled,-->
<!--    Setting,-->
<!--    User,-->
<!--    List,-->
<!--    Document,-->
<!--    Edit,-->
<!--    Files,-->
<!--    DataAnalysis,-->
<!--    Collection,-->
<!--    SwitchButton-->
<!--  },-->
<!--  computed: {-->
<!--    ...mapGetters(['getUser', 'getPrimaryRole']),-->
<!--    user() {-->
<!--      return this.getUser;-->
<!--    },-->
<!--    roleName() {-->
<!--      return this.getRoleName;-->
<!--    },-->
<!--    activeMenu() {-->
<!--      return this.$route.path; // highlight the current path-->
<!--    }-->
<!--  },-->
<!--  watch: {-->
<!--    isCollapsed(newVal) {-->
<!--      if (newVal) {-->
<!--        setTimeout(() => {-->
<!--          document.querySelectorAll('.el-sub-menu .el-sub-menu__icon-arrow').forEach(el => {-->
<!--            el.style.display = 'none';-->
<!--          });-->
<!--        }, 500);-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  methods: {-->
<!--    ...mapActions(['clearUserState']), // Map the logoutUser action from Vuex-->
<!--    toggleCollapse(event) {-->
<!--      event.stopPropagation();-->
<!--      this.isCollapsed = !this.isCollapsed;-->
<!--      if (this.isCollapsed) {-->
<!--        // 折叠时，1s 后才显示展开按钮-->
<!--        setTimeout(() => {-->
<!--          this.showExpandButton = true;-->
<!--        }, 500);-->
<!--      } else {-->
<!--        // 展开时立即隐藏展开按钮-->
<!--        this.showExpandButton = false;-->
<!--      }-->
<!--    },-->

<!--    autoCollapseIfNeeded(path) {-->
<!--      // if (this.autoCollapseRoutes.includes(path)) {-->
<!--      //   this.isCollapsed = true;-->
<!--      //   this.showExpandButton = true; // 可选：显示展开按钮-->
<!--      // }-->
<!--    },-->

<!--    // async handleEditConfirm() {-->
<!--    //   this.$refs.editUserForm.validate(async (valid) => {-->
<!--    //     if (valid) {-->
<!--    //       try {-->
<!--    //         const originalRole = this.user.role; // Store original role-->
<!--    //         const roleId = this.editUser.role === '管理员' ? 1 : 2;-->
<!--    //-->
<!--    //         // logic for status deactivation-->
<!--    //         if (this.editUser.status === 0) {-->
<!--    //           try {-->
<!--    //             await this.$confirm(-->
<!--    //                 "你已选择将账号设为未激活状态，登出后将无法再次登录，除非其他管理员重新激活你的账号。确认继续吗？",-->
<!--    //                 "确认未激活状态",-->
<!--    //                 {-->
<!--    //                   confirmButtonText: "确认",-->
<!--    //                   cancelButtonText: "取消",-->
<!--    //                   type: "warning",-->
<!--    //                 }-->
<!--    //             );-->
<!--    //           } catch {-->
<!--    //             this.$message.info("操作已取消");-->
<!--    //             return; // Stop the operation if canceled-->
<!--    //           }-->
<!--    //         }-->
<!--    //-->
<!--    //         const payload = {-->
<!--    //           name: this.editUser.name,-->
<!--    //           role_id: roleId,-->
<!--    //           wecom_id: this.editUser.wecomId,-->
<!--    //           username: this.editUser.username,-->
<!--    //           email: this.editUser.email,-->
<!--    //           phone_number: this.editUser.phone_number,-->
<!--    //           status: this.editUser.status,-->
<!--    //         };-->
<!--    //-->
<!--    //         if (this.changePassword) {-->
<!--    //           if (!this.newPassword || this.newPassword !== this.confirmPassword) {-->
<!--    //             this.$message.error('密码不一致!');-->
<!--    //             return;-->
<!--    //           }-->
<!--    //           payload.password = btoa(this.newPassword);-->
<!--    //         }-->
<!--    //-->
<!--    //         await updateUser(this.editUser.id, payload);-->
<!--    //         this.$message.success("用户更新成功！");-->
<!--    //-->
<!--    //         if (originalRole === 1 && roleId === 2) {-->
<!--    //           this.$confirm(-->
<!--    //               "你已经更改了权限，确认或关闭此窗口后都将自动登出。",-->
<!--    //               "权限更改确认",-->
<!--    //               {-->
<!--    //                 confirmButtonText: "确认",-->
<!--    //                 type: "warning",-->
<!--    //                 showCancelButton: false,      // 不显示取消按钮-->
<!--    //                 closeOnClickModal: false,     // 禁止点击遮罩层关闭窗口-->
<!--    //                 closeOnPressEscape: false,    // 禁止按ESC键关闭窗口-->
<!--    //               }-->
<!--    //           ).then(() => {-->
<!--    //             this.clearUserState();-->
<!--    //             this.$router.push("/LoginPage");-->
<!--    //           }).catch(() => {-->
<!--    //             this.clearUserState();-->
<!--    //             this.$router.push("/LoginPage");-->
<!--    //           });-->
<!--    //         } else {-->
<!--    //           // ✅ Update Vuex store user info-->
<!--    //           this.updateUserState({-->
<!--    //             name: this.editUser.name,-->
<!--    //             username: this.editUser.username,-->
<!--    //             role: this.editUser.role === '管理员' ? 1 : 2,-->
<!--    //             email: this.editUser.email,-->
<!--    //             phone_number: this.editUser.phone_number,-->
<!--    //             wecomId: this.editUser.wecomId,-->
<!--    //           });-->
<!--    //         }-->
<!--    //-->
<!--    //         // ✅ Reset password fields and close dialog-->
<!--    //         this.changePassword = false;-->
<!--    //         this.newPassword = '';-->
<!--    //         this.confirmPassword = '';-->
<!--    //         this.editDialogVisible = false;-->
<!--    //       } catch (error) {-->
<!--    //         console.error("Error updating user:", error);-->
<!--    //         this.$message.error("用户更新失败");-->
<!--    //       }-->
<!--    //     } else {-->
<!--    //       this.$message.error("请修复错误");-->
<!--    //     }-->
<!--    //   });-->
<!--    // },-->
<!--    handleLogout() {-->
<!--      this.$confirm(-->
<!--          translate("navigationMenu.logoutConfirmationMessage"),-->
<!--          translate("navigationMenu.logoutConfirmationTitle"),-->
<!--          {-->
<!--            confirmButtonText: translate("common.editDialog.confirmButton"),-->
<!--            cancelButtonText: translate("common.editDialog.cancelButton"),-->
<!--            type: "warning",-->
<!--          }-->
<!--      ).then(() => {-->
<!--        this.clearUserState(); // Clear user information from Vuex-->

<!--        console.log('NavigationMenuOld.vue logout clicked, navigating to cognito login')-->
<!--        gotoCognitoLogin()-->
<!--      }).catch(() => {-->
<!--        this.$message.info(translate("common.operationCancelled"));-->
<!--      });-->
<!--    },-->
<!--    translate(key) {-->
<!--      return translate(key);-->
<!--    },-->
<!--    handleMenuSelect(index) {-->
<!--      if (typeof index === 'string' && index.startsWith('portal:')) {-->
<!--        const hashPath = index.replace('portal:', '')-->

<!--        goToPortal(hashPath);-->
<!--        return-->
<!--      }-->

<!--      if (index && index !== this.$route.path) {-->
<!--        this.$router.push(index)-->
<!--      }-->
<!--    }-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      editDialogVisible: false,-->
<!--      showExpandButton: false,-->
<!--      editUser: {-->
<!--        id: null,-->
<!--        name: '',-->
<!--        role: '',-->
<!--        wecomId: '',-->
<!--        username: '',-->
<!--        email: '',-->
<!--        phone_number: '',-->
<!--        status: null,-->
<!--      },-->
<!--      isCollapsed: false,-->
<!--      hideArrow: false,-->
<!--      changePassword: false,-->
<!--      newPassword: '',-->
<!--      confirmPassword: '',-->
<!--      autoCollapseRoutes: ['/qc-summary'],-->
<!--      rules: {-->
<!--        name: [{ required: true, message: 'Name is required', trigger: 'blur' }],-->
<!--        role: [{ required: true, message: 'Role is required', trigger: 'change' }],-->
<!--        username: [{ required: true, message: 'Username is required', trigger: 'blur' }],-->
<!--        email: [{ required: true, message: 'Email is required', trigger: 'blur' }],-->
<!--      },-->
<!--    };-->
<!--  },-->
<!--  mounted() {-->
<!--    this.autoCollapseIfNeeded(this.$route.path);-->
<!--    this.$watch('$route', (to) => {-->
<!--      this.autoCollapseIfNeeded(to.path);-->
<!--    });-->
<!--  },-->

<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.el-menu-vertical-demo {-->
<!--  height: 100vh;-->
<!--  width: 240px;-->
<!--  display: flex;-->
<!--  transition: width 0.2s ease-in-out, opacity 0.2s ease-in-out;-->
<!--  flex-direction: column;-->
<!--  overflow: hidden;-->
<!--}-->

<!--.menu-container {-->
<!--  max-height: calc(100vh - 260px); /* 视口减去 logo + 用户栏高度 */-->
<!--  flex: 1;              /* Takes available space */-->
<!--  flex-direction: column;-->
<!--  align-items: flex-start;-->
<!--}-->

<!--.user-info {-->
<!--  color: #fff;-->
<!--  text-align: center;-->
<!--  padding: 10px;-->
<!--}-->

<!--.user-details {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  gap: 8px;-->
<!--  margin-bottom: 8px;-->
<!--}-->

<!--.username {-->
<!--  font-weight: bold;-->
<!--}-->

<!--.user-role {-->
<!--  font-size: 14px;-->
<!--  color: #ffd04b;-->
<!--}-->

<!--.logout-icon {-->
<!--  margin-top: 10px;-->
<!--  cursor: pointer;-->
<!--  font-size: 24px;-->
<!--  color: #fff;-->
<!--  transition: color 0.3s;-->
<!--}-->

<!--.logout-icon:hover {-->
<!--  color: #ff4d4f; /* Red color on hover */-->
<!--}-->

<!--.edit-icon-wrapper {-->
<!--  cursor: pointer;-->
<!--  transition: color 0.1s;-->
<!--}-->

<!--.edit-icon-wrapper:hover {-->
<!--  color: #ffd04b; /* or any preferred highlight color */-->
<!--}-->

<!--/* 调整 `el-menu` 折叠后的宽度 */-->
<!--.sidebar.collapsed .el-menu-vertical-demo {-->
<!--  width: 64px;-->
<!--}-->

<!--.sidebar.collapsed:hover .el-menu span {-->
<!--  display: inline;-->
<!--}-->

<!--/* 在侧边栏折叠状态下，隐藏所有子菜单的小箭头 */-->
<!--.sidebar.collapsed .el-sub-menu__icon-arrow {-->
<!--  display: none !important;-->
<!--}-->

<!--/* 调整折叠图标的位置 */-->
<!--.collapse-icon {-->
<!--  position: absolute;-->
<!--  right: 10px;-->
<!--  top: 50%;-->
<!--  transform: translateY(-50%);-->
<!--  cursor: pointer;-->
<!--}-->

<!--/* 右上角展开按钮 */-->
<!--.expand-button {-->
<!--  position: absolute;-->
<!--  top: 5px;-->
<!--  left: 70px;  /* 让它浮在侧边栏右侧 */-->
<!--  width: 30px;-->
<!--  height: 30px;-->
<!--  background-color: #466a9f;-->
<!--  color: #fff;-->
<!--  border-radius: 50%;-->
<!--  border: none;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  cursor: pointer;-->
<!--  transition: right 0.3s;-->
<!--  opacity: 0.5;-->
<!--  z-index: 999;-->
<!--}-->

<!--.expand-button:hover {-->
<!--  background-color: #666;-->
<!--  opacity: 1;-->
<!--}-->

<!--</style>-->
