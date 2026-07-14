"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MoreVertical,
  Package,
  Pencil,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  useGetTenants,
  useDeleteTenant,
  useUpdateTenant,
  useApproveBusinessAdmin,
} from "@/hooks/useTenants";
import Pagination from "@/components/pagination";
import DeleteDialog from "@/components/dialogs/delete-dialog";
import AddBusinessOwnerModal from "../pages/business-owners/AddBusinessOwnerModal";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type RequirementTone = "success" | "warning" | "danger" | "muted" | "primary";

type RequirementBadgeProps = {
  label: string;
  value: string;
  tone: RequirementTone;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
};

type BusinessOwnerRow = {
  id: string;
  ownerId?: string;
  isVerified: boolean;
  isApproved: boolean;
  isActive: boolean;
  planName?: string | null;
  subscriptionStatus?: string | null;
  paymentStatus?: string | null;
  [key: string]: any;
};

type TruncatedWithTooltipProps = {
  value: React.ReactNode;
  tooltip: string;
  className?: string;
};

function TruncatedWithTooltip({
  value,
  tooltip,
  className = "",
}: TruncatedWithTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`block min-w-0 truncate ${className}`}
          tabIndex={0}
          title={tooltip}
        >
          {value}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs whitespace-normal break-words">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

const getToneClasses = (tone: RequirementTone) => {
  const tones: Record<RequirementTone, string> = {
    success: "border-green-100 bg-green-50 text-green-700",
    warning: "border-amber-100 bg-amber-50 text-amber-700",
    danger: "border-red-100 bg-red-50 text-red-700",
    muted: "border-gray-100 bg-gray-50 text-gray-600",
    primary: "border-primary/10 bg-primary/5 text-primary",
  };

  return tones[tone];
};

function RequirementBadge({
  label,
  value,
  tone,
  icon,
  disabled,
  onClick,
  title,
}: RequirementBadgeProps) {
  const className = `inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition ${getToneClasses(
    tone,
  )} ${
    onClick
      ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-65 disabled:shadow-none"
      : ""
  }`;

  const content = (
    <>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/70">
        {icon}
      </span>

      <span className="min-w-0 leading-none">
        <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-70">
          {label}
        </span>
        <span className="mt-1 block truncate text-xs font-semibold">
          {value}
        </span>
      </span>
    </>
  );

  if (!onClick) {
    return <div className={className} title={title || value}>{content}</div>;
  }

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {content}
    </button>
  );
}

const formatStatusLabel = (value?: string | null) =>
  value ? value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "N/A";

const getSubscriptionTone = (status?: string | null): RequirementTone => {
  if (status === "ACTIVE" || status === "PAID") return "success";
  if (status === "FAILED" || status === "CANCELLED" || status === "REFUNDED") return "danger";
  if (status === "PENDING" || status === "PAST_DUE") return "warning";

  return "muted";
};

const getOverallStatus = (item: BusinessOwnerRow) => {
  const isActive = Boolean(item?.isActive);
  const isApproved = Boolean(item?.isApproved);
  const isVerified = Boolean(item?.isVerified);

  if (!isActive) {
    return {
      labelKey: "status.accessDisabled",
      descriptionKey: "status.accessDisabledDescription",
      className: "bg-red-50 text-red-700 ring-red-100",
      icon: <UserX size={14} />,
    };
  }

  if (!isApproved && !isVerified) {
    return {
      labelKey: "status.approvalTwoFactorPending",
      descriptionKey: "status.approvalTwoFactorPendingDescription",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
      icon: <Clock3 size={14} />,
    };
  }

  if (!isApproved) {
    return {
      labelKey: "status.pendingApproval",
      descriptionKey: "status.pendingApprovalDescription",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
      icon: <ShieldCheck size={14} />,
    };
  }

  if (!isVerified) {
    return {
      labelKey: "status.twoFactorPending",
      descriptionKey: "status.twoFactorPendingDescription",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
      icon: <Clock3 size={14} />,
    };
  }

  return {
    labelKey: "status.accessGranted",
    descriptionKey: "status.accessGrantedDescription",
    className: "bg-green-50 text-green-700 ring-green-100",
    icon: <CheckCircle2 size={14} />,
  };
};

