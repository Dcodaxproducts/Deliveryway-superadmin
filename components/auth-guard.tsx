"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasSuperAdminPanelAccess } from "@/lib/auth-role";

const publicRoutes = new Set(["/auth/login"]);

const getStoredToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("accessToken");
};

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("authUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("authUser");
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const isPublicRoute = publicRoutes.has(pathname);
    const user = getStoredUser();

    if (isPublicRoute) {
      if (token && hasSuperAdminPanelAccess(user)) {
        router.replace("/");
        return;
      }

      if (token) clearStoredAuth();
      setLoading(false);
      return;
    }

    if (!token) {
      router.replace("/auth/login");
      setLoading(false);
      return;
    }

    if (!hasSuperAdminPanelAccess(user)) {
      clearStoredAuth();
      router.replace("/auth/login");
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
