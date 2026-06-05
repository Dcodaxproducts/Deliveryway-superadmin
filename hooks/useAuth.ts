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

export const useLogin = () => {
  const router = useRouter();
  const toasts = useTranslations("toasts");

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      localStorage.setItem("token", data.accessToken)
      toast.success(toasts("loginSuccessful"))

      router.push("/")
    },

    onError: (err: ApiError) => {
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

