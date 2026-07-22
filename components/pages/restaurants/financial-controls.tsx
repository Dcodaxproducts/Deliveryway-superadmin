"use client";

import { useState } from "react";
import { CreditCard, ReceiptText, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

import { Restaurant } from "@/types/restaurant";
import { cn } from "@/lib/utils";
import { ServiceChargePanel } from "@/components/pages/restaurants/service-charge-panel";
import { RestaurantPayoutPanel } from "@/components/pages/restaurants/restaurant-payout-panel";
import { StripeAccountPanel } from "@/components/pages/restaurants/stripe-account-panel";

type FinancialTab = "service-charge" | "payouts" | "stripe";

const tabs = [
  { id: "service-charge", labelKey: "serviceChargeTab", icon: ReceiptText },
  { id: "payouts", labelKey: "payoutsTab", icon: Wallet },
  { id: "stripe", labelKey: "stripeTab", icon: CreditCard },
] as const;

export function FinancialControls({ restaurant }: { restaurant: Restaurant }) {
  const text = useTranslations("restaurants");
  const [activeTab, setActiveTab] = useState<FinancialTab>("service-charge");

  return (
    <section className="overflow-hidden rounded-[16px] border border-[#e9eaee] bg-[#fafafa]">
      <div className="px-4 py-5 md:px-6">
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-dark">
          {text("financialControls")}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray">
          {text("financialControlsDescription")}
        </p>
      </div>

      <div
        role="tablist"
        aria-label={text("financialControls")}
        className="grid grid-cols-1 gap-2 border-y border-[#e9eaee] bg-white p-2 sm:grid-cols-3"
      >
        {tabs.map(({ id, labelKey, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`financial-panel-${id}`}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray hover:bg-gray-50 hover:text-dark",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {text(labelKey)}
            </button>
          );
        })}
      </div>

      <div
        id={`financial-panel-${activeTab}`}
        role="tabpanel"
        className="bg-white p-3 md:p-5"
      >
        {activeTab === "service-charge" ? <ServiceChargePanel restaurant={restaurant} /> : null}
        {activeTab === "payouts" ? <RestaurantPayoutPanel restaurantId={restaurant.id} /> : null}
        {activeTab === "stripe" ? <StripeAccountPanel restaurantId={restaurant.id} /> : null}
      </div>
    </section>
  );
}
