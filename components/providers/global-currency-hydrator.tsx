"use client";

import { useEffect } from "react";

import { useGetGlobalSettings } from "@/hooks/useGlobalSettings";
import { setGlobalDisplayCurrency } from "@/lib/currency";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function GlobalCurrencyHydrator() {
  const { data } = useGetGlobalSettings();

  useEffect(() => {
    setGlobalDisplayCurrency(data?.defaultCurrency);
  }, [data?.defaultCurrency]);

  useEffect(() => {
    const root = document.documentElement;

    if (data?.primaryColor && HEX_COLOR.test(data.primaryColor)) {
      root.style.setProperty("--primary", data.primaryColor);
      root.style.setProperty("--ring", data.primaryColor);
    }

    if (data?.secondaryColor && HEX_COLOR.test(data.secondaryColor)) {
      root.style.setProperty("--secondary", data.secondaryColor);
    }

    if (data?.fontFamily?.trim()) {
      root.style.setProperty("--font-sans", data.fontFamily.trim());
    }
  }, [data?.fontFamily, data?.primaryColor, data?.secondaryColor]);

  return null;
}
