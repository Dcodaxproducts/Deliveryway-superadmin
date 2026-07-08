"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { usePermissionModules, useStaffRole, useUpdateStaffRole } from "@/hooks/useRbac";
import { useParams, useSearchParams } from "next/navigation";
import {
  formatActionLabel,
  sanitizePermissions,
  sortPermissionModules,
  type StaffPermission,
} from "@/lib/permission-modules";

const normalizePermission = (value?: string) => String(value || "").trim().toLowerCase();

function RolePermissionsContent() {
  const rbac = useTranslations("rbac");
  const params = useParams();
  const searchParams = useSearchParams();
  const roleId = searchParams.get("role") || params?.id as string;
  const { data: role, isLoading, error } = useStaffRole(roleId);
  const { data: modulesData = [], isLoading: modulesLoading } = usePermissionModules();
  const updateRole = useUpdateStaffRole();
  const permissionModules = useMemo(() => sortPermissionModules(modulesData), [modulesData]);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    if (role?.permissions && permissionModules.length > 0) {
      const rolePermissions = permissionModules.map((module) => {
        const rolePermission = role.permissions.find(
          (permission: { access?: string; operations?: string[] }) =>
            normalizePermission(permission.access) === normalizePermission(module.accessKey),
        );

        return {
          access: module.accessKey,
          operations: rolePermission?.operations || [],
        };
      });

      const sanitized = sanitizePermissions(rolePermissions, permissionModules);
      setPermissions(
        sanitized.reduce<Record<string, string[]>>((next, permission) => {
          next[permission.access] = permission.operations;
          return next;
        }, {}),
      );
    } else if (permissionModules.length > 0) {
      setPermissions({});
    }
  }, [role, permissionModules]);

  const toPayloadPermissions = (nextPermissions = permissions) =>
    sanitizePermissions(
      Object.entries(nextPermissions).map(([access, operations]) => ({ access, operations })),
      permissionModules,
    );

  const handlePermissionChange = (access: string, operation: string, checked: boolean) => {
    setPermissionError(false);
    setPermissions(prev => {
      const currentChecked = prev[access] || [];
      const nextOperations = checked
        ? Array.from(new Set([...currentChecked, operation]))
        : currentChecked.filter(op => op !== operation);

      if (nextOperations.length === 0) {
        const next = { ...prev };
        delete next[access];
        return next;
      }

      return { ...prev, [access]: nextOperations };
    });
  };

  const handleSave = () => {
    const nextPermissions = toPayloadPermissions();

    if (!roleId || nextPermissions.length === 0) {
      setPermissionError(true);
      return;
    }

    updateRole.mutate({
      id: roleId,
      data: { permissions: nextPermissions satisfies StaffPermission[] },
    });
  };

  if (!roleId) {
    return (
      <Card className="p-4 lg:p-[30px] border-none gap-0 shadow-sm rounded-[14px] bg-white h-full">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-lg font-semibold text-gray-600 mb-4">
            {rbac("noRoleSelected")}
          </h2>
          <p className="text-sm text-gray-400 max-w-md">
            {rbac("noRoleSelectedDescription")}
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading || modulesLoading) return <div>{rbac("loadingPermissions")}</div>;
  if (error) return <div>{rbac("errorLoadingPermissions")}</div>;

  return (
    <Card className="p-4 lg:p-[30px] border-none gap-0 shadow-sm rounded-[14px] bg-white h-full">
      <div className="flex justify-between items-center mb-[6px]">
        <h2 className="text-lg font-semibold">
          {rbac("permission")} <span className="text-primary">{role?.name || rbac("manager")}</span>
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={updateRole.isPending}
        >
          {updateRole.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
      <p className="text-gray-400 text-sm mb-[24px]">{rbac("permissionsHelp")}</p>
      {permissionError ? (
        <p className="mb-3 text-sm text-primary">Select at least one permission action.</p>
      ) : null}

      <div className="w-full">
        <div className="grid grid-cols-12 py-[6px] border-y border-[#BBBBBB] text-gray font-semibold text-lg">
          <div className="col-span-4">{rbac("module")}</div>
          <div className="col-span-8">{rbac("accessRights")}</div>
        </div>

        <div>
          {permissionModules.map((item) => (
            <div
              key={item.accessKey}
              className="grid py-[24px] items-center"
              style={{ gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 2fr)" }}
            >
              <div className="flex items-start gap-[12px] pr-4">
                <ShieldCheck size={20} className="text-primary shrink-0 mt-1" />
                <div className="min-w-0">
                  <span className="text-gray font-semibold text-lg truncate block">
                    {item.name}
                  </span>
                  {item.description ? (
                    <span className="text-xs text-gray-400 line-clamp-2">
                      {item.description}
                    </span>
                  ) : null}
                </div>
              </div>

              <div />

              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-[10px] gap-y-[24px]">
                {item.defaultActions.map((operation) => (
                  <div
                    key={operation}
                    className="flex items-center gap-[12px] min-w-0"
                  >
                    <Checkbox
                      id={`${item.accessKey}-${operation}`}
                      checked={permissions[item.accessKey]?.includes(operation) || false}
                      onCheckedChange={(checked) => handlePermissionChange(item.accessKey, operation, checked as boolean)}
                      className="w-[20px] h-[20px] data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    />
                    <label
                      htmlFor={`${item.accessKey}-${operation}`}
                      className="text-sm text-dark cursor-pointer truncate min-w-0"
                      title={formatActionLabel(operation)}
                    >
                      {formatActionLabel(operation)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function RolePermissions() {
  const rbac = useTranslations("rbac");

  return (
    <Suspense fallback={<div>{rbac("loadingPermissions")}</div>}>
      <RolePermissionsContent />
    </Suspense>
  );
}
