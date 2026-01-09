import api from "./api";

const BASE_URL = "/spc";

/**
 * Pad helper
 */
const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Convert a Date -> "YYYY-MM-DDTHH:mm:ss±HH:MM" using the browser's local offset.
 * This matches your curl style: 2026-01-01T00:00:00-08:00
 */
export const toIsoWithOffset = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("toIsoWithOffset expects a valid Date");
    }

    const yyyy = date.getFullYear();
    const mm = pad2(date.getMonth() + 1);
    const dd = pad2(date.getDate());
    const hh = pad2(date.getHours());
    const mi = pad2(date.getMinutes());
    const ss = pad2(date.getSeconds());

    // getTimezoneOffset is minutes behind UTC; Vancouver winter is 480 => "-08:00"
    const offsetMin = date.getTimezoneOffset();
    const sign = offsetMin <= 0 ? "+" : "-";
    const abs = Math.abs(offsetMin);
    const offH = pad2(Math.floor(abs / 60));
    const offM = pad2(abs % 60);

    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${sign}${offH}:${offM}`;
};

/**
 * Parse "YYYY-MM-DD HH:mm:ss" as LOCAL time and return ISO with offset.
 * Use this if your UI stores local datetime strings like qcReportingServices.js does.
 */
export const localDateTimeStringToIsoWithOffset = (localDateTime) => {
    if (!localDateTime || typeof localDateTime !== "string") {
        throw new Error("localDateTimeStringToIsoWithOffset expects a string");
    }

    const [datePart, timePart = "00:00:00"] = localDateTime.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    const d = new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, second || 0);
    return toIsoWithOffset(d);
};

/**
 * Fetch SPC series for a form template within a datetime range.
 *
 * Backend expects:
 * GET /spc?formTemplateId=604&startDateTime=2026-01-01T00:00:00-08:00&endDateTime=2026-01-08T00:00:00-08:00
 *
 * You can pass either:
 * - start/end as Date objects, OR
 * - start/end as "YYYY-MM-DD HH:mm:ss" local strings
 */
export const fetchSpcSeries = ({
                                   formTemplateId,
                                   startDateTime,
                                   endDateTime,
                                   fields, // optional: if your backend supports it later
                               } = {}) => {
    if (formTemplateId === undefined || formTemplateId === null) {
        throw new Error("fetchSpcSeries requires formTemplateId");
    }
    if (!startDateTime || !endDateTime) {
        throw new Error("fetchSpcSeries requires startDateTime and endDateTime");
    }

    const normalize = (v) => {
        if (v instanceof Date) return toIsoWithOffset(v);
        if (typeof v === "string") return localDateTimeStringToIsoWithOffset(v);
        throw new Error("startDateTime/endDateTime must be a Date or 'YYYY-MM-DD HH:mm:ss' string");
    };

    const startIso = normalize(startDateTime);
    const endIso = normalize(endDateTime);

    return api.get(BASE_URL, {
        params: {
            formTemplateId,
            startDateTime: startIso,
            endDateTime: endIso,
            ...(fields ? { fields } : {}),
        },
        headers: { "Content-Type": "application/json" },
    });
};
