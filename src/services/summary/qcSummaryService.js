// qcSummaryService.js
// This file provides API functions to access QC Summary backend endpoints powered by FastAPI.
// It reads the base URL from VITE_QC_SUMMARY_API (configured per environment in .env files).

import axios from 'axios';

// Base URL for QC Summary APIs, e.g., http://localhost:8000/summary
const BASE_URL = import.meta.env.VITE_QC_SUMMARY_API + '/summary';

/**
 * 获取按日期的批次合格率趋势数据
 * @param {Object} params - { start_date, end_date, team_id, shift_id, product_id, batch_id }
 * @returns {Promise} Axios response with daily pass rate data
 */
export const getPassRateByDay = (params) => {
    return axios.get(`${BASE_URL}/pass-rate-by-day`, { params });
};

/**
 * 获取各班组的异常字段统计数据
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with team-level abnormal stats
 */
export const getAbnormalByTeam = (params) => {
    return axios.get(`${BASE_URL}/abnormal-by-team`, { params });
};

/**
 * 获取字段级别的异常比例（用于饼图）
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with abnormal ratio per field
 */
export const getAbnormalRatioByField = (params) => {
    return axios.get(`${BASE_URL}/abnormal-ratio-by-field`, { params });
};

/**
 * 获取字段级别的异常比例（合并小于20%的为“其他”）
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with grouped pie chart data
 */
export const getAbnormalRatioByFieldGrouped = (params) => {
    return axios.get(`${BASE_URL}/abnormal-ratio-by-field-grouped`, { params });
};

/**
 * 获取产品 × 时间维度的异常热力图数据
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with heatmap data (date × product)
 */
export const getAbnormalHeatmap = (params) => {
    return axios.get(`${BASE_URL}/abnormal-heatmap`, { params });
};

/**
 * 获取每个产品的异常批次统计（异常率、批次数）
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with product-level abnormal stats
 */
export const getAbnormalBatchesByProduct = (params) => {
    return axios.get(`${BASE_URL}/abnormal-batches-by-product`, { params });
};

/**
 * 获取各检验员的质检字段数量统计（用于人员对比）
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with personnel inspection stats
 */
export const getInspectionCountByPersonnel = (params) => {
    return axios.get(`${BASE_URL}/inspection-count-by-personnel`, { params });
};

/**
 * 获取批次质检数量统计（用于批次对比）
 * @param {Object} params - Filter parameters (start_date, end_date, team_id, shift_id, product_id, batch_id)
 * @returns {Promise} Axios response with batch inspection data
 */
export const getInspectionCountByBatch = (params) => {
    return axios.get(`${BASE_URL}/inspection-count-by-batch`, { params });
};

/**
 * 获取特定批次的异常检验详情
 * @param {Object} params - Filter parameters including batch_code
 * @returns {Promise} Axios response with abnormal inspection details
 */
export const getAbnormalInspectionDetails = (params) => {
    return axios.get(`${BASE_URL}/abnormal-inspection-details`, { params });
};

/**
 * 获取特定批次的正常检验详情
 * @param {Object} params - Filter parameters including batch_code
 * @returns {Promise} Axios response with normal inspection details
 */
export const getNormalInspectionDetails = (params) => {
    return axios.get(`${BASE_URL}/normal-inspection-details`, { params });
};

/**
 * 获取特定提交的验证详情（从异常检验详情钻取）
 * @param {String} submissionId - MongoDB ObjectId of the submission
 * @param {String} collectionName - Optional MongoDB collection name
 * @returns {Promise} Axios response with validation details for individual fields
 */
export const getSubmissionValidationDetails = (submissionId, collectionName) => {
    const params = { submission_id: submissionId };
    if (collectionName) {
        params.collection_name = collectionName;
    }
    return axios.get(`${BASE_URL}/submission-validation-details`, { params });
};

/**
 * 获取卡片汇总统计数据（批次、人员、字段、异常率等）
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with summary card values
 */
export const getCardStats = (params) => {
    return axios.get(`${BASE_URL}/card-stats`, { params });
};

/**
 * 获取质检人员 KPI（字段检测数、异常率、提交表单数）
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with personnel KPI
 */
export const getPersonnelKPI = (params) => {
    return axios.get(`${BASE_URL}/personnel-kpi`, { params });
};

/**
 * 获取复检记录列表
 * @param {Object} params - Filtering options
 * @returns {Promise} Axios response with retest record data
 */
export const getRetestRecords = (params) => {
    return axios.get(`${BASE_URL}/retest-records`, { params });
};

/**
 * 获取 MongoDB 中的质检文档列表（用于导出）
 * @param {Object} params - { start_date, end_date, team_id, shift_id, product_id, batch_id }
 * @returns {Promise} Axios response with raw document list
 */
export const getDocumentList = (params) => {
    return axios.get(`${BASE_URL}/document-list`, { params });
};

/**
 * 导出汇总 PDF 报告（支持图表截图）
 * @param {Object} params - 参数对象，包含 start_date, end_date, team_id 等，以及 base64 图表图像对象 charts
 * @returns {Promise} 下载 PDF 文件
 */
export const downloadPdfReport = async (params) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Get current language from localStorage (check both keys for compatibility)
    const language = localStorage.getItem('v_form_locale') || localStorage.getItem('app-language') || 'en-US';

    // 拆分参数与图表图片
    const { charts, ...filters } = params;

    const response = await axios.post(`${BASE_URL}/export-pdf-report`, {
        ...filters,
        timezone,
        charts: charts || {}
    }, {
        responseType: 'blob',
        headers: {
            'Accept-Language': language
        }
    });

    const fileName = `QC_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

/**
 * 手动触发快照插入（Mongo 数据 + 复检记录）
 * @returns {Promise} Axios response with success message
 */
export const triggerManualSnapshot = () => {
    const BASE_ROOT_URL = import.meta.env.VITE_QC_SUMMARY_API;
    return axios.post(`${BASE_ROOT_URL}/snapshot/manual-trigger`);
};




