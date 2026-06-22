"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CreditCard, Loader2, Send, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useCreateRestaurantStripeTransfer,
  useRestaurantStripeAccount,
  useUpdateRestaurantStripeAccount,
} from "@/hooks/useStripeAccounts";
import { useGetGlobalSettings } from "@/hooks/useGlobalSettings";

type StripeAccountPanelProps = {
  restaurantId?: string | null;
};

export function StripeAccountPanel({ restaurantId }: StripeAccountPanelProps) {
  const accountQuery = useRestaurantStripeAccount(restaurantId);
  const globalSettingsQuery = useGetGlobalSettings();
  const updateAccount = useUpdateRestaurantStripeAccount();
  const createTransfer = useCreateRestaurantStripeTransfer();
  const [accountId, setAccountId] = useState("");
  const [dashboardUrl, setDashboardUrl] = useState("");
  const [note, setNote] = useState("");
  const [chargesEnabled, setChargesEnabled] = useState(false);
  const [payoutsEnabled, setPayoutsEnabled] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [description, setDescription] = useState("");
  const stripe = accountQuery.data?.data.stripe;
  const parsedAmount = Number(amount);
  const transferDisabled =
    !restaurantId ||
    !stripe?.accountId ||
    !stripe.payoutsEnabled ||
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0 ||
    createTransfer.isPending;

  useEffect(() => {
    if (!stripe) return;
    setAccountId(stripe.accountId ?? "");
    setDashboardUrl(stripe.dashboardUrl ?? "");
    setNote(stripe.note ?? "");
    setChargesEnabled(Boolean(stripe.chargesEnabled));
    setPayoutsEnabled(Boolean(stripe.payoutsEnabled));
    setOnboardingComplete(Boolean(stripe.onboardingComplete));
  }, [stripe]);

  useEffect(() => {
    const defaultCurrency = globalSettingsQuery.data?.defaultCurrency;
    if (defaultCurrency && currency === "PKR") {
      setCurrency(defaultCurrency);
    }
  }, [currency, globalSettingsQuery.data?.defaultCurrency]);

  const saveAccount = () => {
    if (!restaurantId) return;

    updateAccount.mutate({
      restaurantId,
      payload: {
        accountId: accountId.trim() || null,
        dashboardUrl: dashboardUrl.trim() || null,
        note: note.trim() || null,
        chargesEnabled,
        payoutsEnabled,
        onboardingComplete,
      },
    });
  };

  const submitTransfer = () => {
    if (transferDisabled || !restaurantId) return;

    createTransfer.mutate(
      {
        restaurantId,
        payload: {
          amount: parsedAmount,
          currency: currency.trim() || undefined,
          description: description.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setAmount("");
          setDescription("");
        },
      }
    );
  };

  return (
    <Card className="space-y-5 rounded-[14px] border border-gray-100 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Stripe account</h3>
          </div>
          <p className="text-sm text-gray">
            Manage this restaurant's connected account and send manual Stripe
            transfers.
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            stripe?.payoutsEnabled
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {stripe?.payoutsEnabled ? "Payouts enabled" : "Payouts disabled"}
        </span>
      </div>

      {accountQuery.isLoading ? (
        <div className="h-[180px] animate-pulse rounded-[10px] bg-gray-100" />
      ) : null}

      {!accountQuery.isLoading && accountQuery.isError ? (
        <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-600">
          Unable to load Stripe account.
        </p>
      ) : null}

      {!accountQuery.isLoading && !accountQuery.isError ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Stripe account ID" htmlFor="stripe-account-id">
              <Input
                id="stripe-account-id"
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
                placeholder="acct_..."
              />
            </Field>
            <Field label="Dashboard URL" htmlFor="stripe-dashboard-url">
              <Input
                id="stripe-dashboard-url"
                value={dashboardUrl}
                onChange={(event) => setDashboardUrl(event.target.value)}
                placeholder="https://dashboard.stripe.com/..."
              />
            </Field>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <StripeSwitch
              label="Charges"
              checked={chargesEnabled}
              onCheckedChange={setChargesEnabled}
            />
            <StripeSwitch
              label="Payouts"
              checked={payoutsEnabled}
              onCheckedChange={setPayoutsEnabled}
            />
            <StripeSwitch
              label="Onboarding"
              checked={onboardingComplete}
              onCheckedChange={setOnboardingComplete}
            />
          </div>

          <Field label="Internal note" htmlFor="stripe-note">
            <Input
              id="stripe-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Stripe account note"
            />
          </Field>

          <Button
            type="button"
            onClick={saveAccount}
            disabled={!restaurantId || updateAccount.isPending}
            className="h-11 rounded-[10px]"
          >
            {updateAccount.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save Stripe Settings
          </Button>

          <div className="space-y-4 rounded-[12px] border border-gray-100 bg-gray-50 p-4">
            <div>
              <h4 className="text-sm font-semibold text-dark">
                Create transfer
              </h4>
              <p className="text-xs text-gray">
                Requires a connected account ID and payouts enabled.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_120px]">
              <Field label="Amount" htmlFor="stripe-transfer-amount">
                <Input
                  id="stripe-transfer-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="100.00"
                />
              </Field>
              <Field label="Currency" htmlFor="stripe-transfer-currency">
                <Input
                  id="stripe-transfer-currency"
                  value={currency}
                  onChange={(event) =>
                    setCurrency(event.target.value.toUpperCase())
                  }
                  placeholder={globalSettingsQuery.data?.defaultCurrency || "PKR"}
                />
              </Field>
            </div>
            <Field label="Description" htmlFor="stripe-transfer-description">
              <Input
                id="stripe-transfer-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Restaurant payout"
              />
            </Field>
            <Button
              type="button"
              onClick={submitTransfer}
              disabled={transferDisabled}
              className="h-11 rounded-[10px]"
            >
              {createTransfer.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Send Transfer
            </Button>
          </div>
        </>
      ) : null}
    </Card>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function StripeSwitch({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-gray-100 px-4 py-3">
      <span className="text-sm font-semibold text-dark">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
