"use client";

import { useState } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import RestaurantGraph from "@/components/graphs/restaurant-graph";
import {
  useGetRestaurantTrend,
  useGetTopPerformingRestaurants,
} from "@/hooks/useRestaurant";

type RestaurantTrendRange = "daily" | "weekly";

export default function AnalyticsGrid() {
  const [range, setRange] = useState<RestaurantTrendRange>("daily");

  const { data: trendResponse, isLoading } = useGetRestaurantTrend(range);
  const { data: topRestaurantsData } = useGetTopPerformingRestaurants();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] w-full">
      <RestaurantGraph
        data={trendResponse?.points || []}
        isLoading={isLoading}
        range={range}
        onRangeChange={setRange}
      />

      <Card className="p-4 lg:p-[24px] border-none shadow-sm rounded-[10px] bg-white">
        <div className="flex items-center justify-between lg:mb-6 mb-4">
          <h3 className="text-base text-dark font-medium">
            Top Performing Restaurants
          </h3>

          <Link
            href="/restaurants"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {topRestaurantsData?.items?.slice(0, 3).map((res) => (
            <Link
              href={`/restaurants/${res.restaurantId}`}
              key={res.restaurantId || res.rank}
              className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-[10px] bg-primary text-white flex items-center justify-center text-base font-medium">
                  {res.rank}
                </div>

                <div className="space-y-[2px]">
                  <p className="text-sm font-medium text-dark capitalize">
                    {res.name}
                  </p>
                  <p className="text-xs text-[#6A7282]">
                    {res.ordersCount} orders
                  </p>
                </div>
              </div>

              <p className="text-sm font-semibold text-green">
                {res.customersCount} customers
              </p>
            </Link>
          ))}

          {!topRestaurantsData?.items?.length && (
            <div className="py-8 text-center text-sm text-gray-400">
              No restaurant data available.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}