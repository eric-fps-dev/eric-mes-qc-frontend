// useQcRecordsDialog.js
import { ref, nextTick } from "vue";
import { fetchQcRecords } from "@/services/qcReportingService";
import { fetchQcVersionsByGroupId } from "@/services/qcReportingService";
import { fetchPaginatedQcRecords } from "@/services/qcReportingService";
import { translate } from "@/utils/i18n";
import { getUserById } from "@/services/userService";

const recordsTotal = ref(0);
const recordsTotalPages = ref(0);
const currentBackendPage = ref(0);
const backendPageSize = ref(15);
const sortSpec = ref(null);      // e.g., "created_at,desc"
const search = ref('');          // search term from table

export function useQcRecordsDialog() {
    const qcRecordsDialogVisible = ref(false);
    const loadingQcRecords = ref(false);
    const qcRecords = ref([]);
    const reorderedColumnHeaders = ref([]);

    async function loadRecords(formTemplateId, dateRange, page = 0, size = 15, sort = '', search = '') {
        loadingQcRecords.value = true;

        const formatDate = (date) => date.toISOString().slice(0, 19).replace("T", " ");
        const startDateTime = formatDate(dateRange[0]);
        const endDateTime = formatDate(dateRange[1]);

        try {
            const res = await fetchPaginatedQcRecords(
                formTemplateId, startDateTime, endDateTime, page, size, sort, search
            );

            const {
                content = [],
                totalElements = 0,
                totalPages = 0,
                pageNumber = 0,
                pageSize = size
            } = res.data || {};

            qcRecords.value = await Promise.all(content.map(async (r) => {
                if (r.created_at) {
                    r[translate('FormDataSummary.detailDialog.submittedAt')] = new Date(r.created_at).toLocaleString("zh-CN", {
                        year: "numeric", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                        hour12: false
                    }).replace(/\//g, "-");
                    delete r.created_at;
                }

                // Add submitter name
                if (r.created_by) {
                    try {
                        const submitterName = await getUserById(r.created_by).then(res => res.data?.data?.name || "-");
                        r[translate('FormDataSummary.detailDialog.submitter')] = submitterName;
                    } catch (err) {
                        console.error("Error fetching submitter name:", err);
                        r[translate('FormDataSummary.detailDialog.submitter')] = "-";
                    }
                }

                return r;
            }));

            // Column headers render
            if (content.length > 0) {
                const submittedAtKey = translate('FormDataSummary.detailDialog.submittedAt');
                const submitterKey = translate('FormDataSummary.detailDialog.submitter');
                const headers = Object.keys(qcRecords.value[0])
                    .filter(h => h !== "_id" && h !== "created_by" && h !== submitterKey)
                    .map(h => h === "created_at" ? submittedAtKey : h);
                headers.push("_id");
                reorderedColumnHeaders.value = headers;
            }

            recordsTotal.value = totalElements;
            recordsTotalPages.value = totalPages;
            // DON'T overwrite currentBackendPage - it should stay as requested
            // currentBackendPage.value = pageNumber; // This was causing the page reset!
            backendPageSize.value = pageSize;

        } catch (err) {
            console.error("Error loading paginated records:", err);
        } finally {
            loadingQcRecords.value = false;
        }
    }
    async function loadVersionGroupRecords(formTemplateId, versionGroupId) {
        loadingQcRecords.value = true;

        try {
            const response = await fetchQcVersionsByGroupId(formTemplateId, versionGroupId);
            const versionedRecords = response.data || [];

            // Format date and labels like main records
            return await Promise.all(versionedRecords.map(async (r) => {
                if (r.created_at) {
                    r[translate('FormDataSummary.detailDialog.submittedAt')] = new Date(r.created_at).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                    }).replace(/\//g, "-");
                    delete r.created_at;
                }

                // Add submitter name
                if (r.created_by) {
                    try {
                        const submitterName = await getUserById(r.created_by).then(res => res.data?.data?.name || "-");
                        r[translate('FormDataSummary.detailDialog.submitter')] = submitterName;
                    } catch (err) {
                        console.error("Error fetching submitter name:", err);
                        r[translate('FormDataSummary.detailDialog.submitter')] = "-";
                    }
                }

                return r;
            }));
        } catch (err) {
            console.error("Fetch version group records error:", err);
            return [];
        } finally {
            loadingQcRecords.value = false;
        }
    }

    const openDialog = async (formTemplateId, dateRange) => {
        qcRecordsDialogVisible.value = true;
        await nextTick();

        const observer = new MutationObserver((mutations, obs) => {
            const groupHeaders = document.querySelectorAll(".group-header .cell");
            if (groupHeaders.length > 0) {
                groupHeaders.forEach((header) => {
                    header.style.fontWeight = "bold";
                    header.style.fontSize = "16px";
                    header.style.color = "#606266";
                });
                obs.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        await loadRecords(formTemplateId, dateRange);
    };

    const fetchRecordsData = async (
        formTemplateId,
        dateRange,
        page = currentBackendPage.value,
        size = backendPageSize.value,
        sort = sortSpec.value,
        searchText = search.value
    ) => {
        await loadRecords(formTemplateId, dateRange, page, size, sort, searchText);
        return qcRecords.value;
    };

    return {
        qcRecordsDialogVisible,
        loadingQcRecords,
        qcRecords,
        reorderedColumnHeaders,
        openDialog,
        fetchRecordsData,
        loadVersionGroupRecords,
        recordsTotal,
        recordsTotalPages,
        currentBackendPage,
        backendPageSize,
        sortSpec,
        search
    };
}
