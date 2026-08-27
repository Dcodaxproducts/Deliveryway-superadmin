"use client";

import { useState } from "react";
import { Eye, Store, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Branch } from "@/types/restaurant";
import Link from "next/link";
import { useTranslations } from "next-intl";
import DeleteDialog from "@/components/dialogs/delete-dialog";
import { useDeleteBranch } from "@/hooks/useRestaurant";

export default function BranchList({ branches }: { branches: Branch[] }) {
  const branchesText = useTranslations("branches");
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const deleteBranch = useDeleteBranch();

  const handleDelete = () => {
    if (!branchToDelete) return;

    deleteBranch.mutate(branchToDelete.id, {
      onSuccess: () => setBranchToDelete(null),
    });
  };

  return (
    <>
      <div className="space-y-[12px]">
        <h3 className="text-xl font-semibold text-dark">
          {branchesText("listTitle")}
        </h3>

        {branches.length === 0 ? (
          <p className="text-gray-400 text-center py-10 border border-dashed rounded-[14px]">
            {branchesText("noneFound")}
          </p>
        ) : (
          branches.map((branch) => (
            <div
              key={branch.id}
              className="w-full border border-gray-100 rounded-[14px] p-[20px] md:p-[24px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm bg-white"
            >
              <div className="flex items-start md:items-center gap-[16px] md:gap-[24px]">
                <div className="text-gray shrink-0 mt-1 md:mt-0">
                  <Store size={22} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-[8px] md:gap-[12px]">
                    <h4 className="text-lg font-semibold text-dark capitalize">
                      {branch.name}
                    </h4>
                    {branch.isMain && (
                      <>
                        <div className="size-2 rounded-full bg-green hidden sm:block ml-2" />
                        <Badge className="bg-green/10 text-green hover:bg-green/10 border-none px-2.5 h-[28px] md:h-[32px] text-sm font-semibold whitespace-nowrap">
                          {branchesText("defaultBranch")}
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray">
                    {branchesText("id")}: #{branch.id.slice(-5)} |{" "}
                    {branch.settings?.allowedOrderTypes?.length || 0}{" "}
                    {branchesText("orderTypesAllowed")}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 flex justify-end">
                <div className="flex justify-end items-center px-[11px] py-[10px] border border-[#E6E7EC] rounded-sm w-fit ml-auto divide-x divide-[#E6E7EC]">
                  <Link
                    href={`/branch/${branch.id}`}
                    className={
                      branch.isMain
                        ? "text-gray-400 hover:text-dark transition-colors"
                        : "pr-[11px] text-gray-400 hover:text-dark transition-colors"
                    }
                    aria-label={`${branchesText("viewBranch")}: ${branch.name}`}
                  >
                    <Eye size={20} />
                  </Link>
                  {!branch.isMain && (
                    <button
                      type="button"
                      className="pl-[11px] text-gray-400 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setBranchToDelete(branch)}
                      disabled={deleteBranch.isPending}
                      aria-label={`${branchesText("deleteBranch")}: ${branch.name}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <DeleteDialog
        open={branchToDelete !== null}
        onOpenChange={(open) => !open && setBranchToDelete(null)}
        onConfirm={handleDelete}
        isLoading={deleteBranch.isPending}
        title={branchesText("deleteTitle")}
        description={branchesText("deleteDescription", {
          name: branchToDelete?.name ?? "",
        })}
      />
    </>
  );
}
