"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  useGetStaffList,
  useDeleteStaff,
  useUpdateStaffStatus,
} from "@/hooks/useEmployees";
import Pagination from "@/components/pagination";
import DeleteDialog from "@/components/dialogs/delete-dialog";
import EmployeeInvitationModal from "@/components/pages/employee-settings/AddEmployeeModal";

export default function EmployeeTable({
  refreshKey,
  search,
  setExportData,
}: {
  refreshKey: number;
  search: string;
  setExportData?: (data: any[]) => void;
}) {
  const common = useTranslations("common");
  const employeeSettings = useTranslations("employeeSettings");
  const [page, setPage] = useState(1);
  const [dropdownId, setDropdownId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useGetStaffList({ page, search });
  const { mutate: deleteStaff } = useDeleteStaff();
  const { mutate: updateStatus } = useUpdateStaffStatus();

  const employees = data?.data || [];
  const meta = data?.meta;
useEffect(() => {
  if (employees.length) {
    setExportData?.(employees);
  }
}, [employees, setExportData]);
  const handleDelete = () => {
    if (!deleteId) return;

    setIsDeleting(true);

    deleteStaff(deleteId, {
      onSuccess: () => {
        setDeleteId(null); // ✅ close dialog
      },
      onSettled: () => setIsDeleting(false),
    });
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{employeeSettings("serial")}</TableHead>
            <TableHead>{employeeSettings("employee")}</TableHead>
            <TableHead>{employeeSettings("details")}</TableHead>
            <TableHead>{employeeSettings("role")}</TableHead>
            <TableHead>{common("status")}</TableHead>
            <TableHead className="text-center">{common("actions")}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={6}>
                  <div className="h-10 w-full animate-pulse bg-gray-100 rounded" />
                </TableCell>
              </TableRow>
            ))
            : employees.map((item: any, i: number) => (
              <TableRow key={item.id}>
                <TableCell>{i + 1}</TableCell>

                <TableCell className="capitalize">
                  {item.firstName} {item.lastName}
                </TableCell>

                <TableCell>
                  <p>{item.phone}</p>
                  <p className="text-gray-600">{item.email}</p>
                </TableCell>

                <TableCell className="capitalize">{item.staffRole?.name}</TableCell>

                <TableCell>
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={(val) =>
                      updateStatus({ id: item.id, isActive: val })
                    }
                  />
                </TableCell>

                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-3">

                    {/* Edit */}
                    <button
                      onClick={() => setEditData(item)}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition"
                    >
                      <Pencil size={16} className="text-gray-600" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>

                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {meta && <Pagination {...meta} onPageChange={setPage} />}

      {/* ✅ FIXED */}
      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <EmployeeInvitationModal
        open={!!editData}
        onOpenChange={() => setEditData(null)}
        initialData={editData}
      />
    </>
  );
}
