<template>
  <!-- Sidebar wrapper (collapsed toggles width + arrow hiding in CSS) -->
  <div :class="['sidebar', { collapsed: isCollapsed }]">
    <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        background-color="#466a9f"
        text-color="#fff"
        active-text-color="#ffd04b"
        :collapse="isCollapsed"
        @select="handleMenuSelect"
    >
      <!-- Logo (switches image/width based on collapsed state) -->
      <div
          :style="{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '90px',
          width: isCollapsed ? '64px' : '240px',
          backgroundColor: 'transparent',
          transition: 'width 0.2s ease'
        }"
      >
        <div style="width: 100%; text-align: center">
          <img
              v-if="!isCollapsed"
              src="@/assets/fps_logo_medium_white.png"
              alt="FPS Logo"
              style="height: 200px; padding-top: 30px; max-width: 100%; object-fit: contain"
          />
          <img
              v-else
              src="@/assets/fps-logo.png"
              alt="FPS Logo (Collapsed)"
              style="height: 40px; max-width: 100%; object-fit: contain"
          />
        </div>
      </div>

      <!-- Scrollable menu area (user info stays pinned at bottom) -->
      <el-scrollbar>
        <div class="menu-container">
          <!-- Top shortcut + collapse toggle -->
          <el-menu-item index="portal:/e2e-overview">
            <el-icon><HomeFilled /></el-icon>
            <template v-if="!isCollapsed" #title>Overview</template>

            <el-tooltip
                :content="translate('navigationMenu.collapse')"
                placement="right"
                :hide-after="0"
            >
              <!-- stopPropagation in toggleCollapse prevents selecting this menu item -->
              <el-icon
                  v-if="!isCollapsed"
                  class="collapse-icon"
                  @click="toggleCollapse($event)"
              >
                <DArrowLeft />
              </el-icon>
            </el-tooltip>
          </el-menu-item>

          <!-- Permission-driven menus (QC + Maintenance + Administration) -->
          <template v-for="root in visibleMenuConfig" :key="root.index">
            <el-sub-menu :index="root.index">
              <template #title>
                <el-icon><component :is="root.icon" /></el-icon>
                <span v-if="!isCollapsed">{{ root.title }}</span>
              </template>

              <template v-for="node in root.children" :key="node.index">
                <!-- Submenu node -->
                <el-sub-menu v-if="node.type === 'submenu'" :index="node.index">
                  <template #title>
                    <el-icon><component :is="node.icon" /></el-icon>
                    <span>{{ node.titleKey ? translate(node.titleKey) : node.title }}</span>
                  </template>

                  <!-- Leaf items under submenu -->
                  <el-menu-item
                      v-for="child in node.children"
                      :key="child.index"
                      :index="child.index"
                  >
                    <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
                    <span>{{ child.titleKey ? translate(child.titleKey) : child.title }}</span>
                  </el-menu-item>
                </el-sub-menu>

                <!-- Leaf item directly under root -->
                <el-menu-item v-else :index="node.index">
                  <el-icon v-if="node.icon"><component :is="node.icon" /></el-icon>
                  <span>{{ node.titleKey ? translate(node.titleKey) : node.title }}</span>
                </el-menu-item>
              </template>
            </el-sub-menu>
          </template>
        </div>
      </el-scrollbar>

      <!-- Bottom user panel (hidden when collapsed) -->
      <div v-if="!isCollapsed" class="user-info">
        <el-divider />
        <div class="user-details">
          <el-icon size="20px"><User /></el-icon>
          <span class="username">{{ user.name }}</span>
        </div>
        <div class="user-role">{{ roleName }}</div>

        <el-tooltip :content="translate('navigationMenu.logout')" placement="top">
          <el-icon class="logout-icon" @click="handleLogout">
            <SwitchButton />
          </el-icon>
        </el-tooltip>
      </div>
    </el-menu>

    <!-- Floating expand button (shown after collapsing) -->
    <el-tooltip
        :content="translate('navigationMenu.expand')"
        placement="right"
        :hide-after="0"
        :disabled="!showExpandButton"
    >
      <el-button
          v-if="showExpandButton"
          class="expand-button"
          @click="toggleCollapse"
      >
        <el-icon><DArrowRight /></el-icon>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import {
  HomeFilled,
  Setting,
  User,
  List,
  Document,
  Edit,
  Files,
  DataAnalysis,
  Collection,
  SwitchButton,
  TakeawayBox,
  DArrowLeft,
  DArrowRight,
  WarningFilled
} from '@element-plus/icons-vue'
import { mapGetters, mapActions } from 'vuex'
import { translate } from '@/utils/i18n'
import { gotoCognitoLogin } from '@/utils/cognito'
import { goToPortal } from '@/utils/portalNavigation'

