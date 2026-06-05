"use client";

import Container from "@/components/container";
import Header from "@/components/header"
import Notifications from "@/components/Notifications/Notifications";
import { useTranslations } from "next-intl";

const NotificationSettingsPage = () => {
    const notificationSettings = useTranslations("notificationSettings");

    return (
        <Container>
            <Header
                title={notificationSettings("notificationsTitle")}
                description={notificationSettings("notificationsDescription")}
            />

            <div className="flex flex-col gap-[32px] w-full bg-white p-[30px] rounded-[14px]">
                <Notifications />
            </div>
        </Container>
    )
}

export default NotificationSettingsPage
