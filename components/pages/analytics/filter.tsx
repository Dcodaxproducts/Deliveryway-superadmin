"use client";

import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportCustomersReport,
  exportMenuReport,
  exportOrdersReport,
  CsvExportResponse,
} from "@/services/reports";

type DateRangeValue =
  | "all-time"
  | "last-7"
  | "last-30"
  | "this-month"
  | "last-month"
  | "individual";

type ExportType = "orders" | "customers" | "menu";
type ExportFormat = "csv" | "pdf";

type CsvRecord = Record<string, string>;

type PdfColumn = {
  header: string;
  keys: string[];
  width?: number;
  align?: "left" | "center" | "right";
  formatter?: (value: string, row: CsvRecord) => string;
};

interface AnalyticsFilterProps {
  dateRange: DateRangeValue;
  onDateRangeChange: (value: DateRangeValue) => void;

  customFromDate?: string;
  onCustomFromDateChange?: (value: string) => void;

  customToDate?: string;
  onCustomToDateChange?: (value: string) => void;

  exportType: ExportType;
  onExportTypeChange: (value: ExportType) => void;

  exportParams?: {
    fromDate?: string;
    toDate?: string;
  };
}

const REPORT_LABELS: Record<ExportType, string> = {
  orders: "Orders Report",
  customers: "Customers Report",
  menu: "Menu Report",
};

const REPORT_FILE_NAMES: Record<ExportType, string> = {
  orders: "orders-report",
  customers: "customers-report",
  menu: "menu-report",
};

const PDF_COLUMNS: Record<ExportType, PdfColumn[]> = {
  orders: [
    {
      header: "Order ID",
      keys: ["orderId"],
      width: 92,
      formatter: (value) => compactId(value),
    },
    {
      header: "Restaurant / Branch",
      keys: ["restaurantName", "branchName"],
      width: 104,
      formatter: (_value, row) =>
        [getRecordValue(row, ["restaurantName"]), getRecordValue(row, ["branchName"])]
          .filter(Boolean)
          .join(" / ") || "-",
    },
    {
      header: "Customer",
      keys: ["customerName", "customerEmail"],
      width: 92,
      formatter: (_value, row) =>
        getRecordValue(row, ["customerName"]) ||
        getRecordValue(row, ["customerEmail"]) ||
        "-",
    },
    {
      header: "Type",
      keys: ["orderType"],
      width: 52,
      align: "center",
      formatter: (value) => prettyLabel(value),
    },
    {
      header: "Status",
      keys: ["status"],
      width: 68,
      formatter: (value) => prettyLabel(value),
    },
    {
      header: "Payment",
      keys: ["paymentStatus", "paymentMethod"],
      width: 74,
      formatter: (_value, row) =>
        [
          prettyLabel(getRecordValue(row, ["paymentStatus"])),
          getRecordValue(row, ["paymentMethod"]),
        ]
          .filter(Boolean)
          .join(" / ") || "-",
    },
    {
      header: "Items",
      keys: ["itemsCount"],
      width: 34,
      align: "center",
    },
    {
      header: "Total",
      keys: ["totalAmount"],
      width: 58,
      align: "right",
      formatter: (value) => formatAmount(value),
    },
    {
      header: "Created",
      keys: ["createdAt"],
      width: 72,
      formatter: (value) => formatPdfDate(value),
    },
  ],

  customers: [
    {
      header: "Customer ID",
      keys: ["customerId"],
      width: 90,
      formatter: (value) => compactId(value),
    },
    {
      header: "Customer",
      keys: ["firstName", "lastName"],
      width: 100,
      formatter: (_value, row) =>
        [getRecordValue(row, ["firstName"]), getRecordValue(row, ["lastName"])]
          .filter(Boolean)
          .join(" ") || "-",
    },
    {
      header: "Email",
      keys: ["email"],
      width: 132,
    },
    {
      header: "Phone",
      keys: ["phone"],
      width: 78,
    },
    {
      header: "Restaurant",
      keys: ["restaurantName"],
      width: 94,
    },
    {
      header: "Active",
      keys: ["isActive"],
      width: 46,
      align: "center",
      formatter: (value) => formatBoolean(value),
    },
    {
      header: "Verified",
      keys: ["isVerified"],
      width: 54,
      align: "center",
      formatter: (value) => formatBoolean(value),
    },
    {
      header: "Orders",
      keys: ["totalOrders"],
      width: 48,
      align: "center",
    },
    {
      header: "Created",
      keys: ["createdAt"],
      width: 72,
      formatter: (value) => formatPdfDate(value),
    },
  ],

  menu: [
    {
      header: "Item ID",
      keys: ["itemId"],
      width: 90,
      formatter: (value) => compactId(value),
    },
    {
      header: "Item Name",
      keys: ["itemName"],
      width: 126,
    },
    {
      header: "Category",
      keys: ["categoryName"],
      width: 94,
    },
    {
      header: "Menu",
      keys: ["menuNames"],
      width: 90,
    },
    {
      header: "Pricing",
      keys: ["pricingMode"],
      width: 58,
      align: "center",
    },
    {
      header: "Base Price",
      keys: ["basePrice"],
      width: 62,
      align: "right",
      formatter: (value) => formatAmount(value),
    },
    {
      header: "Variations",
      keys: ["variationsCount"],
      width: 54,
      align: "center",
    },
    {
      header: "Modifiers",
      keys: ["modifierGroupsCount"],
      width: 54,
      align: "center",
    },
    {
      header: "Active",
      keys: ["isActive"],
      width: 48,
      align: "center",
      formatter: (value) => formatBoolean(value),
    },
    {
      header: "Created",
      keys: ["createdAt"],
      width: 72,
      formatter: (value) => formatPdfDate(value),
    },
  ],
};

