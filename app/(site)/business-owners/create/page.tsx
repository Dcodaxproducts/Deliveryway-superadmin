import Container from "@/components/container"
import Header from "@/components/header"
import BusinessOwnerForm from "@/components/forms/business-owner-form"

const AddRestaurant = () => {
    return (
        <Container>
            <Header
                title="Business Owner"
                description="Add Business Owner from here"
            />
            <div className="w-full">
                <BusinessOwnerForm />
            </div>
        </Container>
    )
}

export default AddRestaurant