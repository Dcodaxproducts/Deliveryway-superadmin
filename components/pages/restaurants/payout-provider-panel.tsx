"use client";

import { useState } from "react";
import { Check, Loader2, RefreshCw, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useApprovePayoutProviderRequest,
  useCreateProviderPayout,
  usePayoutProviderSettings,
  useRejectPayoutProviderRequest,
} from "@/hooks/usePayoutProviders";
import type { PayoutProvider } from "@/services/payoutProviders";

export function PayoutProviderPanel({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const settings = usePayoutProviderSettings(restaurantId);
  const approve = useApprovePayoutProviderRequest(restaurantId);
  const reject = useRejectPayoutProviderRequest(restaurantId);
  const payout = useCreateProviderPayout(restaurantId);
  const [reviewNote, setReviewNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [provider, setProvider] = useState<PayoutProvider>("STRIPE");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [description, setDescription] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const enabledProviders =
    settings.data?.configurations.filter((item) => item.enabled) ?? [];
  const parsedAmount = Number(amount);
  const selectedProviderEnabled = enabledProviders.some(
    (item) => item.provider === provider,
  );

  const submitPayout = () => {
    if (
      !selectedProviderEnabled ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return;
    }
    const key = idempotencyKey || crypto.randomUUID();
    setIdempotencyKey(key);
    payout.mutate(
      {
        provider,
        amount: parsedAmount,
        currency: currency.trim().toUpperCase(),
        idempotencyKey: key,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAmount("");
          setDescription("");
          setIdempotencyKey("");
        },
      },
    );
  };

  return (
    <section className="mt-5 space-y-5 rounded-[14px] border border-[#e9eaee] bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-dark">
            Stripe & PayPal payout providers
          </h3>
          <p className="mt-1 text-sm text-gray">
            Approve owner-submitted provider details, then transfer wallet funds
            through the approved provider. Credentials remain encrypted and are
            never displayed.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => settings.refetch()}
          disabled={settings.isFetching}
        >
          {settings.isFetching ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-dark">
          Configuration requests
        </h4>
        {settings.data?.requests.length ? (
          settings.data.requests.map((request) => (
            <div
              key={request.provider}
              className="space-y-3 rounded-[10px] border border-[#e9eaee] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-dark">{request.provider}</p>
                  <p className="text-xs text-gray">
                    Status: {request.status} · Credentials submitted:{" "}
                    {request.credentialsSubmitted ? "Yes" : "No"}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-dark">
                  {request.status}
                </span>
              </div>
              <p className="break-all text-xs text-gray">
                {Object.entries(request.publicDetails)
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(" · ")}
              </p>
              {request.note ? (
                <p className="text-xs text-gray">Owner note: {request.note}</p>
              ) : null}
              {request.status === "REQUESTED" ? (
                <>
                  <Input
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    placeholder="Approval note (optional)"
                  />
                  <Input
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Rejection reason"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        approve.mutate({
                          provider: request.provider,
                          note: reviewNote.trim() || undefined,
                        })
                      }
                      disabled={approve.isPending || reject.isPending}
                    >
                      <Check className="mr-2 size-4" />
                      Approve & activate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        reject.mutate({
                          provider: request.provider,
                          reason: rejectionReason.trim(),
                        })
                      }
                      disabled={
                        !rejectionReason.trim() ||
                        approve.isPending ||
                        reject.isPending
                      }
                    >
                      <X className="mr-2 size-4" />
                      Reject
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-[10px] bg-gray-50 px-3 py-3 text-sm text-gray">
            No Stripe or PayPal configuration requests submitted.
          </p>
        )}
      </div>

      <div className="space-y-3 rounded-[10px] bg-gray-50 p-4">
        <div>
          <h4 className="text-sm font-semibold text-dark">
            Automated provider payout
          </h4>
          <p className="mt-1 text-xs text-gray">
            The wallet is debited only after Stripe or PayPal confirms the
            transfer. Retrying uses the same idempotency key.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-dark">
            Provider
            <select
              className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              value={provider}
              onChange={(event) =>
                setProvider(event.target.value as PayoutProvider)
              }
            >
              <option value="STRIPE">Stripe</option>
              <option value="PAYPAL">PayPal</option>
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-dark">
            Amount
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="500.00"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-dark">
            Currency
            <Input
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value.toUpperCase())
              }
              placeholder="EUR"
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-dark">
            Description
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Restaurant payout"
            />
          </label>
        </div>
        <Button
          type="button"
          onClick={submitPayout}
          disabled={
            !selectedProviderEnabled ||
            !Number.isFinite(parsedAmount) ||
            parsedAmount <= 0 ||
            payout.isPending
          }
        >
          {payout.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          Transfer & debit wallet
        </Button>
        {!selectedProviderEnabled ? (
          <p className="text-xs text-amber-700">
            {provider} is not approved for this restaurant.
          </p>
        ) : null}
      </div>
    </section>
  );
}