export default {
  name: 'NavigationMenu',
  components: {
    HomeFilled,
    Setting,
    User,
    List,
    Document,
    Edit,
    Files,
    DataAnalysis,
    Collection,
    SwitchButton,
    TakeawayBox,
    DArrowLeft,
    DArrowRight,
    WarningFilled
  },
  computed: {
    ...mapGetters(['getUser', 'getPrimaryRole']),
    user() {
      return this.getUser || {}
    },
    roleName() {
      return this.getPrimaryRole?.name || null
    },
    userPerms() {
      return this.user?.permissions || []
    },
    activeMenu() {
      return this.$route.path
    },

    // Menu definition: leaf items require `perm`; groups render only if any child is visible.
    // Maintenance/Admin perms are placeholders until backend is ready.
    menuConfig() {
      return [
        {
          type: 'root',
          index: 'qc',
          title: 'Quality Control',
          icon: Collection,
          children: [
            {
              type: 'submenu',
              index: 'qc-quality',
              titleKey: 'navigationMenu.qualityManagement',
              icon: List,
              children: [
                {
                  type: 'item',
                  index: '/quality-form-management',
                  titleKey: 'navigationMenu.formManagement',
                  icon: Document,
                  perm: 'qc:form-tree:view'
                },
                {
                  type: 'item',
                  index: '/form-designer',
                  titleKey: 'navigationMenu.formDesigner',
                  icon: Edit,
                  perm: 'qc:form-designer:view'
                }
              ]
            },
            {
              type: 'submenu',
              index: 'qc-summary',
              titleKey: 'navigationMenu.dataSummary',
              icon: DataAnalysis,
              children: [
                {
                  type: 'item',
                  index: '/form-data-summary',
                  titleKey: 'navigationMenu.formAnalysis',
                  icon: Document,
                  perm: 'qc:form-analysis:view'
                },
                {
                  type: 'item',
                  index: '/alarm-records',
                  titleKey: 'navigationMenu.alarmRecords',
                  icon: WarningFilled,
                  perm: 'qc:alarm-records:view'
                },
                {
                  type: 'item',
                  index: '/qc-summary',
                  titleKey: 'navigationMenu.QcSummary',
                  icon: Document,
                  perm: 'qc:qc-summary:view'
                }
              ]
            },
            {
              type: 'submenu',
              index: 'qc-task-center',
              titleKey: 'navigationMenu.taskCenter',
              icon: Collection,
              children: [
                {
                  type: 'item',
                  index: '/pending-tasks',
                  titleKey: 'navigationMenu.pendingTasks',
                  icon: Document,
                  perm: 'qc:pending-tasks:view'
                },
                {
                  type: 'item',
                  index: '/approval-info',
                  titleKey: 'navigationMenu.approvalCenter',
                  icon: Edit,
                  perm: 'qc:approval-center:view'
                }
              ]
            }
          ]
        },
        // {
        //   type: 'root',
        //   index: 'maintenance',
        //   title: 'Maintenance',
        //   icon: Setting,
        //   children: [
        //     {
        //       type: 'item',
        //       index: 'portal:/maintenance/dashboard',
        //       title: 'Dashboard',
        //       icon: DataAnalysis,
        //       perm: 'mt:dashboard:view'
        //     },
        //     {
        //       type: 'item',
        //       index: 'portal:/maintenance/equipment/list',
        //       title: 'Equipment',
        //       icon: TakeawayBox,
        //       perm: 'mt:equipment:view'
        //     },
        //     {
        //       type: 'item',
        //       index: 'portal:/maintenance/work-orders/table',
        //       title: 'Work Orders',
        //       icon: Document,
        //       perm: 'mt:work-orders:view'
        //     },
        //     {
        //       type: 'submenu',
        //       index: 'maintenance-task-library',
        //       title: 'Task Library',
        //       icon: List,
        //       children: [
        //         {
        //           type: 'item',
        //           index: 'portal:/maintenance/task-library/tasks',
        //           title: 'Tasks',
        //           icon: Document,
        //           perm: 'mt:task-library:tasks:view'
        //         },
        //         {
        //           type: 'item',
        //           index: 'portal:/maintenance/task-library/standards',
        //           title: 'Standards',
        //           icon: Document,
        //           perm: 'mt:task-library:standards:view'
        //         },
        //         {
        //           type: 'item',
        //           index: 'portal:/maintenance/task-library/designer',
        //           title: 'Designer',
        //           icon: Edit,
        //           perm: 'mt:task-library:designer:view'
        //         }
        //       ]
        //     },
        //     {
        //       type: 'item',
        //       index: 'portal:/maintenance/requests/list',
        //       title: 'Requests',
        //       icon: Document,
        //       perm: 'mt:requests:view'
        //     },
        //     {
        //       type: 'submenu',
        //       index: 'maintenance-resources',
        //       title: 'Resources',
        //       icon: Files,
        //       children: [
        //         {
        //           type: 'item',
        //           index: 'portal:/maintenance/resources/parts',
        //           title: 'Parts',
        //           icon: Document,
        //           perm: 'mt:resources:parts:view'
        //         },
        //         {
        //           type: 'item',
        //           index: 'portal:/maintenance/resources/tools',
        //           title: 'Tools',
        //           icon: Document,
        //           perm: 'mt:resources:tools:view'
        //         }
        //       ]
        //     },
        //     {
        //       type: 'item',
        //       index: 'portal:/maintenance/vendors-locations',
        //       title: 'Vendors & Locations',
        //       icon: Document,
        //       perm: 'mt:vendors-locations:view'
        //     },
        //     {
        //       type: 'item',
        //       index: 'portal:/maintenance/hubspot',
        //       title: 'Hubspot',
        //       icon: Document,
        //       perm: 'mt:hubspot:view'
        //     }
        //   ]
        // },
        {
          type: 'root',
          index: 'administration',
          title: 'Administration',
          icon: User,
          children: [
            {
              type: 'item',
              index: 'portal:/administration/user-management',
              title: 'User',
              icon: User,
              perm: 'admin:user-management:view'
            },
            {
              type: 'item',
              index: 'portal:/administration/work-group-management',
              title: 'Work Group',
              icon: User,
              perm: 'admin:work-group-management:view'
            },
            {
              type: 'item',
              index: 'portal:/administration/shift-management',
              title: 'Shift',
              icon: User,
              perm: 'admin:shift-management:view'
            },
            {
              type: 'item',
              index: 'portal:/administration/role-management',
              title: 'Role',
              icon: User,
              perm: 'admin:role-management:view'
            },
            {
              type: 'item',
              index: 'portal:/administration/approval-management',
              title: 'Approval',
              icon: User,
              perm: 'admin:approval-management:view'
            }
          ]
        }
      ]
    },

    // Permission-filtered menu tree (removes empty groups)
    visibleMenuConfig() {
      return this.filterMenuByPerm(this.menuConfig)
    }
  },
  methods: {
    ...mapActions(['clearUserState']),
    translate(key) {
      return translate(key)
    },

    hasPerm(code) {
      return (this.userPerms || []).includes(code)
    },

    filterMenuByPerm(nodes = []) {
      return nodes
          .map(node => {
            if (node.type === 'item') {
              // Set perm: null for public items
              if (!node.perm) return node
              return this.hasPerm(node.perm) ? node : null
            }

            const children = this.filterMenuByPerm(node.children || [])
            if (!children.length) return null
            return { ...node, children }
          })
          .filter(Boolean)
    },

    toggleCollapse(event) {
      // Prevent click from triggering menu selection
      event.stopPropagation()
      this.isCollapsed = !this.isCollapsed

      if (this.isCollapsed) {
        setTimeout(() => {
          this.showExpandButton = true
        }, 500)
      } else {
        this.showExpandButton = false
      }
    },

    handleLogout() {
      this.$confirm(
          translate('navigationMenu.logoutConfirmationMessage'),
          translate('navigationMenu.logoutConfirmationTitle'),
          {
            confirmButtonText: translate('common.editDialog.confirmButton'),
            cancelButtonText: translate('common.editDialog.cancelButton'),
            type: 'warning'
          }
      )
          .then(() => {
            this.clearUserState()

            console.log('NavigationMenu2.vue logout clicked, navigating to cognito login')
            gotoCognitoLogin()
          })
          .catch(() => {
            this.$message.info(translate('common.operationCancelled'))
          })
    },

    handleMenuSelect(index) {
      // Cross-app navigation (portal app)
      if (typeof index === 'string' && index.startsWith('portal:')) {
        const hashPath = index.replace('portal:', '')
        goToPortal(hashPath)
        return
      }

      // Local app navigation (vue-router)
      if (index && index !== this.$route.path) {
        this.$router.push(index)
      }
    }
  },
  data() {
    return {
      isCollapsed: false,
      showExpandButton: false
    }
  }
}
</script>

