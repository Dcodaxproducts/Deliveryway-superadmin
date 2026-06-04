"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  cols?: number;
  rows?: number;
  className?: string;
};

const TableSkeleton = ({ cols = 7, rows = 10, className }: TableSkeletonProps) => {
  return (
    <Table className={cn("border-separate border-spacing-y-[32px] -mt-[32px] px-2 lg:px-0", className)}>
      <TableHeader>
        <TableRow className="border-none hover:bg-transparent">
          {Array.from({ length: cols }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-5 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex} className="border-none hover:bg-transparent">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton 
                  className={cn(
                    "h-6 w-full",
                    colIndex === 0 ? "w-32" : colIndex === cols - 1 ? "w-12 mx-auto" : "w-20"
                  )} 
                />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;