"use client";

import Container from "@/components/container";
import Header from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

const RestaurantDetailsSkeleton = () => {
  const restaurants = useTranslations("restaurants");

  return (
    <Container>
            <Header title={restaurants("detailsTitle")} />
            <div className="flex flex-col gap-[32px] w-full bg-white p-4 lg:p-[30px] rounded-[18px]">
                <Skeleton className="h-[310px] w-full rounded-[18px]" />
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Skeleton className="h-[210px] rounded-[18px]" />
                    <Skeleton className="h-[210px] rounded-[18px]" />
                </div>
                <Skeleton className="h-[250px] w-full rounded-[18px]" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px]">
                    <Skeleton className="lg:col-span-5 h-[300px] rounded-[14px]" />
                    <Skeleton className="lg:col-span-7 h-[300px] rounded-[14px]" />
                </div>
                <Skeleton className="h-[400px] w-full rounded-[14px]" />
            </div>
        </Container>
  )
}

export default RestaurantDetailsSkeleton
