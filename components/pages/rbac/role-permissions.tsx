"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Box, Menu, Bike, CircleDollarSign, BarChart3, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useStaffRole } from "@/hooks/useRbac";
import { useParams, useSearchParams } from "next/navigation";

interface PermissionModule {
  access: string;
  icon: any;
  operations: string[];
  checked?: string[];
}

const permissionsModules: PermissionModule[] = [
  { access: "Orders", icon: Box, operations: ["View", "Create/Edit", "Cancel"] },
  { access: "Menus", icon: Menu, operations: ["View", "Add/Edit", "Delete"] },
  { access: "Drivers", icon: Bike, operations: ["View", "Assign", "Manage Status"] },
  { access: "Finance", icon: CircleDollarSign, operations: ["View", "Manage Payout", "Access Invoice"] },
  { access: "Reports", icon: BarChart3, operations: ["View", "Export"] },
  { access: "Settings", icon: Settings, operations: ["View", "Manage"] },
];

export default function RolePermissions() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('role') || params?.id as string;
  const { data: role, isLoading, error } = useStaffRole(roleId);
  const [permissions, setPermissions] = useState<PermissionModule[]>(permissionsModules);

  useEffect(() => {
    if (role?.permissions) {
      const updatedPermissions = permissionsModules.map(module => {
        const rolePermission = role.permissions.find((p: any) => p.access === module.access);
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

  if (isLoading) return <div>Loading permissions...</div>;
  if (error) return <div>Error loading permissions</div>;
  if (!roleId) {
    return (
      <Card className="p-4 lg:p-[30px] border-none gap-0 shadow-sm rounded-[14px] bg-white h-full">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-lg font-semibold text-gray-600 mb-4">
            No Role Selected
          </h2>
          <p className="text-sm text-gray-400 max-w-md">
            Please select a role from the list to view and manage its permissions.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 lg:p-[30px] border-none gap-0 shadow-sm rounded-[14px] bg-white h-full">
      <div className="flex justify-between items-center mb-[6px]">
        <h2 className="text-lg font-semibold">
          Permission: <span className="text-primary">{role?.name || "Manager"}</span>
        </h2>
        <button className="text-primary text-xs">Reset to default</button>
      </div>
      <p className="text-gray-400 text-sm mb-[24px]">Select which modules and actions are accessible for each role.</p>

      <div className="w-full">
        <div className="grid grid-cols-12 py-[6px] border-y border-[#BBBBBB] text-gray font-semibold text-lg">
          <div className="col-span-4">Module</div>
          <div className="col-span-8">Access Rights</div>
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
                  {item.access}
                </span>
              </div>

              {/* Spacer */}
              <div />

              {/* Right - Checkboxes */}
              <div className="grid grid-cols-3 gap-x-[10px] gap-y-[24px]">
                {item.operations.map((operation) => (
                  <div
                    key={operation}
                    className="flex items-center gap-[12px] min-w-0"
                  >
                    <Checkbox
                      id={`${item.access}-${operation}`}
                      checked={item.checked?.includes(operation) || false}
                      onCheckedChange={(checked) => handlePermissionChange(item.access, operation, checked as boolean)}
                      className="w-[20px] h-[20px] data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
                    />
                    <label
                      htmlFor={`${item.access}-${operation}`}
                      className="text-sm text-dark cursor-pointer truncate min-w-0"
                      title={operation}
                    >
                      {operation}
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