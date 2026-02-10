// import api from './api';
//
// const BASE_URL = '/qc-order';
//
// /**
//  * Create a new QC Order with its Dispatches.
//  */
// export const createQcOrder = (data) => {
//     return api.post(`${BASE_URL}`, data);
// }
//
// /**
//  * Update an existing QC Order.
//  */
// export const updateQcOrder = (id, data) => {
//     return api.put(`${BASE_URL}/${id}`, data);
// };
//
// /**
//  * Retrieve a QC Order by ID.
//  */
// export const getQcOrderById = (id) => {
//     return api.get(`${BASE_URL}/${id}`);
// };
//
// /**
//  * Retrieve a list of all QC Orders.
//  */
// export const getAllQcOrders = () => {
//     return api.get(BASE_URL);
// };
//
// /**
//  * Delete a QC Order by ID.
//  */
// export const deleteQcOrder = (id, userId) => {
//     return api.delete(`${BASE_URL}/${id}/${userId}`);
// };
//
// /**
//  * Update QC Order States
//  */
// export const updateQcOrderStates = () => {
//     return api.post(`${BASE_URL}/update-qc-order-states`);
// };
