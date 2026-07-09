"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/useAuth";
import { useUpdateRestaurantServiceCharge } from "@/hooks/useRestaurant";
import { isSuperAdmin } from "@/lib/auth-role";

type ServiceChargeType = "PERCENTAGE" | "AMOUNT";

type ServiceChargeConfig = {
  isEnabled?: boolean;
  type?: ServiceChargeType;
  value?: number | string | null;
};

export function ServiceChargePanel({ restaurant }: { restaurant: any }) {
  const common = useTranslations("common");
  const restaurants = useTranslations("restaurants");
  const { data: user } = useUser();
  const updateServiceCharge = useUpdateRestaurantServiceCharge();
  const canManage = isSuperAdmin(user);

  const initialConfig = useMemo<ServiceChargeConfig>(() => {
    const fromRoot = restaurant?.serviceCharge;
    const fromSettings = restaurant?.settings?.serviceCharge;
    return fromRoot || fromSettings || {};
  }, [restaurant]);

  const [isEnabled, setIsEnabled] = useState(Boolean(initialConfig.isEnabled));
  const [type, setType] = useState<ServiceChargeType>(
    initialConfig.type === "AMOUNT" ? "AMOUNT" : "PERCENTAGE"
  );
  const [value, setValue] = useState(String(initialConfig.value ?? 0));

  useEffect(() => {
    setIsEnabled(Boolean(initialConfig.isEnabled));
    setType(initialConfig.type === "AMOUNT" ? "AMOUNT" : "PERCENTAGE");
    setValue(String(initialConfig.value ?? 0));
  }, [initialConfig]);

  const valueNumber = Number(value);
  const isInvalid = !Number.isFinite(valueNumber) || valueNumber < 0 || (type === "PERCENTAGE" && valueNumber > 100);

  const handleSave = () => {
    if (!restaurant?.id || isInvalid) return;

    updateServiceCharge.mutate({
      id: restaurant.id,
      data: {
        isEnabled,
        type,
        value: valueNumber,
      },
    });
  };

  return (
    <Card className="space-y-4 rounded-[14px] border-2 border-gray-50 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-dark">
            {restaurants("serviceChargeSettings")}
          </h3>
          <p className="mt-1 text-sm text-gray">
            {restaurants("serviceChargeDescription")}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} disabled={!canManage || updateServiceCharge.isPending} />
          {isEnabled ? common("enabled") : common("disabled")}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{restaurants("serviceChargeType")}</Label>
          <select
            className="h-[52px] w-full rounded-md border border-gray-200 bg-transparent px-3 text-base disabled:opacity-50"
            value={type}
            disabled={!canManage || updateServiceCharge.isPending}
            onChange={(event) => setType(event.target.value as ServiceChargeType)}
          >
            <option value="PERCENTAGE">{restaurants("percentage")}</option>
            <option value="AMOUNT">{restaurants("fixedAmount")}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>{restaurants("serviceChargeValue")}</Label>
          <Input
            type="number"
            min="0"
            max={type === "PERCENTAGE" ? "100" : undefined}
            step="0.01"
            value={value}
            disabled={!canManage || updateServiceCharge.isPending}
            onChange={(event) => setValue(event.target.value)}
            error={isInvalid ? restaurants("serviceChargeInvalid") : undefined}
          />
        </div>
      </div>

      {canManage ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            disabled={isInvalid || updateServiceCharge.isPending}
            onClick={handleSave}
          >
            {updateServiceCharge.isPending ? common("loading") : common("save")}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
