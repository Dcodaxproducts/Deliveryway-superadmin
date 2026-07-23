"use client";

import { useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import Container from "@/components/container";
import Header from "@/components/header";
import RestaurantDetailsSkeleton from "@/components/skeleton/restaurant-details-skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  useGetTenant,
  useResetBusinessOwnerPassword,
} from "@/hooks/useTenants";
import { BusinessOwnerDetails } from "@/services/tenants";
import { getImageUrl } from "@/utils/getImageUrl";

const BusinessOwnerDetailsPage = () => {
  const businessOwners = useTranslations("businessOwners");
  const common = useTranslations("common");
  const params = useParams();
  const tenantId = params.id as string;
  const { data: response, isLoading } = useGetTenant(tenantId);
  const resetPassword = useResetBusinessOwnerPassword();
  const [password, setPassword] = useState("");

  if (isLoading) return <RestaurantDetailsSkeleton />;

  const tenant = (response?.data ?? response) as
    | BusinessOwnerDetails
    | undefined;
  if (!tenant) {
    return (
      <Container>
        <Header title={businessOwners("detailsTitle")} />
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500">
          {common("noDataFound")}
        </div>
      </Container>
    );
  }

  const owner = tenant.owner;
  const profile = owner?.profile;
  const ownerName =
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    businessOwners("businessOwner");
  const subscription = tenant.tenantSubscriptions?.[0];
  const socialLinks = Object.entries(tenant.socialLinks ?? {}).filter(
    ([, value]) => Boolean(value),
  );

  const handlePasswordUpdate = () => {
    if (password.length < 8) return;

    resetPassword.mutate(
      { tenantId, password },
      { onSuccess: () => setPassword("") },
    );
  };

  return (
    <Container>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Header
          title={businessOwners("detailsTitle")}
          description={businessOwners("detailsDescription")}
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/business-owners">
              <ArrowLeft />
              {common("back")}
            </Link>
          </Button>
          <Button asChild variant="primary">
            <Link href={`/business-owners/${tenantId}/edit`}>
              <Pencil />
              {businessOwners("editBusinessOwner")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-24 bg-[linear-gradient(120deg,rgba(193,0,10,0.14),rgba(255,255,255,0.5),rgba(17,24,39,0.08))]" />
            <div className="-mt-12 flex flex-col gap-5 p-6 sm:flex-row sm:items-end">
              <Avatar
                src={profile?.avatarUrl}
                alt={ownerName}
                fallback={ownerName}
              />
              <div className="min-w-0 flex-1 pb-1">
                <h2 className="truncate text-2xl font-semibold text-gray-950">
                  {ownerName}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {owner?.email || "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  active={owner?.isActive ?? false}
                  activeText={common("active")}
                  inactiveText={common("inactive")}
                />
                <StatusBadge
                  active={owner?.isApproved ?? false}
                  activeText={businessOwners("approved")}
                  inactiveText={businessOwners("required")}
                />
                <StatusBadge
                  active={owner?.isVerified ?? false}
                  activeText={businessOwners("verified")}
                  inactiveText={businessOwners("pending")}
                />
              </div>
            </div>

            <div className="grid gap-4 border-t border-gray-100 p-6 md:grid-cols-2">
              <InfoRow icon={<Mail />} label={businessOwners("email")}>
                {owner?.email}
              </InfoRow>
              <InfoRow icon={<Phone />} label={businessOwners("phone")}>
                {profile?.phone}
              </InfoRow>
              <InfoRow icon={<UserRound />} label={businessOwners("role")}>
                {owner?.role}
              </InfoRow>
              <InfoRow
                icon={<CalendarDays />}
                label={businessOwners("accountCreated")}
              >
                {formatDate(owner?.createdAt)}
              </InfoRow>
              <div className="md:col-span-2">
                <InfoRow
                  icon={<UserRound />}
                  label={businessOwners("ownerBio")}
                >
                  {profile?.bio}
                </InfoRow>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Avatar
                src={tenant.logoUrl}
                alt={tenant.name}
                fallback={tenant.name}
                compact
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-950">
                  {tenant.name}
                </h2>
                <p className="text-sm text-gray-500">{tenant.slug}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoRow
                icon={<BriefcaseBusiness />}
                label={businessOwners("businessName")}
              >
                {tenant.name}
              </InfoRow>
              <InfoRow
                icon={<ShieldCheck />}
                label={businessOwners("businessAccess")}
              >
                {tenant.isActive ? common("active") : common("inactive")}
              </InfoRow>
              <div className="md:col-span-2">
                <InfoRow
                  icon={<BriefcaseBusiness />}
                  label={businessOwners("businessBio")}
                >
                  {tenant.bio}
                </InfoRow>
              </div>
            </div>

            {socialLinks.length ? (
              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  {businessOwners("socialLinks")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map(([label, value]) => (
                    <a
                      key={label}
                      href={String(value)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm capitalize text-gray-700 hover:border-primary/30 hover:text-primary"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-xl bg-primary/10 p-2 text-primary">
                <CreditCard className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-gray-950">
                {businessOwners("subscription")}
              </h2>
            </div>
            {subscription ? (
              <dl className="space-y-4 text-sm">
                <Detail
                  label={businessOwners("packagePlan")}
                  value={subscription.packagePlan?.name}
                />
                <Detail
                  label={common("status")}
                  value={subscription.status}
                />
                <Detail
                  label={businessOwners("paymentStatus")}
                  value={subscription.paymentStatus}
                />
                <Detail
                  label={businessOwners("billingModel")}
                  value={subscription.packagePlan?.billingModel}
                />
                <Detail
                  label={businessOwners("billingInterval")}
                  value={subscription.packagePlan?.billingInterval}
                />
                <Detail
                  label={businessOwners("nextBilling")}
                  value={formatDate(subscription.nextBillingAt)}
                />
              </dl>
            ) : (
              <p className="text-sm text-gray-500">
                {businessOwners("noSubscription")}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-950">
                {businessOwners("setNewPassword")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {businessOwners("passwordSecurityNotice")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{businessOwners("newPassword")}</Label>
              <PasswordInput
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={businessOwners("minimumCharacters")}
                autoComplete="new-password"
              />
            </div>
            <Button
              className="mt-4 w-full"
              variant="primary"
              disabled={password.length < 8 || resetPassword.isPending}
              onClick={handlePasswordUpdate}
            >
              {resetPassword.isPending
                ? businessOwners("updating")
                : businessOwners("updatePassword")}
            </Button>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="rounded-xl bg-gray-100 p-2 text-gray-700">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-semibold text-gray-950">
                {businessOwners("recordInformation")}
              </h2>
            </div>
            <dl className="space-y-4 text-sm">
              <Detail
                label={businessOwners("businessSlug")}
                value={tenant.slug}
              />
              <Detail
                label={businessOwners("createdAt")}
                value={formatDate(tenant.createdAt)}
              />
              <Detail
                label={businessOwners("updatedAt")}
                value={formatDate(tenant.updatedAt)}
              />
              <Detail label="ID" value={tenant.id} />
            </dl>
          </section>
        </div>
      </div>
    </Container>
  );
};

function Avatar({
  src,
  alt,
  fallback,
  compact = false,
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  compact?: boolean;
}) {
  const imageUrl = getImageUrl(src || null);
  const size = compact ? "h-16 w-16" : "h-24 w-24";

  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gray-100 text-xl font-semibold text-gray-600 shadow`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        fallback.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

function StatusBadge({
  active,
  activeText,
  inactiveText,
}: {
  active: boolean;
  activeText: string;
  inactiveText: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-green-50 text-green-700 ring-1 ring-green-100"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
      }`}
    >
      {active ? activeText : inactiveText}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-gray-50/70 p-4">
      <span className="mt-0.5 text-gray-400 [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm text-gray-900">
          {children || "—"}
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className="max-w-[60%] break-words text-right font-medium text-gray-900">
        {value || "—"}
      </dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(date);
}

export default BusinessOwnerDetailsPage;
