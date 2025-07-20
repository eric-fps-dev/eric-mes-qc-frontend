// exportUtils.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import callAddFont from "@/assets/simfang.js"; // ✅ Regular Simfang font
import callAddBoldFont from "@/assets/simfang-bold.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {useAlertHighlight} from '@/composables/useAlertHighlight'
const { getAlertTooltip, getAlertTextColor, getStyledValueWithIcon } = useAlertHighlight(true)

// add this helper at the top of the file:
function formatClientTime(isoString) {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString('zh-CN', {
        year:   'numeric',
        month:  '2-digit',
        day:    '2-digit',
        hour:   '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\//g, '-');
}

export async function exportSubmissionLogToPdf({ formLabel, groupedDetails, basicInfo, systemInfo, eSignature, translate }) {
    const doc = new jsPDF();
    const excludedKeys = ['e-signature', 'exceeded_info', 'approval_info', 'version_group_id', 'version'];
    callAddFont.apply(doc);
    callAddBoldFont.apply(doc);
    doc.setFont("simfang", "bold");


    let y = 10;
    const title = `${formLabel}${translate('Export.titleSuffix')}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;
    doc.setFontSize(16);
    doc.text(title, x, y);
    y += 10;

    // groupedDetails
    Object.entries(groupedDetails).forEach(([category, fields]) => {
        if (category === 'exceeded_info') return;

        const tableData = Object.entries(fields)
            .filter(([key, val]) =>
                !excludedKeys.includes(key) && val !== undefined && val !== null && val !== ""
            )
            .map(([key, value]) => {
                const styledVal = getStyledValueWithIcon(value, groupedDetails.exceeded_info?.[key]);
                const passedRange = groupedDetails.exceeded_info?.[key]
                    ? getAlertTooltip(groupedDetails, key, { removePrefix: true })
                    : "-";
                return [key, styledVal, passedRange];
            });

        if (tableData.length === 0) return; // Don't render empty sections

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

    // basicInfo
    doc.setFontSize(14);
    doc.text('质检基础信息', 10, y);
    y += 6;
    autoTable(doc, {
        startY: y,
        head: [translate('Export.tableHead')],
        body: [
            ["涉及产品", basicInfo.涉及产品 || translate('Export.fallback')],
            ["涉及批次", basicInfo.涉及批次 || translate('Export.fallback')],
            ["质检人员", basicInfo.质检人员 || translate('Export.fallback')],
            ["所属班次", basicInfo.所属班次 || translate('Export.fallback')],
            ["所属班组", basicInfo.所属班组 || translate('Export.fallback')]
        ],
        theme: "grid",
        styles: { font: "simfang", fontSize: 10 },
        headStyles: { font: "simfang", fontStyle: 'bold', fontSize: 12, fillColor: [0, 133, 164] },
    });

    y = doc.lastAutoTable.finalY + 10;

    // systemInfo
    doc.setFontSize(14);
    doc.text(translate('Export.groupTitle'), 10, y);
    y += 6;
    autoTable(doc, {
        startY: y,
        head: [translate('Export.tableHead')],
        body: [
            [translate('Export.systemInfo.submitter'), systemInfo.提交人 || translate('Export.fallback')],
            [translate('Export.systemInfo.submittedAt'), systemInfo.提交时间 || translate('Export.fallback')],
            [translate('Export.systemInfo.submissionId'), systemInfo.提交单号 || translate('Export.fallback')]
        ],
        theme: "grid",
        styles: { font: "simfang", fontSize: 10 },
        headStyles: { font: "simfang", fontStyle: 'bold', fontSize: 12, fillColor: [0, 133, 164] },
    });

    y = doc.lastAutoTable.finalY + 10;

    // signature
    const signatureImg = document.querySelector('img[alt="e-signature"]');
    if (signatureImg) {
        const imgWidth = 150;
        const aspectRatio = signatureImg.naturalWidth / signatureImg.naturalHeight;
        const imgHeight = imgWidth / aspectRatio;
        const pageHeight = doc.internal.pageSize.getHeight();

        if (y + imgHeight + 20 > pageHeight) {
            doc.addPage();
            y = 10;
        }

        doc.setFontSize(14);
        doc.text(translate('Export.signatureTitle'), 10, y);
        y += 10;

        doc.addImage(signatureImg, 'PNG', 10, y, imgWidth, imgHeight);
        y += imgHeight + 10;
    }

    doc.save(`${formLabel}-submission_records.pdf`);
}

export function exportQcRecordsToExcel({ records, label, translate }) {
    const tableData = records.map(record => {
        const {
            created_at,
            created_by,
            提交人,
            _id,
            'e-signature': signature,
            ...rest
        } = record;

        const entries = Object.entries(rest);

        // 普通字段
        const normalFields = entries
            .filter(([key]) =>
                !key.startsWith('related_') &&
                !key.endsWith('_id') &&
                !key.endsWith('_ids') &&
                !key.endsWith('approval_info') &&
                !key.endsWith('version_group_id') &&
                !key.endsWith('version') &&
                !key.endsWith('exceeded_info') &&
                !key.endsWith('approver_updated_at')
            )
            .map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : value]);

        // 关联字段
        const relatedFields = entries
            .filter(([key]) =>
                key.startsWith('related_') &&
                !key.endsWith('_id') &&
                !key.endsWith('_ids')
            )
            .map(([key, value]) => {
                let translated = key;
                if (key === 'related_products')   translated = '涉及产品';
                if (key === 'related_batches')    translated = '涉及批次';
                if (key === 'related_inspectors') translated = '质检人员';
                if (key === 'related_shifts')     translated = '所属班次';
                if (key === 'related_teams')      translated = '所属班组';
                return [translated, value];
            });

        return {
            // use our formatter here:
            [translate('Export.systemInfo.submittedAt')]: formatClientTime(created_at),
            [translate('Export.systemInfo.submitter')]:  提交人 || "-",
            ...Object.fromEntries(normalFields),
            ...Object.fromEntries(relatedFields)
        };
    });

    // build headers:
    const headers = Object.keys(tableData[0] || {});

    const worksheet = XLSX.utils.json_to_sheet(tableData, {
        header: headers,
        skipHeader: false
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, label + translate('Export.titleSuffix'));

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, label + translate('Export.titleSuffix') + ".xlsx");
}
// exportUtils.js

export async function exportChartReportToPdf({
                                                 lineChartWidgets,
                                                 pieChartWidgets,
                                                 lineChartRefs,
                                                 pieChartRefs,
                                                 selectedForm,
                                                 dateRange,
                                                 translate,
                                                 formatDate,
                                                 generateQcReport,
                                                 $message,
                                                 $nextTick
                                             }) {
    if (!lineChartWidgets.length && !pieChartWidgets.length) {
        $message.warning(translate('FormDataSummary.messages.noChartData'));
        return;
    }

    await $nextTick();

    const lineChartImages = lineChartWidgets.map((widget, index) => ({
        name: widget.name,
        image: lineChartRefs[index].getChartImage()
    }));

    const pieChartImages = pieChartWidgets.map((widget, index) => ({
        name: widget.name,
        image: pieChartRefs[index].getChartImage()
    }));

    const reportData = {
        qcFormName: selectedForm.label,
        startDateTime: formatDate(dateRange[0]),
        endDateTime: formatDate(dateRange[1]),
        charts: [
            ...lineChartWidgets.map(widget => ({
                chartImage: lineChartImages.find(img => img.name === widget.name)?.image || "",
                chartType: "line",
                min: Math.min(...widget.chartData),
                max: Math.max(...widget.chartData),
                average: (widget.chartData.reduce((sum, val) => sum + val, 0) / widget.chartData.length).toFixed(2),
                total: widget.chartData.length
            })),
            ...pieChartWidgets.map(widget => {
                const totalValue = widget.chartData.reduce((sum, val) => sum + val.value, 0);
                return {
                    chartImage: pieChartImages.find(img => img.name === widget.name)?.image || "",
                    chartType: "pie",
                    info: widget.chartData.map(item => ({
                        label: item.name,
                        count: item.value,
                        percentage: totalValue === 0 ? "0.00" : ((item.value / totalValue) * 100).toFixed(2)
                    })),
                    total: totalValue
                };
            })
        ]
    };

    try {
        await generateQcReport(reportData);
        $message.success(translate('FormDataSummary.messages.exportSuccess'));
    } catch (err) {
        console.error("❌ 生成 PDF 失败:", err);
        $message.error(translate('FormDataSummary.messages.exportFailed'));
    }
}

