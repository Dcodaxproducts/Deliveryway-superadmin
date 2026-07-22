"use client"

import Container from "@/components/container";
import SummarySection from "@/components/pages/profile/address-info"
import BranchList from "@/components/pages/profile/branch-list-section"
import Hero from "@/components/pages/profile/hero"
import { RestaurantDomainPanel } from "@/components/pages/restaurants/restaurant-domain-panel";
import { RestaurantMenuItemsPanel } from "@/components/pages/restaurants/restaurant-menu-items-panel";
import { FinancialControls } from "@/components/pages/restaurants/financial-controls"
import Header from "@/components/header"
import { useGetRestaurant, useGetRestaurantBranches } from "@/hooks/useRestaurant";
import { useParams } from "next/navigation";
import RestaurantDetailsSkeleton from "@/components/skeleton/restaurant-details-skeleton";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const RestaurantDetailsPage = () => {
    const restaurants = useTranslations("restaurants");
    const params = useParams();
    const id = params.id as string;

    const { data: restaurantData, isLoading, isError } = useGetRestaurant(id);
    const { data: branchesData} = useGetRestaurantBranches(id);

    if (isLoading) return (
        <RestaurantDetailsSkeleton />
    );

    if (isError || !restaurantData) {
        return (
            <Container>
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[18px] bg-white px-5 text-center">
                    <h1 className="text-2xl font-semibold tracking-[-0.02em] text-dark">{restaurants("detailsLoadError")}</h1>
                    <p className="mt-2 max-w-[48ch] text-sm leading-6 text-gray">{restaurants("detailsLoadErrorDescription")}</p>
                    <Button asChild variant="primary" className="mt-6 rounded-xl">
                        <Link href="/restaurants">{restaurants("backToRestaurants")}</Link>
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <Header title={restaurants("detailsTitle")} description={restaurants("detailsDescription")} />
            <div className="flex w-full flex-col gap-8 rounded-[18px] bg-white p-4 lg:p-[30px]">
                <Hero data={restaurantData} />
                <RestaurantDomainPanel restaurant={restaurantData} />
                <RestaurantMenuItemsPanel restaurantId={id} />
                <SummarySection data={restaurantData} />
                <BranchList branches={branchesData ?? []} />
                <FinancialControls restaurant={restaurantData} />
            </div>
        </Container>
    )
}

export default RestaurantDetailsPage
