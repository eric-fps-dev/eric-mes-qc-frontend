// // src/services/roleService.js
// import api from './api';
//
// const BASE_URL = '/role';
//
// /**
//  * Fetch all roles.
//  * @returns {Promise} API response with the role list.
//  */
// export const fetchRoles = () => {
//     return api.get(BASE_URL, {
//         auth: {
//             username: 'fps-control',
//             password: 'fpscontrols123',
//         },
//     });
// };
//
// /**
//  * Add a new role.
//  * @param {Object} role - Role details.
//  * @returns {Promise} API response.
//  */
// export const addRole = (role) => {
//     return api.post(BASE_URL, role);
// };
//
// /**
//  * Update an existing role.
//  * @param {string} roleId - The ID of the role.
//  * @param {Object} role - Updated role details.
//  * @returns {Promise} API response.
//  */
// export const updateRole = (roleId, role) => {
//     return api.put(`${BASE_URL}/${roleId}`, role);
// };
//
// /**
//  * Delete a role by ID.
//  * @param {string} roleId - The ID of the role.
//  * @returns {Promise} API response.
//  */
// export const deleteRole = (roleId) => {
//     return api.delete(`${BASE_URL}/${roleId}`);
// };
//
// /**
//  * Fetch complete role information by role ID.
//  * @param {string} roleId - The role ID.
//  * @returns {Promise} API response with role details.
//  */
// export const getRoleById = (roleId) => {
//     return api.get(`${BASE_URL}/${roleId}`, { params: { id: roleId } });
// };
