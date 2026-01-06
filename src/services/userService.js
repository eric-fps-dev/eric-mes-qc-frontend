// src/services/userService.js
import api from '@/services/api'

const USER_CLIENT_URL = import.meta.env.VITE_USER_CLIENT_URL

function storeTokens(tokenData) {
    const at = tokenData.access_token ?? tokenData.accessToken
    const rt = tokenData.refresh_token ?? tokenData.refreshToken
    const it = tokenData.id_token ?? tokenData.idToken

    if (at) localStorage.setItem('access_token', at)
    if (rt) localStorage.setItem('refresh_token', rt)
    if (it) localStorage.setItem('id_token', it)
}

export async function callback(code) {
    const res = await api.post(
        `${USER_CLIENT_URL}/auth/callback`,
        { code },
        { baseURL: USER_CLIENT_URL }
    )
    if (res?.data) storeTokens(res.data)
    return res
}

export async function refresh() {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
        throw new Error('No refresh token available')
    }

    const res = await api.post(
        `${USER_CLIENT_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { baseURL: USER_CLIENT_URL }
    )
    if (res?.data) storeTokens(res.data)
    return res
}

export function logout() {
    return api.post(
        `${USER_CLIENT_URL}/auth/logout`,
        {},
        { baseURL: USER_CLIENT_URL }
    )
}

export function getCurrentUser() {
    return api.get(
        `${USER_CLIENT_URL}/user/me`,
        { baseURL: USER_CLIENT_URL }
    )
}

/**
 * Fetch all users.
 * @returns {Promise} API response with the user list.
 */
export const fetchUsers = () => {
    return api.get(BASE_URL, {
        auth: {
            username: 'fps-control',
            password: 'fpscontrols123',
        },
    });
};

/**
 * Add a new user.
 * @param {Object} user - User details.
 * @returns {Promise} API response.
 */
export const addUser = (user) => {
    return api.post(BASE_URL, user);
};

/**
 * Update an existing user.
 * @param {string} userId - The ID of the user.
 * @param {Object} user - Updated user details.
 * @returns {Promise} API response.
 */
export const updateUser = (userId, user) => {
    return api.put(`${BASE_URL}/${userId}`, user);
};

/**
 * Hard delete a user by ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise} API response.
 */
export const hardDeleteUser = (userId) => {
    return api.delete(`${BASE_URL}/hard-delete/${userId}`);
};

/**
 * Soft delete a user by ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise} API response.
 */
export const softDeleteUser = (userId) => {
    return api.delete(`${BASE_URL}/soft-delete/${userId}`);
};

/**
 * Validate user credentials during login.
 * @param {string} username - The username.
 * @param {string} password - The encoded password.
 * @returns {Promise} API response.
 */
export const validateUser = (username, password) => {
    return api.post(`${BASE_URL}/validate`, null, {
        params: { username, password },
    });
};

/**
 * Fetch complete user information by username.
 * @param {string} username - The username.
 * @returns {Promise} API response with user details.
 */
export const fetchUserInfo = (username) => {
    return api.get(`${BASE_URL}/info`, { params: { username } });
};


/**
 * Get user information by user id.
 * @param {integer} id - The user ID.
 * @returns {Promise} API response with user details.
 */
export const getUserById = (id) => {
    return api.get(`${BASE_URL}/${id}`, { params: {id}});
}
