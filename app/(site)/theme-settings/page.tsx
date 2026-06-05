"use client";

import Container from "@/components/container";
import Header from "@/components/header";
import BrandAssetsSection from "@/components/pages/theme-settings/brand-assets-section";
import ColorSchemeSection from "@/components/pages/theme-settings/color-scheme-section";
import PreviewSection from "@/components/pages/theme-settings/preview-section";
import RestaurantSelector from "@/components/pages/theme-settings/restaurant-selector";
import TypographySection from "@/components/pages/theme-settings/typography-section";
import { useTranslations } from "next-intl";

const ThemeSettingsPage = () => {
    const themeSettings = useTranslations("themeSettings");

    return (
        <Container>
            <Header
                title={themeSettings("title")}
                description={themeSettings("description")}
            />
            <RestaurantSelector />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <BrandAssetsSection />
                </div>
                <div>
                    <ColorSchemeSection />
                </div>
            </div>
            <TypographySection />
            <PreviewSection />
        </Container>
    );
};

export default ThemeSettingsPage;
