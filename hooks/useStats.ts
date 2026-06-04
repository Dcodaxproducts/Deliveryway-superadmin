import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardOverview } from "@/services/stats";

export const useStats = () => {
  return useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: getAdminDashboardOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto refresh every 10 minutes
  });
};