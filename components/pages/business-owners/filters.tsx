"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  onSearch: (value: string) => void;
  data?: any[]; // ✅ pass table data here
}

const Filters = ({ onSearch, data = [] }: Props) => {
  const common = useTranslations("common");
  const filters = useTranslations("filters");
  const businessOwners = useTranslations("businessOwners");
  const [search, setSearch] = useState("");

  // ✅ debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, onSearch]);
const handleExportCSV = () => {
  if (!data.length) return;

  // ✅ Define only required columns
  const headers = [
    businessOwners("firstName"),
    businessOwners("lastName"),
    businessOwners("email"),
    businessOwners("phone"),
    common("status"),
    businessOwners("role"),
  ];

  const csvRows = [
    headers.join(","),

    ...data.map((row) =>
      [
        row.firstName ?? "",
        row.lastName ?? "",
        row.email ?? "",
        row.phone ?? "",
        row.isActive ? common("active") : common("inactive"),
        row.staffRole?.name ?? "",
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "business-owners.csv";
  a.click();

  window.URL.revokeObjectURL(url);
};

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        
        {/* Search */}
        <div className="flex w-full max-w-2xl items-center border border-[#E3E4EB] rounded-xl overflow-hidden bg-white focus-within:ring-1 focus-within:ring-ring">
          <div className="pl-4 flex items-center">
            <Search className="text-[#3A4161]" size={20} />
          </div>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={filters("searchBusinessOwnersPlaceholder")}
            className="border-0 focus-visible:ring-0 h-12 text-base"
          />

          <Button className="bg-[#D31E1E] hover:bg-[#b01818] h-14 px-10 text-base font-medium rounded-none">
            {common("search")}
          </Button>
        </div>

        {/* Export */}
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="h-12 px-5 rounded-xl"
            onClick={handleExportCSV}
          >
            <Download size={18} />
            {businessOwners("exportCsv")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
