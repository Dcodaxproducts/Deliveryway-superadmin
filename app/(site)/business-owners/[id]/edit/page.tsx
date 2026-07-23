"use client";

import Container from "@/components/container";
import Header from "@/components/header";
import { BusinessOwnerEditForm } from "@/components/pages/business-owners/business-owner-edit-form";
import RestaurantDetailsSkeleton from "@/components/skeleton/restaurant-details-skeleton";
import { useGetTenant } from "@/hooks/useTenants";
import { BusinessOwnerDetails } from "@/services/tenants";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

const EditTenant = () => {
  const businessOwners = useTranslations("businessOwners");
  const common = useTranslations("common");
  const params = useParams();
  const { data: response, isLoading } = useGetTenant(params.id as string);

  if (isLoading) return <RestaurantDetailsSkeleton />;

  const tenant = (response?.data ?? response) as
    | BusinessOwnerDetails
    | undefined;

  if (!tenant) {
    return (
      <Container>
        <Header title={businessOwners("editDetailsTitle")} />
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-gray-500">
          {common("noDataFound")}
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header title={businessOwners("editDetailsTitle")} />
      <div className="w-full">
        <BusinessOwnerEditForm
          tenantId={params.id as string}
          initialData={tenant}
        />
      </div>
    </Container>
  );
};

export default EditTenant;
