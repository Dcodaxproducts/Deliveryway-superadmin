"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { isStaffUser } from "@/lib/staff-access";
import {
  canAccessPath,
  getFirstAccessiblePath,
} from "@/lib/sidebar-permissions";

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

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const isPublicRoute = publicRoutes.has(pathname);

    setAccessDenied(false);

    if (isPublicRoute) {
      if (token) {
        const user = getStoredUser();
        router.replace(
          isStaffUser(user) ? (getFirstAccessiblePath(user) ?? "/") : "/",
        );
        return;
      }

      setLoading(false);
      return;
    }

    if (!token) {
      router.replace("/auth/login");
      setLoading(false);
      return;
    }

    const user = getStoredUser();
    if (isStaffUser(user) && !canAccessPath(user, pathname)) {
      const firstAccessiblePath = getFirstAccessiblePath(user);

      if (firstAccessiblePath && firstAccessiblePath !== pathname) {
        router.replace(firstAccessiblePath);
        return;
      }

      setAccessDenied(true);
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

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-dark">
            {t("accessDenied")}
          </h1>
          <p className="mt-2 text-gray">{t("accessDeniedDescription")}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
