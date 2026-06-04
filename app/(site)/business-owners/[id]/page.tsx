"use client"

import Container from "@/components/container";
import SummarySection from "@/components/pages/profile/address-info"
import BranchList from "@/components/pages/profile/branch-list-section"
import Hero from "@/components/pages/profile/hero"
import Header from "@/components/header"
import { useGetRestaurant, useGetRestaurantBranches } from "@/hooks/useRestaurant";
import { useParams } from "next/navigation";
import RestaurantDetailsSkeleton from "@/components/skeleton/restaurant-details-skeleton";

const RestaurantDetailsPage = () => {
    const params = useParams();
    const id = params.id as string;

    const { data: restaurantData, isLoading } = useGetRestaurant(id);
    const { data: branchesData} = useGetRestaurantBranches(id);

    if (isLoading) return (
        <RestaurantDetailsSkeleton />
    );

    return (
        <Container>
            <Header title="Restaurant Details" />
            <div className="flex flex-col gap-[32px] w-full bg-white p-4 lg:p-[30px] rounded-[14px]">
                <Hero data={restaurantData} />
                <SummarySection data={restaurantData} />
                <BranchList branches={branchesData} />
            </div>
        </Container>
    )
}

export default RestaurantDetailsPage