<style scoped>
.el-menu-vertical-demo {
  height: 100vh;
  width: 240px;
  display: flex;
  transition: width 0.2s ease-in-out, opacity 0.2s ease-in-out;
  flex-direction: column;
  overflow: hidden;
}

/* viewport - (logo + user panel) */
.menu-container {
  max-height: calc(100vh - 260px);
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
}

.user-info {
  color: #fff;
  text-align: center;
  padding: 10px;
}

.user-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
}

.user-role {
  font-size: 14px;
  color: #ffd04b;
}

.logout-icon {
  margin-top: 10px;
  cursor: pointer;
  font-size: 24px;
  color: #fff;
  transition: color 0.3s;
}

.logout-icon:hover {
  color: #ff4d4f;
}

.sidebar.collapsed .el-menu-vertical-demo {
  width: 64px;
}

.sidebar.collapsed:hover .el-menu span {
  display: inline;
}

/* Hide submenu arrows when collapsed */
.sidebar.collapsed .el-sub-menu__icon-arrow {
  display: none !important;
}

.collapse-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
}

.expand-button {
  position: absolute;
  top: 5px;
  left: 70px;
  width: 30px;
  height: 30px;
  background-color: #466a9f;
  color: #fff;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: right 0.3s;
  opacity: 0.5;
  z-index: 999;
}

.expand-button:hover {
  background-color: #666;
  opacity: 1;
}
</style>
