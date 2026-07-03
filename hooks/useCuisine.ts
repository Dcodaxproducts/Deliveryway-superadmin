import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  bulkCreateCuisines,
  createCuisine,
  deleteCuisine,
  getCuisines,
  reorderCuisines,
  updateCuisine,
} from "@/services/cuisine";
import type { CuisineListParams, CuisinePayload, CuisineReorderItem } from "@/types/cuisine";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: ApiError, fallback: string) =>
  error.response?.data?.message || fallback;

export const useGetCuisines = (params?: CuisineListParams) => {
  return useQuery({
    queryKey: ["cuisines", params],
    queryFn: () => getCuisines(params),
  });
};

export const useCreateCuisine = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: createCuisine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuisines"] });
      toast.success(toasts("cuisineCreated"));
    },
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error, toasts("cuisineCreateFailed")));
    },
  });
};

export const useUpdateCuisine = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CuisinePayload }) => updateCuisine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuisines"] });
      toast.success(toasts("cuisineUpdated"));
    },
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error, toasts("cuisineUpdateFailed")));
    },
  });
};

export const useDeleteCuisine = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: deleteCuisine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuisines"] });
      toast.success(toasts("cuisineDeleted"));
    },
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error, toasts("cuisineDeleteFailed")));
    },
  });
};

export const useBulkCreateCuisines = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: bulkCreateCuisines,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["cuisines"] });
      toast.success(result.message || toasts("cuisinesCreated"));
    },
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error, toasts("cuisinesCreateFailed")));
    },
  });
};

export const useReorderCuisines = () => {
  const queryClient = useQueryClient();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: (items: CuisineReorderItem[]) => reorderCuisines(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuisines"] });
      toast.success(toasts("cuisinesReordered"));
    },
    onError: (error: ApiError) => {
      toast.error(getErrorMessage(error, toasts("cuisinesReorderFailed")));
    },
  });
};
