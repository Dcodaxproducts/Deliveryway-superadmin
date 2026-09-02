"use client";

import Container from "@/components/container";
import Header from "@/components/header";
import BrandingWorkspace from "@/components/pages/theme-settings/branding-workspace";
import { useTranslations } from "next-intl";

const ThemeSettingsPage = () => {
  const themeSettings = useTranslations("themeSettings");

  return (
    <Container>
      <Header
        title={themeSettings("title")}
        description={themeSettings("description")}
      />
      <BrandingWorkspace />
    </Container>
  );
};

export default ThemeSettingsPage;
