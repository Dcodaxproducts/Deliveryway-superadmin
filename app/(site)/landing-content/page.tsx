"use client";

import Container from "@/components/container";
import { LandingContentForm } from "@/components/forms/landing-content-form";
import Header from "@/components/header";
import { useTranslations } from "next-intl";

export default function LandingContentPage() {
  const t = useTranslations("landingContent");

  return (
    <Container>
      <Header title={t("title")} description={t("description")} />
      <div className="mt-6">
        <LandingContentForm />
      </div>
    </Container>
  );
}
