"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  ShieldCheck,
} from "lucide-react";

import Pagination from "@/components/pagination";
import AsyncSelect from "@/components/ui/AsyncSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStaffActivityLogs } from "@/hooks/useStaffActivityLogs";
import { getStaffList } from "@/services/employees";
import { getRestaurants } from "@/services/restaurant";
import type {
  StaffActivityAction,
  StaffActivityLog,
} from "@/services/staffActivityLogs";

type StaffOption = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

type RestaurantOption = {
  id: string;
  name?: string | null;
};

type ActionFilter = "ALL" | StaffActivityAction;

const ALL_FILTER = "ALL";
const ACTIONS: StaffActivityAction[] = [
  "LOGIN",
  "LOGOUT",
  "CREATE",
  "UPDATE",
  "DELETE",
  "OTHER",
];

const ACTION_CLASSES: Record<StaffActivityAction, string> = {
  LOGIN: "border-sky-100 bg-sky-50 text-sky-700",
  LOGOUT: "border-slate-200 bg-slate-50 text-slate-600",
  CREATE: "border-emerald-100 bg-emerald-50 text-emerald-700",
  UPDATE: "border-amber-100 bg-amber-50 text-amber-700",
  DELETE: "border-red-100 bg-red-50 text-red-700",
  OTHER: "border-violet-100 bg-violet-50 text-violet-700",
};

