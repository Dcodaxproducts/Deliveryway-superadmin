import api from "@/lib/axios";

/**
 * ==============================
 * TYPES
 * ==============================
 */

// ---------- OVERVIEW ----------
export type SystemHealthOverview = {
  status: string;
  checkedAt: string;

  server: {
    uptimeSeconds: number;
    cpu: {
      cores: number;
      load1m: number;
      estimatedUsagePercent: number;
    };
    memory: {
      totalBytes: number;
      freeBytes: number;
      usedBytes: number;
      usedPercent: number;
    };
    disk: {
      path: string;
      totalBytes: number;
      freeBytes: number;
      usedBytes: number;
      usedPercent: number;
    };
  };

  database: {
    status: string;
    latencyMs: number;
  };

  platform: {
    tenants: number;
    restaurants: number;
    branches: number;
    customers: number;
    ordersTotal: number;
    ordersToday: number;
    failedPayments: number;
    failedNotifications: number;
  };

  api: {
    range: string;
    totalRequests: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    failureRate: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
  };

  integrations: {
    webhook: {
      status: string;
      totalEvents: number;
      failedCount: number;
      latest: any;
    };
    printer: {
      status: string;
      totalEvents: number;
      failedCount: number;
      latest: any;
    };
  };
};

// ---------- REQUEST METRICS ----------
export type RequestMetrics = {
  range: string;

  summary: {
    totalRequests: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    failureRate: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
  };

  buckets: {
    label: string;
    startedAt: string;
    endedAt: string;
    totalRequests: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    failureRate: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
  }[];
};

// ---------- REQUEST LOG ----------
export type RequestLog = {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  success: boolean;
  timestamp: string;
};

// ---------- INTEGRATION LOG ----------
export type IntegrationLog = {
  type: string;
  items: any[];
};

/**
 * ==============================
 * HELPERS
 * ==============================
 */

const normalizeOverview = (payload: any): SystemHealthOverview => ({
  status: payload?.status ?? "unknown",
  checkedAt: payload?.checkedAt ?? "",

  server: {
  uptimeSeconds: payload?.server?.uptimeSeconds ?? 0,
  cpu: {
    cores: payload?.server?.cpu?.cores ?? 0,
    load1m: payload?.server?.cpu?.load1m ?? 0,
    estimatedUsagePercent:
      payload?.server?.cpu?.estimatedUsagePercent ?? 0,
  },
  memory: {
    totalBytes: payload?.server?.memory?.totalBytes ?? 0,
    freeBytes: payload?.server?.memory?.freeBytes ?? 0,
    usedBytes: payload?.server?.memory?.usedBytes ?? 0,
    usedPercent: payload?.server?.memory?.usedPercent ?? 0,
  },
  disk: {
    path: payload?.server?.disk?.path ?? "/",
    totalBytes: payload?.server?.disk?.totalBytes ?? 0,
    freeBytes: payload?.server?.disk?.freeBytes ?? 0,
    usedBytes: payload?.server?.disk?.usedBytes ?? 0,
    usedPercent: payload?.server?.disk?.usedPercent ?? 0,
  },
},
  database: payload?.database ?? {},
  platform: payload?.platform ?? {},
  api: payload?.api ?? {},
  integrations: payload?.integrations ?? {},
});

const normalizeRequestMetrics = (payload: any): RequestMetrics => ({
  range: payload?.range ?? "hour",
  summary: payload?.summary ?? {},
  buckets: payload?.buckets ?? [],
});

const normalizeRequestLogs = (payload: any): RequestLog[] => {
  return payload ?? [];
};

const normalizeIntegrationLogs = (payload: any): IntegrationLog => ({
  type: payload?.type ?? "",
  items: payload?.items ?? [],
});

/**
 * ==============================
 * API ENDPOINTS
 * ==============================
 */

const BASE_URL = "/admin/system-health";

/**
 * GET OVERVIEW
 */
export const getSystemHealthOverview = async (): Promise<SystemHealthOverview> => {
  const { data } = await api.get(`${BASE_URL}/overview`);

  const overview = data?.data ?? {};

  return normalizeOverview(overview);
};

/**
 * GET REQUEST METRICS
 * @param range "hour" | "day" | "week"
 */
export const getRequestMetrics = async (
  range: string = "hour"
): Promise<RequestMetrics> => {
  const { data } = await api.get(`${BASE_URL}/requests/metrics`, {
    params: { range },
  });

  return normalizeRequestMetrics(data?.data);
};

/**
 * GET REQUEST LOGS
 * @param limit number
 */
export const getRequestLogs = async (
  limit: number = 20
): Promise<RequestLog[]> => {
  const { data } = await api.get(`${BASE_URL}/requests/logs`, {
    params: { limit },
  });

  return normalizeRequestLogs(data?.data);
};

/**
 * GET INTEGRATION LOGS
 * @param type "webhook" | "printer"
 * @param limit number
 */
export const getIntegrationLogs = async (
  type: string = "webhook",
  limit: number = 20
): Promise<IntegrationLog> => {
  const { data } = await api.get(`${BASE_URL}/integration-logs`, {
    params: { type, limit },
  });

  return normalizeIntegrationLogs(data?.data);
};