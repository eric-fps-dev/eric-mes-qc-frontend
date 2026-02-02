// src/services/qcFormTemplateService.js
import api from './api';

const BASE_URL = '/qc-form-templates';

/**
 * Fetch a form template by its ID.
 * @param {string} formTemplateId - The ID of the form template.
 * @returns {Promise} API response with the form template data.
 */
export const fetchFormTemplate = (formTemplateId) => {
    return api.get(`${BASE_URL}/${formTemplateId}`);
};

/**
 * Fetch all active QC form templates.
 * @returns {Promise} API response with template list.
 */
export const getAllActiveTemplates = () => {
    return api.get(`${BASE_URL}`);
};

/**
 * Save a new form template with associated nodes.
 * @param {Object} payload - The form template and associated node details.
 * @returns {Promise} API response after saving the template.
 */
export const createFormTemplateWithNodes = (payload) => {
    return api.post(`${BASE_URL}/create-with-nodes`, payload);
};

/**
 * Update approval_type for a given form template
 * @param {number} id - Template ID
 * @param {string} approvalType - One of: flow_1, flow_2, flow_3, flow_4
 * @returns {Promise} API response
 */
export const updateApprovalType = (id, approvalType) => {
    return api.put(`${BASE_URL}/${id}`, { approval_type: approvalType });
};

/**
 * Get all field name-label-optionItems from a form template.
 * @param {number} formTemplateId - The ID of the form template.
 * @returns {Promise} API response with field definitions.
 */
export const getFormTemplateFieldList = (formTemplateId) => {
    return api.get(`/qc-task-submission-logs/form-template-fields`, {
        params: { qcFormTemplateId: formTemplateId }
    });
};
