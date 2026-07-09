"use client"

import Container from "@/components/container";
import SummarySection from "@/components/pages/profile/address-info"
import BranchList from "@/components/pages/profile/branch-list-section"
import Hero from "@/components/pages/profile/hero"
import { ServiceChargePanel } from "@/components/pages/restaurants/service-charge-panel"
import Header from "@/components/header"
import { StripeAccountPanel } from "@/components/pages/restaurants/stripe-account-panel";
import { useGetRestaurant, useGetRestaurantBranches } from "@/hooks/useRestaurant";
import { useParams } from "next/navigation";
import RestaurantDetailsSkeleton from "@/components/skeleton/restaurant-details-skeleton";
import { useTranslations } from "next-intl";

const RestaurantDetailsPage = () => {
    const restaurants = useTranslations("restaurants");
    const params = useParams();
    const id = params.id as string;

    const { data: restaurantData, isLoading } = useGetRestaurant(id);
    const { data: branchesData} = useGetRestaurantBranches(id);

    if (isLoading) return (
        <RestaurantDetailsSkeleton />
    );

    return (
        <Container>
            <Header title={restaurants("detailsTitle")} />
            <div className="flex flex-col gap-[32px] w-full bg-white p-4 lg:p-[30px] rounded-[14px]">
                <Hero data={restaurantData} />
                <SummarySection data={restaurantData} />
                <ServiceChargePanel restaurant={restaurantData} />
                <StripeAccountPanel restaurantId={id} />
                <BranchList branches={branchesData} />
            </div>
        </Container>
    )
}

export default RestaurantDetailsPage
