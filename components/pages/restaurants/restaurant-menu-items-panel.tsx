"use client";

import { ArrowRight, PackageOpen, Utensils } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import MyImage from "@/components/MyImage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalCurrency } from "@/hooks/useGlobalCurrency";
import { useGetProducts } from "@/hooks/useProduct";
import { formatMoney } from "@/lib/currency";
import type { Product } from "@/services/product";

export function RestaurantMenuItemsPanel({ restaurantId }: { restaurantId: string }) {
  const text = useTranslations("restaurants");
  const productsText = useTranslations("products");
  const currency = useGlobalCurrency();
  const { data, isLoading, isError } = useGetProducts({
    page: 1,
    limit: 6,
    restaurantId,
    all: true,
  });
  const products: Product[] = data?.data ?? [];
  const total = data?.meta?.total ?? products.length;

  return (
    <section className="rounded-[18px] bg-white" aria-labelledby="restaurant-menu-items-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Utensils aria-hidden="true" size={20} />
          </div>
          <h2 id="restaurant-menu-items-title" className="text-xl font-semibold tracking-[-0.02em] text-dark">
            {text("restaurantItems")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray">
            {isLoading ? text("loadingItems") : text("itemsCount", { count: total })}
          </p>
        </div>
        <Button asChild variant="outline" className="self-start rounded-xl active:scale-[0.98] sm:self-auto">
          <Link href={`/restaurants/${restaurantId}/items`}>
            {text("viewAllItems")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[92px] rounded-[14px]" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
          {productsText("loadError")}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-[14px] bg-[#f7f8fa] px-4 py-10 text-center">
          <PackageOpen className="text-gray" aria-hidden="true" size={28} />
          <p className="mt-3 font-semibold text-dark">{text("noRestaurantItems")}</p>
          <p className="mt-1 max-w-[46ch] text-sm text-gray">{text("noRestaurantItemsDescription")}</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="group flex min-w-0 items-center gap-3 rounded-[14px] bg-[#f7f8fa] p-3 transition-colors duration-200 hover:bg-[#f1f2f4]"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-[10px] bg-white">
                <MyImage
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="rounded-[10px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-dark">{product.name}</p>
                <p className="mt-0.5 truncate text-xs text-gray">{product.category?.name || productsText("category")}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold tabular-nums text-dark">{formatMoney(product.basePrice, currency)}</span>
                  <span className={product.isActive ? "text-xs font-medium text-green" : "text-xs font-medium text-primary"}>
                    {product.isActive ? text("available") : text("inactive")}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
