"use client";

import { useEffect } from "react";

import { useGetGlobalSettings } from "@/hooks/useGlobalSettings";
import { normalizeCurrency, setGlobalDisplayCurrency } from "@/lib/currency";

export const useGlobalCurrency = () => {
  const { data } = useGetGlobalSettings();
  const currency = normalizeCurrency(data?.defaultCurrency);

  useEffect(() => {
    setGlobalDisplayCurrency(currency);
  }, [currency]);

  return currency;
};
