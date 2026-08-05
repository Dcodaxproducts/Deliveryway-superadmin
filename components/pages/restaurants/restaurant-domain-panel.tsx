"use client";

import { Check, Copy, ExternalLink, Globe2, Link2, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";
import {
  useGetCustomDomainStatus,
  useVerifyCustomDomain,
} from "@/hooks/useRestaurant";

const CUSTOMER_BASE_DOMAIN =
  process.env.NEXT_PUBLIC_CUSTOMER_APP_BASE_DOMAIN?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
  "delivery-way.de";

const toUrl = (domain: string) =>
  domain.startsWith("http://") || domain.startsWith("https://")
    ? domain
    : `https://${domain}`;

export const getRestaurantStorefrontHost = (
  restaurant?: Pick<Restaurant, "subdomain"> | null,
) =>
  restaurant?.subdomain
    ? `${restaurant.subdomain}.${CUSTOMER_BASE_DOMAIN}`
    : null;

export const getRestaurantStorefrontUrl = (
  restaurant?: Pick<Restaurant, "subdomain"> | null,
) => {
  const host = getRestaurantStorefrontHost(restaurant);

  return host ? `https://${host}` : null;
};

export function RestaurantDomainPanel({ restaurant }: { restaurant: Restaurant }) {
  const text = useTranslations("restaurants");
  const storefrontUrl = getRestaurantStorefrontUrl(restaurant);
  const customDomainUrl = restaurant.customDomain ? toUrl(restaurant.customDomain) : null;
  const customDomainVerified = Boolean(restaurant.customDomainVerifiedAt);
  const domainStatus = useGetCustomDomainStatus(
    restaurant.id,
    Boolean(restaurant.customDomain),
  );
  const verifyDomain = useVerifyCustomDomain();
  const dns = domainStatus.data?.dns;

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(text("domainCopied"));
    } catch {
      toast.error(text("domainCopyFailed"));
    }
  };

  return (
    <section className="rounded-[18px] bg-[#f7f8fa] p-5 md:p-7" aria-labelledby="restaurant-domain-title">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Globe2 aria-hidden="true" size={20} />
          </div>
          <h2 id="restaurant-domain-title" className="text-xl font-semibold tracking-[-0.02em] text-dark">
            {text("storefrontDomains")}
          </h2>
          <p className="mt-1 max-w-[62ch] text-sm leading-6 text-gray">
            {text("storefrontDomainsDescription")}
          </p>
        </div>

        {storefrontUrl && (
          <Button asChild variant="primary" className="h-11 self-start rounded-xl active:scale-[0.98]">
            <a href={storefrontUrl} target="_blank" rel="noreferrer">
              {text("openStorefront")}
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <DomainRow
          icon={<Link2 aria-hidden="true" size={18} />}
          label={text("platformDomain")}
          url={storefrontUrl}
          status={text("live")}
          verified
          copyLabel={text("copyDomain")}
          openLabel={text("openDomain")}
          onCopy={copyUrl}
        />
        <DomainRow
          icon={customDomainVerified ? <ShieldCheck aria-hidden="true" size={18} /> : <Globe2 aria-hidden="true" size={18} />}
          label={text("customDomain")}
          url={customDomainUrl}
          status={customDomainVerified ? text("verified") : customDomainUrl ? text("verificationPending") : text("notConfigured")}
          verified={customDomainVerified}
          copyLabel={text("copyDomain")}
          openLabel={text("openDomain")}
          emptyText={text("customDomainEmpty")}
          canOpen={customDomainVerified}
          onCopy={copyUrl}
        />
      </div>

      {restaurant.customDomain ? (
        <div className="mt-4 rounded-[14px] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.05)] md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-dark">
                {text("dnsSetupTitle")}
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray">
                {text("dnsSetupDescription")}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              className="h-10 shrink-0 rounded-xl"
              disabled={customDomainVerified || domainStatus.isLoading || verifyDomain.isPending}
              onClick={() => verifyDomain.mutate(restaurant.id)}
            >
              {verifyDomain.isPending ? (
                <Loader2 aria-hidden="true" className="animate-spin" size={16} />
              ) : null}
              {customDomainVerified ? text("verified") : text("verifyDns")}
            </Button>
          </div>

          {domainStatus.isError ? (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {text("dnsStatusLoadFailed")}
            </p>
          ) : dns ? (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <DnsValue label={text("dnsRecordType")} value={dns.type} onCopy={copyUrl} />
              <DnsValue label={text("dnsRecordHost")} value={dns.host} onCopy={copyUrl} />
              <DnsValue label={text("dnsRecordTarget")} value={dns.target} onCopy={copyUrl} />
            </div>
          ) : (
            <div className="mt-4 h-16 animate-pulse rounded-xl bg-[#f1f2f4]" />
          )}

          <p className="mt-4 text-xs leading-5 text-gray">
            {text("dnsPropagationHint")}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function DnsValue({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (value: string) => Promise<void>;
}) {
  return (
    <div className="rounded-xl bg-[#f7f8fa] p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate text-sm font-semibold text-dark">{value}</code>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0 rounded-lg p-0"
          aria-label={label}
          onClick={() => onCopy(value)}
        >
          <Copy aria-hidden="true" size={14} />
        </Button>
      </div>
    </div>
  );
}

function DomainRow({
  icon,
  label,
  url,
  status,
  verified,
  copyLabel,
  openLabel,
  emptyText,
  canOpen = true,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  url: string | null;
  status: string;
  verified: boolean;
  copyLabel: string;
  openLabel: string;
  emptyText?: string;
  canOpen?: boolean;
  onCopy: (url: string) => Promise<void>;
}) {
  return (
    <article className="rounded-[14px] bg-white p-4 shadow-[0_10px_30px_rgba(17,24,39,0.05)] md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#f1f2f4] text-dark">
            {icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-dark">{label}</p>
            <Badge
              variant="outline"
              className={verified ? "mt-1 border-green/20 bg-green/10 text-green" : "mt-1 border-[#e3e5e8] bg-[#f7f8fa] text-gray"}
            >
              {verified && <Check aria-hidden="true" />}
              {status}
            </Badge>
          </div>
        </div>
      </div>

      {url ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f7f8fa] p-2 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-sm text-dark">{url.replace(/^https?:\/\//, "")}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-lg p-0"
            aria-label={copyLabel}
            title={copyLabel}
            onClick={() => onCopy(url)}
          >
            <Copy aria-hidden="true" size={16} />
          </Button>
          {canOpen && (
            <Button asChild variant="outline" size="icon" className="size-9 shrink-0 rounded-lg p-0">
              <a href={url} target="_blank" rel="noreferrer" aria-label={openLabel} title={openLabel}>
                <ExternalLink aria-hidden="true" size={16} />
              </a>
            </Button>
          )}
        </div>
      ) : (
        <p className="mt-5 text-sm leading-6 text-gray">{emptyText}</p>
      )}
    </article>
  );
}
