"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { useTranslations } from "next-intl";

type AsyncSelectMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasMore?: boolean;
};

type AsyncSelectResponse = {
  data?: any[] | { data?: any[]; items?: any[]; meta?: AsyncSelectMeta };
  items?: any[];
  meta?: AsyncSelectMeta;
};

interface Props {
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
  fetchOptions: (params: {
    search: string;
    page: number;
  }) => Promise<{ data: any[]; meta?: any }>;
  labelKey?: string;
  valueKey?: string;
  searchPlaceholder?: string;
  className?: string;
  renderOption?: (option: any, selected: boolean) => ReactNode;
  getOptionLabel?: (option: any) => string;
}

export default function AsyncSelect({
  value,
  onChange,
  placeholder,
  fetchOptions,
  labelKey = "name",
  valueKey = "id",
  searchPlaceholder,
  className = "",
  renderOption,
  getOptionLabel,
}: Props) {
  const common = useTranslations("common");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const resolvedPlaceholder = placeholder ?? common("select");

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const normalize = useCallback(
    (
      res: AsyncSelectResponse | any
    ): { data: any[]; meta?: AsyncSelectMeta } => {
    if (Array.isArray(res)) {
      return { data: res, meta: undefined };
    }

    if (Array.isArray(res?.data)) {
      return { data: res.data, meta: res.meta };
    }

    if (Array.isArray(res?.items)) {
      return { data: res.items, meta: res.meta };
    }

    if (Array.isArray(res?.data?.data)) {
      return { data: res.data.data, meta: res.data.meta ?? res.meta };
    }

    if (Array.isArray(res?.data?.items)) {
      return { data: res.data.items, meta: res.data.meta ?? res.meta };
    }

      return { data: [], meta: res?.meta };
    },
    []
  );

  const resolveHasMore = useCallback(
    (
      data: any[],
      meta: AsyncSelectMeta | undefined,
      requestedPage: number
    ) => {
      if (typeof meta?.hasNext === "boolean") return meta.hasNext;
      if (typeof meta?.hasMore === "boolean") return meta.hasMore;
      if (typeof meta?.totalPages === "number") {
        return requestedPage < meta.totalPages;
      }
      if (typeof meta?.total === "number" && typeof meta?.limit === "number") {
        return requestedPage * meta.limit < meta.total;
      }

      return data.length > 0;
    },
    []
  );

  const getLabel = useCallback(
    (option: any) => {
      if (!option) return "";
      if (getOptionLabel) return getOptionLabel(option);

      return String(option?.[labelKey] ?? "");
    },
    [getOptionLabel, labelKey]
  );

  const loadOptions = useCallback(
    async ({
      reset = false,
      nextSearch,
      nextPage,
    }: {
      reset?: boolean;
      nextSearch?: string;
      nextPage: number;
    }) => {
      try {
        setLoading(true);

        const res = await fetchOptions({
          search: nextSearch ?? search,
          page: nextPage,
        });

        const { data, meta } = normalize(res);

        setOptions((prev) => {
          const nextOptions = reset ? data : [...prev, ...data];
          const seen = new Set<string>();

          return nextOptions.filter((option) => {
            const id = String(option?.[valueKey] ?? "");
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        });
        setHasMore(resolveHasMore(data, meta, nextPage));

        if (reset) {
          setPage(1);
        }
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions, normalize, resolveHasMore, search, valueKey]
  );

  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => {
      loadOptions({
        reset: true,
        nextSearch: search,
        nextPage: 1,
      });
    }, 300);

    return () => clearTimeout(t);
  }, [open, search, loadOptions]);

  useEffect(() => {
    if (!open || page === 1) return;

    loadOptions({
      reset: false,
      nextPage: page,
    });
  }, [open, page, loadOptions]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleScroll = (e: any) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20) {
      if (hasMore && !loading) setPage((p) => p + 1);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* TRIGGER */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex h-[44px] w-full items-center justify-between gap-3 rounded-lg border border-[#BBBBBB] bg-white px-3 text-left text-sm outline-none transition focus:border-primary"
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            value ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {value ? getLabel(value) : resolvedPlaceholder}
        </span>

        <ChevronDown size={16} className="shrink-0" />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
          {/* SEARCH */}
          <div className="border-b border-gray-100 p-2">
            <div className="flex h-[36px] items-center gap-2 rounded-lg border border-gray-100 px-2">
              <Search size={14} className="text-gray-400" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                placeholder={searchPlaceholder ?? common("searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>

          {/* OPTIONS */}
          <div
            className="max-h-[240px] overflow-y-auto"
            onScroll={handleScroll}
          >
            {options.map((opt) => {
              const selected = value?.[valueKey] === opt?.[valueKey];

              return (
                <button
                  key={opt[valueKey]}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-sm ${
                    selected
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    {renderOption ? renderOption(opt, selected) : getLabel(opt)}
                  </span>
                  {selected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}

            {loading && (
              <div className="flex items-center justify-center gap-2 p-3 text-sm text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                {common("loading")}
              </div>
            )}

            {!loading && options.length === 0 && (
              <div className="p-3 text-center text-gray-400 text-sm">
                {common("noResultsFound")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
