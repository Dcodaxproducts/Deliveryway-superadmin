"use client"

import RestaurantForm from "@/components/forms/restaurants-form"
import Container from "@/components/container"
import Header from "@/components/header"
import { useTranslations } from "next-intl"

const AddRestaurant = () => {
    const restaurants = useTranslations("restaurants")

    return (
        <Container>
            <Header
                title={restaurants("addRestaurant")}
                description={restaurants("restaurantSetup")}
            />
            <div className="w-full">
                <RestaurantForm />
            </div>
        </Container>
    )
}

export default AddRestaurant
