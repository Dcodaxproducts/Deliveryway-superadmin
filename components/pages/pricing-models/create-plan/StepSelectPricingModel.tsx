"use client";

import {
  CalendarDays,
  Layers3,
  Percent,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

type PricingModelOption = "HYBRID" | "PLAN" | "COMMISSION";

type StepSelectPricingModelProps = {
  value: PricingModelOption;
  onChange: (value: PricingModelOption) => void;
};

const pricingModels: Array<{
  value: PricingModelOption;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  recommended?: boolean;
}> = [
  {
    value: "HYBRID",
    titleKey: "display.pricingModels.hybrid",
    descriptionKey: "create.pricingModels.hybridDescription",
    icon: Percent,
  },
  {
    value: "PLAN",
    titleKey: "display.pricingModels.planSubscription",
    descriptionKey: "create.pricingModels.planDescription",
    icon: CalendarDays,
    recommended: true,
  },
  {
    value: "COMMISSION",
    titleKey: "display.pricingModels.commissionPerOrder",
    descriptionKey: "create.pricingModels.commissionDescription",
    icon: Layers3,
  },
];

export function StepSelectPricingModel({
  value,
  onChange,
}: StepSelectPricingModelProps) {
  const pricingModel = useTranslations("pricingModel");

  return (
    <div className="grid w-full max-w-[920px] grid-cols-1 gap-6 md:grid-cols-2">
      {pricingModels.map((model) => {
        const Icon = model.icon;
        const isSelected = value === model.value;

        return (
          <button
            key={model.value}
            type="button"
            onClick={() => onChange(model.value)}
            className={`
              relative min-h-[178px] rounded-2xl border p-7 text-left transition-all
              ${
                isSelected
                  ? "border-primary bg-red-50/40"
                  : "border-slate-200 bg-white shadow-sm hover:border-red-200"
              }
            `}
          >
            {model.recommended && (
              <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-md bg-primary px-10 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                {pricingModel("create.recommended")}
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <div
                className={`
                  flex size-11 items-center justify-center rounded-xl
                  ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-primary"
                  }
                `}
              >
                <Icon size={22} />
              </div>

              <div
                className={`
                  flex size-5 items-center justify-center rounded-full border
                  ${isSelected ? "border-primary" : "border-red-300"}
                `}
              >
                {isSelected && (
                  <div className="size-2.5 rounded-full bg-primary" />
                )}
              </div>
            </div>

            <h3 className="mt-8 text-lg font-bold text-[#1F2328]">
              {pricingModel(model.titleKey)}
            </h3>

            <p className="mt-2 text-sm leading-5 text-[#684848]">
              {pricingModel(model.descriptionKey)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
