import api from "./api";

const BASE_URL = "/teams";

const buildArrayParams = (key, arr = []) =>
    arr?.length ? { [key]: arr } : {};

/**
 * Fetch all teams.
 * @returns {Promise} API response with the list of all teams.
 */
export const getAllTeamTree = () => {
    return api.get(`${BASE_URL}`);
};

/**
 * Fetch a specific team by ID.
 * @param {number} id - The ID of the team.
 * @returns {Promise} API response with the team details.
 */
export const getTeamById = (id) => {
    return api.get(`${BASE_URL}/${id}`);
};

/**
 * Create team + initial members / forms.
 * @param {Object} teamData - The data for creating a new team.
 * @returns {Promise} API response with the created team details.
 */
export const createTeam = (teamData) => {
    return api.post(BASE_URL, teamData);
};

/**
 * Full update of team + re-sync of members / forms.
 * @param {number}   id
 * @param {Object}   teamData   payload for TeamRequest (already contains updatedBy)
 * @returns {Promise} API response with the updated team details.
 */
export const updateTeam = (id, teamData) => {
    return api.put(`${BASE_URL}/${id}`, teamData);
};

export const setTeamLeader = (teamId, leaderId) => {
    return api.put(`${BASE_URL}/leadership/${teamId}/${leaderId}`);
};

export const clearTeamLeader = (teamId) => {
    return api.put(`${BASE_URL}/leadership/${teamId}`);
};

/**
 * Deactivate a team (soft delete).
 * @param {number} id - The ID of the team to deactivate.
 * @param {number} updatedBy - The ID of the user performing the action.
 * @returns {Promise} API response with success or failure status.
 */
export const deactivateTeam = (id, updatedBy) => {
    return api.put(`${BASE_URL}/deactivate/${id}?updatedBy=${updatedBy}`);
};

/**
 * Activate an inactive team.
 * @param {number} id - The ID of the team to activate.
 * @param {number} updatedBy - The ID of the user performing the action.
 * @returns {Promise} API response with success or failure status.
 */
export const activateTeam = (id, updatedBy) => {
    return api.put(`${BASE_URL}/activate/${id}?updatedBy=${updatedBy}`);
};

/**
 * Hard delete a team.
 * @param {number} id - The ID of the team to delete.
 * @returns {Promise} API response with success or failure status.
 */
export const deleteTeam = (id) => {
    return api.delete(`${BASE_URL}/delete/${id}`);
};


/**
 * Fetch a team by the team lead ID.
 * @param {number} id - The ID of the team lead.
 * @returns {Promise} API response with the team details.
 */
export const getTeamByTeamLeadId = (id) => {
    return api.get(`${BASE_URL}/lead/${id}`);
};


/**
 * Fetch a list of all current team leader user IDs.
 * Useful for role-based filtering, permission assignment, or team setup validation.
 *
 * @returns {Promise} API response containing an array of user IDs who are team leaders.
 */
export const getCurrentLeaders = () => {
    return api.get(`${BASE_URL}/leaders`);
};

/**
 * Get the hierarchical depth of a team (root = 1).
 * @param {number} id - The ID of the team.
 * @returns {Promise} API response with the depth as an integer.
 */
export const getTeamDepth = (id) => {
    return api.get(`${BASE_URL}/depth/${id}`);
};

export const removeOrphanLeadership = (userId) => {
    return api.post(`${BASE_URL}/leadership/${userId}`);
}
