"use client";

import { useEffect } from "react";

import { useGetGlobalSettings } from "@/hooks/useGlobalSettings";
import { setGlobalDisplayCurrency } from "@/lib/currency";

export function GlobalCurrencyHydrator() {
  const { data } = useGetGlobalSettings();

  useEffect(() => {
    setGlobalDisplayCurrency(data?.defaultCurrency);
  }, [data?.defaultCurrency]);

  return null;
}
