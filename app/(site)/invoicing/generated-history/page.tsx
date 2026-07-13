"use client";

import { useTranslations } from "next-intl";

import Container from "@/components/container";
import Header from "@/components/header";
import { GeneratedInvoicesHistoryTab } from "@/components/pages/invoicing/generated-invoices-history-tab";

export default function GeneratedInvoiceHistoryPage() {
  const invoicing = useTranslations("invoicing");

  return (
    <Container>
      <div className="w-full space-y-7">
        <Header
          title={invoicing("generatedHistoryTitle")}
          description={invoicing("generatedHistoryDescription")}
        />

        <div className="rounded-[14px] bg-white p-4 shadow-sm lg:p-[30px]">
          <GeneratedInvoicesHistoryTab />
        </div>
      </div>
    </Container>
  );
}
