"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTopPerformingRestaurants } from "@/hooks/useDashboard";

const getPerformanceLabel = (rank: number) => {
  if (rank === 1) return "Gold";
  if (rank === 2) return "Silver";
  if (rank === 3) return "Bronze";
  return null;
};

const getTrophyColor = (rank: number) => {
  if (rank === 1) return "text-yellow-500";
  if (rank === 2) return "text-slate-400";
  if (rank === 3) return "text-orange-400";
  return "";
};

export default function TopPerformingRestaurants() {
  const {
    data: topRestaurantsResponse,
    isLoading,
    isFetching,
  } = useGetTopPerformingRestaurants();

  const items = topRestaurantsResponse?.data?.items || [];
  const loading = isLoading || isFetching;

  return (
    <div className="space-y-[16px]">
      <div className="space-y-[6px]">
        <h3 className="text-lg font-semibold text-dark">
          Top Performing Restaurants
        </h3>
        <p className="text-base text-gray">
          Based on total orders and customer reach
        </p>
      </div>

      <Card className="overflow-hidden rounded-[14px] border-none bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="w-[80px] py-4 pl-6 pr-10 lg:pr-0">
                  Rank
                </TableHead>
                <TableHead className="w-[240px] min-w-[240px]">
                  Restaurant Name
                </TableHead>
                <TableHead className="w-[140px] min-w-[140px] text-center">
                  Total Orders
                </TableHead>
                <TableHead className="w-[140px] min-w-[140px] text-center">
                  Total Customers
                </TableHead>
                <TableHead className="w-[140px] min-w-[140px] text-center">
                  Performance
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="h-5 w-10 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="mx-auto h-5 w-16 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="mx-auto h-5 w-16 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <div className="mx-auto h-7 w-20 animate-pulse rounded-full bg-gray-200" />
                    </TableCell>
                  </TableRow>
                ))
              ) : items.length > 0 ? (
                items.map((item: any) => {
                  const perf = getPerformanceLabel(item.rank);
                  const trophyColor = getTrophyColor(item.rank);

                  return (
                    <TableRow
                      key={item.restaurantId}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-dark">
                            {item.rank}
                          </span>
                          {item.rank <= 3 && (
                            <Trophy size={16} className={trophyColor} />
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div
                          className="max-w-[220px] truncate font-medium text-dark"
                          title={item.name}
                        >
                          {item.name || "-"}
                        </div>
                      </TableCell>

                      <TableCell className="py-4 text-center font-semibold text-green">
                        {Number(item.ordersCount ?? 0).toLocaleString()}
                      </TableCell>

                      <TableCell className="py-4 text-center font-semibold text-green">
                        {Number(item.customersCount ?? 0).toLocaleString()}
                      </TableCell>

                      <TableCell className="py-4 text-center">
                        {perf && (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-1 text-xs font-semibold",
                              perf === "Gold" &&
                                "border border-yellow-200 bg-yellow-50 text-yellow-600",
                              perf === "Silver" &&
                                "border border-slate-200 bg-slate-50 text-slate-600",
                              perf === "Bronze" &&
                                "border border-orange-200 bg-orange-50 text-orange-600"
                            )}
                          >
                            {perf}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    No top performing restaurants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}