"use client";

import { Button } from "@/components/ui/button";
import Header from "../../header";
import { useState } from "react";
import AddBusinessOwnerModal from "./AddBusinessOwnerModal";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
  title: string;
  description: string;
  onEmployeeSuccess?: () => void;
};

export default function EmployeeSettingsHeader({
  title,
  description,
  onEmployeeSuccess
}: Props) {
  const businessOwners = useTranslations("businessOwners");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-center lg:justify-between w-full">
      <Header title={title} description={description} />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
        <Button
          variant="primary"
          onClick={() => router.push('/business-owners/create')}
          className="h-[44px] rounded-[12px] px-5"
        >
          {businessOwners("addNewBusinessOwner")}
        </Button>
      </div>

      {/* Employee Modal */}
      <AddBusinessOwnerModal
        open={open}
        onOpenChange={setOpen}
        onSuccess={onEmployeeSuccess}   // ✅ CONNECTED
      />

    </div>
  );
}
