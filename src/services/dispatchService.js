// import api from './api';
//
// const BASE_URL = '/dispatch';
//
// export const getAllDispatches = () => {
//     return api.get(BASE_URL);
// }
//
// export const getScheduledTasks = () => {
//     return api.get(`${BASE_URL}/scheduled-tasks`);
// }
//
// export const getDispatchNextExecutionTime = (id) => {
//     return api.get(`${BASE_URL}/next-execution-time/${id}`);
// }
//
// export const getIsScheduled = (id) => {
//     return api.get(`${BASE_URL}/is-scheduled/${id}`);
// }
//
// export const getDispatchById = (id) => {
//     return api.get(`${BASE_URL}/${id}`);
// }
//
// export const createDispatch = (data) => {
//     return api.post(BASE_URL, data);
// }
//
// export const updateDispatch = (id, data) => {
//     return api.put(`${BASE_URL}/${id}`, data);
// }
//
// export const deleteDispatch = (id, userId) => {
//     return api.delete(`${BASE_URL}/${id}/${userId}`);
// }
//
// export const resumeDispatch = (id, userId) => {
//     return api.put(`${BASE_URL}/resume/${id}/${userId}`);
// }
//
// export const pauseDispatch = (id, userId) => {
//     return api.put(`${BASE_URL}/pause/${id}/${userId}`);
// }
//
// /**
//  * Fetches the human-readable Chinese description of a Spring CRON expression.
//  * @param {string} cronExpression - The CRON expression to parse.
//  * @returns {Promise} - The API response with the parsed CRON description.
//  */
// export const parseCronToChinese = (cronExpression) => {
//     return api.get(`${BASE_URL}/parse-cron`, {
//         params: { cronExpression }
//     });
// };
//
// /**
//  * Retrieves the dispatch information associated with a dispatched task ID.
//  * @param {number} dispatchedTaskId - The ID of the dispatched task.
//  * @returns {Promise} - The API response with the dispatch data.
//  */
// export const getDispatchByDispatchedTaskId = (dispatchedTaskId) => {
//     return api.get(`${BASE_URL}/dispatched-task/${dispatchedTaskId}`);
// };
//
//
//
//
//
