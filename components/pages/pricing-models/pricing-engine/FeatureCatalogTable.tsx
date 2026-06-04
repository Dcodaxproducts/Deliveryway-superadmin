"use client";

import { useEffect, useMemo } from "react";
import {
  CheckCircle2,
  CircleSlash,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetPackagePlanFeatureCatalog } from "@/hooks/usePackagePlans";

type SupportFilter = "ALL" | "WITH_LIMIT" | "WITHOUT_LIMIT";

type FeatureCatalogItem = {
  code: string;
  name: string;
  description?: string | null;
  supportsLimit?: boolean;
};

type FeatureCatalogResponse = {
  success?: boolean;
  data?: FeatureCatalogItem[];
  message?: string;
};

type FeatureCatalogTableProps = {
  search?: string;
  supportFilter?: SupportFilter;
  setExportData?: (data: FeatureCatalogItem[]) => void;
};

const normalizeCatalogResponse = (response: unknown): FeatureCatalogItem[] => {
  if (Array.isArray(response)) {
    return response as FeatureCatalogItem[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const record = response as FeatureCatalogResponse;

  if (Array.isArray(record.data)) {
    return record.data;
  }

  return [];
};

const formatCode = (code: string) => {
  return code.replace(/_/g, " ");
};

const getFeatureInitials = (name: string) => {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0]?.slice(0, 2).toUpperCase() || "FM";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

export default function FeatureCatalogTable({
  search = "",
  supportFilter = "ALL",
  setExportData,
}: FeatureCatalogTableProps) {
  const { data, isLoading, isFetching } = useGetPackagePlanFeatureCatalog();

  const features = useMemo(() => {
    return normalizeCatalogResponse(data);
  }, [data]);

  const filteredFeatures = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return features.filter((feature) => {
      const matchesSearch =
        !keyword ||
        feature.code?.toLowerCase().includes(keyword) ||
        feature.name?.toLowerCase().includes(keyword) ||
        feature.description?.toLowerCase().includes(keyword);

      const matchesSupportFilter =
        supportFilter === "ALL" ||
        (supportFilter === "WITH_LIMIT" && Boolean(feature.supportsLimit)) ||
        (supportFilter === "WITHOUT_LIMIT" && !feature.supportsLimit);

      return matchesSearch && matchesSupportFilter;
    });
  }, [features, search, supportFilter]);

  useEffect(() => {
    if (filteredFeatures.length) {
      setExportData?.(filteredFeatures);
    }
  }, [filteredFeatures, setExportData]);

  const loading = isLoading || isFetching;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm px-5 py-3">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-dark">
              Feature Modules
            </h2>
            <p className="text-sm text-gray">
              {loading
                ? "Loading available modules..."
                : `${filteredFeatures.length} module${
                    filteredFeatures.length === 1 ? "" : "s"
                  } found`}
            </p>
          </div>

          <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-primary sm:mt-0">
            <ShieldCheck size={15} />
            Read-only catalog
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead className="w-[70px] text-xs font-semibold uppercase text-gray">
                SL
              </TableHead>

              <TableHead className="text-xs font-semibold uppercase text-gray">
                Feature Module
              </TableHead>

              <TableHead className="text-xs font-semibold uppercase text-gray">
                Code
              </TableHead>

              <TableHead className="text-xs font-semibold uppercase text-gray">
                Description
              </TableHead>

              <TableHead className="text-center text-xs font-semibold uppercase text-gray">
                Limit Support
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <FeatureCatalogSkeletonRow key={index} />
              ))}

            {!loading && filteredFeatures.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray">
                      <CircleSlash size={22} />
                    </div>

                    <p className="mt-4 text-base font-semibold text-dark">
                      No feature modules found
                    </p>

                    <p className="mt-1 text-sm text-gray">
                      Try changing your search keyword or selected filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              filteredFeatures.map((feature, index) => (
                <TableRow
                  key={feature.code}
                  className="border-gray-100 transition hover:bg-gray-50/70"
                >
                  <TableCell className="font-medium text-gray">
                    {index + 1}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-primary">
                        {getFeatureInitials(feature.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-dark">
                          {feature.name}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray">
                          <Layers3 size={13} />
                          <span>Package plan module</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-dark">
                      {formatCode(feature.code)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <p className="max-w-[420px] text-sm leading-5 text-gray">
                      {feature.description || "No description provided"}
                    </p>
                  </TableCell>

                  <TableCell className="text-center">
                    {feature.supportsLimit ? (
                      <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-primary">
                        <CheckCircle2 size={14} />
                        Supported
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray">
                        Standard
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FeatureCatalogSkeletonRow() {
  return (
    <TableRow className="border-gray-100">
      <TableCell>
        <div className="h-4 w-6 animate-pulse rounded bg-gray-100" />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <div className="size-11 animate-pulse rounded-xl bg-gray-100" />
          <div className="space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="h-6 w-32 animate-pulse rounded-full bg-gray-100" />
      </TableCell>

      <TableCell>
        <div className="space-y-2">
          <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-44 animate-pulse rounded bg-gray-100" />
        </div>
      </TableCell>

      <TableCell>
        <div className="mx-auto h-6 w-24 animate-pulse rounded-full bg-gray-100" />
      </TableCell>
    </TableRow>
  );
}