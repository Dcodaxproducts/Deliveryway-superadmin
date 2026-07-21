"use client";

import { useState } from "react";
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

const BusinessOwnerDetailsPage = () => {
  const businessOwners = useTranslations("businessOwners");
  const common = useTranslations("common");
  const params = useParams();
  const tenantId = params.id as string;
  const { data: response, isLoading } = useGetTenant(tenantId);
  const resetPassword = useResetBusinessOwnerPassword();
  const [password, setPassword] = useState("");

  if (isLoading) return <RestaurantDetailsSkeleton />;

  const tenant = response?.data ?? response;
  const owner = tenant?.owner;
  const ownerName = [owner?.profile?.firstName, owner?.profile?.lastName]
    .filter(Boolean)
    .join(" ");

  const handlePasswordUpdate = () => {
    if (password.length < 8) return;

    resetPassword.mutate(
      { tenantId, password },
      { onSuccess: () => setPassword("") },
    );
  };

  return (
    <Container>
      <Header title={businessOwners("detailsTitle")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[14px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">
            {tenant?.name || businessOwners("businessOwner")}
          </h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <Detail label={businessOwners("businessOwner")} value={ownerName} />
            <Detail label="Email" value={owner?.email} />
            <Detail label={businessOwners("phone")} value={owner?.profile?.phone} />
            <Detail
              label={businessOwners("approval")}
              value={tenant?.isApproved ? businessOwners("approved") : businessOwners("required")}
            />
            <Detail
              label={businessOwners("access")}
              value={owner?.isActive === false ? common("inactive") : common("active")}
            />
          </dl>
        </section>

        <section className="rounded-[14px] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-dark">
            {businessOwners("setNewPassword")}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {businessOwners("passwordSecurityNotice")}
          </p>
          <div className="mt-6 space-y-2">
            <Label>{businessOwners("newPassword")}</Label>
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={businessOwners("minimumCharacters")}
            />
          </div>
          <Button
            className="mt-4"
            disabled={password.length < 8 || resetPassword.isPending}
            onClick={handlePasswordUpdate}
          >
            {resetPassword.isPending
              ? businessOwners("updating")
              : businessOwners("updatePassword")}
          </Button>
        </section>
      </div>
    </Container>
  );
};

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-gray-100 pb-3">
      <dt className="font-medium text-gray-500">{label}</dt>
      <dd className="text-dark">{value || "—"}</dd>
    </div>
  );
}

export default BusinessOwnerDetailsPage;
