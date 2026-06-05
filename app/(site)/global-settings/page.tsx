"use client"
import Container from '../../../components/container';
import { SettingsForm } from '@/components/forms/settings-form'
import Header from '@/components/header'
import { useTranslations } from 'next-intl';

const SettingsPage = () => {
    const globalSettings = useTranslations("globalSettings");

    return (
        <Container>
            <Header
                title={globalSettings("title")}
                description={globalSettings("description")}
            />
            <SettingsForm />
        </Container>
    )
}

export default SettingsPage
