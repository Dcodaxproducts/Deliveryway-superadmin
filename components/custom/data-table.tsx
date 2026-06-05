"use client";

import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Pagination from "@/components/pagination";

type DataTableProps<T> = {
  data: T[];
  headers: React.ReactNode;
  row: (row: T, index: number) => React.ReactNode;
  tableClassName?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
  };
  showPagination?: boolean;
};

export function DataTable<T>({
  data,
  headers,
  row,
  tableClassName,
  pagination,
  showPagination = true,
}: DataTableProps<T>) {
  const common = useTranslations("common");

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-xl border border-gray-200">
        <p className="text-gray-400 text-sm font-medium">{common("noDataFound")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 justify-between h-full">
      <Table className={cn("border-separate border-spacing-y-[32px] -mt-[32px] px-2 lg:px-0", tableClassName)}>
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent">
            {headers}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r, i) => (
            <TableRow key={i} className="border-none hover:bg-gray-50/50">
              {row(r, i)}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && pagination && (
        <Pagination {...pagination} />
      )}
    </div>
  );
}