const parseCsvContent = (content: string) => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentCell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);

      if (currentRow.some((cell) => cell.trim() !== "")) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);

    if (currentRow.some((cell) => cell.trim() !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
};

const downloadBlobFile = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

const downloadCsv = (response: CsvExportResponse, exportType: ExportType) => {
  const content = response?.data?.content || "";
  const mimeType = response?.data?.mimeType || "text/csv";
  const fileName =
    response?.data?.fileName || `${REPORT_FILE_NAMES[exportType]}.csv`;

  const blob = new Blob([`\uFEFF${content}`], {
    type: mimeType.includes("charset") ? mimeType : `${mimeType};charset=utf-8`,
  });

  downloadBlobFile(blob, fileName);
};

const getPdfFileName = (response: CsvExportResponse, exportType: ExportType) => {
  const apiFileName = response?.data?.fileName;

  if (apiFileName) {
    return apiFileName.replace(/\.csv$/i, ".pdf");
  }

  return `${REPORT_FILE_NAMES[exportType]}.pdf`;
};

const compactId = (value: string) => {
  if (!value) return "-";

  const normalized = value.trim();

  if (normalized.length <= 16) return normalized;

  return `${normalized.slice(0, 6)}...${normalized.slice(-8)}`;
};

const truncateText = (value: string, maxLength = 46) => {
  if (!value) return "-";

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, maxLength - 1)}…`;
};

const prettyLabel = (value: string) => {
  if (!value) return "-";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatBoolean = (value: string) => {
  const normalized = value?.toLowerCase();

  if (normalized === "true") return "Yes";
  if (normalized === "false") return "No";

  return value || "-";
};

const formatAmount = (value: string) => {
  if (value === undefined || value === null || value === "") return "-";

  const numeric = Number(value);

  if (Number.isNaN(numeric)) return value;

  return numeric.toLocaleString(undefined, {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const formatPdfDate = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeKey = (key: string) => key.trim().toLowerCase();

const getRecordValue = (record: CsvRecord, keys: string[]) => {
  for (const key of keys) {
    if (record[key]) return record[key];

    const normalizedKey = normalizeKey(key);
    const matchedKey = Object.keys(record).find(
      (recordKey) => normalizeKey(recordKey) === normalizedKey
    );

    if (matchedKey && record[matchedKey]) {
      return record[matchedKey];
    }
  }

  return "";
};

const csvRowsToRecords = (rows: string[][]) => {
  const [headers, ...body] = rows;

  return body.map((row) => {
    return headers.reduce<CsvRecord>((record, header, index) => {
      record[header] = row[index] || "";
      return record;
    }, {});
  });
};

const buildPdfTable = (rows: string[][], exportType: ExportType) => {
  const records = csvRowsToRecords(rows);
  const columns = PDF_COLUMNS[exportType];

  const headers = columns.map((column) => column.header);

  const body = records.map((record) => {
    return columns.map((column) => {
      const rawValue = getRecordValue(record, column.keys);
      const formattedValue = column.formatter
        ? column.formatter(rawValue, record)
        : rawValue || "-";

      return truncateText(formattedValue, exportType === "orders" ? 42 : 48);
    });
  });

  const columnStyles = columns.reduce<Record<number, any>>((styles, column, index) => {
    styles[index] = {
      cellWidth: column.width,
      halign: column.align || "left",
    };

    return styles;
  }, {});

  return {
    headers,
    body,
    columnStyles,
  };
};

const drawPdfHeader = ({
  doc,
  exportType,
  rowCount,
}: {
  doc: jsPDF;
  exportType: ExportType;
  rowCount: number;
}) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const title = REPORT_LABELS[exportType];

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 82, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text(title, 32, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`${rowCount} row(s) exported`, 32, 50);

  doc.text(new Date().toLocaleString(), pageWidth - 32, 50, {
    align: "right",
  });

  doc.setDrawColor(229, 231, 235);
  doc.line(32, 68, pageWidth - 32, 68);
};

const drawPdfFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);

    doc.setDrawColor(229, 231, 235);
    doc.line(32, pageHeight - 26, pageWidth - 32, pageHeight - 26);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(REPORT_LABELS.orders.replace("Orders", "Generated"), 32, pageHeight - 12);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - 32, pageHeight - 12, {
      align: "right",
    });
  }
};

const downloadPdf = (response: CsvExportResponse, exportType: ExportType) => {
  const content = response?.data?.content || "";
  const rows = parseCsvContent(content);

  if (rows.length <= 1) {
    toast.error("No data available to export as PDF");
    return;
  }

  const { headers, body, columnStyles } = buildPdfTable(rows, exportType);

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const rowCount = response?.data?.rowCount ?? body.length;

  doc.setProperties({
    title: REPORT_LABELS[exportType],
    subject: `${REPORT_LABELS[exportType]} PDF export`,
    creator: "Reports & Analytics",
  });

  drawPdfHeader({
    doc,
    exportType,
    rowCount,
  });

  autoTable(doc, {
    head: [headers],
    body,
    startY: 84,
    margin: {
      left: 32,
      right: 32,
      bottom: 36,
    },
    theme: "grid",
    tableWidth: "wrap",
    showHead: "everyPage",
    rowPageBreak: "avoid",
    styles: {
      font: "helvetica",
      fontSize: 7.4,
      cellPadding: {
        top: 6,
        right: 5,
        bottom: 6,
        left: 5,
      },
      overflow: "linebreak",
      valign: "middle",
      lineColor: [229, 231, 235],
      lineWidth: 0.35,
      textColor: [31, 41, 55],
      minCellHeight: 22,
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      fontSize: 7,
      minCellHeight: 26,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 253],
    },
    columnStyles,
    didDrawPage: () => {
      drawPdfHeader({
        doc,
        exportType,
        rowCount,
      });
    },
  } as any);

  drawPdfFooter(doc);

  doc.save(getPdfFileName(response, exportType));
};

export default function Filter({
  dateRange,
  onDateRangeChange,
  customFromDate,
  onCustomFromDateChange,
  customToDate,
  onCustomToDateChange,
  exportType,
  onExportTypeChange,
  exportParams,
}: AnalyticsFilterProps) {
  const [exportingFormat, setExportingFormat] =
    useState<ExportFormat | null>(null);

  const isExportingCsv = exportingFormat === "csv";
  const isExportingPdf = exportingFormat === "pdf";
  const isExporting = Boolean(exportingFormat);

  const fetchExportData = async () => {
    if (exportType === "orders") {
      return exportOrdersReport(exportParams ?? {});
    }

    if (exportType === "customers") {
      return exportCustomersReport(exportParams ?? {});
    }

    return exportMenuReport({});
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      setExportingFormat(format);

      const response = await fetchExportData();

      if (format === "csv") {
        downloadCsv(response, exportType);
      } else {
        downloadPdf(response, exportType);
      }

      const rowCount =
        typeof response?.data?.rowCount === "number"
          ? ` (${response.data.rowCount} rows)`
          : "";

      toast.success(
        `${REPORT_LABELS[exportType]} exported successfully${rowCount}`
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to export ${REPORT_LABELS[exportType].toLowerCase()}`
      );
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="rounded-[14px] border border-gray-100 bg-white p-4 shadow-sm lg:p-[30px]">
      <div className="flex w-full flex-col gap-[24px] lg:flex-row lg:items-end">
        <div className="w-full flex-1 space-y-[12px]">
          <Label>Date Range</Label>

          <Select
            value={dateRange}
            onValueChange={(value) =>
              onDateRangeChange(value as DateRangeValue)
            }
          >
            <SelectTrigger className="h-[52px] w-full rounded-[12px] border-gray-200 focus:ring-primary">
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="last-7">Last 7 Days</SelectItem>
              <SelectItem value="last-30">Last 30 Days</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateRange === "individual" ? (
          <>
            <div className="w-full flex-1 space-y-[12px]">
              <Label>From Date</Label>

              <input
                type="date"
                value={customFromDate || ""}
                onChange={(event) =>
                  onCustomFromDateChange?.(event.target.value)
                }
                className="h-[52px] w-full rounded-[12px] border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>

            <div className="w-full flex-1 space-y-[12px]">
              <Label>To Date</Label>

              <input
                type="date"
                value={customToDate || ""}
                onChange={(event) =>
                  onCustomToDateChange?.(event.target.value)
                }
                className="h-[52px] w-full rounded-[12px] border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          </>
        ) : null}

        <div className="w-full flex-1 space-y-[12px]">
          <Label>Report Type</Label>

          <Select
            value={exportType}
            onValueChange={(value) => onExportTypeChange(value as ExportType)}
          >
            <SelectTrigger className="h-[52px] w-full rounded-[12px] border-gray-200 focus:ring-primary">
              <SelectValue placeholder="Select Report Type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="orders">Orders Report</SelectItem>
              <SelectItem value="customers">Customers Report</SelectItem>
              <SelectItem value="menu">Menu Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full flex-1 space-y-[12px]">
          <Label>Export Report</Label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border-gray-200 font-medium text-gray transition-colors hover:bg-gray-50"
            >
              {isExportingCsv ? (
                <Loader2 size={18} className="animate-spin text-gray-400" />
              ) : (
                <FileText size={18} className="text-gray-400" />
              )}
              {isExportingCsv ? "Exporting..." : "CSV"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] border-gray-200 font-medium text-gray transition-colors hover:bg-gray-50"
            >
              {isExportingPdf ? (
                <Loader2 size={18} className="animate-spin text-gray-400" />
              ) : (
                <FileDown size={18} className="text-gray-400" />
              )}
              {isExportingPdf ? "Exporting..." : "PDF"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}