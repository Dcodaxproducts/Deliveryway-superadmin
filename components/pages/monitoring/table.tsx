"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetIntegrationLogs } from "@/hooks/useSystemHealth";
import { useTranslations } from "next-intl";

type LogType = "webhook" | "printer";

type IntegrationLog = Record<string, unknown>;

export const MonitoringLogsTable = () => {
  const monitoring = useTranslations("monitoring");
  const [activeTab, setActiveTab] = useState<LogType>("webhook");

  const { data, isLoading } = useGetIntegrationLogs(activeTab, 20);

  const logs = data?.items || [];

  return (
    <div className="bg-white rounded-[14px] p-[24px] shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex gap-6 mb-[24px] font-semibold">
        <button
          onClick={() => setActiveTab("webhook")}
          className={cn(
            "pb-2 truncate",
            activeTab === "webhook" ? "text-primary" : "text-gray"
          )}
        >
          {monitoring("webhookLogs")}
        </button>

        <button
          onClick={() => setActiveTab("printer")}
          className={cn(
            "pb-2 truncate",
            activeTab === "printer" ? "text-primary" : "text-gray"
          )}
        >
          {monitoring("printerConnectivityLogs")}
        </button>
      </div>

      <Table>
        {activeTab === "webhook" ? (
          <>
            <WebhookLogsTableHeader />
            <WebhookLogsTableBody logs={logs} isLoading={isLoading} />
          </>
        ) : (
          <>
            <PrinterLogsTableHeader />
            <PrinterLogsTableBody logs={logs} isLoading={isLoading} />
          </>
        )}
      </Table>
    </div>
  );
};

/**
 * ==============================
 * WEBHOOK
 * ==============================
 */
const WebhookLogsTableHeader = () => (
  <TableHeader>
    <TableRow className="border-none">
      <WebhookHeadings />
    </TableRow>
  </TableHeader>
);

function WebhookHeadings() {
  const monitoring = useTranslations("monitoring");
  return (
    <>
      <TableHead className="font-normal">{monitoring("timestamp")}</TableHead>
      <TableHead className="font-normal">{monitoring("eventType")}</TableHead>
      <TableHead className="font-normal">{monitoring("status")}</TableHead>
      <TableHead className="font-normal">{monitoring("responseCode")}</TableHead>
      <TableHead className="font-normal">{monitoring("retryCount")}</TableHead>
      <TableHead className="font-normal">{monitoring("actions")}</TableHead>
    </>
  );
}

const WebhookLogsTableBody = ({
  logs,
  isLoading,
}: {
  logs: IntegrationLog[];
  isLoading: boolean;
}) => {
  const monitoring = useTranslations("monitoring");

  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-6">
            {monitoring("loading")}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (!logs.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-6 text-gray-600">
            {monitoring("noWebhookLogs")}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {logs.map((log, i) => (
        <TableRow key={i} className="border-none h-[60px]">
          <TableCell className="text-xs">
            {log.timestamp ? new Date(String(log.timestamp)).toLocaleString("en-GB", { hour12: false }) : "-"}
          </TableCell>
          <TableCell>{String(log.eventType || "-")}</TableCell>
          <TableCell
            className={cn(
              log.status === "success" ? "text-green" : "text-primary"
            )}
          >
            {String(log.status || "-")}
          </TableCell>
          <TableCell>{String(log.responseCode ?? "-")}</TableCell>
          <TableCell>{String(log.retryCount ?? 0)}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2 text-gray p-2 border rounded-md w-fit">
              <Eye size={16} />
              {log.status === "failed" && (
                <div className="border-l pl-2">
                  <RefreshCw size={14} />
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

/**
 * ==============================
 * PRINTER
 * ==============================
 */
const PrinterLogsTableHeader = () => (
  <TableHeader>
    <TableRow className="border-none">
      <PrinterHeadings />
    </TableRow>
  </TableHeader>
);

function PrinterHeadings() {
  const monitoring = useTranslations("monitoring");
  return (
    <>
      <TableHead className="font-normal">{monitoring("printerId")}</TableHead>
      <TableHead className="font-normal">{monitoring("restaurant")}</TableHead>
      <TableHead className="font-normal">{monitoring("location")}</TableHead>
      <TableHead className="font-normal">{monitoring("status")}</TableHead>
      <TableHead className="font-normal">{monitoring("lastConnected")}</TableHead>
      <TableHead className="font-normal">{monitoring("errorMessage")}</TableHead>
    </>
  );
}

const PrinterLogsTableBody = ({
  logs,
  isLoading,
}: {
  logs: IntegrationLog[];
  isLoading: boolean;
}) => {
  const monitoring = useTranslations("monitoring");

  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-6">
            {monitoring("loading")}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (!logs.length) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={6} className="text-center py-6 text-gray-600">
            {monitoring("noPrinterLogs")}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {logs.map((log, i) => (
        <TableRow key={i} className="border-none h-[60px]">
          <TableCell>{String(log.printerId || "-")}</TableCell>
          <TableCell>{String(log.restaurant || "-")}</TableCell>
          <TableCell>{String(log.location || "-")}</TableCell>
          <TableCell>{String(log.status || "-")}</TableCell>
          <TableCell>
            {log.lastConnected
              ? new Date(String(log.lastConnected)).toLocaleString("en-GB", { hour12: false })
              : "-"}
          </TableCell>
          <TableCell
            className={cn(Boolean(log.errorMessage) && "text-primary")}
          >
            {String(log.errorMessage || "---")}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};
