// src/services/weeklyReportSubscriptionService.js
import api from './api';

const BASE_URL = '/weekly-report-subscription';

/**
 * Get all active subscriptions.
 * @returns {Promise} API response with the subscription list.
 */
export const getSubscriptions = () => {
    return api.get(BASE_URL);
};

/**
 * Add a new subscription.
 * @param {Object} subscription - { user_id, email, created_by }
 * @returns {Promise} API response.
 */
export const addSubscription = (subscription) => {
    return api.post(BASE_URL, subscription);
};

/**
 * Remove a subscription (soft delete).
 * @param {number} id - Subscription ID.
 * @returns {Promise} API response.
 */
export const removeSubscription = (id) => {
    return api.delete(`${BASE_URL}/${id}`);
};

/**
 * Toggle subscription active status.
 * @param {number} id - Subscription ID.
 * @param {boolean} isActive - New status.
 * @returns {Promise} API response.
 */
export const toggleSubscription = (id, isActive) => {
    return api.put(`${BASE_URL}/${id}/toggle`, null, { params: { isActive } });
};
