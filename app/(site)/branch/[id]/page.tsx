"use client";

import { useParams } from "next/navigation";
import Container from "@/components/container";
import Header from "@/components/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Truck,
  CreditCard,
  Settings2,
  Percent
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetBranch } from "@/hooks/useRestaurant";
import { Skeleton } from "@/components/ui/skeleton";
import MyImage from "@/components/MyImage";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function BranchDetailsPage() {
  const common = useTranslations("common");
  const branches = useTranslations("branches");
  const profile = useTranslations("profile");
  const params = useParams();
  const branchId = params.id as string;

  const { data: branch, isLoading, isError } = useGetBranch(branchId);

  if (isLoading) {
    return (
      <Container>
        <div className="space-y-6">
          <div className="lg:space-y-[6px]">
            <Skeleton className="h-[28px] w-48 lg:h-[42px] lg:w-80 bg-white" />
            <Skeleton className="h-[20px] w-64 lg:h-[24px] lg:w-[450px] bg-white" />
          </div>

          <div className="flex flex-col gap-[32px] w-full bg-white p-4 lg:p-[30px] rounded-[14px]">
            {/* Hero Image Skeleton */}
            <Skeleton className="w-full h-[240px] rounded-[14px]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px]">
              {/* Left Column */}
              <div className="lg:col-span-5 space-y-8">
                <Skeleton className="h-[350px] w-full rounded-[14px]" />
                <Skeleton className="h-[200px] w-full rounded-[14px]" />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-7 space-y-8">
                <Skeleton className="h-[300px] w-full rounded-[14px]" />
                <Skeleton className="h-[250px] w-full rounded-[14px]" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (isError || !branch) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-white rounded-[14px] p-10 text-center">
          <p className="text-red-500 font-semibold text-lg">{branches("loadErrorTitle")}</p>
          <p className="text-gray-400 text-sm mb-4">{branches("loadErrorDescription")}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white rounded-lg transition-all">{branches("tryAgain")}</button>
        </div>
      </Container>
    );
  }

  // Safe Address Construction
  const fullAddress = [
    branch.address?.street,
    branch.address?.area,
    branch.address?.city,
    branch.address?.country
  ].filter(Boolean).join(", ") || branches("noAddressProvided");

  return (
    <Container>
      <Header
        title={branches("detailsTitle")}
        description={branches("detailsDescription")}
      />

      <div className="flex flex-col gap-[32px] w-full bg-white p-4 lg:p-[30px] rounded-[14px]">

        {/* Hero Section */}
        <div className="relative w-full h-[240px] rounded-[14px] overflow-hidden">
          <MyImage
            src={branch.coverImage || "/placeholder-branch.png"}
            alt={branch.name ?? branches("branchCover")}
            fill
            className="w-full h-full object-cover rounded-none"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            {branch.isMain && (
              <Badge className="bg-green text-white border-none px-4 py-1">{branches("mainBranch")}</Badge>
            )}
            <Badge className={cn(
              "border-none px-4 py-1",
              branch.isActive ? "bg-primary text-white" : "bg-gray-400 text-white"
            )}>
              {branch.isActive ? common("active") : common("inactive")}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px]">
          <div className="lg:col-span-5 space-y-[32px]">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> {branches("basicInformation")}
              </h3>
              <Card className="border-2 border-gray-50 rounded-[14px] p-6 space-y-4">
                <InfoRow label={branches("branchName")} value={branch.name ?? "-"} className="capitalize" />
                <InfoRow label={branches("restaurant")} value={branch.restaurant?.name ?? common("notAvailable")} className="capitalize" />
                <InfoRow label={branches("address")} value={fullAddress} />
                <InfoRow label={branches("description")} value={branch.description || branches("noDescriptionProvided")} className="capitalize" />
                <InfoRow label={branches("branchId")} value={branch.id ? `#${branch.id}` : "-"} />
                <div className="pt-2 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-gray text-sm">
                    <Phone size={16} /> {branch.settings?.contact?.phone ?? branches("noPhone")}
                  </div>
                  <div className="flex items-center gap-2 text-green text-sm">
                    <MessageCircle size={16} /> {branch.settings?.contact?.whatsapp ?? branches("noWhatsapp")}
                  </div>
                </div>
              </Card>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                <Percent size={20} className="text-primary" /> {branches("taxationAutomation")}
              </h3>
              <Card className="border-2 border-gray-50 rounded-[14px] p-6 space-y-4">
                <InfoRow label={branches("taxPercentage")} value={`${branch.settings?.taxation?.taxPercentage ?? 0}%`} />
                <InfoRow label={branches("autoAcceptOrders")} value={branch.settings?.automation?.autoAcceptOrders ? common("enabled") : common("disabled")} />
                <InfoRow label={branches("estimatedPrepTime")} value={`${branch.settings?.automation?.estimatedPrepTime ?? 0} ${branches("mins")}`} />
              </Card>
            </section>
          </div>

          {/* Right Column: Delivery & Settings */}
          <div className="lg:col-span-7 space-y-[32px]">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                <Truck size={20} className="text-primary" /> {branches("deliveryConfiguration")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-gray-50 rounded-[14px] p-6">
                  <Label className="font-medium">{branches("deliveryRadius")}</Label>
                  <p className="text-2xl font-semibold text-gray">{branch.settings?.deliveryConfig?.radiusKm ?? 0} KM</p>
                </Card>
                <Card className="border-2 border-gray-50 rounded-[14px] p-6">
                  <Label className="font-medium">{branches("deliveryFee")}</Label>
                  <p className="text-2xl font-semibold text-gray">${branch.settings?.deliveryConfig?.deliveryFee ?? 0}</p>
                </Card>
                <Card className="border-2 border-gray-50 rounded-[14px] p-6 col-span-1 md:col-span-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <Label className="font-medium mb-2">{branches("freeDeliveryThreshold")}</Label>
                      <p className="text-xl font-semibold text-gray">${branch.settings?.deliveryConfig?.freeDeliveryThreshold ?? 0}</p>
                    </div>
                    <Badge className={cn(
                      "border-none",
                      branch.settings?.deliveryConfig?.isFreeDelivery ? "bg-green/10 text-green" : "bg-gray-100 text-gray-500"
                    )}>
                      {branch.settings?.deliveryConfig?.isFreeDelivery ? branches("freeDeliveryActive") : branches("standardRates")}
                    </Badge>
                  </div>
                </Card>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-dark flex items-center gap-2">
                <Settings2 size={20} className="text-primary" /> {branches("orderPayments")}
              </h3>
              <Card className="border-2 border-gray-50 rounded-[14px] p-6 space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray flex items-center gap-2">
                    <Clock size={16} /> {branches("allowedOrderTypes")}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {branch.settings?.allowedOrderTypes?.length ? (
                      branch.settings.allowedOrderTypes.map((type: string) => (
                        <Badge key={type} variant="secondary" className="rounded-md capitalize">{type.toLowerCase().replace('_', ' ')}</Badge>
                      ))
                    ) : <span className="text-gray-400 text-sm italic">{profile("noneSpecified")}</span>}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray flex items-center gap-2">
                    <CreditCard size={16} /> {branches("paymentMethods")}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {branch.settings?.allowedPaymentMethods?.length ? (
                      branch.settings.allowedPaymentMethods.map((method: string) => (
                        <Badge key={method} className="bg-primary/10 text-primary border-none rounded-md">
                          {method.replace('_', ' ')}
                        </Badge>
                      ))
                    ) : <span className="text-gray-400 text-sm italic">{profile("noneSpecified")}</span>}
                  </div>
                </div>
              </Card>
            </section>
          </div>

        </div>
      </div>
    </Container>
  );
}

function InfoRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="font-medium">{label}</Label>
      <span className={cn("text-base text-gray truncate", className)}>{value}</span>
    </div>
  );
}
