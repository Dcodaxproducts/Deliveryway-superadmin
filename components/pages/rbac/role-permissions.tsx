"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Box, Menu, Bike, CircleDollarSign, BarChart3, Settings, type LucideIcon } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useStaffRole } from "@/hooks/useRbac";
import { useParams, useSearchParams } from "next/navigation";

interface PermissionModule {
  access: string;
  labelKey: string;
  icon: LucideIcon;
  operations: Array<{ value: string; labelKey: string }>;
  checked?: string[];
}

const permissionsModules: PermissionModule[] = [
  { access: "Orders", labelKey: "orders", icon: Box, operations: [{ value: "View", labelKey: "view" }, { value: "Create/Edit", labelKey: "createEdit" }, { value: "Cancel", labelKey: "cancel" }] },
  { access: "Menus", labelKey: "menus", icon: Menu, operations: [{ value: "View", labelKey: "view" }, { value: "Add/Edit", labelKey: "addEdit" }, { value: "Delete", labelKey: "delete" }] },
  { access: "Drivers", labelKey: "drivers", icon: Bike, operations: [{ value: "View", labelKey: "view" }, { value: "Assign", labelKey: "assign" }, { value: "Manage Status", labelKey: "manageStatus" }] },
  { access: "Finance", labelKey: "finance", icon: CircleDollarSign, operations: [{ value: "View", labelKey: "view" }, { value: "Manage Payout", labelKey: "managePayout" }, { value: "Access Invoice", labelKey: "accessInvoice" }] },
  { access: "Reports", labelKey: "reports", icon: BarChart3, operations: [{ value: "View", labelKey: "view" }, { value: "Export", labelKey: "export" }] },
  { access: "Settings", labelKey: "settings", icon: Settings, operations: [{ value: "View", labelKey: "view" }, { value: "Manage", labelKey: "manage" }] },
];

function RolePermissionsContent() {
  const rbac = useTranslations("rbac");
  const params = useParams();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('role') || params?.id as string;
  const { data: role, isLoading, error } = useStaffRole(roleId);
  const [permissions, setPermissions] = useState<PermissionModule[]>(permissionsModules);

  useEffect(() => {
    if (role?.permissions) {
      const updatedPermissions = permissionsModules.map(module => {
        const rolePermission = role.permissions.find(
          (permission: { access?: string; operations?: string[] }) =>
            permission.access === module.access
        );
        return {
          ...module,
          checked: rolePermission?.operations || []
        };
      });
      setPermissions(updatedPermissions);
    }
  }, [role]);

  const handlePermissionChange = (access: string, operation: string, checked: boolean) => {
    setPermissions(prev => prev.map(module => {
      if (module.access === access) {
        const currentChecked = module.checked || [];
        if (checked) {
          return { ...module, checked: [...currentChecked, operation] };
        } else {
          return { ...module, checked: currentChecked.filter(op => op !== operation) };
        }
      }
      return module;
    }));
  };

  if (isLoading) return <div>{rbac("loadingPermissions")}</div>;
  if (error) return <div>{rbac("errorLoadingPermissions")}</div>;
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

  return (
    <Card className="p-4 lg:p-[30px] border-none gap-0 shadow-sm rounded-[14px] bg-white h-full">
      <div className="flex justify-between items-center mb-[6px]">
        <h2 className="text-lg font-semibold">
          {rbac("permission")} <span className="text-primary">{role?.name || rbac("manager")}</span>
        </h2>
        <button className="text-primary text-xs">{rbac("resetDefault")}</button>
      </div>
      <p className="text-gray-400 text-sm mb-[24px]">{rbac("permissionsHelp")}</p>

      <div className="w-full">
        <div className="grid grid-cols-12 py-[6px] border-y border-[#BBBBBB] text-gray font-semibold text-lg">
          <div className="col-span-4">{rbac("module")}</div>
          <div className="col-span-8">{rbac("accessRights")}</div>
        </div>

        <div>
          {permissions.map((item) => (
            <div
              key={item.access}
              className="grid py-[24px] items-center"
              style={{ gridTemplateColumns: "minmax(0, 1fr) 1px minmax(0, 2fr)" }}
            >
              {/* Left - Module */}
              <div className="flex items-center gap-[12px] pr-4">
                <item.icon size={20} className="text-primary shrink-0" />
                <span className="text-gray font-semibold text-lg truncate">
                  {rbac(item.labelKey)}
                </span>
              </div>

              {/* Spacer */}
              <div />

              {/* Right - Checkboxes */}
              <div className="grid grid-cols-3 gap-x-[10px] gap-y-[24px]">
                {item.operations.map((operation) => (
                  <div
                    key={operation.value}
                    className="flex items-center gap-[12px] min-w-0"
                  >
                    <Checkbox
                      id={`${item.access}-${operation.value}`}
                      checked={item.checked?.includes(operation.value) || false}
                      onCheckedChange={(checked) => handlePermissionChange(item.access, operation.value, checked as boolean)}
                      className="w-[20px] h-[20px] data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    />
                    <label
                      htmlFor={`${item.access}-${operation.value}`}
                      className="text-sm text-dark cursor-pointer truncate min-w-0"
                      title={rbac(operation.labelKey)}
                    >
                      {rbac(operation.labelKey)}
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
