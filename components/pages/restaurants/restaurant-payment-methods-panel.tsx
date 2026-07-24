"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useRestaurantPaymentMethods,
  useUpdateRestaurantPaymentMethods,
} from "@/hooks/useRestaurantPaymentMethods";
import type { RestaurantPaymentMethodCode } from "@/services/restaurantPaymentMethods";

type RestaurantPaymentMethodsPanelProps = {
  restaurantId?: string | null;
};

const methodLabelKeys: Record<RestaurantPaymentMethodCode, string> = {
  COD: "paymentMethodCod",
  CARD_ON_DELIVERY: "paymentMethodCardOnDelivery",
  PAYPAL: "paymentMethodPaypal",
  STRIPE: "paymentMethodStripe",
  WALLET: "paymentMethodWallet",
};

export function RestaurantPaymentMethodsPanel({
  restaurantId,
}: RestaurantPaymentMethodsPanelProps) {
  const text = useTranslations("restaurants");
  const paymentMethodsQuery = useRestaurantPaymentMethods(restaurantId);
  const updatePaymentMethods = useUpdateRestaurantPaymentMethods(restaurantId);
  const [selectedMethods, setSelectedMethods] = useState<
    RestaurantPaymentMethodCode[]
  >([]);

  useEffect(() => {
    if (paymentMethodsQuery.data) {
      setSelectedMethods(paymentMethodsQuery.data.allowedPaymentMethods);
    }
  }, [paymentMethodsQuery.data]);

  const toggleMethod = (method: RestaurantPaymentMethodCode) => {
    setSelectedMethods((current) =>
      current.includes(method)
        ? current.filter((entry) => entry !== method)
        : [...current, method],
    );
  };

  const activeMethods = paymentMethodsQuery.data?.activePlatformMethods ?? [];

  return (
    <Card className="space-y-5 rounded-[14px] border border-gray-100 p-4 md:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CreditCard className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-semibold text-dark">
            {text("paymentMethodsTitle")}
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray">
            {text("paymentMethodsDescription")}
          </p>
        </div>
      </div>

      {paymentMethodsQuery.isLoading ? (
        <div className="flex min-h-28 items-center justify-center text-gray">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        </div>
      ) : null}

      {paymentMethodsQuery.isError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {text("paymentMethodsLoadFailed")}
        </p>
      ) : null}

      {!paymentMethodsQuery.isLoading && !paymentMethodsQuery.isError ? (
        activeMethods.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {activeMethods.map((method) => {
              const selected = selectedMethods.includes(method);

              return (
                <label
                  key={method}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-dark"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMethod(method)}
                    className="size-4 accent-primary"
                  />
                  {text(methodLabelKeys[method])}
                </label>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {text("paymentMethodsNoneActive")}
          </p>
        )
      ) : null}

      {selectedMethods.length === 0 && activeMethods.length > 0 ? (
        <p className="text-sm font-medium text-red-600">
          {text("paymentMethodsRequired")}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={() => updatePaymentMethods.mutate(selectedMethods)}
          disabled={
            selectedMethods.length === 0 ||
            paymentMethodsQuery.isLoading ||
            updatePaymentMethods.isPending
          }
          className="min-w-36 rounded-xl"
        >
          {updatePaymentMethods.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {text("paymentMethodsSave")}
        </Button>
      </div>
    </Card>
  );
}
