// 📁 src/composables/useApprovalExport.js
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { formatDate } from '@/utils/task-center/dateFormatUtils'
import { APPROVAL_STATE_LABELS } from '@/utils/constants/approvalStates'
import { FLOW_TYPE_LABELS } from '@/utils/constants/flowTypes'
import { translate } from '@/utils/i18n'

export function useApprovalExport() {
    // Excel export function
    const exportToExcel = (assignments) => {
        const data = assignments.map(item => ({
            [translate('approvalInfo.table.id')]: item.id,
            [translate('approvalInfo.table.templateName')]: item.qc_form_template_name,
            [translate('approvalInfo.table.approvalFlow')]: (typeof FLOW_TYPE_LABELS[item.approval_type] === 'function' ? FLOW_TYPE_LABELS[item.approval_type]() : FLOW_TYPE_LABELS[item.approval_type]) || item.approval_type,
            [translate('approvalInfo.table.currentState')]: (typeof APPROVAL_STATE_LABELS[item.state] === 'function' ? APPROVAL_STATE_LABELS[item.state]() : APPROVAL_STATE_LABELS[item.state]) || item.state,
            [translate('approvalInfo.table.createdTime')]: formatDate(item.created_at),
        }))

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, translate('approvalInfo.pageTitle'))

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
        saveAs(blob, translate('approvalInfo.pageTitle') + '.xlsx')
    }

    // PDF export function
    const exportToPDF = (assignments) => {
        const pdf = new jsPDF()
        const tableData = assignments.map(item => [
            item.id,
            item.qc_form_template_name,
            (typeof FLOW_TYPE_LABELS[item.approval_type] === 'function' ? FLOW_TYPE_LABELS[item.approval_type]() : FLOW_TYPE_LABELS[item.approval_type]) || item.approval_type,
            (typeof APPROVAL_STATE_LABELS[item.state] === 'function' ? APPROVAL_STATE_LABELS[item.state]() : APPROVAL_STATE_LABELS[item.state]) || item.state,
            formatDate(item.created_at)
        ])

        autoTable(pdf, {
            head: [[
                translate('approvalInfo.table.id'),
                translate('approvalInfo.table.templateName'),
                translate('approvalInfo.table.approvalFlow'),
                translate('approvalInfo.table.currentState'),
                translate('approvalInfo.table.createdTime')
            ]],
            body: tableData
        })

        pdf.save(translate('approvalInfo.pageTitle') + '.pdf')
    }

    return {
        exportToExcel,
        exportToPDF
    }
}
