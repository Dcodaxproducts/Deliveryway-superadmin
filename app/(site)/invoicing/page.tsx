"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Container from "../../../components/container";
import Header from "@/components/header";
import { GeneratedInvoicesHistoryTab } from "@/components/pages/invoicing/generated-invoices-history-tab";
import { MonthlySubscriptionTab } from "@/components/pages/invoicing/monthly-subscription-tab";
import { WeeklyPayoutInvoicePanel } from "@/components/pages/invoicing/weekly-payout-invoice-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InvoicingTab = "generated-history" | "weekly-payout" | "monthly-subscription";

const INVOICING_TABS: { value: InvoicingTab; label: string; description: string }[] = [
  {
    value: "generated-history",
    label: "Generated History",
    description: "All generated invoice documents and send/download activity.",
  },
  {
    value: "weekly-payout",
    label: "Weekly Payout",
    description: "Create and share weekly restaurant payout invoices.",
  },
  {
    value: "monthly-subscription",
    label: "Monthly Subscription",
    description: "Manage restaurant subscription invoices and billing status.",
  },
];

export default function InvoicingPage() {
  const invoicing = useTranslations("invoicing");
  const [activeTab, setActiveTab] = useState<InvoicingTab>("generated-history");

  const activeTabMeta = INVOICING_TABS.find((tab) => tab.value === activeTab);

  return (
    <Container>
      <div className="w-full space-y-7">
        <Header
          title={invoicing("dashboardTitle")}
          description={invoicing("dashboardDescription")}
        />

        <div className="space-y-5 rounded-[14px] bg-white p-4 shadow-sm lg:p-[30px]">
          <div className="rounded-2xl border border-[#EEF0F4] bg-[#F8FAFC] p-2">
            <div className="grid gap-2 md:grid-cols-3">
              {INVOICING_TABS.map((tab) => {
                const isActive = activeTab === tab.value;

                return (
                  <Button
                    key={tab.value}
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "h-auto justify-start rounded-xl px-4 py-3 text-left hover:bg-white",
                      isActive && "bg-white text-primary shadow-sm hover:bg-white",
                    )}
                  >
                    <span className="block">
                      <span className="block text-sm font-semibold">{tab.label}</span>
                      <span className="mt-1 block whitespace-normal text-xs font-normal text-gray-500">
                        {tab.description}
                      </span>
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-dark">{activeTabMeta?.label}</h2>
            <p className="text-sm text-gray-500">{activeTabMeta?.description}</p>
          </div>

          {activeTab === "generated-history" ? <GeneratedInvoicesHistoryTab /> : null}
          {activeTab === "weekly-payout" ? <WeeklyPayoutInvoicePanel /> : null}
          {activeTab === "monthly-subscription" ? <MonthlySubscriptionTab /> : null}
        </div>
      </div>
    </Container>
  );
}
