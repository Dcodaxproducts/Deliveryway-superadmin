import RestaurantForm from "@/components/forms/restaurants-form"
import Container from "@/components/container"
import Header from "@/components/header"

const AddRestaurant = () => {
    return (
        <Container>
            <Header
                title="Restaurants List"
                description="View and manage all Restaurants from here"
            />
            <div className="w-full">
                <RestaurantForm />
            </div>
        </Container>
    )
}

export default AddRestaurant