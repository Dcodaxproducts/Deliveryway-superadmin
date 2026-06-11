import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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
import type { RestaurantValues } from "@/validations/restaurant";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// --- Restaurant Hooks ---

export const useCreateRestaurant = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");
  return useMutation({
    mutationFn: createRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success(toasts("restaurantCreated"));
      router.push("/restaurants");
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || toasts("restaurantCreateFailed"));
    },
  });
};

export const useGetRestaurants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
}) => {
  return useQuery({
    queryKey: [
      "restaurants",
      params?.page,
      params?.limit,
      params?.search,
      params?.includeInactive,
    ],
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
  const toasts = useTranslations("toasts");
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RestaurantValues }) => updateRestaurant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant", variables.id] });
      toast.success(toasts("restaurantUpdated"));
      router.push(`/restaurants`);
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || toasts("restaurantUpdateFailed"));
    },
  });
};

export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");
  return useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => {
      toast.success(toasts("restaurantDeleted"));
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || toasts("restaurantDeleteFailed"));
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
