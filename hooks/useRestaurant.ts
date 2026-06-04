import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  getRestaurants, 
  getRestaurant, 
  deleteRestaurant, 
  createRestaurant, 
  updateRestaurant, 
  getRestaurantBranches, 
  getBranch,
  getRestaurantTrend,
  getTopPerformingRestaurants
} from "@/services/restaurant";
import { useRouter } from "next/navigation";

// --- Restaurant Hooks ---

export const useCreateRestaurant = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant created successfully!");
      router.push("/restaurants");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create restaurant");
    },
  });
};

export const useGetRestaurants = (params?: { page?: number; search?: string; includeInactive?: boolean }) => {
  return useQuery({
    queryKey: ["restaurants", params?.page, params?.search, params?.includeInactive],
    queryFn: () => getRestaurants(params),
  });
};

export const useGetRestaurant = (id: string) => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurant(id),
    enabled: !!id,
  });
};

export const useUpdateRestaurant = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateRestaurant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant", variables.id] });
      toast.success("Restaurant updated successfully!");
      router.push(`/restaurants`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update restaurant");
    },
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => {
      toast.success("Restaurant deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete restaurant");
    },
  });
};

// --- Branch Hooks ---

export const useGetRestaurantBranches = (id: string) => {
  return useQuery({
    queryKey: ["restaurant-branches", id],
    queryFn: () => getRestaurantBranches(id),
    enabled: !!id,
  });
};

export const useGetBranch = (id: string) => {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: () => getBranch(id),
    enabled: !!id,
  });
};

// --- Restaurant Trend Hook ---

export const useGetRestaurantTrend = (range?: "daily" | "weekly") => {
  return useQuery({
    queryKey: ["restaurant-trend", range],
    queryFn: () => getRestaurantTrend(range),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto refresh every 10 minutes
  });
};

// --- Top Performing Restaurants Hook ---

export const useGetTopPerformingRestaurants = () => {
  return useQuery({
    queryKey: ["top-performing-restaurants"],
    queryFn: getTopPerformingRestaurants,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto refresh every 10 minutes
  });
};