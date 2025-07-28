// 📁 src/composables/useApprovalDetailExport.js
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { formatDate } from '@/utils/task-center/dateFormatUtils'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import callAddFont from '@/assets/simfang.js'
import callAddBoldFont from '@/assets/simfang-bold.js'
import { useAlertHighlight } from '@/composables/useAlertHighlight'
import {formatClientTime} from "@/utils/time_utils";
import { translate } from '@/utils/i18n';
const { getAlertTextColor, getStyledValueWithIcon, getAlertTooltip } = useAlertHighlight(true)

const excludedKeys = ['exceeded_info', 'approval_info', 'version_group_id', 'version', 'approver_updated_at']; // set the excluded key in uncategorized in here

const getRelatedFieldTitleMap = () => ({
    related_products: translate('common.product'),
    related_batches: translate('common.batch'),
    related_inspectors: translate('common.inspector'),
    related_shifts: translate('common.shift'),
    related_teams: translate('common.team')
})

export function useApprovalDetailExport() {
    const exportApprovalAndRecordsToExcel = async (records, approvalRecords, qcFormTemplateName) => {
        const workbook = XLSX.utils.book_new()
        const relatedFieldTitleMap = getRelatedFieldTitleMap()

        // Sheet 1: QC Records
        const cleanRecords = records.map(record => {
            const clean = { ...record }

            // Extract submission time field with proper translation key
            const submissionTimeKey = translate('FormDataSummary.detailDialog.submittedAt')
            const submissionTime = record[submissionTimeKey]

            // Extract related fields that should be kept (non *_id / *_ids) and translate headers
            const relatedFields = {}
            for (const key of Object.keys(clean)) {
                if (
                    key.startsWith('related_') &&
                    !key.endsWith('_id') &&
                    !key.endsWith('_ids') &&
                    relatedFieldTitleMap[key]
                ) {
                    relatedFields[relatedFieldTitleMap[key]] = clean[key]
                }
            }

            // Remove all related fields and system fields
            for (const key of Object.keys(clean)) {
                if (key.startsWith('related_') || [
                    '_id', 'created_by', 'created_at', 'e-signature',
                    'version', 'approval_info', 'exceeded_info', 'version_group_id', 'approver_updated_at',
                    submissionTimeKey // Remove the submission time key to avoid duplication
                ].includes(key)) {
                    delete clean[key]
                }
            }

            // Construct final object with translated submission time header
            const result = {
                [translate('FormDataSummary.detailDialog.submittedAt')]: submissionTime,
                ...Object.fromEntries(
                    Object.entries(clean).map(([key, value]) => {
                        if (Array.isArray(value)) {
                            return [key, value.join(', ')];
                        }
                        return [key, value];
                    })
                ),
                ...relatedFields
            }
            return result
        })

        // Remove Chinese key and ensure "Submitted At" & "Submitter" are first
        const timeKey = translate('FormDataSummary.detailDialog.submittedAt')
        const submitterKey = translate('FormDataSummary.detailDialog.submitter')
        const orderedRecords = cleanRecords.map(rec => {
            const { '提交人': _, ...rest } = rec
            const { [timeKey]: submittedAt, [submitterKey]: submitter, ...others } = rest
            return { [timeKey]: submittedAt, [submitterKey]: submitter, ...others }
        })
        const sheet1 = XLSX.utils.json_to_sheet(orderedRecords)

        // not working for setting the color, need the sheetjs pro https://docs.sheetjs.com/docs/csf/features/#cell-styles
        const range1 = XLSX.utils.decode_range(sheet1['!ref'])
        for (let C = range1.s.c; C <= range1.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
            if (sheet1[cellAddress]) {
                sheet1[cellAddress].s = { font: { bold: true } }
            }
        }
        XLSX.utils.book_append_sheet(workbook, sheet1, translate('approvalDetail.dialog.sections.qcRecords'))

        // 🧾 2️⃣ Sheet 2: Approval Records
        const sheet2Rows = [
            [
                translate('approvalDetail.table.approver'),
                translate('approvalDetail.table.role'),
                translate('approvalDetail.table.approvalStatus'),
                translate('approvalDetail.table.approvalTime'),
                translate('approvalDetail.table.comments'),
                translate('approvalDetail.table.needRetest')
            ]
        ]

        for (const r of approvalRecords) {
            sheet2Rows.push([
                r.user_name,
                {
                    submitter: translate('approvalDetail.roles.submitter'),
                    leader: translate('approvalDetail.roles.leader'),
                    supervisor: translate('approvalDetail.roles.supervisor')
                }[r.role] || r.role,
                {
                    completed: translate('approvalDetail.status.completed'),
                    pending: translate('approvalDetail.status.pending'),
                    not_started: translate('approvalDetail.status.notStarted')
                }[r.status] || r.status,
                formatDate(r.timestamp),
                r.comments || '',
                r.suggest_retest ? translate('approvalDetail.retest.yes') : translate('approvalDetail.retest.no'),
            ])
        }

        const sheet2 = XLSX.utils.aoa_to_sheet(sheet2Rows)
        XLSX.utils.book_append_sheet(workbook, sheet2, translate('approvalDetail.dialog.sections.approvalRecords'))

        // 📦 导出
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
            cellStyles: true
        })
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
        saveAs(blob, `${qcFormTemplateName}_${translate('approvalDetail.dialog.sections.qcRecords')}_${translate('approvalDetail.dialog.sections.approvalRecords')}.xlsx`)
    }

    const exportApprovalAndRecordsToPdf = async (
        allVersionData, // ✅ array of { groupedDetails, basicInfo, systemInfo }
        approvalRecords,
        qcFormTemplateName
    ) => {
        const doc = new jsPDF();
        callAddFont.apply(doc);
        callAddBoldFont.apply(doc);
        doc.setFont("simfang", "bold");

        let y = 10;
        const now = new Date().toLocaleString('zh-CN', { hour12: false });

        // Title
        const title = `${qcFormTemplateName} - ${translate('approvalDetail.dialog.titleSuffix')}`;
        const pageWidth = doc.internal.pageSize.getWidth();
        const textWidth = doc.getTextWidth(title);
        const x = (pageWidth - textWidth) / 2;
        doc.setFontSize(16);
        doc.text(title, x, y);
        y += 10;

        // 遍历所有版本记录
        for (let i = 0; i < allVersionData.length; i++) {
            const { groupedDetails, basicInfo, systemInfo, approvalInfo } = allVersionData[i];

            const versionTitle = i === 0 ? translate('common.currentVersion') || 'Current Version' : `${translate('common.historicalVersion') || 'Historical Version'} ${i}`;
            doc.setFontSize(14);
            doc.setTextColor(i === 0 ? 180 : 0, i === 0 ? 0 : 90, i === 0 ? 0 : 140); // Current version red, others blue
            doc.text(versionTitle, 10, y);
            doc.setTextColor(0, 0, 0); // Reset to default black
            y += 10;

            // Grouped Details
            Object.entries(groupedDetails).forEach(([category, fields]) => {
                if (category === 'exceeded_info' || category === 'e-signature') return;

                const tableData = Object.entries(fields)
                    .filter(([key, val]) =>
                        !excludedKeys.includes(key) &&
                        val !== undefined &&
                        val !== null &&
                        val !== ''
                    )
                    .map(([key, value]) => {
                        const styledVal = getStyledValueWithIcon(value, groupedDetails.exceeded_info?.[key]);
                        const passedRange = groupedDetails.exceeded_info?.[key]
                            ? getAlertTooltip(groupedDetails, key, { removePrefix: true })
                            : '-';
                        return [key, styledVal, passedRange];
                    });

                if (tableData.length === 0) return;

                const sectionTitle = category === 'uncategorized' ? translate('FormDataSummary.recordTable.groupUncategorized') : category;

                doc.setFontSize(12);
                doc.text(sectionTitle, 10, y);
                y += 6;

                autoTable(doc, {
                    startY: y,
                    head: [[translate('common.item') || 'Item', translate('common.detectionValue') || 'Detection Value', translate('common.standardRange') || 'Standard Range']],
                    body: tableData,
                    theme: 'grid',
                    styles: { font: 'simfang', fontSize: 10 },
                    headStyles: {
                        font: 'simfang',
                        fontStyle: 'bold',
                        fontSize: 12,
                        fillColor: [0, 133, 164],
                        textColor: 255
                    },
                    didParseCell(data) {
                        if (data.section === 'body' && data.column.index === 1) {
                            const key = data.row.raw[0];
                            const color = getAlertTextColor(groupedDetails, key);
                            if (color) {
                                data.cell.styles.textColor = color;
                                data.cell.styles.fontStyle = 'bold';
                            }
                        }
                    }
                });

                y = doc.lastAutoTable.finalY + 10;
            });

            // Basic Info
            doc.setFontSize(13);
            doc.text(translate('FormDataSummary.recordTable.groupBasicInfo'), 10, y);
            y += 6;
            autoTable(doc, {
                startY: y,
                head: [[translate('common.field') || 'Field', translate('common.content') || 'Content']],
                body: [
                    [translate('common.product'), basicInfo.relatedProducts || '-'],
                    [translate('common.batch'), basicInfo.relatedBatches || '-'],
                    [translate('common.inspector'), basicInfo.qcPersonnel || '-'],
                    [translate('common.shift'), basicInfo.belongingShift || '-'],
                    [translate('common.team'), basicInfo.belongingTeam || '-']
                ],
                theme: 'grid',
                styles: { font: 'simfang', fontSize: 10 },
                headStyles: {
                    font: 'simfang',
                    fontStyle: 'bold',
                    fontSize: 12,
                    fillColor: [0, 133, 164],
                    textColor: 255
                }
            });
            y = doc.lastAutoTable.finalY + 10;

            // System Info
            doc.setFontSize(13);
            doc.text(translate('FormDataSummary.recordTable.groupSystemInfo'), 10, y);
            y += 6;
            autoTable(doc, {
                startY: y,
                head: [[translate('common.field') || 'Field', translate('common.content') || 'Content']],
                body: [
                    [translate('FormDataSummary.detailDialog.submittedAt'), systemInfo.submissionTime || '-'],
                    [translate('FormDataSummary.detailDialog.submissionId'), systemInfo.submissionId || '-'],
                    [translate('FormDataSummary.detailDialog.submitter'), systemInfo.submitter || '-']
                ],
                theme: 'grid',
                styles: { font: 'simfang', fontSize: 10 },
                headStyles: {
                    font: 'simfang',
                    fontStyle: 'bold',
                    fontSize: 12,
                    fillColor: [0, 133, 164],
                    textColor: 255
                }
            });

            y = doc.lastAutoTable.finalY + 12;

            // 当前版本 e-signature 签名图像（如果有）
            if (groupedDetails?.['e-signature']) {
                const signatureImage = groupedDetails['e-signature'];
                const imgWidth = 80;
                const imgHeight = 30;

                const pageHeight = doc.internal.pageSize.getHeight();
                if (y + imgHeight + 20 > pageHeight) {
                    doc.addPage();
                    y = 10;
                }

                doc.setFontSize(13);
                doc.text(translate('FormDataSummary.detailDialog.signatureTitle'), 10, y);
                y += 6;
                doc.addImage(signatureImage, 'PNG', 10, y, imgWidth, imgHeight);
                y += imgHeight + 12;
            }

            if (i < allVersionData.length - 1) {
                doc.addPage();
                y = 10;
            }
        }

        // Always new page for approval records fields
        doc.addPage();
        y = 10;
        doc.setFontSize(14);
        doc.text(translate('approvalDetail.dialog.sections.approvalRecords'), 10, y);

        y += 6;
        autoTable(doc, {
            startY: y,
            head: [[
                translate('approvalDetail.table.approver'),
                translate('approvalDetail.table.role'),
                translate('approvalDetail.table.approvalStatus'),
                translate('approvalDetail.table.approvalTime'),
                translate('approvalDetail.table.comments'),
                translate('approvalDetail.table.needRetest')
            ]],
            body: approvalRecords.map(r => [
                r.user_name,
                {
                    submitter: translate('approvalDetail.roles.submitter'),
                    leader: translate('approvalDetail.roles.leader'),
                    supervisor: translate('approvalDetail.roles.supervisor')
                }[r.role] || r.role,
                {
                    completed: translate('approvalDetail.status.completed'),
                    pending: translate('approvalDetail.status.pending'),
                    not_started: translate('approvalDetail.status.notStarted')
                }[r.status] || r.status,
                formatClientTime(r.timestamp),
                r.comments || '',
                r.suggest_retest ? translate('approvalDetail.retest.yes') : translate('approvalDetail.retest.no')
            ]),
            theme: 'grid',
            styles: { font: 'simfang', fontSize: 10 },
            headStyles: {
                font: 'simfang',
                fontStyle: 'bold',
                fontSize: 12,
                fillColor: [0, 133, 164],
                textColor: 255
            }
        });

        // Approval Signature Section:
        const signatureList = allVersionData[0]?.approvalInfo || [];

        if (signatureList.length > 0) {
            y = doc.lastAutoTable.finalY + 10;

            doc.setFontSize(14);
            doc.text(translate('common.signatureConfirmation') || 'Signature Confirmation', 10, y);
            y += 8;

            const pageHeight = doc.internal.pageSize.getHeight();

            // Map known hardcoded labels to translated ones
            // TODO: modify this with refactoring of approval process
            const labelMap = {
                'QC Worker': translate('userManagement.role.qcWorker'),
                '填报员': translate('userManagement.role.qcWorker'),
                'Leader Sign': translate('approvalDetail.steps.leaderSign'),
                '班长签字': translate('approvalDetail.steps.leaderSign'),
                'Supervisor Sign': translate('approvalDetail.steps.supervisorSign'),
                '主管签字': translate('approvalDetail.steps.supervisorSign')
            };

            for (const item of signatureList) {
                if (!item['e-signature']) continue;

                const rawLabel = item.label || '-';
                const label = labelMap[rawLabel] || rawLabel;
                const imageData = item['e-signature'];

                const imgWidth = 50;
                const imgHeight = 20;

                if (y + imgHeight + 20 > pageHeight) {
                    doc.addPage();
                    y = 10;
                }

                doc.setFontSize(11);
                doc.text(`${label}:`, 10, y + 5);
                doc.addImage(imageData, 'PNG', 40, y, imgWidth, imgHeight);

                y += imgHeight + 12;
            }        }

        // download
        doc.save(`${qcFormTemplateName}_${translate('approvalDetail.dialog.titleSuffix')}.pdf`);
    };

    return {
        exportApprovalAndRecordsToExcel,
        exportApprovalAndRecordsToPdf
    }
}
