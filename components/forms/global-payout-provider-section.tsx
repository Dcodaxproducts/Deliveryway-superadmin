"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  RotateCcw,
  Save,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  useConfigureGlobalPayoutProvider,
  useGlobalPayoutProviderSettings,
} from "@/hooks/usePayoutProviders";
import type { PayoutProvider } from "@/services/payoutProviders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type ProviderForm = {
  enabled: boolean;
  primary: string;
  secondary: string;
  webhook: string;
  environment: "SANDBOX" | "LIVE";
  note: string;
};

const emptyForm = (): ProviderForm => ({
  enabled: true,
  primary: "",
  secondary: "",
  webhook: "",
  environment: "SANDBOX",
  note: "",
});

const maskedLast4 = (value: unknown, fallback?: string) =>
  typeof value === "string" && value.length > 0 ? `••••••••${value}` : fallback;

function CredentialField({
  id,
  label,
  savedValue,
  value,
  onChange,
}: {
  id: string;
  label: string;
  savedValue?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [isReplacing, setIsReplacing] = useState(!savedValue);

  useEffect(() => {
    if (savedValue && !value) setIsReplacing(false);
  }, [savedValue, value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {savedValue ? (
          <button
            type="button"
            onClick={() => {
              if (isReplacing) onChange("");
              setIsReplacing((current) => !current);
            }}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <RotateCcw size={13} aria-hidden="true" />
            {isReplacing ? "Keep saved" : "Replace"}
          </button>
        ) : null}
      </div>
      <div className="relative">
        <LockKeyhole
          className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          id={id}
          type="password"
          value={isReplacing ? value : (savedValue ?? "")}
          readOnly={!isReplacing}
          placeholder={isReplacing ? "Enter credential" : undefined}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          className={`h-12 rounded-[11px] border-slate-300 pl-10 pr-3 ${!isReplacing ? "bg-slate-50 font-mono text-slate-700" : "bg-white"}`}
        />
      </div>
      {savedValue && !isReplacing ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={13} aria-hidden="true" /> Saved securely
        </p>
      ) : null}
    </div>
  );
}

export function GlobalPayoutProviderSection() {
  const t = useTranslations("globalSettings");
  const { data, isLoading } = useGlobalPayoutProviderSettings();
  const configure = useConfigureGlobalPayoutProvider();
  const [forms, setForms] = useState<Record<PayoutProvider, ProviderForm>>({
    STRIPE: emptyForm(),
    PAYPAL: emptyForm(),
  });

  useEffect(() => {
    if (!data) return;

    setForms((current) => {
      const expectedPayPalEnvironment: "SANDBOX" | "LIVE" =
        data.deploymentEnvironment === "production" ? "LIVE" : "SANDBOX";
      const next = {
        ...current,
        PAYPAL: {
          ...current.PAYPAL,
          environment: expectedPayPalEnvironment,
        },
      };
      for (const configuration of data.configurations) {
        next[configuration.provider] = {
          ...current[configuration.provider],
          enabled: configuration.enabled,
          environment: expectedPayPalEnvironment,
          note:
            typeof configuration.publicDetails.note === "string"
              ? configuration.publicDetails.note
              : "",
        };
      }
      return next;
    });
  }, [data]);

  const deploymentEnvironment = data?.deploymentEnvironment ?? "development";
  const isProduction = deploymentEnvironment === "production";

  const update = (
    provider: PayoutProvider,
    field: keyof ProviderForm,
    value: string | boolean,
  ) => {
    setForms((current) => ({
      ...current,
      [provider]: { ...current[provider], [field]: value },
    }));
  };

  const save = (provider: PayoutProvider) => {
    const form = forms[provider];
    configure.mutate({
      provider,
      enabled: form.enabled,
      note: form.note || undefined,
      ...(provider === "STRIPE"
        ? {
            stripeSecretKey: form.primary || undefined,
            stripePublishableKey: form.secondary || undefined,
            stripeWebhookSecret: form.webhook || undefined,
          }
        : {
            paypalClientId: form.primary || undefined,
            paypalClientSecret: form.secondary || undefined,
            paypalEnvironment: form.environment,
          }),
    });
  };

  const renderProvider = (provider: PayoutProvider) => {
    const form = forms[provider];
    const configuration = data?.configurations.find(
      (entry) => entry.provider === provider,
    );
    const savedFallback = configuration?.credentialsConfigured
      ? "•••••••••••• saved"
      : undefined;
    const primaryPlaceholder =
      provider === "STRIPE"
        ? maskedLast4(
            configuration?.publicDetails.secretKeyLast4,
            savedFallback,
          )
        : maskedLast4(
            configuration?.publicDetails.clientIdLast4,
            savedFallback,
          );
    const secondaryPlaceholder =
      provider === "STRIPE"
        ? maskedLast4(
            configuration?.publicDetails.publishableKeyLast4,
            savedFallback,
          )
        : maskedLast4(
            configuration?.publicDetails.clientSecretLast4,
            savedFallback,
          );

    return (
      <article
        key={provider}
        className="flex min-h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_16px_44px_rgba(15,23,42,0.06)]"
      >
        <header className="border-b border-slate-200 bg-slate-50/70 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-[13px] bg-white text-primary shadow-sm ring-1 ring-slate-200">
                {provider === "STRIPE" ? (
                  <CreditCard size={20} aria-hidden="true" />
                ) : (
                  <WalletCards size={20} aria-hidden="true" />
                )}
              </span>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-950">
                  {provider === "STRIPE" ? "Stripe" : "PayPal"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Customer checkout provider
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor={`${provider}-enabled`}
                className="text-xs font-semibold text-slate-600"
              >
                {t("globalPayoutEnabled")}
              </Label>
              <Switch
                id={`${provider}-enabled`}
                checked={form.enabled}
                onCheckedChange={(checked) =>
                  update(provider, "enabled", checked)
                }
              />
            </div>
          </div>
          <p
            className={`mt-4 flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs font-semibold ${configuration?.credentialsConfigured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
          >
            {configuration?.credentialsConfigured ? (
              <CheckCircle2 size={14} aria-hidden="true" />
            ) : (
              <LockKeyhole size={14} aria-hidden="true" />
            )}
            {configuration?.credentialsConfigured
              ? t("globalPayoutConfigured")
              : t("globalPayoutNotConfigured")}
          </p>
        </header>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="space-y-5">
            <CredentialField
              id={`${provider}-primary`}
              label={
                provider === "STRIPE"
                  ? t("stripeSecretKey")
                  : t("paypalClientId")
              }
              savedValue={primaryPlaceholder}
              value={form.primary}
              onChange={(value) => update(provider, "primary", value)}
            />
            <CredentialField
              id={`${provider}-secondary`}
              label={
                provider === "STRIPE"
                  ? t("stripePublishableKey")
                  : t("paypalClientSecret")
              }
              savedValue={secondaryPlaceholder}
              value={form.secondary}
              onChange={(value) => update(provider, "secondary", value)}
            />
            {provider === "STRIPE" ? (
              <div>
                <CredentialField
                  id={`${provider}-webhook`}
                  label={t("stripeWebhookSecret")}
                  savedValue={maskedLast4(
                    configuration?.publicDetails.webhookSecretLast4,
                    savedFallback,
                  )}
                  value={form.webhook}
                  onChange={(value) => update(provider, "webhook", value)}
                />
                <p className="mt-2 text-xs text-slate-500">
                  {isProduction
                    ? t("stripeLiveKeyHint")
                    : t("stripeTestKeyHint")}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{t("paypalEnvironment")}</Label>
                <Select value={form.environment} disabled>
                  <SelectTrigger className="h-12 rounded-[11px] border-slate-300 bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SANDBOX">Sandbox</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {t("providerEnvironmentLocked")}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("globalPayoutNote")}</Label>
              <Textarea
                value={form.note}
                onChange={(event) =>
                  update(provider, "note", event.target.value)
                }
                className="min-h-24 rounded-[11px] border-slate-300"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => save(provider)}
            disabled={configure.isPending || isLoading}
            variant="primary"
            className="mt-6 h-12 w-full rounded-[11px] shadow-[0_8px_20px_rgba(204,0,0,0.18)] active:scale-[0.98]"
          >
            <Save size={16} aria-hidden="true" />
            {configure.isPending ? "Saving…" : t("saveGlobalPayoutProvider")}
          </Button>
        </div>
      </article>
    );
  };

  return (
    <section className="space-y-6 rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {t("globalPayoutProviders")}
            </h2>
            <Badge variant={isProduction ? "destructive" : "secondary"}>
              {t("checkoutEnvironment", { environment: deploymentEnvironment })}
            </Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {t("globalPayoutProvidersDescription")}
          </p>
          <p className="mt-2 text-sm font-medium text-amber-700">
            {isProduction
              ? t("productionCredentialWarning")
              : t("testCredentialWarning")}
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-[11px] bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
          <ShieldCheck size={15} aria-hidden="true" /> Encrypted at rest
        </div>
      </div>
      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        {renderProvider("STRIPE")}
        {renderProvider("PAYPAL")}
      </div>
    </section>
  );
}
