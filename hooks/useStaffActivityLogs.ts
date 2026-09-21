import { useQuery } from "@tanstack/react-query";
import {
  getStaffActivityLogs,
  type StaffActivityLogParams,
} from "@/services/staffActivityLogs";

export const useStaffActivityLogs = (params: StaffActivityLogParams) => {
  return useQuery({
    queryKey: ["staff-activity-logs", params],
    queryFn: () => getStaffActivityLogs(params),
  });
};
