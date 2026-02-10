// shiftService.js
import { userApi } from '@/services/api'

const DEFAULT_FETCH_1000 = {
    page: 1,
    size: 1000,
    sortField: 'createdAt',
    sortOrder: 'desc',
};

export const getAllShifts = (params = {}) => {
    return userApi.post(`shift/search`, {
        params:
            {
                ...DEFAULT_FETCH_1000,
                ...params
            }
    });
};

// export const getShiftById = (id) => {
//     return api.get(`${USER_CLIENT_URL}/${id}`);
// };
//
// export const createShift = (data) => {
//     return api.post(`${USER_CLIENT_URL}`, data);
// };
//
// export const updateShift = (id, data) => {
//     return api.put(`${USER_CLIENT_URL}/${id}`, data);
// };
//
// export const deleteShift = (id, userId) => {
//     return api.delete(`${USER_CLIENT_URL}/${id}/${userId}`);
// };
