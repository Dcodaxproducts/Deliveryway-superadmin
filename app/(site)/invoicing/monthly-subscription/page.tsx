"use client";

import { useTranslations } from "next-intl";

import Container from "@/components/container";
import Header from "@/components/header";
import { MonthlySubscriptionTab } from "@/components/pages/invoicing/monthly-subscription-tab";

export default function MonthlySubscriptionInvoicePage() {
  const invoicing = useTranslations("invoicing");

  return (
    <Container>
      <div className="w-full space-y-7">
        <Header
          title={invoicing("monthlySubscriptionTitle")}
          description={invoicing("monthlySubscriptionDescription")}
        />

        <div className="rounded-[14px] bg-white p-4 shadow-sm lg:p-[30px]">
          <MonthlySubscriptionTab />
        </div>
      </div>
    </Container>
  );
}
