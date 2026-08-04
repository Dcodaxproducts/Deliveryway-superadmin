"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  useConfigureGlobalPayoutProvider,
  useGlobalPayoutProviderSettings,
} from "@/hooks/usePayoutProviders";
import type { PayoutProvider } from "@/services/payoutProviders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const keepPlaceholder = configuration?.credentialsConfigured
      ? t("secretKeepPlaceholder")
      : undefined;
    const primaryPlaceholder =
      provider === "STRIPE"
        ? maskedLast4(
            configuration?.publicDetails.secretKeyLast4,
            keepPlaceholder,
          )
        : maskedLast4(
            configuration?.publicDetails.clientIdLast4,
            keepPlaceholder,
          );
    const secondaryPlaceholder =
      provider === "STRIPE"
        ? maskedLast4(
            configuration?.publicDetails.publishableKeyLast4,
            keepPlaceholder,
          )
        : maskedLast4(
            configuration?.publicDetails.clientSecretLast4,
            keepPlaceholder,
          );

    return (
      <Card key={provider}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>{provider}</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor={`${provider}-enabled`}>
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
          <p className="text-sm text-muted-foreground">
            {configuration?.credentialsConfigured
              ? t("globalPayoutConfigured")
              : t("globalPayoutNotConfigured")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              {provider === "STRIPE"
                ? t("stripeSecretKey")
                : t("paypalClientId")}
            </Label>
            <Input
              type="password"
              value={form.primary}
              placeholder={primaryPlaceholder}
              onChange={(event) =>
                update(provider, "primary", event.target.value)
              }
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label>
              {provider === "STRIPE"
                ? t("stripePublishableKey")
                : t("paypalClientSecret")}
            </Label>
            <Input
              type="password"
              value={form.secondary}
              placeholder={secondaryPlaceholder}
              onChange={(event) =>
                update(provider, "secondary", event.target.value)
              }
              autoComplete="new-password"
            />
          </div>
          {provider === "STRIPE" ? (
            <div className="space-y-2">
              <Label>{t("stripeWebhookSecret")}</Label>
              <Input
                type="password"
                value={form.webhook}
                placeholder={maskedLast4(
                  configuration?.publicDetails.webhookSecretLast4,
                  keepPlaceholder,
                )}
                onChange={(event) =>
                  update(provider, "webhook", event.target.value)
                }
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                {isProduction ? t("stripeLiveKeyHint") : t("stripeTestKeyHint")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{t("paypalEnvironment")}</Label>
              <Select value={form.environment} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SANDBOX">Sandbox</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("providerEnvironmentLocked")}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t("globalPayoutNote")}</Label>
            <Textarea
              value={form.note}
              onChange={(event) => update(provider, "note", event.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() => save(provider)}
            disabled={configure.isPending || isLoading}
          >
            {t("saveGlobalPayoutProvider")}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <section className="space-y-4 rounded-[14px] bg-white p-4 lg:p-[30px]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">
            {t("globalPayoutProviders")}
          </h2>
          <Badge variant={isProduction ? "destructive" : "secondary"}>
            {t("checkoutEnvironment", { environment: deploymentEnvironment })}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {t("globalPayoutProvidersDescription")}
        </p>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {isProduction
            ? t("productionCredentialWarning")
            : t("testCredentialWarning")}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {renderProvider("STRIPE")}
        {renderProvider("PAYPAL")}
      </div>
    </section>
  );
}
