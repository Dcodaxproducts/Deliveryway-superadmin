import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { login } from "@/services/auth";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/services/auth";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const clearAuthTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};

export const useLogin = () => {
  const router = useRouter();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: login,
    onMutate: () => {
      clearAuthTokens();
    },
    onSuccess: async (data) => {
      localStorage.setItem("token", data.accessToken)
      localStorage.setItem("accessToken", data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken)
      }
      if (data.user) {
        localStorage.setItem("authUser", JSON.stringify({
          ...data.user,
          restaurantAccess: data.user.restaurantAccess ?? data.restaurantAccess,
          staffRole: data.user.staffRole ?? data.staffRole,
        }))
      }
      toast.success(toasts("loginSuccessful"))

      router.push("/")
    },

    onError: (err: ApiError) => {
      clearAuthTokens();
      const message = err.response?.data?.message || toasts("somethingWentWrong");
      toast.error(message);
    },
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });
};
