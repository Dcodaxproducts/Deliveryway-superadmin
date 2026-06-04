import Container from "@/components/container";
import NotificationForm from "@/components/forms/notification-form"
import Header from "@/components/header"

const NotificationSettingsPage = () => {
    return (
        <Container>
            <Header
                title="Notification Settings"
                description="Automatically print orders and connect your POS system."
            />

            <div className="flex flex-col gap-[32px] w-full bg-white p-[30px] rounded-[14px]">
                <NotificationForm />
            </div>
        </Container>
    )
}

export default NotificationSettingsPage