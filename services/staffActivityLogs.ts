import api from "@/lib/axios";

export type StaffActivityAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "OTHER";

export type StaffActivityLog = {
  id: string;
  staffUserId: string;
  staffEmail: string;
  staffName: string;
  staffRoleName?: string | null;
  action: StaffActivityAction;
  module: string;
  description: string;
  targetType?: string | null;
  targetId?: string | null;
  restaurantId?: string | null;
  restaurantName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  httpMethod?: string | null;
  requestPath?: string | null;
  statusCode?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  changedFields: string[];
  occurredAt: string;
};

export type StaffActivityLogParams = {
  page?: number;
  limit?: number;
  search?: string;
  staffUserId?: string;
  restaurantId?: string;
  action?: StaffActivityAction;
  module?: string;
  from?: string;
  to?: string;
};

export type StaffActivityLogResponse = {
  data: StaffActivityLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

export const getStaffActivityLogs = async (
  params: StaffActivityLogParams,
): Promise<StaffActivityLogResponse> => {
  const { data } = await api.get<StaffActivityLogResponse>(
    "/staff-activity-logs",
    { params },
  );
  return data;
};
