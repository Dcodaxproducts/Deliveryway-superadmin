"use client";

import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface HealthCardProps {
  title?: string;
  value?: string;
  subValue?: string;
  percentage?: number;
  status?: "Healthy" | "Warning" | "Critical";
  className?: string;
  loading?: boolean; // 🔥 NEW
}

export default function HealthCard({
  title,
  value,
  subValue,
  percentage = 0,
  status,
  className,
  loading = false,
}: HealthCardProps) {
  const dashboard = useTranslations("dashboard");
  /**
   * ==============================
   * LOADING STATE (SKELETON)
   * ==============================
   */
  if (loading) {
    return (
      <Card
        className={cn(
          "p-[24px] border-none shadow-sm rounded-[14px] flex flex-col justify-between h-full bg-white animate-pulse",
          className
        )}
      >
        {/* Top */}
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-10 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-4 space-y-3">
          <div className="h-[6px] w-full bg-gray-200 rounded-full" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  /**
   * ==============================
   * NORMAL STATE
   * ==============================
   */
  const barColor =
    status === "Warning"
      ? "bg-primary"
      : status === "Critical"
      ? "bg-red-500"
      : "bg-green";

  const textColor =
    status === "Warning"
      ? "text-primary"
      : status === "Critical"
      ? "text-red-500"
      : "text-gray";

  const translatedStatus =
    status === "Healthy"
      ? dashboard("healthy")
      : status === "Warning"
      ? dashboard("warning")
      : status === "Critical"
      ? dashboard("critical")
      : status;

  return (
    <Card
      style={{
        background: `linear-gradient(134.39deg, rgba(216, 0, 39, 0) 50.72%, rgba(216, 0, 39, 0.08) 107.74%), #FFFFFF`,
      }}
      className={cn(
        "p-[24px] border-none shadow-sm rounded-[14px] flex flex-col justify-between h-full",
        className
      )}
    >
      <div className="space-y-1">
        <h4 className="text-base text-dark">{title}</h4>
        <div className="flex items-end gap-1 text-xs">
          <span className="text-gray">{value}</span>
          {subValue && <span className="text-gray">/ {subValue}</span>}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="h-[6px] w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              barColor
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {status && (
          <span className={cn("text-base block", textColor)}>
            {translatedStatus}
          </span>
        )}
      </div>
    </Card>
  );
}
