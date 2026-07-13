"use client";

import { useTranslations } from "next-intl";

import Container from "@/components/container";
import Header from "@/components/header";
import { WeeklyPayoutInvoicePanel } from "@/components/pages/invoicing/weekly-payout-invoice-panel";

export default function WeeklyPayoutInvoicePage() {
  const invoicing = useTranslations("invoicing");

  return (
    <Container>
      <div className="w-full space-y-7">
        <Header
          title={invoicing("weeklyPayoutTitle")}
          description={invoicing("weeklyPayoutDescription")}
        />

        <div className="rounded-[14px] bg-white p-4 shadow-sm lg:p-[30px]">
          <WeeklyPayoutInvoicePanel />
        </div>
      </div>
    </Container>
  );
}
