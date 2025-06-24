import { createRouter, createWebHistory } from 'vue-router';
import {gotoCognitoLogin} from "@/utils/cognito";
import store from '@/store';
import VFormDesigner from '@/components/form-designer/index.vue';
import UserManagement from '@/views/UserManagement.vue';
/*
import LoginPage from '@/views/LoginPage.vue';
*/
import QualityFormManagement from '@/views/QualityFormManagement.vue';
import FormDisplay from '@/components/form-manager/FormDisplay.vue';
import MyFutureTask from "@/views/TaskCenter/MyFutureTask.vue";
import MyTodayTask from "@/views/TaskCenter/MyTodayTask.vue";
import MyHistoryTask from "@/views/TaskCenter/MyHistoryTask.vue";
import MyOverdueTask from "@/views/TaskCenter/MyOverdueTask.vue";
import TaskCenterDashboard from "@/views/TaskCenter/TaskCenterDashboard.vue";
import ErikTestView from "@/views/ErikTestView.vue";
import QcTaskSubmissionLogs from "@/components/task-center/QcTaskSubmissionLogs.vue";
import OrderManagement from "@/views/OrderManagement.vue";
import ReportManagement from "@/views/ReportManagement.vue";
import FormDataSummary from "@/views/FormDataSummary.vue";
import InstrumentManagement from "@/views/InstrumentManagement.vue";
import SamplingLocationManagement from "@/views/SamplingLocationManagement.vue";
import TestSubjectManagement from "@/views/TestSubjectManagement.vue";
import TeamManagement from "@/views/TeamManagement.vue";
import PendingTasks from "@/views/TaskCenter/PendingTasks.vue";
import ShiftManagement from "@/views/shiftManagement.vue";
import FormAccessCalendar from "@/components/team-form-calendar/formAccessCalendar.vue";
import AlarmRecords from "@/views/AlarmRecords.vue";
import ApprovalDesigner from "@/views/ApprovalDesigner.vue";
import TestSetForm from "@/views/TestSetForm.vue";
import TestSocket from "@/views/TestSocket.vue";
import Chat from "@/views/Chat.vue";
import ApprovalInfo from "@/views/ApprovalInfo.vue";
import QcSummary from "@/views/QcSummary.vue";
import Callback from "@/views/Callback.vue";
import Welcome from "@/views/Welcome.vue";
import {getCurrentUser} from "@/services/authService";


const routes = [
    {
        path: '/',
        name: 'Root', // Default route
        redirect: '/qc-summary'
    },
    {
        path: '/welcome',
        name: 'Welcome',
        component: Welcome,
        meta: { requiresAuth: false }
    },
    {
        path: '/callback',
        name: 'Callback',
        component: Callback,
        meta: { requiresAuth: false }
    },
    {
        path: '/form-designer',
        name: 'FormDesigner',
        component: VFormDesigner,
    },
    {
        path: '/user-management',
        name: 'UserManagement',
        component: UserManagement,
    },
    {
        path: '/team-management',
        name: 'TeamManagement',
        component: TeamManagement,
    },
    {
        path: '/shift-management',
        name: 'ShiftManagement',
        component: ShiftManagement,
    },
/*    {
        path: '/LoginPage',
        name: 'LoginPage',
        component: LoginPage,
    },*/
    {
        path: '/quality-form-management',
        name: 'QualityFormManagement',
        component: QualityFormManagement
    },
    {
        path: '/form-data-summary',
        name: 'FormDataSummary',
        component: FormDataSummary
    },
    {
        path: '/form-access-calendar',
        name: 'FormAccessCalendar',
        component: FormAccessCalendar,
    },
    {
        path: '/task-assignment',
        name: 'TaskAssignment',
        component: OrderManagement,
    },
    {
        path: '/pending-tasks',
        name: 'PendingTasks',
        component: PendingTasks
    },
    {
        path: '/current-tasks',
        name: 'MyCurrentTask',
        component: MyTodayTask
    },
    {
        path: '/future-tasks',
        name: 'MyFutureTask',
        component: MyFutureTask
    },
    {
        path: '/history-tasks',
        name: 'MyHistoryTask',
        component: MyHistoryTask
    },
    {
        path: '/overdue-tasks',
        name: 'MyOverdueTask',
        component: MyOverdueTask
    },
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
    {
        path: '/task-log/:createdBy/:dispatchedTaskId/:taskName',
        name: 'TaskLog',
        component: QcTaskSubmissionLogs,
        props: true, // Pass route params as props to the component
    },
    {
        path: '/instrument-management',
        name: 'InstrumentManagement',
        component: InstrumentManagement,
    },
    {
        path: '/sampling-location-management',
        name: 'SamplingLocationManagement',
        component: SamplingLocationManagement,
    },
    {
        path: '/test-subject-management',
        name: 'TestSubjectManagement',
        component: TestSubjectManagement,
    },
    {
        path: '/alarm-records',
        name: 'AlarmRecords',
        component: AlarmRecords,
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
    },
    {
        path: '/qc-summary',
        name: 'QcSummary',
        component: QcSummary,
        meta: { requiresAuth: true }
    }

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Global navigation guard: Unified Cognito login + Role permission/homepage control + Redirect failure handling
router.beforeEach(async(to, from, next) => {

    if (!to.meta.requiresAuth) return next()
    try {
        await getCurrentUser()
        next()
    } catch (error) {
        console.warn('未登录或登录失效，跳 Cognito', error)
        gotoCognitoLogin()
    }

/*    let user = store.state.user;
/!*
    const userRoleId = user?.role?.id || 0;
*!/
/!*
    const isLoggedIn = !!user.username && userRoleId !== 0;
*!/
    if (!user || !user.username) {
        try {
            const resp = await getCurrentUser();
            store.commit('SET_USER', resp.data);
            user = resp.data;
        } catch (error) {
            gotoCognitoLogin();
            return
        }
    }

/!*
    const userRoleId = user?.role?.id || 0
*!/
/!*
    const isLoggedIn = !!user.username && userRoleId !== 0
*!/
    const isLoggedIn = !!user.username
    console.log('User username', user.username)

    if (to.path === '/callback') return next()

    if (!isLoggedIn) {
        gotoCognitoLogin()
        return
    }

    const isRestrictedRouteForRole3 = [
        '/form-designer',
        '/user-management',
        '/team-management',
        '/quality-form-management',
        '/form-data-summary',
        '/task-assignment',
        '/instrument-management',
        '/sampling-location-management',
        '/test-subject-management'
    ].includes(to.path);

/!*

    // Allow login page access for everyone
    if (to.path === '/LoginPage') {
        return next();
    }
*!/
/!*

    // Redirect unauthenticated users to login
    if (!isLoggedIn) {
        return next('/LoginPage');
    }
*!/

    // Restrict role 3 from accessing certain admin/config pages
    if (userRoleId === 3 && isRestrictedRouteForRole3) {
        return next('/pending-tasks');
    }

    if (to.path === '/qc-summary') {
        return next()
    }

    const isHomepageRoute = to.path === '/' || to.path === '/task-center-dashboard';
    // Handle homepage redirect based on role
    if (isHomepageRoute) {
        return (userRoleId === 1 || userRoleId === 4)
            ? next('/qc-summary')
            : next('/pending-tasks');
    }

    // Allow all other routes
    next();*/
});

export default router;
