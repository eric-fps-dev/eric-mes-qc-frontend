/**
 * Extracts ordered field labels from a form template JSON.
 * Traverses all widgets including nested containers (grid, table, tab)
 * and returns field labels in their defined order.
 *
 * @param {Object} formTemplateJson - The parsed form template JSON
 * @param {Object} options - Optional configuration
 * @param {boolean} options.useLabels - If true, return labels; if false, return field names (default: true)
 * @param {boolean} options.excludeHidden - If true, exclude hidden fields (default: false)
 * @returns {string[]} Ordered array of field labels or names
 */
export function getOrderedHeadersFromTemplate(formTemplateJson, options = {}) {
    const { useLabels = true, excludeHidden = false } = options;
    const orderedHeaders = [];

    if (!formTemplateJson?.widgetList) {
        return orderedHeaders;
    }

    function traverse(widgetList) {
        if (!widgetList) return;

        widgetList.forEach(widget => {
            // Process data-producing widgets
            if (widget.formItemFlag && widget.options?.name) {
                // Skip hidden fields if option is set
                if (excludeHidden && widget.options.hidden) {
                    return;
                }

                const headerValue = useLabels
                    ? (widget.options.label || widget.options.name)
                    : widget.options.name;
                orderedHeaders.push(headerValue);
            }

            // Traverse container widgets
            if (widget.type === 'grid' && widget.cols) {
                widget.cols.forEach(col => traverse(col.widgetList));
            } else if (widget.type === 'table' && widget.rows) {
                widget.rows.forEach(row => {
                    row.cols.forEach(cell => traverse(cell.widgetList));
                });
            } else if (widget.type === 'tab' && widget.tabs) {
                widget.tabs.forEach(tab => traverse(tab.widgetList));
            } else if (widget.type === 'sub-form' && widget.widgetList) {
                traverse(widget.widgetList);
            } else if (widget.category === 'container' && widget.widgetList) {
                // Custom containers
                traverse(widget.widgetList);
            }
        });
    }

    traverse(formTemplateJson.widgetList);
    return orderedHeaders;
}

/**
 * Parses full form document into grouped data and extracts e-signature
 * @param {Object} rawData - Full MongoDB document (response.data)
 * @returns {{ groupedDetails: Object, eSignature: string | null }}
 */
export function parseFormDocument(rawData) {
    const groupedDetails = {};
    let eSignature = null;

    const skipKeys = ["_id", "created_at", "created_by", "submissionId"];

    const safeClone = JSON.parse(JSON.stringify(rawData)); // Deep clone to avoid mutation

    for (const [key, value] of Object.entries(safeClone)) {
        if (skipKeys.includes(key)) continue;

        // Extract e-signature if exists
        if (value && typeof value === "object" && value["e-signature"]) {
            eSignature = value["e-signature"];
            delete value["e-signature"];
        }

        // Group as section (divider)
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            groupedDetails[key] = value;
        } else {
            if (!groupedDetails["uncategorized"]) groupedDetails["uncategorized"] = {};
            groupedDetails["uncategorized"][key] = value;
        }
    }

    return { groupedDetails, eSignature };
}
