// utils/BulkExportUtil.js
import { parseFormDocument } from '@/utils/formUtils';
import { getUserById } from '@/services/userService';
import JSZip from 'jszip';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import callAddFont from "@/assets/simfang.js"; // ✅ Regular Simfang font
import callAddBoldFont from "@/assets/simfang-bold.js";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {useAlertHighlight} from '@/composables/useAlertHighlight'
const { getAlertTooltip, getAlertTextColor, getStyledValueWithIcon } = useAlertHighlight(true);

// Helper functions for detecting image/file URLs
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif', 'heic', 'heif']

function isUrl(str) {
    if (typeof str !== 'string') return false
    return str.startsWith('http://') || str.startsWith('https://') || str.includes('/files/')
}

function isImageUrl(url) {
    if (!isUrl(url)) return false
    const lowerUrl = url.toLowerCase()
    return imageExtensions.some(ext => lowerUrl.includes(`.${ext}`))
}

function isFileUrlArray(value) {
    if (!Array.isArray(value) || value.length === 0) return false
    return value.every(item => isUrl(item))
}

function isImageUrlArray(value) {
    if (!isFileUrlArray(value)) return false
    return value.some(item => isImageUrl(item))
}

export function generateSingleRecordPdf({ formLabel, groupedDetails, basicInfo, systemInfo, eSignature, translate }) {
    const doc = new jsPDF();
    const excludedKeys = ['e-signature', 'exceeded_info', 'approval_info', 'version_group_id', 'version'];
    callAddFont.call(doc);
    callAddBoldFont.call(doc);
    doc.setFont("simfang", "bold");

    let y = 10;
    const title = `${formLabel}${translate('Export.titleSuffix')}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;
    doc.setFontSize(16);
    doc.text(title, x, y);
    y += 10;

    Object.entries(groupedDetails).forEach(([category, fields]) => {
        if (category === 'exceeded_info') return;

        const tableData = Object.entries(fields)
            .filter(([key, val]) =>
                !excludedKeys.includes(key) && val !== undefined && val !== null && val !== "" &&
                !isFileUrlArray(val) // Skip image/file URL arrays in PDF export
            )
            .map(([key, value]) => {
                const styledVal = getStyledValueWithIcon(value, groupedDetails.exceeded_info?.[key]);
                const passedRange = groupedDetails.exceeded_info?.[key]
                    ? getAlertTooltip(groupedDetails, key, { removePrefix: true })
                    : "-";
                return [key, styledVal, passedRange];
            });

        if (tableData.length === 0) return;

        const sectionTitle = category === 'uncategorized'
            ? translate('FormDataSummary.recordTable.groupUncategorized')
            : category;

        doc.setFontSize(14);
        doc.text(sectionTitle, 10, y);
        y += 6;

        autoTable(doc, {
            startY: y,
            head: [translate('Export.tableHeadValidRange')],
            body: tableData,
            theme: "grid",
            styles: { font: "simfang", fontSize: 10 },
            headStyles: { font: "simfang", fontStyle: 'bold', fontSize: 12, fillColor: [0, 133, 164] },
            didParseCell: function (data) {
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

    doc.setFontSize(14);
    doc.text(translate('BulkExport.basicInfoTitle'), 10, y);
    y += 6;

    autoTable(doc, {
        startY: y,
        head: [translate('Export.tableHead')],
        body: [
            [translate('BulkExport.fieldNames.relatedProducts'),
                basicInfo[translate('BulkExport.fieldNames.relatedProducts')] || basicInfo.relatedProducts || basicInfo.涉及产品 || translate('Export.fallback')],
            [translate('BulkExport.fieldNames.relatedBatches'),
                basicInfo[translate('BulkExport.fieldNames.relatedBatches')] || basicInfo.relatedBatches || basicInfo.涉及批次 || translate('Export.fallback')],
            [translate('BulkExport.fieldNames.qcPersonnel'),
                basicInfo[translate('BulkExport.fieldNames.qcPersonnel')] || basicInfo.qcPersonnel || basicInfo.质检人员 || translate('Export.fallback')],
            [translate('BulkExport.fieldNames.belongingShift'),
                basicInfo[translate('BulkExport.fieldNames.belongingShift')] || basicInfo.belongingShift || basicInfo.所属班次 || translate('Export.fallback')],
            [translate('BulkExport.fieldNames.belongingTeam'),
                basicInfo[translate('BulkExport.fieldNames.belongingTeam')] || basicInfo.belongingTeam || basicInfo.所属班组 || translate('Export.fallback')]
        ],
        theme: "grid",
        styles: { font: "simfang", fontSize: 10 },
        headStyles: { font: "simfang", fontStyle: 'bold', fontSize: 12, fillColor: [0, 133, 164] },
    });

    y = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text(translate('Export.groupTitle'), 10, y);
    y += 6;

    autoTable(doc, {
        startY: y,
        head: [translate('Export.tableHead')],
        body: [
            [translate('Export.systemInfo.submitter'),
                systemInfo[translate('BulkExport.fieldNames.submitter')] || systemInfo.submitter || systemInfo.提交人 || translate('Export.fallback')],
            [translate('Export.systemInfo.submittedAt'),
                systemInfo[translate('BulkExport.fieldNames.submissionTime')] || systemInfo.submissionTime || systemInfo.提交时间 || translate('Export.fallback')],
            [translate('Export.systemInfo.submissionId'),
                systemInfo[translate('BulkExport.fieldNames.submissionId')] || systemInfo.submissionId || systemInfo.提交单号 || translate('Export.fallback')]
        ],
        theme: "grid",
        styles: { font: "simfang", fontSize: 10 },
        headStyles: { font: "simfang", fontStyle: 'bold', fontSize: 12, fillColor: [0, 133, 164] },
    });

    y = doc.lastAutoTable.finalY + 10;

    if (eSignature) {
        const imgWidth = 150;
        const imgHeight = 30; // height could be adjusted
        const pageHeight = doc.internal.pageSize.getHeight();

        if (y + imgHeight + 20 > pageHeight) {
            doc.addPage();
            y = 10;
        }

        doc.setFontSize(14);
        doc.text(translate('Export.signatureTitle'), 10, y);
        y += 10;

        doc.addImage(eSignature, 'PNG', 10, y, imgWidth, imgHeight);
        y += imgHeight + 10;
    }

    return doc;
}

export async function exportDocumentsToZip(documents, translate, onProgress) {
    const zip = new JSZip();

    for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        onProgress(i + 1, documents.length);
        await new Promise(resolve => setTimeout(resolve, 0));
        try {
            const submissionId = doc._id;
            const createdAt = new Date(doc.created_at);
            const formattedTime = createdAt.toLocaleString("zh-CN", {
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
                hour12: false
            });
            // Resolve submitter name
            const submitterName = await getUserById(doc.created_by).then(res => res.data?.data?.name || "-").catch(() => "-");

            const systemInfo = {
                // Use both static property names and translated keys for compatibility
                submissionId: submissionId,
                submissionTime: formattedTime,
                submitter: submitterName,
                [translate('BulkExport.fieldNames.submissionId')]: submissionId,
                [translate('BulkExport.fieldNames.submissionTime')]: formattedTime,
                [translate('BulkExport.fieldNames.submitter')]: submitterName
            };

            const uncategorized = doc.uncategorized || {};
            const basicInfo = {
                // Use both static property names and translated keys for compatibility
                relatedProducts: uncategorized.related_products || '-',
                relatedBatches: uncategorized.related_batches || '-',
                qcPersonnel: uncategorized.related_inspectors || '-',
                belongingShift: uncategorized.related_shifts || '-',
                belongingTeam: uncategorized.related_teams || '-',
                [translate('BulkExport.fieldNames.relatedProducts')]: uncategorized.related_products || '-',
                [translate('BulkExport.fieldNames.relatedBatches')]: uncategorized.related_batches || '-',
                [translate('BulkExport.fieldNames.qcPersonnel')]: uncategorized.related_inspectors || '-',
                [translate('BulkExport.fieldNames.belongingShift')]: uncategorized.related_shifts || '-',
                [translate('BulkExport.fieldNames.belongingTeam')]: uncategorized.related_teams || '-'
            };

            const cleanedUncategorized = { ...uncategorized };
            for (const key of Object.keys(cleanedUncategorized)) {
                if (key.startsWith("related_") || key.startsWith("qc_form_template") || key === "approver_updated_at") {
                    delete cleanedUncategorized[key];
                }
            }

            const { groupedDetails, eSignature } = parseFormDocument({
                ...doc,
                submissionId: doc._id
            });

            if (groupedDetails.uncategorized) {
                groupedDetails.uncategorized = {
                    ...cleanedUncategorized
                };
            }

            let inspectorStr = Array.isArray(doc.uncategorized.related_inspectors)
                ? doc.uncategorized.related_inspectors.join('_')
                : String(doc.uncategorized.related_inspectors || '');
            const safeTemplateName = (doc.uncategorized.qc_form_template_name || translate('BulkExport.fileNames.unknown')).trim().replace(/[\\/:*?"<>|]/g, '_');
            const safeInspectorStr = inspectorStr.trim().replace(/[\\/:*?"<>|]/g, '_');
            const docName = `${safeTemplateName}_${safeInspectorStr}_${formatDate(doc.created_at)}.pdf`;

            const pdf = generateSingleRecordPdf({
                formLabel: doc.uncategorized.qc_form_template_name || translate('BulkExport.fileNames.unknown'),
                groupedDetails,
                basicInfo,
                systemInfo,
                eSignature,
                translate
            });

            const pdfBlob = pdf.output('blob');
            zip.file(docName, pdfBlob);
        } catch (err) {
            console.error(`${translate('BulkExport.messages.exportDocFailed')}${doc._id}`, err);
        }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, translate('BulkExport.fileNames.pdfZip'));
}

// utils/BulkExportUtil.js 下方添加
export async function exportDocumentsToExcelZip(documents, translate, onProgress) {
    const zip = new JSZip();

    console.log(`🚀 Starting Excel export for ${documents.length} documents`);

    for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        console.log(`📄 Processing document ${i + 1}/${documents.length}: ${doc._id}`);

        onProgress(i + 1, documents.length);
        await new Promise(resolve => setTimeout(resolve, 0));

        const { groupedDetails } = parseFormDocument({
            ...doc,
            submissionId: doc._id
        });

        const createdAt = new Date(doc.created_at);
        const formattedTime = createdAt.toLocaleString("zh-CN", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
            hour12: false
        });

        // Resolve submitter name for Excel export
        const submitterName = await getUserById(doc.created_by).then(res => res.data?.data?.name || "-").catch(() => "-");

        const systemInfo = {
            // Use both static property names and translated keys for compatibility
            submissionId: doc._id,
            submissionTime: formattedTime,
            submitter: submitterName,
            [translate('BulkExport.fieldNames.submissionId')]: doc._id,
            [translate('BulkExport.fieldNames.submissionTime')]: formattedTime,
            [translate('BulkExport.fieldNames.submitter')]: submitterName
        };

        const uncategorized = doc.uncategorized || {};
        const basicInfo = {
            // Use both static property names and translated keys for compatibility
            relatedProducts: uncategorized.related_products || '-',
            relatedBatches: uncategorized.related_batches || '-',
            qcPersonnel: uncategorized.related_inspectors || '-',
            belongingShift: uncategorized.related_shifts || '-',
            belongingTeam: uncategorized.related_teams || '-',
            [translate('BulkExport.fieldNames.relatedProducts')]: uncategorized.related_products || '-',
            [translate('BulkExport.fieldNames.relatedBatches')]: uncategorized.related_batches || '-',
            [translate('BulkExport.fieldNames.qcPersonnel')]: uncategorized.related_inspectors || '-',
            [translate('BulkExport.fieldNames.belongingShift')]: uncategorized.related_shifts || '-',
            [translate('BulkExport.fieldNames.belongingTeam')]: uncategorized.related_teams || '-'
        };

        try {
            // Create flat row structure for Excel export
            const flatRow = {};

            console.log(`🔍 Processing Excel export for doc ${doc._id}`);
            console.log('📊 GroupedDetails:', groupedDetails);
            console.log('📋 BasicInfo:', basicInfo);
            console.log('🔧 SystemInfo:', systemInfo);

            // Add QC form fields from groupedDetails
            Object.entries(groupedDetails).forEach(([category, fields]) => {
                if (typeof fields !== 'object' || fields === null) return;

                Object.entries(fields).forEach(([key, value]) => {
                    if (
                        key === 'e-signature' ||
                        key === 'approval_info' ||
                        key.startsWith('related_') ||
                        key.startsWith('qc_form_template') ||
                        key === 'version_group_id' ||
                        key === 'version' ||
                        key === 'exceeded_info'
                    ) return;

                    // Replace image/file URLs with placeholder text
                    let processedValue;
                    if (isImageUrlArray(value)) {
                        processedValue = translate('Export.seeImagesInApp') || '(See images in application)';
                    } else if (isFileUrlArray(value)) {
                        processedValue = translate('Export.seeFilesInApp') || '(See files in application)';
                    } else if (value === null || value === undefined || value === '') {
                        processedValue = '-';
                    } else {
                        processedValue = Array.isArray(value) ? value.join(', ') : String(value);
                    }
                    flatRow[key] = processedValue;
                });
            });

            // Basic Info - only add translated headers to avoid duplicates
            try {
                const relatedProductsKey = translate('FormDataSummary.detailDialog.relatedProducts') || 'Related Products';
                const relatedBatchesKey = translate('FormDataSummary.detailDialog.relatedBatches') || 'Related Batches';
                const qcPersonnelKey = translate('FormDataSummary.detailDialog.qcPersonnel') || 'QC Personnel';
                const belongingShiftKey = translate('FormDataSummary.detailDialog.belongingShift') || 'Belonging Shift';
                const belongingTeamKey = translate('FormDataSummary.detailDialog.belongingTeam') || 'Belonging Team';

                flatRow[relatedProductsKey] = basicInfo.relatedProducts || basicInfo[translate('BulkExport.fieldNames.relatedProducts')] || '-';
                flatRow[relatedBatchesKey] = basicInfo.relatedBatches || basicInfo[translate('BulkExport.fieldNames.relatedBatches')] || '-';
                flatRow[qcPersonnelKey] = basicInfo.qcPersonnel || basicInfo[translate('BulkExport.fieldNames.qcPersonnel')] || '-';
                flatRow[belongingShiftKey] = basicInfo.belongingShift || basicInfo[translate('BulkExport.fieldNames.belongingShift')] || '-';
                flatRow[belongingTeamKey] = basicInfo.belongingTeam || basicInfo[translate('BulkExport.fieldNames.belongingTeam')] || '-';

                console.log('📋 Basic Info keys added:', [relatedProductsKey, relatedBatchesKey, qcPersonnelKey, belongingShiftKey, belongingTeamKey]);
            } catch (err) {
                console.error('❌ Error adding basic info:', err);
                // Fallback to English headers
                flatRow['Related Products'] = basicInfo.relatedProducts || '-';
                flatRow['Related Batches'] = basicInfo.relatedBatches || '-';
                flatRow['QC Personnel'] = basicInfo.qcPersonnel || '-';
                flatRow['Belonging Shift'] = basicInfo.belongingShift || '-';
                flatRow['Belonging Team'] = basicInfo.belongingTeam || '-';
            }

            // System Info - only add translated headers to avoid duplicates
            try {
                const submissionIdKey = translate('Export.systemInfo.submissionId') || 'Submission ID';
                const submittedAtKey = translate('Export.systemInfo.submittedAt') || 'Submission Time';
                const submitterKey = translate('Export.systemInfo.submitter') || 'Submitter';

                flatRow[submissionIdKey] = systemInfo.submissionId || systemInfo[translate('BulkExport.fieldNames.submissionId')] || '-';
                flatRow[submittedAtKey] = systemInfo.submissionTime || systemInfo[translate('BulkExport.fieldNames.submissionTime')] || formattedTime || "-";
                flatRow[submitterKey] = systemInfo.submitter || systemInfo[translate('BulkExport.fieldNames.submitter')] || submitterName || "-";

                console.log('🔧 System Info keys added:', [submissionIdKey, submittedAtKey, submitterKey]);
            } catch (err) {
                console.error('❌ Error adding system info:', err);
                // Fallback to English headers
                flatRow['Submission ID'] = systemInfo.submissionId || '-';
                flatRow['Submission Time'] = systemInfo.submissionTime || formattedTime || "-";
                flatRow['Submitter'] = systemInfo.submitter || submitterName || "-";
            }

            console.log('📝 FlatRow keys:', Object.keys(flatRow));
            console.log('📝 FlatRow data:', flatRow);

            // Validate that we have data to export
            if (Object.keys(flatRow).length === 0) {
                console.warn(`⚠️ No data to export for doc ${doc._id}`);
                return; // Skip this document
            }

            const tableData = [flatRow];
            const headers = Object.keys(flatRow);

            console.log('📊 Creating Excel worksheet with headers:', headers);

            const worksheet = XLSX.utils.json_to_sheet(tableData, { header: headers, skipHeader: false });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "QC Records");

            const safeTemplateName = (doc.uncategorized?.qc_form_template_name || translate('BulkExport.fileNames.unknown')).trim().replace(/[\\/:*?"<>|]/g, '_');
            const inspectorStr = Array.isArray(doc.uncategorized?.related_inspectors)
                ? doc.uncategorized.related_inspectors.join('_')
                : String(doc.uncategorized?.related_inspectors || '');
            const safeInspectorStr = inspectorStr.trim().replace(/[\\/:*?"<>|]/g, '_');

            const fileName = `${safeTemplateName}_${safeInspectorStr}_${formatDate(doc.created_at)}.xlsx`;
            console.log('📁 Creating Excel file:', fileName);

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            zip.file(fileName, excelBuffer);

            console.log(`✅ Successfully added Excel file for doc ${doc._id}`);
        } catch (err) {
            console.error(`${translate('BulkExport.messages.exportExcelFailed')}${doc._id}`, err);
            console.error('📊 Error details:', {
                docId: doc._id,
                error: err.message,
                stack: err.stack
            });
        }
    }

    console.log('📦 Generating ZIP file...');
    const zipFiles = Object.keys(zip.files);
    console.log(`📁 ZIP contains ${zipFiles.length} files:`, zipFiles);

    if (zipFiles.length === 0) {
        console.error('❌ No files were added to the ZIP!');
        throw new Error('No Excel files were generated');
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    console.log(`✅ ZIP file generated successfully: ${translate('BulkExport.fileNames.excelZip')}`);
    saveAs(zipBlob, translate('BulkExport.fileNames.excelZip'));
}


function formatDate(isoStr, translate = null) {
    try {
        const date = new Date(isoStr);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const s = String(date.getSeconds()).padStart(2, '0');
        return `${y}${m}${d}_${h}${min}${s}`;
    } catch {
        return translate ? translate('BulkExport.fileNames.invalidDate') : 'invalid_date';
    }
}
