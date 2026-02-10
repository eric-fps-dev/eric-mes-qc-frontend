import { userApi } from '@/services/api'

function storeTokens(payload) {
    console.group('[auth] storeTokens')

    // console.log('raw payload type:', typeof payload)
    // console.log('payload keys:', payload ? Object.keys(payload) : null)

    const data = payload?.data ?? payload ?? {}
    // console.log('resolved data keys:', data ? Object.keys(data) : null)

    const at = data.access_token ?? data.accessToken
    const rt = data.refresh_token ?? data.refreshToken
    const it = data.id_token ?? data.idToken

    // console.log('access_token present:', Boolean(at))
    // console.log('refresh_token present:', Boolean(rt))
    // console.log('id_token present:', Boolean(it))

    // // Optional: show short prefixes to verify correctness
    // if (at) console.log('access_token prefix:', at.slice(0, 10), '...')
    // if (rt) console.log('refresh_token prefix:', rt.slice(0, 10), '...')
    // if (it) console.log('id_token prefix:', it.slice(0, 10), '...')

    if (at) localStorage.setItem('access_token', at)
    if (rt) localStorage.setItem('refresh_token', rt)
    if (it) localStorage.setItem('id_token', it)

    // console.groupEnd()
}

export async function callback(code) {
    const res = await userApi.post(
        `auth/callback`,
        { code }
    )

    if (res?.data) {
        storeTokens(res.data)
    }
    return res
}

export async function refresh() {
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
        throw new Error('No refresh token available')
    }

    const res = await userApi.post(
        `/auth/refresh`,
        { refresh_token: refreshToken },
    )

    if (res?.data) {
        storeTokens(res.data)
    }
    return res
}

export function logout() {
    return userApi.post(
        `/auth/logout`,
        {}
    )
}

export function getCurrentUser() {
    return userApi.get(
        `/user/me`)
}

/**
 * Fetch all users.
 * @returns {Promise} API response with the user list.
 */
export const fetchUsers = () => {
    return userApi.post(
        `/user/search`,{
        }, {
            params: {
                page: 1,
                size: 10000,
                sortField: 'createdAt',
                sortOrder: 'desc',
            }
        }
    );
};

/**
 * Search users with optional filters and pagination.
 *
 * Backend behavior:
 * - If `filters` is omitted or empty, returns all users (paged).
 * - Pagination and sorting parameters are optional.
 * - Defaults (server-side):
 *   - page = 1
 *   - size = 10
 *   - sortField = createdAt
 *   - direction = DESC
 *
 * @param {Object} [filters] - Optional search filters (UserQueryRequest).
 * @param {Object} [options] - Optional pagination and sorting options.
 * @param {number} [options.page] - Page number (1-based).
 * @param {number} [options.size] - Page size.
 * @param {string} [options.sortField] - Field to sort by.
 * @param {string} [options.direction] - Sort direction: 'ASC' | 'DESC'.
 *
 * @returns {Promise} API response with the user list.
 */
export const searchUsers = (
    filters = {},
    options = {}
) => {
    return userApi.post(
        '/user/search',
        filters,
        {
            params: {
                page: options.page,
                size: options.size,
                sortField: options.sortField,
                direction: options.direction,
            }
        }
    );
};

/**
 * Get user information by user id.
 * @param {integer} id - The user ID.
 * @returns {Promise} API response with user details.
 */
export const getUserById = (id) => {
    return userApi.get(`/user/${id}`, { params: {id}});
}

// export const fetchUsers = () => {
//     return api.get(BASE_URL, {
//         auth: {
//             username: 'fps-control',
//             password: 'fpscontrols123',
//         },
//     });
// };

// /**
//  * Add a new user.
//  * @param {Object} user - User details.
//  * @returns {Promise} API response.
//  */
// export const addUser = (user) => {
//     return api.post(BASE_URL, user);
// };
//
// /**
//  * Update an existing user.
//  * @param {string} userId - The ID of the user.
//  * @param {Object} user - Updated user details.
//  * @returns {Promise} API response.
//  */
// export const updateUser = (userId, user) => {
//     return api.put(`${BASE_URL}/${userId}`, user);
// };
//
// /**
//  * Hard delete a user by ID.
//  * @param {string} userId - The ID of the user.
//  * @returns {Promise} API response.
//  */
// export const hardDeleteUser = (userId) => {
//     return api.delete(`${BASE_URL}/hard-delete/${userId}`);
// };
//
// /**
//  * Soft delete a user by ID.
//  * @param {string} userId - The ID of the user.
//  * @returns {Promise} API response.
//  */
// export const softDeleteUser = (userId) => {
//     return api.delete(`${BASE_URL}/soft-delete/${userId}`);
// };

// /**
//  * Validate user credentials during login.
//  * @param {string} username - The username.
//  * @param {string} password - The encoded password.
//  * @returns {Promise} API response.
//  */
// export const validateUser = (username, password) => {
//     return api.post(`${BASE_URL}/validate`, null, {
//         params: { username, password },
//     });
// };
//
// /**
//  * Fetch complete user information by username.
//  * @param {string} username - The username.
//  * @returns {Promise} API response with user details.
//  */
// export const fetchUserInfo = (username) => {
//     return api.get(`${BASE_URL}/info`, { params: { username } });
// };
