import api from "@/lib/axios";
import { ApiResponse, AdminDashboardOverview } from "@/types/stats";

export const getAdminDashboardOverview = async (): Promise<AdminDashboardOverview> => {
  const { data } = await api.get<ApiResponse<AdminDashboardOverview>>("/admin/dashboard/overview");
  return data.data;
};