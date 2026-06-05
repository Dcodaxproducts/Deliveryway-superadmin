"use client"

import Container from "@/components/container"
import Header from "@/components/header"
import BusinessOwnerForm from "@/components/forms/business-owner-form"
import { useTranslations } from "next-intl"

const AddRestaurant = () => {
    const businessOwners = useTranslations("businessOwners")

    return (
        <Container>
            <Header
                title={businessOwners("businessOwner")}
                description={businessOwners("addBusinessOwnerDescription")}
            />
            <div className="w-full">
                <BusinessOwnerForm />
            </div>
        </Container>
    )
}

export default AddRestaurant
