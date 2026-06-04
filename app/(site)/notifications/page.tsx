import Container from "@/components/container";
import Header from "@/components/header"
import Notifications from "@/components/Notifications/Notifications";

const NotificationSettingsPage = () => {
    return (
        <Container>
            <Header
                title="Notifications"
                description="Manage restaurant alerts, updates, and customer activity."
            />

            <div className="flex flex-col gap-[32px] w-full bg-white p-[30px] rounded-[14px]">
                <Notifications />
            </div>
        </Container>
    )
}

export default NotificationSettingsPage