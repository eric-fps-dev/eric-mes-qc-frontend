import { Top, Bottom, WarningFilled } from '@element-plus/icons-vue'
import { translate } from '@/utils/i18n'

export function useAlertHighlight(showAlerts) {
    const getAlertStyle = (row, field) => {
        if (!showAlerts.value) return {}

        const info = row.exceeded_info?.[field]
        if (!info || !info.result) return {}

        const colorMap = {
            high: '#ff1111', // red
            low: '#0584ff',  // blue
            invalid: '#ffbe5a' // orange
        }

        return {
            color: colorMap[info.result] || '',
            fontWeight: 'bold'
        }
    }

    const getAlertIcon = (row, field) => {
        if (!showAlerts.value) return null

        const result = row.exceeded_info?.[field]?.result
        const iconMap = {
            high: Top,
            low: Bottom,
            invalid: WarningFilled
        }
        return iconMap[result] || null
    }

    const getAlertTooltip = (row, field, { removePrefix = false } = {}) => {
        const info = row.exceeded_info?.[field]
        if (!info) return ''
        if (info.type === 'number') {
            const min = info.lowerLimit ?? '-'
            const max = info.upperLimit ?? '-'
            const text = `${translate('common.validRange')}: ${min} ~ ${max}`
            return removePrefix ? `${min} ~ ${max}` : text
        } else if (info.type === 'options' && Array.isArray(info.validOptionLabels)) {
            const text = `${translate('common.validOptions')}: ${info.validOptionLabels.join(', ')}`
            return removePrefix ? info.validOptionLabels.join(', ') : text
        }
        return ''
    }

    // useAlertHighlight.js
    const getAlertTextColor = (row, field) => {
        const info = row.exceeded_info?.[field];
        if (!info || !info.result) return null;

        const colorMap = {
            high: '#bd0000',     // red
            low: '#004c9c',      // blue
            invalid: '#ca8409'   // orange
        };

        return colorMap[info.result] || null;
    };

    // useAlertHighlight.js

    const getStyledValueWithIcon = (value, exceededInfo) => {
        const valText = Array.isArray(value)
            ? value.join(", ")
            : (value === 0 ? 0 : (value || " - "));
        const result = exceededInfo?.result;

        const iconMap = {
            high: '↑',
            low: '↓',
            invalid: '!'
        };
        const icon = iconMap[result] || '';

        return icon ? `${valText} ${icon}` : valText;
    };

    return {
        getAlertStyle,
        getAlertIcon,
        getAlertTooltip,
        getAlertTextColor,
        getStyledValueWithIcon
    };


}
