"use client";

import { ArrowLeft, ExternalLink, Pencil, Utensils } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import MyImage from "@/components/MyImage";
import { getRestaurantStorefrontUrl } from "@/components/pages/restaurants/restaurant-domain-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";

export default function Hero({ data }: { data: Restaurant }) {
  const common = useTranslations("common");
  const restaurants = useTranslations("restaurants");
  const storefrontUrl = getRestaurantStorefrontUrl(data);

  return (
    <section className="overflow-hidden rounded-[18px] bg-[#f7f8fa]" aria-labelledby="restaurant-name">
      <div className="relative h-[150px] w-full md:h-[220px]">
        <MyImage
          src={data.coverImage || "/profile-banner.png"}
          alt={`${data.name} ${restaurants("banner")}`}
          fill
          className="rounded-none object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
        <Button
          asChild
          variant="outline"
          className="absolute left-4 top-4 h-10 rounded-xl border-white/70 bg-white/90 px-3 text-sm text-dark shadow-sm backdrop-blur md:left-6 md:top-6"
        >
          <Link href="/restaurants">
            <ArrowLeft aria-hidden="true" />
            {restaurants("backToRestaurants")}
          </Link>
        </Button>
      </div>

      <div className="relative px-5 pb-6 md:px-8 md:pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative -mt-12 size-24 shrink-0 overflow-hidden rounded-[22px] border-4 border-[#f7f8fa] bg-white shadow-[0_12px_30px_rgba(17,24,39,0.14)] md:-mt-16 md:size-32">
              <MyImage
                src={data.logoUrl}
                alt={data.name || restaurants("restaurantLogo")}
                fill
                sizes="128px"
                className="rounded-[18px] object-contain"
              />
            </div>

            <div className="min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={data.isActive ? "border-green/20 bg-green/10 text-green" : "border-primary/20 bg-primary/10 text-primary"}
                >
                  <span className={data.isActive ? "size-1.5 rounded-full bg-green" : "size-1.5 rounded-full bg-primary"} />
                  {data.isActive ? common("active") : common("inactive")}
                </Badge>
                <span className="font-mono text-xs text-gray">#{data.id.slice(-8)}</span>
              </div>
              <h1 id="restaurant-name" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-dark md:text-[34px] md:leading-tight">
                {data.name}
              </h1>
              <p className="mt-1 max-w-[60ch] text-sm leading-6 text-gray">
                {data.tagline || restaurants("noTagline")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-11 rounded-xl active:scale-[0.98]">
              <Link href={`/restaurants/${data.id}/items`}>
                <Utensils aria-hidden="true" />
                {restaurants("viewAllItems")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl active:scale-[0.98]">
              <Link href={`/restaurants/${data.id}/edit`}>
                <Pencil aria-hidden="true" />
                {restaurants("editRestaurant")}
              </Link>
            </Button>
            {storefrontUrl && (
              <Button asChild variant="primary" className="h-11 rounded-xl active:scale-[0.98]">
                <a href={storefrontUrl} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" />
                  {restaurants("openStorefront")}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
