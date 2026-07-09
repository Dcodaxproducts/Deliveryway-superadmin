"use client";

import { useState } from "react";
import { Banknote, CheckCircle2, Loader2, RefreshCw, Send, Wallet, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useApproveRestaurantPayoutRequest,
  useMarkRestaurantPayoutRequestPaid,
  useRejectRestaurantPayoutRequest,
  useRestaurantPayoutRequests,
  useRestaurantWallet,
} from "@/hooks/usePayoutRequests";
import { formatMoney } from "@/lib/currency";

type RestaurantPayoutPanelProps = {
  restaurantId?: string | null;
};

export function RestaurantPayoutPanel({ restaurantId }: RestaurantPayoutPanelProps) {
  const walletQuery = useRestaurantWallet(restaurantId);
  const payoutRequestsQuery = useRestaurantPayoutRequests(restaurantId);
  const approveRequest = useApproveRestaurantPayoutRequest(restaurantId);
  const rejectRequest = useRejectRestaurantPayoutRequest(restaurantId);
  const markPaidRequest = useMarkRestaurantPayoutRequestPaid(restaurantId);
  const [activePaidId, setActivePaidId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paidNote, setPaidNote] = useState("");
  const currency = walletQuery.data?.currency || "PKR";

  const refresh = () => {
    walletQuery.refetch();
    payoutRequestsQuery.refetch();
  };

  const markPaid = (id: string) => {
    markPaidRequest.mutate(
      {
        id,
        payload: {
          paymentReference: paymentReference.trim() || undefined,
          note: paidNote.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setActivePaidId(null);
          setPaymentReference("");
          setPaidNote("");
        },
      }
    );
  };

  return (
    <Card className="space-y-5 rounded-[14px] border border-gray-100 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            <h3 className="text-lg font-semibold text-dark">Restaurant wallet & payout requests</h3>
          </div>
          <p className="text-sm text-gray">
            Review wallet balance, approve or reject payout requests, and mark approved bank transfers as paid.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={refresh}
          disabled={!restaurantId || walletQuery.isFetching || payoutRequestsQuery.isFetching}
          className="h-10 rounded-[10px]"
        >
          {walletQuery.isFetching || payoutRequestsQuery.isFetching ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 size-4" />
          )}
          Refresh
        </Button>
      </div>

      {walletQuery.isError ? (
        <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-600">
          Unable to load restaurant wallet.
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard
          icon={<Wallet className="size-4" />}
          label="Wallet balance"
          value={walletQuery.isLoading ? "Loading..." : formatMoney(walletQuery.data?.balance, currency)}
        />
        <SummaryCard
          icon={<Banknote className="size-4" />}
          label="Wallet type"
          value={walletQuery.data?.type || "RESTAURANT_WALLET"}
        />
        <SummaryCard
          icon={<Wallet className="size-4" />}
          label="Customer wallet exposure"
          value={formatMoney(readAmount(walletQuery.data?.customerWalletExposure), currency)}
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-dark">Payout requests</h4>
        {payoutRequestsQuery.isLoading ? (
          <div className="h-[180px] animate-pulse rounded-[10px] bg-gray-100" />
        ) : null}
        {payoutRequestsQuery.isError ? (
          <p className="rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-600">
            Unable to load payout requests.
          </p>
        ) : null}
        {!payoutRequestsQuery.isLoading && !payoutRequestsQuery.isError ? (
          payoutRequestsQuery.data?.length ? (
            <div className="overflow-hidden rounded-[12px] border border-gray-100">
              {payoutRequestsQuery.data.map((request) => {
                const status = String(request.status || "REQUESTED").toUpperCase();
                const canApproveReject = status === "REQUESTED";
                const canMarkPaid = status === "APPROVED";
                const isPaidFormOpen = activePaidId === request.id;

                return (
                  <div key={request.id} className="space-y-3 border-b border-gray-100 p-4 last:border-b-0">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-semibold text-dark">
                            {formatMoney(request.amount, request.currency || currency)}
                          </span>
                          <StatusBadge status={status} />
                        </div>
                        <p className="text-xs text-gray">{formatBankDetails(request.bankDetails)}</p>
                        {request.note ? <p className="text-xs text-gray">Note: {request.note}</p> : null}
                        {request.paymentReference ? (
                          <p className="text-xs font-medium text-dark">Reference: {request.paymentReference}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {canApproveReject ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => approveRequest.mutate(request.id)}
                              disabled={approveRequest.isPending || rejectRequest.isPending}
                            >
                              <CheckCircle2 className="mr-1.5 size-4" />
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => rejectRequest.mutate(request.id)}
                              disabled={approveRequest.isPending || rejectRequest.isPending}
                            >
                              <XCircle className="mr-1.5 size-4" />
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {canMarkPaid ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setActivePaidId(isPaidFormOpen ? null : request.id)}
                          >
                            <Send className="mr-1.5 size-4" />
                            Mark paid
                          </Button>
                        ) : null}
                      </div>
                    </div>

                    {isPaidFormOpen ? (
                      <div className="grid gap-3 rounded-[10px] bg-gray-50 p-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <Field label="Payment reference" htmlFor={`reference-${request.id}`}>
                          <Input
                            id={`reference-${request.id}`}
                            value={paymentReference}
                            onChange={(event) => setPaymentReference(event.target.value)}
                            placeholder="BANK-TXN-123"
                          />
                        </Field>
                        <Field label="Note" htmlFor={`note-${request.id}`}>
                          <Input
                            id={`note-${request.id}`}
                            value={paidNote}
                            onChange={(event) => setPaidNote(event.target.value)}
                            placeholder="Transferred to bank account"
                          />
                        </Field>
                        <Button
                          type="button"
                          onClick={() => markPaid(request.id)}
                          disabled={markPaidRequest.isPending}
                          className="h-11 rounded-[10px]"
                        >
                          {markPaidRequest.isPending ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : null}
                          Confirm paid
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-[10px] bg-gray-50 px-3 py-3 text-sm text-gray">
              No payout requests yet.
            </p>
          )
        ) : null}
      </div>
    </Card>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-gray-100 p-4">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray">{label}</p>
      <p className="mt-2 text-sm font-semibold text-dark">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "PAID"
      ? "bg-green-100 text-green-700"
      : status === "REJECTED"
        ? "bg-red-100 text-red-700"
        : status === "APPROVED"
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function readAmount(record?: Record<string, unknown>) {
  const value = record?.totalBalance ?? record?.balance ?? record?.totalExposure ?? record?.amount;
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBankDetails(bankDetails: Record<string, unknown>) {
  const values = [bankDetails.bankName, bankDetails.accountTitle, bankDetails.accountNumber, bankDetails.iban]
    .filter(Boolean)
    .map(String);

  return values.length ? values.join(" · ") : "Bank details unavailable";
}
