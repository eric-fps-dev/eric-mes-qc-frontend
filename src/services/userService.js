// src/services/userService.js
import api from './api';

const BASE_URL = '/user';

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
