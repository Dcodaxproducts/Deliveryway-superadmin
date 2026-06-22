export const DEFAULT_DISPLAY_CURRENCY = "EUR";

let globalDisplayCurrency = DEFAULT_DISPLAY_CURRENCY;

export const normalizeCurrency = (currency?: string | null) => {
  const normalized = currency?.trim().toUpperCase();

  return normalized || DEFAULT_DISPLAY_CURRENCY;
};

export const setGlobalDisplayCurrency = (currency?: string | null) => {
  globalDisplayCurrency = normalizeCurrency(currency);
};

export const getGlobalDisplayCurrency = () => globalDisplayCurrency;

export const resolveCurrency = (...candidates: Array<string | null | undefined>) => {
  return normalizeCurrency(globalDisplayCurrency || candidates.find(Boolean));
};

export const formatMoney = (
  value?: string | number | null,
  currency?: string | null,
  options?: Intl.NumberFormatOptions
) => {
  const numeric = Number(value ?? 0);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;
  const resolvedCurrency = normalizeCurrency(currency || globalDisplayCurrency);
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2;
  const minimumFractionDigits =
    options?.minimumFractionDigits ?? Math.min(2, maximumFractionDigits);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: resolvedCurrency,
      minimumFractionDigits,
      maximumFractionDigits,
      ...options,
    }).format(safeAmount);
  } catch {
    return `${resolvedCurrency} ${safeAmount.toFixed(2)}`;
  }
};

export const formatSignedMoney = (
  value?: string | number | null,
  currency?: string | null
) => {
  const numeric = Number(value ?? 0);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;

  if (safeAmount > 0) {
    return `+${formatMoney(safeAmount, currency)}`;
  }

  if (safeAmount < 0) {
    return `-${formatMoney(Math.abs(safeAmount), currency)}`;
  }

  return formatMoney(0, currency);
};