export default function BusinessOwnerTable({
  refreshKey,
  search,
  setExportData,
}: {
  refreshKey: number;
  search: string;
  setExportData?: (data: any[]) => void;
}) {
  const common = useTranslations("common");
  const businessOwnersText = useTranslations("businessOwners");
  const dialogs = useTranslations("dialogs");
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [activeUpdatingId, setActiveUpdatingId] = useState<string | null>(null);
  const [approvalUpdatingId, setApprovalUpdatingId] = useState<string | null>(
    null,
  );

  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, refetch } = useGetTenants({
    page,
    search,
    sortOrder: "DESC",
    withDeleted: false,
    includeInactive: true,
  });

  const { mutate: deleteTenant } = useDeleteTenant();
  const { mutate: updateTenant } = useUpdateTenant();
  const { mutate: approveBusinessAdmin } = useApproveBusinessAdmin();

  const businessOwners = useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta;

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  useEffect(() => {
    if (businessOwners.length) {
      setExportData?.(businessOwners);
    }
  }, [businessOwners, setExportData, refreshKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!actionMenuRef.current) return;

      if (!actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = () => {
    if (!deleteId) return;

    setIsDeleting(true);

    deleteTenant(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        refetch();
      },
      onSettled: () => setIsDeleting(false),
    });
  };

  const handleActiveToggle = (item: BusinessOwnerRow, nextValue: boolean) => {
    if (!item?.id) return;

    setActiveUpdatingId(item.id);

    updateTenant(
      {
        id: item.id,
        data: {
          isActive: nextValue,
        },
      },
      {
        onSuccess: () => {
          refetch();
        },
        onSettled: () => {
          setActiveUpdatingId(null);
        },
      },
    );
  };

  const handleApproveOwner = (item: BusinessOwnerRow) => {
    if (!item?.ownerId || approvalUpdatingId === item?.id) return;

    setApprovalUpdatingId(item.id);

    approveBusinessAdmin(item.ownerId, {
      onSuccess: () => {
        refetch();
        setOpenActionId(null);
      },
      onSettled: () => {
        setApprovalUpdatingId(null);
      },
    });
  };

  const handleEdit = (item: BusinessOwnerRow) => {
    setOpenActionId(null);
    router.push(`/business-owners/${item.id}/edit`);
  };

  const handleDeleteClick = (item: BusinessOwnerRow) => {
    setOpenActionId(null);
    setDeleteId(item.id);
  };

  const tableColSpan = 7;

  const skeletonRows = useMemo(() => Array.from({ length: 6 }), []);

  return (
    <>
      <div className="max-w-full overflow-hidden rounded-lg border border-gray-100">
      <Table className="min-w-[960px] table-fixed">
        <colgroup>
          <col className="w-[7%]" />
          <col className="w-[15%]" />
          <col className="w-[18%]" />
          <col className="w-[16%]" />
          <col className="w-[17%]" />
          <col className="w-[18%]" />
          <col className="w-[9%]" />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>{businessOwnersText("serial")}</TableHead>
            <TableHead>{businessOwnersText("businessOwner")}</TableHead>
            <TableHead>{businessOwnersText("details")}</TableHead>
            <TableHead>{businessOwnersText("tenant")}</TableHead>
            <TableHead>{businessOwnersText("subscription")}</TableHead>
            <TableHead>{common("status")}</TableHead>
            <TableHead className="text-center">{common("actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading
            ? skeletonRows.map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={tableColSpan}>
                    <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                  </TableCell>
                </TableRow>
              ))
            : businessOwners.map((item: BusinessOwnerRow, i: number) => {
                const businessOwnerName = item.name || "N/A";
                const businessName = item.name || "-";
                const businessSlug = item.slug || "-";
                const businessBio = item.bio || "-";

                const logoUrl =
                  typeof item.logoUrl === "string" &&
                  item.logoUrl !== "[object Object]"
                    ? item.logoUrl
                    : null;

                const status = getOverallStatus(item);
                const planName = item.planName || "N/A";
                const subscriptionStatus = item.subscriptionStatus || null;
                const paymentStatus = item.paymentStatus || null;
                const isActiveUpdating = activeUpdatingId === item.id;
                const isApprovalUpdating = approvalUpdatingId === item.id;
                const isApprovedAndVerified =
                  Boolean(item?.isApproved) && Boolean(item?.isVerified);
                const canClickApprove =
                  Boolean(item?.ownerId) &&
                  (!item?.isApproved || !item?.isVerified);
                const approveActionTitle = isApprovedAndVerified
                  ? businessOwnersText("alreadyApproved")
                  : businessOwnersText("approve");
                const isActionMenuOpen = openActionId === item.id;

                return (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="pt-5">{i + 1}</TableCell>

                    <TableCell className="pt-5 font-medium capitalize">
                      <TruncatedWithTooltip
                        value={businessOwnerName}
                        tooltip={businessOwnerName}
                      />
                    </TableCell>

                    <TableCell className="pt-5 whitespace-normal">
                      <div className="flex min-w-0 flex-col">
                        <TruncatedWithTooltip
                          value={businessName}
                          tooltip={businessName}
                          className="font-medium text-gray-900"
                        />
                        <TruncatedWithTooltip
                          value={businessSlug}
                          tooltip={businessSlug}
                          className="text-sm text-gray-500"
                        />
                        <TruncatedWithTooltip
                          value={businessBio}
                          tooltip={businessBio}
                          className="text-xs text-gray-400"
                        />
                      </div>
                    </TableCell>

                    <TableCell className="pt-5">
                      <div className="flex min-w-0 items-center gap-2">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={businessName}
                            className="h-8 w-8 shrink-0 rounded-lg border object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-gray-50 text-xs font-semibold text-gray-500">
                            {businessName.slice(0, 1).toUpperCase()}
                          </div>
                        )}

                        <TruncatedWithTooltip
                          value={item.id}
                          tooltip={item.id}
                          className="text-sm text-gray-600"
                        />
                      </div>
                    </TableCell>

                    <TableCell className="py-4 whitespace-normal">
                      <div className="grid min-w-0 grid-cols-1 gap-2">
                        <RequirementBadge
                          label="Plan"
                          value={planName}
                          tone={planName === "N/A" ? "muted" : "primary"}
                          icon={<Package size={14} />}
                          title={planName}
                        />
                        <RequirementBadge
                          label="Subscription"
                          value={formatStatusLabel(subscriptionStatus)}
                          tone={getSubscriptionTone(subscriptionStatus)}
                          icon={<Clock3 size={14} />}
                          title={formatStatusLabel(subscriptionStatus)}
                        />
                        <RequirementBadge
                          label="Payment"
                          value={formatStatusLabel(paymentStatus)}
                          tone={getSubscriptionTone(paymentStatus)}
                          icon={<CreditCard size={14} />}
                          title={formatStatusLabel(paymentStatus)}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="py-4 whitespace-normal">
                      <div className="min-w-0 space-y-3">
                        <div>
                          <span
                            className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${status.className}`}
                            title={businessOwnersText(status.labelKey)}
                          >
                            {status.icon}
                            <span className="truncate">
                              {businessOwnersText(status.labelKey)}
                            </span>
                          </span>
                          <TruncatedWithTooltip
                            value={businessOwnersText(status.descriptionKey)}
                            tooltip={businessOwnersText(status.descriptionKey)}
                            className="mt-1 text-[11px] leading-5 text-gray-500"
                          />
                        </div>

                        <div className="grid min-w-0 grid-cols-1 gap-2">
                          <RequirementBadge
                            label={businessOwnersText("twoFactor")}
                            value={item?.isVerified ? businessOwnersText("verified") : businessOwnersText("pending")}
                            tone={item?.isVerified ? "success" : "warning"}
                            disabled={!canClickApprove || isApprovalUpdating}
                            onClick={
                              canClickApprove
                                ? () => handleApproveOwner(item)
                                : undefined
                            }
                            title={approveActionTitle}
                            icon={
                              isApprovalUpdating ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : item?.isVerified ? (
                                <ShieldCheck size={14} />
                              ) : (
                                <Clock3 size={14} />
                              )
                            }
                          />

                          <RequirementBadge
                            label={businessOwnersText("approval")}
                            value={item?.isApproved ? businessOwnersText("approved") : businessOwnersText("required")}
                            tone={item?.isApproved ? "success" : "primary"}
                            disabled={!canClickApprove || isApprovalUpdating}
                            onClick={
                              canClickApprove
                                ? () => handleApproveOwner(item)
                                : undefined
                            }
                            title={approveActionTitle}
                            icon={
                              isApprovalUpdating ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : item?.isApproved ? (
                                <UserCheck size={14} />
                              ) : (
                                <ShieldCheck size={14} />
                              )
                            }
                          />

                          <RequirementBadge
                            label={businessOwnersText("access")}
                            value={item?.isActive ? common("active") : common("disabled")}
                            tone={item?.isActive ? "success" : "danger"}
                            disabled={isActiveUpdating}
                            onClick={() => handleActiveToggle(item, !item?.isActive)}
                            title={
                              item?.isActive
                                ? businessOwnersText("disablePlatformAccess")
                                : businessOwnersText("enablePlatformAccess")
                            }
                            icon={
                              isActiveUpdating ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : item?.isActive ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <UserX size={14} />
                              )
                            }
                          />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="pt-5 text-center">
                      <div
                        className="relative inline-flex justify-center"
                        ref={isActionMenuOpen ? actionMenuRef : null}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionId((prev) =>
                              prev === item.id ? null : item.id,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                          aria-label={businessOwnersText("openActions")}
                        >
                          <MoreVertical size={17} />
                        </button>

                        {isActionMenuOpen ? (
                          <div className="absolute right-0 top-10 z-30 w-[230px] overflow-hidden rounded-xl border border-gray-100 bg-white py-1 text-left shadow-xl">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                            >
                              <Pencil size={15} />
                              {businessOwnersText("editBusinessOwner")}
                            </button>

                            <div className="my-1 h-px bg-gray-100" />

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(item)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              {common("delete")}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
      </div>

      {meta ? <Pagination {...meta} onPageChange={setPage} /> : null}

      <DeleteDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteId(null);
          }
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={dialogs("deleteBusinessOwner")}
        description={dialogs("deleteBusinessOwnerDescription")}
      />

      <AddBusinessOwnerModal
        open={Boolean(editData)}
        onOpenChange={(open) => {
          if (!open) {
            setEditData(null);
          }
        }}
        initialData={editData}
      />
    </>
  );
}
