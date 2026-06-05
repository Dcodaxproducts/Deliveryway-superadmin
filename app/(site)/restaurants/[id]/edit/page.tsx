"use client"

import RestaurantForm from "@/components/forms/restaurants-form"
import Container from "@/components/container"
import Header from "@/components/header"
import { useGetRestaurant } from "@/hooks/useRestaurant"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

const EditRestaurant = () => {
    const restaurants = useTranslations("restaurants");
    const params = useParams();
    const { data: restaurant, isLoading } = useGetRestaurant(params.id as string);
    
    if (isLoading) return <div className="flex items-center justify-center min-h-screen mx-auto"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
    
    return (
        <Container>
            <Header
                title={restaurants("editRestaurant")}
            />
            <div className="w-full">
                <RestaurantForm 
                    mode="edit" 
                    restaurantId={params.id as string}
                    initialData={restaurant}
                />
            </div>
        </Container>
    )
}

export default EditRestaurant
