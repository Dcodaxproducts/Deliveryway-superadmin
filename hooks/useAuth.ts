import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/services/auth";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/services/auth";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      localStorage.setItem("token", data.accessToken)
      toast.success("Login Successful")

      router.push("/")
    },

    onError: (err: any) => {
      const message = err?.response?.data?.message || "Something went wrong";
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