export function StaffActivityLogsPanel() {
  const activityLogs = useTranslations("activityLogs");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [staff, setStaff] = useState<StaffOption | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantOption | null>(null);
  const [action, setAction] = useState<ActionFilter>(ALL_FILTER);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      staffUserId: staff?.id,
      restaurantId: restaurant?.id,
      action: action === ALL_FILTER ? undefined : action,
      from: from || undefined,
      to: to || undefined,
    }),
    [action, from, page, restaurant?.id, search, staff?.id, to],
  );
  const query = useStaffActivityLogs(params);
  const logs = query.data?.data ?? [];
  const meta = query.data?.meta;
  const isLoading = query.isLoading || query.isFetching;

  const fetchStaff = useCallback(
    ({ search: optionSearch, page: optionPage }: { search: string; page: number }) =>
      getStaffList({
        page: optionPage,
        limit: 20,
        search: optionSearch || undefined,
      }),
    [],
  );
  const fetchRestaurants = useCallback(
    ({ search: optionSearch, page: optionPage }: { search: string; page: number }) =>
      getRestaurants({
        page: optionPage,
        limit: 20,
        search: optionSearch || undefined,
        includeInactive: true,
      }),
    [],
  );

  const resetPage = () => setPage(1);
  const clearFilters = () => {
    setSearch("");
    setStaff(null);
    setRestaurant(null);
    setAction(ALL_FILTER);
    setFrom("");
    setTo("");
    setPage(1);
  };

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#EEF0F4] bg-[#FAFBFC] p-4 lg:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Search className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-dark">{activityLogs("filtersTitle")}</h2>
            <p className="text-sm text-gray-500">{activityLogs("filtersDescription")}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <FilterField label={activityLogs("search")}>
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                resetPage();
              }}
              placeholder={activityLogs("searchPlaceholder")}
              className="h-11 bg-white"
            />
          </FilterField>

          <FilterField label={activityLogs("employee")}>
            <AsyncSelect
              value={staff}
              onChange={(value: StaffOption | null) => {
                setStaff(value);
                resetPage();
              }}
              fetchOptions={fetchStaff}
              placeholder={activityLogs("allEmployees")}
              searchPlaceholder={activityLogs("searchEmployees")}
              getOptionLabel={(option: StaffOption) =>
                `${option.firstName ?? ""} ${option.lastName ?? ""}`.trim() ||
                option.email ||
                option.id
              }
              className="h-11 bg-white"
            />
          </FilterField>

          <FilterField label={activityLogs("restaurant")}>
            <AsyncSelect
              value={restaurant}
              onChange={(value: RestaurantOption | null) => {
                setRestaurant(value);
                resetPage();
              }}
              fetchOptions={fetchRestaurants}
              placeholder={activityLogs("allRestaurants")}
              searchPlaceholder={activityLogs("searchRestaurants")}
              getOptionLabel={(option: RestaurantOption) =>
                option.name || option.id
              }
              className="h-11 bg-white"
            />
          </FilterField>

          <FilterField label={activityLogs("action")}>
            <Select
              value={action}
              onValueChange={(value) => {
                setAction(value as ActionFilter);
                resetPage();
              }}
            >
              <SelectTrigger className="h-11 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>{activityLogs("allActions")}</SelectItem>
                {ACTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {activityLogs(`actions.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label={activityLogs("fromDate")}>
            <Input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                resetPage();
              }}
              className="h-11 bg-white"
            />
          </FilterField>

          <FilterField label={activityLogs("toDate")}>
            <Input
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                resetPage();
              }}
              min={from || undefined}
              className="h-11 bg-white"
            />
          </FilterField>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={clearFilters}>
            {activityLogs("clearFilters")}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EEF0F4] bg-white shadow-sm">
        <div className="border-b border-[#EEF0F4] p-4 lg:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-dark">{activityLogs("resultsTitle")}</h2>
              <p className="text-sm text-gray-500">
                {activityLogs("resultsCount", { count: meta?.total ?? 0 })}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow>
                <TableHead>{activityLogs("dateTime")}</TableHead>
                <TableHead>{activityLogs("employee")}</TableHead>
                <TableHead>{activityLogs("action")}</TableHead>
                <TableHead>{activityLogs("activity")}</TableHead>
                <TableHead>{activityLogs("location")}</TableHead>
                <TableHead className="w-20 text-center">{activityLogs("details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <LoadingRow label={activityLogs("loading")} />
              ) : logs.length === 0 ? (
                <EmptyRow label={activityLogs("empty")} />
              ) : (
                logs.map((log) => {
                  const expanded = expandedId === log.id;
                  return (
                    <Fragment key={log.id}>
                      <TableRow>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDateTime(log.occurredAt)}
                        </TableCell>
                        <TableCell>
                          <StaffIdentity log={log} />
                        </TableCell>
                        <TableCell>
                          <ActionBadge action={log.action} label={activityLogs(`actions.${log.action}`)} />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-dark">{log.description}</p>
                          <p className="text-xs uppercase tracking-wide text-gray-500">{log.module}</p>
                        </TableCell>
                        <TableCell>
                          <Location log={log} platformLabel={activityLogs("platformWide")} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={activityLogs("toggleDetails")}
                            onClick={() => setExpandedId(expanded ? null : log.id)}
                          >
                            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expanded ? (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-[#FAFBFC] p-4">
                            <AuditDetails log={log} />
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="divide-y divide-[#EEF0F4] md:hidden">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="size-5 animate-spin" />
              {activityLogs("loading")}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">{activityLogs("empty")}</div>
          ) : (
            logs.map((log) => {
              const expanded = expandedId === log.id;
              return (
                <div key={log.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <StaffIdentity log={log} />
                    <ActionBadge action={log.action} label={activityLogs(`actions.${log.action}`)} />
                  </div>
                  <div>
                    <p className="font-medium text-dark">{log.description}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDateTime(log.occurredAt)}</p>
                  </div>
                  <Location log={log} platformLabel={activityLogs("platformWide")} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setExpandedId(expanded ? null : log.id)}
                  >
                    {expanded ? activityLogs("hideDetails") : activityLogs("showDetails")}
                  </Button>
                  {expanded ? <AuditDetails log={log} /> : null}
                </div>
              );
            })
          )}
        </div>

        {meta && meta.total > 0 ? (
          <div className="border-t border-[#EEF0F4] p-4">
            <Pagination {...meta} onPageChange={setPage} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-dark">{label}</label>
      {children}
    </div>
  );
}

function StaffIdentity({ log }: { log: StaffActivityLog }) {
  return (
    <div>
      <p className="font-medium text-dark">{log.staffName}</p>
      <p className="text-xs text-gray-500">{log.staffEmail}</p>
      {log.staffRoleName ? <p className="text-xs text-gray-500">{log.staffRoleName}</p> : null}
    </div>
  );
}

function ActionBadge({ action, label }: { action: StaffActivityAction; label: string }) {
  return (
    <Badge variant="outline" className={ACTION_CLASSES[action]}>
      {label}
    </Badge>
  );
}

function Location({ log, platformLabel }: { log: StaffActivityLog; platformLabel: string }) {
  return (
    <div className="text-sm">
      <p className="font-medium text-dark">{log.restaurantName || platformLabel}</p>
      {log.branchName ? <p className="text-xs text-gray-500">{log.branchName}</p> : null}
    </div>
  );
}

function AuditDetails({ log }: { log: StaffActivityLog }) {
  const activityLogs = useTranslations("activityLogs");
  const details = [
    [activityLogs("module"), log.module],
    [activityLogs("request"), [log.httpMethod, log.requestPath].filter(Boolean).join(" ") || "-"],
    [activityLogs("result"), log.statusCode ? String(log.statusCode) : "-"],
    [activityLogs("target"), log.targetId || "-"],
    [activityLogs("changedFields"), log.changedFields.length ? log.changedFields.join(", ") : "-"],
    [activityLogs("ipAddress"), log.ipAddress || "-"],
    [activityLogs("userAgent"), log.userAgent || "-"],
  ];

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
      {details.map(([label, value]) => (
        <div key={label} className="min-w-0 rounded-xl border border-[#EEF0F4] bg-white p-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
          <dd className="mt-1 break-words text-dark">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-48 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="size-5 animate-spin" />
          {label}
        </div>
      </TableCell>
    </TableRow>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={6} className="h-48 text-center text-gray-500">
        {label}
      </TableCell>
    </TableRow>
  );
}
