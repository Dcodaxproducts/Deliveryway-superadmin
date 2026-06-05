import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
  getSystemHealthOverview,
  getRequestMetrics,
  getRequestLogs,
  getIntegrationLogs,
  RequestMetrics,
  RequestLog,
  IntegrationLog,
  SystemHealthOverview,
} from "@/services/systemHealth";

/**
 * ==============================
 * GET SYSTEM HEALTH OVERVIEW
 * ==============================
 */
export const useGetSystemHealthOverview = () => {
  const toasts = useTranslations("toasts");
  const query = useQuery<SystemHealthOverview>({
    queryKey: ["system-health-overview"],
    queryFn: getSystemHealthOverview,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (query.error) {
      const err: any = query.error;
      toast.error(
        err?.response?.data?.message ||
          toasts("systemHealthOverviewFetchFailed")
      );
    }
  }, [query.error, toasts]);

  return query;
};

/**
 * ==============================
 * GET REQUEST METRICS
 * ==============================
 */
export const useGetRequestMetrics = (range: string = "hour") => {
  const toasts = useTranslations("toasts");
  const query = useQuery<RequestMetrics>({
    queryKey: ["system-health-metrics", range],
    queryFn: () => getRequestMetrics(range),
    staleTime: 1000 * 20,
  });

  useEffect(() => {
    if (query.error) {
      const err: any = query.error;
      toast.error(
        err?.response?.data?.message ||
          toasts("requestMetricsFetchFailed")
      );
    }
  }, [query.error, toasts]);

  return query;
};

/**
 * ==============================
 * GET REQUEST LOGS
 * ==============================
 */
export const useGetRequestLogs = (limit: number = 20) => {
  const toasts = useTranslations("toasts");
  const query = useQuery<RequestLog[]>({
    queryKey: ["system-health-logs", limit],
    queryFn: () => getRequestLogs(limit),
    staleTime: 1000 * 15,
  });

  useEffect(() => {
    if (query.error) {
      const err: any = query.error;
      toast.error(
        err?.response?.data?.message ||
          toasts("requestLogsFetchFailed")
      );
    }
  }, [query.error, toasts]);

  return query;
};

/**
 * ==============================
 * GET INTEGRATION LOGS
 * ==============================
 */
export const useGetIntegrationLogs = (
  type: string = "webhook",
  limit: number = 20
) => {
  const toasts = useTranslations("toasts");
  const query = useQuery<IntegrationLog>({
    queryKey: ["system-health-integration-logs", type, limit],
    queryFn: () => getIntegrationLogs(type, limit),
    staleTime: 1000 * 20,
  });

  useEffect(() => {
    if (query.error) {
      const err: any = query.error;
      toast.error(
        err?.response?.data?.message ||
          toasts("integrationLogsFetchFailed")
      );
    }
  }, [query.error, toasts]);

  return query;
};
