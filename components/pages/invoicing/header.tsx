"use client";

import { Button } from "@/components/ui/button";
import Header from "../../header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export type BillingCycleOption = {
  value: string;
  label: string;
  fromDate: string;
  toDate: string;
};

type InvoicingHeaderProps = {
  title: string;
  description: string;
  billingCycle: string;
  billingCycleOptions: BillingCycleOption[];
  onBillingCycleChange: (value: string) => void;
  onGenerateClick: () => void;
};

export function InvoicingHeader({
  title,
  description,
  billingCycle,
  billingCycleOptions,
  onBillingCycleChange,
  onGenerateClick,
}: InvoicingHeaderProps) {
  const invoicing = useTranslations("invoicing");

  return (
    <div className="flex w-full flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
      <Header title={title} description={description} />

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end lg:gap-[12px]">
        <div className="flex w-full flex-col gap-1 sm:w-auto">
          <span className="text-base text-gray-600">
            {invoicing("billingCycle")}
          </span>

          <Select value={billingCycle} onValueChange={onBillingCycleChange}>
            <SelectTrigger className="h-[44px] w-full rounded-lg sm:w-[190px]">
              <SelectValue placeholder={invoicing("selectMonth")} />
            </SelectTrigger>

            <SelectContent>
              {billingCycleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={onGenerateClick}
          className="h-[44px] w-full sm:w-auto"
        >
          <PlusCircle size={17} className="mr-2" />
          {invoicing("generateInvoice")}
        </Button>
      </div>
    </div>
  );
}
