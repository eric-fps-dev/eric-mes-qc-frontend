import { createStore } from 'vuex';
import { getCurrentUser, logout } from "@/services/userService";

const TOKEN_KEYS = ['access_token', 'refresh_token', 'id_token']

const USE_MOCK_PERMISSION = import.meta.env.VITE_USE_MOCK_PERMISSION === 'true'

// Mock permission for testing only
const ALL_PERMISSION_CODES = [
    // ===== QC =====
    'qc:form-tree:view',
    'qc:form-designer:view',
    'qc:form-analysis:view',
    'qc:alarm-records:view',
    'qc:qc-summary:view',
    'qc:pending-tasks:view',
    'qc:approval-center:view',
    'qc:approval-center:submit-leader-approval',
    'qc:approval-center:submit-supervisor-approval',
    'qc:form-record:delete',
    'qc:form-record:edit',

    // ===== Maintenance (mock) =====
    'mt:dashboard:view',
    'mt:equipment:view',
    'mt:work-orders:view',
    'mt:task-library:tasks:view',
    'mt:task-library:standards:view',
    'mt:task-library:designer:view',
    'mt:requests:view',
    'mt:resources:parts:view',
    'mt:resources:tools:view',
    'mt:vendors-locations:view',
    'mt:hubspot:view',

    // ===== Administration (mock) =====
    'admin:user-management:view',
    'admin:work-group-management:view',
    'admin:shift-management:view',
    'admin:role-management:view',
    'admin:approval-management:view'
]


function clearTokens() {
    TOKEN_KEYS.forEach(key => localStorage.removeItem(key))
}

/**
 * Normalize backend user → QC-compatible user
 */
function normalizeUser(apiUser) {
    // Build name with first + last name, fallback to username
    const fullName =
        `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() ||
        apiUser.username ||
        ''

    return {
        id: apiUser.id || 0,
        username: apiUser.username || '',
        name: fullName,
        firstName: apiUser.first_name || '',
        lastName: apiUser.last_name || '',
        avatar: apiUser.image || '',
        phone: apiUser.phone_number || '',
        email: apiUser.email || '',
        title: apiUser.title || '',
        department_list: apiUser.department_list ?? null,
        isVerified: apiUser.is_verified ?? false,
        enabled: apiUser.enabled ?? true,
        team_list: apiUser.team_list || [],
        role_list: apiUser.role_list || [],
        roles: (apiUser.role_list || []).map(item => item.role?.code).filter(Boolean),
        permission_list: apiUser.permission_list || [],
        permissions: USE_MOCK_PERMISSION ? ALL_PERMISSION_CODES : (apiUser.permission_list || []).map(p => p.code).filter(Boolean),
        activation_status: apiUser.enabled ? 1 : 0
    }
}

function emptyUser() {
    return {
        id: 0,
        username: '',
        name: '',
        firstName: '',
        lastName: '',
        avatar: '',
        phone: '',
        email: '',
        title: '',
        department_list: null,
        isVerified: false,
        enabled: true,
        team_list: [],
        role_list: [],
        roles: [],
        permission_list: [],
        permissions: [],
        activation_status: 0
    }
}

export default createStore({
    state: {
        user: emptyUser(),
        userLoaded: false
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user
            state.userLoaded = true
        },
        CLEAR_USER(state) {
            state.user = emptyUser()
            state.userLoaded = false
        }
    },
    actions: {
        /**
         * Fetch current user and store it
         */ async fetchAndStoreUserState({commit}) {
            const res = await getCurrentUser()
            const apiUser = res?.data?.data ?? res?.data

            if (!apiUser || typeof apiUser !== 'object') {
                throw new Error('Invalid user payload')
            }

            const normalized = normalizeUser(apiUser)
            commit('SET_USER', normalized)
            return normalized
        },
        /**
         * Logout + clear state
         */
        async clearUserState({ commit }) {
            try {
                await logout()
            } catch (e) {
                console.warn('Logout failed or skipped:', e)
            } finally {
                clearTokens()
                commit('CLEAR_USER')
            }
        }
    },
    getters: {
        getUser: (state) => state.user,
        getName: (state) => state.user.name, // Added getter for `name`
        getPrimaryRole: (state) => {
            const roleList = state.user?.role_list || []
            const primary = roleList.find(r => r.is_primary === true || r.is_primary === 1)
            return primary?.role ?? null
        },
        isUserLoaded: (state) => state.userLoaded,
        getUserPermission: (state) => state.user.permissions,
        // Returns true if the given permission exists in the current user's permission list
        hasPermission: state => permission =>
            Array.isArray(state.user?.permissions) && state.user.permissions.includes(permission)
    },
});
