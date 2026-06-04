"use client";

import {
  CalendarDays,
  Layers3,
  Percent,
  type LucideIcon,
} from "lucide-react";

type PricingModelOption = "HYBRID" | "PLAN" | "COMMISSION";

type StepSelectPricingModelProps = {
  value: PricingModelOption;
  onChange: (value: PricingModelOption) => void;
};

const pricingModels: Array<{
  value: PricingModelOption;
  title: string;
  description: string;
  icon: LucideIcon;
  recommended?: boolean;
}> = [
  {
    value: "HYBRID",
    title: "Hybrid",
    description: "Minimum monthly fee and revenue share with optional max cap.",
    icon: Percent,
  },
  {
    value: "PLAN",
    title: "Monthly Flat Fee subscription",
    description: "Fixed monthly amount with optional bundles and features.",
    icon: CalendarDays,
    recommended: true,
  },
  {
    value: "COMMISSION",
    title: "Fixed Fee/% Per Order",
    description: "Flat amount or percentage charged per order placed.",
    icon: Layers3,
  },
];

export default function StepSelectPricingModel({
  value,
  onChange,
}: StepSelectPricingModelProps) {
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
                Recommended
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
              {model.title}
            </h3>

            <p className="mt-2 text-sm leading-5 text-[#684848]">
              {model.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}