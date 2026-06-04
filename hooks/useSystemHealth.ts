import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

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
          "Failed to fetch system health overview"
      );
    }
  }, [query.error]);

  return query;
};

/**
 * ==============================
 * GET REQUEST METRICS
 * ==============================
 */
export const useGetRequestMetrics = (range: string = "hour") => {
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
          "Failed to fetch request metrics"
      );
    }
  }, [query.error]);

  return query;
};

/**
 * ==============================
 * GET REQUEST LOGS
 * ==============================
 */
export const useGetRequestLogs = (limit: number = 20) => {
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
          "Failed to fetch request logs"
      );
    }
  }, [query.error]);

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
          "Failed to fetch integration logs"
      );
    }
  }, [query.error]);

  return query;
};