"use client";

import Container from "@/components/container";
import { NotificationForm } from "@/components/forms/notification-form"
import Header from "@/components/header"
import { useTranslations } from "next-intl";

const NotificationSettingsPage = () => {
    const notificationSettings = useTranslations("notificationSettings");

    return (
        <Container>
            <Header
                title={notificationSettings("title")}
                description={notificationSettings("settingsDescription")}
            />

            <div className="flex flex-col gap-[32px] w-full bg-white p-[30px] rounded-[14px]">
                <NotificationForm />
            </div>
        </Container>
    )
}

export default NotificationSettingsPage
