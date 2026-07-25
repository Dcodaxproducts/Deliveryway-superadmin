"use client";

import { useState } from "react";
import {
  Building2,
  ExternalLink,
  Landmark,
  Search,
  WalletCards,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { PayoutProviderPanel } from "@/components/pages/restaurants/payout-provider-panel";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetRestaurants } from "@/hooks/useRestaurant";
import type { Restaurant } from "@/types/restaurant";

export function RestaurantPayoutConfigurationSection() {
  const text = useTranslations("globalSettings");
  const [search, setSearch] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const restaurantsQuery = useGetRestaurants({
    page: 1,
    limit: 50,
    search: debouncedSearch || undefined,
    includeInactive: true,
  });
  const restaurants = (restaurantsQuery.data?.data ?? []) as Restaurant[];
  const selectedRestaurant = restaurants.find(
    (restaurant) => restaurant.id === restaurantId,
  );
  const restaurantAdminBaseUrl = (
    process.env.NEXT_PUBLIC_RESTAURANT_ADMIN_URL ?? ""
  ).replace(/\/+$/, "");

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#EAECF0] bg-white shadow-sm">
      <div className="border-b border-[#EAECF0] bg-gradient-to-r from-primary/10 via-white to-white p-5 lg:p-7">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary text-white shadow-[0_10px_24px_rgba(255,107,0,0.24)]">
            <WalletCards size={22} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-dark">
              {text("restaurantPayoutMethods")}
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-gray">
              {text("restaurantPayoutMethodsDescription")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 lg:p-7">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-dark">
              {text("searchRestaurants")}
            </span>
            <span className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={text("searchRestaurantsPlaceholder")}
                className="h-11 pl-10"
              />
            </span>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-dark">
              {text("selectRestaurant")}
            </span>
            <Select value={restaurantId} onValueChange={setRestaurantId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={text("selectRestaurantPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        {restaurantsQuery.isLoading ? (
          <div className="h-40 animate-pulse rounded-[16px] border border-[#EAECF0] bg-[#F8FAFC]" />
        ) : restaurantsQuery.isError ? (
          <p className="rounded-[14px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {text("restaurantsLoadFailed")}
          </p>
        ) : restaurants.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-[#D0D5DD] bg-[#F9FAFB] p-6 text-center text-sm text-gray">
            {text("noRestaurantsFound")}
          </p>
        ) : selectedRestaurant ? (
          <>
            <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-[#EAECF0] bg-[#F9FAFB] p-4">
              <Building2 className="size-5 text-primary" aria-hidden="true" />
              <div>
                <p className="font-semibold text-dark">
                  {selectedRestaurant.name}
                </p>
                <p className="text-xs text-gray">
                  {text("restaurantSpecificConfiguration")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
              <p>{text("ownerPayoutSetupDescription")}</p>
              {restaurantAdminBaseUrl ? (
                <a
                  href={`${restaurantAdminBaseUrl}/payment-settings`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-900 px-4 py-2 font-semibold text-white transition hover:bg-amber-800"
                >
                  {text("openOwnerPayoutSetup")}
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>

            <PayoutProviderPanel restaurantId={selectedRestaurant.id} />

            <div className="flex gap-3 rounded-[14px] border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
              <Landmark className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>{text("manualPayoutFallback")}</p>
            </div>
          </>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-[16px] border border-dashed border-[#D0D5DD] bg-[#F9FAFB] p-8 text-center">
            <Building2 className="size-8 text-gray" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-dark">
              {text("selectRestaurantToConfigure")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
