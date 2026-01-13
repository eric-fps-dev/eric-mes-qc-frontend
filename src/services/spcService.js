import api from "./api";

const BASE_URL = "/spc";

/** Pad helper */
const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Date -> "YYYY-MM-DDTHH:mm:ss±HH:MM" (local offset)
 * e.g. 2026-01-01T00:00:00-08:00
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

    const offsetMin = date.getTimezoneOffset(); // minutes behind UTC
    const sign = offsetMin <= 0 ? "+" : "-";
    const abs = Math.abs(offsetMin);
    const offH = pad2(Math.floor(abs / 60));
    const offM = pad2(abs % 60);

    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${sign}${offH}:${offM}`;
};

/**
 * "YYYY-MM-DD HH:mm:ss" (local) -> ISO with offset
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
 * GET /spc?formTemplateId=...&startDateTime=...&endDateTime=...
 */
export const fetchSpcSeries = ({
                                   formTemplateId,
                                   startDateTime,
                                   endDateTime,
                                   fields,
                               } = {}) => {
    if (formTemplateId == null) throw new Error("fetchSpcSeries requires formTemplateId");
    if (!startDateTime || !endDateTime) throw new Error("fetchSpcSeries requires startDateTime and endDateTime");

    const normalize = (v) => {
        if (v instanceof Date) return toIsoWithOffset(v);
        if (typeof v === "string") {
            if (v.includes("T")) return v; // already ISO
            return localDateTimeStringToIsoWithOffset(v); // "YYYY-MM-DD HH:mm:ss"
        }
        throw new Error("startDateTime/endDateTime must be a Date or string");
    };

    return api.get(BASE_URL, {
        params: {
            formTemplateId,
            startDateTime: normalize(startDateTime),
            endDateTime: normalize(endDateTime),
            ...(fields ? { fields } : {}),
        },
        headers: { "Content-Type": "application/json" },
    });
};
