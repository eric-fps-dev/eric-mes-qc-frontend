import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router';
import store from '@/store';
import VFormDesigner from '@/components/form-designer/index.vue';
// import LoginPage from '@/views/LoginPage.vue';
import QualityFormManagement from '@/views/QualityFormManagement.vue';
import FormDisplay from '@/components/form-manager/FormDisplay.vue';
// import MyFutureTask from "@/views/TaskCenter/MyFutureTask.vue";
// import MyTodayTask from "@/views/TaskCenter/MyTodayTask.vue";
// import MyHistoryTask from "@/views/TaskCenter/MyHistoryTask.vue";
// import MyOverdueTask from "@/views/TaskCenter/MyOverdueTask.vue";
import TaskCenterDashboard from "@/views/TaskCenter/TaskCenterDashboard.vue";
import ErikTestView from "@/views/ErikTestView.vue";
// import QcTaskSubmissionLogs from "@/components/task-center/QcTaskSubmissionLogs.vue";
import ReportManagement from "@/views/ReportManagement.vue";
import FormDataSummary from "@/views/FormDataSummary.vue";
import PendingTasks from "@/views/TaskCenter/PendingTasks.vue";
import FormAccessCalendar from "@/components/team-form-calendar/formAccessCalendar.vue";
import AlarmRecords from "@/views/AlarmRecords.vue";
import ApprovalDesigner from "@/views/ApprovalDesigner.vue";
import TestSetForm from "@/views/TestSetForm.vue";
import TestSocket from "@/views/TestSocket.vue";
import Chat from "@/views/Chat.vue";
import ApprovalInfo from "@/views/ApprovalInfo.vue";
import QcSummary from "@/views/QcSummary.vue";
import {gotoCognitoLogin} from "@/utils/cognito";

const routes = [
    {
        path: '/callback',
        name: 'Callback',
        component: () => import('@/views/callback/index.vue'),
        meta: { hideNav: true, permissions: ['qc:qc-summary:view'] }
    },
    {
        path: '/',
        redirect: '/qc-summary'
    },
    {
        path: '/form-designer',
        name: 'FormDesigner',
        component: VFormDesigner,
        meta: { permissions: ['qc:form-designer:view'] }
    },
    {
        path: '/quality-form-management',
        name: 'QualityFormManagement',
        component: QualityFormManagement,
        meta: { permissions: ['qc:form-tree:view'] }
    },
    {
        path: '/form-data-summary',
        name: 'FormDataSummary',
        component: FormDataSummary,
        meta: { permissions: ['qc:form-analysis:view'] }
    },
    {
        path: '/form-access-calendar',
        name: 'FormAccessCalendar',
        component: FormAccessCalendar,
    },
    {
        path: '/pending-tasks',
        name: 'PendingTasks',
        component: PendingTasks,
        meta: { permissions: ['qc:pending-tasks:view'] }
    },
    // {
    //     path: '/current-tasks',
    //     name: 'MyCurrentTask',
    //     component: MyTodayTask
    // },
    // {
    //     path: '/future-tasks',
    //     name: 'MyFutureTask',
    //     component: MyFutureTask
    // },
    // {
    //     path: '/history-tasks',
    //     name: 'MyHistoryTask',
    //     component: MyHistoryTask
    // },
    // {
    //     path: '/overdue-tasks',
    //     name: 'MyOverdueTask',
    //     component: MyOverdueTask
    // },
    {
        path: '/form-display/:qcFormTemplateId',
        name: 'FormDisplay',
        component: FormDisplay,
        props: route => ({
            qcFormTemplateId: route.params.qcFormTemplateId, // Path parameter
            usable: route.query.usable === 'true', // Query parameter, parse to boolean
            dispatchedTaskId: route.query.dispatchedTaskId, // Query parameter, parse to number
            switchDisplayed: route.query.switchDisplayed === 'true', // Query parameter, parse to boolean
            rt: route.query.rt // Query parameter, parse to number
        }),
    },
    {
        path: '/task-center-dashboard',
        name: 'TaskCenterDashboard',
        component: TaskCenterDashboard
    },
    {
        path: '/erik-test-view',
        name: 'ErikTestView',
        component: ErikTestView
    },
    {
        path: '/report',
        name: 'Report',
        component: ReportManagement
    },
    // {
    //     path: '/task-log/:createdBy/:dispatchedTaskId/:taskName',
    //     name: 'TaskLog',
    //     component: QcTaskSubmissionLogs,
    //     props: true, // Pass route params as props to the component
    // },
    {
        path: '/alarm-records',
        name: 'AlarmRecords',
        component: AlarmRecords,
        meta: { permissions: ['qc:alarm-records:view'] }
    },
    {
        path: '/approval-designer',
        name: 'ApprovalDesigner',
        component: ApprovalDesigner,
    },
    {
        path: '/test-set-form',
        name: 'TestSetForm',
        component: TestSetForm,
    },
    {
        path: '/form-edit',
        name: 'FormEdit',
        component: () => import('@/components/form-manager/FormEdit.vue')
    },
    {
        path: '/form-view',
        name: 'FormView',
        component: () => import('@/components/form-manager/FormView.vue')
    },
    {
        path: '/test-socket',
        name: 'TestSocket',
        component: TestSocket,
    },
    {
        path: '/chat',
        name: 'Chat',
        component: Chat,
    },
    {
        path: '/approval-info',
        name: 'ApprovalInfo',
        component: ApprovalInfo,
        meta: { permissions: ['qc:approval-center:view'] }
    },
    {
        path: '/qc-summary',
        name: 'QcSummary',
        component: QcSummary,
        meta: { permissions: ['qc:qc-summary:view'] }
    }
];

const ACCESS_TOKEN_KEY = 'access_token'

const router = createRouter({
    history: createWebHistory('/qc/'),
    routes,
});

function normalizePerms(metaPerms) {
    if (!metaPerms) return []
    return Array.isArray(metaPerms) ? metaPerms : [metaPerms]
}

function hasAnyRequiredPerm(requiredPerms, userPerms) {
    if (!requiredPerms.length) {
        return true
    }

    if (!userPerms.length) {
        return false
    }

    return requiredPerms.some(p => userPerms.includes(p))
}

function pickHomeRoute(userPerms) {
    // If user can view QC Summary => home is qc-summary, else home is pending-tasks
    return userPerms.includes('qc:qc-summary:view') ? '/qc-summary' : '/pending-tasks'
}

// Global navigation guard to restrict routes based on user role
router.beforeEach(async (to) => {
    if (to.name === 'Callback') {
        return true
    }

    const token = localStorage.getItem(ACCESS_TOKEN_KEY)

    if (!token) {
        gotoCognitoLogin()
        return false
    }

    // Re-hydrate user if not loaded
    if (!store.getters.isUserLoaded || !store.getters.getUser?.id) {
        try {
            await store.dispatch('fetchAndStoreUserState')
        } catch (e) {
            // token might be invalid/expired
            await store.dispatch('clearUserState')
            // token might be invalid/expired -> send to login
            gotoCognitoLogin()
            return false
        }
    }

    const userPerms = store.getters.getUserPermission || []

    const isHomepageRoute = to.path === '/' || to.path === '/task-center-dashboard';

    // Home route qc summary or pending task depending on user's permission
    if (isHomepageRoute) {
        return pickHomeRoute(userPerms)
    }

    const requiredPerms = normalizePerms(to.meta?.permissions)

    if (requiredPerms.length > 0 && !hasAnyRequiredPerm(requiredPerms, userPerms)) {
        // User does not have permission, go home route
        return pickHomeRoute(userPerms)
    }

    return true
});

export default router;
